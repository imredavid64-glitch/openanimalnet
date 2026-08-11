'use client';

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { AnimalCategory, ConservationStatus } from '@/types/animal/types';

interface GlobeData {
  id: string;
  name: string;
  scientificName: string;
  category: AnimalCategory;
  lat: number;
  lng: number;
  size: number;
  color: string;
  icon: string;
  conservationStatus: ConservationStatus;
  isMonitored: boolean;
}

interface GlobeProps {
  data: GlobeData[];
  onAnimalHover: (animalId: string | null) => void;
  selectedCategory: AnimalCategory | null;
}

const animalCategoryColors: Record<AnimalCategory, string> = {
  mammals: '#0ea5e9',
  birds: '#38bdf8',
  reptiles: '#06b6d4',
  amphibians: '#0891b2',
  fish: '#0e7490',
  invertebrates: '#1d4ed8',
  insects: '#7c3aed',
  marine: '#1e40af',
};

const conservationStatusColors: Record<ConservationStatus, string> = {
  EX: '#7f1d1d',
  EW: '#7f1d1d',
  CR: '#dc2626',
  EN: '#ef4444',
  VU: '#f59e0b',
  NT: '#fbbf24',
  LC: '#22c55e',
  DD: '#64748b',
  NE: '#94a3b8',
};

export default forwardRef(function GlobeComponent(
  { data, onAnimalHover, selectedCategory }: GlobeProps,
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  // Three.js references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const globeRef = useRef<THREE.Mesh | null>(null);
  const pointsRef = useRef<THREE.Points | THREE.Group | null>(null);
  const raycasterRef = useRef<THREE.Raycaster | null>(null);
  const mouseRef = useRef<THREE.Vector2 | null>(null);
  
  // Animation state
  const [isRotating, setIsRotating] = useState(true);
  const rotationSpeed = 0.001;
  
  // Initialize Three.js
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    
    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.minDistance = 2.5;
    controls.maxDistance = 10;
    controlsRef.current = controls;
    
    // Raycaster for hover detection
    raycasterRef.current = new THREE.Raycaster();
    mouseRef.current = new THREE.Vector2();
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
    
    // Create Globe
    createGlobe(scene);
    
    // Create Points
    createPoints(scene, data);
    
    // Handle resize
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (isRotating && globeRef.current) {
        globeRef.current.rotation.y += rotationSpeed;
      }
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      if (rendererRef.current) {
        rendererRef.current.render(sceneRef.current!, cameraRef.current!);
      }
    };
    
    animate();
    
    setIsMounted(true);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeChild(renderer.domElement);
      // Clean up Three.js objects
      if (sceneRef.current) {
        while (sceneRef.current.children.length > 0) {
          sceneRef.current.remove(sceneRef.current.children[0]);
        }
      }
    };
    // One-time scene setup: createGlobe/createPoints are intentionally
    // captured once; data changes are handled by the dedicated effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Update points when data changes
  useEffect(() => {
    if (!sceneRef.current) return;
    
    // Remove existing points
    if (pointsRef.current && 'geometry' in pointsRef.current) {
      sceneRef.current.remove(pointsRef.current);
      pointsRef.current.geometry.dispose();
      (pointsRef.current.material as THREE.Material).dispose();
    }
    
    // Create new points
    createPoints(sceneRef.current, data);
    // createPoints is a component-scope helper; its only input is `data`,
    // which is already the dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
  
  // Handle mouse events for hover
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !cameraRef.current || !raycasterRef.current || !mouseRef.current) return;
    
    const handleMouseMove = (event: MouseEvent) => {
      // Calculate mouse position in normalized device coordinates
      const rect = container.getBoundingClientRect();
      mouseRef.current!.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current!.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Update raycaster
      raycasterRef.current!.setFromCamera(mouseRef.current!, cameraRef.current!);
      
      // Check for intersections with points
      if (pointsRef.current) {
        const intersects = raycasterRef.current!.intersectObject(pointsRef.current);
        
        if (intersects.length > 0) {
          // Find the closest point
          const instanceId = intersects[0].instanceId;
          if (instanceId !== undefined && instanceId < data.length) {
            onAnimalHover(data[instanceId].id);
          }
        } else {
          onAnimalHover(null);
        }
      }
    };
    
    container.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, [data, onAnimalHover]);
  
  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    resetCamera: () => {
      if (cameraRef.current) {
        cameraRef.current.position.set(0, 0, 5);
        cameraRef.current.lookAt(0, 0, 0);
        if (controlsRef.current) {
          controlsRef.current.reset();
        }
      }
    },
    zoomIn: () => {
      if (cameraRef.current) {
        cameraRef.current.position.z = Math.max(2.5, cameraRef.current.position.z - 0.5);
      }
    },
    zoomOut: () => {
      if (cameraRef.current) {
        cameraRef.current.position.z = Math.min(10, cameraRef.current.position.z + 0.5);
      }
    },
    toggleRotation: () => {
      setIsRotating((prev) => !prev);
    },
  }));
  
  const createGlobe = (scene: THREE.Scene) => {
    // Create globe geometry with higher resolution
    const geometry = new THREE.SphereGeometry(2, 128, 128);
    
    // Create custom material with earth-like appearance
    const material = new THREE.MeshPhongMaterial({
      color: 0x1e3a8a,
      specular: 0x111827,
      shininess: 30,
      transparent: true,
      opacity: 0.8,
    });
    
    // Load earth texture (fallback to gradient)
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('/images/earth.jpg', undefined, undefined, () => {
      // Use gradient as fallback
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d')!;
      
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#0ea5e9');
      gradient.addColorStop(0.5, '#1e40af');
      gradient.addColorStop(1, '#0f172a');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const texture = new THREE.CanvasTexture(canvas);
      material.map = texture;
      material.needsUpdate = true;
    });
    
    // Create globe mesh
    const globe = new THREE.Mesh(geometry, material);
    globeRef.current = globe;
    scene.add(globe);
    
    // Add atmosphere effect
    const atmosphereGeometry = new THREE.SphereGeometry(2.1, 128, 128);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);
    
    // Add stars background
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.02,
      transparent: true,
      opacity: 0.8,
    });
    
    const starsVertices: number[] = [];
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 100;
      const y = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100;
      starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(starsVertices, 3)
    );
    
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
  };
  
  const createPoints = (scene: THREE.Scene, data: GlobeData[]) => {
    if (data.length === 0) return;
    
    // Create geometry for instanced rendering
    const geometry = new THREE.SphereGeometry(0.05, 16, 16);
    
    // Create materials based on category
    const materials = data.map((d) => {
      // Use conservation status color if available, otherwise use category color
      const color = conservationStatusColors[d.conservationStatus] || d.color;
      return new THREE.MeshPhongMaterial({
        color: new THREE.Color(color),
        emissive: new THREE.Color(color),
        emissiveIntensity: d.isMonitored ? 0.3 : 0.1,
        transparent: true,
        opacity: 0.8,
      });
    });
    
    // Create instanced mesh
    const group = new THREE.Group();
    
    data.forEach((d, index) => {
      const mesh = new THREE.Mesh(geometry, materials[index]);
      
      // Convert lat/lng to spherical coordinates
      const phi = (90 - d.lat) * (Math.PI / 180);
      const theta = (d.lng + 180) * (Math.PI / 180);
      
      // Position on globe surface with some height
      const radius = 2 + d.size * 0.01;
      mesh.position.x = radius * Math.sin(phi) * Math.cos(theta);
      mesh.position.y = radius * Math.cos(phi);
      mesh.position.z = radius * Math.sin(phi) * Math.sin(theta);
      
      // Scale based on population
      mesh.scale.set(d.size * 0.1, d.size * 0.1, d.size * 0.1);
      
      // Add glow effect for monitored animals
      if (d.isMonitored) {
        const glowGeometry = new THREE.SphereGeometry(0.1 + d.size * 0.02, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color(d.color),
          transparent: true,
          opacity: 0.2,
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(mesh.position);
        group.add(glow);
      }
      
      group.add(mesh);
    });
    
    pointsRef.current = group;
    scene.add(group);
  };
  
  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ minHeight: '600px' }}
    />
  );
});
