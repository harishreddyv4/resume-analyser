export type PageSearchParams = Record<string, string | string[] | undefined>;

export function firstSearchParam(
  raw: string | string[] | undefined,
): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

/** Trims and caps role string for success-page display. */
export function parseRoleSummaryParam(
  raw: string | string[] | undefined,
  maxLen = 120,
): string | null {
  const value = firstSearchParam(raw);
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  return trimmed.length > maxLen ? `${trimmed.slice(0, maxLen - 3)}…` : trimmed;
}
