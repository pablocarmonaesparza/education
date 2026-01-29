import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { summarizeProjectWithOpenAI } from '@/lib/openai/summarizeProject';

// Aumentar el timeout a 5 minutos (300 segundos)
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

    // Asegurar que el usuario existe en public.users (usar upsert para evitar errores)
    // Primero intentar insert, si falla por duplicado, hacer update
    let upsertError;
    
    // Intentar insert primero
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email || body.user_email,
        name: user.user_metadata?.name || body.user_name || 'Usuario',
        tier: 'basic',
      });

    // Si el error es de duplicado, intentar update
    if (insertError && insertError.code === '23505') {
      console.log('Usuario ya existe, actualizando...');
      const { error: updateError } = await supabase
        .from('users')
        .update({
          email: user.email || body.user_email,
          name: user.user_metadata?.name || body.user_name || 'Usuario',
        })
        .eq('id', user.id);
      
      upsertError = updateError;
    } else {
      upsertError = insertError;
    }

    if (upsertError && upsertError.code !== '23505') {
      console.error('Error al asegurar usuario en public.users:', {
        code: upsertError.code,
        message: upsertError.message,
        details: upsertError.details,
        hint: upsertError.hint,
      });
      return NextResponse.json(
        {
          success: false,
          error: `Error al verificar perfil de usuario: ${upsertError.message || 'Error desconocido'}. Por favor intenta de nuevo.`
        },
        { status: 500 }
      );
    }

    console.log('Usuario verificado/creado en public.users:', user.id);

    const projectIdea = body.project_idea || '';
    let projectSummary = '';
    if (projectIdea && process.env.OPENAI_API_KEY) {
      try {
        projectSummary = await summarizeProjectWithOpenAI(projectIdea);
        body.project_summary = projectSummary;
      } catch (e) {
        console.warn('Could not generate project summary (OpenAI):', e);
      }
    }

    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

    if (!N8N_WEBHOOK_URL || N8N_WEBHOOK_URL.includes('tu-webhook-n8n.com') || N8N_WEBHOOK_URL.includes('your-n8n-instance.com')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Webhook not configured. Please set N8N_WEBHOOK_URL in .env.local'
        },
        { status: 500 }
      );
    }

    console.log('Triggering n8n workflow (async):', N8N_WEBHOOK_URL);
    console.log('User ID:', body.user_id);

    // Llamar al webhook de n8n - este ahora responderá inmediatamente
    // y continuará procesando en background (body incluye project_summary si OpenAI está configurado)
    fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).catch(err => {
      console.error('n8n webhook call failed:', err);
    });

    // Responder inmediatamente al frontend
    console.log('Workflow triggered, returning success');

    return NextResponse.json({
      status: 'processing',
      job_id: body.user_id,
      message: 'Course generation started. This will take ~2-3 minutes.',
      estimated_time: 150
    });

  } catch (error: any) {
    console.error('Error in generate-course API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error'
      },
      { status: 500 }
    );
  }
}
