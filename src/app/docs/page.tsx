import type { Metadata } from 'next';
import StaticPage, { Section, PageLink } from '@/components/layout/StaticPage';

export const metadata: Metadata = {
  title: 'Documentation | OpenAnimalNet',
  description: 'Guides for exploring, contributing to, and building on OpenAnimalNet.',
};

const guides = [
  {
    icon: '🗺️',
    title: 'Exploring the Platform',
    detail: 'Tour the interactive globe, dashboards, and species profiles.',
    link: '/dashboard',
  },
  {
    icon: '📥',
    title: 'Contributing Data',
    detail: 'How to submit field observations and tracking data to the network.',
    link: '/methodology',
  },
  {
    icon: '🔌',
    title: 'API Quickstart',
    detail: 'Authenticate and pull species, population, and monitoring datasets.',
    link: '/api',
  },
  {
    icon: '📊',
    title: 'Understanding the Data Model',
    detail: 'The five data categories and how records are structured.',
    link: '/data',
  },
  {
    icon: '🛰️',
    title: 'Monitoring Coverage',
    detail: 'Where our tracking network operates and how to interpret coverage.',
    link: '/monitor/coverage',
  },
  {
    icon: '🧠',
    title: 'AI Analysis',
    detail: 'Using the AI assistant for population and behavior insights.',
    link: '/ai',
  },
];

export default function DocsPage() {
  return (
    <StaticPage
      icon="📚"
      title="Documentation"
      subtitle="Everything you need to explore, contribute to, and build on OpenAnimalNet."
    >
      <Section>Getting Started</Section>
      <p>
        New to OpenAnimalNet? Start by exploring the <PageLink href="/animal">animal database</PageLink>,
        then dive into the <PageLink href="/dashboard">dashboard</PageLink> for global
        statistics and trends.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map((guide) => (
          <a
            key={guide.title}
            href={guide.link}
            className="rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 hover:shadow-soft hover:border-primary-400 dark:hover:border-primary-600 transition-all group"
          >
            <div className="text-3xl mb-3">{guide.icon}</div>
            <div className="font-semibold text-secondary-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {guide.title}
            </div>
            <div className="text-sm text-secondary-600 dark:text-secondary-400">{guide.detail}</div>
          </a>
        ))}
      </div>

      <Section>Support</Section>
      <p>
        Questions? Check the <PageLink href="/community">community</PageLink> or reach us via
        the <PageLink href="/contact">contact page</PageLink>.
      </p>
    </StaticPage>
  );
}
