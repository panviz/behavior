import process from 'process'
import puppeteer from 'puppeteer'

; (async () => { // eslint-disable-line
  const browser = await puppeteer.launch({
    // headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox '],
  })

  const page = await browser.newPage()
  page.setViewport({ width: 1280, height: 1080 })
  await page.goto('http://localhost:8006/test')

  page.on('console', (msg) => {
    if (msg.type() === 'log') console.log(msg.text()) // eslint-disable-line
    if (msg.text().startsWith('Executed')) browser.close()
    else process.exit(1)
  })
})()
