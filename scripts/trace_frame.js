/**
 * Runtime tracer: hooks Phaser.Sprite.setFrame / loadTexture and samples
 * world.children[1].texture.crop every 50ms to see if/who flips the frame.
 * Usage: HEADED=1 node scripts/trace_frame.js
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
    window.__setFrame = []
    window.__loadTexture = []
    window.__cropLog = []
    window.__frameSnap = []

    const install = () => {
      if (!window.Phaser) { setTimeout(install, 10); return }

      const origSetFrame = Phaser.Sprite.prototype.setFrame
      Phaser.Sprite.prototype.setFrame = function (t) {
        if (window.__setFrame.length < 60) {
          window.__setFrame.push({
            arg: t ? { name: t.name, x: t.x, y: t.y, w: t.width, h: t.height } : String(t),
            prev: this._frame ? this._frame.name : null,
            key: this.key,
            anchor: { x: this.anchor.x, y: this.anchor.y },
            pivot: { x: this.pivot.x, y: this.pivot.y },
            at: performance.now() | 0
          })
        }
        return origSetFrame.call(this, t)
      }

      const origLoad = Phaser.Sprite.prototype.loadTexture
      Phaser.Sprite.prototype.loadTexture = function (k, f, i) {
        if (window.__loadTexture.length < 60) {
          window.__loadTexture.push({ key: k, frame: f, at: performance.now() | 0 })
        }
        return origLoad.call(this, k, f, i)
      }

      // periodic crop + transform sampling of the LAST world child
      setInterval(() => {
        const g = window.game
        if (!g || !g.world || !g.world.children) return
        const kids = g.world.children
        const c = kids[kids.length - 1]
        if (!c || !c.texture) return
        const cr = c.texture.crop
        window.__cropLog.push({
          n: kids.length,
          crop: [cr.x, cr.y, cr.width, cr.height],
          frameName: c._frame ? c._frame.name : null,
          x: c.x, y: c.y,
          at: performance.now() | 0
        })
        if (window.__cropLog.length > 120) window.__cropLog.shift()
      }, 50)
    }
    install()
  })

  await page.goto(URL, { waitUntil: 'load', timeout: 30000 })
  await new Promise(r => setTimeout(r, Number(process.env.SMOKE_WAIT || 8000)))

  const trace = await page.evaluate(() => ({
    setFrame: window.__setFrame,
    loadTexture: window.__loadTexture,
    cropLog: window.__cropLog
  }))

  console.log('=== loadTexture calls ===')
  console.log(JSON.stringify(trace.loadTexture, null, 1))
  console.log('=== setFrame calls ===')
  console.log(JSON.stringify(trace.setFrame, null, 1))
  console.log('=== crop samples (last 12) ===')
  console.log(JSON.stringify(trace.cropLog.slice(-12), null, 1))
  const uniqCrops = [...new Set(trace.cropLog.map(c => JSON.stringify(c.crop)))]
  console.log('unique crops:', uniqCrops)

  await browser.close()
})().catch(e => { console.error('FAILED:', e); process.exit(1) })
