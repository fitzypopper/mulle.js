import MulleState from './base'
import MulleSprite from '../objects/sprite'
import DirectorHelper from '../objects/DirectorHelper'

class JunkState extends MulleState {
  preload () {
    this.game.load.pack('junk', 'assets/junk.json', null, this)
  }

  create () {
    super.create()
    this.game.mulle.addAudio('junk')

    // Background: 02.DXR member 1 = 02b001v1 (640x480)
    const background = new MulleSprite(this.game, 320, 240)
    background.setDirectorMember('02.DXR', 1)
    this.game.add.existing(background)

    // Border frame
    const border = this.game.add.graphics(0, 0)
    border.lineStyle(4, 0x888888, 1)
    border.moveTo(0, 0)
    border.lineTo(640, 0)
    border.lineTo(640, 480)
    border.lineTo(0, 480)
    border.lineTo(0, 0)

    // Junk pile doors: members 2-7 (02b002v0-02b007v0, 26x61)
    // Position them roughly where the shelves were in garage
    // In original, these are the "doors" to each shelf area
    this.shelfDoors = []
    const shelfPositions = [
      { x: 150, y: 100, shelf: 'Shelf1' },
      { x: 230, y: 95, shelf: 'Shelf2' },
      { x: 320, y: 90, shelf: 'Shelf3' },
      { x: 410, y: 88, shelf: 'Shelf4' },
      { x: 500, y: 85, shelf: 'Shelf5' },
      { x: 590, y: 82, shelf: 'Shelf6' },
    ]

    shelfPositions.forEach((pos, i) => {
      const door = new MulleSprite(this.game, pos.x, pos.y)
      door.setDirectorMember('02.DXR', i + 2) // members 2-7
      door.inputEnabled = true
      door.events.onInputUp.add(() => this.enterShelf(pos.shelf), this)
      door.events.onInputOver.add(() => this.game.canvas.style.cursor = 'pointer', this)
      door.events.onInputOut.add(() => this.game.canvas.style.cursor = 'default', this)
      this.game.add.existing(door)
      this.shelfDoors.push(door)
    })

    // Exit to yard (04.DXR) - right side
    const yardExit = this.game.add.graphics(600, 0)
    yardExit.beginFill(0x0000ff, 0)
    yardExit.drawRect(0, 0, 40, 480)
    yardExit.endFill()
    yardExit.inputEnabled = true
    yardExit.events.onInputUp.add(() => this.game.state.start('yard'), this)

    // Exit to garage (03.DXR) - left side
    const garageExit = this.game.add.graphics(0, 0)
    garageExit.beginFill(0xff0000, 0)
    garageExit.drawRect(0, 0, 40, 480)
    garageExit.endFill()
    garageExit.inputEnabled = true
    garageExit.events.onInputUp.add(() => this.game.state.start('garage'), this)

    // Handle enterShelf from garage
    this.currentShelf = this.game.mulle.user.enterShelf || 'Shelf1'
    this.game.mulle.user.enterShelf = null

    // Init part sprites array
    this.partSprites = []

    // Show parts on current shelf (placeholder)
    this.showShelfParts(this.currentShelf)

    // Subtitle for PartData (member 25)
    this.game.mulle.subtitle.setLines('PartData', 'swedish', [
      '- Välj ett hyllfack för att se delarna.',
    ], 'mulle')
    this.game.mulle.subtitle.setLines('PartData', 'english', [
      '- Select a shelf compartment to see parts.',
    ], 'mulle')

    // Play ambient sound
    this.game.mulle.playAudio('02d002v0')
  }

  enterShelf (shelf) {
    this.currentShelf = shelf
    this.showShelfParts(shelf)
  }

  showShelfParts (shelf) {
    // Clear existing part sprites
    if (this.partSprites) {
      this.partSprites.forEach(s => s.destroy())
    }
    this.partSprites = []

    // In the original, this draws parts from the user's junk pile for this shelf
    // For now show placeholder text
    const text = this.game.add.text(320, 400, `Hylla: ${shelf}`, {
      font: '24px serif',
      fill: '#fff',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 16, y: 8 }
    })
    text.anchor.set(0.5)
    this.partSprites.push(text)

    // Play shelf sound
    this.game.mulle.playAudio('02e003v0')
  }

  shutdown () {
    if (this.shelfDoors) {
      this.shelfDoors.forEach(d => d.destroy())
      this.shelfDoors = []
    }
    if (this.partSprites) {
      this.partSprites.forEach(s => s.destroy())
      this.partSprites = []
    }
    this.game.sound.stopAll()
  }
}

export default JunkState