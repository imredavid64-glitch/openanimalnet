'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PROTECTED_AREAS, ProtectedArea } from '@/lib/reserves';

export default function ReservesPage() {
  const [selectedArea, setSelectedArea] = useState<ProtectedArea>(PROTECTED_AREAS[0]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredAreas = PROTECTED_AREAS.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          <span>Conservation Boundaries</span>
          <span>•</span>
          <span>Global Protected Areas</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
          Biosphere Reserves & Protected Areas
        </h1>
        <p className="text-slate-600 dark:text-slate-300 mt-2 max-w-3xl">
          Explore global national parks, marine protected areas (MPAs), and biosphere reserves safeguarding critical endangered species habitats.
        </p>
      </div>

      {/* Search Input */}
      <div className="max-w-md">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search reserves by name, country, or type..."
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAreas.map((area) => {
              const isSelected = selectedArea.id === area.id;
              return (
                <div
                  key={area.id}
                  onClick={() => setSelectedArea(area)}
                  className={`p-5 rounded-2xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold">
                      {area.type}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        area.threatLevel === 'High'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          : area.threatLevel === 'Moderate'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                    >
                      Threat: {area.threatLevel}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-3">
                    {area.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    🌍 {area.country} • Est. {area.establishedYear}
                  </p>
                  <div className="mt-4 flex justify-between items-center text-xs font-mono text-slate-400">
                    <span>{area.areaSqKm.toLocaleString()} sq km</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Inspect →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
          <div>
            <div className="text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400">
              {selectedArea.type}
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {selectedArea.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Location: {selectedArea.country} ({selectedArea.coordinates.lat.toFixed(2)},{' '}
              {selectedArea.coordinates.lng.toFixed(2)})
            </p>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Protected Surface Area</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {selectedArea.areaSqKm.toLocaleString()} km²
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Establishment Year</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {selectedArea.establishedYear}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Habitat Threat Assessment</span>
              <span className="font-mono font-bold text-rose-500">{selectedArea.threatLevel}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase text-slate-400">Key Protected Species</h3>
            <div className="flex flex-wrap gap-2">
              {selectedArea.keySpecies.map((sp) => (
                <span
                  key={sp}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold"
                >
                  🐾 {sp}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <Link
              href="/animal"
              className="block w-full text-center py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-500 transition shadow-lg"
            >
              Explore Species Catalog →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
