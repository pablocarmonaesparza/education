// Convierte un case_assembly (el YAML/objeto del caso) al PlayableCase que juega
// RuntimeExperienceV2. Compartido entre el motor (generate-case) y el registro
// (generate-cases-registry) para no driftar. Remueve campos judge_internal.

const JUDGE_INTERNAL = new Set(["hint", "example", "issue", "goodWhen"]);

export function stripJudge(value) {
  if (Array.isArray(value)) return value.map(stripJudge);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (JUDGE_INTERNAL.has(k)) continue;
      out[k] = stripJudge(v);
    }
    return out;
  }
  return value;
}

export function toPlayable(ca) {
  const sections = (ca.sections ?? []).map((sec) => {
    const slides = [...(sec.slides ?? [])]
      .sort((a, b) => (a.slot ?? 0) - (b.slot ?? 0))
      .map((sl) => ({
        slideId: `${sec.id}-${sl.slot}`,
        blockId: sl.block_id,
        title: sl.title ?? "",
        body: sl.body ?? "",
        caseContext:
          sl.content && typeof sl.content === "object"
            ? stripJudge(sl.content)
            : undefined,
      }));
    return { id: sec.id, name: sec.name ?? sec.id, slides };
  });
  return {
    caseId: ca.case_id ?? "",
    version: ca.version ?? 1,
    meta: ca.meta ?? {},
    managerOutcome: ca.manager_outcome ?? {},
    sections,
    totalSlides: sections.reduce((n, s) => n + s.slides.length, 0),
  };
}
