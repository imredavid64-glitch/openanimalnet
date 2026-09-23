import { sampleAnimals } from '@/data/sample/animals';
import EmbedAnimal from './EmbedAnimal';

export function generateStaticParams() {
  return sampleAnimals.map((animal) => ({ id: animal.id }));
}

export default async function EmbedAnimalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EmbedAnimal id={id} />;
}