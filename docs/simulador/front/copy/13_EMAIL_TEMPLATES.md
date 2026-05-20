# Email templates copy — AgentMail transactional

> Audiencia: customers + employees + admin staff Itera.
> Stack: AgentMail (configurado en `lib/email/`). Templates en React Email format probable.

## Reglas globales emails

- **Subject:** ≤50 chars, lowercase except nombres propios + siglas
- **Preheader:** ≤90 chars, complemento del subject
- **Body:** lowercase headings, Sentence case CTAs
- **CTA primary:** 1 botón principal centered
- **Footer:** legal disclaimer + unsubscribe link + dirección física Itera
- **Personalization:** `{firstName}` siempre que sea posible

## Anti-patterns email

- ❌ Multiple CTAs primarios competiendo
- ❌ Subject con "🎉 ¡Felicidades!" o emojis decorativos
- ❌ All-caps en subject ("URGENT")
- ❌ "Hi there" / "Estimado/a usuario" — usar `{firstName}` o saludo neutro
- ❌ Tracking pixels invisibles (Itera no rastrea aperturas para producto)
- ❌ Imágenes pesadas (≤200KB total)
- ❌ Externally hosted fonts (Gmail/Outlook bloquean)

---

## 1. Invitación a empleado (email del manager al equipo)

**Subject:** {orgName} te invitó a un sprint en Itera Simulador

**Preheader:** Diagnóstico de criterio operativo en uso de IA · ~18 min

**Body:**

```
Hola {firstName},

{buyerName} de {orgName} te invitó a participar en un sprint diagnóstico de Itera Simulador.

Vas a correr un caso vivo de ~18 minutos donde mides cómo decides cuando usas IA en flujos reales. No es certificación. No es examen. Es un diagnóstico operativo de criterio.

Al final, recibes un reporte ejecutivo con tu banda + recomendaciones específicas. Tu manager ve la versión de equipo. Tus respuestas individuales son confidenciales entre Itera y tú.

[Empezar el caso →]

Si tienes preguntas, escríbenos a soporte@itera.la.

— Equipo Itera
```

**CTA:** Empezar el caso (link a `/auth/invitation/[token]`)

---

## 2. Reporte listo (al empleado + al manager)

### Subject empleado: Tu reporte de Itera está listo

**Preheader:** Diagnóstico operativo + recomendación + plan 7 días

```
Hola {firstName},

Tu reporte del caso "{caseName}" está publicado.

Tu banda general: {bandLabel}
Recomendación: {recommendation}

Lo importante no es la banda — es el plan de acciones concretas para los próximos 7 días.

[Ver mi reporte →]

— Equipo Itera
```

**CTA:** Ver mi reporte (link a `/report/{session_id}`)

### Subject manager: Reporte de {employeeName} listo · {sprintName}

**Preheader:** Banda {bandLabel} · {recommendationCount} en banda alta · {riskCount} eventos altos

```
Hola {firstName},

{employeeName} completó el caso "{caseName}" del sprint {sprintName}.

Resumen ejecutivo:
- Banda general: {bandLabel}
- Recomendación dominante: {recommendation}
- Risk events: {riskCount} (de los cuales {highCount} altos)

El reporte completo + plan 7 días está en el dashboard manager.

[Ver dashboard →]

— Equipo Itera
```

**CTA:** Ver dashboard (link a `/dashboard`)

---

## 3. Reporte en revisión humana (al empleado + al manager)

### Subject empleado: Tu sesión está en revisión

**Preheader:** Detectamos algo que requiere validación humana · 24h max

```
Hola {firstName},

Tu sesión del caso "{caseName}" está completa, pero la mandamos a revisión humana.

Esto pasa cuando nuestro judge LLM identifica algo que requiere ojo humano de nuestro equipo antes de publicar el reporte. No es buena ni mala señal — solo significa que vale la pena validarlo.

Te avisamos cuando esté listo (24h max).

— Equipo Itera
```

### Subject manager: Sesión de {employeeName} en revisión humana

```
Hola {firstName},

La sesión de {employeeName} del sprint {sprintName} entró a revisión humana por nuestro equipo. Esto típicamente toma 24h.

Cuando esté publicada, recibirás el reporte automáticamente.

— Equipo Itera
```

---

## 4. Recibo de pago (al buyer)

**Subject:** Recibo · {planName} · {orgName}

**Preheader:** ${amount} USD · {sprintName} · factura fiscal disponible respondiendo

```
Hola {firstName},

Recibimos tu pago de ${amount} USD por el {planName} del sprint {sprintName}.

Resumen:
- Plan: {planName}
- Personas (seats): {seats}
- Periodo: {periodStart} → {periodEnd}
- Recibo Stripe: {stripeReceiptUrl}

Para factura fiscal MX (CFDI 4.0) / CO (DIAN) / AR (AFIP) / CL (SII) / PE (SUNAT):
Responde a este email con tu RFC/NIT/CUIT/RUT/RUC + razón social + dirección. Te emitimos en 1-2 días hábiles.

[Ver recibo Stripe →]

— Equipo Itera
```

---

## 5. Welcome al manager (después de signup + checkout)

**Subject:** Bienvenido a Itera, {firstName}

**Preheader:** Tu sprint empieza cuando invitas a tu equipo · 5 minutos máximo

```
Hola {firstName},

Bienvenido a Itera Simulador. Tu sprint diagnóstico está activo.

Próximos 3 pasos (5 min total):

1. Invita a tu equipo (5-50 personas) → recibirán email para empezar el caso
2. Tu equipo corre el caso vivo (~18 min cada persona)
3. Reportes aparecen en tu dashboard en 24-48h por persona

[Ir a mi dashboard →]

¿Algo no avanza? Escríbenos a hola@itera.la.

— Equipo Itera
```

---

## 6. Email follow-up field-test lead (con email capturado)

**Subject:** Tu mini-reporte de Itera · ¿lo corres con tu equipo?

**Preheader:** Banda {bandLabel} en el demo · reporte completo + plan 7d para 5-50 personas

```
Hola {firstName},

Completaste el demo público de Itera Simulador. Aquí está tu mini-reporte:

- Banda general: {bandLabel}
- Tu sesión nos sirve para mejorar el simulador (anonimizada)

Si quieres que tu equipo lo corra completo:
- 5-50 personas
- Reporte ejecutivo por persona + agregado del equipo
- Plan 7 días accionable
- Judge LLM + review humano

Desde $4,000 USD por sprint de 30 días.

[Agendar diagnóstico →]
[Hablar con ventas →]

— Equipo Itera

P.D.: Tu sesión + email quedan registrados 90 días. Si no agendas diagnóstico en ese tiempo, los borramos automáticamente.
```

---

## 7. Re-envío invitación (cuando employee no aceptó)

**Subject:** Recordatorio: invitación de {orgName} sigue activa

**Preheader:** Tu caso te espera · ~18 min · sin password

```
Hola {firstName},

Hace {N} días, {buyerName} te invitó a un sprint diagnóstico de Itera Simulador. Tu invitación sigue activa.

El caso toma ~18 minutos. Sin password, sin descargar nada, sin friction.

[Empezar el caso →]

Si la invitación llegó por error o no quieres participar, dile a {buyerName} directamente — no nos respondas a nosotros.

— Equipo Itera
```

---

## 8. Sprint completado (al manager · summary post-sprint)

**Subject:** Sprint {sprintName} completado · {completedCount}/{totalCount} personas

**Preheader:** Reporte agregado disponible · plan colectivo + drill-down individual

```
Hola {firstName},

El sprint {sprintName} terminó.

Resumen ejecutivo del equipo:
- {completedCount} de {totalCount} personas completaron
- Banda promedio: {avgBand}
- Recomendación dominante: {dominantRecommendation}
- Risk events altos: {highRiskCount}

[Ver reporte agregado →]

¿Quieres una sesión de debrief con nuestro equipo? Responde a este email.

— Equipo Itera
```

---

## 9. Risk event high requiere review humana (al staff Itera)

**Subject:** [Itera Admin] Risk event high en sesión {sessionId}

**Preheader:** Org {orgName} · participant {employeeName} · severity HIGH

```
Risk event high detectado:

- Session: {sessionId}
- Org: {orgName}
- Team: {teamName}
- Participant: {employeeName}
- Submitted: {submittedAt}

Risk event:
- Tipo: {riskEventType}
- Severity: high
- Step: {stepOrdinal}
- Evidence (anonimizado): "{evidenceTextRedacted}"

Recomendación preliminar del judge: {preliminaryRecommendation}

[Abrir en review queue →]

SLA: 24h max para publicar o rechazar.
```

(Sin "Equipo Itera" footer — es interno)

---

## 10. Cancelación de suscripción (al buyer)

**Subject:** Tu suscripción de Itera se canceló · acceso hasta {periodEnd}

```
Hola {firstName},

Confirmamos la cancelación de tu suscripción de Itera Simulador.

- Plan cancelado: {planName}
- Acceso activo hasta: {periodEnd}
- Después de esa fecha, los miembros de tu equipo pierden acceso al dashboard y reportes

Los reportes ya publicados quedan accesibles para descarga PDF hasta {periodEnd}. Te recomendamos exportarlos antes.

¿Por qué cancelaste? Si nos dices, mejoramos. Responde a este email cuando puedas.

— Equipo Itera
```

---

## Email footer global (todos los emails)

```
---
Itera · Diagnóstico operativo de criterio en uso de IA
Web: https://itera.la
Soporte: soporte@itera.la
Privacy: https://itera.la/privacy
Terms: https://itera.la/terms

[Cancelar suscripción a emails transaccionales] — para emails marketing/follow-up
(NO incluir unsubscribe en emails crítico-funcionales como recibos, reportes listos, invitaciones)

Itera Simulador · {orgFiscalAddress}
```

---

## Plan 7 días templates por banda

(usados en `/report` + email "reporte listo")

### Banda A · Pilotar

**Heading:** Próximos 7 días: ampliar scope

```
01. Identifica 1 flujo donde IA tiene rol limitado actualmente y diseña expansión.
02. Documenta tu workflow con IA — para mentorear a otros del equipo.
03. (Opcional) Comparte criterio: 1 deck/loom de 5 min para el equipo sobre cómo decides.
```

### Banda M · Entrenar

**Heading:** Próximos 7 días: práctica específica

```
01. Workshop 1h en {weakestDimension}: validación / juicio / privacidad (lo que aplique).
02. Re-corre 2 mini-casos del simulador (variantes B y C) para reforzar criterio.
03. Mentoría 30min con alguien de banda A del equipo (si hay).
04. Lectura: Anthropic prompt engineering guide — sección "system prompts y context".
05. (Opcional) Setup de checklist personal pre-decisión con IA: "validé fuente, evalué confidence, escalé si dudé".
```

### Banda B · Pausar

**Heading:** Próximos 7 días: remediación

```
01. Pausa uso de IA en flujos con datos sensibles (PII de clientes, info confidencial) hasta cerrar gaps.
02. Workshop 2h con asesoría externa: validación de datasets + identificación de PII + escalamiento.
03. Re-corre el caso del sprint (variante B) en 5 días para medir progreso.
04. Re-evaluación post-remediación: reporte de seguimiento al día 7.
05. Si el reporte de seguimiento sigue en banda B → considerar pausar uso de IA en flujos críticos por 30 días + asesoría continua.
```

### Banda Escalar (caso de excepción)

**Heading:** Te contactamos para hablar

```
01. Tu reporte tiene patrones que requieren conversación 1:1 con staff Itera.
02. Te contactaremos en las próximas 48h vía {buyerEmail}.
03. Mientras tanto, no se requiere acción de tu lado.
```

---

— claude · 2026-05-20 · email templates copy v1.0
