'use client';

import React from 'react';
import { exportSpeciesGeoJSON, exportSpeciesCSV } from '@/lib/exportUtils';
import { animals } from '@/data/sample/animals';

export default function DataExportPage() {
  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportGeoJSON = () => {
    const geojson = exportSpeciesGeoJSON();
    downloadFile(JSON.stringify(geojson, null, 2), 'openanimalnet-species.geojson', 'application/geo+json');
  };

  const handleExportCSV = () => {
    const csv = exportSpeciesCSV();
    downloadFile(csv, 'openanimalnet-species.csv', 'text/csv');
  };

  const handleExportJSON = () => {
    downloadFile(JSON.stringify(animals, null, 2), 'openanimalnet-full-catalog.json', 'application/json');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          <span>Open Data</span>
          <span>•</span>
          <span>Multi-Format Export Studio</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
          Data Export Studio
        </h1>
        <p className="text-slate-600 dark:text-slate-300 mt-2">
          Download OpenAnimalNet species datasets, telemetry coordinates, and conservation statuses in open standard formats.
        </p>
      </div>

      {/* Dataset Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* GeoJSON Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 flex flex-col justify-between">
          <div>
            <div className="text-3xl">🗺️</div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-2">GeoJSON FeatureCollection</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Geospatial point features with coordinates and species properties for QGIS, ArcGIS, or Leaflet maps.
            </p>
          </div>
          <button
            onClick={handleExportGeoJSON}
            className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-500 transition"
          >
            Download .geojson →
          </button>
        </div>

        {/* CSV Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 flex flex-col justify-between">
          <div>
            <div className="text-3xl">📊</div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-2">Tabular CSV Format</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Comma-separated tabular dataset compatible with Excel, Google Sheets, R, and pandas.
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-500 transition"
          >
            Download .csv →
          </button>
        </div>

        {/* JSON Catalog Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 flex flex-col justify-between">
          <div>
            <div className="text-3xl">📦</div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-2">Full JSON Catalog</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Complete raw JSON records including census timelines, migration routes, and taxonomy metadata.
            </p>
          </div>
          <button
            onClick={handleExportJSON}
            className="w-full py-2.5 bg-slate-800 text-white rounded-xl font-bold text-xs hover:bg-slate-700 transition"
          >
            Download .json →
          </button>
        </div>
      </div>
    </div>
  );
}
