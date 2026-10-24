import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        matte: "#0A0A0B",
        charcoal: {
          DEFAULT: "#141416",
          elevated: "#1C1C20",
          soft: "#25252B",
        },
        gold: {
          DEFAULT: "#D4AF37",
          champagne: "#E5C158",
          muted: "#A68A3E",
          tint: "rgba(212, 175, 55, 0.12)",
        },
        ivory: {
          DEFAULT: "#F8F6F0",
          muted: "#C4BFB3",
          subtle: "#8A857A",
        },
        brand: {
          orange: "#F28C38",
          red: "#E62E2D",
        },
      },
      fontFamily: {
        serif: ["var(--font-cinzel)", "Georgia", "serif"],
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        gold: "0 10px 35px -10px rgba(212, 175, 55, 0.25)",
        "gold-sm": "0 4px 16px -4px rgba(212, 175, 55, 0.18)",
        card: "0 20px 50px -15px rgba(0, 0, 0, 0.75)",
      },
    },
  },
  plugins: [],
};

export default config;
