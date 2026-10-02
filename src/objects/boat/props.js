/**
 * Boat property helpers.
 *
 * Direct ports of the 00.CXT movie scripts that prepare `boatProperties`
 * before a sailing session:
 *
 *   MovieScript 147 - ExtraBoatDrivingStuff  (makeCleanBoat)
 *   MovieScript 146 - MovieScript 146        (findPossiblePowers,
 *   ParentScript 8   - Part                   checkCurrentlyOKPowers)
 *   MovieScript 30   - RecalcBoatProps        (recalculateBoatProps)
 *
 * Lingo property lists are case insensitive, so every key here is lower case.
 *
 * @module objects/boat/props
 */
'use strict'

import { SpeedLists } from '../../struct/saildata'

const DECIMAL_PREC = 100

/**
 * Resolve the effective property list of a single part. Master parts borrow
 * their property list from the part they are a copy of.
 *
 * @param  {MulleGame} game  Main game
 * @param  {number}    partId Director member / part id
 * @return {Object}           lower case property list
 */
export function getPartProperties (game, partId) {
  const part = game.mulle.PartsDB[partId]
  if (!part) return {}

  const raw = part.data.Properties

  // Lingo keeps an empty list on master copies: [[], null] -> delegate.
  if (Array.isArray(raw) || !raw || Object.keys(raw).length === 0) {
    if (part.master && part.master !== partId) {
      return getPartProperties(game, part.master)
    }
    return {}
  }

  return part.properties || {}
}

/**
 * Sum the property lists of every part mounted on the boat. This is
 * `updateProperties` from `BoatViewHandler` / `Boat.updateProperties`.
 *
 * @param  {MulleGame} game   Main game
 * @param  {Array}     parts  Part ids
 * @return {Object}           summed properties
 */
export function sumBoatProperties (game, parts) {
  const props = {}

  for (let i = 0; i < parts.length; i++) {
    const list = getPartProperties(game, parts[i])

    for (const key in list) {
      const v = list[key]
      if (typeof v === 'number') {
        props[key] = (props[key] || 0) + v
      }
    }
  }

  return props
}

/**
 * Find the id of the hull (the part carrying load capacity).
 *
 * @param  {MulleGame} game  Main game
 * @param  {Array}     parts Part ids
 * @return {number}          Hull id, or 1 when there is none
 */
export function getHullId (game, parts) {
  for (let i = 0; i < parts.length; i++) {
    const props = getPartProperties(game, parts[i])
    if (typeof props.loadcapacity === 'number') return parts[i]
  }
  return 1
}

/**
 * `findPossiblePowers` - which of Motor / Sail / Oar the current parts allow.
 *
 * @param  {Object} props Boat properties
 * @return {Array}        Ordered list of symbols
 */
export function findPossiblePowers (props) {
  const result = []

  const push = (type, cond) => {
    let ok = true
    for (const key of cond) {
      if (!(props[key] > 0)) {
        ok = false
        break
      }
    }
    if (ok && result.indexOf(type) < 0) result.push(type)
  }

  push('#Motor', ['engine'])
  push('#Motor', ['outboardengine'])
  push('#Sail', ['sailwithpole', 'sailsize'])
  push('#Oar', ['oar'])

  return result
}

/**
 * `makeCleanBoat` - drain every property a forbidden part type contributes so
 * the drive type can never be selected by accident.
 *
 * Direct port of MovieScript 147:
 *
 *   for each mounted part:
 *     if the part has one of the forbidden "trigger" properties:
 *       props[drain] -= part[drain === maxdepth ? depth : drain]
 *
 * @param  {MulleGame} game  Main game
 * @param  {string}    type  '#Motor' | '#Sail' | '#Oar'
 * @param  {Object}    props Properties to clean (mutated)
 * @return {Object}          The same list
 */
export function makeCleanBoat (game, type, props) {
  let notAllowed

  if (type === '#Sail') {
    notAllowed = {
      engine: ['power', 'speed'],
      outboardengine: ['depth', 'maxdepth', 'steerpart'],
      oar: ['power', 'speed']
    }
  } else if (type === '#Motor') {
    notAllowed = {
      oar: ['power', 'speed']
    }
  } else {
    notAllowed = {
      engine: ['power', 'speed'],
      outboardengine: ['depth', 'maxdepth']
    }
  }

  const parts = game.mulle.user && game.mulle.user.Car ? game.mulle.user.Car.Parts : []

  for (let i = 0; i < parts.length; i++) {
    const partProps = getPartProperties(game, parts[i])

    for (const trigger in notAllowed) {
      if (!partProps[trigger]) continue

      const drains = notAllowed[trigger]
      for (let d = 0; d < drains.length; d++) {
        const drainProp = drains[d]
        const partProp = drainProp === 'maxdepth' ? 'depth' : drainProp
        props[drainProp] = (props[drainProp] || 0) - (partProps[partProp] || 0)
      }
    }
  }

  return props
}

/**
 * `checkCurrentlyOKPowers` - per drive type, is it structurally runnable?
 *
 * @param  {Object} props     Boat properties
 * @param  {Array}  argTypes  Candidate drive types
 * @return {Array}            Ordered [[type, 1|'#Error'], ...]
 */
export function checkCurrentlyOKPowers (props, argTypes) {
  const list = Array.isArray(argTypes) ? argTypes : [argTypes]
  const out = []

  for (const type of list) {
    let ok = 1

    if (type === '#Sail') {
      if (!props.rudder) ok = '#NoRudder'
      else if (!props.steerpart) ok = '#NoSteering'
    } else if (type === '#Motor') {
      if (!props.steerpart && !props.outboardengine) ok = '#NoSteering'
      if (!props.rudder && !props.outboardengine) ok = '#NoRudder'
      if (ok === 1 && !props.fuelvolume) ok = '#NoTank'
    }

    out.push([type, ok])
  }

  return out
}

/**
 * `calcCornersList` - pre-computes the collision triangle for all 16
 * headings.
 *
 * NOTE: the original Lingo reads an undefined variable (`theList` instead of
 * `argList`) so the argument is always ignored and the default triangle is
 * used - reproduced here on purpose.
 *
 * @param  {Array} unused Ignored, kept for API parity
 * @return {Array}        16 lists of three [x, y] corners
 */
export function calcCornersList (unused) {
  const theList = [[0, -10], [-5, 5], [5, 5]]

  const hypos = []
  const orgAngles = []

  for (const p of theList) {
    const tmpX = p[0]
    const tmpY = p[1]
    const hypo = Math.sqrt((tmpX * tmpX) + (tmpY * tmpY))
    hypos.push(hypo)

    let angle
    if (tmpY === 0) {
      angle = Math.abs(tmpX) / tmpX * Math.PI / 2
    } else {
      angle = Math.atan(tmpX / tmpY)
    }

    if (tmpX > 0) {
      if (tmpY <= 0) angle += Math.PI
    } else if (tmpY > 0) {
      angle += 2 * Math.PI
    } else {
      angle += Math.PI
    }

    orgAngles.push(angle)
  }

  const corners = []
  const tmpDirs = 16

  for (let n = 1; n <= tmpDirs; n++) {
    const tmpList = []
    const addAngle = 2 * Math.PI * n / tmpDirs

    for (let m = 0; m < theList.length; m++) {
      const angle = orgAngles[m] + addAngle
      const hypo = hypos[m]
      tmpList.push([Math.trunc(-hypo * Math.sin(angle)), Math.trunc(hypo * Math.cos(angle))])
    }

    corners.push(tmpList)
  }

  return corners
}

/**
 * Extend a speed lookup table the same way `recalculateBoatProps` does.
 *
 * @param  {Array} source Base table
 * @return {Array}        Extended table
 */
function extendSpeedList (source) {
  const list = source.slice()

  let tmp = list.length ? list[list.length - 1] : 0

  for (let n = list.length; n <= 250; n++) {
    if (n < 50) {
      if (n % 2 === 0) tmp += 1
    } else if (n % 4 === 0) {
      tmp += 1
    }
    list.push(tmp)
  }

  return list
}

/**
 * `recalculateBoatProps` - derive the driving numbers from the parts and
 * write `RealDepth`, `RealResistance`, `speedList` and `cornerPoints` back
 * onto `props`.
 *
 * @param {MulleGame} game   Main game
 * @param {string}    type   '#Motor' | '#Sail' | '#Oar'
 * @param {Object}    props  Boat properties (mutated)
 * @return {Object}          Extra results: speedList, stabilities
 */
export function recalculateBoatProps (game, type, props) {
  const parts = game.mulle.user && game.mulle.user.Car ? game.mulle.user.Car.Parts : []
  let hullId = getHullId(game, parts)
  if (!hullId) hullId = 1

  const hullProps = getPartProperties(game, hullId)
  const hullWeight = hullProps.weight || 0

  let weight = props.weight || 0
  if (weight <= hullWeight) weight = hullWeight + 50

  const loadCapacity = props.loadcapacity || 1
  const loadPercent = 100 * (weight - hullWeight) / loadCapacity

  const minDepth = props.depth || 0
  props.realdepth = minDepth + loadPercent * ((props.maxdepth || 0) - minDepth) / 100

  const minResistance = props.waterresistance || 0
  props.realresistance = minResistance +
    loadPercent * ((props.maxwaterresistance || 0) - minResistance) / 100

  if (type === '#Sail') {
    props.power = (props.sailsize || 0) * 60 / 100
  }

  const rawWeight = props.weight || 0

  props.retardation = DECIMAL_PREC * 200 / (400 + (2 * rawWeight))
  let tmpAcc = ((props.power || 0) + 50) * DECIMAL_PREC * 20 /
    (400 + (2 * rawWeight)) / 11
  if (tmpAcc > 100) tmpAcc = 100
  else if (tmpAcc < 30) tmpAcc = 30
  props.acceleration = tmpAcc

  const tmpStab = 100 - ((weight - 18) / 20)
  let tmpSideStab = tmpStab - (props.stability || 0)
  if (tmpSideStab < 0) tmpSideStab = 0
  props.stabilities = [tmpStab, tmpSideStab]

  props.durability = 1000 * (props.durability || 0)
  props.manoeuverability = (props.manoeuverability || 0) * 2

  const key = props.smallship ? 'Small' : (props.largeship ? 'large' : 'Medium')

  let table = SpeedLists[key]
  if (!table) table = SpeedLists.Medium

  table = extendSpeedList(table)
  table = table.map((v) => (100 - (props.realresistance || 0)) * v / 10)

  return {
    speedList: table,
    stabilities: props.stabilities,
    weight: weight
  }
}

/**
 * `MulleCar.updateProperties` equivalent for the sailing side - refresh the
 * aggregated boat properties from the currently mounted parts.
 *
 * @param  {MulleGame} game Main game
 * @return {Object}         Aggregated properties
 */
export function refreshBoatProperties (game) {
  const car = game.mulle.user && game.mulle.user.Car
  if (!car) return {}
  return sumBoatProperties(game, car.Parts)
}
