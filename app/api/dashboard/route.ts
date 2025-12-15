// app/api/dashboard/route.ts
// GET - Fetch all dashboard data for the authenticated user

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDashboardData } from '@/lib/supabase/dashboard';
import { DashboardApiResponse } from '@/types/dashboard';

export async function GET(): Promise<NextResponse<DashboardApiResponse>> {
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

    // Fetch dashboard data
    const dashboardData = await getDashboardData(supabase, user.id);

    if (dashboardData.error) {
      return NextResponse.json(
        {
          success: false,
          error: dashboardData.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: dashboardData,
    });
  } catch (error: any) {
    console.error('Error in dashboard API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}



