#!/usr/bin/env node

import { readFileSync } from "node:fs";

const sourcePath = "lib/simulador/copy/emails.ts";
const source = readFileSync(sourcePath, "utf8");

const expectedTemplates = [
  "signup_welcome",
  "invitation",
  "invitation_accepted",
  "case_assigned",
  "report_ready_employee",
  "report_ready_manager",
  "sprint_closing",
  "password_reset",
];

const slopBlocklist = [
  "powered by ai",
  "leverage",
  "synergize",
  "10x",
  "revolutionize",
  "next-gen",
  "transformative",
];

function fail(message) {
  console.error(`[email-templates] ${message}`);
  process.exitCode = 1;
}

function templateBlock(template) {
  const pattern = new RegExp(
    `${template}: \\{([\\s\\S]*?)\\n  \\},(?:\\n\\n  //|\\n\\} as const;)`,
  );
  return source.match(pattern)?.[1] ?? null;
}

function varsBlock(template) {
  const start = source.indexOf("export const emailTemplateVars");
  const varsSource = start >= 0 ? source.slice(start) : "";
  const pattern = new RegExp(`${template}: \\[([\\s\\S]*?)\\]`);
  return varsSource.match(pattern)?.[1] ?? null;
}

function placeholders(text) {
  return [...text.matchAll(/\{([a-zA-Z0-9_]+)\}/g)].map(
    (match) => match[1],
  );
}

for (const template of expectedTemplates) {
  const block = templateBlock(template);
  if (!block) {
    fail(`missing template ${template}`);
    continue;
  }

  const vars = varsBlock(template);
  if (!vars) {
    fail(`missing emailTemplateVars for ${template}`);
    continue;
  }

  const declaredVars = new Set(
    [...vars.matchAll(/"([^"]+)"/g)].map((match) => match[1]),
  );
  const usedVars = new Set(placeholders(block));

  for (const used of usedVars) {
    if (!declaredVars.has(used)) {
      fail(`${template} uses {${used}} but does not declare it`);
    }
  }

  for (const declared of declaredVars) {
    if (!usedVars.has(declared)) {
      fail(`${template} declares ${declared} but does not use it`);
    }
  }

  const subject = block.match(/subject:\s*"([^"]+)"/)?.[1];
  if (!subject) {
    fail(`${template} is missing subject`);
  } else if (subject.length > 70) {
    fail(`${template} subject too long (${subject.length} chars)`);
  }

  const preheader = block.match(/preheader:\s*"([^"]+)"/)?.[1];
  if (!preheader) {
    fail(`${template} is missing preheader`);
  } else if (preheader.length > 130) {
    fail(`${template} preheader too long (${preheader.length} chars)`);
  }
}

for (const phrase of slopBlocklist) {
  if (source.toLowerCase().includes(phrase)) {
    fail(`blocked phrase found: ${phrase}`);
  }
}

if (!process.exitCode) {
  console.log(
    `[email-templates] OK (${expectedTemplates.length} templates checked)`,
  );
}
