# json-diff

Minimal CLI utility to perform structural diffing of two JSON files.

## Features
- Deep structural comparison (dictionary keys).
- Colored terminal output.
- No external dependencies (uses standard `json` library).
- Return codes: `0` for identical, `2` for differences found, `1` for errors.

## Usage
```bash
python json_diff.py <file1.json> <file2.json>
```

## Validation
```bash
python test_json_diff.py
```
