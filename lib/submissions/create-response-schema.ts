import { z } from "zod";

/** Validates `POST /api/submissions` JSON before client navigation. */
export const createSubmissionResponseSchema = z.object({
  submissionId: z.string().uuid(),
  status: z.enum([
    "draft",
    "awaiting_payment",
    "payment_processing",
    "queued",
    "processing",
    "complete",
    "failed",
  ]),
});
