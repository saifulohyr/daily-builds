#!/usr/bin/env python3
"""Self-contained assertions — run: python3 test.py"""
import subprocess, sys

def run(arg):
    r = subprocess.run(["python3", "epoch.py", arg], capture_output=True, text=True)
    return r.stdout.strip(), r.returncode

cases = [
    ("1970-01-01T00:00:01", "1"),
    ("2001-09-09T01:46:40", "1000000000"),
    ("2026-01-01T00:00:00", "1767225600"),
]

ok = True
for arg, expected in cases:
    got, code = run(arg)
    if got != expected or code != 0:
        print(f"FAIL {arg}: got {got!r}, expected {expected!r}")
        ok = False
    else:
        print(f"PASS {arg} -> {got}")

if not ok:
    sys.exit(1)
print("All tests passed.")
