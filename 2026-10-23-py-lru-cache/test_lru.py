import unittest
from lru_cache import LRUCache

class TestLRUCache(unittest.TestCase):
    def test_basic(self):
        c = LRUCache(2)
        c.put(1, 1)
        c.put(2, 2)
        self.assertEqual(c.get(1), 1)
        c.put(3, 3)  # evicts key 2
        self.assertEqual(c.get(2), -1)
        c.put(4, 4)  # evicts key 1
        self.assertEqual(c.get(1), -1)
        self.assertEqual(c.get(3), 3)
        self.assertEqual(c.get(4), 4)

if __name__ == '__main__':
    unittest.main()
