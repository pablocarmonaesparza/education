import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Genera un código de vinculación de 6 caracteres (sin caracteres ambiguos).
 */
function generateLinkCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const array = new Uint8Array(6);
  crypto.getRandomValues(array);
  let code = '';
  for (const byte of array) {
    code += chars[byte % chars.length];
  }
  return code;
}

/**
 * GET /api/telegram-link
 * Verifica si el usuario tiene Telegram vinculado.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { data: link } = await supabase
      .from('telegram_links')
      .select('telegram_user_id, telegram_username, linked_at')
      .eq('user_id', user.id)
      .maybeSingle();

    return NextResponse.json({
      linked: !!link,
      telegramUsername: link?.telegram_username || null,
      linkedAt: link?.linked_at || null,
    });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

/**
 * POST /api/telegram-link
 * Genera un código de vinculación temporal (10 min TTL).
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Verificar si ya tiene Telegram vinculado
    const { data: existingLink } = await supabase
      .from('telegram_links')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingLink) {
      return NextResponse.json(
        { error: 'Ya tienes Telegram vinculado. Desvincula primero.' },
        { status: 400 }
      );
    }

    // Invalidar códigos previos no usados
    await supabase
      .from('telegram_link_codes')
      .update({ used: true })
      .eq('user_id', user.id)
      .eq('used', false);

    // Generar nuevo código con TTL de 10 minutos
    const code = generateLinkCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: insertError } = await supabase
      .from('telegram_link_codes')
      .insert({
        user_id: user.id,
        code,
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error('Error creating link code:', insertError);
      return NextResponse.json({ error: 'Error al generar código' }, { status: 500 });
    }

    return NextResponse.json({ code, expiresAt });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

/**
 * DELETE /api/telegram-link
 * Desvincula la cuenta de Telegram.
 */
export async function DELETE() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { error: deleteError } = await supabase
      .from('telegram_links')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error unlinking telegram:', deleteError);
      return NextResponse.json({ error: 'Error al desvincular' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
