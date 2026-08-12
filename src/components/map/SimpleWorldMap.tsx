'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { sampleAnimals, conservationStatusData } from '@/data/sample/animals';
import { AnimalCategory, ConservationStatus } from '@/types/animal/types';

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

const categoryIcons: Record<AnimalCategory, string> = {
  mammals: '🦁',
  birds: '🦅',
  reptiles: '🐍',
  amphibians: '🐸',
  fish: '🐟',
  invertebrates: '🦋',
  insects: '🐜',
  marine: '🐋',
};

// IUCN status color per species, for the marker ring / hover badge.
const statusColor = (status: string): string =>
  conservationStatusData.find((s) => s.status === status)?.color ?? '#94a3b8';

interface MapPoint {
  id: string;
  name: string;
  category: AnimalCategory;
  x: number;
  y: number;
  size: number;
  color: string;
  icon: string;
  isMonitored: boolean;
  status: ConservationStatus;
  statusColor: string;
}

interface MapRoute {
  color: string;
  points: { x: number; y: number }[];
}

export default function SimpleWorldMap({
  onAnimalClick,
  showRoutes = true,
}: {
  onAnimalClick?: (animalId: string) => void;
  showRoutes?: boolean;
}) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [routes, setRoutes] = useState<MapRoute[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  // Convert animal data to map points
  useEffect(() => {
    const mapPoints = sampleAnimals.map(animal => {
      // Convert lat/lng to canvas coordinates (simplified projection)
      const x = ((animal.location.longitude + 180) / 360) * 100;
      const y = ((90 - animal.location.latitude) / 180) * 100;
      
      return {
        id: animal.id,
        name: animal.commonName,
        category: animal.category,
        x,
        y,
        size: animal.isMonitored ? 2 : 1,
        color: animalCategoryColors[animal.category],
        icon: categoryIcons[animal.category],
        isMonitored: animal.isMonitored,
        status: animal.conservationStatus,
        statusColor: statusColor(animal.conservationStatus),
      };
    });
    
    setPoints(mapPoints);

    // Project each species' migration corridors into canvas space
    const mapRoutes: MapRoute[] = [];
    sampleAnimals.forEach((animal) => {
      (animal.migrationRoutes || []).forEach((route) => {
        mapRoutes.push({
          color: statusColor(animal.conservationStatus),
          points: route.points.map((p) => ({
            x: ((p.longitude + 180) / 360) * 100,
            y: ((90 - p.latitude) / 180) * 100,
          })),
        });
      });
    });
    setRoutes(showRoutes ? mapRoutes : []);
  }, [showRoutes]);

  // Draw world map and points
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      draw(performance.now());
    };
    
    const draw = (timeMs: number) => {
      if (!ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background
      ctx.fillStyle = 'rgba(30, 58, 138, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw world map outline (simplified)
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.3)';
      ctx.lineWidth = 1;
      
      // Draw some continent outlines (very simplified)
      drawContinent(ctx, [10, 20, 30, 40, 50, 60, 70, 80, 90], [10, 20, 15, 25, 20, 30, 25, 35, 30], 'Europe');
      drawContinent(ctx, [20, 30, 40, 50, 60, 70], [40, 50, 45, 55, 40, 60], 'Africa');
      drawContinent(ctx, [10, 20, 30, 40], [70, 80, 75, 85], 'North America');
      drawContinent(ctx, [50, 60, 70, 80], [70, 80, 75, 85], 'Asia');
      drawContinent(ctx, [20, 30, 40, 50], [90, 95, 92, 98], 'Australia');
      
      // Draw points
      points.forEach(point => {
        const radius = point.size * 3;
        
        // Draw glow effect for monitored animals
        if (point.isMonitored) {
          ctx.beginPath();
          ctx.arc(point.x * canvas.width / 100, point.y * canvas.height / 100, radius * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = point.color + '40'; // 25% opacity
          ctx.fill();
        }
        
        // Draw point
        ctx.beginPath();
        ctx.arc(point.x * canvas.width / 100, point.y * canvas.height / 100, radius, 0, Math.PI * 2);
        ctx.fillStyle = point.color;
        ctx.fill();
        
        // Draw border
        ctx.beginPath();
        ctx.arc(point.x * canvas.width / 100, point.y * canvas.height / 100, radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();

        // IUCN status badge ring around the marker
        ctx.beginPath();
        ctx.arc(point.x * canvas.width / 100, point.y * canvas.height / 100, radius + 3.5, 0, Math.PI * 2);
        ctx.strokeStyle = point.statusColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw icon for hovered point
        if (hoveredPoint === point.id) {
          ctx.font = '16px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(point.icon, point.x * canvas.width / 100, point.y * canvas.height / 100);

          // Status badge pill above the marker
          const badgeY = point.y * canvas.height / 100 - radius - 12;
          const badgeW = point.status.length * 7 + 8;
          ctx.font = 'bold 9px Arial';
          const badgeX = point.x * canvas.width / 100;
          ctx.beginPath();
          ctx.roundRect(badgeX - badgeW / 2, badgeY - 8, badgeW, 14, 4);
          ctx.fillStyle = point.statusColor;
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(point.status, badgeX, badgeY - 1);
        }
      });

      // Migration corridors — lifted arcs + a comet dot traveling each route
      const W = canvas.width;
      const H = canvas.height;
      routes.forEach((route, ri) => {
        if (route.points.length < 2) return;
        const pts = route.points.map((p) => ({ x: (p.x * W) / 100, y: (p.y * H) / 100 }));
        const lift = 14; // px the arc rises above the chord

        // Sample the piecewise-quadratic arc so the comet can follow it
        const samples: { x: number; y: number }[] = [];
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 0; i < pts.length - 1; i++) {
          const mx = (pts[i].x + pts[i + 1].x) / 2;
          const my = (pts[i].y + pts[i + 1].y) / 2 - lift;
          ctx.quadraticCurveTo(mx, my, pts[i + 1].x, pts[i + 1].y);
          for (let s = 0; s <= 20; s++) {
            const t = s / 20;
            const x = (1 - t) * (1 - t) * pts[i].x + 2 * (1 - t) * t * mx + t * t * pts[i + 1].x;
            const y = (1 - t) * (1 - t) * pts[i].y + 2 * (1 - t) * t * my + t * t * pts[i + 1].y;
            samples.push({ x, y });
          }
        }
        ctx.strokeStyle = route.color + '80';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Comet dot
        const t = ((timeMs / 1000) * (0.035 + ri * 0.007) + ri * 0.21) % 1;
        const pos = samples[Math.floor(t * (samples.length - 1))] || samples[0];
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = route.color + '35';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = route.color;
        ctx.fill();
      });
    };
    
    const drawContinent = (ctx: CanvasRenderingContext2D, xCoords: number[], yCoords: number[], name: string) => {
      if (xCoords.length !== yCoords.length) return;
      
      ctx.beginPath();
      ctx.moveTo(xCoords[0] * canvas.width / 100, yCoords[0] * canvas.height / 100);
      
      for (let i = 1; i < xCoords.length; i++) {
        ctx.lineTo(xCoords[i] * canvas.width / 100, yCoords[i] * canvas.height / 100);
      }
      
      ctx.closePath();
      ctx.stroke();
    };
    
    // Initial draw — animate continuously when migration routes are visible
    resizeCanvas();
    let rafId = 0;
    if (routes.length > 0 && showRoutes) {
      const tick = (now: number) => {
        draw(now);
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    }
    
    // Handle resize
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [points, routes, hoveredPoint, showRoutes]);

  // Find the closest map point to given canvas coordinates (in % of canvas)
  const findClosestPoint = (x: number, y: number): MapPoint | null => {
    let closest: MapPoint | null = null;
    let minDistance = Number.MAX_VALUE;
    
    for (const point of points) {
      const distance = Math.sqrt(
        Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)
      );
      if (distance < minDistance && distance < 5) {
        minDistance = distance;
        closest = point;
      }
    }
    
    return closest;
  };

  // Handle canvas click — open the profile when a marker is hit
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 100;
    const y = (e.clientY - rect.top) / rect.height * 100;
    
    const closestPoint = findClosestPoint(x, y);
    setHoveredPoint(closestPoint ? closestPoint.id : null);
    if (closestPoint) onAnimalClick?.(closestPoint.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative"
    >
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={(e) => {
          if (!canvasRef.current) return;
          
          const canvas = canvasRef.current;
          const rect = canvas.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width * 100;
          const y = (e.clientY - rect.top) / rect.height * 100;
          
          setHoveredPoint(findClosestPoint(x, y)?.id || null);
        }}
        className="w-full h-[400px] md:h-[500px] rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-700 cursor-pointer"
      />
      
      {/* Info Panel */}
      {hoveredPoint && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 right-4 bg-white dark:bg-secondary-800 rounded-2xl p-4 shadow-2xl max-w-xs"
        >
          {(() => {
            const animal = sampleAnimals.find(a => a.id === hoveredPoint);
            if (!animal) return null;
            
            return (
              <>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                    <span className="text-xl">{categoryIcons[animal.category]}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-secondary-900 dark:text-white">{animal.commonName}</div>
                    <div className="text-sm text-secondary-600 dark:text-secondary-400">{animal.scientificName}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-secondary-500 dark:text-secondary-400">Population</div>
                    <div className="font-medium text-secondary-900 dark:text-white">
                      {animal.populationEstimate?.toLocaleString() || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-secondary-500 dark:text-secondary-400">Status</div>
                    <div className={`font-medium px-2 py-1 rounded-lg text-white text-xs ${
                      animal.conservationStatus === 'EX' || animal.conservationStatus === 'EW' ? 'bg-danger-500' :
                      animal.conservationStatus === 'CR' ? 'bg-danger-400' :
                      animal.conservationStatus === 'EN' ? 'bg-warning-500' :
                      animal.conservationStatus === 'VU' ? 'bg-warning-400' :
                      'bg-success-500'
                    }`}>
                      {animal.conservationStatus}
                    </div>
                  </div>
                  <div>
                    <div className="text-secondary-500 dark:text-secondary-400">Category</div>
                    <div className="font-medium text-secondary-900 dark:text-white">{animal.category}</div>
                  </div>
                  <div>
                    <div className="text-secondary-500 dark:text-secondary-400">Monitored</div>
                    <div className="font-medium text-secondary-900 dark:text-white">
                      {animal.isMonitored ? '✅ Yes' : '❌ No'}
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-secondary-200 dark:border-secondary-700">
                  <Link
                    href={`/animal/${animal.id}`}
                    className="text-primary-600 dark:text-primary-400 text-sm hover:underline"
                  >
                    View Full Profile →
                  </Link>
                </div>
              </>
            );
          })()}
        </motion.div>
      )}
    </motion.div>
  );
}
