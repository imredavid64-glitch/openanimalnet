'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { SearchIcon, GlobeIcon, DataIcon } from '@/components/icons';
import Link from 'next/link';

interface Match {
  species: string;
  scientificName: string;
  commonName: string;
  confidence: number;
  matchFactors: string[];
  image?: string;
  source?: 'ai' | 'heuristic';
  animalId?: string;
}

export default function IdentifyPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [results, setResults] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiConfigured, setAiConfigured] = useState(true);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Please upload an image file.'); return; }
    setError('');
    setResults([]);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      setLoading(true);
      try {
        const res = await fetch('/api/v1/identify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: dataUrl, topK: 5 }),
        });
        const data = await res.json();
        if (data.success) {
          setResults(data.data);
          if (data.aiConfigured !== undefined) setAiConfigured(data.aiConfigured);
        } else setError(data.error || 'Identification failed');
      } catch { setError('Network error — please try again.'); }
      setLoading(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const confidenceColor = (c: number) => c >= 80 ? 'text-success-600' : c >= 50 ? 'text-warning-600' : 'text-secondary-500';

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-950 dark:to-secondary-900">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <DataIcon className="w-14 h-14 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-secondary-900 dark:text-white mb-4">AI Species Identification</h1>
          <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto">
            Upload a photo and our AI will identify the species.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-2xl mx-auto mb-12">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInput.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 ${
              preview
                ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/10'
                : 'border-secondary-300 dark:border-secondary-600 hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/5'
            }`}
          >
            <input ref={fileInput} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            {preview ? (
              <img src={preview} alt="Uploaded" className="max-h-64 mx-auto rounded-2xl shadow-lg" />
            ) : (
              <>
                <DataIcon className="w-16 h-16 text-secondary-300 dark:text-secondary-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">Upload a Wildlife Photo</h3>
                <p className="text-secondary-500 dark:text-secondary-400">Drag & drop or click to select — JPG, PNG, WebP</p>
              </>
            )}
          </div>
          {error && <p className="text-danger-500 text-sm mt-3 text-center">{error}</p>}
        </motion.div>

        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
              <GlobeIcon className="w-12 h-12 text-primary-600 animate-spin mx-auto" />
              <p className="text-secondary-500 mt-4">Analyzing image with AI...</p>
            </motion.div>
          )}

          {results.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-6 text-center">Identification Results</h2>
              {!aiConfigured && results.some(r => r.source === 'heuristic') && (
                <div className="mb-4 p-3 rounded-xl bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 text-warning-800 dark:text-warning-200 text-sm">
                  ⚠️ Heuristic (simulated) results — no AI vision model is configured. Set <code className="px-1 bg-warning-100 dark:bg-warning-800 rounded">GEMINI_API_KEY</code> or <code className="px-1 bg-warning-100 dark:bg-warning-800 rounded">ANTHROPIC_API_KEY</code> to enable real species identification.
                </div>
              )}
              <div className="space-y-4">
                {results.map((r, i) => (
                  <motion.div
                    key={r.scientificName}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-lg border border-secondary-100 dark:border-secondary-700"
                  >
                    <div className="flex items-center gap-4">
                      {r.image && <div className="w-16 h-16 rounded-xl bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${r.image})` }} />}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-secondary-900 dark:text-white">{r.commonName}</h3>
                            <p className="text-sm italic text-secondary-500">{r.scientificName}</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-2xl font-bold font-data ${confidenceColor(r.confidence)}`}>{r.confidence}%</span>
                            <p className="text-xs text-secondary-400">confidence</p>
                            {r.source && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${r.source === 'ai' ? 'bg-success-100 dark:bg-success-900/20 text-success-700 dark:text-success-300' : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-500'}`}>
                                {r.source === 'ai' ? '🧠 AI Vision' : '📊 Heuristic'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {r.matchFactors.map(f => (
                            <span key={f} className="px-2 py-0.5 rounded-lg text-xs bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-300">{f}</span>
                          ))}
                        </div>
                        <Link href={r.animalId ? `/animal/${r.animalId}` : `/animal/${r.species?.toLowerCase().replace(/\s+/g, '-')}`}
                          className="text-sm text-primary-600 dark:text-primary-400 hover:underline mt-2 inline-block">
                          View full profile →
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}