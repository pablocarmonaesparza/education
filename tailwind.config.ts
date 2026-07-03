import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  // next-themes pone .dark en <html> (ver app/providers.tsx); todo el sistema
  // de theming (simulador.css, design tokens) conmuta por esa clase.
  darkMode: "class",
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
        display: ["var(--font-darker-grotesque)", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // Alias oficiales del design system (ver AGENTS.md).
        // Cambiar aqui propaga a toda la app — nunca usar hex inline.
        primary: {
          DEFAULT: "#1472FF",
          dark: "#0E5FCC",
          hover: "#1265e0", // Hover sobre primary (ver lib/simulador/design-tokens.ts)
        },
        completado: {
          DEFAULT: "#22c55e",
          dark: "#16a34a",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
    },
  },
  plugins: [
    // @heroui/react empaqueta sus propios types de tailwind y el plugin no
    // unifica con los de la raíz; el cast evita el choque sin tocar runtime.
    heroui({
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: "#1472FF",
              foreground: "#FFFFFF",
            },
          },
        },
        dark: {
          colors: {
            background: "#09090B",
            foreground: "#FAFAFA",
            primary: {
              DEFAULT: "#1472FF",
              foreground: "#FFFFFF",
            },
          },
        },
      },
    }) as unknown as NonNullable<Config["plugins"]>[number],
  ],
};

export default config;
