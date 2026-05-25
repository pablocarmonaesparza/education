import type { Metadata } from "next";
import { CaseTemplateClient } from "./CaseTemplateClient";

export const metadata: Metadata = {
  title: "Case template | Itera",
  description:
    "Plantilla vacía con los 11 bloques canónicos rendereados en secuencia. Sirve de scaffold para iterar la metodología de casos antes de cablear contenido.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CaseTemplatePage() {
  return <CaseTemplateClient />;
}
