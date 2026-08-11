import type { Metadata } from 'next';
import StaticPage, { Section, PageLink } from '@/components/layout/StaticPage';

export const metadata: Metadata = {
  title: 'Cookie Policy | OpenAnimalNet',
  description: 'How OpenAnimalNet uses cookies and how you can control them.',
};

const cookieTypes = [
  {
    name: 'Essential',
    detail: 'Required for core functionality such as navigation and secure access. Cannot be disabled.',
  },
  {
    name: 'Analytics',
    detail: 'Help us understand how the platform is used so we can improve it. Optional.',
  },
  {
    name: 'Preferences',
    detail: 'Remember your settings, such as theme and language. Optional.',
  },
];

export default function CookiesPage() {
  return (
    <StaticPage
      icon="🍪"
      title="Cookie Policy"
      subtitle="Last updated: August 2026. A simple, honest explanation of how we use cookies."
    >
      <Section>What Are Cookies?</Section>
      <p>
        Cookies are small text files stored on your device that help websites remember
        information between visits.
      </p>

      <Section>Cookies We Use</Section>
      <div className="space-y-4">
        {cookieTypes.map((cookie) => (
          <div
            key={cookie.name}
            className="rounded-xl border border-secondary-200 dark:border-secondary-700 p-5"
          >
            <div className="font-semibold text-secondary-900 dark:text-white mb-1">{cookie.name}</div>
            <div className="text-sm text-secondary-600 dark:text-secondary-400">{cookie.detail}</div>
          </div>
        ))}
      </div>

      <Section>Managing Cookies</Section>
      <p>
        You can control cookies through your browser settings — most browsers let you block
        or delete cookies site by site. Disabling essential cookies may affect how the
        platform works.
      </p>

      <Section>More Information</Section>
      <p>
        See our <PageLink href="/privacy">privacy policy</PageLink> for details on how we
        handle your data, or <PageLink href="/contact">contact us</PageLink> with questions.
      </p>
    </StaticPage>
  );
}
