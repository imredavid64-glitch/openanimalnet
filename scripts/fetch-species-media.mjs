#!/usr/bin/env node
/**
 * Fetch additional species images from WikiMedia Commons.
 * Usage: node scripts/fetch-species-media.mjs [--apply] [--species=<id>]
 */

import fs from 'fs';
import path from 'path';
import https from 'https';

const SPECIES_DIR = path.resolve('public/images/animals');
const DATA_FILE = path.resolve('src/data/sample/animals.ts');

const UA = 'OpenAnimalNet/1.0 (contact@openanimalnet.org)';

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': UA } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          reject(new Error(`JSON parse failed: ${e.message}\nRaw: ${data.slice(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const req = https.get(url, { headers: { 'User-Agent': UA } }, res => {
      if (res.statusCode !== 200) {
        file.close();
        fs.unlink(destPath, () => {});
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve()));
      file.on('error', err => {
        file.close();
        fs.unlink(destPath, () => {});
        reject(err);
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); file.close(); fs.unlink(destPath, () => {}); reject(new Error('Download timeout')); });
  });
}

async function searchWikiMediaCommons(query, limit = 5) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=${limit}&format=json`;
  return httpGet(url);
}

async function getImageInfo(filename) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(filename)}&prop=imageinfo&iiprop=url|extmetadata&format=json`;
  return httpGet(url);
}

async function fetchSpeciesImages(species, maxImages = 3) {
  console.log(`\n🔍 Searching images for ${species.commonName} (${species.scientificName})...`);
  const queries = [
    `${species.scientificName} wild`,
    `${species.commonName} wild`,
    `${species.scientificName} in habitat`,
  ];

  const downloaded = [];
  const existingFiles = fs.readdirSync(SPECIES_DIR).filter(f => f.startsWith(species.id));

  for (const query of queries) {
    if (downloaded.length >= maxImages) break;
    console.log(`  🔎 Query: "${query}"`);
    try {
      const result = await searchWikiMediaCommons(query, 5);
      const searchResults = result.data?.query?.search || [];
      console.log(`    Found ${searchResults.length} results`);

      for (const r of searchResults) {
        if (downloaded.length >= maxImages) break;
        const filename = r.title.replace('File:', '');
        if (downloaded.some(d => d.filename === filename)) continue;

        try {
          const info = await getImageInfo(filename);
          const pages = info.data?.query?.pages;
          if (!pages) { console.log(`    ⚠️  No pages for ${filename}`); continue; }
          const page = Object.values(pages)[0];
          const imageInfo = page?.imageinfo?.[0];
          if (!imageInfo?.url) { console.log(`    ⚠️  No URL for ${filename}`); continue; }

          const ext = path.extname(imageInfo.url).split('?')[0] || '.jpg';
          const newFilename = `${species.id}-${downloaded.length + 1}${ext}`;
          const destPath = path.join(SPECIES_DIR, newFilename);

          if (fs.existsSync(destPath)) {
            console.log(`  ⏭️  Already exists: ${newFilename}`);
            downloaded.push({ filename: newFilename, url: imageInfo.url });
            continue;
          }

          console.log(`  ⬇️  Downloading: ${newFilename}`);
          await downloadFile(imageInfo.url, destPath);
          console.log(`  ✅ Saved: ${newFilename}`);
          downloaded.push({ filename: newFilename, url: imageInfo.url });

          await new Promise(r => setTimeout(r, 200)); // Be nice to the API
        } catch (e) {
          console.log(`    ⚠️  Failed ${filename}: ${e.message}`);
        }
      }
    } catch (e) {
      console.error(`  ❌ Search failed for "${query}":`, e.message);
    }
  }

  return downloaded;
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const speciesFilter = args.find(a => a.startsWith('--species='))?.split('=')[1];

  if (!fs.existsSync(SPECIES_DIR)) fs.mkdirSync(SPECIES_DIR, { recursive: true });

  const animalsContent = fs.readFileSync(DATA_FILE, 'utf8');
  const speciesMatch = animalsContent.match(/export const sampleAnimals: Animal\[\] = (\[[\s\S]*?\n\]);/);
  if (!speciesMatch) throw new Error('Could not parse animals.ts');

  const sampleAnimals = eval(speciesMatch[1]);

  const targetSpecies = speciesFilter
    ? speciesFilter.split(',').map(id => sampleAnimals.find(s => s.id === id)).filter(Boolean)
    : sampleAnimals;

  console.log(`📸 Fetching media for ${targetSpecies.length} species...`);

  const updates = {};
  for (const species of targetSpecies) {
    const newImages = await fetchSpeciesImages(species, 3);
    if (newImages.length > 0) {
      updates[species.id] = newImages.map(i => i.filename);
    }
  }

  if (apply && Object.keys(updates).length > 0) {
    console.log('\n📝 Updating animals.ts with new images...');
    let updatedContent = animalsContent;
    for (const [id, filenames] of Object.entries(updates)) {
      const escaped = filenames.map(f => `'/images/animals/${f}'`).join(', ');
      const regex = new RegExp(`(id: ['\"]${id}['\"],\\s*[\\s\\S]*?images:\\s*\\[)([\\s\\S]*?)(\\])`);
      updatedContent = updatedContent.replace(regex, (match, before, current, after) => {
        const existing = current.match(/'[^']+'/g) || [];
        const existingPaths = existing.map(e => e.slice(1, -1));
        const allPaths = [...new Set([...existingPaths, ...filenames.map(f => `/images/animals/${f}`)])];
        return `${before}${allPaths.map(p => `  '${p}'`).join(',\n')}${after}`;
      });
    }
    fs.writeFileSync(DATA_FILE, updatedContent);
    console.log('✅ animals.ts updated');
  }

  console.log('\n📊 Summary:');
  for (const [id, files] of Object.entries(updates)) {
    console.log(`  ${id}: ${files.length} new images`);
  }
}

main().catch(e => { console.error('❌ Fatal:', e); process.exit(1); });