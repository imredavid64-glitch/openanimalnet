# OpenAnimalNet API Reference

> **Interactive testing**: import [`docs/openapi.yaml`](openapi.yaml) into
> [Swagger Editor](https://editor.swagger.io), Postman, or Insomnia to test
> endpoints interactively.

All endpoints are rate-limited to **60 requests per minute per IP** and return
`Cache-Control: public, s-maxage=60` headers. Responses use a consistent envelope:

```json
{
  "success": true,
  "data": { ... },
  "pagination": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
}
```

`pagination` is present only on endpoints that paginate (e.g. `/animals`).

---

## Animals

### `GET /api/v1/animals`

List all species with optional filtering and pagination.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | `string` | Filter by animal category: `mammals`, `birds`, `reptiles`, `amphibians`, `fish`, `invertebrates`, `insects`, `marine` |
| `conservationStatus` | `string` | Filter by IUCN status: `CR`, `EN`, `VU`, `NT`, `LC`, `DD`, `NE` |
| `dataCategories` | `string` | Comma-separated data category filter: `biological`, `behavioral`, `ecological`, `population`, `health`, `agricultural`, `shelter`, `human-interaction` |
| `isMonitored` | `boolean` | Filter by monitoring status |
| `search` | `string` | Full-text search across common name, scientific name, and description |
| `page` | `number` | Page number (default: 1) |
| `limit` | `number` | Results per page (default: 20, max: 100) |

**Example:**

```bash
curl "http://localhost:3000/api/v1/animals?category=mammals&conservationStatus=EN&limit=5"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "elephant-001",
      "commonName": "African Bush Elephant",
      "scientificName": "Loxodonta africana",
      "category": "mammals",
      "conservationStatus": "EN",
      "populationEstimate": 415000,
      "isMonitored": true,
      "location": { "latitude": -2.3333, "longitude": 37.0833 },
      "habitat": ["savanna", "forest", "desert"],
      "dataCategories": ["biological", "behavioral", "ecological", "population", "health", "human-interaction"]
    }
  ],
  "pagination": { "page": 1, "limit": 5, "total": 42, "totalPages": 9 }
}
```

---

### `GET /api/v1/animals/:id`

Full profile for one species, including all five data category sub-objects.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Species ID (e.g., `elephant-001`, `lion-001`) |

**Example:**

```bash
curl "http://localhost:3000/api/v1/animals/lion-001"
```

**Response includes:**

- Full taxonomy (kingdom through species)
- Location with lat/lng, altitude, accuracy, timestamp, and source
- Habitat array
- Population estimate and history
- Migration routes with waypoints, seasons, and distances
- All five data categories with subcategory data
- GBIF key and iNaturalist ID for cross-referencing

---

## Populations

### `GET /api/v1/populations`

Population estimates and conservation metrics for all species.

**Example:**

```bash
curl "http://localhost:3000/api/v1/populations"
```

**Response:**

`data` is a flat array of records (one per species):

```json
{
  "success": true,
  "data": [
    {
      "animalId": "elephant-001",
      "commonName": "African Bush Elephant",
      "scientificName": "Loxodonta africana",
      "conservationStatus": "EN",
      "populationEstimate": 415000,
      "aerialSurveyCounts": 352271,
      "cameraTrapCaptureRates": null,
      "rangeContractionPercentage": 24
    }
  ]
}
```

---

## Monitoring

### `GET /api/v1/monitoring/alerts`

Active monitoring alerts, filterable by severity.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | `string` | Filter by severity: `critical`, `warning`, `info` |

**Example:**

```bash
curl "http://localhost:3000/api/v1/monitoring/alerts?type=critical"
```

---

### `GET /api/v1/monitoring/stats`

Aggregated dashboard statistics.

**Response:**

```json
{
  "success": true,
  "data": {
    "totalAnimals": 42,
    "monitoredAnimals": 42,
    "activeAlerts": 8,
    "monitoringCoverage": {
      "mammals": 1.0,
      "birds": 1.0,
      "reptiles": 1.0,
      "amphibians": 1.0,
      "fish": 0,
      "marine": 1.0
    }
  }
}
```

---

## Locations

### `GET /api/v1/locations`

Recent telemetry locations for all monitored animals.

**Example:**

```bash
curl "http://localhost:3000/api/v1/locations"
```

---

## Live Sync

### `GET /api/v1/live/sync`

Fetch recent georeferenced occurrences from GBIF for a specific species.
Results are cached for 60 seconds per species.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | Yes | Species ID (e.g., `lion-001`) |

**Example:**

```bash
curl "http://localhost:3000/api/v1/live/sync?id=lion-001"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "animalId": "lion-001",
    "scientificName": "Panthera leo",
    "gbifKey": 5219404,
    "occurrences": [
      {
        "key": 4000000001,
        "decimalLatitude": -25.5,
        "decimalLongitude": 28.1,
        "country": "ZA",
        "eventDate": "2026-07-15",
        "basisOfRecord": "HUMAN_OBSERVATION"
      }
    ],
    "fetchedAt": "2026-08-13T22:00:00.000Z",
    "count": 16059
  }
}
```

### `GET /api/v1/live/observations`

Fetch recent georeferenced occurrences from GBIF for a **batch** of species
— the endpoint that powers the globe's live-observations layer. Records are
restricted to the last 365 days and sorted most-recent-first; a species with
no GBIF key (or one that fails upstream) is skipped rather than failing the
whole request. Cached for 60 seconds per species.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ids` | `string` | Yes | Comma-separated species IDs (max 40), e.g. `lion-001,tiger-001` |

**Example:**

```bash
curl "http://localhost:3000/api/v1/live/observations?ids=lion-001,tiger-001"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "fetchedAt": "2026-08-14T00:00:00.000Z",
    "cached": false,
    "skipped": [],
    "observations": [
      {
        "animalId": "lion-001",
        "key": 4000000001,
        "species": "Panthera leo",
        "country": "ZA",
        "latitude": -25.5,
        "longitude": 28.1,
        "eventDate": "2026-08-10"
      }
    ]
  }
}
```

---

## Search

### `GET /api/v1/search?q=<query>`

Universal species lookup across GBIF, Wikipedia, Wikidata, and iNaturalist.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | `string` | Yes | Search query (species common/scientific name) |

**Example:**

```bash
curl "http://localhost:3000/api/v1/search?q=lion"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "results": [ { "commonName": "African Lion" } ],
    "sources": { "gbif": 3, "wikipedia": 2, "wikidata": 1, "inaturalist": 1 }
  }
}
```

Returns HTTP `400` when `q` is missing, and `502` when an upstream service fails.

---

## Identify

### `POST /api/v1/identify`

Identify a species from a base64 (or data-URL) image.

**Body (JSON):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | `string` | Yes | Base64-encoded image or data URL |
| `topK` | `number` | No | Max results to return (default: 5) |

**Example:**

```bash
curl -X POST "http://localhost:3000/api/v1/identify" \
  -H "Content-Type: application/json" \
  -d '{"image":"data:image/png;base64,....","topK":3}'
```

**Response:** `data` is an array of ranked matches, each with a `commonName`,
`scientificName`, `confidence` (0–100), and `matchFactors`.

Returns HTTP `400` when `image` is missing.

---

## Subscriptions

Alert subscriptions, stored in-memory (demo).

### `GET /api/v1/subscriptions?email=<email>`

List subscriptions, optionally filtered by email.

### `POST /api/v1/subscriptions`

Create a subscription. Returns HTTP `201`.

**Body (JSON):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | Yes | Subscriber email |
| `speciesIds` | `string[]` | No | Species IDs to follow |
| `regions` | `object[]` | No | `{ lat, lng, radiusKm }` regions |
| `alertTypes` | `string[]` | No | `critical` / `warning` / `info` (default both critical+warning) |

Returns HTTP `400` for an invalid email.

### `DELETE /api/v1/subscriptions?id=<id>`

Remove a subscription. Returns HTTP `404` if not found.

---

## Annotations

Per-species notes / corrections / sightings, stored in-memory (demo).

### `GET /api/v1/annotations?animalId=<id>`

List annotations, optionally filtered by species.

### `POST /api/v1/annotations`

Create an annotation. Returns HTTP `201`.

**Body (JSON):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `animalId` | `string` | Yes | Species ID |
| `author` | `string` | Yes | Author name (≤100 chars) |
| `content` | `string` | Yes | Annotation text (≤2000 chars) |
| `category` | `string` | No | `observation` / `correction` / `note` / `sighting` |
| `location` | `object` | No | `{ lat, lng }` |

Returns HTTP `400` for missing fields or content over 2000 characters.

### `DELETE /api/v1/annotations?id=<id>`

Remove an annotation. Returns HTTP `404` if not found.

---

## Webhooks

Outbound alert webhooks, stored in-memory (demo).

### `GET /api/v1/webhooks`

List registered webhooks.

### `POST /api/v1/webhooks`

Register a webhook. Returns HTTP `201`.

**Body (JSON):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | `string` | Yes | Callback URL |
| `events` | `string[]` | No | Events to receive (default `alert.critical`, `alert.warning`) |

Returns HTTP `400` for an invalid URL. Response includes a generated `secret`
(`whsec_...`).

### `DELETE /api/v1/webhooks?id=<id>`

Remove a webhook. Returns HTTP `404` if not found.

---

## Export

### `GET /api/v1/export?format=<format>&category=<category>`

Export the entire species dataset as GeoJSON (default), CSV, or KML.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `format` | `string` | `geojson` (default), `csv`, or `kml` |
| `category` | `string` | Optional category filter |

**Example:**

```bash
curl "http://localhost:3000/api/v1/export?format=csv"
```

GeoJSON output is a `FeatureCollection` with one `Point` feature per species;
CSV includes a `commonName` header row; KML contains a `<Placemark>` per species.

---

## Feed

### `GET /api/v1/feed?format=<format>`

Conservation-alert feed as Atom XML (default) or RSS.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `format` | `string` | `atom` (default) or `rss` |

**Example:**

```bash
curl "http://localhost:3000/api/v1/feed?format=rss"
```

Returns `application/atom+xml` or `application/rss+xml` content.

---

## Live Alerts (SSE)

### `GET /api/v1/live/alerts`

Server-sent-events stream of live conservation alerts. Sends a `connected`
event on open, periodic `heartbeat` events (every 30s), and `alert` events as
they occur — including crowd-sourced observations submitted via
`POST /api/v1/live/observations`. Closes automatically after 5 minutes.

**Example (curl):**

```bash
curl -N "http://localhost:3000/api/v1/live/alerts"
```

---

## Rate Limiting

All endpoints are rate-limited to **60 requests per minute per IP**. When the
limit is exceeded, the API returns:

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "retryAfter": 45
}
```

With HTTP status `429` and a `Retry-After` header.

---

## Error Responses

All errors follow the envelope format:

```json
{
  "success": false,
  "error": "Error message"
}
```

Common HTTP status codes:

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (invalid parameters) |
| 404 | Species or resource not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
