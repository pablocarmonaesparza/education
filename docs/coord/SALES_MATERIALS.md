# Sales materials — Itera v1 (US market)

Copy listo para usar, en inglés de EEUU. Vocabulario y voz: `docs/simulador/front/copy/00_EN_GLOSSARY.md`.
El pricing vive en `lib/simulador/billing.ts` — si cambia, actualizar aquí también.

**Pivot 2026-07-15**: este doc reemplaza la versión LATAM (MX/CO), que vive en git history.
Cambió más que el idioma — ver §5 (la trampa del precio) y §6 (compliance como ángulo de venta).

---

## 1. One-pager

**Itera — measure your team's judgment when they use AI, before a mistake measures it for you.**

Most of your team already uses AI in real workflows. Nobody knows who has the judgment to do
it well: what data they expose, when they escalate, when they *don't* trust the output. Itera
measures it with a real work simulation, not a quiz.

**How it works (two engines)**

1. **Assessment** — each person enters a ~15-minute field case: a real situation from their
   role, with data, pressure, and AI decisions. An evaluator scores 6 dimensions of judgment
   on a High / Medium / Low band, with cited evidence.
2. **Report** — the manager gets a per-person report plus a team matrix: who can pilot solo,
   who needs practice, who should pause AI on sensitive flows.
3. **Continuous upskilling** — AI changes every week. Itera turns each relevant update (a new
   model, connectors, agents) into a ~6-minute practice for the whole team, inside the
   subscription. The assessment also unlocks practice targeted at each person's gaps. The
   assessment finds the gap; the practice closes it; the next assessment proves it.

**What the manager gets**
- An executive report per person with the operational call (pilot / coach / pause).
- Risk events with evidence: data exposure, unverified claims, over-delegation.
- Targeted practice that unlocks based on each person's real gaps.

**What it is not**
- Not an LMS of videos and certificates. The practice is short, active, and always about a
  real decision.
- Not a knowledge test. It measures judgment under pressure, and trains it.

**Price** — per seat, from $109 USD/person/month (drops with volume). Monthly or annual
(2 months free). USD via Stripe. Cancel anytime.

**For** — Heads of Marketing, Growth, Operations, RevOps and L&D at 20-300 person US
companies that already put AI into their workflows.

**CTA** — 15-minute demo: [itera.la](https://itera.la)

---

## 2. Demo script (15 minutes)

**Min 0-2 · The problem.** "How many people on your team use AI in their work today? How many
do you know for certain are doing it well? That gap is what Itera measures."

**Min 2-7 · The live case.** Open `/case-demo` live. Play 3-4 slides of a real case. Show how
the participant decides what data to expose, how they instruct the AI, how they review the
output. "This isn't a quiz. It's their actual job."

**Min 7-11 · The report.** Open a real report. Show: band per dimension with cited evidence,
the risk events (e.g. "exposed a customer's address to the model at step 7"), and the
operational call. "The manager isn't guessing. They see exactly where the judgment is and
where the risk is."

**Min 11-13 · Continuous upskilling.** Open `/aprender-demo`. "Every time something relevant
ships in AI, your team practices it here that same week: 6 minutes, with feedback. This is
what keeps the judgment current, and it's what makes the subscription pay for itself."

**Min 13-14 · The team matrix.** Open `/staff/matriz`. "With 20 people, this tells you who
gets autonomy and who gets a coach. It's a management decision, with data."

**Min 14-15 · Close.** "It's per seat, from $109 a month. You can start with your core team
this week. Want to run it with 5 people?"

---

## 3. Email sequence (3 touches)

From the itera.la domain (already warmed). Short subjects, no hype.

**Touch 1 — opener**
> Subject: your team's AI judgment, measured
>
> Hi {name},
>
> Your team already uses AI at work. The expensive question is who has the judgment to do it
> well: what data they expose, when they escalate, when they don't trust the output.
>
> Itera measures it with a real 15-minute work simulation and gives you a per-person report:
> who can pilot solo, who needs practice, who should pause AI on sensitive flows.
>
> Worth 15 minutes this week to see how it looks?
>
> {signature}

**Touch 2 — 3 days later, if no reply**
> Subject: re: your team's AI judgment
>
> {name}, one concrete data point: the most common failure isn't technical. It's judgment.
> Competent people exposing customer data to a model without noticing, or accepting invented
> numbers without checking.
>
> A course doesn't fix that. You find it by measuring it. 15 minutes here: {link}.

**Touch 3 — 5 days later, close**
> Subject: closing the loop
>
> {name}, closing this thread for now. If you ever want to see who on your team has the
> judgment to use AI well, and who doesn't, we're here: itera.la.
>
> One real case, 15 minutes per person, an actionable report for you. {signature}

---

## 4. Objection handling

**"We already have Coursera / Pluralsight / Section."**
Those teach. We measure. You can't tell from a completion certificate whether someone will
paste a customer's address into a model under deadline pressure. Different job. (See §5 — do
not get drawn into a price comparison here.)

**"Isn't this just prompt engineering training?"**
No, and the research backs it: in Anthropic's AI Fluency framework, prompting ("Description")
is roughly a quarter of one of four competencies. The other three — Delegation, Discernment,
Diligence — are about choosing what work to hand over and judging what comes back. That's
what we measure.

**"How do we know the evaluation is fair?"**
Every band cites literal evidence from the transcript. The manager can read exactly why.
And see §6: the report is formative by design.

**"What if someone scores badly?"**
The report unlocks practice targeted at their gap. That's the point — it's a starting line,
not a verdict. (§6: do not let them use it for promotions. That's an ethics boundary and a
legal one.)

---

## 5. Positioning — the price trap

**Precios públicos de players adyacentes (2026) — VERIFICAR ANTES DE CITAR:**

| Player | Precio público | Qué venden | Confianza |
|---|---|---|---|
| Section | $750/yr (Premium individual) | AI transformation para no-técnicos | **alta** — anclado en `billing.ts:12` desde antes del pivot |
| Coursera for Business | ~$399/user/yr | catálogo de cursos | media — de research web, sin re-verificar |
| Pluralsight | $299-449/yr individual | progresión técnica de IA | **baja** — su propia página se contradice entre planes |
| Multiverse / Correlation One / Workera | **sin precio público** (custom) | apprenticeships / instructor-led / assessment | alta (la ausencia sí se verificó) |

⚠️ Esta tabla decía **"Verified public pricing"**. No lo estaba: salvo Section, ningún precio
se re-verificó contra la fuente, y el propio research marcó el de Pluralsight como
contradictorio. Son claims sobre **competidores** — publicidad comparativa falsa cae bajo el
Lanham Act §43(a), que es un riesgo distinto (y con demandante privado) al de la FTC.
**Antes de poner un número de competidor frente a un buyer, ábrelo y confírmalo ese día.**

Itera at $109-149/seat/month = **$1,308-1,788/seat/yr** — that is **2-4x the public ceiling of
the content catalogs**.

**Consequences, and they are not optional:**
1. **Never position against a course catalog.** On a per-seat price comparison against
   Coursera we lose, every time. If the buyer frames it as "vs Coursera," reframe or walk.
2. **The comparable is the cost of bad judgment**, or consulting day rates. One leaked
   customer list, one invented number in a board deck, one over-delegated workflow.
3. **Honest caveat**: no assessment/simulation competitor publishes per-seat pricing, so
   nobody — including us — can say "you're in range" with evidence. Don't claim it.

**The gap in the market**: no competitor found sells "simulation + LLM evaluation of judgment
under pressure". That's either a free lane or a lane nobody has managed to sell.

⚠️ **Sin verificar**: el research reportó que *"Uplimit fue adquirida por Handshake el
2026-06-30, sin anuncio sobre clientes corporativos"* — sugiriendo que esas cuentas están en
juego. **No lo pude verificar y no está citado con fuente.** Si es alucinación y un rep lo
repite frente a un buyer del sector, quedamos como los que inventan. Confírmalo antes de
usarlo, o no lo uses.

---

## 6. Compliance as a sales angle (US)

Nuevo para EEUU, y es un *opener*, no una nota al pie.

**El problema del comprador**: desde **2026-01-01**, Illinois HB 3773 (enmienda al IL Human
Rights Act) exige **notice** cuando se usa IA para influir o facilitar una decisión de empleo
— y cubre expresamente *"selection for training or apprenticeship."* Aplica desde **un**
empleado en Illinois. Aparte, las reglas del CPPA de California (vigentes 2026-01-01) definen
"significant decisions" incluyendo **performance evaluation**, con obligaciones ADMT que
aterrizan el **2027-01-01**.

**Por qué nos ayuda**: Itera es **formativo por diseño** — mide para entrenar, no para decidir
ascensos ni despidos. Ese compromiso está escrito en nuestros terms, y es lo que mantiene al
comprador (y a nosotros) fuera del scope de EEOC/UGESP. La mayoría de vendors de AI-assessment
no pueden decir eso.

**La línea**: "If a tool scores your people and a manager uses that score for promotions,
you've just walked into Illinois HB 3773 and California ADMT. Itera is formative by contract:
our terms say you agree not to use a report as the sole basis for a hiring, promotion,
retention, or disciplinary decision. It finds the gap and closes it."

⚠️ Esta línea decía *"It's not an input to a promotion decision, and our terms say so."*
Los terms **no dicen eso**: dicen **"sole basis"** (`legal.ts:174`). "No es un insumo" ≠ "no
es el único insumo" — la primera es una garantía contractual más fuerte que el contrato real.
No prometas de más justo en la cláusula cuyo valor es que sea precisa.

**NO reclamar** cumplimiento de NYC Local Law 144 ni Illinois AIVIA — no aplican (LL144 es
para AEDT de hiring/promotion; AIVIA es para análisis con IA de video-entrevistas de
aplicantes). Reclamar leyes que no aplican señala que no conocemos el espacio. **NO citar
Colorado SB 24-205** — nunca entró en vigor (lo reemplazó SB 26-189, vigente 2027-01-01).

---

## 7. Pipeline de captación — estado

**ROTO POR EL PIVOT.** El pipeline de `captacion/` (DuckDB, stack gratis verificado) ingiere
**DENUE** (registro de empresas del INEGI, México) y **SECOP** (compras públicas, Colombia).
Ninguno tiene cobertura de EEUU. La capa de DuckDB + qualify con Claude sobrevive; la
ingestión no.

**Lo que sirve hoy para EEUU**: LinkedIn Sales Navigator. Filtros:
- Empresa: Geography = United States; headcount 11-50 y 51-200; industrias donde el uso de IA
  en flujos es visible (Marketing/Advertising, Software/IT, Financial Services, Retail/E-commerce).
- Persona A (comprador económico): Director/VP/Head, function Marketing/Operations/HR;
  title keywords `"Head of Marketing" OR "Head of Growth" OR "Director of Operations" OR "RevOps"`.
- Persona B (ángulo L&D, ahora más fuerte por §6): `"Head of People" OR "Head of Talent" OR "L&D"`.
- La señal más fuerte si el plan lo trae: **Technologies Used** = ChatGPT Enterprise,
  Microsoft Copilot, Salesforce Einstein. Una empresa que ya pagó por IA tiene presupuesto Y
  el problema.

**Pendiente de Pablo**: decidir la fuente de datos de EEUU que reemplaza a DENUE/SECOP.
Las tareas #13 (ingestión DENUE) y #14 (permutar email + Reoon) quedan sin sentido para EEUU
tal como están escritas.
