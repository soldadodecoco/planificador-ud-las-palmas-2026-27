import json
import shutil
import sys
from pathlib import Path


market_search = Path(sys.argv[1])
source_faces = Path(sys.argv[2])
target_faces = Path(sys.argv[3])

rows = json.loads(market_search.read_text(encoding="utf-8"))
target_faces.mkdir(parents=True, exist_ok=True)

copied = 0
missing = 0

for row in rows:
    photo = row[8] if len(row) > 8 else ""
    if not photo.startswith("/api/fm-face/"):
        continue

    face_id = photo.rsplit("/", 1)[-1]
    source = source_faces / f"{face_id}.png"
    target = target_faces / f"{face_id}.png"
    if not source.exists():
        missing += 1
        continue
    if target.exists():
        continue
    shutil.copy2(source, target)
    copied += 1

print(f"copied={copied}")
print(f"missing={missing}")
print(f"target={target_faces}")
