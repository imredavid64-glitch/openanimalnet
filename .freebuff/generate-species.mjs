#!/usr/bin/env node
/**
 * Species generator — builds ready-to-apply Animal + SpeciesSource entries
 * straight from live data, so new species no longer have to be hand-written.
 *
 * For each scientific name given on the command line it pulls:
 *   - Wikidata: QID, common name, IUCN Red List assessment ID (P627),
 *     conservation status (P141), full taxonomy via the P171 parent chain,
 *     coordinates (P625, when present)
 *   - Wikipedia (REST): lead photo (downloaded locally) + description extract
 *
 * Output: printable TS snippets. With --apply the entries are appended to
 * src/data/sample/animals.ts and src/data/sample/sources.ts, and the photo is
 * written to public/images/animals/<id>.jpg.
 *
 * Fields Wikidata can't provide (population estimates, habitat lists) are
 * emitted as TODO placeholders for a human to fill from the IUCN assessment or
 * a current census.
 *
 * Usage:
 *   node .freebuff/generate-species.mjs "Panthera uncia"          # print only
 *   node .freebuff/generate-species.mjs --apply "Ailurus fulgens" # write files
 *
 * Then verify with `node .freebuff/refresh-sources.mjs --fail`.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ANIMALS_PATH = path.join(ROOT, 'src', 'data', 'sample', 'animals.ts');
const SOURCES_PATH = path.join(ROOT, 'src', 'data', 'sample', 'sources.ts');
const IMG_DIR = path.join(ROOT, 'public', 'images', 'animals');

const WIKIDATA = 'https://query.wikidata.org/sparql';
const UA = 'OpenAnimalNet-species-generator/1.0 (https://github.com/imredavid64-glitch/openanimalnet)';

// Wikidata Q-IDs for IUCN Red List categories (property P141 values).
const STATUS_BY_QID = {
  Q219127: 'CR',
  Q96377276: 'EN',
  Q278113: 'VU',
  Q719675: 'NT',
  Q211005: 'LC',
  Q3245245: 'DD',
  Q237350: 'EX',
  Q239509: 'EW',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function sparql(query, tries = 3) {
  const url = `${WIKIDATA}?${new URLSearchParams({ query })}`;
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, { headers: { Accept: 'application/sparql-results+json', 'User-Agent': UA } });
    if (res.ok) return (await res.json()).results.bindings;
    if (attempt >= tries) throw new Error(`Wikidata HTTP ${res.status}`);
    await sleep(attempt * 2500);
  }
}

/** Look up the species item by scientific name (P225). */
async function lookupSpecies(scientificName) {
  const bindings = await sparql(`SELECT ?item ?label ?iucn ?status ?common ?coord WHERE {
    VALUES ?sciname { "${scientificName}" }
    ?item wdt:P225 ?sciname .
    OPTIONAL { ?item wdt:P627 ?iucn . }
    OPTIONAL { ?item wdt:P141 ?status . }
    OPTIONAL { ?item wdt:P1843 ?common . FILTER(LANG(?common) = "en") }
    OPTIONAL { ?item wdt:P625 ?coord . }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  } LIMIT 10`);
  const exact = bindings.find((b) => b.label?.value === scientificName) ?? bindings[0];
  if (!exact) throw new Error(`no Wikidata item for "${scientificName}"`);
  return {
    qid: exact.item.value.split('/').pop(),
    label: exact.label?.value ?? scientificName,
    commonName: exact.common?.value ?? null,
    iucnId: exact.iucn ? Number(exact.iucn.value) : null,
    statusQid: exact.status ? exact.status.value.split('/').pop() : null,
    coord: exact.coord?.value ?? null,
  };
}

/**
 * Collect the full ancestor chain via the P171 property path (one query) and
 * pick the taxa at the standard ranks. Prefers the scientific name (P225);
 * falls back to the item label.
 */
// Wikidata's P171 chain is paraphyletic: bird lineages pass through
// "Reptilia" (and the chain can carry several class-ranked nodes). When that
// happens, prefer the most specific extant clade that actually appears in the
// chain instead of whatever node Wikidata ranked last.
const CLASS_PRIORITY = ['Aves', 'Mammalia', 'Amphibia', 'Reptilia', 'Actinopterygii', 'Chondrichthyes', 'Insecta'];

function bestClass(classList) {
  const lower = classList.map((c) => c.toLowerCase());
  for (const c of CLASS_PRIORITY) {
    if (lower.includes(c.toLowerCase())) return c;
  }
  return classList[classList.length - 1] ?? null;
}

async function walkTaxonomy(qid) {
  const bindings = await sparql(`SELECT ?anc ?sciname ?rankLabel WHERE {
    wd:${qid} wdt:P171+ ?anc .
    OPTIONAL { ?anc wdt:P105 ?rank . }
    OPTIONAL { ?anc wdt:P225 ?sciname . }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  }`);
  const ranks = {};
  const classRanks = [];
  for (const row of bindings) {
    const key = row.rankLabel?.value?.toLowerCase();
    if (!key) continue;
    const name = row.sciname?.value ?? row.anc.value.split('/').pop();
    if (key === 'class') classRanks.push(name);
    ranks[key] = name;
  }
  return {
    kingdom: ranks.kingdom ?? null,
    phylum: ranks.phylum ?? null,
    // Corrected class (e.g. Aves instead of a paraphyletic Reptilia node).
    class: bestClass(classRanks) ?? ranks.class ?? null,
    // The raw class Wikidata reported last, for the correction warning.
    classRaw: ranks.class ?? null,
    order: ranks.order ?? null,
    family: ranks.family ?? null,
    genus: ranks.genus ?? null,
  };
}

function inferCategory(tax) {
  const cls = (tax.class ?? '').toLowerCase();
  const ord = (tax.order ?? '').toLowerCase();
  if (ord.includes('cetacea') || ord.includes('sirenia')) return 'marine';
  if (cls.includes('mammalia')) return 'mammals';
  if (cls.includes('aves')) return 'birds';
  if (cls.includes('reptilia')) return 'reptiles';
  if (cls.includes('amphibia')) return 'amphibians';
  if (cls.includes('insecta')) return 'insects';
  if (cls.includes('actinopterygii') || cls.includes('chondrichthyes')) return 'marine';
  if (cls.includes('arachnida') || cls.includes('malacostraca')) return 'invertebrates';
  return 'mammals'; // fallback — edit by hand
}

async function wikipediaSummary(title) {
  const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`, {
    headers: { 'User-Agent': UA },
  });
  if (!res.ok) throw new Error(`Wikipedia HTTP ${res.status} for "${title}"`);
  return res.json();
}

/** Download the article's lead image at the largest available rendition. */
async function fetchImage(summary, dest, title) {
  const thumb = summary?.thumbnail?.source;
  if (!thumb) throw new Error('no thumbnail in Wikipedia summary');
  const clean = thumb.split('?')[0];
  let buf = null;
  for (const w of [500, 330, 0]) {
    const candidate = w === 0 ? clean : clean.replace(/(\d+)px-/, `${w}px-`);
    const res = await fetch(candidate, { redirect: 'follow', headers: { 'User-Agent': UA } });
    if (!res.ok) continue;
    const candidateBuf = Buffer.from(await res.arrayBuffer());
    // Only accept real JPEGs; otherwise try the next rendition down.
    if (candidateBuf.subarray(0, 3).toString('hex').startsWith('ffd8')) {
      buf = candidateBuf;
      break;
    }
  }
  // The lead image can be an SVG diagram (e.g. a size-comparison chart) rather
  // than a photo. Fall back to the article's own images: prefer a real JPEG
  // photo over a diagram so the species card shows an actual animal.
  if (!buf && title) {
    buf = await fetchArticlePhoto(title);
  }
  if (!buf) throw new Error('no valid JPEG rendition (lead image is a diagram and no article photo found)');
  fs.writeFileSync(dest, buf);
  return { url: 'fallback://article-photo', bytes: buf.length };
}

/** Find the first real JPEG photo in an article's image list (skips SVG/range maps). */
async function fetchArticlePhoto(title) {
  const listRes = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=images&imlimit=100&format=json`,
    { headers: { 'User-Agent': UA } },
  );
  if (!listRes.ok) throw new Error(`image-list HTTP ${listRes.status}`);
  const listJson = await listRes.json();
  const pages = Object.values(listJson.query?.pages ?? {});
  const images = pages.flatMap((p) => p.images ?? []).map((i) => i.title);
  // Skip diagrams/maps (SVG, range-map PNGs) — we want photos of the animal.
  const candidates = images.filter((t) => /\.jpe?g$/i.test(t));
  if (candidates.length === 0) return null;
  // Resolve URLs for all candidates in one request, then download the first that is a real JPEG.
  const infoRes = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(candidates.join('|'))}&prop=imageinfo&iiprop=url&format=json`,
    { headers: { 'User-Agent': UA } },
  );
  if (!infoRes.ok) throw new Error(`imageinfo HTTP ${infoRes.status}`);
  const infoJson = await infoRes.json();
  const urls = Object.values(infoJson.query?.pages ?? {})
    .map((p) => p.imageinfo?.[0]?.url)
    .filter(Boolean);
  for (const url of urls) {
    const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': UA } });
    if (!res.ok) continue;
    const b = Buffer.from(await res.arrayBuffer());
    if (b.subarray(0, 3).toString('hex').startsWith('ffd8')) return b;
  }
  return null;
}

/** Existing animal ids, for collision-free slug generation. */
function existingIds() {
  const src = fs.readFileSync(ANIMALS_PATH, 'utf8');
  return [...src.matchAll(/id: '([^']+)'/g)].map((m) => m[1]);
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function formatTs(x) {
  return JSON.stringify(x, null, 2)
    .replace(/"(\w+)":/g, '$1:')
    // Un-quote the Date placeholders so they're real TS `new Date(...)` expressions.
    .replace(/"new Date\('([^']+)'\)"/g, "new Date('$1')");
}

async function generate(scientificName) {
  console.log(`\n── ${scientificName} ──`);
  const sp = await lookupSpecies(scientificName);
  console.log(`QID ${sp.qid} · ${sp.label} · IUCN ${sp.iucnId ?? '—'} · status ${sp.statusQid ? STATUS_BY_QID[sp.statusQid] ?? '?' : 'NE'}`);

  const tax = await walkTaxonomy(sp.qid);
  // Guard: warn when the paraphyletic-chain correction changed the class
  // (e.g. birds resolving through Reptilia) so the entry is double-checked.
  if (tax.class && tax.classRaw && tax.class.toLowerCase() !== tax.classRaw.toLowerCase()) {
    console.log(`⚠ taxonomy guard: class ${tax.classRaw} → ${tax.class} (preferred extant clade in the P171 chain)`);
  } else if (!tax.class) {
    console.log('⚠ taxonomy guard: no class found in the ancestor chain — fill taxonomy by hand');
  }
  const title = sp.label.replace(/ /g, '_');
  const wiki = await wikipediaSummary(title);
  const commonName = (sp.commonName ?? wiki.title ?? sp.label).replace(/^./, (c) => c.toUpperCase());
  // Guard: warn when the Wikidata common name looks like a synonym of the
  // Wikipedia article title (e.g. "Trunkback Turtle" vs "Leatherback sea
  // turtle") so the human reviewer can pick the canonical name.
  const norm = (s) => (s ?? '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const cn = norm(commonName);
  const wt = norm(wiki.title);
  if (cn && wt && !wt.includes(cn) && !cn.includes(wt)) {
    console.log(`⚠ taxonomy guard: common name "${commonName}" doesn't match the Wikipedia article "${wiki.title}" — prefer the article title`);
  }
  const category = inferCategory(tax);
  const status = sp.statusQid ? STATUS_BY_QID[sp.statusQid] ?? '?' : 'NE';
  const description = wiki.extract?.split('\n')[0] ?? '';

  const base = slugify(commonName);
  const ids = existingIds();
  let id = `${base}-001`;
  for (let n = 2; ids.includes(id); n++) id = `${base}-${String(n).padStart(3, '0')}`;

  const coord = sp.coord ? parseCoord(sp.coord) : null;

  const animal = {
    id,
    commonName,
    scientificName,
    category,
    description,
    images: [`/images/animals/${id}.jpg`],
    conservationStatus: status,
    taxonomy: {
      kingdom: tax.kingdom ?? 'TODO',
      phylum: tax.phylum ?? 'TODO',
      class: tax.class ?? 'TODO',
      order: tax.order ?? 'TODO',
      family: tax.family ?? 'TODO',
      genus: tax.genus ?? 'TODO',
      species: scientificName.split(' ').pop(),
    },
    location: {
      latitude: coord?.lat ?? 0,
      longitude: coord?.lng ?? 0,
      altitude: 0,
      accuracy: 1000,
      timestamp: 'new Date(\'2026-08-11\')',
      source: 'TODO: verify range centroid',
    },
    habitat: [], // TODO: fill from IUCN habitat descriptions
    populationEstimate: 0, // TODO: fill from the current census/survey (see sources.ts note)
    isMonitored: true,
    lastUpdated: 'new Date(\'2026-08-11\')',
    dataCategories: ['biological', 'behavioral', 'ecological', 'population', 'health'],
  };

  const source = {
    animalId: id,
    commonName,
    scientificName,
    wikipediaTitle: wiki.title ?? sp.label,
    iucnId: sp.iucnId,
    conservationStatus: status,
    populationNote: `TODO: current census/survey figure (IUCN assessment ${sp.iucnId ?? 'n/a'})`,
  };

  return { animal, source, wiki, id };
}

function parseCoord(wkt) {
  // WKT "Point(lng lat)" from Wikidata P625.
  const m = wkt.match(/Point\(([-\d.]+) ([-\d.]+)\)/);
  if (!m) return null;
  return { lng: Number(m[1]), lat: Number(m[2]) };
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const names = args.filter((a) => a !== '--apply');
  if (names.length === 0) {
    console.error('usage: node .freebuff/generate-species.mjs [--apply] "Scientific Name" [...]');
    process.exit(1);
  }

  let applied = 0;
  for (const name of names) {
    try {
      const { animal, source, wiki, id } = await generate(name);
      if (apply) {
        fs.mkdirSync(IMG_DIR, { recursive: true });
        const { bytes } = await fetchImage(wiki, path.join(IMG_DIR, `${id}.jpg`), wiki.title);
        console.log(`image: ${id}.jpg (${bytes} bytes)`);

        // Append to animals.ts (sampleAnimals is the first array in the file).
        const animalsSrc = fs.readFileSync(ANIMALS_PATH, 'utf8');
        const anchor = '\n];\n\n// Sample animal data with detailed information';
        const entry = `  ${formatTs(animal)},\n`;
        fs.writeFileSync(ANIMALS_PATH, animalsSrc.replace(anchor, `\n${entry}${anchor}`));

        // Append to sources.ts (speciesSources is the last array in the file).
        const sourcesSrc = fs.readFileSync(SOURCES_PATH, 'utf8');
        const end = sourcesSrc.trimEnd().endsWith('];') ? sourcesSrc.trimEnd() : sourcesSrc;
        const sourceEntry = `  ${formatTs(source)},\n`;
        fs.writeFileSync(SOURCES_PATH, end.slice(0, end.lastIndexOf('];')) + `${sourceEntry}];\n`);

        console.log(`APPLIED ${id} → animals.ts, sources.ts, public/images/animals/${id}.jpg`);
        applied++;
      } else {
        console.log(`\n// ── ${animal.commonName} (${animal.scientificName}) — edit placeholders marked TODO ──`);
        console.log(`Animal entry:\n${formatTs(animal)},`);
        console.log(`\nSources entry:\n${formatTs(source)},`);
        console.log(`\nRe-run with --apply to write these to the data files and fetch the image.`);
      }
    } catch (err) {
      console.error(`FAIL ${name}: ${err.message}`);
    }
  }

  if (apply && applied > 0) {
    // One flow: after applying, re-verify the whole registry against live
    // sources so drift (or a bad edit) fails the command immediately.
    console.log(`\n${applied} species applied — verifying the registry against live sources…`);
    const result = spawnSync(process.execPath, ['.freebuff/refresh-sources.mjs', '--fail'], {
      cwd: ROOT,
      stdio: 'inherit',
    });
    if (result.status !== 0) {
      console.error('\n⚠ Freshness verification found drift — review the entries above.');
      process.exitCode = 1;
    } else {
      console.log('✓ All sources current.');
    }
  }
}

main();
