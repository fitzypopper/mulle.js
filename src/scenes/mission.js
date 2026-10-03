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
 * Helpers (duplicated from world.js for independence)
 * ---------------------------------------------------------------------- */

function asList (v) {
  if (v === undefined || v === null || v === 0 || v === '') return []
  if (Array.isArray(v)) return v.filter((x) => x !== null && x !== undefined)
  if (typeof v === 'object') return Object.keys(v).length ? [v] : []
  return [v]
}

function setInInventory (user, key, value) {
  if (!user.Inventory) user.Inventory = {}
  user.Inventory[key] = value
}

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