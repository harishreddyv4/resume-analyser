"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { TextField } from "@/components/forms/TextField";
import { SelectField } from "@/components/forms/SelectField";
import { TextAreaField } from "@/components/forms/TextAreaField";
import { Button } from "@/components/ui/Button";
import { useSyncPlanFromSearchParams } from "@/hooks/use-sync-plan-from-search-params";
import { isPlanId } from "@/lib/plan-ids";
import { resolvePlan } from "@/lib/site";
import { submitUploadForm } from "@/lib/submissions/submit-upload-form";
import { TARGET_ROLE_OTHER, targetRoleOptions } from "@/lib/target-roles";
import { uploadFormSchema, type UploadFormValues } from "@/lib/upload-form-schema";
import { uploadTrustStatement } from "@/lib/upload-trust";
import { validateResumeFile } from "@/lib/uploads";
import { OrderSummaryPanel } from "./OrderSummaryPanel";
import { PlanPicker } from "./PlanPicker";
import { ResumeDropzone } from "./ResumeDropzone";

function initialPlanFromSearch(planParam: string | null): UploadFormValues["plan"] {
  return isPlanId(planParam) ? planParam : resolvePlan(planParam).id;
}

function uploadProgressHint(progress: number): string {
  if (progress < 88) {
    return "Sending your resume securely…";
  }
  if (progress < 100) {
    return "Saving your submission…";
  }
  return "Almost done…";
}

export function UploadWorkspaceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resume, setResume] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      rolePreset: "",
      roleCustom: "",
      jobDescription: "",
      plan: initialPlanFromSearch(searchParams.get("plan")),
    },
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  useSyncPlanFromSearchParams(searchParams.get("plan"), setValue);

  const rolePreset = watch("rolePreset");
  const showCustomRole = rolePreset === TARGET_ROLE_OTHER;

  const onSubmit = handleSubmit(async (data) => {
    setResumeError(null);
    setSubmitError(null);
    if (!resume) {
      setResumeError("Upload your resume to continue.");
      return;
    }
    const fileErr = validateResumeFile(resume);
    if (fileErr) {
      setResumeError(fileErr);
      return;
    }

    setIsSubmitting(true);
    setProgress(0);
    try {
      const result = await submitUploadForm({
        formValues: data,
        resume,
        onProgress: setProgress,
      });

      if (!result.ok) {
        setSubmitError(result.message);
        return;
      }

      router.push(`/submit/${result.submissionId}`);
    } finally {
      setIsSubmitting(false);
      setProgress(0);
    }
  });

  const busy = isSubmitting;
  const resumeReady = Boolean(resume) && resumeError === null;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <form
        onSubmit={onSubmit}
        className="space-y-8 rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-surface sm:p-8"
        noValidate
      >
        <fieldset disabled={busy} className="space-y-8 border-0 p-0">
          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              id="fullName"
              label="Full name"
              autoComplete="name"
              placeholder="As on your resume"
              error={errors.fullName?.message}
              {...register("fullName")}
            />
            <TextField
              id="email"
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              error={errors.email?.message}
              {...register("email")}
            />
          </div>

          <ResumeDropzone
            id="resume"
            disabled={busy}
            file={resume}
            error={resumeError ?? undefined}
            progress={progress}
            progressHint={busy ? uploadProgressHint(progress) : undefined}
            isUploading={busy}
            onChangeFile={(f) => {
              setResume(f);
              if (!f) {
                setResumeError(null);
                return;
              }
              setResumeError(validateResumeFile(f));
            }}
          />

          <div
            className={`grid gap-6 ${showCustomRole ? "sm:grid-cols-2" : ""}`}
          >
            <SelectField
              id="rolePreset"
              label="Target role"
              placeholderOption="Choose a role…"
              error={errors.rolePreset?.message}
              hint="Closest match, or Other to type your own."
              className={showCustomRole ? "" : "sm:max-w-xl"}
              {...register("rolePreset")}
            >
              {targetRoleOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectField>

            {showCustomRole ? (
              <TextField
                id="roleCustom"
                label="Custom role"
                placeholder="e.g. Staff ML engineer — Fintech"
                error={errors.roleCustom?.message}
                {...register("roleCustom")}
              />
            ) : null}
          </div>

          <TextAreaField
            id="jobDescription"
            label="Job description (optional)"
            placeholder="Paste the posting here for Job Match analysis. Leave blank if you do not have one yet."
            rows={6}
            error={errors.jobDescription?.message}
            hint="Used on Job Match tier for keyword overlap. Omit if you are not matching to a specific posting."
            {...register("jobDescription")}
          />

          <PlanPicker register={register} errors={errors} disabled={busy} />

          <div className="space-y-4 border-t border-slate-100 pt-8">
            {submitError ? (
              <p
                role="alert"
                className="text-sm font-medium text-red-700"
              >
                {submitError}
              </p>
            ) : null}
            <p className="text-xs font-medium leading-relaxed text-slate-500">
              {uploadTrustStatement}
            </p>
            <Button
              type="submit"
              disabled={busy || !resumeReady}
              className="w-full sm:w-auto"
            >
              {busy ? "Please wait…" : "Continue to checkout"}
            </Button>
          </div>
        </fieldset>
      </form>

      <div className="lg:sticky lg:top-28">
        <OrderSummaryPanel control={form.control} resume={resume} />
        <p className="mt-4 hidden text-center text-xs text-slate-400 lg:block">
          Totals confirm at checkout.
        </p>
      </div>
    </div>
  );
}
