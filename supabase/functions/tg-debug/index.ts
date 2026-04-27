import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// herramienta de diagnóstico para el webhook de Telegram.
// gateada por FUNCTION_SECRET (mismo que telegram-bot) para evitar abuso público.
//
// uso:
//   GET /tg-debug?secret=<FUNCTION_SECRET>&action=info
//     → devuelve { me, webhook } con el estado del bot y el webhook
//
//   GET /tg-debug?secret=<FUNCTION_SECRET>&action=setwebhook
//     → re-setea el webhook al edge function telegram-bot con el secret actual.
//       útil cuando se rota FUNCTION_SECRET y telegram queda con el viejo.

const TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") || "";
const FUNCTION_SECRET = Deno.env.get("FUNCTION_SECRET") || "";

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret") || "";
  const action = url.searchParams.get("action") || "info";

  if (!FUNCTION_SECRET || secret !== FUNCTION_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!TOKEN) {
    return new Response(JSON.stringify({ error: "no token" }), { status: 500 });
  }

  const api = `https://api.telegram.org/bot${TOKEN}`;

  if (action === "info") {
    const [me, hook] = await Promise.all([
      fetch(`${api}/getMe`).then(r => r.json()),
      fetch(`${api}/getWebhookInfo`).then(r => r.json()),
    ]);
    return new Response(JSON.stringify({ me: me.result, webhook: hook.result }, null, 2), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (action === "setwebhook") {
    const newUrl = `https://mteicafdzilhxkawyvxw.supabase.co/functions/v1/telegram-bot?secret=${FUNCTION_SECRET}`;
    const r = await fetch(`${api}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: newUrl,
        drop_pending_updates: true,
        allowed_updates: ["message", "callback_query"],
      }),
    });
    const j = await r.json();
    return new Response(JSON.stringify(j, null, 2), { headers: { "Content-Type": "application/json" } });
  }

  return new Response("unknown action", { status: 400 });
});
