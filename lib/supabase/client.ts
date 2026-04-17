"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseEnv } from "./env";

/**
 * Browser Supabase client (anon key). Use for client-side reads where RLS allows.
 */
export function createClient() {
  if (!supabaseEnv.url || !supabaseEnv.anonKey) {
    throw new Error(
      "Supabase browser client: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  return createBrowserClient(supabaseEnv.url, supabaseEnv.anonKey);
}
