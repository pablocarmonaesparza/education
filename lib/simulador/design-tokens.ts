/**
 * design-tokens — catálogo de los design tokens EDITABLES del sistema.
 *
 * Single source of truth para:
 *   - `/design` page (renderiza controles de edición)
 *   - DesignOverridesInjector (sabe qué tokens son válidos)
 *
 * Excepción: tokens internos NO editables (`--heroui-radius-*`, `--avatar-*-bg`)
 * viven solo en `app/(app)/simulador.css` y no se exponen aquí.
 * Si agregas/quitas un token editable en `app/(app)/simulador.css`, también edítalo aquí.
 * El default DEBE coincidir con el valor en simulador.css (light mode) — esto
 * permite que /design muestre "Default" cuando el override matches el valor
 * canónico.
 */
export type TokenKind = "px" | "color" | "ms" | "ease" | "radius" | "shadow" | "letter" | "space";

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
  { name: "surface",        defaultLight: "#ffffff", defaultDark: "#0b0e1c", kind: "color", description: "fondo principal" },
  { name: "surface-2",      defaultLight: "#fafbfd", defaultDark: "#141833", kind: "color", description: "fondo elevado (cards, hover)" },
  { name: "surface-3",      defaultLight: "#f5f6fb", defaultDark: "#1d2342", kind: "color", description: "fondo más elevado (bubbles)" },
  { name: "surface-tint",   defaultLight: "#f5f7ff", defaultDark: "#131b3f", kind: "color", description: "tinte azulado de sección (v2)" },
  { name: "bubble",         defaultLight: "#f5f6fb", defaultDark: "#1d2342", kind: "color", description: "chat bubble, chip neutral" },
  { name: "ink-band",       defaultLight: "#171d33", defaultDark: "#141833", kind: "color", description: "banda oscura ink (footer, CTA band v2)" },
  { name: "ink-band-text",  defaultLight: "#b7c0de", defaultDark: "#a8b1d1", kind: "color", description: "texto sobre banda ink" },
  { name: "ink-band-text-muted", defaultLight: "#8b93b8", defaultDark: "#8089ad", kind: "color", description: "texto atenuado sobre banda ink" },
];

// ============================================================================
// COLORS — Text
// ============================================================================
const TEXT: DesignToken[] = [
  { name: "text-primary",   defaultLight: "#171d33", defaultDark: "#eef1fb", kind: "color", description: "texto principal, headings (tinta ink v2)" },
  { name: "text-secondary", defaultLight: "#4a5372", defaultDark: "#a8b1d1", kind: "color", description: "texto secundario, body" },
  { name: "text-tertiary",  defaultLight: "#7a83a3", defaultDark: "#8089ad", kind: "color", description: "texto terciario, captions" },
  { name: "text-disabled",  defaultLight: "#9aa3c0", defaultDark: "#4a5372", kind: "color", description: "disabled" },
];

// ============================================================================
// COLORS — Borders
// ============================================================================
const BORDERS: DesignToken[] = [
  { name: "border",          defaultLight: "#e4e8f4", defaultDark: "#262c4a", kind: "color", description: "borde estándar" },
  { name: "border-strong",   defaultLight: "#c4cce3", defaultDark: "#38406a", kind: "color", description: "borde hover/focus" },
  { name: "hairline",        defaultLight: "rgba(23, 29, 51, 0.07)", defaultDark: "rgba(255, 255, 255, 0.08)", kind: "color", description: "divider sutil" },
  { name: "hairline-strong", defaultLight: "#c4cce3", defaultDark: "#38406a", kind: "color", description: "hairline marcado (v2)" },
  { name: "shadow",          defaultLight: "rgba(23, 29, 51, 0.05)", defaultDark: "rgba(0, 0, 0, 0.6)",        kind: "color", description: "tinte de sombra" },
];

// ============================================================================
// COLORS — Accent (Itera brand)
// ============================================================================
const ACCENT: DesignToken[] = [
  { name: "accent",        defaultLight: "#003aff", defaultDark: "#7a94ff", kind: "color", description: "azul profundo Itera v2 — texto, bordes, focus; CTAs en light" },
  { name: "accent-hover",  defaultLight: "#0026a8", defaultDark: "#1e46f2", kind: "color", description: "accent en hover/pressed" },
  { name: "accent-strong", defaultLight: "#003aff", defaultDark: "#2e55ff", kind: "color", description: "fondo sólido bajo texto blanco (AA) — botones/badges primary, DEC-009" },
  { name: "accent-lip",    defaultLight: "#0026a8", defaultDark: "#1233c2", kind: "color", description: "labio 3D v2 (box-shadow 0 4px 0) de botones primary" },
  { name: "accent-soft",   defaultLight: "rgba(0, 58, 255, 0.08)",  defaultDark: "rgba(46, 85, 255, 0.16)",   kind: "color", description: "fondo de chip accent" },
  { name: "accent-border", defaultLight: "rgba(0, 58, 255, 0.3)",   defaultDark: "rgba(122, 148, 255, 0.35)", kind: "color", description: "borde accent translúcido (eyebrow chips v2)" },
  { name: "accent-ring",   defaultLight: "rgba(0, 58, 255, 0.24)",  defaultDark: "rgba(122, 148, 255, 0.32)", kind: "color", description: "focus ring" },
];

// ============================================================================
// COLORS — Bands (semantic status)
// ============================================================================
const BANDS: DesignToken[] = [
  { name: "band-a-bg",   defaultLight: "#e2f7f2", defaultDark: "rgba(15, 191, 143, 0.14)", kind: "color", description: "Alto / Verde — fondo" },
  { name: "band-a-text", defaultLight: "#067050", defaultDark: "#45e0b2",                   kind: "color", description: "Alto — texto" },
  { name: "band-a-bar",  defaultLight: "#0fbf8f", defaultDark: null,                        kind: "color", description: "Alto — barra/punto" },
  { name: "band-m-bg",   defaultLight: "#fcf2dd", defaultDark: "rgba(232, 162, 12, 0.14)", kind: "color", description: "Medio / Ámbar — fondo" },
  { name: "band-m-text", defaultLight: "#8a6206", defaultDark: "#f4c14d",                   kind: "color", description: "Medio — texto" },
  { name: "band-m-bar",  defaultLight: "#e8a20c", defaultDark: null,                        kind: "color", description: "Medio — barra/punto" },
  { name: "band-b-bg",   defaultLight: "#feecef", defaultDark: "rgba(240, 70, 97, 0.16)",  kind: "color", description: "Bajo / Rojo — fondo" },
  { name: "band-b-text", defaultLight: "#c42847", defaultDark: "#ff8b9d",                   kind: "color", description: "Bajo — texto" },
  { name: "band-b-bar",  defaultLight: "#f04661", defaultDark: null,                        kind: "color", description: "Bajo — barra/punto" },
];

// ============================================================================
// COLORS — Semánticos v2 (familia Duolingo-craft; los leen labios, traffic
// lights de AppleBrowserFrame, dot de AppleEyebrowChip, etc.)
// ============================================================================
const V2_SEMANTIC: DesignToken[] = [
  { name: "v2-green",        defaultLight: "#0fbf8f", defaultDark: "#2fd6a5",                    kind: "color", description: "verde v2 — éxito, dot de status" },
  { name: "v2-green-dark",   defaultLight: "#0a8a66", defaultDark: "#45e0b2",                    kind: "color", description: "verde oscuro — texto/labio verde" },
  { name: "v2-green-border", defaultLight: "#bfeedd", defaultDark: "rgba(15, 191, 143, 0.35)",  kind: "color", description: "borde de chip verde" },
  { name: "v2-red",          defaultLight: "#f04661", defaultDark: "#ff6b82",                    kind: "color", description: "rojo v2 — danger, traffic light" },
  { name: "v2-red-dark",     defaultLight: "#c42847", defaultDark: "#ff8b9d",                    kind: "color", description: "rojo oscuro — labio de botones danger" },
  { name: "v2-amber",        defaultLight: "#e8a20c", defaultDark: "#f4b83c",                    kind: "color", description: "ámbar v2 — warning, traffic light" },
  { name: "v2-amber-dark",   defaultLight: "#8a6206", defaultDark: "#f4c14d",                    kind: "color", description: "ámbar oscuro — texto warning" },
  { name: "v2-orange",       defaultLight: "#f97d2b", defaultDark: "#ff9350",                    kind: "color", description: "naranja v2 — avatares, acentos cálidos" },
];

// ============================================================================
// RADIUS
// ============================================================================
const RADIUS: DesignToken[] = [
  { name: "radius-xs",   defaultLight: "4px",    defaultDark: null, kind: "radius", description: "chips muy pequeñas" },
  { name: "radius-sm",   defaultLight: "8px",    defaultDark: null, kind: "radius", description: "chips, badges" },
  { name: "radius-md",   defaultLight: "14px",   defaultDark: null, kind: "radius", description: "botones, inputs, selects (DEC-005, v2)" },
  { name: "radius-lg",   defaultLight: "20px",   defaultDark: null, kind: "radius", description: "cards (v2)" },
  { name: "radius-xl",   defaultLight: "24px",   defaultDark: null, kind: "radius", description: "modal, dialog, frames (v2)" },
  { name: "radius-2xl",  defaultLight: "28px",   defaultDark: null, kind: "radius", description: "hero card, sheet (v2)" },
  { name: "radius-full", defaultLight: "9999px", defaultDark: null, kind: "radius", description: "pills, avatars" },
];

// ============================================================================
// SHADOW
// ============================================================================
const SHADOW: DesignToken[] = [
  // Profundidad v2: labio sólido (interactivos) + flotación suave (cards)
  { name: "shadow-lip",        defaultLight: "0 4px 0 var(--accent-lip)",           defaultDark: null, kind: "shadow", description: "labio 3D — botones primary (v2)" },
  { name: "shadow-lip-lg",     defaultLight: "0 5px 0 var(--accent-lip)",           defaultDark: null, kind: "shadow", description: "labio grande — AppleSlideButton (v2)" },
  { name: "shadow-lip-danger", defaultLight: "0 4px 0 var(--v2-red-dark)",          defaultDark: null, kind: "shadow", description: "labio rojo — botones danger (v2)" },
  { name: "shadow-card",       defaultLight: "0 10px 30px rgba(23, 29, 51, 0.05)",  defaultDark: "0 10px 30px rgba(0, 0, 0, 0.45)", kind: "shadow", description: "cards en reposo (v2)" },
  { name: "shadow-float",      defaultLight: "0 24px 60px rgba(23, 29, 51, 0.14)",  defaultDark: "0 24px 60px rgba(0, 0, 0, 0.5)",  kind: "shadow", description: "flotación — mocks, browser frames (v2)" },
  { name: "shadow-float-lg",   defaultLight: "0 30px 70px rgba(23, 29, 51, 0.16)",  defaultDark: "0 30px 70px rgba(0, 0, 0, 0.55)", kind: "shadow", description: "flotación grande — hero (v2)" },
  // Difusas legacy (menus/overlays las siguen leyendo) — tono a ink
  { name: "shadow-xs", defaultLight: "0 1px 2px rgba(23, 29, 51, 0.04)",    defaultDark: null, kind: "shadow", description: "elevación 1: subtle" },
  { name: "shadow-sm", defaultLight: "0 2px 4px rgba(23, 29, 51, 0.06)",    defaultDark: null, kind: "shadow", description: "elevación 2: legacy sutil" },
  { name: "shadow-md", defaultLight: "0 4px 12px rgba(23, 29, 51, 0.08)",   defaultDark: null, kind: "shadow", description: "elevación 3: hover" },
  { name: "shadow-lg", defaultLight: "0 8px 24px rgba(23, 29, 51, 0.1)",    defaultDark: null, kind: "shadow", description: "elevación 4: popovers, dropdowns" },
  { name: "shadow-xl", defaultLight: "0 16px 48px rgba(23, 29, 51, 0.12)",  defaultDark: null, kind: "shadow", description: "elevación 5: modales" },
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
  { name: "motion-linear", defaultLight: "linear", defaultDark: null, kind: "ease", description: "solo progress bars determinate" },
];

// ============================================================================
// SPACING (semantic) — ritmo de sección + ancho de lectura
// ============================================================================
const SPACING: DesignToken[] = [
  { name: "space-section",    defaultLight: "96px",  defaultDark: null, kind: "space", description: "padding vertical de sección (desktop; 64px en mobile)" },
  { name: "space-section-sm", defaultLight: "64px",  defaultDark: null, kind: "space", description: "sección compacta (desktop; 48px en mobile)" },
  { name: "reading-max",      defaultLight: "720px", defaultDark: null, kind: "space", description: "ancho máx de columna de lectura (.reading-col)" },
];

// ============================================================================
// EXPORT
// ============================================================================
export const TOKEN_SECTIONS: TokenSection[] = [
  { id: "typography", title: "Tipografía",  blurb: "19 tamaños — escala Apple HIG-inspired. Cambias un token, cambia toda la app.", tokens: TYPOGRAPHY },
  { id: "surfaces",   title: "Surfaces",    blurb: "Fondos. surface es el principal; surface-2/3 son elevaciones progresivas.",      tokens: SURFACES },
  { id: "text",       title: "Texto",       blurb: "4 niveles de contraste sobre surface. text-primary para headings; text-tertiary para captions.", tokens: TEXT },
  { id: "borders",    title: "Borders & hairlines", blurb: "Líneas sutiles entre superficies. hairline es el divider más sutil.",     tokens: BORDERS },
  { id: "accent",     title: "Accent (azul Itera v2)", blurb: "El único color de brand (azul profundo #003aff). CTAs, links, focus rings, labio 3D.", tokens: ACCENT },
  { id: "bands",      title: "Bandas (status)", blurb: "Verde/Ámbar/Rojo semánticos para readiness y health. A=alto, M=medio, B=bajo.", tokens: BANDS },
  { id: "v2-semantic", title: "Semánticos v2", blurb: "Familia de color v2 (Duolingo-craft): labios danger, traffic lights, dots de status.", tokens: V2_SEMANTIC },
  { id: "radius",     title: "Border radius", blurb: "Todos los componentes redondeados usan estos 7 tokens. DEC-005: inputs y botones = radius-md (14px v2).", tokens: RADIUS },
  { id: "shadow",     title: "Shadow (profundidad v2)", blurb: "Labio sólido para interactivos (lip), flotación suave para cards (card/float) + 5 difusas legacy.", tokens: SHADOW },
  { id: "motion",     title: "Motion (duraciones + easings)", blurb: "Cambiar motion-base afecta todas las transiciones estándar.", tokens: MOTION },
  { id: "spacing",    title: "Spacing (ritmo)", blurb: "Ritmo vertical de sección y ancho de lectura. El micro-spacing (gaps/paddings) usa la escala de Tailwind.", tokens: SPACING },
];

/** Lista plana de todos los tokens (útil para validación). */
export const ALL_TOKENS: DesignToken[] = TOKEN_SECTIONS.flatMap((s) => s.tokens);

/** Set de nombres válidos para sanitizar overrides cargados de localStorage. */
export const VALID_TOKEN_NAMES = new Set(ALL_TOKENS.map((t) => t.name));

/** localStorage key para persistir los overrides cross-page. */
export const OVERRIDES_STORAGE_KEY = "itera_design_overrides";

/** Tipo del payload guardado en localStorage. */
export type OverridesPayload = Record<string, string>;
