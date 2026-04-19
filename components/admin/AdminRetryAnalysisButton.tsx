"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type Props = {
  submissionId: string;
  adminKey?: string;
};

export function AdminRetryAnalysisButton({ submissionId, adminKey }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function retry() {
    setMessage(null);
    setBusy(true);
    try {
      const qs =
        typeof adminKey === "string" && adminKey
          ? `?adminKey=${encodeURIComponent(adminKey)}`
          : "";
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (adminKey) {
        headers["x-admin-key"] = adminKey;
      }
      const res = await fetch(
        `/api/admin/retry-post-payment-analysis${qs}`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ submissionId }),
        },
      );
      const data = (await res.json()) as Record<string, unknown>;
      if (!res.ok) {
        setMessage(
          typeof data.error === "string" ? data.error : `HTTP ${res.status}`,
        );
        return;
      }
      if (data.ok === false && typeof data.error === "string") {
        setMessage(`Failed: ${data.error}`);
        return;
      }
      if (data.ok === true) {
        setMessage(
          data.alreadyComplete === true
            ? "Analysis was already complete."
            : "Analysis completed. Refreshing…",
        );
        router.refresh();
        return;
      }
      setMessage("Unexpected response from server.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Request failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 space-y-2">
      <Button type="button" variant="secondary" disabled={busy} onClick={retry}>
        {busy ? "Running…" : "Retry analysis (paid submissions)"}
      </Button>
      {message ? (
        <p className="text-xs leading-relaxed text-slate-600" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
