import type { Metadata } from 'next';
import Link from 'next/link';
import StaticPage, { Section, PageLink } from '@/components/layout/StaticPage';
import { sampleAnimals } from '@/data/sample/animals';

export const metadata: Metadata = {
  title: 'Population Data | OpenAnimalNet',
  description: 'Population data — abundance, demographics, and conservation metrics.',
};

export default function PopulationDataPage() {
  const species = sampleAnimals.filter((animal) => animal.dataCategories.includes('population'));

  return (
    <StaticPage
      icon="📈"
      title="Population Data"
      subtitle="How many individuals exist, how populations are structured, and how they are trending."
    >
      <p>
        Population data is the heartbeat of conservation. We track abundance through mark-
        recapture, camera traps, transects, and aerial surveys, then layer on demographic
        structure and IUCN conservation status.
      </p>

      <Section>Subcategories</Section>
      <ul className="list-disc pl-6 space-y-1">
        <li><strong>Abundance</strong> — mark-recapture records, camera-trap rates, survey counts.</li>
        <li><strong>Demographic</strong> — age classes, sex ratios, birth and mortality rates.</li>
        <li><strong>Conservation</strong> — IUCN status, range contraction, fragmentation.</li>
      </ul>

      <Section>Species with Population Data ({species.length})</Section>
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
        See trends visualized on the <PageLink href="/dashboard">dashboard</PageLink> or back
        to the <PageLink href="/data">data explorer</PageLink>.
      </p>
    </StaticPage>
  );
}
