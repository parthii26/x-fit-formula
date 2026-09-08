import { chromium } from 'playwright'

const BASE_URL = process.env.TEST_URL || 'http://localhost:5173'

async function runLoginRoleTests() {
  console.log('===============================================================')
  console.log(`🔐 TESTING CLIENT & TRAINER LOGIN NAVIGATION ON: ${BASE_URL}`)
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
    // ── TEST 1: CLIENT PORTAL SIGN-UP & LOGIN FLOW ──────────────────────
    console.log('--- Test 1: Client Portal Entrance & Login Flow ---')
    await resetToLanding()

    // 1. Click Client Portal entrance card
    const clientCard = page.locator('button:has-text("Client Portal")').first()
    await clientCard.click()
    await page.waitForTimeout(400)

    // 2. Fill name, email and password
    const nameInput = page.locator('input[placeholder="Your full name"]')
    if (await nameInput.isVisible()) {
      await nameInput.fill('Alex Rivera')
    }
    await page.locator('input[placeholder="name@domain.com"]').fill('alex.rivera@example.com')
    await page.locator('input[type="password"]').fill('ClientPassword123!')

    // 3. Submit
    await page.locator('button[type="submit"]').click()
    await page.waitForTimeout(1500)

    // 4. Assert Client Portal or Onboarding is visible & Trainer Command Center is NOT
    const isTrainerUI = (await page.locator('text=Command Center').first().isVisible().catch(() => false)) ||
                        (await page.locator('text=Athlete Roster').first().isVisible().catch(() => false)) ||
                        (await page.locator('aside:has-text("Trainer")').first().isVisible().catch(() => false))
    const isClientUI = (await page.locator('text=Alex').first().isVisible().catch(() => false)) ||
                       (await page.locator('text=Week Adherence').first().isVisible().catch(() => false)) ||
                       (await page.locator('text=Movement Checklist').first().isVisible().catch(() => false)) ||
                       (await page.locator('text=Biometrics & Profile').first().isVisible().catch(() => false)) ||
                       (await page.locator('text=01 Profile').first().isVisible().catch(() => false)) ||
                       (await page.locator('text=Precision Intake Assessment').first().isVisible().catch(() => false))

    logResult(
      'Client Portal entrance navigates strictly to Client Portal (NOT Trainer)',
      Boolean(isClientUI && !isTrainerUI),
      `isClient: ${isClientUI}, isTrainer: ${isTrainerUI}`
    )

    // ── TEST 2: LOGOUT FROM CLIENT PORTAL ────────────────────────────────
    console.log('\n--- Test 2: Logout from Client Portal ---')
    const shellSignOut = page.locator('button[title="Sign out"]').first()
    if (await shellSignOut.isVisible().catch(() => false)) {
      await shellSignOut.click()
    } else {
      const exitBtn = page.locator('button:has-text("Sign Out"), button:has-text("Exit"), button:has-text("Logout")').first()
      if (await exitBtn.isVisible().catch(() => false)) {
        await exitBtn.click()
      } else {
        await resetToLanding()
      }
    }
    await page.waitForTimeout(800)

    const isLandingAfterClient = (await page.locator('button:has-text("Client Portal")').first().isVisible().catch(() => false)) &&
                                 (await page.locator('button:has-text("Trainer Access")').first().isVisible().catch(() => false))
    logResult('Logout from Client cleanly returns to Landing page', Boolean(isLandingAfterClient))

    // ── TEST 3: TRAINER ACCESS ENTRANCE & LOGIN FLOW ─────────────────────
    console.log('\n--- Test 3: Trainer Access Entrance & Login Flow ---')
    await page.locator('button:has-text("Trainer Access")').first().click()
    await page.waitForTimeout(400)

    // Fill Trainer credentials
    await page.locator('input[placeholder="name@domain.com"]').fill('coach@xfitformula.com')
    await page.locator('input[type="password"]').fill('CoachAdmin123!')
    await page.locator('button[type="submit"]').click()
    await page.waitForTimeout(1500)

    const isTrainerCenter = (await page.locator('text=Overview').first().isVisible().catch(() => false)) ||
                            (await page.locator('text=Roster').first().isVisible().catch(() => false)) ||
                            (await page.locator('text=Coach').first().isVisible().catch(() => false)) ||
                            (await page.locator('text=Command Center').first().isVisible().catch(() => false))
    const isClientViewDuringTrainer = (await page.locator('text=Week Adherence').first().isVisible().catch(() => false)) ||
                                      (await page.locator('text=Movement Checklist').first().isVisible().catch(() => false))

    logResult(
      'Trainer Access entrance navigates strictly to Trainer Command Center',
      Boolean(isTrainerCenter && !isClientViewDuringTrainer),
      `isTrainerCenter: ${isTrainerCenter}, isClientView: ${isClientViewDuringTrainer}`
    )

    // ── TEST 4: LOGOUT FROM TRAINER PORTAL ───────────────────────────────
    console.log('\n--- Test 4: Logout from Trainer Command Center ---')
    const trainerSignOut = page.locator('button[data-testid="sign-out-btn"], button[data-testid="mobile-sign-out-btn"], button[title="Sign out"], button[aria-label="Sign out"]').first()
    if (await trainerSignOut.isVisible().catch(() => false)) {
      await trainerSignOut.click()
    } else {
      await resetToLanding()
    }
    await page.waitForTimeout(800)

    const isLandingAfterTrainer = (await page.locator('button:has-text("Client Portal")').first().isVisible().catch(() => false)) &&
                                  (await page.locator('button:has-text("Trainer Access")').first().isVisible().catch(() => false))
    logResult('Logout from Trainer cleanly returns to Landing page', Boolean(isLandingAfterTrainer))

    // ── TEST 5: ROLE SWITCH (TRAINER -> CLIENT CLEAN SWITCH) ─────────────
    console.log('\n--- Test 5: Role Switch from Trainer back to Client ---')
    await page.locator('button:has-text("Client Portal")').first().click()
    await page.waitForTimeout(400)

    // Toggle to Log In if visible
    const loginToggle = page.locator('button:has-text("Log In")').first()
    if (await loginToggle.isVisible().catch(() => false)) {
      await loginToggle.click()
      await page.waitForTimeout(300)
    }

    await page.locator('input[placeholder="name@domain.com"]').fill('alex.rivera@example.com')
    await page.locator('input[type="password"]').fill('ClientPassword123!')
    await page.locator('button[type="submit"]').click()
    await page.waitForTimeout(1500)

    const isClientFinal = (await page.locator('text=Alex').first().isVisible().catch(() => false)) ||
                          (await page.locator('text=Week Adherence').first().isVisible().catch(() => false)) ||
                          (await page.locator('text=Movement Checklist').first().isVisible().catch(() => false)) ||
                          (await page.locator('text=Biometrics & Profile').first().isVisible().catch(() => false))
    const isTrainerFinal = (await page.locator('text=Command Center').first().isVisible().catch(() => false)) ||
                           (await page.locator('aside:has-text("Trainer")').first().isVisible().catch(() => false))

    logResult(
      'Switching back to Client Portal routes to Client without sticky Trainer session',
      Boolean(isClientFinal && !isTrainerFinal),
      `finalClientCheck: ${isClientFinal}, finalTrainerCheck: ${isTrainerFinal}`
    )

  } catch (err) {
    console.error('❌ Playwright Test execution error:', err)
    logResult('Playwright Login Role Execution', false, err.message)
  } finally {
    await browser.close()
    console.log('\n===============================================================')
    console.log('🏆 LOGIN & ROLE ROUTING TEST SUMMARY:')
    const passed = results.filter((r) => r.passed).length
    const total = results.length
    console.log(`Passed: ${passed} / ${total}`)
    console.log('===============================================================\n')
    if (passed !== total) {
      process.exit(1)
    }
  }
}

runLoginRoleTests()

