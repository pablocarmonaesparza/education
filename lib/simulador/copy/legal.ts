/**
 * Copy legal versionado por jurisdicción.
 *
 * Reescrito para EEUU (pivot MX/CO → US, decisión Pablo 2026-07-15). NO es
 * traducción: los marcos MX (LFPDPPP / derechos ARCO / Secretaría
 * Anticorrupción) y CO (Ley 1581 / Decreto 1377 / SIC / RNBD / habeas data) se
 * eliminaron porque no le aplican a un comprador de EEUU, no porque estuvieran
 * mal escritos. BR (LGPD) queda fuera de scope.
 *
 * Marcos que cubre:
 *   - CCPA/CPRA (California). Regs finales del CPPA: risk assessments desde
 *     2026-01-01, obligaciones ADMT desde 2027-01-01. Esas regs definen
 *     "significant decision" incluyendo evaluación de desempeño — por eso la
 *     cláusula de uso formativo es la pieza central del archivo, no un extra.
 *   - Illinois HB 3773 (vigente 2026-01-01, enmienda el IL Human Rights Act):
 *     exige NOTICE cuando se usa IA para influir o facilitar una decisión de
 *     empleo. Cubre expresamente "selection for training or apprenticeship",
 *     que es literalmente lo que decide el reporte de Itera. Aplica desde 1
 *     empleado en IL, así que le pega a casi cualquier cliente.
 *   - EEOC / UGESP: aplica si el score alimenta decisiones de empleo. La
 *     cláusula de uso formativo (formative_use_commitment) + la obligación del
 *     cliente en el TOS §4 son lo que nos deja FUERA de UGESP. Si un cliente
 *     usa el reporte para decidir ascensos, el assessment se convierte en un
 *     "selection procedure" federal y hay que validarlo. Eso es otro producto.
 *
 * NO citar, a propósito:
 *   - Colorado SB 24-205: nunca entró en vigor. La reemplazó SB 26-189
 *     (vigente 2027-01-01).
 *   - NYC LL144: es para AEDT de hiring/promotion. No aplica.
 *   - Illinois AIVIA: es para video-entrevistas de aplicantes. No aplica.
 *   Reclamar cumplimiento de leyes que no nos aplican le señala al comprador
 *   que no conocemos el espacio. Cuesta más de lo que suma.
 *
 * Disclaimer conservador (se mantiene del v1 LATAM): Itera NO promete
 * cumplimiento legal, NO da asesoría legal, NO procesa PII real en demos.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PENDIENTE PABLO — resolver ANTES de vender en EEUU:
 *
 *   1. [LEGAL_ENTITY_TBD] y [GOVERNING_STATE_TBD] son placeholders LITERALES:
 *      se renderean tal cual en /terms y /privacy. Es a propósito. No inventé
 *      entidad ni estado (el default de mercado sería Delaware, pero escribirlo
 *      como si fuera un hecho es peor que dejar el hueco visible). Hay que
 *      constituir la entidad y definir ley aplicable con counsel de EEUU, y
 *      reemplazar ambos strings acá.
 *   2. Emails: siguen siendo privacidad@ / soporte@ / ventas@ porque son
 *      mailboxes reales. En una página en inglés se ven mal, pero mandar al
 *      comprador a privacy@itera.la sin que el alias exista es peor. Cuando se
 *      creen los alias, actualizar acá.
 *   3. Risk assessment del CPPA (obligatorio desde 2026-01-01 para cierto
 *      procesamiento): el copy NO afirma que lo hicimos, porque no me consta.
 *      Si se hace, se puede afirmar en privacy_policy.US.
 *
 * Fuentes:
 *   https://cppa.ca.gov/announcements/2025/20250923.html
 *   https://www.jonesday.com/en/insights/2024/10/illinois-becomes-second-state-to-pass-broad-legislation-on-the-use-of-ai-in-employment-decisions
 *   https://www.eeoc.gov/laws/guidance/questions-and-answers-clarify-and-provide-common-interpretation-uniform-guidelines
 */

export type Jurisdiction = "US" | "other";

export const legalCopy = {
  // ============================================================================
  // Consent banner (signup + onboarding)
  // OJO: hoy NINGÚN componente importa consent_banner. El copy existe, la UI no.
  // Antes de afirmar en ningún lado que "el aviso se muestra", hay que
  // renderearlo. Ver reporte.
  // ============================================================================
  consent_banner: {
    US: {
      headline: "Privacy notice",
      body: "Itera collects and processes your personal information to create your account, run assessments, generate reports for your authorized manager, and operate the service. For California residents, this is our notice at collection under the California Consumer Privacy Act, as amended by the CPRA.",
      rights_anchor:
        "You can ask what we hold about you, get a copy, correct it, or have it deleted. Write to privacidad@itera.la. We respond within 45 days, and if we need another 45 we tell you why. Using a right costs you nothing and never changes your access to Itera.",
      sale_and_sharing:
        "We do not sell your personal information and we do not share it for cross-context behavioral advertising. We never have.",
      formative_use:
        "Your report measures judgment so you can practice it. It is not a hiring, promotion, discipline, or termination decision, and your employer agrees in our terms of service not to use it as the sole basis for one.",
      transfer_basis:
        "Your data is stored on Supabase infrastructure in the United States. Stripe processes payments, Anthropic runs the model that scores your work, and Sendgrid sends transactional email. All are US providers under contract with Itera.",
      sensitive_data:
        "If your session includes personal information about you or someone else, meaning real examples from your work, Itera processes only what the assessment needs, does not disclose it to third parties, and keeps it for at most 12 months after the assessment. Use synthetic data instead.",
      authority:
        "California residents can file a complaint with the California Privacy Protection Agency or the California Attorney General.",
      accept_button: "Accept and continue",
      reject_button: "Decline",
      link_full: "Read the full notice",
    },
    other: {
      headline: "Privacy notice for participants outside the United States",
      body: "Itera is built for organizations in the United States and processes data in the United States. We apply the California framework as the baseline for every participant, wherever they work. If your jurisdiction requires specific terms, such as the GDPR in the EU or the UK, write to privacidad@itera.la and we will tell you what we support today.",
      accept_button: "Accept the US framework",
      reject_button: "Decline",
    },
  },

  // ============================================================================
  // Pre-runtime consent (antes de cada sesión que use datos reales)
  // ============================================================================
  pre_runtime_data_consent: {
    headline: "Data in this session",
    body: "This case may ask you to bring in real examples from your work, such as customers, campaigns, or metrics. Use synthetic or anonymized data. If you enter real personal information, it is your responsibility under your organization's own rules.",
    sintetic_recommendation:
      "Use synthetic data here. What we measure is your judgment, not whether the data is true.",
    proceed_button: "Got it, continue",
    learn_more: "More about privacy",
  },

  // ============================================================================
  // Formative-use commitment
  // La pieza más importante del archivo. Es lo que nos saca de UGESP: si el
  // score alimenta decisiones de empleo, el assessment pasa a ser un "selection
  // procedure" federal y hay que validarlo con un estudio. Esto NO es solo texto
  // legal, es un compromiso de DISEÑO DE PRODUCTO: si algún día rankeamos
  // participantes entre sí, o vendemos el reporte como insumo de ascensos, hay
  // que borrar esta sección y llamar a un abogado antes de escribir la feature.
  // ============================================================================
  formative_use_commitment: {
    headline: "What this report is for",
    commitment:
      "Itera measures judgment in order to train it. The report tells you and your manager where the gaps are and which practice closes them. That is its only job.",
    not_a_selection_procedure:
      "Itera is not a selection procedure. We do not design, validate, or sell the assessment as a basis for hiring, promotion, retention, compensation, or discipline, and we do not rank participants against each other.",
    customer_obligation:
      "Organizations that use Itera agree not to use a report, a band, or a dimension score as the sole basis for an employment decision. Section 4 of our terms of service says so.",
    why_it_matters:
      "The moment a score decides who gets promoted, it stops being a training signal and becomes a test that has to answer to federal employment law. Itera is built to stay on the training side of that line, and we ask our customers to keep it there.",
  },

  // ============================================================================
  // Employer AI notice (Illinois HB 3773, vigente 2026-01-01)
  // El texto que el EMPLEADOR le entrega al empleado. Itera lo redacta para que
  // el cliente pueda cumplir sin pagar abogado — es argumento de venta, no solo
  // compliance. HB 3773 cubre "selection for training or apprenticeship", que es
  // exactamente lo que decide el reporte, y aplica desde 1 empleado en IL.
  // ============================================================================
  employer_ai_notice: {
    headline: "How AI is used in this assessment",
    body: "Your employer uses Itera to measure how well people apply judgment when they work with AI. Itera uses AI in two places: it runs the AI you interact with inside a case, and it uses a language model to score your responses against a published rubric.",
    what_it_influences:
      "The result influences which practice you are assigned next. That is a decision about selection for training, so Illinois law requires your employer to tell you AI is involved. This notice is that disclosure.",
    what_it_does_not_influence:
      "The result is not a hiring, promotion, discipline, or termination decision. Your employer agrees in our terms of service not to use it as the sole basis for one.",
    data_used:
      "The assessment scores what you write and what you do inside the case. It does not use your age, race, sex, disability, zip code, or any other protected characteristic, and it does not analyze video, voice, or facial expressions.",
    questions:
      "Questions about this notice go to your Itera administrator. Questions about how Itera handles your data go to privacidad@itera.la.",
    admin_note:
      "Administrators: Illinois requires this notice when AI is used to influence an employment decision, and the requirement starts at your first employee in the state. Use this text as written, or send it through your own channel. If your legal team needs different wording, write to soporte@itera.la.",
  },

  // ============================================================================
  // Terms of Service
  // ============================================================================
  terms_of_service: {
    headline: "Terms of service",
    last_updated: "Jul 16, 2026",

    sections: [
      {
        title: "1. What Itera is",
        body: "Itera is an assessment tool that measures the judgment your team applies when it uses AI, and turns the gaps into practice. We are not a course, we are not a learning content catalog, and we are not a legal or compliance consultancy.",
      },
      {
        title: "2. Who can use Itera",
        body: "Employees, managers, and administrators of organizations with an active Itera subscription. The public demo is open, requires no contract, and produces no assessment and no report.",
      },
      {
        title: "3. Limits of Itera",
        body: "Itera does not promise automatic legal compliance, does not give legal advice, does not give regulatory advice, and does not process real customer data in demos. If your organization needs certified compliance for sensitive data, retain counsel in your jurisdiction.",
      },
      {
        title: "4. Formative use, and what you agree not to do",
        body: "Itera reports are formative. They exist to direct practice. Your organization agrees not to use an Itera report, band, or dimension score as the sole basis for a hiring, promotion, retention, compensation, or disciplinary decision, and not to present Itera as a selection procedure or a pre-employment test. Itera is not validated for those uses and is not sold for them. An assessment that carries employment decisions has to answer to federal employment law, including the Uniform Guidelines on Employee Selection Procedures. That is a different product than this one. Where AI is used to influence an employment decision about your employees, giving them notice is your obligation as the employer, and Itera writes that notice for you.",
      },
      {
        title: "5. Intellectual property",
        body: "The cases, rubrics, practices, and reports Itera generates are Itera's property. An organization with an active subscription gets a license to use its employees' reports for as long as the subscription runs. The personal and business data you enter stays yours.",
      },
      {
        title: "6. Confidentiality",
        body: "Itera does not disclose individual employee data to third parties or to other customer organizations. Individual reports go to the participant and to their authorized manager at the contracting organization. Aggregated, de-identified data may be used to improve Itera's cases and rubrics. We do not use your data to train foundation models.",
      },
      {
        title: "7. Pricing and billing",
        body: "Itera bills per seat in USD through Stripe, monthly or annually. Price per person drops with volume, and the current detail is on the pricing page and at checkout. Subscriptions renew automatically until you cancel. Cancellation takes effect at the end of the period you already paid for: you keep access until that date and there are no new charges. Refunds are available within 7 days of the first charge.",
      },
      {
        title: "8. Changes to these terms",
        body: "Itera can update these terms. We notify administrators at contracting organizations 30 days before a material change takes effect. Continued use after that notice means you accept it.",
      },
      {
        title: "9. Governing law",
        body: "These terms are governed by the laws of [GOVERNING_STATE_TBD], and the contracting Itera entity is [LEGAL_ENTITY_TBD]. Both are being finalized with US counsel and will be named here before Itera sells in the United States. Disputes are resolved by binding arbitration seated in that state, unless your organization negotiates a different forum in a signed agreement.",
      },
      {
        title: "10. Contact",
        body: "Privacy: privacidad@itera.la. Support: soporte@itera.la. Sales: ventas@itera.la.",
      },
    ],
  },

  // ============================================================================
  // Privacy Policy — versión completa (linkeable desde consent_banner.link_full)
  // ============================================================================
  privacy_policy: {
    US: {
      headline: "Full privacy notice",
      last_updated: "Jul 16, 2026",
      framework_citation:
        "Written to the California Consumer Privacy Act, as amended by the CPRA, and to the California Privacy Protection Agency's rules on automated decisionmaking technology. We apply it as the baseline for every participant, in every state.",
      sections: [
        {
          title: "Who we are",
          body: "Itera, operating through [LEGAL_ENTITY_TBD], is the business that collects your personal information and decides how it is used. The legal entity is being formed and will be named here before Itera sells in the United States.",
        },
        {
          title: "Information we collect",
          body: "Identifiers: your name, work email, and browser IP address. Professional or employment information: your employer, your role, and your team. Product activity: your responses inside a case, transcripts of your interactions with the AI, and the scores the model assigns them. Commercial information: your organization's subscription and billing records. We collect this from you directly, from your employer when they set up your seat, and automatically from your browser.",
        },
        {
          title: "Sensitive personal information",
          body: "We do not ask for sensitive personal information as California defines it, meaning government IDs, financial account numbers, precise geolocation, race or ethnicity, religion, union membership, health, sex life, sexual orientation, or the contents of your private messages. We do not use or disclose any of it for purposes that would give you a right to limit. If you paste sensitive data into a case, we process it only to score that case, and we ask you to use synthetic data instead.",
        },
        {
          title: "Why we collect it",
          body: "To create and maintain your account. To assign and run assessments. To generate reports for your authorized manager. To capture evidence of judgment under pressure. To recommend the targeted practice that closes a gap. Nothing else.",
        },
        {
          title: "How we use AI, and what it decides",
          body: "Itera uses a language model to score your responses against a published rubric, and that score sets which practice you get next. California's rules on automated decisionmaking technology attach extra obligations when that technology makes a significant decision about a person, and performance evaluation can be one. Itera's report is formative: it directs practice, not employment decisions, and your employer agrees in our terms of service not to use it as the sole basis for one. You can ask us how a score was reached by writing to privacidad@itera.la.",
        },
        {
          title: "What we never do with it",
          body: "We do not sell your personal information. We do not share it for cross-context behavioral advertising. We do not use it for third-party marketing. We do not use it to train foundation models. Aggregated, de-identified data may be used to improve Itera's cases and rubrics, and once de-identified we do not try to re-identify it.",
        },
        {
          title: "Your rights",
          body: "You can know what we collect and why, get a copy of it, correct it, delete it, and opt out of sale or sharing. There is nothing to opt out of, because we do neither. Write to privacidad@itera.la. We confirm within 10 business days and answer within 45 days, and if we need another 45 we tell you why. We verify who you are before we act, and we will never charge you or reduce your access to Itera for using a right. You can name an authorized agent to act for you.",
        },
        {
          title: "If you work in Illinois",
          body: "Illinois law requires your employer to tell you when AI is used to influence an employment decision, and that includes selection for training. Itera writes that notice so your employer can give it to you. Ask your administrator for it, or write to privacidad@itera.la.",
        },
        {
          title: "Who else touches your data",
          body: "Supabase stores it. Stripe processes payments. Anthropic runs the model that scores your work. Sendgrid sends transactional email. All are US providers, all are under contract as service providers, and none of them may use your data for their own purposes.",
        },
        {
          title: "Retention",
          body: "Session data and reports: 12 months after your last activity, then anonymized or deleted. Account records: for as long as your organization's subscription runs, plus 12 months. Billing and tax records: 7 years, to meet US tax and accounting record-keeping requirements.",
        },
        {
          title: "Security",
          body: "Row-level multi-tenant isolation in the database, encryption at rest, encryption in transit over TLS 1.3, an audit log of privileged access, and least privilege for Itera staff.",
        },
        {
          title: "Changes to this notice",
          body: "We notify active accounts by email 30 days before a material change takes effect.",
        },
        {
          title: "Contact and complaints",
          body: "Write to privacidad@itera.la. California residents who believe we have not respected their rights can complain to the California Privacy Protection Agency or to the California Attorney General.",
        },
      ],
    },
  },

  // ============================================================================
  // Disclosure runtime — texto inline en steps que tocan datos
  // ============================================================================
  inline_disclosures: {
    pii_in_dataset_warning:
      "This dataset may contain personally identifiable information. Itera measures your judgment in how you handle it, not whether the data is true.",
    llm_disclaimer:
      "The model can be wrong, invent facts, or carry bias. What you are measured on here is your judgment in verifying the output, not the model's accuracy.",
    formative_use_note:
      "This session directs your practice. It is not a hiring, promotion, or discipline decision.",
    processing_notice:
      "Your session runs on US infrastructure. Supabase stores it and Anthropic scores it, both under contract with Itera.",
  },

  // ============================================================================
  // Disclaimer footer (todas las páginas)
  // ============================================================================
  footer_disclaimer:
    "Itera does not promise automatic legal compliance and does not give legal advice. Itera reports are formative: they direct practice, not employment decisions. For use with real personal data or an enterprise DPA, talk to your own counsel.",
} as const;

export type LegalCopy = typeof legalCopy;
