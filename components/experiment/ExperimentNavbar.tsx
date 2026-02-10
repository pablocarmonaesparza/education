import Link from "next/link";
import { Button } from "@/components/ui";

const navLinks = [
  { href: "#ruta", label: "Ruta" },
  { href: "#demo", label: "Demo" },
  { href: "#habito", label: "Habito" },
  { href: "#proyecto", label: "Proyecto" },
];

export default function ExperimentNavbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-800/70 border-b border-gray-200/70 dark:border-gray-700/60">
      <div className="container mx-auto px-4">
        <div className="h-20 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#1472FF]">
              Itera
            </span>
            <span className="text-sm font-bold uppercase tracking-wide text-[#4b4b4b] dark:text-white">
              Exercise Lab
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-2xl text-sm font-bold uppercase tracking-wide text-[#4b4b4b] dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <Button
            href="#demo"
            variant="primary"
            depth="full"
            rounded2xl
            size="sm"
            className="hidden sm:inline-flex items-center justify-center"
          >
            Probar ejercicio
          </Button>
        </div>
      </div>
    </header>
  );
}
