import MulleCar from './cardata'
import { FLOORS, MAX, MAX_SOUNDS, PILES, pileKind } from './junkview'

/**
 * Fresh-save junk store - verbatim port of the original member
 * "InitialJunkDB" (cst_out_new/CDDATA.CXT/Standalone/2.txt).
 *
 * The positions are the sprite locH/locV the original ships with; they
 * sit exactly on the shelf boards (the four parts half a pixel above a
 * board settle that last 0.5px on the first frames, just like in the
 * original).
 *
 * @return {Object} pile name -> { partId: Phaser.Point }
 */
function initialJunk () {
  return {
    Shelf1: {
      109: new Phaser.Point(557, 167),
      101: new Phaser.Point(402, 394),
      3: new Phaser.Point(197, 379)
    },
    Shelf2: {
      107: new Phaser.Point(504, 277),
      124: new Phaser.Point(467, 63),
      25: new Phaser.Point(425, 391)
    },
    Shelf3: {
      99: new Phaser.Point(216, 66),
      26: new Phaser.Point(279, 188),
      697: new Phaser.Point(434, 301)
    },
    Shelf4: {
      78: new Phaser.Point(314, 83),
      12: new Phaser.Point(566, 72),
      122: new Phaser.Point(446, 183)
    },
    Shelf5: {
      123: new Phaser.Point(393, 285),
      51: new Phaser.Point(175, 287),
      54: new Phaser.Point(404, 166)
    },
    Shelf6: {
      255: new Phaser.Point(195, 175),
      27: new Phaser.Point(347, 176)
    },
    Quay: {},
    Yard: {}
  }
}

class MulleSave {
  constructor (game, data) {
    this.game = game

    if (data) {
      console.debug('[savedata]', 'supplied, apply', data.UserId)

      this.fromJSON(data)
    } else {
      console.debug('[savedata]', 'not found, set defaults')

      this.setDefaults()
    }

    this.calculateParts()
  }

  setDefaults () {
    this.UserId = ''

    this.Car = new MulleCar(this.game)

    // default junk locations (original InitialJunkDB)
    this.Junk = initialJunk()

    this.NrOfBuiltCars = 0
    this.Saves = []
    this.CompletedMissions = []
    this.OwnStuff = []
    this.myLastPile = 1
    this.gifts = []
    this.toYardThroughDoor = true
    this.givenMissions = []
    this.figgeIsComing = false
    this.missionIsComing = false
    this.savedCars = []

    this.language = this.game.mulle.defaultLanguage // 'swedish'
  }

  addStuff (name) {
    if (this.hasStuff(name)) return false

    this.OwnStuff.push(name)

    this.save()

    return true
  }

  removeStuff (name) {
    if (!this.hasStuff(name)) return false

    var i = this.OwnStuff.indexOf(name)

    this.OwnStuff.splice(i, 1)

    this.save()

    return true
  }

  hasStuff (name) {
    return this.OwnStuff.indexOf(name) !== -1
  }

  hasPart (partId) {
    // junk piles
    for (var junkKey in this.Junk) {
      if (Object.keys(this.Junk[junkKey]).indexOf(partId) !== -1 || Object.keys(this.Junk[junkKey]).indexOf(partId.toString()) !== -1) return true
    }

    // regular car parts
    if (this.Car.Parts.indexOf(partId) !== -1 || this.Car.Parts.indexOf(partId.toString()) !== -1) return true

    // morphed car parts
    for (var i of this.Car.Parts) {
      var p = this.game.mulle.PartsDB[ i ]
      if (p.master && partId === p.master) return true
    }

    return false
  }

  /**
   * Put a part in a junk pile (original User.addJunkPart).
   *
   * @param {string}       pile   Pile name (Shelf1..6 / Quay / Yard)
   * @param {number}       partId Part ID
   * @param {Phaser.Point} pos    Drop position; random on a floor line when missing
   * @param {Boolean}      noSave Don't save user data
   * @return {boolean}             false when the part is already there or the pile is full
   */
  addPart (pile, partId, pos, noSave = false) {
    if (!this.Junk || !this.Junk[pile]) return false
    if (this.Junk[pile][partId] !== undefined) return false

    const kind = pileKind(pile)
    const max = MAX[kind]

    if (max !== undefined && Object.keys(this.Junk[pile]).length >= max) {
      // original: makeMulleTalk(gDir, getMaxSound(junkViewHandler, pile))
      const sounds = MAX_SOUNDS[kind]
      if (sounds) this.game.mulle.playAudio(this.game.rnd.pick(sounds))
      return false
    }

    if (!pos) pos = this.getRandomPosition(pile, partId)

    this.Junk[pile][partId] = pos

    if (!noSave) this.save()

    return true
  }

  /**
   * Remove a part from a pile (original User.removeJunkPart; the
   * original's master-id rewrite is unneeded - the port always stores
   * and reads the same id).
   *
   * @param {string} pile   Pile name
   * @param {number} partId Part ID
   * @return {void}
   */
  removePart (pile, partId) {
    if (!this.Junk || !this.Junk[pile]) return
    delete this.Junk[pile][partId]
  }

  /**
   * Add a brand new part to the Yard pile, moving one Yard part to a
   * random shelf to make room when it is full (original User.addNewPart).
   *
   * @param  {number} partId Part ID
   * @return {boolean}       false when the user already has the part or everything is full
   */
  addNewPart (partId) {
    if (this.hasPart(partId)) return false

    let ok = true

    if (Object.keys(this.Junk.Yard).length >= MAX.Yard) {
      const shelf = this.getRandomShelf()

      if (shelf) {
        const removeId = Object.keys(this.Junk.Yard)[0]
        this.removePart('Yard', removeId)
        this.addPart(shelf, removeId, null, true)
      } else {
        ok = false
        // original: makeMulleTalk(gDir, getMaxSound(..., #AllFull))
        this.game.mulle.playAudio(this.game.rnd.pick(MAX_SOUNDS.AllFull))
      }
    }

    if (ok) ok = this.addPart('Yard', partId)

    return ok
  }

  /**
   * Random non-full shelf (original JunkViewHandler.getRandomShelf).
   *
   * @return {string|null} Pile name, null when all six shelves are full
   */
  getRandomShelf () {
    const free = []

    for (let n = 1; n <= 6; n++) {
      const pile = 'Shelf' + n
      if (Object.keys(this.Junk[pile]).length < MAX.Shelf) free.push(pile)
    }

    if (free.length === 0) return null

    return this.game.rnd.pick(free)
  }

  /**
   * Random resting position on a pile's floor line (original
   * JunkViewHandler.getRandomPosition): pick one of the pile's floor
   * lines, then place the picture's centre at line.top - height/2 with
   * its horizontal centre randomised inside the line. Shelf piles use
   * the ShelfView dimensions, Quay/Yard the JunkView.
   *
   * @param  {string} pile   Pile name
   * @param  {number} partId Part ID
   * @return {Phaser.Point}
   */
  getRandomPosition (pile, partId) {
    const kind = pileKind(pile)
    const floors = FLOORS[kind] || FLOORS.Shelf
    const floor = floors[ this.game.rnd.integerInRange(0, floors.length - 1) ]

    const part = this.game.mulle.getPart(partId)
    const view = part ? (kind === 'Shelf' ? part.getShelfView() : part.getJunkView()) : ''
    const img = view ? this.game.mulle.getDirectorImage('CDDATA.CXT', view) : false

    if (!img) return new Phaser.Point(floor[0], floor[1])

    const w = img.frame.width
    const h = img.frame.height

    // original: left + random(right - left - width) + width / 2
    const range = Math.max(1, floor[2] - floor[0] - w)
    const left = floor[0] + this.game.rnd.integerInRange(1, range) + (w / 2)
    const top = floor[1] - (h / 2)

    return new Phaser.Point(left, top)
  }

  /**
   * Normalise the junk store to the original Shelf1-6/Quay/Yard keys.
   *
   * Old port saves carried invented Pile1-6/shopFloor/yard piles (and the
   * default user built in scenes/base.js has no Junk member at all).
   * Nothing ever rendered or mutated those keys, so anything that is not
   * an original-shaped store is replaced wholesale with InitialJunkDB.
   */
  migrateJunk () {
    if (!this.Junk || this.Junk.Shelf1 === undefined) {
      this.Junk = initialJunk()
      return
    }

    for (const pile of PILES) {
      if (!this.Junk[pile]) this.Junk[pile] = {}
    }
  }

  calculateParts () {
    this.availableParts = {}

    var defaultParts = {
      Postal: [],
      JunkMan: [13, 20, 17, 89, 290, 120, 18, 19, 173, 21, 297, 22, 24, 25, 185, 26, 27, 28, 32, 35, 91, 132, 129, 134, 137, 146, 149, 154, 168, 216, 174, 175, 177, 189, 191, 192, 193, 233, 199, 208, 209, 212, 221, 227, 229, 235, 251, 264, 278, 294, 295, 14],
      Destinations: [162, 99, 172, 54, 306, 287, 113, 283, 9],
      Random: [33, 38, 41, 42, 43, 176, 48, 53, 55, 64, 65, 74, 75, 76, 92, 93, 100, 101, 104, 107, 116, 130, 96, 155, 161, 181, 186, 195, 196, 200, 213, 219, 220, 222, 228, 230, 234, 236, 239, 242, 245, 248, 254, 257, 260, 261, 265, 271, 272, 273, 286, 288, 296]
    }

    for (var cat in defaultParts) {
      this.availableParts[cat] = []

      for (var id of defaultParts[cat]) {
        if (!this.hasPart(id)) {
          this.availableParts[cat].push(id)
          // }else{
          // console.warn('already has part', id);
        }
      }
    }

    console.log('availableParts', this.availableParts)
  }

  getRandomPart () {
    this.calculateParts()

    return this.game.rnd.pick(this.availableParts.Random)
  }

  save () {
    console.log('save data', this.UserId)
    window.localStorage.setItem('mulle_SaveData', JSON.stringify(this.game.mulle.UsersDB))
  }

  fromJSON (data) {
    this.UserId = data.UserId

    this.Car = new MulleCar(this.game, data.Car)

    this.Junk = data.Junk
    this.migrateJunk()

    this.NrOfBuiltCars = data.NrOfBuiltCars
    this.Saves = data.Saves
    this.CompletedMissions = data.CompletedMissions
    this.OwnStuff = data.OwnStuff ? data.OwnStuff : []
    this.myLastPile = data.myLastPile
    this.gifts = data.gifts
    this.toYardThroughDoor = data.toYardThroughDoor
    this.givenMissions = data.givenMissions
    this.figgeIsComing = data.figgeIsComing
    this.missionIsComing = data.missionIsComing
    this.savedCars = data.savedCars

    this.language = this.game.mulle.defaultLanguage // data.language ? data.language : this.game.mulle.defaultLanguage
  }

  toJSON () {
    return {
      UserId: this.UserId,
      Car: this.Car,
      Junk: this.Junk,
      NrOfBuiltCars: this.NrOfBuiltCars,
      CompletedMissions: this.CompletedMissions,
      OwnStuff: this.OwnStuff,
      givenMissions: this.givenMissions,
      myLastPile: this.myLastPile,
      savedCars: this.savedCars
    }
  }
}

export default MulleSave
