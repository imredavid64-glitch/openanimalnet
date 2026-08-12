# Changelog

All notable changes to this project are documented in this file.

## [1.16.1] - 2026-08-12

### Added
- **Multi-source data verification**: every species is now cross-checked
  against four independent live sources — Wikidata/IUCN (assessment ID +
  status), Wikipedia (article), GBIF (backbone taxonomy), and iNaturalist
  (observed IUCN status). `npm run verify:data` runs the full check
  (28/28 passing) and the weekly data-drift CI job now includes it.
- **GBIF + iNaturalist links**: each species registry entry carries a stable
  GBIF taxon key and iNaturalist taxon ID, surfaced as source links on
  animal profiles and the /sources index (new DataIcon).

### Changed
- GBIF synonyms resolve to their accepted record (e.g. Panthera uncia →
  Uncia uncia in GBIF's backbone) so the link and the check stay correct.
- /sources and /methodology headers use the shared SVG icon set.

## [1.16.0] - 2026-08-12

### Added
- **SVG icon system site-wide**: the shared stroke-icon set now covers every
  surface — navbar, footer, globe controls, alerts, dashboard, AI assistant,
  monitor, animal profiles, and static pages — replacing scattered emoji.
- **ICS calendar export**: an "Add to calendar (.ics)" button on /migration
  downloads every corridor as a calendar feed alongside the CSV export.
- **Animated constellation hero**: slow drift animation with a pulse on the
  current month's node.

### Changed
- **Honest site-wide stats**: fabricated figures ("1,258,723 species",
  "45,823 monitored", "100M+ data points") replaced with values derived from
  the real 28-species dataset (28 species, 28 monitored, 6 alerts).
- **Class-based dark mode**: the page surface now follows the `.dark` class
  (matching Tailwind's `darkMode: 'class'`), so the toggle flips the whole
  page consistently, seeded pre-hydration.
- **Globe visibility**: removed the 128px hero overlap so the interactive
  globe sits fully below the landing hero.
- **Tailwind JIT purge fix**: dynamically-interpolated `bg-{color}-100` /
  `border-{color}-500` classes replaced with static lookup maps so chips and
  borders actually render.
- **Deploy pipeline**: replaced the deprecated amondnet action (broken under
  GitHub's forced Node 24) with a direct `vercel deploy --prod` step; deploys
  auto-run on every push.

### Fixed
- API integration test asserting outdated dataset totals.
- Removed the low-contrast "NET" hover pill from the navbar logo.
- Leftover emoji in monitor data chips, profile source links, and the animal
  search input replaced with SVG icons.

## [1.15.0] - 2026-08-12

### Added
- **Real migration timing**: every corridor now records its actual start/end
  months (blue whale Sep–Dec, monarch Mar–Jun, saiga Apr–May, tern fall
  Aug–Nov / spring Mar–May, leatherback year-round) and the calendar
  renders those months — with wrap-aware winter legs — instead of season
  ranges. Verified month counts shift accordingly (e.g. March now shows 3
  corridors, June 2).
- **Export the calendar**: an Export CSV button on /migration downloads
  every corridor as a spreadsheet (species, corridor, season, active
  months, distance, duration), with proper quoting.
- **Month-linked globe filter**: each month card on the calendar deep-links
  to /?season=…#globe — the globe loads pre-filtered to that season's
  corridors and scrolls into view.

### Changed (UI/UX identity + CSS cleanup)
- **Hero redesign**: single-line Playfair Display wordmark, a deterministic
  tracking-network constellation background (replaces floating emoji), and
  honest derived stats (28 species · 6 corridors · 27 IUCN · 28 monitored)
  replacing the template "1.2M+ species" marketing figures.
- **Globe controls**: emoji buttons (🔄📍🧭☁️🌪️, search, play/pause) are
  now a consistent inline stroke-SVG icon set.
- **CSS**: Playfair Display applied to page-level headings (h1/h2), new
  .font-display and .font-data (JetBrains Mono for figures) utilities,
  selection color, focus-visible rings, and a prefers-reduced-motion
  guard; dead navbar buttons (🌍/🔍/Map View/Search) removed.

## [1.14.0] - 2026-08-12

### Added
- **Season filter on mini route maps**: the Seasonal Migration cards on
  profile and monitor pages now have their own compact 🗓️ season scrubber
  (All / 🌱 Spring / ☀️ Summer / 🍂 Fall / ❄️ Winter) — corridors outside
  the selected season are filtered off the map, with a live "N of M active"
  counter.
- **Migration calendar page** (`/migration`, in the main nav): a
  month-by-month timeline of every tracked corridor. A per-month summary
  strip shows how many corridors are on the move each month (Aug 2026:
  spring months peak at 4, fall at 3), and a species × month grid colors
  each corridor's active months by season with a current-month marker.
- **Route distances in the globe popup**: clicking a species with
  migration corridors now shows a 🧭 Migration block in the details popup —
  each corridor with its great-circle distance and duration (e.g. Arctic
  tern: "~15,008 km · ~3 months").

## [1.13.0] - 2026-08-12

### Added
- **Seasonal time scrubber on the globe**: a 🗓️ Seasons control scrubs
  through the four seasons (plus All), hiding corridors that aren't active
  in the selected season — year-round routes persist, seasonal legs appear
  only in their season — with a live "N of M corridors active" counter and a
  ▶ Play button that cycles spring → summer → fall → winter. Wired through
  the 3D globe (per-route visibility tags) and the 2D fallback map.
- **Distance labels on migration routes**: the mini route maps on profile
  and monitor pages now label every corridor with its great-circle distance
  and duration (e.g. Arctic tern fall leg: "~15,008 km · ~3 months"), and
  the globe's route hover panel shows the same figures. New pure helpers in
  `src/lib/geo.ts` (haversine route distance + compact km/duration
  formatting) with their own unit tests.
- **Migration durations**: every corridor now carries a literature-based
  `durationDays` (blue whale ~75, monarch ~90, saiga ~30, leatherback
  trans-Pacific ~330, tern fall ~90 / spring ~70).

## [1.12.0] - 2026-08-12

### Added
- **Route trace animation**: clicking a migration corridor now draws it from
  start to end (the line's drawRange reveals progressively over ~2s) while
  the camera focuses the species — a clear "here is the path" moment. Route
  clicks now focus the species (popup + fly-to) instead of navigating away,
  matching the marker-click behavior.
- **Mini route maps on profiles**: the Seasonal Migration cards on animal
  detail and monitor pages now show a real equirectangular world map
  (NASA earth texture base) with each corridor drawn as a dashed,
  season-colored polyline over its true geographic path, waypoint dots, and
  a season legend (`src/components/map/MiniRouteMap.tsx`).
- **Popup gallery mode**: the globe's details popup gained ‹ › buttons that
  cycle through the species in the current filtered view (flying to each)
  with a "N of M in view" counter.

## [1.11.0] - 2026-08-12

### Added
- **OpenGrid-style globe**: clicking a species marker now flies the camera to
  it and opens a details popup (photo, status, population, View profile /
  Monitor buttons); a search box (🔍 in the controls) finds a species by
  common or scientific name and flies to it; the bottom control bar gained
  layer toggles for species markers (📍), migration corridors (🧭), and the
  clouds layer (☁️). The globe now has 28 species.
- **Seasonal migration colors**: corridors are colored by leg season — spring
  (northward/breeding leg) green, fall (southward/wintering leg) amber,
  year-round slate — with a legend, on both the 3D globe and the 2D
  fallback map. The Arctic tern's new routes showcase it: a green spring
  leg and an amber fall leg spanning pole-to-pole.
- **Directional arrow flow**: three small cones travel each corridor pointing
  along the curve tangent, so the migration direction reads at a glance;
  they scale up when the route is hovered.
- **Arctic tern** (28th species, LC): the longest migration in the animal
  kingdom (~70,900 km round trip, Iceland–Antarctic). Real photo, verified
  IUCN assessment (22694629), population >2 million individuals (1–2M
  breeding pairs), Charadriiformes order, and both migration legs.
- **Migration on the monitor page**: species with corridors (monarch, blue
  whale, leatherback, saiga, Arctic tern) show a Seasonal Migration card
  with per-leg SVG arc sketches, season labels, and waypoint ranges.
- **Generator accuracy guard**: the SPARQL ancestor list is unordered, and a
  random pick once produced "Saurischia" (a dinosaur clade Wikidata tags as
  an order) for a bird's order. Bird orders are now resolved from a
  whitelist with a warning when a correction fires.

### Fixed
- Conservation page hints hardcoded the species count ("27 tracked
  profiles"); they now use the live total (28).
- Removed six unused CSS utilities (`glass`, `text-balance`, `text-shadow`,
  `input-field`, `shimmer`, `text-gradient`) and the dead 📊 button in the
  globe info panel.

## [1.10.0] - 2026-08-12

### Added
- **Interactive migration corridors**: routes now use animated flowing dashes
  (LineDashedMaterial with scrolling dashOffset) plus a soft pulse, hover
  brightens the route and enlarges its comet, and a route picker (raycaster
  with a widened Line threshold) lets hovering a corridor show a panel with
  the species + route name and a "View profile" button, or clicking it open
  the species page directly. The 2D fallback map respects the same toggle.
- **Migration route toggle + legend**: a 🧭 button in the globe controls hides
  or shows all corridors (the 3D globe, 2D fallback, and animation state all
  rebuild), and a legend under the globe explains the dashed corridors.
- **Seasonal Migration section on animal profiles**: species with
  `migrationRoutes` (monarch, blue whale, leatherback, saiga) show a card
  with each route's name, waypoint count, formatted endpoints, and a small
  status-colored SVG arc sketch.

### Fixed
- **Globe marker picking was broken**: `pickMarker` read
  `intersects[0].instanceId`, which only exists on InstancedMesh — the
  markers are plain meshes in a Group, so the lookup always returned null
  and hovering/clicking markers silently did nothing. Markers now carry
  their index in `userData`, the picker iterates hits (skipping the larger
  glow spheres that wrap them), and marker clicks navigate to profiles.
- Route teardown now disposes Lines as well as Meshes (the dashed-route
  materials were leaking on every data/toggle change).

## [1.9.0] - 2026-08-12

### Added
- **Ocean-layer globe**: a real NASA/Solar System Scope clouds texture
  (`public/images/clouds.jpg`, white-on-black) wraps the earth as a
  translucent layer that drifts slightly slower than the surface, and the
  lighting was rebalanced (low ambient + strong sun) so the globe shows a
  visible day/night terminator instead of flat lighting.
- **Animated migration corridors**: the data model gained `migrationRoutes`
  (named waypoint corridors), populated for four well-documented migrators —
  monarch (Mexico → Great Lakes), blue whale (California → Costa Rica Dome),
  leatherback (Papua → California), saiga (Betpak-Dala winter → calving
  grounds). The 3D globe draws each as a status-colored arc lifted above the
  surface with a comet dot traveling it; the 2D fallback map mirrors the
  arcs with a rAF-driven comet. Routes respect the category/status filters.
- **Conservation-status filter chips** on the animal browser: a chip row
  (CR/EN/VU/NT/LC/DD/NE with live counts) sits above the results, toggles
  the same filter state as the Filters dropdown, supports
  `?status=CR,EN` deep links, and shows a clear button when active.

### Fixed
- Globe markers silently accumulated on every filter/data change: the
  teardown guard (`'geometry' in pointsRef.current`) never matched the
  marker Group, so the old markers were never removed. Groups are now
  disposed properly on data changes.

## [1.8.0] - 2026-08-12

### Added
- **Conservation card sparklines**: every species card on `/conservation`
  with a census series now shows a mini line chart of that series behind the
  trend arrow (19 species).
- **Taxonomy check merged into the drift workflow**: `.github/workflows/
  data-drift.yml` now runs two jobs — the weekly source-drift check and the
  taxonomy-class check (`npm run check:taxonomy`) — so both regressions
  surface in one weekly report. The standalone taxonomy-check workflow was
  removed.
- **Globe status filters**: the IUCN legend under the globe is clickable —
  selecting a status filters the markers (combined with the category
  filter), and clicking again deselects.
- **More interactive globe with real continents**: the globe texture is now
  a NASA Blue Marble equirectangular map (continents render instead of a
  flat gradient), clicking a marker opens the animal's profile, and
  auto-rotation pauses while hovering a marker. The texture also renders in
  the WebGL color space (sRGB) and is applied with needsUpdate on load.

## [1.7.0] - 2026-08-12

### Added
- **Conservation page trend arrows**: every species card on `/conservation`
  now shows its population trend (↑ recovering / ↓ declining / → stable)
  derived from the census series, plus a **Most at Risk** callout listing
  CR/EN species whose trend is declining.
- **CI taxonomy check** (`npm run check:taxonomy`, weekly workflow
  `.github/workflows/taxonomy-check.yml`): resolves every species on
  Wikidata, walks the P171 chain, and fails if the recorded class disagrees
  with the live one. All 27 species verified.
- **Shared taxonomy module** (`.freebuff/iucn-taxonomy.mjs`): the IUCN
  status-QID map and the paraphyletic-chain class picker are now a single
  source of truth shared by the generator, the freshness checker, and the
  new taxonomy check — no more duplicated maps to drift apart.
- **Globe status badges**: InteractiveGlobe now shows an IUCN status legend;
  the 2D fallback draws a status-colored ring around each marker with a
  status badge pill on hover; the 3D globe's glow matches the status color
  (markers already used status colors).

## [1.6.0] - 2026-08-12

### Added
- **Conservation Overview page** (`/conservation`, linked from the footer):
  groups all 27 species by IUCN status — summary cards, a per-status bar
  chart and share donut (recharts), and full species lists ordered most
  endangered first, each with photo, population note, and a link to its
  profile.
- **Taxonomy guards in the species generator**: the P171 ancestor chain is
  paraphyletic (birds resolve through Reptilia), so the generator now picks
  the most specific extant class present in the chain (Aves wins over
  Reptilia for birds) and warns when a correction was applied. It also warns
  when the Wikidata common name is a synonym of the Wikipedia article title
  (e.g. "Trunkback Turtle" vs "Leatherback sea turtle").
- **Preview cache warmer** (`.freebuff/warm-preview.js`): after `next start`
  binds, it pre-fetches the key routes/API endpoints/images so first page
  loads in the Preview tab are instant, and reports any that fail.

## [1.5.0] - 2026-08-12

### Added
- **Bulk species generation**: 8 new species (27 total) added with the
  generator — Red Panda (EN), Axolotl (CR, first amphibian), African Penguin
  (CR, first bird), Leatherback Sea Turtle (VU), Proboscis Monkey (EN),
  Saiga Antelope (NT), Golden Lion Tamarin (EN), and Vaquita (CR, ~10
  remaining). Each has a real photo, a Wikidata-verified IUCN assessment,
  and current census figures checked against 2023–2026 sources. Population
  timeline series added for the vaquita's collapse (567→8), saiga's
  recovery (21k→4.6M), African penguin (70k→8.75k pairs), leatherback nests
  (90.6k→54.3k), axolotl (6,000→36), and golden lion tamarin (200→4,800).
- **`npm run species:add`** — the generator is now wired into a command:
  `npm run species:add -- "Panthera uncia"` (add `-- --apply` to write the
  files). Auto-verifies the registry against live Wikidata after applying.
- **Generator robustness**: when the lead image is an SVG diagram (e.g. the
  vaquita's size chart), the generator now falls back to the article's first
  real JPEG photo. Images are deduplicated and human-review fields
  (population, habitat, location) get filled in after generation.

### Fixed
- **Two more wrong IUCN status QIDs in the checker/generator**: Q214984 is
  the taxonomy rank "division", not Near Threatened (correct: Q719675);
  Q209175 is the actress Kim Cattrall, not Extinct (correct: Q237350);
  Q552752 is a cardinal, not Extinct in the Wild (correct: Q239509). The
  old values were never exercised until the Saiga (NT) was added.
- African penguin was generated with class Reptilia and category "reptiles"
  (Wikidata's P171 chain passes birds through Reptilia); corrected to Aves
  / "birds". Leatherback's synonym name "Trunkback Turtle" corrected.

## [1.4.0] - 2026-08-11

### Added
- **Population timeline chart**: every animal detail page now charts the
  species' historical population series (censuses/surveys) with the current
  estimate and a per-species unit/caveat note. 12 of 19 species have verified
  series (e.g. Amur leopard's recovery 25→130, monarch's western collapse
  4.5M→9,119, Komodo 5,000→3,458) — each figure checked against current
  sources on 2026-08-11.
- **Species generator** (`node .freebuff/generate-species.mjs [--apply]`):
  builds complete Animal + SpeciesSource entries from live Wikidata/Wikipedia
  — full taxonomy via the P171 ancestor chain, IUCN assessment ID (P627),
  conservation status (P141), lead photo, and description. Census figures
  remain a human-reviewed TODO step. Proved by adding the **Snow Leopard**
  (19th species, VU, ~7,500 per latest IUCN CatSG estimate).

### Fixed
- Generator: the JPEG magic check compared 3 bytes against a 2-byte string
  (never matched); fixed to a prefix check.

## [1.3.0] - 2026-08-11

### Added
- **7 new species** (18 total): Polar Bear (VU), Bornean Orangutan (CR),
  Amur Leopard (CR), Giraffe (VU), Koala (VU), Monarch Butterfly (EN),
  Komodo Dragon (EN) — each with a real photo, verified IUCN assessment ID,
  current population estimate, and source links.
- **Source links on animal detail pages**: every species page now shows its
  Wikipedia article, IUCN Red List assessment, and the source note for its
  population figure.
- **Auto-deploy on push**: `.github/workflows/deploy.yml` deploys production
  to Vercel via `vercel-action` on every push to `main` (secrets:
  `VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID`).
- **Data drift watch**: `.github/workflows/data-drift.yml` runs the freshness
  checker weekly (Mondays 03:00 UTC, manually triggerable) and fails if any
  species' IUCN status/ID or Wikipedia article has drifted.

### Fixed
- The freshness checker's Critically Endangered mapping was wrong: Wikidata
  Q21983152 is a mountain range, not a status — the correct CR QID is Q219127
  (would have mis-reported any CR species).
- Freshness checker now retries Wikidata's transient 429/502s with backoff and
  documents two known Wikidata gaps (monarch P141 stale at LC vs IUCN 2022 EN;
  Amur leopard subspecies item lacks P627/P141) as explicit exceptions.

## [1.2.0] - 2026-08-11

### Added
- **Data Sources page** (`/sources`): a source index linking every species to
  its Wikipedia article and official IUCN Red List assessment, with population
  notes. IUCN assessment IDs were verified via Wikidata (P627) on 2026-08-11.
- **Data freshness checker** (`npm run refresh:data`): re-verifies every
  species' IUCN assessment ID and status against live Wikidata and checks each
  Wikipedia article exists — no dependencies, Node-only.

### Fixed
- **Western honey bee** status corrected from Not Evaluated to **Data
  Deficient** (it has a 2014 global IUCN assessment; Wikidata ID 42463639).

### Changed
- Methodology page now cites the bee's DD assessment and links to the sources
  index; footer links to the new page.
- Local git operations on this machine sped up from minutes to milliseconds by
  packing all objects into a single pack file (the antivirus scanners were
  blocking reads of loose objects); see `.freebuff/run.md`.

## [1.1.0] - 2026-08-10

### Added
- **Pages**: 20 previously-missing routes now render — `/about`, `/methodology`,
  `/partners`, `/careers`, `/docs`, `/api`, `/community`, `/contact`,
  `/privacy`, `/terms`, `/cookies`, a `/data` explorer hub with the five data
  category pages, `/monitor/coverage`, and `/monitor/[id]` (data-driven
  per-animal monitoring page).
- **Alert detail pages**: each monitoring alert has a dedicated route at
  `/monitor/alerts/[id]`; alert cards and the detail modal link to them.
- **API**: six public JSON endpoints under `/api/v1/*` (animals with filters
  and pagination, animal profiles, populations, monitoring alerts, monitoring
  stats, telemetry locations) with per-IP rate limiting and cache headers.
- **Dashboard**: metric cards now fetch live stats from `/api/v1/monitoring/stats`
  with a loading state and graceful fallback to bundled data.
- **Dark mode**: navbar toggle with `localStorage` persistence and a no-flash
  inline script; Tailwind switched to class-based dark mode.
- **Tests**: 19 unit tests (filtering, rate limiter) and 12 API integration
  tests, runnable via `npm test` and `npm run test:api`.
- **CI**: GitHub Actions workflow running lint, unit tests, build, and API
  integration tests on every push and pull request.
- **Globe texture**: real equirectangular earth map at `public/images/earth.jpg`.

### Fixed
- TypeScript errors in `SimpleWorldMap`, `MonitoringAlerts`, `StatsDashboard`,
  and the missing `target` in `tsconfig.json` (6 errors total).
- React hydration errors (418/423/425) caused by `Date.now()` sample alert
  timestamps; timestamps are now fixed and time elements carry
  `suppressHydrationWarning`.
- The `/animal` page ignored `?category=` and `?isMonitored=` URL params; they
  now initialize the filters on load.
- Removed three unused dependencies (`zustand`, `date-fns`, `tailwind-merge`)
  and an unused import in the animal page.

### Changed
- Alert sample data moved to a shared module (`src/data/sample/alerts.ts`);
  population trend data moved into `sampleMonitoringData`.
- Animal filter/sort logic extracted into a pure, unit-tested module
  (`src/lib/animalFiltering.ts`).

## [1.0.0] - 2026-08-08

- Initial release: interactive globe, monitoring alerts, animal database,
  dashboard, AI assistant, and full data model.
