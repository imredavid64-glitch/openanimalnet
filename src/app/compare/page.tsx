'use client';

import React, { useState } from 'react';
import { sampleAnimals } from '@/data/sample/animals';
import Link from 'next/link';

export default function ComparePage() {
  const [selectedIds, setSelectedIds] = useState<string[]>(['lion-001', 'tiger-001']);

  const selectedSpecies = sampleAnimals.filter((a) => selectedIds.includes(a.id));

  const toggleSpecies = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter((sid) => sid !== id));
      }
    } else if (selectedIds.length < 4) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Species Comparison</h1>
        <p className="text-slate-600 dark:text-slate-300 mt-2">Select up to 4 species for a side-by-side analysis.</p>
      </div>

      {/* Species Selector */}
      <div className="flex flex-wrap gap-2">
        {sampleAnimals.slice(0, 10).map((a) => (
          <button
            key={a.id}
            onClick={() => toggleSpecies(a.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedIds.includes(a.id)
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {a.commonName}
          </button>
        ))}
      </div>

      {/* Comparison Matrix */}
      <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="p-4 font-bold text-slate-900 dark:text-white">Feature</th>
              {selectedSpecies.map((s) => (
                <th key={s.id} className="p-4 font-bold text-slate-900 dark:text-white min-w-[200px]">
                  {s.commonName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {[
              { label: 'Scientific Name', getter: (s: any) => s.scientificName },
              { label: 'Category', getter: (s: any) => s.category },
              { label: 'Conservation Status', getter: (s: any) => s.conservationStatus },
              { label: 'Population', getter: (s: any) => s.populationEstimate?.toLocaleString() },
              { label: 'Habitat', getter: (s: any) => s.habitat.join(', ') },
              { label: 'Migration', getter: (s: any) => s.migrationRoutes?.length > 0 ? 'Yes' : 'No' },
            ].map((row) => (
              <tr key={row.label}>
                <td className="p-4 font-semibold text-slate-500 dark:text-slate-400">{row.label}</td>
                {selectedSpecies.map((s) => (
                  <td key={s.id} className="p-4 text-slate-900 dark:text-slate-200 font-mono">
                    {row.getter(s) ?? 'N/A'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
