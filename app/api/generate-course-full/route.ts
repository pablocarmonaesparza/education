import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/generate-course-full
 *
 * Alternativa a /api/generate-course para usuarios que eligen "curso completo"
 * en el onboarding. En lugar de generar un curriculum personalizado con un LLM,
 * arma un `generated_path` sintético con TODAS las lecciones activas de
 * `education_system`, agrupadas en fases por `section` y ordenadas
 * cronológicamente por (section_id, volume, id).
 *
 * La forma del `generated_path` es idéntica a la que produce el generador por
 * IA, así que el dashboard no necesita cambios: sigue leyendo
 * `intake_responses.generated_path.phases[].videos[]` transparentemente.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    // Autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'No autenticado. Por favor inicia sesión.' },
        { status: 401 },
      );
    }
    if (body.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'No autorizado. El user_id no coincide con el usuario autenticado.' },
        { status: 403 },
      );
    }

    // Asegurar fila en public.users
    const { error: insertError } = await supabase.from('users').insert({
      id: user.id,
      email: user.email || body.user_email,
      name: user.user_metadata?.name || body.user_name || 'Usuario',
      tier: 'basic',
    });
    if (insertError && insertError.code === '23505') {
      await supabase
        .from('users')
        .update({
          email: user.email || body.user_email,
          name: user.user_metadata?.name || body.user_name || 'Usuario',
        })
        .eq('id', user.id);
    } else if (insertError) {
      return NextResponse.json(
        { success: false, error: `Error al verificar perfil: ${insertError.message}` },
        { status: 500 },
      );
    }

    // Cargar todas las lecciones publicadas joineadas con sections para el
    // display name. Schema actual (post-pivot SCHEMA_v1):
    //   - `lectures` con uuid id, section_id smallint FK, title, est_minutes,
    //     learning_objective, narrative_arc, etc.
    //   - `sections` con smallint id, name, display_name, display_order.
    // El antiguo `education_system` con (lecture, section, volume, concept,
    // description) NO existe en la DB actual — el endpoint estaba leyendo una
    // tabla legacy que ya fue pivotada. Reescrito para usar el schema real.
    const { data: lessons, error: lessonsError } = await supabase
      .from('lectures')
      .select(
        'id, slug, section_id, display_order, title, display_title, learning_objective, narrative_arc, concept_name, est_minutes, status, sections!inner(id, name, display_name, display_order)',
      )
      .eq('status', 'published')
      .order('section_id', { ascending: true })
      .order('display_order', { ascending: true });

    if (lessonsError) {
      return NextResponse.json(
        { success: false, error: `Error al cargar lecciones: ${lessonsError.message}` },
        { status: 500 },
      );
    }
    if (!lessons || lessons.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No se encontraron lecciones publicadas.' },
        { status: 500 },
      );
    }

    // Agrupar por sección preservando el orden. Emitimos cada video con
    // múltiples alias (title/name, why_relevant/summary) para que todos
    // los consumidores del codebase lo lean correctamente:
    //  - app/dashboard/page.tsx usa video.description como título — al
    //    omitir description aquí, el dashboard cae a `title` (correcto).
    //  - lib/tutor/context.ts y lib/supabase/dashboard.ts usan video.title.
    //  - ambos leen why_relevant como explicación secundaria.
    type SectionEmbed = {
      id: number;
      name: string;
      display_name: string | null;
      display_order: number;
    };
    type LessonRow = {
      id: string;
      slug: string;
      section_id: number;
      display_order: number;
      title: string;
      display_title: string | null;
      learning_objective: string | null;
      narrative_arc: string | null;
      concept_name: string | null;
      est_minutes: number | null;
      status: string;
      sections: SectionEmbed | SectionEmbed[];
    };

    type Phase = {
      id: string;
      phase_number: number;
      phase_name: string;
      title: string;
      name: string;
      description: string;
      videos: Array<{
        id: string;
        order: number;
        // IMPORTANTE: intencionalmente NO emitimos "description" aquí.
        // app/dashboard/page.tsx y lib/tutor/context.ts lo interpretan
        // de forma opuesta (título vs explicación). Al omitirlo, el
        // dashboard cae a `title` y el tutor cae a `why_relevant`,
        // y ambos quedan correctos.
        title: string;
        name: string;
        why_relevant: string;
        summary: string;
        subsection: string | null;
        duration: number; // segundos — formato neutral que ambos consumidores manejan
        duration_seconds: number;
        video_url: string;
        url: string;
        section: string;
        section_id: number;
        concept: string | null;
        concept_id: string | null;
        lecture_id: string;
      }>;
    };

    const phaseMap = new Map<number, Phase>();
    let order = 1;

    for (const row of lessons as LessonRow[]) {
      // Supabase devuelve relaciones embed como objeto cuando hay 1 fila
      // (inner join con FK no-null). Algunas versiones lo envuelven en array.
      // Normalizamos a un objeto único.
      const sectionRow: SectionEmbed | null = Array.isArray(row.sections)
        ? row.sections[0] ?? null
        : row.sections ?? null;
      const sectionName = sectionRow?.display_name || sectionRow?.name || `Sección ${row.section_id}`;

      const phase =
        phaseMap.get(row.section_id) ??
        {
          id: `phase-${row.section_id}`,
          phase_number: row.section_id,
          phase_name: sectionName,
          title: sectionName,
          name: sectionName,
          description: `Sección ${row.section_id}: ${sectionName}`,
          videos: [],
        };

      // Schema actual usa minutos (est_minutes); lo convertimos a segundos
      // para mantener el contrato con el dashboard. URL se deja vacío porque
      // las lecciones del modo full no tienen video — son lecturas/ejercicios.
      const durationSec = (row.est_minutes ?? 0) * 60;
      const lectureTitle = row.display_title || row.title;
      const lectureSummary = row.learning_objective || row.narrative_arc || '';

      phase.videos.push({
        id: row.id,
        order,
        title: lectureTitle,
        name: lectureTitle,
        why_relevant: lectureSummary,
        summary: lectureSummary,
        subsection: row.concept_name,
        duration: durationSec,
        duration_seconds: durationSec,
        video_url: '',
        url: '',
        section: sectionName,
        section_id: row.section_id,
        concept: row.concept_name,
        concept_id: null,
        lecture_id: row.id,
      });
      phaseMap.set(row.section_id, phase);
      order++;
    }

    const phases: Phase[] = Array.from(phaseMap.values()).sort(
      (a, b) => a.phase_number - b.phase_number,
    );

    const generatedPath = {
      mode: 'full',
      user_project: 'Curso completo de Itera',
      total_videos: lessons.length,
      estimated_hours: `${Math.round(lessons.length * 2.5 / 60)}h`,
      phases,
      learning_path_summary: phases.map((p) => `${p.phase_name} — ${p.videos.length} lecciones`),
      recommendations: [],
      next_steps: [],
    };

    // Guardar en intake_responses. Preferimos UPDATE del draft activo del
    // usuario (creado durante el onboarding por /projectDescription y
    // /projectContext). Si no hay draft, hacemos INSERT.
    const { data: draft } = await supabase
      .from('intake_responses')
      .select('id, responses')
      .eq('user_id', user.id)
      .is('generated_path', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const mergedResponses = {
      ...((draft?.responses as Record<string, unknown> | null) || {}),
      project_idea: 'Curso completo de Itera',
      project_summary:
        'El usuario eligió recorrer todas las lecciones en orden cronológico.',
      mode: 'full',
      submitted_at: new Date().toISOString(),
    };

    const saveError = draft
      ? (
          await supabase
            .from('intake_responses')
            .update({
              responses: mergedResponses,
              generated_path: generatedPath,
            })
            .eq('id', draft.id)
            .eq('user_id', user.id)
        ).error
      : (
          await supabase.from('intake_responses').insert({
            user_id: user.id,
            responses: mergedResponses,
            generated_path: generatedPath,
          })
        ).error;

    if (saveError) {
      return NextResponse.json(
        { success: false, error: `Error al guardar el curso: ${saveError.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      status: 'done',
      job_id: user.id,
      total_videos: lessons.length,
      total_phases: phases.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}
