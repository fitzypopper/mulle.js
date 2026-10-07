import MulleState from './base'
import MulleSprite from '../objects/sprite'
import MulleActor from '../objects/actor'
import MulleSave from '../struct/savedata'

class MenuState extends MulleState {
  preload () {
    this.game.load.pack('menu', 'assets/menu.json', null, this)
    // solhem pack carries the 11.DXR profile screen art (bg 86, Mulle
    // body/head animation frames 125-149, Buffa 68-72) and the 11d001v0
    // intro speech.
    this.game.load.pack('solhem', 'assets/solhem.json', null, this)
    this.game.load.pack('sailing', 'assets/sailing.json', null, this)
    this.game.load.pack('characters', 'assets/characters.json', null, this)
  }

  create () {
    this.game.mulle.addAudio('menu')
    this.game.mulle.addAudio('solhem')

    // Background: the original profile screen (11.DXR member 86 = 11b001v1,
    // 640x480 opaque). The art includes the rope-framed name list box
    // ((336,60)-(559,259)) and the wooden sign for the name field.
    const background = new MulleSprite(this.game, 320, 240)
    background.setDirectorMember('11.DXR', 86)
    this.game.add.existing(background)

    // Border frame (the original score draws the same four 640x4/4x472
    // shape sprites around the frame).
    const border = this.game.add.graphics(0, 0)
    border.lineStyle(4, 0x888888, 1)
    border.moveTo(0, 0)
    border.lineTo(640, 0)
    border.lineTo(640, 480)
    border.lineTo(0, 480)
    border.lineTo(0, 0)

    // Buffa, seen from behind (11.DXR members 68-72, 110x170, reg 113,-70)
    // at loc (320,240) -> bounds (207,310)-(317,480), exactly as in the
    // original score row.
    this.buffa = new MulleSprite(this.game, 320, 240)
    this.buffa.setDirectorMember('11.DXR', 68)
    this.game.add.existing(this.buffa)

    // Mulle body (11.DXR members 144-149, 180x228, reg 307,-12) at loc
    // (320,240) -> bounds (13,252)-(193,480).
    this.mulleBody = new MulleSprite(this.game, 320, 240)
    this.mulleBody.setDirectorMember('11.DXR', 144)
    this.game.add.existing(this.mulleBody)

    // Mulle head (11.DXR members 133-143, ~118x128, reg 297,106) at loc
    // (320,240) -> bounds (23,134)-(141,262); composed with the body it
    // forms the single standing figure of the original screen. The head
    // talks while the intro speech plays.
    this.mulleHead = new MulleActor(this.game, 320, 240, 'mulleHead')
    this.mulleHead.animations.play('idle')
    this.mulleHead.talkAnimation = 'talk'
    this.mulleHead.silenceAnimation = 'idle'
    this.game.add.existing(this.mulleHead)

    // Name input field (HTML overlay). The original score places a 189x30
    // field at (355,314) - on the wooden sign of the background art.
    this.nameInput = document.createElement('input')
    this.nameInput.style.position = 'absolute'
    this.nameInput.style.boxSizing = 'border-box'
    this.nameInput.style.font = '20px serif'
    this.nameInput.style.padding = '2px 6px'
    this.nameInput.style.border = '1px solid #666'
    this.nameInput.style.background = 'rgba(255,255,255,0.85)'
    this.nameInput.style.borderRadius = '3px'
    this.nameInput.style.zIndex = '1000'
    this.nameInput.placeholder = 'Ditt namn...'
    this.nameInput.maxLength = 20

    const canvas = this.game.canvas
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    this.nameInput.style.left = `${rect.left + 355 / scaleX}px`
    this.nameInput.style.top = `${rect.top + 314 / scaleY}px`
    this.nameInput.style.width = `${189 / scaleX}px`
    this.nameInput.style.height = `${30 / scaleY}px`
    this.nameInput.style.fontSize = `${20 / Math.max(scaleX, scaleY)}px`

    document.body.appendChild(this.nameInput)

    this.nameInput.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        this.handleLogin()
      }
    })

    // OK button at the bottom right corner. The original score has a 104x24
    // button sprite near (628,453); with its registration point at the
    // bottom right that puts it at bounds (524,429)-(628,453).
    const btnGfx = this.game.add.graphics(524, 429)
    btnGfx.beginFill(0x88cc88, 0.9)
    btnGfx.drawRoundedRect(0, 0, 104, 24, 5)
    btnGfx.endFill()
    btnGfx.inputEnabled = true
    btnGfx.events.onInputUp.add(() => this.handleLogin(), this)
    this.okButtonText = this.game.add.text(576, 441, 'OK', {
      font: '16px serif',
      fill: '#fff',
      fontWeight: 'bold'
    })
    this.okButtonText.anchor.set(0.5)
    this.okButton = btnGfx

    // Existing users list inside the rope-framed white box of the
    // background. The box interior is (336,60)-(559,259): 7 rows fit.
    this.userList = []
    let y = 74
    let rows = 0
    for (const name in this.game.mulle.UsersDB) {
      if (rows >= 7) break
      const text = this.game.add.text(350, y, name, {
        font: '20px serif',
        fill: '#333'
      })
      text.inputEnabled = true
      text.events.onInputUp.add(() => {
        this.game.mulle.user = this.game.mulle.UsersDB[name]
        this.game.state.start('garage')
      }, this)
      this.userList.push(text)
      y += 26
      rows++
    }

    // Subtitle lines (from 11d001v0 - member 90)
    this.game.mulle.subtitle.setLines('11d001v0', 'swedish', [
      '- Hej!',
      '- Jag heter {Mulle Meck}!',
      '- Vill du bygga båtar med mig?',
      '- Skriv ditt namn så kan vi sätta igång.',
      '- Har du byggt förr så klickar du på ditt namn i {listan}.'
    ], 'mulle')

    this.game.mulle.subtitle.setLines('11d001v0', 'english', [
      '- Hello!',
      '- My name is {Mulle Meck}!',
      '- Do you want to build boats with me?',
      '- Write down your name so we can start.',
      "- If you've been here before, click your name in the {list}."
    ], 'mulle')

    // Original intro speech (11d001v0, 11.3s): plays the voice, shows the
    // subtitle lines one by one and animates the head via the actor's
    // talk machinery.
    this.mulleHead.talk('11d001v0')

    // Cursor handling
    this.setupCursors()
  }

  handleLogin () {
    const name = this.nameInput.value.trim()
    if (!name) return

    if (this.game.mulle.UsersDB[name]) {
      this.game.mulle.user = this.game.mulle.UsersDB[name]
    } else {
      const save = new MulleSave(this.game)
      save.UserId = name
      this.game.mulle.UsersDB[name] = save
      this.game.mulle.saveData()
      this.game.mulle.user = save
    }

    this.game.state.start('garage')
  }

  setupCursors () {
    // Load cursor sprites from 11.DXR members 101-109
    // C_standard (101), C_Grab (102), C_Left (103), C_Click (104), C_Back (105), C_Right (106), C_MoveLeft (107), C_MoveRight (108), C_MoveIn (109)
    // For now use default cursor
    this.game.canvas.style.cursor = 'default'
  }

  update () {
    // Update cursor position for custom cursors if needed
  }

  shutdown () {
    if (this.nameInput && this.nameInput.parentNode) {
      this.nameInput.parentNode.removeChild(this.nameInput)
    }
    this.nameInput = null

    if (this.okButton) {
      this.okButton.destroy()
      this.okButton = null
    }
    if (this.okButtonText) {
      this.okButtonText.destroy()
      this.okButtonText = null
    }

    this.userList.forEach(t => t.destroy())
    this.userList = []

    this.game.sound.stopAll()
  }
}

export default MenuState
