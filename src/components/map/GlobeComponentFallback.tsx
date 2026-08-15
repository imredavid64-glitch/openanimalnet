'use client';

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import SimpleWorldMap from './SimpleWorldMap';
import { AnimalCategory } from '@/types/animal/types';
import type { RouteHoverInfo, SeasonFilter } from './GlobeComponent';
import type { ObservationPoint } from '@/lib/observations';

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
}

export default forwardRef(function GlobeComponentFallback(
  { onAnimalClick, showRoutes = true, showMarkers = true, seasonFilter = 'all', observations = [] }: GlobeProps,
  ref
) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    resetCamera: () => {},
    zoomIn: () => {},
    zoomOut: () => {},
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
    <div className="w-full h-full">
      <SimpleWorldMap
        onAnimalClick={onAnimalClick}
        showRoutes={showRoutes}
        showMarkers={showMarkers}
        seasonFilter={seasonFilter}
        observations={observations}
      />
    </div>
  );
});
