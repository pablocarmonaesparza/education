import type { Metadata } from "next";
import { Inter, Darker_Grotesque } from "next/font/google";
import "./globals.css";
import "./(app)/simulador.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const darkerGrotesque = Darker_Grotesque({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-darker-grotesque",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://itera.la'),
  title: {
    default: "Itera | Criterio de IA, medible.",
    template: "%s | Itera",
  },
  description:
    "Mide y mejora cómo tu equipo decide con IA en flujos reales. Diagnóstico de 30 días para equipos B2B antes de usar IA con clientes, datos sensibles o campañas.",
  keywords: [
    "diagnóstico IA equipos",
    "AI readiness B2B",
    "criterio IA",
    "evaluación IA equipos",
    "gobierno IA empresa",
    "privacidad datos IA",
    "validación output IA",
    "sprint IA 30 días",
    "simulador IA empresarial",
    "training IA managers",
    "LATAM IA empresas",
    "Itera",
  ],
  authors: [{ name: "Itera" }],
  creator: "Itera",
  publisher: "Itera",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    type: "website",
    // es_419 = UN code para español latinoamericano. Mejor señal regional
    // que "es_ES" (España). Ver docs/research/SEO_AUDIT_v1.md §2.3.
    locale: "es_419",
    alternateLocale: ["es_MX", "es_AR", "es_CO"],
    url: "https://itera.la",
    siteName: "Itera",
    title: "Itera | Criterio de IA, medible.",
    description:
      "Diagnóstico de 30 días que mide y mejora cómo tu equipo decide con IA en flujos reales.",
    // `images` omitido: `app/opengraph-image.tsx` genera el OG dinámico y
    // Next.js lo inyecta automáticamente.
  },
  twitter: {
    card: "summary_large_image",
    title: "Itera | Criterio de IA, medible.",
    description:
      "Mide y mejora cómo tu equipo decide con IA en flujos reales, en 30 días.",
    // `images` omitido: file-based `app/opengraph-image.tsx` se reutiliza
    // como twitter:image automáticamente.
    creator: "@iterala",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://itera.la",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${darkerGrotesque.variable}`} suppressHydrationWarning>
      <body className={`antialiased bg-white dark:bg-black text-gray-900 dark:text-gray-100 min-h-screen overscroll-none`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
