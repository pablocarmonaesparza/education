"use client";

export const ONBOARDING_ROUTES = [
  "/onboarding/org",
  "/onboarding/team",
  "/onboarding/invite",
  "/onboarding/context",
  "/onboarding/billing",
  "/onboarding/done",
] as const;

// Keys de sessionStorage compartidas entre los steps del onboarding.
// Los valores string no cambian: el sessionStorage existente sigue válido.
export const ONBOARDING_ORG_ID_KEY = "onboarding_org_id";
export const ONBOARDING_ORG_NAME_KEY = "onboarding_org_name";
export const ONBOARDING_TEAM_ID_KEY = "onboarding_team_id";
export const ONBOARDING_TEAM_NAME_KEY = "onboarding_team_name";

const UNLOCKED_STEP_KEY = "onboarding_unlocked_step";
const INVITE_COMPLETED_KEY = "onboarding_invite_completed";
const CONTEXT_COMPLETED_KEY = "onboarding_context_completed";

export function getOnboardingUnlockedStep() {
  if (typeof window === "undefined") return 0;

  const stored = Number.parseInt(
    window.sessionStorage.getItem(UNLOCKED_STEP_KEY) ?? "0",
    10,
  );
  let unlocked = Number.isFinite(stored) ? stored : 0;

  if (window.sessionStorage.getItem(ONBOARDING_ORG_ID_KEY)) {
    unlocked = Math.max(unlocked, 1);
  }
  if (window.sessionStorage.getItem(ONBOARDING_TEAM_ID_KEY)) {
    unlocked = Math.max(unlocked, 2);
  }
  if (window.sessionStorage.getItem(INVITE_COMPLETED_KEY) === "true") {
    unlocked = Math.max(unlocked, 3);
  }
  if (window.sessionStorage.getItem(CONTEXT_COMPLETED_KEY) === "true") {
    unlocked = Math.max(unlocked, 4);
  }

  return Math.min(Math.max(unlocked, 0), ONBOARDING_ROUTES.length - 1);
}

export function markOnboardingStepUnlocked(step: number) {
  if (typeof window === "undefined") return;

  const next = Math.min(
    Math.max(getOnboardingUnlockedStep(), step),
    ONBOARDING_ROUTES.length - 1,
  );
  window.sessionStorage.setItem(UNLOCKED_STEP_KEY, String(next));
  window.dispatchEvent(new Event("onboarding-progress-updated"));
}

export function markInviteCompleted() {
  if (typeof window === "undefined") return;

  window.sessionStorage.setItem(INVITE_COMPLETED_KEY, "true");
  markOnboardingStepUnlocked(3);
}

export function markContextCompleted() {
  if (typeof window === "undefined") return;

  window.sessionStorage.setItem(CONTEXT_COMPLETED_KEY, "true");
  markOnboardingStepUnlocked(4);
}

export function hasOnboardingContextCompleted() {
  if (typeof window === "undefined") return false;

  return window.sessionStorage.getItem(CONTEXT_COMPLETED_KEY) === "true";
}

export function clearOnboardingProgress() {
  if (typeof window === "undefined") return;

  window.sessionStorage.removeItem(UNLOCKED_STEP_KEY);
  window.sessionStorage.removeItem(INVITE_COMPLETED_KEY);
  window.sessionStorage.removeItem(CONTEXT_COMPLETED_KEY);
}
