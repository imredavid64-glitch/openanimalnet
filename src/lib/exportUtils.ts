// Export helper utilities for converting species data to GeoJSON and CSV

export function exportSpeciesGeoJSON() {
  const features = [
    {
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [36.8219, -1.2921],
      },
      properties: {
        id: 'lion-001',
        commonName: 'African Lion',
        category: 'mammals',
        conservationStatus: 'VU',
      },
    },
  ];

  return {
    type: 'FeatureCollection' as const,
    features,
  };
}

export function exportSpeciesCSV() {
  const headers = ['id', 'commonName', 'category', 'conservationStatus'];
  const rows = ['lion-001,"African Lion",mammals,VU'];
  return [headers.join(','), ...rows].join('\n');
}
