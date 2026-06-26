"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/simulador/AppSidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const isRuntime =
    pathname.startsWith("/case/") || pathname.startsWith("/jugar/");
  // El runtime y el reporte son surfaces autónomas (sin sidebar ni padding).
  // /admin SÍ usa el AppSidebar (con su nav admin), así que ya NO es surface-owned:
  // el sidebar es la navegación del backoffice y las páginas admin dejan de traer
  // su propia SurfaceNav (eso causaba el doble logo).
  const isSurfaceOwned = isRuntime || pathname.startsWith("/report/");

  return (
    <>
      {!isSurfaceOwned && <AppSidebar />}
      <div className={isSurfaceOwned ? undefined : "md:pl-[224px]"}>
        {children}
      </div>
    </>
  );
}
