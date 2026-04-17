import { createClient } from "@supabase/supabase-js";
import { supabaseEnv } from "./env";

/**
 * Service-role client for trusted server code only (API routes, server actions).
 * Bypasses RLS — never import into Client Components or expose to the browser.
 */
export function createAdminClient() {
  if (!supabaseEnv.url || !supabaseEnv.serviceRoleKey) {
    throw new Error(
      "Supabase admin client: missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(supabaseEnv.url, supabaseEnv.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
