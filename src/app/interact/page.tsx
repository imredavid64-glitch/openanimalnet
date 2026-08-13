'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCrowdsourced, SensorReading, ShelterMatch } from '@/lib/useCrowdsourced';
import { sampleAnimals } from '@/data/sample/animals';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { PawIcon, ShieldIcon, GlobeIcon, ChartIcon, AntennaIcon, SearchIcon, XIcon } from '@/components/icons';

const TABS = [
  { id: 'crowd', label: 'Report Sighting', icon: <GlobeIcon className="w-4 h-4" /> },
  { id: 'sensors', label: 'IoT Sensors', icon: <AntennaIcon className="w-4 h-4" /> },
  { id: 'identify', label: 'Species ID', icon: <SearchIcon className="w-4 h-4" /> },
  { id: 'shelter', label: 'Shelter Match', icon: <PawIcon className="w-4 h-4" /> },
  { id: 'access', label: 'Access Logs', icon: <ShieldIcon className="w-4 h-4" /> },
];

const SENSOR_COLORS = { normal: 'text-success-500', warning: 'text-warning-500', critical: 'text-danger-500' };

export default function InteractPage() {
  const { loaded, sightings, sensors, accessLogs, matches, addSighting, verifySighting, addAccessLog, runMatch, adoptPet, refreshSensors } = useCrowdsourced();
  const [activeTab, setActiveTab] = useState('crowd');

  if (!loaded) return <div className="min-h-screen flex items-center justify-center"><PawIcon className="w-12 h-12 text-primary-600 animate-pulse" /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary-50 to-white dark:from-secondary-900 dark:to-secondary-950">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <span className="text-5xl">🌐</span>
          <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white mt-4">Interactive Platform</h1>
          <p className="text-lg text-secondary-600 dark:text-secondary-400 mt-4 max-w-3xl mx-auto">
            From passive browsing to active participation. Report sightings, monitor sensors, identify species, match pets, and track access — all in real-time.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${activeTab === t.id ? 'bg-primary-600 text-white shadow-lg' : 'bg-white dark:bg-secondary-800 text-secondary-600 hover:bg-primary-50'}`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            {activeTab === 'crowd' && <CrowdSighter sightings={sightings} onReport={addSighting} onVerify={verifySighting} />}
            {activeTab === 'sensors' && <SensorDashboard sensors={sensors} onRefresh={refreshSensors} />}
            {activeTab === 'identify' && <SpeciesIdentifier />}
            {activeTab === 'shelter' && <ShelterMatcher matches={matches} onMatch={runMatch} onAdopt={adoptPet} />}
            {activeTab === 'access' && <AccessLogger logs={accessLogs} onLog={addAccessLog} />}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

// === CROWD SOURCING ===
function CrowdSighter({ sightings, onReport, onVerify }: any) {
  const [animal, setAnimal] = useState('');
  const [notes, setNotes] = useState('');
  const [reportedBy, setReportedBy] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!animal.trim()) return;
    const sp = sampleAnimals.find(a => a.commonName.toLowerCase().includes(animal.toLowerCase()));
    onReport({
      animalId: sp?.id || 'unknown',
      species: sp?.commonName || animal,
      location: { lat: sp?.location.latitude || 0, lng: sp?.location.longitude || 0 },
      timestamp: new Date().toISOString(),
      notes: notes.trim(),
      reportedBy: reportedBy.trim() || 'Anonymous',
    });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setAnimal(''); setNotes(''); setReportedBy('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Report a Wildlife Sighting</h3>
        <div className="space-y-3">
          <input value={animal} onChange={e => setAnimal(e.target.value)} placeholder="Species name (e.g. African Lion)" className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
          <input value={reportedBy} onChange={e => setReportedBy(e.target.value)} placeholder="Your name (optional)" className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)" rows={2} className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none" />
          <button onClick={handleSubmit} className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors">
            {submitted ? 'Reported!' : 'Submit Sighting'}
          </button>
        </div>
      </div>
      <div className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Recent Sightings ({sightings.length})</h3>
        {sightings.length === 0 ? <p className="text-sm text-secondary-400">No sightings yet. Be the first to report!</p> : (
          <div className="space-y-2">
            {sightings.map((s: any) => (
              <div key={s.id} className={`flex items-center justify-between p-3 rounded-xl ${s.verified ? 'bg-success-50 dark:bg-success-900/10' : 'bg-secondary-50 dark:bg-secondary-700/50'}`}>
                <div>
                  <span className="font-medium text-secondary-900 dark:text-white">{s.species}</span>
                  <span className="text-xs text-secondary-400 ml-2">by {s.reportedBy}</span>
                  {s.notes && <p className="text-xs text-secondary-500 mt-1">{s.notes}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {!s.verified && <button onClick={() => verifySighting(s.id)} className="px-3 py-1 rounded-lg text-xs bg-primary-100 text-primary-600 hover:bg-primary-200">Verify</button>}
                  {s.verified && <span className="text-xs text-success-600">Verified</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// === IoT SENSOR DASHBOARD ===
function SensorDashboard({ sensors, onRefresh }: { sensors: SensorReading[]; onRefresh: () => void }) {
  const [filter, setFilter] = useState<string>('all');
  const filtered = filter === 'all' ? sensors : sensors.filter(s => s.status === filter);
  const statusCounts = { normal: sensors.filter(s => s.status === 'normal').length, warning: sensors.filter(s => s.status === 'warning').length, critical: sensors.filter(s => s.status === 'critical').length };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">Live Sensor Feed ({sensors.length})</h3>
        <button onClick={onRefresh} className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm hover:bg-primary-700">Refresh</button>
      </div>
      <div className="flex gap-2">
        {[{ id: 'all', label: `All (${sensors.length})` }, { id: 'critical', label: `Critical (${statusCounts.critical})` }, { id: 'warning', label: `Warning (${statusCounts.warning})` }, { id: 'normal', label: `Normal (${statusCounts.normal})` }].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f.id ? 'bg-primary-600 text-white' : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-600'}`}>{f.label}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.slice(0, 24).map((s, i) => {
          const animal = sampleAnimals.find(a => a.id === s.animalId);
          return (
            <motion.div key={s.sensorId + i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}
              className={`p-4 rounded-2xl border ${s.status === 'critical' ? 'bg-danger-50 dark:bg-danger-900/20 border-danger-200' : s.status === 'warning' ? 'bg-warning-50 dark:bg-warning-900/20 border-warning-200' : 'bg-white dark:bg-secondary-800 border-secondary-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-secondary-900 dark:text-white">{animal?.commonName || s.animalId}</span>
                <span className={`text-xs font-medium ${SENSOR_COLORS[s.status]}`}>{s.status}</span>
              </div>
              <div className="text-2xl font-bold text-secondary-900 dark:text-white">{s.value} <span className="text-sm font-normal text-secondary-400">{s.unit}</span></div>
              <div className="text-xs text-secondary-400 mt-1">{s.type} · {new Date(s.timestamp).toLocaleString()}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// === SPECIES IDENTIFICATION ===
function SpeciesIdentifier() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const identify = () => {
    const q = query.toLowerCase();
    const matches = sampleAnimals.filter(a =>
      a.commonName.toLowerCase().includes(q) ||
      a.scientificName.toLowerCase().includes(q) ||
      a.habitat?.some(h => h.toLowerCase().includes(q)) ||
      a.category.toLowerCase().includes(q) ||
      a.conservationStatus.toLowerCase().includes(q)
    ).slice(0, 6);
    setResults(matches);
  };

  return (
    <div className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4 flex items-center gap-2"><SearchIcon className="w-5 h-5 text-primary-600" /> Species Identification</h3>
      <p className="text-sm text-secondary-500 mb-4">Describe what you see — habitat, size, features, or location — and our database will match it.</p>
      <div className="flex gap-2 mb-4">
        <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && identify()} placeholder="e.g. large cat, Africa, savanna, spotted..." className="flex-1 px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
        <button onClick={identify} className="px-6 py-3 rounded-xl bg-primary-600 text-white hover:bg-primary-700">Identify</button>
      </div>
      {results.length > 0 && (
        <div className="space-y-3">
          {results.map(a => (
            <div key={a.id} className="flex items-center gap-4 p-4 rounded-xl bg-secondary-50 dark:bg-secondary-700/50">
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600"><PawIcon className="w-6 h-6" /></div>
              <div className="flex-1">
                <h4 className="font-semibold text-secondary-900 dark:text-white">{a.commonName}</h4>
                <p className="text-sm text-secondary-500 italic">{a.scientificName}</p>
                <p className="text-xs text-secondary-400 mt-1">{a.habitat?.join(', ')} · {a.conservationStatus} · ~{a.populationEstimate?.toLocaleString() || 'N/A'}</p>
              </div>
              <a href={`/animal/${a.id}`} className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm hover:bg-primary-700">Profile →</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// === SHELTER MATCHING ===
function ShelterMatcher({ matches, onMatch, onAdopt }: any) {
  const [answers, setAnswers] = useState({ species: 'Any', size: 'Any', energy: 'Any', kids: false, experience: 'Experienced' });
  const [showResults, setShowResults] = useState(matches.length > 0);

  const handleMatch = () => {
    onMatch(answers);
    setShowResults(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Find Your Perfect Pet</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-xs font-medium text-secondary-500 mb-1 block">Species</label>
            <select value={answers.species} onChange={e => setAnswers(a => ({ ...a, species: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-700 text-sm">
              <option>Any</option><option>Dog</option><option>Cat</option><option>Rabbit</option><option>Bird</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-secondary-500 mb-1 block">Size</label>
            <select value={answers.size} onChange={e => setAnswers(a => ({ ...a, size: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-700 text-sm">
              <option>Any</option><option>Small</option><option>Medium</option><option>Large</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-secondary-500 mb-1 block">Energy Level</label>
            <select value={answers.energy} onChange={e => setAnswers(a => ({ ...a, energy: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-700 text-sm">
              <option>Any</option><option>Calm</option><option>Active</option><option>Playful</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2 text-sm text-secondary-700 dark:text-secondary-300">
            <input type="checkbox" checked={answers.kids} onChange={e => setAnswers(a => ({ ...a, kids: e.target.checked }))} className="rounded" />
            Has children at home
          </label>
          <select value={answers.experience} onChange={e => setAnswers(a => ({ ...a, experience: e.target.value }))} className="px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-700 text-sm">
            <option>First-time</option><option>Experienced</option>
          </select>
        </div>
        <button onClick={handleMatch} className="w-full py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700">Find Matches</button>
      </div>

      {showResults && matches.length > 0 && (
        <div className="space-y-3">
          {matches.map((m: ShelterMatch) => (
            <motion.div key={m.petId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl border ${m.adopted ? 'bg-success-50 dark:bg-success-900/10 border-success-200' : 'bg-white dark:bg-secondary-800 border-secondary-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-secondary-900 dark:text-white">{m.petName} — {m.breed}</h4>
                <span className="text-2xl font-bold text-primary-600">{m.matchScore}%</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {m.matchReasons.map((r, i) => <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-600">{r}</span>)}
              </div>
              <div className="flex items-center justify-between text-sm text-secondary-500">
                <span>{m.shelter} · {m.contact}</span>
                {!m.adopted ? (
                  <button onClick={() => onAdopt(m.petId)} className="px-4 py-1.5 rounded-lg bg-success-600 text-white text-sm hover:bg-success-700">Adopt</button>
                ) : (
                  <span className="text-success-600 font-medium">Adopted!</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// === ACCESS LOGS ===
function AccessLogger({ logs, onLog }: { logs: any[]; onLog: (l: any) => void }) {
  const [form, setForm] = useState({ serviceAnimalId: 'guide-dog-001', handlerName: '', location: '', purpose: '', duration: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!form.handlerName || !form.location) return;
    onLog({ ...form, timestamp: new Date().toISOString(), status: 'granted' });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setForm(f => ({ ...f, handlerName: '', location: '', purpose: '', duration: '' }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Log Service Animal Access</h3>
        <div className="space-y-3">
          <input value={form.handlerName} onChange={e => setForm(f => ({ ...f, handlerName: e.target.value }))} placeholder="Handler name" className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
          <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Location (e.g. JFK Airport, Gate B12)" className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
          <input value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} placeholder="Purpose of visit" className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
          <input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="Expected duration" className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
          <button onClick={handleSubmit} className="w-full py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700">
            {submitted ? 'Logged!' : 'Log Access'}
          </button>
        </div>
      </div>
      <div className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Access History ({logs.length})</h3>
        {logs.length === 0 ? <p className="text-sm text-secondary-400">No access logs yet.</p> : (
          <div className="space-y-2">
            {logs.map((l: any) => (
              <div key={l.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary-50 dark:bg-secondary-700/50">
                <span className={`w-2 h-2 rounded-full ${l.status === 'granted' ? 'bg-success-500' : l.status === 'denied' ? 'bg-danger-500' : 'bg-warning-500'}`} />
                <div className="flex-1">
                  <span className="font-medium text-secondary-900 dark:text-white">{l.handlerName}</span>
                  <span className="text-xs text-secondary-400 ml-2">@ {l.location}</span>
                </div>
                <span className="text-xs text-secondary-400">{new Date(l.timestamp).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
