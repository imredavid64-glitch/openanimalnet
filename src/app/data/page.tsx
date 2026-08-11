import type { Metadata } from 'next';
import StaticPage, { Section, PageLink } from '@/components/layout/StaticPage';
import { sampleAnimals } from '@/data/sample/animals';

export const metadata: Metadata = {
  title: 'Data Explorer | OpenAnimalNet',
  description: 'Explore the five data categories that make up every OpenAnimalNet species profile.',
};

const categories = [
  {
    slug: 'biological',
    icon: '🧬',
    title: 'Biological',
    blurb: 'Biometrics, genomics, physiology, and endocrine data.',
  },
  {
    slug: 'behavioral',
    icon: '🦅',
    title: 'Behavioral',
    blurb: 'Telemetry, bioacoustics, ethology, and biomechanics.',
  },
  {
    slug: 'ecological',
    icon: '🌿',
    title: 'Ecological',
    blurb: 'Habitat conditions, dietary analysis, and species interactions.',
  },
  {
    slug: 'population',
    icon: '📈',
    title: 'Population',
    blurb: 'Abundance, demographics, and conservation metrics.',
  },
  {
    slug: 'health',
    icon: '🏥',
    title: 'Health',
    blurb: 'Pathogens, veterinary records, and zoonotic risk.',
  },
];

export default function DataPage() {
  const speciesCount = sampleAnimals.length;

  return (
    <StaticPage
      icon="🗂️"
      title="Data Explorer"
      subtitle={`Every species profile on OpenAnimalNet is organized into five data categories. Explore each one below — ${speciesCount} species are currently in the database.`}
    >
      <Section>Data Categories</Section>
      <div className="space-y-4">
        {categories.map((category) => (
          <a
            key={category.slug}
            href={`/data/${category.slug}`}
            className="flex items-start space-x-4 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 hover:shadow-soft hover:border-primary-400 dark:hover:border-primary-600 transition-all group"
          >
            <div className="text-3xl">{category.icon}</div>
            <div>
              <div className="font-semibold text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {category.title}
              </div>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">{category.blurb}</div>
            </div>
          </a>
        ))}
      </div>

      <Section>Species in the Database</Section>
      <p>
        Browse the <PageLink href="/animal">full animal database</PageLink> or visit the{' '}
        <PageLink href="/dashboard">dashboard</PageLink> for global statistics and trends.
      </p>
    </StaticPage>
  );
}
