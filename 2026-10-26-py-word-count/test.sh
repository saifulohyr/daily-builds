#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
output=$(printf 'hello world' | "$DIR/wordcount.py")
if [[ "$output" == "2" ]]; then
  echo PASS
else
  echo "FAIL: got '$output'"
  exit 1
fi
python3 "$DIR/test_wordcount.py"
