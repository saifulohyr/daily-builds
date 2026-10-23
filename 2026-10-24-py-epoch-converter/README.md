# py-epoch-converter

Convert an ISO-8601 datetime string to a Unix epoch timestamp. No dependencies.

## Run

```bash
python3 epoch.py 2026-01-01T00:00:00
# 1767225600
```

Timezone-aware strings also work:

```bash
python3 epoch.py 2026-01-01T07:00:00+07:00
# 1767225600
```

## Test

```bash
python3 test.py
```
