# py-bloom-filter

Space-efficient probabilistic Bloom filter implementation in pure Python.

## Stack

- Python 3 (standard library: `hashlib`, `math`)
- Zero external dependencies

## Usage

```python
from bloom_filter import BloomFilter

# Create filter for expected 10,000 items with 1% false positive rate
bf = BloomFilter(expected_items=10000, false_positive_rate=0.01)
bf.add("alice")
print("alice" in bf)  # True
print("bob" in bf)    # False
```

## Status

Scaffolded — implementation TODO.
