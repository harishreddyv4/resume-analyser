import type { PlanId } from "@/lib/plan-ids";

/** Row shape returned by PostgREST for `public.submissions`. */
export type SubmissionRow = {
  id: string;
  full_name: string;
  email: string;
  resume_file_url: string;
  target_role: string;
  job_description: string | null;
  selected_plan: string;
  payment_status: string;
  analysis_status: string;
  /** Plain text extracted server-side for analysis (nullable until extraction runs). */
  resume_extracted_text: string | null;
  created_at: string;
};

export type SaveSubmissionInput = {
  id: string;
  fullName: string;
  email: string;
  /** Public object URL saved to `submissions.resume_file_url`. */
  resumeFileUrl: string;
  targetRole: string;
  jobDescription?: string;
  selectedPlanId: PlanId;
  resumeFileName: string;
  resumeContentType: string;
  resumeSizeBytes: number;
};
