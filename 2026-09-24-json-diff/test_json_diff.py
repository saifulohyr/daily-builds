import os
import sys
from pathlib import Path

# Create dummy files
d1_path = "test1.json"
d2_path = "test2.json"

Path(d1_path).write_text('{"name": "Alice", "age": 30, "address": {"city": "New York", "zip": "10001"}}')
Path(d2_path).write_text('{"name": "Alice", "age": 31, "address": {"city": "New York", "zip": "10002"}, "active": true}')

# Run diff command directly as script execution
import subprocess
result = subprocess.run([sys.executable, "json_diff.py", d1_path, d2_path], capture_output=True, text=True)

print("Output:")
print(result.stdout)
assert "+ active: true" in result.stdout
assert "~ age: 30 => 31" in result.stdout
assert "~ address.zip: \"10001\" => \"10002\"" in result.stdout
assert result.returncode == 2

Path(d1_path).unlink()
Path(d2_path).unlink()
print("Tests pass.")
