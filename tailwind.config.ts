import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";
const { fontFamily } = require("tailwindcss/defaultTheme");

const config: Config = {
  darkMode: ["media", "class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
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
          dark: "#0E5FCC",
        },
        // Alias oficiales del design system (ver AGENTS.md).
        // Cambiar aqui propaga a toda la app — nunca usar hex inline.
        primary: {
          DEFAULT: "#1472FF",
          dark: "#0E5FCC",
          hover: "#1265e0", // Hover sobre primary (ver DESIGN_SYSTEM.md)
        },
        completado: {
          DEFAULT: "#22c55e",
          dark: "#16a34a",
        },
        ink: {
          DEFAULT: "#4b4b4b", // Text Main (light)
          muted: "#777777",   // Text Muted
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
    heroui({
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: "#6366F1",
              foreground: "#FFFFFF",
            },
            secondary: {
              DEFAULT: "#A855F7",
              foreground: "#FFFFFF",
            },
          },
        },
        dark: {
          colors: {
            background: "#09090B",
            foreground: "#FAFAFA",
            primary: {
              DEFAULT: "#818CF8",
              foreground: "#FFFFFF",
            },
            secondary: {
              DEFAULT: "#C084FC",
              foreground: "#FFFFFF",
            },
          },
        },
      },
    }),
  ],
};

module.exports = config;
