'use client';

import Link from 'next/link';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { sampleAnimals, conservationStatusData } from '@/data/sample/animals';
import { speciesSources } from '@/data/sample/sources';
import { ConservationStatus } from '@/types/animal/types';
import StaticPage, { Section } from '@/components/layout/StaticPage';

// Status order, most severe first — only statuses present in the dataset.
const STATUS_ORDER: ConservationStatus[] = ['CR', 'EN', 'VU', 'NT', 'LC', 'DD', 'NE'];

const statusMeta = (status: string) =>
  conservationStatusData.find((s) => s.status === status) ?? {
    status,
    name: status,
    color: '#94a3b8',
    count: 0,
  };

// Trend from the species' populationHistory series: first vs last estimate.
type Trend = 'up' | 'down' | 'stable' | null;
function computeTrend(history?: { year: number; estimate: number }[]): Trend {
  if (!history || history.length < 2) return null;
  const first = history[0].estimate;
  const last = history[history.length - 1].estimate;
  if (last < first * 0.9) return 'down';
  if (last > first * 1.1) return 'up';
  return 'stable';
}

const TREND_META: Record<Exclude<Trend, null>, { label: string; icon: string; color: string }> = {
  down: { label: 'declining', icon: '↓', color: '#dc2626' },
  up: { label: 'recovering', icon: '↑', color: '#22c55e' },
  stable: { label: 'stable', icon: '→', color: '#94a3b8' },
};

/** Mini line chart of the census series, backing the trend arrow. */
function Sparkline({ history, color }: { history: { year: number; estimate: number }[]; color: string }) {
  return (
    <div className="h-12 mt-1 -mx-1 pointer-events-none">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={history} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <Line type="monotone" dataKey="estimate" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ConservationPage() {
  const sources = speciesSources.reduce<Record<string, (typeof speciesSources)[number]>>(
    (acc, s) => {
      acc[s.animalId] = s;
      return acc;
    },
    {},
  );

  const byStatus = STATUS_ORDER.map((status) => ({
    status,
    species: sampleAnimals
      .filter((a) => a.conservationStatus === status)
      .map((a) => ({
        animal: a,
        source: sources[a.id],
        trend: computeTrend(a.populationHistory),
      })),
  })).filter((g) => g.species.length > 0);

  // Species most at risk: CR/EN status with a declining population trend.
  const mostAtRisk = byStatus
    .filter((g) => g.status === 'CR' || g.status === 'EN')
    .flatMap((g) => g.species)
    .filter((s) => s.trend === 'down');

  const chartData = byStatus.map((g) => ({
    name: g.status,
    fullName: statusMeta(g.status).name,
    count: g.species.length,
    color: statusMeta(g.status).color,
  }));

  const total = sampleAnimals.length;
  const threatened = chartData
    .filter((d) => d.name === 'CR' || d.name === 'EN')
    .reduce((sum, d) => sum + d.count, 0);
  const vulnerable = chartData.find((d) => d.name === 'VU')?.count ?? 0;
  const assessed = chartData
    .filter((d) => d.name !== 'NE')
    .reduce((sum, d) => sum + d.count, 0);

  return (
    <StaticPage
      icon="🛡️"
      title="Conservation Overview"
      subtitle="Every species in the OpenAnimalNet sample dataset grouped by its official IUCN Red List status — from Critically Endangered to Least Concern."
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Species in dataset', value: total, hint: `${total} tracked profiles` },
          { label: 'Critically Endangered + Endangered', value: threatened, hint: 'at immediate risk', color: '#dc2626' },
          { label: 'Vulnerable', value: vulnerable, hint: 'facing extinction risk', color: '#f59e0b' },
          { label: 'IUCN-assessed', value: assessed, hint: `of ${total} (rest are Not Evaluated)`, color: '#22c55e' },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-secondary-200 dark:border-secondary-800 bg-white dark:bg-secondary-900 p-4">
            <div className="text-xs text-secondary-500 dark:text-secondary-400">{card.label}</div>
            <div className="text-3xl font-bold text-secondary-900 dark:text-white" style={card.color ? { color: card.color } : undefined}>
              {card.value}
            </div>
            <div className="text-xs text-secondary-400 dark:text-secondary-500 mt-1">{card.hint}</div>
          </div>
        ))}
      </div>

      {mostAtRisk.length > 0 && (
        <div className="mt-6 rounded-2xl border-2 border-danger-300 dark:border-danger-700 bg-danger-50 dark:bg-danger-900/20 p-5">
          <h3 className="font-bold text-danger-700 dark:text-danger-300 flex items-center gap-2">
            🚨 Most at Risk
          </h3>
          <p className="text-sm text-secondary-600 dark:text-secondary-300 mt-1 mb-3">
            {mostAtRisk.length} species are Critically Endangered or Endangered <em>and</em> show a
            declining population trend in their census series — the ones to watch closest.
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {mostAtRisk.map(({ animal, source }) => (
              <li key={animal.id}>
                <Link
                  href={`/animal/${animal.id}`}
                  className="flex items-center gap-3 rounded-xl bg-white dark:bg-secondary-800 px-3 py-2 border border-danger-200 dark:border-danger-800 hover:shadow-md transition-shadow"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/images/animals/${animal.id}.jpg`}
                    alt=""
                    width={40}
                    height={40}
                    className="rounded-lg object-cover shrink-0"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-secondary-900 dark:text-white text-sm truncate">{animal.commonName}</div>
                    <div className="text-xs text-secondary-500 dark:text-secondary-400 truncate">
                      {animal.conservationStatus} · {source?.populationNote ?? 'declining'}
                    </div>
                  </div>
                  <span className="ml-auto text-danger-500 dark:text-danger-400 font-bold shrink-0">↓</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Section>Dataset Distribution by Status</Section>
      <p>
        Counts below reflect the species currently in this sample dataset ({total} profiles). The
        IUCN assesses roughly 160,000 species globally; the status <em>names</em> and colors follow
        the Red List, but these figures are our own sample — see the{' '}
        <Link href="/sources" className="text-primary-600 dark:text-primary-400 hover:underline">
          data sources index
        </Link>{' '}
        for each species&apos;s official assessment.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-secondary-200 dark:border-secondary-800 bg-white dark:bg-secondary-900 p-4 h-72">
          <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-200 mb-2">Species per status</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.2} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis type="category" dataKey="name" width={36} tick={{ fontSize: 12, fontWeight: 600 }} stroke="#94a3b8" />
              <Tooltip
                formatter={(value: number) => [value, 'species']}
                contentStyle={{ borderRadius: 12, border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: 12 }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} label={{ position: 'right', fontSize: 12, fill: '#94a3b8' }}>
                {chartData.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl border border-secondary-200 dark:border-secondary-800 bg-white dark:bg-secondary-900 p-4 h-72">
          <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-200 mb-2">Status share</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} dataKey="count" nameKey="fullName" innerRadius="55%" outerRadius="85%" paddingAngle={2}>
                {chartData.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
            {chartData.map((d) => (
              <span key={d.name} className="inline-flex items-center gap-1.5 text-xs text-secondary-600 dark:text-secondary-300">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {byStatus.map((group) => {
        const meta = statusMeta(group.status);
        return (
          <div key={group.status}>
            <Section>
              <span
                className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold text-white mr-2"
                style={{ backgroundColor: meta.color }}
              >
                {group.status}
              </span>
              {meta.name}
              <span className="ml-2 text-sm font-normal text-secondary-500 dark:text-secondary-400">
                {group.species.length} species in dataset
              </span>
            </Section>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {group.species.map(({ animal, source, trend }) => (
                <Link
                  key={animal.id}
                  href={`/animal/${animal.id}`}
                  className="group rounded-2xl border border-secondary-200 dark:border-secondary-800 bg-white dark:bg-secondary-900 overflow-hidden hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 transition-all"
                >
                  <div className="flex items-center gap-4 p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/images/animals/${animal.id}.jpg`}
                      alt={animal.commonName}
                      width={72}
                      height={72}
                      className="rounded-xl object-cover shrink-0 w-18 h-18"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 truncate">
                        {animal.commonName}
                      </div>
                      <div className="text-xs italic text-secondary-500 dark:text-secondary-400 truncate">{animal.scientificName}</div>
                      <div className="text-xs text-secondary-600 dark:text-secondary-300 mt-1 line-clamp-2">
                        {source?.populationNote ?? (animal.populationEstimate ? `~${animal.populationEstimate.toLocaleString()} estimated` : 'Population figure pending review')}
                      </div>
                      {trend && (
                        <div className="text-xs font-semibold mt-1">
                          <span className="inline-flex items-center gap-1" style={{ color: TREND_META[trend].color }}>
                            {TREND_META[trend].icon} {TREND_META[trend].label}
                          </span>
                        </div>
                      )}
                      {animal.populationHistory && animal.populationHistory.length >= 2 && (
                        <Sparkline history={animal.populationHistory} color={TREND_META[trend ?? 'stable'].color} />
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}

      <Section>About the Classifications</Section>
      <p>
        Statuses are drawn from the IUCN Red List and re-verified against Wikidata (property P141)
        on every data refresh — run{' '}
        <code className="text-xs bg-secondary-100 dark:bg-secondary-800 px-1.5 py-0.5 rounded">npm run refresh:data</code>{' '}
        to re-check them. Species marked <strong>NE</strong> (Not Evaluated) have no IUCN
        assessment — typically domesticated breeds such as Holstein cattle. See the{' '}
        <Link href="/methodology" className="text-primary-600 dark:text-primary-400 hover:underline">
          methodology
        </Link>{' '}
        for how figures are collected and kept current.
      </p>
    </StaticPage>
  );
}
