# Voice Guide — Itera Simulador

> Leer esto ANTES de cualquier copy específico. Aplica a TODAS las 20 surfaces.

## Voz Itera

**Directa. Clara. En minúsculas. Sin corporate-bot.**

LATAM serio. No mexicano-only ni argentino-only ni colombiano-only. Español neutro pero LATAM, no España.

## Reglas (HIG-RULES-WRITE-01..06)

### Sí decimos
- "diagnóstico operativo de criterio en uso de IA"
- "tu equipo decide" / "tu equipo opera"
- "agendar diagnóstico"
- "continuar" / "atrás" / "hecho"
- "guardado" (no "tus cambios fueron guardados exitosamente")
- "elige una contraseña de al menos 8 caracteres" (no "contraseña inválida")
- imperativo en CTAs

### NO decimos
- ❌ "transforma tu equipo" / "desbloquea el potencial" / "revoluciona"
- ❌ "aprovecha al máximo" / "lleva tu equipo al siguiente nivel"
- ❌ "ICP", "MVP", "P0", "PMF" (jerga interna)
- ❌ "AI hype" — sin "harness AI", "AI-powered", "powered by AI"
- ❌ "oops!", "uh-oh", "ups" (interjecciones)
- ❌ "we're having trouble" → preferir "no se pudo cargar"
- ❌ "tu/su" cuando no aporta — "favoritos" no "tus favoritos"
- ❌ "click aquí" / "tap aquí" (accesibilidad screen reader)
- ❌ "curso", "lección", "módulo", "alumno", "estudiante", "certificación", "graduación" (no somos LMS)

## Capitalización

| Tipo | Estilo | Ejemplo |
|---|---|---|
| H1 / H2 / H3 | Sentence case con punto final | "Las cinco dimensiones." |
| Eyebrows (xs UPPER) | UPPERCASE | "DIAGNÓSTICO OPERATIVO" |
| Botones primarios | Sentence case | "Agendar diagnóstico" |
| Labels / captions / microcopy | lowercase | "nombre", "última actualización" |
| Footer microcopy | lowercase | "© 2026 itera" |
| Errors | Sentence case directos | "Elige una contraseña de al menos 8 caracteres" |

**Excepciones:** nombres propios (Stripe, AgentMail, Supabase), siglas (LFPDPPP, RFC, NIT, CUIT), monedas (USD).

## Tono por surface

| Surface | Tono |
|---|---|
| Landing | Directo, profesional, evidence-based ("88% usa IA, 1/3 con criterio") |
| Auth | Mínimo, sin fricción, sin pedir cosas que no necesitamos |
| Onboarding | Conversacional, value-first, defaults sensatos |
| Runtime (Camila) | Presión real de Camila CMO sin spoilers evaluativos |
| Dashboard | Ejecutivo, escaneable en 5s |
| Reporte | Narrativo (qué pasó / qué significa / qué hacer) sin juicio moral |
| Admin | Utilitario interno, sin polish customer-facing |
| Field-test | Demo público, value antes que login |
| Legal | Preciso pero LATAM-neutral, no abogado-pompous |
| Errors | Accionable (qué hacer, no qué falló) |

## Vocabulario consistente — flows multi-step

| Acción | Palabra única | NO usar |
|---|---|---|
| Iniciar flow | "Empezar" | "Iniciar", "Comenzar" |
| Avanzar step | "Continuar" | "Siguiente", "Next" |
| Volver | "Atrás" | "Volver", "Regresar" |
| Confirmar | "Hecho" | "Listo", "OK" |
| Cancelar | "Cancelar" | "Salir", "Abortar" |
| Eliminar | "Eliminar" | "Borrar", "Quitar" |
| Guardar | "Guardar" | "Save", "Almacenar" |
| Compartir | "Compartir…" (con ellipsis si abre modal) | "Share", "Enviar" |
| Descargar | "Descargar" | "Download", "Bajar" |

## Errores accionables

Patrón: **explicar QUÉ hacer, no QUÉ falló.**

| ❌ Mal | ✅ Bien |
|---|---|
| "Email inválido" | "Usa el formato nombre@empresa.com" |
| "Contraseña inválida" | "Elige una contraseña de al menos 8 caracteres" |
| "Algo salió mal" | "No se pudo guardar. Recarga e intenta de nuevo" |
| "Error 500" | "Servicio no disponible. Intenta en unos minutos" |
| "Campo requerido" | "Falta el nombre del equipo" |
| "Network error" | "Sin conexión. Verifica internet y reintenta" |

## Empty states con CTA

Patrón: **estado + por qué + acción siguiente.**

| Surface | Empty state copy |
|---|---|
| Dashboard sin team | "Tu equipo aún no empieza. Cuando alguien complete su caso, verás resultados aquí." + botón "Reenviar invitaciones" |
| Admin queue vacía | "No hay reportes en review. Cuando un risk event high requiera validación humana, aparecerá aquí." |
| Admin leads vacíos | "Aún no hay leads del field-test. Cuando alguien complete el demo público y deje email, aparecerá aquí." |
| Onboarding invite vacío | "Aún no agregaste emails. Pega los emails de las 5-50 personas que correrán el caso." |
| Runtime case sin steps | "Caso no disponible. Revisa la invitación o contacta a hola@itera.la." |

## Disclaimers core (siempre presentes donde aplica)

- "Diagnóstico operativo de criterio en uso de IA. No es certificación. No es assessment psicométrico."
- "Reporte generado por judge LLM (Anthropic Opus 4.5) con review humano de staff Itera para risk events high."
- "Casos usan datos sintéticos. No procesamos PII real de tus clientes."

— claude · 2026-05-20 · voice guide v1.0
