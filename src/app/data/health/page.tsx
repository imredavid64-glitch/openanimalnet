import type { Metadata } from 'next';
import Link from 'next/link';
import StaticPage, { Section, PageLink } from '@/components/layout/StaticPage';
import { sampleAnimals } from '@/data/sample/animals';

export const metadata: Metadata = {
  title: 'Health Data | OpenAnimalNet',
  description: 'Health data — pathogens, veterinary records, and zoonotic risk.',
};

export default function HealthDataPage() {
  const species = sampleAnimals.filter((animal) => animal.dataCategories.includes('health'));

  return (
    <StaticPage
      icon="🏥"
      title="Health Data"
      subtitle="Disease surveillance, veterinary care, and zoonotic risk monitoring."
    >
      <p>
        Health data supports early detection of disease outbreaks and protects both wildlife
        and human communities. We track pathogens, veterinary interventions, and the
        conditions that enable spillover events.
      </p>

      <Section>Subcategories</Section>
      <ul className="list-disc pl-6 space-y-1">
        <li><strong>Pathogen</strong> — viral and bacterial loads, parasites, antibody titers.</li>
        <li><strong>Veterinary</strong> — diagnoses, surgeries, vaccinations, treatments.</li>
        <li><strong>Zoonotic</strong> — vector abundance, spillover events, pathogen mutations.</li>
      </ul>

      <Section>Species with Health Data ({species.length})</Section>
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
