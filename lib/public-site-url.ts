const DEFAULT_SITE_URL = "http://localhost:3000";

function hasProtocol(value: string): boolean {
  return /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(value);
}

function inferProtocol(trimmed: string): string {
  if (hasProtocol(trimmed)) {
    return trimmed;
  }

  const host = trimmed.split("/")[0]?.toLowerCase() ?? "";
  if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
    return `http://${trimmed}`;
  }

  return `https://${trimmed}`;
}

/**
 * Resolves NEXT_PUBLIC_APP_URL for `metadataBase` and other absolute URLs.
 * Empty, whitespace-only, or invalid values fall back so the app never throws on `new URL()`.
 */
export function getPublicSiteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_APP_URL;
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  if (!trimmed) {
    return new URL(DEFAULT_SITE_URL);
  }

  try {
    const withProtocol = inferProtocol(trimmed);
    const normalized = withProtocol.replace(/\/$/, "");
    return new URL(normalized);
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}
