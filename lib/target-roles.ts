export const TARGET_ROLE_OTHER = "other" as const;

export const targetRoleOptions = [
  { value: "software_engineer", label: "Software engineer" },
  { value: "product_manager", label: "Product manager" },
  { value: "data_scientist", label: "Data scientist / analyst" },
  { value: "designer", label: "Designer (UX / UI / visual)" },
  { value: "marketing", label: "Marketing" },
  { value: "sales", label: "Sales" },
  { value: "finance", label: "Finance / accounting" },
  { value: "operations", label: "Operations / supply chain" },
  { value: "hr", label: "Human resources" },
  { value: "consulting", label: "Consulting" },
  { value: TARGET_ROLE_OTHER, label: "Other (specify)" },
] as const;

const labelByValue = Object.fromEntries(
  targetRoleOptions.map((o) => [o.value, o.label]),
) as Record<string, string>;

export function labelForPreset(value: string): string {
  return labelByValue[value] ?? value;
}
