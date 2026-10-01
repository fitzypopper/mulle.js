# Extraction — Bygg båtar med Mulle Meck

How to (re)extract everything from the original ISO. All work happens in the
project root (`~/Projects/mullebat-js`).

## One-time setup

```bash
python3 -m venv .venv
.venv/bin/pip install pyyaml requests pillow pycdlib PyTexturePacker \
    shockwaveparser @ git+https://github.com/datagutten/ShockwaveParser.git
npm install --allow-git=all     # free-tex-packer-core is pinned to a github: dep
```

Note: `pip install .` (from `pyproject.toml`) fails during metadata generation;
install the deps individually as above.

## 1. Unpack the ISO

Source disc: `~/Downloads/MULLEBAT (Windows).iso` (266,913,792 bytes,
ISO 9660, volume `MULLEBAT`).

```bash
7z x -oiso "$HOME/Downloads/MULLEBAT (Windows).iso"
```

This yields `iso/Movies/*.dxr|.cxt`, `iso/Sound/`, `iso/Data/data.cst`,
`iso/Xtras/`, `iso/Mullebat.exe`.

## 2. Extract the Director casts

```bash
.venv/bin/python extract_bat.py
```

`extract_bat.py` is the boat-game variant of upstream `extract.py` (which
expects the *cars* game folder layout). It walks `iso/Movies` and `iso/Data`
and writes `cst_out_new/<FILENAME>/` with:

- `metadata.json` — `{'libraries': [{'name', 'members'}], 'dir'}`; each member
  has `type`, `length`, `castType`, `name`, `imagePosX/Y/W/H`, `imageRegX/Y`,
  `imageBitDepth`, `imagePalette`, `imageHash`.
- `pack.json`
- `<library>/<member>.{bmp,png,wav,txt}` — the raw member payloads plus a
  per-member `.json`. Library is `Internal` for `.DXR` and `Standalone` for
  `.CXT`/`.CST`.

Cast types seen: `1` bitmap, `2` field, `3` lingo script/text, `4` ?, `6` sound,
`7` ?, `8` button, `12` string, `14` shape.

Result: **46 movies extracted** — see `docs/INVENTORY.md` for the per-movie
table.

Run it from the project root: the output folder is relative to cwd.

## 3. Build assets

```bash
.venv/bin/python build_scripts/gen_assets_bat.py   # regenerate assets_bat.yml
.venv/bin/python build_scripts/build_bat.py data      # cursors + loading.png + copy data/*.json
.venv/bin/python build_scripts/build_bat.py topography
.venv/bin/python build_scripts/build_bat.py assets    # 48 spritesheets -> assets_sv/
```

See `docs/PIPELINE.md` for what differs from the cars-game pipeline.

## Gotchas

- Only benign extraction warnings appear: `UNHANDLED KEY` links and
  `unhandled FIELD end data`.
- `Dummy` members (castType 1, `0x0`) have **no extracted file** — the
  generator skips them; the spritesheet builder crashes on them otherwise.
- Member files are shared-path safe: everything is written under
  `cst_out_new/<movie>/<library>/`.
