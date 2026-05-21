/**
 * Pricing model B2B del Simulador.
 *
 * Modelo aprobado por Pablo el 2026-05-18 (ver
 * docs/memory/decision_pricing_sprint_marketing_v1.md):
 *
 *   1 producto único (Sprint de 30 días).
 *   Tier automático según número de seats. Sin selección manual de plan.
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
  pricePerSeatUsd: number;
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
    pricePerSeatUsd: 89, // floor, negociable arriba
    selfServe: false,
  },
];

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
    "1 sprint de 30 días",
    "Reporte ejecutivo por participante",
    "Dashboard manager + risk events",
    "Pago único, sin renovación automática",
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
  pricePerSeatUsd: number;
  amountUsd: number;
  amountCents: number;
  isEnterprise: boolean;
}

export function computeSimuladorAmount(seatsRaw: unknown): SimuladorCheckoutAmount {
  const seats = normalizeSimuladorSeats(seatsRaw);
  const tier = computeSimuladorTier(seats);
  const amountUsd = seats * tier.pricePerSeatUsd;
  return {
    seats,
    tier,
    pricePerSeatUsd: tier.pricePerSeatUsd,
    amountUsd,
    amountCents: amountUsd * 100,
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
