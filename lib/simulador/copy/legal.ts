/**
 * Copy legal versionado por jurisdicción.
 *
 * Implementa B9-003-D4: avisos de privacidad MX/CO escritos por jurisdicción
 * (NO traducción literal — clauses canónicas del marco aplicable).
 *
 * Postura de scope (B9-003-D5 + Codex acord):
 *   - v1 launch: MX + CO (LFPDPPP MX 2025 + Ley 1581 CO 2012).
 *   - BR diferido a v2 (LGPD requiere DPO + DPIA — counsel LATAM antes de
 *     procesar PII real).
 *   - Disclaimer conservador: Itera v1 NO promete cumplimiento legal, NO da
 *     asesoría legal, NO procesa PII real de clientes en demos.
 *
 * Cuando Itera firme primer DPA enterprise o procese PII real → contratar
 * counsel LATAM y actualizar estos textos con review legal formal.
 *
 * Fuentes verificadas (Codex 2026-05-19):
 *   - DOF 20/03/2025 LFPDPPP nueva publicada, vigente 21/03/2025
 *   - KPMG MX flash 2025-04
 *   - GT LATAM advisory 2025-03
 *
 * Sources cita-aware:
 *   https://www.dof.gob.mx/nota_detalle.php?codigo=5752569&fecha=20/03/2025
 *   https://kpmg.com/mx/es/home/tendencias/2025/04/flash-nueva-ley-federal-de-proteccion-de-datos-personales.html
 *   https://www.gtlaw.com/es/insights/2025/3/nueva-ley-general-proteccion-de-datos
 */

export type Jurisdiction = "MX" | "CO" | "BR" | "other";

export const legalCopy = {
  // ============================================================================
  // Consent banner (signup + onboarding)
  // ============================================================================
  consent_banner: {
    MX: {
      headline: "Aviso de privacidad — México",
      body: "Itera es responsable del tratamiento de tus datos personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), publicada en el DOF el 20 de marzo de 2025. Usamos tus datos para crear tu cuenta, asignar diagnósticos, generar reportes para tu manager autorizado y operar el servicio.",
      rights_anchor: "Ejerce tus derechos ARCO (acceso, rectificación, cancelación y oposición) escribiendo a privacidad@itera.la. Tu solicitud se atiende en ≤20 días.",
      transfer_basis: "Tus datos viven en infraestructura Supabase (US-East-1). Esta transferencia internacional cuenta con tu consentimiento explícito al aceptar este aviso.",
      sensitive_data: "Si tu sesión incluye datos personales propios o de terceros (ejemplos del trabajo real), Itera procesa solo lo mínimo necesario para evaluación, no comparte con terceros, y los conserva máximo 12 meses post-evaluación.",
      authority: "Autoridad supervisora: Secretaría Anticorrupción y Buen Gobierno (función transferida desde el INAI por reforma 2025).",
      accept_button: "Acepto y continúo",
      reject_button: "No acepto",
      link_full: "Ver aviso completo (PDF)",
    },
    CO: {
      headline: "Política de tratamiento de datos personales — Colombia",
      body: "Itera es el responsable del tratamiento de tus datos personales conforme a la Ley 1581 de 2012 y sus decretos reglamentarios. Recolectamos y procesamos tus datos exclusivamente para crear tu cuenta, asignar diagnósticos, generar reportes operativos para tu manager autorizado y mantener el servicio.",
      rights_anchor: "Tienes derecho a conocer, actualizar y rectificar tus datos personales, así como solicitar prueba de la autorización otorgada. Ejerce tus derechos escribiendo a privacidad@itera.la — respuesta en ≤15 días hábiles.",
      transfer_basis: "Tus datos se almacenan en Supabase (Estados Unidos). Esta transferencia internacional está autorizada por tu consentimiento explícito al aceptar esta política. Estados Unidos no figura como país con nivel adecuado de protección según la Resolución SIC; nuestro contrato con Supabase incluye cláusulas de seguridad equivalentes.",
      sensitive_data: "Si introduces datos personales sensibles propios o de terceros en simulaciones, requiere consentimiento explícito separado del titular. Itera recomienda usar datos sintéticos en simulaciones.",
      authority: "Autoridad supervisora: Superintendencia de Industria y Comercio (SIC), Delegatura para la Protección de Datos Personales.",
      registry_note: "Si tu organización maneja datos personales de más de 100,000 titulares colombianos, debe estar registrada en el Registro Nacional de Bases de Datos (RNBD). Esto NO aplica al uso de Itera por sí mismo — aplica al tratamiento que tu organización hace.",
      accept_button: "Acepto y continúo",
      reject_button: "No acepto",
      link_full: "Ver política completa (PDF)",
    },
    BR: {
      headline: "Aviso de privacidade — Brasil (LGPD)",
      body_es: "Itera v1 NO está disponible para residentes en Brasil. La Ley General de Protección de Datos (LGPD, Lei 13.709/2018) exige DPO obligatorio y DPIA para tratamiento automatizado de IA. Estamos preparando el cumplimiento para v2 con counsel legal brasileño. Si registras una cuenta desde Brasil, no se procesarán tus datos hasta que confirmemos disponibilidad.",
      accept_button: "Entiendo (no continúo)",
      contact_us: "Si quieres ser notificado cuando Itera esté disponible en Brasil, escribe a privacidad@itera.la.",
    },
    other: {
      headline: "Aviso de privacidad — otra jurisdicción",
      body: "Itera v1 está optimizado para México (LFPDPPP) y Colombia (Ley 1581). Si operas desde otra jurisdicción, aplicaremos por default el marco MX más restrictivo. Si tu jurisdicción requiere clauses específicas (GDPR EU, CCPA California, etc.), escribe a privacidad@itera.la antes de crear cuentas para confirmar viabilidad.",
      accept_button: "Acepto bajo marco MX por default",
      reject_button: "No acepto",
    },
  },

  // ============================================================================
  // Pre-runtime consent (antes de cada sesión que use datos reales)
  // ============================================================================
  pre_runtime_data_consent: {
    headline: "Datos en esta sesión",
    body: "Esta simulación puede pedirte que ingreses ejemplos de datos reales de tu trabajo (clientes, campañas, métricas). Te recomendamos usar datos sintéticos o anonimizados. Si ingresas datos personales reales, son tu responsabilidad conforme al marco legal de tu jurisdicción.",
    sintetic_recommendation: "Recomendación Itera: para esta sesión usa datos sintéticos. Lo que medimos es tu criterio operativo, no la veracidad de los datos.",
    proceed_button: "Entiendo, continúo",
    learn_more: "Más detalles sobre privacidad",
  },

  // ============================================================================
  // Terms of Service — versión común a todas las jurisdicciones
  // ============================================================================
  terms_of_service: {
    headline: "Términos de servicio",
    last_updated: "2026-05-19",

    sections: [
      {
        title: "1. Qué es Itera",
        body: "Itera es una herramienta de diagnóstico operativo para evaluar el criterio de uso de IA en equipos de trabajo. NO somos curso, NO somos plataforma de aprendizaje recurrente, NO somos servicio de consultoría legal o de compliance.",
      },
      {
        title: "2. Quién puede usar Itera",
        body: "Empleados, managers y administradores de organizaciones que contraten un Sprint Fase 1 o Fase 2. El acceso individual al field-test público es gratuito y no requiere contratación.",
      },
      {
        title: "3. Limitaciones de Itera v1",
        body: "Itera v1 NO promete cumplimiento legal automático, NO da asesoría legal, NO da asesoría regulatoria, NO procesa datos de clientes reales en demos. Si tu organización necesita compliance certificado para datos sensibles, contrata counsel legal de tu jurisdicción.",
      },
      {
        title: "4. Propiedad intelectual",
        body: "Los casos, rúbricas, practice beats y reportes generados por Itera son propiedad de Itera. La organización contratante recibe licencia de uso para los reportes de sus empleados durante el período del Sprint. La propiedad de los datos personales y comerciales que ingreses sigue siendo tuya/de tu organización.",
      },
      {
        title: "5. Confidencialidad",
        body: "Itera no comparte datos individuales de empleados con terceros, ni con otras organizaciones cliente. Reportes individuales se entregan al manager autorizado de la organización contratante y al empleado mismo. Agregados anonimizados pueden usarse para investigación interna de Itera (mejora del producto).",
      },
      {
        title: "6. Tarifa y facturación",
        body: "Sprints se facturan en USD vía Stripe. Fase 1 (diagnóstico): $4,000-$8,000 según cohorte 5-50 personas. Fase 2 (práctica + re-diagnóstico): $8,000-$15,000. Cobro al inicio del Sprint. Cancelación post-cobro reembolsable solo si el Sprint no comenzó.",
      },
      {
        title: "7. Cambios a los términos",
        body: "Itera puede actualizar estos términos. Cambios materiales se notifican a admins de las organizaciones contratantes con 30 días de anticipación. Uso continuado post-notificación implica aceptación.",
      },
      {
        title: "8. Ley aplicable",
        body: "Para usuarios en México, aplica LFPDPPP y legislación mexicana. Para Colombia, Ley 1581 y legislación colombiana. Disputas se resuelven por arbitraje en la jurisdicción del usuario o, si no hay claridad, en jurisdicción de la sede legal de Itera.",
      },
      {
        title: "9. Contacto",
        body: "Privacidad: privacidad@itera.la. Soporte: soporte@itera.la. Comercial: ventas@itera.la.",
      },
    ],
  },

  // ============================================================================
  // Privacy Policy — versión completa (linkeable desde consent_banner.link_full)
  // ============================================================================
  privacy_policy: {
    MX: {
      headline: "Aviso de privacidad — versión completa",
      last_updated: "2026-05-19",
      framework_citation:
        "Conforme a Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), publicada en DOF 20/03/2025, vigente desde 21/03/2025.",
      sections: [
        {
          title: "Responsable",
          body: "Itera (la entidad legal pendiente de constitución formal en MX; mientras tanto opera como proveedor de software con representación designada).",
        },
        {
          title: "Datos que recolectamos",
          body: "Email, nombre completo, organización empleadora, rol/cargo, respuestas a simulaciones, transcripciones de interacciones con IA, evaluaciones del judge LLM, IP del navegador.",
        },
        {
          title: "Finalidades primarias del tratamiento",
          body: "(1) Crear y mantener tu cuenta. (2) Asignar y operar diagnósticos. (3) Generar reportes para tu manager autorizado. (4) Capturar evidencia de criterio operativo. (5) Recomendar practice beats remediativos.",
        },
        {
          title: "Finalidades secundarias",
          body: "Mejora del producto (análisis agregado anonimizado). NO marketing third-party. NO venta de datos.",
        },
        {
          title: "Derechos ARCO",
          body: "Acceso, Rectificación, Cancelación y Oposición. Solicitudes a privacidad@itera.la. Respuesta en ≤20 días naturales. Sin costo para el titular.",
        },
        {
          title: "Transferencias",
          body: "Datos viven en Supabase US-East-1. Stripe (US) procesa pagos. Anthropic (US) procesa el judge LLM. Sendgrid (US) envía emails transaccionales. Cada transferencia internacional cuenta con consentimiento explícito al aceptar este aviso + contratos con cláusulas de seguridad equivalentes.",
        },
        {
          title: "Conservación",
          body: "Datos de sesión + reportes: 12 meses post-última actividad. Después se anonimizan o eliminan. Datos de facturación: 5 años según código fiscal mexicano.",
        },
        {
          title: "Seguridad",
          body: "RLS multi-tenant en BD, encryption at rest, encryption in transit (TLS 1.3), audit log de accesos privilegiados, principio de mínimo privilegio en staff Itera.",
        },
        {
          title: "Cambios al aviso",
          body: "Cambios materiales se notifican por email a cuentas activas con 30 días de anticipación.",
        },
        {
          title: "Autoridad supervisora",
          body: "Secretaría Anticorrupción y Buen Gobierno (función transferida desde INAI por reforma 2025). Si consideras que tus derechos no se han respetado, puedes acudir a esta autoridad.",
        },
      ],
    },
    CO: {
      headline: "Política de tratamiento de datos personales — versión completa",
      last_updated: "2026-05-19",
      framework_citation:
        "Conforme a Ley 1581 de 2012, Decreto 1377 de 2013 y demás normas concordantes. Operamos bajo el principio de habeas data.",
      sections: [
        {
          title: "Responsable y Encargado",
          body: "Itera es responsable y encargado del tratamiento. Identificación legal pendiente de formalización en CO; mientras tanto opera con representación designada.",
        },
        {
          title: "Tipo de datos tratados",
          body: "Datos identificativos (nombre, email), datos profesionales (empresa, cargo), datos de uso del producto (respuestas, transcripciones, evaluaciones), datos técnicos (IP, navegador).",
        },
        {
          title: "Finalidad del tratamiento",
          body: "Diagnóstico operativo de criterio en uso de IA, generación de reportes para el manager autorizado, mejora continua del producto, comunicaciones transaccionales necesarias.",
        },
        {
          title: "Derechos del titular",
          body: "Conocer, actualizar, rectificar, suprimir, oponerse al tratamiento, presentar quejas ante la SIC, revocar autorización. Solicitudes a privacidad@itera.la — respuesta en ≤15 días hábiles.",
        },
        {
          title: "Datos sensibles",
          body: "Itera NO solicita datos sensibles (raza, religión, orientación sexual, datos de salud, biométricos) en su servicio. Si los introduces accidentalmente en simulaciones, requieren autorización explícita separada del titular conforme al artículo 6 de la Ley 1581.",
        },
        {
          title: "Transferencias internacionales",
          body: "Datos viven en Supabase (Estados Unidos). Stripe (US) procesa pagos. Anthropic (US) procesa judge LLM. Sendgrid (US) envía emails. Estados Unidos no figura como país con nivel adecuado de protección según la SIC; nuestros contratos con estos proveedores incluyen cláusulas contractuales de seguridad equivalentes y tu autorización explícita constituye el segundo mecanismo válido conforme a la Resolución SIC.",
        },
        {
          title: "Registro Nacional de Bases de Datos (RNBD)",
          body: "Itera está en proceso de registro en RNBD según aplique. Si tu organización maneja >100,000 titulares colombianos, debe registrarse independientemente.",
        },
        {
          title: "Conservación",
          body: "Datos de sesión + reportes: 12 meses post-última actividad. Datos contables: 10 años según código de comercio colombiano. Después se anonimizan o eliminan.",
        },
        {
          title: "Seguridad",
          body: "Mismas medidas que MX: RLS multi-tenant, encryption at rest + in transit (TLS 1.3), audit log, mínimo privilegio.",
        },
        {
          title: "Autoridad supervisora",
          body: "Superintendencia de Industria y Comercio (SIC) — Delegatura para la Protección de Datos Personales. Quejas formales ante la SIC.",
        },
      ],
    },
  },

  // ============================================================================
  // Disclosure runtime — texto inline en steps que tocan datos
  // ============================================================================
  inline_disclosures: {
    pii_in_dataset_warning:
      "Este dataset puede contener información personal identificable (PII). Itera mide tu criterio en cómo lo manejas, no la veracidad del dato.",
    llm_disclaimer:
      "El modelo LLM puede generar errores, alucinaciones o sesgos. Lo que mides aquí es tu criterio para validar el output, no la corrección del modelo.",
    cross_border_notice:
      "Tu sesión se procesa en infraestructura US (Supabase + Anthropic). Tu consentimiento al iniciar sesión cubre esta transferencia internacional.",
  },

  // ============================================================================
  // Disclaimer footer (todas las páginas)
  // ============================================================================
  footer_disclaimer:
    "Itera v1 NO promete cumplimiento legal automático, NO da asesoría legal. Para uso con datos personales reales o DPA enterprise, consulta a tu asesor legal de jurisdicción.",
} as const;

export type LegalCopy = typeof legalCopy;
