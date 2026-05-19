export type SimuladorBillingPlan = "diagnostico" | "sprint" | "track";

export interface SimuladorPlanConfig {
  id: SimuladorBillingPlan;
  label: string;
  shortLabel: string;
  description: string;
  minSeats: number;
  maxSeats: number;
  baseSeats: number;
  baseAmountUsd: number;
  extraSeatUsd: number;
  capAmountUsd: number;
  durationDays: number;
  subscriptionTier: "fase_1_diagnostic" | "fase_2_sprint" | "fase_3_recurrente";
  featureBullets: string[];
}

export const SIMULADOR_PLANS: Record<SimuladorBillingPlan, SimuladorPlanConfig> = {
  diagnostico: {
    id: "diagnostico",
    label: "Diagnóstico N1",
    shortLabel: "Diagnóstico",
    description:
      "1 caso vivo, reporte ejecutivo por persona y dashboard agregado para manager.",
    minSeats: 5,
    maxSeats: 50,
    baseSeats: 5,
    baseAmountUsd: 4000,
    extraSeatUsd: 100,
    capAmountUsd: 8000,
    durationDays: 30,
    subscriptionTier: "fase_1_diagnostic",
    featureBullets: [
      "1 caso vivo de Marketing/Growth",
      "reporte ejecutivo por participante",
      "dashboard manager + risk events",
    ],
  },
  sprint: {
    id: "sprint",
    label: "Sprint N1+N2",
    shortLabel: "Sprint",
    description:
      "Diagnóstico, practice beats, re-simulación y reporte de progreso del equipo.",
    minSeats: 5,
    maxSeats: 50,
    baseSeats: 5,
    baseAmountUsd: 8000,
    extraSeatUsd: 175,
    capAmountUsd: 15000,
    durationDays: 45,
    subscriptionTier: "fase_2_sprint",
    featureBullets: [
      "8 casos Marketing/Growth",
      "practice beats por gap",
      "re-simulación + transfer delta",
    ],
  },
  track: {
    id: "track",
    label: "Track completo N1-N3",
    shortLabel: "Track completo",
    description:
      "Sprint completo + variantes avanzadas para equipos que ya trabajan con agentes.",
    minSeats: 5,
    maxSeats: 50,
    baseSeats: 5,
    baseAmountUsd: 15000,
    extraSeatUsd: 300,
    capAmountUsd: 24000,
    durationDays: 90,
    subscriptionTier: "fase_3_recurrente",
    featureBullets: [
      "N1 copiloto + N2 workflow",
      "N3 agentes y escalamiento",
      "review humano en riesgos high",
    ],
  },
};

export function planIds(): SimuladorBillingPlan[] {
  return ["diagnostico", "sprint", "track"];
}

export function isSimuladorBillingPlan(
  value: unknown,
): value is SimuladorBillingPlan {
  return (
    value === "diagnostico" ||
    value === "sprint" ||
    value === "track"
  );
}

export function normalizeSeatCount(
  raw: unknown,
  plan: SimuladorPlanConfig,
): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return plan.minSeats;
  return Math.min(plan.maxSeats, Math.max(plan.minSeats, Math.trunc(n)));
}

export function computePlanAmountUsd(
  planId: SimuladorBillingPlan,
  seatsRaw: unknown,
): { seats: number; amountUsd: number; amountCents: number; plan: SimuladorPlanConfig } {
  const plan = SIMULADOR_PLANS[planId];
  const seats = normalizeSeatCount(seatsRaw, plan);
  const extraSeats = Math.max(0, seats - plan.baseSeats);
  const uncapped = plan.baseAmountUsd + extraSeats * plan.extraSeatUsd;
  const amountUsd = Math.min(plan.capAmountUsd, uncapped);
  return {
    seats,
    amountUsd,
    amountCents: amountUsd * 100,
    plan,
  };
}

export function formatUsd(amount: number): string {
  return `USD ${amount.toLocaleString("en-US")}`;
}
