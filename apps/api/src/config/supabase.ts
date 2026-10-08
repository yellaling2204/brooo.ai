import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV } from './env';

// Service role client for server-side trusted operations (bypasses RLS when needed for ingestion/vectorization)
export const supabaseAdmin: SupabaseClient = createClient(
  ENV.SUPABASE_URL,
  ENV.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Helper to create a user-scoped client that respects RLS with the user's JWT
export function createUserClient(jwtToken: string): SupabaseClient {
  return createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    },
    auth: {
      persistSession: false,
    },
  });
}

