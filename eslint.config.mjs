import { FlatCompat } from "@eslint/eslintrc";

// ESLint 9 needs a flat config; eslint-config-next is still eslintrc-shaped,
// so it comes in through the compat bridge. Without this file `next lint`
// silently does nothing, which is how the project shipped with lint "on" and
// no rules actually running.
const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "public/**",
      "next-env.d.ts",
      "lib/generated/**",
    ],
  },
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // A missing hook dependency is a real bug (stale closures), not a style
      // preference — it should fail review, not print a note.
      "react-hooks/exhaustive-deps": "error",
    },
  },
];

export default config;
