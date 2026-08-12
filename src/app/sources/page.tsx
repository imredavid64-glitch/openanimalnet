import type { Metadata } from 'next';
import StaticPage, { Section, PageLink } from '@/components/layout/StaticPage';
import { BookIcon } from '@/components/icons';
import { speciesSources } from '@/data/sample/sources';
import { conservationStatusData } from '@/data/sample/animals';

export const metadata: Metadata = {
  title: 'Data Sources | OpenAnimalNet',
  description: 'Primary sources for every species profile: Wikipedia articles and IUCN Red List assessments.',
};

function statusColor(status: string): string {
  const entry = conservationStatusData.find((s) => s.status === status);
  return entry?.color ?? '#94a3b8';
}

export default function SourcesPage() {
  return (
    <StaticPage
      icon={<BookIcon className="w-16 h-16 mx-auto text-primary-300" />}
      title="Data Sources"
      subtitle="Every figure on this platform traces back to a primary source. This index links each species to its Wikipedia article and its official IUCN Red List assessment."
    >
      <Section>Species Source Index</Section>
      <p>
        Conservation statuses follow the <a className="text-primary-600 dark:text-primary-400 hover:underline" href="https://www.iucnredlist.org" target="_blank" rel="noopener noreferrer">IUCN Red List</a>{' '}
        (assessment IDs verified via Wikidata on 11 August 2026), and population figures come
        from the most recent published censuses and surveys. Species with no IUCN assessment
        (domesticated animals) are marked accordingly.
      </p>

      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-secondary-500 dark:text-secondary-400 border-b border-secondary-200 dark:border-secondary-800">
              <th className="py-3 pr-4 font-semibold">Species</th>
              <th className="py-3 pr-4 font-semibold">Status</th>
              <th className="py-3 pr-4 font-semibold">Population</th>
              <th className="py-3 pr-4 font-semibold">Sources</th>
            </tr>
          </thead>
          <tbody>
            {speciesSources.map((source) => {
              const color = statusColor(source.conservationStatus);
              const wikipediaUrl = `https://en.wikipedia.org/wiki/${source.wikipediaTitle.replace(/ /g, '_')}`;
              const iucnUrl = source.iucnId ? `https://www.iucnredlist.org/species/${source.iucnId}/0` : null;
              const gbifUrl = source.gbifKey ? `https://www.gbif.org/species/${source.gbifKey}` : null;
              const inatUrl = source.inaturalistId ? `https://www.inaturalist.org/taxa/${source.inaturalistId}` : null;
              return (
                <tr key={source.animalId} className="border-b border-secondary-100 dark:border-secondary-800/60 align-top">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/images/animals/${source.animalId}.jpg`}
                        alt=""
                        width={48}
                        height={48}
                        className="rounded-lg object-cover shrink-0"
                        loading="lazy"
                      />
                      <div>
                        <div className="font-semibold text-secondary-900 dark:text-white">{source.commonName}</div>
                        <div className="text-xs italic text-secondary-500 dark:text-secondary-400">{source.scientificName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: color }}
                      title={conservationStatusData.find((s) => s.status === source.conservationStatus)?.name}
                    >
                      {source.conservationStatus}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-secondary-600 dark:text-secondary-300">{source.populationNote}</td>
                  <td className="py-4">
                    <ul className="space-y-1.5">
                      <li>
                        <a className="text-primary-600 dark:text-primary-400 hover:underline" href={wikipediaUrl} target="_blank" rel="noopener noreferrer">
                          Wikipedia article ↗
                        </a>
                      </li>
                      <li>
                        {iucnUrl ? (
                          <a className="text-primary-600 dark:text-primary-400 hover:underline" href={iucnUrl} target="_blank" rel="noopener noreferrer">
                            IUCN assessment ↗
                          </a>
                        ) : (
                          <span className="text-secondary-400 dark:text-secondary-500">No IUCN assessment</span>
                        )}
                      </li>
                      {gbifUrl && (
                        <li>
                          <a className="text-primary-600 dark:text-primary-400 hover:underline" href={gbifUrl} target="_blank" rel="noopener noreferrer">
                            GBIF taxonomy ↗
                          </a>
                        </li>
                      )}
                      {inatUrl && (
                        <li>
                          <a className="text-primary-600 dark:text-primary-400 hover:underline" href={inatUrl} target="_blank" rel="noopener noreferrer">
                            iNaturalist observations ↗
                          </a>
                        </li>
                      )}
                    </ul>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Section>How to Cite</Section>
      <p>
        Every record is cross-checked against four independent sources: Wikipedia for species
        overviews, the IUCN Red List (assessment ID verified via Wikidata property P627) for
        conservation status, GBIF for backbone taxonomy, and iNaturalist for independently
        observed conservation status. Run{' '}
        <code className="text-xs bg-secondary-100 dark:bg-secondary-800 px-1.5 py-0.5 rounded">npm run verify:data</code>{' '}
        to re-verify every species against all four live sources.
      </p>

      <p>
        See our <PageLink href="/methodology">methodology</PageLink> for the full data-collection
        process, or the <PageLink href="/api">API reference</PageLink> to access the dataset
        programmatically.
      </p>
    </StaticPage>
  );
}
