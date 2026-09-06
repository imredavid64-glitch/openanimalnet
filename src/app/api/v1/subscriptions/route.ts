import { NextResponse } from 'next/server';
import { applyRateLimit } from '@/lib/apiRateLimit';
import type { ApiResponse } from '@/types/animal/types';

export const dynamic = 'force-dynamic';

interface Subscription {
  id: string;
  email: string;
  speciesIds: string[];
  regions: { lat: number; lng: number; radiusKm: number }[];
  alertTypes: ('critical' | 'warning' | 'info')[];
  createdAt: string;
}

// In production, use a database. In-memory for demo.
const subscriptions: Subscription[] = [];

/**
 * GET  /api/v1/subscriptions         — list subscriptions
 * POST /api/v1/subscriptions         — create subscription
 * DELETE /api/v1/subscriptions?id=xx — remove subscription
 */
export async function GET(request: Request) {
  const limited = applyRateLimit(request);
  if (limited) return limited;
  const email = new URL(request.url).searchParams.get('email');
  const filtered = email ? subscriptions.filter(s => s.email === email) : subscriptions;
  return NextResponse.json({ success: true, data: filtered } satisfies ApiResponse<Subscription[]>, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function POST(request: Request) {
  const limited = applyRateLimit(request);
  if (limited) return limited;

  const body = await request.json();
  const { email, speciesIds = [], regions = [], alertTypes = ['critical', 'warning'] } = body;

  if (!email || !email.includes('@')) {
    return NextResponse.json({ success: false, error: 'Valid email required' }, { status: 400 });
  }

  const sub: Subscription = {
    id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    email,
    speciesIds,
    regions,
    alertTypes,
    createdAt: new Date().toISOString(),
  };
  subscriptions.push(sub);

  return NextResponse.json({ success: true, data: sub } satisfies ApiResponse<Subscription>);
}

export async function DELETE(request: Request) {
  const limited = applyRateLimit(request);
  if (limited) return limited;

  const id = new URL(request.url).searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, error: 'Missing ?id=' }, { status: 400 });
  }

  const idx = subscriptions.findIndex(s => s.id === id);
  if (idx === -1) {
    return NextResponse.json({ success: false, error: 'Subscription not found' }, { status: 404 });
  }

  subscriptions.splice(idx, 1);
  return NextResponse.json({ success: true, data: { deleted: id } });
}