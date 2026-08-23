# Task Plan: OpenAnimalNet next features

## Goal

Ship three approved features in sequence — no database anywhere (Supabase was
removed in 25413a1; localStorage stays the only client store). Zero-env default.

## Status

Launch 1.22.0 deployed & verified (2026-08-23): PWA fixed, robots/sitemap live,
canonical URL correct, CI green, production 200 across the board.

## Workstream A: Species expansion 33 → 42 (approved slate)

`npm run species:add -- --apply "<binomial>"` per species, then a manual curation
pass (population figures w/ sourced notes, habitat, coords, category/class check,
migration routes for whale shark). Then: bump count-dependent tests (now
data-driven), README counts, freshness check must pass ALL CURRENT.

| # | Species | Binomial | Status |
|---|---------|----------|--------|
| 1 | Philippine Eagle | Pithecophaga jefferyi | pending |
| 2 | Harpy Eagle | Harpia harpyja | pending |
| 3 | Golden Poison Frog | Phyllobates terribilis | pending |
| 4 | Chinese Giant Salamander | Andrias davidianus | pending |
| 5 | Elkhorn Coral | Acropora palmata | pending |
| 6 | Staghorn Coral | Acropora cervicornis | pending |
| 7 | Lord Howe Island Stick Insect | Dryococelus australis | pending |
| 8 | Rusty Patched Bumble Bee | Bombus affinis | pending |
| 9 | Whale Shark | Rhincodon typus | pending |

Watch-outs: corals are Cnidaria (verify class assignment vs check:taxonomy);
bird-order whitelist handles eagles; SVG-photo fallback for the stick insect.

## Workstream B: Threat Matrix `/analytics`

Cross-species vulnerability comparison (poaching vs climate vs habitat loss vs
invasive species), filters, CSV export, charts. Pure frontend over existing data.

## Workstream C: Real AI upgrade (env-gated LLM)

LLM-backed AI Assistant + better species ID behind an env flag with graceful
fallback to the current rule-based logic. Provider TBD at design time.
