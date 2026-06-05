/**
 * Copy versionado de billing público + customer portal.
 *
 * NO confundir con lib/simulador/copy/onboarding.ts step4_billing:
 *   - onboarding.step4_billing = strings dentro del wizard de checkout
 *     B2B (la pantalla donde el buyer configura seats + va a Stripe).
 *   - billing.ts (este archivo) = strings del PRICING página pública +
 *     pricing card en landing + customer portal post-pago + tier
 *     comparison + invoice/receipt explainers.
 *
 * Los datos canónicos de los tiers (label, baseAmountUsd, featureBullets,
 * minSeats/maxSeats) viven en lib/simulador/billing.ts (SIMULADOR_PLANS).
 * Este archivo solo aporta la copy de marketing alrededor de ellos —
 * eyebrow, headline, why_this_tier, comparisons, FAQ, etc.
 *
 * Decisiones producto consolidadas:
 *   - B9-001-D3 (done): pricing Fase 1 $4-8K (5-50 ppl), Fase 2 $8-15K,
 *     Track Fase 3 hasta $24K, bundle 10% off cuando se contrata Fase
 *     1+2 junto. Per-seat anchor Section AI $750 → nuestros tiers
 *     compiten desde ~$80/seat (diagnostico cap) hasta ~$480/seat (track
 *     pleno).
 *   - B9-001-D7 (done): 3 frames de diferenciación vs Wharton/Section/
 *     Forage. Pricing aprovecha el frame "diagnóstico operativo no es
 *     curso ni certificación".
 *   - B9-003-D5 (done): no compliance-grade hasta primer DPA enterprise.
 *     La copy de billing NO promete certificaciones SOC2/ISO27001 — solo
 *     declara "datos en supabase US-East, payment via Stripe".
 *   - B7-001 (en flight codex): Stripe Checkout B2B + customer portal.
 *     Las strings del portal post-pago entran aquí para que Codex importe.
 *
 * Vocabulario canónico estricto (contrato §7):
 *   - "diagnóstico" — NO "assessment"
 *   - "asiento" — NO "license", "seat license" (es 1 participante, 1 asiento)
 *   - "sprint" — NO "course", "program"
 *   - "factura" — NO "receipt" cuando es PO/wire enterprise
 *   - "tier" — usado tal cual, anglicismo aceptado
 *   - "manager" — NO "líder", "supervisor"
 *
 * Voz: español neutro LATAM corporate. Cifras en USD siempre. Cero AI slop.
 *
 * Importa desde:
 *   - app/pricing/page.tsx (página pública)
 *   - app/(public)/page.tsx (pricing card de la landing)
 *   - app/(app)/billing/page.tsx (customer portal — pendiente codex)
 *   - app/api/billing/portal/route.ts (return URL strings)
 */

export const billingCopy = {
  // ============================================================================
  // Page chrome — para /pricing pública
  // ============================================================================
  page: {
    eyebrow: "Precios",
    headline: "Diagnóstico operativo, no certificación.",
    subheadline:
      "Tres niveles según qué tan profundo midas. Todos arrancan con 5 asientos y escalan hasta 50. USD, cobro vía Stripe.",
    currency_note: "Todos los precios en USD. La factura llega al email del comprador.",
    last_updated_template: (date: string) => `Precios vigentes desde ${date}`,
  },

  // ============================================================================
  // Tier comparison — los 3 planes (diagnostico/sprint/track)
  // Importar SIMULADOR_PLANS de lib/simulador/billing.ts para data canónica.
  // Aquí solo el copy de marketing alrededor.
  // ============================================================================
  tiers: {
    diagnostico: {
      eyebrow: "Fase 1",
      tagline: "Un caso vivo. Ves cómo decide tu equipo.",
      best_for: "Empezar a medir antes de invertir en capacitación.",
      anchor_seat_note: "Equivale a USD 80–200 por participante según seats.",
      cta_label: "Empezar diagnóstico",
      includes_eyebrow: "Incluye",
      includes_extra: [
        "Onboarding del manager + admin (incluido)",
        "Invitaciones por email a participantes",
        "Reporte ejecutivo por persona (publicado en dashboard)",
        "Dashboard agregado para manager con bandas y risk events",
      ],
      excludes_eyebrow: "No incluye",
      excludes: [
        "Práctica recurrente (Sprint y Track)",
        "Re-simulación de cierre (Sprint y Track)",
        "Casos avanzados N3 con agentes (Track)",
      ],
    },
    sprint: {
      eyebrow: "Fase 2",
      tagline: "Diagnóstico + práctica + re-medición a 45 días.",
      best_for: "Cerrar gaps reales con micro-práctica entre dos mediciones.",
      anchor_seat_note: "Equivale a USD 175–300 por participante según seats.",
      most_popular_label: "Más contratado",
      cta_label: "Contratar sprint",
      includes_eyebrow: "Incluye",
      includes_extra: [
        "Todo lo de Diagnóstico",
        "8 casos Marketing/Growth (N1 + N2)",
        "Practice beats personalizados por gap detectado",
        "Re-simulación al cierre + transfer delta",
        "Reporte de progreso del equipo",
      ],
      excludes_eyebrow: "No incluye",
      excludes: [
        "Variantes N3 con agentes (Track)",
        "Review humano en risks high (Track)",
      ],
    },
    track: {
      eyebrow: "Fase 3",
      tagline: "Programa completo N1-N3 con review humano.",
      best_for: "Equipos que ya operan con agentes y necesitan medir escalamiento.",
      anchor_seat_note: "Equivale a USD 300–480 por participante según seats.",
      cta_label: "Cotizar Track completo",
      includes_eyebrow: "Incluye",
      includes_extra: [
        "Todo lo de Sprint",
        "Casos N3 con agentes y workflows complejos",
        "Variantes avanzadas por archetype",
        "Review humano (LLM + Itera staff) en risk events high",
        "Soporte directo del equipo Itera durante el track",
      ],
      excludes_eyebrow: "No incluye",
      excludes: [
        "Custom cases dedicados (cotización separada)",
        "Integración con LMS o HRIS (cotización separada)",
      ],
    },
  },

  // ============================================================================
  // Bundle + seat pricing meta
  // ============================================================================
  bundle: {
    eyebrow: "Bundle Fase 1+2",
    headline: "10% off cuando contratas Diagnóstico + Sprint juntos.",
    body:
      "Si vas a hacer ambas fases este trimestre, contratarlas juntas baja el precio total de la segunda fase 10%. Aplicable también a Track cuando se cotice antes del cierre del Sprint.",
    discount_label_template: (pct: number) => `-${pct}%`,
    eligibility_note:
      "El descuento aplica al momento del checkout si seleccionas ambos tiers. Si lo descubres después, escríbenos y ajustamos la próxima factura.",
  },

  // ============================================================================
  // Pricing card — versión condensada para la landing
  // ============================================================================
  landing_card: {
    eyebrow: "Diagnóstico operativo",
    headline_template: (lowUsd: number, highUsd: number) =>
      `Desde USD ${lowUsd.toLocaleString("en-US")} hasta USD ${highUsd.toLocaleString("en-US")}`,
    seats_meta_template: (minSeats: number, maxSeats: number) =>
      `${minSeats}–${maxSeats} participantes · 1 caso vivo · reporte ejecutivo`,
    bullets: [
      "1 caso vivo por participante (~20 min)",
      "Reporte ejecutivo individual",
      "Dashboard agregado para manager",
    ],
    cta_label: "Ver precios y planes",
    cta_href: "/pricing",
    note: "Sprint y Track disponibles cuando quieras profundizar.",
  },

  // ============================================================================
  // FAQ — pricing oriented
  // ============================================================================
  faq: [
    {
      q: "¿Por qué cobramos por seats y no por org?",
      a: "Cada participante consume un caso vivo + genera un reporte ejecutivo + un slot en hybrid review (en Sprint/Track). El costo escala con personas, no con cuentas.",
    },
    {
      q: "¿Puedo agregar más asientos después?",
      a: "Sí. Hasta el máximo del tier (50). Si necesitas más de 50, cotizamos un plan dedicado.",
    },
    {
      q: "¿Aceptan factura con PO o transferencia?",
      a: "Sí. Para PO/wire enterprise escríbenos a ventas@itera.la antes del checkout. Stripe Checkout cubre tarjeta y débito directo.",
    },
    {
      q: "¿El cobro es por mes o pago único?",
      a: "Pago único por el sprint. Diagnóstico cubre 30 días, Sprint cubre 45, Track cubre 90. No hay suscripción recurrente automática en v1.",
    },
    {
      q: "¿Qué pasa si no completamos todos los seats?",
      a: "Los seats no usados quedan disponibles hasta el cierre del sprint. No hay reembolso por no-show, pero podemos extender la ventana si la org lo justifica.",
    },
    {
      q: "¿Refunds?",
      a: "Sí, dentro de 7 días después del primer cargo si nadie de tu equipo ha empezado el caso vivo. Pasado eso, no podemos reembolsar (la rúbrica ya corrió).",
    },
    {
      q: "¿Tienen plan free o trial?",
      a: "Por ahora no hay trial público. El diagnóstico es pago; si quieres evaluar el método antes de contratar, escríbenos a ventas@itera.la y te mostramos un caso.",
    },
    {
      q: "¿Compliance y privacidad de datos?",
      a: "Datos en Supabase US-East (postgres + RLS multi-tenant). Pagos vía Stripe (PCI DSS Level 1). En v1 NO promovemos SOC2/ISO27001 — lo activamos cuando tu org lo pida formalmente. Para DPA enterprise, escríbenos a legal@itera.la.",
    },
  ],

  // ============================================================================
  // Customer portal — post-pago (pendiente B7-001 surface)
  // ============================================================================
  portal: {
    eyebrow: "Tu plan",
    headline_template: (planLabel: string) => `Estás en ${planLabel}.`,
    active_status_label: "Activo",
    pending_status_label: "Pendiente de pago",
    expired_status_label: "Expirado",
    cancelled_status_label: "Cancelado",
    seats_used_template: (used: number, total: number) =>
      `${used} de ${total} asientos usados`,
    seats_available_template: (available: number) =>
      available === 1
        ? `Queda 1 asiento disponible.`
        : `Quedan ${available} asientos disponibles.`,
    seats_over_quota_template: (over: number) =>
      `Hay ${over} participante${over === 1 ? "" : "s"} sin asiento. Amplía el plan o desactiva accesos.`,
    period_label: "Vigencia",
    period_template: (start: string, end: string) => `${start} → ${end}`,
    days_left_template: (days: number) =>
      days === 0
        ? "Último día"
        : days === 1
          ? "Queda 1 día"
          : `Quedan ${days} días`,
    actions_eyebrow: "Acciones",
    add_seats_cta: "Agregar asientos",
    upgrade_cta: "Subir a Sprint o Track",
    downgrade_cta: "Bajar a tier menor",
    cancel_cta: "Cancelar plan",
    cancel_confirm_title: "¿Cancelar plan?",
    cancel_confirm_body:
      "Tu acceso queda activo hasta el cierre del periodo actual. No hay reembolso prorrateado. Tus reportes ya publicados se mantienen accesibles.",
    cancel_confirm_yes: "Sí, cancelar",
    cancel_confirm_no: "No, mantener",
    invoices_eyebrow: "Facturas",
    invoices_empty: "Todavía no hay facturas.",
    invoice_download_cta: "Descargar PDF",
    invoice_view_cta: "Ver en Stripe",
    update_payment_method_cta: "Actualizar método de pago",
    update_billing_info_cta: "Datos fiscales",
    contact_support_cta: "Escribir a soporte",
    contact_support_email: "soporte@itera.la",
  },

  // ============================================================================
  // Invoice + receipt explainer
  // ============================================================================
  invoice: {
    sent_to_template: (email: string) => `Enviada a ${email}.`,
    receipt_label: "Recibo Stripe",
    invoice_pdf_label: "Factura fiscal (PDF)",
    invoice_not_yet_label: "Factura fiscal pendiente",
    invoice_not_yet_help:
      "Si pediste factura fiscal MX/CO/AR, el equipo la emite en horario LATAM business hours y te llega por email.",
    fiscal_request_eyebrow: "¿Necesitas factura fiscal?",
    fiscal_request_body:
      "Contesta el email del recibo con tu RFC/NIT/CUIT y nombre fiscal. La emitimos en 1-2 días hábiles.",
    fiscal_request_email: "facturas@itera.la",
  },

  // ============================================================================
  // Refund flow
  // ============================================================================
  refund: {
    eyebrow: "Reembolso",
    headline: "¿Necesitas un reembolso?",
    body:
      "Reembolsamos dentro de 7 días después del primer cargo si nadie de tu equipo ha empezado el caso vivo. Pasado ese punto la rúbrica ya corrió y no podemos reembolsar — pero sí podemos ajustar la próxima factura o convertir el saldo en crédito.",
    eligible_label: "Eres elegible para reembolso completo.",
    not_eligible_label:
      "El plan ya consumió actividad. Podemos ofrecerte crédito para próximo sprint.",
    request_cta: "Pedir reembolso",
    request_via_email_note: "Te abrimos un ticket en soporte y respondemos en 24h.",
    request_email: "soporte@itera.la",
  },

  // ============================================================================
  // Estados de error / pagos rechazados
  // ============================================================================
  states: {
    payment_failed_headline: "Pago rechazado.",
    payment_failed_body:
      "Stripe no autorizó el cargo. Tu plan queda en pendiente. Actualiza el método de pago o intenta con otra tarjeta.",
    payment_failed_retry_cta: "Reintentar pago",
    payment_pending_headline: "Pago en proceso.",
    payment_pending_body:
      "Stripe está procesando tu pago. Esto suele tomar menos de 1 minuto.",
    portal_load_failed_headline: "No pudimos cargar tu plan.",
    portal_load_failed_body:
      "Es un error nuestro. Reintenta o escríbenos a soporte@itera.la.",
    portal_no_plan_headline: "No hay plan activo.",
    portal_no_plan_body:
      "No detectamos un plan activo para tu organización. Si crees que es un error, escríbenos.",
    portal_no_plan_cta: "Ver precios",
    portal_no_plan_cta_href: "/pricing",
  },

  // ============================================================================
  // Microcopy / disclaimers
  // ============================================================================
  microcopy: {
    secure_payment_note: "Pago seguro vía Stripe (PCI DSS Level 1).",
    no_credit_card_required_for_field_test:
      "El field-test público no requiere tarjeta. Es 1 caso individual sin login.",
    pricing_transparent_note:
      "Sin pricing oculto, sin downsells: los 3 tiers están publicados.",
    enterprise_note_eyebrow: "¿Org grande (>50 participantes o multi-team)?",
    enterprise_note_body:
      "Cotizamos planes dedicados con descuentos por volumen, soporte prioritario y opción de DPA enterprise. Escríbenos a ventas@itera.la.",
  },
} as const;

export type BillingCopy = typeof billingCopy;
