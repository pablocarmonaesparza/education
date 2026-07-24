import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "./(app)/simulador.css";
import { Providers } from "./providers";

// Tipografía única del rediseño v2 (Claude Design, itera Landing.dc.html):
// Plus Jakarta Sans para TODO — display y body. Inter y Darker Grotesque
// murieron en la promoción 2026-07-16 (Inter ya estaba muerta de facto:
// body era Arial y .simulador-root la pisaba; Darker Grotesque era una sola
// regla h1-h6 en globals.css). Viven en git history.
const jakarta = Plus_Jakarta_Sans({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://itera.la'),
  title: {
    default: "Itera | AI judgment, measured.",
    template: "%s | Itera",
  },
  description:
    "Measure how your team decides with AI in real workflows, then turn the gaps into practice. For B2B teams putting AI in front of customers, sensitive data, and campaigns.",
  keywords: [
    "AI fluency assessment",
    "AI fluency",
    "AI readiness",
    "AI judgment",
    "team AI assessment",
    "enterprise AI assessment",
    "AI governance",
    "AI data privacy",
    "AI output verification",
    "AI practice simulations",
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
    // en_US: el mercado objetivo es EEUU (pivot 2026-07-15). El es_419/es_MX/es_AR/es_CO
    // anterior quedó en git — si Pablo reabre LATAM, vuelve como alternateLocale.
    locale: "en_US",
    url: "https://itera.la",
    siteName: "Itera",
    title: "Itera | AI judgment, measured.",
    description:
      "Measure how your team decides with AI in real workflows, then turn the gaps into practice.",
    // `images` omitido: `app/opengraph-image.tsx` genera el OG dinámico y
    // Next.js lo inyecta automáticamente.
  },
  twitter: {
    card: "summary_large_image",
    title: "Itera | AI judgment, measured.",
    description:
      "Measure how your team decides with AI in real workflows, then turn the gaps into practice.",
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
    <html lang="en" className={jakarta.variable} suppressHydrationWarning>
      <body className={`antialiased bg-white dark:bg-black text-gray-900 dark:text-gray-100 min-h-screen overscroll-none`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
