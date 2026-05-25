/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      colors: {
        apad: {
          50: "#eef4ff",
          100: "#dce8ff",
          200: "#c2d4ff",
          300: "#9bb6ff",
          400: "#6b8ef8",
          500: "#4565f0",
          600: "#3348e6",
          700: "#2a38cb",
          800: "#2730a4",
          900: "#252e82",
          950: "#181d4f",
        },
        accent: {
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
        },
      },
      boxShadow: {
        soft: "0 4px 24px -4px rgba(37, 46, 130, 0.12)",
        glow: "0 0 40px -8px rgba(69, 101, 240, 0.45)",
        card: "0 8px 32px -8px rgba(15, 23, 42, 0.1)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
    },
  },
  plugins: [],
};
