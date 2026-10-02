/**
 * World / sailing scene - Director movie 05.DXR.
 *
 * This is a port of the original movie:
 *
 *   ParentScript 2   - Dir               (state machine, map switching)
 *   ParentScript 3   - DrivingHandlers   (key polling / headings)
 *   BehaviorScript 7 - TransToNextMovie  (scene transitions)
 *   BehaviorScript 78 - MapDisplay       (the over-view map)
 *   ParentScript 171 / 170 - SelectorMaster / TypeSelectButton
 *   plus the boat, weather and sound modules in objects/boat/*.
 *
 * @module scenes/world
 */
'use strict'

import MulleState from './base'
import MulleSprite from '../objects/sprite'
import MulleSave from '../struct/savedata'
import {
  g, SailSound, random, point, checkRadius, lookUpInventory, setInInventory
} from '../objects/boat/lingo'
import { BoatBase } from '../objects/boat/boatbase'
import {
  LoopHandler, Weather, WeatherRenderer, MulleSez, AmbienceSound
} from '../objects/boat/weather'
import { refreshBoatProperties, getPartProperties, findPossiblePowers } from '../objects/boat/props'

/* -------------------------------------------------------------------------
 * Score layout
 *
 * Sprite numbers are the original channel numbers, sort order is the z order
 * of the score. Positions are the "loc" of the sprite, i.e. the registration
 * point - MulleSprite uses the frame regpoint as the pivot so the rendered
 * top left corner ends up at `loc - regPoint`, exactly like Director.
 * ---------------------------------------------------------------------- */

const SPRITE_LAYOUT = [
  [15, 321, 202, '05.DXR', 144], // #Water  Weather1
  [18, 320, 202, null, null], // #UnderMap
  [20, 0, 0, null, null], // #waves
  [21, 0, 0, null, null],
  [22, 0, 0, null, null],
  [23, 0, 0, null, null],
  [24, 0, 0, null, null],
  [25, 334, 148, null, null],
  [26, 0, 0, null, null],
  [27, 0, 0, null, null],
  [28, 0, 0, null, null],
  [29, 334, 148, null, null],
  [34, 320, 202, null, null], // #map
  [36, 0, 0, null, null], // #ObjectsUnder
  [37, 0, 0, null, null],
  [38, 334, 148, null, null],
  [39, 0, 0, null, null],
  [40, 0, 0, null, null],
  [41, 334, 148, null, null],
  [42, 320, 239, null, null], // #boat
  [43, 320, 240, null, null], // #Sail
  [44, 321, 202, null, null], // #Fog
  [45, 0, 0, null, null], // #ObjectsOver
  [46, 0, 0, null, null],
  [47, 334, 148, null, null],
  [48, 0, 0, null, null],
  [49, 0, 0, null, null],
  [50, 334, 148, null, null],
  [52, 320, 240, '05.DXR', 153], // frame border
  [53, 320, 240, '05.DXR', 154],
  [54, 320, 240, '05.DXR', 155],
  [55, 320, 240, '05.DXR', 156],
  [57, 321, 202, null, null],
  [59, 320, 240, '05.DXR', 185], // HUD panel
  [60, 319, 220, null, null],
  [64, 36, 366, null, null], // #Stroot  wind vane
  [65, 320, 240, null, null], // #BoatTypes
  [66, 320, 240, null, null],
  [67, 320, 240, null, null],
  [68, 320, 240, '05.DXR', 173], // #HelpButton
  [70, 165, 244, '05.DXR', 197], // speed meter
  [72, 250, 445, '05.DXR', 117], // fuel meter
  [74, 320, 240, '05.DXR', 187], // hunger meter
  [75, 320, 240, null, null], // #TRANS
  [76, 0, 0, null, null],
  [77, 0, 0, null, null],
  [79, 320, 240, '05.DXR', 79], // #MapOverview  litenkarta
  [80, 0, 0, null, null], // map region picture
  [81, 635, 423, '05.DXR', 77], // boat marker on the over-view map
  [91, 0, 0, null, null], // #medal / #dialog
  [92, 0, 0, null, null], // #DialogOverlay
  [93, 0, 0, null, null],
  [94, 0, 0, null, null],
  [95, 0, 0, null, null],
  [96, 0, 0, null, null],
  [97, 0, 0, null, null],
  [98, 0, 0, null, null],
  [99, 0, 0, null, null],
  [100, 0, 0, null, null],
  [101, 0, 0, null, null],
  [102, 0, 0, null, null],
  [106, 673, 440, null, null], // #ToolBox (kept off screen, art missing)
  // BehaviourScript 7 - TransToNextMovie paints on the hardcoded channel 120,
  // which has no score entry of its own (score index 123 = sprite 120). It is
  // last in the list so it draws on top of everything else.
  [120, 320, 240, null, null]
]

const SPRITE_LIST = {
  '#Water': 15,
  '#UnderMap': 18,
  '#waves': 20,
  '#map': 34,
  '#ObjectsUnder': 36,
  '#boat': 42,
  '#Sail': 43,
  '#Fog': 44,
  '#ObjectsOver': 45,
  '#Stroot': 64,
  '#BoatTypes': 65,
  '#HelpButton': 68,
  '#speed': 70,
  '#fuel': 72,
  '#hunger': 74,
  '#TRANS': 75,
  '#MapOverview': 79,
  '#medal': 91,
  '#dialog': 91,
  '#DialogOverlay': 92,
  '#ToolBox': 106,
  '#TransToNext': 120
}

const CHEAT_BOAT_PARTS = [724, 848, 792, 123, 162, 120, 178]

/**
 * The default save has no usable drive, in which case the original falls back
 * to the "CheatBoat" parts. This has to happen before preload() because the
 * boat cast library (BS/BM/BL x W/S) is picked from the mounted parts.
 *
 * @param  {MulleGame} game Main game
 * @return {Object}         Refreshed boat properties
 */
function ensureDrivableBoat (game) {
  let props = refreshBoatProperties(game)

  if (findPossiblePowers(props).length === 0) {
    console.warn('[world] CheatBoat!')
    game.mulle.user.Car.Parts = CHEAT_BOAT_PARTS.slice()
    props = refreshBoatProperties(game)
  }

  return props
}

/* -------------------------------------------------------------------------
 * Frame lookup helpers
 * ---------------------------------------------------------------------- */

const warnedMembers = {}

function warnMissing (movie, member) {
  const key = movie + '_' + member
  if (warnedMembers[key]) return
  warnedMembers[key] = 1
  console.warn('[world] member not found', movie, member)
}

let FRAME_INDEX = null

function buildFrameIndex (game) {
  if (FRAME_INDEX) return FRAME_INDEX

  const byMovie = {}
  const byName = {}

  const keys = game.cache.getKeys(Phaser.Cache.IMAGE)

  for (const key of keys) {
    const img = game.cache.getImage(key, true)
    if (!img || !img.frameData) continue

    const frames = img.frameData.getFrames()
    for (const f in frames) {
      const fr = frames[f]

      if (fr.dirFile && fr.dirNum !== undefined && fr.dirNum !== null) {
        if (!byMovie[fr.dirFile]) byMovie[fr.dirFile] = {}
        if (byMovie[fr.dirFile][fr.dirNum] === undefined) {
          byMovie[fr.dirFile][fr.dirNum] = [key, fr.name]
        }
      }

      if (fr.dirName) {
        if (!byName[fr.dirName]) byName[fr.dirName] = []
        byName[fr.dirName].push({
          movie: fr.dirFile,
          frame: [key, fr.name],
          width: fr.width,
          height: fr.height,
          regpoint: fr.regpoint || null
        })
      }
    }
  }

  FRAME_INDEX = { byMovie, byName }
  return FRAME_INDEX
}

function invalidateFrameIndex () {
  FRAME_INDEX = null
}

function frameRect (idx, movie, name, loc) {
  const list = idx.byName[name]
  if (!list || !list.length) return null
  let hit = null
  for (const e of list) {
    if (e.movie === movie) {
      hit = e
      break
    }
  }
  if (!hit) hit = list[0]
  if (!hit.width || !hit.height) return null
  const reg = hit.regpoint || { x: 0, y: 0 }
  const at = loc || { x: 320, y: 240 }
  const left = at.x - reg.x
  const top = at.y - reg.y
  return [left, top, left + hit.width, top + hit.height]
}

/* -------------------------------------------------------------------------
 * MapObject - the `Object` parent script
 *
 * NOTE: the 05.DXR `Object` parent script itself is not part of the shipped
 * movie (it lives in a behaviour the decompiler cannot reach) and none of the
 * `31b*` object pictures exist in any built pack. Radius tracking, the
 * `#dest` transitions and the pickup `CheckFor`/`SetWhenDone` logic are
 * therefore reimplemented from objects.hash.json, while the sprites are
 * simply never assigned.
 * ---------------------------------------------------------------------- */

function asList (v) {
  if (v === undefined || v === null || v === 0 || v === '') return []
  if (Array.isArray(v)) return v.filter((x) => x !== null && x !== undefined)
  if (typeof v === 'object') return Object.keys(v).length ? [v] : []
  return [v]
}

function isEmptySpec (v) {
  if (v === undefined || v === null || v === 0 || v === '') return true
  if (Array.isArray(v)) return v.length === 0 || v.every((x) => x === null || x === undefined)
  if (typeof v === 'object') return Object.keys(v).length === 0
  return false
}

class MapObject {
  constructor (dir, objectId) {
    this.dir = dir
    this.objectId = objectId

    const data = (g.game.mulle.ObjectsDB || {})[objectId] ||
      (g.game.mulle.ObjectsDB || {})[String(objectId)] ||
      {}

    this.data = data
    this.type = data.type || '#dest'
    this.innerRadius = data.InnerRadius || 45
    this.outerRadius = data.OuterRadius || 65
    this.dirResource = data.DirResource || ''
    this.sounds = data.Sounds || []
    this.ifFound = data.IfFound
    this.insideInner = 0
    this.insideOuter = 0
    this.active = 1
    this.collected = 0
    this.loc = point(0, 0)
    this.sprites = null
  }

  /**
   * @return {number} 1 when the object should be tracked
   */
  init (sprites, loc, optional, boatLoc) {
    this.sprites = sprites
    this.loc = point(loc.x, loc.y)
    this.optional = optional || {}
    this.boatLoc = boatLoc
    this.insideInner = 0
    this.insideOuter = 0
    this.collected = 0
    this.active = 1

    // Check IfFound logic (like Lingo Object.init)
    const ifFound = this.data.IfFound
    if (ifFound && typeof ifFound === 'string' && ifFound.charAt(0) === '#') {
      const checkFor = this.data.CheckFor || {}
      let foundOne = false

      if (checkFor && typeof checkFor === 'object' && !Array.isArray(checkFor)) {
        const user = g.globals.user
        const level = g.globals.level || 1

        for (const key in checkFor) {
          const k = key.toLowerCase()
          const need = asList(checkFor[key])

          let ok = false
          if (k === 'inventory') {
            ok = need.every(item => lookUpInventory(user, item))
          } else if (k === 'level') {
            ok = need.includes(level)
          } else if (k === 'notgivenmissions') {
            ok = need.every(m => !(user.givenMissions || []).includes(m))
          } else if (k === 'missiongiven') {
            ok = need.every(m => (user.givenMissions || []).includes(m))
          } else if (k === 'parts') {
            const parts = user.Car ? user.Car.Parts : []
            ok = need.every(p => p === '#Random' || p === '#random' || parts.includes(p))
          } else if (k === 'boatprop') {
            const props = g.dir.boat ? g.dir.boat.quickProps : {}
            ok = need.every(p => props[String(p).replace(/^#/, '').toLowerCase()])
          }

          if (ok) {
            foundOne = true
            break
          }
        }
      }

      if (foundOne) {
        const ifFoundVal = ifFound.replace(/^#/, '').toLowerCase()
        if (ifFoundVal === 'nodisplay') return 0
        if (ifFoundVal === 'noenter') this.canEnter = 0
      }
    }

    // Set up initial frame from FrameList['normal']
    const frameList = this.data.FrameList || {}
    const normalFrames = frameList.normal || frameList.Normal || frameList.Normal || []
    if (normalFrames.length > 0) {
      const firstFrame = normalFrames[0]
      if (firstFrame && firstFrame !== 'Dummy' && firstFrame !== '0') {
        // Use the first sprite (SPUnder) for the object
        const spUnder = sprites[1]
        if (spUnder) {
          this.dir.state.setMemberByName(spUnder, firstFrame)
          this.dir.state.setSpriteLoc(spUnder, point(this.loc.x, this.loc.y))
        }
      }
    }

    return 1
  }

  getSpritesInfo () {
    return this.data.SpriteInfo || {}
  }

  /** Is the pickup allowed to exist right now? */
  checkForOK () {
    const spec = this.data.CheckFor
    if (isEmptySpec(spec)) return true
    if (typeof spec !== 'object' || Array.isArray(spec)) return true

    const user = g.globals.user
    const level = g.globals.level || 1

    for (const key in spec) {
      const k = key.toLowerCase()
      const need = asList(spec[key])

      if (k === 'inventory') {
        for (const item of need) {
          const name = typeof item === 'string' ? item : item
          if (!lookUpInventory(user, name)) return false
        }
      } else if (k === 'level') {
        if (need.indexOf(level) < 0) return false
      } else if (k === 'notgivenmissions') {
        for (const m of need) {
          if ((user.givenMissions || []).indexOf(m) >= 0) return false
        }
      } else if (k === 'missiongiven') {
        for (const m of need) {
          if ((user.givenMissions || []).indexOf(m) < 0) return false
        }
      } else if (k === 'parts') {
        const parts = user.Car ? user.Car.Parts : []
        for (const p of need) {
          if (p === '#Random' || p === '#random') continue
          if (parts.indexOf(p) < 0) return false
        }
      } else if (k === 'boatprop') {
        const props = g.dir.boat ? g.dir.boat.quickProps : {}
        for (const p of need) {
          const name = String(p).replace(/^#/, '').toLowerCase()
          if (!props[name]) return false
        }
      }
    }

    return true
  }

  setWhenDone () {
    const spec = this.data.SetWhenDone
    if (isEmptySpec(spec) || typeof spec !== 'object' || Array.isArray(spec)) return

    const user = g.globals.user

    if (spec.Inventory) {
      for (const item of asList(spec.Inventory)) setInInventory(user, item, item)
    }
    if (spec.Missions) {
      if (!user.givenMissions) user.givenMissions = []
      for (const m of asList(spec.Missions)) {
        if (user.givenMissions.indexOf(m) < 0) user.givenMissions.push(m)
      }
    }
    if (spec.Medals && user.Car && user.Car.addMedal) {
      for (const m of asList(spec.Medals)) user.Car.addMedal(m)
    }
  }

  /** @return {string} '#EnterInnerRadius' | ... | 0 */
  step (boatLoc) {
    if (!this.active) return 0

    // Animate the sprite frames (like Destination.step)
    if (this.sprites && this.sprites[1]) {
      const frameList = this.data.FrameList || {}
      let frames = frameList.normal || frameList.Normal || []
      if (!frames.length) frames = frameList.Inner || frameList.inner || frameList.Inner || []
      if (!frames.length) frames = frameList.Outer || frameList.outer || frameList.Outer || []
      if (frames.length > 0) {
        this._frameCounter = (this._frameCounter || 0) + 1
        if (this._frameCounter >= frames.length) this._frameCounter = 0
        const frame = frames[this._frameCounter]
        if (frame && frame !== 'Dummy' && frame !== '0') {
          this.dir.state.setMemberByName(this.sprites[1], frame)
        }
      }
    }

    const event = checkRadius(this, boatLoc, this.loc, '#both')
    if (!event) return 0

    if (event === '#EnterBoth' || event === '#EnterInnerRadius') {
      if (this.type === '#dest') {
        this.enterDestination()
      } else if (this.type === '#rdest') {
        this.pickup()
      } else if (this.type === '#custom') {
        this.customEnter()
      }
    }

    return event
  }

  enterDestination () {
    // A grace period so the boat cannot trigger the destination it just
    // spawned next to when a map is entered.
    if (this.dir.mapAge < 180) return
    if (!this.dirResource) return

    const scene = this.dir.resolveDirResource(this.dirResource)
    if (!scene) return

    if (this.sounds.length) g.dir.sounds.play(this.sounds[0], '#EFFECT')
    this.dir.prepareToLeave(this.dirResource)
  }

  pickup () {
    if (this.collected) return
    if (!this.checkForOK()) return

    this.setWhenDone()
    this.collected = 1

    if (this.sounds.length) {
      for (const s of this.sounds) g.dir.sounds.play(s, '#EFFECT')
    }
  }

  customEnter () {
    const custom = (this.data.CustomObject || '').toLowerCase()

    if (custom === 'gas') {
      // Refuel when moored next to the gas station.
      if (g.dir.boat && g.dir.boat.fuel !== '#Full') {
        if (g.dir.boat.fuel <= (g.dir.boat.quickProps.maxfuelvolume || 0) * 0.95) return
      }
      if (this.sounds.length) g.dir.sounds.play(this.sounds[1] || this.sounds[0], '#EFFECT')
    } else if (custom === 'compass') {
      // The compass object only drives the on screen compass sprite, which
      // has no art in this build.
    } else if (custom === 'fogedge' || custom === 'nomotor' ||
               custom === 'bridge' || custom === 'riverenter' ||
               custom === 'randomanim' || custom === 'racing' ||
               custom === 'mullecomment') {
      // Requires object art / the Object behaviour script - not shipped.
    }
  }

  kill () {
    this.active = 0
    this.insideInner = 0
    this.insideOuter = 0
    // Hide the object's sprite(s)
    if (this.sprites) {
      for (const sp of this.sprites) {
        if (sp) this.dir.state.hideSprite(sp)
      }
    }
    return 0
  }
}

/* -------------------------------------------------------------------------
 * MapDisplay - BehaviourScript 78
 * ---------------------------------------------------------------------- */

const ROLL_OVERS = {
  1: [[30, 100, 67, 124], [144, 128, 182, 160], [95, 204, 152, 238], [32, 193, 70, 225],
    [178, 274, 202, 311], [271, 199, 295, 236], [72, 157, 146, 199], [-1, 352, 73, 394]],
  2: [[212, 352, 263, 389], [274, 277, 298, 314], [326, 318, 367, 367], [364, 381, 433, 421]],
  3: [[402, 85, 457, 134], [479, 277, 504, 314], [531, 244, 560, 276]],
  4: [[530, 327, 620, 378]]
}

const REGION_PICS = { 6: 10, 7: 12, 8: 11, 9: 15, 10: 13, 11: 14, 12: 19, 13: 16, 14: 17, 15: 18, 16: 20, 17: 21 }
const REGION_SOUNDS = { 6: '19d001v0', 7: '19d003v0', 8: '19d002v0', 9: '19d005v0', 10: '19d004v0', 11: '19d006v0', 12: '19d009v0', 13: '19d007v0', 14: '19d008v0', 15: '19d010v0', 16: '19d011v0', 17: '19d012v0', 18: '19d013v0', 19: '19d014v0', 20: '19d015v0', 21: '19d016v0' }

class MapDisplay {
  constructor (dir) {
    this.dir = dir
    this.SP = SPRITE_LIST['#MapOverview']
    this.displaying = 0
    this.active = 1
    this.regionPics = REGION_PICS
    this.rollovers = ROLL_OVERS
    this.sounds = REGION_SOUNDS

    const rect = frameRect(buildFrameIndex(g.game), '05.DXR', 'litenkarta') ||
      [2, 410, 66, 471]

    g.game.mulle.worldState.registerRect('map', rect, {
      onOver: () => { if (this.active && !this.displaying) g.dir.setMemberByName(this.SP, 'litenkarta-hi') },
      onOut: () => { if (this.active && !this.displaying) g.dir.setMemberByName(this.SP, 'litenkarta') },
      onUp: () => this.mouseUp()
    }, 'map')
  }

  activate (yesNo) {
    const was = this.active
    this.active = yesNo ? 1 : 0
    if (was && !this.active && this.displaying) this.kill()
  }

  mouseUp () {
    if (this.displaying) {
      this.kill()
      return
    }
    if (!this.active) return

    const world = g.globals.world
    if (world.getId().toLowerCase() !== 'da hood') return

    this.dir.pause(1)
    this.dir.Mode = '#Waiting'

    // world overview, reveals more of the map as map pieces are collected
    let tmpMapMemb = 0
    if (lookUpInventory(g.globals.user, '#MapPiece3')) tmpMapMemb = 4
    else if (lookUpInventory(g.globals.user, '#MapPiece2')) tmpMapMemb = 3
    else if (lookUpInventory(g.globals.user, '#MapPiece1')) tmpMapMemb = 2
    else if (lookUpInventory(g.globals.user, '#MapPiece0')) tmpMapMemb = 1

    g.dir.setSpriteLoc(this.SP, point(320, 240))
    g.dir.setMember(this.SP, '05.DXR', 81 + tmpMapMemb)

    g.dir.setSpriteLoc(this.SP + 1, point(320, 240))
    g.dir.hideSprite(this.SP + 1)

    // boat marker
    const size = world.getWorldSize()
    const one = { x: 603 * 100 / size.x, y: 407 * 100 / size.y }
    const mc = this.dir.mapCoordinate
    const boatLoc = this.dir.boat.getShowCoordinate()
    g.dir.setSpriteLoc(this.SP + 2, point(
      19 + (mc.x - 1) * one.x / 100 + boatLoc.x * one.x / 6400,
      16 + (mc.y - 1) * one.y / 100 + boatLoc.y * one.y / 4000
    ))

    this.displaying = 1
    this.activeRects = []

    const rects = this.rollovers[1] || []
    rects.forEach((r, i) => {
      g.game.mulle.worldState.registerRect('rollover' + i, r, {
        onOver: () => this.hoverRegion(6 + i),
        onOut: () => {}
      }, 'rollover')
    })
  }

  hoverRegion (region) {
    const member = this.regionPics[region]
    if (!member) return
    g.dir.setMember(this.SP + 1, '05.DXR', 80 + member)
    const snd = this.sounds[region]
    if (snd) g.dir.sounds.play(snd, '#EFFECT')
  }

  kill () {
    const wasShowing = this.displaying
    const ws = g.game.mulle.worldState
    if (ws) ws.unregisterRects('rollover')

    g.dir.setSpriteLoc(this.SP, point(320, 240))
    g.dir.setMemberByName(this.SP, 'litenkarta')
    g.dir.hideSprite(this.SP + 1)
    g.dir.setSpriteLoc(this.SP + 2, point(-100, -100))

    this.displaying = 0

    if (wasShowing) {
      this.dir.pause(0)
      this.dir.Mode = '#Driving'
    }
  }
}

/* -------------------------------------------------------------------------
 * Dir - ParentScript 2
 * ---------------------------------------------------------------------- */

class Dir {
  constructor (state) {
    this.state = state
    this.game = state.game
    this.sounds = new SailSound(state.game)

    this.drivingHandlers = null
    this.boat = null
    this.counter = 1
    this.Mode = '#normal'
    this.cycling = 0
    this.spriteList = Object.assign({}, SPRITE_LIST)
    this.ambience = null
    this.map = null
    this.mapCoordinate = point(0, 0)
    this.objects = []
    this.weatherRenderer = null
    this.nextDir = '04'
    this.gotKeyPoll = 1
    this.mulleTalk = null
    this.transPic = ''
    this.transSnd = ''
    this.pausing = 0
    this.isLeaving = 0
    this.mapAge = 0
    this.rDests = {}
    this.boatPack = 'BSW.CXT'
    this.mapDisplay = null
    this.interfaceActive = 1
  }

  /* ------------------------------------------------------- lifecycle */

  init () {
    this.loadWorld()
    this.mapCoordinate = this.world.getStartInfo().map

    this.boat = new BoatBase()
    g.dir = this

    // pick the boat cast library: BS/BM/BL + W(ood)/S(teel)
    this.boatPack = this.chooseBoatPack()

    this.mulleTalk = new MulleSez()
    this.ambience = new AmbienceSound()
    this.weatherRenderer = new WeatherRenderer()
    this.weatherRenderer.init()
    this.mapDisplay = new MapDisplay(this)

    const saved = lookUpDrivingInfo(this.game.mulle.user)
    if (saved && typeof saved === 'object') {
      if (saved.map) this.mapCoordinate = saved.map
      this.boat.load(saved)
    } else {
      const start = this.world.getStartInfo()
      this.boat.load({
        direction: start.direction,
        loc: start.coordinate
      })
    }

    this.boat.init()

    // makeCheatBoat() may have replaced the parts during init(), so the cast
    // library (BS/BM/BL + W/S) has to be picked again before the first frame.
    this.boatPack = this.chooseBoatPack()

    this.changeMap(this.mapCoordinate, '#Absolute')
    this.Mode = '#Driving'

    g.globals.loopMaster.addObject(this)
  }

  chooseBoatPack () {
    const props = refreshBoatProperties(this.game)
    const material = props.material === 1 ? 'W' : 'S'
    let prefix = 'BM'
    if (props.smallship) prefix = 'BS'
    else if (props.largeship) prefix = 'BL'
    return prefix + material + '.CXT'
  }

  makeCheatBoat () {
    const user = this.game.mulle.user
    user.Car.Parts = CHEAT_BOAT_PARTS.slice()
    setDrivingInfo(user, 0)
    console.warn('[world] CheatBoat!')
  }

  kill () {
    g.globals.loopMaster.deleteObject(this)
    this.objects.forEach((o) => o.kill())
    this.objects = []
    if (this.boat) this.boat.kill()
    if (this.weatherRenderer) this.weatherRenderer.kill()
    if (this.ambience) this.ambience.kill()
    if (this.mulleTalk) this.mulleTalk.kill()
    if (this.mapDisplay) this.mapDisplay.activate(0)
    this.sounds.play('', '')
    return 0
  }

  /* ---------------------------------------------------------- input */

  pollKeys () {
    const kb = this.game.input.keyboard
    let lr = 0
    let ud = 0

    if (kb.isDown(Phaser.Keyboard.LEFT)) lr = '#left'
    else if (kb.isDown(Phaser.Keyboard.RIGHT)) lr = '#right'

    if (kb.isDown(Phaser.Keyboard.UP)) ud = '#up'
    else if (kb.isDown(Phaser.Keyboard.DOWN)) ud = '#down'

    this.key(lr, ud)
  }

  key (arg1, arg2) {
    const boat = this.boat
    if (!boat) return
    if (boat.steerMethod === '#Keys') {
      boat.steer(arg1, arg2)
    } else if (arg1 !== 0 || arg2 !== 0) {
      boat.steerMethod = '#Keys'
      boat.steer(arg1, arg2)
    }
  }

  mouse (argObj, argWhat) {
    if (this.pausing) return
    if (argWhat === '#down' && this.boat && this.boat.steerMethod !== '#mouse') {
      this.boat.steerMethod = '#mouse'
    }
  }

  loop () {
    if (this.Mode === '#Driving') {
      this.pollKeys()
      this.boat.loop()
      const loc = this.boat.getShowCoordinate()
      this.objects.forEach((o) => o.step(loc))
      this.mapAge += 1
    }
  }

  pause (argYesNo) {
    this.pausing = argYesNo
    if (this.boat) {
      this.boat.programControl(argYesNo)
      this.boat.playSounds(!argYesNo)
    }
    this.activateinterface(!argYesNo)
    if (this.weatherRenderer) this.weatherRenderer.allowRadio(!argYesNo)
    if (!argYesNo && this.Mode === '#Waiting') this.Mode = '#Driving'
  }

  activateinterface (argYesNo) {
    this.interfaceActive = argYesNo ? 1 : 0
    this.state.setInterfaceActive(argYesNo)
    if (this.mapDisplay) this.mapDisplay.active = argYesNo ? 1 : 0
    if (this.boat && this.boat.SelectorMaster) this.boat.SelectorMaster.activate(argYesNo)
  }

  /* ----------------------------------------------------------- world */

  loadWorld () {
    const gml = g.globals

    if (!gml.world) {
      const name = 'Da Hood'
      const data = g.game.mulle.WorldsDB[name]
      if (!data) {
        console.error('[world] missing world data', name)
        return
      }
      gml.world = new World(name, data, g.game)
    }

    if (!gml.maps) gml.maps = new Maps(g.game)

    if (!lookUpDrivingInfo(g.game.mulle.user)) {
      gml.world.randomizeDestinations()
    }

    this.world = gml.world
    this.map = new Map()
    gml.maps.map = this.map
  }

  /**
   * @param {Object|number} thePoint Target cell (or map id when absolute)
   * @param {string}        theMode  '#Relational' | '#Absolute'
   * @param {boolean}       theRealInit Skip the per map setup
   */
  changeMap (thePoint, theMode, theRealInit) {
    if (theMode === undefined || theMode === null) theMode = '#Relational'
    if (thePoint === undefined || thePoint === null) thePoint = point(0, 0)

    const tmpMapID = this.world.getNewMapId(thePoint, theMode, 0)

    if (!Number.isInteger(tmpMapID)) {
      console.warn('[world] map error', tmpMapID)
      return 0
    }

    if (theMode === '#Relational') {
      this.mapCoordinate = point(this.mapCoordinate.x + thePoint.x, this.mapCoordinate.y + thePoint.y)
    } else {
      this.mapCoordinate = thePoint
    }

    const status = g.globals.maps.loadMap(g.globals.maps, this.map, tmpMapID)
    if (typeof status === 'string' && status.charAt(0) === '#') {
      console.error('[world] Map error:', status)
      return 0
    }

    const start = this.world.getStartInfo().map
    const tmpDiff = { x: this.mapCoordinate.x - start.x, y: this.mapCoordinate.y - start.y }
    const tmpDist = Math.sqrt((tmpDiff.x * tmpDiff.x) + (tmpDiff.y * tmpDiff.y))

    const tmpWindSpeedFactor = this.map.getSpecial('#windspeed')
    const tmpFog = this.map.getSpecial('#Fog')

    if (tmpFog) {
      this.weatherRenderer.changeMap('#hide', tmpWindSpeedFactor)
      this.state.hideSprite(this.spriteList['#map'])
      this.state.setMemberByName(this.spriteList['#Fog'], 'FogPic')
    } else {
      this.weatherRenderer.changeMap(null, tmpWindSpeedFactor)
      this.state.setMemberByName(this.spriteList['#map'], this.map.getMapImage())
      const tmpUnder = this.map.getUnderMapImage()
      if (typeof tmpUnder === 'string' && tmpUnder) {
        this.state.setMemberByName(this.spriteList['#UnderMap'], tmpUnder)
      } else {
        this.state.hideSprite(this.spriteList['#UnderMap'])
      }
      this.state.hideSprite(this.spriteList['#Fog'])
    }

    this.mapAge = 0

    if (theRealInit === undefined || theRealInit === null) {
      this.boat.setTopology(this.map.getTopology())
      this.correctedBoatLoc = null
      this.goThroughObjects()
      if (this.correctedBoatLoc) {
        this.boat.setCoordinate(this.correctedBoatLoc, '#AdjustTopo')
      }
    }

    return 1
  }

  goThroughObjects () {
    this.objects.forEach((o) => o.kill())
    this.objects = []

    this.rDests = this.world.getRandomDestinations()

    const spUnder = this.spriteList['#ObjectsUnder']
    const spOver = this.spriteList['#ObjectsOver']
    for (let n = 0; n < 6; n++) this.state.hideSprite(spUnder + n)
    for (let n = 0; n < 6; n++) this.state.hideSprite(spOver + n)

    const tmpObjects = this.map.getObjects()
    const boatLoc = this.boat.getShowCoordinate()
    let spCounterUnder = 0
    let spCounterOver = 0

    for (const objData of tmpObjects) {
      const objectId = objData[0]
      const objectLoc = objData[1]
      const optional = objData.length === 3 ? objData[2] : {}

      const tmpObj = new MapObject(this, objectId)
      let tmpOK = 0

      if (tmpObj.type === '#rdest') {
        const tmpInMap = this.rDests[objectId]
        if (tmpInMap === this.mapCoordinate.x + ((this.mapCoordinate.y - 1) * 10)) tmpOK = 1
      } else if (tmpObj.type === '#Correct') {
        const dx = boatLoc.x - objectLoc.x
        const dy = boatLoc.y - objectLoc.y
        const hypo = Math.sqrt((dx * dx) + (dy * dy))
        let radius = 80
        if (optional && typeof optional === 'object' &&
          (optional.InnerRadius || optional.innerradius) !== undefined) {
          radius = optional.InnerRadius || optional.innerradius || 80
        }
        if (hypo < radius) this.correctedBoatLoc = point(objectLoc.x, objectLoc.y)
      } else {
        tmpOK = 1
      }

      if (tmpOK) {
        const showIt = tmpObj.init(
          [spCounterOver + spOver, spCounterUnder + spUnder],
          objectLoc, optional, boatLoc)
        if (showIt) {
          // Update sprite counters from the object's getSpritesInfo
          const spInfo = tmpObj.getSpritesInfo()
          if (spInfo && typeof spInfo === 'object') {
            for (const [key, count] of Object.entries(spInfo)) {
              const k = key.toLowerCase()
              if (k === 'under' || k === '#under') spCounterUnder += count
              else if (k === 'over' || k === '#over') spCounterOver += count
            }
          }
          this.objects.push(tmpObj)
        }
      }
    }
  }

  resolveDirResource (dirResource) {
    const scenes = this.game.mulle.scenes
    return scenes[String(dirResource)] || scenes[parseInt(dirResource, 10)] || null
  }

  prepareToLeave (argToDir, argTransPic, argTransSnd) {
    if (this.isLeaving) return
    this.isLeaving = 1

    const user = this.game.mulle.user
    const tmpSave = this.boat.save()
    tmpSave.map = this.mapCoordinate

    this.nextDir = String(argToDir)
    if (this.ambience) this.ambience.activate(0)
    this.activateinterface(0)

    if (this.nextDir === '04' || this.nextDir === '03') {
      setDrivingInfo(user, 0)
      this.transPic = argTransPic || '33b018v0'
      this.transSnd = argTransSnd || ''
    } else if (this.nextDir === '08') {
      setDrivingInfo(user, tmpSave)
      this.transPic = 'TransTmp8'
      this.transSnd = ''
    } else {
      setDrivingInfo(user, tmpSave)
      this.transPic = '33b007v0'
      this.transSnd = '33e007v0'
    }

    this.Mode = '#Leave'
    this.leaveFrames = 0
  }

  /** TransToNextMovie behaviour: show the transition, then change state. */
  tick () {
    if (this.Mode !== '#Leave') return

    const sp = this.spriteList['#TransToNext']
    this.leaveFrames += 1

    if (this.leaveFrames === 1) {
      this.state.setMemberByName(sp, this.transPic)
      if (this.transSnd) this.sounds.play(this.transSnd, '#EFFECT')
    }

    const sndBusy = this.transSnd && !this.sounds.finished(this.transSnd)
    if (this.leaveFrames > 8 && !sndBusy) {
      const target = this.game.mulle.scenes[this.nextDir]
      if (target && this.game.state.states[target]) {
        invalidateFrameIndex()
        this.game.state.start(target)
      } else {
        console.warn('[world] no scene for', this.nextDir)
        this.isLeaving = 0
        this.Mode = '#Driving'
        this.state.hideSprite(sp)
        this.activateinterface(1)
      }
    }
  }

  /* ------------------------------------------------------ sprite glue */

  /**
   * `the number of member "xxx"` - resolve a Director member number.
   * @param  {string} movie  Movie name
   * @param  {string|number} member Member number or member name
   * @return {number}        Member number, 0 when not found
   */
  findMember (movie, member) {
    if (typeof member === 'number') {
      const table = buildFrameIndex(this.game).byMovie[movie]
      return table && table[member] !== undefined ? member : 0
    }
    const list = buildFrameIndex(this.game).byName[member]
    if (!list) return 0
    for (const e of list) {
      if (e.movie === movie) return this.memberNumber(movie, e.frame[1])
    }
    return this.memberNumber(movie, list[0].frame[1])
  }

  memberNumber (movie, frameName) {
    const table = buildFrameIndex(this.game).byMovie[movie]
    if (!table) return 0
    for (const num in table) {
      if (table[num][1] === frameName) return parseInt(num, 10)
    }
    return 0
  }

  /** Hit rect of a member assuming its sprite sits at (320, 240). */
  getMemberRect (movie, member) {
    const idx = buildFrameIndex(this.game)
    const table = idx.byMovie[movie]
    if (!table || table[member] === undefined) return [0, 0, 32, 32]
    const name = table[member][1]
    return frameRect(idx, movie, name) || [0, 0, 32, 32]
  }

  setMember (spriteNum, movie, member) {
    return this.state.setMember(spriteNum, movie, member)
  }

  setMemberByName (spriteNum, name) {
    return this.state.setMemberByName(spriteNum, name)
  }

  hideSprite (spriteNum) {
    return this.state.hideSprite(spriteNum)
  }

  setSpriteLoc (spriteNum, loc) {
    return this.state.setSpriteLoc(spriteNum, loc)
  }

  getSpriteLoc (spriteNum) {
    return this.state.getSpriteLoc(spriteNum)
  }
}

/* -------------------------------------------------------------------------
 * World / Map / Maps - the 00.CXT helpers
 * ---------------------------------------------------------------------- */

class World {
  constructor (id, data, game) {
    this.game = game
    this.WorldId = id
    this.id = id
    this.map = data.map || []
    this.StartMap = { x: data.StartMap.x, y: data.StartMap.y }
    this.StartCoordinate = { x: data.StartCoordinate.x, y: data.StartCoordinate.y }
    this.StartDirection = data.StartDirection
    this.currentMap = { x: this.StartMap.x, y: this.StartMap.y }
    this.symbolPosition = data.symbolPosition || 0
    this.rDests = {}
    this.enteredObjectId = 0
  }

  getId () {
    return this.WorldId
  }

  getStartInfo () {
    return {
      map: { x: this.StartMap.x, y: this.StartMap.y },
      coordinate: { x: this.StartCoordinate.x, y: this.StartCoordinate.y },
      direction: this.StartDirection
    }
  }

  getWorldSize () {
    return { x: this.map[0] ? this.map[0].length : 0, y: this.map.length }
  }

  getCurrentMapId () {
    const y = this.currentMap.y
    if (y < 1 || y > this.map.length) return '#InvalidYIndex'
    const list = this.map[y - 1]
    const x = this.currentMap.x
    if (x < 1 || x > list.length) return '#InvalidXIndex'
    const v = list[x - 1]
    return Number.isInteger(v) ? v : '#InvalidXIndex'
  }

  /**
   * @param {Object}  thePoint    Cell, relative when theMode is '#Relational'
   * @param {string}  theMode     '#Relational' | '#Absolute'
   * @param {boolean} theJustCheck Do not commit the new cell
   * @return {number|string} Map id or an error symbol
   */
  getNewMapId (thePoint, theMode, theJustCheck) {
    let p = thePoint
    if (theMode === '#Relational') p = { x: thePoint.x + this.currentMap.x, y: thePoint.y + this.currentMap.y }

    if (p.y < 1 || p.y > this.map.length) return '#InvalidYIndex'
    const list = this.map[p.y - 1]
    if (p.x < 1 || p.x > list.length) return '#InvalidXIndex'

    if (theJustCheck !== 1 && theJustCheck !== true) this.currentMap = { x: p.x, y: p.y }

    const v = list[p.x - 1]
    return Number.isInteger(v) ? v : '#InvalidXIndex'
  }

  /** Every `#rdest` object gets one random map cell where it shows up. */
  randomizeDestinations () {
    const maps = this.game.mulle.MapsDB
    const rdests = {}

    for (const mapId in maps) {
      const objects = maps[mapId].objects || []
      for (const o of objects) {
        const def = (this.game.mulle.ObjectsDB || {})[o[0]]
        if (def && def.type === '#rdest') {
          if (!rdests[o[0]]) rdests[o[0]] = []
          rdests[o[0]].push(parseInt(mapId, 10))
        }
      }
    }

    this.rDests = {}
    for (const id in rdests) {
      const cells = rdests[id]
      this.rDests[id] = cells[random(cells.length) - 1]
    }

    return this.rDests
  }

  getRandomDestinations () {
    if (!Object.keys(this.rDests).length) this.randomizeDestinations()
    return this.rDests
  }

  getEnteredObject () {
    return this.enteredObjectId
  }
}

class Map {
  constructor () {
    this.MapId = 0
    this.objects = []
    this.MapImage = ''
    this.underMapImage = ''
    this.Topology = ''
    this.Special = null
  }

  getMapImage () {
    return this.MapImage
  }

  getUnderMapImage () {
    return this.underMapImage
  }

  getObjects () {
    return this.objects
  }

  getTopology () {
    return this.Topology
  }

  getSpecial (argProp) {
    if (!argProp) return this.Special
    if (this.Special && typeof this.Special === 'object') {
      for (const k in this.Special) {
        if (k.toLowerCase() === argProp.replace('#', '').toLowerCase()) {
          return this.Special[k]
        }
      }
    }
    return null
  }

  fromJSON (data, id) {
    this.MapId = data.MapId !== undefined ? data.MapId : parseInt(id, 10)
    this.objects = data.objects || []
    this.MapImage = data.MapImage || ''
    this.underMapImage = data.underMapImage || ''
    this.Topology = data.Topology || ''
    this.Special = data.Special || null
  }
}

class Maps {
  constructor (game) {
    this.game = game
    this.map = null
    this.loadedMaps = []
    this.currentMap = 0
  }

  /** @return {number|string} 0 on success, error symbol otherwise */
  loadMap (maps, map, MapId) {
    const data = this.game.mulle.MapsDB[MapId]
    if (!data) return '#MissingMapDB'
    map.fromJSON(data, MapId)
    this.loadedMaps.push(MapId)
    this.currentMap = MapId
    return 0
  }
}

/* -------------------------------------------------------------------------
 * Driving info / mission helpers
 * ---------------------------------------------------------------------- */

function setDrivingInfo (user, value) {
  user.DrivingInfo = value
}

function lookUpDrivingInfo (user) {
  return user.DrivingInfo
}

/* -------------------------------------------------------------------------
 * The scene
 * ---------------------------------------------------------------------- */

class WorldState extends MulleState {
  constructor () {
    super()
    this.sprites = {}
    this.hitRects = []
    this.prevPointerDown = false
  }

  preload () {
    super.preload()

    // the boat pack is chosen from the mounted parts, so the user has to
    // exist before we start loading
    if (!this.game.mulle.user) {
      const keys = Object.keys(this.game.mulle.UsersDB)
      if (keys.length) this.game.mulle.user = this.game.mulle.UsersDB[keys[0]]
      else this.game.mulle.user = new MulleSave(this.game)
    }

    const props = ensureDrivableBoat(this.game)
    const material = props.material === 1 ? 'W' : 'S'
    let prefix = 'BM'
    if (props.smallship) prefix = 'BS'
    else if (props.largeship) prefix = 'BL'
    const pack = (prefix + material).toLowerCase()

    this.game.load.pack('sailing', 'assets/sailing.json', null, this)
    this.game.load.pack('map', 'assets/map.json', null, this)
    this.game.load.pack('sailFrames', 'assets/sailFrames.json', null, this)
    this.game.load.pack(pack, 'assets/' + pack + '.json', null, this)

    this.load.atlas('topography-0', 'assets/topography/topography-0.png',
      'assets/topography/topography-0.json', Phaser.Loader.TEXTURE_ATLAS_JSON_HASH)
    this.load.atlas('topography-1', 'assets/topography/topography-1.png',
      'assets/topography/topography-1.json', Phaser.Loader.TEXTURE_ATLAS_JSON_HASH)
  }

  create () {
    super.create()

    this.game.mulle.addAudio('sailing')

    invalidateFrameIndex()
    buildFrameIndex(this.game)

    const user = this.game.mulle.user
    if (user.givenMissions === undefined) user.givenMissions = []
    if (user.CompletedMissions === undefined) user.CompletedMissions = []
    if (!user.Inventory) user.Inventory = { DrivenTimes: { Motor: 0, Sail: 0, Oar: 0 } }

    this.game.mulle.worldState = this

    // --- globals -----------------------------------------------------
    g.game = this.game
    g.globals = {
      loopMaster: new LoopHandler(),
      user: user,
      level: user.Level || 1,
      world: null,
      maps: null,
      weather: null
    }
    g.globals.weather = new Weather(g.globals)

    this.createSprites()

    // --- dir ---------------------------------------------------------
    const dir = new Dir(this)
    g.dir = dir
    this.dir = dir
    this.game.mulle.gDir = dir
    dir.init()

    this.setupInput()
    this.setupHelpButton()
    this.game.mulle.cursor.reset()
  }

  /**
   * HelpBH (BehaviorScript 175). Hovering swaps to `HelpButton-hi`, clicking
   * saves the drive state so the help movie can return to the right spot.
   *
   * NOTE: the original does `go(string(type), "ShowBoat")` which leaves for
   * SHOWBOAT.DXR / a Motor|Sail|Oar movie. Those are not part of this build,
   * so the save is written and the transition skipped.
   */
  setupHelpButton () {
    const dir = this.dir
    const rect = frameRect(buildFrameIndex(this.game), '05.DXR', 'HelpButton') ||
      [355, 450, 375, 473]

    this.registerRect('help', rect, {
      onOver: () => { if (dir.interfaceActive) this.setMemberByName(68, 'HelpButton-hi') },
      onOut: () => this.setMemberByName(68, 'HelpButton'),
      onUp: () => {
        if (!dir.interfaceActive) return
        const type = dir.boat ? dir.boat.getType() : 0
        if (typeof type !== 'string' || type.charAt(0) !== '#') return

        const tmpSave = dir.boat.save()
        tmpSave.map = dir.mapCoordinate
        setDrivingInfo(this.game.mulle.user, tmpSave)

        console.info('[world] showboat help requested for', type)
      }
    }, 'interface')
  }

  createSprites () {
    SPRITE_LAYOUT.forEach((row) => {
      const sprite = new MulleSprite(this.game, row[1], row[2])
      sprite.name = 'sprite' + row[0]
      this.game.add.existing(sprite)
      this.sprites[row[0]] = sprite

      if (row[3] && row[4]) this.setMember(row[0], row[3], row[4])
      else this.hideSprite(row[0])
    })
  }

  /* ------------------------------------------------------ sprite glue */

  setMember (spriteNum, movie, member) {
    const entry = buildFrameIndex(this.game).byMovie[movie]
    const f = entry ? entry[member] : null
    if (!f) {
      warnMissing(movie, member)
      this.hideSprite(spriteNum)
      return false
    }
    const sprite = this.sprites[spriteNum]
    if (!sprite) return false
    sprite.loadTexture(f[0], f[1])
    sprite.visible = true
    return true
  }

  setMemberByName (spriteNum, name) {
    if (!name || name === 'Dummy' || name === '') {
      this.hideSprite(spriteNum)
      return false
    }

    const idx = buildFrameIndex(this.game)
    const list = idx.byName[name]
    if (!list || !list.length) {
      warnMissing('name', name)
      this.hideSprite(spriteNum)
      return false
    }

    let hit = list[0]
    for (const e of list) {
      if (e.movie === '05.DXR') {
        hit = e
        break
      }
    }

    const sprite = this.sprites[spriteNum]
    if (!sprite) return false
    sprite.loadTexture(hit.frame[0], hit.frame[1])
    sprite.visible = true
    return true
  }

  hideSprite (spriteNum) {
    const sprite = this.sprites[spriteNum]
    if (!sprite) return false
    sprite.visible = false
    return true
  }

  setSpriteLoc (spriteNum, loc) {
    const sprite = this.sprites[spriteNum]
    if (!sprite) return null
    sprite.x = loc.x
    sprite.y = loc.y
    return loc
  }

  getSpriteLoc (spriteNum) {
    const sprite = this.sprites[spriteNum]
    if (!sprite) return point(0, 0)
    return point(sprite.x, sprite.y)
  }

  /* ---------------------------------------------------------- hit rects */

  registerRect (id, rect, cbs, tag) {
    this.unregisterRect(id)
    this.hitRects.push({
      id: id,
      rect: rect,
      tag: tag || 'default',
      active: true,
      hover: false,
      down: false,
      onOver: cbs.onOver,
      onOut: cbs.onOut,
      onDown: cbs.onDown,
      onUp: cbs.onUp
    })
  }

  unregisterRect (id) {
    const i = this.hitRects.findIndex((r) => r.id === id)
    if (i >= 0) this.hitRects.splice(i, 1)
  }

  unregisterRects (tag) {
    for (let i = this.hitRects.length - 1; i >= 0; i--) {
      if (this.hitRects[i].tag === tag) this.hitRects.splice(i, 1)
    }
  }

  setInterfaceActive (yesNo) {
    this.hitRects.forEach((r) => {
      if (r.tag === 'interface') r.active = !!yesNo
    })
  }

  updateRects () {
    const p = this.game.input.activePointer
    const down = p.isDown

    let anyHit = false

    for (const r of this.hitRects) {
      const inside = r.active &&
        p.x >= r.rect[0] && p.y >= r.rect[1] && p.x <= r.rect[2] && p.y <= r.rect[3]

      if (inside) anyHit = true

      if (inside !== r.hover) {
        r.hover = inside
        if (inside && r.onOver) r.onOver()
        else if (!inside && r.onOut) r.onOut()
      }

      if (inside && down && !r.down) {
        r.down = true
        if (r.onDown) r.onDown()
      }

      if (r.down && !down) {
        r.down = false
        if (inside && r.onUp) r.onUp()
      }

      if (!inside) r.down = false
    }

    // clicking the water switches to mouse steering (Dir.mouse #down)
    if (down && !this.prevPointerDown && !anyHit && p.y < 396 && this.dir) {
      this.dir.mouse(null, '#down')
    }

    this.prevPointerDown = down
  }

  setupInput () {
    if (this.game.input.keyboard) {
      this.game.input.keyboard.addKeyCapture(
        [Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT, Phaser.Keyboard.UP, Phaser.Keyboard.DOWN])
    }
  }

  update () {
    if (!this.dir) return
    this.updateRects()
    g.globals.loopMaster.loop()
    this.dir.tick()
  }

  shutdown () {
    if (this.dir) this.dir.kill()
    if (g.globals && g.globals.loopMaster) {
      g.globals.loopMaster.objects = []
      g.globals.loopMaster.addList = []
      g.globals.loopMaster.deleteList = []
    }
    this.game.mulle.worldState = null
    g.dir = null
    g.globals = null
  }
}

export default WorldState
