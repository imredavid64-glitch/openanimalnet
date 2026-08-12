import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { sampleAnimals, sampleAnimalData } from '@/data/sample/animals';
import MiniRouteMap from '@/components/map/MiniRouteMap';
import { ConservationStatus } from '@/types/animal/types';
import { UsersIcon, PinIcon, AntennaIcon } from '@/components/icons';

const statusBadge: Record<ConservationStatus, { label: string; className: string }> = {
  EX: { label: 'Extinct', className: 'bg-danger-500' },
  EW: { label: 'Extinct in Wild', className: 'bg-danger-500' },
  CR: { label: 'Critically Endangered', className: 'bg-danger-400' },
  EN: { label: 'Endangered', className: 'bg-warning-500' },
  VU: { label: 'Vulnerable', className: 'bg-warning-400' },
  NT: { label: 'Near Threatened', className: 'bg-warning-300' },
  LC: { label: 'Least Concern', className: 'bg-success-500' },
  DD: { label: 'Data Deficient', className: 'bg-secondary-500' },
  NE: { label: 'Not Evaluated', className: 'bg-secondary-400' },
};

interface PageProps {
  params: { id: string };
}

export function generateMetadata({ params }: PageProps): Metadata {
  const animal = sampleAnimals.find((a) => a.id === params.id);
  return {
    title: animal ? `Monitoring: ${animal.commonName} | OpenAnimalNet` : 'Monitoring | OpenAnimalNet',
    description: animal
      ? `Live monitoring data for ${animal.commonName} (${animal.scientificName}).`
      : 'Live monitoring data for an animal tracked by OpenAnimalNet.',
  };
}

export default function AnimalMonitorPage({ params }: PageProps) {
  const animal = sampleAnimals.find((a) => a.id === params.id);
  if (!animal) {
    notFound();
  }

  const animalData = sampleAnimalData.find((d) => d.animal.id === animal.id);
  const telemetry = animalData?.behavioral?.telemetry;
  const abundance = animalData?.population?.abundance;
  const conservation = animalData?.population?.conservation;
  const status = statusBadge[animal.conservationStatus];

  return (
    <main className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-950 dark:to-secondary-900">
      <div className="container mx-auto px-4 py-12">
        <Link
          href="/monitor"
          className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors mb-8"
        >
          ← Back to Monitoring Center
        </Link>

        {/* Hero */}
        <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-900 text-white rounded-3xl shadow-xl p-8 md:p-12 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${status.className}`}>
                  {status.label}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20">
                  {animal.isMonitored ? '● Monitored' : '○ Not Monitored'}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">{animal.commonName}</h1>
              <p className="text-lg text-white/80 mt-2 italic">{animal.scientificName}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-5 min-w-[220px]">
              <div className="text-xs uppercase tracking-wider text-white/70 mb-2">Last Check</div>
              <div className="text-lg font-semibold" suppressHydrationWarning>
                {animal.lastUpdated.toLocaleString()}
              </div>
              <div className="text-xs uppercase tracking-wider text-white/70 mt-4 mb-2">Status</div>
              <div className="text-lg font-semibold text-success-300">
                {animal.isMonitored ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
        </section>

        {/* Stat cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <UsersIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />, label: 'Population', value: animal.populationEstimate?.toLocaleString() ?? 'N/A' },
            { icon: <PinIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />, label: 'Latitude', value: animal.location.latitude.toFixed(4) },
            { icon: <PinIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />, label: 'Longitude', value: animal.location.longitude.toFixed(4) },
            { icon: <AntennaIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />, label: 'Telemetry Fixes', value: telemetry?.gpsCoordinates.length.toLocaleString() ?? 'N/A' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-soft border-l-4 border-primary-500"
            >
              <div className="mb-2">{stat.icon}</div>
              <div className="text-xl font-bold text-secondary-900 dark:text-white">{stat.value}</div>
              <div className="text-sm text-secondary-500 dark:text-secondary-400">{stat.label}</div>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Telemetry */}
          <section className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-soft p-6">
              <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-4">Telemetry</h2>
              {telemetry?.gpsCoordinates?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary-100 dark:bg-secondary-800 text-left">
                      <tr>
                        <th className="px-4 py-2 font-semibold text-secondary-900 dark:text-white">Source</th>
                        <th className="px-4 py-2 font-semibold text-secondary-900 dark:text-white">Latitude</th>
                        <th className="px-4 py-2 font-semibold text-secondary-900 dark:text-white">Longitude</th>
                        <th className="px-4 py-2 font-semibold text-secondary-900 dark:text-white">Altitude</th>
                        <th className="px-4 py-2 font-semibold text-secondary-900 dark:text-white">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-100 dark:divide-secondary-700">
                      {telemetry.gpsCoordinates.map((coord, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2 text-secondary-600 dark:text-secondary-400">{coord.source}</td>
                          <td className="px-4 py-2 font-mono text-xs text-primary-600 dark:text-primary-400">{coord.latitude.toFixed(4)}</td>
                          <td className="px-4 py-2 font-mono text-xs text-primary-600 dark:text-primary-400">{coord.longitude.toFixed(4)}</td>
                          <td className="px-4 py-2 text-secondary-600 dark:text-secondary-400">{coord.altitude ?? '—'}</td>
                          <td className="px-4 py-2 text-secondary-600 dark:text-secondary-400" suppressHydrationWarning>{new Date(coord.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-secondary-500 dark:text-secondary-400">No telemetry data available for this species.</p>
              )}
              {telemetry?.homeRangeBoundary && (
                <div className="mt-4 text-sm text-secondary-600 dark:text-secondary-400">
                  🗺️ Home range boundary recorded ({telemetry.homeRangeBoundary.type}).
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-soft p-6">
              <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-4">📈 Abundance & Conservation</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="rounded-xl bg-secondary-50 dark:bg-secondary-900 p-4">
                  <div className="text-secondary-500 dark:text-secondary-400 mb-1">Aerial Survey</div>
                  <div className="text-lg font-semibold text-secondary-900 dark:text-white">
                    {abundance?.aerialSurveyCounts?.toLocaleString() ?? '—'}
                  </div>
                </div>
                <div className="rounded-xl bg-secondary-50 dark:bg-secondary-900 p-4">
                  <div className="text-secondary-500 dark:text-secondary-400 mb-1">Camera Trap Rate</div>
                  <div className="text-lg font-semibold text-secondary-900 dark:text-white">
                    {abundance?.cameraTrapCaptureRates?.toLocaleString() ?? '—'}
                  </div>
                </div>
                <div className="rounded-xl bg-secondary-50 dark:bg-secondary-900 p-4">
                  <div className="text-secondary-500 dark:text-secondary-400 mb-1">Range Contraction</div>
                  <div className="text-lg font-semibold text-secondary-900 dark:text-white">
                    {conservation?.rangeContractionPercentage ? `${conservation.rangeContractionPercentage}%` : '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Seasonal Migration — for species with documented corridors */}
            {animal.migrationRoutes && animal.migrationRoutes.length > 0 && (
              <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-soft p-6">
                <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-1">🧭 Seasonal Migration</h2>
                <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-4">
                  Documented seasonal corridors — also drawn on the global globe (green = spring, amber = fall, slate = year-round).
                </p>
                <MiniRouteMap routes={animal.migrationRoutes} height="h-40" />
                <div className="space-y-2 mt-3">
                  {animal.migrationRoutes.map((route, i) => {
                    const n = route.points.length;
                    const start = route.points[0];
                    const end = route.points[n - 1];
                    const fmt = (p: { latitude: number; longitude: number }) =>
                      `${Math.abs(p.latitude).toFixed(1)}°${p.latitude >= 0 ? 'N' : 'S'} ${Math.abs(p.longitude).toFixed(1)}°${p.longitude >= 0 ? 'E' : 'W'}`;
                    return (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            route.season === 'spring' ? 'bg-success-500' :
                            route.season === 'fall' ? 'bg-warning-500' :
                            'bg-secondary-400'
                          }`}
                        />
                        <span className="text-secondary-700 dark:text-secondary-300 font-medium capitalize">
                          {route.season ?? 'year-round'}
                        </span>
                        <span className="text-secondary-500 dark:text-secondary-400 truncate">
                          {route.name} · {fmt(start)} → {fmt(end)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-soft p-6">
              <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-4">🏷️ Profile</h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-secondary-500 dark:text-secondary-400">Category</dt>
                  <dd className="font-medium text-secondary-900 dark:text-white capitalize">{animal.category}</dd>
                </div>
                <div>
                  <dt className="text-secondary-500 dark:text-secondary-400">Habitat</dt>
                  <dd className="font-medium text-secondary-900 dark:text-white">{animal.habitat?.join(', ') ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-secondary-500 dark:text-secondary-400">Data Categories</dt>
                  <dd className="font-medium text-secondary-900 dark:text-white">{animal.dataCategories.join(', ')}</dd>
                </div>
                <div>
                  <dt className="text-secondary-500 dark:text-secondary-400">Last Updated</dt>
                  <dd className="font-medium text-secondary-900 dark:text-white" suppressHydrationWarning>{animal.lastUpdated.toLocaleString()}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-soft p-6 space-y-3">
              <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">Related</h2>
              <Link
                href={`/animal/${animal.id}`}
                className="block w-full text-center px-4 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors"
              >
                View Full Profile
              </Link>
              <Link
                href="/monitor"
                className="block w-full text-center px-4 py-3 rounded-xl border border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700 font-medium transition-colors"
              >
                Monitoring Center
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
