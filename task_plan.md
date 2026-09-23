# Task Plan: OpenAnimalNet next features

## Goal

Ship three approved features in sequence — no database anywhere (Supabase was
removed in 25413a1; localStorage stays the only client store). Zero-env default.

## Status

Launch 1.22.0 deployed & verified (2026-08-23): PWA fixed, robots/sitemap live,
canonical URL correct, CI green, production 200 across the board.

**All workstreams completed (2026-09-11):**

## Workstream A: Species expansion 33 → 42 (approved slate) ✅ COMPLETED

`npm run species:add -- --apply "<binomial>"` per species, then a manual curation
pass (population figures w/ sourced notes, habitat, coords, category/class check,
migration routes for whale shark). Then: bump count-dependent tests (now
data-driven), README counts, freshness check must pass ALL CURRENT.

| # | Species | Binomial | Status |
|---|---------|----------|--------|
| 1 | Philippine Eagle | Pithecophaga jefferyi | ✅ done |
| 2 | Harpy Eagle | Harpia harpyja | ✅ done |
| 3 | Golden Poison Frog | Phyllobates terribilis | ✅ done |
| 4 | Chinese Giant Salamander | Andrias davidianus | ✅ done |
| 5 | Elkhorn Coral | Acropora palmata | ✅ done |
| 6 | Staghorn Coral | Acropora cervicornis | ✅ done |
| 7 | Lord Howe Island Stick Insect | Dryococelus australis | ✅ done |
| 8 | Rusty Patched Bumble Bee | Bombus affinis | ✅ done |
| 9 | Whale Shark | Rhincodon typus | ✅ done |

Watch-outs: corals are Cnidaria (verify class assignment vs check:taxonomy);
bird-order whitelist handles eagles; SVG-photo fallback for the stick insect.

## Workstream B: Threat Matrix `/analytics` ✅ COMPLETED

Cross-species vulnerability comparison (poaching vs climate vs habitat loss vs
invasive species), filters, CSV export, charts. Pure frontend over existing data.

**Implemented:**
- Curated `threat-factors.ts` dataset for all 42 species with 4 threat dimensions (poaching, climate, habitatLoss, invasiveSpecies) scored 0-100
- Threat Matrix UI on `/analytics` with:
  - Heatmap table (species × dimensions, color-coded severity)
  - Overall vulnerability ranking bar chart (top 20)
  - Interactive radar chart per species with rationale
  - Filters: category, conservation status, dimension toggles
  - CSV export button
- Unit test in `src/lib/threatFactors.test.ts`

## Workstream C: Real AI upgrade (env-gated LLM) ✅ COMPLETED

LLM-backed AI Assistant + better species ID behind an env flag with graceful
fallback to the current rule-based logic. Provider: **Gemini (Google AI)**.

**Implemented:**
- `src/lib/gemini.ts` — server-side Gemini client with dual auth (API key `AIza...` via `x-goog-api-key` header, OAuth tokens via `Authorization: Bearer`), circuit breaker on 401/403
- `src/lib/speciesIdentification.ts` — Gemini Vision primary, Claude Vision secondary, heuristic fallback; `isAIConfigured()` helper; results include `animalId` for correct profile links
- `POST /api/v1/identify` — returns `aiConfigured` flag for UI honesty banner
- `/identify` page — heuristic warning banner when no AI key configured; fixed profile links to use `animalId`
- `POST /api/v1/ai/chat` route — system prompt with platform context; returns 501 when `GEMINI_API_KEY` not set
- `GET /api/v1/ai/chat` — health/config endpoint for AI mode indicator
- `AIAssistant.tsx` — tries `/api/v1/ai/chat` first, falls back to rule-based; mode indicator chip (Live/Offline/Checking)
- `GEMINI_API_KEY` in `.env.local` (gitignored); `GEMINI_MODEL` env var (default `gemini-2.5-flash`)