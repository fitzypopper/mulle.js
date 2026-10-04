import MulleState from './base'
import MulleSprite from '../objects/sprite'
import MulleActor from '../objects/actor'
import DirectorHelper from '../objects/DirectorHelper'
import MulleButton from '../objects/button'

class GarageState extends MulleState {
  preload () {
    this.game.load.pack('garage', 'assets/garage.json', null, this)
  }

  create () {
    super.create()
    this.game.mulle.addAudio('garage')

    // Background: 03.DXR member 1 = 03b001v1 (640x480)
    const background = new MulleSprite(this.game, 320, 240)
    background.setDirectorMember('03.DXR', 1)
    this.game.add.existing(background)

    // Border frame (same as other scenes: ch113-116 in score)
    const border = this.game.add.graphics(0, 0)
    border.lineStyle(4, 0x888888, 1)
    border.moveTo(0, 0)
    border.lineTo(640, 0)
    border.lineTo(640, 480)
    border.lineTo(0, 480)
    border.lineTo(0, 0)

    // Mulle body sprite (simplified - no complex animation charts yet)
    this.mulle = new MulleSprite(this.game, 320, 300)
    this.mulle.setDirectorMember('03.DXR', 1)
    this.game.add.existing(this.mulle)

    // Navigation hotspots (invisible clickable areas)
    // rect(left, top, right, bottom) -> frame label
    this.hotspots = [
      { rect: [29, 0, 124, 300], target: 'yard', label: 'Quay', cursor: 'left' },      // Left edge -> 04.DXR
      { rect: [131, 43, 206, 307], target: 'junk', label: 'Shelf1', cursor: 'forward' }, // Shelf1
      { rect: [207, 40, 288, 314], target: 'junk', label: 'Shelf2', cursor: 'forward' },
      { rect: [289, 34, 380, 322], target: 'junk', label: 'Shelf3', cursor: 'forward' },
      { rect: [381, 31, 479, 329], target: 'junk', label: 'Shelf4', cursor: 'forward' },
      { rect: [480, 28, 579, 335], target: 'junk', label: 'Shelf5', cursor: 'forward' },
      { rect: [580, 25, 640, 343], target: 'junk', label: 'Shelf6', cursor: 'forward' },
    ]

    this.hotspotGfx = []
    this.hotspots.forEach(hs => {
      const gfx = this.game.add.graphics(0, 0)
      gfx.beginFill(0x00ff00, 0)
      gfx.drawRect(hs.rect[0], hs.rect[1], hs.rect[2] - hs.rect[0], hs.rect[3] - hs.rect[1])
      gfx.endFill()
      gfx.inputEnabled = true
      gfx.events.onInputUp.add(() => this.navigate(hs), this)
      gfx.events.onInputOver.add(() => this.game.canvas.style.cursor = this.cursorMap(hs.cursor), this)
      gfx.events.onInputOut.add(() => this.game.canvas.style.cursor = 'default', this)
      this.hotspotGfx.push(gfx)
    })

    // Gift button (if user has gifts)
    this.checkGifts()

    // Sky/weather (placeholder)
    this.setupSky()

    // Subtitle lines for garage dialog (from 03d001v0-03d007v0)
    this.game.mulle.subtitle.setLines('03d001v0', 'swedish', [
      '- Välkommen till båtbygget!',
    ], 'mulle')
    this.game.mulle.subtitle.setLines('03d001v0', 'english', [
      '- Welcome to the boat building!',
    ], 'mulle')

    // Random chatter timer
    this.loopCounter = this.game.rnd.integerInRange(120, 360)
    this.firstTime = !this.game.mulle.user.firstTimeYard

    this.game.time.events.loop(Phaser.Timer.SECOND / 15, this.updateLoop, this)
  }

  checkGifts () {
    const gifts = this.game.mulle.user.gifts || []
    if (gifts.length > 0) {
      // Gift hotspot: rect(262, 383, 379, 478)
      const gfx = this.game.add.graphics(0, 0)
      gfx.beginFill(0xffd700, 0.3)
      gfx.drawRect(262, 383, 117, 95)
      gfx.endFill()
      gfx.inputEnabled = true
      gfx.events.onInputUp.add(() => this.openGift(), this)
      gfx.events.onInputOver.add(() => this.game.canvas.style.cursor = 'point', this)
      gfx.events.onInputOut.add(() => this.game.canvas.style.cursor = 'default', this)
      this.giftGfx = gfx

      // Gift icon using 03b999v0 (member 40)
      this.giftIcon = new MulleSprite(this.game, 320, 430)
      this.giftIcon.setDirectorMember('03.DXR', 40)
      this.game.add.existing(this.giftIcon)
    }
  }

  openGift () {
    // Add all gifted parts to user's yard
    const gifts = this.game.mulle.user.gifts || []
    gifts.forEach(partId => {
      // In the original, this calls addJunkPart / addNewPart
      // For now just add to user's parts
      if (!this.game.mulle.user.parts.includes(partId)) {
        this.game.mulle.user.parts.push(partId)
      }
    })
    this.game.mulle.user.gifts = []
    this.game.mulle.saveData()

    if (this.giftGfx) { this.giftGfx.destroy(); this.giftGfx = null }
    if (this.giftIcon) { this.giftIcon.destroy(); this.giftIcon = null }

    // Play gift sound
    this.game.mulle.playAudio('GiftSnd1')

    // Go to "Gift" marker/frame (in original: go "Gift")
    // For now just show message
    this.game.mulle.subtitle.showLine('- Du fick en present!', 'mulle')
  }

  navigate (hs) {
    if (hs.target === 'yard') {
      this.game.state.start('yard')
    } else if (hs.target === 'junk') {
      this.game.mulle.user.enterShelf = hs.label
      this.game.state.start('junk')
    }
  }

  cursorMap (name) {
    const map = { left: 'w-resize', forward: 'n-resize', point: 'pointer', default: 'default' }
    return map[name] || 'default'
  }

  setupSky () {
    // Weather-based sky from gMulleGlobals.weather
    // For now just a simple gradient
    const sky = this.game.add.graphics(0, 0)
    sky.beginFill(0x87ceeb)
    sky.drawRect(0, 0, 640, 200)
    sky.endFill()
  }

  updateLoop () {
    if (this.loopCounter > 0) {
      this.loopCounter--
    }

    // First-time dialogs
    if (this.firstTime && this.loopCounter === 0) {
      this.firstTime = false
      this.game.mulle.user.firstTimeYard = false
      this.game.mulle.saveData()
      this.game.mulle.playAudio('03d001v0')
      this.loopCounter = this.game.rnd.integerInRange(120, 240)
    }
    // Random chatter (simplified)
    else if (this.loopCounter === 0) {
      const sounds = ['00d001v0', '00d002v0', '00d003v0', '00d004v0', '00d005v0']
      const snd = this.game.rnd.pick(sounds)
      this.game.mulle.playAudio(snd)
      this.loopCounter = this.game.rnd.integerInRange(360, 720)
    }
  }

  shutdown () {
    this.hotspotGfx.forEach(g => g.destroy())
    this.hotspotGfx = []
    if (this.giftGfx) { this.giftGfx.destroy(); this.giftGfx = null }
    if (this.giftIcon) { this.giftIcon.destroy(); this.giftIcon = null }
    this.game.sound.stopAll()
  }
}

export default GarageState