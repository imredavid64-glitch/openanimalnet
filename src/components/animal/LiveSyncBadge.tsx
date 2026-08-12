'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { LiveSyncResult } from '@/lib/liveGbf';

interface Props {
  animalId: string;
  commonName: string;
}

function formatAge(seconds: number): string {
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

/**
 * "Last synced from GBIF" status badge. Proves real-time data flow by polling
 * /api/v1/live/sync and rendering how long ago the last successful sync was,
 * with the recent observation count from the live GBIF occurrence feed.
 */
export default function LiveSyncBadge({ animalId, commonName }: Props) {
  const [sync, setSync] = useState<LiveSyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/live/sync?id=${encodeURIComponent(animalId)}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { success: boolean; data?: LiveSyncResult };
      if (!json.success || !json.data) throw new Error('empty response');
      if (mounted.current) {
        setSync(json.data);
        setError(null);
      }
    } catch (err) {
      if (mounted.current) setError(err instanceof Error ? err.message : 'sync failed');
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [animalId]);

  useEffect(() => {
    mounted.current = true;
    refresh();
    const interval = setInterval(refresh, 60_000); // poll every minute
    return () => {
      mounted.current = false;
      clearInterval(interval);
    };
  }, [refresh]);

  if (error && !sync) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary-100 dark:bg-secondary-800 text-secondary-500 dark:text-secondary-400 text-xs">
        <span className="w-2 h-2 rounded-full bg-secondary-400" />
        Live sync unavailable
        <button onClick={refresh} className="underline hover:text-secondary-700 dark:hover:text-secondary-200">
          retry
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 text-xs text-success-700 dark:text-success-300"
      title={sync ? `Last successful GBIF sync at ${new Date(sync.fetchedAt).toLocaleString()}` : undefined}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-500 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-success-500" />
      </span>
      {loading ? (
        <span>Syncing from GBIF…</span>
      ) : sync ? (
        <span>
          Last synced from GBIF: <span className="font-semibold">{formatAge(sync.ageSeconds)}</span>
          {sync.gbifKey ? ` · ${sync.observations.length} recent ${commonName} occurrence${sync.observations.length === 1 ? '' : 's'}` : ' · no GBIF taxon key'}
        </span>
      ) : null}
      <button
        onClick={refresh}
        className="ml-1 underline decoration-dotted hover:text-success-600 dark:hover:text-success-200"
        aria-label="Refresh live GBIF sync"
      >
        refresh
      </button>
    </motion.div>
  );
}
