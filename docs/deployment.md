# Deployment

OpenAnimalNet deploys to **Vercel** via GitHub Actions on every push to `main`.

## Quick Deploy

The deployment is fully automated:

1. Push to `main`
2. GitHub Actions runs CI (lint → tests → build → integration tests)
3. If CI passes, the deploy workflow pushes to Vercel production

No manual steps required — just push.

## Setup (First Time)

### 1. Vercel Account

Create a Vercel account at [vercel.com](https://vercel.com) and link your
GitHub repository.

### 2. Generate a Vercel Token

1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click **"Create Token"**
3. Name it `github-actions-deploy`
4. Copy the token (you'll only see it once)

### 3. Set GitHub Secrets

In your GitHub repository, go to **Settings → Secrets and variables → Actions**
and add:

| Secret | Value |
|--------|-------|
| `VERCEL_TOKEN` | The token from step 2 |
| `VERCEL_ORG_ID` | From `.vercel/project.json` → `orgId` |
| `VERCEL_PROJECT_ID` | From `.vercel/project.json` → `projectId` |

### 4. Link the Project Locally

```bash
npx vercel link
```

This creates `.vercel/project.json` with the org and project IDs.

### 5. Push to Deploy

```bash
git push origin main
```

The CI workflow will run, and if it passes, the deploy workflow will push
to Vercel production.

## Manual Deploy

If you need to deploy without pushing:

```bash
# Deploy to production
npx vercel --prod

# Or trigger the GitHub Action manually
gh workflow run "Deploy to Vercel" --repo imredavid64-glitch/openanimalnet
```

## Environment Variables

**No environment variables are required.** All external data (GBIF, Wikidata,
Wikipedia, iNaturalist) is fetched server-side from public APIs with no keys.

If you add environment variables in the future:

1. Add them to Vercel dashboard → Settings → Environment Variables
2. Add them to `.env.local` for local development (never commit this file)

## Monitoring

### Vercel Dashboard

- **Deployments**: [vercel.com/dashboard](https://vercel.com/dashboard)
- **Analytics**: Built-in Web Analytics and Speed Insights
- **Logs**: Runtime logs available in the Vercel dashboard

### GitHub Actions

- **CI**: `.github/workflows/ci.yml` — runs on every push and PR
- **Deploy**: `.github/workflows/deploy.yml` — runs on push to `main`
- **Data Drift**: `.github/workflows/data-drift.yml` — weekly scheduled check

### Health Checks

The API includes health indicators:

```bash
# Check if the site is up
curl -s -o /dev/null -w "%{http_code}" https://openanimalnet.vercel.app/

# Check API
curl https://openanimalnet.vercel.app/api/v1/monitoring/stats
```

## Troubleshooting

### Deploy fails with "token not valid"

The `VERCEL_TOKEN` has expired. Regenerate at
[vercel.com/account/tokens](https://vercel.com/account/tokens) and update the
`VERCEL_TOKEN` secret in GitHub.

### Deploy fails with quota error

Vercel Hobby plan allows 100 deployments per day. If you hit the limit,
wait 24 hours or upgrade the plan.

### Build fails in CI but works locally

CI uses a clean environment. Common causes:

- Missing dependencies (run `npm ci` locally to verify)
- Stale `.next` cache (delete it and rebuild)
- Node version mismatch (CI uses Node 22)

### Site is slow on first load

Vercel's serverless functions cold-start on the first request. Subsequent
requests are fast. For production, consider:

- Enabling Vercel's Edge Network caching
- Adding `export const runtime = 'edge'` to API routes
- Pre-warming with a health check ping
