"use client";

/**
 * /staff/recomendaciones — acciones recomendadas por persona (vista manager).
 * Una sola vista: los cuatro caminos (pilotar/entrenar/pausar/escalar) con counts.
 */

import StaffDashboard from "../StaffDashboard";

export default function StaffRecomendacionesPage() {
  return <StaffDashboard section="recomendaciones" />;
}
