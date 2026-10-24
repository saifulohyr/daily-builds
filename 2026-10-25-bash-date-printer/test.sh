#!/usr/bin/env bash
cd "$(dirname "$0")"
output=$(./date.sh)
if [[ $output =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
  echo "PASS"
else
  echo "FAIL: $output"
  exit 1
fi
