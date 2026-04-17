/**
 * Razorpay keys: https://dashboard.razorpay.com/app/keys
 * - Key ID is returned to the browser for Checkout (not a secret).
 * - Key secret stays server-only.
 */
export function isRazorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID?.trim() && process.env.RAZORPAY_KEY_SECRET?.trim());
}

export function requireRazorpayKeyId(): string {
  const v = process.env.RAZORPAY_KEY_ID?.trim();
  if (!v) {
    throw new Error("RAZORPAY_KEY_ID is not set.");
  }
  return v;
}

export function requireRazorpayKeySecret(): string {
  const v = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!v) {
    throw new Error("RAZORPAY_KEY_SECRET is not set.");
  }
  return v;
}

/** Required on Vercel (see webhook route); optional for local-only dev. */
export function getRazorpayWebhookSecret(): string | undefined {
  return process.env.RAZORPAY_WEBHOOK_SECRET?.trim() || undefined;
}
