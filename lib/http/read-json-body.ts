import type { NextResponse } from "next/server";
import type { ApiErrorBody } from "@/types/submission";
import { jsonApiError } from "./route-json";

export type ReadJsonBodyResult =
  | { ok: true; body: unknown }
  | { ok: false; response: NextResponse<ApiErrorBody> };

export async function readJsonBody(request: Request): Promise<ReadJsonBodyResult> {
  try {
    return { ok: true, body: await request.json() };
  } catch {
    return {
      ok: false,
      response: jsonApiError("Invalid JSON body.", 400),
    };
  }
}
