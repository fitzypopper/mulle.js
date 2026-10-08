/**
 * Junk pile renderer - port of the original JunkHandler/JunkPart pair
 * (reference/lingo00 ParentScript 13/14) for a single pile view.
 *
 * Spawns one MulleCarPart per entry of user.Junk[where] and:
 *
 *   - shows the part's ShelfView on Shelf1..6 and the JunkView on
 *     Quay/Yard (original JunkPart.new);
 *   - plays the original settle animation: a 15 fps (loopMaster rate)
 *     accelerating slide (4 px/frame^2) towards the first floor line
 *     below the part, input locked while it moves, per-pile
 *     SndDropOn played when it lands;
 *   - classifies drops against the scene's dragToWhere zones and moves
 *     the part between piles (JunkHandler.dropped), falling back to
 *     the drop position when the target pile is full;
 *   - persists every move into the save.
 *
 * A drop that ends with less than 5 px of travel is a click, which
 * talks the part description (DragScript's `startPos = sprite.loc`
 * branch) - MulleCarPart already handles that via playDescription,
 * which is overridden here because the shelf scenes have no Mulle
 * actor: the original just plays the description sound.
 *
 * @module objects/junkparts
 */
'use strict'

import MulleCarPart from './carpart'
import { FLOORS, pileKind } from '../struct/junkview'

/**
 * Click-to-describe, bound as the part's playDescription (original:
 * makeMulleTalk(gDir, getSndDescription(part)) - a plain sound).
 *
 * @return {void}
 */
function junkPlayDescription () {
  const snd = this.partData.description
  if (snd) this.game.mulle.playAudio(snd)
}

class MulleJunkParts {
  /**
   * @param {Phaser.State} state Owning scene (zone click guard lives on it)
   * @param {string}       where Pile name: 'Shelf1'..'Shelf6' | 'Quay' | 'Yard'
   * @param {Array}        zones Drag targets: [[left, top, right, bottom], pileName]
   */
  constructor (state, where, zones = []) {
    this.state = state
    this.game = state.game
    this.where = where
    this.zones = zones
    this.parts = []

    // Parts render in their own group so scene objects created later
    // (gift box, dialog) keep the original channel order above them.
    this.container = this.game.add.group()

    // JunkPart objects are stepped by the loopMaster at the movie rate
    this.stepTimer = this.game.time.events.loop(
      Phaser.Timer.SECOND / 15, this.step, this)
  }

  viewName () {
    return pileKind(this.where) === 'Shelf' ? 'shelfView' : 'junkView'
  }

  pile () {
    return this.game.mulle.user.Junk[this.where]
  }

  /**
   * Spawn a sprite for every part stored in the pile
   * (original JunkHandler.drawParts).
   *
   * @return {void}
   */
  spawn () {
    const pile = this.pile()
    if (!pile) return

    const view = this.viewName()

    for (const key of Object.keys(pile)) {
      const partId = parseInt(key, 10)
      const pos = pile[key]

      const part = new MulleCarPart(this.game, partId, pos.x, pos.y, true)
      if (part.default[view]) part.setImage(view)

      // The per-pile SndDropOn plays when the settle finishes; keep the
      // generic weight floor sound from MulleCarPart.onDrop off.
      part.sound_floor = false
      part.playDescription = junkPlayDescription

      // The original only fires zone clicks when the press started on
      // the zone - flag the whole drag so scene zones stay quiet.
      part.events.onDragStart.add(() => { this.state._suppressClicks = true })
      part.events.onDragStop.add(this.onPartDrop, this)

      this.container.add(part)
      this.parts.push(part)

      this.beginSettle(part)
    }
  }

  /**
   * Destroy and rebuild every part sprite (original drawParts).
   *
   * @return {void}
   */
  redraw () {
    this.container.removeAll(true)
    this.parts = []
    this.spawn()
  }

  /**
   * Settle geometry - literal port of JunkPart.new: the display
   * member's bbox centred on the sprite loc is tested against the
   * pile's floor lines; anything not resting gets a velocity towards
   * its line (horizontal push into the board ends first, a fall to the
   * next line exits the scan).
   *
   * @param  {MulleCarPart} part Settling part
   * @return {Object}            State consumed by step()
   */
  computeSettle (part) {
    const left = part.x - part.width / 2
    const top = part.y - part.height / 2
    const right = part.x + part.width / 2
    const bottom = part.y + part.height / 2

    const st = { moving: true, hdiff: 0, vdiff: 0, hvel: 0, vvel: 0, pvx: 0, pvy: 0 }
    const floors = FLOORS[ pileKind(this.where) ]

    for (const f of floors) {
      // resting: fully inside this floor line
      if (bottom >= f[1] && bottom <= f[3] && left >= f[0] && right <= f[2]) {
        st.moving = false
        return st
      }

      if (left < f[0]) {
        st.hdiff = f[0] - left
        st.hvel = 4
      } else if (right > f[2]) {
        st.hdiff = f[2] - right
        st.hvel = -4
      } else {
        st.hdiff = 0
        st.hvel = 0
      }

      if (bottom < f[1]) {
        st.vdiff = f[1] - bottom
        st.vvel = 4
        break
      }

      if (bottom > f[3]) {
        st.vdiff = f[3] - bottom
        st.vvel = -4
        continue
      }

      st.vdiff = 0
      st.vvel = 0
    }

    return st
  }

  /**
   * Start (or skip) the settle for a part; input is locked while it
   * moves, like `the active of mouseObject to 0`.
   *
   * @param  {MulleCarPart} part Part to settle
   * @return {void}
   */
  beginSettle (part) {
    const st = this.computeSettle(part)
    part._settle = st
    if (st.moving) part.input.enabled = false
  }

  /**
   * Write a part's position back into the save (JunkPart.loop does
   * this every frame while it moves).
   *
   * @param  {MulleCarPart} part Moving part
   * @return {void}
   */
  persist (part) {
    const pile = this.pile()
    if (pile) pile[part.part_id] = { x: part.x, y: part.y }
  }

  /**
   * 15 fps settle step (original JunkPart.loop): the accumulated
   * velocity grows by 4 px/frame each frame until the remaining
   * distance is covered exactly, then the drop sound plays.
   *
   * @return {void}
   */
  step () {
    for (const part of this.parts) {
      const st = part._settle
      if (!st || !st.moving) continue

      if (st.hdiff === 0 && st.vdiff === 0) {
        st.moving = false
        part.input.enabled = true

        const snd = part.partData.getSndDropOn(this.where)
        if (snd) this.game.mulle.playAudio(snd)

        this.persist(part)
        continue
      }

      if (Math.abs(st.pvx + st.hvel) <= Math.abs(st.hdiff)) {
        st.pvx += st.hvel
        st.hdiff -= st.pvx
      } else {
        st.pvx = st.hdiff
        st.hdiff = 0
      }

      if (Math.abs(st.pvy + st.vvel) <= Math.abs(st.vdiff)) {
        st.pvy += st.vvel
        st.vdiff -= st.pvy
      } else {
        st.pvy = st.vdiff
        st.vdiff = 0
      }

      part.x += st.pvx
      part.y += st.pvy

      this.persist(part)
    }
  }

  /**
   * The dragToWhere zone under a point, if any.
   *
   * @param  {number} x Pointer x
   * @param  {number} y Pointer y
   * @return {string|null} Target pile name
   */
  zoneAt (x, y) {
    for (const z of this.zones) {
      const r = z[0]
      if (x >= r[0] && y >= r[1] && x <= r[2] && y <= r[3]) return z[1]
    }
    return null
  }

  /**
   * Part drop handler (JunkHandler.dropped), run after
   * MulleCarPart.onDrop has had its say.
   *
   * @param  {MulleCarPart} part    Dropped part
   * @param  {Phaser.Pointer} pointer Drop position
   * @return {void}
   */
  onPartDrop (part, pointer) {
    const game = this.game
    const user = game.mulle.user
    const id = part.part_id

    // MulleCarPart.onDrop resets the picture to junkView - put the
    // pile view back before anything can render it.
    const view = this.viewName()
    if (part.default[view]) part.setImage(view)

    const target = this.zoneAt(pointer.x, pointer.y)

    if (target && target !== this.where) {
      // JunkHandler.dropped: move to the target pile at a random
      // resting spot; when it is full, keep the part here at the drop
      // position instead.
      delete this.pile()[id]

      if (user.addPart(target, id)) {
        // original line 64: sound name with the last char forced to '0'
        const base = part.partData.getSndDropOn(target)
        if (base.length > 1) {
          game.mulle.playAudio(base.substr(0, base.length - 1) + '0')
        }
      } else {
        this.pile()[id] = { x: part.x, y: part.y }
      }

      game.mulle.saveData()
      game.time.events.add(0, () => { this.state._suppressClicks = false })
      this.redraw()
      return
    }

    // JunkHandler.dropped #NoWhere: back in the same pile where it fell
    this.pile()[id] = { x: part.x, y: part.y }
    game.mulle.saveData()
    this.beginSettle(part)

    game.time.events.add(0, () => { this.state._suppressClicks = false })
  }

  /**
   * Remove the step timer and every part sprite.
   *
   * @return {void}
   */
  destroy () {
    if (this.stepTimer) {
      this.game.time.events.remove(this.stepTimer)
      this.stepTimer = null
    }
    if (this.container) {
      this.container.destroy(true)
      this.container = null
    }
    this.parts = []
  }
}

export default MulleJunkParts
