import { NextResponse } from 'next/server';
import { applyRateLimit } from '@/lib/apiRateLimit';
import type { ApiResponse } from '@/types/animal/types';

export const dynamic = 'force-dynamic';

interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  createdAt: string;
}

// In production, use a database. In-memory for demo.
const webhooks: Webhook[] = [];

/**
 * GET    /api/v1/webhooks            — list webhooks
 * POST   /api/v1/webhooks            — register a webhook
 * DELETE /api/v1/webhooks?id=xx      — remove webhook
 */
export async function GET(request: Request) {
  const limited = applyRateLimit(request);
  if (limited) return limited;

  return NextResponse.json({ success: true, data: webhooks } satisfies ApiResponse<Webhook[]>, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function POST(request: Request) {
  const limited = applyRateLimit(request);
  if (limited) return limited;

  const body = await request.json();
  const { url, events = ['alert.critical', 'alert.warning'] } = body;

  if (!url || !URL.parse(url)) {
    return NextResponse.json({ success: false, error: 'Valid URL required' }, { status: 400 });
  }

  const webhook: Webhook = {
    id: `wh-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    url,
    events,
    secret: `whsec_${Math.random().toString(36).slice(2)}`,
    active: true,
    createdAt: new Date().toISOString(),
  };
  webhooks.push(webhook);

  return NextResponse.json({ success: true, data: webhook } satisfies ApiResponse<Webhook>);
}

export async function DELETE(request: Request) {
  const limited = applyRateLimit(request);
  if (limited) return limited;

  const id = new URL(request.url).searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, error: 'Missing ?id=' }, { status: 400 });
  }

  const idx = webhooks.findIndex(w => w.id === id);
  if (idx === -1) {
    return NextResponse.json({ success: false, error: 'Webhook not found' }, { status: 404 });
  }

  webhooks.splice(idx, 1);
  return NextResponse.json({ success: true, data: { deleted: id } });
}