import { NextRequest, NextResponse, after } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { summarizeProjectWithOpenAI } from '@/lib/openai/summarizeProject';
import { generateCourseInline } from '@/lib/course-generation/generate';

// 5 minutes — course generation involves two Claude calls + RAG
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'No autenticado. Por favor inicia sesión.'
        },
        { status: 401 }
      );
    }

    // Verificar que el user_id del body coincida con el usuario autenticado
    if (body.user_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'No autorizado. El user_id no coincide con el usuario autenticado.'
        },
        { status: 403 }
      );
    }

    // Gate: la generación personalizada requiere suscripción activa.
    // El plan Gratis usa /api/generate-course-full (sin gate).
    const { data: profile } = await supabase
      .from('users')
      .select('subscription_active')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile?.subscription_active) {
      return NextResponse.json(
        {
          success: false,
          error: 'Necesitas una suscripción activa para generar un curso personalizado.',
          code: 'subscription_required',
        },
        { status: 402 }
      );
    }

    // Asegurar que el usuario existe en public.users
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email || body.user_email,
        name: user.user_metadata?.name || body.user_name || 'Usuario',
        tier: 'basic',
      });

    if (insertError && insertError.code === '23505') {
      console.log('Usuario ya existe, actualizando...');
      const { error: updateError } = await supabase
        .from('users')
        .update({
          email: user.email || body.user_email,
          name: user.user_metadata?.name || body.user_name || 'Usuario',
        })
        .eq('id', user.id);

      if (updateError && updateError.code !== '23505') {
        console.error('Error updating user:', updateError);
        return NextResponse.json(
          { success: false, error: `Error al verificar perfil: ${updateError.message}` },
          { status: 500 }
        );
      }
    } else if (insertError) {
      console.error('Error inserting user:', insertError);
      return NextResponse.json(
        { success: false, error: `Error al verificar perfil: ${insertError.message}` },
        { status: 500 }
      );
    }

    console.log('Usuario verificado/creado en public.users:', user.id);

    // Optional: summarize project idea
    const projectIdea = body.project_idea || '';
    let projectSummary = '';
    if (projectIdea && process.env.OPENAI_API_KEY) {
      try {
        projectSummary = await summarizeProjectWithOpenAI(projectIdea);
      } catch (e) {
        console.warn('Could not generate project summary:', e);
      }
    }

    // Launch inline course generation with after() so Vercel keeps
    // the function alive after sending the response (respects maxDuration)
    console.log('Starting inline course generation for user:', body.user_id);

    const userId = body.user_id;
    const userName = body.user_name || 'Usuario';
    const userEmail = body.user_email || user.email || '';
    const questionnaire = body.questionnaire || {};

    after(async () => {
      try {
        await generateCourseInline(supabase, {
          userId,
          userName,
          userEmail,
          projectIdea,
          projectSummary,
          questionnaire,
        });
      } catch (err: any) {
        console.error('Inline course generation failed:', err);
        // Write error state so frontend detects it on next poll (~3s)
        try {
          await supabase.from('intake_responses').insert({
            user_id: userId,
            responses: {
              project_idea: projectIdea,
              submitted_at: new Date().toISOString(),
            },
            generated_path: {
              _error: true,
              error_message: err?.message || 'Error desconocido durante la generación del curso',
              failed_at: new Date().toISOString(),
            },
          });
        } catch (dbErr) {
          console.error('Failed to write error state to DB:', dbErr);
        }
      }
    });

    // Respond immediately to frontend
    return NextResponse.json({
      status: 'processing',
      job_id: userId,
      message: 'Course generation started. This will take ~2-3 minutes.',
      estimated_time: 150,
    });

  } catch (error: any) {
    console.error('Error in generate-course API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
