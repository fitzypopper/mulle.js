import MulleState from './base'
import MulleSprite from '../objects/sprite'

class MenuState extends MulleState {
  preload () {
    this.game.load.pack('menu', 'assets/menu.json', null, this)
    this.game.load.pack('sailing', 'assets/sailing.json', null, this)
    this.game.load.pack('characters', 'assets/characters.json', null, this)
  }

  create () {
    this.game.mulle.addAudio('menu')

    // Background: use sailing backdrop (05.DXR member 81 = 30n001v0 640x480)
    const background = new MulleSprite(this.game, 320, 240)
    background.setDirectorMember('05.DXR', 81)
    this.game.add.existing(background)

    // Border frame
    const border = this.game.add.graphics(0, 0)
    border.lineStyle(4, 0x888888, 1)
    border.moveTo(0, 0)
    border.lineTo(640, 0)
    border.lineTo(640, 480)
    border.lineTo(0, 480)
    border.lineTo(0, 0)

    // Skip MulleActor (needs 11.DXR frames 125-143 which are missing from build)
    // Use a simple sprite instead
    this.mulleBody = new MulleSprite(this.game, 320, 320)
    this.mulleBody.setDirectorMember('00.CXT', 125)  // 76x198 standing frame
    this.game.add.existing(this.mulleBody)

    this.mulleHead = new MulleSprite(this.game, 320, 180)
    this.mulleHead.setDirectorMember('00.CXT', 126)  // alternate frame
    this.game.add.existing(this.mulleHead)

    // Name input field (HTML overlay) - positioned like car game
    this.nameInput = document.createElement('input')
    this.nameInput.style.position = 'absolute'
    this.nameInput.style.top = '320px'
    this.nameInput.style.left = '230px'
    this.nameInput.style.width = '180px'
    this.nameInput.style.height = '32px'
    this.nameInput.style.font = '24px serif'
    this.nameInput.style.padding = '4px 8px'
    this.nameInput.style.border = '2px solid #888'
    this.nameInput.style.background = 'rgba(255,255,255,0.9)'
    this.nameInput.style.borderRadius = '4px'
    this.nameInput.style.zIndex = '1000'
    this.nameInput.placeholder = 'Ditt namn...'
    this.nameInput.maxLength = 20

    const canvas = this.game.canvas
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    this.nameInput.style.left = `${rect.left + 230 / scaleX}px`
    this.nameInput.style.top = `${rect.top + 320 / scaleY}px`
    this.nameInput.style.width = `${180 / scaleX}px`
    this.nameInput.style.height = `${32 / scaleY}px`
    this.nameInput.style.fontSize = `${24 / Math.max(scaleX, scaleY)}px`

    document.body.appendChild(this.nameInput)

    this.nameInput.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        this.handleLogin()
      }
    })

    // OK button - simple graphics button since 11.DXR lacks dedicated button frames
    // (car game used 10.DXR #169/#170 for toilet button)
    const btnGfx = this.game.add.graphics(420, 330)
    btnGfx.beginFill(0x88cc88, 0.9)
    btnGfx.drawRoundedRect(0, 0, 80, 36, 6)
    btnGfx.endFill()
    btnGfx.inputEnabled = true
    btnGfx.events.onInputUp.add(() => this.handleLogin(), this)
    this.okButtonText = this.game.add.text(460, 348, 'OK', {
      font: '20px serif',
      fill: '#fff',
      fontWeight: 'bold'
    })
    this.okButtonText.anchor.set(0.5)
    this.okButton = btnGfx

    // Existing users list (like car game)
    this.userList = []
    let y = 370
    for (const name in this.game.mulle.UsersDB) {
      const text = this.game.add.text(230, y, name, {
        font: '20px serif',
        fill: '#333',
        backgroundColor: 'rgba(255,255,255,0.7)',
        padding: { x: 8, y: 4 }
      })
      text.inputEnabled = true
      text.events.onInputUp.add(() => {
        this.game.mulle.user = this.game.mulle.UsersDB[name]
        this.game.mulle.activeCutscene = '11d001v0'
        this.game.state.start('garage')
      }, this)
      this.userList.push(text)
      y += 28
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

    // Play intro audio and start Mulle animation
    this.game.mulle.playAudio('10e001v0', () => {
      this.mulleHead.animations.play('talk')
      this.mulleBody.animations.play('talk')

      // Simulate the Talk marker (frame 3) → Wait (frame 4) → IntroStart (frame 5)
      this.game.time.events.add(3000, () => {
        this.mulleHead.animations.play('idle')
        this.mulleBody.animations.play('still')
      }, this)

      this.game.time.events.add(5000, () => {
        this.mulleHead.animations.play('point')
      }, this)
    })

    // Cursor handling
    this.setupCursors()
  }

  handleLogin () {
    const name = this.nameInput.value.trim()
    if (!name) return

    if (this.game.mulle.UsersDB[name]) {
      this.game.mulle.user = this.game.mulle.UsersDB[name]
    } else {
      const save = new (require('../struct/savedata'))(this.game)
      save.UserId = name
      this.game.mulle.UsersDB[name] = save
      this.game.mulle.saveData()
      this.game.mulle.user = save
    }

    this.game.mulle.activeCutscene = '11d001v0'
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