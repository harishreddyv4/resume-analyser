"use client";

import { useMemo } from "react";
import { useWatch, type Control } from "react-hook-form";
import { maskEmail } from "@/lib/mask-email";
import { resolvePlan } from "@/lib/site";
import { formatSummaryRole, type UploadFormValues } from "@/lib/upload-form-schema";

type OrderSummaryPanelProps = {
  control: Control<UploadFormValues>;
  resume: File | null;
};

export function OrderSummaryPanel({ control, resume }: OrderSummaryPanelProps) {
  const fullName = useWatch({ control, name: "fullName" }) ?? "";
  const email = useWatch({ control, name: "email" }) ?? "";
  const planId = useWatch({ control, name: "plan" });
  const rolePreset = useWatch({ control, name: "rolePreset" }) ?? "";
  const roleCustom = useWatch({ control, name: "roleCustom" }) ?? "";
  const jd = useWatch({ control, name: "jobDescription" }) ?? "";

  const plan = useMemo(() => resolvePlan(planId), [planId]);

  const roleLine = formatSummaryRole(rolePreset, roleCustom);
  const jdLine =
    jd.trim().length > 0
      ? `${jd.trim().length.toLocaleString()} characters`
      : "Not added";

  const rows = [
    { k: "Plan", v: `${plan.name} · ${plan.price}` },
    { k: "Resume", v: resume?.name ?? "—" },
    { k: "Target role", v: roleLine },
    { k: "Job description", v: jdLine },
    { k: "Name", v: fullName.trim() || "—" },
    { k: "Email", v: email.trim() ? maskEmail(email) : "—" },
  ];

  return (
    <aside className="rounded-2xl border border-slate-200/80 bg-gradient-to-b from-slate-50/90 to-cyan-50/20 p-6 shadow-surface">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Summary
      </p>
      <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">
        Order preview
      </h2>
      <dl className="mt-6 space-y-4 border-t border-slate-200/80 pt-6">
        {rows.map((row) => (
          <div
            key={row.k}
            className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4"
          >
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {row.k}
            </dt>
            <dd className="text-sm font-medium text-slate-900 sm:max-w-[60%] sm:truncate sm:text-right">
              {row.v}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
