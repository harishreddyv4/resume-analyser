import { z } from "zod";
import { PLAN_IDS } from "./plan-ids";
import { TARGET_ROLE_OTHER, labelForPreset } from "./target-roles";

const planEnum = z.enum(PLAN_IDS);

export const uploadFormSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Enter your full name (at least 2 characters).")
      .max(100, "Name is too long."),
    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .email("Enter a valid email address."),
    rolePreset: z.string().min(1, "Select a target role."),
    roleCustom: z.string().optional(),
    jobDescription: z
      .string()
      .max(8000, "Job description must be under 8,000 characters."),
    plan: planEnum,
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

export type UploadFormValues = z.infer<typeof uploadFormSchema>;

export function resolveTargetRoleForSubmit(values: UploadFormValues): string {
  if (values.rolePreset === TARGET_ROLE_OTHER) {
    return values.roleCustom?.trim() ?? "";
  }
  return labelForPreset(values.rolePreset);
}

export function formatSummaryRole(
  rolePreset?: string,
  roleCustom?: string,
): string {
  if (!rolePreset) {
    return "—";
  }
  if (rolePreset === TARGET_ROLE_OTHER) {
    const t = roleCustom?.trim();
    return t && t.length > 0 ? t : "—";
  }
  return labelForPreset(rolePreset);
}
