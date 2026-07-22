import { createClient } from '@supabase/supabase-js';

// Not wired into any route yet — the app still runs on the local
// Postgres pool in backend/db.js and the custom JWT auth in backend/auth.js.
// This client is scaffolding for a future migration to Supabase.
export function createSupabaseClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function createSupabaseAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}
