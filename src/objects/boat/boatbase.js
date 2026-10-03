/**
 * Boat simulation for the sailing scene.
 *
 * Direct port of the 05.DXR parent scripts:
 *
 *   ParentScript 35 - DepthChecker
 *   ParentScript 181 - MeterScript
 *   ParentScript 36 - DisplayBoat
 *   ParentScript 171 / 170 - SelectorMaster / TypeSelectButton
 *   ParentScript 37/38/39/40/44 - Sail / Motor / Oar / Dummy ancestors
 *   ParentScript 34 - BoatBase
 *
 * @module objects/boat/boatbase
 */
'use strict'

import {
  g, random, integer, correctDirection, getVelPoint, calcDirection, calcRadians,
  point, pointAdd, pointScale, pointEq, lookUpInventory, setInInventory
} from './lingo'
import { DirectionList } from '../../struct/saildata'
import {
  findPossiblePowers, makeCleanBoat, checkCurrentlyOKPowers, recalculateBoatProps,
  refreshBoatProperties, calcCornersList, rotateCorners
} from './props'
import { readTopology, TOPO_SIZE } from './topology'

/* -------------------------------------------------------------------------
 * DepthChecker
 * ---------------------------------------------------------------------- */

/**
 * Topology sampler: buckets the water depth of a point and detects land.
 * @extends DepthChecker
 */
export class DepthChecker {
  constructor () {
    this.topoWidth = TOPO_SIZE.width
    this.topoHeight = TOPO_SIZE.height
    this.active = false
    this.depth = 0
    this.topo = null
  }

  /**
   * @param {string} which Member name, "30t999v0" disables the checker
   */
  setTopology (which) {
    if (!which || which === '30t999v0') {
      this.active = false
      this.topo = null
      return
    }
    this.active = true
    this.topo = readTopology(g.game, which)
    if (!this.topo) this.active = false
  }

  /** Bucket a real depth into 0..4 */
  setDepth (argDepth) {
    if (argDepth < 2) this.depth = 0
    else if (argDepth < 4) this.depth = 1
    else if (argDepth < 10) this.depth = 2
    else if (argDepth < 16) this.depth = 3
    else this.depth = 4
  }

  /**
   * Nearness to the map edge.
   * @param  {Object} argLoc Point in screen coordinates
   * @return {Object|number} Direction point, or 0
   */
  checkBorders (argLoc) {
    const h = (argLoc.x - 4) / 2
    const v = (argLoc.y - 4) / 2
    const border = 4

    if (h < (1 + border)) return point(-1, 0)
    if (h > (this.topoWidth - border - 2)) return point(1, 0)
    if (v < (1 + border)) return point(0, -1)
    if (v > (this.topoHeight - border - 2)) return point(0, 1)
    return 0
  }

  /**
   * Depth under the three collision corners.
   * @param  {Object} argLoc   Boat point
   * @param  {Array}  corners  Three [x, y] offsets in topology units
   * @return {string|number}   '#Hit' | 1 | '#Shallow' | 0
   */
  checkDepth (argLoc, corners) {
    if (!this.active || !this.topo) return 0

    const baseH = (argLoc.x - 4) / 2
    const baseV = (argLoc.y - 4) / 2
    const total = this.topoWidth * this.topoHeight

    for (let n = 0; n < corners.length; n++) {
      const c = corners[n]
      const tmpH = baseH + c[0]
      const tmpV = baseV + c[1]

      const index = integer(tmpH + ((tmpV - 1) * this.topoWidth))

      // `char N of str` outside the string yields "" -> charToNum -> 0 -> land
      if (index < 1 || index > total) return '#Hit'

      const info = this.topo[index - 1]

      if (info === 0) return '#Hit'

      if (info < 4) {
        if (info < this.depth) return 1
        if (info === this.depth) return '#Shallow'
      }
    }

    return 0
  }

  kill () {
    this.topo = null
    this.active = false
    return 0
  }
}

/* -------------------------------------------------------------------------
 * MeterScript
 * ---------------------------------------------------------------------- */

/**
 * A gauge drawn as a strip of Director members.
 */
export class MeterScript {
  /**
   * @param {number} sp        Sprite number
   * @param {number} maxVal    Value shown by the last frame
   * @param {string} member    Name of the first member
   * @param {number} nrOfFrames Steps in the strip
   * @param {string} movie     Director movie
   * @param {number} lastMember Highest existing member (safety clamp)
   */
  constructor (sp, maxVal, member, nrOfFrames, movie, lastMember) {
    this.SP = sp
    this.nrOfFrames = nrOfFrames || 17
    this.movie = movie
    this.lastMember = lastMember

    this.speedPerFrame = maxVal / this.nrOfFrames
    if (this.speedPerFrame === 0) this.speedPerFrame = 1

    const first = g.dir.findMember(movie, member)
    this.firstFrame = first || 0
    this.meter = 0
    this.counter = 0
  }

  setMax (maxVal) {
    this.speedPerFrame = maxVal / this.nrOfFrames
    if (this.speedPerFrame === 0) this.speedPerFrame = 1
  }

  show (argSpeed) {
    this.meter = argSpeed / this.speedPerFrame
    if (this.meter > this.nrOfFrames) this.meter = this.nrOfFrames
    if (this.meter < 0) this.meter = 0

    let member = integer(this.firstFrame + this.meter)
    if (this.lastMember && member > this.lastMember) member = this.lastMember

    g.dir.setMember(this.SP, this.movie, member)
  }

  fill () {
    this.counter = 0
  }

  loop () {
    if ((this.counter % 2) === 0 && this.meter < this.nrOfFrames) {
      this.meter += 1
      let member = integer(this.firstFrame + this.meter)
      if (this.lastMember && member > this.lastMember) member = this.lastMember
      g.dir.setMember(this.SP, this.movie, member)
    }
    this.counter += 1
  }

  kill () {
    return 0
  }
}

/* -------------------------------------------------------------------------
 * DisplayBoat
 * ---------------------------------------------------------------------- */

const SIDE_LIST = [2, 1, 0, 3, 4]
const FRONT_BACK_LIST = [2, 1, 0, 4, 3]

/**
 * Lingo `getAt(list, n)` is 1 based - DisplayBoat passes `side + 3` which
 * spans 1..5 for the five entry side lists.
 *
 * @param  {Array}  list       Source list
 * @param  {number} lingoIndex 1 based index
 * @return {*}                 Entry, 0 when out of range
 */
function listAt (list, lingoIndex) {
  const i = Math.round(lingoIndex) - 1
  if (i < 0 || i >= list.length) return 0
  return list[i]
}

/**
 * Keeps sprite #boat pointed at the right boat picture.
 */
export class DisplayBoat {
  constructor (master, isShow) {
    this.masterObject = master
    this.SP = g.dir.spriteList['#boat']
    this.firstFrame = 0
    this.decimalPrec = 100
    this.frontBackList = FRONT_BACK_LIST
    this.sideList = SIDE_LIST
    this.visible = 1
    this.soundOn = 0
  }

  /** Member offset for a heading + inclination pair. */
  calcPicToShow (argDisplay, argDirection, argInclinationList) {
    const side = argInclinationList[0]
    const frontBack = argInclinationList[1]
    const tmpDir = 1 + (((argDirection % 16) + 16) % 16)
    return tmpDir + (80 * listAt(this.sideList, side + 3)) + (16 * listAt(this.frontBackList, frontBack + 3))
  }

  display (argInclinationList) {
    if (!this.visible) return

    const loc = this.masterObject.loc
    const direction = this.masterObject.direction
    const side = argInclinationList[1]
    const frontBack = argInclinationList[2]
    const tmpAlt = argInclinationList[0]

    const tmpDir = 1 + (((direction % 16) + 16) % 16)
    const xx = tmpDir + (80 * listAt(this.sideList, side + 3)) + (16 * listAt(this.frontBackList, frontBack + 3))

    g.dir.setMember(this.SP, g.dir.boatPack, this.firstFrame + xx)
    g.dir.setSpriteLoc(this.SP, point(-(tmpAlt / 10) + (loc.x / this.decimalPrec),
      (loc.y / this.decimalPrec)))
  }

  loop () {
    this.display(this.masterObject.inclinations)
  }

  show (yesNo) {
    this.visible = yesNo ? 1 : 0
    if (!this.visible) g.dir.hideSprite(this.SP)
    else this.display(this.masterObject.inclinations)
  }

  kill () {
    g.dir.hideSprite(this.SP)
    return 0
  }
}

/* -------------------------------------------------------------------------
 * SelectorMaster / TypeSelectButton
 * ---------------------------------------------------------------------- */

const ROLL_SOUNDS = { '#Motor': '05d130v0', '#Sail': '05d131v0', '#Oar': '05d129v0' }

/**
 * The three drive type buttons in the bottom panel.
 */
export class SelectorMaster {
  constructor (argOKTypes) {
    this.buttons = []
    if (Array.isArray(argOKTypes)) {
      const tmpSP = g.dir.spriteList['#BoatTypes']
      argOKTypes.forEach((type, i) => {
        const btn = new TypeSelectButton(this, tmpSP + i, type, ROLL_SOUNDS[type])
        this.buttons.push(btn)
      })
    }
  }

  clickedOne (target) {
    this.buttons.forEach((b) => {
      const match = (b === target) || (b.type === target)
      if (match) b.select()
      else b.deselect()
    })
  }

  activate (yesNo) {
    this.buttons.forEach((b) => b.activate(yesNo))
  }

  kill () {
    this.buttons.forEach((b) => b.kill())
    this.buttons = []
    return 0
  }
}

/**
 * Single drive type button.
 */
export class TypeSelectButton {
  constructor (reportObject, sp, type, sound) {
    this.reportObject = reportObject
    this.SP = sp
    this.type = type
    this.sound = sound
    this.selected = 0
    this.active = 1

    const name = 'TypePic' + type.substring(1) // #Sail -> TypePicSail
    this.firstFrame = g.dir.findMember('05.DXR', name) || 0
    this.rect = g.dir.getMemberRect('05.DXR', this.firstFrame)

    g.dir.setMember(this.SP, '05.DXR', this.firstFrame + 1)

    g.game.mulle.worldState.registerRect('type-' + sp, this.rect, {
      onOver: () => this.mouse('#enter'),
      onOut: () => this.mouse('#Leave'),
      onUp: () => this.mouse('#click')
    }, 'interface')
  }

  mouse (what) {
    if (!this.active) return
    if (what === '#click') {
      const tmp = g.dir.boat.changeType(this.type)
      // changeType returns the new type (e.g. '#Sail') on success,
      // or an error sound string (e.g. '#NoFuel') on failure.
      // Success means the returned value is a known drive type.
      const possible = g.dir.boat.possibleTypes || ['#Motor', '#Sail', '#Oar']
      if (typeof tmp === 'string' && possible.includes(tmp)) {
        this.reportObject.clickedOne(this)
      } else if (typeof tmp === 'string') {
        g.dir.mulleTalk.say(tmp, 4)
      }
      return
    }

    if (what === '#enter') {
      if (!this.selected) {
        if (g.globals.level === 1) g.dir.mulleTalk.say(this.sound, 6)
        g.dir.setMember(this.SP, '05.DXR', this.firstFrame + 2)
      }
      return
    }

    if (what === '#Leave') {
      if (!this.selected) g.dir.setMember(this.SP, '05.DXR', this.firstFrame + 1)
    }
  }

  select () {
    if (!this.active) return
    g.dir.setMember(this.SP, '05.DXR', this.firstFrame)
    this.selected = 1
  }

  deselect () {
    if (!this.active) return
    g.dir.setMember(this.SP, '05.DXR', this.firstFrame + 1)
    this.selected = 0
  }

  activate (yesNo) {
    this.active = yesNo ? 1 : 0
  }

  kill () {
    g.game.mulle.worldState.unregisterRect('type-' + this.SP)
    return 0
  }
}

/* -------------------------------------------------------------------------
 * Drive ancestors
 * ---------------------------------------------------------------------- */

/** Placeholder used before a drive type has been picked. */
export class DummyBoatAncestor {
  constructor () {
    this.type = '#none'
    this.child = null
  }

  init () {}
  steer () {}
  loop () { return 0 }
  setSpeed () {}
  display () {}
  playSounds () {}
  kill () { return 0 }
}

/**
 * Outboard / inboard engine drive.
 */
export class MotorBoatAncestor {
  constructor (child) {
    this.child = child
    this.type = '#Motor'
    this.motorSpeed = 0
    this.Steering = 0
    this.speedChange = 0
    this.playingSounds = false
    this.soundMode = '#normal'

    this.pitchPercent = 100
    this.volume = 80
    this.fuelConsumption = 0
    this.zeroSpeedWait = 0
    this.speedChangeSpeed = 2
    this.sndId = 0
  }

  init () {
    this.fuelConsumption = this.child.quickProps.fuelconsumption || 0
    this.playSounds(true)
    this.zeroSpeedWait = 0
    this.speedChangeSpeed = 2
  }

  kill () {
    g.dir.sounds.stop(this.sndId)
    return 0
  }

  steer (toWhere, argSpeed) {
    if (toWhere === '#left') this.Steering = -1
    else if (toWhere === '#right') this.Steering = 1
    else this.Steering = 0

    if (argSpeed === '#down') this.speedChange = -1
    else if (argSpeed === '#up') this.speedChange = 1
    else this.speedChange = argSpeed
  }

  loop () {
    const child = this.child

    if (child.steerMethod === '#mouse') {
      this.Steering = child.calcMouseDir()
      this.speedChange = (this.motorSpeed > 0) ? -1 : 0
      if (this.game().input.activePointer.isDown) this.speedChange = 1
    } else if (typeof this.speedChange !== 'number') {
      this.speedChange = 0
    }

    if (this.zeroSpeedWait) {
      this.zeroSpeedWait -= 1
    } else if (this.speedChange > 0) {
      if (this.motorSpeed < 100) {
        if (this.motorSpeed < 0 && this.motorSpeed >= -this.speedChangeSpeed) {
          this.zeroSpeedWait = 15
          this.motorSpeed = 0
        } else {
          this.motorSpeed += this.speedChangeSpeed
        }
      }
    } else if (this.speedChange < 0) {
      if (this.motorSpeed > -20) {
        if (this.motorSpeed > 0) {
          if (this.motorSpeed <= this.speedChangeSpeed) {
            this.zeroSpeedWait = 15
            this.motorSpeed = 0
          } else {
            this.motorSpeed -= (this.speedChangeSpeed * 2)
          }
        } else {
          this.motorSpeed -= this.speedChangeSpeed
        }
      }
    }

    if (!child.inFreeZone) {
      let fuel = child.fuel
      if (fuel > 0) {
        fuel -= (Math.abs(this.motorSpeed) * this.fuelConsumption / 30)
        child.fuelMeter.show(fuel)
        child.fuel = fuel
        if (fuel <= 0) {
          child.OutOfFuel()
          return 0
        }
      }
    }

    child.calcSpeedNDir(this.motorSpeed, this.Steering)
    return 0
  }

  setSpeed (argSpeed) {
    this.motorSpeed = argSpeed
  }

  display () {}

  playSounds (yesNo) {
    this.playingSounds = yesNo ? 1 : 0
  }

  game () {
    return g.game
  }
}

/**
 * Rowing drive - one impulse per stroke.
 */
export class OarBoatAncestor {
  constructor (child) {
    this.child = child
    this.type = '#Oar'
    this.Steering = 0
    this.Oar = 0
    this.oarForce = [20, 20, 20, 20, 40, 40, 40, 60, 60, 80, 100, 80, 80, 80, 60, 60, 60, 60, 40, 40, 40, 40, 20, 20, 0]
    this.forceCount = this.oarForce.length
    this.mouseForceCount = this.forceCount
    this.sounds = ['05d127v0', '05d126v0']
    this.soundCount = 1
    this.sndId = 0
  }

  init () {
    this.Steering = 0
    this.internalDirection = this.child.direction * this.child.decimalPrec
  }

  kill () {
    g.dir.sounds.stop(this.sndId)
    return 0
  }

  steer (toWhere, argSpeed) {
    if (toWhere === '#left') this.Steering = -1
    else if (toWhere === '#right') this.Steering = 1
    else this.Steering = 0

    if (typeof argSpeed === 'string') {
      if (this.Oar === 0) {
        if (argSpeed === '#down') this.Oar = -this.forceCount
        else if (argSpeed === '#up') this.Oar = this.forceCount
      }
    } else {
      this.Oar = 0
    }
  }

  loop () {
    const child = this.child
    let tmpForce = 0
    let tmpPlaySound = 0

    if (child.steerMethod === '#mouse') {
      this.Steering = child.calcMouseDir()
      if (g.game.input.activePointer.isDown) {
        tmpForce = this.oarForce[this.mouseForceCount - 1] || 0
        this.mouseForceCount -= 1
        if (this.mouseForceCount < 1) this.mouseForceCount = this.forceCount
        if (tmpForce === 0) tmpPlaySound = 1
      } else {
        this.mouseForceCount = this.forceCount
        tmpForce = 0
      }
    } else if (this.Oar > 1) {
      tmpForce = this.oarForce[this.Oar - 1] || 0
      this.Oar -= 1
      if (tmpForce === 0) tmpPlaySound = 1
    } else if (this.Oar < -1) {
      tmpForce = -(this.oarForce[(-this.Oar) - 1] || 0)
      this.Oar += 1
    } else {
      tmpForce = 0
    }

    child.mulleHungerSpeed = tmpForce
      ? 2 * child.orgMulleHungerSpeed
      : child.orgMulleHungerSpeed

    if (tmpPlaySound) {
      g.dir.sounds.stop(this.sndId)
      this.sndId = g.dir.sounds.play(this.sounds[this.soundCount - 1], '#BG')
      this.soundCount = 3 - this.soundCount
    }

    child.calcSpeedNDir(tmpForce * 13, this.Steering)
    return 0
  }

  setSpeed () {
    this.Oars = [1, 1]
  }

  display () {}

  playSounds () {}
}

/**
 * The sail picture book-keeper, used by SailBoatAncestor.
 */
export class Sail {
  constructor (reportObject) {
    this.reportObject = reportObject
    this.direction = 1
    this.SP = g.dir.spriteList['#Sail']
    this.firstFrame = 0
    this.tightness = 2
    this.forceList = [0, 20, 70, 80, 100]
    this.oldDiff = 0
    this.movie = 'SAIL.CXT'
  }

  kill () {
    g.dir.hideSprite(this.SP)
    return 0
  }

  setDirection (theDir) {
    this.direction = theDir
  }

  setTightness (how) {
    this.tightness += how
    if (this.tightness < 0) this.tightness = 0
    else if (this.tightness > 4) this.tightness = 4
  }

  calcDirection (theDir) {
    let tmpScoot = this.reportObject.scooting
    const game = g.game
    if (game.input.keyboard && game.input.keyboard.altKey) tmpScoot = -1

    this.setTightness(tmpScoot)

    const windDir = g.dir.weatherRenderer.wind.getToDirection()
    theDir = correctDirection(theDir - 8)

    let tmpDiff = windDir - theDir
    if (tmpDiff > 8) tmpDiff -= 16
    else if (tmpDiff < -8) tmpDiff += 16

    if (Math.abs(tmpDiff) > this.tightness) {
      tmpDiff = Math.sign(tmpDiff) * this.tightness
      this.oldDiff = tmpDiff
      this.direction = theDir + tmpDiff
    } else {
      this.oldDiff = tmpDiff
      this.direction = windDir
    }

    this.direction = correctDirection(this.direction)
  }

  setPic (argOffset) {
    g.dir.setMember(this.SP, this.movie, this.firstFrame + argOffset)
  }

  getForce () {
    let force = Math.abs(this.direction - g.dir.weatherRenderer.wind.getDirection())
    if (force >= 8) force -= 8
    if (force > 4) force = 8 - force
    return (this.forceList[force] || 0) * g.dir.weatherRenderer.wind.getSpeed() / 1000
  }

  loop () {}
}

/**
 * Wind powered drive.
 */
export class SailBoatAncestor {
  constructor (child) {
    this.child = child
    this.type = '#Sail'
    this.Sail = new Sail(this)
    this.Steering = 0
    this.scooting = 0
    this.soundMode = '#normal'
    this.SailSize = child.quickProps.sailsize || 0
  }

  init () {
    this.Steering = 0
    this.internalDirection = this.child.direction * this.child.decimalPrec
    this.SailSize = this.child.quickProps.sailsize || 0
  }

  kill () {
    return this.Sail.kill()
  }

  steer (toWhere, argScoot) {
    if (toWhere === '#left') this.Steering = -1
    else if (toWhere === '#right') this.Steering = 1
    else this.Steering = 0

    if (argScoot === '#up') this.scooting = -1
    else if (argScoot === '#down') this.scooting = 1
    else this.scooting = 0
  }

  loop () {
    const child = this.child

    let tmpForce = this.Sail.getForce()
    if (child.steerMethod === '#mouse') {
      this.Steering = child.calcMouseDir()
      tmpForce = (tmpForce > 0) * (tmpForce + 10) / 2
    }

    child.calcSpeedNDir(tmpForce * 14, this.Steering)

    this.Sail.calcDirection(child.direction)

    let tmpDiff = correctDirection(
      g.dir.weatherRenderer.wind.getDirection() - child.direction - 8)
    if (tmpDiff > 8) tmpDiff = 8 - tmpDiff
    else if (tmpDiff > 4) tmpDiff = 8 - tmpDiff
    if (tmpDiff < -4) tmpDiff = -8 - tmpDiff

    const tmpInclination = child.inclinations.slice()
    const tmpAngleDiff = correctDirection(child.direction - this.Sail.direction) - 8
    const tmpRadiansDiff = tmpAngleDiff * Math.PI / 8.0

    const tmp = calcRadians(tmpInclination)
    const tmpNewAngle = tmp[0] - tmpRadiansDiff
    const tmpHypo = tmp[1]

    const tmpSailIncl = [integer(tmpHypo * Math.sin(tmpNewAngle)), -integer(tmpHypo * Math.cos(tmpNewAngle))]

    for (let i = 0; i < 2; i++) {
      if (Math.abs(tmpSailIncl[i]) > 2) {
        tmpSailIncl[i] = 2 * tmpSailIncl[i] / Math.abs(tmpSailIncl[i])
      }
    }

    const tmpPicOffset = child.displayObject.calcPicToShow(
      child.displayObject,
      correctDirection(this.Sail.direction + 8),
      tmpSailIncl)
    this.Sail.setPic(tmpPicOffset)

    return tmpForce * tmpDiff * this.SailSize
  }

  setSpeed () {}

  display () {
    g.dir.setSpriteLoc(g.dir.spriteList['#Sail'],
      g.dir.getSpriteLoc(g.dir.spriteList['#boat']))
  }

  playSounds () {}
}

/* -------------------------------------------------------------------------
 * BoatBase
 * ---------------------------------------------------------------------- */

const CRASH_SOUNDS = {
  1: { '#Heavy': [1, 2, 3], '#Light': [4, 5, 6] },
  2: { '#Heavy': [7, 8, 9], '#Light': [10, 11, 12] }
}

const ERROR_SOUNDS = {
  '#NoRudder': '05d055v0',
  '#NoSteering': '05d056v0',
  '#NoTank': '05d023v0',
  '#NoWind': ['05d135v0', '05d136v0'],
  '#HardWind': '05d018v0',
  '#NoFuel': '05d137v0'
}

/**
 * The player's boat: position, physics, meters and drive selection.
 */
export class BoatBase {
  constructor () {
    this.decimalPrec = 100
    this.speed = 3
    this.velPoint = point(0, 0)
    this.direction = 1
    this.internalDirection = this.direction * this.decimalPrec
    this.firstFrame = 0
    this.loc = point(320 * this.decimalPrec, 240 * this.decimalPrec)

    this.quickProps = refreshBoatProperties(g.game)
    this.inclinations = [0, 0]
    this.depthChecker = new DepthChecker()
    this.locHistory = []
    this.swayHistory = []
    for (let n = 0; n < 10; n++) {
      this.locHistory.push({ x: this.loc.x, y: this.loc.y })
      this.swayHistory.push(0)
    }

    this.hitLast = 0
    this.steerMethod = '#Keys'

    const tmpPills = lookUpInventory(g.globals.user, '#Pills')
    const pillCount = (tmpPills && typeof tmpPills === 'object') ? (tmpPills.nr || 0) : 0
    this.buffaSick = 1000 + (pillCount * 25)

    this.mulleHunger = 1000
    const tmpHunger = lookUpInventory(g.globals.user, '#Belly')
    if (tmpHunger && typeof tmpHunger === 'object') this.mulleHunger = tmpHunger.nr || 0
    this.mulleHunger = this.mulleHunger * 10

    this.programControlsBoat = 0

    this.hungerMeter = new MeterScript(74, 10000, '34n003v0', 4, '05.DXR', 190)
    this.speedMeter = new MeterScript(70, 700, '34n002v0', 25, '05.DXR', 221)

    this.speedDivider = 1
    this.shallowCommentCounter = 500
    this.inFreeZone = 0
    this.changedMapRecently = 0
    this.cornerPoints = []
    this.currentCorners = []

    this.level = g.globals.level || 1
    this.orgMulleHungerSpeed = (this.level === 1) ? 3 : 2
    this.mulleHungerSpeed = this.orgMulleHungerSpeed

    this.crashSndID = 0
    this.notAllowedTypes = []
    this.ancestor = new DummyBoatAncestor()
    this.fuelMeter = new MeterScript(g.dir.spriteList['#fuel'], 1, '01a001v0', 13, '05.DXR', 132)

    this.possibleTypes = []
    this.SelectorMaster = null
    this.displayObject = null
    this.speedList = []
    this.Durability = undefined
    this.wishedType = 0
  }

  /* ---------------------------------------------------------- lifecycle */

  init () {
    this.possibleTypes = findPossiblePowers(this.quickProps)

    if (this.possibleTypes.length === 0) {
      console.warn('[world] CheatBoat!')
      g.dir.makeCheatBoat()
      this.quickProps = refreshBoatProperties(g.game)
      this.possibleTypes = findPossiblePowers(this.quickProps)
    }

    // Sort possible types in UI order: #Sail, #Motor, #Oar (left to right)
    const typeOrder = ['#Sail', '#Motor', '#Oar']
    this.possibleTypes.sort((a, b) => typeOrder.indexOf(a) - typeOrder.indexOf(b))

    this.SelectorMaster = new SelectorMaster(this.possibleTypes)
    this.displayObject = new DisplayBoat(this)
    this.calculateFuel()

    let tmpType = this.changeType(this.wishedType)
    this.wishedType = 0

    if (typeof tmpType === 'string' && tmpType.charAt(0) !== '#') {
      tmpType = this.changeType()
      if (typeof tmpType === 'string' && tmpType.charAt(0) !== '#') {
        g.dir.mulleTalk.say(tmpType, 1, this, null, '#GoHome')
        this.waitToGoHome()
        return
      }
    }

    this.calculateMyProps(tmpType)
    g.dir.weatherRenderer.waves.setCornerPoints([[0, -10], [-5, 5], [5, 5]])
  }

  kill () {
    g.dir.mulleTalk.deleteReference(this)
    this.speedMeter.kill()
    this.hungerMeter.kill()
    this.fuelMeter.kill()
    if (this.displayObject) this.displayObject.kill()
    if (this.SelectorMaster) this.SelectorMaster.kill()
    this.depthChecker.kill()
    if (this.ancestor) this.ancestor.kill()
    return 0
  }

  /* ------------------------------------------------------------- props */

  calculateFuel () {
    if (this.fuel === undefined || this.fuel === '#Full') {
      this.fuel = 4500 * (this.quickProps.fuelvolume || 0)
      this.quickProps.maxfuelvolume = this.fuel
    } else if (this.quickProps.maxfuelvolume === undefined) {
      this.quickProps.maxfuelvolume = 4000 * (this.quickProps.fuelvolume || 0)
    }
    this.fuelMeter.setMax(this.quickProps.maxfuelvolume || 1)
  }

  calculateMyProps (argType) {
    this.quickProps = refreshBoatProperties(g.game)
    makeCleanBoat(g.game, argType, this.quickProps)
    const result = recalculateBoatProps(g.game, argType, this.quickProps)

    this.speedList = result.speedList
    this.cornerPoints = calcCornersList(null)

    this.calculateFuel()
    this.stabilities = this.quickProps.stabilities || [100, 0]

    if (this.Durability === undefined) this.Durability = this.quickProps.durability || 0
    this.acceleration = this.quickProps.acceleration || 30
    this.retardation = this.quickProps.retardation || 10
    this.depthChecker.setDepth(this.quickProps.realdepth || 0)

    const tmpAllDriv = lookUpInventory(g.globals.user, '#DrivenTimes') || { Motor: 0, Sail: 0, Oar: 0 }
    const key = argType.substring(1)
    tmpAllDriv[key] = (tmpAllDriv[key] || 0) + 1
    setInInventory(g.globals.user, '#DrivenTimes', tmpAllDriv)

    if (this.ancestor) this.ancestor.kill()

    const ctors = {
      '#Motor': MotorBoatAncestor,
      '#Sail': SailBoatAncestor,
      '#Oar': OarBoatAncestor
    }
    const Ctor = ctors[argType] || DummyBoatAncestor
    this.ancestor = new Ctor(this)
    this.ancestor.init()

    if (this.SelectorMaster) this.SelectorMaster.clickedOne(argType)
  }

  getType () {
    return this.ancestor ? this.ancestor.type : 0
  }

  checkWindOK (argType) {
    if (argType === '#Sail' && g.dir.weatherRenderer.wind.getSpeed() === 0) {
      const snd = random(2) === 1 ? '05d135v0' : '05d136v0'
      g.dir.mulleTalk.say(snd, 5)
      return snd
    }
    return null
  }

  /**
   * Try to switch drive type.
   * @param  {string} [argRequestedType] '#Motor' | '#Sail' | '#Oar'
   * @return {string} Either '#Type' on success or an error sound name
   */
  changeType (argRequestedType) {
    if (argRequestedType && argRequestedType.charAt(0) === '#') {
      if (this.notAllowedTypes.includes(argRequestedType)) return 0
    }

    if (!this.quickProps) this.quickProps = refreshBoatProperties(g.game)

    const tmpCurrentlyOK = checkCurrentlyOKPowers(this.quickProps, this.possibleTypes)

    let tmpLastType = 0
    if (this.ancestor) tmpLastType = this.ancestor.type

    const motorOK = valueOf(tmpCurrentlyOK, '#Motor')
    if (motorOK === 1 && this.fuel !== undefined && this.fuel <= 0) {
      setValue(tmpCurrentlyOK, '#Motor', '#NoFuel')
    }

    let tmpType
    let tmpError = 0

    if (argRequestedType && argRequestedType.charAt(0) === '#') {
      if (valueOf(tmpCurrentlyOK, argRequestedType) === 1) {
        this.calculateMyProps(argRequestedType)
        this.checkWindOK(argRequestedType)
        return argRequestedType
      }
      tmpError = valueOf(tmpCurrentlyOK, argRequestedType)
    } else {
      const pos = positionOfValue(tmpCurrentlyOK, 1)
      if (pos >= 0) {
        tmpType = tmpCurrentlyOK[pos][0]
      }
    }

    if (tmpType) {
      if (tmpLastType === '#Motor') {
        if (tmpType === '#Sail') g.dir.mulleTalk.say('#MotorToSail', 5)
        else g.dir.mulleTalk.say('#MotorToOar', 5)
      } else if (tmpLastType === '#Sail' && tmpType === '#Oar') {
        g.dir.mulleTalk.say('#SailToOar', 5)
      }
      this.checkWindOK(tmpType)
      return tmpType
    }

    return errorSound(tmpError)
  }

  calculateFuelAmountRemoved () {}

  OutOfFuel () {
    if (this.possibleTypes.length === 1) {
      g.dir.mulleTalk.say('#OutOfFuel', 1, this, '#Q', '#GoHomeTow')
      this.waitToGoHome()
      return
    }
    const tmpType = this.changeType()
    if (typeof tmpType === 'string' && tmpType.charAt(0) !== '#') {
      g.dir.mulleTalk.say(tmpType, 1, this, null, '#GoHomeTow')
      this.waitToGoHome()
      return
    }
    this.calculateMyProps(tmpType)
  }

  fillErUp () {
    this.fuel = '#Full'
    this.calculateFuel()
    this.fuelMeter.show(typeof this.fuel === 'number' ? this.fuel : this.quickProps.maxfuelvolume || 0)
  }

  save () {
    const tmpPillsList = lookUpInventory(g.globals.user, '#Pills')
    if (tmpPillsList && typeof tmpPillsList === 'object') {
      const left = (this.buffaSick - 1000) / 25
      if (left > 0) tmpPillsList.nr = left
      else delete g.globals.user.Inventory['#Pills']
    }
    setInInventory(g.globals.user, '#Belly', { nr: this.mulleHunger / 10 })
    return {
      direction: this.direction,
      loc: point(this.loc.x / this.decimalPrec, this.loc.y / this.decimalPrec),
      fuel: this.fuel,
      Durability: this.Durability,
      type: this.getType()
    }
  }

  load (argList) {
    if (!argList) return
    if (argList.direction) {
      this.direction = argList.direction
      this.internalDirection = this.direction * this.decimalPrec
    }
    if (argList.loc) {
      this.loc = point(argList.loc.x * this.decimalPrec, argList.loc.y * this.decimalPrec)
      this.locHistory = this.locHistory.map(() => ({ x: this.loc.x, y: this.loc.y }))
    }
    const tmpFuel = argList.fuel
    if (tmpFuel === '#Full' || typeof tmpFuel === 'number') this.fuel = tmpFuel
    if (typeof argList.Durability === 'number') this.Durability = argList.Durability
    this.wishedType = argList.type || 0
  }

  cheat () {
    this.mulleHunger = 10000
    this.fuel = 40000
    this.buffaSick = 2000
  }

  stopMotor () {
    if (this.ancestor && this.ancestor.type === '#Motor') this.ancestor.setSpeed(0)
  }

  stepback (argNrOfSteps) {
    this.speed = 0
    if (argNrOfSteps < 1) return this.loc
    let tmp = this.locHistory.length - argNrOfSteps + 1
    if (tmp < 1) tmp = 1
    this.loc = Object.assign({}, this.locHistory[tmp - 1])
    for (let n = tmp; n < this.locHistory.length; n++) {
      this.locHistory[n] = Object.assign({}, this.loc)
    }
    return this.loc
  }

  freeZone (yesNo) {
    this.inFreeZone = yesNo
  }

  setTopology (which) {
    this.depthChecker.setTopology(which)
  }

  getShowCoordinate () {
    return point(this.loc.x / this.decimalPrec, this.loc.y / this.decimalPrec)
  }

  setShowCoordinate (argPoint) {
    this.loc = point(argPoint.x * this.decimalPrec, argPoint.y * this.decimalPrec)
  }

  setCoordinate (argPoint, mode) {
    if (mode === '#AdjustTopo') this.setShowCoordinate(argPoint)
    else this.setShowCoordinate(argPoint)
  }

  steer (arg1, arg2) {
    if (this.ancestor) this.ancestor.steer(arg1, arg2)
  }

  playSounds (yesNo) {
    if (this.ancestor) this.ancestor.playSounds(yesNo)
  }

  waitToGoHome () {
    g.dir.activateinterface(0)
    this.programControlsBoat = 1
  }

  programControl (yesNo) {
    this.programControlsBoat = yesNo ? 1 : 0
  }

  mulleFinished (argID) {
    if (argID === '#continue') {
      g.dir.hideSprite(g.dir.spriteList['#TRANS'])
      g.dir.pause(0)
    } else if (argID === '#GoHome') {
      g.dir.prepareToLeave('04')
    } else if (argID === '#GoHomeTow') {
      g.dir.prepareToLeave('04', '33b011v0', '33e011v0')
    } else if (argID === '#GoHomeCapsize') {
      g.dir.prepareToLeave('04', '33b014v0', '05d125v0')
    }
  }

  /* ------------------------------------------------------------ physics */

  calcMouseDir () {
    const mousePoint = point(g.game.input.activePointer.x, g.game.input.activePointer.y)
    const tmp = calcDirection(this.getShowCoordinate(), mousePoint, '#WithHypo')
    const tmpDirection = tmp[0]
    const tmpDiff = tmpDirection - this.direction
    if (Math.abs(tmpDiff) >= 8) return 0
    if (tmpDiff > 0) return 1
    if (tmpDiff < 0) return -1
    return 0
  }

  calcSpeedNDir (argForce, argSteering) {
    const props = this.quickProps
    const power = props.power || 0

    const tmpPowerIn = Math.abs(argForce * power)
    const tmpPower = Math.floor(tmpPowerIn / 100)
    const tmpDec = tmpPowerIn - (tmpPower * 100)

    let tmpLower
    let tmpHigher

    if (tmpPower) {
      const count = this.speedList.length
      if (tmpPower > count) {
        tmpLower = this.speedList[count - 1] || 0
        tmpHigher = tmpLower
      } else {
        tmpLower = this.speedList[tmpPower - 1] || 0
        tmpHigher = this.speedList[tmpPower] !== undefined ? this.speedList[tmpPower] : tmpLower
      }
    } else {
      tmpLower = 0
      tmpHigher = this.speedList[0] || 0
    }

    let tmpWanted = tmpLower + (tmpDec * (tmpHigher - tmpLower) / 100)
    if (argForce < 0) tmpWanted = -tmpWanted

    const tmp = tmpWanted - this.speed
    let change

    if (tmp > 0) {
      change = this.acceleration * (tmpWanted - this.speed) / this.decimalPrec
      if (Math.abs(change) > this.acceleration) {
        change = this.acceleration * ((2 * (change > 0 ? 1 : 0)) - 1)
      }
    } else {
      change = this.retardation * (tmpWanted - this.speed) / this.decimalPrec
      if (Math.abs(change) > this.retardation) {
        change = this.retardation * ((2 * (change > 0 ? 1 : 0)) - 1)
      }
    }

    this.speed += change

    if (argSteering) {
      const tmpSteer = argSteering * (props.manoeuverability || 0) / 40
      this.internalDirection += tmpSteer
      this.direction = correctDirection(this.internalDirection / this.decimalPrec)
    }

    this.currentCorners = this.cornerPoints[this.direction - 1] || [[0, -10], [-5, 5], [5, 5]]
    const v = getVelPoint(DirectionList, this.direction)
    this.velPoint = point(v.x * this.speed / 100, v.y * this.speed / 100)
  }

  setSpeed (argSpeed) {
    this.speed = argSpeed
  }

  checkBorders () {
    const tmp = this.depthChecker.checkBorders(this.getShowCoordinate())

    if (tmp && typeof tmp === 'object') {
      const neighbour = g.globals.world.getNewMapId(tmp, '#Relational', 1)
      if (Number.isInteger(neighbour)) {
        const tmpBorder = 8 + 4
        if (tmp.x === -1) this.loc = point((640 - tmpBorder) * this.decimalPrec, this.loc.y)
        else if (tmp.x === 1) this.loc = point((4 + tmpBorder) * this.decimalPrec, this.loc.y)
        else if (tmp.y === -1) this.loc = point(this.loc.x, (396 - tmpBorder) * this.decimalPrec)
        else if (tmp.y === 1) this.loc = point(this.loc.x, (4 + tmpBorder) * this.decimalPrec)

        g.dir.changeMap(tmp)
        this.changedMapRecently = 5
      } else {
        const l = this.getShowCoordinate()
        let x = l.x
        let y = l.y
        if (x > 630) x = 630
        else if (x < 10) x = 10
        if (y > 386) y = 386
        else if (y < 10) y = 10
        this.loc = point(x * this.decimalPrec, y * this.decimalPrec)
        g.dir.mulleTalk.say('05d051v0', 2)
      }
    }

    if (this.changedMapRecently) this.changedMapRecently -= 1
  }

  loop () {
    if (this.programControlsBoat) return

    const wind = g.dir.weatherRenderer.wind
    const driftX = 90 * (this.quickProps.drift || 0) * wind.getVelPoint().x / 100 / 100
    const driftY = 90 * (this.quickProps.drift || 0) * wind.getVelPoint().y / 100 / 100

    this.loc = point(
      this.loc.x + ((this.velPoint.x + driftX) / this.speedDivider),
      this.loc.y + ((this.velPoint.y + driftY) / this.speedDivider)
    )

    this.checkBorders()

    this.speedMeter.show(Math.abs(this.speed))
    this.hungerMeter.show(this.mulleHunger)

    const tmpInfo = this.depthChecker.checkDepth(this.getShowCoordinate(), this.currentCorners)

    if (tmpInfo === '#Hit' || tmpInfo === 1) {
      const damage = Math.abs(this.speed)

      if (!this.changedMapRecently) this.stepback(2)

      this.velPoint = point(0, 0)
      this.speed = 0
      g.dir.mulleTalk.say('#CrashEasy', 4, 0, 0, 0, 100)

      if (g.dir.sounds.finished(this.crashSndID)) {
        const material = this.quickProps.material || 1
        let tmpSnds = CRASH_SOUNDS[material] || CRASH_SOUNDS[1]
        tmpSnds = (this.quickProps.weight < 100) ? tmpSnds['#Heavy'] : tmpSnds['#Light']

        let tmpVol = 60
        if (damage > 300) tmpVol = 90
        else if (damage > 100) tmpVol = 75

        const snd = '05e008v1'
        this.crashSndID = g.dir.sounds.play(snd, '#EFFECT')
        if (this.crashSndID) g.dir.sounds.setVol(this.crashSndID, tmpVol)
      }

      if (!this.inFreeZone) {
        this.Durability -= damage
        if (this.Durability <= 0) {
          g.dir.mulleTalk.say('#crash', 1, this, '#Q', '#GoHomeTow')
          this.waitToGoHome()
        }
      }

      const last = this.locHistory[this.locHistory.length - 1]
      const lastPoint = point(last.x / this.decimalPrec, last.y / this.decimalPrec)
      if (!pointEq(pointSubSafe(this.getShowCoordinate(), lastPoint), point(0, 0))) {
        // keep rolling
      } else {
        this.speed = 0
        this.hitLast = 1
      }
    } else if (tmpInfo === '#Shallow') {
      if (this.shallowCommentCounter > 500) this.shallowCommentCounter = 0
      if ((this.shallowCommentCounter % 50) === 0 || this.speedDivider === 1) {
        const sounds = ['05e058v0', '05e059v0', '05e060v0']
        g.dir.sounds.play(sounds[random(3) - 1], '#OPEFFECT')
      }
      this.speedDivider = 2
    } else {
      this.speedDivider = 1
    }

    this.shallowCommentCounter += 1

    this.locHistory.push({ x: this.loc.x, y: this.loc.y })
    this.locHistory.shift()

    const additionalSideForce = this.ancestor.loop()

    const topoInfo = g.dir.weatherRenderer.waves.getTopoInfo(
      this.getShowCoordinate(), this.direction, this.currentCorners)

    const tmpAlt = topoInfo[0]
    let frontBack = (this.stabilities[0] || 0) * topoInfo[1] / 17

    if (!this.inFreeZone && this.level >= 4 && this.buffaSick > 0) {
      const tmpLast = this.swayHistory[this.swayHistory.length - 1]
      const tmpDiff = Math.abs(frontBack - tmpLast)
      this.buffaSick -= (tmpDiff / 13)
      if (this.buffaSick <= 0) {
        g.dir.mulleTalk.say('#Vomit', 1, this, '#Q', '#GoHome')
        this.waitToGoHome()
      }
    }

    if (!this.inFreeZone && this.mulleHunger > 0) {
      this.mulleHunger -= this.mulleHungerSpeed
      if (this.mulleHunger <= 0) {
        g.dir.mulleTalk.say('#Hungry', 1, this, '#Q', '#GoHome')
        this.waitToGoHome()
      }
    }

    this.swayHistory.push(frontBack)
    this.swayHistory.shift()

    frontBack = frontBack / 100

    let tmpSideAngle
    if (additionalSideForce) {
      tmpSideAngle = (this.stabilities[1] || 0) * ((topoInfo[2] / 4) - (additionalSideForce / 100)) / 100
    } else {
      tmpSideAngle = (this.stabilities[1] || 0) * topoInfo[2] / 100
    }

    if (Math.abs(tmpSideAngle) > 30) {
      if (!this.inFreeZone) {
        g.dir.mulleTalk.say('#Capsize', 1, this, '#Q', '#GoHomeCapsize')
        this.waitToGoHome()
      }
    } else if (Math.abs(tmpSideAngle) > 27) {
      g.dir.mulleTalk.say('#LurchHard', 4, this, 0, 0, 100)
    } else if (Math.abs(tmpSideAngle) > 23) {
      g.dir.mulleTalk.say('#LurchEasy', 4, this, 0, 0, 100)
    }

    let side = tmpSideAngle / 5
    if (Math.abs(side) > 2) side = Math.sign(side) * 2
    if (Math.abs(frontBack) > 2) frontBack = Math.sign(frontBack) * 2

    this.inclinations = [side, frontBack]

    this.displayObject.display([tmpAlt, side, frontBack])
    this.ancestor.display()
  }
}

function pointSubSafe (a, b) {
  return { x: a.x - b.x, y: a.y - b.y }
}

/* ------------------------------------------------------ property helpers */

function valueOf (list, key) {
  for (let i = 0; i < list.length; i++) {
    if (list[i][0] === key) return list[i][1]
  }
  return undefined
}

function setValue (list, key, value) {
  for (let i = 0; i < list.length; i++) {
    if (list[i][0] === key) {
      list[i][1] = value
      return
    }
  }
  list.push([key, value])
}

function positionOfValue (list, value) {
  for (let i = 0; i < list.length; i++) {
    if (list[i][1] === value) return i
  }
  return -1
}

function errorSound (error) {
  if (!error || error === 1) return ERROR_SOUNDS['#NoSteering'] || '05d001v0'
  const snd = ERROR_SOUNDS[error]
  if (Array.isArray(snd)) return snd[random(2) - 1]
  return snd || '05d001v0'
}
