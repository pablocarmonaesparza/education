import type { Metadata } from "next";

// /design (editor de tokens + catálogo de componentes) es superficie interna de
// review. Accesible en prod sólo con NEXT_PUBLIC_DEV_BYPASS_ENABLED; nunca debe
// indexarse. La página es "use client", así que el noindex vive en el layout.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DesignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
