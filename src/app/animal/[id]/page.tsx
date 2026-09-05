import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { sampleAnimals, sampleAnimalData } from '@/data/sample/animals';
import { speciesSources } from '@/data/sample/sources';
import AnimalDetailClient from './AnimalDetailClient';

export async function generateStaticParams() {
  return sampleAnimals.map((animal) => ({
    id: animal.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const animal = sampleAnimals.find((a) => a.id === id);
  return {
    title: animal ? `${animal.commonName} | OpenAnimalNet` : 'Animal Not Found | OpenAnimalNet',
    description: animal
      ? `${animal.scientificName} — ${animal.description?.slice(0, 160)}`
      : 'Animal details not found.',
  };
}

export default async function AnimalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const animal = sampleAnimals.find((a) => a.id === id);
  if (!animal) {
    notFound();
  }

  const animalData = sampleAnimalData.find((d) => d.animal.id === id) ?? null;
  const source = speciesSources.find((s) => s.animalId === id);

  return (
    <AnimalDetailClient
      animal={animal}
      animalData={animalData}
      source={source}
    />
  );
}