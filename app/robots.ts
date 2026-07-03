import type { MetadataRoute } from 'next';

/**
 * Reglas de crawl para Itera.
 *
 * Política: sitio público cara-al-mundo abierto; toda la app autenticada
 * (`/dashboard/*`, onboarding flow, `/api/*`, flujos post-checkout) bloqueada
 * para preservar crawl budget y evitar que páginas intermedias compitan con
 * la landing real en SERPs.
 *
 * Defensa en profundidad: `robots.txt` es orientativo (los crawlers pueden
 * ignorarlo). Cada layout privado debería exportar `metadata.robots.index: false`
 * como fallback. Ver `docs/research/SEO_AUDIT_v1.md §2.6`.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        disallow: [
          '/api/',
          '/auth/',
          '/dashboard',
          '/case',
          '/report',
          '/admin',
          '/onboarding',
          '/success',
          '/cancel',
          // Rutas internas de review (QA). Normalmente 404 en prod, pero quedan
          // accesibles cuando NEXT_PUBLIC_DEV_BYPASS_ENABLED está activo: nunca
          // deben indexarse ni catalogar el mapa del backoffice.
          '/dev',
          '/design',
          '/exercise-lab',
          '/case-demo',
          '/case-template',
        ],
      },
    ],
    sitemap: 'https://itera.la/sitemap.xml',
    host: 'https://itera.la',
  };
}
