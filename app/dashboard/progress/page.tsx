'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SpinnerPage } from '@/components/ui/Spinner';
import GamificationSummary from '@/components/dashboard/GamificationSummary';
import BadgeGrid from '@/components/dashboard/BadgeGrid';

type SectionProgress = {
  sectionId: number;
  sectionName: string;
  displayOrder: number;
  lecturesCompleted: number;
  xpEarned: number;
};

type DayBucket = {
  date: string; // YYYY-MM-DD
  count: number;
};

/**
 * Página de progreso del usuario. Tres bloques:
 *   1. Resumen numérico (reuso GamificationSummary que lee user_stats).
 *   2. Heatmap de actividad diaria (últimas 13 semanas).
 *   3. XP por sección — agrega user_progress.xp_earned join lectures+sections.
 *
 * Todo depende de user_progress (schema v1). El trigger Postgres
 * `on_user_progress_complete` mantiene xp_earned al día por cada fila.
 *
 * Nota: queries inline en lugar de helpers de `lib/analytics/`. Ese módulo
 * ya existe (Education lo publicó, ver `lib/analytics/`) pero sus helpers
 * user-facing están al nivel de "current section"; para XP por sección y
 * heatmap por día necesito agregados que aún no están expuestos ahí.
 * Refactor pendiente: extender `lib/analytics/user.ts` con estos helpers
 * (tarea de gamification, no de education — ellos solo expusieron la base).
 */
export default function ProgressPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<SectionProgress[]>([]);
  const [days, setDays] = useState<DayBucket[]>([]);

  useEffect(() => {
    let active = true;

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !active) {
        setLoading(false);
        return;
      }

      const { data: progressRows } = await supabase
        .from('user_progress')
        .select(
          'lecture_id, is_completed, xp_earned, completed_at, lectures!inner(section_id, sections!inner(id, name, display_order))',
        )
        .eq('user_id', user.id);

      if (!active) return;

      const byId = new Map<number, SectionProgress>();
      (progressRows ?? []).forEach((row: any) => {
        const section = row.lectures?.sections;
        if (!section) return;
        const key = section.id as number;
        const bucket = byId.get(key) ?? {
          sectionId: key,
          sectionName: section.name as string,
          displayOrder: section.display_order as number,
          lecturesCompleted: 0,
          xpEarned: 0,
        };
        if (row.is_completed) bucket.lecturesCompleted += 1;
        bucket.xpEarned += row.xp_earned ?? 0;
        byId.set(key, bucket);
      });

      setSections(
        Array.from(byId.values()).sort((a, b) => a.displayOrder - b.displayOrder),
      );

      const buckets = new Map<string, number>();
      (progressRows ?? []).forEach((row: any) => {
        if (!row.is_completed || !row.completed_at) return;
        const d = new Date(row.completed_at).toISOString().slice(0, 10);
        buckets.set(d, (buckets.get(d) ?? 0) + 1);
      });
      setDays(
        Array.from(buckets.entries())
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => (a.date < b.date ? -1 : 1)),
      );

      setLoading(false);
    }

    load();

    const onRefresh = () => { load(); };
    if (typeof window !== 'undefined') {
      window.addEventListener('itera:stats-refresh', onRefresh);
    }

    return () => {
      active = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('itera:stats-refresh', onRefresh);
      }
    };
  }, [supabase]);

  if (loading) return <SpinnerPage />;

  return (
    <div className="min-h-full bg-transparent">
      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-ink dark:text-white tracking-tight">
            mi progreso
          </h1>
          <p className="mt-2 text-ink-muted dark:text-gray-400">
            tu XP, racha y avance por sección
          </p>
        </div>

        <GamificationSummary />

        <BadgeGrid />

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-900 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-ink dark:text-white">
              actividad
            </h3>
            <p className="text-sm text-ink-muted dark:text-gray-400 mt-1">
              lecciones completadas en las últimas 13 semanas
            </p>
          </div>
          <div className="p-6">
            <Heatmap days={days} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-900 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-ink dark:text-white">
              XP por sección
            </h3>
            <p className="text-sm text-ink-muted dark:text-gray-400 mt-1">
              dónde estás ganando tus puntos
            </p>
          </div>
          {sections.length === 0 ? (
            <div className="p-6 text-sm text-ink-muted dark:text-gray-400">
              aún no has completado ninguna lección. empieza cualquiera desde
              el dashboard para ver tu avance aquí.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {sections.map((s) => (
                <SectionRow key={s.sectionId} section={s} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionRow({ section }: { section: SectionProgress }) {
  return (
    <div className="p-5 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink dark:text-white truncate">
          {section.sectionName}
        </p>
        <p className="text-xs text-ink-muted dark:text-gray-400 mt-0.5">
          {section.lecturesCompleted}{' '}
          {section.lecturesCompleted === 1 ? 'lección completada' : 'lecciones completadas'}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-lg font-bold text-primary tabular-nums">
          {section.xpEarned.toLocaleString('es-MX')} XP
        </p>
      </div>
    </div>
  );
}

/**
 * Heatmap estilo GitHub — 13 columnas (semanas) x 7 filas (días).
 * Escala de color por nº de lecciones/día: 0, 1, 2-3, 4-5, 6+.
 */
function Heatmap({ days }: { days: DayBucket[] }) {
  const cells = useMemo(() => buildHeatmapMatrix(days), [days]);

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col gap-1 min-w-0">
        <div className="flex gap-1">
          {cells.map((col, i) => (
            <div key={i} className="flex flex-col gap-1">
              {col.map((cell, j) => (
                <div
                  key={j}
                  className={`w-3 h-3 rounded-sm ${heatmapColor(cell?.count ?? 0)}`}
                  title={
                    cell
                      ? `${cell.date}: ${cell.count} ${cell.count === 1 ? 'lección' : 'lecciones'}`
                      : ''
                  }
                  aria-hidden={!cell}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-ink-muted dark:text-gray-400">
          <span>menos</span>
          <div className={`w-3 h-3 rounded-sm ${heatmapColor(0)}`} />
          <div className={`w-3 h-3 rounded-sm ${heatmapColor(1)}`} />
          <div className={`w-3 h-3 rounded-sm ${heatmapColor(3)}`} />
          <div className={`w-3 h-3 rounded-sm ${heatmapColor(5)}`} />
          <div className={`w-3 h-3 rounded-sm ${heatmapColor(7)}`} />
          <span>más</span>
        </div>
      </div>
    </div>
  );
}

function heatmapColor(count: number): string {
  if (count === 0) return 'bg-gray-100 dark:bg-gray-900';
  if (count === 1) return 'bg-primary/20';
  if (count <= 3) return 'bg-primary/40';
  if (count <= 5) return 'bg-primary/70';
  return 'bg-primary';
}

/**
 * Matriz de 13 columnas (semanas, vieja → reciente) × 7 filas (días, dom → sáb).
 */
function buildHeatmapMatrix(days: DayBucket[]): (DayBucket | null)[][] {
  const WEEKS = 13;
  const map = new Map(days.map((d) => [d.date, d]));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(today);
  const dow = endDate.getDay(); // 0=dom..6=sáb
  endDate.setDate(endDate.getDate() + (6 - dow));

  const cells: (DayBucket | null)[][] = [];
  for (let w = WEEKS - 1; w >= 0; w--) {
    const col: (DayBucket | null)[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(endDate);
      date.setDate(endDate.getDate() - w * 7 - (6 - d));
      const key = date.toISOString().slice(0, 10);
      if (date > today) {
        col.push(null);
      } else {
        col.push(map.get(key) ?? { date: key, count: 0 });
      }
    }
    cells.push(col);
  }
  return cells;
}