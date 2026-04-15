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

    // Cargar todas las lecciones activas en orden cronológico.
    // Traemos también duration y youtube_url desde education_system_vectorized
    // (misma fila por lecture_id) para que si en algún momento se poblan, el
    // dashboard y el reproductor los consuman sin cambios adicionales.
    const { data: lessons, error: lessonsError } = await supabase
      .from('education_system')
      .select('id, lecture, section, section_id, volume, concept, concept_id, description')
      .eq('status', 'Active')
      .order('section_id', { ascending: true })
      .order('volume', { ascending: true })
      .order('id', { ascending: true });

    if (lessonsError) {
      return NextResponse.json(
        { success: false, error: `Error al cargar lecciones: ${lessonsError.message}` },
        { status: 500 },
      );
    }
    if (!lessons || lessons.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No se encontraron lecciones activas en education_system.' },
        { status: 500 },
      );
    }

    // Cargar duration y youtube_url desde la vista vectorizada (misma fila por lecture_id)
    const lessonIds = lessons.map((l: any) => l.id);
    const { data: media } = await supabase
      .from('education_system_vectorized')
      .select('lecture_id, duration, youtube_url')
      .in('lecture_id', lessonIds);

    const mediaByLessonId = new Map<number, { duration: number | null; youtube_url: string | null }>();
    for (const m of (media ?? []) as Array<{ lecture_id: number; duration: number | null; youtube_url: string | null }>) {
      mediaByLessonId.set(m.lecture_id, { duration: m.duration, youtube_url: m.youtube_url });
    }

    // Agrupar por sección preservando el orden. Emitimos cada video con
    // múltiples alias (description/title/name, why_relevant/description) para
    // que todos los consumidores del codebase lo lean correctamente:
    //  - app/dashboard/page.tsx usa video.description como título
    //  - lib/tutor/context.ts y lib/supabase/dashboard.ts usan video.title
    //  - ambos leen why_relevant como explicación secundaria.
    type LessonRow = {
      id: number;
      lecture: string;
      section: string;
      section_id: number;
      volume: number | null;
      concept: string | null;
      concept_id: string | null;
      description: string | null;
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
        lecture_id: number;
      }>;
    };

    const phaseMap = new Map<number, Phase>();
    let order = 1;

    for (const row of lessons as LessonRow[]) {
      const phase =
        phaseMap.get(row.section_id) ??
        {
          id: `phase-${row.section_id}`,
          phase_number: row.section_id,
          phase_name: row.section,
          title: row.section,
          name: row.section,
          description: `Sección ${row.section_id}: ${row.section}`,
          videos: [],
        };
      const mediaRow = mediaByLessonId.get(row.id);
      const durationSec = mediaRow?.duration ?? 0;
      const youtubeUrl = mediaRow?.youtube_url ?? '';

      phase.videos.push({
        id: String(row.id),
        order,
        title: row.lecture,
        name: row.lecture,
        why_relevant: row.description ?? '',
        summary: row.description ?? '',
        subsection: row.concept,
        duration: durationSec,
        duration_seconds: durationSec,
        video_url: youtubeUrl,
        url: youtubeUrl,
        section: row.section,
        section_id: row.section_id,
        concept: row.concept,
        concept_id: row.concept_id,
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

    // Guardar en intake_responses para que el dashboard lo lea
    const { error: saveError } = await supabase.from('intake_responses').insert({
      user_id: user.id,
      responses: {
        project_idea: 'Curso completo de Itera',
        project_summary: 'El usuario eligió recorrer todas las lecciones en orden cronológico.',
        mode: 'full',
        submitted_at: new Date().toISOString(),
      },
      generated_path: generatedPath,
    });

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
