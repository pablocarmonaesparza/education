# Itera — canonical English vocabulary (US market)

Single source for the English copy. Every surface, every agent, every future module
uses these terms. Supersedes `00_VOICE_GUIDE.md` (Spanish/LATAM) for the US market.

Decision: 2026-07-15 (Pablo — pivot MX/CO → US). Research-backed, see §Sources.

---

## 1. The product concept

| Concept | Use | NEVER use | Why |
|---|---|---|---|
| **AI fluency** | the category | "AI literacy" | *Literacy* = knowing what AI is. *Fluency* = applying it in daily work. Fluency is the dominant 2026 term (Anthropic AI Fluency Index, Coursera "AI Fluency", aifluencyframework.org). |
| **judgment** | what Itera measures | "criteria", "criterion" | Direct translation of "criterio" is a false friend. English "criteria" = the yardstick, not the faculty. **Judgment** is the faculty. |
| **discernment** | the specific skill | — | Anthropic's 4Ds framework (Delegation, Description, **Discernment**, Diligence). Use when we want the industry-recognized name for our thesis. Citable. |
| **AI readiness** | org-level rollup only | for individuals | The market uses *readiness* for organizational (skills + governance + culture). For a person, use "fluency" or "judgment". |
| **assessment** | the diagnostic | "diagnostic", "exam", "test" | Budget-holders say assessment. "Diagnostic" reads clinical. |
| **upskilling** | the training pillar | "training", "capacitación" | Budget line item is upskilling. |
| **practice** | the educational unit | "lesson", "course", "module" | We are not an LMS. Never "course". |

**The pitch sentence in English:**
> Itera measures your team's judgment when they use AI — then turns the gaps into practice.

**The anti-positioning:**
> Prompting is the part everyone teaches. The harder part is choosing what to hand over in
> the first place, and judging what comes back. That's what we measure.

⚠️ **Do not put numbers on this.** An earlier version of this glossary said *"prompting is
about 25% of one of four competencies, the other 75% is…"* and labeled it research-backed.
It is not. Anthropic's AI Fluency framework names four competencies (Delegation, Description,
Discernment, Diligence) and **assigns no percentages** — the 25/75 was invented precision, and
the arithmetic didn't even hold (25% of one of four leaves 93.75%, not 75%). It shipped to the
landing page unsourced before the adversarial audit caught it.

What is safe to say: the **framework exists and names Discernment**, which is our concept —
cite it in a sales conversation (`SALES_MATERIALS.md` §4 does this correctly, with attribution
and a hedge). What is not safe: quantifying it. State the position as **our opinion**, which
needs no source, instead of a fake statistic that does.

---

## 2. Product nouns

| Spanish | English | NEVER |
|---|---|---|
| participante | **participant** | student, learner, trainee, user |
| manager | **manager** | leader, supervisor, boss |
| organización | **organization** | company, account, tenant |
| equipo | **team** | group, squad |
| caso / caso vivo | **case** / **live case** | scenario, exercise, simulation* |
| diagnóstico | **assessment** | diagnostic, exam, test |
| reporte | **report** | results, scorecard |
| práctica dirigida | **targeted practice** | remedial, homework |
| practice beat | **practice** | beat (internal term only) |
| capacitación continua | **continuous upskilling** | continuous training |
| asiento | **seat** | license, user |
| criterio | **judgment** | criteria |
| readiness del equipo | **team readiness** | — |
| motor operativo | **the assessment engine** | operational engine |
| motor educativo | **the practice engine** | educational engine |

\* "simulation" is fine in marketing prose ("a real work simulation"), never as the product noun.

---

## 3. Bands and recommendations

**Internal identifiers do not change.** The DB enums stay as-is (`A`/`M`/`B`,
`pilotar`/`entrenar`/`pausar`/`escalar`) — they are identifiers, not copy. Renaming them
means migrating CHECK constraints on 3 tables plus the risk-engine SQL function, for zero
customer benefit. Localize at the **display layer only**.

| DB value | English display | Spanish (legacy) |
|---|---|---|
| `A` | **High** | Alto |
| `M` | **Medium** | Medio |
| `B` | **Low** | Bajo |
| `pilotar` | **Pilot** — can run AI solo | pilotar |
| `entrenar` | **Coach** — needs practice | entrenar |
| `pausar` | **Pause** — hold AI on sensitive flows | pausar |
| `escalar` | **Escalate** — manager review | escalar |

Note: `entrenar` → **Coach**, not "Train". "Train" collides with the training/upskilling
pillar and reads like we're training the model, not the person.

## 4. The six dimensions

| Spanish | English |
|---|---|
| contexto | **Context** |
| datos | **Data handling** |
| ejecucion_ia | **AI execution** |
| validacion | **Verification** |
| juicio | **Judgment** |
| impacto | **Impact** |

`validacion` → **Verification**, not "Validation". Validation is a data-engineering term;
verification is what you do to a claim.

---

## 5. Voice

- **US business English.** Plain, direct, short sentences. Not British.
- **No em-dashes in body copy.** (Carried over from the Spanish guide — still applies.)
- **"AI"** always capitalized. Never "A.I.", never spelled out after first use.
- **Sentence case** for headings and buttons ("Start case", not "Start Case").
- **No period on titles/headings.** (Carried over.)
- **Second person** ("your team", "you decide"), never "the user".
- **No corporate-startup jargon**: no "leverage", "synergy", "unlock potential",
  "supercharge", "10x", "game-changing". If a sentence could appear in any SaaS landing
  page, rewrite it.
- **Numbers**: US format. `$1,250.00`, `1,000`, dates as `Jul 15, 2026`.
- **Currency**: USD, always explicit on first mention in content (`$3,400 USD`).

---

## 6. What must be REMOVED, not translated

These are false promises or nonsense for a US buyer. Deleting, not translating:

| Thing | Where | Why |
|---|---|---|
| CFDI / RFC / NIT / CUIT invoicing | `copy/billing.ts:255-259`, email templates, LAUNCH_HANDOFF | Mexican/LATAM tax invoicing. Promising a US customer a CFDI is a false promise. US = Stripe receipt + W-9 on request. |
| LFPDPPP + ARCO rights + Secretaría Anticorrupción | `copy/legal.ts` | Mexican privacy law and authority. |
| Ley 1581 + SIC + RNBD + habeas data | `copy/legal.ts` | Colombian privacy law and registry. |
| "Estados Unidos no figura como país con nivel adecuado de protección" | `copy/legal.ts:50,210` | Literally tells a US buyer their country lacks adequate protection. Absurd on a US-facing site. |
| "escribe a privacidad@ antes de crear cuentas" (for CCPA) | `copy/legal.ts:66` | Tells a California customer they can't self-serve. |
| LGPD / Brazil block | `copy/legal.ts:58-63` | Out of scope. |
| "5 años según código fiscal mexicano" / "10 años código de comercio colombiano" | `copy/legal.ts:166,218` | Wrong retention basis for US. |
| DENUE (INEGI) / SECOP | `captacion/` | Mexican + Colombian government business registries. Useless for US prospecting. Needs a different source entirely — out of scope for the translation. |

## 7. What must be ADDED for the US

| Thing | Why | Source |
|---|---|---|
| **CCPA/CPRA** privacy notice | California. CPPA regs effective 2026-01-01 define "significant decisions" to include **performance evaluation**. ADMT obligations from 2027-01-01; risk assessments from 2026-01-01. | [CPPA](https://cppa.ca.gov/announcements/2025/20250923.html) |
| **Illinois HB 3773 notice** | Effective 2026-01-01. Amends the IL Human Rights Act. Expressly covers "selection for training or apprenticeship" and "terms, privileges, or conditions of employment". Requires **notice** when AI is used to influence/facilitate an employment decision — whether or not it discriminates. Applies from **1 employee** in Illinois. | [Jones Day](https://www.jonesday.com/en/insights/2024/10/illinois-becomes-second-state-to-pass-broad-legislation-on-the-use-of-ai-in-employment-decisions) |
| **Formative-use clause** | EEOC/UGESP applies to procedures used in employment decisions. If the report is purely formative it's out of scope; if a manager uses it to decide promotions, it's in. This is a **product design commitment**, not just legal text. | [EEOC UGESP Q&A](https://www.eeoc.gov/laws/guidance/questions-and-answers-clarify-and-provide-common-interpretation-uniform-guidelines) |
| **Governing law** | Currently unnamed ("sede legal de Itera", "entidad pendiente de constitución"). US B2B default is Delaware. **Pablo must confirm the legal entity** — flagged, not invented. | — |

**Do NOT cite Colorado SB 24-205.** It never took effect: federal court paused enforcement
(2026-04-27), and SB 26-189 (signed 2026-05-14) replaced it, effective 2027-01-01 with
disclosure replacing the non-discrimination duty.

**Do NOT claim NYC LL144 or Illinois AIVIA compliance.** Neither applies — LL144 is
hiring/promotion AEDTs; AIVIA is AI analysis of asynchronous video interviews of applicants.
Claiming compliance with laws that don't apply signals we don't know the space.

---

## 8. Content localization rules (cases + practices)

Translation is not enough. Every case must be **relocalized**:

1. **Currency must be explicit and USD.** The Spanish YAML wrote bare `$3,400` with no
   currency field. Read as MXN that's ~$190 USD (trivial, wouldn't escalate); read as USD
   it escalates. **The rubric's correct answer changes with the reading.** All US content
   states USD explicitly, and amounts are re-tuned so the decision tension survives.
2. **Company/person names** → US-plausible. No accented names as the default cast.
3. **Addresses** → US format (`1425 Oak St, Apt 3B`), because the PII-recognition exercise
   depends on the participant recognizing the format.
4. **The regulatory beat** → the in-case rule ("never send address/phone to the model") was
   calibrated to LFPDPPP/Ley 1581. In US content it is grounded in the US framework that
   actually applies — **but never name the law in case prose.**
   - `scripts/simulador/lint-case-copy.mjs` forbids acronyms in case prose (CCPA and GDPR
     are both on the list) and CI enforces it. The rule is deliberate: a case measures
     **judgment, not acronym recall**. A participant who doesn't know the initials should
     still face the same decision.
   - Write the concept in plain language: "privacy opt-out on file", "do-not-sell request",
     "under our privacy policy that counts as a disclosure to a vendor".
   - **Pick the right framework per case, don't default to CCPA.** CCPA exempts PHI handled
     by a covered entity (Cal. Civ. Code 1798.145(c)) — so a telemedicine case (Lumen) is
     HIPAA/CAN-SPAM territory, and anchoring it in CCPA would be a legal error in a product
     that sells judgment about compliance. Marketing/e-commerce → CCPA/CPRA + CAN-SPAM.
     Health → HIPAA. Naming the law is for `legal.ts`, not for case prose.
5. **Business operation must be US-plausible.** e.g. LATAM last-mile "analyst approves a
   theft refund without evidence" → in the US that flow is a carrier/insurance claim.
   The tension must be rebuilt on an operation a US ops lead recognizes.

---

## 10. No fabricated proof — hard rule

**Itera has zero customers.** It has never sold. Until that changes, the following may not
appear anywhere a prospect can see, no matter how good it looks:

- Customer logos, "trusted by", "teams already on Itera"
- Testimonials, quotes, star ratings, named people at named companies
- User counts ("2,000 professionals"), adoption rates, hours saved, satisfaction scores
- Case studies, awards, "as seen in"
- Security certifications (SOC 2, ISO 27001) or "HIPAA compliant" / "GDPR compliant" —
  we hold none of these

**This is not a style preference.** In the US, fabricated testimonials and endorsements fall
under the FTC's Rule on the Use of Consumer Reviews and Testimonials (in force since Oct 2024,
civil penalties per violation) and Section 5 of the FTC Act. Inventing a customer is not
"placeholder copy" — it is the violation.

**This already happened.** During the 2026-07-15 English translation, an agent invented a full
social-proof apparatus on the landing page: five fake customer companies (Nordia, Vectra,
Lumina Co, Halden Group, Kettle), a five-star testimonial from a fictional "Rachel Meyer, Head
of Growth at Nordia", "More than 2,000 professionals already practice with itera", and a
metrics band (+41h saved, 78% adoption, 4.7★). None of it existed in the Spanish original.
All of it was removed. **A model asked to write a landing page will reach for social proof by
default — that reflex is what this rule exists to stop.**

**What we can claim** (verifiable properties of the product, not of a customer base): the
assessment is one real case, ~15 minutes. Six dimensions of judgment, scored with cited
evidence. Practices are ~6 minutes. New practice ships as AI ships. Per-seat pricing.

When there is a real pilot, results come back **with a source and written permission**, not
from a model's imagination.

---

## 9. Sources

- [Anthropic AI Fluency Index](https://www.anthropic.com/research/AI-fluency-index) — 4Ds framework, "Discernment"
- [CPPA final ADMT regs](https://cppa.ca.gov/announcements/2025/20250923.html)
- [Illinois HB 3773 — Jones Day](https://www.jonesday.com/en/insights/2024/10/illinois-becomes-second-state-to-pass-broad-legislation-on-the-use-of-ai-in-employment-decisions) · [Seyfarth](https://www.seyfarth.com/news-insights/legal-update-new-illinois-ai-law-requires-employee-notice-affirms-existing-employer-nondiscrimination-duties.html)
- [NYC DCWP AEDT FAQ](https://www.nyc.gov/assets/dca/downloads/pdf/about/DCWP-AEDT-FAQ.pdf) — scope
- [EEOC UGESP Q&A](https://www.eeoc.gov/laws/guidance/questions-and-answers-clarify-and-provide-common-interpretation-uniform-guidelines) · [OPM UGESP scope](https://www.opm.gov/frequently-asked-questions/assessment-policy-faq/legal-aspects-of-assessment/what-is-the-scope-of-the-uniform-guidelines-on-employee-selection-procedures-in-terms-of-assessment/)
- [Colorado AI Act collapse — Clark Hill](https://www.clarkhill.com/news-events/news/colorados-ai-law-delayed-until-june-2026-what-the-latest-setback-means-for-businesses/)
- Competitive pricing (public): [Section $750/yr](https://www.sectionai.com/pricing) · [Pluralsight](https://www.pluralsight.com/businesses/pricing) · Coursera for Business ~$399/yr

**Pricing note (not a copy decision, but it shapes the copy):** at $109-149/seat/month
Itera is $1,308-1,788/seat/year — 2-4x the public ceiling of content catalogs. No
assessment/simulation competitor publishes per-seat pricing, so "in range" is unverifiable.
Consequence for copy: **never position against a course catalog** (we lose on price). The
comparable is the cost of bad judgment, or consulting rates.
