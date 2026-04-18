import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      boxShadow: {
        surface:
          "0 1px 0 0 rgb(15 23 42 / 0.04), 0 4px 24px -4px rgb(15 23 42 / 0.08), 0 20px 48px -20px rgb(8 145 178 / 0.06)",
        "surface-lg":
          "0 12px 48px -8px rgb(15 23 42 / 0.12), 0 0 0 1px rgb(8 145 178 / 0.06)",
      },
      transitionProperty: {
        size: "transform, box-shadow, border-color, background-color",
      },
    },
  },
  plugins: [],
};
export default config;
