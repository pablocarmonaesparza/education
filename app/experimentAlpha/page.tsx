import type { Metadata } from "next";
import ExperimentLesson from "@/components/experiment/ExperimentLesson";
import { LESSON_32_STEPS } from "@/components/experiment/lesson32Steps";

export const metadata: Metadata = {
  title: "Lección 32 | Introducción a ChatGPT",
  description:
    "Lección 32 del curso Itera: Introducción a ChatGPT.",
};

export default function ExperimentAlphaPage() {
  return <ExperimentLesson steps={LESSON_32_STEPS} />;
}
