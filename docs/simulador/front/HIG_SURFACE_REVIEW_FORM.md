# HIG surface review form — Itera Simulador

> **Uso:** formulario obligatorio antes de cerrar una surface visual.
> **Autoridad:** `APPLE_HIG_RULES_FOR_ITERA.md`.
> **Criterio:** si falla un `MUST`, la surface no pasa. Si falla un `SHOULD`, puede pasar solo con justificacion escrita. Si Apple HIG no cubre una decision, escalar a Pablo o documentar una decision Itera.

## Metadata

```yaml
surface:
route:
reviewer:
date:
mode_reviewed: [light, dark]
viewport_reviewed: [desktop, mobile]
state_reviewed: [empty, loading, normal, error, success]
screenshots:
decision: PASS | PASS_WITH_FIXES | FAIL
```

---

## 0. Checks tecnicos obligatorios

P00.1 **Build, lint y scope del simulador pasan.**
- reglas: HIG-RULES-A11Y-07, HIG-RULES-COLOR-03
- checks esperados: `npm run check:simulador`, lint/smoke aplicable, build si toca rutas o componentes
- pass / fail:
- evidencia:

P00.2 **La surface se reviso en light y dark mode.**
- reglas: HIG-RULES-COLOR-02, HIG-RULES-COLOR-04, HIG-RULES-DARK-01, HIG-RULES-DARK-03
- pass / fail:
- evidencia:

P00.3 **No hay errores visibles de consola ni assets rotos.**
- reglas: HIG-RULES-LOAD-01, HIG-RULES-LOAD-02, HIG-RULES-FB-01
- pass / fail:
- evidencia:

P00.4 **Keyboard navigation funciona de inicio a fin.**
- reglas: HIG-RULES-A11Y-06, HIG-RULES-BTN-05, HIG-RULES-SHEET-02
- checks esperados: Tab, Shift+Tab, Enter, Esc, focus visible
- pass / fail:
- evidencia:

P00.5 **Reduced motion esta respetado.**
- reglas: HIG-RULES-A11Y-04, HIG-RULES-MOTION-01, HIG-RULES-MOTION-02, HIG-RULES-MOTION-04
- pass / fail:
- evidencia:

P00.6 **Los estilos usan tokens, no valores improvisados.**
- reglas: HIG-RULES-COLOR-03, HIG-RULES-MAT-03, HIG-RULES-MAT-04, HIG-RULES-MOTION-02, HIG-RULES-MOTION-03
- checks esperados: no hex inline, no `shadow-2xl`, no radius arbitrario sin justificacion, no `outline: none` sin reemplazo
- pass / fail:
- evidencia:

---

## 1. Proposito y jerarquia

P01. **La pantalla tiene una accion principal clara.**
- reglas: HIG-RULES-BTN-03, HIG-RULES-BTN-06, HIG-RULES-LAYOUT-05
- pass / fail:
- evidencia:

P02. **La informacion mas importante aparece primero en orden natural de lectura.**
- reglas: HIG-RULES-LAYOUT-04, HIG-RULES-LAYOUT-05, HIG-RULES-TYPO-06
- pass / fail:
- evidencia:

P03. **La pantalla evita competir con demasiadas cards, botones, banners o efectos.**
- reglas: HIG-RULES-LAYOUT-01, HIG-RULES-MAT-01, HIG-RULES-MOTION-01, HIG-RULES-MOTION-04
- pass / fail:
- evidencia:

---

## 2. Legibilidad y accesibilidad

P04. **Texto, botones y estados cumplen contraste en light y dark.**
- reglas: HIG-RULES-A11Y-01, HIG-RULES-COLOR-02, HIG-RULES-COLOR-04, HIG-RULES-DARK-03
- pass / fail:
- evidencia:

P05. **Todo lo clickeable tiene tamano suficiente y focus visible.**
- reglas: HIG-RULES-A11Y-02, HIG-RULES-A11Y-06, HIG-RULES-BTN-01, HIG-RULES-BTN-02
- pass / fail:
- evidencia:

P06. **La pantalla se entiende sin depender solo del color.**
- reglas: HIG-RULES-A11Y-03, HIG-RULES-COLOR-01
- pass / fail:
- evidencia:

---

## 3. Composicion visual

P07. **La tipografia usa pocos niveles, pesos legibles y spacing consistente.**
- reglas: HIG-RULES-TYPO-02, HIG-RULES-TYPO-03, HIG-RULES-TYPO-04, HIG-RULES-TYPO-06
- pass / fail:
- evidencia:

P08. **El layout agrupa bien la informacion con espacio, no con ruido visual.**
- reglas: HIG-RULES-LAYOUT-01, HIG-RULES-LAYOUT-02, HIG-RULES-LAYOUT-03
- pass / fail:
- evidencia:

P09. **Materiales, blur, shadows y radius se usan con proposito.**
- reglas: HIG-RULES-MAT-01, HIG-RULES-MAT-02, HIG-RULES-MAT-03, HIG-RULES-MAT-04
- pass / fail:
- evidencia:

---

## 4. Interaccion y estados

P10. **El movimiento explica estado o transicion.**
- reglas: HIG-RULES-A11Y-04, HIG-RULES-MOTION-01, HIG-RULES-MOTION-02, HIG-RULES-MOTION-04
- pass / fail:
- evidencia:

P11. **Errores, loading, empty states y feedback aparecen cerca del contexto correcto.**
- reglas: HIG-RULES-WRITE-03, HIG-RULES-WRITE-04, HIG-RULES-FB-01, HIG-RULES-FB-03, HIG-RULES-LOAD-01, HIG-RULES-LOAD-02
- pass / fail:
- evidencia:

P12. **Si hay formulario, labels, validacion, defaults y submit estan bien resueltos.**
- reglas: HIG-RULES-FORM-01, HIG-RULES-FORM-02, HIG-RULES-FORM-03, HIG-RULES-FORM-04, HIG-RULES-TF-01, HIG-RULES-TF-02
- pass / fail:
- evidencia:

---

## 5. Criterio Itera

P13. **La pantalla respeta el producto: diagnostico operativo, no curso, no LMS, no AI hype.**
- reglas: HIG-RULES-WRITE-01, HIG-RULES-WRITE-06, FRONT_CONTRACT.md
- pass / fail:
- evidencia:

P14. **La pantalla no revela criterios internos de evaluacion cuando el usuario aun esta respondiendo.**
- reglas: HIG-RULES-WRITE-01, HIG-RULES-WRITE-06, FRONT_CONTRACT.md, contrato_v0 spoiler policy
- pass / fail:
- evidencia:

P15. **Si Apple no cubre una decision, queda documentada como decision Itera.**
- reglas: orden de autoridad de `APPLE_HIG_RULES_FOR_ITERA.md`
- decision requerida:
- owner:
- evidencia:

---

## Cierre

```yaml
must_failures:
should_failures:
fixes_required:
deferred_with_reason:
final_decision: PASS | PASS_WITH_FIXES | FAIL
```
