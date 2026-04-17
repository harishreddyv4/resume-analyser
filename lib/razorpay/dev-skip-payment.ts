/**
 * Opt-in local bypass for Razorpay checkout (`npm run dev` only).
 * Never enable on deployed production — `NODE_ENV` is `production` there.
 */
export function isRazorpayDevSkipPaymentAllowed(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.RAZORPAY_DEV_SKIP_PAYMENT === "1"
  );
}
