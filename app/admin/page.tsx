import type { Metadata } from "next";
import { headers } from "next/headers";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import {
  fetchAdminSubmissions,
  type AnalysisFilter,
  type BillingFilter,
  type PlanFilter,
} from "@/lib/admin/submissions-dashboard";
import { AdminUnauthorized } from "@/components/admin/AdminUnauthorized";
import { isAdminAuthorized } from "@/lib/admin/auth-placeholder";

export const metadata: Metadata = {
  title: "Admin",
  description: "Resume Analyzer internal dashboard.",
};

function readBillingFilter(value: string | undefined): BillingFilter {
  return value === "paid" || value === "unpaid" ? value : "all";
}

function readAnalysisFilter(value: string | undefined): AnalysisFilter {
  return value === "pending" || value === "completed" || value === "failed"
    ? value
    : "all";
}

function readPlanFilter(value: string | undefined): PlanFilter {
  return value === "basic" || value === "pro" || value === "job-match"
    ? value
    : "all";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const adminKeyParam =
    typeof searchParams.adminKey === "string" ? searchParams.adminKey : undefined;
  if (!isAdminAuthorized(headers(), adminKeyParam)) {
    return <AdminUnauthorized />;
  }

  const billing = readBillingFilter(
    typeof searchParams.billing === "string" ? searchParams.billing : undefined,
  );
  const analysis = readAnalysisFilter(
    typeof searchParams.analysis === "string" ? searchParams.analysis : undefined,
  );
  const plan = readPlanFilter(
    typeof searchParams.plan === "string" ? searchParams.plan : undefined,
  );

  const submissions = await fetchAdminSubmissions({
    billing,
    analysis,
    plan,
  });

  return (
    <main className="py-12">
      <Container>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Admin
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
          Submissions
        </h1>

        <form className="mt-6 grid gap-3 rounded-xl border border-zinc-200 bg-white p-4 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">
              Payment
            </label>
            <select
              name="billing"
              defaultValue={billing}
              className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-800"
            >
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">
              Analysis
            </label>
            <select
              name="analysis"
              defaultValue={analysis}
              className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-800"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">
              Plan
            </label>
            <select
              name="plan"
              defaultValue={plan}
              className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-800"
            >
              <option value="all">All</option>
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
              <option value="job-match">Job Match</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-zinc-900 bg-zinc-900 px-4 text-sm font-semibold text-white"
            >
              Apply filters
            </button>
          </div>
        </form>

        <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Analysis</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Open</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                    No submissions found for these filters.
                  </td>
                </tr>
              ) : (
                submissions.map((row) => (
                  <tr key={row.id} className="border-t border-zinc-100 text-zinc-700">
                    <td className="px-4 py-3 font-medium text-zinc-900">{row.full_name}</td>
                    <td className="px-4 py-3">{row.email}</td>
                    <td className="px-4 py-3">{row.selected_plan}</td>
                    <td className="px-4 py-3">{row.payment_status}</td>
                    <td className="px-4 py-3">{row.analysis_status}</td>
                    <td className="px-4 py-3">{formatDate(row.created_at)}</td>
                    <td className="px-4 py-3">
                      <ButtonLink
                        href={
                          adminKeyParam
                            ? `/admin/submissions/${row.id}?adminKey=${encodeURIComponent(adminKeyParam)}`
                            : `/admin/submissions/${row.id}`
                        }
                        variant="secondary"
                        className="h-9 px-3 text-xs"
                      >
                        View
                      </ButtonLink>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-zinc-500">
          Internal use only. Replace the placeholder header-key auth with your
          org’s real admin authentication.
        </p>
      </Container>
    </main>
  );
}
