import type { Metadata } from 'next';
import StaticPage, { Section, PageLink } from '@/components/layout/StaticPage';
import { ScaleIcon } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Methodology | OpenAnimalNet',
  description: 'How OpenAnimalNet collects, validates, and publishes animal data.',
};

export default function MethodologyPage() {
  return (
    <StaticPage
      icon={<ScaleIcon className="w-16 h-16 mx-auto text-primary-300" />}
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
        <li>Polar bear ~26,000 (IUCN 2015 estimate; Vulnerable).</li>
        <li>Bornean orangutan ~104,700 (IUCN 2016 assessment; Critically Endangered).</li>
        <li>Amur leopard ~130 adults (2023 Russia–China census; Critically Endangered under the
          2020 global leopard assessment).</li>
        <li>Giraffe ~117,000 (Giraffe Conservation Foundation 2021; Vulnerable).</li>
        <li>Koala ~57,000 est. (AKF 2023, wide estimate range; IUCN Vulnerable, Endangered under
          Australian law).</li>
        <li>Monarch butterfly (IUCN 2022 assessment, Endangered — western overwintering count
          ~233,000 in 2023-24, down from millions).</li>
        <li>Komodo dragon ~3,500 incl. juveniles, ~1,383 mature (IUCN 2021; Endangered).</li>
        <li>Snow leopard ~7,500 (latest IUCN CatSG estimate; Vulnerable).</li>
        <li>Red panda &lt;10,000 mature individuals (IUCN 2015; possibly as few as 2,500;
          Endangered).</li>
        <li>Axolotl 50–1,000 mature (IUCN 2019; Xochimilco surveys fell from ~6,000 in 1998 to
          36 in 2013; Critically Endangered).</li>
        <li>African penguin ~8,750 breeding pairs in South Africa (2023); fewer than 10,000 pairs
          globally; Critically Endangered (2024 uplisting).</li>
        <li>Leatherback sea turtle ~34,000–36,000 nesting females (IUCN 2013); global nest
          abundance down ~40% since the 1980s; Vulnerable.</li>
        <li>Proboscis monkey ~16,000 (IUCN 2015 estimate; Endangered).</li>
        <li>Saiga antelope ~4.6M (Kazakhstan aerial census 2026); ~990,000 mature globally
          (IUCN 2023); Near Threatened after recovery from the 2015 mass die-off.</li>
        <li>Golden lion tamarin ~4,800 wild (2022–23 census; up from ~200 in the 1970s;
          Endangered).</li>
        <li>Vaquita ~10 remaining (2023–24 surveys, 6–8 in 2024; 567 in 1997; Critically
          Endangered).</li>
      </ul>
      <p>
        New species are added with the generator (<code>node .freebuff/generate-species.mjs</code>),
        which pulls taxonomy, IUCN assessment IDs, photos, and descriptions straight from
        Wikidata/Wikipedia; census figures are then filled in by hand.
      </p>
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
