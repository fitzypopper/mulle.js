/**
 * Diploma scene - shows the player's achievements and medals.
 * @module scenes/diploma
 */
'use strict'

import MulleState from './base'
import MulleSprite from '../objects/sprite'
import { g, point } from '../objects/boat/lingo'

class DiplomaState extends MulleState {
  preload () {
    super.preload()

    this.game.load.pack('diploma', 'assets/diploma.json', null, this)
    this.game.load.pack('sailing', 'assets/sailing.json', null, this)
    this.game.load.pack('cutscenes', 'assets/cutscenes.json', null, this)
    this.game.load.pack('shared', 'assets/shared.json', null, this)
  }

  create () {
    super.create()

    this.game.mulle.addAudio('shared')

    this.game.mulle.worldState = this

    // Background
    this.background = new MulleSprite(this.game, 320, 240)
    this.background.setDirectorMember('08.DXR', 31)
    this.game.add.existing(this.background)

    // Diploma paper
    this.diploma = new MulleSprite(this.game, 320, 240)
    this.diploma.setDirectorMember('08.DXR', 71)
    this.game.add.existing(this.diploma)

    // Player name
    const user = this.game.mulle.user
    this.nameText = this.game.add.text(320, 180, user.UserId || 'Player', {
      font: '24px Arial',
      fill: '#000000',
      align: 'center'
    })
    this.nameText.anchor.set(0.5)

    // Medals earned
    const medals = user.Car && user.Car.Medals ? user.Car.Medals : []
    let y = 240
    medals.forEach((medalId, i) => {
      const medalName = this.getMedalName(medalId)
      const text = this.game.add.text(320, y + i * 30, medalName, {
        font: '18px Arial',
        fill: '#8B4513',
        align: 'center'
      })
      text.anchor.set(0.5)
    })

    // Stats
    const stats = [
      'Distance sailed: ' + Math.round((user.Car?.totalDistance || 0) / 100) + ' km',
      'Missions completed: ' + (user.CompletedMissions?.length || 0),
      'Money earned: ' + (user.Money || 0) + ' kr'
    ]

    stats.forEach((stat, i) => {
      const text = this.game.add.text(320, 350 + i * 25, stat, {
        font: '16px Arial',
        fill: '#333333',
        align: 'center'
      })
      text.anchor.set(0.5)
    })

    // Continue button
    this.continueRect = this.game.add.graphics(0, 0)
    this.continueRect.beginFill(0x0066CC)
    this.continueRect.drawRect(270, 430, 100, 40)
    this.continueRect.endFill()
    this.continueRect.inputEnabled = true
    this.continueRect.events.onInputUp.add(() => {
      this.game.state.start('yard')
    }, this)

    const continueText = this.game.add.text(320, 450, 'CONTINUE', {
      font: '18px Arial',
      fill: '#FFFFFF',
      align: 'center'
    })
    continueText.anchor.set(0.5)

    this.game.mulle.cursor.reset()
  }

  getMedalName (medalId) {
    const names = {
      1: 'Navigator Medal',
      2: 'Racing Medal',
      3: 'Explorer Medal',
      4: 'Rescue Medal',
      5: 'Fishing Medal',
      6: 'Trading Medal',
      7: 'Speed Medal',
      8: 'Endurance Medal',
      9: 'Master Sailor Medal'
    }
    return names[medalId] || 'Medal ' + medalId
  }

  shutdown () {
    if (this.background) this.background.destroy()
    if (this.diploma) this.diploma.destroy()
    if (this.nameText) this.nameText.destroy()
    if (this.continueRect) this.continueRect.destroy()
    if (this.continueText) this.continueText.destroy()
  }
}

export default DiplomaState