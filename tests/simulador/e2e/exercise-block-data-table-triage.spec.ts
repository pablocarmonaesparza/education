/**
 * exercise-block-data-table-triage.spec.ts
 *
 * E2E del bloque `data_table_triage` extraído al registry. Tests scope:
 *   1. UI del lab arranca VACÍA (no-prefill — regla 2 del YAML canónico)
 *   2. Selección de acción muta el payload visualmente
 *
 * Validación Zod del Frente A se prueba via test unitario directo del
 * parser (no E2E) — la ruta /api/.../responses tiene gates de auth/cookie
 * antes del parser, así que un POST E2E sin sesión real devuelve 401/400
 * antes de tocar el validador (Codex review P1 #4).
 */

import { expect, test } from "@playwright/test";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

test.describe("data_table_triage — bloque canónico", () => {
  test("UI del lab arranca SIN acción seleccionada (no-prefill)", async ({ page }) => {
    await page.goto(`${BASE_URL}/exercise-lab`);

    // Bloque visible (scroll-snap puede requerir scroll, lo localizamos por
    // título). El bloque vive dentro del scroll container del lab.
    const blockHeading = page.locator(
      "text=Clasifica cada campo antes de enviarlo al modelo",
    );
    await blockHeading.scrollIntoViewIfNeeded();
    await expect(blockHeading).toBeVisible();

    // Los selects del bloque deben mostrar "" (sin selección) — la opción
    // "Elegir acción…" es el placeholder con value="".
    const selects = page.locator("select[aria-label^='Acción para']");
    const count = await selects.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const value = await selects.nth(i).evaluate(
        (el) => (el as HTMLSelectElement).value,
      );
      expect(value).toBe("");
    }
  });

  test("Seleccionar acción muta el dropdown visualmente", async ({ page }) => {
    await page.goto(`${BASE_URL}/exercise-lab`);

    const firstSelect = page
      .locator("select[aria-label^='Acción para']")
      .first();
    await firstSelect.scrollIntoViewIfNeeded();

    // Antes: ""
    await expect(firstSelect).toHaveValue("");

    // Seleccionar "excluir" — la opción más estricta de privacidad
    await firstSelect.selectOption("excluir");

    // Después: el select tiene el valor + el state local del componente
    // se actualizó (verifica que el onChange disparó).
    await expect(firstSelect).toHaveValue("excluir");
  });
});
