'use client';

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { AnimalCategory, ConservationStatus } from '@/types/animal/types';

interface RoutePoint {
  latitude: number;
  longitude: number;
}

interface RouteData {
  name: string;
  season?: 'spring' | 'fall' | 'year-round';
  points: RoutePoint[];
}

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
  /** Seasonal migration corridors, drawn as animated arcs. */
  migrationRoutes?: RouteData[];
}

// Arc color by migration-leg season (spring north = green, fall south = amber,
// year-round = neutral slate).
const seasonColors: Record<string, string> = {
  spring: '#22c55e',
  fall: '#f59e0b',
  'year-round': '#94a3b8',
};

const routeSeason = (r: RouteData): string => seasonColors[r.season ?? 'year-round'] ?? '#94a3b8';

// Cone geometry's local +Y axis is aligned to the curve tangent to orient the
// directional arrows along the migration flow.
const UP_VECTOR = new THREE.Vector3(0, 1, 0);

export interface RouteHoverInfo {
  animalId: string;
  name: string;
  routeName: string;
}

interface GlobeProps {
  data: GlobeData[];
  onAnimalHover: (animalId: string | null) => void;
  selectedCategory: AnimalCategory | null;
  /** Called when a marker is clicked — parents can navigate to the profile. */
  onAnimalClick?: (animalId: string) => void;
  /** Whether migration corridors should be drawn. */
  showRoutes?: boolean;
  /** Whether species markers should be drawn. */
  showMarkers?: boolean;
  /** Whether the clouds layer should be shown. */
  showClouds?: boolean;
  /** Fired when the pointer moves over/off a migration corridor. */
  onRouteHover?: (info: RouteHoverInfo | null) => void;
  /** Fired when a migration corridor is clicked. */
  onRouteClick?: (info: RouteHoverInfo) => void;
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
  {
    data,
    onAnimalHover,
    selectedCategory,
    onAnimalClick,
    showRoutes = true,
    showMarkers = true,
    showClouds = true,
    onRouteHover,
    onRouteClick,
  }: GlobeProps,
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
  const cloudsRef = useRef<THREE.Mesh | null>(null);
  const pointsRef = useRef<THREE.Points | THREE.Group | null>(null);
  const routesRef = useRef<THREE.Group | null>(null);
  const raycasterRef = useRef<THREE.Raycaster | null>(null);
  const mouseRef = useRef<THREE.Vector2 | null>(null);

  // Animated migration dots: { curve, dot, speed, phase, material, animalId, routeName } per route
  // (dashOffset is a real runtime property of LineDashedMaterial in three r160,
  // but @types/three omits it — cast it in so the animation can set it)
  type RouteMaterial = THREE.LineDashedMaterial & { dashOffset: number };
  const routeAnimsRef = useRef<
    {
      curve: THREE.CatmullRomCurve3;
      dot: THREE.Mesh;
      arrows: THREE.Mesh[];
      speed: number;
      phase: number;
      material: RouteMaterial;
      animalId: string;
      routeName: string;
    }[]
  >([]);
  // Hovered route, mirrored in a ref so the animation loop can highlight it
  const hoveredRouteRef = useRef<RouteHoverInfo | null>(null);
  // Camera fly-to animation state (target point on the globe)
  const flyRef = useRef<{
    fromCam: THREE.Vector3;
    fromTarget: THREE.Vector3;
    destCam: THREE.Vector3;
    destTarget: THREE.Vector3;
    t: number;
    dur: number;
  } | null>(null);
  
  // Animation state
  const [isRotating, setIsRotating] = useState(true);
  const rotationSpeed = 0.001;
  // Ref mirror of the hovered marker so the animation loop can pause rotation
  // while the pointer is over an animal (without re-subscribing the loop).
  const hoveredRef = useRef<string | null>(null);
  
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
    
    // Lighting — low ambient + strong sun gives a visible day/night terminator
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.22);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.35);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
    
    // Create Globe
    createGlobe(scene);
    
    // Create Points
    createPoints(scene, data);
    
    // Create migration routes (rebuilt by the data effect on any change)
    if (showRoutes) {
      createRoutes(scene, data);
    }
    
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
      
      if (isRotating && globeRef.current && !hoveredRef.current) {
        globeRef.current.rotation.y += rotationSpeed;
      }
      
      // Clouds drift slightly slower than the surface
      if (cloudsRef.current) {
        cloudsRef.current.rotation.y += rotationSpeed * 0.35;
      }
      
      // Advance migration dots + arrows along their routes; scroll the dash
      // so the corridors visibly flow, and pulse/highlight on hover
      const now = performance.now() / 1000;
      for (const anim of routeAnimsRef.current) {
        const t = (now * anim.speed + anim.phase) % 1;
        anim.dot.position.copy(anim.curve.getPoint(t));
        anim.material.dashOffset = -now * 0.22;
        const hovered =
          hoveredRouteRef.current?.animalId === anim.animalId &&
          hoveredRouteRef.current?.routeName === anim.routeName;
        anim.material.opacity = hovered
          ? 0.95
          : 0.4 + 0.08 * Math.sin(now * 1.6 + anim.phase * 9);
        anim.dot.scale.setScalar(hovered ? 1.8 : 1);
        // Directional arrows: three cones spaced along the route, oriented to
        // the curve tangent so the flow direction is obvious
        for (let a = 0; a < anim.arrows.length; a++) {
          const at = (now * anim.speed * 0.9 + anim.phase + a / anim.arrows.length) % 1;
          const pos = anim.curve.getPointAt(at);
          const tangent = anim.curve.getTangentAt(at);
          anim.arrows[a].position.copy(pos);
          anim.arrows[a].quaternion.setFromUnitVectors(UP_VECTOR, tangent);
          anim.arrows[a].scale.setScalar(hovered ? 1.5 : 1);
        }
      }
      
      // Camera fly-to animation (OpenGrid-style focus on a selected marker)
      if (flyRef.current && cameraRef.current && controlsRef.current) {
        const f = flyRef.current;
        f.t += 0.025;
        const e = Math.min(1, f.t / f.dur);
        const ease = 1 - Math.pow(1 - e, 3); // easeOutCubic
        controlsRef.current.target.lerpVectors(f.fromTarget, f.destTarget, ease);
        cameraRef.current.position.lerpVectors(f.fromCam, f.destCam, ease);
        controlsRef.current.update();
        if (e >= 1) flyRef.current = null;
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
  }, []);    // Toggle the clouds layer visibility
  useEffect(() => {
    if (cloudsRef.current) cloudsRef.current.visible = showClouds;
  }, [showClouds]);
  
    // Update points + routes when data or a layer toggle changes
  useEffect(() => {
    if (!sceneRef.current) return;
    
    // Remove existing points (a Group of meshes — the old `'geometry' in ...`
    // guard never matched a Group, so markers silently accumulated on every
    // filter/data change)
    if (pointsRef.current) {
      sceneRef.current.remove(pointsRef.current);
      pointsRef.current.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          (obj.material as THREE.Material).dispose();
        }
      });
      pointsRef.current = null;
    }
    
    // Remove existing routes + reset animation state (Lines and Meshes both
    // carry geometry/material — dispose both)
    if (routesRef.current) {
      sceneRef.current.remove(routesRef.current);
      routesRef.current.traverse((obj) => {
        const withGeo = obj as unknown as {
          geometry?: THREE.BufferGeometry;
          material?: THREE.Material | THREE.Material[];
        };
        withGeo.geometry?.dispose();
        if (Array.isArray(withGeo.material)) {
          withGeo.material.forEach((m) => m.dispose());
        } else {
          withGeo.material?.dispose();
        }
      });
      routesRef.current = null;
    }
    routeAnimsRef.current = [];
    
    // Create new points + routes
    if (showMarkers) {
      createPoints(sceneRef.current, data);
    }
    if (showRoutes) {
      createRoutes(sceneRef.current, data);
    }
    // createPoints/createRoutes are component-scope helpers; their only input
    // is `data`, which is already the dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, showRoutes, showMarkers]);
  
  // Handle mouse events for hover + click
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !cameraRef.current || !raycasterRef.current || !mouseRef.current) return;
    
    const setPointer = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current!.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current!.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current!.setFromCamera(mouseRef.current!, cameraRef.current!);
    };
    
    const pickMarker = (event: MouseEvent): string | null => {
      setPointer(event);
      if (!pointsRef.current) return null;
      const intersects = raycasterRef.current!.intersectObject(pointsRef.current);
      // Markers are plain meshes in a Group (not InstancedMesh), so their
      // index travels in userData — glow spheres have no index and are
      // skipped in favor of the marker they wrap.
      for (const hit of intersects) {
        const index = (hit.object.userData?.index as number | undefined);
        if (index !== undefined && index < data.length) return data[index].id;
      }
      return null;
    };
    
    // Thin lines are hard to raycast against at a distance — widen the line
    // threshold just for the routes pass, then restore it for markers.
    const pickRoute = (event: MouseEvent): RouteHoverInfo | null => {
      if (!routesRef.current) return null;
      setPointer(event);
      const prev = raycasterRef.current!.params.Line.threshold;
      raycasterRef.current!.params.Line.threshold = 0.05;
      const intersects = raycasterRef.current!.intersectObject(routesRef.current, true);
      raycasterRef.current!.params.Line.threshold = prev;
      for (const hit of intersects) {
        const info = hit.object.userData as RouteHoverInfo | undefined;
        if (info) return info;
      }
      return null;
    };
    
    const handleMouseMove = (event: MouseEvent) => {
      const route = pickRoute(event);
      if (route) {
        hoveredRouteRef.current = route;
        hoveredRef.current = null;
        onRouteHover?.(route);
        onAnimalHover(null);
        return;
      }
      if (hoveredRouteRef.current) {
        hoveredRouteRef.current = null;
        onRouteHover?.(null);
      }
      const id = pickMarker(event);
      hoveredRef.current = id;
      onAnimalHover(id);
    };
    
    const handleClick = (event: MouseEvent) => {
      const route = pickRoute(event);
      if (route) {
        onRouteClick?.(route);
        return;
      }
      const id = pickMarker(event);
      if (id) onAnimalClick?.(id);
    };
    
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);
    
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
    };
  }, [data, onAnimalHover, onAnimalClick, onRouteHover, onRouteClick]);
  
  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    resetCamera: () => {
      if (cameraRef.current) {
        cameraRef.current.position.set(0, 0, 5);
        cameraRef.current.lookAt(0, 0, 0);
        if (controlsRef.current) {
          controlsRef.current.target.set(0, 0, 0);
          controlsRef.current.reset();
        }
      }
    },
    flyTo: (lat: number, lng: number) => flyTo(lat, lng),
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
    
    // Load the NASA Blue Marble equirectangular texture; fall back to a
    // gradient if it can't be fetched. needsUpdate is set in BOTH paths so
    // the renderer picks the map up.
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      '/images/earth.jpg',
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        material.map = texture;
        material.needsUpdate = true;
      },
      undefined,
      () => {
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
      },
    );
    
    // Create globe mesh
    const globe = new THREE.Mesh(geometry, material);
    globeRef.current = globe;
    scene.add(globe);
    
    // Clouds layer — white-on-black NASA texture used as both map and
    // alphaMap so clouds are translucent and shaded by the sun.
    const cloudsGeometry = new THREE.SphereGeometry(2.045, 96, 96);
    const cloudsMaterial = new THREE.MeshPhongMaterial({
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });
    const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    cloudsRef.current = clouds;
    scene.add(clouds);
    textureLoader.load(
      '/images/clouds.jpg',
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        cloudsMaterial.map = texture;
        cloudsMaterial.alphaMap = texture;
        cloudsMaterial.needsUpdate = true;
      },
      undefined,
      () => {
        clouds.visible = false;
      },
    );
    
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
  
  // Convert a lat/lng waypoint to a position on (or above) the globe surface.
  const latLngToVector3 = (lat: number, lng: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  };

  // Smoothly fly the camera to look at a point on the globe (used when a
  // marker is selected from the map or the search box).
  const flyTo = (lat: number, lng: number, radius = 4.3) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    const destTarget = latLngToVector3(lat, lng, 2);
    const dir = destTarget.clone().normalize();
    const destCam = dir.multiplyScalar(radius);
    flyRef.current = {
      fromCam: camera.position.clone(),
      fromTarget: controls.target.clone(),
      destCam,
      destTarget,
      t: 0,
      dur: 60, // frames (~1s)
    };
  };

  // Build the animated migration arcs for every species with a route.
  const createRoutes = (scene: THREE.Scene, data: GlobeData[]) => {
    const routesWithData = data.filter((d) => d.migrationRoutes && d.migrationRoutes.length > 0);
    if (routesWithData.length === 0) return;

    const group = new THREE.Group();
    const anims: {
      curve: THREE.CatmullRomCurve3;
      dot: THREE.Mesh;
      arrows: THREE.Mesh[];
      speed: number;
      phase: number;
      material: RouteMaterial;
      animalId: string;
      routeName: string;
    }[] = [];
    const surfaceRadius = 2;

    routesWithData.forEach((d, animalIdx) => {
      d.migrationRoutes!.forEach((route, routeIdx) => {
        if (route.points.length < 2) return;
        // Color the corridor by migration-leg season, not species status
        const color = new THREE.Color(routeSeason(route));

        // Build control points: surface endpoints + lifted segment midpoints so
        // every arc (even a 2-point one) bulges above the globe instead of
        // cutting through it. Lift scales with the arc's angular distance.
        const controls: THREE.Vector3[] = [];
        for (let i = 0; i < route.points.length - 1; i++) {
          const a = latLngToVector3(route.points[i].latitude, route.points[i].longitude, surfaceRadius);
          const b = latLngToVector3(route.points[i + 1].latitude, route.points[i + 1].longitude, surfaceRadius);
          controls.push(a);
          const angle = a.angleTo(b) * (180 / Math.PI);
          const lift = Math.min(0.6, 0.06 + angle * 0.02);
          controls.push(
            a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(surfaceRadius + lift)
          );
        }
        const last = route.points[route.points.length - 1];
        controls.push(latLngToVector3(last.latitude, last.longitude, surfaceRadius));

        const curve = new THREE.CatmullRomCurve3(controls, false, 'catmullrom', 0.5);

        // Route line — dashed and animated (flowing dash) so it reads as a
        // directional corridor; carries its identity for picking/highlighting
        const lineGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(96));
        const lineMat = new THREE.LineDashedMaterial({
          color,
          transparent: true,
          opacity: 0.45,
          dashSize: 0.09,
          gapSize: 0.05,
        });
        const line = new THREE.Line(lineGeo, lineMat);
        line.computeLineDistances();
        line.userData = { animalId: d.id, name: d.name, routeName: route.name } as RouteHoverInfo;
        group.add(line);

        // Moving dot
        const dotGeo = new THREE.SphereGeometry(0.045, 12, 12);
        const dotMat = new THREE.MeshBasicMaterial({ color });
        const dot = new THREE.Mesh(dotGeo, dotMat);
        group.add(dot);

        // Directional arrows: small cones that travel the route pointing along
        // the tangent, so the migration direction reads at a glance
        const arrows: THREE.Mesh[] = [];
        const coneGeo = new THREE.ConeGeometry(0.035, 0.11, 8);
        const coneMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 });
        for (let a = 0; a < 3; a++) {
          const cone = new THREE.Mesh(coneGeo, coneMat);
          cone.visible = false; // positioned by the animation loop
          arrows.push(cone);
          group.add(cone);
        }

        anims.push({
          curve,
          dot,
          arrows,
          speed: 0.035 + (animalIdx * 0.007 + routeIdx * 0.005) % 0.02,
          phase: animalIdx * 0.21 + routeIdx * 0.37,
          material: lineMat as RouteMaterial,
          animalId: d.id,
          routeName: route.name,
        });
      });
    });

    routesRef.current = group;
    routeAnimsRef.current = anims;
    scene.add(group);
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
      mesh.userData.index = index;
      
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
          // Match the marker's IUCN status color so the badge is consistent.
          color: new THREE.Color(conservationStatusColors[d.conservationStatus] || d.color),
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
