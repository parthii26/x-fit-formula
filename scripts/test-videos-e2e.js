import { chromium } from 'playwright'
import https from 'https'
import { OPEN_SOURCE_EXERCISE_MEDIA } from '../src/lib/openSourceMedia.js'

const BASE_URL = 'http://localhost:5173'

async function checkUrlOembed(url) {
  return new Promise((resolve) => {
    const oembed = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    https.get(oembed, (res) => {
      let body = ''
      res.on('data', (c) => (body += c))
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(body)
            resolve({ ok: true, status: 200, title: data.title, author: data.author_name })
          } catch {
            resolve({ ok: true, status: 200, title: 'ok' })
          }
        } else {
          resolve({ ok: false, status: res.statusCode })
        }
      })
    }).on('error', (err) => resolve({ ok: false, error: err.message }))
  })
}

async function runVideoTests() {
  console.log('===============================================================')
  console.log('🎬 X FIT FORMULA — PLAYWRIGHT VIDEO E2E VERIFICATION')
  console.log('===============================================================\n')

  const results = []
  function logResult(testName, passed, details = '') {
    results.push({ testName, passed, details })
    const status = passed ? '✅ PASS' : '❌ FAIL'
    console.log(`${status}: ${testName} ${details ? '(' + details + ')' : ''}`)
  }

  // ── PHASE 1: DIRECT YOUTUBE OEMBED VERIFICATION OF ALL LIBRARY URLS ───
  console.log('--- Phase 1: Validating 100% of YouTube URLs via YouTube oEmbed API ---')
  const uniqueUrls = new Set()
  for (const k in OPEN_SOURCE_EXERCISE_MEDIA) {
    if (OPEN_SOURCE_EXERCISE_MEDIA[k].videoUrl) {
      uniqueUrls.add(OPEN_SOURCE_EXERCISE_MEDIA[k].videoUrl)
    }
  }

  const urlArr = Array.from(uniqueUrls)
  console.log(`Auditing ${urlArr.length} unique YouTube URLs across all exercises...`)
  let oembedPassCount = 0
  const failingUrls = []

  for (let i = 0; i < urlArr.length; i += 8) {
    const chunk = urlArr.slice(i, i + 8)
    const chunkRes = await Promise.all(chunk.map(async (u) => ({ url: u, ...(await checkUrlOembed(u)) })))
    chunkRes.forEach((r) => {
      if (r.ok) oembedPassCount++
      else failingUrls.push(r)
    })
  }

  logResult(
    '100% YouTube URLs Public & Embeddable',
    failingUrls.length === 0,
    `${oembedPassCount}/${urlArr.length} 200 OK, ${failingUrls.length} unavailable`
  )

  // ── PHASE 2: PLAYWRIGHT BROWSER E2E TESTS ─────────────────────────────
  console.log('\n--- Phase 2: Launching Playwright Chromium for UI & Video Player E2E ---')
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await context.newPage()

  try {
    // 1. Gym Workouts Video Modal
    console.log('\n[E2E] 1. Gym Workouts Video Interaction...')
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })
    await page.locator('button:has-text("Workout Library")').first().click()
    await page.waitForTimeout(600)

    // Click first gym exercise card (e.g. Barbell Flat Bench Press)
    const firstGymCard = page.locator('text=Barbell Flat Bench Press').first()
    await firstGymCard.click()
    await page.waitForTimeout(600)

    const modalTitle = await page.locator('h3:has-text("Barbell Flat Bench Press")').first().isVisible()
    logResult('Gym Exercise Detail Modal Opens on Card Click', modalTitle)

    // Check YouTube iframe presence
    const iframe = page.locator('iframe[src*="youtube.com/embed"]')
    const iframeVisible = await iframe.isVisible()
    const iframeSrc = await iframe.getAttribute('src')
    logResult(
      'Gym Exercise Modal Renders Valid YouTube Embed iframe',
      iframeVisible && iframeSrc && iframeSrc.includes('youtube.com/embed'),
      `src: ${iframeSrc}`
    )

    // Test Video / Motion Loop Switcher
    const motionBtn = page.locator('button:has-text("Motion Loop")').first()
    if (await motionBtn.isVisible()) {
      await motionBtn.click()
      await page.waitForTimeout(400)
      const motionImg = await page.locator('img[alt*="motion"]').first().isVisible()
      logResult('Switcher Toggles to Motion Loop Mode', motionImg)

      const videoBtn = page.locator('button:has-text("HD Video Tutorial")').first()
      await videoBtn.click()
      await page.waitForTimeout(400)
      const iframeRestored = await page.locator('iframe[src*="youtube.com/embed"]').isVisible()
      logResult('Switcher Toggles back to HD Video Tutorial', iframeRestored)
    }

    // Close modal
    await page.locator('button[aria-label="Close modal"]').click()
    await page.waitForTimeout(400)

    // 2. Home Workouts Video Modal
    console.log('\n[E2E] 2. Home Workouts Video Interaction...')
    await page.locator('button:has-text("Home Workouts")').first().click()
    await page.waitForTimeout(500)

    const pushUpCard = page.locator('text=Push-Up').first()
    await pushUpCard.click()
    await page.waitForTimeout(600)

    const homeIframe = page.locator('iframe[src*="youtube.com/embed"]')
    const homeIframeVisible = await homeIframe.isVisible()
    const homeIframeSrc = await homeIframe.getAttribute('src')
    logResult(
      'Home Workout Video Embed Loads with Valid YouTube Iframe',
      homeIframeVisible && homeIframeSrc && homeIframeSrc.includes('youtube.com/embed'),
      `src: ${homeIframeSrc}`
    )

    await page.locator('button[aria-label="Close modal"]').click()
    await page.waitForTimeout(400)

    // 3. Full Movement Library Search & Video Modal
    console.log('\n[E2E] 3. Full Movement Library Search & Video Modal...')
    await page.locator('button:has-text("Full Movement Library")').first().click()
    await page.waitForTimeout(500)

    // Click first card in movement library
    const firstMovementCard = page.locator('.group').first()
    await firstMovementCard.click()
    await page.waitForTimeout(600)

    const fullLibIframe = page.locator('iframe[src*="youtube.com/embed"]')
    const fullLibIframeVisible = await fullLibIframe.isVisible()
    logResult('Full Movement Library Exercise Card Launches Video Modal', fullLibIframeVisible)

    await page.locator('button[aria-label="Close modal"]').click()
    await page.waitForTimeout(400)

    // Return to Landing
    await page.locator('button:has-text("Return")').first().click()
    await page.waitForTimeout(400)

    // 4. Client Portal Workout Demo and Active Workout Player
    console.log('\n[E2E] 4. Client Portal Demo & Active Workout Player...')
    await page.evaluate(() => {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      const mockClient = {
        id: 'test-client-1',
        role: 'client',
        onboarded: true,
        supabaseAuth: false,
        profile: {
          name: 'Sarah Connor',
          email: 'sarah@resistance.com',
          age: '29',
          gender: 'women',
          height: '168',
          heightUnit: 'cm',
          weight: '62',
          weightUnit: 'kg',
          lifestyle: 'active',
          goal: 'fatloss',
          equipment: 'gym',
          experience: 'intermediate',
          daysPerWeek: 4,
          injuries: 'Mild lower back stiffness'
        },
        plan: days.map((day) => ({
          day,
          focus: 'Upper Body Power',
          rest: false,
          exercises: [
            { name: 'Barbell Flat Bench Press', sets: '3', reps: '10' },
            { name: 'Lat Pulldown', sets: '3', reps: '12' }
          ]
        })),
        planStatus: 'assigned',
        planMeta: { split: 'Upper / Lower', assignedBy: 'Coach King' },
        completed: {},
        exerciseDone: {},
        weightLog: [{ date: 'Aug 10', value: 63.5 }],
        checkIns: [],
        messages: []
      };

      const db = {
        trainer: { id: 't-king', role: 'trainer', name: 'Coach King', title: 'Head Trainer, X Fit Formula' },
        clients: [mockClient]
      };

      localStorage.setItem('xff-db-prod-v1', JSON.stringify(db));
      sessionStorage.setItem('xff-session-v1', JSON.stringify({ role: 'client', clientId: 'test-client-1', userId: 'test-client-1' }));
    });

    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    // Test Checklist Demo Button
    const demoBtn = page.locator('button:has-text("Demo")').first()
    if (await demoBtn.isVisible()) {
      await demoBtn.click()
      await page.waitForTimeout(600)
      const demoModalIframe = await page.locator('iframe[src*="youtube.com/embed"]').isVisible()
      logResult('Client Routine Exercise Demo Button Launches Video Tutorial Modal', demoModalIframe)
      await page.locator('button[aria-label="Close modal"]').click()
      await page.waitForTimeout(400)
    }

    // Launch Active Workout Player
    const startWorkoutBtn = page.locator('button:has-text("START WORKOUT")').first()
    if (await startWorkoutBtn.isVisible()) {
      await startWorkoutBtn.click()
      await page.waitForTimeout(700)

      const activePlayerHeading = await page.locator('text=Movement 1 of').isVisible()
      const activePlayerIframe = await page.locator('iframe[src*="youtube.com/embed"]').isVisible()
      logResult('Active Workout Player Launches with Live Video Tutorial', activePlayerHeading && activePlayerIframe)

      // Test Complete Set button in Active Workout Player
      const completeSetBtn = page.locator('button:has-text("Complete Set 1")').first()
      if (await completeSetBtn.isVisible()) {
        await completeSetBtn.click()
        await page.waitForTimeout(400)
        const restIntervalActive = await page.locator('text=Rest Interval').isVisible()
        logResult('Active Workout Player Set Completion Triggers Rest Timer', restIntervalActive)
      }

      // Close Active Workout Player
      await page.locator('button[title="Leave Workout"]').click()
      await page.waitForTimeout(400)
    }

  } catch (err) {
    console.error('❌ Playwright Test execution error:', err)
    logResult('Playwright Video E2E Execution', false, err.message)
  } finally {
    await browser.close()
    console.log('\n===============================================================')
    console.log('🏆 PLAYWRIGHT VIDEO E2E TEST SUMMARY:')
    const passed = results.filter((r) => r.passed).length
    const total = results.length
    console.log(`Passed: ${passed} / ${total}`)
    console.log('===============================================================\n')
  }
}

runVideoTests()
