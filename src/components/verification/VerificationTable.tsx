'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ReportSpecies,
  SourceKey,
  STATUS_META,
  speciesRowStatus,
  formatCheckedAt,
} from '@/lib/verificationReport';

type Filter = 'all' | 'drifted' | 'errors';

const SOURCE_KEYS: SourceKey[] = ['wikidata', 'wikipedia', 'gbif', 'inaturalist'];

export default function VerificationTable({ species }: { species: ReportSpecies[] }) {
  const [filter, setFilter] = useState<Filter>('all');

  const rows = useMemo(() => {
    if (filter === 'all') return species;
    if (filter === 'errors') {
      return species.filter((s) =>
        SOURCE_KEYS.some((k) => s.sources[k]?.status === 'error'),
      );
    }
    return species.filter((s) => speciesRowStatus(s) === 'drifted');
  }, [species, filter]);

  const counts = useMemo(
    () => ({
      all: species.length,
      drifted: species.filter((s) => speciesRowStatus(s) === 'drifted').length,
      errors: species.filter((s) => SOURCE_KEYS.some((k) => s.sources[k]?.status === 'error')).length,
    }),
    [species],
  );

  const sourceVerified = (key: SourceKey) =>
    species.filter((s) => s.sources[key]?.status === 'verified').length;

  const chips: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'All species', count: counts.all },
    { key: 'drifted', label: 'Any drift / error', count: counts.drifted },
    { key: 'errors', label: 'Errors only', count: counts.errors },
  ];

  return (
    <div>
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {chips.map((chip) => (
          <button
            key={chip.key}
            onClick={() => setFilter(chip.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              filter === chip.key
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-white dark:bg-secondary-800 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700'
            }`}
          >
            {chip.label}
            <span className={`ml-1.5 ${filter === chip.key ? 'text-white/70' : 'text-secondary-400'}`}>
              {chip.count}
            </span>
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-secondary-200 dark:border-secondary-700 shadow-sm">
        <table className="w-full text-sm min-w-[860px]">
          <thead className="bg-secondary-100 dark:bg-secondary-800 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold text-secondary-900 dark:text-white">Species</th>
              <th className="px-4 py-3 font-semibold text-secondary-900 dark:text-white">Status</th>
              {SOURCE_KEYS.map((key) => (
                <th key={key} className="px-4 py-3 font-semibold text-secondary-900 dark:text-white">
                  <div className="flex items-center gap-1.5">
                    {key === 'wikidata' ? 'Wikidata/IUCN' : key[0].toUpperCase() + key.slice(1)}
                    <span className="text-[11px] font-normal text-secondary-400 dark:text-secondary-500">
                      {sourceVerified(key)}/{species.length}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800 bg-white dark:bg-secondary-900">
            {rows.map((s) => {
              const rowStatus = speciesRowStatus(s);
              return (
                <tr key={s.animalId} className="hover:bg-secondary-50 dark:hover:bg-secondary-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/animal/${s.animalId}`}
                      className="font-medium text-secondary-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      {s.commonName}
                    </Link>
                    <div className="text-xs text-secondary-400 dark:text-secondary-500 italic">
                      {s.scientificName}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold ${
                        rowStatus === 'clean'
                          ? 'bg-success-100 dark:bg-success-900/40 text-success-700 dark:text-success-300'
                          : 'bg-warning-100 dark:bg-warning-900/40 text-warning-700 dark:text-warning-300'
                      }`}
                    >
                      {rowStatus === 'clean' ? 'Clean' : 'Drifted'}
                    </span>
                  </td>
                  {SOURCE_KEYS.map((key) => {
                    const result = s.sources[key];
                    const meta = STATUS_META[result?.status ?? 'error'];
                    return (
                      <td key={key} className="px-4 py-3">
                        {result ? (
                          <span
                            className="inline-flex items-center gap-1.5"
                            title={`${meta.label} — ${result.detail}\nChecked ${formatCheckedAt(result.checkedAt)}`}
                          >
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${meta.dot}`} />
                            <span className="text-secondary-600 dark:text-secondary-300">
                              {meta.label}
                            </span>
                          </span>
                        ) : (
                          <span className="text-secondary-400">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-secondary-400 dark:text-secondary-500">
                  No species match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-secondary-400 dark:text-secondary-500">
        Hover a status dot for the check detail and its timestamp. Full methodology on the{' '}
        <Link href="/sources" className="text-primary-600 dark:text-primary-400 hover:underline">
          data sources index
        </Link>
        .
      </p>
    </div>
  );
}
