#!/usr/bin/env python3
"""Rebuild only the `map` sprite sheet (world map tiles need alpha again).

    /tmp/opencode/buildvenv/bin/python rebuild_map_sheet.py
"""
import sys
import shutil
from pathlib import Path

PROJECT = Path(__file__).resolve().parent
sys.path.insert(0, str(PROJECT / 'build_scripts'))

from assets import DirectorAssets  # noqa: E402
from assets.build_spritesheets import SpriteSheetBuilder  # noqa: E402

SHEET = sys.argv[1] if len(sys.argv) > 1 else 'map'

assets = DirectorAssets('sv', PROJECT / 'cst_out_new',
                        PROJECT / 'build_scripts' / 'assets' / 'assets_bat.yml')

out = PROJECT / 'assets_sv'
out.mkdir(exist_ok=True)

# drop the previous sheets so a shrunken atlas cannot leave stragglers behind
for old in out.iterdir():
    if old.name.startswith(SHEET + '-sprites-'):
        old.unlink()

builder = SpriteSheetBuilder(SHEET, out, optipng_level=0)
builder.add_assets(assets.get_spritesheet_assets(SHEET))
builder.save()

dist = PROJECT / 'dist' / 'assets'
dist.mkdir(parents=True, exist_ok=True)
for old in dist.iterdir():
    if old.name.startswith(SHEET + '-sprites-'):
        old.unlink()
for name in sorted(out.iterdir()):
    if name.name.startswith(SHEET):
        shutil.copy(name, dist.joinpath(name.name))
        print('copied', name.name)
