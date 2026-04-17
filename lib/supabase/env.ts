/**
 * Supabase environment variables (Next.js).
 *
 * NEXT_PUBLIC_* are exposed to the browser — use only the anon key there.
 * SUPABASE_SERVICE_ROLE_KEY is server-only; never prefix with NEXT_PUBLIC_.
 */
export const supabaseEnv = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
} as const;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseEnv.url && supabaseEnv.anonKey && supabaseEnv.serviceRoleKey
  );
}
