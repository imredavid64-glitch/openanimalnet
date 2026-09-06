'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { sampleAnimals } from '@/data/sample/animals';
import { ShieldIcon } from '@/components/icons';

interface Subscription {
  id: string;
  email: string;
  speciesIds: string[];
  regions: { lat: number; lng: number; radiusKm: number }[];
  alertTypes: string[];
  createdAt: string;
}

const PRESETS = [
  { label: 'Amboseli, Kenya', lat: -2.65, lng: 37.25 },
  { label: 'Masai Mara, Kenya', lat: -1.4, lng: 35.1 },
  { label: 'Sundarbans, India', lat: 21.9, lng: 89.0 },
  { label: 'Serengeti, Tanzania', lat: -2.3, lng: 34.8 },
  { label: 'Amazon Basin', lat: -3.5, lng: -60.0 },
];

export default function SubscriptionsPage() {
  const [email, setEmail] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  const [alertTypes, setAlertTypes] = useState<string[]>(['critical', 'warning']);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    if (email) {
      fetch(`/api/v1/subscriptions?email=${encodeURIComponent(email)}`)
        .then(r => r.json())
        .then(d => { if (d.success) setSubscriptions(d.data); });
    }
  }, [email]);

  const handleSubscribe = async () => {
    if (!email || selectedSpecies.length === 0) {
      setMessage('Please enter an email and select at least one species.');
      return;
    }
    const res = await fetch('/api/v1/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        speciesIds: selectedSpecies,
        alertTypes,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage('Subscription created! You\'ll receive alerts for your selected species.');
      setSubscriptions(prev => [...prev, data.data]);
      setSelectedSpecies([]);
    } else {
      setMessage(data.error || 'Failed to create subscription.');
    }
  };

  const handleUnsubscribe = async (id: string) => {
    await fetch(`/api/v1/subscriptions?id=${id}`, { method: 'DELETE' });
    setSubscriptions(prev => prev.filter(s => s.id !== id));
    setMessage('Subscription removed.');
  };

  const toggleSpecies = (id: string) => {
    setSelectedSpecies(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-950 dark:to-secondary-900">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <ShieldIcon className="w-14 h-14 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-secondary-900 dark:text-white mb-4">Alert Subscriptions</h1>
          <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto">
            Get notified when critical or warning alerts are triggered for the species you care about.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {message && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mb-6 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-300 text-sm text-center">
              {message}
            </motion.div>
          )}

          {/* Subscription Form */}
          {showForm && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white dark:bg-secondary-800 rounded-3xl p-6 shadow-lg mb-8">
              <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-4">Create Subscription</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-900 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">Select Species</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {sampleAnimals.map(a => (
                    <button key={a.id} onClick={() => toggleSpecies(a.id)}
                      className={`text-left p-2 rounded-lg text-xs transition-colors ${
                        selectedSpecies.includes(a.id)
                          ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium'
                          : 'bg-secondary-50 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100'
                      }`}>
                      {a.commonName} <span className="opacity-50">({a.conservationStatus})</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">Alert Types</label>
                <div className="flex gap-3">
                  {['critical', 'warning', 'info'].map(type => (
                    <button key={type} onClick={() => setAlertTypes(prev =>
                      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                    )}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        alertTypes.includes(type)
                          ? type === 'critical' ? 'bg-danger-500 text-white' : type === 'warning' ? 'bg-warning-500 text-white' : 'bg-primary-500 text-white'
                          : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-300'
                      }`}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleSubscribe}
                className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors">
                Subscribe to Alerts
              </button>
            </motion.div>
          )}

          {/* Existing Subscriptions */}
          {subscriptions.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white dark:bg-secondary-800 rounded-3xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-4">Your Subscriptions</h2>
              <div className="space-y-3">
                {subscriptions.map(sub => (
                  <div key={sub.id} className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                    <div>
                      <div className="text-sm font-medium text-secondary-900 dark:text-white">{sub.speciesIds.length} species</div>
                      <div className="text-xs text-secondary-500">Types: {sub.alertTypes.join(', ')}</div>
                    </div>
                    <button onClick={() => handleUnsubscribe(sub.id)}
                      className="px-3 py-1.5 rounded-lg text-xs bg-danger-100 dark:bg-danger-900/20 text-danger-600 dark:text-danger-400 hover:bg-danger-200 transition-colors">
                      Unsubscribe
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}