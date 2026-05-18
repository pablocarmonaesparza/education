"use client";

import { RuntimeExperience } from "@/components/simulador/RuntimeExperience";

export default function MarketingUrgentCampaignFieldTestPage() {
  return (
    <RuntimeExperience
      mode="field_test"
      caseSlug="marketing_urgent_campaign_pii"
    />
  );
}
