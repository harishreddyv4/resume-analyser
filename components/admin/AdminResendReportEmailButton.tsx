"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

type Props = {
  submissionId: string;
  defaultEmail: string;
  adminKey?: string;
};

export function AdminResendReportEmailButton({
  submissionId,
  defaultEmail,
  adminKey,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [toEmail, setToEmail] = useState(defaultEmail);

  async function send() {
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
      const res = await fetch(`/api/admin/resend-report-email${qs}`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          submissionId,
          toEmail: toEmail.trim() || undefined,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage(data.error ?? `HTTP ${res.status}`);
        return;
      }
      setMessage("Email sent (check spam folder).");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Request failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
      <p className="text-xs font-medium text-slate-700">
        Resend “report ready” email (uses saved report in the database)
      </p>
      <label className="block text-xs font-medium text-slate-600" htmlFor="resend-email">
        Send to
      </label>
      <input
        id="resend-email"
        type="email"
        value={toEmail}
        onChange={(e) => setToEmail(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
        autoComplete="email"
      />
      <Button type="button" variant="secondary" disabled={busy} onClick={() => void send()}>
        {busy ? "Sending…" : "Send report email again"}
      </Button>
      {message ? (
        <p className="text-xs leading-relaxed text-slate-600" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
