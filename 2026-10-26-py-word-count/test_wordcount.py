#!/usr/bin/env python3
import sys
sys.path.insert(0, '.')
from wordcount import count_words

assert count_words("hello world") == 2, "basic 2 words"
assert count_words("  spaces   around  ") == 2, "extra spaces"
assert count_words("") == 0, "empty"
assert count_words("one") == 1, "single word"
assert count_words("a b c d e") == 5, "five words"
print("PASS")
