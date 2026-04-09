import type { Metadata } from "next";
import ExperimentLesson from "@/components/experiment/ExperimentLesson";

export const metadata: Metadata = {
  title: "Experiment | Exercise-first Learning",
  description:
    "Demo de lección con flujo tipo Mimo: conceptos cortos intercalados con ejercicios de validación inmediata.",
};

export default function ExperimentPage() {
  return <ExperimentLesson />;
}
