'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePetTracker, Pet, PetCareNeed } from '@/lib/usePetTracker';
import { PawIcon, ShieldIcon, CalendarIcon, ChartIcon, XIcon, AntennaIcon } from '@/components/icons';

const SPECIES_OPTIONS = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Fish', 'Turtle', 'Horse', 'Other'];
const PRIORITY_COLORS = {
  urgent: 'bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-800 text-danger-700 dark:text-danger-400',
  upcoming: 'bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800 text-warning-700 dark:text-warning-400',
  routine: 'bg-secondary-50 dark:bg-secondary-700/50 border-secondary-200 dark:border-secondary-600 text-secondary-600 dark:text-secondary-400',
};
const NEED_ICONS: Record<string, string> = {
  vaccination: '💉',
  'vet-visit': '🏥',
  medication: '💊',
  feeding: '🍖',
  exercise: '🏃',
};

export default function PetTracker() {
  const {
    pets, loaded, addPet, removePet,
    addVaccination, addVetVisit, addMedication, addFeeding, addExerciseGoal,
    getCareNeeds,
  } = usePetTracker();

  const [showForm, setShowForm] = useState(false);
  const [selectedPet, setSelectedPet] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pets' | 'add'>('dashboard');

  // Form state
  const [form, setForm] = useState({ name: '', species: 'Dog', breed: '', age: 0, weight: 0, color: '', microchipId: '' });

  const careNeeds = useMemo(() => getCareNeeds(), [pets, getCareNeeds]);
  const urgentCount = careNeeds.filter(n => n.priority === 'urgent').length;
  const upcomingCount = careNeeds.filter(n => n.priority === 'upcoming').length;

  const handleAddPet = () => {
    if (!form.name.trim() || !form.breed.trim()) return;
    addPet({
      name: form.name.trim(),
      species: form.species,
      breed: form.breed.trim(),
      age: form.age,
      weight: form.weight,
      color: form.color.trim(),
      microchipId: form.microchipId.trim() || undefined,
    });
    setForm({ name: '', species: 'Dog', breed: '', age: 0, weight: 0, color: '', microchipId: '' });
    setShowForm(false);
    setActiveTab('pets');
  };

  const pet = pets.find(p => p.id === selectedPet);

  if (!loaded) {
    return (
      <div className="text-center py-12 text-secondary-400">
        <PawIcon className="w-12 h-12 mx-auto mb-3 opacity-30 animate-pulse" />
        <p>Loading your pets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {[
          { id: 'dashboard', label: 'Care Dashboard', icon: <ChartIcon className="w-4 h-4" /> },
          { id: 'pets', label: 'My Pets', icon: <PawIcon className="w-4 h-4" /> },
          { id: 'add', label: 'Add Pet', icon: <span className="text-lg">+</span> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                : 'bg-white dark:bg-secondary-800 text-secondary-600 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.id === 'dashboard' && urgentCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-danger-500 text-white">{urgentCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Care Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4">
          {pets.length === 0 ? (
            <EmptyState message="Add a pet first to see their care needs" onAdd={() => setActiveTab('add')} />
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Pets', value: pets.length.toString(), color: 'text-primary-600' },
                  { label: 'Urgent', value: urgentCount.toString(), color: urgentCount > 0 ? 'text-danger-600' : 'text-secondary-400' },
                  { label: 'Upcoming', value: upcomingCount.toString(), color: 'text-warning-600' },
                  { label: 'Routine', value: careNeeds.filter(n => n.priority === 'routine').length.toString(), color: 'text-success-600' },
                ].map(card => (
                  <div key={card.label} className="bg-white dark:bg-secondary-800 rounded-xl p-4 shadow-md text-center">
                    <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                    <div className="text-xs text-secondary-400">{card.label}</div>
                  </div>
                ))}
              </div>

              {/* Care needs list */}
              <div className="space-y-2">
                {careNeeds.map((need, i) => (
                  <motion.div
                    key={`${need.petId}-${need.type}-${i}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${PRIORITY_COLORS[need.priority]}`}
                  >
                    <span className="text-xl">{NEED_ICONS[need.type]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{need.title}</div>
                      <div className="text-xs opacity-75">{need.description}</div>
                    </div>
                    {need.dueDate && (
                      <span className="text-xs whitespace-nowrap opacity-75">
                        {new Date(need.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      need.priority === 'urgent' ? 'bg-danger-100 text-danger-700' :
                      need.priority === 'upcoming' ? 'bg-warning-100 text-warning-700' :
                      'bg-secondary-100 text-secondary-600'
                    }`}>
                      {need.priority}
                    </span>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* My Pets */}
      {activeTab === 'pets' && (
        <div className="space-y-4">
          {pets.length === 0 ? (
            <EmptyState message="No pets added yet" onAdd={() => setActiveTab('add')} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pets.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${
                    selectedPet === p.id ? 'ring-2 ring-primary-500' : ''
                  }`}
                  onClick={() => { setSelectedPet(p.id); setActiveTab('dashboard'); }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">{p.name}</h3>
                      <p className="text-sm text-secondary-500">{p.breed}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removePet(p.id); }}
                      className="p-1 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-400 transition-colors"
                      aria-label={`Remove ${p.name}`}
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-secondary-500">
                    <div><span className="font-medium text-secondary-700 dark:text-secondary-300">Species:</span> {p.species}</div>
                    <div><span className="font-medium text-secondary-700 dark:text-secondary-300">Age:</span> {p.age} yrs</div>
                    <div><span className="font-medium text-secondary-700 dark:text-secondary-300">Weight:</span> {p.weight} kg</div>
                    <div><span className="font-medium text-secondary-700 dark:text-secondary-300">Color:</span> {p.color}</div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {p.vaccinations.length > 0 && <span className="px-2 py-0.5 rounded-full text-xs bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400">{p.vaccinations.length} vax</span>}
                    {p.medications.length > 0 && <span className="px-2 py-0.5 rounded-full text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400">{p.medications.length} meds</span>}
                    {p.feedings.length > 0 && <span className="px-2 py-0.5 rounded-full text-xs bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400">{p.feedings.length} meals</span>}
                    {p.exerciseGoals.length > 0 && <span className="px-2 py-0.5 rounded-full text-xs bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400">{p.exerciseGoals.length} goals</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Pet Form */}
      {activeTab === 'add' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg max-w-lg mx-auto"
        >
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4 flex items-center gap-2">
            <PawIcon className="w-5 h-5 text-primary-600" />
            Add a New Pet
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Buddy"
                className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Species</label>
                <select
                  value={form.species}
                  onChange={e => setForm(f => ({ ...f, species: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                >
                  {SPECIES_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Breed *</label>
                <input
                  type="text"
                  value={form.breed}
                  onChange={e => setForm(f => ({ ...f, breed: e.target.value }))}
                  placeholder="e.g. Golden Retriever"
                  className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Age (yrs)</label>
                <input
                  type="number"
                  value={form.age}
                  onChange={e => setForm(f => ({ ...f, age: Number(e.target.value) }))}
                  min={0}
                  className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={form.weight}
                  onChange={e => setForm(f => ({ ...f, weight: Number(e.target.value) }))}
                  min={0}
                  step={0.1}
                  className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Color</label>
                <input
                  type="text"
                  value={form.color}
                  onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  placeholder="e.g. Brown"
                  className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Microchip ID (optional)</label>
              <input
                type="text"
                value={form.microchipId}
                onChange={e => setForm(f => ({ ...f, microchipId: e.target.value }))}
                placeholder="e.g. 982000123456789"
                className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleAddPet}
              disabled={!form.name.trim() || !form.breed.trim()}
              className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Pet
            </button>
          </div>
        </motion.div>
      )}

      {/* Privacy note */}
      <p className="text-center text-xs text-secondary-400 mt-4">
        All data is stored locally in your browser. Nothing is sent to any server.
      </p>
    </div>
  );
}

function EmptyState({ message, onAdd }: { message: string; onAdd: () => void }) {
  return (
    <div className="text-center py-12 bg-white dark:bg-secondary-800 rounded-2xl shadow-lg">
      <PawIcon className="w-12 h-12 mx-auto mb-3 text-secondary-300" />
      <p className="text-secondary-500 mb-4">{message}</p>
      <button
        onClick={onAdd}
        className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors"
      >
        Add Your First Pet
      </button>
    </div>
  );
}
