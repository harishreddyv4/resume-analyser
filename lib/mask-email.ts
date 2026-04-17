/** Masks local-part for summary display (UI unchanged). */
export function maskEmail(email: string): string {
  const t = email.trim();
  if (!t.includes("@")) {
    return t || "—";
  }
  const [u, d] = t.split("@");
  if (!u || !d) {
    return t;
  }
  const vis = u.slice(0, 2);
  return `${vis}…@${d}`;
}
