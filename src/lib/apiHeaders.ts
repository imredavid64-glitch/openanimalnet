// Cache-Control for API responses. The demo dataset is static, so responses
// are safe to cache briefly both on the CDN and in the browser, which keeps
// the per-IP rate limit from being hit by routine page loads.
export const API_CACHE_CONTROL =
  'public, max-age=30, s-maxage=60, stale-while-revalidate=30';
