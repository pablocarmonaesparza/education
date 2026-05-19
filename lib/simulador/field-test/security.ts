import { createHash, randomBytes } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";

export const FIELD_TEST_COOKIE = "itera_field_test";
export const FIELD_TEST_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 90;

export function createOpaqueToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function hashRequestPart(value: string | null): string | null {
  if (!value) return null;
  return createHash("sha256").update(value).digest("hex");
}

export function requestIp(req: NextRequest): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || null;
  return req.headers.get("x-real-ip")?.trim() || null;
}

export function requestUserAgent(req: NextRequest): string | null {
  return req.headers.get("user-agent")?.trim() || null;
}

export function setFieldTestCookie(res: NextResponse, token: string): void {
  res.cookies.set(FIELD_TEST_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: FIELD_TEST_COOKIE_MAX_AGE_SECONDS,
  });
}

export function getFieldTestToken(req: NextRequest): string | null {
  return req.cookies.get(FIELD_TEST_COOKIE)?.value ?? null;
}

export function fieldTestRequiresRealLlm(): boolean {
  return (
    process.env.NODE_ENV === "production" &&
    process.env.FIELD_TEST_REQUIRE_REAL_LLM !== "false"
  );
}

export function assertFieldTestLlmConfigured(): void {
  if (!fieldTestRequiresRealLlm()) return;

  const missing = [
    !process.env.DEEPSEEK_API_KEY ? "DEEPSEEK_API_KEY" : null,
    !process.env.GEMINI_API_KEY ? "GEMINI_API_KEY" : null,
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(
      `Field-test production requires real LLM credentials: ${missing.join(", ")}.`,
    );
  }
}

export function assertFieldTestRateLimitConfigured(): void {
  const isStrictProduction =
    process.env.VERCEL_ENV === "production" ||
    (!process.env.VERCEL_ENV && process.env.NODE_ENV === "production");
  if (!isStrictProduction) return;
  if (process.env.FIELD_TEST_REQUIRE_RATE_LIMIT === "false") return;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error(
      "Field-test production requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
    );
  }
}
