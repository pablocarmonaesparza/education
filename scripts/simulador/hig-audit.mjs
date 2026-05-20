#!/usr/bin/env node

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const INCLUDE_DIRS = [
  "app/(app)",
  "app/(onboarding)",
  "app/auth",
  "app/field-test",
  "components/simulador",
];
const EXTENSIONS = new Set([".tsx", ".ts", ".css"]);
const ALLOW_HEX_FILES = new Set(["app/(app)/simulador.css"]);
const ALLOW_RAW_HEX_PATTERNS = [
  /fill="#[0-9A-Fa-f]{3,8}"/, // Google OAuth mark.
  /stroke="#[0-9A-Fa-f]{3,8}"/,
];

const failures = [];
const warnings = [];

function walk(dir) {
  const abs = path.join(ROOT, dir);
  try {
    return readdirSync(abs).flatMap((entry) => {
      const full = path.join(abs, entry);
      const rel = path.relative(ROOT, full);
      const st = statSync(full);
      if (st.isDirectory()) return walk(rel);
      if (!EXTENSIONS.has(path.extname(full))) return [];
      return [rel];
    });
  } catch {
    return [];
  }
}

const files = INCLUDE_DIRS.flatMap(walk);
const globalMotionGuard = (() => {
  try {
    const css = readFileSync(path.join(ROOT, "app/(app)/simulador.css"), "utf8");
    return css.includes("@media (prefers-reduced-motion: reduce)");
  } catch {
    return false;
  }
})();

function addFailure(file, line, code, message) {
  failures.push(`${file}:${line} [${code}] ${message}`);
}

function addWarning(file, line, code, message) {
  warnings.push(`${file}:${line} [${code}] ${message}`);
}

for (const file of files) {
  const source = readFileSync(path.join(ROOT, file), "utf8");
  const lines = source.split(/\r?\n/);
  const isCssTokenFile = ALLOW_HEX_FILES.has(file);

  lines.forEach((line, idx) => {
    const lineNo = idx + 1;
    const trimmed = line.trim();

    if (!isCssTokenFile && /(?:bg|text|border|from|to|via)-\[[^\]]*#[0-9A-Fa-f]{3,8}/.test(line)) {
      addFailure(
        file,
        lineNo,
        "COLOR-03",
        "Hex inline en clase Tailwind; usa tokens CSS de simulador.css.",
      );
    }

    if (
      !isCssTokenFile &&
      /#[0-9A-Fa-f]{3,8}/.test(line) &&
      !ALLOW_RAW_HEX_PATTERNS.some((pattern) => pattern.test(line))
    ) {
      addWarning(
        file,
        lineNo,
        "COLOR-03",
        "Hex raw detectado; verifica que sea asset de marca o muévelo a token.",
      );
    }

    if (
      /outline-none/.test(line) &&
      !/(focus|focus-visible|data-\[focus=true\]|focus-within)/.test(line)
    ) {
      addWarning(
        file,
        lineNo,
        "A11Y-06",
        "outline-none sin reemplazo en la misma línea; confirmar focus visible.",
      );
    }

    if (/shadow-2xl|shadow-\[[^\]]*(?:24px|32px|48px|64px)/.test(line)) {
      addFailure(
        file,
        lineNo,
        "MAT-04",
        "Shadow fuera de escala Apple; usa --shadow-xs/sm/md/lg/xl.",
      );
    }

    if (/duration-\[(?:[6-9][0-9]{2,}|[1-9][0-9]{3,})ms\]|duration-(?:700|1000)/.test(line)) {
      addFailure(
        file,
        lineNo,
        "MOTION-02",
        "Duración >500ms sin justificación; usa tokens motion.",
      );
    }

    if (/<(?:button|AppleButton|Button)\b/.test(line) && /aria-label=/.test(line) === false) {
      const next = lines.slice(idx, idx + 4).join(" ");
      if (/>\s*<[^>]*(Icon|svg|AppleIcon)/.test(next) || /isIconOnly/.test(next)) {
        addFailure(
          file,
          lineNo,
          "A11Y-07",
          "Botón icon-only sin aria-label.",
        );
      }
    }

    if (/<motion\./.test(line) && !source.includes("useReducedMotion") && !globalMotionGuard) {
      addWarning(
        file,
        lineNo,
        "A11Y-04",
        "Motion detectado; este archivo debe respetar prefers-reduced-motion vía CSS global o hook.",
      );
    }

    if (/className=.*\brounded-\[(?!var\(--radius)/.test(trimmed)) {
      addWarning(
        file,
        lineNo,
        "MAT-03",
        "Radius arbitrario detectado; preferir tokens --radius-*.",
      );
    }
  });
}

if (warnings.length) {
  process.stdout.write(`HIG audit warnings (${warnings.length}):\n`);
  process.stdout.write(warnings.slice(0, 40).join("\n"));
  if (warnings.length > 40) process.stdout.write(`\n... ${warnings.length - 40} más`);
  process.stdout.write("\n");
}

if (failures.length) {
  process.stderr.write(`HIG audit FAIL (${failures.length}):\n`);
  process.stderr.write(failures.join("\n"));
  process.stderr.write("\n");
  process.exit(1);
}

process.stdout.write(`HIG audit OK (${files.length} files checked).\n`);
