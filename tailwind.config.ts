import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        sand: "rgb(var(--color-sand) / <alpha-value>)",
        moss: "rgb(var(--color-moss) / <alpha-value>)",
        ember: "rgb(var(--color-ember) / <alpha-value>)",
        mist: "rgb(var(--color-mist) / <alpha-value>)",
        gold: "rgb(var(--color-gold) / <alpha-value>)"
      },
      boxShadow: {
        soft: "0 20px 45px rgba(19, 32, 50, 0.08)"
      },
      borderRadius: {
        "4xl": "2rem"
      }
    }
  },
  plugins: []
};

export default config;
