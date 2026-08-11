import type { Metadata } from 'next';
import StaticPage, { Section, PageLink } from '@/components/layout/StaticPage';

export const metadata: Metadata = {
  title: 'API Reference | OpenAnimalNet',
  description: 'The OpenAnimalNet public API — endpoints for species, population, and monitoring data.',
};

const endpoints = [
  {
    method: 'GET',
    path: '/api/v1/animals',
    detail: 'List species with optional category, conservation, and monitoring filters.',
  },
  {
    method: 'GET',
    path: '/api/v1/animals/:id',
    detail: 'Full profile for a single species, including all five data categories.',
  },
  {
    method: 'GET',
    path: '/api/v1/populations',
    detail: 'Population estimates and historical trend series.',
  },
  {
    method: 'GET',
    path: '/api/v1/monitoring/alerts',
    detail: 'Active monitoring alerts, filterable by severity and region.',
  },
  {
    method: 'GET',
    path: '/api/v1/monitoring/stats',
    detail: 'Aggregated monitoring statistics: totals, alerts, coverage, and population trends.',
  },
  {
    method: 'GET',
    path: '/api/v1/locations',
    detail: 'Recent tracking locations for monitored animals.',
  },
];

export default function ApiPage() {
  return (
    <StaticPage
      icon="🔌"
      title="API Reference"
      subtitle="Programmatic access to the OpenAnimalNet datasets. All endpoints return JSON and support standard pagination."
    >
      <Section>Authentication</Section>
      <p>
        Public endpoints are rate-limited but require no key. For higher limits and write
        access, register for an API key via the <PageLink href="/contact">contact page</PageLink>.
      </p>

      <Section>Endpoints</Section>
      <div className="overflow-x-auto rounded-xl border border-secondary-200 dark:border-secondary-700">
        <table className="w-full text-sm">
          <thead className="bg-secondary-100 dark:bg-secondary-800 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold text-secondary-900 dark:text-white">Method</th>
              <th className="px-4 py-3 font-semibold text-secondary-900 dark:text-white">Path</th>
              <th className="px-4 py-3 font-semibold text-secondary-900 dark:text-white">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
            {endpoints.map((endpoint) => (
              <tr key={endpoint.path}>
                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-1 rounded bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300 font-mono text-xs">
                    {endpoint.method}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-primary-600 dark:text-primary-400">{endpoint.path}</td>
                <td className="px-4 py-3 text-secondary-600 dark:text-secondary-400">{endpoint.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Section>Example</Section>
      <p>
        All five endpoints above are live on this deployment under{' '}
        <code className="px-1.5 py-0.5 rounded bg-secondary-100 dark:bg-secondary-800 font-mono text-xs">/api/v1/*</code>:
      </p>
      <pre className="rounded-xl bg-secondary-900 text-secondary-100 p-6 overflow-x-auto text-sm">
{`curl "http://localhost:3100/api/v1/animals?category=mammals&limit=5"`}
      </pre>
      <p className="text-sm text-secondary-500 dark:text-secondary-400">
        The production API is served from <code>https://api.openanimalnet.org/v1/*</code>.
      </p>

      <Section>SDKs</Section>
      <p>
        Official client libraries are maintained for Python and JavaScript. See the{' '}
        <PageLink href="/docs">documentation</PageLink> for installation and usage guides.
      </p>
    </StaticPage>
  );
}
