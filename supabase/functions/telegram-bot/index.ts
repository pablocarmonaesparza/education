import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// ============================================================
// CONSTANTS
// ============================================================

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const FUNCTION_SECRET = Deno.env.get("FUNCTION_SECRET") || "";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const SLIDE_COUNT = 10;

// ============================================================
// HELPERS
// ============================================================

function escapeHTML(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function md(text: string): string {
  let s = escapeHTML(text);
  s = s.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
  s = s.replace(/\*(.*?)\*/g, "<i>$1</i>");
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  return s;
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.substring(0, max - 1) + "…" : s;
}

async function tg(method: string, body: Record<string, unknown>): Promise<any> {
  const res = await fetch(`${TELEGRAM_API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) console.error(method, "error:", JSON.stringify(json));
  return json;
}

async function send(chatId: number, text: string, reply_markup?: unknown): Promise<number | null> {
  const clipped = text.length > 4096 ? text.substring(0, 4090) + "…" : text;
  const r = await tg("sendMessage", {
    chat_id: chatId,
    text: clipped,
    parse_mode: "HTML",
    ...(reply_markup ? { reply_markup } : {}),
  });
  return r?.result?.message_id ?? null;
}

async function editMsg(chatId: number, messageId: number, text: string, reply_markup?: unknown): Promise<boolean> {
  const clipped = text.length > 4096 ? text.substring(0, 4090) + "…" : text;
  const r = await tg("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text: clipped,
    parse_mode: "HTML",
    reply_markup: reply_markup ?? { inline_keyboard: [] },
  });
  return r?.ok === true;
}

async function ack(callbackId: string, text?: string): Promise<void> {
  await tg("answerCallbackQuery", { callback_query_id: callbackId, ...(text ? { text } : {}) });
}

// ============================================================
// DB
// ============================================================

async function userFromTg(tgUserId: number): Promise<string | null> {
  const { data } = await supabase.from("telegram_links").select("user_id").eq("telegram_user_id", tgUserId).maybeSingle();
  return data?.user_id ?? null;
}

async function getSession(chatId: number) {
  const { data } = await supabase.from("telegram_sessions").select("*").eq("chat_id", chatId).maybeSingle();
  return data;
}

async function upsertSession(chatId: number, patch: Record<string, unknown>): Promise<void> {
  const now = new Date().toISOString();
  const { data: existing } = await supabase.from("telegram_sessions").select("chat_id").eq("chat_id", chatId).maybeSingle();
  if (existing) {
    await supabase.from("telegram_sessions").update({ ...patch, updated_at: now }).eq("chat_id", chatId);
  } else {
    await supabase.from("telegram_sessions").insert({ chat_id: chatId, ...patch });
  }
}

async function clearSession(chatId: number): Promise<void> {
  await supabase.from("telegram_sessions").delete().eq("chat_id", chatId);
}

async function getNextLecture(userId: string): Promise<string | null> {
  const { data } = await supabase.rpc("get_next_lesson_for_user", { p_user_id: userId });
  return data ?? null;
}

async function getLecture(lectureId: string) {
  const { data } = await supabase.from("lectures").select("id, title, section_id, display_order").eq("id", lectureId).maybeSingle();
  return data;
}

async function getSection(sectionId: number) {
  const { data } = await supabase.from("sections").select("display_order, name").eq("id", sectionId).maybeSingle();
  return data;
}

async function getSlide(lectureId: string, orderInLecture: number) {
  const { data } = await supabase.from("slides").select("id, kind, content, is_scoreable, xp, order_in_lecture").eq("lecture_id", lectureId).eq("order_in_lecture", orderInLecture).eq("status", "published").maybeSingle();
  return data;
}

async function ensureProgress(userId: string, lectureId: string): Promise<void> {
  const { data } = await supabase.from("user_progress").select("user_id").eq("user_id", userId).eq("lecture_id", lectureId).maybeSingle();
  if (!data) {
    await supabase.from("user_progress").insert({ user_id: userId, lecture_id: lectureId, slides_completed: 0 });
  }
}

async function updateProgress(userId: string, lectureId: string, slidesCompleted: number, isCompleted: boolean): Promise<void> {
  const patch: Record<string, unknown> = {
    slides_completed: slidesCompleted,
    last_active_at: new Date().toISOString(),
  };
  if (isCompleted) {
    patch.is_completed = true;
    patch.completed_at = new Date().toISOString();
  }
  await supabase.from("user_progress").update(patch).eq("user_id", userId).eq("lecture_id", lectureId);
}

async function getStats(userId: string) {
  const { data } = await supabase.from("user_stats").select("total_xp, level, current_streak").eq("user_id", userId).maybeSingle();
  return data;
}

// ============================================================
// RENDERERS
// ============================================================

type R = { text: string; markup: unknown };

function nxBtn(isLast: boolean): unknown {
  return { inline_keyboard: [[{ text: isLast ? "terminar lección ✓" : "siguiente →", callback_data: "nx" }]] };
}

function rConcept(c: any): R {
  const title = c.title ? `<b>${md(c.title)}</b>\n\n` : "";
  return { text: `${title}${md(c.body || "")}`, markup: nxBtn(false) };
}

function rCelebration(c: any, isLast: boolean): R {
  const emoji = escapeHTML(c.emoji || "✅");
  const title = c.title ? `${emoji}  <b>${md(c.title)}</b>\n\n` : "";
  return { text: `${title}${md(c.body || "")}`, markup: nxBtn(isLast) };
}

function rMCQ(c: any): R {
  const prompt = md(c.prompt || "");
  const rows = ((c.options || []) as any[]).map((o) => [{
    text: truncate(o.text, 60),
    callback_data: `mcq:${o.id}`,
  }]);
  return { text: `<b>pregunta</b>\n\n${prompt}`, markup: { inline_keyboard: rows } };
}

function rMCQResult(c: any, chosenId: number, isLast: boolean): R {
  const opts = (c.options || []) as any[];
  const correct = opts.find((o) => o.id === c.correctId);
  const isRight = chosenId === c.correctId;
  const marker = isRight ? "✓ correcto" : "✗ no era esa";
  const correctLine = isRight ? "" : `\n\n<b>correcta:</b> ${md(correct?.text || "")}`;
  return {
    text: `<b>${marker}</b>\n\n<i>${md(c.prompt || "")}</i>${correctLine}\n\n${md(c.explanation || "")}`,
    markup: nxBtn(isLast),
  };
}

function rTF(c: any): R {
  return {
    text: `<b>${md(c.prompt || "verdadero o falso")}</b>\n\n<i>${md(c.statement || "")}</i>`,
    markup: { inline_keyboard: [[
      { text: "verdadero", callback_data: "tf:1" },
      { text: "falso", callback_data: "tf:0" },
    ]]},
  };
}

function rTFResult(c: any, chosen: boolean, isLast: boolean): R {
  const isRight = chosen === !!c.answer;
  const marker = isRight ? "✓ correcto" : "✗ no";
  const correctAnswer = c.answer ? "verdadero" : "falso";
  return {
    text: `<b>${marker}</b>\n\n<i>${md(c.statement || "")}</i>\n\n<b>correcta:</b> ${correctAnswer}\n\n${md(c.explanation || "")}`,
    markup: nxBtn(isLast),
  };
}

function rFillBlank(c: any): R {
  const before = md(c.sentenceBefore || "");
  const after = md(c.sentenceAfter || "");
  const tokens = (c.tokens || []) as string[];
  const rows = tokens.map((tok, i) => [{ text: truncate(tok, 60), callback_data: `fb:${i}` }]);
  return {
    text: `<b>${md(c.prompt || "completa el hueco")}</b>\n\n${before}<b>______</b>${after}`,
    markup: { inline_keyboard: rows },
  };
}

function rFillBlankResult(c: any, chosenIdx: number, isLast: boolean): R {
  const tokens = (c.tokens || []) as string[];
  const isRight = chosenIdx === c.correctTokenIndex;
  const marker = isRight ? "✓ correcto" : "✗ no";
  const before = md(c.sentenceBefore || "");
  const after = md(c.sentenceAfter || "");
  const correctWord = md(tokens[c.correctTokenIndex] || "");
  return {
    text: `<b>${marker}</b>\n\n${before}<b>${correctWord}</b>${after}\n\n${md(c.explanation || "")}`,
    markup: nxBtn(isLast),
  };
}

function rMultiSelect(c: any, selected: number[]): R {
  const opts = (c.options || []) as any[];
  const rows = opts.map((o) => [{
    text: `${selected.includes(o.id) ? "☑" : "☐"} ${truncate(o.text, 55)}`,
    callback_data: `ms:t:${o.id}`,
  }]);
  rows.push([{ text: "confirmar selección →", callback_data: "ms:ok" }]);
  return {
    text: `<b>selección múltiple</b>\n\n${md(c.prompt || "")}\n\n<i>toca las que apliquen, luego confirma.</i>`,
    markup: { inline_keyboard: rows },
  };
}

function rMultiSelectResult(c: any, selected: number[], isLast: boolean): R {
  const opts = (c.options || []) as any[];
  const correct = (c.correctIds || []) as number[];
  const sortedSel = [...selected].sort((a, b) => a - b);
  const sortedCor = [...correct].sort((a, b) => a - b);
  const isRight = sortedSel.length === sortedCor.length && sortedSel.every((v, i) => v === sortedCor[i]);
  const marker = isRight ? "✓ correcto" : "✗ no exacto";
  const list = correct.map((id) => {
    const o = opts.find((x) => x.id === id);
    return o ? `• ${md(o.text)}` : "";
  }).filter(Boolean).join("\n");
  return {
    text: `<b>${marker}</b>\n\n<b>correctas:</b>\n${list}\n\n${md(c.explanation || "")}`,
    markup: nxBtn(isLast),
  };
}

function rOrderSteps(c: any, picked: number[]): R {
  const steps = (c.steps || []) as string[];
  const unpicked = steps.map((_, i) => i).filter((i) => !picked.includes(i));
  const pickedList = picked.map((i, n) => `${n + 1}. ${md(steps[i] || "")}`).join("\n");
  const rows = unpicked.map((i) => [{ text: truncate(steps[i], 55), callback_data: `os:${i}` }]);
  return {
    text: `<b>ordena los pasos</b>\n\n${md(c.prompt || "")}${pickedList ? `\n\n<b>orden actual:</b>\n${pickedList}` : ""}\n\n<i>toca el paso que va ${picked.length === 0 ? "primero" : "siguiente"}:</i>`,
    markup: { inline_keyboard: rows },
  };
}

function rOrderStepsResult(c: any, chosen: number[], isLast: boolean): R {
  const steps = (c.steps || []) as string[];
  const correct = (c.correctOrder || []) as number[];
  const isRight = chosen.length === correct.length && chosen.every((v, i) => v === correct[i]);
  const marker = isRight ? "✓ orden correcto" : "✗ orden equivocado";
  const list = correct.map((i, n) => `${n + 1}. ${md(steps[i] || "")}`).join("\n");
  return {
    text: `<b>${marker}</b>\n\n<b>orden correcto:</b>\n${list}\n\n${md(c.explanation || "")}`,
    markup: nxBtn(isLast),
  };
}

function rTapMatch(c: any, state: { matches: [number, number][]; selectedTerm: number | null }): R {
  const pairs = (c.pairs || []) as any[];
  const matchedTerms = new Set(state.matches.map((m) => m[0]));
  const matchedDefs = new Set(state.matches.map((m) => m[1]));
  const matchesList = state.matches
    .map(([ti, di]) => `• <b>${md(pairs[ti]?.term || "")}</b> ↔ ${md(pairs[di]?.def || "")}`)
    .join("\n");
  const rows: any[][] = [];
  if (state.selectedTerm === null) {
    pairs.forEach((p, i) => {
      if (!matchedTerms.has(i)) {
        rows.push([{ text: `▶ ${truncate(p.term, 55)}`, callback_data: `tm:t:${i}` }]);
      }
    });
  } else {
    pairs.forEach((p, i) => {
      if (!matchedDefs.has(i)) {
        rows.push([{ text: truncate(p.def, 55), callback_data: `tm:d:${i}` }]);
      }
    });
  }
  const hint = state.selectedTerm !== null
    ? `\n\n<b>seleccionaste:</b> ${md(pairs[state.selectedTerm]?.term || "")}\n<i>ahora toca su definición ↓</i>`
    : `\n\n<i>toca un concepto ↓</i>`;
  return {
    text: `<b>empareja</b>\n\n${md(c.prompt || "")}${matchesList ? `\n\n<b>ya emparejaste:</b>\n${matchesList}` : ""}${hint}`,
    markup: { inline_keyboard: rows },
  };
}

function rTapMatchResult(c: any, matches: [number, number][], isLast: boolean): R {
  const pairs = (c.pairs || []) as any[];
  const correctCount = matches.filter(([t, d]) => t === d).length;
  const total = pairs.length;
  const marker = correctCount === total ? "✓ todo bien" : `✓ ${correctCount}/${total} correctas`;
  const list = pairs.map((p) => `• <b>${md(p.term)}</b> ↔ ${md(p.def)}`).join("\n");
  return {
    text: `<b>${marker}</b>\n\n<b>emparejamientos:</b>\n${list}\n\n${md(c.explanation || "")}`,
    markup: nxBtn(isLast),
  };
}

function rGeneric(c: any, isLast: boolean, kind: string): R {
  const title = c.title ? `<b>${md(c.title)}</b>\n\n` : "";
  const body = c.body || c.prompt || c.statement || "";
  return {
    text: `${title}${md(body)}\n\n<i>(tipo ${kind} — mostrado simplificado en telegram)</i>`,
    markup: nxBtn(isLast),
  };
}

// ============================================================
// FLOW
// ============================================================

async function presentSlide(chatId: number, lectureId: string, slideIdx: number, editMessageId: number | null): Promise<void> {
  const slide = await getSlide(lectureId, slideIdx);
  if (!slide) {
    await send(chatId, "no encuentro ese slide. reporta el bug.");
    return;
  }
  const isLast = slideIdx === SLIDE_COUNT;
  let r: R;
  switch (slide.kind) {
    case "concept":
      r = rConcept(slide.content);
      break;
    case "celebration":
      r = rCelebration(slide.content, isLast);
      break;
    case "mcq":
      r = rMCQ(slide.content);
      break;
    case "true-false":
      r = rTF(slide.content);
      break;
    case "fill-blank":
      r = rFillBlank(slide.content);
      break;
    case "multi-select":
      r = rMultiSelect(slide.content, []);
      break;
    case "order-steps":
      r = rOrderSteps(slide.content, []);
      break;
    case "tap-match":
      r = rTapMatch(slide.content, { matches: [], selectedTerm: null });
      break;
    default:
      r = rGeneric(slide.content, isLast, slide.kind);
  }
  let msgId: number | null = null;
  if (editMessageId) {
    const ok = await editMsg(chatId, editMessageId, r.text, r.markup);
    msgId = ok ? editMessageId : null;
  }
  if (!msgId) msgId = await send(chatId, r.text, r.markup);
  await upsertSession(chatId, {
    current_lecture_id: lectureId,
    current_slide_index: slideIdx,
    last_message_id: msgId,
    slide_state: {},
  });
}

async function startLesson(chatId: number, userId: string, editMessageId: number | null): Promise<void> {
  const lectureId = await getNextLecture(userId);
  if (!lectureId) {
    await send(chatId, "ya completaste todas las lecciones publicadas. pronto habrá más.");
    await clearSession(chatId);
    return;
  }
  const lecture = await getLecture(lectureId);
  if (!lecture) {
    await send(chatId, "hubo un error cargando tu lección.");
    return;
  }
  await ensureProgress(userId, lectureId);
  await upsertSession(chatId, {
    user_id: userId,
    current_lecture_id: lectureId,
    current_slide_index: 0,
    last_message_id: null,
    slide_state: {},
  });
  await presentSlide(chatId, lectureId, 1, editMessageId);
}

async function advance(chatId: number, userId: string): Promise<void> {
  const s = await getSession(chatId);
  if (!s || !s.current_lecture_id) {
    await send(chatId, "no tienes una lección activa. usa /hoy para empezar.");
    return;
  }
  const lectureId = s.current_lecture_id;
  const current = s.current_slide_index;
  await ensureProgress(userId, lectureId);
  if (current > 0) {
    const { data: existing } = await supabase.from("user_progress").select("slides_completed").eq("user_id", userId).eq("lecture_id", lectureId).maybeSingle();
    const newCompleted = Math.max(existing?.slides_completed ?? 0, current);
    const isLast = current >= SLIDE_COUNT;
    await updateProgress(userId, lectureId, newCompleted, isLast);
  }
  const next = current + 1;
  if (next > SLIDE_COUNT) {
    const lecture = await getLecture(lectureId);
    const section = lecture ? await getSection(lecture.section_id) : null;
    const stats = await getStats(userId);
    await send(
      chatId,
      `<b>lección completada</b>\n\n• ${md(lecture?.title || "")}\n• sección ${section?.display_order ?? "?"}/10\n• xp total: ${stats?.total_xp ?? 0} · nivel ${stats?.level ?? 1}\n\nmañana te llega la siguiente.`,
    );
    await clearSession(chatId);
    return;
  }
  await presentSlide(chatId, lectureId, next, s.last_message_id);
}

// ============================================================
// COMMANDS
// ============================================================

async function cmdStart(chatId: number): Promise<void> {
  await send(
    chatId,
    `<b>itera en telegram</b>\n\nrecibes una lección al día aquí. para empezar, vincula tu cuenta:\n\n1. abre itera.la y ve a tu perfil\n2. genera un código de vinculación\n3. mándamelo: <code>/vincular TU_CODIGO</code>\n\n<b>comandos</b>\n/hoy — empezar o retomar tu lección\n/vincular CÓDIGO — vincular cuenta\n/desvincular — desvincular cuenta`,
  );
}

async function cmdLink(chatId: number, tgUserId: number, tgUsername: string, code: string): Promise<void> {
  if (!code || code.length < 4) {
    await send(chatId, "envía el comando así: <code>/vincular TU_CODIGO</code>");
    return;
  }
  const { data: existing } = await supabase.from("telegram_links").select("id").eq("telegram_user_id", tgUserId).maybeSingle();
  if (existing) {
    await send(chatId, "ya tienes una cuenta vinculada. usa /desvincular primero.");
    return;
  }
  const { data: lc } = await supabase.from("telegram_link_codes").select("id, user_id, expires_at").eq("code", code.toUpperCase()).eq("used", false).maybeSingle();
  if (!lc) {
    await send(chatId, "código inválido o ya usado. genera uno nuevo en tu perfil.");
    return;
  }
  if (new Date(lc.expires_at) < new Date()) {
    await send(chatId, "el código expiró. genera uno nuevo en tu perfil.");
    return;
  }
  const { error } = await supabase.from("telegram_links").insert({
    user_id: lc.user_id,
    telegram_user_id: tgUserId,
    telegram_username: tgUsername || null,
  });
  if (error) {
    if (error.code === "23505") {
      await send(chatId, "esta cuenta ya tiene un telegram vinculado. desvincula desde el perfil.");
    } else {
      await send(chatId, "hubo un error al vincular. intenta de nuevo.");
    }
    return;
  }
  await supabase.from("telegram_link_codes").update({ used: true }).eq("id", lc.id);
  await send(chatId, "cuenta vinculada. escribe /hoy para empezar tu lección.");
}

async function cmdUnlink(chatId: number, tgUserId: number): Promise<void> {
  await supabase.from("telegram_links").delete().eq("telegram_user_id", tgUserId);
  await clearSession(chatId);
  await send(chatId, "cuenta desvinculada.");
}

async function cmdHoy(chatId: number, tgUserId: number, editMessageId: number | null = null): Promise<void> {
  const userId = await userFromTg(tgUserId);
  if (!userId) {
    await send(chatId, "primero vincula tu cuenta: <code>/vincular CÓDIGO</code>. genera el código en tu perfil de itera.la");
    return;
  }
  const s = await getSession(chatId);
  // FIX codex: también verificar owner aquí antes de reanudar. Si el chat
  // tiene sesión de otra cuenta, empezamos limpio para esta.
  if (s?.current_lecture_id && s.user_id === userId && s.current_slide_index > 0 && s.current_slide_index < SLIDE_COUNT) {
    await presentSlide(chatId, s.current_lecture_id, s.current_slide_index, null);
    return;
  }
  if (s && s.user_id !== userId) {
    await clearSession(chatId);
  }
  await startLesson(chatId, userId, editMessageId);
}

// ============================================================
// CALLBACKS
// ============================================================

async function handleCallback(chatId: number, tgUserId: number, messageId: number, callbackId: string, data: string): Promise<void> {
  await ack(callbackId);
  const userId = await userFromTg(tgUserId);
  if (!userId) {
    await send(chatId, "vincula tu cuenta primero con /vincular CÓDIGO.");
    return;
  }
  if (data === "start_hoy") {
    // FIX 2026-04-28: pasar null en vez de messageId para que el slide 1
    // llegue como MENSAJE NUEVO en vez de edit. Algunos clientes de telegram
    // (web, ios viejos) no actualizan visiblemente los editMessage, lo que
    // hacía que el usuario tapeara [empezar →] y "no pasara nada" aunque
    // el bot procesara el callback correctamente.
    await cmdHoy(chatId, tgUserId, null);
    return;
  }
  const s = await getSession(chatId);
  if (!s || !s.current_lecture_id) {
    await send(chatId, "tu sesión expiró. usa /hoy para empezar de nuevo.");
    return;
  }
  if (s.user_id !== userId) {
    // Sesión de otra cuenta en este chat (caso de grupos o cuenta re-vinculada).
    // Reset y pide empezar de nuevo.
    await clearSession(chatId);
    await send(chatId, "sesión asociada a otra cuenta. usa /hoy para empezar de nuevo.");
    return;
  }
  const parts = data.split(":");
  const action = parts[0];
  const lectureId = s.current_lecture_id;
  const idx = s.current_slide_index;
  const isLast = idx >= SLIDE_COUNT;
  if (action === "nx") {
    await advance(chatId, userId);
    return;
  }
  const slide = await getSlide(lectureId, idx);
  if (!slide) {
    await send(chatId, "no encuentro el slide actual.");
    return;
  }
  if (action === "mcq") {
    const r = rMCQResult(slide.content, parseInt(parts[1]), isLast);
    await editMsg(chatId, messageId, r.text, r.markup);
    return;
  }
  if (action === "tf") {
    const r = rTFResult(slide.content, parts[1] === "1", isLast);
    await editMsg(chatId, messageId, r.text, r.markup);
    return;
  }
  if (action === "fb") {
    const r = rFillBlankResult(slide.content, parseInt(parts[1]), isLast);
    await editMsg(chatId, messageId, r.text, r.markup);
    return;
  }
  if (action === "ms") {
    const state = (s.slide_state || {}) as { selected?: number[] };
    const selected = state.selected || [];
    if (parts[1] === "t") {
      const togId = parseInt(parts[2]);
      const ns = selected.includes(togId) ? selected.filter((x) => x !== togId) : [...selected, togId];
      await upsertSession(chatId, { slide_state: { ...state, selected: ns } });
      const r = rMultiSelect(slide.content, ns);
      await editMsg(chatId, messageId, r.text, r.markup);
    } else if (parts[1] === "ok") {
      const r = rMultiSelectResult(slide.content, selected, isLast);
      await editMsg(chatId, messageId, r.text, r.markup);
      await upsertSession(chatId, { slide_state: {} });
    }
    return;
  }
  if (action === "os") {
    const state = (s.slide_state || {}) as { picked?: number[] };
    const picked = [...(state.picked || []), parseInt(parts[1])];
    const totalSteps = ((slide.content?.steps || []) as any[]).length;
    if (picked.length >= totalSteps) {
      const r = rOrderStepsResult(slide.content, picked, isLast);
      await editMsg(chatId, messageId, r.text, r.markup);
      await upsertSession(chatId, { slide_state: {} });
    } else {
      await upsertSession(chatId, { slide_state: { ...state, picked } });
      const r = rOrderSteps(slide.content, picked);
      await editMsg(chatId, messageId, r.text, r.markup);
    }
    return;
  }
  if (action === "tm") {
    const state = (s.slide_state || {}) as { matches?: [number, number][]; selectedTerm?: number | null };
    const matches = state.matches || [];
    const selectedTerm = state.selectedTerm ?? null;
    if (parts[1] === "t") {
      const ti = parseInt(parts[2]);
      await upsertSession(chatId, { slide_state: { ...state, matches, selectedTerm: ti } });
      const r = rTapMatch(slide.content, { matches, selectedTerm: ti });
      await editMsg(chatId, messageId, r.text, r.markup);
    } else if (parts[1] === "d" && selectedTerm !== null) {
      const di = parseInt(parts[2]);
      const newMatches = [...matches, [selectedTerm, di]] as [number, number][];
      const totalPairs = ((slide.content?.pairs || []) as any[]).length;
      if (newMatches.length >= totalPairs) {
        const r = rTapMatchResult(slide.content, newMatches, isLast);
        await editMsg(chatId, messageId, r.text, r.markup);
        await upsertSession(chatId, { slide_state: {} });
      } else {
        await upsertSession(chatId, { slide_state: { matches: newMatches, selectedTerm: null } });
        const r = rTapMatch(slide.content, { matches: newMatches, selectedTerm: null });
        await editMsg(chatId, messageId, r.text, r.markup);
      }
    }
    return;
  }
}

// ============================================================
// MAIN
// ============================================================

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret");
    if (FUNCTION_SECRET && secret !== FUNCTION_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }
    const update = await req.json();
    if (update.callback_query) {
      const cq = update.callback_query;
      const chatId = cq.message.chat.id;
      const tgUserId = cq.from.id;
      const messageId = cq.message.message_id;
      const data = cq.data || "";
      EdgeRuntime.waitUntil((async () => {
        try {
          await handleCallback(chatId, tgUserId, messageId, cq.id, data);
        } catch (e) {
          console.error("callback error:", e);
        }
      })());
      return new Response("OK", { status: 200 });
    }
    if (!update.message?.text) {
      return new Response("OK", { status: 200 });
    }
    const chatId = update.message.chat.id as number;
    const tgUserId = update.message.from.id as number;
    const tgUsername = (update.message.from.username || "") as string;
    const text = (update.message.text || "").trim();
    EdgeRuntime.waitUntil((async () => {
      try {
        if (text === "/start") await cmdStart(chatId);
        else if (text.startsWith("/vincular")) {
          const code = text.replace(/^\/vincular\s*/, "").trim().toUpperCase();
          await cmdLink(chatId, tgUserId, tgUsername, code);
        }
        else if (text === "/desvincular") await cmdUnlink(chatId, tgUserId);
        else if (text === "/hoy") await cmdHoy(chatId, tgUserId);
        else if (text.startsWith("/")) await send(chatId, "comandos: /hoy /vincular CÓDIGO /desvincular");
        else await send(chatId, "escribe /hoy para continuar tu lección.");
      } catch (err) {
        console.error("handler error:", err);
      }
    })());
    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("webhook error:", err);
    return new Response("OK", { status: 200 });
  }
});
