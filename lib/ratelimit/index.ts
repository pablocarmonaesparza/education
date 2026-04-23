// lib/ratelimit/index.ts
// ----------------------------------------------------------------------------
// Rate limiting compartido para todas las API routes. Basado en @upstash/ratelimit
// con fallback fail-open cuando no hay env vars configuradas (dev/preview sin
// Redis). Itera es B2B: los límites están calibrados para evitar abuse, no
// para monetizar consumo.
//
// # Uso
//
//   import { rateLimiters } from '@/lib/ratelimit';
//
//   export async function POST(req: NextRequest) {
//     const id = await identifyRequest(req);
//     const { success, remaining, reset } = await rateLimiters.ai.limit(id);
//     if (!success) return rateLimitedResponse(remaining, reset);
//     // ...resto de la lógica
//   }
//
// # Presets
//
//   - rateLimiters.ai       → generación con LLM (costosa)      5 req / 1 min
//   - rateLimiters.checkout → stripe checkout session           10 req / 1 min
//   - rateLimiters.standard → auth, lecturas, mutations baratas 30 req / 1 min
//   - rateLimiters.burst    → endpoints que permiten ráfagas   60 req / 10 s
//
// # Identificación
//
//   identifyRequest(req) intenta:
//     1. Supabase auth cookie (user.id)
//     2. cabecera x-forwarded-for / x-real-ip (IP pública tras Vercel)
//     3. fallback "anon"
//
// # Fail-open
//
//   Si UPSTASH_REDIS_REST_URL o UPSTASH_REDIS_REST_TOKEN no están definidas,
//   todos los limiters permiten todas las requests y se loguea un warning una
//   sola vez por process start. Esto evita romper dev/preview sin Redis y es
//   seguro porque el único costo es rate-abuse, no leak de datos.
//
// # Coordinación (plan sprint)
//
//   - Onboarding O5: /api/generate-course → rateLimiters.ai
//   - Finance: /api/stripe/create-checkout-session → rateLimiters.checkout
//   - Backend P0.3 (tutor cuando vuelva): /api/tutor-chat → rateLimiters.ai
// ----------------------------------------------------------------------------

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ─────────────────────────────────────────────────────────────
// Redis client — lazy singleton
// ─────────────────────────────────────────────────────────────

let redisSingleton: Redis | null = null;
let warnedMissing = false;

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    if (!warnedMissing) {
      console.warn(
        '[ratelimit] UPSTASH_REDIS_REST_URL / _TOKEN no configuradas — rate limiting deshabilitado (fail-open). Configurar en Vercel para producción.',
      );
      warnedMissing = true;
    }
    return null;
  }

  if (!redisSingleton) {
    redisSingleton = new Redis({ url, token });
  }
  return redisSingleton;
}

// ─────────────────────────────────────────────────────────────
// Limiter factory
// ─────────────────────────────────────────────────────────────

export interface LimitResult {
  success: boolean;
  remaining: number;
  reset: number; // epoch ms cuando se resetea la ventana
  limit: number;
}

export interface LimiterLike {
  limit(identifier: string): Promise<LimitResult>;
}

/**
 * Crea un limiter con window + max. Si no hay Redis, devuelve un limiter
 * no-op que siempre permite (fail-open).
 */
function createLimiter(options: {
  max: number;
  window: `${number} ${'s' | 'm' | 'h' | 'd'}`;
  prefix: string;
}): LimiterLike {
  const redis = getRedis();

  if (!redis) {
    // Fail-open limiter — siempre permite, sin tocar I/O.
    return {
      async limit(_identifier: string): Promise<LimitResult> {
        return {
          success: true,
          remaining: options.max,
          reset: Date.now() + 60_000,
          limit: options.max,
        };
      },
    };
  }

  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(options.max, options.window),
    prefix: `itera:ratelimit:${options.prefix}`,
    analytics: true,
  });

  return {
    async limit(identifier: string): Promise<LimitResult> {
      try {
        const res = await ratelimit.limit(identifier);
        return {
          success: res.success,
          remaining: res.remaining,
          reset: res.reset,
          limit: res.limit,
        };
      } catch (err) {
        // Fail-open si Upstash cae en runtime: no queremos tumbar el endpoint
        // por un hiccup de infra. Log error para alertas downstream.
        console.error('[ratelimit] upstash runtime error — fail-open', err);
        return {
          success: true,
          remaining: options.max,
          reset: Date.now() + 60_000,
          limit: options.max,
        };
      }
    },
  };
}

// ─────────────────────────────────────────────────────────────
// Presets
// ─────────────────────────────────────────────────────────────

/**
 * Limiters presentes en el sistema. Importar desde aquí para mantener
 * consistencia — no crear limiters ad-hoc en rutas individuales.
 */
export const rateLimiters = {
  /**
   * Generación con LLM (course-gen, tutor-chat). Costoso en tokens.
   * 5 requests / minuto / usuario.
   */
  ai: createLimiter({ max: 5, window: '1 m', prefix: 'ai' }),

  /**
   * Stripe checkout session. Evita spam de sessions abandonadas.
   * 10 requests / minuto / usuario.
   */
  checkout: createLimiter({ max: 10, window: '1 m', prefix: 'checkout' }),

  /**
   * Default para reads y mutations baratas (user_progress write, perfil update).
   * 30 requests / minuto / usuario.
   */
  standard: createLimiter({ max: 30, window: '1 m', prefix: 'standard' }),

  /**
   * Endpoints que permiten ráfagas (scroll-loaded content, polls).
   * 60 requests / 10 segundos / usuario.
   */
  burst: createLimiter({ max: 60, window: '10 s', prefix: 'burst' }),
} as const;

// ─────────────────────────────────────────────────────────────
// Identificación del request
// ─────────────────────────────────────────────────────────────

/**
 * Obtiene un identificador estable para el request. Prefiere user.id
 * (authenticated). Si no hay user, cae a IP. Si no hay IP, "anon" (raro en
 * Vercel pero blindado contra crashes).
 *
 * Usar siempre esto — nunca generar identifiers ad-hoc.
 */
export async function identifyRequest(req: NextRequest): Promise<string> {
  // 1. Auth cookie de Supabase (cookie-based SSR client)
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) return `user:${user.id}`;
  } catch {
    // Cookie parsing puede fallar en algunos edge cases — cae a IP.
  }

  // 2. IP de Vercel (x-forwarded-for es el header canónico)
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const ip = xff.split(',')[0]?.trim();
    if (ip) return `ip:${ip}`;
  }
  const xri = req.headers.get('x-real-ip');
  if (xri) return `ip:${xri.trim()}`;

  // 3. Fallback
  return 'anon';
}

// ─────────────────────────────────────────────────────────────
// Response helper
// ─────────────────────────────────────────────────────────────

/**
 * Devuelve una 429 con headers estándar Retry-After + X-RateLimit-*.
 * Usar cuando `limit()` retorna success: false.
 */
export function rateLimitedResponse(
  remaining: number,
  reset: number,
  limit?: number,
): NextResponse {
  const retryAfterSec = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  return NextResponse.json(
    {
      error: 'rate_limited',
      message: 'Demasiadas solicitudes. Intenta de nuevo en unos segundos.',
      retry_after_seconds: retryAfterSec,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSec),
        'X-RateLimit-Remaining': String(Math.max(0, remaining)),
        'X-RateLimit-Reset': String(reset),
        ...(limit !== undefined ? { 'X-RateLimit-Limit': String(limit) } : {}),
      },
    },
  );
}

// ─────────────────────────────────────────────────────────────
// One-liner convenience
// ─────────────────────────────────────────────────────────────

/**
 * Azucar para routes que solo quieren "aplica este limiter y devuelve 429 si
 * toca". Retorna `null` si el request pasa; retorna NextResponse 429 si está
 * bloqueado.
 *
 * ```ts
 * export async function POST(req: NextRequest) {
 *   const blocked = await enforceRateLimit(req, rateLimiters.ai);
 *   if (blocked) return blocked;
 *   // ...resto
 * }
 * ```
 */
export async function enforceRateLimit(
  req: NextRequest,
  limiter: LimiterLike,
): Promise<NextResponse | null> {
  const id = await identifyRequest(req);
  const { success, remaining, reset, limit } = await limiter.limit(id);
  if (!success) {
    return rateLimitedResponse(remaining, reset, limit);
  }
  return null;
}
