import { NextResponse, type NextRequest } from "next/server";

/**
 * Per-request CSP nonce.
 *
 * Next's hydration bootstrap emits inline <script> tags, which is why the
 * policy previously needed 'unsafe-inline' — and 'unsafe-inline' is precisely
 * what makes an injected <script> executable. A fresh nonce per response lets
 * us drop it: the browser runs an inline script only if it carries this exact
 * value, which an attacker cannot guess.
 *
 * Deliberately NOT using 'strict-dynamic': it makes the browser ignore the host
 * allowlist, and the vision model loads its WASM runtime from jsdelivr. Keeping
 * the allowlist means face detection behaves exactly as before.
 */
function makeNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

export function middleware(request: NextRequest) {
  const nonce = makeNonce();

  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "img-src 'self' data: blob:",
    "media-src 'self' blob:",
    "font-src 'self' data:",
    // Styles stay permissive: next/font and inline style attributes need it,
    // and injected CSS cannot execute code the way injected script can.
    "style-src 'self' 'unsafe-inline'",
    `script-src 'self' 'nonce-${nonce}' 'wasm-unsafe-eval' blob: https://cdn.jsdelivr.net`,
    "connect-src 'self' blob: https://cdn.jsdelivr.net https://storage.googleapis.com",
    "worker-src 'self' blob:",
    "frame-src 'none'",
    "manifest-src 'self'",
    "upgrade-insecure-requests",
  ].join("; ");

  // Next reads the nonce off the *request* CSP header to stamp its own inline
  // scripts; `x-nonce` is what our own inline scripts read.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  // Pages only. API routes get their own headers from next.config, and static
  // assets need no policy — skipping them keeps middleware off the hot path.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|opengraph-image).*)",
  ],
};
