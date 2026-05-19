---
type: strategy
title: Launch geos v1 — MX + CO; BR/AR/CL/other diferidos
task_id: B9-003-D2
date: 2026-05-19
authors: [claude]
reviewers: [codex]
status: active
applies_to:
  - lib/simulador/copy/legal.ts
  - lib/simulador/copy/landing.ts
  - supabase/migrations (jurisdiction enum)
  - app/(onboarding)/onboarding/org/page.tsx (geo selector)
---

# Launch geos v1 — México + Colombia

## TL;DR

**v1 (2026):** lanzamiento en **MX + CO**. Aviso de privacidad escrito por jurisdicción (LFPDPPP + Ley 1581). Field-test público accesible global; signup comercial sólo para MX/CO en v1.

**v2 (2027 H1):** expand a **AR + CL + BR**.
- AR (Ley 25.326): similar a CO, factible con clauses adicionales (~1 semana de legal review).
- CL (Ley 19.628 + reforma 2024): factible con clauses adicionales.
- BR (LGPD): requiere DPO + DPIA. Counsel brasileño contratado antes de procesar PII real.

**v3 (2027 H2):** other (US/EU si surgen demands específicas — GDPR/CCPA requieren counsel separado).

## Por qué MX + CO en v1

### Mercado
- **MX:** ~130M habitantes, GDP $1.4T (2025). Top mid-market SaaS B2B densidad LATAM. Mexico Business reporta 55% de empresas mexicanas cita "skills gap" como barrera #1 para adoptar IA. Itera fit directo.
- **CO:** ~52M habitantes, GDP $400B. Hub de talento tech LATAM en crecimiento (Medellín/Bogotá). Mercado IT B2B ~$5B+ (2025), creciendo 12% YoY. Itera ICP (100-300 ppl SaaS B2B) densidad alta.
- Juntos = **~60% del SOM mid-market LATAM Spanish** según R21 market sizing.

### Compliance manejable
- LFPDPPP MX (reforma marzo 2025): derechos ARCO + autoridad Secretaría Anticorrupción y Buen Gobierno. Disclaimers + clauses canónicas en `lib/simulador/copy/legal.ts`. Sin DPO obligatorio.
- Ley 1581 CO (2012): habeas data + autoridad SIC + RNBD si >100K titulares (no aplica Itera v1). Disclaimers + clauses canónicas escritas.
- **Ambas factibles sin counsel LATAM contratado** para v1 con postura conservadora (B9-003-D5 + Codex acord): NO compliance-grade hasta primer DPA enterprise.

### Distribución
- Outreach LATAM via LinkedIn (Head/VP Mark/Growth/Ops MX+CO).
- Partnerships con consultoras LATAM (Endeavor red, comunidades founders MX/CO).
- Eventos: Endeavor Outliers, Latitud, La Comunidad.
- Self-serve field-test público accesible global → captura leads → discovery call cualifica.

## Por qué BR/AR/CL/other diferidos

### BR (LGPD)
- DPO obligatorio si Itera es controller de datos
- DPIA recomendado para procesamiento automatizado de IA
- Aviso de privacidade portugués brasileño (NO español, NO traducción literal)
- Sanciones ANPD activas (hasta 2% revenue o R$50M)
- Mercado grande pero **costo regulatorio v1 ≫ valor v1**
- **v2:** counsel brasileño contratado (~$5-15K legal cost) + DPO designation + DPIA template + portugués brasileño copy

### AR (Ley 25.326)
- Similar a CO en estructura legal
- Pequeña diferencia: registro en Dirección Nacional de Protección de Datos Personales
- **v2:** agregar clauses específicas a `lib/simulador/copy/legal.ts.AR` (~3-5 días claude work)

### CL (Ley 19.628 + reforma 2024)
- Reforma 2024 alineó CL con GDPR-equivalente
- Requirements similares a CO pero más estrictos en accountability
- **v2:** clauses específicas + verificar accountability requirements

### Other (US/EU si surgen demands)
- **EU GDPR:** counsel EU + DPO + Article 28 DPA template + Schrems II compliance review. Es enorme.
- **US CCPA:** California state-level, manageable pero ROI bajo para Itera (sin presencia US).
- **Postura:** no proactivo a US/EU; reactivo si llega demand explícita y vale el lift legal.

## Pricing por geo

No hay surcharge por geo en v1. USD único vía Stripe. Conversión a MXN/COP la maneja Stripe + el banco del comprador.

## Implementación

### Schema
- `simulador.users.jurisdiction` enum: `MX | CO | other` para v1 (B9-003-D3 implementado en mig 022).
- BR explícito NO en enum v1 (forza error si alguien intenta registrarse desde BR — error message redirige a v2 waitlist).

### Onboarding
- `/onboarding/org` muestra geo selector con MX/CO/other.
- Si selector = other, default a marco MX más restrictivo + warning "configuración no optimizada para tu jurisdicción".
- Detección geo IP auto-suggest (no force).

### Field-test público
- Accesible global (sin geo gate)
- Lead capture acepta cualquier email
- Sales triage cualifica geo en discovery call

## Decisiones producto (derivadas)

<!-- decisions:data:start -->
```yaml
decisions:
  - id: B9-003-D2-S1
    decision: "BR signup explicit reject con waitlist redirect: 'Itera v1 no disponible en BR — registra interés en v2'"
    rationale: "Mejor decir explícito 'no' que aceptar signup que luego se rompe en LGPD compliance. Waitlist evita perder lead, da signal de demand BR."
    change_type: copy
    files_to_touch:
      - lib/simulador/copy/legal.ts (BR section)
      - app/auth/signup/page.tsx (geo gate)
    owner: codex
    blocked_by: []

  - id: B9-003-D2-S2
    decision: "Field-test público SIN geo gate; sólo el signup comercial geo-restricted"
    rationale: "Field-test sirve como acquisition wedge global. Si un BR llega via Twitter/LinkedIn, completa el caso, deja email — vamos al waitlist v2. Sin perder lead."
    change_type: process
    files_to_touch:
      - app/field-test/marketing-urgent-campaign-pii/page.tsx
    owner: codex
    blocked_by: []
```
<!-- decisions:data:end -->
