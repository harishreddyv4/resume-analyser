/**
 * Placeholder server-side auth gate for internal admin pages.
 * Replace this with your real auth provider/session checks.
 */
function normalizeProvidedKey(
  raw: string | null | undefined,
): string | undefined {
  if (raw == null) {
    return undefined;
  }
  const t = raw.trim();
  if (!t) {
    return undefined;
  }
  try {
    return decodeURIComponent(t);
  } catch {
    return t;
  }
}

export function isAdminAuthorized(requestHeaders: {
  get(name: string): string | null;
}, queryKey?: string): boolean {
  const configuredKey = process.env.ADMIN_DASHBOARD_KEY?.trim();
  if (!configuredKey) {
    return process.env.NODE_ENV !== "production";
  }
  const headerKey = normalizeProvidedKey(requestHeaders.get("x-admin-key"));
  const keyFromQuery = normalizeProvidedKey(queryKey);
  return headerKey === configuredKey || keyFromQuery === configuredKey;
}
