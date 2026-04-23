import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SubmissionReportView } from "@/components/report/SubmissionReportView";
import { fetchSubmissionReportPageData } from "@/lib/reports/submission-report";

export const metadata: Metadata = {
  title: { absolute: "Your resume report" },
  description: "Structured resume analysis report with ATS and rewrite guidance.",
};

type RouteParams = { submissionId: string };

export default async function SubmissionReportPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { submissionId } = await params;
  const data = await fetchSubmissionReportPageData(submissionId);
  if (!data) {
    notFound();
  }

  return <SubmissionReportView data={data} />;
}
