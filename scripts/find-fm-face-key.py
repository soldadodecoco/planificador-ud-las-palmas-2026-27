import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

player_xml = Path(sys.argv[1])
faces_dir = Path(sys.argv[2])

face_ids = {path.stem for path in faces_dir.glob("*.png")}
prop_re = re.compile(r'<unsigned id="property" value="([^"]+)"')
db_re = re.compile(r'<large id="db_unique_id" value="([^"]+)"')
num_re = re.compile(r'id="(?:new_value|Ttea|db_random_id)" value="([^"]+)"')
record_start = re.compile(r"<record(?:\s|>)")
record_end = re.compile(r"</record>")


def iter_blocks(path: Path):
    depth = 0
    collecting = False
    lines = []
    with path.open("r", encoding="utf-8", errors="replace") as handle:
        for line in handle:
            starts = len(record_start.findall(line))
            ends = len(record_end.findall(line))
            if starts and depth == 1 and not collecting:
                collecting = True
                lines = []
            if collecting:
                lines.append(line)
            depth += starts - ends
            if collecting and depth == 1:
                yield "".join(lines)
                collecting = False


matches = Counter()
examples = defaultdict(list)
db_matches = 0

for block in iter_blocks(player_xml):
    db = db_re.search(block)
    if db and db.group(1) in face_ids:
        db_matches += 1

    prop = prop_re.search(block)
    if not prop:
        continue

    for value in num_re.findall(block):
        if not value.isdigit():
            continue
        if int(value) < 100000:
            continue
        if value in face_ids:
            key = prop.group(1)
            matches[key] += 1
            if len(examples[key]) < 5:
                examples[key].append(value)

print("db_unique_id matches", db_matches)
for prop, count in matches.most_common(20):
    print(prop, count, examples[prop])
