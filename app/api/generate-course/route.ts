import { NextRequest, NextResponse } from 'next/server';
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

    // Launch inline course generation (async, non-blocking)
    console.log('Starting inline course generation for user:', body.user_id);

    generateCourseInline(supabase, {
      userId: body.user_id,
      userName: body.user_name || 'Usuario',
      userEmail: body.user_email || user.email || '',
      projectIdea,
      projectSummary,
      questionnaire: body.questionnaire || {},
    }).catch((err) => {
      console.error('Inline course generation failed:', err);
    });

    // Respond immediately to frontend
    return NextResponse.json({
      status: 'processing',
      job_id: body.user_id,
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
