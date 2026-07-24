"use client";

/**
 * LandingPage — REDISEÑO TOTAL v2 (Claude Design, proyecto
 * "Replicar dashboard de Duolingo" · itera Landing.dc.html, 2026-07).
 *
 * Estética: Duolingo-craft aplicado a Itera — botones con labio 3D
 * (--shadow-lip), pesos 700/800, Plus Jakarta Sans, acento #003AFF.
 * Todos los colores/radios/sombras leen tokens del scope .redesign-v2
 * (app/(app)/simulador.css); tipografía via clases ts-* (tabla de snapping).
 * Cuando el rediseño cubra las demás superficies, el scope se promueve
 * a global y este mismo markup no cambia.
 *
 * Animaciones por CSS (.v2-rise / .v2-float) — cero JS para above-the-fold.
 */

import Link from "next/link";
import {
  AppleBrowserFrame,
  AppleCheckRow,
  AppleEyebrowChip,
  AppleIcon,
  AppleLogoMark,
  AppleStatTile,
} from "@/components/simulador/apple";
import { SIMULADOR_TIERS } from "@/lib/simulador/billing";
import { MARKET_STATS } from "@/lib/simulador/copy/market-stats";

// Precio derivado de la ÚNICA fuente (billing.ts) para que la landing no pueda
// desviarse del checkout. ENTRY = lo que paga de verdad quien hace click en el CTA
// self-serve (team, 1-19 asientos). No usamos el floor de $89: es Enterprise (100+),
// no self-serve y negociable — anunciarlo junto a un botón de signup sería bait.
const ENTRY_PRICE_PER_SEAT = SIMULADOR_TIERS[0].pricePerSeatUsd;

/* Los átomos del diseño (LogoMark, CheckRow, eyebrow, browser frame, stat)
   viven PROMOVIDOS en components/simulador/apple/ — regla "espejo completo,
   cero copias locales". La mascota del hero queda one-off aquí a propósito. */

/* ─────────────────────────────── página ─────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="redesign-v2 w-full overflow-x-hidden bg-[var(--surface)] text-[var(--text-primary)]">
      {/* ===== NAV ===== */}
      <div className="sticky top-0 z-20 border-b border-[var(--hairline)] bg-white/85 backdrop-blur-[10px]">
        <div className="mx-auto flex max-w-[1200px] items-center gap-6 px-6 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <AppleLogoMark size={38} />
            <span className="ts-title-2 font-extrabold tracking-[-0.8px]">
              itera<span className="text-[var(--accent)]">.</span>
            </span>
          </Link>
          <nav className="ml-3 hidden flex-1 items-center gap-6 lg:flex">
            {/* "Product" iba a #producto (anchor de la misma página). /demo es el
                demo del comprador con los resultados — mejor asset de venta que
                un scroll a las cards. El anchor #producto sigue existiendo para
                deep-links viejos. */}
            <a href="/demo" className="ts-callout font-bold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">Product</a>
            <a href="/case-demo" className="ts-callout font-bold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">Cases</a>
            <a href="#como" className="ts-callout font-bold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">How it works</a>
            <a href="#empresas" className="ts-callout font-bold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">For managers</a>
          </nav>
          <div className="ml-auto flex items-center gap-5 lg:ml-0">
            <Link href="/auth/login" className="ts-callout font-extrabold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">
              Log in
            </Link>
            <a
              href="#demo"
              className="rounded-[12px] px-5 py-[11px] ts-subhead font-extrabold tracking-[0.3px] text-white shadow-lip transition-[filter,transform,box-shadow] hover:brightness-110 active:translate-y-[4px] active:shadow-none"
              style={{ background: "var(--accent)" }}
            >
              Request a demo
            </a>
          </div>
        </div>
      </div>

      {/* ===== HERO ===== */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[var(--surface-tint)] to-[var(--surface)]">
        <div
          className="absolute -top-[120px] -right-20 h-[520px] w-[520px] rounded-full"
          style={{ background: "radial-gradient(circle, var(--accent-glow), transparent 68%)" }}
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-[1200px] items-center gap-10 px-6 pb-[84px] pt-[76px] sm:px-8 lg:grid-cols-[1.05fr_.95fr]">
          {/* copy */}
          <div className="v2-rise flex flex-col gap-6">
            <AppleEyebrowChip className="self-start">
              AI fluency you can measure
            </AppleEyebrowChip>
            {/* El H1 decía "uses AI with judgment" — calco directo de "usa la IA
                con criterio"; ningún comprador gringo habla así. "Makes the calls"
                es el idiom nativo, y el propio archivo ya lo usaba bien más abajo.
                El subhead decía "what to do about each person": en inglés "what to
                do about someone" implica que esa persona es un problema — suena a
                expediente de RH y contradice nuestra cláusula de uso formativo. */}
            <h1 className="m-0 ts-display-lg sm:ts-display-xl font-extrabold leading-[1.05] tracking-[-1.5px] [text-wrap:balance]">
              Know who on your team makes good{" "}
              <span className="text-[var(--accent)]">calls</span> with AI
            </h1>
            <p className="m-0 max-w-[520px] ts-headline font-medium leading-[1.6] text-[var(--text-secondary)]">
              Your team runs 15-minute simulations of the work they actually do.
              You see whose judgment holds up, where the gaps are, and what each
              person needs next.
            </p>
            <div className="flex flex-wrap items-center gap-3.5">
              <a
                href="#demo"
                className="inline-flex items-center gap-2 rounded-[var(--radius-md)] px-7 py-[15px] ts-body font-extrabold tracking-[0.3px] text-white shadow-lip-lg transition-[filter,transform,box-shadow] hover:brightness-110 active:translate-y-[5px] active:shadow-none"
                style={{ background: "var(--accent)" }}
              >
                Request a demo
                <AppleIcon name="arrowRight" size="sm" stroke={2.8} />
              </a>
              {/* C5: "See the product" apuntaba a #producto — un scroll a tres
                  cards de copy. /demo enseña el producto de verdad (los
                  resultados que ve el comprador). Flujo del embudo: Request a
                  demo → #demo (contacto) · See the product → /demo. */}
              <a
                href="/demo"
                className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border-2 border-[var(--border)] bg-[var(--surface)] px-[26px] py-[15px] ts-body font-extrabold transition-colors hover:border-[var(--border-strong)]"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="var(--accent)" aria-hidden>
                  <path d="M8 5.5v13l11-6.5L8 5.5z" />
                </svg>
                See the product
              </a>
            </div>
            {/* Sin social proof: Itera no tiene clientes todavía. Un agente de la
                traducción inventó "+2k profesionales" y avatares — eliminado. No
                reponer nada aquí hasta que haya clientes REALES que lo autoricen
                por escrito (en EEUU, testimoniales/endorsements falsos caen bajo la
                FTC Rule on Consumer Reviews and Testimonials, con multa civil por
                violación). Ver docs/simulador/front/copy/00_EN_GLOSSARY.md §10. */}
          </div>

          {/* hero mock */}
          <div className="v2-rise-slow relative">
            <AppleBrowserFrame label="itera · practice" className="shadow-float-lg">
              <div className="flex flex-col gap-3 bg-[var(--surface-3)] p-[18px]">
                <div
                  className="flex items-center justify-between rounded-[var(--radius-lg)] px-4 py-3.5 text-white shadow-lip"
                  style={{ background: "linear-gradient(135deg, var(--accent-gradient-from), var(--accent))" }}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="ts-caption-2 font-extrabold tracking-[1px] opacity-75">CASE 3 · IN PROGRESS</span>
                    <span className="ts-body font-extrabold">What the model gets to see</span>
                  </div>
                  <span className="rounded-full bg-white/[.18] px-[11px] py-[5px] ts-caption-2 font-extrabold">4/9</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-[7px] rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-3.5">
                    <span className="grid h-[30px] w-[30px] place-items-center rounded-[9px] ts-caption-1 font-extrabold text-white" style={{ background: "var(--accent)" }}>OP</span>
                    <span className="ts-footnote font-extrabold leading-[1.25]">The email your manager asked for</span>
                    <span className="ts-caption-2 font-extrabold text-[var(--accent)]">CONTINUE</span>
                  </div>
                  <div className="flex flex-col gap-[7px] rounded-[14px] border border-[var(--v2-green-border)] bg-[var(--surface)] p-3.5">
                    <span className="grid h-[30px] w-[30px] place-items-center rounded-[9px] ts-callout font-extrabold text-white" style={{ background: "var(--v2-green)" }}>✓</span>
                    <span className="ts-footnote font-extrabold leading-[1.25]">Catch the hallucination</span>
                    <span className="ts-caption-2 font-extrabold text-[var(--v2-green-dark)]">✓ DONE</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--v2-orange)" aria-hidden>
                    <path d="M13.5 1S15 3.8 15 6.2c0 1.8-1.3 3-3 3s-3-1.2-3-3c0-.5 0-1 .2-1.5C7.1 6.8 5 9.8 5 13a7 7 0 0 0 14 0C19 8 15.5 4 13.5 1z" />
                  </svg>
                  <span className="ts-footnote font-extrabold text-[var(--v2-orange)]">12-day streak</span>
                  <div className="h-[9px] flex-1 overflow-hidden rounded-[5px] bg-[var(--hairline)]">
                    <div className="h-full w-3/4 rounded-[5px]" style={{ background: "var(--accent)" }} />
                  </div>
                  <span className="ts-caption-1 font-extrabold text-[var(--text-tertiary)]">30/40</span>
                </div>
              </div>
            </AppleBrowserFrame>
            {/* mascota */}
            <div className="v2-float absolute -bottom-[26px] -left-[30px]" aria-hidden>
              <div
                className="relative h-[72px] w-[84px] rounded-[26px]"
                style={{
                  background: "linear-gradient(180deg, #4D74FF, var(--accent))",
                  boxShadow: "0 14px 30px var(--accent-glow-strong), inset 0 -6px 0 rgba(0,0,0,.2)",
                }}
              >
                <div className="absolute left-1/2 top-[-14px] h-3 w-1 -translate-x-1/2 rounded-[2px]" style={{ background: "var(--accent-lip)" }} />
                <div className="absolute left-1/2 top-[-22px] h-[11px] w-[11px] -translate-x-1/2 rounded-full border-[2.5px] border-[var(--v2-green-dark)] bg-[var(--v2-green)]" />
                <div className="absolute inset-[13px_12px_18px] flex items-center justify-center gap-[9px] rounded-[14px] bg-[#0B0F1E]">
                  <span className="h-3.5 w-[9px] rounded-[5px] bg-[#2EE6A8]" />
                  <span className="h-3.5 w-[9px] rounded-[5px] bg-[#2EE6A8]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sin banda de logos: "TEAMS ALREADY ON ITERA" con Nordia/Vectra/Lumina Co/
          Halden Group/Kettle eran empresas INVENTADAS por un agente de la traducción.
          Itera no tiene clientes. Eliminado — ver el comment del hero. */}

      {/* ===== VALUE (3 col) ===== */}
      <div id="producto" className="mx-auto max-w-[1200px] px-6 pb-5 pt-[84px] sm:px-8">
        <div className="mb-12 flex flex-col items-center gap-3.5 text-center">
          <span className="ts-footnote font-extrabold tracking-[0.8px] text-[var(--accent)]">WHY ITERA</span>
          <h2 className="m-0 max-w-[640px] ts-display-lg font-extrabold tracking-[-1px] [text-wrap:balance]">
            Your team already uses AI. Nobody&apos;s checking their judgment
          </h2>
          {/* Decía "Prompting is about 25% of one of four competencies. The other
              75%...". Error MÍO en el glosario §1: lo rotulé "research-backed".
              El marco de AI Fluency de Anthropic (Delegation/Description/
              Discernment/Diligence) NO asigna porcentajes, y la aritmética ni
              siquiera cerraba: 25% de UNA de CUATRO deja 93.75%, no 75%. Además
              iba sin atribución, como hecho pelado. Reescrito como POSICIÓN
              nuestra (defendible como opinión) en vez de dato inventado. */}
          <p className="m-0 max-w-[560px] ts-body font-medium leading-[1.6] text-[var(--text-secondary)]">
            Prompting is the part everyone teaches. The harder part is choosing
            what to hand over in the first place, and judging what comes back.
            That&apos;s what we measure.
          </p>
        </div>
        {/* Stats del MERCADO (no del producto — esas viven en el stats band de
            abajo y no se mezclan). Fuente única: lib/simulador/copy/market-stats.ts.
            Máx 3 por superficie; cada figura con su fuente visible. */}
        <div className="mb-12 grid gap-[22px] md:grid-cols-3">
          {[MARKET_STATS.KPMG_HIDE, MARKET_STATS.MCKINSEY_3X, MARKET_STATS.IBM_COST].map((stat) => (
            <div
              key={stat.id}
              className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-card"
            >
              {/* .display fija color text-primary (y ganaría por especificidad
                  a un text-[var(--accent)]) — la figura va en tinta, no acento */}
              <span className="display ts-title-1 font-extrabold">
                {stat.figure}
              </span>
              <span className="ts-footnote font-semibold leading-[1.45] text-[var(--text-secondary)]">
                {stat.claim}
              </span>
              <span className="mt-auto ts-caption-2 font-medium leading-[1.4] text-[var(--text-tertiary)]">
                {stat.source}
              </span>
            </div>
          ))}
        </div>
        <div className="grid gap-[22px] md:grid-cols-3">
          <div className="flex flex-col gap-3.5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-7 shadow-card">
            <div className="grid h-[52px] w-[52px] place-items-center rounded-[15px] bg-[var(--accent-soft)]">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.3" strokeLinejoin="round" aria-hidden>
                <path d="M12 3l9 5-9 5-9-5 9-5z" />
                <path d="M3 12l9 5 9-5" />
              </svg>
            </div>
            {/* N1: decía "Learn by deciding" — framing de aprendizaje, no de
                costo. El comprador paga por evitar el error caro, no por que su
                equipo "aprenda". Reencuadrado a atrapar el error antes de que
                salga; sin drama, tono del glosario. */}
            <h3 className="m-0 ts-body-lg font-extrabold">Catch the cost before it ships</h3>
            <p className="m-0 ts-callout font-medium leading-[1.6] text-[var(--text-tertiary)]">
              Short practices built on real artifacts: the made-up number in
              the draft, the customer data pasted into a prompt. Your team
              catches it before it goes out — every practice ends in an
              action, not a quiz.
            </p>
          </div>
          <div className="flex flex-col gap-3.5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-7 shadow-card">
            <div className="grid h-[52px] w-[52px] place-items-center rounded-[15px]" style={{ background: "rgba(240,70,97,.1)" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--v2-red)" strokeWidth="2.3" strokeLinejoin="round" aria-hidden>
                <path d="M13 2 4.5 13.5H10L9 22l8.5-11.5H12L13 2z" />
              </svg>
            </div>
            <h3 className="m-0 ts-body-lg font-extrabold">Simulate real work</h3>
            <p className="m-0 ts-callout font-medium leading-[1.6] text-[var(--text-tertiary)]">
              &quot;The email your manager asked for&quot;, &quot;urgent
              incident&quot;, &quot;price objection&quot;. Your team makes the
              calls with AI in the flows they already own.
            </p>
          </div>
          <div className="flex flex-col gap-3.5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-7 shadow-card">
            <div className="grid h-[52px] w-[52px] place-items-center rounded-[15px]" style={{ background: "rgba(15,191,143,.12)" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--v2-green-dark)" strokeWidth="2.3" strokeLinecap="round" aria-hidden>
                <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
              </svg>
            </div>
            <h3 className="m-0 ts-body-lg font-extrabold">Measure what changed</h3>
            {/* "how many hours the team saves" era una feature INVENTADA: no hay
                cálculo de horas ahorradas en el código (grep hours_saved = 0). */}
            <p className="m-0 ts-callout font-medium leading-[1.6] text-[var(--text-tertiary)]">
              A manager dashboard: who is ready, where the gaps are, which risks
              showed up. Assign the targeted practice and re-assess to see what
              moved.
            </p>
          </div>
        </div>
      </div>

      {/* ===== CÓMO FUNCIONA ===== */}
      <div id="como" className="mx-auto max-w-[1200px] px-6 py-[76px] sm:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              n: "1",
              t: "Start with the assessment",
              p: "Your team runs a live case built on your own work. Fifteen minutes, real artifacts, a decision at the end. Adapted by role: sales, marketing, finance, operations.",
            },
            {
              n: "2",
              t: "They practice five minutes a day",
              p: "Itera assigns the practice for each gap. Streaks and team goals keep the habit. People come back because it's short, not because it's mandatory.",
            },
            {
              // "hours saved and what they are worth in USD" + "Export the report":
              // features INVENTADAS. No existe cálculo de horas ni de valor en USD.
              // El PDF del reporte sí existe (reports/generate-pdf.ts), así que ese
              // claim se queda; los otros dos se van.
              n: "3",
              t: "You see what changed",
              p: "Readiness per person and across the team, the risk events behind it, and the practice each gap unlocked. Download the report as a PDF.",
            },
          ].map((s) => (
            <div key={s.n} className="flex flex-col gap-3 rounded-[var(--radius-lg)] bg-[var(--surface-tint)] p-[26px]">
              <span
                className="grid h-10 w-10 place-items-center rounded-[12px] ts-headline font-extrabold text-white shadow-lip"
                style={{ background: "var(--accent)" }}
              >
                {s.n}
              </span>
              <h3 className="m-0 mt-0.5 ts-headline font-extrabold">{s.t}</h3>
              <p className="m-0 ts-subhead font-medium leading-[1.55] text-[var(--text-tertiary)]">{s.p}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== EMPRESAS / dashboard showcase ===== */}
      <div id="empresas" className="border-y border-[var(--hairline)] bg-[var(--surface-3)]">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-6 py-20 sm:px-8 lg:grid-cols-[.9fr_1.1fr]">
          <div className="flex flex-col gap-5">
            <span className="self-start rounded-full px-[13px] py-1.5 ts-caption-1 font-extrabold tracking-[0.5px] text-white" style={{ background: "var(--ink-band)" }}>
              FOR MANAGERS
            </span>
            <h2 className="m-0 ts-display font-extrabold leading-[1.1] tracking-[-1px]">
              The dashboard that tells you who&apos;s ready for AI and who isn&apos;t
            </h2>
            <p className="m-0 ts-body font-medium leading-[1.6] text-[var(--text-secondary)]">
              Stop guessing. itera shows you who decides well with AI, where
              your team is strong, and where it needs support, with one-click
              actions to assign the right practice.
            </p>
            <div className="flex flex-col gap-3">
              <AppleCheckRow>Individual and team readiness in real time</AppleCheckRow>
              <AppleCheckRow>Assign targeted practice and track completion</AppleCheckRow>
              {/* Aquí decía "Verifiable certification by level". Es la peor
                  invención del diff: el agente BORRÓ el FAQ que sostenía lo
                  CONTRARIO ("¿Es certificación?" → "No. No acreditamos, medimos.
                  El reporte se traduce en acciones concretas, no en un certificado
                  de pared") y publicó su negación. Contradice billing.ts:75
                  ("Diagnóstico operativo, no certificación") y legal.ts. Además
                  "verifiable" implica un tercero que verifique, que no existe. */}
              <AppleCheckRow>Risk events with cited evidence, not a certificate for the wall</AppleCheckRow>
            </div>
            <a
              href="#demo"
              className="inline-flex items-center gap-2 self-start rounded-[var(--radius-md)] px-6 py-3.5 ts-callout font-extrabold text-white shadow-lip-lg transition-[filter,transform,box-shadow] hover:brightness-110 active:translate-y-[5px] active:shadow-none"
              style={{ background: "var(--accent)" }}
            >
              See the dashboard in a demo
              <AppleIcon name="arrowRight" size="sm" stroke={2.8} />
            </a>
          </div>

          {/* panel mock */}
          <AppleBrowserFrame
            label={
              <>
                <span className="ml-2 rounded-full px-2 py-0.5 ts-caption-1 font-extrabold tracking-[0.5px] text-white" style={{ background: "var(--ink-band)" }}>
                  MANAGER VIEW
                </span>
                <span className="ml-auto ts-caption-2 font-bold text-[var(--text-disabled)]">
                  Sample data
                </span>
              </>
            }
          >
            {/* Este mock decía ADOPTION 78% ▲6 · EXERCISES 214 ▲18 · HOURS/WK 41h:
                los MISMOS números inventados que borré del stats band, que
                sobrevivieron aquí. Doble problema: (a) no hay clientes de quienes
                medirlos; (b) las features NO EXISTEN — grep de hours_saved|adoption|
                usd_value en lib/ y app/api/ da cero. Un mock ilustrativo es
                defendible si la feature existe y está rotulado; no se cumplía
                ninguna de las dos. Ahora muestra lo que el producto SÍ calcula
                (readiness, bandas, risk events) y dice "Sample data". */}
            <div className="flex flex-col gap-3 p-[18px]">
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { k: "READINESS", v: "64", d: "/100" },
                  { k: "ASSESSED", v: "6", d: "/8" },
                  { k: "RISK EVENTS", v: "11", d: "" },
                ].map((kpi) => (
                  <div key={kpi.k} className="flex flex-col gap-[3px] rounded-[13px] bg-[var(--surface-3)] px-[13px] py-3">
                    <span className="ts-caption-2 font-extrabold text-[var(--text-tertiary)]">{kpi.k}</span>
                    <span className="ts-body-lg font-extrabold">
                      {kpi.v}
                      {kpi.d && <span className="ts-caption-1 text-[var(--v2-green-dark)]"> {kpi.d}</span>}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2.5 rounded-[14px] bg-[var(--surface-3)] px-4 py-3.5">
                <span className="ts-footnote font-extrabold">Team readiness</span>
                {[
                  { i: "V", c: "var(--v2-red)", w: "94%", ok: true },
                  { i: "A", c: "var(--v2-green)", w: "89%", ok: true },
                  { i: "D", c: "var(--v2-amber)", w: "72%", ok: false },
                ].map((row) => (
                  <div key={row.i} className="flex items-center gap-2.5">
                    <span className="grid h-[26px] w-[26px] place-items-center rounded-full ts-caption-1 font-extrabold text-white" style={{ background: row.c }}>
                      {row.i}
                    </span>
                    <div className="h-[9px] flex-1 overflow-hidden rounded-[5px] bg-[var(--border)]">
                      <div
                        className="h-full rounded-[5px]"
                        style={{ width: row.w, background: row.ok ? "var(--accent)" : "var(--v2-red)" }}
                      />
                    </div>
                    <span className="ts-caption-1 font-extrabold" style={{ color: row.ok ? "var(--v2-green-dark)" : "var(--v2-red-dark)" }}>
                      {row.w}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </AppleBrowserFrame>
        </div>
      </div>

      {/* ===== STATS BAND ===== */}
      <div className="text-white" style={{ background: "linear-gradient(135deg, var(--accent-deep), var(--accent))" }}>
        <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-6 px-6 py-14 text-center sm:px-8 lg:grid-cols-4">
          {/* Solo hechos verificables del producto. Las métricas anteriores
              ("+41 h ahorradas", "78% de adopción", "4.7★") las inventó un agente
              de la traducción: Itera no tiene clientes, así que no hay de dónde
              medirlas. Cuando haya datos de un piloto real, vuelven con fuente. */}
          {[
            { v: "15 min", l: "per assessment · one real case" },
            // Mi propio perl se comió "dimensions" y dejaba un "Six" gigante sobre
            // una frase que no cierra. typecheck y build no lo atrapan: es un
            // string válido.
            { v: "6", l: "dimensions of judgment, scored with cited evidence" },
            { v: "~6 min", l: "per practice · fits in the workday" },
            // Decía "Weekly · new practice as AI ships". "Weekly" es una promesa de
            // cadencia que no tiene respaldo (cero semanas de historial, y el
            // glosario §10 lista este claim SIN frecuencia). Mismo reflejo de
            // precisión inventada que el 25/75 — más chico, pero es lo mismo.
            { v: "New", l: "practice ships as AI ships" },
          ].map((s) => (
            <AppleStatTile key={s.l} value={s.v} label={s.l} tone="on-accent" />
          ))}
        </div>
      </div>

      {/* Sin testimonial: "Rachel Meyer · Head of Growth · Nordia" y su cita de
          5 estrellas eran INVENTADAS por un agente de la traducción — persona
          ficticia, empresa ficticia, resultado ficticio. Es exactamente lo que la
          FTC Rule on Consumer Reviews and Testimonials sanciona. No reponer sin un
          cliente real que lo firme. */}

      {/* ===== CTA BAND ===== */}
      <div id="demo" className="mx-auto max-w-[1200px] px-6 pb-20 sm:px-8">
        <div className="relative flex flex-col items-center gap-[22px] overflow-hidden rounded-[var(--radius-2xl)] px-8 py-[60px] text-center text-white sm:px-12" style={{ background: "var(--ink-band)" }}>
          <div
            className="absolute -top-[90px] -right-10 h-80 w-80 rounded-full"
            style={{ background: "radial-gradient(circle, var(--accent-glow-strong), transparent 70%)" }}
            aria-hidden
          />
          <h2 className="relative m-0 max-w-[620px] ts-display-lg font-extrabold tracking-[-1px] [text-wrap:balance]">
            Find out where your team actually stands
          </h2>
          {/* Decía "We show you the dashboard with data from your industry":
              implica benchmarks sectoriales. Con cero clientes no hay datos de
              ninguna industria — es una promesa que el rep no puede cumplir en la
              demo misma. */}
          <p className="relative m-0 max-w-[480px] ts-body font-medium leading-[1.6] text-[var(--ink-band-text)]">
            Book a 20-minute demo. We play a real case, show you the report it
            produces, and you leave knowing what we would measure on your team.
          </p>
          {/* Stat de mercado (KPMG_POLICY, market-stats.ts) — fuente en tooltip
              title=. No es un hecho del producto: no va en el stats band. */}
          <p
            className="relative m-0 max-w-[480px] ts-footnote font-semibold leading-[1.5] text-[var(--ink-band-text)]"
            title={MARKET_STATS.KPMG_POLICY.source}
          >
            {MARKET_STATS.KPMG_POLICY.figure} {MARKET_STATS.KPMG_POLICY.claim}.
            Better to find out here than in an incident report.
          </p>
          {/* El embudo NO cerraba: la landing pedía "Request a demo" 5 veces y no
              había forma de pedirla. Cuatro CTAs hacían scroll a esta banda, y el
              de esta banda iba a /demo — una página de marketing, no un formulario.
              Sin CRM ni Calendly, la única puerta era /auth/signup → cobrar $149 a
              alguien que nunca oyó de nosotros. Nadie hace eso. El mailto es el
              canal que EXISTE hoy (hola@ ya estaba en el footer original). Cuando
              haya Calendly o formulario, este href es el que cambia. */}
          <div className="relative flex flex-wrap justify-center gap-3.5">
            <a
              href="mailto:hola@itera.la?subject=Itera%20demo%20request&body=Team%20size%3A%0ARole%3A%0AWhat%20your%20team%20uses%20AI%20for%3A"
              className="inline-flex items-center gap-2 rounded-[var(--radius-md)] px-[30px] py-[15px] ts-body font-extrabold text-white shadow-lip-lg transition-[filter,transform,box-shadow] hover:brightness-110 active:translate-y-[5px] active:shadow-none"
              style={{ background: "var(--accent)" }}
            >
              Request a demo
            </a>
            <Link
              href="/auth/signup"
              className="inline-flex items-center rounded-[var(--radius-md)] border-2 border-white/25 bg-white/10 px-7 py-[15px] ts-body font-extrabold text-white transition-colors hover:bg-white/[.18]"
            >
              Start with my team
            </Link>
          </div>
          {/* OJO: aquí decía "Try it free with my team" + "No credit card · free for
              up to 5 people". INVENTADO por un agente de la traducción: billing.ts
              no tiene tier gratis ni trial (minSeats:1, el más barato $149/asiento).
              Prometer gratis y cobrar $149 es bait advertising bajo FTC Act §5 — la
              única invención del diff que prometía DINERO. Si algún día quieres un
              trial de verdad, primero existe en billing.ts, después en la landing. */}
          <span className="relative ts-footnote font-semibold text-[var(--ink-band-text-muted)]">
            ${ENTRY_PRICE_PER_SEAT} USD per seat/month, less at volume · cancel anytime
          </span>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <div className="border-t border-[var(--hairline)] bg-[var(--surface-2)]">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-start justify-between gap-10 px-6 py-11 sm:px-8">
          <div className="flex max-w-[280px] flex-col gap-3">
            <div className="flex items-center gap-2">
              <AppleLogoMark size={32} />
              <span className="ts-body-xl font-extrabold tracking-[-0.7px]">
                itera<span className="text-[var(--accent)]">.</span>
              </span>
            </div>
            <span className="ts-subhead font-medium leading-[1.55] text-[var(--text-tertiary)]">
              AI fluency for teams. Measure the judgment, close the gaps.
            </span>
          </div>
          <div className="flex flex-wrap gap-14">
            <div className="flex flex-col gap-2.5">
              <span className="ts-caption-1 font-extrabold tracking-[0.6px] text-[var(--text-disabled)]">PRODUCT</span>
              <a href="#como" className="ts-subhead font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">How it works</a>
              <a href="/case-demo" className="ts-subhead font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">Cases</a>
              <a href="#empresas" className="ts-subhead font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">For managers</a>
            </div>
            {/* El rediseño puso href="#" en Contact/About/Blog/Security. El
                original en español tenía un mailto:hola@itera.la QUE FUNCIONABA —
                era el único canal de contacto de la landing, y quedó convertido en
                un no-op. Eso es lo que hacía que los 5 "Request a demo" no
                llevaran a ninguna parte: el prospecto no tenía forma de hablar con
                un humano y su única puerta era meter tarjeta. About/Blog/Security
                no existen como página: se quitan en vez de fingir que existen
                (check-routes + FRONT_CONTRACT no permiten rutas fantasma). */}
            <div className="flex flex-col gap-2.5">
              <span className="ts-caption-1 font-extrabold tracking-[0.6px] text-[var(--text-disabled)]">COMPANY</span>
              <a href="mailto:hola@itera.la" className="ts-subhead font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">Contact sales</a>
              <a href="/demo" className="ts-subhead font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">Manager demo</a>
            </div>
            <div className="flex flex-col gap-2.5">
              <span className="ts-caption-1 font-extrabold tracking-[0.6px] text-[var(--text-disabled)]">LEGAL</span>
              <Link href="/privacy" className="ts-subhead font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">Privacy</Link>
              <Link href="/terms" className="ts-subhead font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">Terms</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-[var(--hairline)]">
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-2.5 px-6 py-[18px] sm:px-8">
            <span className="ts-footnote font-semibold text-[var(--text-disabled)]">© 2026 itera. All rights reserved.</span>
            <span className="ts-footnote font-semibold text-[var(--text-disabled)]">AI fluency, measured.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
