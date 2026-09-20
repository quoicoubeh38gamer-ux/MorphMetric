/** @type {import('next').NextConfig} */

// Content-Security-Policy lives in middleware.ts: it needs a fresh nonce per
// request, which a static header cannot provide. Everything else is static and
// stays here.
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Never ship original sources to the browser in production — source maps
  // hand an attacker a readable copy of the client bundle.
  productionBrowserSourceMaps: false,
  eslint: { ignoreDuringBuilds: true },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // API responses are never cacheable and never indexable: one holds
        // per-user data, the others should not appear in search results.
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, private" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Vary", value: "Cookie" },
        ],
      },
    ];
  },
};

export default nextConfig;
