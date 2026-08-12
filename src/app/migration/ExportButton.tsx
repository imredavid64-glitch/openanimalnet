'use client';

import { MigrationRoute, MigrationSeason } from '@/types/animal/types';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface ExportRow {
  commonName: string;
  scientificName: string;
  corridor: string;
  season: MigrationSeason | undefined;
  months: number[];
  distanceKm: number;
  durationDays?: number;
}

function monthsLabel(months: number[]): string {
  return months.map((m) => MONTH_NAMES[m - 1]).join(', ');
}

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/**
 * Downloads the migration calendar as a CSV for researchers. Rows are one
 * corridor per line with species, season, active months, distance, and
 * duration — the same fields the calendar page shows.
 */
export default function ExportButton({ rows }: { rows: ExportRow[] }) {
  const handleExport = () => {
    const header = ['Species', 'Scientific name', 'Corridor', 'Season', 'Active months', 'Distance (km)', 'Duration (days)'];
    const lines = [header.join(',')];
    for (const r of rows) {
      lines.push(
        [
          csvEscape(r.commonName),
          csvEscape(r.scientificName),
          csvEscape(r.corridor),
          r.season ?? 'year-round',
          csvEscape(monthsLabel(r.months)),
          Math.round(r.distanceKm),
          r.durationDays ?? '',
        ].join(','),
      );
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `openanimalnet-migrations-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-secondary-300 dark:border-secondary-700 text-sm font-medium text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors duration-300"
      title="Download the calendar as a CSV spreadsheet"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="m7 10 5 5 5-5" />
        <path d="M12 15V3" />
      </svg>
      Export CSV
    </button>
  );
}
