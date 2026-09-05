'use client';

import Link from 'next/link';

const typeStyles = {
  critical: { badge: 'bg-danger-500', bg: 'from-danger-500 via-danger-600 to-danger-800', soft: 'bg-danger-50 dark:bg-danger-900/20', text: 'text-danger-600 dark:text-danger-400', icon: '🚨' },
  warning: { badge: 'bg-warning-500', bg: 'from-warning-500 via-warning-600 to-warning-800', soft: 'bg-warning-50 dark:bg-warning-900/20', text: 'text-warning-600 dark:text-warning-400', icon: '⚠️' },
  info: { badge: 'bg-primary-500', bg: 'from-primary-500 via-primary-600 to-primary-800', soft: 'bg-primary-50 dark:bg-primary-900/20', text: 'text-primary-600 dark:text-primary-400', icon: 'ℹ️' },
};

interface Props {
  alert: {
    id: string;
    type: 'critical' | 'warning' | 'info';
    severity: number;
    message: string;
    action: string;
    timestamp: Date;
    location: { lat: number; lng: number };
    animal: {
      id: string;
      commonName: string;
      scientificName: string;
      category: string;
      conservationStatus: string;
      isMonitored: boolean;
      populationEstimate?: number;
      habitat?: string[];
      dataCategories: string[];
      lastUpdated: Date;
      images?: string[];
    };
  };
}

export default function AlertDetailClient({ alert }: Props) {
  const style = typeStyles[alert.type];

  return (
    <main className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-950 dark:to-secondary-900">
      <div className="container mx-auto px-4 py-12">
        <Link href="/monitor" className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors mb-8">← Back to Monitoring Center</Link>

        <section className={`bg-gradient-to-br ${style.bg} text-white rounded-3xl shadow-xl p-8 md:p-12 mb-8`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/25">{style.icon} {alert.type}</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/25">Severity {alert.severity}/10</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">{alert.animal.commonName}</h1>
              <p className="text-lg text-white/80 mt-2 italic">{alert.animal.scientificName}</p>
              <p className="mt-4 max-w-2xl text-white/90 leading-relaxed">{alert.message}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-5 min-w-[220px]">
              <div className="text-xs uppercase tracking-wider text-white/70 mb-2">Reported</div>
              <div className="text-lg font-semibold" suppressHydrationWarning>{alert.timestamp.toLocaleString()}</div>
              <div className="text-xs uppercase tracking-wider text-white/70 mt-4 mb-2">Location</div>
              <div className="font-mono text-sm">{alert.location.lat.toFixed(4)}, {alert.location.lng.toFixed(4)}</div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-soft p-6">
              <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-4">📋 Alert Details</h2>
              <dl className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-secondary-100 dark:border-secondary-700 pb-3"><dt className="text-secondary-500 dark:text-secondary-400">Alert ID</dt><dd className="font-mono text-secondary-900 dark:text-white">{alert.id}</dd></div>
                <div className="flex justify-between border-b border-secondary-100 dark:border-secondary-700 pb-3"><dt className="text-secondary-500 dark:text-secondary-400">Type</dt><dd className="font-medium text-secondary-900 dark:text-white uppercase">{alert.type}</dd></div>
                <div className="flex justify-between border-b border-secondary-100 dark:border-secondary-700 pb-3"><dt className="text-secondary-500 dark:text-secondary-400">Severity</dt><dd className="font-medium text-secondary-900 dark:text-white">{alert.severity}/10</dd></div>
                <div className="flex justify-between"><dt className="text-secondary-500 dark:text-secondary-400">Monitored</dt><dd className="font-medium text-secondary-900 dark:text-white">{alert.animal.isMonitored ? '✅ Yes' : '❌ No'}</dd></div>
              </dl>
            </div>
            <div className={`${style.soft} rounded-2xl shadow-soft p-6`}>
              <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-4">Recommended Action</h2>
              <p className="text-secondary-700 dark:text-secondary-300 leading-relaxed">{alert.action}</p>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-soft p-6">
              <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-4">Animal</h2>
              <div className="flex items-center space-x-4 mb-5">
                <div className="w-20 h-20 rounded-2xl bg-cover bg-center" style={{ backgroundImage: alert.animal.images?.[0] ? `url(${alert.animal.images[0]})` : 'none', backgroundColor: '#f0f9ff' }} />
                <div>
                  <div className="font-semibold text-secondary-900 dark:text-white">{alert.animal.commonName}</div>
                  <div className="text-sm italic text-secondary-500 dark:text-secondary-400">{alert.animal.scientificName}</div>
                </div>
              </div>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-secondary-500 dark:text-secondary-400">Category</dt><dd className="font-medium text-secondary-900 dark:text-white capitalize">{alert.animal.category}</dd></div>
                <div className="flex justify-between"><dt className="text-secondary-500 dark:text-secondary-400">Conservation</dt><dd className={`font-medium ${style.text}`}>{alert.animal.conservationStatus}</dd></div>
                <div className="flex justify-between"><dt className="text-secondary-500 dark:text-secondary-400">Population</dt><dd className="font-medium text-secondary-900 dark:text-white">{alert.animal.populationEstimate?.toLocaleString() ?? 'N/A'}</dd></div>
              </dl>
            </div>
            <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-soft p-6 space-y-3">
              <Link href={`/animal/${alert.animal.id}`} className="block w-full text-center px-4 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors">View Animal Profile</Link>
              <Link href="/monitor" className="block w-full text-center px-4 py-3 rounded-xl border border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700 font-medium transition-colors">View All Alerts</Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}