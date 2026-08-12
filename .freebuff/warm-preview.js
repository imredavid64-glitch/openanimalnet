// Warm the preview server: waits for it to bind (the first `next start` on
// this machine can take several minutes because the antivirus scanner stalls
// on .next reads), then issues requests to the key routes so Next's in-memory
// and on-disk caches are populated before a human opens the Preview tab.
//
// Usage:
//   node .freebuff/warm-preview.js            # port 3100, main checkout routes
//   node .freebuff/warm-preview.js 3100 /tmp/oan-fresh
const base = `http://localhost:${process.argv[2] || 3100}`;

// Routes to warm after the server answers. Animal/API pages are dynamic, so
// pre-requesting them avoids a first-visit compile hitch.
const ROUTES = [
  '/',
  '/animal',
  '/dashboard',
  '/monitor',
  '/monitor/coverage',
  '/conservation',
  '/sources',
  '/methodology',
  '/data/ecological',
  '/api/v1/animals?limit=50',
  '/api/v1/animals/vaquita-001',
  '/api/v1/animals/saiga-001',
  '/api/v1/animals/african-penguin-001',
  '/api/v1/animals/snow-leopard-001',
  '/api/v1/populations',
  '/api/v1/monitoring/stats',
  '/animal/vaquita-001',
  '/animal/saiga-001',
  '/animal/african-penguin-001',
  '/animal/snow-leopard-001',
  '/images/animals/vaquita-001.jpg',
  '/images/animals/lion-001.jpg',
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithTimeout(path, timeoutMs) {
  const res = await fetch(base + path, { signal: AbortSignal.timeout(timeoutMs) });
  await res.arrayBuffer(); // read the body so the cache actually fills
  return res.status;
}

async function main() {
  const started = Date.now();
  // Phase 1 — wait for the server to answer. First starts can take 10+ min.
  let up = false;
  for (let i = 0; i < 120; i++) {
    try {
      const res = await fetchWithTimeout('/', 10000);
      if (res === 200) {
        up = true;
        console.log(`server up (${((Date.now() - started) / 1000).toFixed(0)}s) — warming routes…`);
        break;
      }
    } catch {
      // not up yet
    }
    if (i % 12 === 11) console.log(`  waiting for server… ${((Date.now() - started) / 1000).toFixed(0)}s`);
    await sleep(5000);
  }
  if (!up) {
    console.error('server never answered — check the preview log');
    process.exit(1);
  }

  // Phase 2 — warm routes concurrently (4 at a time keeps the scanner happy).
  const results = [];
  let queue = ROUTES.map((p) => p);
  while (queue.length > 0) {
    const batch = queue.splice(0, 4);
    const batchResults = await Promise.all(
      batch.map(async (p) => {
        const t0 = Date.now();
        try {
          const status = await fetchWithTimeout(p, 60000);
          return { p, status, ms: Date.now() - t0 };
        } catch (e) {
          return { p, status: e.name === 'TimeoutError' ? 'TIMEOUT' : 'ERR', ms: Date.now() - t0 };
        }
      }),
    );
    results.push(...batchResults);
  }

  const ok = results.filter((r) => r.status === 200).length;
  console.log(`\nwarmed ${ok}/${results.length} routes in ${((Date.now() - started) / 1000).toFixed(0)}s total`);
  for (const r of results) {
    if (r.status !== 200) console.log(`  ${r.status} ${r.p} (${r.ms}ms)`);
  }
  process.exit(0);
}

main();
