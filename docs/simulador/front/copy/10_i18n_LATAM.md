# i18n LATAM textos — `lib/simulador/i18n/*`

> Para que el producto no se sienta gringo ni español-de-España.
> Default: español neutro LATAM. Variantes por país solo cuando aplica (factura fiscal, marcos legales).

## Locale detection

- `Accept-Language` del browser
- Cookie `itera_locale` si usuario eligió manualmente
- User preference de `simulador.users.locale_preference` si logged-in
- Fallback: `es-MX` (mercado más grande para Itera)

Supported locales: `es-MX` · `es-CO` · `es-AR` · `es-CL` · `es-PE` · `es-BR` (mezcla pt+es) · `es-419` (LATAM neutro fallback)

## Format helpers

### `formatCurrency(amount: number, locale: string): string`

Always returns USD (Itera bills USD only) pero con localized formatting:

| Locale | Output ejemplo $4,000 |
|---|---|
| es-MX | `$4,000 USD` |
| es-CO | `USD $4.000` |
| es-AR | `USD $4.000` |
| es-CL | `USD $4.000` |
| es-PE | `USD $4,000` |
| es-419 | `$4,000 USD` |

### `formatDate(iso: string, locale: string, format: 'short' | 'long'): string`

| Locale | short | long |
|---|---|---|
| es-MX | `20/05/2026` | `20 de mayo de 2026` |
| es-CO | `20/05/2026` | `20 de mayo de 2026` |
| es-AR | `20-05-2026` | `20 de mayo de 2026` |
| es-CL | `20-05-2026` | `20 de mayo de 2026` |
| es-PE | `20/05/2026` | `20 de mayo de 2026` |
| es-419 | `20/05/2026` | `20 mayo 2026` |

### `formatNumber(n: number, locale: string): string`

| Locale | 1000000 |
|---|---|
| es-MX | `1,000,000` |
| es-CO | `1.000.000` |
| es-AR | `1.000.000` |
| es-CL | `1.000.000` |
| es-PE | `1,000,000` |
| es-419 | `1.000.000` |

### `formatRelativeTime(iso: string, locale: string): string`

| Caso | es-MX/PE | es-CO/AR/CL/419 |
|---|---|---|
| 30 sec | hace 30 segundos | hace 30 segundos |
| 5 min | hace 5 minutos | hace 5 minutos |
| 1 hr | hace 1 hora | hace 1 hora |
| 2 days | hace 2 días | hace 2 días |
| 1 month | hace 1 mes | hace 1 mes |

(Misma forma en todos — relative time es regular en español)

---

## Textos legales por jurisdicción

### Privacy (`/privacy`)

Variante MX (default):

> **Marco legal aplicable**
> México: Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), nueva versión publicada en el DOF el 20 de marzo de 2025, vigente desde el 21 de marzo de 2025. Autoridad: Secretaría Anticorrupción y Buen Gobierno (transferida desde INAI por la reforma).
>
> Si tu organización opera en otra jurisdicción LATAM, los siguientes marcos también pueden aplicar a tu caso. Para detalles específicos por país, escríbenos a privacy@itera.la.

Variante CO:

> **Marco legal aplicable**
> Colombia: Ley 1581 de 2012 (Ley General de Protección de Datos Personales) y sus decretos reglamentarios. Autoridad: Superintendencia de Industria y Comercio (SIC).

Variante AR:

> **Marco legal aplicable**
> Argentina: Ley 25.326 (Ley de Protección de los Datos Personales) y normativa complementaria. Autoridad: Agencia de Acceso a la Información Pública (AAIP).

(Variantes adicionales solo si Pablo decide expandir más adelante)

---

### Términos fiscales (`/terms` + Onboarding billing + Settings billing)

Por país emisor de factura:

**MX:**
"Para factura fiscal en México (CFDI 4.0), respondes al recibo de Stripe con tu RFC, razón social, código postal del domicilio fiscal y uso de CFDI. Emisión 1-2 días hábiles a través de Facturapi."

**CO:**
"Para factura fiscal en Colombia (DIAN), respondes al recibo de Stripe con tu NIT, razón social y dirección. Emisión 1-2 días hábiles."

**AR:**
"Para factura fiscal en Argentina (AFIP), respondes al recibo de Stripe con tu CUIT, razón social, domicilio y condición frente al IVA. Emisión 1-2 días hábiles."

**CL:**
"Para factura electrónica en Chile (SII), respondes al recibo de Stripe con tu RUT, razón social y giro. Emisión 1-2 días hábiles."

**PE:**
"Para factura electrónica en Perú (SUNAT), respondes al recibo de Stripe con tu RUC, razón social y dirección. Emisión 1-2 días hábiles."

**Otros LATAM:**
"Para factura fiscal local, escríbenos a billing@itera.la con tu identificador fiscal y datos de la organización. Lo coordinamos manualmente."

---

## Términos universales LATAM (no varían por país)

| Concepto | Término preferido |
|---|---|
| Manager / Lead | "Manager" / "Lead" (anglicismo aceptado en LATAM B2B) |
| Employee | "Empleado/a" o "miembro del equipo" (NO "colaborador" — suena corporativo-MX excesivo) |
| Buyer | "Comprador" (en contexto de billing) |
| Login | "Iniciar sesión" |
| Signup | "Crear cuenta" |
| Dashboard | "Dashboard" (anglicismo aceptado) |
| Onboarding | "Onboarding" (anglicismo aceptado) |
| Sprint | "Sprint" (anglicismo aceptado en B2B SaaS LATAM) |
| Workflow | "Flujo" |
| Stakeholder | "Stakeholder" (anglicismo aceptado en B2B) |
| Feedback | "Feedback" |

---

## Términos a evitar (regionalismos confusos)

| ❌ Mal (regional) | ✅ Bien (neutro) |
|---|---|
| "Chévere" / "padre" / "copado" / "bacán" / "guay" | (no usar slang regional en UI) |
| "Plata" (CO/PE/AR sí, MX raro) | "dinero" |
| "Carro" (MX/CO) vs "auto" (AR/CL) | (evitar; no aplica al producto Itera) |
| "Computadora" (MX) vs "computador" (CO) | (evitar; no aplica al producto Itera) |
| "Bañera" (MX) vs "tina" (CO/CL) | (evitar; no aplica) |
| "Coger" (problemático en MX/AR) | "tomar", "agarrar" |

**Regla:** en UI Itera no aparecen palabras con sentido sexual ambiguo regional. Mantener vocabulario corporativo neutro.

---

## Vocabulario tech LATAM B2B (aceptado generalizado)

- "email" (no "correo electrónico" en UI; sí en términos legales formales)
- "link" (no "enlace" en UI; sí en términos legales)
- "click" (no "clic" — más común en LATAM B2B SaaS)
- "tap" en UI mobile / "click" en UI desktop
- "drag" en UI sigue siendo "arrastrar"
- "modal" / "popup" / "tooltip" — anglicismos aceptados
- "checkbox" / "radio button" — anglicismos aceptados
- "log out" / "sign out" → "cerrar sesión" (preferido)
- "submit" → "enviar"
- "preview" → "vista previa" o "preview" (ambos aceptados)

---

## Variantes específicas tono según país (sutil)

| Aspecto | es-MX | es-CO/AR/CL/PE |
|---|---|---|
| Tú vs Usted | tú (informal default Itera) | tú (igual en LATAM B2B moderno) |
| Voseo (AR) | NO — Itera no usa voseo en UI | NO — incluso AR prefiere "tú" formal en B2B SaaS |
| Tono formal | informal-profesional | informal-profesional |

**Regla:** una sola voz informal-profesional para todo LATAM. Solo varían tickets fiscales + marcos legales por jurisdicción.

---

## Disclaimers LATAM (visible en footer + términos)

"Itera opera bajo legislación de cada jurisdicción donde tiene clientes. Para diagnóstico operativo y procesamiento de datos sintéticos, los marcos legales LATAM aplicables incluyen LFPDPPP México (2025), Ley 1581 Colombia (2012), Ley 25.326 Argentina, y normativa equivalente. No procesamos PII real de tus clientes en el simulador. Para DPA enterprise + procesamiento de PII real (futuro), contáctanos a legal@itera.la."

— claude · 2026-05-20 · i18n LATAM copy v1.0
