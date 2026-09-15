#!/usr/bin/env python3
"""Parse the SYH SQL backup and generate JSON data files for the React app."""

import re
import json
import sys
import html

SQL_FILE = "../syh-ruby/db/backup/syh_development_02-05-2018.sql"
# The two small lists are imported by the app; the two large ones are
# fetched at runtime, so they are served as static assets instead.
OUT_DIR = "src/data"
ASSET_DIR = "public/data"


def split_sql_rows(values_str):
    """Split a VALUES string like (1,'a'),(2,'b') into individual row strings."""
    rows = []
    depth = 0
    in_string = False
    escape = False
    start = None

    for i, ch in enumerate(values_str):
        if escape:
            escape = False
            continue
        if ch == '\\' and in_string:
            escape = True
            continue
        if ch == "'" and not escape:
            in_string = not in_string
            continue
        if in_string:
            continue
        if ch == '(':
            if depth == 0:
                start = i
            depth += 1
        elif ch == ')':
            depth -= 1
            if depth == 0 and start is not None:
                rows.append(values_str[start + 1:i])
                start = None
    return rows


def parse_row_values(row_str):
    """Parse comma-separated SQL values into a Python list."""
    values = []
    i = 0
    s = row_str

    while i <= len(s):
        # skip leading whitespace
        while i < len(s) and s[i] == ' ':
            i += 1
        if i >= len(s):
            break

        if s[i] == "'":
            # string value
            i += 1
            val = []
            while i < len(s):
                if s[i] == '\\' and i + 1 < len(s):
                    next_ch = s[i + 1]
                    if next_ch == 'n':
                        val.append('\n')
                    elif next_ch == 'r':
                        val.append('\r')
                    elif next_ch == 't':
                        val.append('\t')
                    else:
                        val.append(next_ch)
                    i += 2
                elif s[i] == "'":
                    i += 1
                    break
                else:
                    val.append(s[i])
                    i += 1
            values.append(''.join(val))
        elif s[i:i+4] == 'NULL':
            values.append(None)
            i += 4
        else:
            j = i
            while j < len(s) and s[j] != ',':
                j += 1
            values.append(s[i:j].strip())
            i = j

        # skip comma
        while i < len(s) and s[i] in (' ', ','):
            i += 1
            break

    return values


def parse_create_columns(sql, table):
    """Extract column names in order from CREATE TABLE statement."""
    start_m = re.search(rf"CREATE TABLE `{table}` \(", sql)
    if not start_m:
        return []
    pos = start_m.end()
    depth = 1
    while pos < len(sql) and depth > 0:
        if sql[pos] == '(':
            depth += 1
        elif sql[pos] == ')':
            depth -= 1
        pos += 1
    body = sql[start_m.end():pos - 1]
    skip = ('PRIMARY', 'UNIQUE', 'KEY', 'CONSTRAINT')
    cols = []
    for line in body.split('\n'):
        line = line.strip()
        if not line or any(line.startswith(k) for k in skip):
            continue
        col_m = re.match(r'`(\w+)`', line)
        if col_m:
            cols.append(col_m.group(1))
    return cols


def parse_table(sql, table):
    """Return list of dicts for a table."""
    cols = parse_create_columns(sql, table)
    if not cols:
        print(f"WARNING: could not find CREATE TABLE for {table}", file=sys.stderr)
        return []

    insert_pattern = rf"INSERT INTO `{table}` VALUES (.+?);\n"
    rows = []
    for m in re.finditer(insert_pattern, sql, re.DOTALL):
        for row_str in split_sql_rows(m.group(1)):
            vals = parse_row_values(row_str)
            if len(vals) >= len(cols):
                rows.append(dict(zip(cols, vals[:len(cols)])))
            elif vals:
                d = dict(zip(cols[:len(vals)], vals))
                rows.append(d)
    return rows


def to_int(v):
    try:
        return int(v) if v is not None else None
    except:
        return None


def to_float(v):
    try:
        return float(v) if v is not None else None
    except:
        return None


def to_bool(v):
    return v not in (None, "0", "", False, 0)


def main():
    print("Reading SQL...", file=sys.stderr)
    with open(SQL_FILE, "r", encoding="utf-8", errors="replace") as f:
        sql = f.read()

    print("Parsing countries...", file=sys.stderr)
    countries = {
        to_int(r["id"]): {
            "id": to_int(r["id"]),
            "name": r["name"],
            "latitude": to_float(r["latitude"]),
            "longitude": to_float(r["longitude"]),
        }
        for r in parse_table(sql, "countries")
    }

    print("Parsing cities...", file=sys.stderr)
    cities = {
        to_int(r["id"]): {
            "id": to_int(r["id"]),
            "name": r.get("name"),
            "latitude": to_float(r.get("latitude")),
            "longitude": to_float(r.get("longitude")),
        }
        for r in parse_table(sql, "cities")
    }

    print("Parsing characteristics...", file=sys.stderr)
    chars_raw = parse_table(sql, "characteristics")
    characteristics = [{"id": to_int(r["id"]), "name": r["name"].strip()} for r in chars_raw
                       if r.get("name") and "placeholder" not in r["name"]]
    char_id_to_name = {c["id"]: c["name"] for c in characteristics}

    print("Parsing painting_characteristics...", file=sys.stderr)
    painting_chars = {}
    for r in parse_table(sql, "painting_characteristics"):
        pid = to_int(r["painting_id"])
        cid = to_int(r["characteristic_id"])
        if pid and cid:
            painting_chars.setdefault(pid, []).append(cid)

    print("Parsing selections...", file=sys.stderr)
    sel_raw = parse_table(sql, "selections")
    selections = [{"id": to_int(r["id"]), "name": r["name"].strip()} for r in sel_raw
                  if r.get("name") and r["name"].strip().lower() != "unknown exhibition"]
    sel_id_to_name = {s["id"]: s["name"] for s in selections}

    print("Parsing selected_paintings...", file=sys.stderr)
    painting_selections = {}
    for r in parse_table(sql, "selected_paintings"):
        pid = to_int(r["painting_id"])
        sid = to_int(r["selection_id"])
        name = sel_id_to_name.get(sid)
        if pid and name:
            painting_selections.setdefault(pid, []).append(name)

    print("Parsing videos...", file=sys.stderr)
    painting_videos = {}
    for r in parse_table(sql, "videos"):
        pid = to_int(r["painting_id"])
        if pid and r.get("link"):
            painting_videos.setdefault(pid, []).append({"link": r["link"]})

    print("Parsing artists...", file=sys.stderr)
    artists = {}
    for r in parse_table(sql, "artists"):
        aid = to_int(r["id"])
        cid = to_int(r.get("country_id"))
        city_id = to_int(r.get("city_id"))
        city = cities.get(city_id)
        # skip cities with null coords
        if city and (city["latitude"] is None or city["longitude"] is None):
            city = None
        artists[aid] = {
            "id": aid,
            "fullname": r.get("fullname", ""),
            "gender": "female" if r.get("gender") in ("f", "female") else "male",
            "country": countries.get(cid) or {"id": 0, "name": "Unknown", "latitude": 0.0, "longitude": 0.0},
            "city": city,
        }

    print("Parsing paintings...", file=sys.stderr)
    paintings = []
    for r in parse_table(sql, "paintings"):
        pid = to_int(r["id"])
        aid = to_int(r.get("artist_id"))
        artist = artists.get(aid)
        if not artist:
            continue
        tag_raw = r.get("tag", "")
        if not tag_raw:
            continue
        m = re.match(r"^(\d+)(.*)$", tag_raw)
        if m:
            tag = m.group(1).zfill(4) + m.group(2)
        else:
            tag = tag_raw

        is_private = to_bool(r.get("is_private"))

        sell_int = to_int(r.get("sell_status")) or 0
        sell_status = ["sold", "dont_sell", "free_to_sell", "own_discretion"][sell_int]

        paintings.append({
            "id": pid,
            "tag": tag,
            "title": html.unescape(r.get("title") or ""),
            "date": r.get("date") or "",
            "is_vertical": to_bool(r.get("is_vertical")),
            "sell_status": sell_status,
            "story": html.unescape((r.get("story") or "").strip()),
            "is_private": is_private,
            "artist": artist,
            "characteristics": [char_id_to_name[c] for c in painting_chars.get(pid, []) if c in char_id_to_name],
            "selections": painting_selections.get(pid, []),
            "videos": painting_videos.get(pid, []),
        })

    print("Parsing exhibitions...", file=sys.stderr)
    exhibitions = []
    for r in parse_table(sql, "exhibitions"):
        lat = to_float(r.get("latitude"))
        lng = to_float(r.get("longitude"))
        if lat is None or lng is None:
            continue
        exhibitions.append({
            "id": to_int(r["id"]),
            "name": r.get("name", ""),
            "category": r.get("category", ""),
            "start_date": r.get("start_date") or "",
            "end_date": r.get("end_date") or "",
            "country": r.get("country", ""),
            "city": r.get("city", ""),
            "latitude": lat,
            "longitude": lng,
        })

    print(f"Results: {len(paintings)} paintings, {len(artists)} artists, "
          f"{len(exhibitions)} exhibitions, {len(characteristics)} characteristics, "
          f"{len(selections)} selections", file=sys.stderr)

    with open(f"{ASSET_DIR}/paintings.json", "w") as f:
        json.dump(paintings, f, ensure_ascii=False, indent=2)
    with open(f"{ASSET_DIR}/exhibitions.json", "w") as f:
        json.dump(exhibitions, f, ensure_ascii=False, indent=2)
    with open(f"{OUT_DIR}/characteristics.json", "w") as f:
        json.dump(characteristics, f, ensure_ascii=False, indent=2)
    with open(f"{OUT_DIR}/selections.json", "w") as f:
        json.dump(selections, f, ensure_ascii=False, indent=2)

    print("Done.", file=sys.stderr)


if __name__ == "__main__":
    main()
