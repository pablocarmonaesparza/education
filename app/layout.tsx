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
  metadataBase: new URL('https://tudominio.com'), // Actualizar con tu dominio real
  title: {
    default: "Curso de IA Personalizado con Claude | Aprende Automatización con IA",
    template: "%s | Curso IA Personalizado",
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
  ],
  authors: [{ name: "Tu Nombre" }], // Actualizar
  creator: "Tu Nombre", // Actualizar
  publisher: "Tu Empresa", // Actualizar
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    alternateLocale: ["es_MX", "es_AR", "es_CO"],
    url: "https://tudominio.com",
    siteName: "Curso IA Personalizado",
    title: "Construye Proyectos con IA en 3 Semanas | Ruta Personalizada con Claude",
    description:
      "Aprende IA con una ruta 100% personalizada. 400+ videos de 1-3 min, gamificación, y construye tu MVP. 2,500+ estudiantes. 4.9/5 rating. Garantía de 30 días.",
    images: [
      {
        url: "/og-image.jpg", // Crear esta imagen
        width: 1200,
        height: 630,
        alt: "Curso de IA Personalizado con Claude AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Curso de IA Personalizado | Construye Tu Proyecto en 3 Semanas",
    description:
      "Ruta 100% personalizada por Claude AI. 400+ micro-videos. De la idea al MVP. Únete a 2,500+ estudiantes.",
    images: ["/twitter-image.jpg"], // Crear esta imagen
    creator: "@tutwitter", // Actualizar
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
  verification: {
    google: "tu-codigo-de-verificacion", // Actualizar con Google Search Console
  },
  alternates: {
    canonical: "https://tudominio.com",
    languages: {
      "es-ES": "https://tudominio.com",
      "es-MX": "https://tudominio.com/mx",
      "es-AR": "https://tudominio.com/ar",
      "es-CO": "https://tudominio.com/co",
    },
  },
  category: "education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${darkerGrotesque.variable}`}>
      <body className={`antialiased bg-white text-gray-900`}>
        <HashScrollHandler />
        {children}
      </body>
    </html>
  );
}
