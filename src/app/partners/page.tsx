import type { Metadata } from 'next';
import StaticPage, { Section, PageLink } from '@/components/layout/StaticPage';

export const metadata: Metadata = {
  title: 'Partners | OpenAnimalNet',
  description: 'The organizations that make OpenAnimalNet possible.',
};

const partners = [
  {
    icon: '🦁',
    name: 'Global Conservation Alliance',
    focus: 'Funding and coordinating large-scale monitoring programs across Africa and Asia.',
  },
  {
    icon: '🐋',
    name: 'Ocean Life Institute',
    focus: 'Marine tracking data from whale, shark, and sea turtle research programs.',
  },
  {
    icon: '🦅',
    name: 'Avian Research Network',
    focus: 'Migratory bird banding and telemetry datasets from 40+ countries.',
  },
  {
    icon: '🌿',
    name: 'Wildlife Trust Foundation',
    focus: 'Habitat and ecological field data from protected areas worldwide.',
  },
  {
    icon: '🎓',
    name: 'University of Natural Sciences',
    focus: 'Academic research partnerships and student citizen-science programs.',
  },
  {
    icon: '📡',
    name: 'GeoWild Tracking Consortium',
    focus: 'Satellite collar hardware and telemetry infrastructure.',
  },
];

export default function PartnersPage() {
  return (
    <StaticPage
      icon="🤝"
      title="Our Partners"
      subtitle="OpenAnimalNet is built with the support of research institutions, conservation organizations, and technology partners around the world."
    >
      <p>
        Our partners contribute data, expertise, and infrastructure. If your organization
        works in wildlife research or conservation, we&apos;d love to hear from you —{' '}
        <PageLink href="/contact">get in touch</PageLink>.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {partners.map((partner) => (
          <div
            key={partner.name}
            className="rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 hover:shadow-soft transition-shadow"
          >
            <div className="text-3xl mb-3">{partner.icon}</div>
            <div className="font-semibold text-secondary-900 dark:text-white mb-1">{partner.name}</div>
            <div className="text-sm text-secondary-600 dark:text-secondary-400">{partner.focus}</div>
          </div>
        ))}
      </div>

      <Section>Become a Partner</Section>
      <p>
        Partner organizations can contribute datasets, join our science board, or sponsor
        monitoring hardware. See our <PageLink href="/careers">careers page</PageLink> for
        open roles, or reach out through the <PageLink href="/contact">contact page</PageLink>.
      </p>
    </StaticPage>
  );
}
