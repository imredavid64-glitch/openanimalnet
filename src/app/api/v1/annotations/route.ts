import { NextResponse } from 'next/server';
import { applyRateLimit } from '@/lib/apiRateLimit';
import type { ApiResponse } from '@/types/animal/types';

export const dynamic = 'force-dynamic';

interface Annotation {
  id: string;
  animalId: string;
  author: string;
  content: string;
  category: 'observation' | 'correction' | 'note' | 'sighting';
  location?: { lat: number; lng: number };
  createdAt: string;
}

// In production, use a database. In-memory for demo.
const annotations: Annotation[] = [];

/**
 * GET    /api/v1/annotations?animalId=xxx   — list annotations for a species
 * POST   /api/v1/annotations                — create annotation
 * DELETE /api/v1/annotations?id=xx           — remove annotation
 */
export async function GET(request: Request) {
  const limited = applyRateLimit(request);
  if (limited) return limited;

  const animalId = new URL(request.url).searchParams.get('animalId');
  const filtered = animalId ? annotations.filter(a => a.animalId === animalId) : annotations;

  return NextResponse.json({ success: true, data: filtered } satisfies ApiResponse<Annotation[]>, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function POST(request: Request) {
  const limited = applyRateLimit(request);
  if (limited) return limited;

  const body = await request.json();
  const { animalId, author, content, category = 'note', location } = body;

  if (!animalId || !content || !author) {
    return NextResponse.json(
      { success: false, error: 'Required fields: animalId, author, content' },
      { status: 400 },
    );
  }

  if (content.length > 2000) {
    return NextResponse.json(
      { success: false, error: 'Content must be 2000 characters or fewer' },
      { status: 400 },
    );
  }

  const annotation: Annotation = {
    id: `ann-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    animalId,
    author: author.slice(0, 100),
    content: content.slice(0, 2000),
    category,
    location,
    createdAt: new Date().toISOString(),
  };
  annotations.push(annotation);

  return NextResponse.json({ success: true, data: annotation } satisfies ApiResponse<Annotation>);
}

export async function DELETE(request: Request) {
  const limited = applyRateLimit(request);
  if (limited) return limited;

  const id = new URL(request.url).searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, error: 'Missing ?id=' }, { status: 400 });
  }

  const idx = annotations.findIndex(a => a.id === id);
  if (idx === -1) {
    return NextResponse.json({ success: false, error: 'Annotation not found' }, { status: 404 });
  }

  annotations.splice(idx, 1);
  return NextResponse.json({ success: true, data: { deleted: id } });
}