import Razorpay from "razorpay";
import { requireRazorpayKeyId, requireRazorpayKeySecret } from "./env";

let instance: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (!instance) {
    instance = new Razorpay({
      key_id: requireRazorpayKeyId(),
      key_secret: requireRazorpayKeySecret(),
    });
  }
  return instance;
}
