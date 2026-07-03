# Materiales de venta — Itera v1 (F6)

Copy listo para usar. Español neutro LATAM, tono premium/serio, per-seat. El pricing
vive en `lib/simulador/billing.ts` — si cambia, actualizar aquí también.

---

## 1. One-pager

**Itera — mide el criterio de tu equipo para usar IA, antes de que un error lo mida por ti.**

La mayoría de los equipos ya usa IA en flujos reales. Nadie sabe quién tiene el criterio
para hacerlo bien: qué datos expone, cuándo escala, cuándo NO confía en el output. Itera lo
mide con un caso de trabajo real, no con un quiz.

**Cómo funciona**
1. Cada persona entra a un caso de campo de ~15 minutos: una situación real de su rol, con
   datos, presión y decisiones de IA.
2. Un evaluador mide 6 dimensiones de criterio: contexto, datos, ejecución con IA,
   validación, juicio e impacto. En banda Alto / Medio / Bajo, con evidencia citada.
3. El manager recibe un reporte por persona + una matriz del equipo: quién puede pilotar
   solo, quién necesita práctica, quién debe pausar el uso de IA en flujos sensibles.

**Qué recibe el manager**
- Reporte ejecutivo por persona con la recomendación operativa (pilotar / entrenar / pausar).
- Risk events con evidencia: exposición de datos, claims sin verificar, exceso de autonomía.
- Práctica dirigida que se desbloquea según los gaps reales de cada quien.

**Qué NO es**
- No es un curso ni un LMS. No hay videos ni certificados.
- No mide conocimiento declarativo. Mide criterio bajo presión.

**Precio** — por asiento, desde $109 USD/persona/mes (baja por volumen). Mensual o anual
(2 meses gratis al año). USD vía Stripe. Cancelas cuando quieras.

**Para** — Heads de Marketing, Growth, Operaciones y RevOps en empresas de 20-300 personas
en México y Colombia que ya metieron IA a sus flujos.

**CTA** — Agenda una demo de 15 minutos: [itera.la](https://itera.la)

---

## 2. Guion de demo (15 minutos)

**Minuto 0-2 · El problema.** "¿Cuántas personas de tu equipo usan IA en su trabajo hoy?
¿Cuántas sabes con certeza que lo hacen bien? Esa brecha es lo que Itera mide."

**Minuto 2-7 · El caso vivo.** Abrir `/case-demo` en vivo. Jugar 3-4 slides de un caso real
(el de datos sucios de marketing). Mostrar cómo el participante decide qué datos exponer,
cómo instruye a la IA, cómo revisa el output. "Esto no es un quiz. Es su trabajo real."

**Minuto 7-11 · El reporte.** Abrir un reporte de ejemplo (usar uno real de los casos
jugados). Mostrar: banda por dimensión con evidencia citada, los risk events (ej. "expuso
teléfono de cliente al modelo en el step 4"), y la recomendación operativa. "El manager no
adivina. Ve exactamente dónde está el criterio y dónde el riesgo."

**Minuto 11-14 · La matriz del equipo.** Abrir `/staff/matriz`. "Con 20 personas, esto te
dice a quién le das autonomía y a quién acompañas. Es una decisión de management, con datos."

**Minuto 14-15 · Cierre.** "Es por asiento, desde $109 al mes. Puedes empezar con tu equipo
core esta semana. ¿Lo probamos con 5 personas?"

---

## 3. Secuencia de email (3 toques)

Desde el dominio itera.la (ya calentado). Asuntos cortos, sin hype.

**Toque 1 — apertura**
> Asunto: el criterio de IA de tu equipo, medido
>
> Hola {nombre},
>
> Tu equipo ya usa IA en su trabajo. La pregunta cara es quién tiene el criterio para
> hacerlo bien — qué datos expone, cuándo escala, cuándo no confía en el output.
>
> Itera lo mide con un caso de trabajo real de 15 minutos y te da un reporte por persona:
> quién puede pilotar solo, quién necesita práctica, quién debe pausar el uso de IA en
> flujos sensibles.
>
> ¿Te muestro cómo se ve en 15 minutos esta semana?
>
> {firma}

**Toque 2 — a los 3 días, si no responde**
> Asunto: re: el criterio de IA de tu equipo
>
> {nombre}, un dato concreto: en las pruebas, el error más común no es técnico. Es de
> criterio — gente competente que expone datos de clientes al modelo sin darse cuenta, o
> que acepta cifras inventadas sin verificar.
>
> Eso no se arregla con un curso. Se detecta midiéndolo. Te dejo 15 minutos aquí: {link}.

**Toque 3 — a los 5 días, cierre**
> Asunto: cierro el loop
>
> {nombre}, cierro este hilo por ahora. Si en algún momento quieres ver quién de tu equipo
> tiene el criterio para usar IA bien —y quién no— aquí estamos: itera.la.
>
> Un caso real, 15 minutos por persona, reporte accionable para ti. {firma}

---

## 4. Estado del pipeline de captación

Ya construido (`captacion/`, stack gratis verificado): DENUE/SECOP → DuckDB → qualify con
Claude. Interfaz en `/admin/captacion`. **Pendiente de Pablo:** token gratis de DENUE
(INEGI) para correr la ingestión de México; luego el módulo de contacto (permutar email +
verificar con Reoon). Con eso sale la lista priorizada de ~50 prospectos MX/CO. El eslabón
débil sigue siendo el email de la persona (ver memoria de captación).
