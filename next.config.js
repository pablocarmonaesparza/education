/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: false,
  // Sin overlays de dev encima de las pantallas: apaga el badge/indicador de
  // Next.js Dev Tools (el "N" flotante) para que las superficies de producto se
  // revisen limpias. Ver docs/memory/decision_pantallas_review_sin_dev_overlays.
  devIndicators: false,
  allowedDevOrigins: ['host.docker.internal'],
  // @heroui/react es un barrel gigante; esto hace tree-shake por import real
  // en vez de arrastrar el paquete completo a cada chunk.
  experimental: {
    optimizePackageImports: ['@heroui/react'],
  },
  // El endpoint de generación bespoke corre el motor (.mjs) vía child_process;
  // incluimos los scripts + los YAML que el motor lee (schemas, golden) en el
  // bundle del servidor para que estén disponibles en runtime.
  outputFileTracingIncludes: {
    '/api/orgs/[org_id]/cases/generate': [
      './scripts/simulador/**',
      './docs/simulador/case_factory/**',
      './docs/simulador/contrato_v0/cases_assembled/**',
    ],
  },
  // Headers de seguridad básicos (F5). No incluimos Content-Security-Policy:
  // Next.js + HeroUI inyectan estilos/scripts inline y una CSP estricta
  // rompería el render; se deja como deuda consciente para endurecer después
  // con nonces. Estos headers son seguros y no rompen nada.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
