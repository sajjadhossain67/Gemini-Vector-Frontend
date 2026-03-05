import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ios: {
          blue: "#007AFF",
          "blue-glow": "#00D4FF",
          purple: "#BF5AF2",
          "purple-glow": "#D4B4FF",
          green: "#30D158",
          "green-glow": "#5FE182",
          yellow: "#FFD60A",
          "yellow-glow": "#FFEA70",
          orange: "#FF6B35",
          red: "#FF3B30",
          gray: "#636366",
          bg: "#050508",
          "bg-2": "#0a0814",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "system-ui",
          "sans-serif",
        ],
      },
      backdropBlur: {
        "4xl": "80px",
      },
      animation: {
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "slide-up": "slide-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "fade-in": "fade-in 0.3s ease forwards",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "0.8" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "slide-up": {
          from: { transform: "translateY(24px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
      boxShadow: {
        glass:
          "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
        "glass-lg":
          "0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
        "glow-blue":
          "0 0 20px rgba(0,212,255,0.4), 0 0 60px rgba(0,212,255,0.15)",
        "glow-purple":
          "0 0 20px rgba(191,90,242,0.4), 0 0 60px rgba(191,90,242,0.15)",
        "glow-green":
          "0 0 20px rgba(48,209,88,0.4), 0 0 60px rgba(48,209,88,0.15)",
        "glow-yellow":
          "0 0 20px rgba(255,214,10,0.4), 0 0 60px rgba(255,214,10,0.15)",
        "glow-orange":
          "0 0 20px rgba(255,107,53,0.4), 0 0 60px rgba(255,107,53,0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
