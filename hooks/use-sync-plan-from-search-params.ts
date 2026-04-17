import { useEffect } from "react";
import type { UseFormSetValue } from "react-hook-form";
import { isPlanId } from "@/lib/plan-ids";
import type { UploadFormValues } from "@/lib/upload-form-schema";

export function useSyncPlanFromSearchParams(
  planFromUrl: string | null,
  setValue: UseFormSetValue<UploadFormValues>,
): void {
  useEffect(() => {
    if (isPlanId(planFromUrl)) {
      setValue("plan", planFromUrl, { shouldValidate: true });
    }
  }, [planFromUrl, setValue]);
}
