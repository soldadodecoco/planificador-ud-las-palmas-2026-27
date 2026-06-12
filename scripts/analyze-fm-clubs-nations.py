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
    if table is None or db is None or prop is None:
        element.clear()
        continue

    key = (table.get("value") or "", prop.get("value") or "")
    stat = stats[key]
    stat["count"] += 1

    if len(stat["examples"]) < 8:
        new_value = next((child for child in element if child.get("id") == "new_value"), None)
        odvl = element.find('./string[@id="odvl"]')
        stat["examples"].append(
            {
                "id": db.get("value"),
                "new": new_value.get("value") if new_value is not None else None,
                "odvl": odvl.get("value") if odvl is not None else None,
            }
        )

    element.clear()

for (table, prop), stat in sorted(stats.items(), key=lambda item: (item[0][0], -item[1]["count"])):
    print(f"table={table} property={prop} count={stat['count']} examples={stat['examples']}")
