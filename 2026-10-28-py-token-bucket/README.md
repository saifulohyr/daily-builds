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
$ python3 -m unittest test_token_bucket.py -v
test_blocking_acquire (test_token_bucket.TestTokenBucket.test_blocking_acquire) ... ok
test_blocking_timeout (test_token_bucket.TestTokenBucket.test_blocking_timeout) ... ok
test_decorator_blocking (test_token_bucket.TestTokenBucket.test_decorator_blocking) ... ok
test_decorator_non_blocking (test_token_bucket.TestTokenBucket.test_decorator_non_blocking) ... ok
test_initial_capacity (test_token_bucket.TestTokenBucket.test_initial_capacity) ... ok
test_invalid_inputs (test_token_bucket.TestTokenBucket.test_invalid_inputs) ... ok
test_refill (test_token_bucket.TestTokenBucket.test_refill) ... ok

----------------------------------------------------------------------
Ran 7 tests in 0.258s

OK
```
