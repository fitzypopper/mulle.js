/**
 * MulleState base state
 * @module MulleState
 */
'use strict'

import MulleSprite from '../objects/sprite'
import MulleSave from '../struct/savedata'

/**
 * MulleState, extension of phaser state
 * @extends Phaser.State
 */
class MulleState extends Phaser.State {
  preload () {
    if (this.game.mulle.activeCutscene) {
      console.log('cutscene', this.key, this.game.mulle.activeCutscene)

      this.cutscene = new MulleSprite(this.game, 320, 240)
      this.cutscene.setDirectorMember('00.CXT', this.game.mulle.activeCutscene)
      this.game.add.existing(this.cutscene)

      this.progress = this.game.add.graphics(0, 0)
    }
  }

  loadRender () {
    if (this.progress) {
      var p = this.game.load.progressFloat / 100

      this.progress.clear()

      this.progress.beginFill('0x333333', 1)
      this.progress.drawRect(640 / 2 - 150, 400, 300, 32)
      this.progress.endFill()

      this.progress.beginFill('0x65C265', 1)
      this.progress.drawRect(640 / 2 - 150, 400, p * 300, 32)
      this.progress.endFill()

      this.progress.beginFill('0x65C265', 1)
    }
  }

  /*
  loadUpdate() {
    console.log('loadUpdate', this.key)
  }
  */

  create () {
    if (this.cutscene) {
      console.log('destroy cutscene')
      this.cutscene.destroy()
      this.game.mulle.activeCutscene = null

      this.progress.destroy()
    }

    if (!this.game.mulle.user) {
      const userKeys = Object.keys(this.game.mulle.UsersDB)
      if (userKeys.length > 0) {
        this.game.mulle.user = this.game.mulle.UsersDB[userKeys[0]]
      } else {
        // Create a default user for first-time play
        this.game.mulle.user = new MulleSave(this.game, {
          UserId: 'Player',
          Car: { Parts: [] },
          Medals: [],
          Inventory: { DrivenTimes: { Motor: 0, Sail: 0, Oar: 0 } }
        })
        this.game.mulle.UsersDB['Player'] = this.game.mulle.user
      }

      // if( process.env.NODE_ENV !== "production" ){

      window.location.hash = this.key

      this.game.mulle.net.send({ name: this.game.mulle.user.UserId })
      this.game.mulle.net.send({ parts: this.game.mulle.user.Car.Parts })
    }

    // this.game.canvas.className = '';

    this.game.mulle.cursor.reset()

    // console.log('prelaunch', this.key);
  }

  cursorMap (cursor) {
    const map = {
      forward: 'pointer',
      left: 'w-resize',
      right: 'e-resize',
      up: 'n-resize',
      down: 's-resize',
      point: 'pointer'
    }
    return map[cursor] || 'default'
  }

  makeZone (rect, onClick, cursor) {
    const gfx = this.game.add.graphics(0, 0)
    gfx.beginFill(0x00ff00, 0)
    gfx.drawRect(rect[0], rect[1], rect[2] - rect[0], rect[3] - rect[1])
    gfx.endFill()
    gfx.inputEnabled = true
    gfx.events.onInputUp.add(() => {
      if (this._suppressClicks) return
      onClick()
    }, this)
    gfx.events.onInputOver.add(() => {
      this.game.canvas.style.cursor = this.cursorMap(cursor)
    }, this)
    gfx.events.onInputOut.add(() => {
      this.game.canvas.style.cursor = 'default'
    }, this)
    return gfx
  }
}

export default MulleState
