import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette "gestion d'actifs premium"
        canvas: "#0A0B0D",
        surface: {
          DEFAULT: "#141518",
          2: "#1C1E22",
          3: "#26282E",
        },
        line: "rgba(255,255,255,0.08)",
        ink: {
          DEFAULT: "#F4F5F7",
          muted: "#8A8F98",
          faint: "#5A5F68",
        },
        accent: {
          DEFAULT: "#C8A86B", // champagne / or
          soft: "rgba(200,168,107,0.12)",
        },
        ok: "#3DBE8B",
        warn: "#E0B15E",
        danger: "#D06B6B",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "8px",
      },
      boxShadow: {
        elevated: "0 1px 0 rgba(255,255,255,0.04) inset, 0 16px 48px -24px rgba(0,0,0,0.8)",
        glow: "0 0 0 1px rgba(200,168,107,0.4), 0 8px 32px -8px rgba(200,168,107,0.25)",
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.02em" }],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s cubic-bezier(0.22,1,0.36,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
