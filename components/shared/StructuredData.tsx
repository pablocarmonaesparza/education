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
 *  - Precio: $19 USD (subscription). Coincide con `docs/CONTEXT.md`.
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
        '@type': 'EducationalOrganization',
        '@id': ORG_ID,
        name: 'Itera',
        url: SITE_URL,
        logo: `${SITE_URL}/favicon.png`,
        description:
          'Plataforma de educación en inteligencia artificial para LATAM. Enfoque en retención y ejecución, no en consumir información.',
        areaServed: [
          'MX', 'AR', 'CO', 'CL', 'PE', 'UY', 'PY', 'BO', 'EC', 'VE',
          'DO', 'GT', 'SV', 'HN', 'NI', 'CR', 'PA', 'CU',
        ],
        // Nota: `audience` e `inLanguage` NO son válidos sobre
        // EducationalOrganization/Organization en schema.org. Viven en el
        // nodo Course (abajo), que sí es CreativeWork y los acepta.
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}#website`,
        name: 'Itera',
        url: SITE_URL,
        description:
          'Aprende a construir con inteligencia artificial. Ejercicios cortos e interactivos, ruta personalizada por Claude AI.',
        inLanguage: 'es-419',
        publisher: { '@id': ORG_ID },
      },
      {
        '@type': 'Course',
        '@id': `${SITE_URL}#course`,
        name: 'Curso de IA aplicada, personalizado por Claude',
        description:
          'Aprende inteligencia artificial construyendo tu proyecto. 100 lecciones en 10 secciones (introducción, fundamentos, asistentes, contenido, automatización, bases de datos, APIs y MCPs, agentes, vibe coding, implementación). Ruta completa o ruta personalizada según lo que quieras construir.',
        provider: { '@id': ORG_ID },
        inLanguage: 'es-419',
        educationalLevel: 'beginner to advanced',
        teaches: [
          'Inteligencia artificial aplicada',
          'Prompting y uso de LLMs',
          'Automatización con n8n',
          'Bases de datos y RAG',
          'APIs, MCPs y Skills',
          'Agentes de IA',
        ],
        hasCourseInstance: {
          '@type': 'CourseInstance',
          courseMode: 'online',
          // PT3W alinea con la promesa "en 3 semanas" de la root metadata.
          // Si el claim cambia, ajustar aquí para que el schema no contradiga.
          courseWorkload: 'PT3W',
        },
        offers: {
          '@type': 'Offer',
          category: 'Subscription',
          priceCurrency: 'USD',
          price: '19',
          availability: 'https://schema.org/InStock',
          url: `${SITE_URL}#pricing`,
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
