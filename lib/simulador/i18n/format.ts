export type SimuladorLocale = "es-MX" | "es-CO" | "es-AR" | "pt-BR" | "es-419";

const SUPPORTED: SimuladorLocale[] = ["es-MX", "es-CO", "es-AR", "pt-BR", "es-419"];

export function normalizeLocale(locale?: string | null): SimuladorLocale {
  if (!locale) return "es-MX";
  const normalized = locale.replace("_", "-");
  const exact = SUPPORTED.find((item) => item.toLowerCase() === normalized.toLowerCase());
  if (exact) return exact;
  if (normalized.toLowerCase().startsWith("pt-br")) return "pt-BR";
  if (normalized.toLowerCase().startsWith("es-co")) return "es-CO";
  if (normalized.toLowerCase().startsWith("es-ar")) return "es-AR";
  if (normalized.toLowerCase().startsWith("es")) return "es-MX";
  return "es-MX";
}

export function formatCurrencyUsd(
  amountUsd: number,
  locale?: string | null,
  options?: { maximumFractionDigits?: number },
) {
  return new Intl.NumberFormat(normalizeLocale(locale), {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: options?.maximumFractionDigits ?? 0,
  }).format(amountUsd);
}

export function formatDateLatam(
  value: string | Date | null | undefined,
  locale?: string | null,
  options?: Intl.DateTimeFormatOptions,
) {
  if (!value) return "sin fecha";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "sin fecha";
  return new Intl.DateTimeFormat(normalizeLocale(locale), {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  }).format(date);
}

export function formatNumberLatam(
  value: number,
  locale?: string | null,
  options?: Intl.NumberFormatOptions,
) {
  return new Intl.NumberFormat(normalizeLocale(locale), options).format(value);
}
