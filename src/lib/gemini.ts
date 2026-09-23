/**
 * Server-side Gemini (Google AI) client.
 * Env-gated: active when GEMINI_API_KEY is set, otherwise callers should
 * degrade to local fallbacks (heuristic identify, rule-based assistant).
 *
 * Auth: standard Gemini API keys start with `AIza` and are sent via the
 * `x-goog-api-key` header. Other credential formats (e.g. OAuth bearer
 * tokens) are forwarded via the `Authorization: Bearer` header instead.
 */

let providerHealthy = true;

export function geminiKey(): string | undefined {
  return process.env.GEMINI_API_KEY || undefined;
}

export function geminiConfigured(): boolean {
  return Boolean(geminiKey());
}

export function geminiModel(): string {
  return process.env.GEMINI_MODEL || 'gemini-2.5-flash';
}

/**
 * After an auth failure (401/403) the provider is marked unhealthy for the
 * remainder of this serverless instance so requests fail fast instead of
 * burning a network round-trip on every call.
 */
export function geminiHealthy(): boolean {
  return providerHealthy;
}

export function resetGeminiHealth() {
  providerHealthy = true;
}

export async function geminiGenerate(
  parts: { inline_data?: { mime_type: string; data: string }; text?: string }[],
  options: { systemInstruction?: string; responseMimeType?: string } = {},
): Promise<string> {
  const key = geminiKey();
  if (!key) throw new Error('Gemini provider not configured');
  if (!providerHealthy) throw new Error('Gemini provider degraded (auth failure)');

  const model = geminiModel();
  const body: Record<string, unknown> = {
    contents: [{ role: 'user', parts }],
    generationConfig: {
      temperature: 0.3,
      ...(options.responseMimeType ? { responseMimeType: options.responseMimeType } : {}),
    },
  };
  if (options.systemInstruction) {
    body.system_instruction = { parts: [{ text: options.systemInstruction }] };
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (key.startsWith('AIza') || key.startsWith('AIpy')) {
    headers['x-goog-api-key'] = key;
  } else {
    headers['Authorization'] = `Bearer ${key}`;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) providerHealthy = false;
    const detail = await res.text().catch(() => '');
    throw new Error(`Gemini API error ${res.status}${detail ? `: ${detail.slice(0, 240)}` : ''}`);
  }

  const data = await res.json();
  const candidates = data?.candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) {
    throw new Error('Gemini API returned no candidates');
  }
  const text = (candidates[0].content?.parts ?? [])
    .map((p: { text?: string }) => p.text ?? '')
    .join('');
  if (!text) throw new Error('Gemini API returned an empty response');
  return text;
}