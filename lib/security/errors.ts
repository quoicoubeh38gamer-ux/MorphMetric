import { NextResponse } from "next/server";

/**
 * One place that decides what an API route is allowed to tell the client.
 *
 * Rule: the client gets a short, user-safe message plus a request id. Anything
 * diagnostic — stack traces, validation internals, SQL/provider errors, paths —
 * is logged server-side against that id and never serialized into the response.
 */

export function requestId(): string {
  // crypto.randomUUID exists in Node 18+ and the Edge runtime.
  try {
    return globalThis.crypto.randomUUID();
  } catch {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

export interface ApiErrorOptions {
  status: number;
  /** Safe to show a user. Never interpolate internal state into this. */
  message: string;
  /** Extra headers (e.g. Retry-After). */
  headers?: Record<string, string>;
  /** Server-only diagnostic context. Never sent to the client. */
  logContext?: unknown;
  /** Short machine-readable tag for the client (no internal detail). */
  code?: string;
}

export function apiError({
  status,
  message,
  headers,
  logContext,
  code,
}: ApiErrorOptions): NextResponse {
  const id = requestId();
  if (logContext !== undefined) {
    // Server log only — this is the sole place diagnostics are emitted.
    console.error(`[api:${id}] ${status} ${code ?? "error"}`, logContext);
  }
  return NextResponse.json(
    { error: message, ...(code ? { code } : {}), requestId: id },
    { status, headers: { ...headers, "x-request-id": id } },
  );
}

/** Wrap an unexpected throw so internals never reach the client. */
export function internalError(error: unknown): NextResponse {
  return apiError({
    status: 500,
    code: "internal_error",
    message: "Something went wrong on our side. Please try again.",
    logContext: error,
  });
}
