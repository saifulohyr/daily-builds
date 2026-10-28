import threading
import time
import unittest
from token_bucket import TokenBucket, RateLimitExceeded


class TestTokenBucket(unittest.TestCase):
    def test_init_validation(self):
        with self.assertRaises(ValueError):
            TokenBucket(capacity=0, fill_rate=1)
        with self.assertRaises(ValueError):
            TokenBucket(capacity=5, fill_rate=-1)

        b = TokenBucket(capacity=10, fill_rate=2, initial=5)
        self.assertAlmostEqual(b.available_tokens, 5.0, delta=0.1)

        b2 = TokenBucket(capacity=5, fill_rate=1, initial=10)
        self.assertAlmostEqual(b2.available_tokens, 5.0, delta=0.1)

    def test_acquire_and_consume(self):
        b = TokenBucket(capacity=3, fill_rate=10)
        self.assertTrue(b.acquire(1))
        self.assertTrue(b.consume(1))
        self.assertTrue(b.acquire(1))
        self.assertFalse(b.consume(1))

    def test_acquire_invalid(self):
        b = TokenBucket(capacity=5, fill_rate=1)
        with self.assertRaises(ValueError):
            b.acquire(0)
        with self.assertRaises(ValueError):
            b.acquire(-2)
        self.assertFalse(b.acquire(10))

    def test_refill_cap(self):
        b = TokenBucket(capacity=2, fill_rate=20, initial=0)
        self.assertAlmostEqual(b.available_tokens, 0.0, delta=0.1)
        time.sleep(0.15)  # 20 * 0.15 = 3, capped at 2
        self.assertAlmostEqual(b.available_tokens, 2.0, delta=0.1)

    def test_blocking_acquire(self):
        b = TokenBucket(capacity=1, fill_rate=10, initial=0)
        # Should block and succeed within ~0.1s
        t0 = time.monotonic()
        self.assertTrue(b.acquire(1, blocking=True, timeout=0.5))
        self.assertGreaterEqual(time.monotonic() - t0, 0.08)

        # Timeout scenario
        self.assertFalse(b.acquire(1, blocking=True, timeout=0.02))

    def test_decorator(self):
        b = TokenBucket(capacity=1, fill_rate=1, initial=1)

        @b.limit(tokens=1)
        def work():
            return "done"

        self.assertEqual(work(), "done")
        with self.assertRaises(RateLimitExceeded):
            work()

    def test_thread_safety(self):
        total_tokens = 50
        b = TokenBucket(capacity=total_tokens, fill_rate=1, initial=total_tokens)
        successful = []

        def worker():
            if b.acquire(1, blocking=False):
                successful.append(1)

        threads = [threading.Thread(target=worker) for _ in range(100)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        self.assertEqual(len(successful), total_tokens)
        self.assertAlmostEqual(b.available_tokens, 0.0, delta=0.5)


if __name__ == "__main__":
    unittest.main()
