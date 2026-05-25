/**
 * Catálogo de modelos para el composer de IA.
 *
 * Extraído del monolito `ExerciseLabClient.tsx` (Codex). Sin cambios.
 */

import type { BrandKey, ModelGroup, ModelOption } from "./types";

export const modelGroups: ModelGroup[] = [
  {
    title: "Modelo interno",
    families: [
      [
        {
          id: "gpt-corporativo",
          label: "GPT Corporativo",
          badge: "IT",
          brand: "internal",
          price: 1,
          intel: 3,
        },
      ],
    ],
  },
  {
    title: "Modelos convencionales",
    families: [
      [
        {
          id: "chatgpt-5.5",
          label: "ChatGPT 5.5",
          brand: "openai",
          price: 3,
          intel: 4,
        },
        {
          id: "chatgpt-5.5-thinking",
          label: "ChatGPT 5.5",
          badge: "Thinking",
          brand: "openai",
          price: 5,
          intel: 5,
        },
      ],
      [
        {
          id: "claude-haiku-4.5",
          label: "Claude Haiku 4.5",
          brand: "anthropic",
          price: 2,
          intel: 3,
        },
        {
          id: "claude-sonnet-4.6",
          label: "Claude Sonnet 4.6",
          brand: "anthropic",
          price: 3,
          intel: 4,
        },
        {
          id: "claude-opus-4.7",
          label: "Claude Opus 4.7",
          brand: "anthropic",
          price: 5,
          intel: 5,
        },
      ],
      [
        {
          id: "gemini-3-flash",
          label: "Gemini 3 Flash",
          brand: "google",
          price: 1,
          intel: 3,
        },
        {
          id: "gemini-3-pro",
          label: "Gemini 3 Pro",
          brand: "google",
          price: 3,
          intel: 5,
        },
      ],
    ],
  },
  {
    title: "Modelos chinos",
    families: [
      [
        {
          id: "qwen-3.6",
          label: "Qwen 3.6",
          brand: "qwen",
          price: 1,
          intel: 3,
        },
      ],
      [
        {
          id: "deepseek-v4-pro",
          label: "Deepseek V4 Pro",
          brand: "deepseek",
          price: 2,
          intel: 4,
        },
      ],
    ],
  },
];

export const defaultModelId = "gpt-corporativo";

export const brandLogo: Record<BrandKey, { light: string; dark?: string } | null> = {
  internal: null,
  openai: { light: "/brands/openai.png", dark: "/brands/openai-dark.png" },
  anthropic: { light: "/brands/anthropic.png" },
  google: { light: "/brands/gemini.png" },
  qwen: { light: "/brands/qwen.png" },
  deepseek: { light: "/brands/deepseek.png" },
};

export function findModelById(id: string): ModelOption {
  for (const group of modelGroups) {
    for (const family of group.families) {
      const found = family.find((model) => model.id === id);
      if (found) return found;
    }
  }
  return modelGroups[0].families[0][0];
}

export const flattenedModels: ModelOption[] = modelGroups.flatMap((group) =>
  group.families.flatMap((family) => family),
);
