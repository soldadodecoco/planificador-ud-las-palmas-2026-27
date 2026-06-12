import collections
import sys
import xml.etree.ElementTree as ET

path = sys.argv[1]

interesting = {
    "1348890209": "first_name",
    "1349742177": "last_name",
    "1348693601": "common_or_full_name",
    "1348759394": "date_likely_birth",
    "1346584898": "int_likely_age_or_status",
    "1346587215": "int_likely_position_or_nation",
    "1348758643": "pos_gk_or_role",
    "1348756325": "pos_1",
    "1348760179": "pos_2",
    "1350001260": "pos_3",
    "1348758883": "pos_4",
    "1350001266": "pos_5",
    "1349348467": "pos_6",
    "1349346149": "pos_7",
    "1349350003": "pos_8",
    "1349018995": "height",
}

players = collections.defaultdict(dict)
seen_named = set()

for _, element in ET.iterparse(path, events=("end",)):
    if element.tag != "record":
        continue
    db = element.find('./large[@id="db_unique_id"]')
    prop = element.find('./unsigned[@id="property"]')
    if db is None or prop is None:
        element.clear()
        continue
    prop_value = prop.get("value") or ""
    if prop_value not in interesting:
        element.clear()
        continue

    new_value = next((child for child in element if child.get("id") == "new_value"), None)
    if new_value is None:
        element.clear()
        continue

    if new_value.tag in {"string", "integer", "large", "unsigned", "boolean"}:
        value = new_value.get("value")
    elif new_value.tag == "date":
        value = f"{new_value.get('day')}/{new_value.get('month')}/{new_value.get('year')}"
    elif new_value.tag == "record":
        value = "; ".join(f"{child.get('id')}={child.get('value')}" for child in list(new_value))
    elif new_value.tag == "null":
        value = None
    else:
        value = new_value.tag

    player_id = db.get("value") or ""
    players[player_id][interesting[prop_value]] = value
    if prop_value in {"1348890209", "1349742177", "1348693601"}:
        seen_named.add(player_id)
    element.clear()

for index, player_id in enumerate(list(seen_named)[:80], start=1):
    data = players[player_id]
    print(index, player_id, data)
