export const site = {
  name: "Resume Analyzer",
  tagline: "ATS-ready resume feedback for the role you want.",
  description:
    "Upload your resume, set your target role, and get an AI report: ATS checks, fixes, and rewritten lines. Higher tiers add job-description matching.",
} as const;

export const navLinks = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#after-payment", label: "Your report" },
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
] as const;

export const heroTrustLine =
  "Private analysis · Your resume is not sold or shared for ads";

export const heroStats = [
  { label: "Report time", value: "Minutes" },
  { label: "Output", value: "ATS + rewrites" },
  { label: "Built for", value: "One role focus" },
] as const;

export const howItWorks = [
  {
    step: "01",
    title: "Upload your resume",
    body: "PDF or DOCX. We scan structure and wording the way parsers and recruiters tend to read them.",
  },
  {
    step: "02",
    title: "Choose your target role",
    body: "Titles and seniority steer keyword coverage and tone so suggestions match where you are applying.",
  },
  {
    step: "03",
    title: "Get your analysis report",
    body: "ATS-style feedback, prioritized fixes, and rewritten bullets—ready to paste back into your file.",
  },
] as const;

export const afterPaymentItems = [
  {
    title: "Executive summary",
    body: "Score-style read on fit for your target role, upfront.",
  },
  {
    title: "ATS & structure notes",
    body: "Headings, density, and parsing risks called out with clear fixes.",
  },
  {
    title: "Improvement list",
    body: "Ordered changes so you edit in one pass, not a dozen tabs.",
  },
  {
    title: "Rewritten content",
    body: "Suggested bullets and phrases you can adopt or tweak in your voice.",
  },
  {
    title: "Job match (Pro+)",
    body: "On higher tiers: paste a JD and see overlap, gaps, and tailored rewrites.",
  },
] as const;

export const features = [
  {
    title: "ATS-style feedback",
    body: "Flags what automated screeners and skim readers often miss first.",
  },
  {
    title: "Role-aware suggestions",
    body: "Language and keywords tuned to the title you are targeting—not generic advice.",
  },
  {
    title: "Ready-to-use rewrites",
    body: "Concrete lines you can drop into Word or Google Docs, not vague tips.",
  },
  {
    title: "JD matching on higher tiers",
    body: "Compare your resume to a real posting and close keyword and duty gaps.",
  },
] as const;

/** Pricing tiers — each `id` must match `PLAN_IDS` in `./plan-ids`. */
export const plans = [
  {
    id: "basic",
    name: "Basic",
    price: "₹99",
    cadence: "one-time",
    description: "Fast sanity check before you hit apply.",
    outcome: "Best when you want a clear pass/fail read and top fixes.",
    highlights: [
      "Target role field in report",
      "ATS & formatting scan",
      "Top prioritized fixes",
      "Sample rewrites (key bullets)",
    ],
    cta: "Start with Basic",
    href: "/upload?plan=basic",
    featured: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹299",
    cadence: "one-time",
    description: "Full rewrite support for serious applicants.",
    outcome: "Best when one role matters and you want depth without a JD yet.",
    highlights: [
      "Everything in Basic",
      "Line-by-line suggestions",
      "Expanded bullet rewrites",
      "Skills ↔ role alignment notes",
    ],
    cta: "Get Pro report",
    href: "/upload?plan=pro",
    featured: true,
  },
  {
    id: "job-match",
    name: "Job Match",
    price: "₹499",
    cadence: "one-time",
    description: "Align to one real job description.",
    outcome: "Best when you have a posting and need keyword and duty overlap.",
    highlights: [
      "Everything in Pro",
      "JD keyword map",
      "Gap list vs. posting",
      "JD-tuned bullet rewrites",
    ],
    cta: "Match to a JD",
    href: "/upload?plan=job-match",
    featured: false,
  },
] as const;

export type Plan = (typeof plans)[number];

const defaultPlanId = "pro" as const;

export function resolvePlan(planId: string | null | undefined): Plan {
  const match = plans.find((p) => p.id === planId);
  if (match) {
    return match;
  }

  const fallback = plans.find((p) => p.id === defaultPlanId);
  return fallback ?? plans[0];
}

export const testimonialPlaceholder = {
  badge: "Sample testimonial",
  quote:
    "The ATS section alone saved me a round of guesswork. Rewrites were specific enough to use the same day.",
  name: "A. Sharma",
  role: "Senior analyst · placeholder until you add real customers",
} as const;

export const pricingFootnote =
  "One-time price per report. Upgrade tier before checkout if you add a JD later.";

export const faqs = [
  {
    q: "What file formats do you support?",
    a: "PDF, DOCX, and legacy DOC files. Image-only PDFs may limit text extraction quality.",
  },
  {
    q: "How private is my resume data?",
    a: "Your resume is processed only for your report workflow. We do not sell your resume data.",
  },
  {
    q: "How fast is report delivery?",
    a: "Most reports are generated within minutes after payment confirmation. High-load windows may take longer.",
  },
  {
    q: "How reliable are ATS and score results?",
    a: "Scores are directional guidance to improve clarity and ATS readability. They are not hiring guarantees.",
  },
  {
    q: "Do I get a downloadable report?",
    a: "Yes. Completed analyses include a downloadable PDF report and a web view.",
  },
  {
    q: "What is your refund policy?",
    a: "If we fail to deliver due to a confirmed technical fault, we resolve it or refund. Delivered reports are generally non-refundable.",
  },
] as const;
