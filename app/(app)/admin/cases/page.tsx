"use client";

/**
 * /admin/cases — consola staff de los casos del simulador (R-29).
 *
 * Inventario completo de case_templates en cualquier estado (biblioteca
 * global + casos por organización) con su uso real. Lee /api/admin/cases.
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
  AppleEmptyState,
  AppleErrorState,
  AppleInput,
  AppleSelect,
  AppleSkeleton,
  AppleSlider,
  AppleTabs,
  AppleTextarea,
} from "@/components/simulador/apple";
import { departmentLabel } from "@/lib/simulador/case-catalog";
import { LifecyclePill } from "../shared";

type AdminCaseItem = {
  id: string;
  slug: string;
  title: string;
  status: string;
  version: number;
  level_primary: string | null;
  career_key: string | null;
  duration_estimate_min: number | null;
  organization_id: string | null;
  organization_name: string | null;
  sessions_total: number;
  sessions_completed: number;
};

type CasesResponse = { cases: AdminCaseItem[] };

type StatusFilter = "all" | "active" | "draft" | "archived";

type OrgOption = {
  id: string;
  name: string;
  industry: string | null;
  teams: Array<{ id: string; name: string }>;
};

type GenerateResult =
  | { ok: true; case_id: string; title: string; total_slides: number }
  | { ok: false; result: "HUMAN_REVIEW" | "ERROR"; diagnostics?: string };

const ROW_GRID =
  "md:grid md:grid-cols-[2.2fr_1.8fr_0.9fr_0.6fr_1.2fr_0.7fr_0.9fr] md:items-center md:gap-3";

// Opciones del panel de generación (brief del motor). Antes vivían en el mock
// lib/simulador/cases.ts; el catálogo real ya no las expone, así que son
// locales a esta consola.
const DEPARTMENT_OPTIONS: { value: string; label: string }[] = [
  { value: "marketing", label: "Marketing" },
  { value: "growth", label: "Growth" },
  { value: "sales", label: "Ventas" },
  { value: "customer_success", label: "Customer Success" },
  { value: "operations", label: "Operaciones" },
  { value: "finance", label: "Finanzas" },
  { value: "hr", label: "HR" },
  { value: "legal", label: "Legal" },
  { value: "product", label: "Producto" },
  { value: "engineering_light", label: "Ingeniería" },
  { value: "leadership", label: "Liderazgo" },
];

const LEVEL_MARKS = [
  { value: 0, label: "Fundamentos" },
  { value: 1, label: "Automatización" },
  { value: 2, label: "Agentes" },
];
const LEVEL_VALUE_LABEL = ["N1 · Fundamentos", "N2 · Automatización", "N3 · Agentes"];

/** level_primary crudo (1, "2", "N3 · …") → etiqueta corta N1/N2/N3. */
function levelShort(raw: string | null): string | null {
  if (!raw) return null;
  const digit = raw.match(/[123]/)?.[0];
  return digit ? `N${digit}` : raw;
}

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

  const counts = useMemo(() => {
    const cases = data?.cases ?? [];
    const byStatus = (status: string) =>
      cases.filter((c) => c.status === status).length;
    return {
      total: cases.length,
      active: byStatus("active"),
      draft: byStatus("draft"),
      archived: byStatus("archived"),
    };
  }, [data]);

  const visible = useMemo(() => {
    const cases = data?.cases ?? [];
    if (filter === "all") return cases;
    return cases.filter((c) => c.status === filter);
  }, [data, filter]);

  const loading = data === null && error === null;

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
              Todos los casos que existen en la base, en cualquier estado: la
              biblioteca global y los casos por organización, con cuánto se ha
              jugado cada uno.
            </p>
          </motion.div>

          <div className="mt-8">
            <GeneratePanel orgs={orgs} onGenerated={load} />
          </div>

          <div className="mt-10 ts-caption-1 font-medium text-[var(--text-tertiary)]">
            Casos existentes
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <AppleTabs
              ariaLabel="Filtrar casos por estado"
              value={filter}
              onChange={(v) => setFilter(v as StatusFilter)}
              items={[
                { id: "all", label: "Todos", badge: counts.total },
                { id: "active", label: "Activos", badge: counts.active },
                { id: "draft", label: "Borradores", badge: counts.draft },
                { id: "archived", label: "Archivados", badge: counts.archived },
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

          {loading && <CasesTableSkeleton />}

          {error !== null && (
            <div className="mt-8">
              <AppleErrorState
                title="No pudimos cargar los casos"
                body={error}
                actionLabel="Reintentar"
                onAction={load}
              />
            </div>
          )}

          {data !== null && data.cases.length === 0 && (
            <div className="mt-8">
              <AppleEmptyState
                title="No hay casos en la base"
                description="Genera un caso para una organización con el panel de arriba, o corre el pipeline de seed de la biblioteca global."
                action={
                  <AppleButton tone="secondary" size="sm" onPress={load}>
                    Actualizar
                  </AppleButton>
                }
              />
            </div>
          )}

          {data !== null && data.cases.length > 0 && visible.length === 0 && (
            <div className="mt-12 ts-callout text-[var(--text-secondary)]">
              Ningún caso en este estado.
            </div>
          )}

          {visible.length > 0 && (
            <div className="mt-8 card-apple bg-[var(--surface)] p-2">
              <div className={`hidden px-4 py-3 ${ROW_GRID}`}>
                <ColLabel>Título</ColLabel>
                <ColLabel>Slug</ColLabel>
                <ColLabel>Estado</ColLabel>
                <ColLabel>Nivel</ColLabel>
                <ColLabel>Org</ColLabel>
                <ColLabel align="right">Sesiones</ColLabel>
                <ColLabel align="right">Completadas</ColLabel>
              </div>
              <div className="divide-y divide-[var(--hairline)]">
                {visible.map((c) => (
                  <CaseRow key={c.id} item={c} />
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

function CasesTableSkeleton() {
  return (
    <div className="mt-8 card-apple bg-[var(--surface)] p-2">
      <div className="divide-y divide-[var(--hairline)]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`gap-2 px-4 py-4 ${ROW_GRID}`}>
            <div className="min-w-0">
              <AppleSkeleton className="h-5 w-3/5" />
              <AppleSkeleton className="mt-2 h-4 w-2/5" />
            </div>
            <AppleSkeleton className="mt-3 h-4 w-4/5 md:mt-0" />
            <AppleSkeleton className="mt-3 h-5 w-16 md:mt-0" />
            <AppleSkeleton className="hidden h-4 w-8 md:block" />
            <AppleSkeleton className="hidden h-4 w-24 md:block" />
            <AppleSkeleton className="hidden h-4 w-8 md:block md:justify-self-end" />
            <AppleSkeleton className="hidden h-4 w-10 md:block md:justify-self-end" />
          </div>
        ))}
      </div>
    </div>
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
  const departmentText =
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
          department: departmentText || undefined,
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

function CaseRow({ item }: { item: AdminCaseItem }) {
  const level = levelShort(item.level_primary);
  const meta = [
    `v${item.version}`,
    item.career_key ? departmentLabel(item.career_key) : null,
    item.duration_estimate_min !== null
      ? `${item.duration_estimate_min} min`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/admin/cases/${encodeURIComponent(item.slug)}`}
      className={`gap-2 px-4 py-4 transition-colors hover:bg-[var(--surface-2)] ${ROW_GRID}`}
    >
      <div className="min-w-0">
        <div className="truncate ts-callout font-medium text-[var(--text-primary)]">
          {item.title}
        </div>
        <div className="mt-1 truncate ts-caption-1 text-[var(--text-tertiary)]">
          {meta}
        </div>
      </div>

      <div className="mono mt-2 truncate ts-caption-1 text-[var(--text-secondary)] md:mt-0">
        <span className="eyebrow mr-2 md:hidden">Slug</span>
        {item.slug}
      </div>

      <div className="mt-2 md:mt-0">
        <span className="eyebrow mr-2 md:hidden">Estado</span>
        <LifecyclePill status={item.status} />
      </div>

      <div className="mt-2 ts-subhead text-[var(--text-secondary)] md:mt-0">
        <span className="eyebrow mr-2 md:hidden">Nivel</span>
        {level ?? <span className="text-[var(--text-tertiary)]">sin nivel</span>}
      </div>

      <div className="mt-2 truncate ts-subhead text-[var(--text-secondary)] md:mt-0">
        <span className="eyebrow mr-2 md:hidden">Org</span>
        {item.organization_id === null ? (
          <span className="text-[var(--text-tertiary)]">global</span>
        ) : (
          item.organization_name ?? "org sin nombre"
        )}
      </div>

      <div className="mono mt-2 ts-subhead text-[var(--text-secondary)] md:mt-0 md:text-right">
        <span className="eyebrow mr-2 md:hidden">Sesiones</span>
        {item.sessions_total === 0 ? (
          <span className="text-[var(--text-tertiary)]">sin jugar</span>
        ) : (
          item.sessions_total
        )}
      </div>

      <div className="mono mt-2 ts-subhead text-[var(--text-secondary)] md:mt-0 md:text-right">
        <span className="eyebrow mr-2 md:hidden">Completadas</span>
        {item.sessions_completed === 0 ? (
          <span className="text-[var(--text-tertiary)]">0</span>
        ) : (
          item.sessions_completed
        )}
      </div>
    </Link>
  );
}
