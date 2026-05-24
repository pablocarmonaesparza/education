"use client";

import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { CaseLabRuntime } from "./CaseLabRuntime";
import { findDemoCase } from "@/lib/simulador/case-lab-cases";

export default function CaseLabRuntimePage() {
  const params = useParams<{ caseId: string }>();
  const demoCase = findDemoCase(params?.caseId ?? "");

  if (!demoCase) {
    notFound();
  }

  return <CaseLabRuntime demoCase={demoCase} />;
}
