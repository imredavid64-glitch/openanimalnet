'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { sampleShelters, sampleLostPets, sampleFoundPets } from '@/data/sample/shelters';
import type { FoundPetReport, LostPetReport } from '@/data/sample/shelters';
import { greatCircleKm } from '@/lib/geo';
import { PawIcon, PinIcon, PhoneIcon, CheckIcon, SearchIcon, AccessibleIcon, BookIcon } from '@/components/icons';

type Tab = 'lost-found' | 'shelters' | 'adopt';

type PetSpecies = 'dog' | 'cat' | 'rabbit' | 'bird';

const SPECIES: { key: PetSpecies; label: string }[] = [
  { key: 'dog', label: 'Dog' },
  { key: 'cat', label: 'Cat' },
  { key: 'rabbit', label: 'Rabbit' },
  { key: 'bird', label: 'Bird' },
];

// External adoption platforms — adoptions happen on these sites, not here.
const ADOPTION_PLATFORMS = [
  {
    name: 'Petfinder',
    region: 'United States · Canada',
    description: 'Search adoptable pets from thousands of shelters and rescues across North America.',
    url: 'https://www.petfinder.com',
  },
  {
    name: 'Adopt a Pet',
    region: 'United States · Canada',
    description: 'National listing service connecting adopters with local shelters and rescues.',
    url: 'https://www.adoptapet.com',
  },
  {
    name: 'ASPCA Adopt',
    region: 'United States',
    description: 'The ASPCA\'s adoption hub with listings and guidance for first-time adopters.',
    url: 'https://www.aspca.org/adopt-pet',
  },
  {
    name: 'Best Friends Animal Society',
    region: 'United States',
    description: 'Nationwide adoption network working toward no-kill shelters.',
    url: 'https://bestfriends.org/adopt',
  },
  {
    name: 'People for Animals',
    region: 'India',
    description: 'India\'s largest animal-welfare organisation, with shelter and adoption programs.',
    url: 'https://www.peopleforanimalsindia.org',
  },
  {
    name: 'KSPCA',
    region: 'Kenya',
    description: 'Kenya Society for the Protection and Care of Animals — adoption, rescue, and welfare work.',
    url: 'https://www.kspca.or.ke',
  },
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
  const [newReport, setNewReport] = useState({ petName: '', species: 'dog' as PetSpecies, description: '' });
  const [myLostReports, setMyLostReports] = useState<LostPetReport[]>([]);

  const allLost = useMemo(() => [...myLostReports, ...sampleLostPets], [myLostReports]);

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
    { key: 'adopt', label: 'Adopt a Pet' },
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
            Reuniting lost pets, supporting shelters and rescues, and pointing adopters to the
            platforms where adoptions actually happen. Demo data — coordinates are real.
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
                  onChange={(e) => setNewReport({ ...newReport, species: e.target.value as PetSpecies })}
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
                    <Link
                      href="/assistance"
                      className="mt-2 text-[11px] text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 rounded-lg px-2 py-1 inline-flex items-center gap-1 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
                    >
                      <AccessibleIcon className="w-3.5 h-3.5" /> Accessible · service-animal support
                    </Link>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}

        {tab === 'adopt' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-5 mb-8 text-sm text-primary-800 dark:text-primary-200">
              OpenAnimalNet does not process adoptions — every pet is adopted through a shelter or
              rescue. These are the platforms where you can browse adoptable pets and start the
              process. Links open on their websites.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ADOPTION_PLATFORMS.map((p) => (
                <a
                  key={p.name}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-bold text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {p.name}
                    </h3>
                    <BookIcon className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                  </div>
                  <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mb-2">{p.region}</p>
                  <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-4">{p.description}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400">
                    Visit site
                    <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                  </span>
                </a>
              ))}
            </div>
            <p className="text-xs text-secondary-400 dark:text-secondary-500 mt-6 text-center">
              Your local shelter may not be listed here — check the Shelters & Rescues tab for nearby
              organizations and their contact details.
            </p>
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  );
}
