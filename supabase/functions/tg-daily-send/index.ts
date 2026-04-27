import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const DAILY_SECRET = Deno.env.get("DAILY_SEND_SECRET") || "";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function sendTo(tgUserId: number, text: string, replyMarkup?: unknown): Promise<"ok" | "blocked" | "error"> {
  try {
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: tgUserId,
        text,
        parse_mode: "HTML",
        ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
      }),
    });
    if (res.ok) return "ok";
    const body = await res.json().catch(() => ({}));
    console.error("send error", res.status, body?.description);
    // FIX codex: solo 403 es bloqueo definitivo. 400 puede ser parse error.
    if (res.status === 403) return "blocked";
    if (res.status === 400 && typeof body?.description === "string" && /chat not found|user is deactivated/i.test(body.description)) {
      return "blocked";
    }
    return "error";
  } catch (e) {
    console.error("send exception", e);
    return "error";
  }
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret");
    if (DAILY_SECRET && secret !== DAILY_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { data: links, error } = await supabase.from("telegram_links").select("user_id, telegram_user_id");
    if (error) {
      return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500 });
    }
    if (!links || links.length === 0) {
      return new Response(JSON.stringify({ ok: true, total: 0, sent: 0, skipped: 0, blocked: 0, errored: 0, duplicates: 0 }));
    }

    let sent = 0, skipped = 0, blocked = 0, errored = 0, duplicates = 0;

    for (const link of links) {
      const { data: lectureId } = await supabase.rpc("get_next_lesson_for_user", { p_user_id: link.user_id });
      if (!lectureId) {
        skipped++;
        continue;
      }

      // FIX codex: idempotencia. Insertar primero en telegram_daily_sends; si
      // ya hay fila para (user_id, today), 23505 -> saltamos.
      const { data: inserted, error: insErr } = await supabase
        .from("telegram_daily_sends")
        .insert({
          user_id: link.user_id,
          lecture_id: lectureId,
          telegram_user_id: link.telegram_user_id,
        })
        .select("user_id")
        .maybeSingle();

      if (insErr) {
        if (insErr.code === "23505") {
          duplicates++;
          continue;
        }
        console.error("insert idempotency error", insErr);
        errored++;
        continue;
      }
      if (!inserted) {
        duplicates++;
        continue;
      }

      const { data: lecture } = await supabase
        .from("lectures")
        .select("title, section_id, display_order")
        .eq("id", lectureId)
        .maybeSingle();
      if (!lecture) {
        skipped++;
        continue;
      }
      const { data: section } = await supabase
        .from("sections")
        .select("display_order, name")
        .eq("id", lecture.section_id)
        .maybeSingle();

      const text = `<b>tu lección de hoy</b>\n\n• <b>${esc(lecture.title || "")}</b>\n• sección ${section?.display_order ?? "?"}/10 · ${esc(section?.name || "")}\n• ~5 min`;
      const markup = { inline_keyboard: [[{ text: "empezar →", callback_data: "start_hoy" }]] };

      const result = await sendTo(link.telegram_user_id, text, markup);
      const today = new Date().toISOString().slice(0, 10);
      if (result === "ok") {
        sent++;
      } else if (result === "blocked") {
        blocked++;
        // Rollback idempotencia: user bloqueó al bot, no consumió la lección.
        await supabase.from("telegram_daily_sends").delete().eq("user_id", link.user_id).eq("send_date", today);
        await supabase.from("telegram_links").delete().eq("telegram_user_id", link.telegram_user_id);
      } else {
        errored++;
        // Rollback idempotencia para que el próximo cron reintente.
        await supabase.from("telegram_daily_sends").delete().eq("user_id", link.user_id).eq("send_date", today);
      }
      await sleep(40); // ~25 msg/s, bajo el límite broadcast de 30/s
    }

    return new Response(JSON.stringify({ ok: true, total: links.length, sent, skipped, blocked, errored, duplicates }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("daily-send error:", e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
});
