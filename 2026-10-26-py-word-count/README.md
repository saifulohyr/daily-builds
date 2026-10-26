# 2026-10-26 · py-word-count

Python `wc`-alike: count lines, words, characters, and bytes in files or stdin. Stdlib only.

## Usage

```bash
# stdin
echo "hello world" | python3 wordcount.py          # 2

# file
python3 wordcount.py file.txt                       # word count

# flags (composable)
python3 wordcount.py -l file.txt                    # lines
python3 wordcount.py -w file.txt                    # words (default)
python3 wordcount.py -m file.txt                    # characters (unicode-aware)
python3 wordcount.py -c file.txt                    # bytes
python3 wordcount.py -l -w -m -c file.txt           # all, tab-separated

# multiple files
python3 wordcount.py -l *.txt                       # lines per file
```

## API

```python
from wordcount import count_lines, count_words, count_chars, count_bytes, stats

stats("hello world\nfoo bar\n")
# {'lines': 2, 'words': 4, 'chars': 19, 'bytes': 19}

count_chars("héllo")   # 5  (unicode codepoints)
count_bytes("héllo")   # 6  (utf-8 bytes)
```

## Sample output

```
$ echo -e "one two three\nfour five" | python3 wordcount.py -l -w -m -c
2	5	20	20

$ python3 wordcount.py -l -w README.md
32	120	README.md
```

## Stack

- Python 3.11 · stdlib only (`argparse`, `sys`)
- No dependencies

## Tests

```bash
python3 -m pytest test_wordcount.py   # 18 assertions
bash test.sh                          # smoke test
```
