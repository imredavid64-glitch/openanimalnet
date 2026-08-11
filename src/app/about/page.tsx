import type { Metadata } from 'next';
import StaticPage, { Section, PageLink } from '@/components/layout/StaticPage';

export const metadata: Metadata = {
  title: 'About Us | OpenAnimalNet',
  description: 'Learn about OpenAnimalNet, the global platform for monitoring and exploring animal data.',
};

export default function AboutPage() {
  return (
    <StaticPage
      icon="🐾"
      title="About OpenAnimalNet"
      subtitle="A global platform for monitoring, analyzing, and exploring comprehensive animal data — built for researchers, conservationists, and animal lovers."
    >
      <p>
        OpenAnimalNet is an open data platform that brings together biological, behavioral,
        ecological, and conservation information about the world&apos;s species. We aggregate
        data from field researchers, tracking networks, citizen science programs, and partner
        institutions to create the most complete picture of animal life on Earth.
      </p>

      <Section>Our Mission</Section>
      <p>
        Our mission is to make animal data accessible to everyone. By combining real-time
        monitoring with powerful visualization tools, we help scientists identify threats,
        conservationists prioritize action, and the public connect with the natural world.
      </p>

      <Section>What We Do</Section>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Monitor</strong> — track animal populations and movements through a global sensor and reporting network.</li>
        <li><strong>Analyze</strong> — apply statistical and AI-powered analysis to surface trends, anomalies, and conservation insights.</li>
        <li><strong>Explore</strong> — offer interactive maps, dashboards, and species profiles to anyone curious about wildlife.</li>
        <li><strong>Share</strong> — publish open datasets and an API so other projects can build on our work.</li>
      </ul>

      <Section>Our Principles</Section>
      <p>
        Everything we build is open, transparent, and science-first. We publish our{' '}
        <PageLink href="/methodology">methodology</PageLink>, partner with leading
        conservation organizations, and keep our data licensed for public use.
      </p>

      <Section>Get Involved</Section>
      <p>
        Explore the <PageLink href="/animal">animal database</PageLink>, dig into the{' '}
        <PageLink href="/dashboard">dashboard</PageLink>, or read the{' '}
        <PageLink href="/docs">documentation</PageLink> to learn how you can contribute.
      </p>
    </StaticPage>
  );
}
