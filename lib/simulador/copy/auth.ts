/**
 * MUERTO: sin importadores al 2026-07-15. El copy real vive hardcodeado en
 * app/auth/*. No traducido en el pivot EEUU — borrar o cablear.
 */

/**
 * Copy versionado de auth surfaces.
 *
 * Cubre /auth/login, /auth/signup, /auth/callback, /auth/invitation/[token],
 * password reset (forgot + reset), magic link, OAuth Google. Las strings de
 * onboarding post-auth viven en lib/simulador/copy/onboarding.ts — auth.ts
 * solo cubre el momento de autenticación.
 *
 * Decisiones producto consolidadas:
 *   - B1-004 (done codex): signup/onboarding/invite/employee case/report
 *     smoke pasa end-to-end. La copy refactoriza strings ya en producción
 *     al pattern lib/simulador/copy/.
 *   - B7-002 (done codex): AgentMail integrado en invitation/welcome/
 *     password-reset/report-ready. La copy en lib/simulador/copy/emails.ts
 *     cubre el email body — auth.ts cubre la surface del navegador donde
 *     el user aterriza después del click.
 *   - B9-003-D5 (done): postura legal conservadora v1. La copy de auth
 *     declara opt-in explícito y no auto-firma terms en el signup.
 *   - Pablo decision 2026-05-18: login Apple-style, cero imports legacy DS.
 *     Vocabulario y voz reflejan ese pivote.
 *
 * Vocabulario canónico estricto (contrato §7):
 *   - "iniciar sesión" — NO "ingresar", "log in", "sign in"
 *   - "crear cuenta" — NO "registrarse", "sign up", "registro"
 *   - "contraseña" — NO "password", "clave"
 *   - "email" — usado tal cual, anglicismo establecido
 *   - "invitación" — NO "invite", "convite"
 *   - "participante" — NO "estudiante", "alumno", "user"
 *   - "manager" — NO "líder", "supervisor"
 *
 * Voz: español neutro LATAM corporate. Lowercase en titulares gramaticales.
 * Mensajes de error específicos y accionables, nunca culpa al usuario.
 *
 * Importa desde:
 *   - app/auth/login/page.tsx
 *   - app/auth/signup/page.tsx
 *   - app/auth/invitation/[token]/page.tsx
 *   - app/auth/callback/route.ts (errores redirigidos via query string)
 *   - app/auth/forgot/page.tsx (pendiente surface)
 *   - app/auth/reset/page.tsx (pendiente surface)
 *   - components/simulador/AuthNav.tsx
 */

export const authCopy = {
  // ============================================================================
  // Nav chrome — AuthNav arriba de las pages auth
  // ============================================================================
  nav: {
    brand_label: "Itera · Simulador",
    back_to_landing_cta: "← Volver",
    contact_help_label: "¿Atorado?",
    contact_help_href: "mailto:soporte@itera.la",
  },

  // ============================================================================
  // /auth/login
  // ============================================================================
  login: {
    eyebrow: "Cuenta",
    headline: "Inicia sesión.",
    body: "Continúa donde lo dejaste — diagnóstico, reporte o dashboard.",
    fields: {
      email_label: "Email",
      email_placeholder: "email@empresa.com",
      password_label: "Contraseña",
      password_placeholder: "Contraseña",
    },
    cta_submit_idle: "Continuar",
    cta_submit_loading: "Iniciando sesión…",
    separator_label: "o",
    google_cta_idle: "Continuar con Google",
    google_cta_loading: "Conectando…",
    google_redirect_label: "Redirigiendo a Google…",
    forgot_password_label: "¿Olvidaste tu contraseña?",
    forgot_password_href: "/auth/forgot",
    signup_link_prefix: "¿Aún no tienes cuenta?",
    signup_link_label: "Crear cuenta",
    legal_inline:
      "Al continuar aceptas los Términos del servicio y la Política de privacidad.",
    legal_terms_label: "Términos",
    legal_privacy_label: "Privacidad",
  },

  // ============================================================================
  // /auth/signup
  // ============================================================================
  signup: {
    eyebrow: "Cuenta nueva",
    headline: "Crea tu cuenta.",
    body:
      "Toma 30 segundos. Vas a poder hacer el diagnóstico, ver tu reporte y entrar al dashboard.",
    fields: {
      full_name_label: "Nombre completo",
      full_name_placeholder: "Ana López",
      email_label: "Email",
      email_placeholder: "email@empresa.com",
      password_label: "Contraseña",
      password_placeholder: "Mínimo 8 caracteres",
      password_help:
        "8+ caracteres con al menos 1 letra y 1 número. No usamos políticas de complejidad teatral.",
    },
    cta_submit_idle: "Crear cuenta",
    cta_submit_loading: "Creando cuenta…",
    separator_label: "o",
    google_cta_idle: "Continuar con Google",
    google_cta_loading: "Conectando…",
    login_link_prefix: "¿Ya tienes cuenta?",
    login_link_label: "Iniciar sesión",
    confirm_email_headline: "Revisa tu email.",
    confirm_email_body_template: (email: string) =>
      `Te mandamos un link de confirmación a ${email}. Click para activar tu cuenta y empezar.`,
    confirm_email_resend_cta: "Reenviar link",
    confirm_email_resend_done: "Reenviado. Revisa tu spam si no llegó.",
    confirm_email_change_cta: "Cambiar email",
    legal_inline:
      "Al crear cuenta aceptas los Términos y la Política de privacidad. Itera no vende datos a terceros.",
  },

  // ============================================================================
  // /auth/forgot — pedir reset link
  // ============================================================================
  forgot: {
    eyebrow: "Recuperar acceso",
    headline: "¿Olvidaste tu contraseña?",
    body:
      "Te mandamos un link a tu email para recuperarla. El link es de un solo uso y caduca en 1 hora.",
    fields: {
      email_label: "Email de tu cuenta",
      email_placeholder: "email@empresa.com",
    },
    cta_submit_idle: "Enviar link de recuperación",
    cta_submit_loading: "Enviando…",
    sent_headline: "Listo, revisa tu email.",
    sent_body_template: (email: string) =>
      `Si ${email} tiene una cuenta activa, te llegará un link en menos de 1 minuto. Revisa tu spam si no aparece.`,
    sent_resend_cta: "Reenviar",
    sent_login_cta: "Volver a iniciar sesión",
    back_to_login_label: "← Volver a iniciar sesión",
  },

  // ============================================================================
  // /auth/reset — completar el reset desde link
  // ============================================================================
  reset: {
    eyebrow: "Nueva contraseña",
    headline: "Define tu nueva contraseña.",
    body:
      "Una vez actualizada, te enviamos al dashboard. Los devices ya conectados van a tener que iniciar sesión otra vez.",
    fields: {
      password_label: "Contraseña nueva",
      password_placeholder: "Mínimo 8 caracteres",
      password_confirm_label: "Confírmala",
      password_confirm_placeholder: "Repite la contraseña",
    },
    mismatch_error: "Las contraseñas no coinciden.",
    weak_error: "Muy corta. Mínimo 8 caracteres.",
    cta_submit_idle: "Actualizar contraseña",
    cta_submit_loading: "Actualizando…",
    success_headline: "Contraseña actualizada.",
    success_body: "Listo. Te enviamos al dashboard.",
    success_redirect_cta: "Ir al dashboard →",
    expired_link_headline: "El link expiró.",
    expired_link_body:
      "Los links de recuperación duran 1 hora. Pide uno nuevo para retomar el proceso.",
    expired_link_cta: "Pedir link nuevo",
  },

  // ============================================================================
  // /auth/callback — landing post-OAuth o magic link
  // ============================================================================
  callback: {
    loading_label: "Validando sesión…",
    bridge_creating_label: "Configurando tu cuenta…",
    success_redirect_label: "Listo, redirigiendo…",
    error_eyebrow: "Error al iniciar sesión",
    error_generic_headline: "No pudimos completar el inicio de sesión.",
    error_generic_body:
      "El link puede estar expirado o ya usado. Vuelve a iniciar sesión.",
    error_oauth_denied_headline: "Cancelaste el acceso con Google.",
    error_oauth_denied_body:
      "Para usar Google necesitamos los permisos básicos de perfil. Puedes intentar otra vez o usar email + contraseña.",
    error_expired_link_headline: "Este link expiró.",
    error_expired_link_body:
      "Los links de magic / invitación duran 1 hora. Pide uno nuevo desde la pantalla de inicio de sesión.",
    error_user_mismatch_headline: "El email no coincide con la invitación.",
    error_user_mismatch_body:
      "Esta invitación es para otro email. Inicia sesión con ese o pide al admin de la organización que te invite con tu email correcto.",
    retry_login_cta: "Volver a iniciar sesión",
    contact_support_cta: "Escribir a soporte",
    contact_support_email: "soporte@itera.la",
  },

  // ============================================================================
  // /auth/invitation/[token] — landing del invitee
  // ============================================================================
  invitation: {
    eyebrow: "Invitación a una organización",
    loading_label: "Validando invitación…",
    valid_headline_template: (orgName: string) =>
      `Te invitaron a ${orgName}.`,
    valid_body_template: (inviterName: string, role: string) =>
      `${inviterName} te invitó como ${role}. Acepta para entrar al diagnóstico y al dashboard del equipo.`,
    valid_role_labels: {
      employee: "participante",
      manager: "manager",
      admin: "admin de organización",
      org_admin: "admin de organización",
    },
    valid_email_lock_note:
      "Esta invitación está atada a tu email. Si quieres usarla con otro, pide al admin que te re-invite.",
    valid_accept_cta_signed_out: "Crear cuenta y aceptar →",
    valid_accept_cta_signed_in: "Aceptar invitación →",
    valid_existing_account_note:
      "Si ya tienes cuenta con este email, te llevamos a iniciar sesión y luego entras directo.",
    valid_login_cta: "Iniciar sesión",
    accepted_headline: "Listo, ya estás dentro.",
    accepted_body:
      "Te llevamos al dashboard. Si es tu primera vez, aparecerá el caso disponible para empezar.",
    accepted_continue_cta: "Ir al dashboard →",
    invalid_headline: "Esta invitación ya no es válida.",
    invalid_reasons: {
      expired: "El link expiró. Pide una nueva invitación al admin.",
      consumed: "Esta invitación ya fue aceptada antes.",
      revoked: "El admin de la organización canceló esta invitación.",
      no_seats:
        "No hay asientos disponibles en la organización. El admin debe ampliar el plan o liberar uno.",
      org_inactive:
        "La organización está suspendida o no tiene plan activo. Habla con el admin.",
      not_found: "No encontramos esta invitación. Verifica el link completo.",
      unknown: "No pudimos validar esta invitación.",
    },
    invalid_contact_admin_cta: "Avisar al admin",
    invalid_contact_admin_email_template: (orgName: string) =>
      `Pídele al admin de ${orgName} que te re-invite.`,
    invalid_back_to_landing_cta: "← Volver",
  },

  // ============================================================================
  // Magic link (post-form en login/signup cuando se ofrece passwordless)
  // ============================================================================
  magic_link: {
    sent_headline: "Te mandamos un link.",
    sent_body_template: (email: string) =>
      `Revisa ${email}. Click en el link para entrar — no necesitas contraseña.`,
    sent_expiry_note: "El link dura 1 hora.",
    sent_resend_cta: "Reenviar link",
    sent_resend_cooldown_template: (seconds: number) =>
      `Espera ${seconds}s antes de reenviar.`,
    sent_resend_done: "Reenviado.",
    sent_change_email_cta: "Cambiar email",
  },

  // ============================================================================
  // Sign out
  // ============================================================================
  sign_out: {
    cta: "Cerrar sesión",
    confirm_title: "¿Cerrar sesión?",
    confirm_body:
      "Vas a tener que iniciar sesión otra vez en este device. Tu progreso queda guardado.",
    confirm_yes: "Sí, cerrar sesión",
    confirm_no: "Mejor no",
    signing_out_label: "Cerrando sesión…",
  },

  // ============================================================================
  // Error mapping — Supabase auth errors → mensajes user-facing
  // ============================================================================
  errors: {
    network: "No se pudo conectar al servidor. Verifica tu conexión.",
    client_init: "No se pudo inicializar el cliente. Recarga la página.",
    invalid_credentials: "Email o contraseña incorrectos.",
    email_not_confirmed: "Confirma tu email antes de iniciar sesión.",
    weak_password: "La contraseña debe tener al menos 8 caracteres.",
    invalid_email: "Email inválido. Verifica que esté completo.",
    duplicate_email:
      "Ya hay una cuenta con este email. Inicia sesión o usa otro email.",
    google_url_missing:
      "No se pudo obtener la URL de Google. Intenta de nuevo.",
    google_oauth_failed:
      "Error al iniciar con Google. Reintenta o usa email + contraseña.",
    rate_limited:
      "Demasiados intentos seguidos. Espera 1-2 minutos y reintenta.",
    bridge_creation_failed:
      "Tu cuenta se creó pero falló la configuración interna. Escríbenos a soporte@itera.la para arreglarlo.",
    session_expired:
      "Tu sesión expiró. Inicia sesión otra vez.",
    unknown: "Error inesperado. Intenta de nuevo.",
  },

  // ============================================================================
  // Microcopy + helpers compartidos
  // ============================================================================
  microcopy: {
    suspense_loading_label: "Cargando…",
    privacy_link_label: "Política de privacidad",
    privacy_link_href: "/privacy",
    terms_link_label: "Términos del servicio",
    terms_link_href: "/terms",
    contact_link_label: "Contacto",
    contact_link_href: "/contact",
    legal_no_data_sale: "Itera no vende datos a terceros.",
    legal_b2b_only:
      "Itera Simulador es un producto B2B. Las cuentas individuales sirven para probar el field-test público.",
  },
} as const;

export type AuthCopy = typeof authCopy;
