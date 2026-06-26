"use client";

/**
 * Dashboard del manager.
 *
 * Lee /api/dashboard que agrega:
 *   - team del user
 *   - sprint activo
 *   - members + sus sessions/reports
 *   - aggregate (bands, dim averages, risk count)
 *
 * Si el user es un employee sin manager scope, vera la vista limitada
 * (sólo su propia session). Para una UI separada de "employee home" en
 * el futuro, se puede router-split.
 */

import StaffDashboard from "./StaffDashboard";

export default function DashboardPage() {
  return <StaffDashboard />;
}
