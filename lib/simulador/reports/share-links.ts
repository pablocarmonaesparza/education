import { createHash, randomBytes } from "node:crypto";

export const REPORT_SHARE_TTL_DAYS = 30;

export function createReportShareToken() {
  return randomBytes(32).toString("base64url");
}

export function hashReportShareToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function reportShareExpiresAt(now = new Date()) {
  const expires = new Date(now);
  expires.setDate(expires.getDate() + REPORT_SHARE_TTL_DAYS);
  return expires.toISOString();
}

export function reportShareUrl(origin: string, token: string) {
  return `${origin.replace(/\/$/u, "")}/shared/report/${token}`;
}
