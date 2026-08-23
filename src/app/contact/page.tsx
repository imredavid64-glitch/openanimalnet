import type { Metadata } from 'next';
import StaticPage, { Section } from '@/components/layout/StaticPage';

export const metadata: Metadata = {
  title: 'Contact | OpenAnimalNet',
  description: 'Get in touch with the OpenAnimalNet team.',
};

const channels = [
  {
    icon: '🐛',
    label: 'Bug Reports & Feature Requests',
    value: 'GitHub Issues — github.com/imredavid64-glitch/openanimalnet/issues',
    href: 'https://github.com/imredavid64-glitch/openanimalnet/issues',
  },
  {
    icon: '🔌',
    label: 'API & Developer Support',
    value: 'Open a GitHub issue with the "api" label, or read the API docs',
    href: '/docs',
  },
  {
    icon: '🔬',
    label: 'Research & Data Corrections',
    value: 'Spotted inaccurate data? Open an issue labeled "data-correction"',
    href: 'https://github.com/imredavid64-glitch/openanimalnet/issues',
  },
];

export default function ContactPage() {
  return (
    <StaticPage
      icon="📬"
      title="Contact Us"
      subtitle="Questions, data corrections, or feedback — here's how to reach us."
    >
      <Section>Get in Touch</Section>
      <div className="space-y-4">
        {channels.map((channel) => (
          <a
            key={channel.label}
            href={channel.href}
            target={channel.href.startsWith('http') ? '_blank' : undefined}
            rel={channel.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="flex items-start space-x-4 rounded-xl border border-secondary-200 dark:border-secondary-700 p-5 hover:border-primary-400 dark:hover:border-primary-500 transition-colors"
          >
            <div className="text-2xl">{channel.icon}</div>
            <div>
              <div className="text-sm font-semibold text-secondary-900 dark:text-white">{channel.label}</div>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">{channel.value}</div>
            </div>
          </a>
        ))}
      </div>

      <Section>About Responses</Section>
      <p>
        OpenAnimalNet is an open-source project maintained by volunteers. There is no
        dedicated support desk — issues on GitHub are the fastest way to get an answer,
        and data corrections are reviewed alongside the weekly source-verification runs.
      </p>

      <Section>Press</Section>
      <p>
        OpenAnimalNet is free to cover — see the{' '}
        <a href="/about" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">about page</a>{' '}
        for background, or open a GitHub issue labeled &quot;press&quot; with specific questions.
      </p>
    </StaticPage>
  );
}
