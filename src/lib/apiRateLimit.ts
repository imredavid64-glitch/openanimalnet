import { NextResponse } from 'next/server';
import { rateLimit, getClientIp } from './rateLimit';
import type { ApiResponse } from '../types/animal/types';

/**
 * Applies the API rate limit for a request. Returns null when allowed, or a
 * 429 NextResponse when the client has exceeded the limit.
 * Kept separate from rateLimit.ts (pure, unit-tested) so tests don't need to
 * resolve the 'next/server' module.
 */
export function applyRateLimit(request: Request): NextResponse | null {
  const result = rateLimit(getClientIp(request));
  if (result.allowed) return null;

  const response: ApiResponse<null> = {
    success: false,
    error: 'Rate limit exceeded',
    message: `Too many requests. Try again in ${result.retryAfterSec} second${result.retryAfterSec === 1 ? '' : 's'}.`,
  };
  return NextResponse.json(response, {
    status: 429,
    headers: { 'Retry-After': String(result.retryAfterSec) },
  });
}
