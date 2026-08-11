import type { Metadata } from 'next';
import StaticPage, { Section, PageLink } from '@/components/layout/StaticPage';
import { sampleMonitoringData } from '@/data/sample/animals';

export const metadata: Metadata = {
  title: 'Monitoring Coverage | OpenAnimalNet',
  description: 'Where the OpenAnimalNet tracking network operates and how to interpret coverage.',
};

const coverageEntries = [
  { key: 'mammals', icon: '🦁', label: 'Mammals' },
  { key: 'birds', icon: '🦅', label: 'Birds' },
  { key: 'reptiles', icon: '🐍', label: 'Reptiles' },
  { key: 'amphibians', icon: '🐸', label: 'Amphibians' },
  { key: 'fish', icon: '🐟', label: 'Fish' },
  { key: 'marine', icon: '🐋', label: 'Marine' },
] as const;

type CoverageKey = (typeof coverageEntries)[number]['key'];

export default function CoveragePage() {
  const coverage = sampleMonitoringData.monitoringCoverage as Record<CoverageKey, number>;

  return (
    <StaticPage
      icon="🛰️"
      title="Monitoring Coverage"
      subtitle="Our tracking network spans every continent and ocean basin. Coverage reflects the share of known species in each group with at least one active tracking program."
    >
      <Section>Coverage by Category</Section>
      <div className="space-y-5">
        {coverageEntries.map((entry) => {
          const value = coverage[entry.key];
          return (
            <div key={entry.key}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-secondary-900 dark:text-white">
                  {entry.icon} {entry.label}
                </span>
                <span className="text-secondary-500 dark:text-secondary-400">{Math.round(value * 100)}%</span>
              </div>
              <div className="h-3 rounded-full bg-secondary-100 dark:bg-secondary-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600"
                  style={{ width: `${Math.round(value * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <Section>Network Stats</Section>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>{sampleMonitoringData.totalAnimals.toLocaleString()}</strong> total species in the database.</li>
        <li><strong>{sampleMonitoringData.monitoredAnimals.toLocaleString()}</strong> animals actively monitored.</li>
        <li><strong>{sampleMonitoringData.activeAlerts}</strong> active alerts across the network.</li>
      </ul>

      <Section>Interpreting Coverage</Section>
      <p>
        Coverage varies by category because monitoring effort follows conservation need and
        logistical feasibility. Marine and amphibian coverage is growing fastest as new
        acoustic and eDNA programs come online.
      </p>

      <p>
        See the network in action on the <PageLink href="/monitor">monitoring center</PageLink>{' '}
        or explore individual species in the <PageLink href="/animal">animal database</PageLink>.
      </p>
    </StaticPage>
  );
}
