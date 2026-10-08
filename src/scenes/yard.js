import MulleState from './base'
import MulleSprite from '../objects/sprite'
import MulleJunkParts from '../objects/junkparts'
import DirectorHelper from '../objects/DirectorHelper'
import { g } from '../objects/boat/lingo'
import { drawBoatAt, getDrawOffset } from '../objects/boat/boatdraw'

class YardState extends MulleState {
  preload () {
    this.game.load.pack('yard', 'assets/yard.json', null, this)
    this.game.load.pack('boatparts', 'assets/boatparts.json', null, this)
  }

  create () {
    super.create()

    this.game.mulle.addAudio('yard')
    this.game.mulle.addAudio('shared')
    this.game.mulle.addAudio('boatparts')

    // Sky
    const weatherType = Math.min(4, Math.max(1,
      (g.globals && g.globals.weather && g.globals.weather.weatherType) || 1))
    const sky = new MulleSprite(this.game, 320, 240)
    sky.setDirectorMember('00.CXT', 77 + weatherType)
    this.game.add.existing(sky)

    // Background
    this.background = new MulleSprite(this.game, 320, 240)
    this.background.setDirectorMember('04.DXR', 1)
    this.game.add.existing(this.background)

    // Foreground deck overlay: member 2 = 04b002v0
    this.deckOverlay = new MulleSprite(this.game, 320, 240)
    this.deckOverlay.setDirectorMember('04.DXR', 2)
    this.game.add.existing(this.deckOverlay)

    // Water strip: member 3 = 04b003v0
    this.water = new MulleSprite(this.game, 320, 240)
    this.water.setDirectorMember('04.DXR', 3)
    this.game.add.existing(this.water)

    // Border frame
    const border = this.game.add.graphics(0, 0)
    border.lineStyle(4, 0x888888, 1)
    border.moveTo(0, 0)
    border.lineTo(640, 0)
    border.lineTo(640, 480)
    border.lineTo(0, 480)
    border.lineTo(0, 0)

    // Mulle
    this.mulle = new MulleSprite(this.game, 557, 327)
    this.mulle.loadDirectorTexture('00a001v0')
    this.game.add.existing(this.mulle)

    // Navigation hotspots
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
    ]

    this.hotspotGfx = []
    this.hotspots.forEach(hs => {
      const gfx = this.game.add.graphics(0, 0)
      gfx.beginFill(0x00ff00, 0)
      gfx.drawRect(hs.rect[0], hs.rect[1], hs.rect[2] - hs.rect[0], hs.rect[3] - hs.rect[1])
      gfx.endFill()
      gfx.inputEnabled = true
      gfx.events.onInputUp.add(() => {
        if (this._suppressClicks) return
        this.navigate(hs)
      }, this)
      gfx.events.onInputOver.add(() => this.game.canvas.style.cursor = this.cursorMap(hs.cursor), this)
      gfx.events.onInputOut.add(() => this.game.canvas.style.cursor = 'default', this)
      this.hotspotGfx.push(gfx)
    })

    // Add hover effects for specific hotspots (matching original mouseObjectList from 688.lingo)
    // Pole: rect(477,331,509,379) -> hover shows member 5 + sound 04e005v0
    const poleZone = this.makeZone([477, 331, 509, 379], null, 'up')
    poleZone.onEnter = () => {
      this.pole.setDirectorMember('04.DXR', 5)
      this.game.mulle.playAudio('04e005v0')
    }
    poleZone.onLeave = () => {
      this.pole.setDirectorMember('04.DXR', 5)
    }
    poleZone.onClick = () => {
      const props = this.game.mulle.refreshBoatProperties ? this.game.mulle.refreshBoatProperties(this.game) : {}
      const hasPropulsion = props && (props.engine || props.sailwithpole || props.oar)
      if (hasPropulsion) {
        this.game.state.start('world')
      } else {
        this.game.mulle.playAudio('04d049v0')
      }
    }

    // PhotoBook: rect(554,115,592,157) -> hover shows member 6 + sound 04e1000v0, click -> album
    const photoBookZone = this.makeZone([554, 115, 592, 157], null, 'up')
    photoBookZone.onEnter = () => {
      this.photoBook.setDirectorMember('04.DXR', 6)
      this.game.mulle.playAudio('04e1000v0')
    }
    photoBookZone.onLeave = () => {
      this.photoBook.setDirectorMember('04.DXR', 6)
    }
    photoBookZone.onClick = () => {
      this.game.state.start('album')
    }

    // Camera: rect(550,184,587,230) -> hover shows member 7 + "RollOver" sound
    const cameraZone = this.makeZone([550, 184, 587, 230], null, 'up')
    cameraZone.onEnter = () => {
      this.camera.setDirectorMember('04.DXR', 7)
      this.game.mulle.playAudio('04e002v0')
    }
    cameraZone.onLeave = () => {
      this.camera.setDirectorMember('04.DXR', 7)
    }
    cameraZone.onClick = () => {
      console.log('Camera view not yet implemented')
    }

    // Windmeter: rect(479,18,536,70) -> click -> wind report
    const windmeterZone = this.makeZone([479, 18, 536, 70], null, 'up')
    windmeterZone.onClick = () => {
      this.showWindReport()
    }

    // Windmeter
    this.windmeter = new MulleSprite(this.game, 320, 240)
    this.windmeter.setDirectorMember('04.DXR', 11)
    this.windmeter.inputEnabled = true
    this.windmeter.events.onInputUp.add(() => this.showWindReport(), this)
    this.windmeter.events.onInputOver.add(() => this.game.canvas.style.cursor = 'pointer', this)
    this.windmeter.events.onInputOut.add(() => this.game.canvas.style.cursor = 'default', this)
    this.game.add.existing(this.windmeter)

    // Radio
    this.radio = new MulleSprite(this.game, 320, 240)
    this.radio.setDirectorMember('04.DXR', 33)
    this.radio.inputEnabled = true
    this.radio.events.onInputUp.add(() => this.playRadio(), this)
    this.radio.events.onInputOver.add(() => this.game.canvas.style.cursor = 'pointer', this)
    this.radio.events.onInputOut.add(() => this.game.canvas.style.cursor = 'default', this)
    this.game.add.existing(this.radio)

    // Boat at quay
    const user = this.game.mulle.user
    const parts = user.Car && user.Car.Parts ? user.Car.Parts : []
    const drawOffset = getDrawOffset(this.game, 'Quay', parts)
    const boatX = 315 + drawOffset.x
    const boatY = 210 + drawOffset.y
    this.boatGroup = drawBoatAt(this.game, parts, boatX, boatY, 'Quay', 1)
    this.game.add.existing(this.boatGroup)

    // Buffa
    this.buffa = new MulleSprite(this.game, 320, 240)
    this.buffa.setDirectorMember('04.DXR', 75)
    this.game.add.existing(this.buffa)

    // PhotoBook
    this.photoBook = new MulleSprite(this.game, 320, 240)
    this.photoBook.setDirectorMember('04.DXR', 6)
    this.game.add.existing(this.photoBook)

    // Camera
    this.camera = new MulleSprite(this.game, 320, 240)
    this.camera.setDirectorMember('04.DXR', 7)
    this.game.add.existing(this.camera)

    // Pole
    this.pole = new MulleSprite(this.game, 320, 240)
    this.pole.setDirectorMember('04.DXR', 5)
    this.game.add.existing(this.pole)

    // Figge
    this.figge = new MulleSprite(this.game, 320, 240)
    this.figge.setDirectorMember('04.DXR', 8)
    this.figge.visible = false
    this.game.add.existing(this.figge)

    // ToolBox
    this.toolBox = new MulleSprite(this.game, 654, 436)
    this.toolBox.visible = false
    this.game.add.existing(this.toolBox)

    // Quay pile parts
    this._suppressClicks = false
    this.junkParts = new MulleJunkParts(this, 'Quay',
      this.hotspots
        .filter(hs => /^(Quay|Yard|Shelf[1-6])$/.test(hs.label))
        .map(hs => [hs.rect, hs.label]))
    this.junkParts.spawn()

    // Figge: only appears on #doFigge event

    // First-time dialog handling
    if (this.game.mulle.user.firstTimeQuay === undefined) {
      this.game.mulle.user.firstTimeQuay = true
    }
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
    this.updateLoopTimer = this.game.time.events.loop(Phaser.Timer.SECOND / 15, this.updateLoop, this)
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
    const sounds = ['04d040v0', '04d044v0']
    const snd = this.game.rnd.pick(sounds)
    this.game.mulle.playAudio(snd)
    this.game.mulle.subtitle.showLine('- Radio: Nyheter och väder...', 'mulle')
  }

  showWindReport () {
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
    if (this.updateLoopTimer) {
      this.game.time.events.remove(this.updateLoopTimer)
      this.updateLoopTimer = null
    }
    if (this.hotspotGfx) {
      this.hotspotGfx.forEach(g => g.destroy())
      this.hotspotGfx = []
    }
    if (this.windmeter) { this.windmeter.destroy(); this.windmeter = null }
    if (this.radio) { this.radio.destroy(); this.radio = null }
    if (this.buffa) { this.buffa.destroy(); this.buffa = null }
    if (this.boatGroup) { this.boatGroup.destroy(true); this.boatGroup = null }
    if (this.junkParts) {
      this.junkParts.destroy()
      this.junkParts = null
    }
    if (this.mulle) { this.mulle.destroy(); this.mulle = null }
    this.game.sound.stopAll()
  }
}

export default YardState