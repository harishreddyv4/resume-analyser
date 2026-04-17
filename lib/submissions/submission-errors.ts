export class SubmissionValidationError extends Error {
  readonly issues: Record<string, string>;

  constructor(message: string, issues: Record<string, string>) {
    super(message);
    this.name = "SubmissionValidationError";
    this.issues = issues;
  }
}
