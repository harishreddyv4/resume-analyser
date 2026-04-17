import { createHmac, timingSafeEqual } from "crypto";
import { requireRazorpayKeySecret } from "./env";

/**
 * Verifies the Razorpay Checkout signature: HMAC-SHA256(order_id|payment_id, key_secret).
 * @see https://razorpay.com/docs/payments/server-integration/nodejs/payment-verification/
 */
export function verifyRazorpayPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  const secret = requireRazorpayKeySecret();
  const body = `${orderId}|${paymentId}`;
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(signature, "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
