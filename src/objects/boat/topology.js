/**
 * Topography sampler for the DepthChecker.
 *
 * The original keeps the topology of every map as an ASCII string in the
 * cast members `30tXXXv0` + `30tXXXv0-2` and reads single characters back
 * with `char N of str`. Here the same bytes are read out of the topography
 * sprite sheet once per map change instead of shipping ~6.7 MB of text.
 *
 * @module objects/boat/topology
 */
'use strict'

const TOPO_WIDTH = 316
const TOPO_HEIGHT = 198
const ATLAS_KEYS = ['topography-0', 'topography-1']

const cache = {}

/**
 * Locate a topography frame in the loaded atlas sheets.
 *
 * @param  {MulleGame} game  Main game
 * @param  {string}    name  Member name, ie "30t029v0"
 * @return {Object|null}     { image, x, y } or null
 */
function findFrame (game, name) {
  for (let i = 0; i < ATLAS_KEYS.length; i++) {
    const key = ATLAS_KEYS[i]
    if (!game.cache.checkImageKey(key)) continue

    const img = game.cache.getImage(key, true)
    if (!img || !img.frameData) continue

    const frames = img.frameData.getFrames()
    for (const f in frames) {
      if (frames[f].name === name) {
        return { image: img.data, x: frames[f].x, y: frames[f].y }
      }
    }
  }
  return null
}

/**
 * Read a topology frame into a byte buffer.
 *
 * Indexing matches the original string: `char (H + ((V - 1) * 316))` of the
 * 316x198 character grid, so the returned buffer is already row major from
 * (0,0).
 *
 * @param  {MulleGame} game  Main game
 * @param  {string}    name  Member name
 * @return {Uint8Array}      316 * 198 bytes, r channel of the pixels
 */
export function readTopology (game, name) {
  if (cache[name]) return cache[name]

  const frame = findFrame(game, name)
  if (!frame) {
    console.warn('[topology] frame not found', name)
    return null
  }

  const canvas = document.createElement('canvas')
  canvas.width = TOPO_WIDTH
  canvas.height = TOPO_HEIGHT
  const ctx = canvas.getContext('2d', { willReadFrequently: true })

  ctx.clearRect(0, 0, TOPO_WIDTH, TOPO_HEIGHT)
  ctx.drawImage(frame.image, frame.x, frame.y, TOPO_WIDTH, TOPO_HEIGHT, 0, 0, TOPO_WIDTH, TOPO_HEIGHT)

  const pixels = ctx.getImageData(0, 0, TOPO_WIDTH, TOPO_HEIGHT).data
  const out = new Uint8Array(TOPO_WIDTH * TOPO_HEIGHT)

  for (let i = 0, j = 0; i < out.length; i++, j += 4) {
    out[i] = pixels[j]
  }

  cache[name] = out
  return out
}

export const TOPO_SIZE = { width: TOPO_WIDTH, height: TOPO_HEIGHT }
