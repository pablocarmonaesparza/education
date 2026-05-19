#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const label = "com.itera.coord.heartbeat";
const launchAgentsDir = path.join(os.homedir(), "Library/LaunchAgents");
const plistPath = path.join(launchAgentsDir, `${label}.plist`);
const nodePath = process.execPath;
const scriptPath = path.join(ROOT, "scripts/coord/heartbeat.mjs");

const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${label}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${nodePath}</string>
    <string>${scriptPath}</string>
  </array>
  <key>WorkingDirectory</key>
  <string>${ROOT}</string>
  <key>StartInterval</key>
  <integer>1800</integer>
  <key>StandardOutPath</key>
  <string>/tmp/itera-coord-heartbeat.out.log</string>
  <key>StandardErrorPath</key>
  <string>/tmp/itera-coord-heartbeat.err.log</string>
</dict>
</plist>
`;

fs.mkdirSync(launchAgentsDir, { recursive: true });
fs.writeFileSync(plistPath, plist);

try {
  execFileSync("launchctl", ["bootout", `gui/${process.getuid()}`, plistPath], { stdio: "ignore" });
} catch {
  // Not loaded yet.
}

execFileSync("launchctl", ["bootstrap", `gui/${process.getuid()}`, plistPath], { stdio: "inherit" });
console.log(`installed ${label} at ${plistPath}`);
