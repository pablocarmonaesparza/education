/**
 * Structured data (JSON-LD) para la landing de Itera.
 *
 * Diseño:
 *  - Un solo bloque `@graph` en vez de 4 scripts sueltos, para que Google
 *    resuelva referencias entre entidades (`@id` + `publisher`/`provider`).
 *  - Sin `aggregateRating`: Itera no tiene una base de reviews auditable. Un
 *    rating ficticio es spam según las Google Review Snippet Guidelines y
 *    puede resultar en penalidad manual + pérdida permanente de rich
 *    snippets. Se re-agregará cuando exista un sistema de reviews real
 *    (Trustpilot, G2, reviews propios con `Review` schema verificable).
 *  - Sin `sameAs`/social handles: no se listan aquí hasta confirmar que
 *    las cuentas existen bajo el dominio Itera.
 *  - El producto activo es el Simulador: diagnostico operativo de criterio
 *    de IA para equipos B2B. No describir cursos legacy en SEO publico.
 *
 * Ver `docs/research/SEO_AUDIT_v1.md §2.4` para contexto de la reescritura.
 */

const SITE_URL = 'https://itera.la';
const ORG_ID = `${SITE_URL}#org`;

export default function StructuredData() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORG_ID,
        name: 'Itera',
        url: SITE_URL,
        logo: `${SITE_URL}/favicon.png`,
        description:
          'Diagnostico operativo de criterio en uso de IA para equipos B2B en LATAM.',
        areaServed: [
          'MX', 'AR', 'CO', 'CL', 'PE', 'UY', 'PY', 'BO', 'EC', 'VE',
          'DO', 'GT', 'SV', 'HN', 'NI', 'CR', 'PA', 'CU',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}#website`,
        name: 'Itera',
        url: SITE_URL,
        description:
          'Mide y mejora como tu equipo decide con IA en flujos reales, antes de usarla con clientes, datos sensibles o campanas.',
        inLanguage: 'es-419',
        publisher: { '@id': ORG_ID },
      },
      {
        '@type': 'Service',
        '@id': `${SITE_URL}#ai-readiness-diagnostic`,
        name: 'Diagnostico operativo de criterio de IA',
        description:
          'Simulador de casos vivos para evaluar contexto, datos, ejecucion con IA, validacion, juicio e impacto cuando equipos usan IA bajo presion operativa.',
        provider: { '@id': ORG_ID },
        areaServed: [
          'MX', 'AR', 'CO', 'CL', 'PE', 'UY', 'PY', 'BO', 'EC', 'VE',
          'DO', 'GT', 'SV', 'HN', 'NI', 'CR', 'PA', 'CU',
        ],
        audience: {
          '@type': 'BusinessAudience',
          audienceType: 'B2B mid-market teams',
        },
        offers: {
          '@type': 'Offer',
          category: 'B2B diagnostic',
          priceCurrency: 'USD',
          priceSpecification: {
            '@type': 'PriceSpecification',
            minPrice: '1000',
            maxPrice: '8000',
            priceCurrency: 'USD',
          },
          availability: 'https://schema.org/InStock',
          url: `${SITE_URL}#precio`,
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
