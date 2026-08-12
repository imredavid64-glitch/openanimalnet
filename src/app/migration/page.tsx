import Link from 'next/link';
import type { Metadata } from 'next';
import StaticPage, { Section } from '@/components/layout/StaticPage';
import { sampleAnimals } from '@/data/sample/animals';
import { MigrationRoute } from '@/types/animal/types';
import { routeDistanceKm, formatKm, formatDurationDays } from '@/lib/geo';
import { CalendarIcon } from '@/components/icons';
import ExportButton, { ExportRow } from './ExportButton';
import ExportIcs from './ExportIcs';

// Calendar season: the four seasons plus year-round. Migration legs are
// spring/fall/year-round; summer/winter cells come from year-round corridors.
type CalendarSeason = 'spring' | 'summer' | 'fall' | 'winter' | 'year-round';

export const metadata: Metadata = {
  title: 'Migration Calendar | OpenAnimalNet',
  description: 'When do the world\'s great animal migrations happen? A month-by-month calendar of every tracked migration corridor.',
};

const MONTHS = [
  { key: 1, label: 'Jan' },
  { key: 2, label: 'Feb' },
  { key: 3, label: 'Mar' },
  { key: 4, label: 'Apr' },
  { key: 5, label: 'May' },
  { key: 6, label: 'Jun' },
  { key: 7, label: 'Jul' },
  { key: 8, label: 'Aug' },
  { key: 9, label: 'Sep' },
  { key: 10, label: 'Oct' },
  { key: 11, label: 'Nov' },
  { key: 12, label: 'Dec' },
];

// Season → calendar months, used only as a fallback when a corridor has no
// recorded start/end month.
const SEASON_FALLBACK_MONTHS: Record<CalendarSeason, number[]> = {
  spring: [3, 4, 5],
  summer: [6, 7, 8],
  fall: [9, 10, 11],
  winter: [12, 1, 2],
  'year-round': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
};

const SEASON_COLOR: Record<CalendarSeason, string> = {
  spring: '#22c55e',
  summer: '#38bdf8',
  fall: '#f59e0b',
  winter: '#818cf8',
  'year-round': '#94a3b8',
};

// The months a corridor is on the move, from its recorded start/end month
// (inclusive, wrapping through December for winter legs). Falls back to the
// season's months when timing isn't recorded.
const monthsOfRoute = (route: MigrationRoute): number[] => {
  const season = (route.season ?? 'year-round') as CalendarSeason;
  if (route.startMonth && route.endMonth) {
    const out: number[] = [];
    if (route.startMonth <= route.endMonth) {
      for (let m = route.startMonth; m <= route.endMonth; m++) out.push(m);
    } else {
      for (let m = route.startMonth; m <= 12; m++) out.push(m);
      for (let m = 1; m <= route.endMonth; m++) out.push(m);
    }
    return out;
  }
  return SEASON_FALLBACK_MONTHS[season];
};

// Deep-link season for a calendar month: clicking a month card opens the
// globe pre-filtered to that season (spring Mar–May, summer Jun–Aug,
// fall Sep–Nov, winter Dec–Feb).
const seasonOfMonth = (month: number): CalendarSeason => {
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter';
};

// The species that actually migrate, in the order they appear in the dataset.
const migrators = sampleAnimals
  .map((animal) => ({ animal, routes: animal.migrationRoutes ?? [] }))
  .filter((x) => x.routes.length > 0);

// How many corridors are active in each calendar month (across all species).
const activeByMonth = (month: number): number =>
  migrators.reduce((total, x) => {
    total += x.routes.filter((r) => monthsOfRoute(r).includes(month)).length;
    return total;
  }, 0);

const currentMonth = new Date().getMonth() + 1;

export default function MigrationPage() {
  return (
    <StaticPage
      icon={<CalendarIcon className="w-16 h-16 mx-auto text-primary-300" />}
      title="Migration Calendar"
      subtitle="The great migrations don't happen all at once — this calendar shows which tracked corridors are on the move in each month of the year. Distances are great-circle approximations along each corridor's waypoints."
    >
      {/* Per-month summary strip — each card deep-links to the globe
          pre-filtered to that season (and scrolls it into view) */}
      <Section>Corridors Active by Month</Section>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-8">
        {MONTHS.map((m) => {
          const count = activeByMonth(m.key);
          const now = m.key === currentMonth;
          return (
            <Link
              key={m.key}
              href={`/?season=${seasonOfMonth(m.key)}#globe`}
              className={`group rounded-xl p-3 text-center border transition-all ${
                now
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500'
                  : 'border-secondary-200 dark:border-secondary-800 bg-white dark:bg-secondary-900/40 hover:border-primary-400 hover:shadow-soft'
              }`}
              title={`Show ${seasonOfMonth(m.key)} corridors on the globe`}
            >
              <div className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                {m.label}
                {now && <span className="ml-1 text-primary-600 dark:text-primary-400">●</span>}
              </div>
              <div className="text-xl font-bold text-secondary-900 dark:text-white mt-0.5 font-data">
                {count}
              </div>
              <div className="text-[10px] text-secondary-400 dark:text-secondary-500">corridors</div>
            </Link>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <Section>Corridor Timeline</Section>
        <div className="flex gap-2">
          <ExportButton
            rows={migrators.flatMap<ExportRow>(({ animal, routes }) =>
              routes.map((route) => ({
                commonName: animal.commonName,
                scientificName: animal.scientificName,
                corridor: route.name,
                season: route.season,
                months: monthsOfRoute(route),
                distanceKm: routeDistanceKm(route.points),
                durationDays: route.durationDays,
              })),
            )}
          />
          <ExportIcs
            rows={migrators.flatMap<ExportRow>(({ animal, routes }) =>
              routes.map((route) => ({
                commonName: animal.commonName,
                scientificName: animal.scientificName,
                corridor: route.name,
                season: route.season,
                months: monthsOfRoute(route),
                distanceKm: routeDistanceKm(route.points),
                durationDays: route.durationDays,
              })),
            )}
          />
        </div>
      </div>
      <p className="mb-4">
        Each row is one corridor with its actual recorded months of movement:
        green = spring, blue = summer, amber = fall, indigo = winter, gray = year-round.
        The current month is marked ●.
      </p>

      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-left text-secondary-500 dark:text-secondary-400 border-b border-secondary-200 dark:border-secondary-800">
              <th className="py-3 pr-4 font-semibold">Species</th>
              <th className="py-3 pr-4 font-semibold">Corridor</th>
              <th className="py-3 pr-4 font-semibold">Length</th>
              <th className="py-3 font-semibold text-center">Months</th>
            </tr>
          </thead>
          <tbody>
            {migrators.map(({ animal, routes }) =>
              routes.map((route, ri) => {
                const season = (route.season ?? 'year-round') as CalendarSeason;
                const activeMonths = monthsOfRoute(route);
                return (
                  <tr
                    key={`${animal.id}-${ri}`}
                    className="border-b border-secondary-100 dark:border-secondary-800/60 align-middle"
                  >
                    <td className="py-3.5 pr-4">
                      {ri === 0 ? (
                        <Link href={`/animal/${animal.id}`} className="group inline-flex items-center gap-2.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`/images/animals/${animal.id}.jpg`}
                            alt=""
                            width={36}
                            height={36}
                            className="rounded-lg object-cover shrink-0"
                            loading="lazy"
                          />
                          <span className="font-semibold text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {animal.commonName}
                          </span>
                        </Link>
                      ) : null}
                    </td>
                    <td className="py-3.5 pr-4 text-secondary-600 dark:text-secondary-300">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: SEASON_COLOR[season] }}
                        />
                        <span className="line-clamp-2">{route.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4 whitespace-nowrap text-secondary-600 dark:text-secondary-300">
                      <div>{formatKm(routeDistanceKm(route.points))}</div>
                      <div className="text-xs text-secondary-400 dark:text-secondary-500">
                        {route.durationDays ? formatDurationDays(route.durationDays) : ''}
                      </div>
                    </td>
                    <td className="py-3.5">
                      <div className="flex gap-1 justify-center">
                        {MONTHS.map((m) => {
                          const active = activeMonths.includes(m.key);
                          const now = m.key === currentMonth;
                          return (
                            <span
                              key={m.key}
                              title={`${m.label}${active ? ` — ${season}` : ''}${now ? ' (now)' : ''}`}
                              className={`w-4 h-6 rounded-sm ${
                                active ? '' : 'bg-secondary-100 dark:bg-secondary-800'
                              }`}
                              style={
                                active
                                  ? {
                                      backgroundColor: SEASON_COLOR[season],
                                      boxShadow: now ? `0 0 0 1.5px #f59e0b` : undefined,
                                    }
                                  : undefined
                              }
                            />
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Section>How to Read This</Section>
      <p>
        A corridor&apos;s months come from its migration-leg season: spring legs (the northward
        breeding movement) are green and fall legs (the southward wintering movement) are amber;
        year-round corridors — like the leatherback&apos;s trans-Pacific loop — are always active.
        Month ranges are the typical calendar span of each movement, and durations are
        literature-based approximations. Species with no documented corridor (the remaining{' '}
        {sampleAnimals.length - migrators.length} tracked species) are resident and not shown here.
      </p>

      <p>
        Explore the corridors live on the <Link href="/#globe" className="text-primary-600 dark:text-primary-400 hover:underline">interactive globe</Link>{' '}
        or see the full data behind each route on its{' '}
        <Link href="/animal/arctic-tern-001" className="text-primary-600 dark:text-primary-400 hover:underline">species profile</Link>.
      </p>
    </StaticPage>
  );
}
