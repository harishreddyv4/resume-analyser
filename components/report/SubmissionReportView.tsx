import { Button, ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { CopyTextButton } from "./CopyTextButton";
import { ReportSectionCard } from "./ReportSectionCard";
import { SuggestionPairCard } from "./SuggestionPairCard";
import type { SubmissionReportPageData } from "@/lib/reports/submission-report";

function formatStatus(status: string): string {
  return status.replaceAll("_", " ");
}

function deriveStrengths(data: SubmissionReportPageData): string[] {
  const report = data.report;
  if (!report) {
    return [];
  }
  const strengths: string[] = [];
  if (report.overallResumeScore >= 70) {
    strengths.push("Your resume shows solid overall role alignment.");
  }
  if (report.atsReadinessScore >= 70) {
    strengths.push("Your document structure appears ATS-friendly.");
  }
  if (report.jobMatch && report.jobMatch.jobMatchScore >= 70) {
    strengths.push("Your profile is already close to the target job requirements.");
  }
  if (report.bulletRewriteSuggestions.length >= 6) {
    strengths.push("You have strong raw experience points ready for premium phrasing.");
  }
  if (strengths.length === 0) {
    strengths.push(
      "You have a clear base profile to build on with focused language and keyword improvements.",
    );
  }
  return strengths.slice(0, 4);
}

export function SubmissionReportView({ data }: { data: SubmissionReportPageData }) {
  const analysisStatus = String(data.analysisStatus);
  const analysisFailed = analysisStatus === "failed";

  if (!data.report || analysisStatus !== "complete") {
    return (
      <main className="min-h-[60vh] border-b border-zinc-100 bg-white">
        <Container className="max-w-3xl py-24">
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Report status
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900">
              {analysisFailed
                ? "Analysis could not be completed"
                : "Your analysis is still in progress"}
            </h1>
            <p className="mt-3 text-sm text-zinc-600">
              {analysisFailed ? (
                <>
                  Submission{" "}
                  <span className="font-mono text-xs">{data.submissionId}</span> is marked{" "}
                  <span className="font-medium text-zinc-900">failed</span> in the database.
                  This usually means resume text could not be read, OpenAI returned an error
                  (check <span className="font-mono text-xs">OPENAI_API_KEY</span> and model
                  limits), or PDF/report persistence failed. See the terminal where{" "}
                  <span className="font-mono text-xs">npm run dev</span> is running for{" "}
                  <span className="font-mono text-xs">[post-payment-analysis]</span> or{" "}
                  <span className="font-mono text-xs">[resume-extraction]</span> logs, then try
                  a new upload with a text-based PDF or Word file.
                </>
              ) : (
                <>
                  Submission <span className="font-mono text-xs">{data.submissionId}</span> is{" "}
                  <span className="font-medium text-zinc-900">
                    {formatStatus(analysisStatus)}
                  </span>
                  . Refresh this page in a moment.
                </>
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href={`/report/${data.submissionId}`} variant="secondary">
                Refresh report
              </ButtonLink>
              {analysisFailed ? (
                <ButtonLink href="/upload" variant="secondary">
                  New upload
                </ButtonLink>
              ) : null}
            </div>
          </div>
        </Container>
      </main>
    );
  }

  const report = data.report;
  const strengths = deriveStrengths(data);

  return (
    <main className="min-h-[60vh] border-b border-zinc-100 bg-zinc-50/30">
      <Container className="py-14">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Resume report
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
            {data.candidateName}
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Target role: <span className="font-medium text-zinc-900">{data.targetRole}</span>
            {" · "}
            Plan: <span className="font-medium text-zinc-900">{data.selectedPlan}</span>
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {data.reportPdfUrl ? (
              <ButtonLink
                href={data.reportPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
              >
                Download PDF
              </ButtonLink>
            ) : (
              <Button type="button" variant="secondary" disabled>
                Download PDF (generating...)
              </Button>
            )}
          </div>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">Overall score</p>
            <p className="mt-2 text-3xl font-semibold text-zinc-900">
              {report.overallResumeScore}
              <span className="text-lg text-zinc-500">/100</span>
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">ATS score</p>
            <p className="mt-2 text-3xl font-semibold text-zinc-900">
              {report.atsReadinessScore}
              <span className="text-lg text-zinc-500">/100</span>
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">Submission</p>
            <p className="mt-2 font-mono text-xs text-zinc-700">{data.submissionId}</p>
          </div>
        </section>

        <ReportSectionCard title="Strengths">
          <ul className="mt-4 space-y-2 text-sm text-zinc-700">
            {strengths.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </ReportSectionCard>

        <ReportSectionCard title="Top weaknesses">
          <div className="mt-4 space-y-4">
            {report.topWeaknesses.map((w) => (
              <article
                key={`${w.title}-${w.whyItHurts.slice(0, 30)}`}
                className="rounded-xl border border-zinc-200 p-4"
              >
                <h3 className="font-semibold text-zinc-900">{w.title}</h3>
                <p className="mt-2 text-sm text-zinc-600">{w.whyItHurts}</p>
                <p className="mt-2 text-sm text-zinc-700">
                  <span className="font-medium text-zinc-900">Fix:</span> {w.howToFix}
                </p>
              </article>
            ))}
          </div>
        </ReportSectionCard>

        <ReportSectionCard title="Missing skills">
          <div className="mt-4 flex flex-wrap gap-2">
            {report.missingSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </ReportSectionCard>

        <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-zinc-900">Improved summary</h2>
            <CopyTextButton text={report.improvedSummaryAbout} label="Copy summary" />
          </div>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
            {report.improvedSummaryAbout}
          </p>
        </section>

        <ReportSectionCard title="Rewrite suggestions">
          <div className="mt-4 space-y-4">
            {report.bulletRewriteSuggestions.map((item, index) => (
              <SuggestionPairCard
                key={`${index}-${item.original.slice(0, 20)}`}
                original={item.original}
                suggestionLabel="Suggested rewrite"
                suggestion={item.suggestion}
                detail={item.reason}
              />
            ))}
          </div>
        </ReportSectionCard>

        <ReportSectionCard title="Stronger project/work phrasing">
          <div className="mt-4 space-y-4">
            {report.strongerProjectWorkPhrasing.map((item, index) => (
              <SuggestionPairCard
                key={`${index}-${item.original.slice(0, 20)}`}
                original={item.original}
                suggestionLabel="Stronger phrasing"
                suggestion={item.suggestion}
                detail={item.impact}
              />
            ))}
          </div>
        </ReportSectionCard>

        {report.jobMatch ? (
          <ReportSectionCard title="Job match analysis">
            <p className="mt-3 text-sm text-zinc-700">
              Job match score:{" "}
              <span className="font-semibold text-zinc-900">
                {report.jobMatch.jobMatchScore}/100
              </span>
            </p>
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
                Skills gap
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {report.jobMatch.skillsGap.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
                Tailored recommendations
              </p>
              <ul className="mt-3 space-y-2 text-sm text-zinc-700">
                {report.jobMatch.tailoredRecommendations.map((rec) => (
                  <li key={rec}>- {rec}</li>
                ))}
              </ul>
            </div>
          </ReportSectionCard>
        ) : null}
      </Container>
    </main>
  );
}
