"use client";

/**
 * DesignOverridesInjector — lee overrides de localStorage y los inyecta como
 * un <style> tag en <head> que pisa los tokens canónicos de `.simulador-root`.
 *
 * Montado en root providers (`app/providers.tsx`) para que las ediciones del
 * /design page se vean reflejadas en TODAS las surfaces (landing, auth,
 * onboarding, app, admin) sin importar dónde esté el user.
 *
 * Patrón:
 *   1. Mount: lee `localStorage[OVERRIDES_STORAGE_KEY]`.
 *   2. Render: emite <style id="itera-design-overrides">.simulador-root { ... }</style>.
 *   3. Storage event: si /design edita en otra pestaña, sync automático.
 *   4. Custom event 'itera:design-overrides:update': sync intra-pestaña
 *      (mismo doc — porque el storage event no se dispara en el doc que
 *       hizo el setItem).
 *
 * Sanitización: solo se aplican tokens cuyo nombre exista en VALID_TOKEN_NAMES.
 * Cualquier override desconocido se ignora silenciosamente.
 */

import { useEffect, useState } from "react";
import {
  OVERRIDES_STORAGE_KEY,
  VALID_TOKEN_NAMES,
  type OverridesPayload,
} from "@/lib/simulador/design-tokens";

function readOverrides(): OverridesPayload {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(OVERRIDES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    // Sanitiza: solo conserva tokens conocidos.
    const clean: OverridesPayload = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === "string" && VALID_TOKEN_NAMES.has(k)) {
        clean[k] = v;
      }
    }
    return clean;
  } catch {
    return {};
  }
}

function buildCss(overrides: OverridesPayload): string {
  const entries = Object.entries(overrides);
  if (entries.length === 0) return "";
  const decls = entries.map(([k, v]) => `  --${k}: ${v};`).join("\n");
  // Aplica al scope `.simulador-root` (consistente con simulador.css). En dark
  // mode, .dark .simulador-root también hereda estas overrides porque CSS
  // cascade — el override en `.simulador-root` se aplica para light, y si
  // existe un override que pisa una var redefinida en dark, también funciona.
  return `.simulador-root {\n${decls}\n}`;
}

export function DesignOverridesInjector() {
  const [css, setCss] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const refresh = () => setCss(buildCss(readOverrides()));
    const onStorage = (e: StorageEvent) => {
      if (e.key === OVERRIDES_STORAGE_KEY) refresh();
    };

    // Lecturas client-only al montar (localStorage no existe en SSR); el doble
    // render inicial es intencional y aislado a este componente de tooling.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setCss(buildCss(readOverrides()));

    // Sync entre pestañas + intra-pestaña (la /design page emite el custom event)
    window.addEventListener("storage", onStorage);
    window.addEventListener("itera:design-overrides:update", refresh);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("itera:design-overrides:update", refresh);
    };
  }, []);

  if (!mounted || !css) return null;

  return (
    <style
      id="itera-design-overrides"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: css }}
    />
  );
}
