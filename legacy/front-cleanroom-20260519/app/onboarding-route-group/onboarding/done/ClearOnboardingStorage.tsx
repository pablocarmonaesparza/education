"use client";

import { useEffect } from "react";

export function ClearOnboardingStorage() {
  useEffect(() => {
    sessionStorage.removeItem("onboarding_org_id");
    sessionStorage.removeItem("onboarding_org_name");
    sessionStorage.removeItem("onboarding_team_id");
    sessionStorage.removeItem("onboarding_team_name");
  }, []);

  return null;
}
