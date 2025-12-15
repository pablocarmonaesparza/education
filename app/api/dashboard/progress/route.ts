// app/api/dashboard/progress/route.ts
// POST - Update video progress for the authenticated user

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateVideoProgress } from '@/lib/supabase/dashboard';
import { VideoProgressUpdateRequest, VideoProgressUpdateResponse } from '@/types/dashboard';

export async function POST(
  request: NextRequest
): Promise<NextResponse<VideoProgressUpdateResponse>> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'No autenticado. Por favor inicia sesión.',
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body: VideoProgressUpdateRequest = await request.json();

    // Validate required fields
    if (!body.videoId || !body.moduleId) {
      return NextResponse.json(
        {
          success: false,
          error: 'videoId y moduleId son requeridos',
        },
        { status: 400 }
      );
    }

    // Update progress
    const progress = await updateVideoProgress(
      supabase,
      user.id,
      body.videoId,
      body.moduleId,
      body.position || 0,
      body.completed || false
    );

    if (!progress) {
      return NextResponse.json(
        {
          success: false,
          error: 'Error al actualizar el progreso',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      progress,
    });
  } catch (error: any) {
    console.error('Error in progress API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}



