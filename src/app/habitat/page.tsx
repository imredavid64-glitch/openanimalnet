'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BIOMES, Biome } from '@/lib/habitat';

export default function HabitatPage() {
  const [selectedBiome, setSelectedBiome] = useState<Biome>(BIOMES[0]);
  const [tempOffsetC, setTempOffsetC] = useState<number>(1.5); // +1.5C baseline

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          <span>Ecological Modeling</span>
          <span>•</span>
          <span>Climate Shift Simulator</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
          Biome & Climate Shift Explorer
        </h1>
        <p className="text-slate-600 dark:text-slate-300 mt-2 max-w-3xl">
          Simulate how projected temperature increases impact biomes, species ranges, and ecosystem stability across key global habitats.
        </p>
      </div>

      {/* Temperature Slider Controls */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-emerald-400">Global Warming Scenario Scrubber</h2>
            <p className="text-xs text-slate-400">Adjust temperature increase (+0.5°C to +4.0°C above pre-industrial baseline)</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-amber-400 font-mono">+{tempOffsetC.toFixed(1)}°C</span>
            <div className="text-xs text-slate-400">Projected Warming</div>
          </div>
        </div>

        <input
          type="range"
          min="0.5"
          max="4.0"
          step="0.1"
          value={tempOffsetC}
          onChange={(e) => setTempOffsetC(Number(e.target.value))}
          className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
        />

        <div className="flex justify-between text-xs font-mono text-slate-400">
          <span>+0.5°C (Current)</span>
          <span>+1.5°C (Paris Goal)</span>
          <span>+2.0°C (Critical Limit)</span>
          <span>+4.0°C (Extreme Shift)</span>
        </div>
      </div>

      {/* Biome Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {BIOMES.map((b) => {
          const isSelected = selectedBiome.id === b.id;
          return (
            <div
              key={b.id}
              onClick={() => setSelectedBiome(b)}
              className={`p-5 rounded-2xl border cursor-pointer transition ${
                isSelected
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-md'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-3xl">{b.icon}</span>
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: b.color }}
                />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mt-3">{b.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{b.description}</p>
            </div>
          );
        })}
      </div>

      {/* Selected Biome Detailed Impact Analysis */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
        <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <span className="text-4xl">{selectedBiome.icon}</span>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedBiome.name} Impact Analysis</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Primary threat: {selectedBiome.primaryThreat}</p>
          </div>
        </div>

        {/* Dynamic Habitat Stress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-700 dark:text-slate-300">Ecosystem Stress Level</span>
            <span className={tempOffsetC > 2.0 ? 'text-rose-500 font-bold' : 'text-amber-500 font-bold'}>
              {Math.min(100, Math.round((tempOffsetC / 4.0) * 100))}% Capacity Loss
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                tempOffsetC > 2.0 ? 'bg-rose-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, (tempOffsetC / 4.0) * 100)}%` }}
            />
          </div>
        </div>

        {/* Species Impact Grid */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase text-slate-500 dark:text-slate-400">Vulnerable Indicator Species</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedBiome.keySpecies.map((sp) => (
              <div
                key={sp.speciesId}
                className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-between items-center"
              >
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{sp.name}</h4>
                  <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
                    Impact at +{tempOffsetC.toFixed(1)}°C: {sp.impactAtPlus2C}
                  </p>
                </div>
                <Link
                  href={`/animal/${sp.speciesId}`}
                  className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-500 transition"
                >
                  Profile →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
