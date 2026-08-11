import type { Metadata } from 'next';
import Link from 'next/link';
import StaticPage, { Section, PageLink } from '@/components/layout/StaticPage';
import { sampleAnimals } from '@/data/sample/animals';

export const metadata: Metadata = {
  title: 'Biological Data | OpenAnimalNet',
  description: 'Biological data — biometrics, genomics, physiology, and endocrinology.',
};

export default function BiologicalDataPage() {
  const species = sampleAnimals.filter((animal) => animal.dataCategories.includes('biological'));

  return (
    <StaticPage
      icon="🧬"
      title="Biological Data"
      subtitle="Biometrics, genomics, physiological metrics, and endocrine profiles for every tracked species."
    >
      <p>
        Biological data captures the physical and genetic characteristics of each species —
        body mass, measurements, genome information, vital signs, and hormonal profiles.
        This category underpins everything else we track.
      </p>

      <Section>Subcategories</Section>
      <ul className="list-disc pl-6 space-y-1">
        <li><strong>Biometrics</strong> — body mass, wingspan, skull width, body condition.</li>
        <li><strong>Genomic</strong> — genome sequences, SNPs, parentage, gene expression.</li>
        <li><strong>Physiological</strong> — temperature, heart rate, respiration, metabolic rate.</li>
        <li><strong>Endocrine</strong> — cortisol, reproductive hormones, blood chemistry.</li>
      </ul>

      <Section>Species with Biological Data ({species.length})</Section>
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
