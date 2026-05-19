---
type: research
title: LATAM compliance MX — follow-up LFPDPPP 2025 reforma
task_id: B9-003-D5
date: 2026-05-19
authors: [claude, codex]
status: resolved (postura conservadora v1)
sources_verified:
  - "DOF 20/03/2025 — nueva LFPDPPP publicada, vigente 21/03/2025"
  - "KPMG MX flash 2025-04 (transferencia autoridad INAI → Secretaría Anticorrupción y Buen Gobierno)"
  - "Greenberg Traurig LATAM advisory 2025-03"
follow_up_owner: claude (cuando primer DPA enterprise o PII real)
---

# LFPDPPP MX 2025 — follow-up legal

## Status

**Resuelto para v1.** Itera v1 lanza en MX con postura conservadora (Codex acord + Claude PASS). Sin abogado LATAM contratado.

**Pendiente para post-v1:**
- Primer DPA enterprise firmado
- Primer cliente comercial procesando PII real (no datos sintéticos)
- Privacy page MX migrar a "compliance-grade"

En cualquiera de esos 3 triggers → contratar counsel LATAM (~$5-15K) + revisar `lib/simulador/copy/legal.ts.MX` + actualizar privacy_policy con review legal formal.

## Lo que sabemos (verificado contra fuentes oficiales)

### Reforma LFPDPPP 2025
- Publicada en DOF el **20 de marzo de 2025** (entrada en vigor 21 de marzo).
- Sustituye la Ley federal anterior (DOF 2010).
- **Transferencia de autoridad supervisora:** del INAI a la **Secretaría Anticorrupción y Buen Gobierno**. Cambio organizacional, no de derechos sustantivos.
- Mantiene derechos ARCO (Acceso, Rectificación, Cancelación, Oposición).

### Lo que NO cambió respecto a v0 (LFPDPPP 2010)
- Estructura general de "responsable / encargado / titular".
- Obligación de aviso de privacidad por escrito.
- Derechos ARCO con respuesta ≤20 días.
- Consentimiento expreso para datos sensibles.
- Transferencias internacionales con consentimiento o cláusulas contractuales equivalentes.

### Lo que sigue siendo gris (sin certeza absoluta — pendiente legal formal)
1. **Cifras exactas de multas 2025** — versiones anteriores oscilan entre 100-320,000 UMA. Pendiente confirmación de la versión actual del Reglamento.
2. **Scope específico para procesamiento por IA** — la reforma menciona "tratamiento automatizado" pero no detalla específicamente LLMs. Aplicable bajo principios generales.
3. **Detalles del enforcement transferido a Secretaría Anticorrupción** — el INAI cubría datos personales como autoridad técnica especializada. Secretaría tiene mandato más amplio (combate a corrupción + ética pública). Capacidad técnica para enforcement DP a la fecha es incierta.

## Postura Itera v1 (consensuada Claude + Codex)

Para v1 launch:

✅ **Hacemos:**
- Aviso de privacidad MX en `lib/simulador/copy/legal.ts.MX` con clauses canónicas (consent banner + privacy policy completa).
- Mencionamos LFPDPPP 2025 + Secretaría Anticorrupción y Buen Gobierno explícitamente.
- Implementamos derechos ARCO via privacidad@itera.la (manual response v1; automatizado v2).
- Recomendamos datos sintéticos en simulaciones (`pre_runtime_data_consent`).
- Disclaimer permanente: "NO promete cumplimiento legal automático, NO da asesoría legal."

❌ **NO hacemos en v1:**
- Privacy page MX "compliance-grade" con cifras de multas específicas y enforcement details.
- DPA enterprise templates para procurement formal.
- Asesoría legal directa o referrals a abogados específicos.
- Procesar PII real de clientes en demos (solo en sprints contratados con DPA — out of scope v1).

## Cuándo contratar counsel LATAM

Triggers para upgrade a v2 (compliance-grade):

1. **Primer DPA enterprise solicitado.** Cliente sofisticado pide Data Processing Agreement antes de firmar Sprint. Sin DPA, no firman → counsel LATAM necesario para template firmable.
2. **Primer cliente comercial con PII real.** Sprint pagado donde empleados ingresan datos personales reales (no sintéticos) en simulaciones. Aunque Itera recomienda sintético, cliente puede preferir realismo → counsel valida que es safe.
3. **Aviso de privacidad MX en producción con cifras específicas.** Cuando queremos pasar de "aviso conservador" a "aviso compliance-grade" con multas exactas + scope AI específico → counsel necesario.
4. **Auditoría externa solicitada** (cliente enterprise pide audit report) → counsel + ISO/IEC 27001 prep + privacy audit.

Cost estimado: $5-15K USD para counsel LATAM-savvy (recomendaciones de referidos: KPMG MX legal, Greenberg Traurig LATAM, Galicia Abogados, Holland & Knight LATAM).

## Lo que NO cubre este follow-up

- Otras jurisdicciones (CO Ley 1581 follow-up separado; AR/CL/BR diferidos a v2).
- DPA template detallado (responsabilidad de counsel cuando aplique).
- Audit report ISO/SOC2 (out of scope v1, considerar v2 si enterprise demand).
- Brechas/incidentes — protocolo basic en `lib/simulador/copy/legal.ts.MX.security`, formal incident response runbook diferido a v2.

## Decisiones producto (derivadas)

<!-- decisions:data:start -->
```yaml
decisions:
  - id: B9-003-D5-S1
    decision: "v1 launch MX con postura conservadora sin counsel LATAM contratado"
    rationale: "Codex postura: disclaimer conservador + datos sintéticos + no privacy compliance-grade. Claude PASS. Counsel cuando primer DPA o PII real."
    change_type: process
    files_to_touch:
      - lib/simulador/copy/legal.ts (MX section)
      - app/privacy/page.tsx
    owner: claude
    blocked_by: []
    priority: high (resolved as v1 launchable)

  - id: B9-003-D5-S2
    decision: "Triggers de upgrade a counsel LATAM: (1) primer DPA enterprise, (2) primer PII real comercial, (3) cifras de multas específicas en privacy page, (4) audit externa solicitada"
    rationale: "Sin triggers explícitos, decisión de upgrade se posterga indefinidamente. 4 triggers concretos permiten auto-detección por el equipo (sales para 1+2, claude para 3, manager para 4)."
    change_type: process
    files_to_touch:
      - docs/research/latam_compliance_mx_followup.md
    owner: claude
    blocked_by: []

  - id: B9-003-D5-S3
    decision: "Recommended counsel list maintained internamente — no público"
    rationale: "Recomendar abogados específicos en producto público crea apariencia de asesoría legal (riesgoso). Mantener referidos internos para cuando triggers se activen."
    change_type: process
    files_to_touch:
      - docs/research/latam_compliance_mx_followup.md
    owner: claude
    blocked_by: []
```
<!-- decisions:data:end -->
