# Mulle Meck Bygger Båtar — Progress Checklist

Adapted from mulle.js progress page for the boat game. Status codes: **⏭ Skipped**, **⬜ Not started**, **🟡 WIP**, **🟢 Functional**, **✅ Completed**, **⭐ Extra**

---

## Milestone 1 — Extraction + inventory (DONE 2026-10-01)

- [x] ISO unpacked → `iso/` (256M)
- [x] All **46 movies** extracted → `cst_out_new/` (`extract_bat.py`)
- [x] Inventory of every movie → `docs/INVENTORY.md`
- [x] `build_scripts/gen_assets_bat.py` → `assets_bat.yml` (48 packs, 6288 assets, 0 missing files)
- [x] `build_scripts/build_bat.py` — boat build driver (no cars download/plugin/82.DXR hardcodes)
- [x] Cursors fixed: `11.DXR #101-109` → `dist/ui/*.png` (cars numbers were wrong)
- [x] Topography fixed: `CDDATA #2315-2490` (88 pairs) → `dist/assets/topography/`
- [x] Spritesheets built → `assets_sv/` (all 48 packs, audio→ogg)
- [x] Game data → `gamedata/` (`extract_data_bat.py`): 1036 parts, 107 maps, 32 objects, 1 world
- [x] Docs: `docs/EXTRACTION.md`, `docs/PIPELINE.md`, `docs/INVENTORY.md`
- [x] `docs/RESEARCH.md` — web research (completed)
- [x] Reference mirror of `share.your.dongers.net/mullestuff/` → `reference/mullestuff/` (completed)

### Open for milestone 1 wrap-up

---
## Milestone 2 — Boot to main menu (COMPLETED 2026-10-02)

- [x] Rewrote `src/scenes/menu.js` from `scripts_out/11.DXR/score.json` (actual menu scene)
- [x] Assets pipeline: 11.DXR pack built → `menu.json` + `menu-sprites-0.png`
- [x] `node scripts/smoke_test.js` → state "menu" with background, Mulle actors, name input, OK button
- [x] Folded `docs/RESEARCH.md` findings into `PROGRESS.md` (see sections below)
- [x] Committed on branch `boat`

### Key research findings folded into PROGRESS.md

- **No ScummVM Swedish boats entry** — our ISO (Windows 95/98, `MULLEBAT (Windows).iso`) is provably unmatched in ScummVM's detection tables; opportunity to file a detection ticket.
- **Mission movies are 70–88** (11 missions), not 82–94 like cars; confirmed by ISO Movies/ listing + inventory.
- **`DATA.CST` = save + 11 text members** (PartData), no compressed assets; car game's 66.DXR/Plugins are absent.
- **German retail has disc check**; Swedish retail has none (our ISO is Swedish).
- **Hemglass special edition** (ice-cream co-op) exists — archive.org has "Förbättrad Version" bugfix patch.
- **Multiplayer** was a planned feature (`networkEnabled` in `src/game.js`) but never shipped.
- **Localized titles**: DE *Schiffe bauen mit Willy Werkel*, NL *Miel Monteur – Recht Door Zee!*, NO *Bygg båter med Mulle Mekk*, FI *Rakenna veneitä Masa Mainion kanssa*, DA *Byg båd med Mulle Meck*, HU *Barkács Balázs: Hajót Épít*.
- **Cast**: Mulle (Lennart Jähkel), Doris (Malin Sköld), Erson (Gustav Forsberg), Mia (Ulla-Carin Nyqvist), Viola (Lisa Indahl), Sam (Dave Nerge), Svarte Sven (Bosse Löthén), Domaren (boat-show judge), Prästen (pastor quest).
- **Part acquisition**: Buy from Doris Digital; radio announces new parts/weather/friends; sailing in/out of vault triggers part drops.
- **Sailing mechanics**: Compass/speed/fuel/food HUD; windsocks; sails/oars; tug-boat rescue; two gas stations (Flaskön, left of Dödskalleön); surströmming factory haul to Myrarna pays food+fuel.
- **Friends' mini-games** (70–88) award boat parts; album save system; boat-file sharing; diploma competition.
- **Assets**: 46 movies extracted; 48 packs / 6288 sprites in `assets_bat.yml`; topography = 88 pairs (30t001–30t088) from CDDATA #2315–2490.

---
- [x] `dist/style.css` via `npx sass src/style.scss dist/style.css`
- [x] `dist/data/` now comes from `gamedata/` (boats), not the repo's cars `data/`
- [x] webpack dev build compiles (`dist/bundle.js`, 316 KiB)
- [x] static integrity check: every file `index.html`/`boot.js`/`load.js`/
      `style.scss` needs exists in `dist/` (only `ui/drive.png` absent — it is
      a commented-out SCSS rule)
- [ ] browser boot smoke test — **blocked: no desktop browser connected to this
      session** (open the session in the desktop app, then check
      `http://127.0.0.1:8777/` from `cd dist && python3 -m http.server 8777`)

---

## Core Data & Shared Assets

- [ ] **00.CXT — Shared data & scripts**
  - [ ] Cursors (default, grab, left, point, back, right, drag_left, drag_right, drag_forward)
  - [ ] Mulle animations (Arm, Body, Bag, SmallAnimChart)
  - [ ] Buffa/character sprites
  - [ ] UI sounds (clicks, rollovers, menu sounds)
  - [ ] PartData text cast
  - [ ] Cutscene backgrounds (00b001v0–00b014v0)

- [ ] **CDDATA.CXT — Game database & map tiles**
  - [ ] Map background tiles (30b001v0–30b088v0, 632×396)
  - [ ] Boat part images (20b001v1–20b979v3, multi-variant)
  - [ ] UI elements (bins, buttons, meters, 20b8xx, 20b0xx)
  - [ ] Topography tiles (30t... paired with map tiles)
  - [ ] Part databases (Part1DB–Part1044DB, castType 3)

- [ ] **DATA.CST — Structured databases**
  - [ ] PartsDB
  - [ ] ExternalPartsDB
  - [ ] UsersDB
  - [ ] WorldsDB
  - [ ] mapsDB
  - [ ] WoodHullsDB
  - [ ] MetalHullsDB
  - [ ] RuddersDB
  - [ ] CustomRacingField1/2, CustomRacingDB

- [ ] **SAIL.CXT — Sail animation (400 frames)**
  - [ ] Segel.00000–Segel.00399 frames for sail animation

---

## Core Scenes

- [ ] **01.DXR — Intro / Opening**
  - [ ] Backgrounds and animations
  - [ ] Multi-library cast (Internal, data, 00, CDdata)

- [ ] **02.DXR — Boatyard / Junkyard**
  - [ ] Background (02b001v1, 640×480)
  - [ ] Junk pile doors (02b002v0–02b007v0)
  - [ ] Ambient sounds (02d002v0–02d004v0, 02e003v0)
  - [ ] PartData text

- [ ] **03.DXR — Garage / Boat Building**
  - [ ] Background (03b001v1, 640×480)
  - [ ] YardAnimChart, TalkToMeAnimChart
  - [ ] Construction sounds (03d001v0–03d007v0, GiftSnd1–3)
  - [ ] Toolbox/UI elements (03b999v0, 03b002v0)

- [ ] **04.DXR — Yard / Harbor**
  - [ ] Backgrounds (04b001v0, 04b009v0, 04b010v0)
  - [ ] Windmeter, Radio, Quay, BuffaQuay animations
  - [ ] TalkToMe animation
  - [ ] Animated characters/boats (04a001v0–04a006v0 sequences)
  - [ ] Harbor ambient sounds (04d001v0–04d057v0, 04e001v0–04e1000v0)

- [ ] **05.DXR — World / Map / Sailing (Overworld)**
  - [ ] Sailing mechanics (wind, waves, boat physics)
  - [ ] Map navigation (destinations, gas stations/ferries, random events)
  - [ ] Map objects (cows/goats, hills, bridges, racing, teleport, position correction)
  - [ ] Wave/sail sprites (TypePicSail, WavePic1–2, TestWave, MarcusWave)
  - [ ] 277 sounds: sailing, water, engine, horns, environment, mission triggers
  - [ ] Topography integration

- [ ] **06.DXR — Load / Save**
  - [ ] Save slot UI (06b001v0, 06b007v0–06b017v0)
  - [ ] Saved boat names, thumbnails
  - [ ] Load/save sounds

- [ ] **08.DXR — Diploma**
  - [ ] Diploma background (Diplom, 571×812)
  - [ ] Medal icons, title, user name entry
  - [ ] Scroll arrows, save slot thumbnails

- [ ] **10.DXR — Main Menu / Intro / Ending**
  - [ ] Background (10b001v0, 320×226)
  - [ ] Animated buttons (10a001v0 frames 2–16)
  - [ ] Mulle character (10b008v0)
  - [ ] Intro music (10e001v0)

- [ ] **11.DXR — Character Scene (Buffa/Mulle)**
  - [ ] Background (11b001v1)
  - [ ] Buffa/Mulle animations (87a001v0–v2, head/body/arm charts)
  - [ ] Cursor sprites (C_standard, C_Grab, C_Left, C_Click, C_Back, C_Right, C_MoveLeft/Right/In)
  - [ ] Dialogue sounds

- [ ] **13.DXR — File Browser**
  - [ ] Background (13b001v0)
  - [ ] File list UI (STICKA1–7.TIF, tick1)
  - [ ] Navigation sounds

- [ ] **14.DXR — Directory / Input Fields**
  - [ ] MainScroller, EnterField, DirectoryField text
  - [ ] UI backgrounds

- [ ] **15.DXR — Complex Scene (multi-background)**
  - [ ] Multiple backgrounds (15b001v0–15b011v0)
  - [ ] UI elements (15b012v0–15b074v0)
  - [ ] Scene sounds (15d003v0–15e005v0)

---

## Missions & Minigames (70–88)

- [ ] **70.DXR — Erson / Diver Mission**
  - [ ] Erson/Diver animations, rope mechanics
  - [ ] Mission sounds

- [ ] **71.DXR — Erson / Rope Mission (continuation)**
  - [ ] Rope animation, Erson happy state

- [ ] **76.DXR — Boat Show / Judge Mission**
  - [ ] Judge animations (intro, judging)
  - [ ] Scoring UI, boat display

- [ ] **77.DXR — Birgit / Dog Mission**
  - [ ] Birgit (head, arm, turn animations)
  - [ ] Dogs: Prima, poodle, labrador
  - [ ] Extensive dialogue

- [ ] **78.DXR — Preacher Mission**
  - [ ] Preacher animation
  - [ ] Sermon dialogue

- [ ] **79.DXR — Head/Body Animation Mission**
  - [ ] Character animation sequences

- [ ] **80.DXR — Sam Mission**
  - [ ] Sam animations (SamAnimChart, Sam2AnimChart)
  - [ ] Multiple background layers (n01–n17)

- [ ] **81.DXR — Sur Mission**
  - [ ] Sur animation, water scene

- [ ] **83.DXR — Mia Mission**
  - [ ] Mia animation, dialogue

- [ ] **84.DXR — Viola Mission**
  - [ ] Viola (head, arm animations)
  - [ ] Accordion/band elements

- [ ] **85.DXR — Water / Sinking Mission**
  - [ ] Water animation, boat in distress

- [ ] **86.DXR — Sven / Bat Mission**
  - [ ] Sven animation, bat animation
  - [ ] Cave/underground setting

- [ ] **87.DXR — Dive / Factory Mission (Saftfabriken)**
  - [ ] Dive animation (many frames)
  - [ ] Factory interior, underwater elements
  - [ ] Mini-sprites (9x9 to 15x40)

- [ ] **88.DXR — Water Mission 2 / Tree in Path**
  - [ ] Water animation, obstacle

---

## Special / Bonus

- [ ] **SHOWBOAT.DXR — Showboat Animation**
  - [ ] Boat sailing animation frames
  - [ ] Sail animation (from SAIL.CXT)
  - [ ] Strut/mast animation
  - [ ] Water background, wind arrow
  - [ ] ShowBOAT_01–07 narration sounds

- [ ] **LBSTART.DXR — Intro Sequence / Credits**
  - [ ] Animated frames (B-FRAM, GÅ, t-, FLYG, LANDA, FINAL sequences)
  - [ ] Intro sound (LBVINJ)

- [ ] **LBDEMO.DXR — Demo Mode**
  - [ ] Demo slides (flik01–flik09, sid01–02)

- [ ] **LBPROFIL.DXR / LBPROFIL.CXT — Profile System**
  - [ ] User profiles, warnings, clipboard

- [ ] **BLS/BLW/BMS/BMW/BSS/BSW.CXT — Helper Casts (400 frames each)**
  - [ ] Purpose TBD (likely transition/loading animations)

---

## UI & Systems

- [ ] **Cursors & Chrome** (from 00.CXT #109–117, #122)
  - [ ] Cursor images → `dist/ui/*.png`
  - [ ] Loading image → `dist/loading.png`
  - [ ] SCSS cursor classes

- [ ] **Topography** (from CDDATA.CXT #693–748 pairs)
  - [ ] Map topology tiles → `dist/assets/topography/`
  - [ ] Packed atlas + JSON

- [ ] **Audio Sprites**
  - [ ] Shared UI sounds (00.CXT)
  - [ ] Scene-specific sounds (per movie)
  - [ ] Sailing/environment (05.DXR)

- [ ] **Subtitles** (English/Swedish)
  - [ ] Mission dialogues
  - [ ] Part check messages
  - [ ] Menu/tutorial text

---

## Extra Features (Post-MVP)

- [ ] ⭐ Multiplayer sailing / racing
- [ ] ⭐ Online highscores (boat show, racing)
- [ ] ⭐ Boat preview in menu
- [ ] ⭐ Chat
- [ ] ⭐ Custom racing tracks (CustomRacingDB)

---

## Movie → Scene Mapping (for `src/game.js` state registration)

| Movie | Scene State | Notes |
|-------|-------------|-------|
| 02.DXR | `junk` | Boatyard |
| 03.DXR | `garage` | Boat building |
| 04.DXR | `yard` | Harbor |
| 05.DXR | `world` | Sailing overworld |
| 06.DXR | `album` | Load/Save (called album in cars) |
| 08.DXR | `diploma` | Diploma |
| 10.DXR | `menu` | Main menu |
| 11.DXR | `solhem` | Character scene |
| 13.DXR | `fileBrowser` | (via album) |
| 14.DXR | — | Directory helper |
| 15.DXR | — | Complex scene |
| 70.DXR | `mudcar`→`dive`? | Erson/Diver |
| 71.DXR | — | Erson/Rope |
| 76.DXR | `carshow`→`boatshow` | Judge/Boat show |
| 77.DXR | `dorisdigital`→`birgit` | Birgit/Dog |
| 78.DXR | `sturestortand`→`preacher` | Preacher |
| 79.DXR | `roaddog`→`headbody` | Head/Body |
| 80.DXR | `saftfabrik`→`sam` | Sam |
| 81.DXR | `viola`→`sur` | Sur |
| 83.DXR | `figgeferrum`→`mia` | Mia |
| 84.DXR | `roadthing`→`viola2` | Viola |
| 85.DXR | — | Water/Sinking |
| 86.DXR | — | Sven/Bat |
| 87.DXR | — | Dive/Factory |
| 88.DXR | — | Water/Tree |

---

## Data Files Required in `dist/data/`

- [ ] `worlds.hash.json` — World definitions (harbor, racing world, etc.)
- [ ] `maps.hash.json` — Map grid, objects, MapImage/Topology refs
- [ ] `objects.hash.json` — Destinations, custom objects, DirResource→movie#
- [ ] `parts.hash.json` — Boat parts (hulls, sails, rudders, engines, deco)
- [ ] `part_names.json` — Display names for parts
- [ ] `missions.hash.json` — Mission definitions
- [ ] `subtitles/english/*.json` — Per-scene subtitles
- [ ] `subtitles/swedish/*.json` — Per-scene subtitles (optional)
- [ ] `score/*.json` — Minigame score data (if applicable)

---

## Assets Packs Required (from `assets.yml` → `dist/assets/*.json`)

- [ ] `ui.json` — Cursors, loading, common UI
- [ ] `shared.json` — 00.CXT common assets
- [ ] `cutscenes.json` — Cutscene backgrounds
- [ ] `characters.json` — Character sprites
- [ ] `boatparts.json` — (was `carparts`) Boat part images from CDDATA
- [ ] `junk.json` — 02.DXR boatyard
- [ ] `garage.json` — 03.DXR boat building
- [ ] `yard.json` — 04.DXR harbor
- [ ] `driving.json` — (was `driving`) 05.DXR sailing UI
- [ ] `map.json` — CDDATA map tiles
- [ ] `topography.json` — Topography atlas
- [ ] `album.json` — 06.DXR load/save
- [ ] `fileBrowser.json` — 13.DXR
- [ ] `diploma.json` + `diploma-strings.json` — 08.DXR
- [ ] `menu.json` — 10.DXR main menu
- [ ] `solhem.json` — 11.DXR character scene
- [ ] Per-mission packs: `dive.json`, `boatshow.json`, `birgit.json`, `preacher.json`, `sam.json`, `sur.json`, `mia.json`, `viola2.json`, `water.json`, `sven.json`, `factory.json`, `tree.json`

---

## Build Pipeline Adaptation Checklist

- [ ] Update `build_scripts/build.py`:
  - [ ] Remove `download` stage (use local ISO)
  - [ ] Remove `download_plugin` (no plugin.exe)
  - [ ] Fix `scores` stage (no 82.DXR, adapt for boat minigames)
  - [ ] Fix `copy_images` (no PLUGIN.CST, use boat equivalents)
  - [ ] Verify `topography.py` range 693–748 for CDDATA.CXT
- [ ] Rewrite `build_scripts/assets/assets.yml` for boat game movies/members
- [ ] Run `mulle.py` → copy `gamedata/*.hash.json` to `data/`
- [ ] Create `data/part_names.json` for boat parts
- [ ] Create subtitle JSONs
- [ ] Symlink `assets_sv/` → `dist/assets/`
- [ ] Compile `npx sass src/style.scss dist/style.css`
- [ ] Run `html_css` stage for index.html, progress/, info/

---

## Runtime Code Changes Needed

- [ ] `src/game.js`: Replace scene map (movie# → state) for boat movies
- [ ] `src/game.js`: Change `'Da Hood'` → boat world name(s)
- [ ] `src/scenes/world.js`: Sailing mechanics (replace driving)
- [ ] `src/scenes/garage.js`: Boat building (replace car building)
- [ ] `src/scenes/junk.js`: Boatyard (replace junkyard)
- [ ] `src/scenes/yard.js`: Harbor (replace yard)
- [ ] `src/objects/drivecar.js` → `driveboat.js`: Sailing physics
- [ ] `src/objects/carpart.js` → `boatpart.js`: Hull/sail/rudder/engine
- [ ] `src/struct/cardata.js` → `boatdata.js`: Boat stats (buoyancy, sail area, rudder, etc.)
- [ ] `src/struct/savedata.js`: Default junk piles → boatyard piles
- [ ] `src/objects/actor.js`: Character animations for boat NPCs
- [ ] `src/scenes/menu.js`: "bygg båtar" text
- [ ] All mission scenes: New implementations for 70–88.DXR