'use client';

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import SimpleWorldMap from './SimpleWorldMap';
import { AnimalCategory } from '@/types/animal/types';
import type { RouteHoverInfo, SeasonFilter } from './GlobeComponent';
import type { ObservationPoint } from '@/lib/observations';
import type { StoredSighting } from '@/lib/userSightings';

interface GlobeProps {
  data: any[];
  onAnimalHover: (animalId: string | null) => void;
  selectedCategory: AnimalCategory | null;
  onAnimalClick?: (animalId: string) => void;
  showRoutes?: boolean;
  showMarkers?: boolean;
  showClouds?: boolean;
  onRouteHover?: (info: RouteHoverInfo | null) => void;
  onRouteClick?: (info: RouteHoverInfo) => void;
  seasonFilter?: SeasonFilter;
  observations?: ObservationPoint[];
  sightings?: StoredSighting[];
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.25;

export default forwardRef(function GlobeComponentFallback(
  { onAnimalClick, showRoutes = true, showMarkers = true, seasonFilter = 'all', observations = [], sightings = [] }: GlobeProps,
  ref
) {
  const [isClient, setIsClient] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Expose methods to parent component. The 2D Leaflet-free canvas has no
  // orbitable camera, so zoom/pan are applied as CSS transforms and rotation
  // is not applicable to a flat map.
  useImperativeHandle(ref, () => ({
    resetCamera: () => {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    },
    zoomIn: () => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP)),
    zoomOut: () => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP)),
    toggleRotation: () => {},
  }));

  if (!isClient) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-primary-600 to-secondary-700 rounded-3xl flex items-center justify-center">
        <div className="text-white text-2xl animate-pulse">Loading Globe...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden relative" style={{ touchAction: 'none' }}>
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: 'transform 0.15s ease-out',
          width: '100%',
          height: '100%',
        }}
      >
        <SimpleWorldMap
          onAnimalClick={onAnimalClick}
          showRoutes={showRoutes}
          showMarkers={showMarkers}
          seasonFilter={seasonFilter}
          observations={observations}
          sightings={sightings}
        />
      </div>
    </div>
  );
});
