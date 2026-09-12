import { NextResponse } from 'next/server';
import { identifyFromImage, isAIConfigured } from '@/lib/speciesIdentification';
import { applyRateLimit } from '@/lib/apiRateLimit';
import type { ApiResponse } from '@/types/animal/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/identify
 * Accepts a base64 image and returns species identification results.
 */
export async function POST(request: Request) {
  const limited = applyRateLimit(request);
  if (limited) return limited;

  try {
    const body = await request.json();
    const { image, topK } = body;

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Missing "image" field (base64 or data URL)' },
        { status: 400 },
      );
    }

    const results = await identifyFromImage(image, topK ?? 5);
    const response: ApiResponse<typeof results> & { aiConfigured: boolean } = {
      success: true,
      data: results,
      aiConfigured: isAIConfigured(),
    };
    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Identification failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}