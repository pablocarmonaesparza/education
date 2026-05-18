"use client";

import { useParams } from "next/navigation";
import { RuntimeExperience } from "@/components/simulador/RuntimeExperience";

export default function RuntimePage() {
  const params = useParams<{ case_id: string }>();
  const caseSlug = params?.case_id ?? null;

  return <RuntimeExperience mode="authenticated" caseSlug={caseSlug} />;
}
