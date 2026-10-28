"""Thread-safe token bucket rate limiter."""

import threading
import time
from functools import wraps
from typing import Callable, Optional, TypeVar, Any

F = TypeVar("F", bound=Callable[..., Any])


class RateLimitExceeded(Exception):
    """Raised when rate limit is exceeded."""
    pass


class TokenBucket:
    """Thread-safe token bucket rate limiter.

    ponytail: in-memory local state only; upgrade to Redis/shared store for distributed limits.
    """

    def __init__(self, capacity: float, fill_rate: float, initial: Optional[float] = None) -> None:
        if capacity <= 0:
            raise ValueError("capacity must be positive")
        if fill_rate <= 0:
            raise ValueError("fill_rate must be positive")

        self.capacity = float(capacity)
        self.fill_rate = float(fill_rate)
        self.tokens = float(capacity if initial is None else min(initial, capacity))
        self.last_update = time.monotonic()
        self._lock = threading.Lock()

    def _refill(self, now: float) -> None:
        elapsed = now - self.last_update
        if elapsed > 0:
            self.tokens = min(self.capacity, self.tokens + elapsed * self.fill_rate)
            self.last_update = now

    def acquire(self, tokens: float = 1.0, blocking: bool = False, timeout: Optional[float] = None) -> bool:
        """Acquire tokens from bucket. Returns True if acquired, False otherwise."""
        if tokens <= 0:
            raise ValueError("tokens must be positive")
        if tokens > self.capacity:
            return False

        start_wait = time.monotonic()
        while True:
            with self._lock:
                now = time.monotonic()
                self._refill(now)
                if self.tokens >= tokens:
                    self.tokens -= tokens
                    return True

                if not blocking:
                    return False

                needed = tokens - self.tokens
                wait_time = needed / self.fill_rate

            if timeout is not None:
                elapsed = time.monotonic() - start_wait
                if elapsed + wait_time > timeout:
                    return False
                wait_time = min(wait_time, timeout - elapsed)
                if wait_time <= 0:
                    return False

            time.sleep(wait_time)

    def consume(self, tokens: float = 1.0) -> bool:
        """Convenience alias for acquire(tokens, blocking=False)."""
        return self.acquire(tokens=tokens, blocking=False)

    @property
    def available_tokens(self) -> float:
        """Current number of available tokens after refill."""
        with self._lock:
            self._refill(time.monotonic())
            return self.tokens

    def limit(self, tokens: float = 1.0, blocking: bool = False):
        """Decorator to rate limit function execution."""
        def decorator(func: F) -> F:
            @wraps(func)
            def wrapper(*args, **kwargs):
                if not self.acquire(tokens=tokens, blocking=blocking):
                    raise RateLimitExceeded(f"Rate limit exceeded for {func.__name__}")
                return func(*args, **kwargs)
            return wrapper  # type: ignore
        return decorator


if __name__ == "__main__":
    # Self-check verification
    bucket = TokenBucket(capacity=2.0, fill_rate=10.0)
    assert bucket.acquire(1.0) is True
    assert bucket.acquire(1.0) is True
    assert bucket.acquire(1.0) is False  # empty
    time.sleep(0.15)  # fills ~1.5 tokens
    assert bucket.acquire(1.0) is True
    print("Self-check passed.")
