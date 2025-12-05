"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-gray-600">
              &copy; {currentYear} Leap. Todos los derechos reservados.
            </p>
          </div>
          <div className="flex gap-6">
            <Link
              href="/terms"
              className="text-gray-600 hover:text-brand-dark transition-colors"
            >
              Términos
            </Link>
            <Link
              href="/privacy"
              className="text-gray-600 hover:text-brand-dark transition-colors"
            >
              Privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
