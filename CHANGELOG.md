# Changelog

## [1.23.0] - 2026-08-23

### Added
- **9 new species (33 → 42):** Philippine Eagle (CR), Harpy Eagle (VU),
  Golden Poison Frog (EN), Chinese Giant Salamander (CR), Elkhorn & Staghorn
  Corals (CR, first Cnidaria — category marine), Lord Howe Island Stick Insect
  (CR), Rusty Patched Bumble Bee (CR), Whale Shark (EN) with a documented
  Indian Ocean corridor.
- Every population figure is sourced in its note (Sutton et al. 2023 for the
  Philippine Eagle, IUCN 2025 for the whale shark, USFWS SSA 2016 for the bee);
  count-less species honestly omit the estimate instead of inventing one.

### Fixed
- `check:taxonomy` parser only read hand-written entries — now handles both
  entry formats; weekly drift watch covers all 42.
- Generator category fallback assigned corals to mammals; curated to marine.

## [1.22.0] - 2026-08-23

### Fixed
- **PWA actually works now:** `public/sw.js` was TypeScript (browsers parse service
  workers as-is), cached `/manifest.webmanifest` instead of `/site.webmanifest`
  (install always failed), and nothing ever called `serviceWorker.register()`.
  Rewritten as plain JS with resilient install + registered via
  `ServiceWorkerRegistrar` in production builds.
- **Missing apple-touch-icon:** layout referenced `/apple-touch-icon.png`; added a
  real 180×180 icon generated from the favicon.
- **Wrong canonical domain:** metadata pointed at `openanimalnet.org`, which does
  not resolve. Now `https://openanimalnet.vercel.app` with `metadataBase`.

### Added
- **SEO:** `app/robots.ts` + `app/sitemap.xml` via `app/sitemap.ts`
  (43 static routes + all 33 species pages); Open Graph / Twitter card images.
- `src/lib/site.ts` as the single source of truth for the site URL.

### Removed
- Fabricated contact details (`@openanimalnet.org` emails, fictional foundation
  offices) replaced with real GitHub channels; `/api` page no longer claims
  nonexistent official SDKs or an `api.openanimalnet.org` host.
- README placeholder referencing a never-created `docs/demo.gif`.

## [1.21.0] - 2026-08-19

### Added
- **Species Comparison Matrix (/compare):** Side-by-side analysis of conservation status, population, habitat, and migration.
- **Wildlife Photography Gallery (/gallery):** Masonry grid for verified species imagery, filterable by category and status.
- **PWA Support:** Service worker configured for offline caching of app shell and core assets.


## [1.19.0] - 2026-08-11
- Polish OpenAnimalNet: real images, accurate data, globe fixes.
