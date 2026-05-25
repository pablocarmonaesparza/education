/**
 * Tipos compartidos de los bloques ricos del exercise lab.
 *
 * Extraído del monolito `ExerciseLabClient.tsx` (Codex). Sin cambios de shape.
 */

export type BrandKey =
  | "internal"
  | "openai"
  | "anthropic"
  | "google"
  | "qwen"
  | "deepseek";

export type Level5 = 1 | 2 | 3 | 4 | 5;

export type ModelMetric = "intelligence" | "security" | "cost";

export type VoiceRecState = "idle" | "recording" | "processing" | "error";

export type PromptAttachment = {
  id: string;
  name: string;
  size: number;
  type: string;
};

export type ModelOption = {
  id: string;
  label: string;
  badge?: string;
  brand: BrandKey;
  price: Level5;
  intel: Level5;
};

export type ModelGroup = {
  title: string;
  families: ModelOption[][];
};
