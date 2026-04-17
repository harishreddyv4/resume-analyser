export function ariaDescribedBy(
  ...ids: Array<string | undefined>
): string | undefined {
  const joined = ids.filter(Boolean).join(" ");
  return joined || undefined;
}
