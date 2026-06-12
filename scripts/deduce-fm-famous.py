import html
import re
import sys
from collections import defaultdict
from pathlib import Path


PLAYER_XML = Path(sys.argv[1])
CLUBS_NATIONS_XML = Path(sys.argv[2])

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

TARGET_NAMES = [
    "Lionel Andrés Messi Cuccittini",
    "Lamine Yamal Nasraoui Ebana",
    "Kylian Mbappé Lottin",
    "Jude Victor William Bellingham",
    "Erling Braut Haaland",
    "Kevin De Bruyne",
    "Vinícius José Paixão de Oliveira Júnior",
]

RECORD_START = re.compile(r"<record(?:\s|>)")
RECORD_END = re.compile(r"</record>")
TABLE_RE = re.compile(r'<integer id="database_table_type" value="([^"]+)"')
ID_RE = re.compile(r'<large id="db_unique_id" value="([^"]+)"')
PROP_RE = re.compile(r'<unsigned id="property" value="([^"]+)"')
STR_NEW_RE = re.compile(r'<string id="new_value" value="([^"]*)"')
INT_NEW_RE = re.compile(r'<integer id="new_value" value="([^"]*)"')
DATE_NEW_RE = re.compile(r'<date id="new_value" day="([^"]+)" month="([^"]+)" year="([^"]+)"')
REF_RE = re.compile(r'<large id="Ttea" value="([^"]+)"')
ODVL_RE = re.compile(r'<string id="odvl" value="([^"]*)"')


def clean(value: str) -> str:
    return html.unescape(value)


def iter_change_blocks(path: Path):
    depth = 0
    collecting = False
    lines: list[str] = []

    with path.open("r", encoding="utf-8", errors="replace") as handle:
        for line in handle:
            starts = len(RECORD_START.findall(line))
            ends = len(RECORD_END.findall(line))

            if starts and depth == 1 and not collecting:
                collecting = True
                lines = []

            if collecting:
                lines.append(line)

            depth += starts - ends

            if collecting and depth == 1:
                yield "".join(lines)
                collecting = False


def parse_block(block: str):
    table = TABLE_RE.search(block)
    dbid = ID_RE.search(block)
    prop = PROP_RE.search(block)
    if not table or not dbid or not prop:
        return None

    value = None
    kind = ""
    if match := STR_NEW_RE.search(block):
        value = clean(match.group(1))
        kind = "string"
    elif match := INT_NEW_RE.search(block):
        value = match.group(1)
        kind = "integer"
    elif match := DATE_NEW_RE.search(block):
        value = f"{int(match.group(3)):04d}-{int(match.group(2)):02d}-{int(match.group(1)):02d}"
        kind = "date"
    elif refs := REF_RE.findall(block):
        value = refs
        kind = "refs"
    else:
        kind = "null" if "<null id=\"new_value\"" in block else "other"

    odvl = ODVL_RE.search(block)
    return {
        "table": table.group(1),
        "id": dbid.group(1),
        "prop": prop.group(1),
        "kind": kind,
        "value": value,
        "odvl": clean(odvl.group(1)) if odvl else "",
    }


def load_names(xml_path: Path):
    names = {}
    for item in iter_change_blocks(xml_path):
        parsed = parse_block(item)
        if not parsed:
            continue
        if parsed["table"] in {"3", "10"} and parsed["odvl"]:
            names[parsed["id"]] = parsed["odvl"]
    return names


def main():
    lookup = load_names(CLUBS_NATIONS_XML)
    famous_ids = {}
    by_player = defaultdict(list)

    for block in iter_change_blocks(PLAYER_XML):
        parsed = parse_block(block)
        if not parsed or parsed["table"] != "1":
            continue

        label = parsed["odvl"] or (parsed["value"] if isinstance(parsed["value"], str) else "")
        if label and any(token.lower() == label.lower() for token in TARGET_NAMES):
            famous_ids[parsed["id"]] = label

        by_player[parsed["id"]].append(parsed)

    print("FAMOUS IDS")
    for player_id, name in famous_ids.items():
        print(player_id, name)

    print("\nPLAYER BLOCKS")
    for player_id, name in famous_ids.items():
        print(f"\n## {name} [{player_id}]")
        for row in by_player[player_id]:
            value = row["value"]
            if row["kind"] == "refs":
                resolved = [lookup.get(ref, ref) for ref in value]
                value = " | ".join(resolved)
            print(f"{row['prop']:<12} {row['kind']:<7} {str(value):<45} odvl={row['odvl']}")


if __name__ == "__main__":
    main()
