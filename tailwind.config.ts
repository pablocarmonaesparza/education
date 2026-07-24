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
        sans: ["var(--font-jakarta)", ...defaultTheme.fontFamily.sans],
        display: ["var(--font-jakarta)", ...defaultTheme.fontFamily.sans],
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
      // Profundidad v2 (Duolingo-craft). ANTES vivían como
      // `shadow-[var(--shadow-*)]` arbitrarios — y ahí estaba el bug: Tailwind
      // resuelve un `var()` pelado dentro de `shadow-[...]` como COLOR de sombra,
      // no como la sombra completa, así que `--tw-shadow` quedaba en `0 0 #0000`
      // y el box-shadow renderizaba `none`. Toda la capa de profundidad (labio
      // 3D, cards, floats) fue invisible. Registrarlas como valores de tema
      // fuerza el tratamiento como box-shadow (los theme values NUNCA pasan por
      // la resolución color-vs-sombra) y conserva la indirección de token, así
      // que el dark mode sigue conmutando vía --shadow-*.
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        // xl registrado aunque hoy sin consumidor: si no, `shadow-xl` caería al
        // default Material de Tailwind (el estilo que APPLE_HIG_RULES prohíbe).
        xl: "var(--shadow-xl)",
        lip: "var(--shadow-lip)",
        "lip-lg": "var(--shadow-lip-lg)",
        "lip-danger": "var(--shadow-lip-danger)",
        card: "var(--shadow-card)",
        float: "var(--shadow-float)",
        "float-lg": "var(--shadow-float-lg)",
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
