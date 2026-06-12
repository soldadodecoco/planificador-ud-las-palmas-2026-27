import collections
import sys
import xml.etree.ElementTree as ET

path = sys.argv[1]
stats = collections.defaultdict(lambda: {"count": 0, "examples": []})

for _, element in ET.iterparse(path, events=("end",)):
    if element.tag != "record":
        continue
    table = element.find('./integer[@id="database_table_type"]')
    db = element.find('./large[@id="db_unique_id"]')
    prop = element.find('./unsigned[@id="property"]')
    new_value = next((child for child in element if child.get("id") == "new_value"), None)
    if table is None or db is None or prop is None or new_value is None or new_value.tag != "record":
        element.clear()
        continue

    refs = [(child.get("id"), child.get("value")) for child in new_value if child.get("id") and child.get("value")]
    if not refs:
        element.clear()
        continue

    key = prop.get("value") or ""
    stat = stats[key]
    stat["count"] += 1
    if len(stat["examples"]) < 15:
        stat["examples"].append({"player": db.get("value"), "refs": refs})
    element.clear()

for prop, stat in sorted(stats.items(), key=lambda item: -item[1]["count"]):
    print(f"property={prop} count={stat['count']} examples={stat['examples']}")
