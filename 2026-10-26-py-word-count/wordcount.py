#!/usr/bin/env python3
"""wordcount — count lines, words, chars, bytes in text or files."""
import argparse
import sys


def count_lines(text: str) -> int:
    return len(text.splitlines())


def count_words(text: str) -> int:
    # ponytail: split() uses whitespace; upgrade to regex/unicodedata for complex locale tokenization
    return len(text.split())


def count_chars(text: str) -> int:
    return len(text)


def count_bytes(text: str, encoding: str = "utf-8") -> int:
    return len(text.encode(encoding, errors="replace"))


def stats(text: str) -> dict[str, int]:
    return {
        "lines": count_lines(text),
        "words": count_words(text),
        "chars": count_chars(text),
        "bytes": count_bytes(text),
    }


def format_counts(counts: dict[str, int], flags: argparse.Namespace) -> str:
    parts = []
    if flags.lines:
        parts.append(str(counts["lines"]))
    if flags.words or (not flags.lines and not flags.chars and not flags.bytes):
        parts.append(str(counts["words"]))
    if flags.chars:
        parts.append(str(counts["chars"]))
    if flags.bytes:
        parts.append(str(counts["bytes"]))
    return "\t".join(parts)


def main() -> None:
    parser = argparse.ArgumentParser(description="Count lines, words, chars, and bytes.")
    parser.add_argument("files", nargs="*", help="Files to read (defaults to stdin)")
    parser.add_argument("-l", "--lines", action="store_true", help="Print line count")
    parser.add_argument("-w", "--words", action="store_true", help="Print word count")
    parser.add_argument("-m", "--chars", action="store_true", help="Print character count")
    parser.add_argument("-c", "--bytes", action="store_true", help="Print byte count")
    args = parser.parse_args()

    if not args.files:
        content = sys.stdin.read()
        print(format_counts(stats(content), args))
        return

    for path in args.files:
        try:
            with open(path, "r", encoding="utf-8", errors="replace") as f:
                content = f.read()
            out = format_counts(stats(content), args)
            print(f"{out}\t{path}" if len(args.files) > 1 else out)
        except OSError as e:
            print(f"wordcount: {path}: {e}", file=sys.stderr)


if __name__ == "__main__":
    main()
