import type { Metadata } from 'next';
import Link from 'next/link';
import StaticPage, { Section, PageLink } from '@/components/layout/StaticPage';
import { sampleAnimals } from '@/data/sample/animals';

export const metadata: Metadata = {
  title: 'Ecological Data | OpenAnimalNet',
  description: 'Ecological data — habitat, dietary, and species interaction records.',
};

export default function EcologicalDataPage() {
  const species = sampleAnimals.filter((animal) => animal.dataCategories.includes('ecological'));

  return (
    <StaticPage
      icon="🌿"
      title="Ecological Data"
      subtitle="The environments species live in, what they eat, and how they interact with other species."
    >
      <p>
        Ecological data connects each species to its environment — habitat conditions,
        dietary composition, and the web of predator, prey, and mutualistic relationships
        it participates in.
      </p>

      <Section>Subcategories</Section>
      <ul className="list-disc pl-6 space-y-1">
        <li><strong>Habitat</strong> — vegetation cover, temperature, humidity, water quality.</li>
        <li><strong>Dietary</strong> — stable isotopes, fecal DNA, stomach content analysis.</li>
        <li><strong>Interactions</strong> — predator-prey encounters, competitive displacements, mutualism.</li>
      </ul>

      <Section>Species with Ecological Data ({species.length})</Section>
      <div className="flex flex-wrap gap-3">
        {species.map((animal) => (
          <Link
            key={animal.id}
            href={`/animal/${animal.id}`}
            className="inline-flex items-center space-x-2 rounded-full bg-primary-50 dark:bg-primary-900/40 border border-primary-200 dark:border-primary-800 px-4 py-2 text-sm font-medium text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800/60 transition-colors"
          >
            <span>{animal.commonName}</span>
          </Link>
        ))}
      </div>

      <p>
        Back to the <PageLink href="/data">data explorer</PageLink>.
      </p>
    </StaticPage>
  );
}
