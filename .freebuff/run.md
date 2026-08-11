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

## Remaining environment note

- Some Unsplash images are ORB-blocked inside the Freebuff preview webview
  (they load fine in a normal browser).
