import type { NextResponse } from "next/server";
import type { ZodType } from "zod";
import type { ApiErrorBody } from "@/types/submission";
import { jsonApiError } from "./route-json";

export type ZodParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; response: NextResponse<ApiErrorBody> };

export function parseWithZod<T>(
  body: unknown,
  schema: ZodType<T>,
  badRequestMessage: string,
): ZodParseResult<T> {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, response: jsonApiError(badRequestMessage, 400) };
  }
  return { ok: true, data: parsed.data };
}
