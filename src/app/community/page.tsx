import type { Metadata } from 'next';
import StaticPage, { Section, PageLink } from '@/components/layout/StaticPage';

export const metadata: Metadata = {
  title: 'Community | OpenAnimalNet',
  description: 'Join the OpenAnimalNet community of researchers, citizen scientists, and animal lovers.',
};

const channels = [
  {
    icon: '💬',
    name: 'Discord',
    detail: 'Real-time discussion with the team and community — data questions, project help, and research chat.',
  },
  {
    icon: '🐦',
    name: 'Twitter / X',
    detail: 'Announcements, new dataset releases, and conservation news.',
  },
  {
    icon: '💻',
    name: 'GitHub',
    detail: 'Open-source code, issue tracker, and contribution guides.',
  },
  {
    icon: '🧑‍🤝‍🧑',
    name: 'Forum',
    detail: 'Long-form discussions, field reports, and data validation threads.',
  },
];

export default function CommunityPage() {
  return (
    <StaticPage
      icon="🧑‍🤝‍🧑"
      title="Community"
      subtitle="OpenAnimalNet is built by and for a global community of researchers, citizen scientists, and wildlife enthusiasts."
    >
      <Section>Ways to Get Involved</Section>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Contribute observations</strong> — submit field sightings and camera-trap captures to the network.</li>
        <li><strong>Review data</strong> — help validate incoming records through our review queue.</li>
        <li><strong>Build tools</strong> — use the <PageLink href="/api">API</PageLink> and open-source code to create your own visualizations.</li>
        <li><strong>Spread the word</strong> — share profiles with your school, club, or local conservation group.</li>
      </ul>

      <Section>Join the Conversation</Section>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {channels.map((channel) => (
          <div
            key={channel.name}
            className="rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 hover:shadow-soft transition-shadow"
          >
            <div className="text-3xl mb-3">{channel.icon}</div>
            <div className="font-semibold text-secondary-900 dark:text-white mb-1">{channel.name}</div>
            <div className="text-sm text-secondary-600 dark:text-secondary-400">{channel.detail}</div>
          </div>
        ))}
      </div>

      <Section>Code of Conduct</Section>
      <p>
        We welcome everyone. All community spaces follow our code of conduct — be respectful,
        be scientific, and protect the wildlife we study. Questions about the community can go
        to the <PageLink href="/contact">contact page</PageLink>.
      </p>
    </StaticPage>
  );
}
