---
title: "Copy · jamás abreviaciones ni acrónimos en casos"
type: copy
date: 2026-05-25
dept: producto
ambito: producto, copy, casos, exercise-lab, simulador
contexto: feedback de Pablo en revisión del bloque 4 del exercise-lab
prioridad: determinante
---

# Regla · cero abreviaciones / acrónimos en el copy de casos

**Prohibido en todo el copy visible del simulador** (cases, exercise-lab,
case-template, runtime productivo). La regla es **determinante**:
ningún acrónimo, sigla o abreviación técnica/legal/corporativa.

## Por qué

El simulador evalúa a empleados de cualquier perfil (marketing, sales,
soporte, ops, finanzas, legal). El acrónimo asume jerga del rol; si el
participante no la conoce, la fricción contamina la evaluación. Itera
mide criterio bajo presión, no vocabulario.

## Sustitutos por caso

| Abreviación | Reemplazar por |
|---|---|
| PII | información personal · datos personales |
| API | interfaz · endpoint · servicio |
| CRM | sistema de clientes · base de cuentas |
| KPI | métrica · indicador clave |
| MRR | ingreso mensual recurrente |
| NPS | índice de recomendación · satisfacción del cliente |
| CTA | llamado a la acción · botón principal |
| VP | vicepresidente |
| IT | sistemas · tecnología |
| SaaS | plataforma · producto de software |
| B2B | clientes empresa · venta entre empresas |
| ROI | retorno · beneficio sobre inversión |
| SLA | nivel de servicio acordado · tiempo de respuesta comprometido |
| OKR | objetivo y resultado clave |
| BU | unidad de negocio |
| FAQ | preguntas frecuentes |
| UX | experiencia de usuario |
| QA | revisión de calidad · pruebas |
| CSM | encargado de cuenta |

## Excepciones permitidas

- **Nombres propios de productos/marcas**: ChatGPT, Claude, Gemini,
  Stripe, Supabase, etc. (no son acrónimos genéricos sino nombres
  comerciales)
- **Unidades estándar**: USD, MXN, kg, km, MB, ms (universales)
- **Términos sin equivalente español natural**: log, prompt, dashboard
  (uso aceptado en habla técnica latam)

## Aplicación

- **Copy visible** (titles, bodies, descriptions, hints, errores,
  tooltips, opciones, labels): cero abreviaciones.
- **Comentarios JSDoc** y comentarios `//` en código: permitidos por
  conveniencia técnica (no son visibles al usuario).
- **Commit messages**: permitidos para términos técnicos (API, etc.)
  como referencia rápida; no son copy de producto.
- **Documentación interna** (`docs/coord/`, `docs/memory/`): permitidos.

Si encuentro acrónimos en el copy visible cuando toco un archivo,
los reemplazo en el mismo commit.

## Auditoría rápida

```bash
# Sobre archivos de copy + UI:
grep -rn "PII\|CRM\|MRR\|NPS\|KPI\|CTA\|SaaS\|ROI\|SLA\|OKR" \
  app/exercise-lab/blocks/ app/exercise-lab/ExerciseLabClient.tsx \
  app/case-template/ docs/simulador/case_factory/ \
  2>/dev/null
```

## Por qué importa

- **Equidad de evaluación**: el participante de marketing no debe perder
  por no saber "MRR"; el de soporte no debe ganar por saber "SLA".
- **Tono Itera**: directo, sin jerga corporate, claro a la primera lectura.
- **Auto-translate friendly**: español neutro sin siglas en inglés
  preserva mejor el meaning cuando se traduce a otros idiomas LATAM.

## Referencias

- Regla previa: `copy_regla_no_em_dash_y_markdown_body.md` (ban em dash + markdown body)
- Catálogo YAML: `docs/simulador/case_factory/EXERCISE_BLOCK_CATALOG.yaml`
