'use client';

import React, { useState } from 'react';

interface EndpointConfig {
  id: string;
  name: string;
  path: string;
  method: 'GET';
  description: string;
  queryParams: { key: string; value: string; description: string }[];
}

const ENDPOINTS: EndpointConfig[] = [
  {
    id: 'animals',
    name: 'Get Animals Catalog',
    path: '/api/v1/animals',
    method: 'GET',
    description: 'Returns paginated species catalog with category, conservation status, and search filters.',
    queryParams: [
      { key: 'limit', value: '5', description: 'Number of results (1-50)' },
      { key: 'category', value: 'mammals', description: 'Filter by category (mammals, birds, reptiles, etc.)' },
      { key: 'search', value: '', description: 'Search term for name or habitat' },
    ],
  },
  {
    id: 'animal-id',
    name: 'Get Single Animal Profile',
    path: '/api/v1/animals/tiger',
    method: 'GET',
    description: 'Fetch detailed biological profile, status, and population history for a specific species ID.',
    queryParams: [],
  },
  {
    id: 'populations',
    name: 'Get Population Trends',
    path: '/api/v1/populations',
    method: 'GET',
    description: 'Returns historical census figures and trajectory estimates across monitored species.',
    queryParams: [],
  },
  {
    id: 'locations',
    name: 'Get Telemetry Locations',
    path: '/api/v1/locations',
    method: 'GET',
    description: 'Returns telemetry coordinates for GPS-collared individuals.',
    queryParams: [],
  },
  {
    id: 'stats',
    name: 'Get Monitoring Dashboard Stats',
    path: '/api/v1/monitoring/stats',
    method: 'GET',
    description: 'Returns aggregate monitoring metrics, active alerts count, and total population estimates.',
    queryParams: [],
  },
];

export default function ApiPlaygroundPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointConfig>(ENDPOINTS[0]);
  const [params, setParams] = useState<Record<string, string>>({
    limit: '5',
    category: 'mammals',
    search: '',
  });
  const [responseJson, setResponseJson] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<number | null>(null);

  const handleParamChange = (key: string, val: string) => {
    setParams({ ...params, [key]: val });
  };

  const executeRequest = async () => {
    setLoading(true);
    setResponseJson(null);
    setStatus(null);

    // Build URL string
    let url = selectedEndpoint.path;
    const query = new URLSearchParams();
    selectedEndpoint.queryParams.forEach((p) => {
      const val = params[p.key];
      if (val) {
        query.set(p.key, val);
      }
    });

    const queryString = query.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    try {
      const res = await fetch(url);
      setStatus(res.status);
      const json = await res.json();
      setResponseJson(JSON.stringify(json, null, 2));
    } catch (e) {
      setResponseJson(JSON.stringify({ error: 'Failed to fetch API endpoint' }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          <span>Developer Tools</span>
          <span>•</span>
          <span>Interactive API Console</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
          Open Data API Playground
        </h1>
        <p className="text-slate-600 dark:text-slate-300 mt-2 max-w-3xl">
          Test OpenAnimalNet REST endpoints live in your browser. Inspect structured JSON payloads, status codes, and headers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Endpoint Selection & Query Parameters */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase text-slate-500 dark:text-slate-400">Select Endpoint</h2>
            <div className="space-y-2">
              {ENDPOINTS.map((ep) => {
                const isSelected = selectedEndpoint.id === ep.id;
                return (
                  <button
                    key={ep.id}
                    onClick={() => {
                      setSelectedEndpoint(ep);
                      setResponseJson(null);
                      setStatus(null);
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="bg-emerald-600 text-white font-mono px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">
                        {ep.method}
                      </span>
                      <span className="font-semibold">{ep.name}</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">{ep.path}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Parameter Configuration */}
          {selectedEndpoint.queryParams.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-sm font-bold uppercase text-slate-500 dark:text-slate-400">Query Parameters</h2>
              <div className="space-y-3">
                {selectedEndpoint.queryParams.map((p) => (
                  <div key={p.key} className="space-y-1">
                    <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      {p.key}
                    </label>
                    <input
                      type="text"
                      value={params[p.key] ?? p.value}
                      onChange={(e) => handleParamChange(p.key, e.target.value)}
                      className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                      placeholder={p.description}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={executeRequest}
            disabled={loading}
            className="w-full py-3.5 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-500 transition shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            {loading ? 'Executing Request...' : 'Send API Request ▶'}
          </button>
        </div>

        {/* Right Column: Request & Live Response Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4 font-mono">
            {/* Request Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2 text-xs">
                <span className="bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded">
                  {selectedEndpoint.method}
                </span>
                <span className="text-slate-300 font-semibold">{selectedEndpoint.path}</span>
              </div>
              {status !== null && (
                <span
                  className={`text-xs px-2.5 py-1 rounded font-bold ${
                    status === 200 ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-rose-950 text-rose-400'
                  }`}
                >
                  HTTP {status}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-slate-400 font-sans">{selectedEndpoint.description}</p>

            {/* Response Viewer */}
            <div className="relative">
              <div className="flex justify-between items-center text-[11px] text-slate-500 mb-2 font-sans">
                <span>Response Body (JSON)</span>
                {responseJson && <span>{responseJson.length} bytes</span>}
              </div>
              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-emerald-400 font-mono overflow-x-auto max-h-[500px]">
                {loading
                  ? '/* Loading live payload... */'
                  : responseJson || '/* Click "Send API Request" to view live JSON response */'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
