"use client";

import { useEffect } from "react";
import {
  clearOnboardingProgress,
  ONBOARDING_ORG_ID_KEY,
  ONBOARDING_ORG_NAME_KEY,
  ONBOARDING_TEAM_ID_KEY,
  ONBOARDING_TEAM_NAME_KEY,
} from "@/lib/simulador/onboarding-progress";

export function ClearOnboardingStorage() {
  useEffect(() => {
    sessionStorage.removeItem(ONBOARDING_ORG_ID_KEY);
    sessionStorage.removeItem(ONBOARDING_ORG_NAME_KEY);
    sessionStorage.removeItem(ONBOARDING_TEAM_ID_KEY);
    sessionStorage.removeItem(ONBOARDING_TEAM_NAME_KEY);
    // clearOnboardingProgress también limpia las keys legacy del paso
    // context eliminado (onboarding_context_completed / _company_profile).
    clearOnboardingProgress();
  }, []);

  return null;
}
