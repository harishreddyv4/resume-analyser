"use client";

import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { plans } from "@/lib/site";
import type { UploadFormValues } from "@/lib/upload-form-schema";

type PlanPickerProps = {
  register: UseFormRegister<UploadFormValues>;
  errors: FieldErrors<UploadFormValues>;
  disabled: boolean;
};

export function PlanPicker({ register, errors, disabled }: PlanPickerProps) {
  return (
    <fieldset disabled={disabled} className="space-y-3">
      <legend className="text-sm font-medium text-zinc-800">Plan</legend>
      <div className="grid gap-3 sm:grid-cols-3">
        {plans.map((plan) => (
          <label
            key={plan.id}
            className="relative block cursor-pointer"
          >
            <input
              type="radio"
              value={plan.id}
              className="peer sr-only"
              {...register("plan")}
            />
            <span
              className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-4 text-left transition-colors peer-checked:border-zinc-900 peer-checked:bg-zinc-50 peer-checked:ring-1 peer-checked:ring-zinc-900/10 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-zinc-900"
            >
              {plan.featured ? (
                <span className="mb-2 inline-flex w-fit rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Popular
                </span>
              ) : (
                <span className="mb-2 h-5" aria-hidden />
              )}
              <span className="text-sm font-semibold text-zinc-900">
                {plan.name}
              </span>
              <span className="mt-1 text-lg font-semibold tracking-tight text-zinc-900">
                {plan.price}
              </span>
              <span className="mt-2 text-xs leading-snug text-zinc-500">
                {plan.description}
              </span>
            </span>
          </label>
        ))}
      </div>
      {errors.plan?.message ? (
        <p role="alert" className="text-sm font-medium text-red-700">
          {String(errors.plan.message)}
        </p>
      ) : null}
    </fieldset>
  );
}
