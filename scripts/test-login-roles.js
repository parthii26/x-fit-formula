import { chromium } from 'playwright'

const BASE_URL = process.env.TEST_URL || 'http://localhost:5173'

async function runRealAuthTests() {
  console.log('===============================================================')
  console.log(`🔐 TESTING REAL SUPABASE AUTH & ROLE NAVIGATION ON: ${BASE_URL}`)
  console.log('===============================================================\n')

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await context.newPage()

  const results = []
  function logResult(testName, passed, details = '') {
    results.push({ testName, passed, details })
    const status = passed ? '✅ PASS' : '❌ FAIL'
    console.log(`${status}: ${testName} ${details ? '(' + details + ')' : ''}`)
  }

  async function resetToLanding() {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForTimeout(400)
  }

  try {
    // ── TEST 1: LANDING PAGE PORTAL CARDS ────────────────────────────────
    console.log('--- Test 1: Landing Page & Portal Entrances ---')
    await resetToLanding()

    const hasClientCard = await page.locator('button:has-text("Client Portal")').first().isVisible()
    const hasTrainerCard = await page.locator('button:has-text("Trainer Access")').first().isVisible()
    logResult('Landing Page displays Client & Trainer Entrances', hasClientCard && hasTrainerCard)

    // ── TEST 2: CLIENT PORTAL REAL AUTH VALIDATION ──────────────────────
    console.log('\n--- Test 2: Client Portal Real Auth Validation (No Demo Bypass) ---')
    await page.locator('button:has-text("Client Portal")').first().click()
    await page.waitForTimeout(400)

    // Switch to Log In mode
    const loginToggle = page.locator('button:has-text("Log In")').first()
    if (await loginToggle.isVisible()) {
      await loginToggle.click()
      await page.waitForTimeout(300)
    }

    // Try invalid credentials -> must show real error, NOT silently log in as demo
    await page.locator('input[placeholder="name@domain.com"]').fill('unregistered.client@example.com')
    await page.locator('input[type="password"]').fill('WrongPassword123!')
    await page.locator('button[type="submit"]').click()
    await page.waitForTimeout(1500)

    const isErrorMessage = await page.locator('text=Invalid email or password').first().isVisible() ||
                           await page.locator('text=Authentication failed').first().isVisible() ||
                           await page.locator('text=Email rate limit').first().isVisible()
    const noFakeLogin = !(await page.locator('text=Command Center').isVisible()) &&
                        !(await page.locator('text=Alex Rivera').isVisible())

    logResult(
      'Invalid client credentials shows real error message (NO mock/demo bypass)',
      isErrorMessage && noFakeLogin,
      `hasErrorMsg: ${isErrorMessage}, noFakeLogin: ${noFakeLogin}`
    )

    // ── TEST 3: TRAINER ACCESS REAL AUTH VALIDATION ──────────────────────
    console.log('\n--- Test 3: Trainer Access Real Auth Validation (No Demo Bypass) ---')
    await resetToLanding()
    await page.locator('button:has-text("Trainer Access")').first().click()
    await page.waitForTimeout(400)

    // Try invalid credentials on trainer portal -> must show real error
    await page.locator('input[placeholder="name@domain.com"]').fill('unregistered.coach@example.com')
    await page.locator('input[type="password"]').fill('WrongCoachPass123!')
    await page.locator('button[type="submit"]').click()
    await page.waitForTimeout(1500)

    const isTrainerError = await page.locator('text=Invalid email or password').first().isVisible() ||
                           await page.locator('text=Authentication failed').first().isVisible() ||
                           await page.locator('text=Email rate limit').first().isVisible()
    const noTrainerFakeLogin = !(await page.locator('text=Overview').first().isVisible())

    logResult(
      'Invalid trainer credentials shows real error message (NO mock/demo bypass)',
      isTrainerError && noTrainerFakeLogin,
      `hasErrorMsg: ${isTrainerError}, noFakeLogin: ${noTrainerFakeLogin}`
    )

    // ── TEST 4: FORGOT PASSWORD FLOW ────────────────────────────────────
    console.log('\n--- Test 4: Forgot Password Flow ---')
    const forgotBtn = page.locator('button:has-text("Forgot Password?")').first()
    if (await forgotBtn.isVisible()) {
      await forgotBtn.click()
      await page.waitForTimeout(300)
    }

    const isForgotScreen = await page.locator('text=Reset Password').first().isVisible()
    logResult('Forgot password screen accessible', isForgotScreen)

    // ── TEST 5: CLIENT SIGN-UP FORM INTEGRATION ─────────────────────────
    console.log('\n--- Test 5: Client Sign-Up Form Structure ---')
    await resetToLanding()
    await page.locator('button:has-text("Client Portal")').first().click()
    await page.waitForTimeout(400)

    const nameInput = page.locator('input[placeholder="Your full name"]')
    const emailInput = page.locator('input[placeholder="name@domain.com"]')
    const passInput = page.locator('input[type="password"]')
    const googleBtn = page.locator('button:has-text("Continue with Google")')

    const hasAllFields = (await nameInput.isVisible()) &&
                         (await emailInput.isVisible()) &&
                         (await passInput.isVisible()) &&
                         (await googleBtn.isVisible())

    logResult('Real Sign-Up form includes Name, Email, Password, and Google OAuth', hasAllFields)

  } catch (err) {
    console.error('❌ Playwright Test execution error:', err)
    logResult('Playwright Real Auth Execution', false, err.message)
  } finally {
    await browser.close()
    console.log('\n===============================================================')
    console.log('🏆 REAL SUPABASE AUTH TEST SUMMARY:')
    const passed = results.filter((r) => r.passed).length
    const total = results.length
    console.log(`Passed: ${passed} / ${total}`)
    console.log('===============================================================\n')
    if (passed !== total) {
      process.exit(1)
    }
  }
}

runRealAuthTests()

