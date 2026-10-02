import MulleState from './base'
import MulleSprite from '../objects/sprite'
import DirectorHelper from '../objects/DirectorHelper'

class YardState extends MulleState {
  preload () {
    this.game.load.pack('yard', 'assets/yard.json', null, this)
  }

  create () {
    this.game.mulle.addAudio('yard')

    // Background: 04.DXR has multiple backgrounds (member 1 = 04b001v0, member 9 = 04b009v0, member 21 = 04b010v0)
    // Start with member 1
    this.background = new MulleSprite(this.game, 320, 240)
    this.background.setDirectorMember('04.DXR', 1)
    this.game.add.existing(this.background)

    // Border frame
    const border = this.game.add.graphics(0, 0)
    border.lineStyle(4, 0x888888, 1)
    border.moveTo(0, 0)
    border.lineTo(640, 0)
    border.lineTo(640, 480)
    border.lineTo(0, 480)
    border.lineTo(0, 0)

    // Mulle at quay (member 66) - simplified as sprite for now
    this.mulle = new MulleSprite(this.game, 320, 320)
    this.mulle.setDirectorMember('04.DXR', 66)
    this.game.add.existing(this.mulle)

    // Navigation hotspots from decompiled Lingo:
    // 1. Left edge (rect 4, 322, 56, 433) -> Shipyard/garage (03)
    // 2. Right edge (rect 602, 97, 1640, 302) -> Yard/junk (02)
    // 3. Top area (rect 0, 0, 508, 155) -> World/sailing (05)
    // 4. Pole (rect 477, 331, 509, 379) -> World (with animation)
    // 5. PhotoBook (rect 554, 115, 592, 157) -> album/photo
    // 6. Camera (rect 550, 184, 587, 230) -> camera
    // 7. Radio (rect 554, 115, 592, 157 area) -> radio dialog
    // 8. Windmeter (rect 554, 115 area) -> wind report

    this.hotspots = [
      // Shipyard/Garage entrance (left edge)
      { rect: [4, 322, 56, 433], target: 'garage', label: 'Shipyard', cursor: 'left' },
      // Junkyard/Boatyard entrance (right edge)
      { rect: [602, 97, 640, 302], target: 'junk', label: 'Yard', cursor: 'right' },
      // World/Sailing entrance (top/water)
      { rect: [0, 0, 508, 155], target: 'world', label: 'World', cursor: 'forward' },
      // Pole -> World with animation
      { rect: [477, 331, 509, 379], target: 'world', label: 'Pole', cursor: 'point' },
      // PhotoBook
      { rect: [554, 115, 592, 157], target: 'album', label: 'PhotoBook', cursor: 'point' },
      // Camera
      { rect: [550, 184, 587, 230], target: 'camera', label: 'Camera', cursor: 'point' },
      // Radio
      { rect: [554, 115, 592, 157], target: 'radio', label: 'Radio', cursor: 'point' },
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

    // Windmeter (member 9 = windmeterAnimChart)
    this.windmeter = new MulleSprite(this.game, 100, 100)
    this.windmeter.setDirectorMember('04.DXR', 9)
    this.windmeter.inputEnabled = true
    this.windmeter.events.onInputUp.add(() => this.showWindReport(), this)
    this.windmeter.events.onInputOver.add(() => this.game.canvas.style.cursor = 'pointer', this)
    this.windmeter.events.onInputOut.add(() => this.game.canvas.style.cursor = 'default', this)
    this.game.add.existing(this.windmeter)

    // Radio (member 8)
    this.radio = new MulleSprite(this.game, 570, 130)
    this.radio.setDirectorMember('04.DXR', 8)
    this.radio.inputEnabled = true
    this.radio.events.onInputUp.add(() => this.playRadio(), this)
    this.radio.events.onInputOver.add(() => this.game.canvas.style.cursor = 'pointer', this)
    this.radio.events.onInputOut.add(() => this.game.canvas.style.cursor = 'default', this)
    this.game.add.existing(this.radio)

    // Buffa at quay (member 5 = BuffaQuayAnimChart frames)
    // Using member 42-58 range for Buffa animation
    this.buffa = new MulleSprite(this.game, 150, 200)
    this.buffa.setDirectorMember('04.DXR', 42)
    this.game.add.existing(this.buffa)

    // Figge (member 3 = Figge)
    this.figge = new MulleSprite(this.game, 500, 150)
    this.figge.setDirectorMember('04.DXR', 3)
    this.game.add.existing(this.figge)

    // Sky/weather gradient
    const sky = this.game.add.graphics(0, 0)
    const skyGradient = sky.generateTexture ? sky : null
    if (sky) {
      sky.beginFill(0x87ceeb)
      sky.drawRect(0, 0, 640, 200)
      sky.endFill()
    }

    // First-time dialog handling
    this.firstTime = !this.game.mulle.user.firstTimeQuay
    this.loopCounter = this.game.rnd.integerInRange(120, 360)

    // Dialog lists from Lingo
    this.firstDialogList = ['04d010v0', '04d012v0', '04d047v0', '04d051v0', '04d052v0']
    this.genDialogList = ['00d001v0', '00d002v0', '00d003v0', '00d004v0', '00d005v0',
                          '04d001v0', '04d002v0', '04d003v0', '04d004v0', '04d007v0',
                          '04d013v0', '04d014v0', '04d015v0', '04d016v0', '04d017v0',
                          '04d018v0', '04d019v0', '04d020v0', '04d022v0', '04d023v0',
                          '04d027v0', '04d028v0', '04d029v0', '04d030v0', '04d032v0']
    this.dorisPartList = ['04d034v0', '04d035v0', '04d036v0', '04d037v0', '04d038v0',
                          '04d039v0', '04d041v0', '04d042v0', '04d043v0', '04d045v0', '04d046v0']

    // Subtitle lines
    this.game.mulle.subtitle.setLines('04d001v0', 'swedish', [
      '- Välkommen till hamnen!',
    ], 'mulle')
    this.game.mulle.subtitle.setLines('04d001v0', 'english', [
      '- Welcome to the harbor!',
    ], 'mulle')

    // Play ambient harbor sound
    this.game.mulle.playAudio('04d001v0')

    // Loop timer for random chatter
    this.game.time.events.loop(Phaser.Timer.SECOND / 15, this.updateLoop, this)
  }

  navigate (hs) {
    if (hs.target === 'garage') {
      this.game.state.start('garage')
    } else if (hs.target === 'junk') {
      this.game.state.start('junk')
    } else if (hs.target === 'world') {
      this.game.state.start('world')
    } else if (hs.target === 'album') {
      this.game.state.start('album')
    } else if (hs.target === 'radio') {
      this.playRadio()
    }
  }

  playRadio () {
    // Play radio sound and show radio dialog
    const sounds = ['04d040v0', '04d044v0'] // dorisBluePrintList
    const snd = this.game.rnd.pick(sounds)
    this.game.mulle.playAudio(snd)
    this.game.mulle.subtitle.showLine('- Radio: Nyheter och väder...', 'mulle')
  }

  showWindReport () {
    // Play windmeter sound
    this.game.mulle.playAudio('04e005v0')
    this.game.mulle.subtitle.showLine('- Vindmätare: Vind från väster...', 'mulle')
  }

  cursorMap (name) {
    const map = { left: 'w-resize', right: 'e-resize', forward: 'n-resize', point: 'pointer', default: 'default' }
    return map[name] || 'default'
  }

  updateLoop () {
    if (this.loopCounter > 0) {
      this.loopCounter--
    }

    // First-time dialogs
    if (this.firstTime && this.loopCounter === 0) {
      this.firstTime = false
      this.game.mulle.user.firstTimeQuay = false
      this.game.mulle.saveData()
      this.game.mulle.playAudio('04d010v0')
      this.loopCounter = this.game.rnd.integerInRange(120, 240)
    }
    // Random chatter
    else if (this.loopCounter === 0) {
      if (this.game.mulle.user.gotNewParts) {
        const snd = this.game.rnd.pick(this.dorisPartList)
        this.game.mulle.playAudio(snd)
        this.game.mulle.user.gotNewParts = false
        this.loopCounter = this.game.rnd.integerInRange(120, 240)
      } else {
        const snd = this.game.rnd.pick(this.genDialogList)
        this.game.mulle.playAudio(snd)
        this.loopCounter = this.game.rnd.integerInRange(360, 720)
      }
    }
  }

  shutdown () {
    if (this.hotspotGfx) {
      this.hotspotGfx.forEach(g => g.destroy())
      this.hotspotGfx = []
    }
    if (this.windmeter) { this.windmeter.destroy(); this.windmeter = null }
    if (this.radio) { this.radio.destroy(); this.radio = null }
    if (this.buffa) { this.buffa.destroy(); this.buffa = null }
    if (this.figge) { this.figge.destroy(); this.figge = null }
    if (this.mulle) { this.mulle.destroy(); this.mulle = null }
    this.game.sound.stopAll()
  }
}

export default YardState