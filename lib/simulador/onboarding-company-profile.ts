import {
  ONBOARDING_ORG_ID_KEY,
  ONBOARDING_TEAM_ID_KEY,
} from "./onboarding-progress";

export const ONBOARDING_COMPANY_PROFILE_KEY = "onboarding_company_profile";

export type OnboardingCompanyProfileFile = {
  name: string;
  size: number;
  type: string;
};

export type OnboardingCompanyProfile = {
  websiteUrl: string;
  files: OnboardingCompanyProfileFile[];
  updatedAt: string;
};

export function readOnboardingCompanyProfile() {
  if (typeof window === "undefined") return null;

  const raw = window.sessionStorage.getItem(ONBOARDING_COMPANY_PROFILE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<OnboardingCompanyProfile>;
    if (!parsed.websiteUrl) return null;
    if (isStalePreviewProfile(parsed)) {
      window.sessionStorage.removeItem(ONBOARDING_COMPANY_PROFILE_KEY);
      return null;
    }
    return {
      websiteUrl: parsed.websiteUrl,
      files: Array.isArray(parsed.files)
        ? parsed.files.filter(
            (file): file is OnboardingCompanyProfileFile =>
              typeof file?.name === "string" &&
              typeof file?.size === "number" &&
              typeof file?.type === "string",
          )
        : [],
      updatedAt:
        typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function writeOnboardingCompanyProfile(profile: OnboardingCompanyProfile) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(ONBOARDING_COMPANY_PROFILE_KEY, JSON.stringify(profile));
}

export function clearOnboardingCompanyProfile() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(ONBOARDING_COMPANY_PROFILE_KEY);
}

function isStalePreviewProfile(profile: Partial<OnboardingCompanyProfile>) {
  const website = profile.websiteUrl ? parseWebsiteHost(profile.websiteUrl) : null;
  if (website !== "itera.la" && website !== "www.itera.la") return false;
  if (profile.updatedAt === "dev-preview") return true;

  const orgId = window.sessionStorage.getItem(ONBOARDING_ORG_ID_KEY) ?? "";
  const teamId = window.sessionStorage.getItem(ONBOARDING_TEAM_ID_KEY) ?? "";
  return isPreviewId(orgId) || isPreviewId(teamId);
}

function isPreviewId(value: string) {
  return value.startsWith("dev-preview") || value.startsWith("codex-");
}

function parseWebsiteHost(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(candidate).hostname.toLowerCase();
  } catch {
    return null;
  }
}
