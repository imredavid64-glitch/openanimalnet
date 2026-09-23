'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sampleAnimals } from '@/data/sample/animals';

interface LiveAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  animalId?: string;
}

const severityConfig = {
  critical: { bg: 'bg-danger-50 dark:bg-danger-900/10', border: 'border-danger-200 dark:border-danger-800', dot: 'bg-danger-500', text: 'text-danger-700 dark:text-danger-300' },
  warning: { bg: 'bg-warning-50 dark:bg-warning-900/10', border: 'border-warning-200 dark:border-warning-800', dot: 'bg-warning-500', text: 'text-warning-700 dark:text-warning-300' },
  info: { bg: 'bg-primary-50 dark:bg-primary-900/10', border: 'border-primary-200 dark:border-primary-800', dot: 'bg-primary-500', text: 'text-primary-700 dark:text-primary-300' },
};

export default function LiveFeed({ baseUrl }: { baseUrl?: string }) {
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<string>('');
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    const url = baseUrl ?? '/api/v1/live/alerts';
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener('connected', (e) => {
      setConnected(true);
      setLastEvent('Connected');
    });

    es.addEventListener('alert', (e) => {
      try {
        const alert = JSON.parse(e.data) as LiveAlert;
        setAlerts(prev => [alert, ...prev].slice(0, 50));
        setLastEvent(new Date().toLocaleTimeString());
      } catch {}
    });

    es.addEventListener('heartbeat', () => {
      setLastEvent(new Date().toLocaleTimeString());
    });

    es.onerror = () => {
      setConnected(false);
      es.close();
      // Reconnect after 3s
      setTimeout(connect, 3000);
    };
  }, [baseUrl]);

  useEffect(() => {
    connect();
    return () => { eventSourceRef.current?.close(); };
  }, [connect]);

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-secondary-800 rounded-2xl shadow-sm border border-secondary-100 dark:border-secondary-700">
        <div className="flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-success-500 animate-pulse' : 'bg-danger-500'}`} />
          <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
            {connected ? 'Live — Connected' : 'Reconnecting...'}
          </span>
        </div>
        {lastEvent && (
          <span className="text-xs text-secondary-400">Last event: {lastEvent}</span>
        )}
      </div>

      {/* Alert Stream */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {alerts.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-12 text-secondary-400">
              <div className="text-4xl mb-3">📡</div>
              <p className="text-sm">Waiting for live alerts...</p>
            </motion.div>
          )}
          {alerts.map(alert => {
            const config = severityConfig[alert.type];
            const animal = alert.animalId ? sampleAnimals.find(a => a.id === alert.animalId) : null;
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                className={`${config.bg} border ${config.border} rounded-xl p-4`}
              >
                <div className="flex items-start gap-3">
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${config.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold uppercase ${config.text}`}>{alert.type}</span>
                      <span className="text-xs text-secondary-400">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm text-secondary-700 dark:text-secondary-300 mt-1">{alert.message}</p>
                    {animal && (
                      <p className="text-xs text-secondary-500 mt-1">
                        {animal.commonName} ({animal.scientificName})
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}