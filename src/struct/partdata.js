'use strict'

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
    this.UseView = pick(this.data, 'UseView')
    this.UseView2 = pick(this.data, 'UseView2')

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
