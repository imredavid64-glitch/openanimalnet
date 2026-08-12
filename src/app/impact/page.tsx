import type { Metadata } from 'next';
import Link from 'next/link';
import StaticPage, { Section } from '@/components/layout/StaticPage';
import { PawIcon, GlobeIcon, ShieldIcon, UsersIcon, BookIcon } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Impact Areas | OpenAnimalNet',
  description: 'How OpenAnimalNet addresses animal welfare, companion animals, coexistence, conservation, and education.',
};

interface Topic {
  topic: string;
  status: 'live' | 'roadmap';
  coverage: string;
  link?: { href: string; label: string };
}

const TOPICS: Topic[] = [
  {
    topic: 'Improving animal welfare and quality of life',
    status: 'live',
    coverage: 'Every species profile tracks health, physiological, and welfare-relevant data categories; the Habitat Degradation Simulator projects how environmental change affects well-being.',
    link: { href: '/animal', label: 'Species profiles' },
  },
  {
    topic: 'Supporting pet owners, caregivers, veterinarians, and animal-service professionals',
    status: 'live',
    coverage: 'The Companion Animal Hub lists shelters with vet-care and foster services, plus phone contacts; species health data supports veterinary reference.',
    link: { href: '/reunite', label: 'Companion Animal Hub' },
  },
  {
    topic: 'Supporting animal behavior, enrichment, training, and human-animal communication',
    status: 'live',
    coverage: 'The behavioral data category covers ethological activity budgets, bioacoustics, and biomechanics — queryable through the AI assistant.',
    link: { href: '/ai', label: 'AI assistant' },
  },
  {
    topic: 'Supporting animal shelters, rescues, and foster programs',
    status: 'live',
    coverage: 'Shelter & rescue directory with foster programs, capacity, services, and accessibility flags.',
    link: { href: '/reunite', label: 'Shelters & rescues' },
  },
  {
    topic: 'Improving animal adoption, matching, outreach, and post-adoption support',
    status: 'live',
    coverage: 'Adoption Match scores adoptable pets against adopter preferences (species, size, energy, kids); shelters carry outreach services.',
    link: { href: '/reunite', label: 'Adoption match' },
  },
  {
    topic: 'Reuniting lost pets with their families and preventing animals from becoming lost',
    status: 'live',
    coverage: 'Lost & Found matches reports by species and distance (≤60 km) and routes them to holding shelters — with a lost-pet report form.',
    link: { href: '/reunite', label: 'Lost & found' },
  },
  {
    topic: 'Monitoring and improving the environments in which animals live',
    status: 'live',
    coverage: 'Habitat data, live GBIF occurrence feeds, migration corridors, and the habitat degradation simulator all surface environmental context.',
    link: { href: '/', label: 'Interactive globe' },
  },
  {
    topic: 'Supporting responsible animal agriculture, husbandry, and aquaculture',
    status: 'live',
    coverage: 'The agricultural & livestock data category (yield, feed, reproduction) is covered, with the domesticated Holstein profile as a reference; welfare telemetry for livestock is on the roadmap.',
    link: { href: '/animal/cow-001', label: 'Holstein profile' },
  },
  {
    topic: 'Advancing humane and sustainable food-system innovation',
    status: 'roadmap',
    coverage: 'Planned: welfare metrics and sustainability indicators for production species, integrated with the monitoring dashboards.',
  },
  {
    topic: 'Monitoring, tracking, conserving, and protecting wildlife',
    status: 'live',
    coverage: 'The core platform: 28 verified species, a 3D globe with migration routes, per-species monitoring, IUCN-assessed conservation statuses, and a conservation overview.',
    link: { href: '/conservation', label: 'Conservation overview' },
  },
  {
    topic: 'Promoting safe and humane coexistence between people and wildlife',
    status: 'live',
    coverage: 'The Human–Wildlife Conflict Predictor scores encounter risk from real corridors, and the Alert Action Center offers ranger dispatch and mitigation workflows.',
    link: { href: '/ai', label: 'Conflict predictor' },
  },
  {
    topic: 'Preventing animal abuse, cruelty, poaching, and wildlife trafficking',
    status: 'live',
    coverage: 'Wildlife-crime alerts (ivory trafficking, snares) carry a Report Wildlife Crime workflow; the human-interaction data category tracks crime and poaching data.',
    link: { href: '/monitor', label: 'Alert center' },
  },
  {
    topic: 'Improving accessibility and support involving service or assistance animals',
    status: 'live',
    coverage: 'A service & assistance animal registry lists training organizations, accessible facilities, and public-access rights — plus accessibility-flagged shelters.',
    link: { href: '/assistance', label: 'Service-animal registry' },
  },
  {
    topic: 'Educating the public about animals, ecosystems, and responsible animal care',
    status: 'live',
    coverage: 'A fully sourced platform: methodology, data-source index, population charts, and an AI assistant that answers questions from the dataset.',
    link: { href: '/methodology', label: 'Methodology' },
  },
];

function StatusBadge({ status }: { status: 'live' | 'roadmap' }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold text-white ${
        status === 'live' ? 'bg-success-500' : 'bg-secondary-400'
      }`}
    >
      {status === 'live' ? 'Live' : 'Roadmap'}
    </span>
  );
}

export default function ImpactPage() {
  const live = TOPICS.filter((t) => t.status === 'live').length;

  return (
    <StaticPage
      icon={<PawIcon className="w-16 h-16 mx-auto text-primary-300" />}
      title="Impact Areas"
      subtitle="How the platform addresses animal welfare, companion animals, coexistence, conservation, and public education — mapped to the program's expected topics."
    >
      <Section>Coverage at a glance</Section>
      <p>
        {live} of {TOPICS.length} expected topics are addressed today; the rest are on the roadmap
        with the data infrastructure already in place.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TOPICS.map((t, i) => (
          <div key={i} className="bg-secondary-50 dark:bg-secondary-800/60 rounded-2xl p-5 border border-secondary-100 dark:border-secondary-700">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-semibold text-secondary-900 dark:text-white leading-snug">{t.topic}</h3>
              <StatusBadge status={t.status} />
            </div>
            <p className="text-sm text-secondary-600 dark:text-secondary-300">{t.coverage}</p>
            {t.link && (
              <Link
                href={t.link.href}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
              >
                <GlobeIcon className="w-4 h-4" /> {t.link.label}
              </Link>
            )}
          </div>
        ))}
      </div>

      <Section>How data supports these outcomes</Section>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-sm">
          <ShieldIcon className="w-8 h-8 text-primary-600 dark:text-primary-400 mb-3" />
          <h3 className="font-bold text-secondary-900 dark:text-white mb-2">Verified, not invented</h3>
          <p className="text-sm text-secondary-600 dark:text-secondary-400">
            Every species is cross-checked against four live sources (Wikidata/IUCN, Wikipedia, GBIF,
            iNaturalist) with a weekly drift check — so advocacy and education rest on current facts.
          </p>
        </div>
        <div className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-sm">
          <UsersIcon className="w-8 h-8 text-primary-600 dark:text-primary-400 mb-3" />
          <h3 className="font-bold text-secondary-900 dark:text-white mb-2">Tools, not just content</h3>
          <p className="text-sm text-secondary-600 dark:text-secondary-400">
            Conflict prediction, habitat simulation, ranger dispatch, lost-pet matching, and adoption
            matching are interactive workflows that decision-makers and families can actually use.
          </p>
        </div>
        <div className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-sm">
          <BookIcon className="w-8 h-8 text-primary-600 dark:text-primary-400 mb-3" />
          <h3 className="font-bold text-secondary-900 dark:text-white mb-2">Open and auditable</h3>
          <p className="text-sm text-secondary-600 dark:text-secondary-400">
            Methodology, source index, and a public API make every claim traceable — see{' '}
            <Link className="text-primary-600 dark:text-primary-400 hover:underline" href="/sources">Data Sources</Link>{' '}
            and <Link className="text-primary-600 dark:text-primary-400 hover:underline" href="/api">the API</Link>.
          </p>
        </div>
      </div>
    </StaticPage>
  );
}
