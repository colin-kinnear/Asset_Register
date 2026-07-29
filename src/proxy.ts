import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase auth session on every request — required by the
// SSR client so server components see a valid session. Route-level access
// control (admin/office/technician, per plan §07) is enforced by RLS in
// Postgres, not here; this proxy only keeps the session cookie alive.
export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  // No Supabase project wired up yet (Phase 0) — pass requests through
  // rather than 500ing every route. Remove this guard once env vars are set;
  // from then on a real project should always have them.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|manifest.webmanifest|sw.js).*)"],
};
