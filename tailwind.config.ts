import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
    "./i18n/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        card: "rgb(var(--color-card) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
      },
      boxShadow: {
        paper: "0 18px 55px rgba(58, 34, 18, 0.12)",
        float: "0 16px 36px rgba(17, 17, 17, 0.18)",
      },
      backgroundImage: {
        grain:
          "radial-gradient(circle at 1px 1px, rgba(139, 30, 30, 0.08) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};

export default config;
