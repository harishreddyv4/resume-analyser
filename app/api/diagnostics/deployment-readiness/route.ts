import { NextResponse } from "next/server";
import { getServerDeploymentStatusPayload } from "@/lib/diagnostics/server-deployment-status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET — no secrets. Confirms the Node process sees required env vars.
 * Example: `https://your-domain.com/api/diagnostics/deployment-readiness`
 */
export async function GET() {
  return NextResponse.json(getServerDeploymentStatusPayload());
}
