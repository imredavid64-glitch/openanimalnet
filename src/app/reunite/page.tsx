'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  sampleShelters,
  sampleAdoptablePets,
  sampleLostPets,
  sampleFoundPets,
} from '@/data/sample/shelters';
import type { AdoptablePet, FoundPetReport, LostPetReport } from '@/data/sample/shelters';
import { greatCircleKm } from '@/lib/geo';
import { PawIcon, PinIcon, PhoneIcon, CheckIcon, SearchIcon, AccessibleIcon } from '@/components/icons';

type Tab = 'lost-found' | 'shelters' | 'adoption';

const SPECIES: { key: AdoptablePet['species']; label: string }[] = [
  { key: 'dog', label: 'Dog' },
  { key: 'cat', label: 'Cat' },
  { key: 'rabbit', label: 'Rabbit' },
  { key: 'bird', label: 'Bird' },
];

const SERVICES: Record<string, string> = {
  adoption: 'Adoption',
  foster: 'Foster program',
  'vet-care': 'Vet care',
  'lost-and-found': 'Lost & found',
  outreach: 'Community outreach',
};

// Reference location for distance display ("your area"), defaulting to Nairobi.
const DEFAULT_AREA = { latitude: -1.2864, longitude: 36.8172 };

function matchLostToFound(lost: LostPetReport, found: FoundPetReport): number {
  if (lost.species !== found.species) return 0;
  const distKm = greatCircleKm(lost.lastSeen, found.location);
  if (distKm > 60) return 0;
  return Math.round(Math.max(0, 100 - distKm * 1.6));
}

export default function ReunitePage() {
  const [tab, setTab] = useState<Tab>('lost-found');
  const [area, setArea] = useState(DEFAULT_AREA);
  const [newReport, setNewReport] = useState({ petName: '', species: 'dog' as AdoptablePet['species'], description: '' });
  const [myLostReports, setMyLostReports] = useState<LostPetReport[]>([]);

  // Adoption preferences
  const [prefs, setPrefs] = useState({ species: 'any' as 'any' | AdoptablePet['species'], size: 'any' as 'any' | AdoptablePet['size'], energy: 'any' as 'any' | AdoptablePet['energy'], goodWithKids: false });

  const allLost = useMemo(() => [...myLostReports, ...sampleLostPets], [myLostReports]);

  const adoptions = useMemo(() => {
    return sampleAdoptablePets
      .map((pet) => {
        let score = 60;
        if (prefs.species !== 'any' && pet.species === prefs.species) score += 25;
        if (prefs.size !== 'any' && pet.size === prefs.size) score += 5;
        if (prefs.energy !== 'any' && pet.energy === prefs.energy) score += 5;
        if (prefs.goodWithKids && pet.goodWithKids) score += 5;
        const shelter = sampleShelters.find((s) => s.id === pet.shelterId);
        const distKm = shelter ? greatCircleKm(area, shelter.location) : null;
        return { pet, shelter, score: Math.min(100, score), distKm };
      })
      .sort((a, b) => b.score - a.score);
  }, [prefs, area]);

  const submitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReport.petName.trim()) return;
    const report: LostPetReport = {
      id: `lost-local-${Date.now()}`,
      petName: newReport.petName.trim(),
      species: newReport.species,
      description: newReport.description.trim() || 'No description',
      lastSeen: area,
      lastSeenLabel: 'Your area',
      reportedAt: new Date().toISOString().slice(0, 10),
    };
    setMyLostReports((prev) => [report, ...prev]);
    setNewReport({ petName: '', species: 'dog', description: '' });
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'lost-found', label: 'Lost & Found' },
    { key: 'shelters', label: 'Shelters & Rescues' },
    { key: 'adoption', label: 'Adoption Match' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-950 dark:to-secondary-900">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-center mb-10"
        >
          <PawIcon className="w-14 h-14 mx-auto text-primary-600 dark:text-primary-400" />
          <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white mt-4">
            Companion Animal Hub
          </h1>
          <p className="text-lg text-secondary-600 dark:text-secondary-400 mt-3 max-w-2xl mx-auto">
            Reuniting lost pets, supporting shelters and rescues, and matching adopters with their
            next family member. Demo data — coordinates are real, pets are representative.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                tab === t.key
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white dark:bg-secondary-800 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Area reference */}
        <div className="max-w-xl mx-auto mb-10 bg-white dark:bg-secondary-800 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-secondary-500 dark:text-secondary-400 mb-2 flex items-center gap-1.5">
            <PinIcon className="w-3.5 h-3.5" /> Your area (used for distances)
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col text-xs text-secondary-500 dark:text-secondary-400">
              Latitude
              <input
                type="number" step="0.0001" value={area.latitude}
                onChange={(e) => setArea({ ...area, latitude: parseFloat(e.target.value) || 0 })}
                className="mt-1 px-3 py-2 rounded-xl bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 text-secondary-900 dark:text-white text-sm w-full"
              />
            </label>
            <label className="flex flex-col text-xs text-secondary-500 dark:text-secondary-400">
              Longitude
              <input
                type="number" step="0.0001" value={area.longitude}
                onChange={(e) => setArea({ ...area, longitude: parseFloat(e.target.value) || 0 })}
                className="mt-1 px-3 py-2 rounded-xl bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 text-secondary-900 dark:text-white text-sm w-full"
              />
            </label>
          </div>
        </div>

        {tab === 'lost-found' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Report a lost pet */}
            <div className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg h-fit">
              <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-4 flex items-center gap-2">
                <SearchIcon className="w-5 h-5 text-primary-600" /> Report a Lost Pet
              </h2>
              <form onSubmit={submitReport} className="space-y-3">
                <input
                  value={newReport.petName}
                  onChange={(e) => setNewReport({ ...newReport, petName: e.target.value })}
                  placeholder="Pet name"
                  className="w-full px-3 py-2 rounded-xl bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 text-secondary-900 dark:text-white text-sm"
                />
                <select
                  value={newReport.species}
                  onChange={(e) => setNewReport({ ...newReport, species: e.target.value as AdoptablePet['species'] })}
                  className="w-full px-3 py-2 rounded-xl bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 text-secondary-900 dark:text-white text-sm"
                >
                  {SPECIES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
                <input
                  value={newReport.description}
                  onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                  placeholder="Description (breed, color, collar…)"
                  className="w-full px-3 py-2 rounded-xl bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 text-secondary-900 dark:text-white text-sm"
                />
                <button type="submit" className="w-full px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors duration-300">
                  Report Lost Pet
                </button>
              </form>
              <p className="text-xs text-secondary-400 dark:text-secondary-500 mt-3">
                Reports are matched instantly against found reports by species and distance (≤60 km).
              </p>
            </div>

            {/* Matches */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-secondary-900 dark:text-white">Match Results</h2>
              {allLost.length === 0 && (
                <p className="text-secondary-500 dark:text-secondary-400">No lost reports yet — add one to see matches.</p>
              )}
              {allLost.map((lost) => {
                const matches = sampleFoundPets
                  .map((found) => ({ found, score: matchLostToFound(lost, found) }))
                  .filter((m) => m.score > 0)
                  .sort((a, b) => b.score - a.score);
                const holding = (shelterId?: string) => sampleShelters.find((s) => s.id === shelterId);
                return (
                  <div key={lost.id} className="bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-sm border border-secondary-100 dark:border-secondary-700">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-secondary-900 dark:text-white">{lost.petName}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary-100 dark:bg-secondary-700 text-secondary-500 capitalize">{lost.species}</span>
                    </div>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-1">{lost.description}</p>
                    <p className="text-xs text-secondary-400 dark:text-secondary-500 mb-3">Last seen: {lost.lastSeenLabel} · {lost.reportedAt}</p>
                    {matches.length === 0 ? (
                      <p className="text-xs text-warning-600 dark:text-warning-400 bg-warning-50 dark:bg-warning-900/20 rounded-xl px-3 py-2">
                        No nearby found reports yet — shelters in the area have been notified.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {matches.slice(0, 2).map((m) => {
                          const shelter = holding(m.found.shelterId);
                          return (
                            <div key={m.found.id} className="flex items-center gap-3 bg-success-50 dark:bg-success-900/20 rounded-xl px-3 py-2.5">
                              <div className="w-10 h-10 rounded-full bg-success-500 flex items-center justify-center shrink-0">
                                <CheckIcon className="w-5 h-5 text-white" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-secondary-900 dark:text-white">{m.found.description}</div>
                                <div className="text-xs text-secondary-500 dark:text-secondary-400">
                                  {Math.round(greatCircleKm(lost.lastSeen, m.found.location))} km away
                                  {shelter ? ` · held at ${shelter.name} (${shelter.phone})` : ''}
                                </div>
                              </div>
                              <div className="ml-auto text-sm font-bold font-data text-success-600 dark:text-success-400 shrink-0">
                                {m.score}% match
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {tab === 'shelters' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {sampleShelters.map((s) => {
              const distKm = greatCircleKm(area, s.location);
              return (
                <div key={s.id} className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg">
                  <h3 className="text-lg font-bold text-secondary-900 dark:text-white">{s.name}</h3>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-2">{s.city}, {s.country}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {s.services.map((sv) => (
                      <span key={sv} className="px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-[11px] font-medium">
                        {SERVICES[sv]}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-secondary-600 dark:text-secondary-300 flex items-center gap-2 mb-1">
                    <PhoneIcon className="w-4 h-4 text-primary-500" /> {s.phone}
                  </div>
                  <div className="text-xs text-secondary-400 dark:text-secondary-500 font-data">
                    {distKm < 5 ? 'in your area' : `~${Math.round(distKm)} km from you`} · capacity {s.petCapacity}
                  </div>
                  {s.accessibility && (
                    <div className="mt-2 text-[11px] text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 rounded-lg px-2 py-1 inline-block flex items-center gap-1">
                      <AccessibleIcon className="w-3.5 h-3.5" /> Accessible · service-animal support
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}

        {tab === 'adoption' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto">
            {/* Preference survey */}
            <div className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg mb-8">
              <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-4">Tell us what you&apos;re looking for</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <label className="flex flex-col text-xs text-secondary-500 dark:text-secondary-400">
                  Species
                  <select
                    value={prefs.species}
                    onChange={(e) => setPrefs({ ...prefs, species: e.target.value as typeof prefs.species })}
                    className="mt-1 px-3 py-2 rounded-xl bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 text-secondary-900 dark:text-white text-sm"
                  >
                    <option value="any">Any</option>
                    {SPECIES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </label>
                <label className="flex flex-col text-xs text-secondary-500 dark:text-secondary-400">
                  Size
                  <select
                    value={prefs.size}
                    onChange={(e) => setPrefs({ ...prefs, size: e.target.value as typeof prefs.size })}
                    className="mt-1 px-3 py-2 rounded-xl bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 text-secondary-900 dark:text-white text-sm"
                  >
                    <option value="any">Any</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </label>
                <label className="flex flex-col text-xs text-secondary-500 dark:text-secondary-400">
                  Energy
                  <select
                    value={prefs.energy}
                    onChange={(e) => setPrefs({ ...prefs, energy: e.target.value as typeof prefs.energy })}
                    className="mt-1 px-3 py-2 rounded-xl bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 text-secondary-900 dark:text-white text-sm"
                  >
                    <option value="any">Any</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
                <label className="flex items-end gap-2 pb-2 text-sm text-secondary-700 dark:text-secondary-300">
                  <input
                    type="checkbox"
                    checked={prefs.goodWithKids}
                    onChange={(e) => setPrefs({ ...prefs, goodWithKids: e.target.checked })}
                    className="w-4 h-4 accent-primary-600"
                  />
                  Good with kids
                </label>
              </div>
            </div>

            {/* Ranked matches */}
            <div className="space-y-4">
              {adoptions.map(({ pet, shelter, score, distKm }, i) => (
                <motion.div
                  key={pet.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-sm border border-secondary-100 dark:border-secondary-700 flex flex-wrap items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shrink-0">
                    <PawIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-secondary-900 dark:text-white">{pet.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary-100 dark:bg-secondary-700 text-secondary-500 capitalize">
                        {pet.species} · {pet.size} · {pet.energy} energy
                      </span>
                    </div>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-0.5">{pet.bio}</p>
                    <p className="text-xs text-secondary-400 dark:text-secondary-500 mt-1">
                      {pet.ageYears} yr{shelter ? ` · ${shelter.name}, ${shelter.city}${distKm ? ` · ~${Math.round(distKm)} km away` : ''} · ${shelter.phone}` : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-bold font-data text-primary-600 dark:text-primary-400">{score}%</div>
                    <div className="text-[11px] text-secondary-400">match</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  );
}
