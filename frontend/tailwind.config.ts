import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: "#f7f5ef",
        stone: "#e6e1d5",
        ink: "#1f2937",
        muted: "#5f6875",
        accent: "#3f5d50"
      },
      fontFamily: {
        arabic: ["var(--font-arabic)", "serif"],
        latin: ["var(--font-latin)", "sans-serif"]
      },
      boxShadow: {
        soft: "0 10px 30px rgba(18, 24, 32, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
