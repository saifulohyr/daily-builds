#!/usr/bin/env python3
import sys

def count_words(text: str) -> int:
    return len(text.split())

def main():
    content = sys.stdin.read()
    print(count_words(content))

if __name__ == "__main__":
    main()
