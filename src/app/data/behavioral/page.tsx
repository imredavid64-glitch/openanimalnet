import type { Metadata } from 'next';
import Link from 'next/link';
import StaticPage, { Section, PageLink } from '@/components/layout/StaticPage';
import { sampleAnimals } from '@/data/sample/animals';

export const metadata: Metadata = {
  title: 'Behavioral Data | OpenAnimalNet',
  description: 'Behavioral data — telemetry, bioacoustics, ethology, and biomechanics.',
};

export default function BehavioralDataPage() {
  const species = sampleAnimals.filter((animal) => animal.dataCategories.includes('behavioral'));

  return (
    <StaticPage
      icon="🦅"
      title="Behavioral Data"
      subtitle="Movement, vocalization, time budgets, and locomotion data from tracking and observation networks."
    >
      <p>
        Behavioral data reveals how animals actually live — where they travel, how they
        communicate, how they spend their time, and how they move. Most of it comes from
        telemetry collars, acoustic recorders, and field observation protocols.
      </p>

      <Section>Subcategories</Section>
      <ul className="list-disc pl-6 space-y-1">
        <li><strong>Telemetry</strong> — GPS tracks, home ranges, migration corridors.</li>
        <li><strong>Bioacoustics</strong> — vocalizations, echolocation, call counts.</li>
        <li><strong>Ethology</strong> — foraging, sleeping, mating, and territorial time budgets.</li>
        <li><strong>Biomechanics</strong> — accelerometry, gait, stride, burst speed.</li>
      </ul>

      <Section>Species with Behavioral Data ({species.length})</Section>
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
        See live behavior in the <PageLink href="/monitor">monitoring center</PageLink> or
        back to the <PageLink href="/data">data explorer</PageLink>.
      </p>
    </StaticPage>
  );
}
