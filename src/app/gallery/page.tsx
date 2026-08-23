'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { sampleAnimals } from '@/data/sample/animals';

export default function GalleryPage() {
  const [selectedCat, setSelectedCat] = useState<string>('all');

  const galleryItems = sampleAnimals.map((a) => ({
    id: a.id,
    title: a.commonName,
    category: a.category,
    status: a.conservationStatus,
    image: a.images?.[0] || '/images/earth.jpg',
    location: a.habitat?.join(', ') || '',
  }));

  const filtered = galleryItems.filter(
    (item) => selectedCat === 'all' || item.category === selectedCat
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Wildlife Photography Gallery</h1>
        <p className="text-slate-600 dark:text-slate-300 mt-2">Verified field photos and camera trap captures.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {['all', 'mammals', 'birds', 'reptiles', 'amphibians', 'marine'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition ${
              selectedCat === cat
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md group"
          >
            <div className="relative h-56 w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition duration-300"
              />
              <span className="absolute top-3 right-3 px-2.5 py-1 bg-slate-950/70 backdrop-blur text-white text-xs font-bold rounded-lg font-mono">
                {item.status}
              </span>
            </div>
            <div className="p-5 space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">Category: {item.category}</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-1">Habitat: {item.location}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
