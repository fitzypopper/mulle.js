/**
 * Junk scene (02.DXR - "Skrothandlaren").
 *
 * 1:1 port of the original movie script (02.DXR script 55 - decompiled to
 * scripts_out/02.DXR/bin/55.lingo):
 *
 *   spriteList = <Sky: 1, ShelfNr: 3, JunkStart: 6, DragPart: 90,
 *                 dialog: 95, DialogOverlay: 96>
 *
 * The scene is a single view with six shelves; the current shelf is shown
 * via one "door" sprite (members 2-7) at loc(320,240) and switched with
 * up/down zones next to it. Exits are the Quay rect (-> garage 03.DXR)
 * and the Yard rect (-> yard 04.DXR) in the left-hand outdoor strip.
 *
 * @module scenes/junk
 */
'use strict'

import MulleState from './base'
import MulleSprite from '../objects/sprite'
import MulleJunkParts from '../objects/junkparts'
import { g } from '../objects/boat/lingo'

class JunkState extends MulleState {
  preload () {
    this.game.load.pack('junk', 'assets/junk.json', null, this)
  }

  create () {
    super.create()
    this.game.mulle.addAudio('junk')
    // The 00.CXT shared voices (random chatter) and the 20d* part
    // descriptions are global casts in the original - always mounted.
    this.game.mulle.addAudio('shared')
    this.game.mulle.addAudio('boatparts')

    // Sky: Lingo `setSky the weather of gMulleGlobals` puts member
    // "00b0" & (10+weatherType) & "v0" (00.CXT 78-81 = weather 1-4) on
    // channel 1 (#Sky) at loc(320,240) -> bounds (0,0,640,268). Channel 1
    // sits *behind* the backdrop: the backdrop's sky area is the Director
    // colour key (palette index 255) and lets the weather show through.
    const weatherType = Math.min(4, Math.max(1,
      (g.globals && g.globals.weather && g.globals.weather.weatherType) || 1))
    const sky = new MulleSprite(this.game, 320, 240)
    sky.setDirectorMember('00.CXT', 77 + weatherType)
    this.game.add.existing(sky)

    // Background: 02.DXR member 1 = 02b001v1 (640x480), score ink is
    // background transparent - colour-keyed over the sky.
    const background = new MulleSprite(this.game, 320, 240)
    background.setDirectorMember('02.DXR', 1)
    this.game.add.existing(background)

    // Border frame (same as garage/yard)
    const border = this.game.add.graphics(0, 0)
    border.lineStyle(4, 0x888888, 1)
    border.moveTo(0, 0)
    border.lineTo(640, 0)
    border.lineTo(640, 480)
    border.lineTo(0, 480)
    border.lineTo(0, 0)

    // Current shelf. Garage passes e.g. 'Shelf3' via user.enterShelf
    // (original: gMulleGlobals.enterShelf, read by script 55's init as
    // `value(char 6 of string(tmpShelf))`).
    const shelf = this.game.mulle.user.enterShelf || 'Shelf1'
    this.game.mulle.user.enterShelf = null
    this.currentShelf = parseInt(String(shelf).replace(/\D+/g, ''), 10)
    if (!(this.currentShelf >= 1 && this.currentShelf <= 6)) this.currentShelf = 1

    // ShelfNr (ch3): script 55's init picks member "02b00" & (1+N) & "v0"
    // (members 2-7) and puts it at loc(320,240); the member's
    // regPoint(209,216) lands the 26x61 door at (111,24)-(137,85).
    this.door = new MulleSprite(this.game, 320, 240)
    this.door.setDirectorMember('02.DXR', 1 + this.currentShelf)
    this.game.add.existing(this.door)

    // Exits from script 55's mouseObject list:
    //   rect(48,0,137,287)   click -> frame "Quay" -> go 1,"03" (garage)
    //   rect(0,313,137,480)  click -> frame "Yard" -> go 1,"04" (yard)
    this.hotspotGfx = []
    this.hotspotGfx.push(this.makeZone([48, 0, 137, 287],
      () => this.game.state.start('garage'), 'forward'))
    this.hotspotGfx.push(this.makeZone([0, 313, 137, 480],
      () => this.game.state.start('yard'), 'left'))

    // Shelf up/down zones (click sound 02e003v0), rebuilt on change:
    //   rect(111,24,137,50)  -> shelf + 1
    //   rect(111,67,137,94)  -> shelf - 1
    this.upGfx = null
    this.downGfx = null
    this.updateShelfZones()

    // Junk parts: the original's JunkHandler.drawParts reads the save's
    // per-shelf junk store into channels 6+. The exit strips double as
    // dragToWhere zones: dropping a part on the top strip moves it to
    // the Quay pile, on the bottom strip to the Yard pile (02.DXR
    // script 55's mouseObject list).
    this._suppressClicks = false
    this.junkParts = new MulleJunkParts(this, 'Shelf' + this.currentShelf, [
      [[48, 0, 137, 287], 'Quay'],
      [[0, 313, 137, 480], 'Yard']
    ])
    this.junkParts.spawn()

    // Idle dialog (script 55 `on loop`): the first time a shelf is
    // visited, play firstDialogList [02d002v0, 02d003v0] in order, then
    // random lines from genDialogList. These are voice lines without
    // known subtitle text, so they play without subtitles (original
    // makeMulleTalk = play(gSound, snd, EFFECT), no dialog text).
    this.firstDialogList = ['02d002v0', '02d003v0']
    this.genDialogList = ['02d004v0', '00d001v0', '00d002v0', '00d003v0',
                          '00d004v0', '00d005v0']
    this.armDialogForShelf(this.currentShelf)
    this.updateLoopTimer = this.game.time.events.loop(Phaser.Timer.SECOND / 15,
      this.updateLoop, this)
  }

  updateShelfZones () {
    if (this.upGfx) { this.upGfx.destroy(); this.upGfx = null }
    if (this.downGfx) { this.downGfx.destroy(); this.downGfx = null }

    if (this.currentShelf < 6) {
      this.upGfx = this.makeZone([111, 24, 137, 50],
        () => this.changeShelf(this.currentShelf + 1), 'point')
    }
    if (this.currentShelf > 1) {
      this.downGfx = this.makeZone([111, 67, 137, 94],
        () => this.changeShelf(this.currentShelf - 1), 'point')
    }
  }

  armDialogForShelf (n) {
    // script 55 `on new`: FirstTime = gMulleGlobals.firstTimeList[Shelf];
    // when true it is marked used immediately and loopCounter = 12.
    this.firstDialogList = ['02d002v0', '02d003v0']
    this.firstTime = !this.game.mulle.user['firstTimeJunkShelf' + n]
    if (this.firstTime) {
      this.game.mulle.user['firstTimeJunkShelf' + n] = false
      this.game.mulle.saveData()
      this.loopCounter = 12
    } else {
      this.loopCounter = this.game.rnd.integerInRange(120, 360)
    }
  }

  changeShelf (n) {
    // Original: click sound, gMulleGlobals.enterShelf = #ShelfN,
    // go("NewShelf") which reloads the movie (re-running init and
    // rebuilding every runtime object for the new shelf).
    this.game.mulle.playAudio('02e003v0')
    this.currentShelf = n
    this.door.setDirectorMember('02.DXR', 1 + n)
    this.junkParts.where = 'Shelf' + n
    this.junkParts.redraw()
    // Rebuild next tick: the clicked zone is currently dispatching.
    this.game.time.events.add(0, this.updateShelfZones, this)
    this.armDialogForShelf(n)
  }

  updateLoop () {
    if (this.loopCounter > 0) {
      this.loopCounter--
    }

    // First-time dialog: play firstDialogList in order
    if (this.firstTime && this.loopCounter === 0) {
      if (this.firstDialogList.length > 0) {
        this.game.mulle.playAudio(this.firstDialogList.shift())
        this.loopCounter = this.game.rnd.integerInRange(120, 240)
      } else {
        this.firstTime = false
        this.loopCounter = this.game.rnd.integerInRange(120, 360)
      }
    } // Random chatter
    else if (this.loopCounter === 0) {
      const snd = this.game.rnd.pick(this.genDialogList)
      this.game.mulle.playAudio(snd)
      this.loopCounter = this.game.rnd.integerInRange(360, 720)
    }
  }

  shutdown () {
    if (this.updateLoopTimer) {
      this.game.time.events.remove(this.updateLoopTimer)
      this.updateLoopTimer = null
    }
    if (this.hotspotGfx) {
      this.hotspotGfx.forEach(g => g.destroy())
      this.hotspotGfx = []
    }
    if (this.upGfx) { this.upGfx.destroy(); this.upGfx = null }
    if (this.downGfx) { this.downGfx.destroy(); this.downGfx = null }
    if (this.door) { this.door.destroy(); this.door = null }
    if (this.junkParts) {
      this.junkParts.destroy()
      this.junkParts = null
    }
    this.game.sound.stopAll()
  }
}

export default JunkState
