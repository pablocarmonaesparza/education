"use client";

/**
 * /staff/equipo — vista detallada del team (manager).
 *
 * Por ahora muestra el mismo agregado que /staff (lee /api/dashboard).
 * TODO mañana separar concerns:
 *   /staff         → resumen del sprint (KPIs, progreso, riesgo)
 *   /staff/equipo  → lista detallada de cada miembro + matriz dim×banda
 */

import StaffDashboard from "../StaffDashboard";

export default function DashboardPage() {
  return <StaffDashboard section="equipo" />;
}
