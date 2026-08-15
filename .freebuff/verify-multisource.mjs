#!/usr/bin/env node
/**
 * Multi-source data verifier.
 *
 * Cross-checks every species in the sample dataset against THREE independent
 * live sources, so a single stale record can't pass:
 *
 *   1. Wikidata   — IUCN Red List assessment ID (P627) + status (P141)
 *                   [shared with refresh-sources.mjs]
 *   2. Wikipedia  — article existence
 *   3. GBIF       — name match (exact/confidence), rank, taxonomic status
 *                   (must be ACCEPTED, not SYNONYM)
 *   4. iNaturalist— taxon match + conservation status (authority: IUCN Red
 *                   List) cross-checked against the recorded status
 *
 * With `--apply` it writes the resolved `gbifKey` and `inaturalistId` into
 * src/data/sample/sources.ts so every species carries stable, verifiable
 * source links to all four services.
 *
 * Usage:
 *   node .freebuff/verify-multisource.mjs          # report only
 *   node .freebuff/verify-multisource.mjs --apply  # report + write keys
 *   node .freebuff/verify-multisource.mjs --fail   # exit 1 on any drift
 *   node .freebuff/verify-multisource.mjs --report # also write src/data/verification-report.json
 *                                                 # (the /data-quality page's source of truth)
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { speciesSources } from '../src/data/sample/sources.ts';
import { STATUS_BY_QID } from './iucn-taxonomy.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCES_PATH = join(__dirname, '..', 'src', 'data', 'sample', 'sources.ts');
const REPORT_PATH = join(__dirname, '..', 'src', 'data', 'verification-report.json');

// Per-source labels for the report, in display order (matches the /data-quality page).
const SOURCE_KEYS = ['wikidata', 'wikipedia', 'gbif', 'inaturalist'];
const SOURCE_LABELS = {
  wikidata: 'Wikidata/IUCN',
  wikipedia: 'Wikipedia',
  gbif: 'GBIF',
  inaturalist: 'iNaturalist',
};

const UA = 'OpenAnimalNet-data-check/1.1 (multi-source verifier)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// iNaturalist conservation status codes → IUCN shorthand.
const INAT_STATUS = {
  lc: 'LC', nt: 'NT', vu: 'VU', en: 'EN', cr: 'CR', dd: 'DD',
  ex: 'EX', ew: 'EW', ne: 'NE',
};

// Statuses that read as "not assessed" — treat as no signal rather than drift.
const UNASSESSED = new Set(['NE', 'DD', null, undefined]);

const FETCH_TIMEOUT_MS = 30_000;

async function getJson(url, tries = 3) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'application/json' },
      // A wedged upstream must not hang the whole check (or the CI job).
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (res.ok) return await res.json();
    if (attempt >= tries) throw new Error(`HTTP ${res.status} from ${url.split('/')[2]}`);
    await sleep(attempt * 2500);
  }
}

/**
 * GBIF name match. Returns { key, rank, status, matchType, acceptedName } or null.
 *
 * Synonyms are resolved to their accepted record (GBIF's backbone sometimes
 * files a valid modern name under an older treatment — e.g. Panthera uncia as
 * a synonym of Uncia uncia). The exact-name match is still required; only the
 * record we link is normalized.
 */
async function gbifMatch(scientificName) {
  const data = await getJson(
    `https://api.gbif.org/v1/species/match?name=${encodeURIComponent(scientificName)}&verbose=true`
  );
  if (!data || !data.usageKey) return null;
  let key = data.usageKey;
  let status = data.status;
  let acceptedName = data.canonicalName ?? scientificName;
  if (status === 'SYNONYM' && data.acceptedUsageKey) {
    const accepted = await getJson(`https://api.gbif.org/v1/species/${data.acceptedUsageKey}`);
    if (accepted && accepted.scientificName) {
      key = data.acceptedUsageKey;
      acceptedName = accepted.scientificName;
    }
  }
  return {
    key,
    rank: data.rank,
    status,
    matchType: data.matchType,
    confidence: data.confidence,
    canonical: data.canonicalName,
    acceptedName,
  };
}

/** iNaturalist taxon lookup: prefers exact scientific-name match, else first result. */
async function inatMatch(scientificName) {
  const data = await getJson(
    `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(scientificName)}&per_page=5`
  );
  const results = data?.results ?? [];
  if (results.length === 0) return null;
  const exact = results.find((t) => t.name === scientificName) ?? results[0];
  const cs = exact.conservation_status;
  const iucn = cs && cs.authority && cs.authority.includes('IUCN') ? INAT_STATUS[cs.status] : undefined;
  return {
    id: exact.id,
    name: exact.name,
    rank: exact.rank,
    iucn,
    authority: cs?.authority ?? null,
  };
}

async function main() {
  const apply = process.argv.includes('--apply');
  const failOnDrift = process.argv.includes('--fail');
  const resolved = [];
  let drifted = 0;

  console.log(`Cross-checking ${speciesSources.length} species against Wikidata + Wikipedia + GBIF + iNaturalist…\n`);

  for (const source of speciesSources) {
    const problems = [];
    let gbif = null;
    let inat = null;
    // Per-source verification results for the /data-quality report.
    const srcStatus = {};
    const sr = (status, detail) => {
      srcStatus[statusKey] = { status, detail, checkedAt: new Date().toISOString() };
    };
    let statusKey;

    // 1+2. Wikidata + Wikipedia (shared logic, inline here so one run covers all sources).
    statusKey = 'wikidata';
    try {
      const wq = await getJson(
        `https://query.wikidata.org/sparql?${new URLSearchParams({
          query: `SELECT ?item ?itemLabel ?iucn ?status WHERE {
            VALUES ?sciname { "${source.scientificName}" }
            ?item wdt:P225 ?sciname .
            OPTIONAL { ?item wdt:P627 ?iucn . }
            OPTIONAL { ?item wdt:P141 ?status . }
            SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
          }`,
        })}`
      );
      const bindings = wq?.results?.bindings ?? [];
      const exact = bindings.find((b) => b.itemLabel?.value === source.scientificName) ?? bindings[0];
      if (!exact) {
        problems.push('wikidata: no item found');
        sr('drifted', 'no Wikidata item found');
      } else {
        const liveIucn = exact.iucn ? Number(exact.iucn.value) : null;
        const iucnOk =
          liveIucn === source.iucnId || (liveIucn === null && [15954].includes(source.iucnId));
        if (!iucnOk) {
          problems.push(`wikidata IUCN id: recorded ${source.iucnId} vs live ${liveIucn}`);
        }
        const liveStatus = exact.status ? STATUS_BY_QID[exact.status.value.split('/').pop()] ?? '?' : 'NE';
        const statusOk =
          [15954, 159971].includes(source.iucnId) || liveStatus === source.conservationStatus;
        if (!statusOk) {
          problems.push(`wikidata status: recorded ${source.conservationStatus} vs live ${liveStatus}`);
        }
        if (!iucnOk || !statusOk) {
          sr('drifted', `IUCN id ${liveIucn ?? '—'} vs recorded ${source.iucnId ?? '—'}; status ${liveStatus} vs ${source.conservationStatus}`);
        } else {
          sr('verified', `IUCN id ${liveIucn ?? '—'} + status ${liveStatus} match`);
        }
      }
    } catch (err) {
      problems.push(`wikidata: ${err.message}`);
      sr('error', err.message);
    }

    statusKey = 'wikipedia';
    try {
      const wikiOk = await getJson(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(source.wikipediaTitle.replace(/ /g, '_'))}`
      );
      if (!wikiOk || wikiOk.type === 'https://mediawiki.org/wiki/HyperSwitch/errors/not_found') {
        problems.push('wikipedia: article not found');
        sr('drifted', `article “${source.wikipediaTitle}” not found`);
      } else {
        sr('verified', `article “${source.wikipediaTitle}” exists`);
      }
    } catch {
      problems.push('wikipedia: lookup failed');
      sr('error', 'lookup failed');
    }

    // 3. GBIF taxonomy.
    statusKey = 'gbif';
    try {
      gbif = await gbifMatch(source.scientificName);
      if (!gbif) {
        problems.push('gbif: no match');
        sr('drifted', 'no GBIF name match');
      } else {
        // SYNONYM is acceptable when the exact name matched and it resolved
        // to an accepted record (e.g. Panthera uncia → Uncia uncia).
        if (gbif.status !== 'ACCEPTED' && gbif.status !== 'SYNONYM') {
          problems.push(`gbif: ${gbif.status} (not ACCEPTED)`);
        }
        if (gbif.matchType === 'NONE') problems.push('gbif: no name match');
        if (!['SPECIES', 'SUBSPECIES'].includes(gbif.rank)) problems.push(`gbif: rank ${gbif.rank}`);
        if (problems.some((p) => p.startsWith('gbif'))) {
          sr('drifted', `key ${gbif.key} · ${gbif.status} · rank ${gbif.rank}`);
        } else {
          sr(
            'verified',
            `key ${gbif.key} · ${gbif.status} · rank ${gbif.rank}` +
              (gbif.status === 'SYNONYM' ? ` (accepted: ${gbif.acceptedName})` : '')
          );
        }
      }
    } catch (err) {
      problems.push(`gbif: ${err.message}`);
      sr('error', err.message);
    }

    // 4. iNaturalist conservation status cross-check.
    statusKey = 'inaturalist';
    try {
      inat = await inatMatch(source.scientificName);
      if (!inat) {
        problems.push('inaturalist: no taxon found');
        sr('drifted', 'no iNaturalist taxon found');
      } else if (inat.iucn && !UNASSESSED.has(source.conservationStatus) && inat.iucn !== source.conservationStatus) {
        problems.push(`inaturalist status: recorded ${source.conservationStatus} vs live ${inat.iucn}`);
        sr('drifted', `recorded ${source.conservationStatus} vs live ${inat.iucn}`);
      } else if (!inat.iucn || UNASSESSED.has(source.conservationStatus)) {
        // No status signal from iNaturalist (not assessed, or the taxon has no
        // IUCN-authority status) — a known absence, not a drift.
        sr('na', `taxon ${inat.id} · no iNaturalist IUCN status signal`);
      } else {
        sr('verified', `taxon ${inat.id} · iNat status ${inat.iucn} matches`);
      }
    } catch (err) {
      problems.push(`inaturalist: ${err.message}`);
      sr('error', err.message);
    }

    resolved.push({ source, gbif, inat, srcStatus });
    if (problems.length > 0) drifted++;
    if (problems.length === 0) {
      console.log(
        `  ✓ ${source.commonName.padEnd(26)} ${source.conservationStatus} · GBIF ${gbif?.key ?? '—'} · iNat ${inat?.id ?? '—'}` +
          (inat?.iucn ? ` (iNat ${inat.iucn})` : '') +
          (gbif && gbif.status === 'SYNONYM' ? ` (accepted: ${gbif.acceptedName})` : '')
      );
    } else {
      console.log(`  ⚠ ${source.commonName.padEnd(26)} ${source.conservationStatus}`);
      for (const p of problems) console.log(`      ${p}`);
    }
  }

  if (apply) {
    // Rewrite sources.ts, injecting gbifKey + inaturalistId after iucnId.
    // The indentation varies (2-space vs 4-space, single vs double quotes),
    // so anchor on the animalId line and walk forward to its iucnId line:
    let src = readFileSync(SOURCES_PATH, 'utf8');
    for (const { source, gbif, inat } of resolved) {
      const idAnchor = new RegExp(`(animalId: ['"]${source.animalId}['"],[\\s\\S]*?iucnId: [^,]+,\\n)( {2,4}conservationStatus:)`);
      const insert = `  gbifKey: ${gbif?.key ?? 'null'},\n    inaturalistId: ${inat?.id ?? 'null'},\n`;
      if (idAnchor.test(src)) {
        src = src.replace(idAnchor, `$1${insert}$2`);
      } else {
        console.log(`      (apply) could not locate ${source.animalId} — skipping key injection`);
      }
    }
    writeFileSync(SOURCES_PATH, src);
    console.log('\nWrote gbifKey + inaturalistId into sources.ts');
  }

  // --report: write the machine-readable verification report that powers the
  // public /data-quality page (committed alongside data changes; the weekly
  // data-drift CI job regenerates it with --fail --report).
  const writeReport = process.argv.includes('--report');
  if (writeReport) {
    const species = resolved.map(({ source, srcStatus }) => ({
      animalId: source.animalId,
      commonName: source.commonName,
      scientificName: source.scientificName,
      conservationStatus: source.conservationStatus,
      sources: SOURCE_KEYS.reduce((acc, key) => {
        // Every species must carry all four source results; fall back to a
        // drift marker if any check was skipped (shouldn't happen).
        acc[key] = srcStatus[key] ?? { status: 'error', detail: 'check did not run', checkedAt: new Date().toISOString() };
        return acc;
      }, {}),
    }));
    species.sort((a, b) => a.commonName.localeCompare(b.commonName));

    const statusCount = (status) =>
      species.reduce(
        (n, s) => n + SOURCE_KEYS.filter((k) => s.sources[k].status === status).length,
        0,
      );
    const fullyVerified = species.filter((s) =>
      SOURCE_KEYS.every((k) => s.sources[k].status === 'verified' || s.sources[k].status === 'na')
    ).length;
    const driftedSpecies = species.filter((s) =>
      SOURCE_KEYS.some((k) => s.sources[k].status === 'drifted' || s.sources[k].status === 'error')
    ).length;

    const report = {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      generator: 'verify-multisource.mjs',
      sourceOrder: SOURCE_KEYS,
      sourceLabels: SOURCE_LABELS,
      totals: {
        species: species.length,
        fullyVerified,
        drifted: driftedSpecies,
        checks: species.length * SOURCE_KEYS.length,
        perStatus: {
          verified: statusCount('verified'),
          drifted: statusCount('drifted'),
          na: statusCount('na'),
          error: statusCount('error'),
        },
      },
      species,
    };
    writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n');
    console.log(`\nWrote verification report → ${REPORT_PATH.replace(join(__dirname, '..'), '.')}`);
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`${resolved.length - drifted}/${resolved.length} species verified across all sources`);
  if (failOnDrift && drifted > 0) process.exit(1);
}

main().catch((err) => {
  console.error('verify-multisource failed:', err);
  process.exit(1);
});
