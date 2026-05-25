/**
 * Lógica de tradeoffs para el composer guiado:
 *   - elige el modelo recomendado por (autonomy, security, cost)
 *   - rebalancea cuando el usuario sube uno por encima del cap
 *   - genera labels descriptivos para prioridad/budget
 *
 * Extraído del monolito `ExerciseLabClient.tsx` (Codex). Sin cambios.
 */

import type { ModelMetric } from "./types";

export function chooseGuidedModelId({
  autonomy,
  security,
  cost,
}: {
  autonomy: number;
  security: number;
  cost: number;
}) {
  if (security <= 10) return autonomy >= 60 || cost >= 20 ? "deepseek-v4-pro" : "qwen-3.6";
  if (security <= 30) return cost <= 20 ? "qwen-3.6" : "deepseek-v4-pro";

  const profiles = [
    { id: "gpt-corporativo", autonomy: 30, security: 95, cost: 45 },
    { id: "chatgpt-5.5", autonomy: 60, security: 70, cost: 60 },
    { id: "chatgpt-5.5-thinking", autonomy: 82, security: 82, cost: 88 },
    { id: "claude-haiku-4.5", autonomy: 42, security: 52, cost: 30 },
    { id: "claude-sonnet-4.6", autonomy: 76, security: 66, cost: 72 },
    { id: "claude-opus-4.7", autonomy: 96, security: 82, cost: 100 },
    { id: "gemini-3-flash", autonomy: 45, security: 38, cost: 15 },
    { id: "gemini-3-pro", autonomy: 70, security: 58, cost: 55 },
    { id: "qwen-3.6", autonomy: 50, security: 10, cost: 10 },
    { id: "deepseek-v4-pro", autonomy: 66, security: 24, cost: 25 },
  ];

  return profiles
    .map((profile) => ({
      id: profile.id,
      distance:
        Math.abs(profile.autonomy - autonomy) * 1.05 +
        Math.abs(profile.security - security) * 1.25 +
        Math.abs(profile.cost - cost),
    }))
    .sort((a, b) => a.distance - b.distance)[0].id;
}

export function priorityLabel(value: number) {
  if (value >= 70) return "alta";
  if (value >= 40) return "media";
  return "baja";
}

export function budgetLabel(value: number) {
  if (value >= 70) return `alto (${value}/100)`;
  if (value >= 40) return `medio (${value}/100)`;
  return `bajo (${value}/100)`;
}

function roundTo10(value: number) {
  return Math.max(0, Math.min(100, Math.round(value / 10) * 10));
}

export function rebalanceModelTradeoffs(
  current: { autonomy: number; security: number; cost: number },
  metric: ModelMetric,
  rawValue: number,
) {
  let autonomy = current.autonomy;
  let security = current.security;
  let cost = current.cost;
  const value = roundTo10(rawValue);

  if (metric === "intelligence") autonomy = value;
  if (metric === "security") security = value;
  if (metric === "cost") cost = value;

  const cap = 120 + cost;
  const pressure = autonomy + security;

  if (pressure <= cap) {
    return { autonomy, security, cost };
  }

  if (metric === "cost") {
    let excess = pressure - cap;
    while (excess > 0 && (autonomy > 0 || security > 0)) {
      if (autonomy >= security && autonomy > 0) {
        autonomy = roundTo10(autonomy - 10);
      } else if (security > 0) {
        security = roundTo10(security - 10);
      }
      excess -= 10;
    }
    return { autonomy, security, cost };
  }

  return {
    autonomy,
    security,
    cost: roundTo10(pressure - 120),
  };
}
