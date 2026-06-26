"use client";

import { usePathname } from "next/navigation";

// Lista completa en el orden canónico; cada página omite su propio link.
const ADMIN_LINKS: Array<[href: string, label: string]> = [
  ["/admin/review", "Review"],
  ["/admin/leads", "Leads"],
  ["/admin/captacion", "Captación"],
  ["/admin/orgs", "Orgs"],
  ["/admin/cases", "Casos"],
  ["/admin/lecciones", "Lecciones"],
  ["/admin/judge-health", "Judge health"],
  ["/admin/audit-log", "Audit log"],
];

export function AdminLinks() {
  const pathname = usePathname();

  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {ADMIN_LINKS.filter(([href]) => href !== pathname).map(
        ([href, label]) => (
          <a
            key={href}
            href={href}
            className="rounded-full bg-[var(--surface-2)] px-4 py-2 ts-subhead font-medium text-[var(--text-primary)] hover:bg-[var(--surface-3)]"
          >
            {label}
          </a>
        ),
      )}
    </div>
  );
}
