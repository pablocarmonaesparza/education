"use client";

/**
 * /perfil — settings personales del user.
 *
 * Patrón Apple Settings: hero con avatar + lista agrupada por secciones.
 * Layout glance-friendly (sin scroll en viewport laptop estándar), HIG estricto.
 *
 * Secciones:
 *   - Hero: avatar + nombre + email + puesto + botón editar foto
 *   - Información personal: nombre, puesto, idioma, notificaciones
 *   - Cuenta: cambiar contraseña, cerrar sesión
 *   - Organización: org + team + member since (read-only)
 *
 * Mock data — cuando se cablee BD, viene de simulador.users +
 * organization_memberships + team_memberships del user logueado.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { SelectItem } from "@heroui/react";
import {
  AppleButton,
  AppleDivider,
  AppleErrorState,
  AppleInput,
  AppleReveal,
  AppleSelect,
  AppleSkeleton,
  AppleSwitch,
} from "@/components/simulador/apple";

// ============================================================================
// Perfil real — GET/PATCH /api/me/profile (F4, el mock murió)
// ============================================================================

interface Profile {
  full_name: string;
  email: string;
  initials: string;
  job_title: string;
  locale: string;
  notifications_enabled: boolean;
  org_name: string | null;
  team_name: string | null;
  member_since: string;
}

const LOCALE_OPTIONS = [
  { value: "en-US", label: "English (US)" },
  { value: "es-MX", label: "Spanish (Mexico)" },
  { value: "es-419", label: "Spanish (Latin America)" },
  { value: "es-ES", label: "Spanish (Spain)" },
];

// ============================================================================
// Components
// ============================================================================

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-5 ${className}`}
    >
      {children}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <span className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
      {children}
    </span>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="ts-caption-1 font-medium text-[var(--text-tertiary)]">
      {children}
    </label>
  );
}

// ============================================================================
// PAGE
// ============================================================================

export default function PerfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Campos editables (espejo local para input responsivo + autosave).
  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [locale, setLocale] = useState("es-419");
  const [notifications, setNotifications] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/me/profile");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `Error ${res.status}`);
      const p = data.profile as Profile;
      setProfile(p);
      setFullName(p.full_name);
      setJobTitle(p.job_title);
      setLocale(p.locale);
      setNotifications(p.notifications_enabled);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Autosave debounced (patrón /empresa): cada cambio agenda un PATCH.
  const scheduleSave = useCallback((patch: Record<string, unknown>) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
    }, 600);
  }, []);

  const memberSinceDate = profile
    ? new Date(profile.member_since).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "";

  if (loading) {
    return (
      <main className="surface-canvas min-h-[calc(100vh-3.5rem)] px-6 py-6 sm:px-10 sm:py-8">
        <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-4">
          <AppleSkeleton className="h-10 w-40" />
          <AppleSkeleton className="h-24 w-full" />
          <AppleSkeleton className="h-64 w-full" />
        </div>
      </main>
    );
  }

  if (loadError || !profile) {
    return (
      <main className="surface-canvas min-h-[calc(100vh-3.5rem)] px-6 py-6 sm:px-10 sm:py-8">
        <div className="mx-auto w-full max-w-[1100px]">
          <AppleErrorState
            title="We could not load your profile"
            body={loadError ?? "Try again."}
            actionLabel="Try again"
            onAction={load}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="surface-canvas min-h-[calc(100vh-3.5rem)] px-6 py-6 sm:px-10 sm:py-8">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-4">
        {/* ============ HEADER ============ */}
        <AppleReveal as="header">
          <h1 className="display display-tight text-[var(--text-primary)] ts-title-1 sm:ts-display">
            Profile
          </h1>
          <p className="mt-2 ts-subhead text-[var(--text-secondary)] leading-[1.55]">
            The information your manager and your reports use to personalize
            your experience.
          </p>
        </AppleReveal>

        {/* ============ HERO: avatar + identidad ============ */}
        <AppleReveal delay={0.04}>
          <Card className="flex items-center gap-5">
          <div className="relative h-[80px] w-[80px] flex-none">
            <div
              className="flex h-full w-full items-center justify-center rounded-full bg-[var(--surface-2)] ts-title-2 font-semibold text-[var(--text-primary)] tabular-nums ring-2 ring-[var(--accent)]"
              aria-hidden
            >
              {profile.initials}
            </div>
            <button
              type="button"
              aria-label="Change photo"
              className="absolute -bottom-1 -right-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--text-primary)] text-[var(--surface)] shadow-[0_2px_8px_var(--shadow)] hover:opacity-90 transition-opacity"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="ts-title-3 font-semibold tracking-tight text-[var(--text-primary)]">
              {fullName}
            </h2>
            <p className="mt-0.5 ts-subhead text-[var(--text-secondary)]">
              {[jobTitle, profile.email].filter(Boolean).join(" · ")}
            </p>
            <p className="mt-1 ts-footnote text-[var(--text-tertiary)]">
              {[
                profile.org_name,
                profile.team_name ? `${profile.team_name} team` : null,
                memberSinceDate ? `since ${memberSinceDate}` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          </Card>
        </AppleReveal>

        {/* ============ 2 cols: Info personal + Cuenta ============ */}
        <AppleReveal
          as="section"
          delay={0.08}
          className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]"
        >
          {/* ---- Información personal ---- */}
          <Card>
            <SectionHeader>Personal information</SectionHeader>

            <div className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <FieldLabel>Full name</FieldLabel>
                <AppleInput
                  value={fullName}
                  onValueChange={(v) => {
                    setFullName(v);
                    scheduleSave({ full_name: v });
                  }}
                  size="md"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <FieldLabel>Job title</FieldLabel>
                <AppleInput
                  value={jobTitle}
                  onValueChange={(v) => {
                    setJobTitle(v);
                    scheduleSave({ job_title: v });
                  }}
                  size="md"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <FieldLabel>Language</FieldLabel>
                  <AppleSelect
                    aria-label="Language"
                    selectedKeys={[locale]}
                    onSelectionChange={(keys) => {
                      const next = Array.from(keys)[0] as string | undefined;
                      if (next) {
                        setLocale(next);
                        scheduleSave({ locale: next });
                      }
                    }}
                    size="md"
                  >
                    {LOCALE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </AppleSelect>
                </div>

                <div className="flex flex-col gap-1.5">
                  <FieldLabel>Email notifications</FieldLabel>
                  <div className="flex h-11 items-center justify-between">
                    <span className="ts-subhead text-[var(--text-secondary)]">
                      {notifications ? "On" : "Off"}
                    </span>
                    <AppleSwitch
                      isSelected={notifications}
                      onValueChange={(v) => {
                        setNotifications(v);
                        scheduleSave({ notifications_enabled: v });
                      }}
                      aria-label="Email notifications"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* ---- Cuenta ---- */}
          <Card className="flex flex-col">
            <SectionHeader>Account</SectionHeader>

            <div className="mt-4 flex flex-1 flex-col">
              <button
                type="button"
                className="flex items-center justify-between rounded-[var(--radius-md)] px-3 py-2.5 text-left transition-colors hover:bg-[var(--surface-3)]"
              >
                <div className="ts-subhead font-medium text-[var(--text-primary)]">
                  Change password
                </div>
                <span className="text-[var(--text-tertiary)]" aria-hidden>
                  →
                </span>
              </button>

              <AppleDivider className="my-1" />

              <button
                type="button"
                className="flex items-center justify-between rounded-[var(--radius-md)] px-3 py-2.5 text-left transition-colors hover:bg-[var(--surface-3)]"
              >
                <div>
                  <div className="ts-subhead font-medium text-[var(--text-primary)]">
                    Sign-in methods
                  </div>
                  <div className="ts-caption-1 text-[var(--text-tertiary)]">
                    Email + Google
                  </div>
                </div>
                <span className="text-[var(--text-tertiary)]" aria-hidden>
                  →
                </span>
              </button>

              <AppleButton
                type="button"
                tone="secondary"
                size="lg"
                className="mt-auto w-full justify-center"
              >
                Sign out
              </AppleButton>
            </div>
          </Card>
        </AppleReveal>

      </div>
    </main>
  );
}
