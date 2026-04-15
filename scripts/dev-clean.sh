#!/usr/bin/env bash
# scripts/dev-clean.sh
#
# Safe clean restart of the Next.js dev server FOR THIS PROJECT.
#
# Fixes the class of "Internal Server Error" problems caused by the .next/
# directory getting into an inconsistent half-compiled state (missing
# routes-manifest.json, missing _document.js, etc.). This happens when the
# dev server is killed mid-compile or when .next is deleted while the server
# is still running.
#
# Scoping rules (important):
#   - Only stops processes that are BOTH listening on the target port AND
#     whose command matches 'next-server' or 'next dev'.
#   - If the port is held by something else (postgres, another app, a
#     different Next project bound elsewhere), we abort and ask the user to
#     investigate. We never kill an unknown process.
#
# Config:
#   PORT env var — port to check (default 3000)
#
# Portable on macOS (BSD) and Linux (GNU) shells.

set -u

PORT="${PORT:-3000}"

# Given a PID, return its command line (or empty string).
pid_command() {
  ps -o command= -p "$1" 2>/dev/null || true
}

# Given a PID, return its current working directory (or empty string).
# Works on macOS (BSD lsof) and Linux (procfs or lsof).
#
# lsof -Fn output for `-d cwd` looks like:
#   p12345
#   fcwd
#   n/Users/foo/project
# We extract the first line that starts with 'n' — that's the path.
pid_cwd() {
  local pid="$1"
  local cwd
  # Linux fast path
  if [ -r "/proc/${pid}/cwd" ]; then
    cwd=$(readlink "/proc/${pid}/cwd" 2>/dev/null || true)
    echo "${cwd}"
    return
  fi
  # macOS / fallback via lsof — grep the n-prefixed line explicitly.
  cwd=$(lsof -p "${pid}" -a -d cwd -Fn 2>/dev/null | awk '/^n/{print substr($0,2); exit}' || true)
  echo "${cwd}"
}

is_next_process() {
  # $1 = command line string
  case "$1" in
    *next-server*|*"next dev"*|*"next dev --webpack"*|*"next dev --turbo"*|*"next dev --turbopack"*)
      return 0 ;;
  esac
  return 1
}

# 1) Find PIDs listening on the target port (exclusive to our port — no
#    cross-project risk).
listener_pids=$(lsof -tiTCP:"${PORT}" -sTCP:LISTEN 2>/dev/null || true)

if [ -n "${listener_pids}" ]; then
  # 1a) VALIDATE FIRST: classify every listener BEFORE killing anything.
  # Abort if ANY listener is (a) not a Next process OR (b) a Next process
  # from a different working directory (i.e., another project).
  project_cwd="$(pwd)"
  # Resolve symlinks so /tmp vs /private/tmp on macOS match.
  project_cwd_real=$(cd "${project_cwd}" && pwd -P)
  next_pids=""
  for pid in ${listener_pids}; do
    cmd=$(pid_command "${pid}")
    if [ -z "${cmd}" ]; then
      # Process disappeared between lsof and ps — skip.
      continue
    fi
    if ! is_next_process "${cmd}"; then
      echo "dev-clean: ABORT — port ${PORT} is held by a non-Next process:"
      echo "  pid=${pid} cmd=${cmd}"
      echo "dev-clean: stop that process manually and retry. Nothing was killed."
      exit 1
    fi
    cwd=$(pid_cwd "${pid}")
    if [ -z "${cwd}" ]; then
      # If we can't determine cwd, ABORT — safer than assuming it's ours.
      echo "dev-clean: ABORT — could not determine cwd of pid ${pid}."
      echo "dev-clean: stop that process manually and retry. Nothing was killed."
      exit 1
    fi
    cwd_real=$(cd "${cwd}" 2>/dev/null && pwd -P || echo "${cwd}")
    if [ "${cwd_real}" != "${project_cwd_real}" ]; then
      echo "dev-clean: ABORT — port ${PORT} is held by a Next process from a DIFFERENT project:"
      echo "  pid=${pid} cwd=${cwd_real}"
      echo "dev-clean: we refuse to kill processes outside ${project_cwd_real}."
      exit 1
    fi
    next_pids="${next_pids} ${pid}"
  done

  # 1b) KILL SECOND: all validated Next PIDs get TERM together.
  if [ -n "${next_pids}" ]; then
    for pid in ${next_pids}; do
      cmd=$(pid_command "${pid}")
      echo "dev-clean: TERM pid ${pid} on port ${PORT} (${cmd})"
      kill "${pid}" 2>/dev/null || true
    done

    # 1c) WAIT FOR EXIT — we must be sure every killed PID is gone before
    # touching .next, because Next.js can release the port socket while
    # compilation threads are still running. A .next mutation during that
    # window creates the exact broken state we are trying to fix.
    deadline=$(( $(date +%s) + 6 ))
    for pid in ${next_pids}; do
      while kill -0 "${pid}" 2>/dev/null; do
        if [ "$(date +%s)" -ge "${deadline}" ]; then
          # Escalate: force-kill and give a brief moment.
          echo "dev-clean: force-killing stubborn pid ${pid}"
          kill -9 "${pid}" 2>/dev/null || true
          # Wait a bit more after SIGKILL.
          deadline=$(( $(date +%s) + 3 ))
        fi
        sleep 0.1
      done
    done
  fi
fi

# 3) Final sanity: port must be free. (We proved above that every PID we
# killed is gone via kill -0; a sibling Next project on a different port is
# not our concern and we must not abort because of it.)
if lsof -iTCP:"${PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "dev-clean: port ${PORT} is still in use after cleanup — aborting."
  lsof -iTCP:"${PORT}" -sTCP:LISTEN 2>/dev/null | head -5
  exit 1
fi

# 4) Nuke build cache (scoped to THIS project via cwd).
echo "dev-clean: removing $(pwd)/.next"
rm -rf .next

# 5) Fresh server.
echo "dev-clean: starting next dev --webpack (PORT=${PORT})"
exec node ./node_modules/.bin/next dev --webpack --port "${PORT}"
