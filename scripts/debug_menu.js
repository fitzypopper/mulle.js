/**
 * One-off debug: dump the menu scene's world children and full error stacks.
 * Usage: node scripts/debug_menu.js [url]
 */
const puppeteer = require('puppeteer-core')

const URL = process.argv[2] || 'http://127.0.0.1:8777/index.html'
const EXECUTABLE = process.env.BRAVE_PATH || '/usr/bin/brave'

;(async () => {
  const browser = await puppeteer.launch({
    executablePath: EXECUTABLE,
    headless: !process.env.HEADED,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--use-gl=swiftshader', '--mute-audio']
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 720, height: 560 })
  await page.evaluateOnNewDocument(() => {
    window.__errs = []
    window.addEventListener('error', e => {
      window.__errs.push((e.error && e.error.stack) || e.message)
    })
    const origError = console.error
    console.error = function (...a) {
      window.__errs.push('console.error: ' + a.map(String).join(' ') + '\n' + (new Error().stack || ''))
      return origError.apply(this, a)
    }
  })

  const errors = []
  page.on('pageerror', err => errors.push('[pageerror] ' + (err.stack || err.message)))
  page.on('console', msg => { if (msg.type() === 'error') errors.push('[console.error] ' + msg.text()) })

  await page.goto(URL, { waitUntil: 'load', timeout: 30000 })
  await new Promise(r => setTimeout(r, Number(process.env.SMOKE_WAIT || 8000)))

  const info = await page.evaluate(() => {
    const g = window.game
    if (!g) return { game: false }
    const children = (g.world.children || []).map(c => ({
      type: c.constructor.name,
      key: c.key !== undefined ? c.key : null,
      frame: c.frameName !== undefined ? c.frameName : (c.frame !== undefined ? c.frame : null),
      x: Math.round(c.x), y: Math.round(c.y),
      visible: c.visible,
      w: c.width, h: c.height
    }))
    // is the mulle illustration frame reachable?
    let lookup = null
    try {
      const keys = g.cache.getKeys(Phaser.Cache.IMAGE)
      const found = []
      for (const k of keys) {
        const img = g.cache.getImage(k, true)
        if (!img || !img.frameData) continue
        for (const f of img.frameData.getFrames()) {
          if (f.dirFile === '10.DXR' && f.dirNum >= 18) found.push({ key: k, name: f.name, dirNum: f.dirNum, reg: f.regpoint })
        }
      }
      lookup = found
    } catch (e) { lookup = String(e) }
    // deep-inspect the mulle illustration sprite
    let mulle = null
    let pixels = null
    try {
      const c = (g.world.children || [])[1]
      if (c) {
        mulle = {
          frameName: c.frameName,
          key: c.key,
          alpha: c.alpha,
          renderable: c.renderable,
          visible: c.visible,
          exists: c.exists,
          worldX: c.world.x, worldY: c.world.y,
          pivot: { x: c.pivot.x, y: c.pivot.y },
          textureFrame: c._frame ? { x: c._frame.x, y: c._frame.y, w: c._frame.width, h: c._frame.height } : null
        }
      }
      // sample pixels from the canvas (Canvas renderer)
      const ctx = g.canvas.getContext('2d')
      const pts = [[320, 240], [320, 300], [200, 240], [450, 240], [100, 100],
                   [140, 130], [480, 350], [300, 150], [250, 340]]
      pixels = pts.map(([x, y]) => {
        const d = ctx.getImageData(x, y, 1, 1).data
        return { x, y, rgba: [d[0], d[1], d[2], d[3]] }
      })
      const c2 = (g.world.children || [])[1]
      const c1 = (g.world.children || [])[0]
      if (c2 && c2.texture) {
        mulle.texture = {
          hasLoaded: c2.texture.hasLoaded,
          baseLoaded: c2.texture.baseTexture ? c2.texture.baseTexture.hasLoaded : null,
          imgW: c2.texture.baseTexture && c2.texture.baseTexture.image ? c2.texture.baseTexture.image.width : null,
          imgH: c2.texture.baseTexture && c2.texture.baseTexture.image ? c2.texture.baseTexture.image.height : null,
          inCamera: c2.inCamera,
          crop: c2.cropEnabled,
          sameTextureAsPrev: c2.texture === c1.texture,
          texFrame: c2.texture._frame ? { x: c2.texture._frame.x, y: c2.texture._frame.y, w: c2.texture._frame.width, h: c2.texture._frame.height } : String(c2.texture._frame),
          texFrameName: c2.texture._frame ? c2.texture._frame.name : null,
          curFrameName: c2._frame ? c2._frame.name : null,
          prevTexFrame: c1.texture._frame ? { x: c1.texture._frame.x, y: c1.texture._frame.y, w: c1.texture._frame.width, h: c1.texture._frame.height } : null,
          prevTexFrameName: c1.texture._frame ? c1.texture._frame.name : null,
          prevFrameName: c1._frame ? c1._frame.name : null
        }
      }
    } catch (e) { mulle = String(e) }
    return {
      state: g.state.current,
      children,
      mulle,
      pixels,
      tenDXRFrames: lookup,
      camera: { w: g.camera.width, h: g.camera.height, x: g.camera.x, y: g.camera.y },
      renderer: g.renderType,
      canvas: { w: g.canvas.width, h: g.canvas.height }
    }
  })

  await page.screenshot({ path: '/tmp/opencode/mullebat-debug.png' })
  const pageErrs = await page.evaluate(() => window.__errs || [])

  // tint the illustration red and re-shoot: if nothing changes, it is not being painted
  await page.evaluate(() => {
    const g = window.game
    const c = (g.world.children || [])[1]
    if (c) { c.tint = 0xff0000; c.y = c.y + 0 }
  })
  await new Promise(r => setTimeout(r, 500))
  await page.screenshot({ path: '/tmp/opencode/mullebat-debug-tint.png' })

  // hide the background sprite: whatever remains is painted by child[1] alone
  const texInfo = await page.evaluate(() => {
    const g = window.game
    const kids = g.world.children || []
    if (kids[0]) kids[0].visible = false
    if (kids[1]) kids[1].tint = 0xffffff
    const t = kids[1] && kids[1].texture
    const info = { keys: t ? Object.keys(t) : null }
    if (t) {
      info.frame = t.frame ? { x: t.frame.x, y: t.frame.y, w: t.frame.width, h: t.frame.height, name: t.frame.name } : String(t.frame)
      info._frame = t._frame ? { x: t._frame.x, y: t._frame.y, w: t._frame.width, h: t._frame.height } : String(t._frame)
      info.baseKeys = t.baseTexture ? Object.keys(t.baseTexture) : null
      const img = t.baseTexture && (t.baseTexture.image || t.baseTexture.source)
      info.img = img ? { tag: img.tagName, w: img.width, h: img.height, src: (img.src || '').split('/').pop() } : String(img)
      info.crop = t.crop ? { x: t.crop.x, y: t.crop.y, w: t.crop.width, h: t.crop.height } : String(t.crop)
      info.width = t.width; info.height = t.height
    }
    // PIXI texture caches for this atlas
    if (window.PIXI && PIXI.TextureCache) {
      info.pixiCacheKeys = Object.keys(PIXI.TextureCache).filter(k => k.indexOf('menu') !== -1)
    }
    return info
  })
  await new Promise(r => setTimeout(r, 500))
  await page.screenshot({ path: '/tmp/opencode/mullebat-only.png' })

  // decisive: destroy background, move the illustration to a new spot
  await page.evaluate(() => {
    const g = window.game
    const kids = (g.world.children || []).slice()
    const cub = kids[1]
    if (kids[0]) kids[0].destroy()
    if (cub) {
      cub.tint = 0xffffff
      cub.x = 200
      cub.y = 160
      window.__cubAfter = {
        visible: cub.visible,
        frame: cub.frameName,
        x: cub.x, y: cub.y,
        inWorld: !!cub.parent,
        worldChildren: (g.world.children || []).length
      }
    }
  })
  await new Promise(r => setTimeout(r, 700))
  await page.screenshot({ path: '/tmp/opencode/mullebat-decisive.png' })
  const cubAfter = await page.evaluate(() => window.__cubAfter)

  // deep evidence: all canvases, and the real pixels of the baseTexture image
  const evidence = await page.evaluate(() => {
    const out = { canvases: [], img: null }
    document.querySelectorAll('canvas').forEach(c => {
      out.canvases.push({
        w: c.width, h: c.height,
        cssW: c.style.width || getComputedStyle(c).width,
        id: c.id, cls: c.className,
        parent: c.parentElement ? (c.parentElement.id || c.parentElement.className) : null,
        offsetVisible: c.offsetParent !== null
      })
    })
    const g = window.game
    const kid = (g.world.children || [])[0]
    const img = kid && kid.texture && kid.texture.baseTexture.source
    if (img) {
      const cv = document.createElement('canvas')
      cv.width = img.width; cv.height = img.height
      const cx = cv.getContext('2d')
      cx.drawImage(img, 0, 0)
      const pts = {
        cubCenter_192_127: [192, 127],
        bannerRegion_162_368: [162, 368],
        topleft_10_10: [10, 10],
        bannerStrip_160_300: [160, 300]
      }
      const samples = {}
      for (const k in pts) {
        const d = cx.getImageData(pts[k][0], pts[k][1], 1, 1).data
        samples[k] = [d[0], d[1], d[2], d[3]]
      }
      out.img = { src: img.src, w: img.width, h: img.height, samples }
    }
    out.gameCanvasIsInDoc = !!(g.canvas && g.canvas.parentElement)
    out.gameCanvasRect = g.canvas ? JSON.parse(JSON.stringify(g.canvas.getBoundingClientRect())) : null
    out.gameInstances = window.game ? 1 : 0
    return out
  })

  console.log(JSON.stringify(info, null, 2))
  // --- liveness probe: does the Phaser loop keep running? ---
  const probe = await page.evaluate(() => {
    const g = window.game
    const c = (g.world.children || [])[1]
    return {
      frame1: g.loop ? g.loop.frame : null,
      paused: g.paused,
      hidden: document.hidden,
      vis: document.visibilityState,
      valid: c && c.texture ? c.texture.valid : null,
      noFrame: c && c.texture ? c.texture.noFrame : null,
      worldVisible: c ? c.worldVisible : null,
      tint: c ? c.tint : null
    }
  })
  await new Promise(r => setTimeout(r, 700))
  const probe2 = await page.evaluate(() => {
    const g = window.game
    return { frame2: g.loop ? g.loop.frame : null }
  })
  console.log('\n=== PROBE ===')
  console.log(JSON.stringify({ ...probe, ...probe2 }, null, 2))

  console.log('\n=== TEXTURE INFO ===')
  console.log(JSON.stringify(texInfo, null, 2))
  console.log('\n=== CUB AFTER DECISIVE ===')
  console.log(JSON.stringify(cubAfter, null, 2))
  console.log('\n=== EVIDENCE ===')
  console.log(JSON.stringify(evidence, null, 2))
  console.log('\n=== PAGE-CAPTURED ERRORS (' + pageErrs.length + ') ===')
  console.log(pageErrs.join('\n---\n') || '(none)')
  console.log('\n=== ERRORS (' + errors.length + ') ===')
  console.log(errors.join('\n---\n') || '(none)')

  await browser.close()
})().catch(e => { console.error('FAILED:', e); process.exit(1) })
