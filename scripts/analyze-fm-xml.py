import collections
import sys
import xml.etree.ElementTree as ET

path = sys.argv[1]
limit = int(sys.argv[2]) if len(sys.argv) > 2 else 120

stats = collections.defaultdict(lambda: {"count": 0, "types": collections.Counter(), "examples": []})
records = 0

for _, element in ET.iterparse(path, events=("end",)):
    if element.tag != "record":
        continue

    db_unique_id = element.find('./large[@id="db_unique_id"]')
    property_node = element.find('./unsigned[@id="property"]')
    if db_unique_id is None or property_node is None:
        element.clear()
        continue

    prop = property_node.get("value") or ""
    stat = stats[prop]
    stat["count"] += 1
    records += 1

    new_value = next((child for child in element if child.get("id") == "new_value"), None)
    if new_value is not None:
        kind = new_value.tag
        stat["types"][kind] += 1
        if len(stat["examples"]) < 10:
            if kind in {"string", "integer", "large", "unsigned", "boolean"}:
                value = new_value.get("value")
            elif kind == "date":
                value = f"{new_value.get('day')}/{new_value.get('month')}/{new_value.get('year')}"
            elif kind == "record":
                value = "; ".join(f"{child.tag}:{child.get('id')}={child.get('value')}" for child in list(new_value)[:5])
            elif kind == "null":
                value = "NULL"
            else:
                value = ET.tostring(new_value, encoding="unicode")[:160]
            stat["examples"].append(value)

    element.clear()

print(f"records={records} properties={len(stats)}")
for prop, stat in sorted(stats.items(), key=lambda item: -item[1]["count"])[:limit]:
    print(prop, stat["count"], dict(stat["types"]), "EX", stat["examples"][:6])
