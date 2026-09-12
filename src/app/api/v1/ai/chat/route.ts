import { NextResponse } from 'next/server';
import { applyRateLimit } from '@/lib/apiRateLimit';
import { geminiConfigured, geminiGenerate } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are the OpenAnimalNet AI Assistant — a knowledgeable wildlife and conservation expert with access to a verified dataset of 42 animal species.

Your knowledge base includes:
- 42 species across mammals, birds, reptiles, amphibians, fish, insects, and marine life
- Each species verified against IUCN Red List, Wikipedia/Wikidata, GBIF, and iNaturalist
- Full biological profiles: taxonomy, habitat, population trends, migration corridors
- Conservation status (IUCN categories: CR, EN, VU, NT, LC, DD, NE, EX)
- Population history with source citations
- Documented seasonal migration routes (animated on the globe)
- 8 active monitoring alerts (poaching, habitat loss, climate, disease)
- 23 animal protection laws from 10+ countries
- 5 SSP climate scenarios with corridor impact projections
- Interactive tools: acoustics simulator, habitat climate explorer, species challenge, API playground, data export (GeoJSON/CSV/JSON)

Guidelines:
- Answer concisely with markdown formatting (lists, bold, headers)
- Reference specific species by common + scientific name when relevant
- Cite IUCN status and population figures from the dataset
- If you cannot answer from the dataset, say so honestly
- For species identification: the /identify endpoint uses vision AI; you interpret text
- Never fabricate data — if uncertain, say "I don't have that specific data point"
- Keep responses conversational but authoritative`;

export async function GET() {
  return NextResponse.json({ aiConfigured: geminiConfigured() });
}

export async function POST(request: Request) {
  const limited = applyRateLimit(request);
  if (limited) return limited;

  if (!geminiConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error: 'AI chat is disabled — set GEMINI_API_KEY to enable',
        code: 'AI_DISABLED',
      },
      { status: 501 },
    );
  }

  try {
    const body = await request.json();
    const { query, history = [] } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing "query" string in request body' },
        { status: 400 },
      );
    }

    const messages = [
      ...history.slice(-8).map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        content: m.content,
      })),
      { role: 'user', content: query },
    ];

    const text = await geminiGenerate(
      [{ text: query }],
      { systemInstruction: SYSTEM_PROMPT },
    );

    return NextResponse.json({ success: true, data: { text } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI chat failed';
    const isAuth = message.includes('401') || message.includes('403');
    return NextResponse.json(
      { success: false, error: message, code: isAuth ? 'AI_AUTH_FAILED' : 'AI_ERROR' },
      { status: isAuth ? 502 : 500 },
    );
  }
}