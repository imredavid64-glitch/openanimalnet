import type { Metadata } from 'next';
import Link from 'next/link';
import report from '@/data/verification-report.json';
import {
  VerificationReport,
  SourceKey,
  STATUS_META,
  reportAgeDays,
  REPORT_MAX_AGE_DAYS,
  formatCheckedAt,
} from '@/lib/verificationReport';
import VerificationTable from '@/components/verification/VerificationTable';
import { ShieldIcon, CheckIcon } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Data Quality | OpenAnimalNet',
  description:
    'Live verification status for every species across Wikidata/IUCN, Wikipedia, GBIF, and iNaturalist — last checked and drift status.',
};

const data = report as VerificationReport;
const SOURCE_KEYS: SourceKey[] = data.sourceOrder ?? ['wikidata', 'wikipedia', 'gbif', 'inaturalist'];
const SOURCE_LABELS = data.sourceLabels ?? {
  wikidata: 'Wikidata/IUCN',
  wikipedia: 'Wikipedia',
  gbif: 'GBIF',
  inaturalist: 'iNaturalist',
};

export default function DataQualityPage() {
  const { totals } = data;
  const ageDays = reportAgeDays(data.generatedAt);
  const isStale = ageDays > REPORT_MAX_AGE_DAYS;
  const hasDrift = totals.drifted > 0;

  const sourceStats = SOURCE_KEYS.map((key) => {
    const verified = data.species.filter((s) => s.sources[key]?.status === 'verified').length;
    const drifted = data.species.filter(
      (s) => s.sources[key]?.status === 'drifted' || s.sources[key]?.status === 'error',
    ).length;
    return { key, verified, drifted, total: data.species.length };
  });

  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-secondary-950">
      {/* Hero band */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-900 text-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
            <ShieldIcon className="w-8 h-8 text-primary-300" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Data Quality</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            Every species is cross-checked against four independent live sources — Wikidata/IUCN,
            Wikipedia, GBIF, and iNaturalist. This page shows the latest verification run, when it
            happened, and whether anything has drifted.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        {/* Freshness banner */}
        <div
          className={`rounded-2xl border-2 p-5 mb-8 ${
            hasDrift
              ? 'border-danger-300 dark:border-danger-700 bg-danger-50 dark:bg-danger-900/20'
              : isStale
                ? 'border-warning-300 dark:border-warning-700 bg-warning-50 dark:bg-warning-900/20'
                : 'border-success-300 dark:border-success-700 bg-success-50 dark:bg-success-900/20'
          }`}
        >
          <div className="flex items-start gap-3">
            <CheckIcon
              className={`w-6 h-6 shrink-0 mt-0.5 ${
                hasDrift
                  ? 'text-danger-600 dark:text-danger-400'
                  : isStale
                    ? 'text-warning-600 dark:text-warning-400'
                    : 'text-success-600 dark:text-success-400'
              }`}
            />
            <div>
              <div className="font-semibold text-secondary-900 dark:text-white">
                {hasDrift
                  ? `${totals.drifted} species drifted on the last check`
                  : isStale
                    ? 'Report is stale — the weekly check is overdue'
                    : `All ${totals.fullyVerified}/${totals.species} species verified`}
              </div>
              <p className="text-sm text-secondary-600 dark:text-secondary-300 mt-1">
                Last verified {formatCheckedAt(data.generatedAt)} ({ageDays} day
                {ageDays === 1 ? '' : 's'} ago) · {totals.checks} individual checks across{' '}
                {SOURCE_KEYS.length} sources. Verification runs weekly in CI (and on demand via{' '}
                <code className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-xs">
                  npm run verify:data
                </code>
                ).
              </p>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Species checked', value: totals.species, hint: 'every tracked profile' },
            { label: 'Fully verified', value: `${totals.fullyVerified}/${totals.species}`, hint: 'all sources agree', color: '#22c55e' },
            { label: 'Drifted', value: totals.drifted, hint: 'need attention', color: totals.drifted > 0 ? '#f59e0b' : '#22c55e' },
            { label: 'Checks run', value: totals.checks, hint: 'across 4 live sources' },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-secondary-200 dark:border-secondary-800 bg-white dark:bg-secondary-900 p-5"
            >
              <div className="text-xs text-secondary-500 dark:text-secondary-400">{card.label}</div>
              <div
                className="text-3xl font-bold text-secondary-900 dark:text-white font-data mt-1"
                style={card.color ? { color: card.color } : undefined}
              >
                {card.value}
              </div>
              <div className="text-xs text-secondary-400 dark:text-secondary-500 mt-1">{card.hint}</div>
            </div>
          ))}
        </div>

        {/* Per-source summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {sourceStats.map((stat) => {
            const meta = STATUS_META[stat.drifted > 0 ? 'drifted' : 'verified'];
            return (
              <div
                key={stat.key}
                className="rounded-2xl border border-secondary-200 dark:border-secondary-800 bg-white dark:bg-secondary-900 p-5"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-secondary-900 dark:text-white text-sm">
                    {SOURCE_LABELS[stat.key]}
                  </div>
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${meta.dot}`} />
                </div>
                <div className="text-2xl font-bold font-data text-secondary-900 dark:text-white">
                  {stat.verified}/{stat.total}
                </div>
                <div className="text-xs text-secondary-400 dark:text-secondary-500 mt-1">
                  {stat.drifted > 0
                    ? `${stat.drifted} drifted / error`
                    : 'all checks pass'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Verification matrix */}
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">Per-species breakdown</h2>
        <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-4">
          Status dots per source — hover for the check detail and timestamp. Species with no IUCN
          assessment (or no iNaturalist status signal) show <strong>N/A</strong>, which is expected
          rather than a drift.
        </p>
        <VerificationTable species={data.species} />

        {/* How it works */}
        <div className="mt-12 rounded-2xl border border-secondary-200 dark:border-secondary-800 bg-white dark:bg-secondary-900 p-6">
          <h3 className="font-bold text-secondary-900 dark:text-white mb-2">How this works</h3>
          <ul className="text-sm text-secondary-600 dark:text-secondary-300 space-y-2 list-disc pl-5">
            <li>
              <strong>Wikidata/IUCN</strong> — the assessment ID (P627) and conservation status
              (P141) are compared against the recorded registry.
            </li>
            <li>
              <strong>Wikipedia</strong> — the linked article must still exist.
            </li>
            <li>
              <strong>GBIF</strong> — the scientific name must match the backbone taxonomy
              (ACCEPTED, rank species/subspecies); synonyms resolve to their accepted record.
            </li>
            <li>
              <strong>iNaturalist</strong> — the IUCN-authority conservation status must agree with
              the recorded status when one is available.
            </li>
            <li>
              The report is regenerated weekly by the{' '}
              <Link
                href="https://github.com/imredavid64-glitch/openanimalnet/actions/workflows/data-drift.yml"
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                data-drift workflow
              </Link>{' '}
              and fails loudly if anything drifts. See the{' '}
              <Link href="/sources" className="text-primary-600 dark:text-primary-400 hover:underline">
                data sources index
              </Link>{' '}
              for per-species source links.
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
