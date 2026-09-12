/**
 * Advanced Analytics Widgets
 * - Population Viability Analysis (PVA) 
 * - Corridor Connectivity Graphs
 * - All client-side, no database required
 */

import { sampleAnimals } from '@/data/sample/animals';
import type { Animal } from '@/types/animal/types';

export interface PVAParameters {
  initialPopulation: number;
  carryingCapacity: number;
  growthRate: number; // r (intrinsic rate of increase)
  growthRateSD: number; // Environmental stochasticity
  catastropheProbability: number; // Annual probability
  catastropheSeverity: number; // Proportion killed (0-1)
  harvestRate: number; // Annual harvest proportion
  inbreedingDepression: number; // Lethal equivalents
  years: number;
  iterations: number;
}

export interface PVAResult {
  extinctionProbability: number;
  medianPopulation: number[];
  percentile5: number[];
  percentile95: number[];
  meanTimeToExtinction: number | null;
  quasiExtinctionRisk: { threshold: number; probability: number }[];
}

export interface CorridorNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
  species: string[];
  importance: number; // 0-1
  protected: boolean;
}

export interface CorridorEdge {
  source: string;
  target: string;
  distance: number;
  resistance: number; // Landscape resistance
  flow: number; // Current flow
  species: string[];
  protected: boolean;
}

export interface CorridorGraph {
  nodes: CorridorNode[];
  edges: CorridorEdge[];
  metrics: {
    connectivity: number;
    centrality: Record<string, number>;
    bottlenecks: Array<{ edge: string; betweenness: number }>;
    clusters: Record<string, number>;
  };
}

/**
 * Population Viability Analysis using stochastic Ricker model
 * Based on standard PVA methodology (Morris & Doak 2002)
 */
export function runPVA(params: PVAParameters): PVAResult {
  const { 
    initialPopulation, 
    carryingCapacity, 
    growthRate, 
    growthRateSD,
    catastropheProbability,
    catastropheSeverity,
    harvestRate,
    inbreedingDepression,
    years,
    iterations
  } = params;

  const trajectories: number[][] = [];

  for (let iter = 0; iter < iterations; iter++) {
    const trajectory: number[] = [];
    let N = initialPopulation;

    for (let year = 0; year < years; year++) {
      if (N <= 0) {
        trajectory.push(0);
        // Extinct - fill remaining years with 0
        for (let y = year + 1; y < years; y++) trajectory.push(0);
        break;
      }

      // Density-dependent growth (Ricker model)
      const densityEffect = Math.exp(growthRate * (1 - N / carryingCapacity));
      
      // Environmental stochasticity
      const envStoch = Math.exp(growthRateSD * (Math.random() * 2 - 1)); // lognormal
      
      // Demographic stochasticity (Poisson)
      const expectedN = N * densityEffect * envStoch;
      N = Math.max(0, Math.random() < 0.5 ? Math.floor(expectedN) : Math.ceil(expectedN));
      
      // Inbreeding depression
      if (inbreedingDepression > 0 && N > 0) {
        const inbreedingMortality = 1 - Math.exp(-inbreedingDepression / N);
        N = Math.floor(N * (1 - inbreedingMortality));
      }

      // Harvest
      if (harvestRate > 0 && N > 0) {
        N = Math.floor(N * (1 - harvestRate));
      }

      // Catastrophe
      if (Math.random() < catastropheProbability && N > 0) {
        N = Math.floor(N * (1 - catastropheSeverity));
      }

      trajectory.push(N);
    }

    // Pad trajectory if extinct early
    while (trajectory.length < years) trajectory.push(0);
    trajectories.push(trajectory);
  }

  // Calculate statistics
  const extinctCount = trajectories.filter(t => t[t.length - 1] === 0).length;
  const extinctionProbability = extinctCount / iterations;

  // Percentiles per year
  const medianPopulation: number[] = [];
  const percentile5: number[] = [];
  const percentile95: number[] = [];

  for (let year = 0; year < years; year++) {
    const yearValues = trajectories.map(t => t[year]).sort((a, b) => a - b);
    const len = yearValues.length;
    medianPopulation.push(yearValues[Math.floor(len * 0.5)]);
    percentile5.push(yearValues[Math.floor(len * 0.05)]);
    percentile95.push(yearValues[Math.floor(len * 0.95)]);
  }

  // Mean time to extinction (only for extinct trajectories)
  const extinctTrajectories = trajectories.filter(t => t.includes(0));
  const meanTimeToExtinction = extinctTrajectories.length > 0
    ? extinctTrajectories.reduce((sum, t) => sum + t.indexOf(0), 0) / extinctTrajectories.length
    : null;

  // Quasi-extinction risk at different thresholds
  const thresholds = [10, 50, 100, 500];
  const quasiExtinctionRisk = thresholds.map(threshold => {
    const atRisk = trajectories.filter(t => t[t.length - 1] > 0 && t[t.length - 1] < threshold).length;
    return { threshold, probability: atRisk / iterations };
  });

  return {
    extinctionProbability,
    medianPopulation,
    percentile5,
    percentile95,
    meanTimeToExtinction,
    quasiExtinctionRisk,
  };
}

/**
 * Get default PVA parameters for a species based on its life history
 */
export function getDefaultPVAParams(animal: Animal): PVAParameters {
  // Heuristics based on taxonomy and body size
  const isMammal = animal.category === 'mammals';
  const isBird = animal.category === 'birds';
  const isLarge = (animal.populationEstimate ?? 10000) < 10000; // Small populations = larger body typically
  
  let growthRate = 0.1;
  let growthRateSD = 0.15;
  let catastropheProb = 0.02;
  let catastropheSev = 0.3;
  let inbreedingDep = 0;

  if (isBird) {
    growthRate = 0.2;
    growthRateSD = 0.2;
    catastropheProb = 0.03;
    catastropheSev = 0.4;
  } else if (isMammal) {
    growthRate = 0.1;
    growthRateSD = 0.15;
    catastropheProb = 0.02;
    catastropheSev = 0.3;
    if (isLarge) inbreedingDep = 3.0; // Large mammals more susceptible
  }

  return {
    initialPopulation: animal.populationEstimate ?? 1000,
    carryingCapacity: Math.max(animal.populationEstimate ?? 1000, 10000),
    growthRate,
    growthRateSD,
    catastropheProbability: catastropheProb,
    catastropheSeverity: catastropheSev,
    harvestRate: 0,
    inbreedingDepression: inbreedingDep,
    years: 100,
    iterations: 500,
  };
}

/**
 * Build corridor connectivity graph from species migration routes
 */
export function buildCorridorGraph(): CorridorGraph {
  const nodes: CorridorNode[] = [];
  const edges: CorridorEdge[] = [];
  const nodeMap = new Map<string, CorridorNode>();

  // Create nodes from migration route waypoints
  for (const animal of sampleAnimals) {
    if (!animal.migrationRoutes) continue;
    
    for (const route of animal.migrationRoutes) {
      for (let i = 0; i < route.points.length; i++) {
        const point = route.points[i];
        const nodeId = `${animal.id}-route-${route.name.replace(/\s+/g, '-')}-wp-${i}`;
        
        if (!nodeMap.has(nodeId)) {
          const node: CorridorNode = {
            id: nodeId,
            name: `${animal.commonName} - ${route.name} (WP ${i + 1})`,
            lat: point.latitude,
            lng: point.longitude,
            species: [animal.commonName],
            importance: 1 / route.points.length, // Distributed importance
            protected: false, // Would need protected area data
          };
          nodeMap.set(nodeId, node);
          nodes.push(node);
        } else {
          // Add species to existing node
          const existing = nodeMap.get(nodeId)!;
          if (!existing.species.includes(animal.commonName)) {
            existing.species.push(animal.commonName);
            existing.importance += 1 / route.points.length;
          }
        }

        // Create edges between consecutive waypoints
        if (i > 0) {
          const prevPoint = route.points[i - 1];
          const prevId = `${animal.id}-route-${route.name.replace(/\s+/g, '-')}-wp-${i - 1}`;
          
          const distance = greatCircleDistance(
            prevPoint.latitude, prevPoint.longitude,
            point.latitude, point.longitude
          );
          
          edges.push({
            source: prevId,
            target: nodeId,
            distance,
            resistance: 1.0, // Default - could use land cover data
            flow: 1,
            species: [animal.commonName],
            protected: false,
          });
        }
      }
    }
  }

  // Calculate graph metrics
  const adjacency = new Map<string, Set<string>>();
  for (const edge of edges) {
    if (!adjacency.has(edge.source)) adjacency.set(edge.source, new Set());
    if (!adjacency.has(edge.target)) adjacency.set(edge.target, new Set());
    adjacency.get(edge.source)!.add(edge.target);
    adjacency.get(edge.target)!.add(edge.source);
  }

  // Betweenness centrality (simplified)
  const centrality: Record<string, number> = {};
  for (const node of nodes) {
    centrality[node.id] = adjacency.get(node.id)?.size ?? 0;
  }

  // Find bottlenecks (edges with high betweenness)
  const edgeBetweenness: Record<string, number> = {};
  for (const edge of edges) {
    const key = `${edge.source}-${edge.target}`;
    // Simplified: edges connecting high-degree nodes are bottlenecks
    const sourceDeg = centrality[edge.source] ?? 1;
    const targetDeg = centrality[edge.target] ?? 1;
    edgeBetweenness[key] = (sourceDeg + targetDeg) / 2;
  }

  const bottlenecks = Object.entries(edgeBetweenness)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([edge, betweenness]) => ({ edge, betweenness }));

  // Connected components (clusters)
  const visited = new Set<string>();
  const clusters: Record<string, number> = {};
  let clusterId = 0;

  for (const node of nodes) {
    if (visited.has(node.id)) continue;
    clusterId++;
    const queue = [node.id];
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      clusters[current] = clusterId;
      for (const neighbor of adjacency.get(current) ?? []) {
        if (!visited.has(neighbor)) queue.push(neighbor);
      }
    }
  }

  // Overall connectivity (average degree / max possible)
  const avgDegree = nodes.reduce((sum, n) => sum + (adjacency.get(n.id)?.size ?? 0), 0) / nodes.length;
  const connectivity = nodes.length > 1 ? avgDegree / (nodes.length - 1) : 1;

  return {
    nodes,
    edges,
    metrics: {
      connectivity,
      centrality,
      bottlenecks,
      clusters,
    },
  };
}

function greatCircleDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + 
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Calculate corridor importance for a species
 */
export function getSpeciesCorridorImportance(animalId: string): {
  corridors: CorridorEdge[];
  totalLength: number;
  protectedLength: number;
  bottleneckCount: number;
} {
  const graph = buildCorridorGraph();
  const corridors = graph.edges.filter(e => e.species.some(s => s === animalId));
  
  // Find matching animal
  const animal = sampleAnimals.find(a => a.id === animalId);
  const speciesName = animal?.commonName ?? animalId;

  const speciesCorridors = corridors.filter(e => e.species.includes(speciesName));
  const totalLength = speciesCorridors.reduce((sum, e) => sum + e.distance, 0);
  const protectedLength = speciesCorridors.filter(e => e.protected).reduce((sum, e) => sum + e.distance, 0);
  
  // Count bottlenecks affecting this species
  const bottleneckEdges = new Set(graph.metrics.bottlenecks.map(b => b.edge));
  const bottleneckCount = speciesCorridors.filter(e => 
    bottleneckEdges.has(`${e.source}-${e.target}`) || bottleneckEdges.has(`${e.target}-${e.source}`)
  ).length;

  return {
    corridors: speciesCorridors,
    totalLength,
    protectedLength,
    bottleneckCount,
  };
}