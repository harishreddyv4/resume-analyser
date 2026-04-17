import type { Metadata } from "next";
import { AfterPayment } from "@/components/landing/AfterPayment";
import { FAQ } from "@/components/landing/FAQ";
import { Features } from "@/components/landing/Features";
import { FinalCta } from "@/components/landing/FinalCta";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { Testimonials } from "@/components/landing/Testimonials";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "ATS Resume Checker and AI Rewrite",
  description:
    "Get a premium resume review with ATS scoring, rewrite suggestions, and role-specific recommendations in minutes.",
  keywords: [
    "resume analyzer",
    "ATS resume checker",
    "resume review",
    "resume rewrite",
    "job match resume",
  ],
  openGraph: {
    title: `${site.name} · ATS Resume Checker`,
    description:
      "Upload your resume and get ATS-ready feedback, stronger bullet rewrites, and role-focused recommendations.",
    url: "/",
  },
};

export default function HomePage() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <AfterPayment />
      <Features />
      <Pricing />
      <Testimonials />
      <FAQ />
      <FinalCta />
    </main>
  );
}
