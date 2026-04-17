/**
 * Reads a fetch `Response` body as JSON without throwing on empty or invalid JSON.
 */
export async function safeResponseJson(
  res: Response,
): Promise<{ ok: true; data: unknown } | { ok: false }> {
  const text = await res.text();
  if (!text.trim()) {
    return { ok: false };
  }
  try {
    return { ok: true, data: JSON.parse(text) as unknown };
  } catch {
    return { ok: false };
  }
}
