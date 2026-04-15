import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

/**
 * GET /api/dev/auto-login
 *
 * Dev-only route that creates (or signs into) a dummy user and redirects to
 * /dashboard with a real Supabase session. This lets the preview browser show
 * the actual dashboard UI without going through Google OAuth.
 *
 * Security:
 *   - Returns 404 when NODE_ENV !== 'development'
 *   - Uses a dummy email that doesn't exist in production
 *   - Never deployed (guarded at build time AND runtime)
 */

const DUMMY_EMAIL = 'preview@itera.dev';
const DUMMY_PASSWORD = 'preview-dev-2026';
const DUMMY_NAME = 'Preview User';

export async function GET() {
  // Hard guard: never run in production
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const supabase = await createClient();

    // Step 1: Try to sign in
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: DUMMY_EMAIL,
        password: DUMMY_PASSWORD,
      });

    let userId: string | null = signInData?.user?.id ?? null;

    // Step 2: If user doesn't exist, create it
    if (signInError) {
      // Try with service role key (can bypass email confirmation)
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

      if (serviceRoleKey) {
        // Admin path: create user with confirmed email
        const admin = createAdminClient(supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        const { data: newUser, error: createError } =
          await admin.auth.admin.createUser({
            email: DUMMY_EMAIL,
            password: DUMMY_PASSWORD,
            email_confirm: true,
            user_metadata: { name: DUMMY_NAME },
          });

        if (createError && !createError.message.includes('already been registered')) {
          return NextResponse.json(
            { error: `Could not create user: ${createError.message}` },
            { status: 500 },
          );
        }

        userId = newUser?.user?.id ?? null;

        // Now sign in to get a session with cookies
        const { data: retrySignIn, error: retryError } =
          await supabase.auth.signInWithPassword({
            email: DUMMY_EMAIL,
            password: DUMMY_PASSWORD,
          });

        if (retryError) {
          return NextResponse.json(
            { error: `Sign-in failed after creation: ${retryError.message}` },
            { status: 500 },
          );
        }
        userId = retrySignIn?.user?.id ?? null;
      } else {
        // No service role key — try regular signUp (works if email
        // confirmation is disabled in Supabase project settings)
        const { data: signUpData, error: signUpError } =
          await supabase.auth.signUp({
            email: DUMMY_EMAIL,
            password: DUMMY_PASSWORD,
            options: { data: { name: DUMMY_NAME } },
          });

        if (signUpError) {
          return NextResponse.json(
            {
              error: `Signup failed: ${signUpError.message}. Add SUPABASE_SERVICE_ROLE_KEY to .env.local to bypass email confirmation.`,
            },
            { status: 500 },
          );
        }

        // If email confirmation is required, signUp returns a user but no session
        if (!signUpData.session) {
          return NextResponse.json(
            {
              error:
                'Email confirmation required. Add SUPABASE_SERVICE_ROLE_KEY to .env.local (Supabase Dashboard → Settings → API → service_role secret).',
            },
            { status: 500 },
          );
        }

        userId = signUpData.user?.id ?? null;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'No user ID' }, { status: 500 });
    }

    // Step 3: Ensure user row exists in public.users
    await supabase.from('users').upsert(
      { id: userId, email: DUMMY_EMAIL, name: DUMMY_NAME, tier: 'basic' },
      { onConflict: 'id' },
    );

    // Step 4: Check if intake_responses with full course already exists
    const { data: existing } = await supabase
      .from('intake_responses')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();

    if (!existing) {
      // Create full course — same logic as /api/generate-course-full
      const { data: lessons } = await supabase
        .from('education_system')
        .select('id, lecture, section, section_id, volume, concept, concept_id, description')
        .eq('status', 'Active')
        .order('section_id', { ascending: true })
        .order('volume', { ascending: true })
        .order('id', { ascending: true });

      if (lessons && lessons.length > 0) {
        const phaseMap = new Map<number, { id: string; phase_number: number; phase_name: string; title: string; name: string; description: string; videos: any[] }>();
        let order = 1;

        for (const row of lessons) {
          const phase = phaseMap.get(row.section_id) ?? {
            id: `phase-${row.section_id}`,
            phase_number: row.section_id,
            phase_name: row.section,
            title: row.section,
            name: row.section,
            description: `Sección ${row.section_id}: ${row.section}`,
            videos: [],
          };
          phase.videos.push({
            id: String(row.id),
            order,
            title: row.lecture,
            name: row.lecture,
            why_relevant: row.description ?? '',
            summary: row.description ?? '',
            subsection: row.concept,
            duration: 0,
            duration_seconds: 0,
            video_url: '',
            url: '',
            section: row.section,
            section_id: row.section_id,
            concept: row.concept,
            concept_id: row.concept_id,
            lecture_id: row.id,
          });
          phaseMap.set(row.section_id, phase);
          order++;
        }

        const phases = Array.from(phaseMap.values()).sort((a, b) => a.phase_number - b.phase_number);

        await supabase.from('intake_responses').insert({
          user_id: userId,
          responses: {
            project_idea: 'Curso completo de Itera',
            project_summary: 'Usuario de preview con el curso completo.',
            mode: 'full',
            submitted_at: new Date().toISOString(),
          },
          generated_path: {
            mode: 'full',
            user_project: 'Curso completo de Itera',
            total_videos: lessons.length,
            estimated_hours: `${Math.round((lessons.length * 2.5) / 60)}h`,
            phases,
            learning_path_summary: phases.map((p) => `${p.phase_name} — ${p.videos.length} lecciones`),
            recommendations: [],
            next_steps: [],
          },
        });
      }
    }

    // Step 5: Redirect to the real dashboard
    return NextResponse.redirect(new URL('/dashboard', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'http://localhost:3000' : 'http://localhost:3000'));
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Auto-login failed' },
      { status: 500 },
    );
  }
}
