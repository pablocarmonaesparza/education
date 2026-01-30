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
    "Aprende a construir proyectos con IA en 3 semanas. Ruta 100% personalizada por Claude AI. 400+ micro-videos, gamificación, y de la idea al MVP. Garantía de 30 días.",
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
    locale: "es_ES",
    alternateLocale: ["es_MX", "es_AR", "es_CO"],
    url: "https://itera.la",
    siteName: "Itera",
    title: "Itera | Aprende IA Construyendo Tu Proyecto",
    description:
      "Aprende IA con una ruta 100% personalizada. 400+ videos de 1-3 min, gamificación, y construye tu MVP. Garantía de 30 días.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Itera - Aprende IA Construyendo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Itera | Aprende IA Construyendo Tu Proyecto",
    description:
      "Ruta 100% personalizada por Claude AI. 400+ micro-videos. De la idea al MVP.",
    images: ["/og-image.jpg"],
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
