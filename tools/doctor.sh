#!/usr/bin/env bash

set -euo pipefail

# Simple, portable environment diagnostics for StudyWan
# Prints checks and guidance; exits non‑zero if critical tools are missing.

# Styling
ok="✅"; warn="⚠️ "; err="❌"; info="ℹ️ ";

failures=0
warnings=0

note() { echo "${info} $*"; }
good() { echo "${ok} $*"; }
bad() { echo "${err} $*"; failures=$((failures+1)); }
warn() { echo "${warn} $*"; warnings=$((warnings+1)); }

have() { command -v "$1" >/dev/null 2>&1; }
ver() { "$1" --version 2>/dev/null | head -n1; }

semver_ge() {
  # Usage: semver_ge 18.0.0 16.0.0 -> true
  # Fallback: treat non-semver as OK
  local a b IFS=.
  a=( ${1//[vV]/} )
  b=( ${2//[vV]/} )
  for i in 0 1 2; do
    local ai=${a[i]:-0}
    local bi=${b[i]:-0}
    if [[ $ai -gt $bi ]]; then return 0; fi
    if [[ $ai -lt $bi ]]; then return 1; fi
  done
  return 0
}

section() {
  echo
  echo "—— $* ——"
}

section "System"
uname_out=$(uname -a || true)
echo "$uname_out"

case "$(uname)" in
  Darwin)
    good "OS: macOS"
    if have xcode-select; then
      if xcode-select -p >/dev/null 2>&1; then
        good "Xcode Command Line Tools installed"
      else
        warn "Xcode CLT not configured. Run: xcode-select --install"
      fi
    else
      warn "xcode-select not found. Install Xcode Command Line Tools"
    fi
    ;;
  Linux)
    good "OS: Linux"
    ;;
  *)
    warn "Unrecognized OS: $(uname) — script may be less thorough"
    ;;
esac

shell_name=${SHELL:-}
[[ -n "$shell_name" ]] && note "Shell: $shell_name"

section "Essentials"
if have git; then
  good "$(ver git)"
else
  bad "git not found — install Git"
fi

if have curl || have wget; then
  good "Downloader: ${$(command -v curl):-$(command -v wget)}"
else
  bad "Neither curl nor wget found — install one"
fi

for tool in grep awk sed tar unzip; do
  if have "$tool"; then
    good "$tool available"
  else
    warn "$tool not found"
  fi
done

section "Node.js"
node_req="18.0.0"
if have node; then
  node_v=$(node -v 2>/dev/null || echo "")
  echo "Node: $node_v"
  if semver_ge "${node_v#v}" "$node_req"; then
    good "Node >= $node_req"
  else
    warn "Node < $node_req — consider upgrading"
  fi
  # Package managers
  if have pnpm; then
    good "pnpm $(pnpm --version 2>/dev/null)"
  elif have npm; then
    note "npm $(npm --version 2>/dev/null)"
  elif have yarn; then
    note "yarn $(yarn --version 2>/dev/null)"
  else
    warn "No Node package manager (npm/pnpm/yarn) found"
  fi
else
  warn "Node.js not found — install Node >= $node_req"
fi

section "Python"
py_req="3.10.0"
if have python3; then
  py_ver=$(python3 -V 2>/dev/null | awk '{print $2}')
  echo "Python: $py_ver"
  if semver_ge "$py_ver" "$py_req"; then
    good "Python >= $py_req"
  else
    warn "Python < $py_req — consider upgrading"
  fi
  have pip3 && note "pip3 $(pip3 -V | awk '{print $2}')" || warn "pip3 not found"
  have poetry && note "poetry $(poetry --version 2>/dev/null)"
  have uv && note "uv $(uv --version 2>/dev/null)"
else
  warn "Python3 not found — install Python >= $py_req"
fi

section "Containers"
if have docker; then
  good "$(ver docker)"
  if docker info >/dev/null 2>&1; then
    good "Docker daemon reachable"
  else
    warn "Docker installed but daemon not reachable (is it running?)"
  fi
else
  note "Docker not found — only needed if using containers"
fi

if have docker compose; then
  note "Docker Compose v2 available"
elif have docker-compose; then
  note "docker-compose (v1) available"
fi

section "Optional Tooling"
have gh && note "GitHub CLI: $(ver gh)" || true
have jq && note "jq available" || true
have go && note "Go: $(ver go)" || true
have revive && note "revive linter present" || true
have node && have npx && note "npx available" || true
have eslint && note "eslint present" || true

section "Repo‑specific"
if [ -f ".codacy/cli.sh" ]; then
  note "Codacy CLI bootstrap found (.codacy/cli.sh)"
  have bash && good "Can run: bash .codacy/cli.sh --help"
else
  note "Codacy CLI scaffolding not present"
fi

echo
echo "Summary:"
echo "  Warnings: $warnings"
echo "  Failures: $failures"

if (( failures > 0 )); then
  echo
  echo "${err} Critical tools missing. See messages above."
  exit 1
fi

echo
echo "${ok} Environment looks OK for early development."
exit 0

