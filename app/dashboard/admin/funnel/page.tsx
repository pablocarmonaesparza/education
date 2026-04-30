import { redirect } from 'next/navigation';
import Card, { CardFlat } from '@/components/ui/Card';
import { Headline, Body, Caption } from '@/components/ui/Typography';
import Tag from '@/components/ui/Tag';
import Divider from '@/components/ui/Divider';
import EmptyState from '@/components/ui/EmptyState';
import StatCard from '@/components/ui/StatCard';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdmin } from '@/lib/auth/isAdmin';
import {
  FLAG_REASON_LABEL,
  getGlobalEngagement,
  getOpenFlagsBySection,
  getSectionAnalytics,
  getTopFlaggedSlides,
  getWorstCompletionLectures,
  type SlideFlagReason,
} from '@/lib/analytics';

/**
 * Dashboard admin de Education — funnel + flags.
 *
 * URL: /dashboard/admin/funnel
 * Auth: solo emails @itera.la o whitelist (`lib/auth/isAdmin.ts`).
 *
 * Server-rendered. Las queries van con un cliente service-role
 * (`lib/supabase/admin.ts`) que bypassa RLS — necesario porque
 * `user_progress` y `slide_flags` tienen RLS estricta y las views
 * (`security_invoker = true`) heredan ese filtro. Sin service-role,
 * el dashboard mostraría solo las filas del admin autenticado.
 *
 * Owner: Education (T1.2). Gamification extiende `lib/analytics/`
 * para vistas user-facing sin tocar este archivo.
 */

export const dynamic = 'force-dynamic';

const numberFmt = new Intl.NumberFormat('es-MX');

function formatSeconds(s: number | null | undefined): string {
  if (s === null || s === undefined) return '—';
  if (s < 60) return `${Math.round(s)} s`;
  const m = Math.round(s / 60);
  return `${m} min`;
}

function formatRelative(iso: string | null | undefined): string {
  if (!iso) return '—';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '—';
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'hace segundos';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `hace ${days} d`;
  const months = Math.floor(days / 30);
  return `hace ${months} mes${months === 1 ? '' : 'es'}`;
}

function reasonTagVariant(r: SlideFlagReason) {
  // Bug duro (respuesta incorrecta marcada como correcta o viceversa) →
  // warning. Calidad pedagógica (poco claro / visual) → primary.
  // Tipeo / otro → neutral.
  if (r === 'wrong_correct_answer' || r === 'wrong_incorrect_answer')
    return 'warning' as const;
  if (r === 'unclear_explanation' || r === 'visual_issue')
    return 'primary' as const;
  return 'neutral' as const;
}

function completionTagVariant(pct: number | null | undefined) {
  if (pct === null || pct === undefined) return 'neutral' as const;
  if (pct >= 80) return 'success' as const;
  if (pct >= 60) return 'primary' as const;
  return 'warning' as const;
}

function kpiColor(value: number, warningOver = 0): 'blue' | 'orange' {
  return value > warningOver ? 'orange' : 'blue';
}

export default async function AdminFunnelPage() {
  // Paso 1: validar sesión + admin con el cliente cookie-scoped.
  const sessionClient = await createClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  if (!user) redirect('/auth/login?next=/dashboard/admin/funnel');
  if (!isAdmin(user)) redirect('/dashboard');

  // Paso 2: ya validados como admin, hacemos las queries con service-role
  // para bypassar RLS y ver agregados org-wide reales (no solo los del admin).
  // `createAdminClient()` puede fallar por varias razones (URL faltante,
  // service-role key faltante, malformada), así que el título del shell
  // de error se deriva del propio mensaje en vez de hardcodearse a una
  // sola variable.
  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    const detail =
      err instanceof Error
        ? err.message
        : 'no se pudo inicializar el cliente service-role';
    return (
      <AdminErrorShell
        title="configuración de supabase incompleta"
        detail={detail}
      />
    );
  }

  const [
    globalRes,
    sectionsRes,
    topFlagsRes,
    worstCompletionRes,
    openBySectionRes,
  ] = await Promise.all([
    getGlobalEngagement(admin),
    getSectionAnalytics(admin),
    getTopFlaggedSlides(admin, { onlyOpen: true, limit: 20 }),
    getWorstCompletionLectures(admin, { minStarts: 5, limit: 10 }),
    getOpenFlagsBySection(admin),
  ]);

  // Si CUALQUIERA falla, no enmascaramos como empty — se vería igual que
  // "todo bien, cero usuarios" cuando en realidad es un permiso roto.
  const errors: { label: string; message: string }[] = [];
  if (globalRes.error)
    errors.push({ label: 'global', message: globalRes.error.message });
  if (sectionsRes.error)
    errors.push({ label: 'sección', message: sectionsRes.error.message });
  if (topFlagsRes.error)
    errors.push({ label: 'flags top', message: topFlagsRes.error.message });
  if (worstCompletionRes.error)
    errors.push({
      label: 'finalización de lecciones',
      message: worstCompletionRes.error.message,
    });
  if (openBySectionRes.error)
    errors.push({
      label: 'flags por sección',
      message: openBySectionRes.error.message,
    });

  const global = globalRes.data;
  const sections = sectionsRes.data;
  const topFlags = topFlagsRes.data;
  const worstCompletion = worstCompletionRes.data;
  const openBySection = openBySectionRes.data;

  // KPIs globales: count(distinct user_id) sobre user_progress vía la view
  // global_engagement. Antes se calculaba con Math.max sobre per-section,
  // que sub-cuenta cuando los users se distribuyen entre secciones.
  const totalUsers = global.total_users_ever;
  const totalActive7d = global.active_last_7d;
  const totalActive30d = global.active_last_30d;
  const totalOpenFlags = openBySection.reduce(
    (acc, s) => acc + s.open_flags,
    0,
  );

  return (
    <main className="min-h-screen bg-white dark:bg-gray-800 py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="space-y-1">
          <Headline as="h1">funnel y reportes</Headline>
          <Body>panel admin · estado del curso en producción</Body>
          <Caption>
            datos en vivo desde supabase · renderizado en el servidor
          </Caption>
        </div>

        {/* Errores arriba — si alguna query falló, se ve antes de los números */}
        {errors.length > 0 && (
          <Card variant="neutral" padding="lg">
            <Headline>error consultando datos</Headline>
            <Body className="mt-2">
              {errors.length === 1
                ? 'una query falló:'
                : `${errors.length} queries fallaron:`}
            </Body>
            <ul className="mt-3 space-y-1">
              {errors.map((e) => (
                <li key={e.label}>
                  <Caption>
                    <strong>{e.label}:</strong> {e.message}
                  </Caption>
                </li>
              ))}
            </ul>
            <Caption className="mt-3">
              cualquier sección de abajo puede estar incompleta. revisa permisos
              o el log del servidor antes de tomar decisiones.
            </Caption>
          </Card>
        )}

        {/* KPIs top — si la query global o la de flags por sección falló,
            NO mostramos números: alguno sería un cero engañoso. El total de
            flags abiertos se computa desde openBySectionRes, así que también
            tenemos que custodiar esa fuente. */}
        <section aria-label="indicadores generales">
          {globalRes.error || openBySectionRes.error ? (
            <SectionError label="indicadores generales" />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                icon="👥"
                value={numberFmt.format(totalUsers)}
                label="usuarios totales"
                color="blue"
              />
              <StatCard
                icon="🔥"
                value={numberFmt.format(totalActive7d)}
                label="activos 7 días"
                color="blue"
              />
              <StatCard
                icon="📅"
                value={numberFmt.format(totalActive30d)}
                label="activos 30 días"
                color="blue"
              />
              <StatCard
                icon="🚩"
                value={numberFmt.format(totalOpenFlags)}
                label="flags abiertos"
                color={kpiColor(totalOpenFlags)}
              />
            </div>
          )}
        </section>

        {/* Sección 1 — resumen por sección */}
        <section aria-label="resumen por sección" className="space-y-4">
          <SectionTitle title="resumen por sección" />
          {sectionsRes.error ? (
            <SectionError label="resumen por sección" />
          ) : sections.length === 0 ? (
            <EmptyState
              icon={<EmptyDot />}
              title="sin datos todavía"
              description="ningún usuario ha tocado lecciones aún. esto se llena cuando arranquemos."
            />
          ) : (
            <CardFlat className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">
                  resumen por sección con usuarios totales, activos en los
                  últimos 7 y 30 días, completados, tiempo medio por lección y
                  XP total otorgado.
                </caption>
                <thead className="text-left">
                  <tr>
                    <Th>sección</Th>
                    <Th>usuarios totales</Th>
                    <Th>activos 30d</Th>
                    <Th>activos 7d</Th>
                    <Th>completaron alguna lección</Th>
                    <Th>tiempo medio</Th>
                    <Th>xp total</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-900">
                  {sections.map((s) => (
                    <tr key={s.section_id}>
                      <Td>
                        <Body>
                          <span className="font-medium">
                            {s.display_order}. {s.section_name}
                          </span>
                        </Body>
                      </Td>
                      <Td>
                        <Body>{numberFmt.format(s.total_users_ever)}</Body>
                      </Td>
                      <Td>
                        <Body>{numberFmt.format(s.active_last_30d)}</Body>
                      </Td>
                      <Td>
                        <Body>{numberFmt.format(s.active_last_7d)}</Body>
                      </Td>
                      <Td>
                        <Body>{numberFmt.format(s.users_completed_any)}</Body>
                      </Td>
                      <Td>
                        <Body>
                          {formatSeconds(s.median_seconds_per_lecture)}
                        </Body>
                      </Td>
                      <Td>
                        <Body>{numberFmt.format(s.total_xp_awarded)}</Body>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardFlat>
          )}
        </section>

        {/* Sección 2 — flags abiertos por sección (overview) */}
        <section
          aria-label="flags abiertos por sección"
          className="space-y-4"
        >
          <SectionTitle title="flags abiertos por sección" />
          {openBySectionRes.error ? (
            <SectionError label="flags por sección" />
          ) : openBySection.length === 0 ? (
            <EmptyState
              icon={<EmptyDot />}
              title="cero flags abiertos"
              description="ningún slide tiene reportes pendientes. cuando los usuarios reporten, aparecerán acá."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {openBySection.map((row) => (
                <CardFlat key={row.section_id} className="p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <Body className="font-medium">{row.section_name}</Body>
                    <Tag variant={row.open_flags > 0 ? 'warning' : 'neutral'}>
                      {numberFmt.format(row.open_flags)}
                    </Tag>
                  </div>
                </CardFlat>
              ))}
            </div>
          )}
        </section>

        {/* Sección 3 — top slides flagged */}
        <section
          aria-label="top slides con flags abiertos"
          className="space-y-4"
        >
          <SectionTitle title="top slides con flags abiertos" />
          {topFlagsRes.error ? (
            <SectionError label="top slides con flags abiertos" />
          ) : topFlags.length === 0 ? (
            <EmptyState
              icon={<EmptyDot />}
              title="ningún slide reportado"
              description="cuando los usuarios den click en la bandera, los slides con más reportes aparecerán acá ordenados por urgencia."
            />
          ) : (
            <div className="space-y-3">
              {topFlags.map((row) => (
                <Card key={row.slide_id} variant="neutral" padding="md">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Tag variant="neutral">{row.section_name}</Tag>
                        <Tag variant="outline">{row.slide_kind}</Tag>
                        <Caption>slide #{row.slide_order}</Caption>
                      </div>
                      <Body className="mt-2 font-medium">
                        {row.lecture_title}
                      </Body>
                      {/* Solo reasons que siguen 'open' — `row.reasons` es
                          histórico (incluye resueltos) y mostraría motivos
                          que ya no aplican. open_reasons viene calculado en
                          la view (migration 012). */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {row.open_reasons.map((r) => (
                          <Tag key={r} variant={reasonTagVariant(r)}>
                            {FLAG_REASON_LABEL[r]}
                          </Tag>
                        ))}
                      </div>
                    </div>
                    <div className="flex md:flex-col items-end gap-2 md:gap-1 md:text-right shrink-0">
                      <Tag variant="warning">
                        {numberFmt.format(row.open_count)} abiertos
                      </Tag>
                      <Caption>
                        {numberFmt.format(row.flag_count)} totales ·{' '}
                        {numberFmt.format(row.last_30d_count)} en 30d
                      </Caption>
                      <Caption>{formatRelative(row.last_flagged_at)}</Caption>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <Divider />

        {/* Sección 4 — peores tasas de finalización */}
        <section
          aria-label="peores tasas de finalización"
          className="space-y-4"
        >
          <SectionTitle
            title="peores tasas de finalización"
            subtitle="lecciones con cinco o más inicios, ordenadas por % de finalización ascendente"
          />
          {worstCompletionRes.error ? (
            <SectionError label="peores tasas de finalización" />
          ) : worstCompletion.length === 0 ? (
            <EmptyState
              icon={<EmptyDot />}
              title="aún no hay señal"
              description="ninguna lección tiene cinco o más inicios todavía. cuando suba el volumen, las que más fricción generan aparecen acá."
            />
          ) : (
            <CardFlat className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">
                  lecciones con peor tasa de finalización: sección, lección,
                  usuarios que iniciaron, completaron y abandonaron, y
                  porcentaje de finalización.
                </caption>
                <thead className="text-left">
                  <tr>
                    <Th>sección</Th>
                    <Th>lección</Th>
                    <Th>iniciaron</Th>
                    <Th>completaron</Th>
                    <Th>abandonaron</Th>
                    <Th>% finalizaron</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-900">
                  {worstCompletion.map((row) => (
                    <tr key={row.lecture_id}>
                      <Td>
                        <Caption>{row.section_name}</Caption>
                      </Td>
                      <Td>
                        <Body>
                          <span className="font-medium">{row.lecture_title}</span>
                        </Body>
                      </Td>
                      <Td>
                        <Body>{numberFmt.format(row.users_started)}</Body>
                      </Td>
                      <Td>
                        <Body>{numberFmt.format(row.users_completed)}</Body>
                      </Td>
                      <Td>
                        <Body>{numberFmt.format(row.users_dropped)}</Body>
                      </Td>
                      <Td>
                        <Tag
                          variant={completionTagVariant(row.completion_rate_pct)}
                        >
                          {row.completion_rate_pct === null
                            ? '—'
                            : `${row.completion_rate_pct}%`}
                        </Tag>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardFlat>
          )}
        </section>

        <footer className="pt-4">
          <Caption>
            owner: education · datos: views supabase
            (section_analytics, lecture_funnel, slide_flags_admin) ·
            regenera al refrescar.
          </Caption>
        </footer>
      </div>
    </main>
  );
}

/* ─── helpers de presentación ─────────────────────────────────── */

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <Headline as="h2">{title}</Headline>
      {subtitle ? <Caption className="mt-1">{subtitle}</Caption> : null}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      scope="col"
      className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-gray-400"
    >
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2 align-top">{children}</td>;
}

function EmptyDot() {
  return (
    <svg
      className="w-10 h-10 text-white"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.2}
        d="M9 12h6m-3-3v6m9-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

/**
 * Placeholder para una sección cuya query falló. Visualmente distinto del
 * EmptyState (que significa "no hay datos todavía") — acá comunicamos que
 * el dato ES desconocido. El mensaje específico vive en el banner global
 * de errores arriba; acá solo apuntamos al label para que el lector cruce
 * la referencia.
 */
function SectionError({ label }: { label: string }) {
  return (
    <Card variant="neutral" padding="md">
      <Headline as="h3">no se pudo cargar</Headline>
      <Body className="mt-2">
        la query <strong>{label}</strong> falló. revisa el banner de errores
        arriba — los datos de esta sección no están disponibles ahora.
      </Body>
    </Card>
  );
}

function AdminErrorShell({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-800 py-10 px-4 md:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Headline as="h1">panel admin no disponible</Headline>
        <Card variant="neutral" padding="lg">
          <Headline as="h2">{title}</Headline>
          <Body className="mt-2">{detail}</Body>
          <Caption className="mt-3">
            sin esto el panel mostraría datos filtrados por RLS, no agregados
            org-wide. revisa la configuración de variables de entorno.
          </Caption>
        </Card>
      </div>
    </main>
  );
}
