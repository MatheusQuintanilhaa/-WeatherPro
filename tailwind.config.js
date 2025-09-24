/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        // Apple Watch support - telas muito pequenas
        watch: { max: "200px" },
        // Breakpoints padrão já incluídos:
        // 'sm': '640px',
        // 'md': '768px',
        // 'lg': '1024px',
        // 'xl': '1280px',
        // '2xl': '1536px',
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-slow": "pulse 3s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.75rem" }], // Para Apple Watch
      },
      spacing: {
        0.5: "0.125rem", // 2px - Para espaçamentos mínimos no Watch
        1.5: "0.375rem", // 6px
        2.5: "0.625rem", // 10px
      },
    },
  },
  plugins: [],
};
