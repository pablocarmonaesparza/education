/**
 * LLM client wrapper — DeepSeek primary + Gemini fallback.
 *
 * Ambos providers exponen una API OpenAI-compatible, así que la SDK `openai`
 * sirve para los dos: solo cambian `apiKey` y `baseURL`. Esto evita una segunda
 * dependencia (`@google/generative-ai`) y mantiene el código uniforme.
 *
 * Uso típico:
 *   import { chat } from '@/lib/llm/client';
 *   const completion = await chat({
 *     messages: [{ role: 'user', content: 'hola' }],
 *     model: 'deepseek-chat',          // opcional, default 'deepseek-chat'
 *     stream: true,                     // opcional, soportado por ambos
 *   });
 *
 * Estrategia de fallback:
 *   1. Intenta DeepSeek (default).
 *   2. Si DeepSeek falla con error de red, 5xx, timeout o rate limit, reintenta
 *      la misma llamada con Gemini (mapeando model: 'deepseek-*' → 'gemini-3.1-flash').
 *   3. Si Gemini también falla, propaga el último error.
 *
 * Lazy init via Proxy (mismo patrón que `lib/stripe/config.ts`): los clients no
 * se inicializan al importar el módulo, sino al primer property access. Evita
 * que el build de Vercel rompa cuando alguna env var no está configurada
 * (preview deploys de branches sin secrets).
 */

import OpenAI from 'openai';
import type {
  ChatCompletionCreateParamsBase,
  ChatCompletion,
  ChatCompletionChunk,
} from 'openai/resources/chat/completions';
import type { Stream } from 'openai/streaming';

// === lazy clients ===

let _deepseek: OpenAI | undefined;
function deepseekClient(): OpenAI {
  if (_deepseek) return _deepseek;
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error(
      'DEEPSEEK_API_KEY no configurada. Configurar en .env.local y en Vercel envs.'
    );
  }
  _deepseek = new OpenAI({
    apiKey,
    baseURL: 'https://api.deepseek.com',
  });
  return _deepseek;
}

let _gemini: OpenAI | undefined;
function geminiClient(): OpenAI {
  if (_gemini) return _gemini;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY no configurada. Configurar en .env.local y en Vercel envs.'
    );
  }
  _gemini = new OpenAI({
    apiKey,
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  });
  return _gemini;
}

// === defaults ===

/** Modelo de DeepSeek por default (V3.x, OpenAI-compat). */
export const DEFAULT_MODEL = 'deepseek-chat';

/** Modelo de DeepSeek con razonamiento (R1) — para curso-generación, validación. */
export const REASONER_MODEL = 'deepseek-reasoner';

/** Modelo de Gemini para fallback (lo que pidió Pablo). */
export const FALLBACK_MODEL = 'gemini-3.1-flash';

// === fallback logic ===

/**
 * Decide si un error amerita fallback a Gemini.
 *
 * Fallback en:
 *   - 402 Payment Required → DeepSeek sin balance, Gemini puede tener créditos
 *   - 408 Request Timeout, 429 Rate Limit, 5xx → provider issue
 *   - Network errors (ETIMEDOUT, ECONNRESET, etc.)
 *
 * NO fallback en:
 *   - 400 Bad Request → nuestro payload está mal, Gemini también va a rechazar
 *   - 401 Unauthorized → API key inválida; Gemini puede tener el mismo problema
 *     pero al menos avisamos del error real (config bug)
 *
 * Cuando dudamos, fallback. Es mejor servir una respuesta de Gemini que
 * propagar un error de DeepSeek al usuario.
 */
function shouldFallback(err: unknown): boolean {
  if (!(err instanceof Error)) return true;
  const e = err as Error & { status?: number; code?: string };
  if (e.status === 400 || e.status === 401) return false;
  if (e.status && e.status >= 402) return true; // 402, 403, 408, 429, 5xx, etc.
  if (e.code === 'ETIMEDOUT' || e.code === 'ECONNRESET' || e.code === 'ECONNREFUSED') return true;
  if (/network|timeout|fetch failed|aborted|insufficient balance|payment/i.test(e.message)) return true;
  return false;
}

// === public API ===

export interface ChatOptions extends Omit<ChatCompletionCreateParamsBase, 'model'> {
  /** Modelo a usar en DeepSeek. Default: `deepseek-chat`. */
  model?: string;
  /** Modelo Gemini para fallback. Default: `gemini-3.1-flash`. */
  fallbackModel?: string;
}

/**
 * Llamada de chat con fallback automático. Devuelve el resultado de DeepSeek o,
 * si falla con un error transient, de Gemini. Si ambos fallan propaga el error
 * de Gemini (más reciente).
 */
export async function chat(
  opts: ChatOptions & { stream?: false }
): Promise<ChatCompletion>;
export async function chat(
  opts: ChatOptions & { stream: true }
): Promise<Stream<ChatCompletionChunk>>;
export async function chat(
  opts: ChatOptions
): Promise<ChatCompletion | Stream<ChatCompletionChunk>> {
  const { model = DEFAULT_MODEL, fallbackModel = FALLBACK_MODEL, ...rest } = opts;
  try {
    return await deepseekClient().chat.completions.create({
      model,
      ...rest,
    } as ChatCompletionCreateParamsBase) as ChatCompletion | Stream<ChatCompletionChunk>;
  } catch (err) {
    if (!shouldFallback(err)) {
      throw err;
    }
    console.warn('[llm] deepseek failed, falling back to gemini', {
      error: err instanceof Error ? err.message : String(err),
      model,
      fallbackTo: fallbackModel,
    });
    return await geminiClient().chat.completions.create({
      model: fallbackModel,
      ...rest,
    } as ChatCompletionCreateParamsBase) as ChatCompletion | Stream<ChatCompletionChunk>;
  }
}

/**
 * Acceso directo al cliente (sin fallback) — para casos donde necesitas embeddings
 * o features que no están en chat. Embeddings no tienen fallback por ahora porque
 * los formatos varían entre providers.
 */
export function getDeepseek(): OpenAI {
  return deepseekClient();
}

export function getGemini(): OpenAI {
  return geminiClient();
}
