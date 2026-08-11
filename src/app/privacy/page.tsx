import type { Metadata } from 'next';
import StaticPage, { Section, PageLink } from '@/components/layout/StaticPage';

export const metadata: Metadata = {
  title: 'Privacy Policy | OpenAnimalNet',
  description: 'How OpenAnimalNet handles your data and privacy.',
};

export default function PrivacyPage() {
  return (
    <StaticPage
      icon="🔒"
      title="Privacy Policy"
      subtitle="Last updated: August 2026. Your privacy matters to us."
    >
      <Section>What We Collect</Section>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Usage data</strong> — pages you visit and basic analytics, used to improve the platform.</li>
        <li><strong>Account data</strong> — email and profile details if you create an account or sign up for an API key.</li>
        <li><strong>Submitted content</strong> — observations and data you contribute to the network, published under our open data license.</li>
      </ul>

      <Section>How We Use It</Section>
      <p>
        We use your information to operate the platform, respond to inquiries, and improve our
        services. We never sell personal data to third parties.
      </p>

      <Section>Cookies</Section>
      <p>
        We use minimal cookies for essential functionality and optional analytics. See our{' '}
        <PageLink href="/cookies">cookie policy</PageLink> for details, including how to
        manage your preferences.
      </p>

      <Section>Data Sharing</Section>
      <p>
        Aggregated, de-identified statistics may be shared with research partners. Personally
        identifiable information is never shared without your consent, except where required
        by law.
      </p>

      <Section>Your Rights</Section>
      <p>
        You may request access to, correction of, or deletion of your personal data at any
        time by contacting us via the <PageLink href="/contact">contact page</PageLink>.
      </p>
    </StaticPage>
  );
}
