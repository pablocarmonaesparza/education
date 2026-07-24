"use client";

/**
 * /empresa — settings de la organización (solo manager / org_admin).
 *
 * Consume el contrato de datos de Codex:
 *   - GET  /api/orgs/current/settings  → identidad + company_profile + billing
 *   - PATCH /api/orgs/current/settings → autosave de identidad, website (lock
 *     una sola vez) y archivos PDF (máx. un cambio por mes)
 *   - POST /api/stripe/create-portal-session { return_path: "/empresa" } para
 *     gestionar/cancelar billing en el portal de Stripe.
 *
 * Reglas de UX (audit Pablo 2026-06-23):
 *   - Autosave: sin botón "Guardar"/"Cancelar". Indicador de estado en header.
 *   - Sin contornos como separador de secciones — dividers + whitespace.
 *   - Website editable solo hasta confirmarse; luego bloqueado.
 *   - Archivos solo PDF, restricción de un cambio por mes.
 *   - Cancelar/gestionar billing dentro de Itera vía portal de Stripe.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { SelectItem } from "@heroui/react";
import {
  AppleBadge,
  AppleButton,
  AppleErrorState,
  AppleIcon,
  AppleInput,
  AppleSelect,
  AppleSkeleton,
} from "@/components/simulador/apple";
import { CancelSubscriptionFlow } from "./CancelSubscriptionFlow";

const INDUSTRY_OPTIONS = [
  { value: "saas_b2b", label: "SaaS B2B" },
  { value: "ecommerce", label: "Ecommerce" },
  { value: "servicios_profesionales", label: "Professional services" },
  { value: "fintech", label: "Fintech" },
  { value: "retail", label: "Retail" },
  { value: "education", label: "Education" },
  { value: "otro", label: "Other" },
];

// Los `value` son identificadores persistidos en organizations.region — no
// cambian. Solo se traduce el label. La LISTA sigue siendo LATAM-first: para
// el pivote a EEUU necesita rediseño de producto (decisión de Pablo), no
// traducción.
const REGION_OPTIONS = [
  { value: "us", label: "United States" },
  { value: "MX", label: "Mexico" },
  { value: "CO", label: "Colombia" },
  { value: "AR", label: "Argentina" },
  { value: "CL", label: "Chile" },
  { value: "BR", label: "Brazil" },
  { value: "PE", label: "Peru" },
  { value: "other_latam", label: "Other LATAM" },
];

const SIZE_OPTIONS = [
  { value: "1-10", label: "1–10 employees" },
  { value: "11-50", label: "11–50 employees" },
  { value: "51-100", label: "51–100 employees" },
  { value: "101-300", label: "101–300 employees" },
  { value: "301-500", label: "301–500 employees" },
  { value: "501+", label: "501+ employees" },
];

interface CompanyFile {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface Settings {
  organization: {
    id: string;
    name: string;
    industry: string | null;
    region: string | null;
    company_size_key: string | null;
    company_profile: {
      website_url: string | null;
      website_locked: boolean;
      files: CompanyFile[];
      files_can_change_this_month: boolean;
    };
  };
  subscription: {
    status?: string;
    tier?: string;
    seats?: number;
    price_usd_total?: number;
    current_period_end?: string;
  } | null;
  billing: { can_open_portal: boolean; portal_return_path: string };
}

type SaveState = "idle" | "saving" | "saved" | "error";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="ts-headline font-semibold text-[var(--text-primary)]">
      {children}
    </h2>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="ts-footnote font-medium text-[var(--text-secondary)]">
      {children}
    </label>
  );
}

function Divider() {
  return <div aria-hidden className="border-t border-[var(--hairline)]" />;
}

export default function EmpresaPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [websiteDraft, setWebsiteDraft] = useState("");
  const [portalLoading, setPortalLoading] = useState(false);
  const nameTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const reload = useCallback(async () => {
    setLoadError(null);
    setSettings(null);
    try {
      const res = await fetch("/api/orgs/current/settings");
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error ?? "We couldn't load your organization.");
      setSettings(data as Settings);
      setWebsiteDraft((data as Settings).organization.company_profile.website_url ?? "");
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const patch = useCallback(async (body: Record<string, unknown>) => {
    setSaveState("saving");
    setFieldError(null);
    try {
      const res = await fetch("/api/orgs/current/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveState("error");
        setFieldError(data.message ?? data.error ?? "We couldn't save.");
        return false;
      }
      setSettings(data as Settings);
      setSaveState("saved");
      return true;
    } catch {
      setSaveState("error");
      setFieldError("We couldn't save. Check your connection.");
      return false;
    }
  }, []);

  function updateOrgField(field: string, value: string) {
    setSettings((prev) =>
      prev ? { ...prev, organization: { ...prev.organization, [field]: value } } : prev,
    );
  }

  function onNameChange(value: string) {
    updateOrgField("name", value);
    if (nameTimer.current) clearTimeout(nameTimer.current);
    nameTimer.current = setTimeout(() => {
      if (value.trim()) patch({ name: value.trim() });
    }, 700);
  }

  function onSelectChange(field: string, value: string) {
    updateOrgField(field, value);
    patch({ [field]: value });
  }

  async function confirmWebsite() {
    const value = websiteDraft.trim();
    if (!value) return;
    await patch({ website_url: value });
  }

  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!picked.length || !settings) return;
    const nonPdf = picked.find(
      (f) => f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf"),
    );
    if (nonPdf) {
      setFieldError("Only PDF files are accepted.");
      setSaveState("error");
      return;
    }
    const next = [
      ...settings.organization.company_profile.files,
      ...picked.map((f) => ({ id: `${f.name}:${f.size}`, name: f.name, size: f.size, type: "application/pdf" })),
    ].slice(0, 10);
    patch({ files: next });
  }

  function removeFile(id: string) {
    if (!settings) return;
    const next = settings.organization.company_profile.files.filter((f) => f.id !== id);
    patch({ files: next });
  }

  async function openPortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ return_path: "/empresa" }),
      });
      const data = await res.json();
      if (res.ok && data.sessionUrl) {
        window.location.href = data.sessionUrl as string;
        return;
      }
      setFieldError(data.error ?? "We couldn't open the billing portal.");
      setSaveState("error");
    } catch {
      setFieldError("We couldn't open the billing portal.");
      setSaveState("error");
    } finally {
      setPortalLoading(false);
    }
  }

  if (loadError) {
    return (
      <main className="surface-canvas min-h-[calc(100vh-3.5rem)] grid place-items-center px-6">
        <div className="w-full max-w-[420px]">
          <AppleErrorState
            title="We couldn't load your organization"
            body={loadError}
            actionLabel="Try again"
            onAction={reload}
          />
        </div>
      </main>
    );
  }

  if (!settings) {
    return (
      <main className="surface-canvas min-h-[calc(100vh-3.5rem)] px-6 py-8 sm:px-10">
        <div className="mx-auto w-full max-w-[760px] space-y-4">
          <AppleSkeleton className="h-9 w-40" />
          <AppleSkeleton className="h-32 w-full rounded-[var(--radius-lg)]" />
          <AppleSkeleton className="h-40 w-full rounded-[var(--radius-lg)]" />
        </div>
      </main>
    );
  }

  const profile = settings.organization.company_profile;
  const sub = settings.subscription;
  const renewsLabel = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const saveLabel =
    saveState === "saving"
      ? "Saving…"
      : saveState === "saved"
        ? "Changes saved"
        : saveState === "error"
          ? "Couldn't save"
          : "";

  return (
    <main className="surface-canvas min-h-[calc(100vh-3.5rem)] px-6 py-8 sm:px-10">
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-8">
        <header>
          <div className="flex items-center justify-between gap-3">
            <h1 className="display display-tight ts-title-1 sm:ts-display text-[var(--text-primary)]">
              Organization
            </h1>
            <span
              role="status"
              aria-live="polite"
              className={`ts-caption-1 ${
                saveState === "error"
                  ? "text-[var(--band-b-text)]"
                  : "text-[var(--text-tertiary)]"
              }`}
            >
              {saveLabel}
            </span>
          </div>
          <p className="mt-2 ts-subhead text-[var(--text-secondary)] leading-[1.55]">
            Your organization&apos;s identity, context, and plan. Changes save
            automatically. Only visible to org admins.
          </p>
        </header>

        {fieldError && (
          <div className="rounded-[var(--radius-md)] bg-[var(--band-b-bg)] px-4 py-3 ts-footnote text-[var(--band-b-text)]">
            {fieldError}
          </div>
        )}

        {/* ---- Identidad ---- */}
        <section className="flex flex-col gap-4">
          <SectionTitle>Identity</SectionTitle>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Organization name</FieldLabel>
            <AppleInput
              value={settings.organization.name ?? ""}
              onValueChange={onNameChange}
              placeholder="Organization name"
              size="md"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Industry</FieldLabel>
              <AppleSelect
                aria-label="Industry"
                placeholder="Industry"
                selectedKeys={
                  settings.organization.industry ? [settings.organization.industry] : []
                }
                onSelectionChange={(keys) => {
                  const next = Array.from(keys)[0] as string | undefined;
                  if (next) onSelectChange("industry", next);
                }}
                size="md"
              >
                {INDUSTRY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value}>{opt.label}</SelectItem>
                ))}
              </AppleSelect>
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Primary region</FieldLabel>
              <AppleSelect
                aria-label="Primary region"
                placeholder="Primary region"
                selectedKeys={
                  settings.organization.region ? [settings.organization.region] : []
                }
                onSelectionChange={(keys) => {
                  const next = Array.from(keys)[0] as string | undefined;
                  if (next) onSelectChange("region", next);
                }}
                size="md"
              >
                {REGION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value}>{opt.label}</SelectItem>
                ))}
              </AppleSelect>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 sm:max-w-[50%] sm:pr-2">
            <FieldLabel>Team size</FieldLabel>
            <AppleSelect
              aria-label="Team size"
              placeholder="Team size"
              selectedKeys={
                settings.organization.company_size_key
                  ? [settings.organization.company_size_key]
                  : []
              }
              onSelectionChange={(keys) => {
                const next = Array.from(keys)[0] as string | undefined;
                if (next) onSelectChange("company_size_key", next);
              }}
              size="md"
            >
              {SIZE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value}>{opt.label}</SelectItem>
              ))}
            </AppleSelect>
          </div>
        </section>

        <Divider />

        {/* ---- Contexto: website + archivos ---- */}
        <section className="flex flex-col gap-4">
          <SectionTitle>Company context</SectionTitle>
          <p className="-mt-1 ts-footnote text-[var(--text-tertiary)] leading-[1.5]">
            This helps tailor the cases to your team. The website is confirmed
            once; files can change once a month.
          </p>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Website</FieldLabel>
            {profile.website_locked ? (
              <div className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] bg-[var(--surface-2)] px-3.5 py-2.5">
                <span className="ts-body truncate text-[var(--text-primary)]">
                  {profile.website_url}
                </span>
                <span className="inline-flex flex-none items-center gap-1.5 ts-caption-1 text-[var(--text-tertiary)]">
                  <AppleIcon name="check" size="sm" />
                  Confirmed
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row">
                <AppleInput
                  value={websiteDraft}
                  onValueChange={setWebsiteDraft}
                  placeholder="Website"
                  size="md"
                  type="url"
                  inputMode="url"
                />
                <AppleButton
                  type="button"
                  tone="secondary"
                  size="lg"
                  onPress={confirmWebsite}
                  isDisabled={!websiteDraft.trim() || saveState === "saving"}
                  className="h-11 flex-none justify-center px-5 shadow-none sm:w-auto"
                >
                  Confirm
                </AppleButton>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel>Context files (PDF)</FieldLabel>
            {profile.files.length > 0 && (
              <ul className="flex flex-col gap-1.5">
                {profile.files.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] bg-[var(--surface-2)] px-3.5 py-2.5"
                  >
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <AppleIcon name="fileText" size="sm" />
                      <span className="ts-subhead truncate text-[var(--text-primary)]">
                        {f.name}
                      </span>
                    </span>
                    {profile.files_can_change_this_month && (
                      <AppleButton
                        size="inline"
                        tone="danger"
                        onPress={() => removeFile(f.id)}
                        aria-label={`Remove ${f.name}`}
                        className="flex-none ts-caption-1"
                      >
                        Remove
                      </AppleButton>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              multiple
              hidden
              onChange={onPickFiles}
            />
            {profile.files_can_change_this_month ? (
              <AppleButton
                type="button"
                tone="secondary"
                size="lg"
                onPress={() => fileInputRef.current?.click()}
                className="h-11 w-full justify-center px-5 shadow-none sm:w-auto"
              >
                <span className="inline-flex items-center gap-2">
                  <AppleIcon name="fileText" size="sm" />
                  Attach files (PDF)
                </span>
              </AppleButton>
            ) : (
              <p className="ts-caption-1 text-[var(--text-tertiary)]">
                You already changed files this month. You can edit them again
                next month.
              </p>
            )}
          </div>
        </section>

        <Divider />

        {/* ---- Plan + billing ---- */}
        <section className="flex flex-col gap-4">
          <SectionTitle>Plan and billing</SectionTitle>
          {sub ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <AppleBadge tone="accent">{sub.tier ?? "Plan"}</AppleBadge>
                  {typeof sub.seats === "number" && (
                    <span className="ts-caption-1 text-[var(--text-tertiary)]">
                      {sub.seats} seats
                    </span>
                  )}
                </div>
                {typeof sub.price_usd_total === "number" && (
                  <div className="mt-2 ts-title-2 font-semibold tracking-tight tabular-nums text-[var(--text-primary)]">
                    {`$${sub.price_usd_total.toLocaleString("en-US")} USD`}
                  </div>
                )}
                {renewsLabel && (
                  <div className="mt-1 ts-caption-1 text-[var(--text-tertiary)]">
                    Next renewal: {renewsLabel}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <AppleButton
                  type="button"
                  tone="primary"
                  size="lg"
                  onPress={openPortal}
                  isLoading={portalLoading}
                  isDisabled={!settings.billing.can_open_portal}
                  className="h-11 justify-center px-5"
                >
                  Manage billing
                </AppleButton>
                <CancelSubscriptionFlow renewsLabel={renewsLabel} />
              </div>
            </div>
          ) : (
            <p className="ts-subhead text-[var(--text-secondary)]">
              No active subscription yet. Once you activate a plan, you can
              manage or cancel your billing here.
            </p>
          )}
          {sub && !settings.billing.can_open_portal && (
            <p className="ts-caption-1 text-[var(--text-tertiary)]">
              The billing portal turns on once your payment is recorded in
              Stripe. Email ayuda@itera.la if you need help before then.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
