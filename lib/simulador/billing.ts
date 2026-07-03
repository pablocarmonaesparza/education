/**
 * Pricing model B2B del Simulador.
 *
 * Modelo per-seat vigente (ver docs/memory/decision_pricing_per_seat_v1.md;
 * decisión de Pablo 2026-07-02 que reemplaza el paquete de fases del 2026-05-18):
 *
 *   Facturación por asiento (persona), mensual/anual.
 *   Tier automático según número de seats. Sin selección manual de plan.
 *   ESTA es la fuente única del pricing — landing, checkout y legal importan de aquí.
 *
 *   | Tier         | Personas | Precio/persona |
 *   | ------------ | -------- | -------------- |
 *   | Team         | 1–19     | $149           |
 *   | Business     | 20–49    | $129           |
 *   | Business+    | 50–99    | $109           |
 *   | Enterprise   | 100+     | desde $89 (negociable, contactar ventas) |
 *
 * Decisión adicional (Pablo 2026-05-20): mínimo de 1 persona en el flow
 * self-serve. El research original tenía mínimo 5 para garantizar venta
 * mínima $745 — ahora se permite 1+ para no friccionar early adopters
 * que quieren probar antes de meter al equipo entero.
 *
 * Para 100+ personas (Enterprise) el flow self-serve se corta y se
 * redirige a ventas — el precio es negociable según volumen, vertical
 * y término del contrato.
 */

export interface SimuladorTier {
  id: "team" | "business" | "business_plus" | "enterprise";
  label: string;
  minSeats: number;
  maxSeats: number | null; // null = sin límite (enterprise)
  pricePerSeatUsd: number; // precio MENSUAL por persona
  selfServe: boolean; // false para enterprise → redirige a ventas
}

export const SIMULADOR_TIERS: SimuladorTier[] = [
  {
    id: "team",
    label: "Team",
    minSeats: 1,
    maxSeats: 19,
    pricePerSeatUsd: 149,
    selfServe: true,
  },
  {
    id: "business",
    label: "Business",
    minSeats: 20,
    maxSeats: 49,
    pricePerSeatUsd: 129,
    selfServe: true,
  },
  {
    id: "business_plus",
    label: "Business+",
    minSeats: 50,
    maxSeats: 99,
    pricePerSeatUsd: 109,
    selfServe: true,
  },
  {
    id: "enterprise",
    label: "Enterprise",
    minSeats: 100,
    maxSeats: null,
    pricePerSeatUsd: 89, // floor mensual, negociable arriba
    selfServe: false,
  },
];

// Anual: cobramos 10 meses y entregamos 12. Resulta en ~17% off.
// El "decimos" comercial es "2 meses gratis" — psicológicamente más fuerte
// que "17% de descuento" (Anchor effect, Kahneman 2011).
export const YEARLY_MONTHS_BILLED = 10;
export const MONTHS_PER_YEAR = 12;
export const YEARLY_DISCOUNT_PCT = Math.round(
  (1 - YEARLY_MONTHS_BILLED / MONTHS_PER_YEAR) * 100,
);

export type BillingInterval = "monthly" | "yearly";

export const SIMULADOR_PRODUCT = {
  label: "Sprint Itera",
  shortLabel: "Sprint",
  description:
    "Diagnóstico operativo de criterio de IA. Caso vivo, reporte ejecutivo por persona y matriz agregada para manager.",
  durationDays: 30,
  minSeats: 1,
  maxSeatsSelfServe: 99,
  enterpriseThreshold: 100,
  salesEmail: "ventas@itera.la",
  features: [
    "Caso vivo de 30 días",
    "Reporte ejecutivo por participante",
    "Dashboard manager + risk events",
    "Cancela cuando quieras",
  ],
};

export function computeSimuladorTier(seats: number): SimuladorTier {
  const tier = SIMULADOR_TIERS.find((t) => {
    if (seats < t.minSeats) return false;
    if (t.maxSeats === null) return true;
    return seats <= t.maxSeats;
  });
  return tier ?? SIMULADOR_TIERS[0];
}

export function normalizeSimuladorSeats(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return SIMULADOR_PRODUCT.minSeats;
  return Math.max(SIMULADOR_PRODUCT.minSeats, Math.trunc(n));
}

export interface SimuladorCheckoutAmount {
  seats: number;
  tier: SimuladorTier;
  interval: BillingInterval;
  pricePerSeatUsd: number; // mensual, igual independiente del interval
  monthlyTotalUsd: number; // seats × pricePerSeatUsd
  periodTotalUsd: number; // lo que Stripe cobra por periodo (mensual=mensual, anual=10 meses)
  yearlyAtMonthlyRateUsd: number; // hipotético: 12 meses pagados al rate mensual
  savingsUsd: number; // ahorro absoluto del anual vs pagar 12 meses
  savingsPct: number; // ~17%
  amountCents: number; // periodTotalUsd × 100 (lo que va a Stripe)
  isEnterprise: boolean;
}

export function isBillingInterval(value: unknown): value is BillingInterval {
  return value === "monthly" || value === "yearly";
}

export function computeSimuladorAmount(
  seatsRaw: unknown,
  intervalRaw: unknown = "monthly",
): SimuladorCheckoutAmount {
  const seats = normalizeSimuladorSeats(seatsRaw);
  const interval: BillingInterval = isBillingInterval(intervalRaw)
    ? intervalRaw
    : "monthly";
  const tier = computeSimuladorTier(seats);

  const monthlyTotalUsd = seats * tier.pricePerSeatUsd;
  const yearlyAtMonthlyRateUsd = monthlyTotalUsd * MONTHS_PER_YEAR;

  // Anual: cobramos 10 meses, "regalamos" 2 → 17% off implícito.
  const periodTotalUsd =
    interval === "yearly"
      ? monthlyTotalUsd * YEARLY_MONTHS_BILLED
      : monthlyTotalUsd;

  const savingsUsd =
    interval === "yearly" ? yearlyAtMonthlyRateUsd - periodTotalUsd : 0;

  return {
    seats,
    tier,
    interval,
    pricePerSeatUsd: tier.pricePerSeatUsd,
    monthlyTotalUsd,
    periodTotalUsd,
    yearlyAtMonthlyRateUsd,
    savingsUsd,
    savingsPct: interval === "yearly" ? YEARLY_DISCOUNT_PCT : 0,
    amountCents: periodTotalUsd * 100,
    isEnterprise: !tier.selfServe,
  };
}

export function formatUsd(amount: number): string {
  return `USD ${amount.toLocaleString("en-US")}`;
}

// ============================================================================
// Compatibilidad con el modelo viejo (deprecated).
// Mantenidos hasta que se limpien todos los call sites del código legacy.
// ============================================================================

export type SimuladorBillingPlan = "diagnostico" | "sprint" | "track";

export function isSimuladorBillingPlan(value: unknown): value is SimuladorBillingPlan {
  return value === "diagnostico" || value === "sprint" || value === "track";
}
