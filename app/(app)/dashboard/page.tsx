/**
 * /dashboard — entry-point compartido que redirige a la home del rol.
 *
 *   org_admin (manager) → /staff    (vista del team agregada)
 *   employee            → /team     (vista personal: próximo caso, último reporte)
 *   itera_staff         → /admin    (review queue interna de Itera)
 *
 * Existe para que links legacy que apuntaban a /dashboard sigan funcionando
 * + para que el flow de login default pueda redirect acá sin saber el rol
 * todavía.
 *
 * TODO post-MVP: leer el role real del user (simulador.organization_memberships
 * + isStaffEmail()). Por ahora redirect a /staff por default ya que el flow
 * actual es buyer-first (Head of Marketing que pagó).
 */

import { redirect } from "next/navigation";

export default function DashboardRouter() {
  redirect("/staff");
}
