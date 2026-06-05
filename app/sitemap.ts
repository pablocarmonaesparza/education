import type { MetadataRoute } from 'next';

const BASE_URL = 'https://itera.la';

/**
 * Sitemap de Itera.
 *
 * Incluye solo rutas públicas cara-al-mundo. El runtime de casos, reportes,
 * dashboard y app autenticada no se indexan: son producto/app, no contenido SEO.
 *
 * Cuando se agreguen páginas estáticas nuevas (ej. case studies o contenido
 * editorial), añadirlas acá. No incluir rutas de diagnóstico o app privada.
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
