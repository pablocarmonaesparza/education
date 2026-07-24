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
 * Colores del rediseño v2 (Claude Design, 2026-07-16): accent #003AFF,
 * tinta ink #171d33. Antes: #1472FF/#4b4b4b (git history).
 */

export const runtime = 'edge';
export const alt = 'Itera — criterio de IA, medible';
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
            color: '#003AFF',
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
          criterio de IA, medible.
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 30,
            color: '#171d33',
            marginTop: 36,
            fontWeight: 500,
          }}
        >
          casos vivos · evaluacion operativa · evidencia para managers
        </div>

        <div
          style={{
            display: 'flex',
            height: '8px',
            width: '120px',
            background: '#003AFF',
            marginTop: 48,
            borderRadius: '999px',
          }}
        />
      </div>
    ),
    { ...size },
  );
}
