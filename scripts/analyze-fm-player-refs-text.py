import collections
import re
import sys

path = sys.argv[1]
stats = collections.defaultdict(lambda: {"count": 0, "examples": []})

current = []
depth = 0

record_start = re.compile(r"<record>")
record_end = re.compile(r"</record>")
db_re = re.compile(r'<large id="db_unique_id" value="([^"]+)"')
prop_re = re.compile(r'<unsigned id="property" value="([^"]+)"')
ttea_re = re.compile(r'<large id="Ttea" value="([^"]+)"')

with open(path, "r", encoding="utf-8", errors="replace") as file:
    for line in file:
        starts = len(record_start.findall(line))
        ends = len(record_end.findall(line))

        if starts and depth == 0:
            current = []

        if depth > 0 or starts:
            current.append(line)

        depth += starts - ends

        if depth == 0 and current:
            block = "".join(current)
            if "Ttea" in block and "db_unique_id" in block and "property" in block:
                db = db_re.search(block)
                prop = prop_re.search(block)
                refs = ttea_re.findall(block)
                if db and prop and refs:
                    key = prop.group(1)
                    stat = stats[key]
                    stat["count"] += 1
                    if len(stat["examples"]) < 15:
                        stat["examples"].append({"player": db.group(1), "refs": refs})
            current = []

for prop, stat in sorted(stats.items(), key=lambda item: -item[1]["count"]):
    print(f"property={prop} count={stat['count']} examples={stat['examples']}")
