import { NextResponse } from 'next/server';
import { sampleAnimals } from '@/data/sample/animals';
import { applyRateLimit } from '@/lib/apiRateLimit';
import type { ApiResponse } from '@/types/animal/types';

export const dynamic = 'force-dynamic';

type ExportFormat = 'geojson' | 'csv' | 'kml';

function toGeoJSON(animals: typeof sampleAnimals) {
  return {
    type: 'FeatureCollection',
    features: animals.map(a => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [a.location.longitude, a.location.latitude] },
      properties: {
        id: a.id, commonName: a.commonName, scientificName: a.scientificName,
        category: a.category, conservationStatus: a.conservationStatus,
        populationEstimate: a.populationEstimate, isMonitored: a.isMonitored,
        habitat: a.habitat, description: a.description,
      },
    })),
  };
}

function toCSV(animals: typeof sampleAnimals) {
  const headers = ['id', 'commonName', 'scientificName', 'category', 'conservationStatus', 'latitude', 'longitude', 'populationEstimate', 'isMonitored', 'habitat'];
  const rows = animals.map(a => [
    a.id, `"${a.commonName}"`, `"${a.scientificName}"`, a.category, a.conservationStatus,
    a.location.latitude, a.location.longitude, a.populationEstimate ?? '',
    a.isMonitored, `"${(a.habitat ?? []).join('; ')}"`,
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

function toKML(animals: typeof sampleAnimals) {
  const placemarks = animals.map(a => `
    <Placemark>
      <name>${a.commonName} (${a.scientificName})</name>
      <description>Population: ${a.populationEstimate ?? 'N/A'} | Status: ${a.conservationStatus}</description>
      <Point><coordinates>${a.location.longitude},${a.location.latitude},0</coordinates></Point>
    </Placemark>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>OpenAnimalNet Species</name>
    <description>All tracked species locations</description>
    ${placemarks}
  </Document>
</kml>`;
}

/**
 * GET /api/v1/export?format=geojson|csv|kml
 * Export the entire species dataset in GeoJSON, CSV, or KML format.
 */
export async function GET(request: Request) {
  const limited = applyRateLimit(request);
  if (limited) return limited;

  const format = (new URL(request.url).searchParams.get('format') ?? 'geojson') as ExportFormat;
  const category = new URL(request.url).searchParams.get('category');

  let animals = category
    ? sampleAnimals.filter(a => a.category === category)
    : sampleAnimals;

  let data: string;
  let contentType: string;
  let extension: string;

  switch (format) {
    case 'csv':
      data = toCSV(animals);
      contentType = 'text/csv';
      extension = 'csv';
      break;
    case 'kml':
      data = toKML(animals);
      contentType = 'application/vnd.google-earth.kml+xml';
      extension = 'kml';
      break;
    case 'geojson':
    default:
      data = JSON.stringify(toGeoJSON(animals), null, 2);
      contentType = 'application/geo+json';
      extension = 'geojson';
      break;
  }

  return new NextResponse(data, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="openanimalnet-species.${extension}"`,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}