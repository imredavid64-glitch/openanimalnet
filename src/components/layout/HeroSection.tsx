'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { sampleAnimals } from '@/data/sample/animals';

export default function HeroSection() {
  const scrollToExplore = () => {
    const exploreSection = document.querySelector('#explore');
    if (exploreSection) {
      exploreSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Real, derived figures — the same dataset the globe renders.
  const speciesCount = sampleAnimals.length;
  const corridorCount = sampleAnimals.reduce((t, a) => t + (a.migrationRoutes?.length ?? 0), 0);
  const iucnCount = sampleAnimals.filter((a) => a.conservationStatus !== 'NE').length;
  const monitoredCount = sampleAnimals.filter((a) => a.isMonitored).length;

  const stats = [
    { label: 'species tracked', value: String(speciesCount) },
    { label: 'migration corridors', value: String(corridorCount) },
    { label: 'IUCN-assessed', value: String(iucnCount) },
    { label: 'under monitoring', value: String(monitoredCount) },
  ];

  // Deterministic "tracking network" constellation: nodes + connections,
  // generated from a fixed seed so SSR and client render identically. The
  // node matching the current month pulses — this month's "tracked" node.
  const nodes: { x: number; y: number; r: number }[] = [];
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = 0; i < 46; i++) {
    nodes.push({ x: rand() * 100, y: rand() * 100, r: 0.6 + rand() * 1.4 });
  }
  const liveNode = nodes[new Date().getMonth() % nodes.length];
  const links: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      if (dx * dx + dy * dy < 320) {
        links.push({ x1: nodes[i].x, y1: nodes[i].y, x2: nodes[j].x, y2: nodes[j].y });
      }
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-800 to-secondary-900 dark:from-primary-900 dark:via-primary-950 dark:to-secondary-950" />

      {/* Tracking-network constellation — the platform's motif: nodes are
          tracked animals, links are the routes between them */}
      <svg
        className="absolute inset-0 w-full h-full text-white/[0.07] constellation-drift"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {links.map((l, i) => (
          <line
            key={`l${i}`}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke="currentColor"
            strokeWidth="0.06"
          />
        ))}
        {nodes.map((n, i) => (
          <circle key={`n${i}`} cx={n.x} cy={n.y} r={n.r} fill="currentColor" />
        ))}
        {/* The current month's node + a pulsing halo */}
        <g className="text-white/40">
          <circle cx={liveNode.x} cy={liveNode.y} r={liveNode.r} fill="currentColor" className="constellation-node-live" />
          <circle cx={liveNode.x} cy={liveNode.y} r={liveNode.r * 3.2} fill="none" stroke="currentColor" strokeWidth="0.08" className="constellation-node-live" />
        </g>
      </svg>

      {/* Soft radial glow behind the wordmark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[720px] h-[720px] rounded-full bg-primary-500/20 blur-[120px]" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-primary-200/80 mb-5 font-data">
            Global animal data platform
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold text-white mb-6 font-display leading-none">
            OpenAnimal<span className="text-primary-300">Net</span>
          </h1>
          <p className="text-lg md:text-xl text-white/75 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            A living index of {speciesCount} species — population, conservation status, and
            migration corridors — every figure sourced, dated, and checked against
            current records.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link href="/animal" className="btn-primary text-lg px-8 py-4">
            Explore the species
          </Link>
          <button
            onClick={scrollToExplore}
            className="text-white/70 hover:text-white transition-colors duration-300 text-sm font-medium"
          >
            See the globe ↓
          </button>
        </motion.div>

        {/* Real stats, rendered in the data font */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white/[0.07] backdrop-blur-lg rounded-2xl px-4 py-5 border border-white/10"
            >
              <div className="text-3xl font-bold text-white font-data">{stat.value}</div>
              <div className="text-sm text-white/60 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/40"
      >
        <span className="text-2xl animate-bounce">↓</span>
      </motion.div>
    </div>
  );
}
