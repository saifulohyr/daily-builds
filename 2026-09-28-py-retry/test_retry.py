import unittest

from retry import RetryError, retry


class RetryTest(unittest.TestCase):
    def test_succeeds_after_failures(self):
        calls = 0

        def action():
            nonlocal calls
            calls += 1
            if calls < 3:
                raise OSError("temporary")
            return "ok"

        self.assertEqual(retry(action, 3), "ok")
        self.assertEqual(calls, 3)

    def test_exhaustion(self):
        with self.assertRaises(RetryError) as ctx:
            retry(lambda: (_ for _ in ()).throw(ValueError("no")), 2)
        self.assertIsInstance(ctx.exception.__cause__, ValueError)

    def test_invalid_attempts(self):
        with self.assertRaises(ValueError):
            retry(lambda: None, 0)


if __name__ == "__main__":
    unittest.main()
