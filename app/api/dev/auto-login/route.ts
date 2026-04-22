import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, timingSafeEqual } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

// Pin Node.js runtime: this route uses `crypto` and `Buffer`, which are not
// available on Edge runtime.
export const runtime = 'nodejs';

/**
 * GET /api/dev/auto-login
 *
 * Preview/dogfooding route that signs into a dummy Supabase user and redirects
 * to /dashboard. Lets the team see the actual dashboard UI without going
 * through Google OAuth.
 *
 * Access control (failsafe by default):
 *   - In `NODE_ENV === 'development'`: open, no secret needed.
 *   - In any other environment: requires `DEV_AUTO_LOGIN_SECRET` env var to be
 *     set to a non-blank value, AND the request to provide a matching value
 *     via the `x-preview-secret` header (preferred) or `?secret=` query param.
 *   - If the env var is unset/blank in non-dev, the endpoint returns 404.
 *   - Comparison is timing-safe (length leak is acceptable here — the secret
 *     length is not itself sensitive).
 *
 * Defense-in-depth (so a stable password on the dummy user can't be reused via
 * the regular /auth/login form to bypass the gate):
 *   - The dummy user's password is ROTATED on every successful visit to a
 *     fresh random value. Whatever the previous password was becomes invalid
 *     immediately. The only way to obtain a session as preview@itera.dev is
 *     to go through this gated endpoint.
 *
 * Anti-leak:
 *   - Response sets `Cache-Control: no-store` + `X-Robots-Tag: noindex` so
 *     CDNs/search engines don't cache or index the URL with the secret.
 *   - The redirect target (/dashboard) does NOT include the secret, so the
 *     Referer chain after this route is clean.
 *   - Still: `?secret=` does leak into the user's local browser history and
 *     into server access logs. If you suspect leakage, rotate the env var
 *     (which invalidates all outstanding URLs immediately).
 */

const DUMMY_EMAIL = 'preview@itera.dev';
const DUMMY_NAME = 'Preview User';
// Password used ONLY in local dev, where the user is created/signed in without
// the admin path (no service role key required). In any non-dev environment
// this constant is never used as the password — we always rotate to a fresh
// random one (see rotateAndSignIn below).
const DEV_FALLBACK_PASSWORD = 'preview-dev-2026';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  'X-Robots-Tag': 'noindex, nofollow',
};

function safeEqual(a: string, b: string): boolean {
  // timingSafeEqual requires equal-length buffers, so length-mismatch must
  // short-circuit BEFORE the call. The early return leaks expected-length
  // info, which is acceptable here: the secret length (64 hex chars) is not
  // sensitive — only the value is.
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

/**
 * Locate the preview user by paginating through admin.listUsers. The Supabase
 * admin SDK does not have a get-by-email helper, so we page through. Capped at
 * 50 pages × 200 users = 10k users to keep latency bounded; preview deployments
 * never get close to this.
 */
async function findPreviewUserId(
  admin: ReturnType<typeof createAdminClient>,
): Promise<string | null> {
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`Could not list users: ${error.message}`);
    const found = data?.users.find((u) => u.email === DUMMY_EMAIL);
    if (found) return found.id;
    if (!data?.users.length || data.users.length < 200) return null; // exhausted
  }
  return null;
}

/**
 * Ensure the preview user exists and rotate its password to `password`.
 *
 * Strategy: try `createUser` first (cheap on first ever run). If it fails for
 * ANY reason, fall back to lookup. If lookup finds the user, treat the
 * original create-failure as a duplicate and rotate. If lookup doesn't find
 * the user either, propagate the original create error.
 *
 * This avoids regexing `createError.message`, which would silently break if
 * Supabase changed its error wording (e.g. on a major SDK upgrade).
 */
async function ensurePreviewUserAndRotatePassword(
  admin: ReturnType<typeof createAdminClient>,
  password: string,
): Promise<string> {
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: DUMMY_EMAIL,
    password,
    email_confirm: true,
    user_metadata: { name: DUMMY_NAME },
  });

  if (!createError && created?.user?.id) {
    return created.user.id;
  }

  // Create failed. Could be duplicate (existing user) OR a real failure.
  // Disambiguate via lookup rather than message-regex.
  const existingId = await findPreviewUserId(admin);
  if (!existingId) {
    throw new Error(
      `Could not create preview user (and lookup found no existing user): ${createError?.message ?? 'unknown error'}`,
    );
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(existingId, {
    password,
  });
  if (updateError) {
    throw new Error(`Could not rotate preview password: ${updateError.message}`);
  }

  return existingId;
}

function isAuthorized(request: NextRequest): boolean {
  // Dev: always allowed (preserves existing local DX).
  if (process.env.NODE_ENV === 'development') return true;

  // Non-dev: require a non-blank secret to be configured AND provided.
  const expectedRaw = process.env.DEV_AUTO_LOGIN_SECRET;
  const expected = expectedRaw?.trim();
  if (!expected) return false; // Failsafe: endpoint stays 404 unless explicitly enabled.

  const provided =
    request.headers.get('x-preview-secret')?.trim() ||
    request.nextUrl.searchParams.get('secret')?.trim() ||
    '';
  if (!provided) return false;

  return safeEqual(provided, expected);
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404, headers: NO_CACHE_HEADERS },
    );
  }

  try {
    const supabase = await createClient();
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    let userId: string | null = null;

    if (serviceRoleKey) {
      // === Preferred path: admin SDK + ephemeral password rotation ===
      //
      // We always rotate the dummy user's password to a fresh random value
      // before signing in. This guarantees the previous password becomes
      // invalid immediately, so an attacker who knows a stale password (or
      // who learned the historical hard-coded `preview-dev-2026`) cannot use
      // it via the public /auth/login form to bypass the gate on this route.
      //
      // This path is REQUIRED in non-dev (we recommend Pablo also keep the
      // service role key in dev to exercise the same code path).
      const admin = createAdminClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      // Race handling: under concurrent calls the loser of a rotation finds
      // its password overwritten between updateUserById() and
      // signInWithPassword(). Retry with exponential backoff. With 5 attempts
      // and exponential delay (50/100/200/400ms after attempts 1..4), the
      // probability of consistently losing to another concurrent caller is
      // negligible for any realistic dogfooding load. (For two callers, p ≈
      // 1/2^5 ≈ 3%; for the actually-expected single-caller flow, attempt 0
      // always wins.)
      const MAX_ATTEMPTS = 5;
      let signInOk = false;
      let lastSignInErr: string | null = null;

      for (let attempt = 0; attempt < MAX_ATTEMPTS && !signInOk; attempt++) {
        if (attempt > 0) {
          const backoffMs = 50 * Math.pow(2, attempt - 1); // 50, 100, 200, 400
          await new Promise((r) => setTimeout(r, backoffMs));
        }

        const ephemeralPassword = randomBytes(32).toString('hex');

        try {
          userId = await ensurePreviewUserAndRotatePassword(admin, ephemeralPassword);
        } catch (e: any) {
          return NextResponse.json(
            { error: e?.message ?? 'Failed to provision preview user' },
            { status: 500, headers: NO_CACHE_HEADERS },
          );
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: DUMMY_EMAIL,
          password: ephemeralPassword,
        });

        if (!signInError) {
          signInOk = true;
        } else {
          lastSignInErr = signInError.message;
        }
      }

      if (!signInOk) {
        return NextResponse.json(
          {
            error: `Sign-in failed after ${MAX_ATTEMPTS} rotation attempts (likely sustained concurrent rotation): ${lastSignInErr}`,
          },
          { status: 500, headers: NO_CACHE_HEADERS },
        );
      }
    } else {
      // === Fallback path: dev-only, no service role key ===
      //
      // Used only when running locally without the service role key. Skips
      // password rotation (signUp/signIn just use the fixed fallback). This
      // path is not reachable in production because we early-exit at the
      // top of the route if the gate fails, and the gate requires
      // DEV_AUTO_LOGIN_SECRET in non-dev.
      if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json(
          {
            error:
              'SUPABASE_SERVICE_ROLE_KEY is required to enable /api/dev/auto-login outside of development.',
          },
          { status: 500, headers: NO_CACHE_HEADERS },
        );
      }

      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: DUMMY_EMAIL,
          password: DEV_FALLBACK_PASSWORD,
        });

      userId = signInData?.user?.id ?? null;

      if (signInError) {
        const { data: signUpData, error: signUpError } =
          await supabase.auth.signUp({
            email: DUMMY_EMAIL,
            password: DEV_FALLBACK_PASSWORD,
            options: { data: { name: DUMMY_NAME } },
          });

        if (signUpError) {
          return NextResponse.json(
            {
              error: `Signup failed: ${signUpError.message}. Add SUPABASE_SERVICE_ROLE_KEY to .env.local to bypass email confirmation.`,
            },
            { status: 500, headers: NO_CACHE_HEADERS },
          );
        }

        if (!signUpData.session) {
          return NextResponse.json(
            {
              error:
                'Email confirmation required. Add SUPABASE_SERVICE_ROLE_KEY to .env.local (Supabase Dashboard → Settings → API → service_role secret).',
            },
            { status: 500, headers: NO_CACHE_HEADERS },
          );
        }

        userId = signUpData.user?.id ?? null;
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'No user ID' },
        { status: 500, headers: NO_CACHE_HEADERS },
      );
    }

    // Step 3: Ensure user row exists in public.users.
    // We surface the error if this fails — redirecting into a half-initialized
    // account (auth ok, public.users missing) breaks the dashboard downstream.
    const { error: upsertUserError } = await supabase.from('users').upsert(
      { id: userId, email: DUMMY_EMAIL, name: DUMMY_NAME, tier: 'basic' },
      { onConflict: 'id' },
    );
    if (upsertUserError) {
      return NextResponse.json(
        { error: `Could not upsert preview user row: ${upsertUserError.message}` },
        { status: 500, headers: NO_CACHE_HEADERS },
      );
    }

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

        const { error: insertIntakeError } = await supabase
          .from('intake_responses')
          .insert({
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
              learning_path_summary: phases.map(
                (p) => `${p.phase_name} — ${p.videos.length} lecciones`,
              ),
              recommendations: [],
              next_steps: [],
            },
          });
        if (insertIntakeError) {
          return NextResponse.json(
            { error: `Could not seed preview course: ${insertIntakeError.message}` },
            { status: 500, headers: NO_CACHE_HEADERS },
          );
        }
      }
    }

    // Step 5: Redirect to the real dashboard.
    // Use request.nextUrl.origin so this works in dev AND in prod/preview
    // (instead of hard-coding localhost). The redirect target deliberately
    // does NOT include the secret query param, so the user's address bar /
    // history / Referer chain after this response is clean.
    const redirectTo = new URL('/dashboard', request.nextUrl.origin);
    const response = NextResponse.redirect(redirectTo);
    Object.entries(NO_CACHE_HEADERS).forEach(([k, v]) => response.headers.set(k, v));
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Auto-login failed' },
      { status: 500, headers: NO_CACHE_HEADERS },
    );
  }
}
