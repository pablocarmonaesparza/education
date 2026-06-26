"use client";

/**
 * /staff/reportes — reportes individuales listos para revisar (vista manager).
 * Una sola vista: la lista de miembros con reporte publicado + abrir reporte.
 * (El agregado del equipo vive en /staff/matriz y /staff/recomendaciones.)
 */

import StaffDashboard from "../StaffDashboard";

export default function StaffReportesPage() {
  return <StaffDashboard section="reportes" />;
}
