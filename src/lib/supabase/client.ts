// src/lib/supabase/client.ts

import { createClient } from '@supabase/supabase-js';

declare global {
  interface Window {
    supabase: ReturnType<typeof createClient>;
  }
}

export function getSupabaseClient() {
  if (typeof window !== 'undefined' && window.supabase) {
    return window.supabase;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!url || !key) {
    console.warn('Supabase credentials not found. Running in offline mode.');
    return null;
  }

  const client = createClient(url, key);

  if (typeof window !== 'undefined') {
    window.supabase = client;
  }

  return client;
}
