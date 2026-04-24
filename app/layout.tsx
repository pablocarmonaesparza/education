import type { Metadata } from "next";
import { Inter, Darker_Grotesque } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import HashScrollHandler from "@/components/shared/HashScrollHandler";

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
    default: "Itera | Aprende IA Construyendo Tu Proyecto",
    template: "%s | Itera",
  },
  description:
    "Aprende a construir con inteligencia artificial en 3 semanas. Ejercicios cortos e interactivos, ruta personalizada por Claude AI, de la idea al MVP.",
  keywords: [
    "curso inteligencia artificial",
    "aprender IA",
    "Claude AI",
    "automatización con IA",
    "curso IA personalizado",
    "MCP",
    "RAG",
    "agentes IA",
    "curso IA latinoamerica",
    "curso IA español",
    "micro-learning IA",
    "programación IA",
    "proyectos IA",
    "MVP con IA",
    "curso online IA",
    "itera",
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
    title: "Itera | Aprende IA Construyendo Tu Proyecto",
    description:
      "Ejercicios cortos, ruta personalizada por Claude AI, y de la idea al MVP en 3 semanas.",
    // `images` omitido: `app/opengraph-image.tsx` genera el OG dinámico y
    // Next.js lo inyecta automáticamente.
  },
  twitter: {
    card: "summary_large_image",
    title: "Itera | Aprende IA Construyendo Tu Proyecto",
    description:
      "Ruta personalizada por Claude AI. Ejercicios cortos. De la idea al MVP.",
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
  category: "education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${darkerGrotesque.variable}`} suppressHydrationWarning>
      <body className={`antialiased bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-screen overscroll-none`}>
        <HashScrollHandler />
        {children}
      </body>
    </html>
  );
}
