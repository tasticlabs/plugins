#!/usr/bin/env python3
"""Sets the mutastic plugin's version in its Claude Code and Codex manifests, which must agree:

    python3 scripts/bump.py 0.4.0

Only the version changes: the rest of each file is kept byte for byte (json.dump would rewrap
its one-line arrays), and each edit is parsed again to check that nothing else did. Neither file
is written unless both can be.
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFESTS = [
    "plugins/mutastic/.claude-plugin/plugin.json",
    "plugins/mutastic/.codex-plugin/plugin.json",
]
VERSION = re.compile(r"\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?")


def main(args):
    if len(args) != 1 or not VERSION.fullmatch(args[0]):
        print("usage: bump.py <version>, such as 0.4.0", file=sys.stderr)
        return 2
    version = args[0]
    edits = []
    for name in MANIFESTS:
        path = ROOT / name
        text = path.read_bytes().decode("utf-8")
        before = json.loads(text)
        old = before.get("version")
        if not isinstance(old, str):
            print(f"bump.py: {name} has no version", file=sys.stderr)
            return 1
        key = re.compile(r'("version"\s*:\s*)' + re.escape(json.dumps(old)))
        edited, count = key.subn(lambda m: m.group(1) + json.dumps(version), text)
        if count != 1 or json.loads(edited) != {**before, "version": version}:
            print(f"bump.py: can't change only the version in {name}", file=sys.stderr)
            return 1
        edits.append((path, name, old, edited))
    for path, name, old, edited in edits:
        path.write_bytes(edited.encode("utf-8"))
        print(f"{name}: {old} -> {version}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
