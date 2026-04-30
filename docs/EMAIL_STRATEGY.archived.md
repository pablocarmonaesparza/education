# [ARCHIVADO] Estrategia de email para Itera — research + plan de implementación

> ⚠️ **ESTE DOCUMENTO ESTÁ ARCHIVADO. NO ES FUENTE DE VERDAD.**
>
> El 2026-04-23 Pablo descartó engagement/lifecycle. Itera es B2B empresa-first y
> no vende por correo. Ver [`docs/EMAIL_TRANSACTIONAL.md`](./EMAIL_TRANSACTIONAL.md)
> para el scope vigente (5 correos transaccionales) y
> [`docs/memory/decision_mailing_transaccional_only.md`](./memory/decision_mailing_transaccional_only.md)
> para el razonamiento.
>
> Este archivo se conserva **solo como referencia histórica** — útil si Itera
> algún día pivota a B2C consumer con volumen. Si eso pasa, rehacer desde cero,
> no reusar templates/frecuencias de aquí.
>
> ---
>
> **Contenido original abajo (no actualizado):**
>
> Documento de handoff para el agente de mailing. Sintetiza la estrategia de Duolingo y competencia relevante (Khan Academy, Coursera, Platzi, Crehana, herramientas de productividad AI), traduce los principios al contexto Itera, y deja templates iniciales accionables.
>
> **Antes de tocar este doc o construir secuencias, lee:**
> - [`docs/CONTEXT.md`](./CONTEXT.md) — qué es Itera, audiencia, tesis
> - [`docs/METODOLOGIA.md`](./METODOLOGIA.md) — contrato pedagógico (tono, lenguaje, escenarios)
>
> **Versión:** 1 — research inicial post-pivote 10×100. Última actualización: 2026-04-22.

---

## 1. Contexto Itera relevante para mailing

| Variable | Valor | Implicación para email |
|---|---|---|
| Audiencia | LATAM no-técnico, adulto | Español neutro, sin jerga, ejemplos evergreen |
| Tesis | Retención + ejecución, no información | Email NO es para "aprende esto"; es para "ejecuta esto en las próximas 24h" |
| Formato | 10 slides interactivas/lección | Email puede empujar a "una lección hoy" sin sentirse abrumador |
| Pricing | $19/mes consumer · B2B abierto | Win-back debe ser sutil con promociones; el producto se vende solo si retención sube |
| Roster | 30 nombres LATAM + `{user_first_name}` | Personalización ya es cultura del producto, debe heredarla el email |
| Tono | Minúsculas, lenguaje adulto, sin jerga, sin "trucos" | Subject lines también en minúsculas, sin clickbait |
| Moneda | USD siempre | Nunca convertir a moneda local en copy |

**Restricciones heredadas del contrato pedagógico** que aplican a email:
- Títulos/subjects en minúsculas, excepto nombres propios.
- Escenarios evergreen (no médicos, financieros íntimos, ni personales).
- Cero abreviaciones técnicas (`API`, `LLM`, `MCP`) sin introducirlas.
- No usar palabras infantiles ("trucos", "hacks", "secretos").

---

## 2. Lo que hace Duolingo — deep dive

Fuente: research a `bettermarketing.pub`, `lennysnewsletter.com` (2 artículos de Jorge Mazal, ex-VP Growth), `firstround.com`, `uxdesign.cc`, `blog.duolingo.com/growth-model-duolingo`, `research.duolingo.com`.

### 2.1 El modelo de crecimiento (los 7 estados de usuario)

Duolingo segmenta a TODO usuario en 7 estados mutuamente excluyentes. Cada estado tiene su propia secuencia de email/push, su propia frecuencia y su propia psicología:

| Estado | Definición | Estrategia de email |
|---|---|---|
| **New** | Día 1 de uso ever | Onboarding: friction-free, valor antes que pedir email/notificación |
| **Current** | Activo hoy y en últimos 7 días | Weekly progress report, celebración de milestones, social proof |
| **Reactivated** | Volvió tras 7-29 días away | Welcome back personalizado, re-onboarding suave |
| **Resurrected** | Volvió tras 30+ días away | "Set new goal" — tratar como casi-nuevo, no asumir contexto previo |
| **At-risk WAU** | Activo últimos 7 días pero NO hoy | Reminder diario por 7 días seguidos (peak de efectividad) |
| **At-risk MAU** | Activo último mes pero NO esta semana | Reactivación con narrativa de progreso perdido |
| **Dormant** | Inactivo 30+ días | Mensaje mensual o menos, conserva canal sin spamear |

**Insight clave:** la frecuencia escala **inversamente** con el engagement. Los users de mayor engagement reciben MÁS email; los dormant reciben menos. La intuición opuesta (perseguir al ausente con más volumen) destruye el canal.

### 2.2 Resultados que vale la pena copiar

- CURR (Current User Retention Rate) subió 21% en 4 años → DAU x4.5
- Share de DAU con streak ≥7 días pasó de ~17% a >50%
- Sub-canal de email: 20%+ DAU lift solo por **delayed sign-up** (dejar al user probar antes de pedir email)

### 2.3 Onboarding (estado New → Current)

**Pieza 1 — friction zero antes del email.** Duolingo deja al user hacer la primera lección **sin pedir cuenta**. Solo después pide email. Resultado: +20% sign-ups, +20% DAU.

**Pieza 2 — primer email a los ~10 minutos del primer open.** No es welcome corporativo. Es un reminder corto del valor con tono Duo (humor + emoji). Subject típico: con emoji + algo personal de la elección de idioma del user.

**Pieza 3 — daily goal commitment.** El user elige cuántos minutos al día va a practicar (5/10/15/30). Este compromiso explícito se referencia en TODOS los emails posteriores ("te comprometiste a 15 min hoy"). Es la pieza psicológica más cara del onboarding.

**Pieza 4 — push permission framing.** El permiso de notificaciones se pide como **servicio al user** ("te avisamos cuando estés en peligro de perder tu meta"), no como herramienta de marketing.

### 2.4 Retención (estado Current)

**Pieza estrella: weekly progress report.** Es el email más abierto de Duolingo. Muestra:
- Lecciones de la semana
- Tiempo total invertido
- Streak actual
- Vocabulario nuevo aprendido
- Comparativa con tu propia semana pasada (no con otros users — eso baja autoestima)
- Posición en league (si aplica)

Subject típico: `📝 tu reporte semanal` (emoji + posesivo + minúsculas).

**Frecuencia:** 2-3 emails/semana max para users de alto engagement, 1/semana para promedio. Cap rígido.

**Psicología principal:** crear "progress narrative" — el user ve la **historia** de su mejora, no solo un número. Esto genera inversión emocional en mantener la racha.

### 2.5 Win-back (estados At-risk → Reactivated)

**Insight crítico:** la ventana óptima de reactivación es **3-4 días**. Después se vuelve exponencialmente más difícil. Duolingo manda **7 mensajes en 7 días** seguidos cuando un user cae a At-risk WAU.

**Timing exacto:** los emails de win-back se mandan **23.5 horas después del último open**, no a horario fijo. Lógica: "si abriste a esa hora ayer, probablemente sea buena hora para ti hoy". Esto requiere stack de event tracking decente.

**Tono:** "guilt marketing" suave. El búho aparece triste. Mensajes tipo "duo está triste" o "no dejes que duo se preocupe". Funciona porque es ridículo y consciente de sí mismo, no manipulativo.

**Reactivación social (mejor performer de todas):** en vez de que la app mande el reminder, la app le pide a un **amigo activo** que invite al inactivo. "[María] te invita a regresar". CTR muy superior a mensajes corporativos.

**Post-reactivación matters:** cuando el user vuelve, NO lo metas a la home normal. Métele un flujo dedicado que reconozca la ausencia, le pregunte si su meta cambió, y rebootee el contrato pedagógico. Duolingo le llama "the reactivation experience" — un sleeping owl visual, check-in, re-set de meta.

### 2.6 Frequency cap y "the golden goose"

Lección de Groupon que Duolingo internalizó: cada A/B test individual decía "mandá más emails", pero el efecto cumulativo destruía el canal (unsubscribe rate, deliverability). Duolingo impone **caps cross-channel** (email + push + in-app sumados), no por canal independiente. Algunos experimentos positivos individualmente NO se launchan porque rompen el cap global.

**Regla práctica para Itera:** trackear "mensajes totales por user por semana" como métrica de salud, no solo open rate por email.

### 2.7 Personalización por idioma

Mensajes que funcionan para learners de chino NO funcionan para learners de inglés. Duolingo testea por idioma de aprendizaje, no por idioma de UI. **Implicación para Itera:** posiblemente testear por **vertical de uso del user** (founder, marketer, developer, freelancer) cuando la ruta personalizada esté lista.

---

## 3. Otros competidores — qué hacen y qué tomar

### 3.1 Khan Academy

**Estrategia core:** streak reminders + parent emails (no aplica a Itera) + weekly progress.

**Streak reminder window:** lunes 12am a domingo 11:59pm pacific. Streaks semanales, no diarias. **Diferencia vs Duolingo importante:** Khan optimiza por consistencia semanal, no por presencia diaria. Más realista para audiencia adulta.

**Lección para Itera:** considerar **streak semanal** en vez de diaria. Usuario adulto LATAM no-técnico no va a abrir todos los días, pero sí puede comprometerse a 3 sesiones por semana. Una racha semanal es más sostenible y menos punitiva.

### 3.2 Coursera, Platzi, Crehana

**Coursera:** secuencia ligera. Welcome → recordatorios "1-2 horas/semana sugerido" → notificación de cert disponible al completar. Bajísima frecuencia. Más cercano a SaaS que a habit app. Funciona porque su audiencia es "estudiar para certificación específica", no "construir hábito".

**Platzi:** monitoreo activo de progreso, recordatorios con **fechas límite sugeridas por unidad**. Más agresivo que Coursera. Cobra $49/mes, tiene incentivo a empujar. Subject típico: "no dejes tu carrera de UX a medias".

**Crehana:** confirmaciones de avance por módulo, certificados pagados como upsell. Modelo "cert-as-monetization" similar al DET de Duolingo.

**Lección para Itera:**
- Plataformas grandes de cursos NO compiten en email lifecycle, compiten en catálogo. No copies su estrategia (es débil) — copia su modelo de cert (que es el move estratégico real, ya cubierto en sesión anterior).
- Platzi en particular: el modelo de "fecha sugerida por unidad" puede funcionar para Itera si el user eligió ruta completa (100 lecciones a 3 lecciones/semana = 33 semanas).

### 3.3 Herramientas de productividad AI (Notion, ChatGPT, Claude)

No tienen estrategia comparable. Su email lifecycle es transaccional + product updates. No hay habit loop porque su producto NO depende de uso diario.

**Lección para Itera:** NO te inspires aquí para retención. Sí para **product update emails** (cuando salga un model nuevo y haya que regenerar lecciones, anunciarlo).

---

## 4. Principios psicológicos aplicables a Itera

Estos son universales, vale extraerlos del análisis Duolingo:

| Principio | Cómo lo usa Duolingo | Cómo lo usa Itera |
|---|---|---|
| **Loss aversion** (Kahneman) | "perderás tu racha de 30 días" | "perderás tu progreso en la sección de fundamentos" |
| **Pre-commitment** | Daily goal explícito al onboarding | Pedir al user que declare un objetivo de ejecución ("voy a automatizar mi correo") al sign-up. Referenciar en TODOS los emails. |
| **Habit formation temporal** | Email a la hora típica del user | Para Itera: testear si user es matutino/vespertino y mandar a esa hora |
| **Social proof** | Leagues + leaderboard | NO copies de Duolingo. Itera no es competitivo. Posible: "X usuarios completaron esta lección esta semana" sin ranking individual. |
| **Intrinsic motivation** | De-énfasis en rewards externos | Itera ya alineado: METODOLOGIA penaliza "trucos" y lenguaje infantil. Mantener. |
| **Self-reference effect** (d≈0.5) | `{user_first_name}` en mensajes | Itera ya lo usa en slides — extender a subject lines y body. |
| **Hypercorrection** | NO usado por Duolingo | **Ventaja única de Itera.** Subject line del weekly report puede usar pregunta-trampa: "¿sabes qué hace que un prompt falle? respuesta dentro." |

**El principio que NO debes copiar de Duolingo: gamificación pura.**

Duolingo conscientemente sacrificó outcome real por engagement (la gente no termina hablando idiomas). El **Principio Final** del [METODOLOGIA.md](./METODOLOGIA.md) prohíbe esto explícitamente. Itera no puede vivir de "mi user abrió la app 30 días seguidos sin aprender nada". Tiene que ser "mi user automatizó algo real".

**Implicación:** los emails de Itera no celebran solo apertura. Celebran **ejecución reportada**. El weekly report debe preguntar "¿qué automatizaste esta semana?" no solo "¿cuántas lecciones abriste?".

---

## 5. Recomendaciones específicas para el agente de mailing

### 5.1 Stack de segmentación a implementar (espejo de Duolingo, ajustado)

```
new           → primer día de uso
current       → activo hoy, racha semanal viva
reactivated   → volvió tras 7-29 días
resurrected   → volvió tras 30+ días
at_risk_week  → activo últimos 7 días pero no esta semana en curso
at_risk_month → activo último mes pero no las últimas 2 semanas
dormant       → inactivo 30+ días
```

Cada estado vive en `user_progress` (ya existe en migrations 003). Falta agregar columna `lifecycle_state` calculada y trigger que la actualice.

### 5.2 Frecuencia recomendada (cap cross-channel)

| Estado | Email/semana | Push/semana | Total max |
|---|---|---|---|
| new | 3 (días 1, 3, 7) | 2 | 5 |
| current alta engagement | 2 | 3 | 5 |
| current baja engagement | 1 | 1 | 2 |
| at_risk_week | 1 + 3 reactivación | 4 | 8 |
| at_risk_month | 1 reactivación + 1 contenido | 1 | 3 |
| reactivated | 2 (re-onboarding) | 1 | 3 |
| resurrected | 1 (set new goal) | 0 | 1 |
| dormant | 0.25 (1/mes) | 0 | 0.25 |

**Cap absoluto cross-channel: 8 mensajes/semana.** Si lo rompes, suspende campañas no-críticas.

### 5.3 Templates iniciales — secuencia mínima viable

Lo que el agente debe construir primero (en este orden):

#### A. Onboarding (estado new — 3 emails)

**Email 1: bienvenida (T+10min después del primer open)**
- Subject: `bienvenido a itera, {first_name} 👋`
- Body: corto. Una sola frase de valor. CTA: "abre tu primera lección". NO pidas tarjeta. NO listes features.

**Email 2: tu compromiso (T+24h)**
- Subject: `define tu meta de la semana`
- Body: pídele que elija cuántas lecciones por semana (3/5/7). Esa elección se guarda y se referencia siempre.

**Email 3: primera ejecución real (T+72h)**
- Subject: `¿qué vas a automatizar esta semana?`
- Body: la lección 1 ya le dio herramientas para hacer algo concreto. Pídele que reporte (con un click "lo hice" / "todavía no") qué aplicó. Esto activa el Principio Final.

#### B. Weekly progress report (estado current — 1 email/semana, viernes)

**Subject:** `tu semana en itera 📝` o variante con pregunta-trampa de la semana
**Body:**
- Lecciones completadas
- Conceptos nuevos aprendidos (lista corta)
- "¿qué aplicaste esta semana?" — call out a self-report
- Próxima lección sugerida (1 sola, no abrumar)
- NO comparativa con otros users. Sí comparativa con tu propia semana pasada.

#### C. Win-back at-risk (estado at_risk_week — 3 emails en 5 días)

**Email 1 (T+24h sin actividad):** subject suave, recordatorio del compromiso. `tu meta de esta semana sigue ahí`
**Email 2 (T+72h):** narrativa de progreso perdido. `llevas 3 días sin avanzar — la sección de fundamentos te está esperando`
**Email 3 (T+5d):** última oportunidad antes de switch a at_risk_month. `¿necesitas ayuda? responde este correo y te leo`

Timing: usar 23.5h después del último open registrado, no horario fijo.

#### D. Resurrection (estado resurrected — 1 email)

Subject: `bienvenido de vuelta. ¿qué quieres construir ahora?`
Body: re-onboarding. NO asumas que recuerda nada. Le pides que defina nueva meta. Si tenía ruta personalizada, ofrécele regenerarla porque "AI cambió desde la última vez que viniste" (verdad, además).

### 5.4 Subject lines — heurísticas

- Siempre minúsculas (excepto nombres propios).
- Emoji opcional al final, NUNCA al inicio (rompe alineación visual en cliente de email).
- Personalización con `{first_name}` siempre que sea natural, nunca forzado.
- Pregunta-trampa permitida (hypercorrection es ventaja diferencial). Ejemplo: `¿por qué chatgpt se inventa números?`
- Largo: 30-50 caracteres óptimo (mobile preview).
- Prohibido: clickbait ("no vas a creer"), all caps, urgencia falsa ("ÚLTIMA OPORTUNIDAD"), trucos ("el secreto de…").

### 5.5 Preview text (preheader)

Tan importante como el subject. Reglas:
- 80-100 caracteres.
- Complementa el subject, no lo repite.
- Si el subject es pregunta, el preheader puede ser "respuesta dentro 👇" o similar.

### 5.6 LATAM tactical specifics

| Variable | Valor recomendado | Fuente |
|---|---|---|
| Mejor día | Martes y jueves | Mailchimp + Doppler LATAM |
| Mejor hora | 9-10am hora local del user, o 3-4pm | Doppler, MOL |
| Zona horaria | Mandar por TZ del user, no batch global | — |
| Frecuencia segura | 1-2/semana baseline | Multiple sources |
| Open rate edtech LATAM | 18-25% benchmark | Doppler |
| CTR esperado | 2-4% | Industry standard |

**Nota cultural:** evitar "¡!" excesivo en español; suena a spam. Un solo signo final basta.

---

## 6. KPIs para el agente de mailing

### Por email
- Open rate (target: ≥25%, edtech LATAM benchmark)
- CTR (target: ≥3%)
- Click-to-open rate (target: ≥12%)
- Unsubscribe rate (alarma si >0.5% por envío)
- Spam complaint rate (alarma si >0.1%)

### Por secuencia
- Onboarding completion rate (subscribers que abren los 3 emails de welcome)
- Reactivation success rate (% de at-risk que vuelven a current dentro de 7 días post-email)
- Time to first lesson completion (T+sign-up → T+lección 1 completada)

### Salud del canal
- Total mensajes/user/semana (cap: 8)
- Email frequency cap violations (target: 0)
- Channel deliverability score (Postmark/SendGrid metric)
- Lifecycle state distribution snapshot semanal

### Métrica norte (Itera-específica)
- **% de users que reportan ejecución real en weekly report.** Esto es el equivalente al CURR de Duolingo, pero alineado al Principio Final. Si sube, el producto funciona. Si baja, ni Duo te salva.

---

## 7. Lo que el agente de mailing NO debe hacer

1. **No copiar la cara triste del búho.** Ese tono específico es propiedad cultural de Duolingo. Itera necesita su propia voz — adulta, directa, sin mascotas.
2. **No introducir gamificación competitiva.** No hay leagues, no hay ranking público, no hay "estás en posición #5". El user adulto LATAM no-técnico no compite por puntos.
3. **No usar urgencia falsa o scarcity sintética.** "Solo hoy", "expira en 2 horas", contadores → fuera. Itera vende ejecución, no FOMO.
4. **No mandar emails sobre features que el user no usó todavía.** Empuja a una sola siguiente acción, no listes 5 cosas nuevas.
5. **No usar dark patterns en unsubscribe.** Un click, no formulario.
6. **No referenciar otras lecciones cross-curso en el email.** Igual que las lecciones son autocontenidas (regla 14 de METODOLOGIA), los emails también deben serlo. Excepción: weekly report.
7. **No traducir USD a moneda local.** Confunde y se desactualiza.
8. **No usar "tú" inconsistente con "usted".** Itera = "tú" siempre.

---

## 8. Stack técnico sugerido (a confirmar con Pablo)

- **ESP candidato:** Postmark (transaccional impecable) o Resend (más nuevo, mejor DX). Para marketing/lifecycle: Customer.io, Loops, o Resend Audiences.
- **Event tracking:** PostHog ya pensado en stack? Si sí, integra con ESP via webhook.
- **Personalización temporal:** requiere store de "last app open per user" en `user_progress` o similar. Ya existe la columna en migration 003.
- **Frequency cap:** se implementa en código, no en ESP. Función `canSendMessage(userId, channel)` que checa cap cross-canal antes de despachar.
- **A/B testing:** mínimo subject lines. Ideal: framework completo (Customer.io o Loops lo dan).

---

## 9. Roadmap de implementación sugerido

| Fase | Qué construir | Prerequisito |
|---|---|---|
| **F1 (semana 1-2)** | Onboarding 3-email + transactional (welcome, password reset, payment receipt) | ESP elegido + DKIM/SPF setup |
| **F2 (semana 3)** | Weekly progress report + lifecycle state computation | Calcular `lifecycle_state` en DB |
| **F3 (semana 4-5)** | Win-back secuencia at_risk_week | Event tracking de `last_app_open` |
| **F4 (semana 6+)** | Resurrection + dormant manejo + A/B testing infrastructure | F2-F3 estables |
| **F5 (cuando haya volumen)** | Personalización por vertical, send time optimization, social reactivation | ≥1000 users activos para tests significativos |

---

## 10. Backlog específico (no implementar aún)

- Send time personalization basado en historial individual (Duolingo lo hace, requiere ML básico).
- Social reactivation (user activo invita a inactivo). Requiere primero tener feature de social/refer-a-friend en el producto.
- Predictive churn model que detecte at-risk antes de que se vuelva at-risk. Requiere data + ML.
- AI-generated email body (LLM por user). Innecesario hasta que `{user_first_name}` + segmentación básica saturen.
- Email summary del progreso de un alumno hacia su instructor/empresa (B2B). Activar cuando B2B esté definido.
- Itera Cert email flow (cuando se lance la certificación discutida en CONTEXT.md).

---

## 11. Fuentes consultadas

Duolingo:
- https://www.lennysnewsletter.com/p/how-duolingo-reignited-user-growth (Jorge Mazal, ex-VP Growth)
- https://www.lennysnewsletter.com/p/the-secret-to-duolingos-growth
- https://blog.duolingo.com/growth-model-duolingo/
- https://review.firstround.com/the-tenets-of-a-b-testing-from-duolingos-master-growth-hacker/
- https://uxdesign.cc/duolingos-6-step-reactivation-experience-9ad65f04a569
- https://reallygoodemails.com/emails/your-weekly-progress-report-duolingo
- https://research.duolingo.com/papers/yancey.kdd20.pdf

Khan Academy:
- https://blog.khanacademy.org/keeping-your-streak-alive-insights-tips-from-the-last-6-months/
- https://trophy.so/blog/khan-academy-gamification-case-study

LATAM email benchmarks:
- https://fromdoppler.com/blog/email-marketing-enviar-horario/
- https://mol-latam.com/e-mail-marketing-cual-es-la-mejor-hora-para-el-envio/
- https://mailchimp.com/es/resources/insights-from-mailchimps-send-time-optimization-system/

Edtech competitors LATAM:
- https://freed.tools/blogs/ux-cx/cursos-de-ux
- https://findskill.ai/es/courses/

---

**Versión 1 — research inicial.** Próxima iteración esperada después de F1 con datos reales de open rate y CTR.
