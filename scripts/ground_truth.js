/**
 * Ground truth: canvas context state, world transforms, and a scratch render
 * of the exact drawImage the renderer performs.
 * Usage: HEADED=1 node scripts/ground_truth.js
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
  await page.goto(URL, { waitUntil: 'load', timeout: 30000 })
  await new Promise(r => setTimeout(r, Number(process.env.SMOKE_WAIT || 8000)))

  const truth = await page.evaluate(() => {
    const g = window.game
    const ctx = g.canvas.getContext('2d')
    const kids = g.world.children || []
    const k0 = kids[0], k1 = kids[1]

    const sample = (c, x, y) => { const d = c.getImageData(x, y, 1, 1).data; return [d[0], d[1], d[2], d[3]] }

    const out = {
      ctxState: {
        globalAlpha: ctx.globalAlpha,
        composite: ctx.globalCompositeOperation,
        transform: ctx.getTransform ? JSON.parse(JSON.stringify(ctx.getTransform())) : null
      },
      kids: kids.map(k => ({
        frame: k._frame ? k._frame.name : null,
        key: k.key,
        x: k.x, y: k.y,
        alpha: k.alpha,
        worldAlpha: k.worldAlpha,
        blendMode: k.blendMode,
        visible: k.visible,
        renderable: k.renderable,
        anchor: { x: k.anchor.x, y: k.anchor.y },
        pivot: { x: k.pivot.x, y: k.pivot.y },
        wt: { tx: k.worldTransform.tx, ty: k.worldTransform.ty, a: k.worldTransform.a, d: k.worldTransform.d },
        crop: [k.texture.crop.x, k.texture.crop.y, k.texture.crop.width, k.texture.crop.height],
        trim: k.texture.trim,
        rotated: k.texture.rotated,
        tint: k.tint,
        cachedTint: k.cachedTint
      })),
      canvasSamples: {}
    }

    // where the renderer should paint child1's crop:
    const c1 = out.kids[1]
    const expected = { x: Math.round(c1.wt.tx), y: Math.round(c1.wt.ty), w: c1.crop[2], h: c1.crop[3] }
    out.expectedChild1Rect = expected
    out.canvasSamples = {
      child1TopLeft_plus5: sample(ctx, expected.x + 5, expected.y + 5),
      child1Center: sample(ctx, expected.x + expected.w / 2, expected.y + expected.h / 2),
      child1BottomRight_minus5: sample(ctx, expected.x + expected.w - 5, expected.y + expected.h - 5),
      child1Quarter: sample(ctx, expected.x + 90, expected.y + 60)
    }

    // scratch render: exactly what _renderCanvas should do
    const img = k1.texture.baseTexture.source
    const sc = document.createElement('canvas')
    sc.width = img.width; sc.height = img.height
    const scx = sc.getContext('2d')
    scx.drawImage(img, k1.texture.crop.x, k1.texture.crop.y, k1.texture.crop.width, k1.texture.crop.height, 0, 0, k1.texture.crop.width, k1.texture.crop.height)
    out.scratchSamples = {
      center: sample(scx, k1.texture.crop.width / 2, k1.texture.crop.height / 2),
      topLeft5: sample(scx, 5, 5),
      quarter: sample(scx, 90, 60)
    }
    // is scratch content cub-like (light) or banner-like?
    let lightCount = 0
    for (let i = 0; i < 40; i++) {
      const d = scx.getImageData((i * 9) % 381, (i * 6) % 251, 1, 1).data
      if (d[0] + d[1] + d[2] > 400) lightCount++
    }
    out.scratchLightCount = lightCount + '/40'

    return out
  })

  console.log(JSON.stringify(truth, null, 2))

  await page.screenshot({ path: '/tmp/opencode/mullebat-ground.png' })
  await browser.close()
})().catch(e => { console.error('FAILED:', e); process.exit(1) })
