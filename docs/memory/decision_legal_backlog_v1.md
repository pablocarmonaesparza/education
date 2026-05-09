---
type: decision
dept: [legal]
date: 2026-05-04
tags: [legal, backlog, scope, e-residency, contratos, terminos, privacidad, ai-disclaimer, refund, indautor, impi]
---

# backlog inicial de frentes legales

Pablo dictó el 2026-05-04, desde el departamento Legal, los **9 frentes** que quiere registrar para evaluar antes de decidir por dónde arrancar. Esta nota es un *backlog*, no un plan ejecutado: el orden y el alcance se deciden en una segunda pasada (investigación + priorización).

## frentes a investigar

1. **e-residency · documentación** — proceso de e-residency (jurisdicción a confirmar; típicamente Estonia).
2. **contratos · NDA** — plantilla(s) de acuerdo de confidencialidad.
3. **contratos · compra-venta** — plantilla(s) de contrato comercial (B2B y/o usuario final).
4. **generales · términos** — términos y condiciones del producto (versión vigente en `app/terms/page.tsx`, decidir si reescribir o iterar).
5. **generales · privacidad** — política de privacidad del producto (versión vigente en `app/privacy/page.tsx`, decidir si reescribir o iterar).
6. **generales · AI disclaimer** — disclaimer de contenido generado con IA. No existe hoy.
7. **generales · refund policy** — política de reembolsos (mención existe en términos sec. 6, decidir si separar a doc propio).
8. **gobierno · INDAUTOR** — registro de derechos de autor en México (Instituto Nacional del Derecho de Autor).
9. **gobierno · IMPI** — registro de marca / propiedad industrial en México (Instituto Mexicano de la Propiedad Industrial).

## próximos pasos (sin ejecutar todavía)

- Investigar cada frente: qué implica, costo, tiempo, requisitos previos, jurisdicción aplicable.
- Decidir orden de ataque (¿por urgencia, costo, dependencia de e-residency?).
- Para los gubernamentales (INDAUTOR, IMPI), confirmar primero la estructura corporativa: ¿bajo qué entidad se registra?

## notas operativas

- **dept = `legal`** — formalizado en `scripts/lint-memory.sh` el 2026-05-04 a pedido de Pablo. Lista actual de depts válidos: `automatizacion, datos, desarrollo, educacion, finanzas, fundraising, imagenes, legal, marketing, orquestador, producto, redes-sociales, soporte, ventas`.
- Origen del backlog: dictado verbal de Pablo durante sesión del 2026-05-04.
