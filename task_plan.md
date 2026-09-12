# Task Plan: OpenAnimalNet next features (v1.24+)

## Current Status (v1.23)
- ✅ Species: 42 (expanded from 33)
- ✅ Threat Matrix `/analytics` (4 dimensions × 42 species)
- ✅ AI Chat + Vision ID (Gemini, env-gated, graceful fallback)
- ✅ i18n (8 languages: en/es/fr/de/pt/zh/ar/ja)
- ✅ Build passes, 69 tests pass, lint clean

## Completed Workstreams (v1.24)

### 1. Global Species Search Engine ✅
- **API**: `/api/v1/search` - Searches local DB (42 species) + GBIF (2M+ species) + Wikipedia + Wikidata
- **UI**: `/search` page with multi-source results, source badges, confidence scores
- **Features**: Debounced search, source filters, direct profile links, deep-linkable results
- **Data**: 42 local species + 2M+ GBIF species + Wikipedia + Wikidata

### 2. PWA Offline-First + Background Sync ✅
- **Service Worker**: Cache-first for static assets, stale-while-revalidate for API, network-first for HTML
- **Offline Page**: `/offline` with cached species count, retry button
- **Background Sync**: IndexedDB queues for sightings/observations, SW background sync registration
- **Hook**: `useOfflineSync()` - online status, pending counts, queue operations

### 3. Real-Time Live Alerts (SSE) ✅
- **Endpoint**: `/api/v1/live/alerts` - Server-Sent Events stream
- **Hook**: `useLiveAlerts()` - connection status, real-time alerts, filtering
- **Features**: Heartbeat, reconnection, alert filtering by type/species

### 4. Collaborative Annotations (Yjs + WebRTC) ✅
- **Hook**: `useCollaborativeAnnotations()` - peer-to-peer sync via Yjs + WebRTC
- **Components**: `AnnotationSidebar` - real-time annotations on species pages
- **Features**: Real-time cursors, replies, resolved status, presence indicators

### 5. Advanced Analytics Widgets ✅
- **PVA Widget**: Population Viability Analysis with stochastic Ricker model
- **Parameters**: Initial population, carrying capacity, growth rate, environmental SD, catastrophes, harvest, inbreeding
- **Outputs**: Extinction probability, median trajectories, quasi-extinction risk, confidence intervals

### 6. Citizen Science Observation Workflow ✅
- **Page**: `/observe` - multi-step wizard (species → details → media → review)
- **Features**: Species search, GPS location, photo capture/upload, confidence, habitat/behavior tags
- **Offline**: Queued to IndexedDB, background sync when online
- **Badges**: 14 achievement badges (first obs, species counts, rare species, streaks, etc.)
- **Export**: JSON/CSV/GeoJSON export of personal observations

### 7. Internationalization (8 Languages) ✅
- **Languages**: English, Spanish, French, German, Portuguese, Chinese, Arabic, Japanese
- **Components**: `I18nProvider`, `LanguageSwitcher` in Navbar
- **Coverage**: All UI strings, navigation, tooltips, error messages

### 8. Species Database (42 Species) ✅
- **Complete**: All 42 species with full profiles (taxonomy, population, migration, threats)
- **Threat Matrix**: 4 dimensions × 42 species (poaching, climate, habitat loss, invasive species)
- **Verification**: Cross-referenced across IUCN, Wikipedia, GBIF, iNaturalist

## Pre-Existing Warnings (Unchanged)
- `next/image` optimization warnings on existing pages
- React Hook dependency warnings in pre-existing components
- These are pre-existing and not introduced by new work

## Ready for Deployment ✅
- Build: ✅ Compiles successfully
- Tests: ✅ 69/69 pass
- Lint: ✅ Clean (only pre-existing warnings)
- TypeScript: ✅ No errors

---

## Next Phase Ideas (v1.25+)
1. **Mobile App**: Capacitor iOS/Android builds with native camera/GPS
2. **Corridor Connectivity Graphs**: Network analysis of migration corridors
3. **Auto-Threat Scoring**: GDELT news + Sentinel-2 satellite data integration
4. **Classroom Mode**: Teacher dashboards, student logins, COPPA/FERPA compliance
5. **Donation Platform**: Species sponsorship, transparent fund tracking with Stripe Connect