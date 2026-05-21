/**
 * /dashboard — entry-point compartido que redirige a la home del rol.
 *
 *   org_admin  → /equipo   (vista del team agregada)
 *   employee   → /inicio   (vista personal: próximo caso, último reporte)
 *   itera_staff → /staff   (review queue)
 *
 * Existe principalmente para que links legacy que apuntaban a /dashboard
 * sigan funcionando + para que el flow de login default pueda redirect
 * acá sin saber el rol todavía.
 *
 * TODO post-MVP: leer el role real del user (simulador.organization_memberships
 * + isStaffEmail()). Por ahora redirect a /equipo por default ya que el flow
 * actual es buyer-first (Head of Marketing que pagó).
 */

import { redirect } from "next/navigation";

export default function DashboardRouter() {
  redirect("/equipo");
}
