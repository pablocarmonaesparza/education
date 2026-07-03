import type { Metadata } from "next";

// /dev expone el mapa completo del backoffice + el toggle del auth bypass. Nunca
// debe indexarse — y menos cuando la review está habilitada en prod
// (NEXT_PUBLIC_DEV_BYPASS_ENABLED). robots.txt es orientativo; este noindex es el
// fallback duro. La página es "use client" y no puede exportar metadata, por eso
// vive en el layout server.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DevLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
