#!/usr/bin/env python3
"""Unit tests for wordcount module."""
import sys, os, unittest, argparse
sys.path.insert(0, os.path.dirname(__file__))
from wordcount import count_lines, count_words, count_chars, count_bytes, stats, format_counts


class TestCountLines(unittest.TestCase):
    def test_empty(self):
        self.assertEqual(count_lines(""), 0)

    def test_single_line(self):
        self.assertEqual(count_lines("hello"), 1)

    def test_multi_lines(self):
        self.assertEqual(count_lines("a\nb\nc"), 3)

    def test_trailing_newline(self):
        self.assertEqual(count_lines("a\nb\n"), 2)

    def test_blank_lines(self):
        self.assertEqual(count_lines("\n\n\n"), 3)


class TestCountWords(unittest.TestCase):
    def test_empty(self):
        self.assertEqual(count_words(""), 0)

    def test_whitespace_only(self):
        self.assertEqual(count_words("   \t\n  "), 0)

    def test_basic(self):
        self.assertEqual(count_words("hello world"), 2)

    def test_extra_spaces(self):
        self.assertEqual(count_words("  spaces   around  "), 2)

    def test_single(self):
        self.assertEqual(count_words("one"), 1)

    def test_tabs_newlines(self):
        self.assertEqual(count_words("a\tb\nc"), 3)


class TestCountChars(unittest.TestCase):
    def test_empty(self):
        self.assertEqual(count_chars(""), 0)

    def test_ascii(self):
        self.assertEqual(count_chars("abc"), 3)

    def test_unicode(self):
        self.assertEqual(count_chars("héllo"), 5)

    def test_emoji(self):
        self.assertEqual(count_chars("👍"), 1)


class TestCountBytes(unittest.TestCase):
    def test_ascii(self):
        self.assertEqual(count_bytes("abc"), 3)

    def test_utf8_multibyte(self):
        self.assertEqual(count_bytes("é"), 2)

    def test_emoji_bytes(self):
        self.assertEqual(count_bytes("👍"), 4)

    def test_empty(self):
        self.assertEqual(count_bytes(""), 0)


class TestStats(unittest.TestCase):
    def test_full(self):
        text = "hello world\nfoo bar baz\n"
        s = stats(text)
        self.assertEqual(s["lines"], 2)
        self.assertEqual(s["words"], 5)
        self.assertEqual(s["chars"], 24)
        self.assertEqual(s["bytes"], 24)

    def test_empty(self):
        s = stats("")
        self.assertEqual(s, {"lines": 0, "words": 0, "chars": 0, "bytes": 0})


class TestFormatCounts(unittest.TestCase):
    def _ns(self, lines=False, words=False, chars=False, bytes_=False):
        return argparse.Namespace(lines=lines, words=words, chars=chars, bytes=bytes_)

    def test_default_words_only(self):
        c = {"lines": 2, "words": 5, "chars": 24, "bytes": 24}
        self.assertEqual(format_counts(c, self._ns()), "5")

    def test_lines_flag(self):
        c = {"lines": 2, "words": 5, "chars": 24, "bytes": 24}
        self.assertEqual(format_counts(c, self._ns(lines=True)), "2")

    def test_all_flags(self):
        c = {"lines": 2, "words": 5, "chars": 24, "bytes": 24}
        result = format_counts(c, self._ns(lines=True, words=True, chars=True, bytes_=True))
        self.assertEqual(result, "2\t5\t24\t24")

    def test_chars_bytes(self):
        c = {"lines": 1, "words": 1, "chars": 5, "bytes": 7}
        result = format_counts(c, self._ns(chars=True, bytes_=True))
        self.assertEqual(result, "5\t7")


if __name__ == "__main__":
    unittest.main()
