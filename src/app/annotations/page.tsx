'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { sampleAnimals } from '@/data/sample/animals';
import { UsersIcon, MessageIcon } from '@/components/icons';

interface Annotation {
  id: string;
  animalId: string;
  author: string;
  content: string;
  category: 'observation' | 'correction' | 'note' | 'sighting';
  createdAt: string;
}

const CATEGORIES = [
  { id: 'observation', label: 'Observation', icon: '👁️' },
  { id: 'sighting', label: 'Sighting', icon: '📍' },
  { id: 'correction', label: 'Correction', icon: '✏️' },
  { id: 'note', label: 'Note', icon: '📝' },
];

export default function AnnotationsPage() {
  const [selectedAnimal, setSelectedAnimal] = useState(sampleAnimals[0]?.id ?? '');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<string>('observation');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (selectedAnimal) {
      fetch(`/api/v1/annotations?animalId=${selectedAnimal}`)
        .then(r => r.json())
        .then(d => { if (d.success) setAnnotations(d.data); });
    }
  }, [selectedAnimal]);

  const handleSubmit = async () => {
    if (!author.trim() || !content.trim()) {
      setMessage('Please enter your name and annotation content.');
      return;
    }
    const res = await fetch('/api/v1/annotations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ animalId: selectedAnimal, author, content, category }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage('Annotation added!');
      setAnnotations(prev => [data.data, ...prev]);
      setContent('');
    } else {
      setMessage(data.error || 'Failed to add annotation.');
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/v1/annotations?id=${id}`, { method: 'DELETE' });
    setAnnotations(prev => prev.filter(a => a.id !== id));
  };

  const animal = sampleAnimals.find(a => a.id === selectedAnimal);

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-950 dark:to-secondary-900">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <UsersIcon className="w-14 h-14 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-secondary-900 dark:text-white mb-4">Community Annotations</h1>
          <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto">
            Contribute observations, corrections, and notes to species profiles. Help build a global knowledge base.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submit Form */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white dark:bg-secondary-800 rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-4">Add Annotation</h2>

            {message && (
              <div className="mb-4 p-3 rounded-xl bg-primary-50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-300 text-sm">{message}</div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Species</label>
              <select value={selectedAnimal} onChange={e => setSelectedAnimal(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-900 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none">
                {sampleAnimals.map(a => (
                  <option key={a.id} value={a.id}>{a.commonName} ({a.conservationStatus})</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => setCategory(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-sm transition-colors ${
                      category === c.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-300'
                    }`}>
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Your Name</label>
              <input type="text" value={author} onChange={e => setAuthor(e.target.value)}
                placeholder="Your name or handle"
                className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-900 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Annotation</label>
              <textarea value={content} onChange={e => setContent(e.target.value)}
                placeholder="Share your observation, correction, or note..."
                rows={4} maxLength={2000}
                className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-900 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none" />
              <div className="text-xs text-secondary-400 mt-1">{content.length}/2000</div>
            </div>

            <button onClick={handleSubmit}
              className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors">
              Submit Annotation
            </button>
          </motion.div>

          {/* Annotations List */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="bg-white dark:bg-secondary-800 rounded-3xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-4">
                Annotations for {animal?.commonName ?? 'Selected Species'}
              </h2>
              {annotations.length === 0 ? (
                <div className="text-center py-8">
                  <MessageIcon className="w-10 h-10 text-secondary-300 mx-auto mb-3" />
                  <p className="text-secondary-500">No annotations yet. Be the first to contribute!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {annotations.map(ann => {
                    const cat = CATEGORIES.find(c => c.id === ann.category);
                    return (
                      <div key={ann.id} className="p-4 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{cat?.icon ?? '📝'}</span>
                            <span className="font-medium text-sm text-secondary-900 dark:text-white">{ann.author}</span>
                            <span className="text-xs px-2 py-0.5 rounded-lg bg-secondary-200 dark:bg-secondary-600 text-secondary-600 dark:text-secondary-300">{ann.category}</span>
                          </div>
                          <button onClick={() => handleDelete(ann.id)}
                            className="text-xs text-danger-500 hover:text-danger-600">Remove</button>
                        </div>
                        <p className="text-sm text-secondary-700 dark:text-secondary-300 mt-2">{ann.content}</p>
                        <div className="text-xs text-secondary-400 mt-2" suppressHydrationWarning>
                          {new Date(ann.createdAt).toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}