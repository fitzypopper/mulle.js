/**
 * Generic Mission State - handles mission minigames (movies 70-88).
 *
 * The original game has 14 unique mission minigames (70.DXR-88.DXR excluding 72-75, 82).
 * Each has unique gameplay (diver, rope, racing, etc.). For a playable
 * completion path we provide a generic handler that loads the mission movie
 * and allows the player to "complete" it to return to the world map.
 *
 * @module scenes/mission
 */
'use strict'

import MulleState from './base'
import MulleSprite from '../objects/sprite'
import { point, random, correctDirection, asList, setInInventory, lookUpInventory } from '../objects/boat/lingo'

export default class MissionState extends MulleState {
  preload () {
    super.preload()

    // The mission ID is passed via g.game.mulle.activeMission
    let missionId = this.game.mulle.activeMission
    if (!missionId) {
      // Direct URL navigation: extract from state name
      const stateName = this.game.state.current
      if (stateName && stateName.startsWith('mission')) {
        missionId = stateName.replace('mission', '')
        this.game.mulle.activeMission = missionId
      }
    }
    if (!missionId) {
      console.error('[mission] No active mission ID')
      return
    }

    this.missionId = missionId
    this.missionMovie = String(missionId) + '.DXR'

    // Map mission ID to pack name (from PACKS dictionary in gen_assets_bat.py)
    const packNameMap = {
      '70': 'm70', '71': 'm71', '76': 'm76', '77': 'm77',
      '78': 'm78', '79': 'm79', '80': 'm80', '81': 'm81',
      '83': 'm83', '84': 'm84', '85': 'm85', '86': 'm86',
      '87': 'm87', '88': 'm88'
    }
    const packName = packNameMap[this.missionId] || 'm' + this.missionId

    // Load the mission pack (pack key must match the key in the JSON)
    this.game.load.pack(packName, 'assets/' + packName + '.json', null, this)

    // Also load sailing pack for common assets (boat, water, etc.)
    this.game.load.pack('sailing', 'assets/sailing.json', null, this)
    this.game.load.pack('map', 'assets/map.json', null, this)
  }

  create () {
    super.create()

    const g = this.game
    g.mulle.worldState = this

    // Create background from mission movie
    this.createMissionScreen()

    // Set up input
    this.setupInput()

    console.log('[mission] Starting mission', this.missionId)
  }

  createMissionScreen () {
    const g = this.game

    // Try to show mission background art if available
    const idx = buildFrameIndex(g)
    const bgNames = ['missionbg', 'background', 'bakgrund', 'intro', 'title']
    let bgFrame = null

    for (const name of bgNames) {
      const list = idx.byName[name]
      if (list && list.length) {
        for (const e of list) {
          if (e.movie === this.missionMovie) {
            bgFrame = e
            break
          }
        }
        if (bgFrame) break
      }
    }

    if (bgFrame) {
      const sprite = new MulleSprite(g, 320, 240)
      sprite.loadTexture(bgFrame.frame[0], bgFrame.frame[1])
      g.add.existing(sprite)
    } else {
      // Fallback: solid color background
      const gfx = g.add.graphics(0, 0)
      gfx.beginFill(0x003366, 1)
      gfx.drawRect(0, 0, 640, 480)
      gfx.endFill()
    }

    // Mission title text
    const title = g.add.text(320, 80, 'Mission ' + this.missionId, {
      font: '28px Arial',
      fill: '#ffffff',
      align: 'center'
    })
    title.anchor.set(0.5)

    // Instructions
    const instr = g.add.text(320, 200, 'Press SPACE to complete mission', {
      font: '18px Arial',
      fill: '#ffff00',
      align: 'center'
    })
    instr.anchor.set(0.5)

    // Mission description placeholder
    const desc = g.add.text(320, 280, 'Mission briefing would appear here.\nOriginal minigame: ' + this.missionMovie, {
      font: '14px Arial',
      fill: '#cccccc',
      align: 'center',
      wordWrap: true,
      wordWrapWidth: 500
    })
    desc.anchor.set(0.5)
  }

  setupInput () {
    this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
    this.spaceKey.onDown.add(this.completeMission, this)
  }

  completeMission () {
    const g = this.game

    // Award mission completion (SetWhenDone rewards)
    this.awardMissionRewards()

    // Return to world map
    g.mulle.activeMission = null
    g.state.start('world')
  }

  awardMissionRewards () {
    const g = this.game
    const user = g.mulle.user

    // Find the object that led to this mission
    // The mission ID corresponds to DirResource in objects
    const objects = g.mulle.ObjectsDB || {}
    for (const id in objects) {
      const obj = objects[id]
      if (obj.DirResource && String(obj.DirResource) === String(this.missionId)) {
        // Award SetWhenDone rewards
        if (obj.SetWhenDone && typeof obj.SetWhenDone === 'object') {
          const spec = obj.SetWhenDone

          if (spec.Inventory) {
            for (const item of asList(spec.Inventory)) {
              setInInventory(user, item, item)
            }
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
          if (spec.Parts) {
            if (!user.Car) user.Car = { Parts: [] }
            for (const p of asList(spec.Parts)) {
              if (p !== '#Random' && p !== '#random' && user.Car.Parts.indexOf(p) < 0) {
                user.Car.Parts.push(p)
              }
            }
          }
        }

        console.log('[mission] Awarded rewards for mission', this.missionId, 'from object', id)
        break
      }
    }
  }

  shutdown () {
    if (this.spaceKey) this.spaceKey.onDown.remove(this.completeMission, this)
    super.shutdown()
  }
}

/* -------------------------------------------------------------------------
 * Specific Mission Implementations
 * ---------------------------------------------------------------------- */

/**
 * Base class for specific mission minigames
 */
class BaseMission extends MissionState {
  constructor () {
    super()
  }

  createMissionScreen () {
    const g = this.game
    super.createMissionScreen()

    // Add mission-specific UI
    if (this.missionBriefing) {
      const briefing = g.add.text(320, 280, this.missionBriefing, {
        font: '14px Arial',
        fill: '#cccccc',
        align: 'center',
        wordWrap: true,
        wordWrapWidth: 500
      })
      briefing.anchor.set(0.5)
    }
  }

  completeMission () {
    this.awardMissionRewards()
    this.game.mulle.activeMission = null
    this.game.state.start('world')
  }
}

/**
 * Mission 70 - Erson / Diver
 * Underwater diving minigame
 */
class Mission70 extends BaseMission {
  constructor () {
    super()
    this.missionId = '70'
    this.missionMovie = '70.DXR'
    this.missionBriefing = 'Help Erson dive underwater and collect treasures!'
  }

  preload () {
    super.preload()
    this.game.load.pack('m70', 'assets/m70.json', null, this)
  }

  createMissionScreen () {
    super.createMissionScreen()
    const g = this.game
    // Add diver sprite, oxygen meter, collectibles
    const diver = new MulleSprite(this.game, 320, 240)
    diver.setDirectorMember('70.DXR', '70a001v0')
    this.game.add.existing(diver)
  }

  update () {
    // Diver movement, oxygen depletion, collectible collection
  }
}

/**
 * Mission 71 - Erson / Rope
 * Rope swinging minigame
 */
class Mission71 extends BaseMission {
  constructor () {
    super()
    this.missionId = '71'
    this.missionMovie = '71.DXR'
    this.missionBriefing = 'Swing with Erson across the gaps!'
  }

  preload () {
    super.preload()
    this.game.load.pack('m71', 'assets/m71.json', null, this)
  }
}

/**
 * Mission 76 - Judge / Boat Show
 * Boat show judging minigame
 */
class Mission76 extends BaseMission {
  constructor () {
    super()
    this.missionId = '76'
    this.missionMovie = '76.DXR'
    this.missionBriefing = 'Judge the boat show entries!'
  }

  preload () {
    super.preload()
    this.game.load.pack('m76', 'assets/m76.json', null, this)
  }
}

/**
 * Mission 77 - Birgit / Dogs
 * Dog herding minigame
 */
class Mission77 extends BaseMission {
  constructor () {
    super()
    this.missionId = '77'
    this.missionMovie = '77.DXR'
    this.missionBriefing = 'Help Birgit herd the dogs!'
  }

  preload () {
    super.preload()
    this.game.load.pack('m77', 'assets/m77.json', null, this)
  }
}

/**
 * Mission 78 - Preacher
 * Sermon/dialogue minigame
 */
class Mission78 extends BaseMission {
  constructor () {
    super()
    this.missionId = '78'
    this.missionMovie = '78.DXR'
    this.missionBriefing = 'Listen to the preacher\'s sermon.'
  }

  preload () {
    super.preload()
    this.game.load.pack('m78', 'assets/m78.json', null, this)
  }
}

/**
 * Mission 79 - Head/Body Animation
 * Character animation minigame
 */
class Mission79 extends BaseMission {
  constructor () {
    super()
    this.missionId = '79'
    this.missionMovie = '79.DXR'
    this.missionBriefing = 'Watch the head/body animation show!'
  }

  preload () {
    super.preload()
    this.game.load.pack('m79', 'assets/m79.json', null, this)
  }
}

/**
 * Mission 80 - Sam
 * Dialogue/interaction minigame
 */
class Mission80 extends BaseMission {
  constructor () {
    super()
    this.missionId = '80'
    this.missionMovie = '80.DXR'
    this.missionBriefing = 'Talk with Sam!'
  }

  preload () {
    super.preload()
    this.game.load.pack('m80', 'assets/m80.json', null, this)
  }
}

/**
 * Mission 81 - Sur
 * Surfing/water minigame
 */
class Mission81 extends BaseMission {
  constructor () {
    super()
    this.missionId = '81'
    this.missionMovie = '81.DXR'
    this.missionBriefing = 'Surf the waves with Sur!'
  }

  preload () {
    super.preload()
    this.game.load.pack('m81', 'assets/m81.json', null, this)
  }
}

/**
 * Mission 83 - Mia
 * Dialogue/interaction minigame
 */
class Mission83 extends BaseMission {
  constructor () {
    super()
    this.missionId = '83'
    this.missionMovie = '83.DXR'
    this.missionBriefing = 'Chat with Mia!'
  }

  preload () {
    super.preload()
    this.game.load.pack('m83', 'assets/m83.json', null, this)
  }
}

/**
 * Mission 84 - Viola
 * Dialogue/interaction minigame
 */
class Mission84 extends BaseMission {
  constructor () {
    super()
    this.missionId = '84'
    this.missionMovie = '84.DXR'
    this.missionBriefing = 'Talk with Viola!'
  }

  preload () {
    super.preload()
    this.game.load.pack('m84', 'assets/m84.json', null, this)
  }
}

/**
 * Mission 85 - Water/Sinking
 * Sinking boat survival minigame
 */
class Mission85 extends BaseMission {
  constructor () {
    super()
    this.missionId = '85'
    this.missionMovie = '85.DXR'
    this.missionBriefing = 'Survive the sinking boat!'
  }

  preload () {
    super.preload()
    this.game.load.pack('m85', 'assets/m85.json', null, this)
  }
}

/**
 * Mission 86 - Sven / Bat
 * Bat cave navigation minigame
 */
class Mission86 extends BaseMission {
  constructor () {
    super()
    this.missionId = '86'
    this.missionMovie = '86.DXR'
    this.missionBriefing = 'Navigate the bat cave with Sven!'
  }

  preload () {
    super.preload()
    this.game.load.pack('m86', 'assets/m86.json', null, this)
  }
}

/**
 * Mission 87 - Dive / Factory
 * Factory diving minigame
 */
class Mission87 extends BaseMission {
  constructor () {
    super()
    this.missionId = '87'
    this.missionMovie = '87.DXR'
    this.missionBriefing = 'Dive into the factory!'
  }

  preload () {
    super.preload()
    this.game.load.pack('m87', 'assets/m87.json', null, this)
  }
}

/**
 * Mission 88 - Water / Tree
 * Tree/water puzzle minigame
 */
class Mission88 extends BaseMission {
  constructor () {
    super()
    this.missionId = '88'
    this.missionMovie = '88.DXR'
    this.missionBriefing = 'Solve the tree/water puzzle!'
  }

  preload () {
    super.preload()
    this.game.load.pack('m88', 'assets/m88.json', null, this)
  }
}

/* -------------------------------------------------------------------------
 * Mission Factory
 * ---------------------------------------------------------------------- */

const MissionClasses = {
  '70': Mission70,
  '71': Mission71,
  '76': Mission76,
  '77': Mission77,
  '78': Mission78,
  '79': Mission79,
  '80': Mission80,
  '81': Mission81,
  '83': Mission83,
  '84': Mission84,
  '85': Mission85,
  '86': Mission86,
  '87': Mission87,
  '88': Mission88
}

function createMission (missionId) {
  const MissionClass = MissionClasses[missionId]
  if (MissionClass) {
    return new MissionClass()
  }
  return new BaseMission()
}

/* -------------------------------------------------------------------------
 * Helpers (duplicated from world.js for independence)
 * ---------------------------------------------------------------------- */

function buildFrameIndex (game) {
  const keys = game.cache.getKeys(Phaser.Cache.IMAGE)
  const byMovie = {}
  const byName = {}

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
  return { byMovie, byName }
}