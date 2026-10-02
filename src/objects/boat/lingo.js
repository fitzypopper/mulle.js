/**
 * Lingo helpers shared by the sailing scene.
 *
 * Direct ports of the small movie handlers that the boat, weather and
 * UI scripts rely on (MovieScript 5/9, ParentScript 3 DrivingHandlers).
 *
 * @module objects/boat/lingo
 */
'use strict'

/**
 * Lingo globals, filled in by the world scene when it boots.
 * @type {{game: Object, dir: Object, globals: Object}}
 */
export const g = {
  game: null,
  dir: null,
  globals: null
}

/** Lingo `random(n)` - 1..n */
export function random (n) {
  if (n < 1) return 1
  return Math.floor(Math.random() * n) + 1
}

/** Lingo `integer()` - truncate towards zero */
export function integer (v) {
  return v < 0 ? Math.ceil(v) : Math.floor(v)
}

/**
 * Lingo `correctDirection` - wrap a heading into the 1..16 range.
 * @param  {number} dir Heading
 * @return {number}      1..16
 */
export function correctDirection (dir) {
  const d = dir % 16
  if (d <= 0) return d + 16
  return d
}

/** Create a point. */
export function point (x, y) {
  return { x: x, y: y }
}

export function pointAdd (a, b) {
  return { x: a.x + b.x, y: a.y + b.y }
}

export function pointSub (a, b) {
  return { x: a.x - b.x, y: a.y - b.y }
}

export function pointScale (a, s) {
  return { x: a.x * s, y: a.y * s }
}

export function pointEq (a, b) {
  return a.x === b.x && a.y === b.y
}

/**
 * `DrivingHandlers.getVelPoint` - the travel vector of a heading.
 * @param  {Array}  directionList 16 [x, y] vectors
 * @param  {number} dir           1..16
 * @return {Object}               point
 */
export function getVelPoint (directionList, dir) {
  const p = directionList[dir - 1] || [0, 0]
  return point(p[0], p[1])
}

/**
 * `DrivingHandlers.calcDirection` - heading from one point to another.
 *
 * @param  {Object}  start    from
 * @param  {Object}  end      to
 * @param  {string}  option   '#WithHypo' to also get the distance
 * @return {number|Array}     heading 1..16, or [heading, distance]
 */
export function calcDirection (start, end, option) {
  const diffX = end.x - start.x
  let diffY = start.y - end.y

  const hypo = Math.sqrt((diffX * diffX) + (diffY * diffY))

  if (diffY === 0) diffY = 0.10000000000000001

  let tempDirection = Math.atan(diffX / diffY)

  if (diffX > 0) {
    if (diffY <= 0) tempDirection += Math.PI
  } else {
    if (diffY > 0) {
      tempDirection += 2 * Math.PI
    } else {
      tempDirection += Math.PI
    }
  }

  tempDirection = tempDirection / Math.PI
  tempDirection = integer(tempDirection * 16 / 2)

  if (tempDirection === 0) tempDirection = 16

  if (option === '#WithHypo') return [tempDirection, hypo]
  return tempDirection
}

/**
 * `calcRadians` - convert [x, y] into [angle, length].
 * @param  {Array} diff [x, y]
 * @return {Array}      [radians, hypo]
 */
export function calcRadians (diff) {
  const diffX = diff[0]
  let diffY = -diff[1]

  const hypo = Math.sqrt((diffX * diffX) + (diffY * diffY))

  if (diffY === 0) diffY = 0.10000000000000001

  let tempDirection = Math.atan(diffX / diffY)

  if (diffX > 0) {
    if (diffY <= 0) tempDirection += Math.PI
  } else {
    if (diffY > 0) {
      tempDirection += 2 * Math.PI
    } else {
      tempDirection += Math.PI
    }
  }

  return [tempDirection, hypo]
}

/**
 * `DrivingHandlers.checkRadius` - object proximity state machine.
 *
 * @param  {Object} target  Object with insideInner/insideOuter flags
 * @param  {Object} boatLoc Boat point
 * @param  {Object} objLoc  Object point
 * @param  {string} option  '#both' | '#Inner' | '#Outer'
 * @return {string|number}  Event name, or 0
 */
export function checkRadius (target, boatLoc, objLoc, option) {
  const d = pointSub(boatLoc, objLoc)
  const hypo = Math.sqrt((d.x * d.x) + (d.y * d.y))

  if (option === '#Inner') {
    if (hypo <= target.innerRadius) {
      if (!target.insideInner) {
        target.insideInner = 1
        return '#EnterInnerRadius'
      }
    } else if (target.insideInner) {
      target.insideInner = 0
      return '#ExitInnerRadius'
    }
    return 0
  }

  if (option === '#Outer') {
    if (hypo <= target.outerRadius) {
      if (!target.insideOuter) {
        target.insideOuter = 1
        return '#enterOuterRadius'
      }
    } else if (target.insideOuter) {
      target.insideOuter = 0
      return '#ExitOuterRadius'
    }
    return 0
  }

  if (hypo <= target.outerRadius) {
    if (hypo <= target.innerRadius) {
      if (!target.insideInner) {
        target.insideInner = 1
        if (target.insideOuter) return '#EnterInnerRadius'
        target.insideOuter = 1
        return '#EnterBoth'
      }
    } else {
      if (!target.insideOuter) {
        target.insideOuter = 1
        return '#enterOuterRadius'
      }
      if (target.insideInner) {
        target.insideInner = 0
        return '#ExitInnerRadius'
      }
    }
  } else if (target.insideOuter) {
    target.insideOuter = 0
    if (target.insideInner) {
      target.insideInner = 0
      return '#ExitBoth'
    }
    return '#ExitOuterRadius'
  }

  return 0
}

/**
 * Sound wrapper matching the `gSound` interface used by the Lingo scripts.
 *
 * Sounds are looked up in the already loaded audio sprite packs; anything
 * missing silently reports "already finished".
 */
export class SailSound {
  constructor (game) {
    this.game = game
    this.mode = '#normal'
    this.handles = {}
    this.counter = 0
  }

  /** Is a sound member loaded? */
  has (name) {
    if (!name) return false
    const audio = this.game.mulle.audio
    for (const a in audio) {
      const p = audio[a]
      for (const s in p.sounds) {
        const extra = p.sounds[s].extraData
        if (extra && extra.dirName && extra.dirName.toLowerCase() === name.toLowerCase()) {
          return true
        }
      }
    }
    return false
  }

  /**
   * `play(gSound, name, channel)`
   * @return {number} handle, 0 when nothing was played
   */
  play (name, channel) {
    if (!name || !this.has(name)) return 0
    const snd = this.game.mulle.playAudio(name)
    if (!snd) return 0
    this.counter++
    const id = this.counter
    this.handles[id] = snd
    if (channel === '#BG' || channel === '#OPEFFECT') {
      // background loops keep playing over short effects
      snd.loop = (channel === '#BG')
    }
    return id
  }

  preload (name) {
    return this.play(name, '#BG') ? 1 : 0
  }

  /** `finished(gSound, id)` */
  finished (id) {
    if (!id) return true
    const snd = this.handles[id]
    if (!snd) return true
    return !snd.isPlaying
  }

  /** `stop(gSound, id)` */
  stop (id) {
    if (!id) return
    const snd = this.handles[id]
    if (snd) {
      try { snd.stop() } catch (e) { /* already stopped */ }
      delete this.handles[id]
    }
  }

  setVol (id, vol) {
    const snd = this.handles[id]
    if (snd) snd.volume = Math.max(0, Math.min(1, vol / 100))
  }

  setFreq (id, freq) { /* not supported by the web audio bridge */ }

  unLoad (id) {
    this.stop(id)
  }

  setloop (id, yesNo) {
    const snd = this.handles[id]
    if (snd) snd.loop = !!yesNo
  }
}

/**
 * User inventory, the `gMulleGlobals` helper handlers in miniature.
 * Values are stored verbatim on `user.Inventory`.
 */
export function inventory (user) {
  if (!user) return {}
  if (!user.Inventory) {
    user.Inventory = { DrivenTimes: { Motor: 0, Sail: 0, Oar: 0 } }
  }
  return user.Inventory
}

export function lookUpInventory (user, key) {
  const inv = inventory(user)
  return Object.prototype.hasOwnProperty.call(inv, key) ? inv[key] : undefined
}

export function isInInventory (user, key) {
  const v = lookUpInventory(user, key)
  if (v === undefined || v === null || v === 0) return false
  if (typeof v === 'object') return Object.keys(v).length > 0
  return true
}

export function setInInventory (user, key, value) {
  const inv = inventory(user)
  inv[key] = value
  return value
}

export function deleteFromInventory (user, key) {
  const inv = inventory(user)
  delete inv[key]
}
