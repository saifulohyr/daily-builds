#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
    printf '%s\n' 'usage: $0 <url>' >&2
    exit 2
fi

RAW="$1"
if [[ ! "$RAW" =~ ^https?://[^/]+ ]]; then
    printf '%s\n' 'error: expected absolute http(s) URL' >&2
    exit 1
fi

python3 - "$RAW" <<'PYTHON'
import sys
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

u = urlparse(sys.argv[1])
keep = sorted((k, v) for k, v in parse_qsl(u.query)
              if not k.lower().startswith('utm_') and k not in ('fbclid', 'gclid'))
print(urlunparse(u._replace(fragment='', query=urlencode(keep))))
PYTHON
