/**
 * SSE Live Alerts Hook
 * Consumes real-time alerts from /api/v1/live/alerts
 * Handles reconnection, heartbeats, and alert filtering
 */

import { useEffect, useState, useCallback, useRef } from 'react';

export interface LiveAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  animal: { id: string; commonName?: string };
  message: string;
  timestamp: string;
  location?: { lat: number; lng: number };
  severity: number;
  crime?: boolean;
}

export interface SSEAlertEvent {
  type: 'snapshot' | 'alert' | 'heartbeat';
  timestamp: number;
  alerts?: LiveAlert[];
  alert?: LiveAlert;
  action?: 'add' | 'update' | 'remove';
}

export interface UseLiveAlertsOptions {
  types?: ('critical' | 'warning' | 'info')[];
  speciesIds?: string[];
  enabled?: boolean;
  onAlert?: (alert: LiveAlert) => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  maxRetries?: number;
}

export function useLiveAlerts(options: UseLiveAlertsOptions = {}) {
  const {
    types = ['critical', 'warning', 'info'],
    speciesIds = [],
    enabled = true,
    onAlert,
    onError,
    reconnectInterval = 5000,
    maxRetries = 10,
  } = options;

  const [alerts, setAlerts] = useState<LiveAlert[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const eventSourceRef = useRef<EventSource | null>(null);
  const retriesRef = useRef(0);
  const mountedRef = useRef(true);

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.set('types', types.join(','));
    if (speciesIds.length > 0) {
      params.set('species', speciesIds.join(','));
    }
    params.set('heartbeat', '30000');
    return `/api/v1/live/alerts?${params.toString()}`;
  }, [types, speciesIds]);

  const connect = useCallback(() => {
    if (!enabled || !mountedRef.current) return;
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = buildUrl();
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      if (!mountedRef.current) return;
      setConnected(true);
      setError(null);
      retriesRef.current = 0;
      setRetryCount(0);
    };

    es.onmessage = (event) => {
      if (!mountedRef.current) return;
      try {
        const data: SSEAlertEvent = JSON.parse(event.data);
        
        if (data.type === 'snapshot' && data.alerts) {
          setAlerts(data.alerts);
        } else if (data.type === 'alert' && data.alert) {
          const alert = data.alert;
          if (data.action === 'add') {
            setAlerts(prev => [alert, ...prev].slice(0, 100));
          } else if (data.action === 'update') {
            setAlerts(prev => prev.map(a => a.id === alert.id ? alert : a));
          } else if (data.action === 'remove') {
            setAlerts(prev => prev.filter(a => a.id !== alert.id));
          }
          if (onAlert) onAlert(alert);
        }
      } catch (err) {
        console.warn('Failed to parse SSE message:', err);
      }
    };

    es.onerror = (err) => {
      if (!mountedRef.current) return;
      setConnected(false);
      setError('Connection lost');
      onError?.(err);

      // Attempt reconnection
      if (retriesRef.current < maxRetries) {
        retriesRef.current += 1;
        setRetryCount(retriesRef.current);
        setTimeout(() => {
          if (mountedRef.current && enabled) {
            connect();
          }
        }, reconnectInterval);
      } else {
        setError('Max retries exceeded. Please refresh the page.');
      }
    };
  }, [enabled, types, speciesIds, onAlert, onError, reconnectInterval, maxRetries]);

  useEffect(() => {
    mountedRef.current = true;
    if (enabled) {
      connect();
    }
    return () => {
      mountedRef.current = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [enabled, connect]);

  // Filter alerts by type/species on client side as well
  const filteredAlerts = alerts.filter(alert => {
    if (types.length > 0 && !types.includes(alert.type)) return false;
    if (speciesIds.length > 0 && !speciesIds.includes(alert.animal.id)) return false;
    return true;
  });

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  return {
    alerts: filteredAlerts,
    allAlerts: alerts,
    connected,
    connecting: !connected && enabled && retryCount < maxRetries,
    error,
    retryCount,
    clearAlerts,
    dismissAlert,
    reconnect: connect,
  };
}

/**
 * Hook for a simple alert badge/count
 */
export function useAlertCounts(speciesId?: string) {
  const { alerts } = useLiveAlerts({
    speciesIds: speciesId ? [speciesId] : [],
    enabled: true,
  });

  const counts = {
    critical: alerts.filter(a => a.type === 'critical').length,
    warning: alerts.filter(a => a.type === 'warning').length,
    info: alerts.filter(a => a.type === 'info').length,
    total: alerts.length,
  };

  return counts;
}