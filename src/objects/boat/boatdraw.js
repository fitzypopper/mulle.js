'use strict'

import MulleSprite from '../sprite'
import { getHullId, getPartProperties, sumBoatProperties } from './props'

/**
 * Boat drawing - faithful port of the original Director scripts:
 * - MovieScript 16 - DrawBoat.ls (generic boat drawing with percentage scaling)
 * - ParentScript 28 - BoatHandler.drawParts (quay drawing)
 * - ParentScript 30 - BoatViewHandler.getDrawOffset (quay/world offsets)
 * - ParentScript 11 - Boat.ls (snap accumulation)
 */

const HULL_FRONT_OFFSET = 46
const HULL_BACK_OFFSET = 12
const HULL_FRONT_INSIDE = 45
const HULL_BACK_INSIDE = 6
const RUDDER_FRONT_OFFSET = 13
const RUDDER_BACK_OFFSET = 1

const BOAT_START_SP = 10 // spriteList['#BoatStart']

// View IDs: 'Quay', 'world', 'ShipYard', 'PhotoBook'
export function getDrawOffset (game, view, parts) {
  const hullId = getHullId(game, parts)
  if (!hullId) return { x: 0, y: 0 }

  const hullProps = getPartProperties(game, hullId)
  const hullWeight = hullProps.weight || 0
  const loadCapacity = hullProps.loadcapacity || 1

  // Compute boat weight and load fraction
  const boatProps = sumBoatProperties(game, parts)
  let weight = boatProps.weight || 0
  if (weight <= hullWeight) weight = hullWeight + 50

  const loadFrac = (weight - hullWeight) / loadCapacity
  const loadFracClamped = Math.max(0, Math.min(1, loadFrac))

  // Determine hull type (matching BoatViewHandler lists)
  const smallHulls = [92, 730, 731, 732, 733, 734, 735, 736]
  const mediumHulls = [45, 723, 724, 725, 726, 727, 728, 729]
  const largeHulls = [1, 716, 717, 718, 719, 720, 721, 722]

  let hullType = 'medium'
  if (largeHulls.includes(hullId)) hullType = 'large'
  else if (smallHulls.includes(hullId)) hullType = 'small'

  switch (view) {
    case 'Quay':
    case 'world':
      if (hullType === 'large') {
        return { x: 0, y: 45 * loadFracClamped }
      }
      if (hullType === 'medium') {
        return { x: -25, y: 5 + 35 * loadFracClamped }
      }
      // small
      return { x: -55, y: 25 + 20 * loadFracClamped }

    case 'ShipYard':
      // ShipYard uses hullOffsetList - simplified: return (0,0) for now
      return { x: 0, y: 0 }

    case 'PhotoBook':
      if (hullType === 'large') return { x: 0, y: 0 }
      if (hullType === 'medium') return { x: -25, y: 5 }
      return { x: -55, y: 25 }

    default:
      return { x: 0, y: 0 }
  }
}

/**
 * Build snapOffsets exactly like Boat.addPart (Lingo order = parts array order).
 * Each part's `new` points provide {id, fg, bg, offset}.
 * Returns { snapOffsets: { snapId: { layers, offset } }, hullId }
 */
function buildSnapOffsets (game, parts) {
  const snapOffsets = {}
  const snapPoints = []

  const hullId = getHullId(game, parts)

  for (let i = 0; i < parts.length; i++) {
    const partId = parts[i]
    const part = game.mulle.PartsDB[partId]
    if (!part) continue

    const covers = part.Covers || []
    if (covers.length) {
      for (const c of covers) {
        const idx = snapPoints.indexOf(c)
        if (idx >= 0) snapPoints.splice(idx, 1)
      }
    }

    const newPoints = part.new || []
    if (newPoints.length) {
      // Find parent snap offset
      let parentSnapOffset = { x: 0, y: 0 }
      const requires = part.Requires || []
      if (requires.length) {
        const firstReq = requires[0]
        if (snapOffsets[firstReq]) {
          parentSnapOffset = snapOffsets[firstReq].offset
        }
      }

      for (const np of newPoints) {
        const snapId = np.id
        const layers = [np.fg, np.bg]
        const offset = { x: np.offset.x, y: np.offset.y }

        snapPoints.push(snapId)
        snapOffsets[snapId] = {
          layers: layers,
          offset: {
            x: offset.x + parentSnapOffset.x,
            y: offset.y + parentSnapOffset.y
          }
        }
      }
    }
  }

  return { snapOffsets, hullId }
}

/**
 * Draw the boat into a Phaser Group at the given world position.
 * Returns the group containing all boat part sprites.
 */
export function drawBoatAt (game, parts, drawX, drawY, view = 'Quay', percentage = 1) {
  const group = game.add.group()

  const { snapOffsets, hullId } = buildSnapOffsets(game, parts)
  const drawOffset = getDrawOffset(game, view, parts)
  const baseX = drawX + drawOffset.x
  const baseY = drawY + drawOffset.y

  // Determine which parts are hull/rudder for layer logic
  const smallHulls = [92, 730, 731, 732, 733, 734, 735, 736]
  const mediumHulls = [45, 723, 724, 725, 726, 727, 728, 729]
  const largeHulls = [1, 716, 717, 718, 719, 720, 721, 722]
  const rudders = [41, 42, 43, 44, 724, 725, 726, 727, 728, 729]

  // Draw in parts order (original z-order = channel = BOAT_START_SP - 1 + layer)
  for (let i = 0; i < parts.length; i++) {
    const partId = parts[i]
    const part = game.mulle.PartsDB[partId]
    if (!part) continue

    const isHull = hullId === partId
    const isRudder = rudders.includes(partId)

    // Determine layers and views
    let fgLayer, bgLayer, snapOffset
    if (isHull) {
      fgLayer = HULL_FRONT_OFFSET
      bgLayer = HULL_BACK_OFFSET
      snapOffset = { x: 0, y: 0 }
    } else if (isRudder) {
      fgLayer = RUDDER_FRONT_OFFSET
      bgLayer = RUDDER_BACK_OFFSET
      const requires = part.Requires || []
      if (requires.length && snapOffsets[requires[0]]) {
        snapOffset = snapOffsets[requires[0]].offset
      } else {
        snapOffset = { x: 0, y: 0 }
      }
    } else {
      const requires = part.Requires || []
      if (requires.length && snapOffsets[requires[0]]) {
        const info = snapOffsets[requires[0]]
        fgLayer = info.layers[0]
        bgLayer = info.layers[1]
        snapOffset = info.offset
      } else {
        fgLayer = 0
        bgLayer = 0
        snapOffset = { x: 0, y: 0 }
      }
    }

    // Front view (UseView) - skip empty strings
    const useView = part.UseView
    if (useView && useView.length > 0) {
      const spr = new MulleSprite(game, baseX + part.offset.x + snapOffset.x, baseY + part.offset.y + snapOffset.y)
      spr.setDirectorMember('CDDATA.CXT', useView)
      spr.scale.set(percentage)
      spr.customSort = fgLayer
      group.add(spr)
    }

    // Back view (UseView2) - original draws this at bgLayer
    const useView2 = part.UseView2
    if (useView2 && useView2.length > 0) {
      const spr = new MulleSprite(game, baseX + part.offset.x + snapOffset.x, baseY + part.offset.y + snapOffset.y)
      spr.setDirectorMember('CDDATA.CXT', useView2)
      spr.scale.set(percentage)
      spr.customSort = bgLayer
      group.add(spr)
    }
  }

  // Sort by customSort (layer)
  group.sort('customSort', Phaser.Group.SORT_ASCENDING)

  return group
}

/**
 * Draw the water strip (member 3 = '04b003v0') at its score position.
 * The original sets #Water member on drawParts; location is fixed at (320,240).
 */
export function createWaterStrip (game, x, y) {
  // Frame 3 in yard-sprites-0 = 04b003v0
  const spr = game.add.sprite(x, y, 'yard-sprites-0', '3')
  spr.anchor.set(0.5, 0.5)
  return spr
}