import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Not called by any route yet — the app still runs on the local Postgres
// pool in backend/db.js and the custom JWT auth in backend/auth.js. This is
// scaffolding for Server Components, Server Actions, and Route Handlers that
// want to talk to Supabase directly.
//
// Don't cache/reuse the returned client across requests — always create a
// fresh one per request (it captures this request's cookies).
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component, which can't set cookies — fine as
          // long as middleware.js is refreshing the session on every request.
        }
      }
    }
  });
}

// Server-only, bypasses RLS. Only use where elevated access is genuinely
// needed, and never expose this client (or SUPABASE_SECRET_KEY) to the browser.
export function createAdminClient() {
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
    cookies: { getAll: () => [], setAll: () => {} }
  });
}
