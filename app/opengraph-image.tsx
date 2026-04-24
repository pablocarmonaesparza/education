import { ImageResponse } from 'next/og';

/**
 * Open Graph image dinámica para la landing.
 *
 * Reemplaza el `/og-image.jpg` (404) que referenciaba `layout.tsx`. Al vivir
 * como `app/opengraph-image.tsx`, Next.js lo auto-inyecta en el `<head>`
 * como `og:image` y `twitter:image` sin necesidad de `metadata.openGraph.images`.
 *
 * Diseño minimalista: wordmark + tagline + acento en primary. No fetch de
 * fonts externos (peor cold-start), se usa `system sans-serif` que mantiene
 * un look limpio.
 *
 * Colores tomados de `CLAUDE.md` (primary `#1472FF`, text main `#4b4b4b`).
 */

export const runtime = 'edge';
export const alt = 'Itera — aprende a construir con inteligencia artificial';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 44,
            color: '#1472FF',
            fontWeight: 800,
            letterSpacing: '-1px',
          }}
        >
          itera
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 88,
            color: '#0a0a0a',
            fontWeight: 900,
            marginTop: 32,
            lineHeight: 1.05,
            letterSpacing: '-3px',
          }}
        >
          aprende a construir con IA.
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 30,
            color: '#4b4b4b',
            marginTop: 36,
            fontWeight: 500,
          }}
        >
          ruta personalizada por Claude · ejercicios cortos · de la idea al MVP
        </div>

        <div
          style={{
            display: 'flex',
            height: '8px',
            width: '120px',
            background: '#1472FF',
            marginTop: 48,
            borderRadius: '999px',
          }}
        />
      </div>
    ),
    { ...size },
  );
}
