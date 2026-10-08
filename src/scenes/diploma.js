/**
 * Diploma scene - 08.DXR, ported 1:1 from the original score + scripts.
 *
 * Original scripts ported here:
 *   176 (parent: texts/return), 242 (Scroller: init/show/scroll),
 *   134 (scroll buttons), 121 (Leave -> go("Leave")), 95 (print),
 *   102 (frame hold - the scene is one held view).
 *
 * Layout comes straight from the f0 score rows (registration-point locs)
 * and the Scroller show() math:
 *   stepV   = (812 - 300) / 3
 *   tempV   = (240 + nowAt * stepV) - (nowAt - 1) * stepV
 *   locV    = tempV - spriteStartV[prop]
 *   medals  = tempV - medalsStartV (labels +40)
 *   boat    = tempV - carStartV, scale 0.75
 *
 * @module scenes/diploma
 */
'use strict'

import MulleState from './base'
import MulleSprite from '../objects/sprite'
import MulleButton from '../objects/button'
import MulleBuildCar from '../objects/buildcar'
import { getHullId } from '../objects/boat/props'

const DIR = '08.DXR'

const NR_OF_STEPS = 3
const STEP_V = (812 - 300) / NR_OF_STEPS
const START_V = 240 + 1 * STEP_V // nowAt starts at 1 -> 410.667
const CAR_START_V = -60
const MEDALS_START_V = 200 - 459 // 200 - sprite(63).locV -> -259
const TEMP_START_H = 65
const TEMP_WIDTH = 90
const BOAT_LOC_H = 290 // gDir.correctedBoatLocH fallback

// tempMembers: 00n001/00n003/00n005/00n006/00n008/00n007v0
const MEDAL_MEMBERS = [53, 55, 57, 58, 60, 59]
// tempText: 08t001..08t006v0
const LABEL_MEMBERS = [81, 82, 83, 84, 85, 86]

// spriteList of script 242 + locV offsets (240 - design locV of the sprite)
const SPRITE_LIST = [
  ['title', 55],
  ['Signature', 56],
  ['CarName', 59],
  ['userName', 57],
  ['to', 58],
  ['LeftR', 60],
  ['RightR', 61],
  ['LeftX', 84],
  ['RightX', 85]
]
const SPRITE_START_V = {
  title: 0,
  Signature: 0,
  CarName: 240 - 41, // ch59 design y=41
  userName: 240 - 0, // ch57 is empty at f0 -> locV 0
  to: 240 - 21, // ch58 design y=21
  LeftR: 0,
  RightR: 0,
  LeftX: 0,
  RightX: 0
}

// Static f0 placement of the scrolled members (registration point locs)
const SPRITE_LOC_H = {
  title: 289,
  Signature: 289,
  LeftR: 295,
  RightR: 295,
  LeftX: 33,
  RightX: 544
}
const SPRITE_MEMBERS = {
  title: 100, // 08b009v0
  Signature: 103, // 08b012v0
  LeftR: 39,
  RightR: 40,
  LeftX: 101, // 08b010v0
  RightX: 102 // 08b011v0
}

const TEXT_FONT = '18px "Times New Roman", Times, serif'
const SMALL_FONT = '12px "Times New Roman", Times, serif'
const LABEL_FONT = '10px "Times New Roman", Times, serif'

class DiplomaState extends MulleState {
  preload () {
    super.preload()
    this.game.load.pack('diploma', 'assets/diploma.json', null, this)
    this.game.load.json('diploma-strings', 'assets/diploma-strings.json')
  }

  create () {
    super.create()
    this.game.mulle.addAudio('shared')

    // movie config stageColor: 255 - the diploma paper between the title and
    // signature art is the bare stage, so it has to be white
    this.game.stage.backgroundColor = 0xFFFFFF

    // 176 new: returnTo = WhereFrom (only the world enters 08 in this port)
    this.returnTo = this.game.mulle.diplomaReturnTo || 'world'

    const user = this.game.mulle.user
    const strings = (this.game.cache.getJSON('diploma-strings') || {})[DIR] || {}

    this.layer = this.game.add.group()
    this.nowAt = 1
    this.sprites = {}
    this.medalSprites = [] // { medal, label }

    // Boat photo: original draws the hull composite into channels 2-11
    // (BoatStart), lowest z of the score. 176 init centers the hull picture on
    // x=290: correctedBoatLocH = 290 - integer((width/2 - regX) * 0.75)
    this.boat = new MulleBuildCar(
      this.game,
      this.correctedBoatLocH(user.Car && user.Car.Parts ? user.Car.Parts : []),
      0,
      null,
      true,
      false
    )
    this.boat.scale.set(0.75)
    this.layer.add(this.boat)

    // ch55 title / ch56 signature
    for (const [key, ch] of SPRITE_LIST) {
      const num = SPRITE_MEMBERS[key]
      if (!num) continue
      const sp = new MulleSprite(this.game, SPRITE_LOC_H[key], 0)
      sp.setDirectorMember(DIR, num)
      this.layer.add(sp)
      this.sprites[ch] = sp
    }

    // ch57/58/59 are text members (UserName / 08t007v0 / SavedCarName).
    // 176 new fills them from the save data.
    const boatName = (user.Car && user.Car.Name) ? user.Car.Name : ' '
    this.userNameText = this.addText(140, user.UserId || ' ', TEXT_FONT)
    this.toText = this.addText(140, strings['69'] || 'För båten', SMALL_FONT)
    this.boatNameText = this.addText(140, boatName, TEXT_FONT)

    // ch63-68 medals + ch69-74 labels (init: earned -> member, else Dummy)
    const earned = (user.Car && user.Car.Medals)
      ? user.Car.Medals.map(Number)
      : []
    for (let n = 1; n <= 6; n++) {
      if (!earned.includes(n)) continue
      const medalLocH = TEMP_START_H + TEMP_WIDTH * (n - 1)
      const medal = new MulleSprite(this.game, medalLocH, 0)
      medal.setDirectorMember(DIR, MEDAL_MEMBERS[n - 1])
      this.layer.add(medal)

      const label = this.addText(
        medalLocH - 43 + 49, // label locH = medal locH - 43, centered in 98px box
        strings[String(LABEL_MEMBERS[n - 1])] || '',
        LABEL_FONT,
        { align: 'center' }
      )
      label.anchor.set(0.5, 0)

      this.medalSprites.push({ medal, label })
    }

    // ch77 wooden strip (not scrolled)
    const strip = new MulleSprite(this.game, 614, 240)
    strip.setDirectorMember(DIR, 15)
    this.layer.add(strip)

    // ch78-81 buttons: up / down / close / print
    this.upButton = new MulleButton(this.game, 612, 20, {
      imageDefault: [DIR, 17], // 08b007v0
      click: () => this.scroll(-1)
    })
    this.layer.add(this.upButton)

    this.downButton = new MulleButton(this.game, 612, 186, {
      imageDefault: [DIR, 18], // 08b008v0
      click: () => this.scroll(1)
    })
    this.layer.add(this.downButton)

    this.leaveButton = new MulleButton(this.game, 611, 453, {
      imageDefault: [DIR, 64], // 06b007v0
      click: () => this.leave()
    })
    this.layer.add(this.leaveButton)

    this.printButton = new MulleButton(this.game, 612, 378, {
      imageDefault: [DIR, 67], // 08b002v0
      click: () => this.printDiploma()
    })
    this.layer.add(this.printButton)

    // 242 init then show()
    this.show()
  }

  correctedBoatLocH (parts) {
    // 176 init: only when the current hull part resolves to a view picture
    const hullId = getHullId(this.game, parts)
    if (parts.indexOf(hullId) === -1) return BOAT_LOC_H

    const hull = this.game.mulle.getPart(hullId)
    if (!hull || !hull.UseView) return BOAT_LOC_H

    const img = this.game.mulle.getDirectorImage('CDDATA.CXT', hull.UseView)
    if (!img || !img.frame || !img.frame.regpoint) return BOAT_LOC_H

    return BOAT_LOC_H -
      Math.trunc((img.frame.width / 2 - img.frame.regpoint.x) * 0.75)
  }

  addText (x, value, font, extraStyle) {
    const text = this.game.add.text(x, 0, value, Object.assign({
      font: font,
      fill: '#000000'
    }, extraStyle || {}))
    this.layer.add(text)
    return text
  }

  /* ------------------------------------------------- Scroller (242) */

  show () {
    const tempV = START_V - (this.nowAt - 1) * STEP_V

    for (const [key, ch] of SPRITE_LIST) {
      const sp = this.sprites[ch]
      if (sp) sp.y = tempV - SPRITE_START_V[key]
    }

    this.userNameText.y = tempV - SPRITE_START_V.userName
    this.toText.y = tempV - SPRITE_START_V.to
    this.boatNameText.y = tempV - SPRITE_START_V.CarName

    const medalV = tempV - MEDALS_START_V
    for (const { medal, label } of this.medalSprites) {
      medal.y = medalV
      label.y = medalV + 40
    }

    this.boat.y = tempV - CAR_START_V
  }

  scroll (direction) {
    // 134/242: scroll by one step, clamped to [1, nrOfSteps]
    if (direction === -1 && this.nowAt > 1) {
      this.nowAt -= 1
      this.show()
    } else if (direction === 1 && this.nowAt < NR_OF_STEPS) {
      this.nowAt += 1
      this.show()
    }
  }

  ScrollToMid () {
    // used by the print button before capturing the stage
    this.nowAt = 2
    this.show()
  }

  /* ------------------------------------------------- buttons (95/121) */

  printDiploma () {
    this.game.mulle.playAudio('SndMouseClick')
    this.ScrollToMid()
    // PrintOMatic xtra is not available on the web, print is stubbed
  }

  leave () {
    // 121: go("Leave") -> marker frame -> 116: go(1, returnTo)
    this.game.state.start(this.returnTo)
  }

  shutdown () {
    if (this.layer) this.layer.destroy(true)
    this.game.stage.backgroundColor = 0x000000
  }
}

export default DiplomaState
