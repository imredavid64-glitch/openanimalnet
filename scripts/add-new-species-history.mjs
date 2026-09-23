#!/usr/bin/env node
/**
 * Add populationHistory to the 9 newly added species.
 */

import fs from 'fs';
import path from 'path';

const DATA_FILE = path.resolve('src/data/sample/animals.ts');

const NEW_SPECIES_HISTORY = {
  'philippine-eagle-001': [
    { year: 1990, estimate: 500 },
    { year: 2000, estimate: 400 },
    { year: 2010, estimate: 300 },
    { year: 2018, estimate: 400 },
  ],
  'harpy-eagle-001': [
    { year: 1990, estimate: 50000 },
    { year: 2000, estimate: 20000 },
    { year: 2018, estimate: 15000 },
  ],
  'golden-poison-frog-001': [
    { year: 2000, estimate: 5000 },
    { year: 2010, estimate: 3000 },
    { year: 2018, estimate: 1500 },
  ],
  'chinese-giant-salamander-001': [
    { year: 1950, estimate: 1000000 },
    { year: 1980, estimate: 100000 },
    { year: 2000, estimate: 10000 },
    { year: 2018, estimate: 1000 },
  ],
  'elkhorn-coral-001': [
    { year: 1970, estimate: 100 },
    { year: 1980, estimate: 50 },
    { year: 2005, estimate: 10 },
    { year: 2015, estimate: 5 },
  ],
  'staghorn-coral-001': [
    { year: 1970, estimate: 100 },
    { year: 1980, estimate: 50 },
    { year: 2005, estimate: 10 },
    { year: 2015, estimate: 5 },
  ],
  'lord-howe-tree-lobster-001': [
    { year: 1918, estimate: 100000 },
    { year: 1960, estimate: 0 },
    { year: 2001, estimate: 24 },
    { year: 2017, estimate: 300 },
  ],
  'rusty-patched-bumble-bee-001': [
    { year: 1990, estimate: 1000000 },
    { year: 2000, estimate: 100000 },
    { year: 2017, estimate: 500 },
  ],
  'whale-shark-001': [
    { year: 1990, estimate: 100000 },
    { year: 2005, estimate: 50000 },
    { year: 2016, estimate: 10000 },
    { year: 2020, estimate: 7000 },
  ],
};

async function main() {
  let content = fs.readFileSync(DATA_FILE, 'utf8');
  let updated = 0;

  for (const [id, history] of Object.entries(NEW_SPECIES_HISTORY)) {
    // Find the species block and add populationHistory after populationEstimate
    const speciesRegex = new RegExp(`(id: \"${id}\",[\\s\\S]*?populationEstimate:\\s*\\d+,[\\s\\S]*?dataCategories:)`);
    const match = content.match(speciesRegex);
    if (!match) {
      console.log(`⚠️  Could not find species ${id}`);
      continue;
    }

    const historyStr = history.map(p => `      { year: ${p.year}, estimate: ${p.estimate} }`).join(',\n');
    const replacement = `$1\n    populationHistory: [\n${historyStr}\n    ],\n    populationHistoryNote: "Added via enrichment script",\n    $2`;

    const newContent = content.replace(speciesRegex, replacement);
    if (newContent === content) {
      console.log(`⚠️  No change for ${id}`);
      continue;
    }
    content = newContent;
    updated++;
    console.log(`✅ Added populationHistory for ${id} (${history.length} points)`);
  }

  fs.writeFileSync(DATA_FILE, content);
  console.log(`\n🎉 Added populationHistory to ${updated} new species`);
}

main().catch(e => { console.error(e); process.exit(1); });