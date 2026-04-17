import { z } from "zod";
import { PLAN_IDS } from "@/lib/plan-ids";
import { TARGET_ROLE_OTHER } from "@/lib/target-roles";

export const multipartSubmissionFieldsSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Enter your full name (at least 2 characters).")
      .max(100, "Name is too long."),
    email: z
      .string()
      .trim()
      .email("Enter a valid email address."),
    rolePreset: z.string().min(1, "Select a target role."),
    roleCustom: z.string().optional(),
    jobDescription: z
      .string()
      .max(8000, "Job description must be under 8,000 characters.")
      .optional()
      .default(""),
    plan: z.enum(PLAN_IDS),
  })
  .superRefine((data, ctx) => {
    if (data.rolePreset === TARGET_ROLE_OTHER) {
      const t = data.roleCustom?.trim() ?? "";
      if (t.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Describe your target role (at least 2 characters).",
          path: ["roleCustom"],
        });
      }
    }
  });

export type MultipartSubmissionFields = z.infer<
  typeof multipartSubmissionFieldsSchema
>;
