"use client";

/**
 * ui-primitives — promovidos al design system en `AppleExercisePrimitives`.
 * Este archivo queda como re-export para no romper los imports existentes
 * (`import { GuidedOption, Range10, … } from "../_shared/ui-primitives"`).
 * La fuente única vive en
 * `components/simulador/apple/AppleExercisePrimitives.tsx`.
 */
export {
  Label,
  ChoiceButton,
  GuidedOption,
  GuidedInputCard,
  GuidedSlideOptions,
  Range10,
  ProcessAnswer,
  CompareCard,
  AgentBriefLine,
} from "@/components/simulador/apple";
