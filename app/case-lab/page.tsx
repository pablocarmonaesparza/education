import type { Metadata } from "next";
import { CaseLabClient } from "./CaseLabClient";

export const metadata: Metadata = {
  title: "case lab | Itera",
  description:
    "Laboratorio interno para seleccionar y revisar los primeros casos funcionales del simulador.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CaseLabPage() {
  return <CaseLabClient />;
}
