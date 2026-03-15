/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        ember: "rgb(var(--color-ember) / <alpha-value>)",
        gold: "rgb(var(--color-gold) / <alpha-value>)",
        teal: "rgb(var(--color-teal) / <alpha-value>)",
        slate: "rgb(var(--color-slate) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Sora", "Avenir Next", "Segoe UI", "sans-serif"],
        display: ["Instrument Serif", "Georgia", "serif"],
      },
      boxShadow: {
        glow: "0 20px 80px rgba(248, 166, 91, 0.18)",
      },
      keyframes: {
        floatIn: {
          "0%": {
            opacity: "0",
            transform: "translateY(24px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        pulseRing: {
          "0%": {
            boxShadow: "0 0 0 0 rgba(244, 186, 88, 0.45)",
          },
          "100%": {
            boxShadow: "0 0 0 18px rgba(244, 186, 88, 0)",
          },
        },
      },
      animation: {
        "float-in": "floatIn 0.6s ease both",
        "pulse-ring": "pulseRing 1.6s infinite",
      },
    },
  },
  plugins: [],
};

