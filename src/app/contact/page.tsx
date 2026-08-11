import type { Metadata } from 'next';
import StaticPage, { Section } from '@/components/layout/StaticPage';

export const metadata: Metadata = {
  title: 'Contact | OpenAnimalNet',
  description: 'Get in touch with the OpenAnimalNet team.',
};

const contacts = [
  {
    icon: '📧',
    label: 'General Inquiries',
    value: 'hello@openanimalnet.org',
  },
  {
    icon: '🔬',
    label: 'Research & Data Partnerships',
    value: 'science@openanimalnet.org',
  },
  {
    icon: '🔌',
    label: 'API & Developer Support',
    value: 'developers@openanimalnet.org',
  },
  {
    icon: '🏢',
    label: 'Office',
    value: 'OpenAnimalNet Foundation, Nairobi · Amsterdam · Remote',
  },
];

export default function ContactPage() {
  return (
    <StaticPage
      icon="📬"
      title="Contact Us"
      subtitle="Questions, data partnerships, press, or feedback — we'd love to hear from you."
    >
      <Section>Email Us</Section>
      <div className="space-y-4">
        {contacts.map((contact) => (
          <div
            key={contact.label}
            className="flex items-start space-x-4 rounded-xl border border-secondary-200 dark:border-secondary-700 p-5"
          >
            <div className="text-2xl">{contact.icon}</div>
            <div>
              <div className="text-sm font-semibold text-secondary-900 dark:text-white">{contact.label}</div>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">{contact.value}</div>
            </div>
          </div>
        ))}
      </div>

      <Section>Response Time</Section>
      <p>
        We typically respond within two business days. For urgent conservation or animal
        welfare matters, include &quot;URGENT&quot; in the subject line.
      </p>

      <Section>Press</Section>
      <p>
        Media inquiries, imagery, and interview requests: press@openanimalnet.org. See our{' '}
        <a href="/about" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">about page</a>{' '}
        for background on the platform.
      </p>
    </StaticPage>
  );
}
