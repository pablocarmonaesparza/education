---
type: metodologia
title: orquestación itera — 12 conversaciones paralelas + orquestador
date: 2026-04-22
tags: [metodologia, orquestacion, conversaciones, coordinacion]
dept: [orq]
---

Pablo trabaja Itera con **12 conversaciones de Claude paralelas**, una por dominio funcional. Hay una 13a conversación (`Itera: Orquestrador`) cuyo único trabajo es coordinar cruces entre las otras 12.

**Conversaciones activas (abril 2026):**

| Conversación | Dominio |
|---|---|
| Itera: Backend | API routes, Stripe webhooks, rate limiting, schema, TS errors |
| Itera: Components | Design tokens, Typography, CLAUDE.md sync, `components/ui/` |
| Itera: Dashboard | UI dashboard, bugs móviles, a11y, `user_stats` UI |
| Itera: Education | Metodología, lecciones, slides, funnel analytics, TSLW |
| Itera: Finance | Stripe, payments table, customer portal, pricing |
| Itera: Gamification | `user_stats`, XP, racha, badges, level-up animations |
| Itera: Illustrations | Recraft, preset `itera-flat-v1`, biblioteca arquetipos |
| Itera: Landing | `app/page.tsx`, hero, pricing section, FAQ, copy de landing |
| Itera: Mailing | AgentMail, templates React Email, transaccionales |
| Itera: Onboarding | `/success` → `/courseCreation` flow, generate-course |
| Itera: Research | Perplexity research, pricing B2B, competidores, analytics |
| Itera: WhatsApp (Telegram) | Bot Telegram, demo edge function `tg-demo` |
| Itera: Wish List | Backlog priorizado, aclaraciones abiertas, orden de ataque |
| Itera: Orquestrador | Coordina las 12, identifica cruces y dependencias |

**Flujo de orquestación (validado 2026-04-22):**

1. Pablo pregunta a cada conversación "qué pendientes tienes".
2. Pablo pasa las 12 respuestas al Orquestador en un solo mensaje.
3. Orquestador mapea: conflictos directos, dependencias, duplicación, gaps, prioridad por impacto.
4. Orquestador devuelve por conversación un bloque copy-paste-ready: **sigue / coordina con / espera / evita / necesita decisión de Pablo**.
5. Pablo copy-pastea cada bloque a su conversación correspondiente.

**Regla obligatoria antes de orquestar: leer `docs/memory/INDEX.md` + todas las memorias relevantes.** El 2026-04-22 se omitió este paso y hubo 3 errores grandes:
- Se propuso roadmap de emails de engagement cuando Pablo ya los había descartado (ver `decision_mailing_scope_transaccional_only.md`).
- Se marcó `❤️ ∞` como decisión pendiente cuando ya estaba resuelta (ver `decision_gamification_duolingo_b2b.md`).
- Se dijo que faltaba hook de welcome cuando ya existía (ver `gotcha_welcome_email_hook_signup_existe.md`).

Las memorias son la fuente de verdad cross-sesión. Sin leerlas primero, la orquestación es basura con barniz.

**Por qué:** Pablo quiere que las 12 conversaciones avancen en paralelo sin pisarse. Cada una tiene contexto profundo de su dominio pero cero visibilidad de las otras. El Orquestador es el único punto donde se ve el sistema completo. Literal de Pablo pinchando la primera entrega: *"puedo hacer todas estas tareas y no se van a cruzar? Está super hiper mega claro?"* — la duda destapó que el Orquestador no había leído memoria.

**Cuándo aplicar:**
- Al iniciar sesión como `Itera: Orquestrador`: leer `docs/memory/INDEX.md` + todas las memorias listadas antes de procesar cualquier reporte. Sin excepciones.
- Al recibir una tanda de reportes: mapear los 5 ejes (conflictos, dependencias, duplicación, gaps, prioridad) antes de escribir respuestas.
- Si una conversación reporta trabajo que contradice una memoria, **gana la memoria** (a menos que Pablo explícitamente la actualice en la misma sesión).
- Entregar respuestas como bloques autónomos — Pablo no debe tener que editarlos, solo copy-paste.
- Al final de la ronda: guardar decisiones y cruces recurrentes con `/itera-memory-save` para que la siguiente ronda arranque con contexto.

---

## Regla crítica: paralelismo real, no handoffs secuenciales

**El objetivo de las 12 conversaciones es que trabajen colateralmente sin pisarse, no en cadena.** Pablo NO quiere ser router manual tipo n8n esperando que A termine para pasárselo a B.

**Feedback literal de Pablo (2026-04-23):** *"hiciste muchas cosas que primero tenían que pasar en una gente para que después se desbloqueara en otro, y este no era el objetivo. El objetivo era que pudieran hacer todas las cosas colateralmente. Ahora tengo que estar como N8N."*

**Errores específicos que cometí y NO debo repetir:**
- Fases encadenadas (Fase 0 → Fase 1 → Fase 2) con dependencias explícitas entre conversaciones.
- "Coordina con X, espera a Y" como bloque estándar — obliga a Pablo a supervisar handoffs.
- "Dueño exclusivo de archivo X" forzando a otros a esperar commits.
- "Backend publica pattern, los demás lo consumen" — bloqueo implícito.
- "Education crea `lib/analytics/` base, Gamification extiende" — otro handoff.
- "Commitea tu working tree antes de que el siguiente pueda arrancar" — orden forzado.

**Regla correcta al entregar bloques por conversación:**
1. **Cada conversación recibe trabajo 100% ejecutable HOY sin input de ninguna otra.** Si hay conflicto potencial de archivo, ofrecer ruta alternativa (ej. "si el módulo compartido no existe aún, crea el tuyo local, reconciliamos después").
2. **Duplicación temporal > deadlock de coordinación.** Un refactor posterior de 30 min es más barato que un día donde 3 conversaciones esperan a una.
3. **No hay "espera a que X commitee".** Cada quien commitea su dominio cuando quiera; los merges no-destructivos se reconcilian con rebase o con un refactor mínimo al final del día.
4. **No hay bloque "coordina con X"** a menos que sea cero-overhead (un heads-up en chat, no un handshake que bloquea).
5. **Decisiones Pablo**: separar en (a) las que SÍ bloquean — <5 decisiones máximo — y (b) las que son "si dices Y, yo ajusto después, pero puedo arrancar ahora con default Z".
6. **Forma del output por conversación**: `sigue` (ejecutable ya, sin asteriscos) + `decisión Pablo que ajustarías después si cambia` (no bloqueante). Eliminar `espera / coordina con` salvo que sea literalmente imposible.

**Test mental antes de entregar**: *"¿Puede esta conversación trabajar 8h seguidas sin mandar un solo mensaje a otra conversación ni a Pablo?"* Si la respuesta es no, rediseñar el bloque. Si no hay manera de hacer que sea sí, el trabajo NO debe incluirse hoy — queda en backlog hasta que se pueda paralelizar.

**Excepción única**: decisiones de producto que Pablo ya pidió tomar (≤5). Eso es un bloque Pablo al inicio del día, no un handoff en cadena. Y nunca debería ser requisito para que 10 conversaciones arranquen — si la decisión de Pablo bloquea >2 conversaciones, es signal de que el plan está mal descompuesto.
