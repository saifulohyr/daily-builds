"""LRU Cache — O(1) get/put via OrderedDict."""
from collections import OrderedDict


class LRUCache:
    def __init__(self, capacity: int):
        assert capacity > 0, "capacity must be positive"
        self.cap = capacity
        self._store: OrderedDict = OrderedDict()

    def get(self, key):
        if key not in self._store:
            return -1
        self._store.move_to_end(key)
        return self._store[key]

    def put(self, key, value) -> None:
        if key in self._store:
            self._store.move_to_end(key)
        self._store[key] = value
        if len(self._store) > self.cap:
            self._store.popitem(last=False)

    def __repr__(self):
        return f"LRUCache(cap={self.cap}, items={list(self._store.items())})"


if __name__ == "__main__":
    import sys
    cap = int(sys.argv[1]) if len(sys.argv) > 1 else 3
    c = LRUCache(cap)
    for i in range(cap + 2):
        c.put(i, i * 10)
    print(c)
