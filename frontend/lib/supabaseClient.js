import { createBrowserClient } from '@supabase/ssr';

// Browser-side Supabase client. Safe to call from any 'use client' component —
// uses the publishable key, which is meant to be exposed to the browser.
export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}
