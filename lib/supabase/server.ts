import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseEnv } from "./env";

/**
 * Server Supabase client bound to the request cookie store (anon key).
 * Use in Server Components, Route Handlers, and Server Actions when user session matters.
 */
export async function createServerSupabaseClient() {
  if (!supabaseEnv.url || !supabaseEnv.anonKey) {
    throw new Error(
      "Supabase server client: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseEnv.url, supabaseEnv.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component where cookies are read-only; ignore.
        }
      },
    },
  });
}
