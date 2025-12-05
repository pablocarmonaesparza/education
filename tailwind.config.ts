import type { Config } from "tailwindcss";
const { fontFamily } = require("tailwindcss/defaultTheme");

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", ...fontFamily.sans],
        display: ["var(--font-darker-grotesque)", ...fontFamily.sans],
      },
      colors: {
        brand: {
          DEFAULT: "#1472FF",
          light: "#5BA0FF",
          dark: "#0E5FCC",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    function ({ addUtilities }: any) {
      const newUtilities = {
        '.glass': {
          background: 'rgba(255, 255, 255, 0.7)',
          'backdrop-filter': 'blur(20px) saturate(180%)',
          '-webkit-backdrop-filter': 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          'box-shadow': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        },
        '.glass-light': {
          background: 'rgba(255, 255, 255, 0.5)',
          'backdrop-filter': 'blur(16px) saturate(180%)',
          '-webkit-backdrop-filter': 'blur(16px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          'box-shadow': '0 4px 24px 0 rgba(31, 38, 135, 0.2)',
        },
        '.glass-dark': {
          background: 'rgba(17, 24, 39, 0.7)',
          'backdrop-filter': 'blur(20px) saturate(180%)',
          '-webkit-backdrop-filter': 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          'box-shadow': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        },
        '.glass-card': {
          background: 'rgba(255, 255, 255, 0.5)',
          'backdrop-filter': 'blur(30px) saturate(180%)',
          '-webkit-backdrop-filter': 'blur(30px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          'box-shadow': '0 8px 32px 0 rgba(31, 38, 135, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.25)',
        },
      };
      addUtilities(newUtilities);
    },
  ],
};

module.exports = config;
