#!/usr/bin/env python3
"""Check that every painting tag in public/data/paintings.json has a matching image file
in public/painting_images/700/. Run from the syh-react project root:
    python3 scripts/check_images.py
"""

import json
import os

DATA_FILE = "public/data/paintings.json"
IMAGE_DIR = "public/painting_images/700"

paintings = json.load(open(DATA_FILE))
files = set(os.listdir(IMAGE_DIR))

resolved = []
unresolved = []
for p in paintings:
    tag = p["tag"]
    if f"{tag}.jpg" in files:
        resolved.append(tag)
    else:
        unresolved.append(tag)

print(f"Resolved: {len(resolved)}")
print(f"Unresolved: {len(unresolved)}")
if unresolved:
    print("Unresolved tags:")
    for tag in unresolved:
        print(f"  {tag}")
