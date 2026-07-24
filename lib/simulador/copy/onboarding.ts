/**
 * Copy versionado del onboarding buyer B2B.
 *
 * Cubre el flow /(onboarding)/onboarding/{org,team,invite,billing,done} — 5 pasos.
 *
 * Cirugía W2-A (2026-07-23):
 *   - El paso "context" (perfil de empresa: website + PDFs) SE ELIMINÓ. Los
 *     archivos ni se subían (solo metadata a Stripe) y el motor ya no
 *     investiga empresas en onboarding — los tracks son por área (decisión
 *     "cursos al mayoreo por área"). No prometer research que no ocurre.
 *   - "Sprint activated" murió como framing en done: se dice lo que SÍ pasa
 *     (assessment listo, cada invitado recibe email con su primer caso).
 *   - Regiones US-first e industry keys en inglés (pivot de mercado EEUU).
 *   - Email visible de contacto: hello@itera.la.
 *
 * Vocabulario canónico: glosario docs/simulador/front/copy/00_EN_GLOSSARY.md
 * (assessment / practice / judgment — nunca "training"/"courses" como
 * propuesta). Voz: inglés de negocios de EEUU. Títulos sin punto final.
 *
 * Importa desde app/(onboarding)/onboarding/{paso}/page.tsx via
 * `import { onboardingCopy } from "@/lib/simulador/copy/onboarding";`.
 */

export const onboardingCopy = {
  // ============================================================================
  // Surface chrome compartido — wizard header con paso N de M
  // ============================================================================
  wizard: {
    eyebrow_template: (step: number, total: number, context: string) =>
      `Step ${step} of ${total} · ${context}`,
    back_cta: "← Back",
    continue_cta: "Continue →",
    skip_cta: "Skip this step",
    cancel_cta: "Cancel onboarding",
    cancel_confirm_title: "Leave onboarding?",
    cancel_confirm_body:
      "What you already saved (organization, team) stays. You can pick this up again from the dashboard.",
    cancel_confirm_yes: "Yes, leave",
    cancel_confirm_no: "Stay here",
  },

  // ============================================================================
  // Paso 1 — /onboarding/org
  // Captura: nombre, industria, región, tamaño
  // ============================================================================
  step1_org: {
    eyebrow_context: "Your organization",
    headline: "Tell us about your team",
    // El body va en dos partes: lead + stat. La stat (MARKET_STATS.MCKINSEY_3X)
    // se renderiza con tooltip `title=` de su fuente — nunca sin atribución.
    body_lead: "We calibrate the assessment to your context.",
    body_stat:
      "Most leaders underestimate their team's AI use by about 3x — this is where you find out.",
    fields: {
      name_label: "Organization name",
      name_placeholder: "Acme Inc.",
      job_title_placeholder: "Your role (e.g. Head of Marketing)",
      industry_label: "Industry",
      region_label: "Primary region",
      size_label: "Team size",
    },
    // Keys en inglés (pivot EEUU). Los keys se persisten en
    // organizations.industry — las orgs viejas guardaron keys en español
    // (servicios_profesionales, otro); los selects que las relean deben
    // tolerar ambos hasta que Codex migre los datos.
    industry_options: [
      { key: "saas_b2b", label: "SaaS B2B" },
      { key: "ecommerce", label: "Ecommerce" },
      { key: "professional_services", label: "Professional services" },
      { key: "fintech", label: "Fintech" },
      { key: "retail", label: "Retail" },
      { key: "manufacturing", label: "Manufacturing" },
      { key: "healthcare", label: "Healthcare" },
      { key: "education", label: "Education" },
      { key: "other", label: "Other" },
    ],
    // US-first (pivot EEUU). Keys persistidos en organizations.region — los
    // ids existentes (MX, CO, …) no cambian, solo el orden y el catch-all.
    region_options: [
      { key: "us", label: "United States" },
      { key: "MX", label: "Mexico" },
      { key: "CO", label: "Colombia" },
      { key: "AR", label: "Argentina" },
      { key: "CL", label: "Chile" },
      { key: "BR", label: "Brazil" },
      { key: "PE", label: "Peru" },
      { key: "other_latam", label: "Other LATAM" },
      { key: "other", label: "Other" },
    ],
    size_options: [
      { key: "1-10", label: "1–10 employees" },
      { key: "11-50", label: "11–50 employees" },
      { key: "51-100", label: "51–100 employees" },
      { key: "101-300", label: "101–300 employees" },
      { key: "301-500", label: "301–500 employees" },
      { key: "501+", label: "501+ employees" },
    ],
    size_help:
      "The assessment runs with up to 50 seats per organization. For larger organizations we quote in tiers. Write to us.",
    submit_cta: "Continue →",
    error_create: "Could not create the organization. Try again.",
    error_duplicate:
      "An organization with that name already exists in your account. Change the name, or continue with the existing one from the dashboard.",
  },

  // ============================================================================
  // Paso 2 — /onboarding/team
  // Captura: nombre del team, departamento/función
  // ============================================================================
  step2_team: {
    eyebrow_template: (orgName: string) =>
      `Team inside ${orgName || "your organization"}`,
    headline: "Which team do you want to assess first?",
    body:
      "Case 1 is calibrated for Marketing / Growth. If your team is a different function, keep going. We're opening more tracks soon.",
    fields: {
      name_label: "Team name",
      name_placeholder: "Marketing",
      department_label: "Function",
    },
    department_options: [
      { key: "marketing", label: "Marketing / Growth" },
      { key: "sales", label: "Sales" },
      { key: "customer_success", label: "Customer Success" },
      { key: "operations", label: "Operations" },
      { key: "finance", label: "Finance" },
      { key: "legal", label: "Legal" },
      { key: "people_hr", label: "People / HR" },
      { key: "product", label: "Product" },
      { key: "engineering", label: "Engineering" },
      { key: "otro", label: "Other" },
    ],
    department_help_marketing:
      "The v1 assessment is calibrated for Marketing/Growth. Other tracks arrive in upcoming releases. The assessment works, but the cases may not reflect your exact workflow yet.",
    department_help_other:
      "This track doesn't have calibrated v1 cases yet. You can run the assessment with the Marketing case as a sample, since the judgment rubric applies across tracks. We'll let you know when your track has dedicated cases.",
    submit_cta: "Continue →",
    error_create: "Could not create the team. Try again.",
  },

  // ============================================================================
  // Paso 3 — /onboarding/invite
  // Captura: emails de participantes + resultado de envío (email_status real)
  // ============================================================================
  step3_invite: {
    eyebrow_context: "Invite your team",
    headline: "Who's taking the assessment?",
    // Línea de apoyo bajo el H1. La stat (MARKET_STATS.KPMG_HIDE) se renderiza
    // con tooltip `title=` de su fuente.
    support_stat:
      "Invite everyone who touches AI in their work — 57% of employees never tell their employer they use it.",
    body_template: (teamName: string) =>
      `Each participant gets an email with their own link. The case takes about 20 minutes and they can do it whenever they want, with no scheduling. Team: ${teamName}.`,
    fields: {
      emails_label: "Participant emails",
      emails_placeholder:
        "sarah@company.com\nmike@company.com\njen@company.com",
      emails_description_template: (n: number) =>
        n === 1
          ? "Separate with commas, spaces, or line breaks. 1 valid email found."
          : `Separate with commas, spaces, or line breaks. ${n} valid emails found.`,
    },
    submit_cta_template: (n: number) =>
      n === 0
        ? "Send invitations"
        : n === 1
          ? "Send 1 invitation"
          : `Send ${n} invitations`,
    over_seats_warning_template: (n: number, max: number) =>
      `You're inviting ${n} participants but your plan has ${max} seats. The extras go on a waitlist until you free up seats or add more.`,
    domain_mismatch_warning:
      "Some emails use domains other than yours. Confirm they're on the same team before you continue.",
    // Headline del resultado: refleja el email_status REAL que devuelve
    // POST /api/orgs/[org_id]/invitations, no un "N sent" optimista.
    sent_headline_template: (sent: number, failed: number) =>
      failed === 0
        ? `${sent} invitation${sent === 1 ? "" : "s"} sent`
        : `${sent} sent, ${failed} failed`,
    sent_body:
      "Each participant will get an email with their own link. The assessment shows up in your dashboard when they finish the case.",
    manual_share_note:
      "Share their invite links manually — the links below work even though the email didn't go out.",
    skipped_eyebrow: "Not sent",
    skipped_reasons: {
      invalid_email: "invalid email format",
      duplicate: "already invited",
      already_member: "already a member of the organization",
      no_seats: "no seats available",
      rate_limited: "too many sends in a row, try again in a few minutes",
      unknown: "send failed",
    },
    invite_later_note: "You can finish the invitations later from the dashboard.",
    invite_more_cta: "Invite more",
    finish_cta: "Continue →",
    error_send: "Could not send invitations. Try again.",
  },

  // ============================================================================
  // Paso 4 — /onboarding/billing
  // Stripe Checkout B2B con seats configurables
  // ============================================================================
  step4_billing: {
    headline: "How many people will take part?",
    tier_label_template: (label: string, range: string) =>
      `Tier ${label} · ${range}`,
    pricing_breakdown_template: (perSeat: number, seats: number, total: number) =>
      `USD ${perSeat} × ${seats} ${seats === 1 ? "person" : "people"} = USD ${total.toLocaleString("en-US")}`,
    enterprise_headline: "More than 99 people",
    enterprise_body:
      "For large teams, pricing is negotiated by volume and contract term. Tell us how many people and we'll put together a proposal.",
    submit_cta: "Continue to Stripe",
    submit_enterprise_cta: "Talk to sales",
    terms_required:
      "By continuing you accept the Terms and the Privacy Policy. Secure payment with Stripe.",
    error_create_session: "Could not start the payment session. Try again.",
    error_stripe_redirect:
      "We couldn't open Stripe. Try again or write to hello@itera.la.",
  },

  // ============================================================================
  // Paso 5 — /onboarding/done
  // Confirmación post-pago + handoff al dashboard. Solo promesas que el
  // producto cumple HOY: emails con el primer caso + reportes en el dashboard.
  // ============================================================================
  step5_done: {
    eyebrow_context: "Done",
    headline: "Your team's assessment is ready",
    body:
      "Each person you invited gets an email with their first case. Completed sessions show up as reports in your dashboard.",
    next_steps_eyebrow: "What's next",
    next_steps: [
      "Tell your team it's coming — each person gets an email from Itera with their own link.",
      "Watch who accepts. Each case takes about 20 minutes, whenever they want — no scheduling.",
      "First reports land in your dashboard as soon as sessions are completed.",
    ],
    timing_eyebrow: "Typical timing",
    timing_body:
      "Teams of 10 usually finish within 3–7 days of the invitation. The team view fills in as reports come in.",
    receipt_cta: "View Stripe receipt",
    receipt_note:
      "The receipt went to the buyer's email. If your organization needs a W-9, reply to that email and we'll send it.",
    dashboard_cta: "Go to dashboard →",
    contact_help_eyebrow: "Need help?",
    contact_help_body:
      "Write to hello@itera.la and we'll reply during US business hours.",
  },

  // ============================================================================
  // Estado intermedio — Stripe checkout return URL
  // (Pre-confirmación pago, antes de marcar org.subscribed)
  // ============================================================================
  return_from_stripe: {
    success_eyebrow: "Payment received",
    success_headline: "Setting up your team's assessment…",
    success_body:
      "Stripe confirmed the payment. We're activating your seats. This usually takes less than a minute.",
    success_polling_note: "Don't close this tab.",
    success_continue_cta: "Continue to dashboard",
    failed_eyebrow: "Payment not completed",
    failed_headline: "The payment didn't go through",
    failed_body:
      "Stripe canceled or declined the charge. Nothing was billed. You can try again with another method.",
    failed_retry_cta: "Retry payment",
    failed_contact_cta: "Write to sales →",
  },

  // ============================================================================
  // Empty/error states genéricos del flow
  // ============================================================================
  states: {
    loading_label: "Loading…",
    redirecting_label: "Redirecting…",
    no_org_yet_redirect_note:
      "You need to create your organization first. Redirecting you.",
    no_team_yet_redirect_note:
      "You need to create a team before inviting. Redirecting you.",
    session_expired_headline: "Your session expired",
    session_expired_body:
      "Sign in again to pick up onboarding. What you already saved stays.",
    session_expired_cta: "Sign in",
  },

  // ============================================================================
  // Microcopy y disclaimers de pie
  // ============================================================================
  microcopy: {
    progress_template: (current: number, total: number) =>
      `Step ${current} of ${total}`,
    privacy_footer:
      "Your data stays in the organization you're creating. We don't sell data to third parties.",
    support_footer: "Stuck? Write to hello@itera.la.",
    help_link_label: "How does the assessment work?",
    help_link_href: "/como-funciona",
  },
} as const;

export type OnboardingCopy = typeof onboardingCopy;
