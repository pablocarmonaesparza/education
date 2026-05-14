#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import process from "node:process";

const root = process.cwd();
const rootReal = realpath(root);
const onlyPort = process.env.PORT || null;

function run(command, args) {
  try {
    return execFileSync(command, args, { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function realpath(path) {
  return run("pwd", ["-P"]) && path === process.cwd()
    ? run("pwd", ["-P"])
    : run("python3", ["-c", "import os,sys; print(os.path.realpath(sys.argv[1]))", path]) || path;
}

function commandFor(pid) {
  return run("ps", ["-o", "command=", "-p", String(pid)]);
}

function cwdFor(pid) {
  const procCwd = `/proc/${pid}/cwd`;
  const linuxCwd = run("readlink", [procCwd]);
  if (linuxCwd) return linuxCwd;

  const lsof = run("lsof", ["-p", String(pid), "-a", "-d", "cwd", "-Fn"]);
  const line = lsof.split("\n").find((item) => item.startsWith("n"));
  return line ? line.slice(1) : "";
}

function isProjectNextProcess(pid) {
  const command = commandFor(pid);
  if (!/next-server|next dev|next[ /].*dev/u.test(command)) return false;

  const cwd = cwdFor(pid);
  if (!cwd) return false;
  return realpath(cwd) === rootReal;
}

function listeningPids() {
  const args = onlyPort
    ? [`-tiTCP:${onlyPort}`, "-sTCP:LISTEN"]
    : ["-tiTCP", "-sTCP:LISTEN"];
  return run("lsof", args)
    .split(/\s+/)
    .map((value) => Number(value))
    .filter(Boolean);
}

const pids = [...new Set(listeningPids())].filter(isProjectNextProcess);

if (pids.length === 0) {
  console.log(
    onlyPort
      ? `No Itera Next dev server found on port ${onlyPort}.`
      : "No Itera Next dev servers found.",
  );
  process.exit(0);
}

for (const pid of pids) {
  console.log(`Stopping Itera Next dev server pid ${pid}.`);
  try {
    process.kill(pid, "SIGTERM");
  } catch {
    // Process may have exited between lsof and kill.
  }
}

const deadline = Date.now() + 6000;
for (const pid of pids) {
  while (Date.now() < deadline) {
    try {
      process.kill(pid, 0);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100);
    } catch {
      break;
    }
  }
}
