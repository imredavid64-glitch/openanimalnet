'use client';

import { ExportRow } from './ExportButton';
import { DownloadIcon } from '@/components/icons';

// iCalendar needs a fixed 8-char local date.
function icsDate(y: number, m: number, d: number): string {
  return `${y}${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}`;
}

// Escape per RFC 5545: commas, semicolons, and newlines.
function icsEscape(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
}

// Build one yearly all-day event per corridor, spanning its recorded months.
// DTEND is exclusive (the first day after the final month).
function buildIcs(rows: ExportRow[]): string {
  const year = new Date().getFullYear();
  const now = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '') + 'Z';

  const events = rows.map((r, i) => {
    const startMonth = r.months[0];
    const endMonth = r.months[r.months.length - 1];
    const wraps = startMonth > endMonth;
    const start = icsDate(year, startMonth, 1);
    // End is the day after the last active month (exclusive DTEND).
    const end = endMonth === 12
      ? icsDate(year + 1, 1, 1)
      : icsDate(year + (wraps ? 1 : 0), endMonth + 1, 1);
    const seasonLabel = r.season ? r.season.replace('-', ' ') : 'year-round';
    const summary = `${r.commonName} — ${r.season ? seasonLabel : 'year-round'} migration`;
    const description = `Corridor: ${r.corridor}. Approx. ${Math.round(r.distanceKm).toLocaleString()} km${
      r.durationDays ? ` over ~${r.durationDays} days` : ''
    }. Data: OpenAnimalNet.`;
    return [
      'BEGIN:VEVENT',
      `UID:oan-migration-${i}@openanimalnet.vercel.app`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      'RRULE:FREQ=YEARLY',
      `SUMMARY:${icsEscape(summary)}`,
      `DESCRIPTION:${icsEscape(description)}`,
      'END:VEVENT',
    ].join('\r\n');
  });

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//OpenAnimalNet//Migration Calendar//EN',
    'CALSCALE:GREGORIAN',
    ...events,
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}

/**
 * Downloads the migration calendar as an iCalendar file — yearly recurring
 * events per corridor so it syncs to Google Calendar / Apple Calendar / Outlook.
 */
export default function ExportIcs({ rows }: { rows: ExportRow[] }) {
  const handleExport = () => {
    const blob = new Blob([buildIcs(rows)], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `openanimalnet-migrations-${new Date().toISOString().slice(0, 10)}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-secondary-300 dark:border-secondary-700 text-sm font-medium text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors duration-300"
      title="Download the calendar as an iCalendar file (syncs to Google/Apple/Outlook)"
    >
      <DownloadIcon className="w-4 h-4" />
      Add to calendar (.ics)
    </button>
  );
}
