import type { Metadata } from 'next';
import StaticPage, { Section, PageLink } from '@/components/layout/StaticPage';

export const metadata: Metadata = {
  title: 'Careers | OpenAnimalNet',
  description: 'Join the OpenAnimalNet team — open roles across engineering, science, and operations.',
};

const roles = [
  {
    icon: '🧑‍💻',
    title: 'Senior Software Engineer',
    team: 'Engineering',
    detail: 'Build the platform, visualization tools, and data pipelines that power OpenAnimalNet.',
  },
  {
    icon: '🔬',
    title: 'Data Scientist — Ecology',
    team: 'Science',
    detail: 'Develop models for population trends, migration patterns, and conservation risk.',
  },
  {
    icon: '🛰️',
    title: 'Field Monitoring Coordinator',
    team: 'Operations',
    detail: 'Coordinate tracking deployments and partner sensor networks across regions.',
  },
  {
    icon: '🎨',
    title: 'Product Designer',
    team: 'Design',
    detail: 'Design intuitive interfaces for scientists and the public exploring animal data.',
  },
  {
    icon: '📣',
    title: 'Community & Outreach Lead',
    team: 'Growth',
    detail: 'Grow our community of researchers, citizen scientists, and supporters.',
  },
];

export default function CareersPage() {
  return (
    <StaticPage
      icon="🚀"
      title="Careers at OpenAnimalNet"
      subtitle="Help us build the world's most complete picture of animal life. We're a mission-driven team of engineers, scientists, and designers."
    >
      <p>
        We work openly, care deeply about the mission, and ship things that matter. Interested
        in a role not listed? Send us a note through the <PageLink href="/contact">contact page</PageLink>.
      </p>

      <Section>Open Roles</Section>
      <div className="space-y-4">
        {roles.map((role) => (
          <div
            key={role.title}
            className="rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 hover:shadow-soft transition-shadow"
          >
            <div className="flex items-start space-x-4">
              <div className="text-3xl">{role.icon}</div>
              <div>
                <div className="font-semibold text-secondary-900 dark:text-white">{role.title}</div>
                <div className="text-xs uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-2">{role.team}</div>
                <div className="text-sm text-secondary-600 dark:text-secondary-400">{role.detail}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Section>Why Work Here</Section>
      <ul className="list-disc pl-6 space-y-2">
        <li>Meaningful work with measurable conservation impact.</li>
        <li>Fully remote, flexible, and open-source friendly.</li>
        <li>Annual field visits with our monitoring partners.</li>
      </ul>
    </StaticPage>
  );
}
