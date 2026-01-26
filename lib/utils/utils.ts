import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Resumen del proyecto en máximo ~2 líneas (~95 caracteres), truncado en palabra. */
export function summarizeProject(idea: string, maxChars = 95): string {
  const t = (idea || '').trim();
  if (!t || t.length <= maxChars) return t;
  const slice = t.slice(0, maxChars);
  const last = slice.lastIndexOf(' ');
  const cut = last > maxChars * 0.6 ? last : maxChars;
  return slice.slice(0, cut).trim() + '…';
}
