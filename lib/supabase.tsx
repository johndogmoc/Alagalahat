import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let _client: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (_client) return _client;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Avoid crashing Next.js build/prerender when env vars
    // are not set yet. Client components will show errors on use.
    // eslint-disable-next-line no-console
    console.warn(
      "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
    throw new Error("Supabase env vars are required.");
  }

  _client = createClient(supabaseUrl, supabaseAnonKey);
  return _client;
}

