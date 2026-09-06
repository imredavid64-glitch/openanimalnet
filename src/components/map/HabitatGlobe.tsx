'use client';

import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { sampleAnimals } from '@/data/sample/animals';

const HABITAT_COLORS: Record<string, string> = {
  'tropical forest': '#22c55e',
  'rainforest': '#16a34a',
  'savanna': '#eab308',
  'grassland': '#84cc16',
  'desert': '#f97316',
  'arctic': '#06b6d4',
  'ocean': '#2563eb',
  'freshwater': '#0ea5e9',
  'mountain': '#78716c',
  'coral reef': '#ec4899',
  'mangrove': '#059669',
  'woodland': '#65a30d',
  'wetland': '#0891b2',
  'coastal': '#0284c7',
  'forest': '#15803d',
  'tundra': '#a5f3fc',
};

function latLngToVector3(lat: number, lng: number, radius = 2.01): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return [
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
}

function GlobeWireframe() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 0.02; });

  return (
    <group>
      <Sphere ref={ref} args={[2, 48, 48]}>
        <meshBasicMaterial color="#1e293b" wireframe transparent opacity={0.15} />
      </Sphere>
      <Sphere args={[2.005, 48, 48]}>
        <meshBasicMaterial color="#334155" transparent opacity={0.05} side={THREE.BackSide} />
      </Sphere>
    </group>
  );
}

function AnimalMarker({ animal, onClick, selected }: {
  animal: any;
  onClick: () => void;
  selected: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const color = useMemo(() => {
    const habitat = animal.habitat?.[0] ?? '';
    return HABITAT_COLORS[habitat.toLowerCase()] ?? '#0ea5e9';
  }, [animal]);

  const pos = useMemo(() =>
    latLngToVector3(animal.location.latitude, animal.location.longitude),
    [animal]
  );

  useFrame((_, delta) => {
    if (ref.current) {
      const scale = hovered || selected ? 1.5 : 1;
      ref.current.scale.lerp(new THREE.Vector3(scale, scale, scale), delta * 5);
    }
  });

  return (
    <group position={pos}>
      <Sphere
        ref={ref}
        args={[selected ? 0.04 : 0.025, 12, 12]}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      >
        <meshBasicMaterial color={color} />
      </Sphere>
      {(hovered || selected) && (
        <Html center distanceFactor={5} style={{ pointerEvents: 'none' }}>
          <div className="bg-white dark:bg-secondary-800 rounded-lg px-3 py-2 shadow-xl text-xs whitespace-nowrap border border-secondary-200 dark:border-secondary-700">
            <div className="font-bold text-secondary-900 dark:text-white">{animal.commonName}</div>
            <div className="italic text-secondary-500">{animal.scientificName}</div>
            <div className="text-secondary-400">{animal.conservationStatus} · {animal.populationEstimate?.toLocaleString() ?? 'N/A'}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

function MigrationArc({ route, color }: { route: any; color: string }) {
  const points = useMemo(() => {
    if (!route.points || route.points.length < 2) return [];
    return route.points.map((p: any) => latLngToVector3(p.latitude, p.longitude, 2.02));
  }, [route]);

  if (points.length < 2) return null;

  return (
    <group>
      <Line points={points} color={color} lineWidth={1.5} transparent opacity={0.6} />
    </group>
  );
}

export default function HabitatGlobe({ selectedId, onSelect }: { selectedId?: string; onSelect?: (id: string) => void }) {
  const [showMigration, setShowMigration] = useState(true);

  const migrators = useMemo(() =>
    sampleAnimals.filter(a => a.migrationRoutes?.length),
    []
  );

  return (
    <div className="relative">
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => setShowMigration(!showMigration)}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
            showMigration ? 'bg-primary-600 text-white' : 'bg-white/80 dark:bg-secondary-800/80 text-secondary-700 dark:text-secondary-300'
          }`}
        >
          {showMigration ? 'Hide' : 'Show'} Migration Routes
        </button>
        <div className="bg-white/80 dark:bg-secondary-800/80 rounded-xl px-3 py-2 text-xs text-secondary-600 dark:text-secondary-400">
          {sampleAnimals.length} species · Click markers for details
        </div>
      </div>

      <div className="h-[500px] rounded-3xl overflow-hidden bg-gradient-to-br from-secondary-900 to-secondary-950">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.3} />
          <GlobeWireframe />

          {sampleAnimals.map(animal => (
            <AnimalMarker
              key={animal.id}
              animal={animal}
              selected={animal.id === selectedId}
              onClick={() => onSelect?.(animal.id)}
            />
          ))}

          {showMigration && migrators.map(animal =>
            animal.migrationRoutes!.map((route, i) => (
              <MigrationArc
                key={`${animal.id}-${i}`}
                route={route}
                color={route.season === 'spring' ? '#22c55e' : route.season === 'fall' ? '#f59e0b' : '#64748b'}
              />
            ))
          )}

          <OrbitControls enableZoom enablePan enableRotate autoRotate autoRotateSpeed={0.3} />
        </Canvas>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        <span className="flex items-center gap-1.5 text-xs text-secondary-600 dark:text-secondary-400">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" /> Forest
        </span>
        <span className="flex items-center gap-1.5 text-xs text-secondary-600 dark:text-secondary-400">
          <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" /> Savanna
        </span>
        <span className="flex items-center gap-1.5 text-xs text-secondary-600 dark:text-secondary-400">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" /> Desert
        </span>
        <span className="flex items-center gap-1.5 text-xs text-secondary-600 dark:text-secondary-400">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" /> Ocean
        </span>
        <span className="flex items-center gap-1.5 text-xs text-secondary-600 dark:text-secondary-400">
          <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]" /> Arctic
        </span>
        <span className="flex items-center gap-1.5 text-xs text-secondary-600 dark:text-secondary-400">
          <span className="w-2 h-0.5 bg-[#22c55e] inline-block rounded" /> Spring migration
        </span>
        <span className="flex items-center gap-1.5 text-xs text-secondary-600 dark:text-secondary-400">
          <span className="w-2 h-0.5 bg-[#f59e0b] inline-block rounded" /> Fall migration
        </span>
      </div>
    </div>
  );
}