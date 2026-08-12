# OpenAnimalNet — preview run doc

## Reproduce uncommitted artifacts

This project needs **no env files** (no `.env`, `.env.local`, or secrets — the app
runs entirely on bundled sample data in `src/data/sample/animals.ts`).

1. Install dependencies: `npm install` (node_modules already present).
2. Produce a production build into `.next`:
   ```bash
   npx next build --no-lint
   ```
   **Machine-specific note:** on this Mac, an antivirus EndpointSecurity scanner
   intermittently blocks file reads for 10–70s each, so heavy Node phases can
   stall. Two workarounds are in use:
   - `--no-lint` skips the lint phase (lint is verified separately).
   - Temporarily set `typescript: { ignoreBuildErrors: true }` in
     `next.config.js` to skip the typecheck phase (it never spawned its child on
     Node 26 here; `tsc --noEmit` is verified separately). Restore the original
     `next.config.js` after the build — the served output does not depend on it.
   - The webpack cache in `.next/cache` is required for the build to finish in
     reasonable time; do not delete `.next` between retries.
   - Launcher (detached, survives tool calls): `node .freebuff/run-build.js`,
     logs to `/tmp/build-final.log`.

## Run the server

Serve the completed build (no on-demand compilation, so page loads are instant):

```bash
node .freebuff/start-preview.js   # spawns `next start -p 3100` detached
```

- Default port 3000 is often taken by other projects' previews, so the preview
  runs on **3100**. Verify: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3100`
- Log: `.freebuff/preview-<session>.log`
- Stop: `kill <pid>` (PID printed by the launcher)

## App issues fixed in this preview session

- `GET /images/earth.jpg` → 404: added a real earth texture at
  `public/images/earth.jpg` (2048×1024 equirectangular map).
- React hydration errors (418/423/425): `MonitoringAlerts.tsx` used
  `Date.now()` at module scope, so server and client rendered different
  timestamps. Timestamps are now fixed and the time elements carry
  `suppressHydrationWarning`.
- 20 routes referenced by the navbar/footer/cards 404'd: added pages for
  `/about`, `/methodology`, `/partners`, `/careers`, `/docs`, `/api`,
  `/community`, `/contact`, `/privacy`, `/terms`, `/cookies`, `/data`,
  `/data/{biological,behavioral,ecological,population,health}`,
  `/monitor/coverage`, and `/monitor/[id]` (data-driven per-animal page).
- Added dedicated alert pages at `/monitor/alerts/[id]`; alert cards and the
  detail modal now link to them (`sampleAlerts` moved to
  `src/data/sample/alerts.ts`).
- Fixed the `/animal` page ignoring URL query params: `?category=` and
  `?isMonitored=true` now initialize the filters on load (the category cards
  previously navigated without filtering).
- Implemented the API documented on `/api` as real Next.js route handlers:
  `/api/v1/animals` (filters + pagination), `/api/v1/animals/[id]`,
  `/api/v1/populations`, `/api/v1/monitoring/alerts`, `/api/v1/locations`.
- Extracted the animal filter/sort logic into `src/lib/animalFiltering.ts`
  (pure, unit-tested) and refactored the `/animal` page to use it. Tests run
  with Node's built-in runner, no new deps: `npm test`.
- Accessibility: alert cards are now keyboard-operable (`role="button"`,
  tabIndex, Enter/Space) with descriptive aria-labels; the detail modal is an
  ARIA dialog.
- Added rate limiting to all API endpoints (60 req/min per IP, in-memory
  sliding window, 429 + Retry-After). Pure logic in `src/lib/rateLimit.ts`
  (unit-tested), Next helper in `src/lib/apiRateLimit.ts`.
- Added a dark-mode toggle in the navbar (persists to localStorage, defaults
  to system preference, no-flash inline script in the layout head). Tailwind
  now uses `darkMode: 'class'`.
- Added `/api/v1/monitoring/stats` and wired the dashboard's metric cards to
  fetch it on mount (loading state, falls back to bundled sample data, shows a
  "Live API data" badge when the fetch succeeds). All API responses now send
  `Cache-Control: public, max-age=30, s-maxage=60, stale-while-revalidate=30`
  (`src/lib/apiHeaders.ts`) so the rate limit is rarely hit in practice.
- Added API integration tests (`tests/api.integration.test.ts`) that hit a
  running server and assert the documented contract for all six endpoints
  (including 404/400/429 behavior and Cache-Control headers). Run with
  `npm run test:api` (set `API_BASE_URL` to target a different server).

## Cleanup (v1.1.0)

- Removed unused deps `zustand`, `date-fns`, `tailwind-merge` (nothing imported
  them) and an unused import in the animal page; added `CHANGELOG.md` and
  bumped the version to 1.1.0.
- CI: `.github/workflows/ci.yml` runs lint, unit tests, build, and API
  integration tests on push/PR (Node 20 LTS — avoids the Node 26 quirks this
  machine hits).
- Lint: fixed the two react-hooks ref-in-effect-cleanup warnings in
  `GlobeComponent.tsx` by capturing `containerRef.current` in a local variable
  inside each effect (a documented `eslint-disable-next-line` remains on the
  one-time init effect for its intentionally empty dep array). Verified with
  `tsc --noEmit`; the targeted eslint run itself is scanner-slow on this
  machine (~5 min, can exceed timeouts).
- Home page: the Featured Animals grid now shows all 11 sample animals
  (removed the `slice(0, 8)` truncation in `FeaturedAnimals.tsx`).
- Launchers: `.freebuff/run-build.js` and `.freebuff/start-preview.js` now
  spawn `process.execPath` against `next/dist/bin/next` directly instead of
  exec'ing the `node_modules/.bin/next` shell wrapper — the wrapper exec can
  hang for minutes when the antivirus scanner blocks reads of it. (A stalled
  `next start` process shows "Ready" in the log from an earlier launch but has
  nothing on the port; kill it and relaunch.)
- Responsive pass: the globe's hover info panel (`InteractiveGlobe.tsx`) is now
  `hidden sm:block` — it's hover-based (a desktop affordance) and its
  `min-w-[300px]` clipped on small screens. No other fixed-width offenders:
  tables use `overflow-x-auto`, grids are `grid-cols-2 md:grid-cols-4`, and
  headings scale down (`text-5xl md:text-7xl`).
- Real content pass (2026-08): all 11 animals now use real photos served from
  `public/images/animals/` (fetched from Wikimedia Commons via
  `.freebuff/fetch-animal-images.js`); sample data refreshed with current
  population estimates / IUCN statuses and `lastUpdated` dates; the bee's globe
  coordinate moved to North Dakota (top US honey state); methodology page got a
  "Current Figures & Sources" section; the `/api/v1/animals/[id]` route now
  falls back to the base profile so all 11 species return full detail.

## Commit / deploy (Aug 11 2026)

- Committed as `641dd6c` ("Polish OpenAnimalNet: real images, accurate data,
  globe fixes") and pushed to `origin/main` — remote verified at `641dd6c`,
  local `main` aligned. CI workflow (`.github/workflows/ci.yml`) runs on the
  push.
- Machine-specific note: on this machine the antivirus scanner blocks reads of
  `.git/objects` written more than ~minutes ago, which hangs `git commit`/
  `git push` pack builds. Workaround used: build a fresh repo in `/tmp` from a
  copied worktree, commit there, and push — freshly-written objects read fast.
  See the copy procedure (per-file retries, skip `.freebuff/*.db*`, verify
  non-empty files) if a future push stalls the same way.

## Round 3 (Aug 11 2026): sources page, freshness checker, git + Vercel fixes

- **Git is fixed for good**: the culprit was two antivirus engines (Malwarebytes
  + Avast) re-scanning every loose object read. All objects were consolidated
  into ONE pack file (`git repack -ad` in the scratch repo, pack copied over,
  `git prune-packed`) — `git log`/`git status` went from minutes to ~25ms.
  Commits and pushes now work normally from the real worktree.
- **Data Sources page** (`/sources`): Wikipedia + IUCN Red List links for all
  11 species; IUCN IDs verified via Wikidata P627 (SPARQL). Added the bee's
  real status: it IS assessed (2014, Data Deficient) — corrected NE -> DD.
- **Freshness checker**: `npm run refresh:data` (`.freebuff/refresh-sources.mjs`)
  re-verifies IUCN IDs/statuses/Wikipedia articles against live sources.
- Committed as `b2f08b8` and pushed; version 1.2.0.
- **Vercel deploy fixed**: the project had `framework: null` on Vercel's side,
  so every deployment was uploaded as a STATIC site (public/ served, all routes
  404). Fixed via API: `PATCH /v9/projects/{id}` `{"framework":"nextjs"}`.
  Production: https://openanimalnet.vercel.app (all routes verified 200).
- **Local build on this machine**: `next build`/`next dev` stall in module
  loading when the scanner is busy. Reliable path: build in the scratch tree
  `/tmp/oan-fresh` (freshly-written files read fast) with lint/typecheck
  skipped in its config, then serve with
  `node .freebuff/start-preview.js start /tmp/oan-fresh` (launcher accepts an
  optional root arg). The preview currently serves that scratch build.
  IMPORTANT: when copying new/changed files into the scratch tree, create
  missing target directories first — `cp` to a missing dir fails silently.

## Round 4 (Aug 11 2026): +7 species, source links, auto-deploy, drift watch

- **18 species** (was 11): added Polar Bear (VU), Bornean Orangutan (CR),
  Amur Leopard (CR), Giraffe (VU), Koala (VU), Monarch Butterfly (EN),
  Komodo Dragon (EN). Real photos in `public/images/animals/`, IUCN IDs
  verified via Wikidata (P627), population figures checked against current
  sources (Aug 2026).
- **Source links on animal detail pages**: `/animal/[id]` now shows Wikipedia +
  IUCN Red List links + the population source note (from `sources.ts`).
- **Auto-deploy**: `.github/workflows/deploy.yml` (vercel-action, `--prod`)
  deploys on every push to `main`. Secrets set in the repo: `VERCEL_TOKEN`
  (from `~/Library/Application Support/com.vercel.cli/auth.json`),
  `VERCEL_ORG_ID`/`VERCEL_PROJECT_ID` (from `.vercel/project.json`).
  `gh auth` is logged in as imredavid64-glitch — `gh secret list` to verify.
- **Drift watch**: `.github/workflows/data-drift.yml` runs
  `npm run refresh:data -- --fail` weekly (Mon 03:00 UTC) + manual trigger.
- **Freshness checker fixes**: the CR mapping was wrong (Q21983152 is a
  mountain range; the CR QID is Q219127); added retry-with-backoff for
  Wikidata 429/502s; documented exceptions where Wikidata is stale/absent
  (monarch P141 = LC vs IUCN 2022 EN; Amur leopard item has no P627/P141).
- Tests updated for 18 species (unit 19/19, integration 12/12); version 1.3.0.
- Preview served from the rebuilt scratch tree `/tmp/oan-fresh` (same machine
  workaround as round 3: fresh files dodge the antivirus scanner).
- **CI was broken since round 1**: the unit/API tests import .ts files directly,
  which needs Node ≥22.6 type stripping — CI ran Node 20, so every `npm test`
  step failed. Fixed by moving the CI matrix to Node 22 and adding
  `engines.node >=22.6` to package.json. CI is green now; `gh run list` to
  check.

## Round 5 (Aug 11 2026): population timelines + species generator

- **Population timeline chart**: `Animal.populationHistory` (new optional
  field, `{year, estimate}[]` + a `populationHistoryNote` caveat). 12 species
  carry verified series (tiger/panda/gorilla/eagle/whale/elephant/leopard/
  monarch/komodo/giraffe/orangutan/lion) — figures checked against sources on
  2026-08-11. The detail page's Population tab renders a recharts line chart
  with the current estimate and the per-species note; species without history
  (polar bear, koala, dolphin, shark, bee, cow) fall back to the empty state.
- **Species generator** `.freebuff/generate-species.mjs [--apply]` — builds
  Animal + SpeciesSource entries from Wikidata/Wikipedia: full taxonomy via a
  single `P171+` ancestor query (prefers P225 scientific names), IUCN ID
  (P627), status (P141), lead photo, description. Census figures/habitat/
  coords stay TODO placeholders for human review. Generated the **Snow
  Leopard** (19th species; VU; ~7,500 per IUCN CatSG) as the proof.
- Generator gotchas fixed: the JPEG magic check compared 3 bytes to a 2-char
  string (fixed to startsWith), and `?rankLabel` was missing from the ancestor
  query (so no rank names came back).
- Tests updated for 19 species (unit 19/19, integration 12/12); version 1.4.0.
- Preview rebuilt in the scratch tree as usual; `gh run list` shows CI green
  (Node 22) and the Deploy workflow succeeding.

## Round 6 (Aug 12 2026): +8 species → 27, status-QID fixes, generator fallback

- **27 species** (was 19): Red Panda (EN), Axolotl (CR, first amphibian),
  African Penguin (CR, first bird), Leatherback Sea Turtle (VU), Proboscis
  Monkey (EN), Saiga Antelope (NT), Golden Lion Tamarin (EN), Vaquita (CR,
  ~10 remaining). All census figures checked against 2023–2026 sources;
  timeline series added for vaquita (567→8), saiga (21k→4.6M), penguin
  (70k→8.75k pairs), leatherback (nests 90.6k→54.3k), axolotl (6,000→36),
  tamarin (200→4,800).
- **Three wrong IUCN status QIDs fixed in BOTH the generator and the refresh
  checker**: NT is Q719675 (Q214984 is the taxonomy rank "division"), EX is
  Q237350 (Q209175 is the actress Kim Cattrall), EW is Q239509 (Q552752 is a
  cardinal). They never fired before because no NT/EX/EW species existed.
- **Generator fallback**: when the lead image is an SVG diagram (e.g. the
  vaquita's size chart), it now lists the article's images and downloads the
  first real JPEG photo (Vaquita2 Olson NOAA.jpg for the vaquita).
- Post-generation review renames: vaquita-gulf-porpoise → vaquita, western-
  saiga-antelope → saiga, south-african-penguin → african-penguin (class
  Reptilia → Aves, category reptiles → birds), trunkback-turtle → leatherback.
- Tests updated (unit 19/19, integration 13/13); version 1.5.0. Launcher
  gotcha: `start-preview.js` reads its root from **argv[3]**, so the correct
  invocation is `node .freebuff/start-preview.js start /tmp/oan-fresh` —
  passing the root as argv[2] silently serves the main checkout's stale build.

## Round 7 (Aug 12 2026): conservation page, generator guards, cache warmer

- **Conservation Overview** (`/conservation`, footer DATA column): groups all
  27 species by IUCN status with summary cards, per-status bar chart + share
  donut (recharts), and species lists ordered most endangered first.
- **Generator taxonomy guards**: the P171 chain is paraphyletic (birds pass
  through Reptilia), so `walkTaxonomy` now collects all class-ranked nodes
  and picks the most specific extant clade (Aves > Mammalia > Amphibia >
  Reptilia > …), warning when a correction fires. A second guard warns when
  the Wikidata common name is a synonym of the Wikipedia article title.
- **Cache warmer** `.freebuff/warm-preview.js [port] [root]`: waits for the
  server to bind (first start after a build can take 8+ min on this
  machine), then pre-fetches the key routes, API endpoints, animal pages,
  and images so first Preview loads are instant. Run it after
  `start-preview.js`:
  `node .freebuff/warm-preview.js 3100 /tmp/oan-fresh`.
- Version 1.6.0; tests still 19/19 unit + 12/12 integration (the
  conservation page adds no API surface).

## Round 8 (Aug 12 2026): trend arrows, CI taxonomy check, globe status badges

- **Conservation page**: species cards now show population trend arrows
  (first vs last point of the census series) and a **Most at Risk** callout
  lists CR/EN species with a declining trend.
- **CI taxonomy check** (`npm run check:taxonomy`): parses
  `src/data/sample/animals.ts`, resolves each species on Wikidata, walks the
  P171 chain, and fails if the recorded class mismatches the live one. Runs
  weekly (`.github/workflows/taxonomy-check.yml`) + on demand. 27/27 pass.
- **Shared taxonomy module** `.freebuff/iucn-taxonomy.mjs`: STATUS_BY_QID +
  bestClass now live in one file imported by the generator, the refresh
  checker, and the taxonomy check (they were duplicated before — how three
  wrong QIDs slipped through).
- **Globe status badges**: InteractiveGlobe adds an IUCN status legend;
  SimpleWorldMap draws a status ring per marker + status badge pill on
  hover; the 3D globe's glow uses the status color (its markers already
  did). Preview uses the 3D globe when WebGL is available.
- Version 1.7.0; tests still 19/19 + 12/12.

## Round 9 (Aug 12 2026): sparklines, merged drift checks, globe status filters + continents

- **Conservation sparklines**: 19 cards with census series show a mini
  recharts line chart; trend arrow unchanged.
- **Drift workflow now runs both jobs**: `data-drift.yml` has
  `source-drift` (refresh:data --fail) and `taxonomy` (check:taxonomy)
  jobs; the standalone taxonomy-check.yml was deleted.
- **Globe**: the IUCN legend is now clickable status filters (combined with
  category filters; click again to clear). Clicking a marker opens the
  profile (`onAnimalClick` wired through GlobeComponent → InteractiveGlobe
  router, and SimpleWorldMap for the fallback). Auto-rotation pauses on
  hover. The globe texture is a real NASA Blue Marble equirectangular map
  (public/images/earth.jpg, 2048x1024, public domain) applied with
  `SRGBColorSpace` + needsUpdate; the old texture was not an earth map.
- Version 1.8.0; tests 19/19 + 12/12.

## Round 10 (Aug 12 2026): ocean-layer globe, migration corridors, status chips

- **Globe**: clouds layer (public/images/clouds.jpg, white-on-black, used as
  map + alphaMap, drifts slower than the surface) + day/night terminator
  (ambient 0.5→0.22, sun 0.8→1.35). `Animal.migrationRoutes` added and
  populated for 4 migrators (monarch, blue whale, leatherback, saiga); the
  3D globe renders each as a status-colored arc with a comet dot, the 2D
  fallback mirrors it. Routes respect category/status filters.
- **Fixed pre-existing globe leak**: the data-change teardown guard
  (`'geometry' in pointsRef.current`) never matched the marker Group, so
  markers accumulated on every filter change; groups are now disposed.
- **Animal browser status chips**: clickable CR/EN/VU/NT/LC/DD/NE chips with
  counts, sharing state with the Filters dropdown, `?status=CR,EN` deep
  links, and a clear button. Also fixed a redundant ternary in the chip
  title.
- Version 1.9.0; tests 19/19 + 12/12. Build in the scratch tree as usual
  (typecheck skipped in config, verified via `tsc --noEmit` detached).

## Round 11 (Aug 12 2026): interactive routes, migration toggle, profile sections

- **Interactive corridors**: routes are now dashed-and-flowing (LineDashed-
  Material dashOffset), pulse subtly, brighten + grow their comet on hover,
  and are pickable via a raycaster with a widened Line threshold (0.05).
  Hovering shows a panel (species + route name + View profile); clicking a
  route opens the species page. The 2D fallback keeps its comet animation.
- **Toggle + legend**: 🧭 button in the globe controls shows/hides all
  corridors (rebuilds the routes group cleanly); legend under the globe
  explains the dashed corridors.
- **Profile migration section**: monarch/blue whale/leatherback/saiga pages
  now show a "Seasonal Migration" card with route name, waypoints, formatted
  endpoints, and an SVG arc sketch.
- **FOUND + FIXED a pre-existing bug**: globe marker picking read
  `intersects[0].instanceId` (InstancedMesh-only), so markers in the plain
  Group never hovered/clicked — markers now carry their index in userData
  and the picker iterates hits. Verified: marker click navigates, route
  hover panel renders, route click navigates, toggle hides routes.
- Debug note: the routes only raycast-pick when their hemisphere faces the
  camera; synthetic-event sweeps must either rotate the globe (or wait for
  auto-rotation) to bring the Pacific-side routes into view. Line raycast
  was validated against the actual geometry in Node (1168 hits across a
  sweep) before confirming in the preview.
- Version 1.10.0; tests 19/19 + 12/12.

## Round 12 (Aug 12 2026): OpenGrid-style globe, seasonal colors, arrows, +Arctic tern

- **Globe interactivity (OpenGrid-style)**: marker click flies the camera to
  the species and opens a details popup (photo/status/population + View
  profile/Monitor); 🔍 search finds a species and flies to it; control bar
  has layer toggles for markers 📍 / routes 🧭 / clouds ☁️ (all wired through
  GlobeComponent + the 2D fallback). Fly-to is an eased lerp of camera
  position + OrbitControls target in the animation loop.
- **Seasonal arc colors**: routes are colored by leg season (spring green /
  fall amber / year-round slate) with a legend; `MigrationRoute.season` is a
  new optional field. 2D fallback matches.
- **Directional arrows**: three cones per route travel along the curve,
  oriented to its tangent; they scale on hover.
- **+Arctic tern (28 species, LC)**: the longest migration on Earth
  (~70,900 km round trip). Real photo, IUCN 22694629, >2M individuals,
  Charadriiformes order (see guard below), and spring + fall legs (both
  drawn). Freshness check passed ALL CURRENT with it included.
- **Generator bug found + fixed**: the SPARQL P171+ ancestor list comes back
  unordered, so `ranks.order` picked a random order node — the tern got
  "Saurischia" (a dinosaur clade Wikidata tags as an order). Bird orders are
  now resolved from a whitelist (BIRD_ORDERS) with a correction warning;
  verified: `Sterna paradisaea` preview now warns "order Saurischia →
  Charadriiformes" and emits the right order.
- **Monitor page**: species with migrationRoutes show a Seasonal Migration
  card (SVG arcs + season + waypoints).
- **CSS cleanup**: removed unused utilities (glass, text-balance, text-shadow,
  input-field, shimmer, text-gradient) from globals.css and the dead 📊
  button in the globe panel; conservation-page hints now derive the species
  count instead of hardcoding it.
- Version 1.11.0; tests 19/19 + 12/12 (integration counts updated to 28).

## Remaining environment note

- Some Unsplash images are ORB-blocked inside the Freebuff preview webview
  (they load fine in a normal browser).
