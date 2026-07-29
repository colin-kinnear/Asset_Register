import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

// Browser-side client — used in Client Components (e.g. the technician
// scan/log flow, which also drives the Dexie offline cache separately).
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
