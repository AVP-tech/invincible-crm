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
        soft: "0 20px 45px rgba(19, 32, 50, 0.08)",
        glow: "0 0 30px rgba(230, 193, 106, 0.15)",
        "glow-moss": "0 0 30px rgba(122, 139, 99, 0.12)",
        "elevated": "0 25px 60px rgba(19, 32, 50, 0.12), 0 8px 24px rgba(19, 32, 50, 0.06)"
      },
      borderRadius: {
        "4xl": "2rem"
      },
      animation: {
        "shimmer": "shimmer 2.5s ease-in-out infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "gradient-shift": "gradient-shift 8s ease infinite",
        "border-rotate": "border-rotate 4s linear infinite",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards",
        "scale-in": "scaleIn 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(230, 193, 106, 0.1)" },
          "50%": { boxShadow: "0 0 40px rgba(230, 193, 106, 0.25)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "border-rotate": {
          "0%": { "--border-angle": "0deg" },
          "100%": { "--border-angle": "360deg" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      backdropBlur: {
        "2xl": "40px",
        "3xl": "64px",
      }
    }
  },
  plugins: []
};

export default config;
