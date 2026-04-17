import { TARGET_ROLE_OTHER, labelForPreset } from "@/lib/target-roles";

export function resolveTargetRoleForApi(
  rolePreset: string,
  roleCustom?: string | null,
): string {
  if (rolePreset === TARGET_ROLE_OTHER) {
    return roleCustom?.trim() ?? "";
  }
  return labelForPreset(rolePreset);
}
