import type { Metadata } from 'next';
import StaticPage, { Section, PageLink } from '@/components/layout/StaticPage';

export const metadata: Metadata = {
  title: 'Terms of Service | OpenAnimalNet',
  description: 'The terms governing use of the OpenAnimalNet platform.',
};

export default function TermsPage() {
  return (
    <StaticPage
      icon="📜"
      title="Terms of Service"
      subtitle="Last updated: August 2026. Please read these terms carefully."
    >
      <Section>Acceptance of Terms</Section>
      <p>
        By accessing or using OpenAnimalNet, you agree to these terms. If you do not agree,
        please do not use the platform.
      </p>

      <Section>Use of the Platform</Section>
      <ul className="list-disc pl-6 space-y-2">
        <li>You may browse and explore the platform freely for personal, educational, or research purposes.</li>
        <li>You may use the <PageLink href="/api">API</PageLink> subject to fair-use rate limits.</li>
        <li>You may not scrape, resell, or misrepresent the data without attribution.</li>
        <li>You may not use the platform for unlawful purposes or to harm wildlife or people.</li>
      </ul>

      <Section>Data License</Section>
      <p>
        Published datasets are made available under open licenses. Species profiles and
        monitoring data are provided for informational purposes and are not a substitute for
        professional conservation advice.
      </p>

      <Section>No Warranty</Section>
      <p>
        The platform is provided &quot;as is&quot; without warranties of any kind. While we
        validate data rigorously, we cannot guarantee its absolute accuracy or completeness.
      </p>

      <Section>Limitation of Liability</Section>
      <p>
        OpenAnimalNet is not liable for any damages arising from use of the platform or
        reliance on its data, to the maximum extent permitted by law.
      </p>

      <Section>Contact</Section>
      <p>
        Questions about these terms? Reach us via the <PageLink href="/contact">contact page</PageLink>.
      </p>
    </StaticPage>
  );
}
