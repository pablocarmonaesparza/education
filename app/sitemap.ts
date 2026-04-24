import type { MetadataRoute } from 'next';

const BASE_URL = 'https://itera.la';

/**
 * Sitemap de Itera.
 *
 * Incluye solo rutas públicas cara-al-mundo. Las lecciones (`/lecture/[slug]`)
 * son auth-gated — no tiene sentido exponerlas al crawler porque Google no
 * podrá renderizarlas sin sesión (aparecen como redirect a `/auth/login`).
 *
 * Cuando `/conferencias` crezca o se agreguen páginas estáticas nuevas
 * (ej. case studies, content marketing), añadirlas acá.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/conferencias`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
