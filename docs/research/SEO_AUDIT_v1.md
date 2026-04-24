# SEO Audit v1 — Itera

> Snapshot del estado SEO del sitio al **2026-04-23**. Este es **#19a del Wish List**: audita el estado actual, no aplica fixes. Los fixes son #19b y esperan que #3 landing solidifique su narrativa.
>
> **Metodología**: revisión estática del repo (`app/`, `public/`, `components/shared/StructuredData.tsx`, `next.config.js`) + research Next.js 15 App Router SEO 2026. No se corrieron Lighthouse ni PageSpeed Insights aquí (requieren URL en producción — propuesto como seguimiento).
>
> **Scope**: sitio público cara-al-mundo. Las rutas autenticadas (`/dashboard/*`) se cubren como rutas que **deben quedar fuera del índice**, no como páginas a rankear.

---

## TL;DR — health score

| Dimensión | Score | Notas |
|---|---|---|
| Infraestructura técnica | 3/10 | sin sitemap, sin robots, sin OG image real |
| Metadata raíz | 6/10 | bien estructurada pero locale incorrecto + descripción con claim no verificado |
| Structured data | 2/10 | 🚨 contiene placeholders + aggregateRating falsa = riesgo de penalidad Google |
| Metadata per-page | 1/10 | 0 rutas tienen `generateMetadata` propia; todo hereda raíz |
| Rutas indexables vs no | 4/10 | `/dashboard/*` y `/auth/*` se indexan por defecto; no hay noindex explícito |
| Performance hints | 6/10 | `next/font` y `next/image` usados; falta hero `priority`, `apple-icon`, dynamic OG |
| Contenido thin | 4/10 | `/about` es placeholder, puede rankear como soft-spam |
| **Global** | **4/10** | **bloqueantes concretos antes de gastar un dólar en paid acquisition** |

**Traducción ejecutiva:** el sitio hoy no está listo para SEO orgánico. Hay dos bloqueantes duros (structured data falsa + sitemap/robots ausentes) que pueden causar penalidades o invisibilidad. Los fixes son S-M esfuerzo.

---

## 1. Inventario — qué existe

### Rutas públicas detectadas (`app/**/page.tsx`, 40 totales)

**Indexables intencionales (cara-al-mundo):**
- `/` — landing principal
- `/about` — placeholder ("Aquí irá la información...") ⚠️
- `/privacy` — política de privacidad (contenido real)
- `/terms` — términos
- `/cancel` — redirect de Stripe post-cancel
- `/success` — redirect de Stripe post-pago
- `/conferencias` — posicionamiento como speaker (item #10/#11)
- `/componentes` — internal preview, ¿debería ser público? ⚠️

**NO deberían indexarse (personal / flow):**
- `/auth/login`, `/auth/signup`
- `/onboarding`, `/intake`, `/courseCreation`, `/projectContext`, `/projectDescription`
- `/paywall`
- `/home`, `/home/result`, `/home/dashboard`, `/home/upload`
- `/lecture/[slug]` — auth-gated, redirige a `/auth/login`
- `/dashboard/**` (17 rutas) — toda la app privada
- `/dashboardAlpha`, `/experiment`, `/experimentAlpha` — experimentos

**Diagnóstico**: hay ~28 rutas que no deberían estar en el índice, ninguna con `robots: { index: false }` explícito. Por defecto heredan el `robots.index: true` del layout raíz.

### Infraestructura SEO física

| Archivo esperado | Existe | Notas |
|---|---|---|
| `app/sitemap.ts` | ❌ | ausente |
| `app/robots.ts` | ❌ | ausente |
| `/public/sitemap.xml` | ❌ | ausente |
| `/public/robots.txt` | ❌ | ausente |
| `app/opengraph-image.tsx` (dynamic) | ❌ | ausente |
| `app/twitter-image.tsx` (dynamic) | ❌ | ausente |
| `/public/og-image.jpg` (referenciado en `layout.tsx:69,81`) | ❌ | **404 — layout apunta a un archivo que no existe** |
| `app/manifest.ts` | ❌ | ausente |
| `app/icon.png` | ✅ | existe (32×32?) |
| `/public/favicon.png` | ✅ | existe, 20KB |
| `apple-icon.png` | ❌ | ausente |
| Per-page `generateMetadata` | ❌ 0/40 | nadie lo usa |

### Metadata raíz (`app/layout.tsx`)

```
metadataBase    ✅ https://itera.la
title template  ✅ "%s | Itera"
description     ⚠️ incluye "Garantía de 30 días" — claim no verificado en CONTEXT.md
keywords        ✅ 16 keywords razonables (IA, LATAM, Claude, MCP, RAG, MVP…)
openGraph       ⚠️ locale: "es_ES" — WRONG para LATAM (debería ser "es_419")
twitter         ⚠️ creator "@iterala" — verificar que la cuenta existe
robots          ⚠️ index:true/follow:true global — /dashboard/* se indexaría si se filtra link
canonical       ⚠️ hardcoded "https://itera.la" — necesita ser per-page
category        ✅ "education"
icons           ⚠️ solo favicon.png, sin apple-icon ni .ico
```

### Structured data (`components/shared/StructuredData.tsx`) 🚨

**Estado**: renderizado en la landing (`app/page.tsx:23`), emite 4 bloques JSON-LD: `Course`, `Organization`, `WebSite`, `EducationalOrganization`.

**Problemas críticos** (valores literales en el archivo):

```
"provider.name":      "Tu Empresa"        // placeholder
"provider.sameAs":    "https://tudominio.com"  // placeholder
"organization.url":   "https://tudominio.com"  // placeholder
"organization.logo":  "https://tudominio.com/logo.png"  // placeholder
"organization.sameAs":["https://twitter.com/tutwitter", "https://linkedin.com/company/tuempresa"]  // placeholder
"contactPoint.email": "support@tudominio.com"  // placeholder
"website.url":        "https://tudominio.com"  // placeholder
"educationalOrg.name":"Tu Empresa"        // placeholder
```

**Riesgo de penalidad**: el bloque `Course` emite una `aggregateRating` con:
```
"ratingValue": "4.9"
"ratingCount": "2500"
```

Estos valores son **ficticios** (Itera no tiene 2500 reviews reales). Google trata esto como [review snippet spam](https://developers.google.com/search/docs/appearance/structured-data/review-snippet#guidelines) — penalidad manual posible + pérdida de rich snippets permanente.

Además, `offers.price` dice `"247"` — contradice el pricing real ($19/mes en `CONTEXT.md`). Crawlers toman la señal del structured data como canónica; un precio incorrecto aquí confunde el índice.

**Acción**: esta sección es **fuego**. Fix antes de lanzar cualquier campaña de SEO/paid.

### `next.config.js` — red flags

```
typescript.ignoreBuildErrors: true   ⚠️ shipea código con errores de tipo
eslint.ignoreDuringBuilds:  true   ⚠️ shipea código con lint errors
```

No son estrictamente SEO, pero son **infra hygiene**: un SSR roto por un tipo mal escrito renderiza HTML vacío para el crawler, que lo interpreta como "soft 404".

---

## 2. Diagnóstico por dimensión

### 2.1 Discoverability (cómo nos encuentra Google)

- **Sin sitemap**: Googlebot tiene que descubrir rutas por crawl. Para un sitio con `/lecture/[slug]` dinámico, esto significa que lecciones nuevas tardan días/semanas en indexarse.
- **Sin robots.txt**: crawlers van a tocar `/api/*`, `/dashboard/*`, `/auth/*` desperdiciando crawl budget y pudiendo exponer rutas sensibles en logs/cache.
- **Canonical hardcoded**: todas las rutas apuntan a `https://itera.la` como canónica por herencia — significa que `/about`, `/privacy`, etc. se desduplican al home. Malo.

### 2.2 On-page SEO

- **Cero `generateMetadata` propio**: ninguna ruta aprovecha titles/descriptions específicos. `/privacy` en Google aparecería como *"Itera | Aprende IA Construyendo Tu Proyecto"* (el default), igualando a la home — pésima señal de diferenciación.
- **`/about` es thin content**: dos párrafos genéricos de 40 palabras. Google Quality Rater guidelines marcarían esto como low-quality para un dominio pequeño.
- **H1/Headings**: `/about` usa `text-4xl font-extrabold` inline en lugar de `<Title>` del design system — además de regla interna rota, falta consistencia para parsers.

### 2.3 International targeting (LATAM)

- `openGraph.locale: "es_ES"` es español de España. Para audiencia LATAM:
  - Mejor opción: **`es_419`** (UN code para español latinoamericano, reconocido por Facebook/OG y Google).
  - `alternateLocale` correcto (`es_MX`, `es_AR`, `es_CO`) pero el primario está en el país equivocado.
- **No `hreflang` alternates en `metadata.alternates.languages`**: si más adelante hay versiones MX/AR específicas, esto es requerido.
- **`html lang="es"` genérico** (línea `layout.tsx:107`): OK para fallback pero sin señal regional.

### 2.4 Structured data — **EL problema**

Ya cubierto en §1. Resumen: **el archivo está en estado de template, publicando datos ficticios**. Dos acciones mutuamente excluyentes:
1. **Eliminar el componente entero** hasta tener datos reales (pérdida = ningún rich snippet).
2. **Reescribir** con valores reales + **eliminar `aggregateRating` hasta tener reviews genuinas**.

Voto por (2), usando `@graph` para combinar `Course` + `EducationalOrganization` + `Offer` con precio real ($19 USD/mes).

### 2.5 Performance / CWV (inferred, not measured)

Lo que veo en estático:
- ✅ `next/font` con `display: swap` (bien)
- ✅ `next/image` configurado con remotePatterns
- ⚠️ No veo `priority` en el hero image — LCP probablemente sufre
- ⚠️ Módulos usan `.webp` (bien), logos `.png` (podría ser `.svg` o `.webp`)
- ⚠️ `<AnimatedBackground />` primero en `app/page.tsx` — si es heavy JS/GSAP, puede arruinar LCP
- ⚠️ `ignoreBuildErrors` puede permitir shippear componentes que revientan SSR → HTML vacío para crawler

Sin Lighthouse real no hay números concretos. **Propuesta**: agregar Lighthouse CI en el pipeline cuando exista CI; corriente incorporar `@vercel/speed-insights` o PostHog Session Replay (ya que R15 recomendó PostHog).

### 2.6 Rutas noindex (lo que NO debe rankear)

Hoy, las 28 rutas no-públicas heredan `robots: index:true, follow:true`. Ninguna tiene override. Impacto real:
- **/dashboard/*** — si un user comparte link por error, queda indexable. Con datos reales → privacy leak.
- **/auth/login, /auth/signup** — páginas duplicadas compiten con landing.
- **/courseCreation, /onboarding, /intake** — flow intermedio, cero valor SEO, dilución del crawl budget.
- **/experiment, /experimentAlpha, /dashboardAlpha** — experimentos internos que no deberían estar en Google.

**Fix**: o `app/robots.ts` global, o `export const metadata = { robots: { index: false } }` en cada `layout.tsx` relevante (preferido para defensa en profundidad).

---

## 3. Top-10 issues priorizados (input para #19b)

| # | Issue | Severidad | Esfuerzo | Impacto | Estado |
|---|---|---|---|---|---|
| 1 | StructuredData.tsx con placeholders + aggregateRating falsa | 🚨 P0 | S (1h) | alto — riesgo penalidad Google + crawler consume datos mentirosos | ✅ **hecho** 2026-04-23 — `@graph` unificado, sin aggregateRating, valores reales |
| 2 | `/public/og-image.jpg` referenciado pero inexistente | 🚨 P0 | S (30min) | alto — previews rotos en Twitter/LinkedIn/WhatsApp | ✅ **hecho** 2026-04-23 — reemplazado por `app/opengraph-image.tsx` dinámico vía next/og |
| 3 | Falta `app/robots.ts` | 🚨 P0 | S (15min) | medio-alto — crawl budget desperdiciado, /dashboard indexable | ✅ **hecho** 2026-04-23 — 19 rutas privadas bloqueadas, sitemap linkeado |
| 4 | Falta `app/sitemap.ts` | 🚨 P0 | S (30min) | medio — lecciones nuevas tardan en indexar | ✅ **hecho** 2026-04-23 — 5 rutas públicas con priority/freq |
| 5 | `openGraph.locale: "es_ES"` → `"es_419"` | ⚠️ P1 | S (5min) | medio — misalineación regional | ✅ **hecho** 2026-04-23 — corregido + descripciones limpiadas (sin "400+ micro-videos", sin "Garantía de 30 días" hasta confirmar) |
| 6 | Descripción con "Garantía de 30 días" — verificar o borrar | ⚠️ P1 | S (verificación) | medio — riesgo reputacional si no es política real |
| 7 | 0 rutas tienen `generateMetadata` propia (privacy, terms, about, conferencias) | ⚠️ P1 | M (4-6h, 6 rutas) | medio — diferenciación en SERPs |
| 8 | `/about` es placeholder de 40 palabras (thin content) | ⚠️ P1 | M (copy + design) | medio — soft-spam signal |
| 9 | `ignoreBuildErrors: true` + `ignoreDuringBuilds: true` | ⚠️ P1 | L (fix deuda TS) | bajo-medio — hygiene → evita SSR roto |
| 10 | No `apple-icon` ni dynamic OG para `/lecture/[slug]` | 📎 P2 | S + M | bajo — shareability + CTR |

**Extras fuera del top-10** (anotados para #19b backlog):
- No hay `manifest.ts` (PWA).
- `/componentes` parece ser preview interno — revisar si es público accidentalmente.
- No hay schema `BreadcrumbList` para rutas jerárquicas.
- Canonical por-página pendiente.
- `next.config.js.images` no incluye `supabase.co` para imágenes de Supabase Storage.

---

## 4. Qué NO audité (gaps honestos)

- **Lighthouse / PageSpeed real**: requiere URL live; propuesto como paso 2 del audit. CWV reales (LCP, INP, CLS) solo se pueden medir con un browser sobre producción.
- **Google Search Console data**: no hay acceso desde este lado; Pablo tiene que validar `itera.la` en GSC para ver impresiones, queries, coverage errors, y Core Web Vitals en field.
- **Backlink profile**: fuera de scope de un audit técnico; esto es research separado (R2 o similar).
- **Keyword competitiveness**: mencioné los 16 keywords del root layout pero no comparé contra SERP real (Ahrefs/Semrush necesarios).
- **Mobile UX en producción**: tampoco se puede sin browser. Sospecha: `AnimatedBackground` puede lastimar mobile.
- **Indexación actual en Google** (`site:itera.la`): Pablo confirma desde GSC.

---

## 5. Siguientes pasos concretos

### Para Pablo (validaciones manuales, 20 min total)

1. **GSC**: validar propiedad de `itera.la` en [Google Search Console](https://search.google.com/search-console). Revisar Coverage + Core Web Vitals.
2. **Twitter `@iterala`**: confirmar que la cuenta existe o cambiar el handle.
3. **"Garantía de 30 días"**: decidir si es política real o remover de la descripción.
4. **`/componentes`**: confirmar si es página pública o debería noindex.
5. **Reviews reales**: ¿cuántos usuarios reales hay hoy? Si son <50, eliminar `aggregateRating` entero (no solo corregir números).

### Para #19b (ejecución de fixes, post-#3 landing estable)

En orden de ataque:
1. **Fix structured data** (P0-1): reescribir `StructuredData.tsx` con valores reales + quitar `aggregateRating` hasta que haya base de reviews.
2. **Crear `/public/og-image.jpg`** (P0-2): diseño 1200×630 usando identidad visual v1 (`itera-flat-v1`). Alternativa mejor: `app/opengraph-image.tsx` dinámico.
3. **Crear `app/robots.ts`** (P0-3): disallow `/api/*`, `/dashboard/*`, `/auth/*`, `/onboarding`, `/intake`, `/courseCreation`, `/project*`, `/home/*`, `/paywall`, `/lecture/*`, `/experiment*`, `/dashboardAlpha`, `/success`, `/cancel`. Sitemap URL.
4. **Crear `app/sitemap.ts`** (P0-4): rutas estáticas públicas + pull dinámico de lecciones publicadas desde Supabase.
5. **Locale fix** (P1-5): cambiar a `es_419` + añadir `alternates.languages`.
6. **Audit de descripción** (P1-6): Pablo confirma garantía.
7. **`generateMetadata` per-página** (P1-7): privacy, terms, about, conferencias, signup/login (noindex para estos dos).
8. **Rellenar `/about`** (P1-8): 300+ palabras reales de misión/equipo, con Headings jerárquicos y <Title>/<Body> del design system.
9. **Limpiar flags de `next.config.js`** (P1-9): fix errores TS/lint progresivamente, eliminar los `ignore`. Separar en ticket propio por tamaño.
10. **`apple-icon` + OG dinámico por lección** (P2-10).

### Para retorno al Wish List

- #19a ✅ **entregado este audit**.
- #19b ⚪ queda en deps de `#3 landing estable`. Cuando Pablo firme la narrativa de landing, se atacan los 10 fixes en orden.
- Gap cross-agent detectado: **Illustrations** puede producir el `og-image.jpg` usando `itera-flat-v1` (se alinea con #2 de su roadmap). Coordinación recomendada.

---

## 6. Apéndice — comandos de verificación

Cuando haya producción live (para #19b):

```bash
# Indexación actual
curl -s "https://www.google.com/search?q=site:itera.la" | grep -c "itera.la"

# robots.txt check
curl -sI https://itera.la/robots.txt

# sitemap check
curl -sI https://itera.la/sitemap.xml

# OG preview check
curl -s https://itera.la | grep -E "og:|twitter:" | head

# Structured data validator
# → https://search.google.com/test/rich-results?url=https://itera.la

# Lighthouse CLI
npx -y lighthouse https://itera.la --only-categories=seo,performance --quiet
```

---

**owner**: Wish List (#19a).
**siguiente**: #19b ejecución (bloqueada por #3 landing estable).
**referencias cruzadas**: `docs/CONTEXT.md` (pricing real, audiencia), `docs/IDENTIDAD_VISUAL.md` (para OG image), `components/shared/StructuredData.tsx:1-108` (archivo a corregir), `app/layout.tsx:19-99` (metadata raíz).
