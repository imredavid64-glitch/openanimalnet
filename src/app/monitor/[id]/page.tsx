import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { sampleAnimals, sampleAnimalData } from '@/data/sample/animals';
import MonitorClient from './MonitorClient';

export async function generateStaticParams() {
  return sampleAnimals.map((animal) => ({
    id: animal.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const animal = sampleAnimals.find((a) => a.id === id);
  return {
    title: animal ? `Monitoring: ${animal.commonName} | OpenAnimalNet` : 'Monitoring | OpenAnimalNet',
    description: animal ? `Live monitoring data for ${animal.commonName} (${animal.scientificName}).` : 'Live monitoring data.',
  };
}

export default async function AnimalMonitorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const animal = sampleAnimals.find((a) => a.id === id);
  if (!animal) {
    notFound();
  }
  const animalData = sampleAnimalData.find((d) => d.animal.id === animal.id);
  return <MonitorClient animal={animal} animalData={animalData} />;
}