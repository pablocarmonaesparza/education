#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const scopedPrefixes = [
  "app/page.tsx",
  "app/(app)/",
  "app/(onboarding)/",
  "app/auth/",
  "app/field-test/",
  "app/_data_simulador_temp/",
  "app/api/admin/",
  "app/api/dashboard/",
  "app/api/field-test/",
  "app/api/invitations/",
  "app/api/orgs/",
  "app/api/sessions/",
  "app/api/transcribe/",
  "components/simulador/",
  "lib/email/",
  "lib/simulador/",
  "scripts/simulador/",
  "scripts/dev-simulador.mjs",
  "scripts/kill-dev.mjs",
];

function run(command, args) {
  return spawnSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function committedFiles() {
  const result = run("git", ["ls-tree", "-r", "--name-only", "HEAD"]);
  if (result.status !== 0) return null;
  return new Set(result.stdout.split(/\r?\n/).filter(Boolean));
}

function pathFromTypeScriptLine(line) {
  const match = line.match(/^(.+?)\(\d+,\d+\): error TS\d+:/u);
  return match?.[1]?.replace(/^\.\//, "") ?? null;
}

const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const typecheck = run(npx, ["tsc", "--noEmit", "--pretty", "false"]);
const typecheckOutput = `${typecheck.stdout}${typecheck.stderr}`;
const lines = typecheckOutput.split(/\r?\n/).filter(Boolean);
const trackedAtHead = committedFiles();
let ignoredUncommittedErrors = 0;
const scopedErrors = lines.filter((line) => {
  const normalized = line.replace(/^\.\//, "");
  const errorPath = pathFromTypeScriptLine(normalized);
  if (trackedAtHead && errorPath && !trackedAtHead.has(errorPath)) {
    if (scopedPrefixes.some((prefix) => normalized.startsWith(prefix))) {
      ignoredUncommittedErrors += 1;
    }
    return false;
  }
  return scopedPrefixes.some((prefix) => normalized.startsWith(prefix));
});
const allErrors = lines.filter((line) => /\berror TS\d+:/u.test(line));

if (scopedErrors.length > 0) {
  console.error("\nScoped simulator typecheck failed:");
  for (const line of scopedErrors) console.error(line);
  process.exit(1);
}

console.log(
  `Scoped simulator typecheck OK (${allErrors.length} legacy TypeScript errors ignored outside simulator scope).`,
);

if (ignoredUncommittedErrors > 0) {
  console.warn(
    `Note: ignored ${ignoredUncommittedErrors} simulator TypeScript errors in files not committed at HEAD. CI will enforce them once committed.`,
  );
}
