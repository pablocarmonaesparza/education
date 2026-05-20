# SEO metadata — titles + descriptions + OG por surface

> Aplica HIG-RULES-WRITE-01..06 + SEO best practices.
> Title max 60 chars. Description max 155 chars. OG image 1200×630.

## Defaults globales

**siteName:** Itera Simulador
**defaultDescription:** Diagnóstico operativo de criterio en uso de IA. Sprint de 30 días para equipos LATAM B2B. Reporte ejecutivo accionable.
**defaultLocale:** es-MX (Open Graph locale)
**alternativeLocales:** es-CO, es-AR, es-CL, es-PE
**twitterHandle:** @itera_la (si existe; si no, omit)
**ogImage:** `/opengraph-image.png` (1200×630 default)

---

## Per surface

### `/` Landing

**title:** `Itera Simulador · Mide cómo decide tu equipo con IA`
(58 chars, dentro de 60)

**description:** `Diagnóstico operativo B2B LATAM: sprint 30 días, caso vivo con presión real, judge LLM + review humano, reporte ejecutivo. Desde $4,000 USD.`
(154 chars)

**OG image:** custom — hero text "¿Tu equipo usa IA con criterio?" sobre dark surface con accent indigo

**Canonical:** `https://itera.la/`

**Robots:** index, follow

---

### `/auth/login`

**title:** `Iniciar sesión · Itera Simulador`
**description:** `Accede a tu dashboard de sprint. Magic link o Google sin contraseñas.`
**OG:** default
**Robots:** noindex, follow (auth pages no se indexan)

### `/auth/signup`

**title:** `Crear cuenta · Itera Simulador`
**description:** `Empieza configurando tu organización. Magic link o Google sin contraseñas.`
**OG:** default
**Robots:** noindex, follow

### `/auth/invitation/[token]`

**title:** `Aceptar invitación · Itera Simulador`
**description:** Dynamic con `{orgName}` si el server puede resolver
**Robots:** noindex, nofollow

### `/auth/callback`, `/auth/confirm`

**Robots:** noindex, nofollow
**title:** `Verificando sesión · Itera`

---

### `/field-test/marketing-urgent-campaign-pii`

**title:** `Probar el simulador · 1 caso público`
**description:** `Demo público de 18 min. Sin login, sin pago. Mide tu criterio en uso de IA con un caso real de marketing y datos sensibles.`
(126 chars)

**OG image:** custom — "Probar gratis · 18 min · sin login"

**Canonical:** `https://itera.la/field-test/marketing-urgent-campaign-pii`

**Robots:** index, follow (queremos que rankee)

**Schema.org JSON-LD:**

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Itera Simulador — demo público",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```

---

### `/onboarding/*` (5 steps)

**title:** `{Step name} · Onboarding · Itera`
(ej "Organización · Onboarding · Itera")

**description:** "Configurando tu organización en Itera Simulador."

**Robots:** noindex, nofollow (no se ven sin auth)

---

### `/dashboard`

**title:** `Dashboard · {orgName} · Itera`
**description:** "Estado del sprint y reportes ejecutivos de tu equipo."
**Robots:** noindex, nofollow

---

### `/case/[case_id]`

**title:** `Caso · {caseName} · Itera`
**description:** "Sesión activa de diagnóstico. Sin spoilers, sin trampas."
**Robots:** noindex, nofollow

---

### `/report/[session_id]`

**title:** `Reporte ejecutivo · Itera`
**description:** "Diagnóstico operativo del sprint. Recomendación + bandas + plan 7 días."
**Robots:** noindex, nofollow

---

### `/admin/*`

**title:** `Admin · {section} · Itera`
**description:** "Panel interno staff."
**Robots:** noindex, nofollow

---

### `/privacy`

**title:** `Privacidad · Itera Simulador`
**description:** `Tus datos en Itera Simulador. Marcos legales LATAM (LFPDPPP MX 2025, Ley 1581 CO, Ley 25.326 AR). Cómo procesamos, conservamos y eliminamos.`
(149 chars)

**Canonical:** `https://itera.la/privacy`
**Robots:** index, follow

---

### `/terms`

**title:** `Términos del servicio · Itera Simulador`
**description:** `Contrato de uso de Itera Simulador. Pricing USD, facturación LATAM (MX/CO/AR), refunds 7 días, jurisdicción.`
(123 chars)

**Canonical:** `https://itera.la/terms`
**Robots:** index, follow

---

### `/cancel`, `/success`

**Robots:** noindex, nofollow (transactional)
**title:** `Pago cancelado · Itera` / `Pago exitoso · Itera`

---

## OpenGraph + Twitter Card per surface

**Default OG (todas las indexable):**

```html
<meta property="og:type" content="website" />
<meta property="og:locale" content="es_MX" />
<meta property="og:locale:alternate" content="es_CO" />
<meta property="og:locale:alternate" content="es_AR" />
<meta property="og:site_name" content="Itera Simulador" />
<meta property="og:image" content="https://itera.la/opengraph-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Itera Simulador — diagnóstico operativo de criterio en IA" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="..." />
<meta name="twitter:description" content="..." />
<meta name="twitter:image" content="https://itera.la/opengraph-image.png" />
```

**Per-surface override:** title + description + image

---

## Sitemap

**`app/sitemap.ts`:**

```ts
export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://itera.la';
  return [
    { url: base, lastModified: new Date(), priority: 1.0, changeFrequency: 'monthly' },
    { url: `${base}/field-test/marketing-urgent-campaign-pii`, lastModified: new Date(), priority: 0.9, changeFrequency: 'monthly' },
    { url: `${base}/privacy`, lastModified: new Date('2026-05-20'), priority: 0.5, changeFrequency: 'yearly' },
    { url: `${base}/terms`, lastModified: new Date('2026-05-20'), priority: 0.5, changeFrequency: 'yearly' },
  ];
}
```

(NO incluir auth, dashboard, case, report, admin, cancel, success, onboarding — privadas)

---

## Robots

**`app/robots.ts`:**

```ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/field-test/*', '/privacy', '/terms'],
        disallow: [
          '/auth/*',
          '/dashboard',
          '/case/*',
          '/report/*',
          '/admin/*',
          '/onboarding/*',
          '/cancel',
          '/success',
        ],
      },
    ],
    sitemap: 'https://itera.la/sitemap.xml',
  };
}
```

---

## Brand assets

**Favicon:**
- `/icon.png` (any-resolution PNG, Next.js auto-genera otras)
- 32×32 + 16×16 generated

**Apple touch icon:**
- `/apple-icon.png` (180×180)

**Manifest (PWA-ready opcional):**
- `/manifest.json` con name "Itera Simulador", short_name "Itera", description, icons, theme_color #1472FF, background_color #ffffff, display "standalone"

**OG image default:**
- `/opengraph-image.png` 1200×630
- Contenido: logo "itera" centered + tagline "diagnóstico operativo de criterio en IA" + accent indigo background
- Generación dinámica opcional via Next.js `app/opengraph-image.tsx`

---

## Performance hints

**Preload critical fonts:**

```html
<link rel="preconnect" href="https://fonts.gstatic.com" />
```

(Si usamos -apple-system stack, NO necesitamos Google Fonts CDN — system fonts no necesitan preload.)

**Preconnect API:**

```html
<link rel="preconnect" href="https://api.itera.la" />
<link rel="dns-prefetch" href="https://api.itera.la" />
```

**Image lazy loading:**

`<Image loading="lazy" />` para todo lo below-the-fold.

---

## Microcopy SEO meta

| Surface | Meta description angle |
|---|---|
| Landing | Value prop directo + pricing + región |
| Field-test | Free trial + duración + no friction |
| Privacy | Marcos legales LATAM (rankea en búsquedas compliance) |
| Terms | Pricing + facturación LATAM (rankea en búsquedas B2B legal) |

— claude · 2026-05-20 · SEO metadata copy v1.0
