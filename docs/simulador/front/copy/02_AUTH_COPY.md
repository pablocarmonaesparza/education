# Auth copy — `/auth/*`

> Audiencia: cualquier persona (buyer, empleado, admin Itera).
> AuthShell: card centered max-w-md, sin sidebar, sin nav global pesado.

## `/auth/login`

**Top nav minimal:**
- Izquierda: logo `itera` (link a `/`)
- Derecha: link cruzado `¿no tienes cuenta? regístrate`

**Card:**

**H1:** Inicia sesión.
**Sub muted:** Accede al dashboard de tu sprint.

**Botón Google (outline primary, full-w, con icono Google):** Continuar con Google

**Separador:** o con email

**Input email:**
- Label: `email`
- Placeholder: `nombre@empresa.com`
- Type: `email`
- Autocomplete: `email`

**CTA primario (full-w):** Enviar magic link

**Caption muted:** Te enviamos un link para entrar sin contraseña.

**Bottom:**
- Caption legal: Al continuar aceptas nuestros [términos](/terms) y [privacidad](/privacy).
- Caption muted: ¿Problemas? Escríbenos a hola@itera.la.

---

## `/auth/signup`

Mismo layout que login. Diferencias:

**Top nav:**
- Derecha: link cruzado `¿ya tienes cuenta? inicia sesión`

**Card:**

**H1:** Crea tu cuenta.
**Sub muted:** Empieza configurando tu organización.

**Botón Google:** Continuar con Google
**Separador:** o con email
**Input email:** mismo
**CTA primario:** Enviar magic link
**Caption muted:** Te enviamos un link para crear tu cuenta sin contraseña.

**Después de magic link confirmado:** redirige a `/onboarding/org` (no a dashboard, porque no tiene org aún).

---

## `/auth/callback` (server component)

Layout mínimo absoluto.

**Spinner + texto:** Verificando tu sesión…

**Si error:**
**H1 (sentence case, no display):** No se pudo verificar.
**Body:** El link expiró o ya se usó. Pide otro magic link.
**CTA:** Volver al login

---

## `/auth/confirm` (server component)

Mismo patrón que callback. Mensaje variante:

**Spinner + texto:** Confirmando tu email…

**Success:** redirige a `/onboarding/org` (signup) o `/dashboard` (login).

---

## `/auth/invitation/[token]`

**Top nav:** solo logo itera.

**Card centered:**

**Eyebrow:** TE INVITARON A UN SPRINT

**H1:** {orgName} te invita al sprint {sprintName}.

**Sub:** El sprint dura 30 días. El caso vivo toma ~18 minutos. Tu reporte queda al día siguiente.

**Detalles compactos (caption muted):**
- Rol: {role en español: empleado / manager / admin}
- Equipo: {teamName}
- Te invitó: {buyerName} ({buyerEmail})

**CTA primario:** Aceptar e iniciar sesión

**CTA secundario (ghost):** No soy yo / declinar
(declinar → mailto:hola@itera.la?subject=Decliné invitación&body=...)

**Bottom caption:** ¿Dudas? Escríbenos a hola@itera.la.

---

### Estados `/auth/invitation/[token]`

**Token expirado (card amber):**

**H1:** Este link ya no es válido.
**Body:** El link de invitación expiró. Pide a tu manager un re-envío.
**CTA:** Volver al landing

**Token ya usado:**

Si logged-in → redirige a `/dashboard`.
Si no logged-in → redirige a `/auth/login` con mensaje toast:
**Toast:** Esta invitación ya se aceptó. Inicia sesión con tu cuenta.

**Token inválido (404 invitación):**

**H1:** No encontramos esta invitación.
**Body:** Verifica el link o pide uno nuevo a tu manager.
**CTA:** Contactar soporte → mailto:hola@itera.la

---

## Errores comunes auth (toasts inline)

| Caso | Toast |
|---|---|
| Magic link no llegó (2 min) | "Revisa spam. Si no llega en 5 min, pide otro." |
| Magic link expirado | "El link expiró. Pide otro magic link." |
| Google OAuth bloqueado | "Permisos de Google no aceptados. Intenta con email." |
| Email no válido | "Usa formato nombre@empresa.com." |
| Red sin conexión | "Sin conexión. Verifica internet." |

— claude · 2026-05-20 · auth copy v1.0
