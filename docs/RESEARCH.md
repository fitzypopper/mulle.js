# Research — *Bygg båtar med Mulle Meck* (1998)

Web research companion to `INVENTORY.md` (movie/cast inventory) and `EXTRACTION.md`
(how to get the data out of the ISO). Everything below is from web sources + local
measurements of our own ISO; every non-obvious claim carries an `[S#]` marker that
points at the full URL in **Sources** at the bottom.

Access notes: MobyGames blocks direct fetches (403 → Wayback snapshots used);
`bugs.scummvm.org` / `wiki.scummvm.org` / `forums.scummvm.org` sit behind an Anubis
JS challenge → Wayback snapshots, `lists.scummvm.org` mirrors and GitHub used instead.

---

## 1. Fast facts

| Field | Value | Ref |
|---|---|---|
| Title (SV) | Bygg båtar med Mulle Meck | [S1] |
| Developer | ELD Interaktiv Produktion AB | [S1][S4] |
| Publishers | Levande Böcker i Norden AB (SE), Pan Vision Finland / Elävät Kirjat Oy (FI), Terzio, Möllers & Bellinghausen Verlag (DE), Transposia (NL), Enlight Interactive | [S1][S4] |
| Release | 1998 (Sweden, Windows + Mac OS Classic); Finland 1999 | [S1][S8][S4] |
| Platform / media | Win95/98 + Mac OS 8 (PowerPC), **1 CD**, 640×480/256 colours, 4× CD, P75/16 MB/10 MB | [S4][S17] |
| Localized titles | DE *Schiffe bauen mit Willy Werkel*; NL *Miel Monteur – Recht Door Zee!*; NO *Bygg båter med Mulle Mekk*; FI *Rakenna veneitä Masa Mainion kanssa*; DA *Byg båd med Mulle Meck*; HU *Barkács Balázs: Hajót Épít* | [S8][S10] |
| Languages | PCGamingWiki lists **Swedish + German** only, but ScummVM detection + national library catalogs prove NO/NL/FI/DA releases exist — treat PCGW's localization table as incomplete | [S4][S10][S12] |
| ISBN / EAN | ISBN-10 9171933093, EAN 9789171933096 (MobyGames release data) | [S8] |
| Age / price at launch | "Från 6 år", rek. pris 499 kr, PC/Mac | [S17] |
| DRM | Swedish retail: none listed; **German retail: disc check** | [S4] |
| Series | 2nd of 5 (cars 1997 → boats 1998 → planes 2000 → houses 2002 → space 2004), based on books by George Johansson & Jens Ahlbom, publisher Levande Böcker | [S2][S3] |
| Award | *Impuls Gütesiegel 2000* for the boats game; Guldklappan 1999 nomination (Education category) | [S3][S17] |
| Press | Göteborgs-Posten 4/5 ("grafiken är härlig…"); Helsingborgs Dagblad "Genommysigt, halvknasigt men mycket roligt" | [S1] |
| MobyGames ID | 65424; a separate **Specialversion (1999)** entry is game ID 109437 | [S8][S1] |

Special/derived editions:

- **Hemglass special version** — distributed via the ice-cream-truck company; confirmed both by
  Swedish Wikipedia and a GOG Dreamlist memory ("the version made in cooperation by Hemglass") [S1][S5].
- **"Parts package"** free expansion: drop downloaded `*.cst` files into a `Plugins/` directory in the
  game folder; the stock floor only shows a limited number at a time, restart to see more [S4].
- **Planera med Mulle Meck** (1999 calendar/planner CD): if installed, grants **12 extra spare parts** [S1].
- archive.org hosts a **"Förbättrad Version"** (bugfix patch) with a changelog: Fältings stuga mapping,
  Vrakviken diving-suit message, Långfärdsmedaljen awarded at Svarte Sven, announcer voice, engine sounds [S15].

## 2. Story & gameplay loop

- Intro: Mulle drives to the end of a road, builds a rowing boat, paddles on, reaches a shipyard whose
  owner asks him to mind the yard while she sails around the world → you inherit the yard [S3].
- You build a boat hull on the slipway (wood or metal), then drag-and-drop parts from your storage onto
  the template — the same building system as the cars game; there is **no final objective**, you gather
  parts, keep building and exploring [S3][S14].
- Boat parts are bought from **Doris Digital** [S3].
- Sailing: HUD with compass/speed/fuel/food, windsocks, sails/oars, tug-boat rescue, two gas stations
  (Flaskön, and left of Dödskalleön), surströmming factory haul to Myrarna pays in food + fuel [S14][S5].
- **Radio** announces new parts, weather, and friends' requests — sailing in/out of the vault repeatedly
  triggers part drops [S5][S14].
- Friends' **mini-games** award boat parts; one boat at a time, an "album" save, boat-file sharing, and a
  "Fun boat"/diploma competition [S14][S9][S36].
- Playable in **browser via QEMU** on yag.im (no install) [S18]; a speedrun scene exists
  (Any% PB 9:04 RTA playlist) [S19].

## 3. Characters & voice cast

Cast (Swedish original) per Swedish Wikipedia [S1] (roles in MobyGames credits [S9] match):

| Voice actor | Character |
|---|---|
| Lennart Jähkel | Mulle Meck |
| Dan Halleman | Doktor Beinbruch |
| Malin Sköld | Doris Digital |
| Gustav Forsberg | Erson (Erik Erzon) |
| Ulla-Carin Nyqvist | Mia Minardi |
| Isabelle Rhedin-Hüttner | Pia Pegg |
| Helen Ardelius | Prinsessan |
| Dave Nerge | Sam Scribbler |
| Bosse Löthén | Svarte Sven |
| Lisa Indahl | Viola Wallmark |
| Erik Johansson | Väderleksuppläsaren (weather announcer) |

Other crew (MobyGames credits [S9]): producer Pelle Lind (ELD), exec producer Jonas Ryberg, project
manager Lotta Nylander, writing Jens Ahlbom / Jonas Beckeman / George Johansson / Nylander / Ryberg,
programming Beckeman / Martin Nordlöf / Johan Svensson, art Peter Jansson, sound design Niklas Billström,
music Örjan Lidén.

**Which of the "known" Mulle NPCs are actually in the boats game** (cross-checked against the two
Wikipedia cast lists [S1][S2]):

| NPC | In boats? | Notes |
|---|---|---|
| Bagar-Birgit | ✅ | Holds Svarte Sven's dog; the Princess is found at her place after the dog run [S5] |
| Sam Scribbler | ✅ | Dave Nerge; diary → Vrakviken map piece [S1][S5] |
| Viola Wallmark | ✅ (also cars) | Lisa Indahl in boats, Helen Ardelius in cars [S1][S2] |
| Mia Minardi | ✅ (also cars) | Ulla-Carin Nyqvist in both [S1][S2] |
| Svarte Sven | ✅ | Bosse Löthén in boats; same actor plays **Sture Stortand** in cars [S1][S2] |
| Doris Digital | ✅ (also cars) | Sköld (boats) / Peterson (cars); the parts vendor [S1][S2][S3] |
| Erson | ✅ | phone recovery + refloat quests [S1][S5] |
| Domaren (boat-show judge) | ✅ | awards the *Kul Båt* medal; not in any published cast list [S5] |
| Prästen / pastorn | ✅ (quest only) | the pastor whose **Bible** you deliver 3× → church pews; appears in quest text and in community video titles, *not* in the credited cast [S5][S20] |
| Pia Pegg, Dr Beinbruck | ✅ phone-only | you never meet them, they call [S5] |
| **Sture Stortand** | ❌ cars only | cars cast [S2] |
| **Ludde Labb** | ❌ cars only | cars cast (Gustav Forsberg) [S2] |
| **Figge Ferrum** | ❌ cars only | cars cast (Pelle Lind) [S2] |
| Gaston Garcon | ❌ cars only | [S2] |

The official site's characters page (Veronika/Viola Wallmark, Figge Ferrum, Doris Digital, Emma
Entreprenör, Daisy Diesel, Sam Scribbler & Gårdån Van Gågg, Musen Mikro, Mia Minardi, Naveen Navigator,
Erik Erzon, Benno Brambilla, Gaston/Gabriella) is book-series oriented, not a per-game cast list [S16].

## 4. Missions, quest chains & medals

From the fuska.se Q&A (last updated **June 2004**; user-submitted Swedish walkthrough knowledge) [S5]:

**Mia Minardi** (Labyrinthavet) — three-stage chain:
1. 1st visit → get the big **water tank**.
2. 1st boat trip with her kids → **compass** (needed to find Svarte Sven through the fog).
3. 3rd delivery of the **Bible** → **church pews**; with pews on board the kids come along on the boat
   trip → **fishing rod** (metspö).

**Viola Wallmark** — water the tank at her garden → carry it to **Storön** to water her crops; scythe
earned from the dog quest is used to harvest algae in her garden → **diving helmet** lies there.

**Svarte Sven** — 1st visit: chart piece to Fabian Fälting's cabin. Later: fetch his **dog** at
Bagar-Birgit's (requires: visited Sven, got the Fälting chart piece + diving-suit quest, visited Fälting
and picked up the suit, **built ≥12 boats**; Sven then calls on the radio) → reward **scythe**.

**Fabian Fälting's cabin** — upriver past Sam Scribbler's house, keep right, shallow-draft boat only;
2nd visit → **diving suit**.

**Sam Scribbler** — deliver the **diary** → **Vrakviken** chart piece (dive site → Dykmedaljen).

**Erson** — recover his mobile phone (needs **full** diving suit: helmet + suit); refloat his boat
(needs a **really strong motor**).

**Pia Pegg** / **Dr Beinbruck** — phone-only: find the swimming ring / the doctor's bag.

**Other logistics** — surströmming factory → Myrarna needs a *big* boat (pays food + fuel); two gas
stations (Flaskön and left of Dödskalleön); Storön lies NE of Flaskön; part of the sea chart arrives
later and reveals Storön and Svarte Sven's island.

**Six medals** (one boat can hold several, they never run out) [S5]:

| Medal | How |
|---|---|
| Lyxmedalj | take the Prinsessan out for a ride (build the boat luxurious enough) |
| Kul Båt-medalj | from the **domaren** at the boat show |
| Snabb båt-medalj | beat the record on the race track |
| Lastbåtsmedalj | load surströmming at the factory |
| Dykmedaljen | dive in Vrakviken with the full diving suit |
| Långfärdsmedaljen | make it all the way out to Svarte Sven |

A diploma/awards screen exists in the engine (`08.DXR`, "Diploma / awards") — see `INVENTORY.md`.

## 5. Game structure (`.dxr` numbering, saves, `DATA.CST`)

Cross-reference: the authoritative local inventory is `INVENTORY.md` (46 movies extracted). Summary
relevant to research:

- **Movie numbering**: system/UI movies `00–15` (00 = shared cast, 01 = intro, 02/03 = yard/building,
  04 = harbour, 05 = overworld sailing + map, 06 = load/save, 08 = diploma, 10 = main menu, 11 = dialogue,
  13/14 = file browser, 15 = multi-background); **mission movies `70–88`** (gaps: 72–75, 82); plus
  `LB*.DXR` (Levande Böcker intro/credits/web dialogs), `LBDEMO.DXR`, `SHOWBOAT.DXR`, standalone
  `*.CXT` banks (`00`, `CDDATA`, `LBPROFIL`, `SAIL`, `BL*` 400-frame sequences) [S21].
- Guesses for individual mission movies (from member names, **unverified**): 70/71 Erson, 76 judge/boat
  show, 77 Birgit/dogs, 78 preacher (→ the Bible/pastor quest), 80 Sam, 83 Mia, 84 Viola, 86 Sven,
  87 dive/factory [S21].
- **`DATA.CST` = the save file.** PCGamingWiki: save-game location is `<path-to-game>\DATA\DATA.CST` [S4].
  Locally it is a Director cast with **11 text members** = the game databases: `PartsDB`, `WoodHullsDB`,
  `MetalHullsDB`, `RuddersDB`, `WorldsDB`, `mapsDB`, `CustomRacingDB`, … [S21].
- Parts **packs are also `.cst`**: the free "Parts package" expansion is installed by dropping `*.cst`
  files into `Plugins/`, and the game's stock floor then offers them [S4] — the local `TEMPPLUG.CXT`
  ("temp plugin placeholder") and `LBDLGWEB.DXR` ("web dialog – Levande Böcker extras") fit that flow [S21].
- `CDDATA.CXT` (2297 members) holds common data: `20b*` boat parts, `30b*` map tiles, `30t*` topography,
  `Part*DB` texts [S21].
- Save quirk on modern Windows: without a `Schiffe\` directory the game throws
  **"Problem creating file (-43)"** when saving [S4].

## 6. ScummVM / Director support

ScummVM's Director engine uses game IDs `garygadget1`…`garygadget5` (1 = cars, 2 = **boats**, 3 = planes,
4 = houses, 5 = space) [S12].

**All `garygadget2` (boats) detection entries** (from `engines/director/detection_tables.h`, master,
fetched 2026-10-01) [S12]:

| Platform | Language | File / size | Director |
|---|---|---|---|
| Mac | DE | `Schiffe bauen mit Willy` (r:1eb3e6dd…), 1032378 | D602 |
| Mac | NL | `Game` + `Movies/StartCD.dxr`, 1030105 / 23925 | D600 |
| Win | DE | `Willy2.exe` t:abd57254… 1507905 + `Movies/01.dxr` f:096cba8d… 1778244 | **D650** |
| Mac | NO | `xn--Bygg bter med Mulle Mekk-lcc`, 1034678 | D602 |
| Win | NO | `Mullebat.exe` t:1bb82554… 1522688 | D602 |
| Win | NL | `okki.exe` t:31626933… 2513593 | **D851** ("Dutch Windows version on same disc is D8") |

**There is no `Common::SV_SWE` entry for `garygadget2`** — the Swedish Windows/Mac discs are therefore
*not* recognised and fall through to the generic `director-win-fallback` ("unknown game variant") path.
That is not hypothetical for our disc: measured against the local ISO [S21]:

| File | Local MD5 / size | Table expects |
|---|---|---|
| `iso/Mullebat.exe` (dated 1998-11-24) | `1e2a2f3b74b34f5e96a3e4777d2d6327`, **1515691** | NO entry: `1bb8255461245bc03a78c6c5079efd6e`, **1522688** |
| `iso/Movies/01.dxr` (dated 1998-12-16) | `5b54f163af80a659e60951656820c41e`, **1911100** | DE entry: `096cba8d6b02e765977e16fcea867398`, **1778244** |

So the Swedish build is a genuinely different variant (name coincidence on `Mullebat.exe`), and its
Director version is unstated in the table — likely D6-range like its siblings.

Other status facts:

- Every Director entry in that region is flagged **`ADGF_UNSTABLE`** (`#define SUPPORT_STATUS
  ADGF_UNSTABLE`, `detection_tables.h`, redefined at lines 1969/2470/8420) → the whole engine is
  marked unstable, `garygadget*` included [S12].
- The ScummVM wiki page `Director/Games` (Wayback snapshot 2024-03-08) contains **no** Mulle Meck /
  Gary Gadget / Willy Werkel row at all [S13]; the scummvm.org compatibility chart (DEV, updated
  2026-09-30) likewise has no `garygadget` rows [S11].
- ScummVM's end-of-year Director roundup (2023-12-14): engine could detect 1595 Director titles, D2–D5
  preliminary in 2.8.0, and — verbatim — *"This is why D6 and higher games will not open at all, even if
  the code we have would somewhat work"* [S16a]. Since the DE boats build is D650 and the NL Windows build
  is D851, **even the detected variants are D6+** → the boats game is currently outside what the engine
  opens.

### Fate of the *cars* game (`garygadget1`)

- Swedish cars detection was **only added on 2026-06-11**: commit
  `ac5c659d7e706fdfab3abfcea4c16c9a35e79601` — *"DIRECTOR: Add detection for gary gadget swedish — Fix
  #16637"* by tag2015 (Walter Agazzi). It adds exactly two lines: `MACGAME1_l("garygadget1", …,
  "Bygg bilar med Mulle Meck", …, Common::SV_SWE, 600)` and `WINGAME1_l("garygadget1", …,
  "DATA/MULLE32.EXE", t:a559c8b9…, 1512594, Common::SV_SWE, 600)` [S14a].
- Ticket **#16637** (reported by williamronn 2026-03-25, folder `Mulle-Meck_Bygger-Bilar_Svenska`,
  exe `MULLE16.EXE` t:eb0b641f… 1134544 B, originally classified as `director-win-fallback`) was closed
  2026-06-11 as fixed by that changeset [S15a]. Note the fix matches `MULLE32.EXE`, **not** the reported
  `MULLE16.EXE`, which still has no table entry.
- **No boats ticket exists**: the `lists.scummvm.org` tracker mirrors for 2023-01 … 2026-09 contain only
  one Mulle-related ticket, #16637 (#16187 = Critical Path, #16188 = Gadget: Invention — different
  games) [S16b]. **⇒ Actionable: the Swedish boats disc (`Mullebat.exe` md5/size above) could be proposed
  upstream the same way the cars Swedish detection was.**

## 7. Community & reimplementation projects

| Project | What it is | Ref |
|---|---|---|
| `datagutten/mulle.js` | JS/HTML5 reimplementation of the **cars** game; `extract_iso.py`/`extract.py` → npm build → localhost:8080, needs the original ISO; upstream of this project | [S22] |
| `niclaslindstedt/mulle` | upstream repo referenced by mulle.js | [S23] |
| `ThisLimn0/OpenWilly` | Rust **clean-room Director 6** DXR/CXT parser + player (crates `openwilly-player/-iso/-fileio/-keypoll`, minifb 640×480), primary target "Autos bauen", **explicitly lists *Schiffe bauen mit Willy Werkel* as a supported target**; uses mulle.js as behavioural spec; `docs/GAPS.md`; MIT/Apache | [S24] |
| `Yepoleb/willywerkel` | RE docs for the **planes** game: map people/locations (x, y, radius), mission lists (Roy/Viola/Doris/Viktor/Pelle), landing-gear requirements, `savefile.py` (IFF `user0.dat` chunks `USERNAME/MISS/INVI/PHOT/DIPL/BARN/AIRP`), `uppackage.py`, `gtifile.py` | [S25] |
| `datagutten/ShockwaveParser` | Python Shockwave/Director parser used by our extraction (`pip` dep in `EXTRACTION.md`) | [S26] |
| `wolffbe/willywerkel` | C# patcher making the cars game run on modern Windows | [S27] |
| `SuperDOS/mmbilarsrc` | archived source assets of the cars game (12★) | [S28] |
| `Roker2/PetrCarGame` | C++ cars-game reimplementation | [S29] |
| `robSharpe/mulle-meck` | HTML/JS take | [S30] |
| `henkery/openMulle` | Bevy (Rust) engine port attempt | [S31] |
| `PepperoniPingu/Fulle-Meck` | experimental fork/derivative | [S32] |
| speedruns | YouTube playlist "Bygg Båtar med Mulle Meck Any% PBs" (WR 9:04 RTA) | [S19] |
| yag.im | browser-playable via QEMU emulator, Swedish build | [S18] |
| GOG Dreamlist | 600 votes / 3 stories (Hemglass version memory, Dutch translation memory) — **not sold on GOG** | [S33] |

Official franchise status: mullemeck.se says the old games are *not* sold by them (second-hand only,
playable at "Mulle Meck in Glada Hudik") and that **Shaping Games** has been licensed to make a new game
series, expected "within two years" (site as of 2026) [S16b2].

## 8. Running it today (workarounds)

- **Windows**: German retail installer breaks on modern Windows; manual install = copy CD →
  `C:\Terzio\Willy2\`, move `SETUP\*` up, **create `Schiffe\`** (else save error `-43`), run
  `WILLY2.EXE` with Win7 compat / 8-bit colour / 640×480 / admin [S4][S39].
- **Windows XP**: unplayable on some XP versions; official Terzio patch is dead (Wayback link only) [S4][S37].
- **Emulation**: 86Box + Win98 reported working by the community; also DOSBox-X/PCem-style setups and
  yag.im's hosted QEMU [S18].
- **Downloads**: MyAbandonware has the 1998 release and the 1999 Specialversion; archive.org has the
  Swedish Windows + Mac ISOs and the "Förbättrad Version" patch [S34][S35][S14][S15].
- **Extras**: archived affenterz.de "Willy" downloads page is where the free `*.cst` Parts-package files
  came from [S38].

## 9. Open questions / gaps

1. **Mission-movie ↔ NPC mapping** in `INVENTORY.md` is inferred from member names only; needs
   confirmation by reading the Lingo in `70–88` (candidate walkthroughs: fuska.se [S5], Swedish
   YouTube let's-plays).
2. **Director version of the Swedish boats build** — not in the ScummVM table; needs an actual
   read of the `.dxr`/exe version bytes (our `01.dxr` is 1911100 bytes, ≠ DE's 1778244).
3. **A ScummVM detection ticket for garygadget2/SV** has never been filed (verified against tracker
   mirrors 2023-01…2026-09 [S16b]) — the md5/size evidence in §6 is ready to submit.
4. Whether ScummVM ≥ 2.9/3.0 has moved D6 support past "will not open at all" [S16a] — check the
   latest Director roundups before quoting status.
5. PCGamingWiki claims only SV+DE localizations [S4]; national-library records and ScummVM show
   NO/NL/FI/DA builds — the exact release matrix (which publisher shipped what, in which year) is
   still only partially documented.
6. The full *Planera med Mulle Meck* 12-part integration and where those parts live in `DATA.CST` /
   `CDDATA.CXT` is unverified.

---

## Sources

| # | Source |
|---|---|
| S1 | Swedish Wikipedia — *Bygg båtar med Mulle Meck*: https://sv.wikipedia.org/wiki/Bygg_b%C3%A5tar_med_Mulle_Meck |
| S2 | Swedish Wikipedia — *Bygg bilar med Mulle Meck* (cars cast): https://sv.wikipedia.org/wiki/Bygg_bilar_med_Mulle_Meck |
| S3 | English Wikipedia — *Gary Gadget* (series, mechanics, boats intro, awards): https://en.wikipedia.org/wiki/Gary_Gadget |
| S4 | PCGamingWiki — *Bygg Båtar med Mulle Meck* (saves, Parts package, sysreqs, DRM, install workarounds): https://www.pcgamingwiki.com/wiki/Bygg_B%C3%A5tar_med_Mulle_Meck |
| S5 | Fuska.se — *Frågor och svar till Bygg Båtar med Mulle Meck* (mission chains + six medals, upd. 2004-06): https://fuska.se/spel/bygg-batar-med-mulle-meck/fusk/fragor-och-svar |
| S6 | Fuska.se — game hub: https://fuska.se/spel/bygg-batar-med-mulle-meck |
| S7 | Fuska.se — reviews (gameplay description): https://fuska.se/spel/bygg-batar-med-mulle-meck/omdomen |
| S8 | MobyGames — releases/aka/ISBN (direct fetch 403; Wayback 2023-10-15): https://web.archive.org/web/20231015014035/https://www.mobygames.com/game/65424/bygg-batar-med-mulle-meck/ |
| S9 | MobyGames — credits (Wayback 2023-10-14): https://web.archive.org/web/20231014123859/https://www.mobygames.com/game/65424/bygg-batar-med-mulle-meck/credits/ |
| S10 | MobyGames — main page/description (Wayback 2023-03-24): https://web.archive.org/web/20230324191901/https://www.mobygames.com/game/65424/bygg-batar-med-mulle-meck/ |
| S11 | ScummVM compatibility chart (DEV, upd. 2026-09-30 — no garygadget rows): https://www.scummvm.org/compatibility/ |
| S12 | ScummVM `engines/director/detection_tables.h` (master, fetched 2026-10-01): https://raw.githubusercontent.com/scummvm/scummvm/master/engines/director/detection_tables.h |
| S13 | ScummVM wiki *Director/Games* (Wayback 2024-03-08 — no Mulle entries): https://web.archive.org/web/20240308083947/https://wiki.scummvm.org/index.php/Director/Games |
| S14 | archive.org item *bygg-batar-med-mulle-meck* (gameplay text + ISOs): https://archive.org/details/bygg-batar-med-mulle-meck |
| S14a | GitHub commit `ac5c659` — "DIRECTOR: Add detection for gary gadget swedish / Fix #16637": https://github.com/scummvm/scummvm/commit/ac5c659d7e706fdfab3abfcea4c16c9a35e79601 |
| S15 | archive.org item *mulle-meck-batar* ("Förbättrad Version" changelog, Windows + Mac ISO): https://archive.org/details/mulle-meck-batar |
| S15a | ScummVM Trac ticket #16637 (Swedish cars detection; behind Anubis — read via tracker mirror/GitHub): https://bugs.scummvm.org/ticket/16637 |
| S16 | mullemeck.se — characters (book-series character list): https://www.mullemeck.se/characters/ |
| S16a | ScummVM news 2023-12-14 — *End of year Director roundup* ("D6 and higher games will not open at all"): https://www.scummvm.org/news/20231214/ |
| S16b | ScummVM tracker mailing-list mirrors (2023-01…2026-09, grepped for Mulle/ticket numbers): https://lists.scummvm.org/pipermail/scummvm-tracker/ (e.g. `2026-June.txt.gz`) |
| S16b2 | mullemeck.se — Games page (Shaping Games licence, Glada Hudik, not sold): https://www.mullemeck.se/new-game/ |
| S17 | Levande Böcker official product page (Wayback 2001-04-18): http://web.archive.org/web/20010418194909fw_/http://www.levande.se/product.idc?prodid=mullebat |
| S18 | yag.im — browser-playable Swedish build: https://yag.im/games/1016/bygg-batar-med-mulle-meck |
| S19 | YouTube — *Bygg Båtar med Mulle Meck Any% PBs* speedrun playlist: https://www.youtube.com/playlist?list=PLeiwFPv5xxwPSjCQUFtQV5cjOJyOtB_UB |
| S20 | TikTok (@nostalgitaget) — "Bygg båtar med Mulle Meck och pastorns Bibel" (corroborates the pastor/Bible quest): https://www.tiktok.com/@nostalgitaget/video/7156583793564962053 |
| S21 | Local extraction of `~/Downloads/MULLEBAT (Windows).iso` — `docs/INVENTORY.md` + `docs/EXTRACTION.md` in this repo (46 movies, DATA.CST DBs, file md5/size measurements) |
| S22 | GitHub `datagutten/mulle.js`: https://github.com/datagutten/mulle.js |
| S23 | GitHub `niclaslindstedt/mulle`: https://github.com/niclaslindstedt/mulle |
| S24 | GitHub `ThisLimn0/OpenWilly`: https://github.com/ThisLimn0/OpenWilly |
| S25 | GitHub `Yepoleb/willywerkel`: https://github.com/Yepoleb/willywerkel |
| S26 | GitHub `datagutten/ShockwaveParser`: https://github.com/datagutten/ShockwaveParser |
| S27 | GitHub `wolffbe/willywerkel`: https://github.com/wolffbe/willywerkel |
| S28 | GitHub `SuperDOS/mmbilarsrc`: https://github.com/SuperDOS/mmbilarsrc |
| S29 | GitHub `Roker2/PetrCarGame`: https://github.com/Roker2/PetrCarGame |
| S30 | GitHub `robSharpe/mulle-meck`: https://github.com/robSharpe/mulle-meck |
| S31 | GitHub `henkery/openMulle`: https://github.com/henkery/openMulle |
| S32 | GitHub `PepperoniPingu/Fulle-Meck`: https://github.com/PepperoniPingu/Fulle-Meck |
| S33 | GOG Dreamlist — *Bygg Båtar med Mulle Meck (1998)*, 600 votes / 3 stories: https://www.gog.com/dreamlist/game/bygg-batar-med-mulle-meck-1998 |
| S34 | MyAbandonware — 1998 release: https://www.myabandonware.com/game/bygg-baatar-med-mulle-meck-xde |
| S35 | MyAbandonware — *Specialversion (1999)*: https://www.myabandonware.com/game/bygg-baatar-med-mulle-meck-specialversion-xdf |
| S36 | IMDb — *Bygg båtar med Mulle Meck* (tt32875192): https://www.imdb.com/title/tt32875192/ |
| S37 | Wayback — archived Terzio patch info for *Schiffe bauen mit Willy Werkel*: https://web.archive.org/web/20090331113913/http://www.terzio.de/produkte/161/Schiffe_bauen_mit_Willy_Werkel.html |
| S38 | Wayback — archived affenterz.de "Willy" download page (Parts package `.cst` files): https://web.archive.org/web/20080918045639/http://www.affenterz.de/willy |
| S39 | willywerkel.weebly.com — German-version install guide cited by PCGamingWiki: https://willywerkel.weebly.com/schiffe-bauen.html |
