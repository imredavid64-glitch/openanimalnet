'use client';

import Link from 'next/link';
import { sampleAnimals } from '@/data/sample/animals';

export default function EmbedAnimal({ id }: { id: string }) {
  const animal = sampleAnimals.find(a => a.id === id);

  if (!animal) {
    return (
      <div className="w-[400px] h-[320px] flex items-center justify-center bg-secondary-50 rounded-2xl text-secondary-500 text-sm">
        Species not found
      </div>
    );
  }

  const statusColor: Record<string, string> = {
    CR: 'bg-danger-500', EN: 'bg-danger-400', VU: 'bg-warning-500',
    NT: 'bg-warning-400', LC: 'bg-success-500', DD: 'bg-secondary-400', NE: 'bg-secondary-300',
  };

  return (
    <div className="w-[400px] h-[320px] overflow-hidden rounded-2xl border border-secondary-200 bg-white font-sans">
      <div className="relative h-40">
        {animal.images?.[0] ? (
          <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${animal.images[0]})` }} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-4xl">
            🐾
          </div>
        )}
        <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold text-white ${statusColor[animal.conservationStatus] ?? 'bg-secondary-400'}`}>
          {animal.conservationStatus}
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-secondary-900">{animal.commonName}</h3>
        <p className="text-sm italic text-secondary-500">{animal.scientificName}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-secondary-400">{animal.category}</span>
          <Link
            href={`/animal/${animal.id}`}
            target="_blank"
            className="text-xs font-medium text-primary-600 hover:text-primary-700"
          >
            View on OpenAnimalNet →
          </Link>
        </div>
      </div>
    </div>
  );
}