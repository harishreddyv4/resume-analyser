import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { AdminRetryAnalysisButton } from "@/components/admin/AdminRetryAnalysisButton";
import { AdminUnauthorized } from "@/components/admin/AdminUnauthorized";
import { isAdminAuthorized } from "@/lib/admin/auth-placeholder";
import { fetchAdminSubmissionDetail } from "@/lib/admin/submissions-dashboard";

export const metadata: Metadata = {
  title: "Admin submission detail",
  description: "Internal submission detail view.",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminSubmissionDetailPage({
  params,
  searchParams,
}: {
  params: { submissionId: string };
  searchParams: { adminKey?: string };
}) {
  const adminKeyParam =
    typeof searchParams.adminKey === "string" ? searchParams.adminKey : undefined;
  if (!isAdminAuthorized(headers(), adminKeyParam)) {
    return <AdminUnauthorized />;
  }

  const { submission, report } = await fetchAdminSubmissionDetail(
    params.submissionId,
  );
  if (!submission) {
    notFound();
  }

  return (
    <main className="py-12">
      <Container className="max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Admin
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
              Submission detail
            </h1>
          </div>
          <ButtonLink
            href={
              adminKeyParam
                ? `/admin?adminKey=${encodeURIComponent(adminKeyParam)}`
                : "/admin"
            }
            variant="secondary"
          >
            Back
          </ButtonLink>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-500">Name</dt>
              <dd className="mt-1 text-sm font-medium text-zinc-900">{submission.full_name}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-500">Email</dt>
              <dd className="mt-1 text-sm text-zinc-700">{submission.email}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-500">Plan</dt>
              <dd className="mt-1 text-sm text-zinc-700">{submission.selected_plan}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-500">Payment status</dt>
              <dd className="mt-1 text-sm text-zinc-700">{submission.payment_status}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-500">Analysis status</dt>
              <dd className="mt-1 text-sm text-zinc-700">{submission.analysis_status}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-500">Created</dt>
              <dd className="mt-1 text-sm text-zinc-700">{formatDate(submission.created_at)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-500">Target role</dt>
              <dd className="mt-1 text-sm text-zinc-700">{submission.target_role}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-wide text-zinc-500">Submission ID</dt>
              <dd className="mt-1 font-mono text-xs text-zinc-700">{submission.id}</dd>
            </div>
            {submission.payment ? (
              <>
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase tracking-wide text-zinc-500">
                    Razorpay order
                  </dt>
                  <dd className="mt-1 break-all font-mono text-xs text-zinc-700">
                    {submission.payment.provider_order_id || "—"}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase tracking-wide text-zinc-500">
                    Razorpay payment
                  </dt>
                  <dd className="mt-1 break-all font-mono text-xs text-zinc-700">
                    {submission.payment.provider_payment_id || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-zinc-500">
                    Payment record
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-700">
                    {submission.payment.record_status}
                  </dd>
                </div>
              </>
            ) : null}
          </dl>

          {submission.payment_status === "paid" &&
          submission.analysis_status !== "complete" ? (
            <>
              <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-950">
                After payment, the server runs analysis (OpenAI), saves the report and PDF to
                Supabase, then emails the user. If analysis is not{" "}
                <code className="rounded bg-amber-100/80 px-1 py-0.5">complete</code>,                 open{" "}
                <code className="rounded bg-amber-100/80 px-1 py-0.5">
                  /api/payments/razorpay/config-status
                </code>{" "}
                (or{" "}
                <code className="rounded bg-amber-100/80 px-1 py-0.5">
                  /api/diagnostics/deployment-readiness
                </code>
                ) on your domain to confirm{" "}
                <code className="rounded bg-amber-100/80 px-1 py-0.5">OPENAI_API_KEY</code> and
                Resend env vars are set on the host, then check logs for{" "}
                <code className="rounded bg-amber-100/80 px-1 py-0.5">[post-payment-analysis]</code>.
              </p>
              <AdminRetryAnalysisButton
                submissionId={submission.id}
                adminKey={adminKeyParam}
              />
            </>
          ) : null}

          <div className="mt-6 space-y-3 border-t border-zinc-100 pt-6 text-sm">
            <p className="text-zinc-700">
              <span className="font-medium text-zinc-900">Job description:</span>{" "}
              {submission.job_description?.trim() || "Not provided"}
            </p>
            <p className="text-zinc-700">
              <span className="font-medium text-zinc-900">Resume URL:</span>{" "}
              <Link
                href={submission.resume_file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
              >
                Open file
              </Link>
            </p>
            <p className="text-zinc-700">
              <span className="font-medium text-zinc-900">Report summary:</span>{" "}
              {report?.summary || "Not generated yet"}
            </p>
            <p className="text-zinc-700">
              <span className="font-medium text-zinc-900">Report PDF:</span>{" "}
              {report?.report_pdf_url ? (
                <Link
                  href={report.report_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4"
                >
                  Download PDF
                </Link>
              ) : (
                "Not generated yet"
              )}
            </p>
            <p className="text-zinc-700">
              <span className="font-medium text-zinc-900">User report page:</span>{" "}
              <Link
                href={`/report/${submission.id}`}
                className="underline underline-offset-4"
              >
                Open report
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </main>
  );
}
