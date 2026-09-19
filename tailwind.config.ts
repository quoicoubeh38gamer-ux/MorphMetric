import type { Config } from "tailwindcss";

/**
 * MorphMetric design system.
 *
 * Colours are driven by CSS variables (see app/globals.css) so one token set
 * serves both themes. The palette is deliberately narrow: ink, off-white,
 * silver and three pearlescent tints. Anything louder than this does not
 * belong in the product.
 */
const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", sm: "2rem", lg: "2.5rem" },
      screens: { "2xl": "1180px" },
    },
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        surface: "hsl(var(--surface) / <alpha-value>)",
        card: "hsl(var(--card) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--border) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-2) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        tint: {
          silver: "hsl(var(--tint-silver) / <alpha-value>)",
          blue: "hsl(var(--tint-blue) / <alpha-value>)",
          lavender: "hsl(var(--tint-lavender) / <alpha-value>)",
        },
        success: "hsl(var(--success) / <alpha-value>)",
        warning: "hsl(var(--warning) / <alpha-value>)",
        danger: "hsl(var(--danger) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        // Neutral elevation. No coloured drop shadows anywhere.
        soft: "0 1px 2px -1px hsl(var(--shadow) / 0.08), 0 6px 20px -12px hsl(var(--shadow) / 0.22)",
        lift: "0 2px 4px -2px hsl(var(--shadow) / 0.1), 0 14px 40px -18px hsl(var(--shadow) / 0.3)",
        glow: "0 0 0 1px hsl(var(--accent) / 0.16), 0 10px 30px -14px hsl(var(--accent) / 0.35)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(circle at 50% 0%, hsl(var(--tint-blue) / 0.08), transparent 62%)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scan-sweep": {
          "0%": { transform: "translateY(-120%)", opacity: "0" },
          "22%": { opacity: "1" },
          "78%": { opacity: "1" },
          "100%": { transform: "translateY(120%)", opacity: "0" },
        },
        "pulse-ring": {
          "0%, 100%": { opacity: "0.3", transform: "scale(1)" },
          "50%": { opacity: "0.65", transform: "scale(1.08)" },
        },
        breathe: {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "0.9" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
        rise: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.6s ease both",
        "scan-sweep": "scan-sweep 3.4s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        "pulse-ring": "pulse-ring 3.2s ease-in-out infinite",
        breathe: "breathe 6s ease-in-out infinite",
        float: "float 8s ease-in-out infinite",
        shimmer: "shimmer 2s infinite",
        "spin-slow": "spin-slow 40s linear infinite",
        rise: "rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
