'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { INITIAL_LIVE_EVENTS, LiveEvent } from '@/lib/liveFeed';

export default function LiveFeedPage() {
  const [events, setEvents] = useState<LiveEvent[]>(INITIAL_LIVE_EVENTS);
  const [filterType, setFilterType] = useState<string>('all');
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  // Simulate new incoming telemetry events periodically
  useEffect(() => {
    const timer = setInterval(() => {
      const speciesList = [
        { id: 'snow-leopard', name: 'Snow Leopard', loc: 'Altai Mountains, Mongolia', lat: 45.5, lng: 92.1 },
        { id: 'axolotl', name: 'Axolotl', loc: 'Lake Xochimilco, Mexico', lat: 19.2, lng: -99.1 },
        { id: 'arctic-tern', name: 'Arctic Tern', loc: 'Weddell Sea, Antarctica', lat: -75.0, lng: -45.0 },
      ];
      const randomSp = speciesList[Math.floor(Math.random() * speciesList.length)];
      const newEvt: LiveEvent = {
        id: `evt-${Date.now()}`,
        speciesId: randomSp.id,
        commonName: randomSp.name,
        eventType: Math.random() > 0.5 ? 'camera_trap' : 'collar_ping',
        location: { lat: randomSp.lat, lng: randomSp.lng, name: randomSp.loc },
        timestamp: 'Just now',
        details: 'Automated remote sensor ping received via satellite relay.',
        verifiedCount: 1,
        flaggedCount: 0,
      };

      setEvents((prev) => [newEvt, ...prev.slice(0, 15)]);
      setActiveNotification(`New live telemetry received for ${randomSp.name}!`);
      setTimeout(() => setActiveNotification(null), 4000);
    }, 15000);

    return () => clearInterval(timer);
  }, []);

  const handleVerify = (id: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, verifiedCount: e.verifiedCount + 1 } : e))
    );
  };

  const filteredEvents = events.filter(
    (e) => filterType === 'all' || e.eventType === filterType
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Toast Notification */}
      {activeNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 animate-bounce">
          <span className="text-xl">📡</span>
          <span className="text-sm font-bold">{activeNotification}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          <span>Real-Time Stream</span>
          <span>•</span>
          <span>Telemetry & Camera Traps</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
          Live Wildlife Observation Ticker
        </h1>
        <p className="text-slate-600 dark:text-slate-300 mt-2 max-w-3xl">
          Real-time stream of GPS collar pings, camera trap triggers, and acoustic hydrophone detections verified by global researchers.
        </p>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All Events' },
          { id: 'camera_trap', label: '📸 Camera Traps' },
          { id: 'collar_ping', label: '📡 GPS Collar Pings' },
          { id: 'acoustic_detection', label: '🔊 Acoustic Hydrophones' },
          { id: 'ranger_sighting', label: '🛡️ Ranger Sightings' },
        ].map((chip) => (
          <button
            key={chip.id}
            onClick={() => setFilterType(chip.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              filterType === chip.id
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Event Feed */}
      <div className="space-y-4">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 transition hover:border-emerald-500/50"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold uppercase">
                  {evt.eventType.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-400">{evt.timestamp}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                {evt.commonName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                📍 {evt.location.name} ({evt.location.lat.toFixed(2)}, {evt.location.lng.toFixed(2)})
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                {evt.details}
              </p>
            </div>

            <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800">
              <div className="text-center">
                <div className="text-sm font-bold text-emerald-600">{evt.verifiedCount}</div>
                <div className="text-[10px] uppercase text-slate-400">Verified</div>
              </div>
              <button
                onClick={() => handleVerify(evt.id)}
                className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition"
              >
                ✓ Confirm Sighting
              </button>
              <Link
                href={`/animal/${evt.speciesId}`}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Profile →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
