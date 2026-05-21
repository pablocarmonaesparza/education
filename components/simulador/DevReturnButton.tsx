"use client";

/**
 * Botón flotante chico en la esquina bottom-right que vuelve al hub /dev.
 * Visible en:
 *   - npm run dev local (NODE_ENV=development)
 *   - Vercel preview deploys (NEXT_PUBLIC_VERCEL_ENV=preview)
 * Oculto en producción real (Vercel production o stand-alone production).
 *
 * Además requiere cookie `itera_dev_bypass=1` activa.
 *
 * Se monta globalmente en app/layout.tsx para estar disponible en todas
 * las surfaces sin tener que importarlo en cada page.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isDevBypassEnabled } from "@/lib/dev/devBypass";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

export function DevReturnButton() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isDevBypassEnabled()) return;
    const interval = setInterval(() => {
      setVisible(readCookie("itera_dev_bypass") === "1");
    }, 500); // refresh state in case cookie was toggled in another tab
    setVisible(readCookie("itera_dev_bypass") === "1");
    return () => clearInterval(interval);
  }, []);

  // Hide on /dev itself (we're already there)
  if (!visible || pathname === "/dev") return null;

  return (
    <Link
      href="/dev"
      className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-1.5 rounded-[var(--radius-md,12px)] border border-[var(--hairline,rgba(0,0,0,0.06))] bg-[var(--surface,#fff)]/95 px-3 py-2 text-[12px] font-medium text-[var(--text-secondary,#6e6e73)] shadow-[0_4px_12px_rgba(0,0,0,0.08)] backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-[var(--surface-2,#fafafa)] hover:text-[var(--text-primary,#1d1d1f)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]"
      aria-label="Volver al hub /dev"
    >
      <span aria-hidden>←</span>
      <span>dev</span>
    </Link>
  );
}
