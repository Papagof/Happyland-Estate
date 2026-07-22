import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

// Refreshes the Supabase auth cookie on every request so Server Components
// (which can't write cookies themselves) never see an expired session.
//
// This is scaffolding: nothing in the app calls Supabase Auth yet — actual
// login still runs entirely through backend/auth.js's JWT. This function is
// intentionally NOT redirecting unauthenticated requests anywhere; wire that
// up deliberately once a page actually depends on a Supabase session.
export async function updateSupabaseSession(request) {
  let response = NextResponse.next({ request });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return response;
  }

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  // Do not remove this call or move it — it's what actually triggers the
  // token refresh via the cookie handlers above. Without it, Supabase
  // sessions (once something starts using them) would silently expire.
  await supabase.auth.getClaims();

  return response;
}
