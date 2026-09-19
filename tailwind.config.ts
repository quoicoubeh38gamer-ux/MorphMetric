import type { Config } from "tailwindcss";

/**
 * MorphMetric — "Celestial" design system.
 * Colors are driven by CSS variables (see app/globals.css) so the same tokens
 * serve the luminous light default and the celestial-night dark theme without
 * duplicating classes.
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
      padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" },
      screens: { "2xl": "1200px" },
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
        halo: {
          gold: "hsl(var(--halo-gold) / <alpha-value>)",
          violet: "hsl(var(--halo-violet) / <alpha-value>)",
          sky: "hsl(var(--halo-sky) / <alpha-value>)",
          rose: "hsl(var(--halo-rose) / <alpha-value>)",
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
      borderRadius: {
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        soft: "0 1px 2px 0 hsl(var(--shadow) / 0.06), 0 14px 44px -18px hsl(var(--shadow) / 0.28)",
        glow: "0 0 0 1px hsl(var(--halo-gold) / 0.22), 0 14px 44px -12px hsl(var(--halo-gold) / 0.5)",
        halo: "0 0 0 1px hsl(var(--halo-gold) / 0.2), 0 0 40px -4px hsl(var(--halo-gold) / 0.55), 0 0 80px -12px hsl(var(--halo-violet) / 0.4)",
        celestial: "0 0 60px -10px hsl(var(--halo-violet) / 0.55)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(circle at 50% 0%, hsl(var(--halo-gold) / 0.14), transparent 62%)",
        "divine":
          "linear-gradient(135deg, hsl(var(--halo-gold)), hsl(var(--accent)) 48%, hsl(var(--halo-sky)))",
        "aura":
          "radial-gradient(circle at 50% 30%, hsl(var(--halo-gold) / 0.22), transparent 55%), radial-gradient(circle at 20% 80%, hsl(var(--halo-violet) / 0.2), transparent 55%), radial-gradient(circle at 85% 75%, hsl(var(--halo-sky) / 0.18), transparent 55%)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scan-sweep": {
          "0%": { transform: "translateY(-120%)", opacity: "0" },
          "20%": { opacity: "1" },
          "80%": { opacity: "1" },
          "100%": { transform: "translateY(120%)", opacity: "0" },
        },
        "pulse-ring": {
          "0%, 100%": { opacity: "0.35", transform: "scale(1)" },
          "50%": { opacity: "0.9", transform: "scale(1.12)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) translateX(0)" },
          "33%": { transform: "translateY(-14px) translateX(6px)" },
          "66%": { transform: "translateY(8px) translateX(-6px)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.2", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1.15)" },
        },
        "halo-breathe": {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.06)" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
        "sparkle-pop": {
          "0%": { opacity: "0", transform: "scale(0) rotate(0deg)" },
          "50%": { opacity: "1", transform: "scale(1) rotate(90deg)" },
          "100%": { opacity: "0", transform: "scale(0) rotate(180deg)" },
        },
        "rise-glow": {
          from: { opacity: "0", transform: "translateY(20px)", filter: "blur(6px)" },
          to: { opacity: "1", transform: "translateY(0)", filter: "blur(0)" },
        },
        "border-flow": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.6s ease both",
        "scan-sweep": "scan-sweep 2.6s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.6s ease-in-out infinite",
        shimmer: "shimmer 1.8s infinite",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float-slow 11s ease-in-out infinite",
        twinkle: "twinkle 3.4s ease-in-out infinite",
        "halo-breathe": "halo-breathe 5s ease-in-out infinite",
        "spin-slow": "spin-slow 26s linear infinite",
        "sparkle-pop": "sparkle-pop 1.8s ease-in-out infinite",
        "rise-glow": "rise-glow 0.9s cubic-bezier(0.22, 1, 0.36, 1) both",
        "border-flow": "border-flow 8s ease infinite",
      },
    },
  },
  plugins: [],
};

export default config;
