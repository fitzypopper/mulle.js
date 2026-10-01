# Build pipeline — boat-game deltas vs upstream mulle.js

Upstream `build_scripts/build.py` is hardwired to the *cars* game. The boat
game uses `build_scripts/build_bat.py` + `build_scripts/assets/assets_bat.yml`.
Everything below was verified against `cst_out_new/`, not guessed.

## Stage map

| Stage | Cars `build.py` | Boat `build_bat.py` | Why |
|---|---|---|---|
| `download` | fetches cars ISO from archive.org, unpacks | `extract_iso()` no-ops unless `iso/*.iso` exists | we have a local ISO, already unpacked |
| `download_plugin` / PLUGIN.CST | yes | **removed** | boats have no 66.DXR plugin DLC |
| `scores` | globs `8*.dxr`, hardcodes `82.DXR JustDoIt` | globs `7*.dxr`/`8*.dxr`, no hardcoded 82 | boat minigames are 70–88.DXR |
| `copy_images` | cursors `00.CXT #109-117`, loading `00.CXT #122` | cursors `11.DXR #101-109`, loading `10.DXR #21` | **cars member numbers are wrong here** |
| `topography` | `range(693, 748, 2)` | `range(2315, 2490, 2)` (88 pairs) | CDDATA layout differs |
| `assets` | `assets/assets.yml` | `assets/assets_bat.yml` (generated) | different movies/members |
| `phaser` (clone + grunt custom build) | default | replaced by **`phaser-npm`** (copies `node_modules/phaser-ce/build/phaser.min.js`) | much faster; upstream `phaser` stage still available |
| `data` | copies repo `data/` (cars json) | copies **`gamedata/`** (from `extract_data_bat.py`) + cursors | boats have their own data |
| `dist-assets` | *(does not exist)* | copies `assets_<lang>/` → `dist/assets/` | upstream manual step, automated |
| `scores` | globs `8*.dxr`, hardcodes `82.DXR JustDoIt` | globs `7*.dxr`/`8*.dxr`, no hardcoded 82 | boat minigames are 70–88.DXR |
| `copy_images` | cursors `00.CXT #109-117`, loading `00.CXT #122` | cursors `11.DXR #101-109`, loading `10.DXR #21` | **cars member numbers are wrong here** |
| `topography` | `range(693, 748, 2)` | `range(2315, 2490, 2)` (88 pairs) | CDDATA layout differs |
| `html_css` | copies `progress/`, `info/`, `src/index.html` | unchanged | — |
| sass / css | not in any stage | still manual: `npx sass src/style.scss dist/style.css` | upstream gap, unchanged |

One-shot dev build:

```bash
.venv/bin/python build_scripts/build_bat.py build   # webpack + phaser + html + data + topography + assets + dist-assets
```

## Verified facts (do not "restore" the cars numbers)

- **Cursors live in `11.DXR` Internal `#101-109`**, not `00.CXT #109-117`:
  `101 C_standard, 102 C_Grab, 103 C_Left, 104 C_Click, 105 C_Back,
  106 C_Right, 107 C_MoveLeft, 108 C_MoveRight, 109 C_MoveIn`.
  `src/style.scss` already keys cursor CSS off these Director names.
- `00.CXT #109-117` are Mulle body-animation frames (`00a005v0 02..17`,
  76x200); `00.CXT #122` is frame `13`. There is **no 235x189 loading splash**
  in this game — `10.DXR #21` (`10b008v0`, 381x251) is a placeholder.
- **Topography pairs** are `CDDATA.CXT #2315..2490`, 88 pairs,
  `30tNNNv0` / `30tNNNv0-2` (name check `name == name[:-2]` passes for all 88).
  `build_topography()` now takes `first=`/`last=` args; cars defaults kept.
- `CDDATA.CXT` layout (2490 member slots, not all filled):

  | Range | Names | Count | Use |
  |---|---|---|---|
  | 9–1043 | `Part*DB`, `PartDBTemplate` (type 3) | 1036 | text → `mulle.py` data gen |
  | 1053–1711 | `20b*` bitmaps | 659 | boat part images (`boatparts` pack) |
  | 1721–1871 | `20d*` sounds | 151 | part sounds (same pack) |
  | 1911–1937 | `31d/31e/31n/31b*` | 44 | misc (bingo/malmström screens) |
  | 1942–2016 | `worldData`, `RandomDevice`, `object*DB` | 36 | text → data gen |
  | 2023–2109 | `30b*` world map tiles 632x396 | 87 | `map` pack (opaque) |
  | 2121–2254 | `map*DB` (type 3) | 107 | text → data gen |
  | 2315–2490 | `30t*` topography pairs | 176 | `topography.py` |

- `DATA.CST` members: `1 PartsDB, 2 ExternalPartsDB, 3 UsersDB, 10 WorldsDB,
  11 mapsDB, 13 WoodHullsDB, 14 MetalHullsDB, 15 RuddersDB,
  22/23 CustomRacingField1/2, 24 CustomRacingDB`.
- Every non-`Internal`/non-`Standalone` library in the boat movies
  (`data`, `00`, `CDdata`, `tempPlug`, `Boat`, `Sail`) is **empty** — only the
  two primary libraries contain members.

## `assets_bat.yml` is generated

`build_scripts/gen_assets_bat.py` walks `cst_out_new/**/metadata.json` and
emits `build_scripts/assets/assets_bat.yml` (48 packs, 6288 assets, 0 missing
files). Regenerate after re-extraction:

```bash
.venv/bin/python build_scripts/gen_assets_bat.py
```

Pack names: `ui` (cursors), `shared` / `characters` / `cutscenes` (split of
`00.CXT`), `boatparts`, `map`, then one pack per movie:
`intro`(01) `junk`(02) `garage`(03) `yard`(04) `sailing`(05) `album`(06)
`diploma`(08) `menu`(10) `solhem`(11) `fileBrowser`(13) `directory`(14)
`scene15`(15) `m70`–`m88` (missions, roles are **guesses**), `sailFrames`,
`showboat`, `lb*` (Levande Böcker extras), `bls/blw/bms/bmw/bss/bsw`.

Deliberately **not** packs (handled elsewhere): `30t*` topography,
`Part*DB`/`map*DB`/`object*DB` texts, `DATA.CST`.

### Broken members

Three bitmaps are truncated on the disc and cannot be decoded by PIL
(`OSError: image file is truncated (256 bytes not processed)`), all of them
`#10` in the Levande Böcker web extras:
`LBDLGWEB.DXR`, `LBWEBINF.DXR`, `LBWEBOK.DXR`.
They are listed in `BROKEN_MEMBERS` in `gen_assets_bat.py` and skipped.

## Game data extraction (`extract_data_bat.py`)

Boat-game replacement for `mulle.py` (which is case-sensitive on `part*` and
misses the boat cast's `Part*DB` spelling). Run from the project root:

```bash
.venv/bin/python extract_data_bat.py     # -> gamedata/*.json
```

Verified results (via `node node-listparser.js`):

| Section | Entries | Hashed | Membership lists |
|---|---:|---:|---|
| parts | 1041 | 1036 | 4 (`parts_lists.json`) |
| maps | 108 | 107 | 1 (`maps_lists.json`) |
| missions | 0 | 0 | — |
| objects | 32 | 32 | — |
| worlds | 5 | 1 | 2 (`worlds_lists.json`) |

- **There is no mission database.** No member anywhere in the 46 movies is
  named `mission*` — missions are hard-coded in the Lingo of the scene movies
  `70`–`88.DXR` (their `*AnimChart` members confirm the cast: 70/71 Erson &
  diver/rope, 76 Judge, 77 Birgit + Prima/poodle/Labrador, 78 preacher,
  79 head/body, 80 Sam, 81 Sur, 83 Mia, ...).
- `DATA.CST` membership lists: `PartsDB` (1..1440-ish, note **16 missing**),
  `WoodHullsDB`, `MetalHullsDB`, `RuddersDB`, `mapsDB` = `[1,2,3,4]`,
  `WorldsDB` = `["Da Hood"]`, `CustomRacingDB` = `[178: "SVEN", 313: "PRÄST"]`.
- The world really is still called **"Da Hood"** in the boat game
  (`CDDATA.CXT #1942` = `#WorldId: "Da Hood"`, member name `worldDa HoodDB`),
  with a 10-wide grid of map ids and `#DirResource: "04"` style object hooks.
- Empty/unparseable text members (e.g. `map*DB #2122`) make `node-listparser`
  throw; they are counted as failures and stored as `null` in `*.array.json`.

## Known upstream gaps still open

- `npm install` needs `--allow-git=all` (git+ssh pinned dep).
- No build stage runs `sass`; `dist/assets/` must be linked manually.
- `build` stage list in `build_bat.py` still includes `phaser`/`webpack`
  (slow, npm-heavy) — run individual stages for iteration.
