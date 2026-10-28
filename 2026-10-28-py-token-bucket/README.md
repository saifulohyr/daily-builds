# py-token-bucket

Thread-safe token bucket rate limiter implementation in pure Python.

## Stack

- Python 3 (standard library: `time`, `threading`)
- Zero external dependencies

## Usage

```python
from token_bucket import TokenBucket

limiter = TokenBucket(capacity=10, fill_rate=1.0)
if limiter.acquire():
    print("allowed")
```

## Status

Scaffolded — implementation TODO.
