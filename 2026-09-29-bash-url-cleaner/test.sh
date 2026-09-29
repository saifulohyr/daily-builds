#!/usr/bin/env bash
set -euo pipefail

SCRIPT="$(dirname "$0")/clean.sh"
chmod +x "$SCRIPT"

GOT=$("$SCRIPT" "https://example.com/path?utm_source=newsletter&b=two&a=one&fbclid=x#section")
WANT="https://example.com/path?a=one&b=two"

if [[ "$GOT" != "$WANT" ]]; then
    printf "%s
" "FAIL: got $GOT, want $WANT" >&2
    exit 1
fi

if "$SCRIPT" "/docs?x=1" 2>/dev/null; then
    printf "%s
" "FAIL: expected relative URL to be rejected" >&2
    exit 1
fi

printf "%s
" "PASS"
