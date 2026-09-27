from __future__ import annotations

import time
from typing import Callable, TypeVar

T = TypeVar("T")


class RetryError(RuntimeError):
    """All retry attempts failed."""


def retry(action: Callable[[], T], attempts: int, delay: float = 0.0) -> T:
    """Run `action` until it succeeds or attempts are exhausted."""
    if attempts < 1:
        raise ValueError("attempts must be at least 1")
    if delay < 0:
        raise ValueError("delay must be non-negative")

    last_error: Exception | None = None
    for i in range(attempts):
        try:
            return action()
        except Exception as exc:
            last_error = exc
            if i < attempts - 1 and delay:
                time.sleep(delay)

    raise RetryError(f"failed after {attempts} attempt(s)") from last_error
