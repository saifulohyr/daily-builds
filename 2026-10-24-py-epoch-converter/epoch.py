#!/usr/bin/env python3
"""epoch.py — convert ISO-8601 datetime to Unix epoch seconds (UTC), stdlib only."""
import sys
from datetime import datetime, timezone

if len(sys.argv) != 2:
    print("usage: epoch.py <YYYY-MM-DDTHH:MM:SS>  e.g. 2026-01-01T00:00:00", file=sys.stderr)
    sys.exit(1)

try:
    dt = datetime.fromisoformat(sys.argv[1])
except ValueError as e:
    print(f"invalid datetime: {e}", file=sys.stderr)
    sys.exit(1)

if dt.tzinfo is None:
    dt = dt.replace(tzinfo=timezone.utc)
else:
    dt = dt.astimezone(timezone.utc)

print(int(dt.timestamp()))
