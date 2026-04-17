# Resume Analyzer

Next.js app for resume uploads, Razorpay checkout, AI analysis (OpenAI), PDF reports (Supabase Storage), and transactional email (Resend).

## Prerequisites

- Node.js 20+ (matches Vercel defaults)
- npm
- Accounts: [Supabase](https://supabase.com), [Razorpay](https://razorpay.com), [OpenAI](https://platform.openai.com), [Resend](https://resend.com), and optionally [Vercel](https://vercel.com) for hosting

## Local setup

1. Clone the repository and install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables and fill in real values:

   ```bash
   cp .env.example .env.local
   ```

3. Apply database migrations and storage policies in Supabase (see [Supabase](#supabase) below).

4. Run the dev server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

Useful commands:

```bash
npm run lint   # ESLint
npm run build  # Production build (same as Vercel)
```

## Environment variables

| Variable | Where it runs | Purpose |
|----------|----------------|---------|
| `NEXT_PUBLIC_APP_URL` | Client + server | Canonical site URL for metadata, Open Graph, and absolute links in emails. In production, set this to your live URL (e.g. `https://www.example.com`). |
| `NEXT_PUBLIC_SUPABASE_URL` | Client + server | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + server | Supabase anon key (RLS applies). |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** | Admin Supabase client for API routes (uploads, writes, bypass RLS). Never expose or prefix with `NEXT_PUBLIC_`. |
| `RAZORPAY_KEY_ID` | Server (returned to client via create-order API) | Razorpay key id for Checkout. |
| `RAZORPAY_KEY_SECRET` | **Server only** | Razorpay API secret. |
| `RAZORPAY_WEBHOOK_SECRET` | **Server only** | Webhook signing secret. **Required on Vercel** (`VERCEL=1`); optional for local-only dev. |
| `OPENAI_API_KEY` | **Server only** | OpenAI API key for analysis. |
| `OPENAI_ANALYSIS_MODEL` | **Server only** | Optional model override (default in code if unset). |
| `RESEND_API_KEY` | **Server only** | Resend API key. |
| `RESEND_FROM_EMAIL` | **Server only** | Verified sender, e.g. `Resume Analyzer <reports@your-domain.com>`. |
| `RESUME_ANALYZER_ADMIN_EMAILS` | **Server only** | Comma-separated internal notification addresses. |
| `ADMIN_DASHBOARD_KEY` | **Server only** | Placeholder auth for `/admin` (header `x-admin-key` or `adminKey` query). Replace with real auth before a public launch. |

Secrets are only read in server modules and Route Handlers (`app/api/**`). The browser client uses `lib/supabase/client.ts` with the **anon** key only.

## Deploy on Vercel

1. Push the repository to GitHub (or GitLab/Bitbucket) and [import the project](https://vercel.com/new) in Vercel.

2. **Framework preset:** Next.js (auto-detected).

3. **Build command:** `npm run build` (default). **Output:** Next.js default.

4. **Environment variables:** In the Vercel project → Settings → Environment Variables, add every variable from `.env.example` for **Production** (and **Preview** if you test payments there). Use the same names as in the file. Mark secret values as “Sensitive” in the UI when available.

5. Set `NEXT_PUBLIC_APP_URL` to your production URL (including `https://`). This keeps OG URLs and email links correct.

6. After the first deploy, configure third-party dashboards (Razorpay webhook URL, Resend domain, OpenAI billing) to match the deployed hostname.

7. Redeploy when you change environment variables so new values apply to serverless functions.

**Note:** The Razorpay webhook route returns `503` if `RAZORPAY_WEBHOOK_SECRET` is missing while `VERCEL` is set, so production and preview hosts never accept unsigned webhook payloads.

## Supabase

1. Create a project at [Supabase Dashboard](https://supabase.com/dashboard).

2. Under **Project Settings → API**, copy:

   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only; never ship to the client)

3. **Migrations:** From the repo root, open `supabase/migrations/` and run each SQL file in order in the Supabase SQL editor (or use the [Supabase CLI](https://supabase.com/docs/guides/cli) linked to this project). This creates tables, RLS policies, and storage buckets used by the app.

4. **Storage:** Confirm buckets referenced in migrations exist (e.g. resumes and report PDFs) and that policies allow the intended access pattern (typically service role for server uploads).

5. **RLS:** Ensure policies match your security model. The app’s API uses the service role for trusted server operations; the browser client should only rely on RLS-safe reads if you add client-side Supabase usage.

## Razorpay

1. In [Razorpay Dashboard → API Keys](https://dashboard.razorpay.com/app/keys), create or copy **Key ID** and **Key Secret** (use **Live** keys for production).

2. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in Vercel (and locally in `.env.local`).

3. **Webhooks:** In **Settings → Webhooks**, add an endpoint URL:

   `https://<your-production-domain>/api/webhooks/razorpay`

   Subscribe at minimum to `payment.captured` and `payment.failed`. Copy the **Webhook secret** into `RAZORPAY_WEBHOOK_SECRET`.

4. Orders created by `POST /api/payments/razorpay/create-order` include `notes.submission_id` so the webhook can reconcile payments with submissions.

5. Use Razorpay’s test mode on Preview deployments if you need end-to-end payment tests without live charges.

## Resend

1. Sign up at [Resend](https://resend.com) and create an **API key** → `RESEND_API_KEY`.

2. **Domain:** Add and verify your sending domain in Resend, then set `RESEND_FROM_EMAIL` to an address on that domain (format: `Name <local@your-domain.com>`).

3. Set `RESUME_ANALYZER_ADMIN_EMAILS` to comma-separated inboxes that should receive internal notifications.

4. Add the same variables to Vercel for each environment that should send mail.

## OpenAI

1. In [OpenAI API keys](https://platform.openai.com/api-keys), create a secret key → `OPENAI_API_KEY`.

2. Optionally set `OPENAI_ANALYSIS_MODEL` to a model your account can use (billing and rate limits apply).

3. Add the key to Vercel **server** env (never `NEXT_PUBLIC_`).

4. Monitor usage and set [organization/project limits](https://platform.openai.com/settings/organization/limits) appropriate for production traffic.

## Production checklist

- [ ] All env vars from `.env.example` set in Vercel **Production** (no secrets in the repo).
- [ ] `NEXT_PUBLIC_APP_URL` matches the live site URL (`https://…`).
- [ ] Supabase migrations applied; storage buckets and RLS reviewed.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` only on the server; never exposed to the browser.
- [ ] Razorpay **live** keys and webhook URL point to production; `RAZORPAY_WEBHOOK_SECRET` set on Vercel.
- [ ] Resend domain verified; `RESEND_FROM_EMAIL` uses that domain.
- [ ] OpenAI billing and rate limits configured; `OPENAI_API_KEY` present.
- [ ] `npm run build` passes in CI or locally before release.
- [ ] Replace placeholder `/admin` auth (`ADMIN_DASHBOARD_KEY`) with proper authentication before exposing admin URLs publicly.
- [ ] Legal/support contact details (footer, privacy/terms) match your real business.
- [ ] Smoke test: submit resume → pay (test or small live amount) → report loads → email received → PDF download works.

## Project structure (high level)

- `app/` — App Router pages and `app/api/` Route Handlers
- `components/` — React UI
- `lib/` — Supabase, payments, analysis, email, PDF, admin helpers
- `supabase/migrations/` — SQL migrations for schema and storage

## License

Private / unlicensed unless you add a license file.
