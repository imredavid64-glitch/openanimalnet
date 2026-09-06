'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { sampleAnimals } from '@/data/sample/animals';
import { DataIcon, DownloadIcon } from '@/components/icons';

const FORMATS = [
  { id: 'geojson', label: 'GeoJSON', ext: '.geojson', mime: 'application/geo+json', desc: 'Standard format for GIS tools (QGIS, ArcGIS, Mapbox)' },
  { id: 'csv', label: 'CSV', ext: '.csv', mime: 'text/csv', desc: 'Spreadsheet-compatible (Excel, Google Sheets)' },
  { id: 'kml', label: 'KML', ext: '.kml', mime: 'application/vnd.google-earth.kml+xml', desc: 'Google Earth & Google Maps format' },
];

const CATEGORIES = ['all', ...Array.from(new Set(sampleAnimals.map(a => a.category)))];

export default function DataExportPage() {
  const [format, setFormat] = useState('geojson');
  const [category, setCategory] = useState('all');
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    const url = `/api/v1/export?format=${format}${category !== 'all' ? `&category=${category}` : ''}`;
    window.open(url, '_blank');
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const filteredCount = category === 'all' ? sampleAnimals.length : sampleAnimals.filter(a => a.category === category).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-950 dark:to-secondary-900">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <DataIcon className="w-14 h-14 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-secondary-900 dark:text-white mb-4">Data Export</h1>
          <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto">
            Download the complete species dataset in GeoJSON, CSV, or KML format for researchers and conservationists.
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {/* Format Selection */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white dark:bg-secondary-800 rounded-3xl p-6 shadow-lg mb-6">
            <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-4">Export Format</h2>
            <div className="space-y-3">
              {FORMATS.map(f => (
                <button key={f.id} onClick={() => setFormat(f.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    format === f.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                      : 'border-secondary-200 dark:border-secondary-700 hover:border-secondary-300'
                  }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-secondary-900 dark:text-white">{f.label}</span>
                      <span className="text-secondary-400 ml-2 text-sm">{f.ext}</span>
                    </div>
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${format === f.id ? 'border-primary-500 bg-primary-500' : 'border-secondary-300'}`}>
                      {format === f.id && <span className="w-2 h-2 bg-white rounded-full" />}
                    </span>
                  </div>
                  <p className="text-sm text-secondary-500 mt-1">{f.desc}</p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Category Filter */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white dark:bg-secondary-800 rounded-3xl p-6 shadow-lg mb-6">
            <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-4">Filter by Category</h2>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    category === c
                      ? 'bg-primary-600 text-white'
                      : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-200'
                  }`}>
                  {c === 'all' ? 'All Species' : c}
                </button>
              ))}
            </div>
            <p className="text-sm text-secondary-500 mt-3">{filteredCount} species will be exported</p>
          </motion.div>

          {/* Download Button */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-center">
            <button onClick={handleDownload}
              className="px-8 py-4 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-lg font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto">
              <DownloadIcon className="w-5 h-5" />
              {downloaded ? 'Downloaded!' : `Download ${format.toUpperCase()} (${filteredCount} species)`}
            </button>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}