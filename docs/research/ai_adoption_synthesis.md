---
type: research
title: AI adoption + LATAM compliance — síntesis
task_id: B9-003
date: 2026-05-19
status: published
authors: [claude]
reviewers: [codex]
sources_primary:
  - "Stanford AI Index 2026 Report (hai.stanford.edu)"
  - "McKinsey State of AI 2025 (mckinsey.com/capabilities/quantumblack)"
  - "McKinsey Superagency 2025"
  - "BCG AI at Work 2025"
  - "MIT NANDA GenAI Divide 2025"
  - "Gallup AI Indicator 2026"
  - "Gartner B2B Buyers 2025"
sources_complementary:
  - docs/simulador/contrato_v0/producto/DIAGNOSTICO_1_CASO_V0.md §3
  - docs/research/R21_market_size_b2b_latam.md
  - docs/research/R02_distribucion_latam.md
notes_de_confianza: "Algunos datos AI Index 2026 requieren follow-up con PDF oficial; las cifras citadas son las que aparecen en contrato §3 con fuente directa. LATAM compliance se basa en conocimiento general + R02/R21; cita oficial pendiente para LFPDPPP 2025 reforma específica."
---

# AI adoption + LATAM compliance — síntesis (B9-003)

## TL;DR — qué nos dice el research

1. **Adopción organizacional masiva, criterio inmaduro.** Stanford AI Index 2026 reporta 88% de organizaciones adoptan IA; 70% usa GenAI en ≥1 función de negocio. McKinsey 2025 cifra similar. **El problema ya no es awareness — es criterio operativo.**
2. **~95% de pilotos enterprise no muestran impacto medible en P&L.** MIT NANDA GenAI Divide 2025 atribuye gap a integración/workflow, no a modelos. Esto valida la categoría de Itera: comprador necesita **señal antes de invertir en transformación**, no promesa de ROI.
3. **48% de empleados pide entrenamiento formal + 45% pide integración en workflows** (McKinsey Superagency 2025). Demanda existe; el entrenamiento actual no la cierra (BCG 2025: solo 36% satisfecho con entrenamiento IA actual).
4. **Solo ~6% son "high performers" de IA en McKinsey State of AI 2025.** Diferenciador: **procesos de validación humana + rediseño de workflows**. No saben más prompts — tienen mejor **proceso** alrededor del uso.
5. **Gallup 2026: 50% de empleados ya usan IA, 28% varias veces por semana o más.** La empresa ya tiene uso distribuido informal; le falta visibilidad y control.
6. **Gartner 2025: 61% de compradores B2B prefieren experiencia rep-free** pero buscan ayuda contextual. Valida self-serve poderoso (field-test público) + sales para contexto.

## Implicaciones directas para Itera

- **El pitch B2B no es "tu equipo no sabe IA". Es "no tienes visibilidad de cómo la usa hoy".** Cifra anchor: 50% Gallup + 88% Stanford. El comprador no descubre que su gente usa IA — descubre que NO sabe con qué criterio la usa.
- **NO vendemos ROI. Vendemos reducción de incertidumbre operativa.** MIT NANDA 95% sin impacto P&L es el dato más fuerte para justificar diagnóstico antes de transformación.
- **El gap NO es prompt-bonito. Es proceso.** McKinsey 6% high performers tienen procesos de validación, no mejor prompting. Itera mide proceso (5 dimensiones), no técnica.

## LATAM compliance — clauses por jurisdicción

Esta sección establece los disclaimers que Itera DEBE incluir en runtime/onboarding/reportes cuando procesa datos personales o tracking de jurisdicción del data subject (contrato §9 ya rastrea `jurisdiction_of_data_subject` per risk event).

### México — LFPDPPP

**Marco vigente:** Ley Federal de Protección de Datos Personales en Posesión de los Particulares (DOF 2010, reformada marzo 2025 — referencia citable pendiente). Concepto clave: **derechos ARCO** (Acceso, Rectificación, Cancelación, Oposición).

**Clauses requeridas en producto Itera (MX):**
1. Aviso de privacidad explícito antes de cualquier procesamiento (consent banner en signup).
2. Identificación del responsable (Itera / proveedor LATAM legal entity).
3. Finalidades del tratamiento (diagnóstico de criterio, reporte al manager, no marketing third-party).
4. Datos sensibles solo con consentimiento expreso por escrito o electrónico.
5. Mecanismo para ejercer derechos ARCO (email + form en /privacy).
6. Aviso de transferencia internacional (Supabase US-East-1) con basis legal.

⚠ Follow-up requerido: confirmar cifras exactas de penalidades 2025 (rango UMA × multiplicadores) + requisitos específicos para procesamiento por IA si la reforma marzo 2025 los detalla. Owner del follow-up: claude (B9-003 secuencia).

### Colombia — Ley 1581/2012

**Marco vigente:** Ley 1581 de 2012 + decretos reglamentarios. Concepto clave: **principio de habeas data**.

**Clauses requeridas:**
1. Autorización previa e informada (más estricta que LFPDPPP).
2. Política de tratamiento de datos publicada (no opcional).
3. Identificación del responsable + encargado.
4. Datos sensibles requieren consentimiento explícito separado.
5. Reporte de bases de datos al RNBD (Registro Nacional de Bases de Datos) cuando aplica.
6. Transferencias internacionales: país destino debe tener nivel adecuado de protección O contrato vinculante.

⚠ Itera debe registrar bases de datos en RNBD si maneja datos personales de >100,000 titulares CO. Para v1 (sprints de 5-50 personas) esto NO aplica todavía.

### Brasil — LGPD

**Marco vigente:** Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018) + ANPD enforcement activo.

**Clauses requeridas:**
1. Base legal específica para cada tratamiento (consentimiento, contrato, interés legítimo, etc.).
2. Designar DPO (Encarregado de Proteção de Dados) si es controller.
3. Aviso de privacidad portugués brasilero (NO español).
4. DPIA (Data Protection Impact Assessment) recomendado para procesamiento automatizado de IA.
5. Direitos do titular: acceso, corrección, eliminación, portabilidad, oposición.
6. Reporte de incidentes a ANPD dentro de 48h.

⚠ Brasil es jurisdicción más estricta del trío. Si Itera entra a BR seriamente, DPO + DPIA son non-negotiable.

### Postura recomendada Itera para v1

- **Lanzar MX + CO con clauses arriba.** Sin BR en v1 (DPO obligatorio agrega complejidad legal innecesaria pre-design-partners).
- **Geo IP detection + consent localizado** (M8 ya tenía esto en plan).
- **Encrypted Personal Data Vault** con jurisdiction tagging (campo `simulador.users.jurisdiction` ya planeado en mig 022).

## Decisiones producto

<!-- decisions:data:start -->
```yaml
decisions:
  - id: B9-003-D1
    decision: "Pitch comercial v2 ancla en 3 cifras: 88% adopción (Stanford) + 95% sin impacto P&L (MIT) + 50% empleados usan IA hoy (Gallup) — NO en 'ROI con IA'"
    rationale: "Las 3 cifras son anchor research-grade, no marketing-fluff. El comprador (Head/VP Mark/Growth/Ops) las reconoce de sus newsletters. Pitch construido en 'reducción de incertidumbre' > 'transformación'. Confirma posicionamiento contrato §2."
    change_type: copy
    files_to_touch:
      - lib/simulador/copy/landing.ts
      - lib/simulador/copy/sales.ts
      - app/(public)/page.tsx
    owner: claude
    blocked_by: []
    priority: high

  - id: B9-003-D2
    decision: "v1 launch: MX + CO. BR diferido a v2 (DPO + DPIA agregan complejidad pre-design-partners)"
    rationale: "LGPD requiere DPO obligatorio (controller). Itera v1 todavía no tiene legal entity LATAM clara. MX (LFPDPPP) y CO (Ley 1581) son manejables con clauses + flujo de derechos ARCO. BR es 18-24 meses out."
    change_type: process
    files_to_touch:
      - docs/strategy/launch_geos_v1.md
      - lib/simulador/copy/legal.ts
    owner: claude
    blocked_by: []
    priority: high

  - id: B9-003-D3
    decision: "users.jurisdiction enum: MX | CO | other (drop BR de v1). Default por geo IP en signup, editable."
    rationale: "Schema mig 022 ya planea users.jurisdiction. Restringir enum a MX/CO/other simplifica consent localization + reportes regulatorios. BR vuelve en v2 cuando agreguemos LGPD compliance full."
    change_type: schema
    files_to_touch:
      - docs/specs/migration_022_analytics_compliance.sql
      - lib/simulador/db.types.ts
    owner: claude
    blocked_by:
      - B2-003

  - id: B9-003-D4
    decision: "Aviso de privacidad MX/CO escritos en español neutro corporate. NO traducción literal — refinamiento por jurisdicción con clauses canónicas del marco aplicable"
    rationale: "LFPDPPP MX y Ley 1581 CO usan vocabulario legal distinto (derechos ARCO vs habeas data). Traducción única falla en ambos. Texto separado por jurisdicción con clauses canónicas evita disputa regulatoria + reduce fricción onboarding."
    change_type: copy
    files_to_touch:
      - lib/simulador/copy/legal.ts
      - app/privacy/page.tsx
    owner: claude
    blocked_by: []

  - id: B9-003-D5
    decision: "Audit follow-up requerido: confirmar cifras LFPDPPP reforma marzo 2025 + requisitos específicos AI processing antes de v1 launch"
    rationale: "Cita oficial pendiente. Imposible publicar privacy page sin verificar cifras exactas de multas + scope AI específico. Bloquea v1 launch en MX. Owner: claude. Recurso: gob.mx/inai + abogado LATAM si presupuesto."
    change_type: process
    files_to_touch:
      - docs/research/latam_compliance_mx_followup.md
    owner: claude
    blocked_by: []
    priority: high

  - id: B9-003-D6
    decision: "Cifra anchor 6% high performers (McKinsey) entra en marketing materials como diferenciador — 'no medimos quién sabe prompts; medimos quién tiene el proceso del 6%'"
    rationale: "McKinsey State of AI 2025 ya valida que diferenciador NO es conocimiento técnico — es proceso (validación humana + rediseño workflows). Itera mide proceso (5 dimensiones). Copy explícito en landing convierte cifra en wedge competitivo vs Section AI/Workera que venden 'AI literacy'."
    change_type: copy
    files_to_touch:
      - lib/simulador/copy/landing.ts
      - lib/simulador/copy/sales.ts
    owner: claude
    blocked_by: []
```
<!-- decisions:data:end -->

## Notas operativas

- 6 decisiones producto (B9-003-D1 a D6). Todas copy + schema + process.
- Owner exclusivamente claude — research no toca runtime.
- Blocked_by: B2-003 (mig 022 analytics+compliance).
- **Riesgo abierto:** D5 marca follow-up legal LFPDPPP MX 2025 reforma como blocker de v1 launch. Sin esto, privacy page MX no puede publicarse. Priorizar.
- AI Index 2026 PDF directo no se pudo extraer via WebFetch (gated content). Cifras citadas son las que ya están verificadas en contrato §3 con fuente directa.
