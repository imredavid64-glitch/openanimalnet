// Downloads each species' Wikipedia lead image into public/images/animals/.
// Uses the REST summary API (thumbnail.source), then re-requests at 800px width.
const fs = require('fs');
const path = require('path');

const species = [
  { id: 'lion-001', title: 'African_lion' },
  { id: 'elephant-001', title: 'African_bush_elephant' },
  { id: 'tiger-001', title: 'Bengal_tiger' },
  { id: 'eagle-001', title: 'Bald_eagle' },
  { id: 'whale-001', title: 'Blue_whale' },
  { id: 'panda-001', title: 'Giant_panda' },
  { id: 'shark-001', title: 'Great_white_shark' },
  { id: 'gorilla-001', title: 'Mountain_gorilla' },
  { id: 'dolphin-001', title: 'Common_bottlenose_dolphin' },
  { id: 'bee-001', title: 'Western_honey_bee' },
  { id: 'cow-001', title: 'Holstein_Friesian_cattle' },
  { id: 'polar-bear-001', title: 'Polar_bear' },
  { id: 'orangutan-001', title: 'Bornean_orangutan' },
  { id: 'leopard-001', title: 'Amur_leopard' },
  { id: 'giraffe-001', title: 'Giraffe' },
  { id: 'koala-001', title: 'Koala' },
  { id: 'monarch-001', title: 'Monarch_butterfly' },
  { id: 'komodo-001', title: 'Komodo_dragon' },
];

const outDir = path.join(__dirname, '..', 'public', 'images', 'animals');
fs.mkdirSync(outDir, { recursive: true });

async function download(url, dest) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  return buf.length;
}

(async () => {
  for (const s of species) {
    const dest = path.join(outDir, `${s.id}.jpg`);
    try {
      const summary = await (await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${s.title}`
      )).json();
      const thumb = summary?.thumbnail?.source;
      if (!thumb) throw new Error('no thumbnail in summary');
      // Strip the API-added tracking query string — direct fetches reject it.
      const clean = thumb.split('?')[0];
      // Try progressively larger sizes; fall back to the API's own (working) size.
      let url = clean;
      let bytes = 0;
      for (const w of [500, 330, 0]) {
        const candidate = w === 0 ? clean : clean.replace(/\/(\d+)px-/, `/${w}px-`);
        try {
          bytes = await download(candidate, dest);
          url = candidate;
          break;
        } catch (e) {
          if (w === 0) throw e;
        }
      }
      // Basic JPEG sanity check.
      const head = fs.readFileSync(dest).subarray(0, 3).toString('hex');
      if (!head.startsWith('ffd8')) throw new Error(`not a JPEG (magic ${head})`);
      console.log(`OK ${s.id} (${s.title}) ${bytes} bytes <- ${url}`);
    } catch (e) {
      console.error(`FAIL ${s.id} (${s.title}): ${e.message}`);
    }
  }
  console.log('done');
})();
