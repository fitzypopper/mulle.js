/**
 * Weather, waves, wind and Mulle's chatter for the sailing scene.
 *
 * Direct port of the 05.DXR / 00.CXT parent scripts:
 *
 *   ParentScript 18 - WeatherRenderer
 *   ParentScript 21 - Wind
 *   ParentScript 22 / 23 - Waves / SingleWave
 *   ParentScript 42 - MulleSez
 *   ParentScript 24 - AmbienceSound
 *   ParentScript 18 - LoopHandler (00.CXT)
 *   ParentScript 142 - Weather (00.CXT)
 *
 * @module objects/boat/weather
 */
'use strict'

import {
  g, random, integer, correctDirection, getVelPoint, calcDirection, point, pointAdd
} from './lingo'
import { DirectionList, SpawnLines, amplitudeList } from '../../struct/saildata'

/* -------------------------------------------------------------------------
 * LoopHandler
 * ---------------------------------------------------------------------- */

/**
 * Tick list, the `loopMaster of gMulleGlobals`.
 */
export class LoopHandler {
  constructor () {
    this.objects = []
    this.addList = []
    this.deleteList = []
  }

  addObject (obj) {
    if (this.objects.includes(obj) || this.addList.includes(obj)) return
    this.addList.push(obj)
  }

  deleteObject (obj) {
    if (!this.deleteList.includes(obj)) this.deleteList.push(obj)
  }

  loop () {
    if (this.deleteList.length) {
      this.deleteList.forEach((o) => {
        const i = this.objects.indexOf(o)
        if (i >= 0) this.objects.splice(i, 1)
      })
      this.deleteList = []
    }

    if (this.addList.length) {
      this.objects = this.objects.concat(this.addList)
      this.addList = []
    }

    this.objects.forEach((o) => {
      if (o && typeof o.loop === 'function') o.loop()
    })
  }
}

/* -------------------------------------------------------------------------
 * Weather
 * ---------------------------------------------------------------------- */

const WIND_INFO = [
  { '#Speeds': [1], '#Directions': [12] },
  { '#Speeds': [0, 1, 2], '#Directions': [16, 2, 6, 8, 10] },
  { '#Speeds': [0, 1, 2, 3], '#Directions': [16, 2, 6, 8, 10] },
  { '#Speeds': [0, 2, 3], '#Directions': [2, 4, 4, 6, 8, 10, 12, 12, 14, 16] }
]

const POSSIBLE_WEATHER = [
  [1], [1], [1, 2], [3, 4], [1, 2, 3, 4], [1, 2, 3, 4]
]

function listValue (list, key) {
  for (let i = 0; i < list.length; i++) {
    if (list[i][0] === key) return list[i][1]
  }
  return undefined
}

/**
 * Long running weather simulation (00.CXT `Weather`).
 */
export class Weather {
  constructor (globals) {
    this.globals = globals
    this.weatherType = 1
    this.windspeed = 0
    this.windDirection = 1
    this.foreCastCounter = 0
    this.changeWaitCounter = 0
    this.reportTime = 0
    this.nextWeather = []
    this.windInfo = WIND_INFO
    this.possibleWeatherInLevel = POSSIBLE_WEATHER

    this.setNextWeather()
    this.loop()

    g.globals.loopMaster.addObject(this)
  }

  setNextWeather (argRandomWait) {
    const level = Math.min(Math.max((this.globals.level || 1) - 1, 0), 5)
    const possible = this.possibleWeatherInLevel[level] || [1]

    this.foreCastCounter = random(possible.length) - 1
    const tmpType = possible[this.foreCastCounter]
    const info = this.windInfo[tmpType - 1] || this.windInfo[0]

    this.nextWeather = [
      ['#type', tmpType],
      ['#speed', info['#Speeds'][random(info['#Speeds'].length) - 1]],
      ['#direction', info['#Directions'][random(info['#Directions'].length) - 1]]
    ]

    if (argRandomWait) {
      const quarter = Math.max(1, Math.floor(argRandomWait / 4))
      this.reportTime = quarter + random(quarter)
      this.changeWaitCounter = argRandomWait
    } else {
      this.reportTime = 0
      this.changeWaitCounter = 0
    }
  }

  loop () {
    if (this.changeWaitCounter === 0) {
      this.weatherType = listValue(this.nextWeather, '#type')
      this.windDirection = listValue(this.nextWeather, '#direction')
      this.windspeed = listValue(this.nextWeather, '#speed')
      this.setNextWeather(3000 + random(3000))
    } else {
      this.changeWaitCounter -= 1
    }
  }

  getComingWeather () {
    if (this.changeWaitCounter < this.reportTime) {
      return this.nextWeather
    }
    return [
      ['#type', this.weatherType],
      ['#direction', this.windDirection],
      ['#speed', this.windspeed]
    ]
  }

  getWindspeed () {
    return this.windspeed
  }

  getWindDirection () {
    return this.windDirection
  }

  kill () {
    g.globals.loopMaster.deleteObject(this)
    return 0
  }
}

/* -------------------------------------------------------------------------
 * Wind
 * ---------------------------------------------------------------------- */

/**
 * Wind vane: drives the `strut` sprite and hands out the drift vector.
 */
export class Wind {
  constructor () {
    this.randSpeed = 3
    this.speed = 0
    this.randDirection = 2
    this.direction = 15 * 100
    this.SP = g.dir.spriteList['#Stroot']
    this.firstFrame = 508 // -1 + number of member "strut0000"
    this.changeTime = 0
    this.counter = 0
    this.smallChange = 0
    this.smallChangeWait = 0
    this.vel = point(0, 0)
    this.toSpeed = 0
    this.toDirection = 0
    this.speedStep = 0
    this.directionStep = 0

    g.globals.loopMaster.addObject(this)
  }

  init () {
    this.loop()
  }

  kill () {
    g.globals.loopMaster.deleteObject(this)
    return 0
  }

  loop () {
    if (this.changeTime) {
      this.speed += this.speedStep
      this.direction += this.directionStep
      this.changeTime -= 1
      if (this.changeTime === 0) {
        this.speed = this.toSpeed
        this.direction = this.toDirection
      }
    }

    const tmpDirection = correctDirection((this.direction / 100) + 8)
    const vp = getVelPoint(DirectionList, tmpDirection)
    this.vel = point(this.speed * vp.x / 100, this.speed * vp.y / 100)

    let tmpPicOffset
    if (this.speed >= 300) tmpPicOffset = 0
    else if (this.speed >= 200) tmpPicOffset = 1
    else if (this.speed >= 100) tmpPicOffset = 2
    else tmpPicOffset = 3

    if (this.smallChangeWait <= 0) {
      this.smallChangeWait = random(6)
      this.smallChange = random(2) - 1
    } else {
      this.smallChangeWait -= 1
    }

    let member = this.firstFrame +
      (tmpPicOffset * 32) +
      (correctDirection(tmpDirection + 9) * 2) +
      this.smallChange
    if (member > 636) member = 636
    if (member < 509) member = 509

    g.dir.setMember(this.SP, '05.DXR', member)
  }

  getVelPoint () {
    return this.vel
  }

  slowChange (argSpeed, argDirection, argTime) {
    this.toSpeed = argSpeed * 100
    this.changeTime = argTime
    this.speedStep = (this.toSpeed - this.speed) / this.changeTime

    let tmpDirChange = argDirection - (this.direction / 100)
    if (tmpDirChange > 8) tmpDirChange -= 16
    else if (tmpDirChange < -8) tmpDirChange = -16 - tmpDirChange

    this.toDirection = argDirection * 100
    this.directionStep = tmpDirChange * 100 / this.changeTime
  }

  getDirection () {
    return correctDirection(this.direction / 100)
  }

  getToDirection () {
    return correctDirection((this.direction / 100) + 8)
  }

  getSpeed () {
    return this.speed
  }

  Change (argSpeed, argDirection) {
    if (argSpeed !== undefined && argSpeed !== null) this.speed = Math.trunc(argSpeed * 100)
    if (argDirection !== undefined && argDirection !== null) this.direction = argDirection * 100
  }
}

/* -------------------------------------------------------------------------
 * SingleWave
 * ---------------------------------------------------------------------- */

const WAVE_DUR = 30
const WAVE_MAX = 4

function buildFrameList () {
  const list = []
  for (let m = 1; m <= 2; m++) {
    for (let n = 1; n <= WAVE_DUR - 1; n++) list.push(1 + ((WAVE_MAX - 1) * n / WAVE_DUR))
    for (let n = 1; n <= WAVE_DUR; n++) list.push(WAVE_MAX)
    for (let n = 2; n <= WAVE_DUR; n++) list.push(1 + ((WAVE_MAX - 1) * (WAVE_DUR - n) / WAVE_DUR))
  }
  return list
}

const WAVE_FRAMES = buildFrameList()

/**
 * One travelling wave sprite.
 */
export class SingleWave {
  constructor (reportObject, sp, theLoc, velPoint, direction, amplitude) {
    this.reportObject = reportObject
    this.SP = sp
    this.amplitude = amplitude

    if (amplitude > 60) {
      this.firstFrame = 272 + (4 * (direction - 1)) // -1 + number of member "WavePic1"
    } else {
      this.firstFrame = 360 + (4 * (direction - 1)) // -1 + number of member "WavePic2"
    }

    this.frameList = WAVE_FRAMES
    this.listLen = this.frameList.length
    this.counter = random(this.listLen - 1)
    this.vel = velPoint
    this.loc = point(theLoc.x * 10, theLoc.y * 10)
    this.active = 1
    this.waveCircle = 70

    this.loop()
  }

  kill () {
    g.dir.hideSprite(this.SP)
    this.active = 0
    return 0
  }

  check (thePoint) {
    const dx = thePoint.x - (this.loc.x / 10)
    const dy = thePoint.y - (this.loc.y / 10)
    const hypo = Math.sqrt((dx * dx) + (dy * dy))

    let factor = this.waveCircle - hypo
    if (factor < 0) factor = 0

    return this.frameList[this.counter - 1] * factor * this.amplitude * 2
  }

  getLoc () {
    return point(this.loc.x / 10, this.loc.y / 10)
  }

  loop () {
    if (!this.active) return

    this.counter += 1
    if (this.counter >= this.listLen) this.counter = 1

    if (this.loc.x < -1000 || this.loc.y < -1000 || this.loc.x > 6400 || this.loc.y > 5100) {
      this.reportObject.Stopped(this)
      this.active = 0
      return
    }

    const tmpFrame = this.frameList[this.counter - 1]
    this.loc = point(
      this.loc.x + (this.vel.x / 2) + (this.vel.x * tmpFrame / 8),
      this.loc.y + (this.vel.y / 2) + (this.vel.y * tmpFrame / 8)
    )

    g.dir.setSpriteLoc(this.SP, point(this.loc.x / 10, this.loc.y / 10))
    g.dir.setMember(this.SP, '05.DXR', integer(this.firstFrame + tmpFrame))
  }
}

/* -------------------------------------------------------------------------
 * Waves
 * ---------------------------------------------------------------------- */

/**
 * Keeps up to six wave sprites moving across the play field.
 */
export class Waves {
  constructor () {
    this.phase = 0
    this.waveObjs = []
    // SpawnLines is exported as [[x, y], [x, y]] pairs - Director points are
    // objects for us, so rehydrate them once here.
    this.spawnLines = SpawnLines.map((line) => line.map((p) => point(
      p.x !== undefined ? p.x : p[0],
      p.y !== undefined ? p.y : p[1]
    )))
    this.amplitudeList = amplitudeList
    this.corners = []
    this.deleteList = []
    this.speed = 0
    this.direction = 1
    this.amplitude = 0
    this.period = 30
    this.waveAngle = 0
    this.waveVelPoint = point(0, 0)
    this.currentSpawnLine = [point(20, 202), point(0, -100)]

    const tmpSP = g.dir.spriteList['#waves']
    this.waveSPs = []
    for (let n = 1; n <= 6; n++) this.waveSPs.push(tmpSP + n - 1)

    g.globals.loopMaster.addObject(this)
  }

  init () {}

  kill () {
    g.globals.loopMaster.deleteObject(this)
    return 0
  }

  setCornerPoints (theList) {
    if (!theList) theList = [[0, -10], [-5, 5], [5, 5]]

    const hypos = []
    const orgAngles = []

    for (const p of theList) {
      const tmpX = p[0]
      const tmpY = p[1]
      const hypo = Math.sqrt((tmpX * tmpX) + (tmpY * tmpY))
      hypos.push(hypo)

      let angle
      if (tmpY === 0) angle = Math.abs(tmpX) / tmpX * Math.PI / 2
      else angle = Math.atan(tmpX / tmpY)

      if (tmpX > 0) {
        if (tmpY <= 0) angle += Math.PI
      } else if (tmpY > 0) {
        angle += 2 * Math.PI
      } else {
        angle += Math.PI
      }

      orgAngles.push(angle)
    }

    this.corners = []
    const tmpDirs = 16

    for (let n = 1; n <= tmpDirs; n++) {
      const tmpList = []
      const addAngle = 2 * Math.PI * n / tmpDirs
      for (let m = 0; m < theList.length; m++) {
        const angle = orgAngles[m] + addAngle
        const hypo = hypos[m]
        tmpList.push([Math.trunc(-hypo * Math.sin(angle)), Math.trunc(hypo * Math.cos(angle))])
      }
      this.corners.push(tmpList)
    }
  }

  setDirection (argDir, argSpeed) {
    if (this.waveObjs.length) {
      this.waveObjs.slice().forEach((w) => this.Stopped(w))
      this.deleteObjects()
      this.waveObjs = []
    }

    this.speed = integer(argSpeed)
    this.direction = correctDirection(argDir + 8)
    this.currentSpawnLine = this.spawnLines[this.direction - 1]
    this.waveAngle = this.direction * Math.PI / 8.0
    this.waveVelPoint = point(
      10 * this.speed * Math.sin(this.waveAngle),
      -10 * this.speed * Math.cos(this.waveAngle))

    this.amplitude = this.speed * 30
    this.period = 30 + (this.speed * 30)
    this.phase = 0

    if (this.speed === 0) return

    const tmpCnt = this.waveSPs.length
    for (let n = 1; n <= tmpCnt - 2; n++) {
      const sp = this.waveSPs.shift()
      const wave = new SingleWave(this, sp,
        point(random(640), random(400)), this.waveVelPoint, this.direction, this.amplitude)
      this.waveObjs.push(wave)
    }
  }

  Stopped (theObj) {
    this.waveSPs.push(theObj.SP)
    theObj.kill()
    if (this.deleteList.indexOf(theObj) < 0) this.deleteList.push(theObj)
  }

  loop () {
    if (random(30) === 1 && this.speed > 0 && this.waveSPs.length) {
      const tmpLocs = this.waveObjs.map((w) => w.getLoc())

      const tmpMid = this.currentSpawnLine[0]
      const tmpLim = this.currentSpawnLine[1]

      let tmpX = 0
      let tmpY = 0
      let itsBad = 1

      for (let n = 1; n <= 30; n++) {
        const tmpRnd = random(400) - 200
        tmpX = tmpMid.x + (tmpLim.x * tmpRnd / 100)
        tmpY = tmpMid.y + (tmpLim.y * tmpRnd / 100)

        itsBad = 0
        for (const aLoc of tmpLocs) {
          if (Math.abs(tmpX - aLoc.x) < 100) { itsBad = 1; break }
          if (Math.abs(tmpY - aLoc.y) < 100) { itsBad = 1; break }
        }
        if (!itsBad) break
      }

      if (!itsBad) {
        const sp = this.waveSPs.shift()
        const wave = new SingleWave(this, sp, point(tmpX, tmpY),
          this.waveVelPoint, this.direction, this.amplitude)
        this.waveObjs.push(wave)
      }
    }

    this.phase = ((this.phase + this.speed) % this.period + this.period) % this.period

    this.waveObjs.forEach((w) => w.loop())
    this.deleteObjects()
  }

  deleteObjects () {
    this.deleteList.forEach((obj) => {
      const i = this.waveObjs.indexOf(obj)
      if (i >= 0) this.waveObjs.splice(i, 1)
    })
    this.deleteList = []
  }

  /**
   * Average water height under the hull plus the two tilt components.
   * @return {Array} [altitude, frontBack, side]
   */
  getTopoInfo (theCenter, theDir, argCorners) {
    let totAlt = 0
    const alts = []

    for (let n = 0; n < 3; n++) {
      const c = argCorners[n] || [0, 0]
      const alt = this.getAltitude(point(theCenter.x + c[0], theCenter.y + c[1]))
      alts.push(alt)
      totAlt += alt
    }

    const frontBack = alts[0] - ((alts[1] + alts[2]) / 2)
    const side = alts[1] - alts[2]
    return [totAlt / 3, frontBack, side]
  }

  getAltitude (aPoint) {
    let bigWaveTot = 0
    for (const w of this.waveObjs) bigWaveTot += w.check(aPoint)

    if (bigWaveTot > 7000 && g.dir.ambience) g.dir.ambience.hitWave(bigWaveTot)

    const tmpX = aPoint.x + 100
    const tmpY = aPoint.y + 100
    const tmpAngle = Math.atan(tmpX / tmpY)
    const hypo = Math.sqrt((tmpX * tmpX) + (tmpY * tmpY))
    const totalAngle = tmpAngle + this.waveAngle
    const fromZero = integer(hypo * Math.cos(totalAngle))

    let whereInPeriod = (fromZero + this.phase) % this.period
    if (whereInPeriod < 0) whereInPeriod += this.period
    whereInPeriod = 1 + (((integer(100 * whereInPeriod / this.period) % 100) + 100) % 100)

    const amplitude = this.amplitudeList[whereInPeriod - 1] || 0
    return ((this.amplitude * amplitude) + bigWaveTot) / 200
  }
}

/* -------------------------------------------------------------------------
 * WeatherRenderer
 * ---------------------------------------------------------------------- */

const SPEED_FACTOR = { 0: 0, 1: 100, 2: 125, 3: 150, 4: 175, 5: 200 }

/**
 * Glue between the global weather, the wind vane and the waves.
 */
export class WeatherRenderer {
  constructor () {
    this.wind = new Wind()
    this.waves = new Waves()
    this.speedFactor = 100
    this.allowingRadio = 1
  }

  init () {
    const weather = g.globals.weather
    this.wind.Change(weather.getWindspeed(), weather.getWindDirection())
    this.wind.init()
    this.waves.init()
  }

  kill () {
    this.wind.kill()
    this.waves.kill()
    return 0
  }

  allowRadio (yesNo) {
    this.allowingRadio = yesNo
  }

  /**
   * @param {string} [argHide] '#hide' covers the water
   * @param {*}      argWindSpeedFactor Map special "windSpeed"
   */
  changeMap (argHide, argWindSpeedFactor) {
    const weather = g.globals.weather
    const tmpWeather = weather.getComingWeather()

    if (argHide === '#hide') {
      g.dir.hideSprite(g.dir.spriteList['#Water'])
      g.dir.hideSprite(g.dir.spriteList['#Fog'])
    } else {
      g.dir.setMemberByName(g.dir.spriteList['#Water'], 'Weather1')
      // Show fog for weather types 2-4 (fog, storms)
      const weatherType = listValue(tmpWeather, '#type')
      if (weatherType >= 2) {
        g.dir.setMemberByName(g.dir.spriteList['#Fog'], 'FogPic')
        // Initialize fog particles for weather types 2-4
        this.initFogParticles(weatherType)
      } else {
        g.dir.hideSprite(g.dir.spriteList['#Fog'])
        this.clearFogParticles()
      }
    }

    let speedFactor = argWindSpeedFactor
    if (speedFactor === undefined || speedFactor === null || speedFactor === '') {
      speedFactor = 100
    } else if (typeof speedFactor === 'string') {
      const parsed = speedFactor.replace('#', '')
      if (parsed.toLowerCase() === 'full') speedFactor = '#Full'
      else speedFactor = parseInt(parsed, 10)
      if (isNaN(speedFactor)) speedFactor = 100
    }

    if (typeof speedFactor === 'number' && SPEED_FACTOR[speedFactor] !== undefined) {
      speedFactor = SPEED_FACTOR[speedFactor]
    }

    let tmpSpeed
    if (speedFactor === '#Full') {
      tmpSpeed = 4
      speedFactor = 200
    } else {
      tmpSpeed = speedFactor * listValue(tmpWeather, '#speed') / 100.0
    }

    if (!Number.isInteger(speedFactor)) speedFactor = 100
    this.speedFactor = speedFactor

    const tmpDir = listValue(tmpWeather, '#direction')
    this.waves.setDirection(tmpDir, tmpSpeed)
    this.wind.Change(tmpSpeed, tmpDir)
  }

  /**
   * Initialize fog particle system for weather types 2-4 (fog, storms)
   * @param {number} weatherType - Weather type (2=fog, 3=storm, 4=heavy storm)
   */
  initFogParticles (weatherType) {
    if (this.fogParticles && this.fogParticles.length > 0) return
    
    this.fogParticles = []
    this.fogParticleCount = weatherType === 2 ? 30 : (weatherType === 3 ? 50 : 70)
    this.fogType = weatherType
    this.fogTimer = 0
    
    // Create fog particles
    for (let i = 0; i < this.fogParticleCount; i++) {
      this.fogParticles.push({
        x: random(640),
        y: random(480),
        speedX: (random(200) - 100) / 100, // -1 to 1
        speedY: (random(100) - 50) / 100,  // -0.5 to 0.5
        alpha: random(100) / 255 * 0.5,    // 0-0.5 alpha
        size: 10 + random(30),             // 10-40px
        driftDirection: random(16)         // Wind direction influence
      })
    }
    
    // Start fog animation loop
    if (!this.fogAnimationId) {
      this.fogAnimationId = setInterval(() => this.updateFogParticles(), 50)
    }
  }

  /**
   * Update fog particle positions
   */
  updateFogParticles () {
    if (!this.fogParticles || this.fogParticles.length === 0) return
    
    const wind = g.globals.weather
    const windDir = wind.getWindDirection()
    const windSpeed = wind.getWindspeed()
    
    for (const particle of this.fogParticles) {
      // Apply wind influence
      const windAngle = (windDir - 1) * 22.5 * Math.PI / 180
      const windForce = (wind.getWindspeed() || 0) * 0.5
      
      particle.x += particle.speedX + Math.cos(windAngle) * windForce
      particle.y += particle.speedY + Math.sin(windAngle) * windForce
      
      // Wrap around screen
      if (particle.x < -50) particle.x = 690
      else if (particle.x > 690) particle.x = -50
      if (particle.y < -50) particle.y = 530
      else if (particle.y > 530) particle.y = -50
      
      // Pulsate alpha for organic feel
      particle.alpha = 0.2 + Math.sin(Date.now() * 0.003 + particle.size) * 0.3
    }
  }

  /**
   * Clear fog particles
   */
  clearFogParticles () {
    if (this.fogAnimationId) {
      clearInterval(this.fogAnimationId)
      this.fogAnimationId = null
    }
    this.fogParticles = []
    this.fogType = 0
  }

  kill () {
    this.wind.kill()
    this.waves.kill()
    this.clearFogParticles()
    return 0
  }
}

/* -------------------------------------------------------------------------
 * MulleSez
 * ---------------------------------------------------------------------- */

const COMMENT_LIST = {
  '#Vomit': [52, 53, 54],
  '#VomitPills': [39, 44],
  '#Tired': [12],
  '#Hungry': [13, 14, 15],
  '#MotorToSail': [20, 33],
  '#MotorToOar': [33],
  '#SailToOar': [16],
  '#Heavy': [22],
  '#OutOfFuel': [30, 31, 32],
  '#BadWeather': [8, 9, 18, 21],
  '#crash': [89, 90, 91, 92, 93],
  '#CrashEasy': [94, 99, 100],
  '#LurchEasy': [121, 122, 123],
  '#LurchHard': [107, 102, 104, 108],
  '#Capsize': [21]
}

function convItoS (n, width) {
  let s = String(n)
  while (s.length < width) s = '0' + s
  return s
}

/**
 * Mulle's voice lines, with a per line cooldown.
 */
export class MulleSez {
  constructor () {
    this.commentList = COMMENT_LIST
    this.lastPlayed = {}
    for (const key in this.commentList) {
      this.lastPlayed[key] = { nr: 0, started: 0, wait: 0 }
    }

    this.currentPriority = 0
    this.soundsInQ = []
    this.sndId = 0
    this.counter = 0
    this.soundList = 0
    this.soundCounter = 0
    this.nowPlaying = ''
    this.reportObject = null
    this.currentIdentifier = 0

    g.globals.loopMaster.addObject(this)
  }

  isQuiet () {
    return g.dir.sounds.finished(this.sndId)
  }

  say (argWhat, argPriority, argReportObject, argPutInQ, argID, argMinWait) {
    if (argWhat === this.nowPlaying) return 0

    if (typeof argWhat === 'string' && argWhat.charAt(0) === '#') {
      const played = this.lastPlayed[argWhat]
      if (!played) return 0

      if (this.counter < (played.started + (played.wait || 0))) return 0

      const tmpList = this.commentList[argWhat].slice()
      if (tmpList.length > 1) {
        const i = tmpList.indexOf(played.nr)
        if (i >= 0) tmpList.splice(i, 1)
      }

      const tmpSndNr = tmpList[random(tmpList.length) - 1]
      this.lastPlayed[argWhat] = { nr: tmpSndNr, started: this.counter, wait: argMinWait || 0 }
      argWhat = '05d' + convItoS(tmpSndNr, 3) + 'v0'
    }

    if (this.sndId) {
      if ((argPriority || 0) <= this.currentPriority) {
        g.dir.sounds.stop(this.sndId)
        if (this.reportObject && typeof this.reportObject.mulleFinished === 'function') {
          this.reportObject.mulleFinished(this.currentIdentifier)
        }
        this.sndId = 0
      } else {
        if (argPutInQ === '#Q') {
          this.soundsInQ.push({
            priority: argPriority,
            what: argWhat,
            reportObject: argReportObject,
            id: argID
          })
        }
        return 0
      }
    }

    this.reportObject = argReportObject || null
    this.currentPriority = argPriority || 0
    this.currentIdentifier = argID || 0
    this.playStringOrList(argWhat)
    return this.sndId
  }

  playStringOrList (argWhat) {
    if (typeof argWhat === 'string') {
      this.nowPlaying = argWhat
      this.sndId = g.dir.sounds.play(argWhat, '#EFFECT')
      g.dir.sounds.setVol(this.sndId, 100)
    } else if (Array.isArray(argWhat)) {
      this.soundList = argWhat
      this.soundCounter = 1
      this.nowPlaying = this.soundList[0]
      this.sndId = g.dir.sounds.play(this.nowPlaying, '#EFFECT')
      g.dir.sounds.setVol(this.sndId, 100)
    }
  }

  loop () {
    this.counter += 1

    if (!this.sndId) return
    if (!g.dir.sounds.finished(this.sndId)) return

    this.nowPlaying = ''

    if (Array.isArray(this.soundList)) {
      this.soundCounter += 1
      if (this.soundCounter <= this.soundList.length) {
        this.sndId = g.dir.sounds.play(this.soundList[this.soundCounter - 1], '#EFFECT')
        return
      }
    }

    this.soundList = 0
    this.sndId = 0
    this.currentPriority = 0

    if (this.reportObject && typeof this.reportObject.mulleFinished === 'function') {
      this.reportObject.mulleFinished(this.currentIdentifier)
    }
    this.currentIdentifier = 0
    this.reportObject = null

    if (this.soundsInQ.length) {
      const tmp = this.soundsInQ.shift()
      this.currentPriority = tmp.priority
      this.reportObject = tmp.reportObject
      this.currentIdentifier = tmp.id
      this.playStringOrList(tmp.what)
    }
  }

  stop () {
    g.dir.sounds.stop(this.sndId)
    this.nowPlaying = ''
    this.reportObject = null
    this.sndId = 0
  }

  deleteReference (theObject) {
    this.soundsInQ = this.soundsInQ.filter((q) => q.reportObject !== theObject)
    if (this.reportObject === theObject) {
      this.reportObject = null
      this.stop()
    }
  }

  kill () {
    this.reportObject = null
    g.globals.loopMaster.deleteObject(this)
    this.soundsInQ = []
    return 0
  }
}

/* -------------------------------------------------------------------------
 * AmbienceSound
 * ---------------------------------------------------------------------- */

/**
 * Looping water/wind bed plus the occasional wave slap.
 */
export class AmbienceSound {
  constructor () {
    this.active = 0
    this.wavesID = 0
    this.stemWaterID = 0
    this.windID = 0
    this.singleWaveID = 0
    this.soundMode = '#normal'
    g.globals.loopMaster.addObject(this)
    this.activate(1)
  }

  activate (yesNo) {
    this.active = yesNo ? 1 : 0

    if (this.active) {
      this.wavesID = g.dir.sounds.play('WaveSm', '#OPEFFECT')
      if (this.wavesID) {
        g.dir.sounds.setloop(this.wavesID, 1)
        g.dir.sounds.setVol(this.wavesID, 50)
      }
      this.stemWaterID = g.dir.sounds.play('Vatten', '#OPEFFECT')
      if (this.stemWaterID) g.dir.sounds.setVol(this.stemWaterID, 100)
      this.windID = g.dir.sounds.play('05e043v0', '#OPEFFECT')
      if (this.windID) g.dir.sounds.setVol(this.windID, 100)
      this.singleWaveID = g.dir.sounds.play('OneWave2', '#OPEFFECT')
      if (this.singleWaveID) g.dir.sounds.setVol(this.singleWaveID, 75)
    } else {
      g.dir.sounds.unLoad(this.wavesID)
      g.dir.sounds.unLoad(this.stemWaterID)
      g.dir.sounds.unLoad(this.windID)
      g.dir.sounds.unLoad(this.singleWaveID)
      this.wavesID = this.stemWaterID = this.windID = this.singleWaveID = 0
    }
  }

  hitWave () {
    if (!this.active) return
    if (g.dir.sounds.finished(this.singleWaveID)) {
      this.singleWaveID = g.dir.sounds.play('OneWave2', '#OPEFFECT')
      g.dir.sounds.setVol(this.singleWaveID, 75)
    }
  }

  kill () {
    this.activate(0)
    g.globals.loopMaster.deleteObject(this)
    return 0
  }
}
