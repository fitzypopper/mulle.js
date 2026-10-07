#!/usr/bin/env python3
"""
Generate build_scripts/assets/assets_bat.yml from cst_out_new/ metadata.

The car game's assets.yml is hand-maintained. For the boat game we derive the
member lists directly from the extracted metadata.json files so the config can
never reference movies/members that do not exist.

Run from the project root:
    .venv/bin/python build_scripts/gen_assets_bat.py
"""
import json
import os
import sys
from pathlib import Path

PROJECT = Path(__file__).resolve().parent.parent
EXTRACT = PROJECT / 'cst_out_new'
OUTPUT = PROJECT / 'build_scripts' / 'assets' / 'assets_bat.yml'

# Movie -> pack name. Packs are what the runtime loads via load.pack('name').
PACKS = {
    '01.DXR': 'intro',
    '02.DXR': 'junk',        # boatyard / junk piles
    '03.DXR': 'garage',      # boat building
    '04.DXR': 'yard',        # harbour
    '05.DXR': 'sailing',     # overworld / sailing
    '06.DXR': 'album',       # load / save
    '08.DXR': 'diploma',
    '10.DXR': 'menu',
    '11.DXR': 'solhem',      # character dialogue scene (cursors live here)
    '13.DXR': 'fileBrowser',
    '14.DXR': 'directory',
    '15.DXR': 'scene15',
    '70.DXR': 'm70',         # Erson / diver
    '71.DXR': 'm71',         # Erson / rope
    '76.DXR': 'm76',         # judge / boat show
    '77.DXR': 'm77',         # Birgit / dogs
    '78.DXR': 'm78',         # preacher
    '79.DXR': 'm79',         # head/body animation
    '80.DXR': 'm80',         # Sam
    '81.DXR': 'm81',         # Sur
    '83.DXR': 'm83',         # Mia
    '84.DXR': 'm84',         # Viola
    '85.DXR': 'm85',         # water / sinking
    '86.DXR': 'm86',         # Sven / bat
    '87.DXR': 'm87',         # dive / factory
    '88.DXR': 'm88',         # water / tree
    'SAIL.CXT': 'sailFrames',   # 400 sail animation frames
    'SHOWBOAT.DXR': 'showboat',
    'LBSTART.DXR': 'lbstart',
    'LBTRAIL.DXR': 'lbtrail',
    'LBDEMO.DXR': 'lbdemo',
    'LBPROFIL.DXR': 'lbprofil',
    'LBPROFIL.CXT': 'lbprofilCxt',
    'LBDLGWEB.DXR': 'lbdlgweb',
    'LBWEBINF.DXR': 'lbwebinf',
    'LBWEBOK.DXR': 'lbwebok',
    'BLS.CXT': 'bls',
    'BLW.CXT': 'blw',
    'BMS.CXT': 'bms',
    'BMW.CXT': 'bmw',
    'BSS.CXT': 'bss',
    'BSW.CXT': 'bsw',
}

# Members of 00.CXT pulled out into their own packs (rest stays in `shared`).
CUTSCENE_RANGES = [(51, 58), (59, 84), (189, 198)]   # 09b*/33b*/00b011-014 stills
CHARACTER_RANGES = [(91, 184), (302, 334), (341, 364)]  # Mulle body/arm/bag frames

# Cursors in the boat game live in 11.DXR, not 00.CXT (cars game difference).
CURSORS = {11: [(101, 109)]}

# CDDATA.CXT member ranges (verified against metadata.json, see docs/INVENTORY.md)
CDDATA_BOATPARTS = [(1053, 1711), (1721, 1871)]  # 20b* part images + 20d* part sounds
CDDATA_MAP = [(2023, 2109)]                      # 30b* world map tiles
# World map objects (`Object<N>DB` FrameList members): 31n001v0-1..11,
# Bensinmack and the 31b00xv0 pickups. They are drawn on the map sprites,
# so they live in the same pack. 1938 / 1940-1944 do not exist on disk.
CDDATA_OBJECTS = [(1927, 1937), (1939, 1939), (1945, 1948), (1991, 1991)]
# 2315..2490 = 30t* topography pairs -> build_scripts/topography.py (not a pack)
# 9..1043   = Part*DB text casts -> mulle.py data generation (not a pack)

# Members whose extracted bitmap is truncated on the disc image and cannot be
# decoded by PIL ("image file is truncated (256 bytes not processed)").
# All three are #10 in the Levande Bocker web extras (non-game dialogs).
BROKEN_MEMBERS = {
    'LBDLGWEB.DXR': [10],
    'LBWEBINF.DXR': [10],
    'LBWEBOK.DXR': [10],
}

# Full-screen backdrops that must NOT be marked opaque even though the
# full-screen heuristic below catches them: their sky area is the Director
# colour key (palette index 255). `setSky` (ParentScript 142 - Weather) draws
# the weather still 00b011-014v0 (00.CXT 78-81) on channel 1 *behind* these
# backdrops, and the key is what lets the sky show through.
# Only 03.DXR and 04.DXR call setSky (checked against all .lingo scripts).
COLOR_KEYED_SKIES = {
    '03.DXR': {1},   # garage 03b001v1, 40632 keyed px, rows 0..181
    '04.DXR': {1},   # yard   04b001v0, 84189 keyed px, rows 0..156
}


def library_of(movie: str) -> str:
    return 'Standalone' if movie.endswith(('.CXT', '.CST')) else 'Internal'


def load(movie: str) -> dict:
    meta = json.load(open(EXTRACT / movie / 'metadata.json'))
    for lib in meta['libraries']:
        if lib['name'] == library_of(movie):
            return lib['members']
    raise SystemExit(f'{movie}: library {library_of(movie)} not found')


def extracted_file(movie: str, library: str, num: int):
    """Return the extracted file for a member, or None if extraction produced nothing."""
    base = EXTRACT / movie / library / str(num)
    for ext in ('.png', '.bmp', '.txt', '.wav'):
        if base.with_suffix(ext).exists():
            return base.with_suffix(ext)
    return None


def members_of(movie: str) -> list[int]:
    """
    Member numbers with an actually extracted file.

    "Dummy" 0x0 placeholders (castType 1, no file on disk) are skipped: the
    spritesheet builder crashes on members with no file.
    """
    lib = library_of(movie)
    meta = load(movie)
    broken = set(BROKEN_MEMBERS.get(movie, []))
    return sorted(int(k) for k in meta
                  if int(k) not in broken and extracted_file(movie, lib, int(k)))


def ranges(nums: list[int]) -> list[list[int]]:
    """Collapse a sorted list of ints into [[start, end], ...] ranges."""
    out = []
    for n in nums:
        if out and n == out[-1][1] + 1:
            out[-1][1] = n
        else:
            out.append([n, n])
    return out


def expand(spec: list[tuple[int, int]]) -> set[int]:
    return {n for a, b in spec for n in range(a, b + 1)}


def in_ranges(n: int, spec: list[tuple[int, int]]) -> bool:
    return any(a <= n <= b for a, b in spec)


def fmt_range(r: list[int]) -> str:
    return str(r[0]) if r[0] == r[1] else f'[{r[0]}, {r[1]}]'


def emit_pack(name: str, movie: str, nums: list[int], opaque: set[int],
              comments: dict[int, str] = None) -> str:
    lines = [f'{name}:', f'  {movie}:', f'    {library_of(movie)}:', '      members:']
    for r in ranges(nums):
        lines.append(f'        - {fmt_range(r)}')
    op = sorted(n for n in nums if n in opaque)
    if op:
        lines.append('      opaque:')
        for r in ranges(op):
            lines.append(f'        - {fmt_range(r)}')
    return '\n'.join(lines)


def main():
    packs = []

    # --- ui: cursors from 11.DXR -------------------------------------------
    cur_nums = expand(CURSORS[11])
    packs.append(emit_pack('ui', '11.DXR', sorted(cur_nums), set(), {
        101: 'C_standard -> ui/default.png',
    }))

    # --- 00.CXT split into characters / cutscenes / shared -----------------
    all_00 = members_of('00.CXT')
    meta_00 = load('00.CXT')
    cut = {n for n in all_00 if in_ranges(n, CUTSCENE_RANGES)}
    char = {n for n in all_00 if in_ranges(n, CHARACTER_RANGES)}
    # sounds always stay in shared (load.js addAudio('shared'))
    sound_00 = {n for n in all_00 if meta_00[str(n)].get('castType') == 6}
    cut -= sound_00
    char -= sound_00
    shared = [n for n in all_00 if n not in cut and n not in char]

    def full_screen(nums, movie='00.CXT'):
        m = load(movie)
        return {n for n in nums
                if (m[str(n)].get('imageWidth') or 0) >= 300
                and (m[str(n)].get('imageHeight') or 0) >= 200}

    packs.append(emit_pack('characters', '00.CXT', sorted(char), full_screen(char)))
    packs.append(emit_pack('cutscenes', '00.CXT', sorted(cut), full_screen(cut)))
    packs.append(emit_pack('shared', '00.CXT', shared, full_screen(set(shared))))

    # --- CDDATA.CXT: boatparts + map ---------------------------------------
    packs.append(emit_pack('boatparts', 'CDDATA.CXT', sorted(expand(CDDATA_BOATPARTS)),
                           set()))
    # The 30b* world map tiles (and the 31b*/31n* map object pictures) are
    # drawn on top of the animated water (Weather1): their palette index 255
    # is the Director colour key and must stay transparent, so the whole pack
    # must NOT be listed as opaque.
    have = set(members_of('CDDATA.CXT'))
    map_nums = sorted((set(expand(CDDATA_MAP)) |
                       {n for n in have if in_ranges(n, CDDATA_OBJECTS)}) & have)
    packs.append(emit_pack('map', 'CDDATA.CXT', map_nums, set()))

    # --- one pack per remaining movie ---------------------------------------
    for movie, name in PACKS.items():
        if not (EXTRACT / movie).is_dir():
            print(f'SKIP {movie}: not extracted', file=sys.stderr)
            continue
        nums = members_of(movie)
        if not nums:
            print(f'SKIP {movie}: empty', file=sys.stderr)
            continue
        m = load(movie)
        # full-screen bitmaps are opaque (no alpha keying)
        opaque = {n for n in nums
                  if m[str(n)].get('castType') == 1
                  and (m[str(n)].get('imageWidth') or 0) >= 300
                  and (m[str(n)].get('imageHeight') or 0) >= 200}
        opaque -= COLOR_KEYED_SKIES.get(movie, set())
        packs.append(emit_pack(name, movie, nums, opaque))

    header = (
        '# AUTO-GENERATED by build_scripts/gen_assets_bat.py — do not edit by hand.\n'
        '# Regenerate: .venv/bin/python build_scripts/gen_assets_bat.py\n'
        '#\n'
        '# Source of truth: cst_out_new/<movie>/metadata.json\n'
        '# Library is Internal for .DXR and Standalone for .CXT/.CST.\n'
        '# Not included (handled elsewhere):\n'
        '#   CDDATA.CXT 2315..2490 (30t* topography) -> build_scripts/topography.py\n'
        '#   CDDATA.CXT 9..1043      (Part*DB text)   -> mulle.py data generation\n'
        '#   DATA.CST                 (game databases) -> mulle.py data generation\n'
        '\n'
    )
    OUTPUT.write_text(header + '\n\n'.join(packs) + '\n')
    print(f'Wrote {OUTPUT} ({len(packs)} packs)')


if __name__ == '__main__':
    main()
