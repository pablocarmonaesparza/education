---
title: "Copy · jamás em dash + body siempre con markdown"
type: regla
ambito: producto, copy, diseño
fecha: 2026-05-25
contexto: validación del exercise-lab (sesión con Pablo, bloque #00 reading_passive)
---

# Regla 1 · Jamás usar em dash (—)

**Prohibido en todo código y copy del producto.** Em dash (`—`) es jerga
editorial pesada que no encaja con el tono claro/HIG-friendly de Itera.

## Sustitutos por contexto

| Caso                                  | Reemplazar por |
|---------------------------------------|----------------|
| Separador entre cláusulas relacionadas | ` · ` (punto medio) |
| Lista o pausa enumerativa             | `, ` (coma) |
| Aclaración o paréntesis               | `( ... )` o nueva oración |
| Énfasis o quiebre fuerte              | `.` (punto y oración nueva) |

## Aplicación

- **Copy visible al usuario** (titles, bodies, descriptions, errores, tooltips): cero em dashes.
- **Comentarios JSDoc** y comentarios `//` en código: también cero.
- **Commit messages**: cero.
- **Markdown docs**: cero (incluido este archivo).

Si encuentro em dashes legacy en el repo cuando toque un archivo, los reemplazo en el mismo commit.

## Auditoría rápida

```bash
grep -rn "—" app/ components/ lib/ docs/ scripts/ 2>/dev/null
```

# Regla 2 · El body de cualquier diapositiva usa markdown

**Body plano nunca.** Cualquier `body` / `description` / `prompt` que aparezca como texto narrativo en el runtime debe renderizarse vía markdown para tener dinamismo: bold, italic, links, listas, código inline, blockquotes, tablas, strikethrough.

## Componente canónico

`app/exercise-lab/_shared/SlideBody.tsx` envuelve `react-markdown@9` + `remark-gfm@4` con tokens HIG aplicados. Lo usan:

- `ExerciseLabClient.tsx` (cada `exercise.description`)
- `CaseTemplateClient.tsx` (body del template)
- Cualquier `blocks/*.tsx` que muestre body narrativo
- Casos productivos (`/case/[case_id]`): el RuntimeExperience debe pasar el body por `<SlideBody>`

## Reglas de copy con markdown

- **Bold** (`**texto**`) para conceptos clave que el participante debe retener
- *Italic* (`*texto*`) para verbos de acción o énfasis suave
- `[link](url)` cuando hay referencia externa relevante
- Listas con `-` o `1.` cuando hay 3+ elementos enumerables
- `` `código` `` cuando se cita un nombre de función / variable / endpoint
- Sin HTML crudo: `SlideBody` lo desactiva por defecto (xss-safe)

## Anti-pattern

```tsx
// ❌ Body plano sin formato
<p>El participante recibe un campo de IA sin ayudas adicionales.</p>

// ✅ Body markdown con formato
<SlideBody>
{`El participante recibe **un campo de IA** sin ayudas adicionales. Mide cómo *estructura una petición* cuando opera con criterio propio.`}
</SlideBody>
```

# Por qué importan estas reglas

- **Coherencia visual**: el em dash se ve corporate/editorial, no producto SaaS premium 2026.
- **Lectura escaneable**: bold + italic guían el ojo a lo importante en 1-2 segundos.
- **Compatibilidad con auto-translate**: markdown semántico (`**`) se preserva entre idiomas mejor que punctuación tipográfica.

# Referencias

- Commits canon: `420a763a` (reading_passive #00), `182f94ce` (SlideBody + em dash ban)
- Componente: `app/exercise-lab/_shared/SlideBody.tsx`
- Catálogo YAML: `docs/simulador/case_factory/EXERCISE_BLOCK_CATALOG.yaml` v0.3.0
