"use client";

/**
 * /admin/cases — consola staff de los casos del simulador.
 *
 * Une casos bespoke (generated_cases) + biblioteca global (case_templates)
 * con su lifecycle, dueño y uso. Lee /api/admin/cases.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SelectItem } from "@heroui/react";
import {
  AppleBadge,
  AppleButton,
  AppleCard,
  AppleCardBody,
  AppleInput,
  AppleSelect,
  AppleSlider,
  AppleTabs,
  AppleTextarea,
} from "@/components/simulador/apple";
import { DEPARTMENT_OPTIONS } from "@/lib/simulador/cases";
import {
  AdminEmpty,
  AdminLoading,
  AdminMetric,
  ErrorBox,
  LifecyclePill,
  formatDate,
} from "../shared";

type CaseItem = {
  kind: "bespoke" | "global";
  id: string;
  case_id: string;
  title: string;
  level: string | null;
  status: string;
  version: number;
  owner: { id: string; name: string } | null;
  generation_method: string | null;
  sessions: number;
  completed_sessions: number;
  updated_at: string;
};

type CasesResponse = {
  items: CaseItem[];
  summary: {
    total: number;
    active: number;
    draft: number;
    archived: number;
    bespoke: number;
    global: number;
    sessions: number;
  };
};

type StatusFilter = "all" | "active" | "draft" | "archived";

type OrgOption = { id: string; name: string; industry: string | null; teams: Array<{ id: string; name: string }> };

type GenerateResult =
  | { ok: true; case_id: string; title: string; total_slides: number }
  | { ok: false; result: "HUMAN_REVIEW" | "ERROR"; diagnostics?: string };

const ROW_GRID =
  "md:grid md:grid-cols-[2.4fr_1.1fr_0.9fr_1.3fr_0.8fr] md:items-center md:gap-3";

const LEVEL_MARKS = [
  { value: 0, label: "Fundamentos" },
  { value: 1, label: "Automatización" },
  { value: 2, label: "Agentes" },
];
const LEVEL_VALUE_LABEL = ["N1 · Fundamentos", "N2 · Automatización", "N3 · Agentes"];

export default function AdminCasesPage() {
  const [data, setData] = useState<CasesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [orgs, setOrgs] = useState<OrgOption[] | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/cases", { cache: "no-store" });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error ?? `Error ${res.status}.`);
      }
      setData((await res.json()) as CasesResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/orgs", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        const items = (json.items ?? []) as Array<{
          id: string;
          name: string;
          industry: string | null;
          teams?: Array<{ id: string; name: string }>;
        }>;
        if (active) {
          setOrgs(
            items.map((o) => ({
              id: o.id,
              name: o.name,
              industry: o.industry,
              teams: o.teams ?? [],
            })),
          );
        }
      } catch {
        // El picker de orgs es best-effort: si falla, el panel sigue usable
        // sin preselección (staff puede reintentar con "Actualizar").
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const visible = useMemo(() => {
    const items = data?.items ?? [];
    if (filter === "all") return items;
    return items.filter((i) => i.status === filter);
  }, [data, filter]);

  const s = data?.summary;

  return (
    <>
      <main className="surface-canvas min-h-screen pb-24">
        <section className="mx-auto w-full max-w-5xl px-6 pt-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="display ts-display text-[var(--text-primary)]">
              Casos del simulador
            </h1>
            <p className="mt-4 max-w-2xl ts-body leading-[1.55] text-[var(--text-secondary)]">
              Todo lo que existe en la base: casos bespoke por empresa y la
              biblioteca global. Sirve para ver qué está activo, qué sigue en
              borrador y cuánto se ha jugado.
            </p>
          </motion.div>

          {error && <ErrorBox message={error} />}

          <div className="mt-8">
            <GeneratePanel orgs={orgs} onGenerated={load} />
          </div>

          <div className="mt-10 ts-caption-1 font-medium text-[var(--text-tertiary)]">
            Casos existentes
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            <AdminMetric label="Total" value={s?.total ?? 0} compact />
            <AdminMetric label="Activos" value={s?.active ?? 0} compact />
            <AdminMetric label="Borradores" value={s?.draft ?? 0} compact />
            <AdminMetric label="Bespoke" value={s?.bespoke ?? 0} compact />
            <AdminMetric label="Global" value={s?.global ?? 0} compact />
            <AdminMetric label="Sesiones" value={s?.sessions ?? 0} compact />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <AppleTabs
              ariaLabel="Filtrar casos por estado"
              value={filter}
              onChange={(v) => setFilter(v as StatusFilter)}
              items={[
                { id: "all", label: "Todos", badge: s?.total ?? 0 },
                { id: "active", label: "Activos", badge: s?.active ?? 0 },
                { id: "draft", label: "Borradores", badge: s?.draft ?? 0 },
                { id: "archived", label: "Archivados", badge: s?.archived ?? 0 },
              ]}
            />
            <AppleButton
              tone="secondary"
              size="sm"
              className="bg-[var(--surface-2)] text-[var(--text-primary)]"
              onPress={load}
            >
              Actualizar
            </AppleButton>
          </div>

          {data === null && !error && <AdminLoading label="Cargando casos…" />}
          {data !== null && data.items.length === 0 && (
            <AdminEmpty
              label="No hay casos en la base todavía."
              hint="Genera un caso bespoke desde una org o seedea la biblioteca global."
            />
          )}
          {data !== null && data.items.length > 0 && visible.length === 0 && (
            <AdminLoading label="Ningún caso en este estado." />
          )}

          {visible.length > 0 && (
            <div className="mt-8 card-apple bg-[var(--surface)] p-2">
              <div className={`hidden px-4 py-3 ${ROW_GRID}`}>
                <ColLabel>Caso</ColLabel>
                <ColLabel>Dueño</ColLabel>
                <ColLabel>Estado</ColLabel>
                <ColLabel>Uso</ColLabel>
                <ColLabel align="right">Actualizado</ColLabel>
              </div>
              <div className="divide-y divide-[var(--hairline)]">
                {visible.map((c) => (
                  <CaseRow key={`${c.kind}-${c.id}`} item={c} />
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

const ENGINE_STEPS = [
  {
    title: "1. Brief",
    body: "Empresa, industria, departamento, rol, nivel y escenario arman el contexto que recibe el motor.",
  },
  {
    title: "2. Autoría",
    body: "El motor escribe la biblia narrativa, el blueprint y los slides con datos, mensajes y decisiones.",
  },
  {
    title: "3. Gates + juez",
    body: "Validadores deterministas y un juez narrativo revisan el caso; si falla, se autocorrige hasta 3 intentos.",
  },
  {
    title: "4. Resultado",
    body: "Si pasa, queda activo y jugable de inmediato. Si no, va a revisión humana con el diagnóstico exacto.",
  },
];

function GeneratePanel({
  orgs,
  onGenerated,
}: {
  orgs: OrgOption[] | null;
  onGenerated: () => void;
}) {
  const [organizationId, setOrganizationId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [levelStep, setLevelStep] = useState(0);
  const [department, setDepartment] = useState("");
  const [industry, setIndustry] = useState("");
  const [role, setRole] = useState("");
  const [scenario, setScenario] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [showEngine, setShowEngine] = useState(false);

  const selectedOrg = orgs?.find((o) => o.id === organizationId) ?? null;
  const level = LEVEL_VALUE_LABEL[levelStep] ?? LEVEL_VALUE_LABEL[0];
  const departmentLabel =
    DEPARTMENT_OPTIONS.find((d) => d.value === department)?.label ?? "";

  async function generate() {
    if (!organizationId) return;
    setGenerating(true);
    setGenError(null);
    setResult(null);
    try {
      const res = await fetch("/api/admin/cases/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          organization_id: organizationId,
          team_id: teamId || undefined,
          level,
          department: departmentLabel || undefined,
          industry: industry || undefined,
          role: role || undefined,
          scenario: scenario || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok && res.status !== 422) {
        throw new Error(json?.error ?? `Error ${res.status}.`);
      }
      setResult(json as GenerateResult);
      if (json.ok) onGenerated();
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <AppleCard padding="lg">
      <AppleCardBody>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="ts-headline font-semibold text-[var(--text-primary)]">
              Generar caso nuevo
            </h2>
            <p className="mt-1 max-w-2xl ts-subhead text-[var(--text-secondary)]">
              Corre el motor real de generación para una empresa. Tarda unos
              minutos: escribe el caso, lo valida y lo autocorrige antes de
              guardarlo.
            </p>
          </div>
          <AppleButton
            tone="ghost"
            size="sm"
            onPress={() => setShowEngine((v) => !v)}
          >
            {showEngine ? "Ocultar cómo funciona" : "¿Cómo funciona?"}
          </AppleButton>
        </div>

        {showEngine && (
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ENGINE_STEPS.map((step) => (
              <div
                key={step.title}
                className="rounded-2xl bg-[var(--surface-2)] p-4"
              >
                <div className="ts-callout font-semibold text-[var(--text-primary)]">
                  {step.title}
                </div>
                <p className="mt-1 ts-footnote leading-[1.5] text-[var(--text-secondary)]">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <AppleSelect
            label="Organización"
            aria-label="Organización"
            placeholder={orgs === null ? "Cargando…" : "Elige una organización"}
            isDisabled={!orgs || orgs.length === 0}
            selectedKeys={organizationId ? [organizationId] : []}
            onSelectionChange={(keys) => {
              const next = Array.from(keys)[0] as string | undefined;
              setOrganizationId(next ?? "");
              setTeamId("");
            }}
          >
            {(orgs ?? []).map((org) => (
              <SelectItem key={org.id}>{org.name}</SelectItem>
            ))}
          </AppleSelect>

          <AppleSelect
            label="Equipo (opcional)"
            aria-label="Equipo"
            placeholder={
              selectedOrg && selectedOrg.teams.length > 0
                ? "Toda la organización"
                : "Sin equipos en esta org"
            }
            isDisabled={!selectedOrg || selectedOrg.teams.length === 0}
            selectedKeys={teamId ? [teamId] : []}
            onSelectionChange={(keys) => {
              const next = Array.from(keys)[0] as string | undefined;
              setTeamId(next ?? "");
            }}
          >
            {(selectedOrg?.teams ?? []).map((team) => (
              <SelectItem key={team.id}>{team.name}</SelectItem>
            ))}
          </AppleSelect>

          <AppleSelect
            label="Departamento"
            aria-label="Departamento"
            placeholder="Deja vacío para inferirlo del contexto"
            selectedKeys={department ? [department] : []}
            onSelectionChange={(keys) => {
              const next = Array.from(keys)[0] as string | undefined;
              setDepartment(next ?? "");
            }}
          >
            {DEPARTMENT_OPTIONS.map((d) => (
              <SelectItem key={d.value}>{d.label}</SelectItem>
            ))}
          </AppleSelect>

          <AppleInput
            label="Industria"
            aria-label="Industria"
            placeholder={selectedOrg?.industry ?? "servicios (default)"}
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          />

          <AppleInput
            label="Rol del participante"
            aria-label="Rol del participante"
            placeholder="Analista de Marketing"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />

          <div className="lg:col-span-2">
            <AppleSlider
              label="Nivel"
              aria-label="Nivel"
              minValue={0}
              maxValue={2}
              step={1}
              marks={LEVEL_MARKS}
              value={levelStep}
              onChange={(v) => setLevelStep(Array.isArray(v) ? v[0] : v)}
              getValue={() => level}
            />
          </div>

          <div className="lg:col-span-2">
            <AppleTextarea
              label="Escenario (opcional)"
              aria-label="Escenario"
              placeholder="Déjalo vacío y el motor arma un escenario a partir de la empresa, industria y departamento."
              minRows={3}
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <AppleButton
            isDisabled={!organizationId || generating}
            onPress={generate}
          >
            {generating ? "Generando… (unos minutos)" : "Generar caso"}
          </AppleButton>
          {generating && (
            <span className="ts-footnote text-[var(--text-tertiary)]">
              El motor corre ~8 llamadas de modelo con autocorrección. No
              cierres esta pestaña.
            </span>
          )}
        </div>

        {genError && (
          <div className="mt-4 rounded-xl bg-[var(--band-b-bg)] p-4 ts-callout text-[var(--band-b-text)]">
            {genError}
          </div>
        )}

        {result && result.ok && (
          <div className="mt-4 rounded-xl bg-[var(--band-a-bg)] p-4">
            <div className="ts-callout font-semibold text-[var(--band-a-text)]">
              Caso generado: {result.title}
            </div>
            <p className="mt-1 ts-footnote text-[var(--band-a-text)]">
              {result.total_slides} slides · quedó activo en la lista de abajo.
            </p>
            <Link
              href={`/case/${result.case_id}`}
              className="mt-2 inline-block ts-footnote font-medium text-[var(--band-a-text)] underline"
            >
              Jugar este caso →
            </Link>
          </div>
        )}

        {result && !result.ok && (
          <div className="mt-4 rounded-xl bg-[var(--band-m-bg)] p-4">
            <div className="ts-callout font-semibold text-[var(--band-m-text)]">
              {result.result === "HUMAN_REVIEW"
                ? "El motor no pasó sus propios gates de calidad."
                : "Error de infraestructura al generar."}
            </div>
            {result.diagnostics && (
              <pre className="mt-2 max-h-48 overflow-auto ts-caption-1 leading-[1.5] text-[var(--band-m-text)]">
                {result.diagnostics}
              </pre>
            )}
          </div>
        )}
      </AppleCardBody>
    </AppleCard>
  );
}

function ColLabel({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <div
      className={`ts-caption-1 font-medium text-[var(--text-tertiary)] ${
        align === "right" ? "text-right" : ""
      }`}
    >
      {children}
    </div>
  );
}

function CaseRow({ item }: { item: CaseItem }) {
  const meta = [
    item.case_id,
    `v${item.version}`,
    item.level ?? null,
    item.generation_method ?? null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className={`gap-2 px-4 py-4 ${ROW_GRID}`}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate ts-callout font-medium text-[var(--text-primary)]">
            {item.title}
          </span>
          <AppleBadge tone={item.kind === "bespoke" ? "accent" : "neutral"}>
            {item.kind === "bespoke" ? "bespoke" : "global"}
          </AppleBadge>
        </div>
        <div className="mono mt-1 truncate ts-caption-1 text-[var(--text-tertiary)]">
          {meta}
        </div>
      </div>

      <div className="mt-2 ts-subhead text-[var(--text-secondary)] md:mt-0">
        <span className="eyebrow mr-2 md:hidden">Dueño</span>
        {item.owner ? item.owner.name : "Global"}
      </div>

      <div className="mt-2 md:mt-0">
        <span className="eyebrow mr-2 md:hidden">Estado</span>
        <LifecyclePill status={item.status} />
      </div>

      <div className="mt-2 ts-subhead text-[var(--text-secondary)] md:mt-0">
        <span className="eyebrow mr-2 md:hidden">Uso</span>
        {item.sessions === 0 ? (
          <span className="text-[var(--text-tertiary)]">sin jugar</span>
        ) : (
          <>
            {item.sessions} jugadas · {item.completed_sessions} compl.
          </>
        )}
      </div>

      <div className="mt-2 ts-footnote text-[var(--text-tertiary)] md:mt-0 md:text-right">
        <span className="eyebrow mr-2 md:hidden">Actualizado</span>
        {formatDate(item.updated_at)}
      </div>
    </div>
  );
}
