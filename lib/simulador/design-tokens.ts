/**
 * design-tokens — catálogo único de TODOS los design tokens del sistema.
 *
 * Single source of truth para:
 *   - `/design` page (renderiza controles de edición)
 *   - DesignOverridesInjector (sabe qué tokens son válidos)
 *
 * Si agregas/quitas un token en `app/(app)/simulador.css`, también edítalo aquí.
 * El default DEBE coincidir con el valor en simulador.css (light mode) — esto
 * permite que /design muestre "Default" cuando el override matches el valor
 * canónico.
 */
export type TokenKind = "px" | "color" | "ms" | "ease" | "radius" | "shadow" | "letter";

export interface DesignToken {
  /** CSS custom property sin el prefijo `--`. Ej: "text-body". */
  name: string;
  /** Default en light mode (matches simulador.css :root). */
  defaultLight: string;
  /** Default en dark mode (matches `.dark .simulador-root` en simulador.css). null = mismo que light. */
  defaultDark: string | null;
  /** Tipo del valor — controla qué input renderiza /design. */
  kind: TokenKind;
  /** Texto corto para humanos (mostrado bajo el name). */
  description: string;
}

export interface TokenSection {
  id: string;
  title: string;
  blurb: string;
  tokens: DesignToken[];
}

// ============================================================================
// TYPOGRAPHY
// ============================================================================
const TYPOGRAPHY: DesignToken[] = [
  { name: "text-caption-2",   defaultLight: "10.5px", defaultDark: null, kind: "px", description: "micro: timestamps, micro-meta" },
  { name: "text-caption-1",   defaultLight: "11.5px", defaultDark: null, kind: "px", description: "eyebrows, chip labels" },
  { name: "text-footnote",    defaultLight: "12px",   defaultDark: null, kind: "px", description: "nota auxiliar, labels secundarios" },
  { name: "text-subhead",     defaultLight: "13.5px", defaultDark: null, kind: "px", description: "body secundario, descripciones de card" },
  { name: "text-callout",     defaultLight: "14px",   defaultDark: null, kind: "px", description: "CTA pequeño, label de formulario" },
  { name: "text-body",        defaultLight: "15px",   defaultDark: null, kind: "px", description: "body principal, párrafos" },
  { name: "text-headline",    defaultLight: "17px",   defaultDark: null, kind: "px", description: "títulos de card, H3" },
  { name: "text-body-lg",     defaultLight: "19px",   defaultDark: null, kind: "px", description: "intro hero body" },
  { name: "text-body-xl",     defaultLight: "21px",   defaultDark: null, kind: "px", description: "subtitle hero desktop" },
  { name: "text-title-3",     defaultLight: "22px",   defaultDark: null, kind: "px", description: "títulos sección secundaria" },
  { name: "text-title-2",     defaultLight: "24px",   defaultDark: null, kind: "px", description: "H2 hero card" },
  { name: "text-title-1",     defaultLight: "28px",   defaultDark: null, kind: "px", description: "H1 surface" },
  { name: "text-display",     defaultLight: "32px",   defaultDark: null, kind: "px", description: "hero compacto" },
  { name: "text-display-lg",  defaultLight: "40px",   defaultDark: null, kind: "px", description: "hero default surface" },
  { name: "text-display-xl",  defaultLight: "52px",   defaultDark: null, kind: "px", description: "report hero (sm:)" },
  { name: "text-display-2xl", defaultLight: "56px",   defaultDark: null, kind: "px", description: "runtime intro hero" },
  { name: "text-display-3xl", defaultLight: "60px",   defaultDark: null, kind: "px", description: "runtime reporte hero" },
  { name: "text-display-4xl", defaultLight: "64px",   defaultDark: null, kind: "px", description: "landing hero (sm:)" },
  { name: "text-display-5xl", defaultLight: "80px",   defaultDark: null, kind: "px", description: "landing hero (md:), max" },
];

// ============================================================================
// COLORS — Surfaces
// ============================================================================
const SURFACES: DesignToken[] = [
  { name: "surface",   defaultLight: "#ffffff", defaultDark: "#000000", kind: "color", description: "fondo principal" },
  { name: "surface-2", defaultLight: "#fafafa", defaultDark: "#0a0a0c", kind: "color", description: "fondo elevado (cards, hover)" },
  { name: "surface-3", defaultLight: "#f5f5f7", defaultDark: "#161618", kind: "color", description: "fondo más elevado (bubbles)" },
  { name: "bubble",    defaultLight: "#f5f5f7", defaultDark: "#1c1c1e", kind: "color", description: "chat bubble, chip neutral" },
];

// ============================================================================
// COLORS — Text
// ============================================================================
const TEXT: DesignToken[] = [
  { name: "text-primary",   defaultLight: "#1d1d1f", defaultDark: "#f5f5f7", kind: "color", description: "texto principal, headings" },
  { name: "text-secondary", defaultLight: "#6e6e73", defaultDark: "#a1a1a6", kind: "color", description: "texto secundario, body" },
  { name: "text-tertiary",  defaultLight: "#86868b", defaultDark: "#8e8e93", kind: "color", description: "texto terciario, captions" },
  { name: "text-disabled",  defaultLight: "#c7c7cc", defaultDark: "#48484a", kind: "color", description: "disabled" },
];

// ============================================================================
// COLORS — Borders
// ============================================================================
const BORDERS: DesignToken[] = [
  { name: "border",          defaultLight: "#e5e5ea", defaultDark: "#2c2c2e", kind: "color", description: "borde estándar" },
  { name: "border-strong",   defaultLight: "#d2d2d7", defaultDark: "#3a3a3c", kind: "color", description: "borde hover/focus" },
  { name: "hairline",        defaultLight: "rgba(0, 0, 0, 0.06)",   defaultDark: "rgba(255, 255, 255, 0.08)", kind: "color", description: "divider sutil" },
  { name: "shadow",          defaultLight: "rgba(0, 0, 0, 0.04)",   defaultDark: "rgba(0, 0, 0, 0.6)",        kind: "color", description: "tinte de sombra" },
];

// ============================================================================
// COLORS — Accent (Itera brand)
// ============================================================================
const ACCENT: DesignToken[] = [
  { name: "accent",       defaultLight: "#1472ff", defaultDark: null, kind: "color", description: "azul Itera, CTAs y links" },
  { name: "accent-hover", defaultLight: "#0e5fcc", defaultDark: null, kind: "color", description: "accent en hover/pressed" },
  { name: "accent-soft",  defaultLight: "rgba(20, 114, 255, 0.08)", defaultDark: "rgba(20, 114, 255, 0.14)", kind: "color", description: "fondo de chip accent" },
  { name: "accent-ring",  defaultLight: "rgba(20, 114, 255, 0.24)", defaultDark: "rgba(20, 114, 255, 0.32)", kind: "color", description: "focus ring" },
];

// ============================================================================
// COLORS — Bands (semantic status)
// ============================================================================
const BANDS: DesignToken[] = [
  { name: "band-a-bg",   defaultLight: "#e8f5ed", defaultDark: "rgba(34, 197, 94, 0.14)",  kind: "color", description: "Alto / Verde — fondo" },
  { name: "band-a-text", defaultLight: "#0a7e3a", defaultDark: "#4ade80",                   kind: "color", description: "Alto — texto" },
  { name: "band-a-bar",  defaultLight: "#0a7e3a", defaultDark: "#22c55e",                   kind: "color", description: "Alto — barra/punto" },
  { name: "band-m-bg",   defaultLight: "#fef4e6", defaultDark: "rgba(245, 158, 11, 0.14)", kind: "color", description: "Medio / Ámbar — fondo" },
  { name: "band-m-text", defaultLight: "#a05a00", defaultDark: "#fbbf24",                   kind: "color", description: "Medio — texto" },
  { name: "band-m-bar",  defaultLight: "#cc8800", defaultDark: "#f59e0b",                   kind: "color", description: "Medio — barra/punto" },
  { name: "band-b-bg",   defaultLight: "#fde9e9", defaultDark: "rgba(239, 68, 68, 0.14)",  kind: "color", description: "Bajo / Rojo — fondo" },
  { name: "band-b-text", defaultLight: "#a01818", defaultDark: "#f87171",                   kind: "color", description: "Bajo — texto" },
  { name: "band-b-bar",  defaultLight: "#c0282b", defaultDark: "#ef4444",                   kind: "color", description: "Bajo — barra/punto" },
];

// ============================================================================
// RADIUS
// ============================================================================
const RADIUS: DesignToken[] = [
  { name: "radius-xs",   defaultLight: "4px",    defaultDark: null, kind: "radius", description: "chips muy pequeñas" },
  { name: "radius-sm",   defaultLight: "8px",    defaultDark: null, kind: "radius", description: "chips, badges" },
  { name: "radius-md",   defaultLight: "12px",   defaultDark: null, kind: "radius", description: "botones, inputs, selects (DEC-005)" },
  { name: "radius-lg",   defaultLight: "16px",   defaultDark: null, kind: "radius", description: "cards" },
  { name: "radius-xl",   defaultLight: "20px",   defaultDark: null, kind: "radius", description: "modal, dialog" },
  { name: "radius-2xl",  defaultLight: "24px",   defaultDark: null, kind: "radius", description: "hero card, sheet" },
  { name: "radius-full", defaultLight: "9999px", defaultDark: null, kind: "radius", description: "pills, avatars" },
];

// ============================================================================
// SHADOW
// ============================================================================
const SHADOW: DesignToken[] = [
  { name: "shadow-xs", defaultLight: "0 1px 2px rgba(0, 0, 0, 0.04)",    defaultDark: null, kind: "shadow", description: "elevación 1: subtle" },
  { name: "shadow-sm", defaultLight: "0 2px 4px rgba(0, 0, 0, 0.06)",    defaultDark: null, kind: "shadow", description: "elevación 2: cards en reposo" },
  { name: "shadow-md", defaultLight: "0 4px 12px rgba(0, 0, 0, 0.08)",   defaultDark: null, kind: "shadow", description: "elevación 3: hover" },
  { name: "shadow-lg", defaultLight: "0 8px 24px rgba(0, 0, 0, 0.10)",   defaultDark: null, kind: "shadow", description: "elevación 4: popovers, dropdowns" },
  { name: "shadow-xl", defaultLight: "0 16px 48px rgba(0, 0, 0, 0.12)",  defaultDark: null, kind: "shadow", description: "elevación 5: modales" },
];

// ============================================================================
// MOTION
// ============================================================================
const MOTION: DesignToken[] = [
  { name: "motion-fast",   defaultLight: "150ms", defaultDark: null, kind: "ms",   description: "micro-interacciones, hover" },
  { name: "motion-base",   defaultLight: "250ms", defaultDark: null, kind: "ms",   description: "transitions estándar" },
  { name: "motion-slow",   defaultLight: "450ms", defaultDark: null, kind: "ms",   description: "expansiones, accordions" },
  { name: "motion-page",   defaultLight: "600ms", defaultDark: null, kind: "ms",   description: "entrada de pantalla" },
  { name: "motion-ease",   defaultLight: "cubic-bezier(0.16, 1, 0.3, 1)",   defaultDark: null, kind: "ease", description: "easing default (out-expo)" },
  { name: "motion-spring", defaultLight: "cubic-bezier(0.34, 1.56, 0.64, 1)", defaultDark: null, kind: "ease", description: "spring (bouncy)" },
];

// ============================================================================
// EXPORT
// ============================================================================
export const TOKEN_SECTIONS: TokenSection[] = [
  { id: "typography", title: "Tipografía",  blurb: "16 tamaños — escala Apple HIG-inspired. Cambias un token, cambia toda la app.", tokens: TYPOGRAPHY },
  { id: "surfaces",   title: "Surfaces",    blurb: "Fondos. surface es el principal; surface-2/3 son elevaciones progresivas.",      tokens: SURFACES },
  { id: "text",       title: "Texto",       blurb: "4 niveles de contraste sobre surface. text-primary para headings; text-tertiary para captions.", tokens: TEXT },
  { id: "borders",    title: "Borders & hairlines", blurb: "Líneas sutiles entre superficies. hairline es el divider más sutil.",     tokens: BORDERS },
  { id: "accent",     title: "Accent (azul Itera)", blurb: "El único color de brand. CTAs, links, focus rings, chips primarios.",     tokens: ACCENT },
  { id: "bands",      title: "Bandas (status)", blurb: "Verde/Ámbar/Rojo semánticos para readiness y health. A=alto, M=medio, B=bajo.", tokens: BANDS },
  { id: "radius",     title: "Border radius", blurb: "Todos los componentes redondeados usan estos 7 tokens. DEC-005: inputs y botones = radius-md (12px).", tokens: RADIUS },
  { id: "shadow",     title: "Shadow (elevation)", blurb: "5 niveles de elevación. xs=subtle, xl=modal.", tokens: SHADOW },
  { id: "motion",     title: "Motion (duraciones + easings)", blurb: "Cambiar motion-base afecta todas las transiciones estándar.", tokens: MOTION },
];

/** Lista plana de todos los tokens (útil para validación). */
export const ALL_TOKENS: DesignToken[] = TOKEN_SECTIONS.flatMap((s) => s.tokens);

/** Set de nombres válidos para sanitizar overrides cargados de localStorage. */
export const VALID_TOKEN_NAMES = new Set(ALL_TOKENS.map((t) => t.name));

/** localStorage key para persistir los overrides cross-page. */
export const OVERRIDES_STORAGE_KEY = "itera_design_overrides";

/** Tipo del payload guardado en localStorage. */
export type OverridesPayload = Record<string, string>;
