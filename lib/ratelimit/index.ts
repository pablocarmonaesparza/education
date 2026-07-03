// lib/ratelimit/index.ts
// ----------------------------------------------------------------------------
// Rate limiting compartido para todas las API routes. Basado en @upstash/ratelimit
// con fallback Supabase cuando no hay Redis. Itera es B2B: los límites están calibrados para evitar abuse, no
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
// # Fallback
//
//   Si UPSTASH_REDIS_REST_URL o UPSTASH_REDIS_REST_TOKEN no están definidas,
//   los limiters usan Supabase/Postgres via `simulador.consume_rate_limit`.
//   Sólo caen fail-open si tampoco existe `SUPABASE_SERVICE_ROLE_KEY`
//   (dev local incompleto).
//
// # Coordinación (plan sprint)
//
//   - Field-test LLM beat / judge → rateLimiters.ai
//   - Finance: /api/stripe/create-checkout-session → rateLimiters.checkout
// ----------------------------------------------------------------------------

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
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
        '[ratelimit] UPSTASH_REDIS_REST_URL / _TOKEN no configuradas — usando fallback Supabase si está disponible.',
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
 * Crea un limiter con window + max. Si no hay Redis, usa Postgres via
 * Supabase service-role. Sólo falla abierto cuando tampoco hay service key.
 */
function createLimiter(options: {
  max: number;
  window: `${number} ${'s' | 'm' | 'h' | 'd'}`;
  prefix: string;
}): LimiterLike {
  const redis = getRedis();

  if (!redis) {
    const windowSeconds = windowToSeconds(options.window);
    return {
      async limit(identifier: string): Promise<LimitResult> {
        return limitWithSupabase({
          identifier,
          max: options.max,
          prefix: options.prefix,
          windowSeconds,
        });
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

function windowToSeconds(window: `${number} ${'s' | 'm' | 'h' | 'd'}`): number {
  const [rawAmount, unit] = window.split(' ') as [
    string,
    's' | 'm' | 'h' | 'd',
  ];
  const amount = Number(rawAmount);
  const multiplier =
    unit === 'd' ? 86_400 : unit === 'h' ? 3_600 : unit === 'm' ? 60 : 1;
  return amount * multiplier;
}

async function limitWithSupabase(input: {
  identifier: string;
  max: number;
  prefix: string;
  windowSeconds: number;
}): Promise<LimitResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      success: true,
      remaining: input.max,
      reset: Date.now() + input.windowSeconds * 1000,
      limit: input.max,
    };
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .schema('simulador')
      .rpc('consume_rate_limit', {
        p_key: `${input.prefix}:${input.identifier}`,
        p_limit: input.max,
        p_window_seconds: input.windowSeconds,
      })
      .single();

    if (error || !data) {
      console.error('[ratelimit] supabase fallback error — fail-open', error);
      return {
        success: true,
        remaining: input.max,
        reset: Date.now() + input.windowSeconds * 1000,
        limit: input.max,
      };
    }

    // El RPC vive en el schema `simulador`, fuera de los tipos generados de
    // Supabase, así que el shape de la fila se declara aquí.
    const row = data as {
      success?: boolean;
      remaining?: number;
      reset_ms?: number;
      limit_value?: number;
    };

    return {
      success: Boolean(row.success),
      remaining: Number(row.remaining ?? 0),
      reset: Number(row.reset_ms ?? Date.now() + input.windowSeconds * 1000),
      limit: Number(row.limit_value ?? input.max),
    };
  } catch (err) {
    console.error('[ratelimit] supabase fallback exception — fail-open', err);
    return {
      success: true,
      remaining: input.max,
      reset: Date.now() + input.windowSeconds * 1000,
      limit: input.max,
    };
  }
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
   * Generación con LLM (judge, field-test, runtime). Costoso en tokens.
   * 5 requests / minuto / usuario.
   */
  ai: createLimiter({ max: 5, window: '1 m', prefix: 'ai' }),

  /**
   * Stripe checkout session. Evita spam de sessions abandonadas.
   * 10 requests / minuto / usuario.
   */
  checkout: createLimiter({ max: 10, window: '1 m', prefix: 'checkout' }),

  /**
   * Default para reads y mutations baratas (runtime events, perfil update).
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
