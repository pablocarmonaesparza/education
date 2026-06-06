/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: false,
  // Sin overlays de dev encima de las pantallas: apaga el badge/indicador de
  // Next.js Dev Tools (el "N" flotante) para que las superficies de producto se
  // revisen limpias. Ver docs/memory/decision_pantallas_review_sin_dev_overlays.
  devIndicators: false,
  allowedDevOrigins: ['host.docker.internal'],
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
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vimeo.com',
      },
      {
        protocol: 'https',
        hostname: 'youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'i.vimeocdn.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
    ],
  },
}

module.exports = nextConfig
