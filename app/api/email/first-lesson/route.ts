import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendFirstLesson } from '@/lib/email/send';

/**
 * Endpoint que el frontend golpea cuando un usuario completa su PRIMERA
 * lección.
 *
 * Idempotencia atómica: hacemos UPDATE ... WHERE first_lesson_email_sent_at
 * IS NULL RETURNING. Solo la primera llamada concurrente "reclama" el
 * envío; las siguientes ven RETURNING vacío y skipean. Esto evita la
 * race condition de "SELECT → send → UPDATE" que permite duplicados.
 *
 * Si la columna `users.first_lesson_email_sent_at` no existe todavía
 * (migration pendiente), caemos a send sin guard y loggeamos — preferimos
 * una vez de más que cero.
 *
 * Body esperado:
 *   {
 *     lessonTitle: string,
 *     nextLessonUrl: string,
 *     nextLessonTitle?: string
 *   }
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  let body: {
    lessonTitle?: string;
    nextLessonUrl?: string;
    nextLessonTitle?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!body.lessonTitle || !body.nextLessonUrl) {
    return NextResponse.json(
      { error: 'missing_fields', required: ['lessonTitle', 'nextLessonUrl'] },
      { status: 400 }
    );
  }

  try {
    // Claim atómico: marcamos first_lesson_email_sent_at si aún es NULL.
    // El RETURNING nos dice si fuimos nosotros o ya estaba seteado.
    const now = new Date().toISOString();
    const { data: claimed, error: claimError } = await supabase
      .from('users')
      .update({ first_lesson_email_sent_at: now })
      .eq('id', user.id)
      .is('first_lesson_email_sent_at', null)
      .select('id, name')
      .maybeSingle();

    // Si la columna no existe, Supabase devuelve un error "column does not
    // exist" (42703). En ese caso seguimos sin guard — preferimos mandar.
    const columnMissing =
      claimError &&
      ((claimError as { code?: string }).code === '42703' ||
        /first_lesson_email_sent_at/i.test(claimError.message));

    if (claimError && !columnMissing) {
      console.error('[email/first-lesson] claim failed:', claimError.message);
      return NextResponse.json({
        ok: false,
        skipped: true,
        reason: 'claim_failed',
      });
    }

    // Si no claimeamos (la fila ya tenía timestamp), otro caller ganó.
    if (!columnMissing && !claimed) {
      return NextResponse.json({ ok: false, skipped: true, reason: 'already_sent' });
    }

    // Resolver userName. Si el claim trajo `name`, úsalo; si no, fallback.
    let userName = (claimed as { name?: string } | null)?.name;
    if (!userName) {
      const { data: profile } = await supabase
        .from('users')
        .select('name')
        .eq('id', user.id)
        .maybeSingle();
      userName =
        (profile as { name?: string } | null)?.name ||
        (user.user_metadata?.name as string | undefined) ||
        user.email.split('@')[0];
    }

    const result = await sendFirstLesson({
      to: user.email,
      userName,
      lessonTitle: body.lessonTitle,
      nextLessonUrl: body.nextLessonUrl,
      nextLessonTitle: body.nextLessonTitle,
    });

    if (!result.ok) {
      // Rollback del claim para permitir reintento. Solo si claimeamos
      // nosotros — no queremos sobre-escribir un timestamp legítimo de
      // otro envío exitoso anterior.
      if (!columnMissing && claimed) {
        await supabase
          .from('users')
          .update({ first_lesson_email_sent_at: null })
          .eq('id', user.id)
          .eq('first_lesson_email_sent_at', now);
      }
      return NextResponse.json({
        ok: false,
        skipped: true,
        reason: result.reason,
      });
    }

    return NextResponse.json({ ok: true, id: result.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[email/first-lesson] error:', message);
    // Email es nice-to-have: no 500. El frontend no debe romperse.
    return NextResponse.json({
      ok: false,
      skipped: true,
      reason: `threw: ${message}`,
    });
  }
}
