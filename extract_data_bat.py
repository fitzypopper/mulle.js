#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extract the boat game's game data (parts / maps / objects / worlds) from the
extracted casts into gamedata/*.json — the boat-game equivalent of mulle.py.

Differences from mulle.py:
  * prefix matching is case-insensitive (boat cast uses "Part1DB", cars used "part1DB")
  * reads DATA.CST too (PartsDB, WoodHullsDB, MetalHullsDB, RuddersDB,
    WorldsDB, mapsDB, ExternalPartsDB, CustomRacingDB)
  * no cars-only assumptions

Requires node (node-listparser.js) on PATH.

Run from the project root:
    .venv/bin/python extract_data_bat.py
"""
import json
import os
import re
import sys
from subprocess import Popen, PIPE, STDOUT

EXTRACT = 'cst_out_new'
OUT = 'gamedata'

SECTIONS = ('parts', 'maps', 'missions', 'objects', 'worlds')

# CDDATA.CXT text members -> section, by name prefix (case-insensitive)
PREFIXES = (
    ('part', 'parts'),
    ('mission', 'missions'),
    ('object', 'objects'),
    ('map', 'maps'),
    ('world', 'worlds'),
)


def parse_list(text: str):
    """Parse a Lingo list through node-listparser.js (same as mulle.py)."""
    p = Popen(['node', 'node-listparser.js'], stdout=PIPE, stdin=PIPE, stderr=STDOUT)
    out = p.communicate(input=text.encode('utf-8'))[0]
    if p.returncode != 0:
        raise RuntimeError(f'node-listparser failed: {out.decode("utf-8", "replace")[:400]}')
    return json.loads(out)


def read(path: str) -> str:
    with open(path, encoding='iso8859-1') as fp:
        return fp.read()


def collect() -> dict:
    raw = {s: [] for s in SECTIONS}   # section -> list of raw lingo texts
    sources = {s: [] for s in SECTIONS}
    unclassified = []

    for movie, library in (('CDDATA.CXT', 'Standalone'), ('DATA.CST', 'Standalone')):
        base = os.path.join(EXTRACT, movie, 'metadata.json')
        if not os.path.exists(base):
            print(f'skip {movie}: not extracted', file=sys.stderr)
            continue
        meta = json.load(open(base))
        for lib in meta['libraries']:
            if lib['name'] != library:
                continue
            for num, mem in lib['members'].items():
                if mem.get('castType') not in (3, 12):
                    continue
                path = os.path.join(EXTRACT, movie, library, num + '.txt')
                if not os.path.exists(path):
                    continue
                name = mem.get('name', '')
                low = name.lower()
                # DATA.CST members are named "PartsDB", "WorldsDB" etc.
                section = None
                for prefix, sec in PREFIXES:
                    if low.startswith(prefix):
                        section = sec
                        break
                if section is None:
                    # DATA.CST alias names
                    section = {
                        'partsdb': 'parts', 'woodhullsdb': 'parts',
                        'metalhullsdb': 'parts', 'ruddersdb': 'parts',
                        'externalpartsdb': 'parts',
                        'mapsdb': 'maps', 'worldsdb': 'worlds',
                        'customracingdb': 'worlds', 'customracingfield1': 'worlds',
                        'customracingfield2': 'worlds',
                    }.get(low)
                if section is None:
                    if movie == 'DATA.CST' or low.startswith('initial') or low.startswith('random'):
                        unclassified.append((movie, num, name))
                    continue
                raw[section].append(read(path))
                sources[section].append(f'{movie}/{num}:{name}')

    return {'raw': raw, 'sources': sources, 'unclassified': unclassified}


def main():
    os.makedirs(OUT, exist_ok=True)
    data = collect()

    raw_all = {}
    for sec in SECTIONS:
        raw_all[sec] = data['raw'][sec]
    with open(os.path.join(OUT, 'all_raw.json'), 'w') as fp:
        json.dump(raw_all, fp)

    hash_keys = {
        'parts': ('partId', 'PartID'),
        'maps': ('MapId',),
        'missions': ('MissionId',),
        'objects': ('ObjectId',),
        'worlds': ('WorldId',),
    }

    summary = []
    for sec in SECTIONS:
        texts = data['raw'][sec]
        if not texts:
            print(f'{sec}: no members found')
            with open(os.path.join(OUT, f'{sec}.hash.json'), 'w') as fp:
                json.dump({}, fp)
            continue

        parsed_list = []
        failures = 0
        for i, text in enumerate(texts, 1):
            try:
                parsed_list.append(parse_list(text))
            except Exception as e:
                failures += 1
                if failures <= 3:
                    print(f'{sec}: parse failure: {e}')
                parsed_list.append(None)
            print(f'parsed: {sec} {i}/{len(texts)}', end='\r')

        print(f'{sec}: {len(texts)} entries ({failures} failures) '
              f'from {data["sources"][sec][0]} ...')

        with open(os.path.join(OUT, f'{sec}.array.json'), 'w') as fp:
            json.dump(parsed_list, fp, ensure_ascii=False)

        hashed = {}
        plain_lists = {}
        duplicates = []
        for entry, source in zip(parsed_list, data['sources'][sec]):
            if isinstance(entry, dict):
                for key in hash_keys[sec]:
                    if key in entry:
                        if entry[key] in hashed:
                            duplicates.append((entry[key], source))
                        hashed[entry[key]] = entry
                        break
            elif isinstance(entry, list):
                # DATA.CST membership lists: PartsDB=[1,2,...],
                # WoodHullsDB=[719,720,...] -> keep keyed by member name
                name = source.split(':', 1)[1]
                plain_lists[name] = entry

        if plain_lists:
            with open(os.path.join(OUT, f'{sec}_lists.json'), 'w') as fp:
                json.dump(plain_lists, fp, ensure_ascii=False, indent=2)
            print(f'  {sec}: {len(plain_lists)} membership lists -> {sec}_lists.json')

        with open(os.path.join(OUT, f'{sec}.hash.json'), 'w') as fp:
            json.dump(hashed, fp, ensure_ascii=False)
        summary.append((sec, len(texts), len(hashed), len(duplicates)))
        if duplicates:
            print(f'  {sec}: {len(duplicates)} duplicate keys, first: {duplicates[0]}')

    # raw dump of DATA.CST members that did not map to a section (index lists etc.)
    if data['unclassified']:
        index = {f'{m}/{n}': name for m, n, name in data['unclassified']}
        with open(os.path.join(OUT, 'index_members.json'), 'w') as fp:
            json.dump(index, fp, ensure_ascii=False, indent=2)
        print(f'unclassified DATA.CST/aux members -> gamedata/index_members.json '
              f'({len(index)})')

    print('\nSummary:')
    for sec, n, h, dup in summary:
        print(f'  {sec:9s} entries={n:4d} hashed={h:4d} duplicate_keys={dup}')
    print('done')


if __name__ == '__main__':
    main()
