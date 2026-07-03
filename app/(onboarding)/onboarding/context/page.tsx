"use client";

/**
 * /onboarding/context — paso 4 del flow buyer B2B.
 *
 * Captura el perfil de empresa antes de elegir plan/pagar. No dispara el motor
 * todavía: guarda website y metadatos de adjuntos en el estado de onboarding
 * para pasarlos al checkout como contexto comercial.
 */

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { OnboardingNav } from "@/components/simulador/OnboardingNav";
import {
  AppleAttachmentCard,
  AppleButton,
  AppleIcon,
  AppleInput,
  AppleSlideButton,
  type AppleFileKind,
} from "@/components/simulador/apple";
import {
  readOnboardingCompanyProfile,
  writeOnboardingCompanyProfile,
  type OnboardingCompanyProfileFile,
} from "@/lib/simulador/onboarding-company-profile";
import {
  markContextCompleted,
  ONBOARDING_ORG_ID_KEY,
  ONBOARDING_TEAM_ID_KEY,
} from "@/lib/simulador/onboarding-progress";
import { onboardingCopy } from "@/lib/simulador/copy/onboarding";

const copy = onboardingCopy.step_context;
const MAX_FILES = 5;

type LocalFileMeta = OnboardingCompanyProfileFile & { id: string };

export default function OnboardingContextPage() {
  const router = useRouter();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [website, setWebsite] = useState("");
  const [files, setFiles] = useState<LocalFileMeta[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const oid = sessionStorage.getItem(ONBOARDING_ORG_ID_KEY);
    const tid = sessionStorage.getItem(ONBOARDING_TEAM_ID_KEY);
    if (!oid) {
      router.push("/onboarding/org");
      return;
    }
    if (!tid) {
      router.push("/onboarding/team");
      return;
    }

    // Hidratar desde sessionStorage en mount es el patrón del onboarding.
    /* eslint-disable react-hooks/set-state-in-effect */
    setOrgId(oid);
    setTeamId(tid);

    const saved = readOnboardingCompanyProfile();
    if (saved) {
      setWebsite(saved.websiteUrl);
      setFiles(
        saved.files.map((file, index) => ({
          ...file,
          id: `${file.name}-${file.size}-${index}`,
        })),
      );
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [router]);

  function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;

    const incoming: LocalFileMeta[] = Array.from(fileList)
      .filter(
        (file) =>
          file.type === "application/pdf" ||
          file.name.toLowerCase().endsWith(".pdf"),
      )
      .slice(0, MAX_FILES)
      .map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        name: file.name,
        size: file.size,
        type: file.type || file.name.split(".").pop() || "file",
      }));

    setFiles((current) => {
      const merged = [...current];
      for (const file of incoming) {
        if (merged.length >= MAX_FILES) break;
        if (!merged.some((existing) => existing.id === file.id)) {
          merged.push(file);
        }
      }
      return merged;
    });
  }

  function removeFile(id: string) {
    setFiles((current) => current.filter((file) => file.id !== id));
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const websiteUrl = normalizeWebsite(website);
    if (!websiteUrl) {
      setError(copy.errors.website_required);
      return;
    }

    writeOnboardingCompanyProfile({
      websiteUrl,
      files: files.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      })),
      updatedAt: new Date().toISOString(),
    });
    markContextCompleted();
    setWebsite(websiteUrl);
    setError(null);
    router.push("/onboarding/billing");
  }

  if (!orgId || !teamId) return null;

  return (
    <>
      <OnboardingNav progress={{ total: 6, current: 3, ariaLabel: "Paso 4 de 6" }} />
      <main className="surface-canvas min-h-[calc(100vh-5rem)] flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto flex w-full max-w-[560px] flex-col"
        >
          <h1 className="display display-tight ts-title-1 leading-[1.1] text-[var(--text-primary)] sm:ts-display">
            {copy.headline}
          </h1>
          <p className="mt-3 max-w-[520px] ts-body leading-[1.5] text-[var(--text-secondary)]">
            {copy.body}
          </p>

          <form onSubmit={onSubmit} className="mt-7 space-y-5">
            <AppleInput
              type="text"
              inputMode="url"
              value={website}
              onValueChange={setWebsite}
              onFocus={() => {
                if (!website.trim()) setWebsite("https://");
              }}
              placeholder={copy.fields.website_placeholder}
              label={copy.fields.website_label}
              autoComplete="url"
              size="md"
              autoFocus
            />

            <section className="space-y-3">
              <input
                id="onboarding-context-files"
                type="file"
                multiple
                aria-label={copy.fields.files_placeholder}
                className="peer sr-only"
                accept="application/pdf,.pdf"
                onChange={(event) => {
                  handleFiles(event.target.files);
                  event.target.value = "";
                }}
              />
              <label
                htmlFor="onboarding-context-files"
                className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 ts-callout font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--accent)]"
              >
                <AppleIcon name="fileText" size="sm" />
                {files.length > 0 ? copy.fields.files_add_more : copy.fields.files_placeholder}
              </label>

              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div key={file.id} className="grid grid-cols-[1fr_44px] gap-2">
                      <AppleAttachmentCard
                        name={file.name}
                        size={formatFileSize(file.size)}
                        kind={kindForFile(file)}
                      />
                      <button
                        type="button"
                        aria-label={`Quitar ${file.name}`}
                        onClick={() => removeFile(file.id)}
                        className="grid h-full min-h-11 place-items-center rounded-[var(--radius-md)] border border-[var(--border)] text-[var(--text-tertiary)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                      >
                        <AppleIcon name="x" size="sm" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {error && (
              <div className="rounded-[var(--radius-md)] bg-[var(--band-b-bg)] px-4 py-3 text-center ts-subhead leading-[1.45] text-[var(--band-b-text)]">
                {error}
              </div>
            )}

            <div className="pt-2">
              <AppleSlideButton
                type="submit"
                isDisabled={!website.trim()}
                hint
              >
                {copy.submit_cta}
              </AppleSlideButton>
              <AppleButton
                size="inline"
                tone="secondary"
                onPress={() => {
                  markContextCompleted();
                  router.push("/onboarding/billing");
                }}
                className="mx-auto mt-4 block ts-callout underline underline-offset-2"
              >
                Completar después
              </AppleButton>
            </div>
          </form>
        </motion.div>
      </main>
    </>
  );
}

function normalizeWebsite(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(candidate);
    if (!url.hostname.includes(".")) return null;
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function kindForFile(file: OnboardingCompanyProfileFile): AppleFileKind {
  const value = `${file.type} ${file.name}`.toLowerCase();
  if (value.includes("pdf")) return "pdf";
  if (value.includes("doc")) return "docx";
  if (value.includes("xls") || value.includes("sheet") || value.includes("csv")) {
    return value.includes("csv") ? "csv" : "xlsx";
  }
  if (value.includes("ppt") || value.includes("presentation")) return "presentation";
  if (value.includes("image") || /\.(png|jpe?g|gif|webp)$/i.test(file.name)) {
    return "image";
  }
  return "other";
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
