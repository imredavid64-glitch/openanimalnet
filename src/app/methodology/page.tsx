import type { Metadata } from 'next';
import StaticPage, { Section, PageLink } from '@/components/layout/StaticPage';

export const metadata: Metadata = {
  title: 'Methodology | OpenAnimalNet',
  description: 'How OpenAnimalNet collects, validates, and publishes animal data.',
};

export default function MethodologyPage() {
  return (
    <StaticPage
      icon="🔬"
      title="Our Methodology"
      subtitle="How we collect, validate, and publish animal data — transparently and science-first."
    >
      <Section>Data Collection</Section>
      <p>
        Animal records come from multiple sources: GPS and satellite tracking collars, camera
        traps, field observation protocols, acoustic monitoring, and partner research
        institutions. Every record carries its collection method, timestamp, and geographic
        coordinates so it can be traced to its origin.
      </p>

      <Section>Validation</Section>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Automated checks</strong> — coordinate sanity, species-name matching, and timestamp consistency.</li>
        <li><strong>Expert review</strong> — flagged records are reviewed by our science board before publication.</li>
        <li><strong>Cross-referencing</strong> — population estimates are compared against IUCN and partner assessments.</li>
      </ul>

      <Section>Data Model</Section>
      <p>
        Each species profile organizes data into five categories:{' '}
        <PageLink href="/data/biological">biological</PageLink>,{' '}
        <PageLink href="/data/behavioral">behavioral</PageLink>,{' '}
        <PageLink href="/data/ecological">ecological</PageLink>,{' '}
        <PageLink href="/data/population">population</PageLink>, and{' '}
        <PageLink href="/data/health">health</PageLink>. Learn more in the{' '}
        <PageLink href="/data">data explorer</PageLink>.
      </p>

      <Section>Current Figures &amp; Sources</Section>
      <p>
        Conservation statuses follow the IUCN Red List (latest assessments through 2025), and
        population estimates come from the most recent published censuses and surveys. The
        sample dataset was refreshed <strong>August 2026</strong>. Key sources:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>African lion ~23,000 (IUCN 2023 assessment, Vulnerable).</li>
        <li>Bengal tiger ~3,700 in India (2022 All-India Tiger Census; IUCN Endangered).</li>
        <li>Blue whale ~15,000 (NOAA/IWC global estimate; IUCN Endangered).</li>
        <li>Giant panda ~1,900 wild (2024 census; IUCN Vulnerable).</li>
        <li>Mountain gorilla 1,063 (2018 census, still the reference figure; IUCN Endangered).</li>
        <li>Great white shark (IUCN 2018 assessment, Vulnerable — 30–49% decline).</li>
        <li>Bald eagle ~316,700 (USFWS 2020; IUCN Least Concern).</li>
        <li>Western honey bee (IUCN 2014 global assessment, Data Deficient — wild colonies not
          quantified).</li>
        <li>Holstein cattle are a domesticated breed with no IUCN assessment (Not Evaluated).</li>
      </ul>
      <p>
        Every species links to its primary sources — Wikipedia and its official IUCN assessment —
        on our <PageLink href="/sources">data sources index</PageLink>.
      </p>

      <Section>Open Publication</Section>
      <p>
        Published datasets are available through our <PageLink href="/api">API</PageLink> under
        an open license. We version every dataset so researchers can cite exactly the data
        they used.
      </p>
    </StaticPage>
  );
}
