import sys
import json

def diff_dict(d1, d2, path=""):
    diffs = []
    keys = set(d1.keys()).union(set(d2.keys()))
    for k in sorted(keys):
        k_path = f"{path}.{k}" if path else k
        if k not in d1:
            diffs.append(f"\033[92m+ {k_path}: {json.dumps(d2[k])}\033[0m")
        elif k not in d2:
            diffs.append(f"\033[91m- {k_path}: {json.dumps(d1[k])}\033[0m")
        else:
            if isinstance(d1[k], dict) and isinstance(d2[k], dict):
                diffs.extend(diff_dict(d1[k], d2[k], k_path))
            elif d1[k] != d2[k]:
                diffs.append(f"\033[93m~ {k_path}: {json.dumps(d1[k])} => {json.dumps(d2[k])}\033[0m")
    return diffs

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python json_diff.py <file1.json> <file2.json>", file=sys.stderr)
        sys.exit(1)
    
    with open(sys.argv[1], "r") as f1, open(sys.argv[2], "r") as f2:
        d1 = json.load(f1)
        d2 = json.load(f2)
    
    diffs = diff_dict(d1, d2)
    if not diffs:
        print("No differences.")
        sys.exit(0)
    for d in diffs:
        print(d)
    sys.exit(2)
