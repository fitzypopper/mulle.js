/**
 * Headless boot smoke test for the boat game build.
 *
 * Loads dist/ in a real Chromium (Brave), captures console output and page
 * errors, reports the Phaser state machine and saves a screenshot.
 *
 * Usage:
 *   cd dist && python3 -m http.server 8777 &
 *   node scripts/smoke_test.js [url] [screenshot]
 */
const puppeteer = require('puppeteer-core')

const URL = process.argv[2] || 'http://127.0.0.1:8777/index.html'
const SHOT = process.argv[3] || '/tmp/opencode/mullebat-boot.png'
const EXECUTABLE = process.env.BRAVE_PATH || '/usr/bin/brave'

;(async () => {
  const browser = await puppeteer.launch({
    executablePath: EXECUTABLE,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--use-gl=swiftshader',
      '--mute-audio'
    ]
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 720, height: 560 })

  const logs = []
  const errors = []
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`))
  page.on('pageerror', err => errors.push(`[pageerror] ${err.message}`))
  page.on('requestfailed', req =>
    errors.push(`[requestfailed] ${req.url()} ${req.failure() ? req.failure().errorText : ''}`))
  page.on('response', res => {
    if (res.status() >= 400) errors.push(`[http ${res.status()}] ${res.url()}`)
  })

  try {
    await page.goto(URL, { waitUntil: 'load', timeout: 30000 })
  } catch (e) {
    console.log('GOTO FAILED:', e.message)
  }

  // let boot -> load -> menu play out
  await new Promise(r => setTimeout(r, Number(process.env.SMOKE_WAIT || 8000)))

  const info = await page.evaluate(() => {
    const g = window.game
    if (!g) return { game: false }
    return {
      game: true,
      state: g.state ? g.state.current : null,
      states: g.state && g.state.states ? Object.keys(g.state.states) : [],
      loadProgress: g.load ? Math.round(g.load.progress) : null,
      audioKeys: g.mulle ? Object.keys(g.mulle.audio || {}) : [],
      cachePacks: Object.keys(g.cache || {}).length,
      imagesCached: g.cache ? g.cache.getKeys(Phaser.Cache.IMAGE).length : 0,
      jsonCached: g.cache ? g.cache.getKeys(Phaser.Cache.JSON).length : 0,
      users: g.mulle && g.mulle.UsersDB ? Object.keys(g.mulle.UsersDB) : [],
      inputEl: !!document.querySelector('#player input')
    }
  })

  await page.screenshot({ path: SHOT })

  console.log('=== PAGE STATE ===')
  console.log(JSON.stringify(info, null, 2))
  console.log('\n=== ERRORS (' + errors.length + ') ===')
  console.log(errors.slice(0, 40).join('\n') || '(none)')
  console.log('\n=== CONSOLE (last 40 of ' + logs.length + ') ===')
  console.log(logs.slice(-40).join('\n'))
  console.log('\nscreenshot: ' + SHOT)

  await browser.close()
})().catch(e => {
  console.error('SMOKE TEST FAILED:', e)
  process.exit(1)
})
