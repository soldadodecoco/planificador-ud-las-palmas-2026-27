import json
import re
import shutil
import sys
import unicodedata
from datetime import date
from pathlib import Path


PLAYER_XML = Path(sys.argv[1])
CLUBS_NATIONS_XML = Path(sys.argv[2])
FACES_DIR = Path(sys.argv[3])
OUT_DIR = Path(sys.argv[4])
CLUB_NAME_CHANGES_XML = Path(sys.argv[5]) if len(sys.argv) > 5 else None

TODAY = date(2026, 6, 12)

PLAYER_FIELDS = {
    "1348889710": "fullNameFromOdlv",
    "1348890209": "firstName",
    "1349742177": "lastName",
    "1348693601": "commonName",
    "1348759394": "birthDate",
    "1348691320": "contractEnd",
    "1349018995": "internalRating",
    "1346584898": "currentAbility",
    "1347371073": "potentialAbility",
    "1348758643": "pos0",
    "1348756325": "pos1",
    "1348760179": "pos2",
    "1350001260": "pos3",
    "1348758883": "pos4",
    "1350001266": "pos5",
    "1349348467": "pos6",
    "1349346149": "pos7",
    "1349350003": "pos8",
}

POSITION_PROPS = ["pos0", "pos1", "pos2", "pos3", "pos4", "pos5", "pos6", "pos7", "pos8"]

DB_RECORD_RE = re.compile(r"<record(?:\s|>)")
DB_RECORD_END_RE = re.compile(r"</record>")
TABLE_RE = re.compile(r'<integer id="database_table_type" value="([^"]+)"')
DB_ID_RE = re.compile(r'<large id="db_unique_id" value="([^"]+)"')
PROP_RE = re.compile(r'<unsigned id="property" value="([^"]+)"')
STRING_NEW_RE = re.compile(r'<string id="new_value" value="([^"]*)"')
INTEGER_NEW_RE = re.compile(r'<integer id="new_value" value="(-?\d+)"')
INTEGER_OLD_RE = re.compile(r'<integer id="odvl" value="(-?\d+)"')
BOOLEAN_NEW_RE = re.compile(r'<boolean id="new_value" value="([01])"')
DATE_NEW_RE = re.compile(r'<date id="new_value" day="([^"]+)" month="([^"]+)" year="([^"]+)"')
TTEA_RE = re.compile(r'<large id="Ttea" value="([^"]+)"')
ODVL_RE = re.compile(r'<string id="odvl" value="([^"]*)"')


def html_unescape(value: str) -> str:
    cleaned = (
        value.replace("&amp;", "&")
        .replace("&quot;", '"')
        .replace("&apos;", "'")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
    )
    if "Ã" in cleaned or "Â" in cleaned:
        try:
            return cleaned.encode("latin1").decode("utf-8")
        except UnicodeError:
            return cleaned
    return cleaned


def normalize_search(value: str) -> str:
    decomposed = unicodedata.normalize("NFD", value or "")
    ascii_value = "".join(char for char in decomposed if unicodedata.category(char) != "Mn")
    cleaned = re.sub(r"[^a-zA-Z0-9\s]", " ", ascii_value).lower()
    return re.sub(r"\s+", " ", cleaned).strip()


def is_las_palmas_club(value: str) -> bool:
    normalized = normalize_search(value)
    return normalized in {
        "las palmas",
        "las palmas atletico",
        "las palmas c",
        "u d las palmas",
        "u d las palmas atletico",
        "u d las palmas c",
    }


def iter_change_blocks(path: Path):
    depth = 0
    collecting = False
    lines: list[str] = []

    with path.open("r", encoding="utf-8", errors="replace") as handle:
        for line in handle:
            starts = len(DB_RECORD_RE.findall(line))
            ends = len(DB_RECORD_END_RE.findall(line))

            if starts and depth == 1 and not collecting:
                collecting = True
                lines = []

            if collecting:
                lines.append(line)

            depth += starts - ends

            if collecting and depth == 1:
                yield "".join(lines)
                collecting = False
                lines = []


def parse_date(day: str, month: str, year: str) -> str:
    return f"{int(year):04d}-{int(month):02d}-{int(day):02d}"


def age_from_birthdate(value: str | None) -> int | None:
    if not value:
        return None
    year, month, day = map(int, value.split("-"))
    age = TODAY.year - year - ((TODAY.month, TODAY.day) < (month, day))
    return age


def face_id_from_db_id(player_id: str) -> str:
    try:
        numeric_id = int(player_id)
    except ValueError:
        return ""
    high = numeric_id >> 32
    low = numeric_id & 0xFFFFFFFF
    if high == low:
        return str(high)
    if high == 0:
        return str(low)
    return ""


def load_lookup(xml_path: Path):
    clubs: dict[str, str] = {}
    nations: dict[str, str] = {}

    for block in iter_change_blocks(xml_path):
        table = TABLE_RE.search(block)
        db_id = DB_ID_RE.search(block)
        odvl = ODVL_RE.search(block)
        if not table or not db_id or not odvl:
            continue

        table_id = table.group(1)
        target = clubs if table_id == "3" else nations if table_id == "10" else None
        if target is not None:
            target[db_id.group(1)] = html_unescape(odvl.group(1))

    return clubs, nations


def apply_club_name_changes(clubs: dict[str, str], xml_path: Path | None):
    if not xml_path or not xml_path.exists():
        return

    for block in iter_change_blocks(xml_path):
        table = TABLE_RE.search(block)
        db_id = DB_ID_RE.search(block)
        prop = PROP_RE.search(block)
        new_value = STRING_NEW_RE.search(block)
        if not table or table.group(1) != "3" or not db_id or not prop or prop.group(1) != "1131307373" or not new_value:
            continue
        clubs[db_id.group(1)] = html_unescape(new_value.group(1))


def player_position(values: dict[str, str]) -> str:
    scores = {key: int(values.get(key, "1") or 1) for key in POSITION_PROPS}
    if scores.get("pos0", 1) >= 15:
        return "Portero"
    if max(scores.get("pos1", 1), scores.get("pos2", 1), scores.get("pos3", 1), scores.get("pos4", 1)) >= 15:
        return "Defensa"
    if max(scores.get("pos5", 1), scores.get("pos6", 1)) >= 15:
        return "Centrocampista"
    if max(scores.get("pos7", 1), scores.get("pos8", 1)) >= 15:
        return "Atacante"
    return ""


def load_players(xml_path: Path, club_ids: set[str], nation_ids: set[str]):
    players: dict[str, dict] = {}
    ref_stats: dict[str, dict[str, int]] = {}

    for block in iter_change_blocks(xml_path):
        db_id_match = DB_ID_RE.search(block)
        prop_match = PROP_RE.search(block)
        if not db_id_match or not prop_match:
            continue

        player_id = db_id_match.group(1)
        prop = prop_match.group(1)
        player = players.setdefault(player_id, {"id": player_id, "refs": {}})

        field = PLAYER_FIELDS.get(prop)
        if field:
            string_value = STRING_NEW_RE.search(block)
            integer_value = INTEGER_NEW_RE.search(block)
            integer_old_value = INTEGER_OLD_RE.search(block)
            boolean_value = BOOLEAN_NEW_RE.search(block)
            date_value = DATE_NEW_RE.search(block)
            odvl_value = ODVL_RE.search(block)

            if string_value:
                player[field] = html_unescape(string_value.group(1))
            elif integer_value:
                val = int(integer_value.group(1))
                if val == 0 and integer_old_value:
                    val = int(integer_old_value.group(1))
                player[field] = val
            elif integer_old_value and not integer_value:
                player[field] = int(integer_old_value.group(1))
            elif boolean_value:
                player[field] = bool(int(boolean_value.group(1)))
            elif date_value:
                player[field] = parse_date(date_value.group(1), date_value.group(2), date_value.group(3))
            elif odvl_value:
                player[field] = html_unescape(odvl_value.group(1))

            if field == "fullNameFromOdlv" and odvl_value:
                player[field] = html_unescape(odvl_value.group(1))

        refs = TTEA_RE.findall(block)
        if refs:
            player["refs"].setdefault(prop, []).extend(refs)
            stat = ref_stats.setdefault(prop, {"club": 0, "nation": 0, "other": 0})
            for ref in refs:
                if ref in club_ids:
                    stat["club"] += 1
                elif ref in nation_ids:
                    stat["nation"] += 1
                else:
                    stat["other"] += 1

    return players, ref_stats


def choose_ref(refs: dict[str, list[str]], prop_candidates: list[str], lookup: dict[str, str]):
    for prop in prop_candidates:
        for ref in refs.get(prop, []):
            if ref in lookup:
                return ref, lookup[ref]
    return None, ""


def main():
    clubs, nations = load_lookup(CLUBS_NATIONS_XML)
    apply_club_name_changes(clubs, CLUB_NAME_CHANGES_XML)
    players, ref_stats = load_players(PLAYER_XML, set(clubs), set(nations))

    club_props = [
        prop for prop, stat in sorted(ref_stats.items(), key=lambda item: -item[1]["club"]) if stat["club"] > 0
    ]
    nation_props = [
        prop for prop, stat in sorted(ref_stats.items(), key=lambda item: -item[1]["nation"]) if stat["nation"] > 0
    ]

    rows = []
    for player in players.values():
        first = player.get("firstName", "")
        last = player.get("lastName", "")
        common = player.get("commonName", "")
        full_name = player.get("fullNameFromOdlv") or " ".join(part for part in [first, last] if part).strip()
        display_name = common or full_name
        if not display_name or not player.get("birthDate"):
            continue
        birth_date = player.get("birthDate")
        if player.get("fullNameFromOdlv") and birth_date == "2000-01-01":
            birth_date = ""

        club_id, club_name = choose_ref(player.get("refs", {}), club_props, clubs)
        nation_id, nation_name = choose_ref(player.get("refs", {}), nation_props, nations)
        face_id = face_id_from_db_id(player["id"])
        photo_file = FACES_DIR / f"{face_id}.png" if face_id else None

        photo_id = f"{face_id}.png" if photo_file and photo_file.exists() else ""
        photo_url = ""
        rating = player.get("internalRating") or player.get("currentAbility") or player.get("potentialAbility") or 0
        
        if photo_id:
            if 100 <= rating <= 200:
                target_faces_dir = OUT_DIR.parent / "faces"
                target_faces_dir.mkdir(parents=True, exist_ok=True)
                target_path = target_faces_dir / photo_id
                if not target_path.exists():
                    import shutil
                    shutil.copy(photo_file, target_path)
            photo_url = f"/api/fm-face/{face_id}"

        rows.append(
            {
                "id": player["id"],
                "displayName": display_name,
                "fullName": full_name or display_name,
                "commonName": common,
                "age": age_from_birthdate(birth_date),
                "birthDate": birth_date,
                "position": player_position(player),
                "clubId": club_id or "",
                "club": club_name,
                "nationId": nation_id or "",
                "nation": nation_name,
                "contractEnd": player.get("contractEnd", ""),
                "photoId": photo_id,
                "photo": photo_url,
                "_sortRating": player.get("internalRating"),
            }
        )

    def sort_key(row):
        rating = row["_sortRating"] or 0
        rating_priority = 0 if 100 <= rating <= 150 else 1
        return (rating_priority, -rating, row["displayName"])

    rows.sort(key=sort_key)
    for row in rows:
        row.pop("_sortRating", None)

    search_rows = []
    for row in rows:
        if is_las_palmas_club(row["club"]):
            continue
        search_text = normalize_search(" ".join([row["displayName"], row["fullName"], row["commonName"], row["club"]]))
        search_rows.append(
            [
                row["id"],
                row["displayName"],
                row["fullName"],
                row["commonName"],
                row["age"],
                row["position"],
                row["club"],
                row["contractEnd"],
                row["photo"],
                search_text,
                search_text.replace(" ", ""),
            ]
        )

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "marketPlayers.json").write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (OUT_DIR / "marketSearch.json").write_text(json.dumps(search_rows, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    (OUT_DIR / "marketMeta.json").write_text(
        json.dumps(
            {
                "players": len(rows),
                "clubs": len(clubs),
                "nations": len(nations),
                "clubPropertyCandidates": [(prop, ref_stats[prop]["club"]) for prop in club_props[:20]],
                "nationPropertyCandidates": [(prop, ref_stats[prop]["nation"]) for prop in nation_props[:20]],
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    print(f"players={len(rows)} clubs={len(clubs)} nations={len(nations)}")
    print("club props", [(prop, ref_stats[prop]["club"]) for prop in club_props[:10]])
    print("nation props", [(prop, ref_stats[prop]["nation"]) for prop in nation_props[:10]])
    print(f"wrote {OUT_DIR / 'marketPlayers.json'}")


if __name__ == "__main__":
    main()
