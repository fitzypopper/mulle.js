'use strict'

import { pileKind } from './junkview'

/**
 * Lingo properties are case insensitive, but the extracted part data keeps the
 * original cast member names (`Offset`, `Master`, `JunkView`) while older
 * callers expect camelCase. Look the key up case insensitively.
 *
 * @param  {Object} data Raw part entry
 * @param  {...string} names Candidate key spellings
 * @return {*}           First match, or undefined
 */
function pick (data, ...names) {
  for (const n of names) {
    if (data[n] !== undefined) return data[n]
  }

  const wanted = names.map((n) => n.toLowerCase())

  for (const key in data) {
    if (wanted.indexOf(key.toLowerCase()) >= 0) return data[key]
  }

  return undefined
}

class MullePartData {
  constructor (game, partId, partData) {
    this.game = game

    this.partId = parseInt(partId)

    this.data = partData // game.mulle.PartsDB[ partId ];

    this.junkView = pick(this.data, 'junkView', 'JunkView')
    this.shelfView = pick(this.data, 'shelfView', 'ShelfView') || ''
    this.UseView = pick(this.data, 'UseView')
    this.UseView2 = pick(this.data, 'UseView2')

    // per-pile drop sounds: { Shelf, Quay, Yard }
    this.sndDropOn = pick(this.data, 'sndDropOn', 'SndDropOn') || null

    this.description = pick(this.data, 'description', 'Description') || ''

    this.Requires = pick(this.data, 'Requires')
    this.Covers = pick(this.data, 'Covers')

    const master = pick(this.data, 'master', 'Master')
    if (master) {
      this.master = master
      // this.master = new MulleCarpart( this._master );
    } else {
      this.master = false
    }

    this.MorphsTo = pick(this.data, 'MorphsTo') || false

    this.new = []
    if (this.data.new) {
      for (var i = 0; i < this.data.new.length; i++) {
        var e = this.data.new[i]
        this.new.push({
          id: e[0],
          fg: e[1][0],
          bg: e[1][1],
          offset: new Phaser.Point(e[2][0], e[2][1])
        })
      }
    }

    // car offset
    const offset = pick(this.data, 'offset', 'Offset') || [0, 0]
    this.offset = new Phaser.Point(offset[0], offset[1])

    // lowercase properties, thanks lingo
    this.properties = {}

    if (this.data.Properties && !Array.isArray(this.data.Properties)) {
      for (var n in this.data.Properties) {
        this.properties[ n.toLowerCase() ] = this.data.Properties[n]
      }
    }
  }

  /**
   * Junk scene view (original Part.getJunkView): own view, or the
   * master's when this part carries none.
   *
   * @return {string} Cast member name
   */
  getJunkView () {
    if (this.junkView) return this.junkView

    if (this.master) {
      const mp = this.game.mulle.getPart(this.master)
      if (mp && mp !== this) {
        const v = mp.getJunkView()
        if (v) return v
      }
    }

    return ''
  }

  /**
   * Shelf scene view (original Part.getShelfView): own view, or the
   * master's when this part carries none.
   *
   * @return {string} Cast member name
   */
  getShelfView () {
    if (this.shelfView) return this.shelfView

    if (this.master) {
      const mp = this.game.mulle.getPart(this.master)
      if (mp && mp !== this) {
        const v = mp.getShelfView()
        if (v) return v
      }
    }

    return this.junkView || ''
  }

  /**
   * Drop sound for a pile (original Part.getSndDropOn): Shelf1..6 use
   * the #Shelf entry, unknown/empty entries fall back via master.
   *
   * @param  {string} where Pile name
   * @return {string}       Cast member name, '' when unknown
   */
  getSndDropOn (where) {
    let snd = this.sndDropOn ? (this.sndDropOn[ pileKind(where) ] || '') : ''

    if (!snd && this.master) {
      const mp = this.game.mulle.getPart(this.master)
      if (mp && mp !== this) return mp.getSndDropOn(where)
    }

    return snd
  }

  getProperty (name, defVal = null) {
    /*
    if (!this.data) return false

    // quick lookup
    if (this.data.Properties[name]) return this.data.Properties[name]

    // case insensitive lookup
    for (var n in this.data.Properties) {
      if (name.toLocaleString() === n.toLowerCase()) {
        return this.data.Properties[n]
      }
    }
    */

    name = name.toLowerCase()

    if (this.properties[ name ]) return this.properties[ name ]

    // traverse
    if (this.MorphsTo) {
      for (var i in this.MorphsTo) {
        var m = this.game.mulle.getPart(this.MorphsTo[i])

        if (!m) {
          console.error('invalid part', this.MorphsTo[i])
          continue
        }

        if (m.getProperty(name, defVal)) return m.getProperty(name, defVal)
      }
    }

    return defVal
  }
}

export default MullePartData
