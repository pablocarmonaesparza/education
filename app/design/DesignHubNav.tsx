"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * DesignHubNav — barra del hub del design system. /design es el centro: desde
 * aquí se llega a Tokens (/design), Componentes (/design/components) y Bloques
 * (/exercise-lab). Se monta arriba de cada superficie del hub para que todo se
 * vea desde un solo lugar.
 */
const TABS: { href: string; label: string; match: (p: string) => boolean }[] = [
  { href: "/design", label: "Tokens", match: (p) => p === "/design" },
  {
    href: "/design/components",
    label: "Componentes",
    match: (p) => p.startsWith("/design/components"),
  },
  { href: "/exercise-lab", label: "Bloques", match: (p) => p.startsWith("/exercise-lab") },
];

export function DesignHubNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Design system"
      className="simulador-root border-b border-[var(--hairline)] bg-[var(--surface)]"
    >
      <div className="mx-auto flex max-w-[1280px] items-center gap-2 px-6 py-2.5 lg:px-10">
        <span className="eyebrow mr-2">design system</span>
        <div className="flex items-center gap-1">
          {TABS.map((t) => {
            const active = t.match(pathname);
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-[var(--radius-sm)] px-3 py-1.5 ts-subhead font-medium transition-colors ${
                  active
                    ? "accent-bg text-white"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
