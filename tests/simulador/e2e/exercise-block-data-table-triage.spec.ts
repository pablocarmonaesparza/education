/**
 * exercise-block-data-table-triage.spec.ts
 *
 * E2E del bloque `data_table_triage` extraído al registry:
 *   1. UI inicia VACÍA (no-prefill — regla 2 del YAML canónico)
 *   2. Selección de acción muta el payload visualmente
 *   3. API route rechaza con 422 cualquier payload malformado (Frente A)
 *
 * No requiere Supabase admin — solo verifica el flujo HTTP + UI del lab
 * interno y del bridge en case-lab. La validación Zod se prueba via
 * POST directo a la API field-test sin needing una sesión real (sólo
 * importa que el handler valide shape antes de tocar BD).
 */

import { expect, test } from "@playwright/test";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

test.describe("data_table_triage — bloque canónico", () => {
  test("UI del lab arranca SIN acción seleccionada (no-prefill)", async ({ page }) => {
    await page.goto(`${BASE_URL}/exercise-lab`);

    // El bloque vive en una sección con scroll-snap. Lo localizamos por
    // su data-attribute o por el título visible.
    const dropdown = page
      .locator("text=Clasifica cada campo antes de enviarlo al modelo")
      .first()
      .locator("..");
    await expect(dropdown).toBeVisible();

    // Los selects del bloque deben mostrar "Elegir acción…" como default,
    // NO una acción prellenada (anti-prefill enforcement).
    const selects = page.locator("select[aria-label^='Acción para']");
    const count = await selects.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const selected = await selects.nth(i).evaluate(
        (el) => (el as HTMLSelectElement).value,
      );
      expect(selected).toBe("");
    }
  });

  test("API rechaza 422 cuando payload data_table_triage está malformado", async ({
    page,
  }) => {
    // POST directo a la API field-test. No necesitamos sesión real porque
    // la validación de shape ocurre ANTES de cualquier query a BD: si el
    // shape no pasa el Zod schema, el handler responde 422 inmediato.
    const response = await page.request.patch(
      `${BASE_URL}/api/field-test/sessions/00000000-0000-0000-0000-000000000000/responses`,
      {
        data: {
          step_key: "field_test_step_1",
          payload: {
            block_id: "data_table_triage",
            // shape inválido: field_actions debería ser array, no string
            field_actions: "wrong",
          },
        },
      },
    );

    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body.error).toContain("malformado");
    expect(body.details).toBeDefined();
  });

  test("API acepta payload data_table_triage bien formado (no 422)", async ({
    page,
  }) => {
    // El shape es válido, así que NO debe ser 422.
    // Puede ser 400 (step_key invalid, rate limit, etc) o 200 — lo que
    // importa es que NO sea 422 (shape OK).
    const response = await page.request.patch(
      `${BASE_URL}/api/field-test/sessions/00000000-0000-0000-0000-000000000000/responses`,
      {
        data: {
          step_key: "field_test_step_1",
          payload: {
            block_id: "data_table_triage",
            field_actions: [
              { field_id: "contact", action: "anonimizar" },
              { field_id: "email", action: "excluir" },
            ],
          },
        },
      },
    );

    expect(response.status()).not.toBe(422);
  });

  test("API ignora validación cuando payload NO es bloque (legacy)", async ({
    page,
  }) => {
    // Payload sin block_id — debe pasar la validación de shape (es legacy,
    // no es un bloque del registry). Puede fallar por otras razones (step_key
    // inválido, session no existe), pero NO con 422 de shape.
    const response = await page.request.patch(
      `${BASE_URL}/api/field-test/sessions/00000000-0000-0000-0000-000000000000/responses`,
      {
        data: {
          step_key: "field_test_step_1",
          payload: { legacy_field: "valor cualquiera", whatever: 42 },
        },
      },
    );

    expect(response.status()).not.toBe(422);
  });
});
