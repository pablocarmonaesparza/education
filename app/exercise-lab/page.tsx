import type { Metadata } from "next";
import { ExerciseLabClient } from "./ExerciseLabClient";

export const metadata: Metadata = {
  title: "exercise lab | Itera",
  description: "Catalogo interno de tipos de ejercicio para casos Itera.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ExerciseLabPage() {
  return <ExerciseLabClient />;
}
