---
type: research
title: Dispute resolution playbook — customer disputes / refunds / escalations
date: 2026-05-19
author: claude
reviewers: [pablo, codex, legal-counsel-LATAM-cuando-aplique]
status: published-draft
scope: playbook operativo para Pablo cuando customer dispute charge, pide refund extra-policy, o escala issue. NO es asesoría legal — es framework de respuesta consistente alineado con brand voice y refund policy declarada
related:
  - lib/simulador/copy/billing.ts (refund 7d policy + states)
  - docs/research/legal_dpa_template_v1.md
  - docs/research/brand_guidelines_v1.md (voz Pablo)
---

# Dispute resolution playbook

## TL;DR + disclaimer

**Claude NO es lawyer.** Este playbook es framework de respuesta consistent + decision tree para Pablo. Decisiones legales finales (chargeback dispute, threats, escalation a autoridad) requieren counsel local (los recommended en `legal_dpa_template_v1.md`).

**Filosofía Itera:** disputes y refunds se manejan con honestidad + flexibilidad razonable. Refund policy declarada (`billing.ts.refund`) es 7 días post-cargo si actividad cero. Más allá de eso, crédito > refund. Pero hay edge cases donde refund extra-policy es la decisión correcta.

## Categorías de disputes

### Categoría 1: Refund request dentro de policy

**Criterio:** request ≤7 días post-cargo Y nadie del equipo ha empezado el caso vivo.

**Acción:** refund full sin friction.

**Response template:**

```
Hola [name],

Confirmo refund de USD [amount]. Stripe procesa el reverse en 5-10 
días business. Lo verás en tu estado de cuenta cuando aparezca.

Si quieres compartir por qué no funcionó el fit, me ayuda mejorar 
Itera para futuros customers. Sin presión — solo si tienes 2 min.

Pablo
```

**Stripe action:** refund full via Stripe Dashboard (no requires customer contact).

**Time to resolve:** <2 horas business hours.

### Categoría 2: Refund request fuera de policy (post-actividad)

**Criterio:** request >7 días post-cargo O al menos 1 participante empezó el caso.

**Default response:** crédito para próximo sprint, NO refund cash.

**Response template:**

```
Hola [name],

Veo que ya tu equipo arrancó el diagnóstico ([N] participantes 
completaron). Nuestra política es 7 días refund si actividad cero, 
después de eso convertimos a crédito.

Te ofrezco: USD [amount] de crédito para Sprint o Track cuando 
quieras. Sin expiración. Si decides no usarlo, no problem — pero 
queda disponible.

¿Te funciona ese approach? O cuéntame qué pasó y vemos.

Pablo
```

**Exception:** si el issue es claramente Itera bug (caso vivo crash repetido, judge LLM falla sistemática), refund FULL extra-policy es la decisión correcta. Document en HANDOFF.md por qué.

### Categoría 3: Chargeback initiated (Stripe dispute)

**Criterio:** customer disputed via su bank/credit card, Stripe notifies Pablo.

**Severidad:** ALTA — chargebacks dañan Stripe account standing si win rate <70%.

**Default action:** intentar resolver con customer antes de fight el dispute.

**Step 1 (≤24h):** Pablo email customer directly:

```
Hola [name],

Recibí notification de chargeback de USD [amount] vía Stripe. Quiero 
entender qué pasó antes de que el banco resuelva.

¿Podemos hablar 10 min esta semana? Mi calendly: [link]

O escribe directo qué pasó y vemos cómo resolvemos sin chargeback 
(que ralentiza ambos lados).

Pablo
```

**Step 2 (24-48h):** si customer no responde:
- Si cargo legítimo + cero actividad: drop dispute, accept chargeback (no pelear)
- Si cargo legítimo + actividad real (caso completado, reporte generado): contest con evidencia

**Step 3 contest:** submit evidence vía Stripe:
- Invoice + payment confirmation
- Email logs de invitaciones enviadas
- Activity logs de participantes (sessions, responses)
- Reports generated
- Communications con customer pre-charge (sales call notes si applicable)

**Win rate target:** ≥70% (Stripe industry benchmark B2B).

**Si win rate <70% over 30 días:** escalate to counsel + review onboarding/refund policy.

### Categoría 4: Product complaint sin refund request

**Criterio:** customer reporta issue con producto (bug, UX, expectations mismatch) sin pedir dinero atrás.

**Acción:** acknowledge + investigate + fix.

**Response template:**

```
Hola [name],

Gracias por reportar [issue]. Lo estoy mirando ahora.

[Si bug verificable]: ya identifiqué el problema, fix llega en [X] horas/días.
[Si UX issue]: voy a entender mejor el contexto — ¿me cuentas con detalle 
cuándo lo notas?
[Si expectation mismatch]: lamento si la comunicación inicial no fue clara. 
Vamos a aclarar.

Te aviso en cuanto resuelva.

Pablo
```

**Document:** entry en HANDOFF.md con bug priority (P0/P1/P2) + customer impact.

**Codex involvement:** if P0/P1 bug, codex priority fix.

### Categoría 5: Quality dispute ("el reporte está mal")

**Criterio:** manager piensa que las bandas o risk events del reporte son incorrectas.

**Severidad:** CRÍTICA para credibilidad del producto.

**Acción:** investigate + offer hybrid review humano.

**Response template:**

```
Hola [name],

Entiendo que el reporte de [participant] no coincide con lo que esperabas.

Antes de cuestionar la banda, queremos investigar:

1. ¿Hay un participante específico cuyo reporte ves desconectado?
2. ¿Es la banda en una dimensión específica o el reporte agregado?
3. ¿Tienes contexto interno que el caso vivo no captura?

Mientras tanto: te ofrezco hybrid review humano gratuito de ese 
reporte. El equipo de Itera (Pablo + Codex) revisa el transcript 
completo + override matrix manual + responde con análisis adicional. 
Toma ~3-5 días business.

[link a form para solicitar review]

Si después del review las bandas se confirman, podemos hablar de 
qué te parece desconectado y refinamos rúbrica futura. Si las 
bandas cambian, ajustamos el reporte oficialmente.

Pablo
```

**Por qué hybrid review gratuito:**
- Defensibilidad del producto requiere accountability (M9-3-D28)
- Costo de review (~2-3 horas Pablo + codex) << costo de churned customer + reputation damage
- Genera signal de drift en rúbrica/judge para refinement futuro

**Document:** review en `simulador.human_review_queue` + entry en HANDOFF.md.

### Categoría 6: Legal threat o escalation a autoridad

**Criterio:** customer (o their counsel) escala el issue:
- Threat de demanda
- Reporte a PROFECO (MX), SIC (CO), CDC Argentina, etc.
- Threat de bad public review (LinkedIn, G2, Capterra) que puede dañar reputation
- Threats que mencionen GDPR/LFPDPPP/Ley 1581 compliance violation

**Severidad:** ALTA-CRÍTICA.

**Acción immediate (Pablo solo):** STOP responding sin counsel. Email holding response:

```
Hola [name],

Recibí tu comunicación. Quiero asegurarme de responder con el 
detalle necesario, así que esto me toma 48 horas para review interno.

Te respondo formalmente para [date].

Pablo
```

**Step 1 (≤24h):** contratar counsel local (los del DPA template).

**Step 2 (24-72h):** counsel review + craft formal response.

**Step 3:** counsel-supervised resolution.

**NUNCA:**
- Admit fault publicly (LinkedIn, Twitter, public review) sin counsel
- Promise actions ("vamos a refund + cancel contract") sin counsel sign-off
- Respond emotional ("estoy ofendido por tu amenaza")
- Ignore the threat (escala más rápido)

**Document:** entry detalladaen HANDOFF.md + email trail preserved.

### Categoría 7: NPS detractor con specific complaint

**Criterio:** Survey NPS +90d (M9-3-D41) retorna 0-6 score con razón detallada (P2 en survey).

**Severidad:** MEDIA (no es dispute pero needs response).

**Acción:** personal outreach para understanding.

**Response template:**

```
Hola [name],

Vi tu respuesta del survey NPS — tu calificación + razón me 
ayudaron a entender que [issue específico].

Quiero entender mejor antes de iterar el producto. ¿Tienes 15 
minutos esta semana para una llamada? Sin agenda comercial — 
quiero escuchar.

Mi calendly: [link]

Si prefieres responder por email, también funciona. Solo dime 
qué te resonó como red flag.

Pablo
```

**Outcomes posibles:**
1. Customer da feedback útil → iterate producto + thank
2. Customer da feedback emotional sin specifics → ack + don't push
3. Customer pide refund tarde (>30d post-sprint) → manejar via Categoría 2
4. Customer no responde → drop con thanks email final

## Decision tree

```
Customer message recibido
        ↓
¿Es refund request?
   ├─ Sí → ¿Dentro de 7 días + 0 actividad?
   │       ├─ Sí → Categoría 1 (refund full)
   │       └─ No → Categoría 2 (crédito default, refund si Itera bug)
   │
   ↓
¿Es Stripe chargeback notification?
   ├─ Sí → Categoría 3 (intentar resolver pre-fight)
   │
   ↓
¿Es product complaint?
   ├─ Sí → ¿Es quality dispute del reporte?
   │       ├─ Sí → Categoría 5 (hybrid review humano gratuito)
   │       └─ No → Categoría 4 (acknowledge + investigate + fix)
   │
   ↓
¿Hay legal threat o autoridad escalation?
   ├─ Sí → Categoría 6 (STOP + counsel + holding response)
   │
   ↓
¿Es NPS detractor feedback?
   ├─ Sí → Categoría 7 (personal outreach para understanding)
   │
   ↓
¿Es generic message (consulta, info)?
   └─ Sí → respond como inbound sales lead normal
```

## Métricas a trackear

| Métrica | Target verde v1 |
|---|---|
| Refund rate (cash refunds / total contracts) | ≤5% |
| Chargeback rate (charged back / total Stripe charges) | ≤1% |
| Chargeback win rate (won disputes / total chargebacks) | ≥70% |
| Quality dispute rate (reports questioned / total reports) | ≤10% |
| Quality dispute resolution rate (resolved without churn) | ≥80% |
| Legal threats per quarter | 0 ideally |
| NPS detractor follow-up response rate | ≥40% |

**Si CUALQUIER métrica fuera de target:** retrospect causa raíz + adjust onboarding/copy/expectations.

## Pre-positioned templates (paste-ready)

Los 7 response templates above son ready-to-use. Copy-paste + customize [variables]:

- `[name]` → first name customer
- `[amount]` → USD amount in question
- `[issue]` → specific issue descrito
- `[participant]` → nombre del participante específico (si quality dispute)
- `[link]` → URLs específicos (Calendly, form, Stripe dashboard)

## Anti-patterns en dispute resolution

### ❌ Anti-pattern 1: argumentar policy strict-by-the-book

Si customer está frustrated + cargo $4-8K + Itera bug genuino, refund extra-policy es la decisión correcta. Defending policy strictly daña relationship + LTV more than $4-8K vale.

### ❌ Anti-pattern 2: emotional response a complaint

Pablo conversational pero NO defensivo. "Lamento que [issue]" > "tu critica es injusta porque..."

### ❌ Anti-pattern 3: silence ante chargeback

Stripe interpreta non-response como "you don't have evidence". Even si vas a accept chargeback, respond Stripe with brief explanation.

### ❌ Anti-pattern 4: promesas sin sign-off codex

Si Pablo promete "fix llega mañana" sin checking codex bandwidth, customer expectation mismatch. Pablo confirma con codex antes de commit timelines.

### ❌ Anti-pattern 5: refund extra-policy sin documentation

Si Pablo refund extra-policy 10 times sin entrar a HANDOFF.md, no hay paper trail para identify patterns. Cada extra-policy refund document → "por qué" → permite identify recurring issues.

### ❌ Anti-pattern 6: handle legal threat solo

Pablo no es lawyer. Legal threats require counsel. Pablo's job es STOP + holding response + escalate, NO craft legal defense.

## Refund flow operacional

### Cash refund flow (Categoría 1):

1. Pablo receives request via email
2. Verify policy fit (≤7d + 0 actividad) en Stripe + simulador.simulation_sessions
3. Stripe Dashboard → Refund full
4. Email customer con confirmation template
5. Document en HANDOFF.md (customer name + amount + reason)

**Time:** ~30 min Pablo work.

### Crédito flow (Categoría 2):

1. Pablo receives request
2. Verify policy NOT fit
3. Offer crédito via email template
4. If accepted: log crédito en simulador.organization_credits table (codex Fase 1 v2)
5. If rejected: explore Categoría 5 (quality dispute) or just acknowledge

**Time:** ~45 min Pablo work + back-and-forth.

### Chargeback flow (Categoría 3):

1. Stripe notification arrives
2. Pablo emails customer ≤24h
3. If resolved: customer drops dispute via their bank
4. If contest: Pablo gathers evidence ≤48h + submits via Stripe
5. Wait Stripe arbitration (~30 días)
6. If win: chargeback reversed
7. If lose: accept + improve onboarding for future

**Time:** ~3-5 horas Pablo work distributed over 30 días.

### Quality dispute / hybrid review (Categoría 5):

1. Customer submits form
2. Codex pulls transcript + judge output + risk events from DB
3. Pablo + codex review human (~2-3 horas)
4. Codex updates report if needed (corrections) OR confirms bands
5. Pablo emails customer with conclusion + reasoning
6. Document en simulador.human_review_queue + HANDOFF.md

**Time:** ~3-5 horas Pablo + codex collaborative.

## Decisiones derivadas

<!-- decisions:data:start -->
```yaml
decisions:
  - id: M9-3-D76
    decision: "Refund extra-policy ES la decisión correcta si: (a) Itera bug genuino impacta customer experience, (b) ≤7d post-cargo y actividad mínima (<3 sessions), (c) cargo administrative error de Pablo (wrong tier seat count). En esos cases, refund full > defend policy"
    rationale: "Defending policy strict daña relationship + LTV more than $4-8K vale. Honesty + flexibility en edge cases construye trust + word-of-mouth. M9-3-D14 buyer perfil rechaza vendor defensive."
    change_type: refund_policy
    files_to_touch:
      - docs/research/dispute_resolution_playbook.md
      - lib/simulador/copy/billing.ts (refund section ya alineada)
    owner: pablo
    blocked_by: []
    priority: normal

  - id: M9-3-D77
    decision: "Hybrid review humano GRATIS cuando customer pide quality dispute del reporte. ~3-5 horas Pablo + codex effort, ofrecemos directly sin friction. Defensibilidad del producto requires accountability"
    rationale: "Quality dispute es CRÍTICO para credibilidad. Costo de review (~3-5 horas trabajo) << costo de customer churned + reputation damage (especially si público). M9-3-D28 defensibilidad del judge requires offering recourse mechanism."
    change_type: customer_support
    files_to_touch:
      - docs/research/dispute_resolution_playbook.md
      - app/(app)/admin/review/ (codex ya existe quality review UI)
    owner: pablo + codex
    blocked_by: []
    priority: normal

  - id: M9-3-D78
    decision: "Legal threats: STOP + holding response 48h + contratar counsel local antes de respond formalmente. Pablo NUNCA admit fault, promise actions, o respond emotional sin counsel sign-off"
    rationale: "Pablo no es lawyer. Legal threats escala fast si mishandled. Counsel local cost ($3-8K USD per DPA template) es marginal vs damages potencial si bad-handle. M9-3-D57 sub-processors + DPA infrastructure exists para enable counsel rapid response."
    change_type: legal_protocol
    files_to_touch:
      - docs/research/dispute_resolution_playbook.md
      - docs/research/legal_dpa_template_v1.md (cross-ref counsel list)
    owner: pablo
    blocked_by: []
    priority: high

  - id: M9-3-D79
    decision: "Métricas dispute trackear v1: refund rate ≤5% / chargeback rate ≤1% / chargeback win rate ≥70% / quality dispute rate ≤10% / NPS detractor follow-up ≥40%. Cualquiera fuera de target → retrospect causa raíz"
    rationale: "Sin targets explícitos, dispute volume crece silent. Métricas alineadas con industry benchmarks B2B SaaS mid-market (ChartMogul + Stripe data 2024). Trigger retrospect explícito previene normalizar problemas."
    change_type: observability
    files_to_touch:
      - docs/research/dispute_resolution_playbook.md
    owner: pablo + claude (audit trimestral)
    blocked_by: []
    priority: normal
```
<!-- decisions:data:end -->

## Próximos pasos

1. **Pre-launch:** playbook ready. Pablo NO necesita action a menos dispute llegue.
2. **Customer-zero scenario:** primer dispute (de cualquier categoría) Pablo follow playbook + document en HANDOFF.md.
3. **F1 v2 post-customer-zero:** review métricas dispute → adjust onboarding/copy si patterns emerge.
4. **Q3 audit:** trimestral review de dispute trends + métricas targets.
