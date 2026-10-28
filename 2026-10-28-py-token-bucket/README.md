# py-token-bucket

Thread-safe token bucket rate limiter implementation in pure Python.

## Features

- Thread-safe token replenishment and acquisition via `threading.Lock`
- Configurable bucket capacity, fill rate (tokens/sec), and initial token count
- Non-blocking and blocking acquisition with optional timeout
- Function decorator `@bucket.limit()` with `RateLimitExceeded` exception
- Zero dependencies — Python standard library only (`time`, `threading`)

## Stack

- Python 3 (`threading`, `time`, `functools`, `typing`)
- Zero external runtime dependencies

## Usage

### Basic Usage

```python
from token_bucket import TokenBucket

# 5 tokens max capacity, refills at 1 token per second
limiter = TokenBucket(capacity=5.0, fill_rate=1.0)

if limiter.acquire():
    print("Request allowed")
else:
    print("Rate limit exceeded")
```

### Blocking Acquisition with Timeout

```python
# Wait up to 2 seconds for a token to become available
if limiter.acquire(tokens=1.0, blocking=True, timeout=2.0):
    print("Acquired after waiting")
else:
    print("Timed out waiting for token")
```

### Decorator Usage

```python
from token_bucket import TokenBucket, RateLimitExceeded

limiter = TokenBucket(capacity=2.0, fill_rate=0.5)

@limiter.limit(tokens=1.0)
def fetch_api_data():
    return {"status": "ok"}

try:
    data = fetch_api_data()
except RateLimitExceeded:
    print("Call dropped: rate limit hit")
```

## API Reference

### `TokenBucket(capacity, fill_rate, initial=None)`

- `capacity` (*float*): Maximum burst size / token storage limit. Must be > 0.
- `fill_rate` (*float*): Refill rate in tokens per second. Must be > 0.
- `initial` (*float, optional*): Starting tokens (defaults to `capacity`).

### Methods

- `acquire(tokens=1.0, blocking=False, timeout=None) -> bool`: Attempt to consume tokens. Returns `True` if successful, `False` otherwise.
- `consume(tokens=1.0) -> bool`: Convenience alias for `acquire(tokens, blocking=False)`.
- `limit(tokens=1.0, blocking=False)`: Decorator that protects a function call by acquiring tokens before execution, raising `RateLimitExceeded` on rejection.
- `available_tokens -> float`: Property returning current token count after dynamic refill.

## Sample Execution

```bash
$ python3 token_bucket.py
Self-check passed.
```

## Running Tests

```bash
$ python3 -m unittest -v test_token_bucket.py
test_acquire_and_consume (test_token_bucket.TestTokenBucket.test_acquire_and_consume) ... ok
test_acquire_invalid (test_token_bucket.TestTokenBucket.test_acquire_invalid) ... ok
test_blocking_acquire (test_token_bucket.TestTokenBucket.test_blocking_acquire) ... ok
test_decorator (test_token_bucket.TestTokenBucket.test_decorator) ... ok
test_init_validation (test_token_bucket.TestTokenBucket.test_init_validation) ... ok
test_refill_cap (test_token_bucket.TestTokenBucket.test_refill_cap) ... ok
test_thread_safety (test_token_bucket.TestTokenBucket.test_thread_safety) ... ok

----------------------------------------------------------------------
Ran 7 tests in 0.257s

OK
```
