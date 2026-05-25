import type { Metadata } from "next";
import { CaseTemplateClient } from "./CaseTemplateClient";

export const metadata: Metadata = {
  title: "Case template | Itera",
  description:
    "Plantilla canónica de un caso del simulador: 6 secciones, qué es fijo, qué es variable. Para afinar la metodología de diseño antes de cablear contenido.",
  robots: { index: false, follow: false },
};

export default function CaseTemplatePage() {
  return <CaseTemplateClient />;
}
