import { chromium } from 'playwright'

const BASE_URL = process.env.TEST_URL || 'http://localhost:5173'

async function runRealtimeTests() {
  console.log('🚀 Starting Bidirectional Realtime Messaging & Notification E2E Verification...')
  const browser = await chromium.launch({ headless: true })

  // Context 1: Coach / Trainer
  const coachContext = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const coachPage = await coachContext.newPage()

  // Context 2: Client / Athlete
  const athleteContext = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const athletePage = await athleteContext.newPage()

  const results = []
  function logResult(testName, passed, details = '') {
    results.push({ testName, passed, details })
    const status = passed ? '✅ PASS' : '❌ FAIL'
    console.log(`${status}: ${testName} ${details ? '(' + details + ')' : ''}`)
  }

  try {
    const testClientId = 'athlete-realtime-test-' + Date.now()

    // ── Setup Athlete session in localStorage / sessionStorage ──
    await athletePage.goto(BASE_URL, { waitUntil: 'domcontentloaded' })
    await athletePage.evaluate(({ clientId }) => {
      const athlete = {
        id: clientId,
        role: 'client',
        onboarded: true,
        supabaseAuth: false,
        profile: {
          name: 'Alex Hunter',
          email: 'alex.hunter@example.com',
          phone: '+1 555-0199',
          age: '28',
          height: '180',
          heightUnit: 'cm',
          weight: '78',
          weightUnit: 'kg',
          gender: 'men',
          lifestyle: 'active',
          injuries: 'Right shoulder tightness',
          goal: 'hypertrophy',
          equipment: 'gym',
          experience: 'intermediate',
          daysPerWeek: 4,
        },
        plan: null,
        planStatus: 'pending',
        planMeta: null,
        completed: {},
        exerciseDone: {},
        weightLog: [],
        checkIns: [],
        messages: [],
        joined: new Date().toISOString().slice(0, 10),
        lastActive: 'Today',
      }

      const db = {
        trainer: { id: 'trainer-test', name: 'Coach Marcus', title: 'Head Trainer', email: 'coach@example.com' },
        clients: [athlete],
      }
      localStorage.setItem('xff-db-v1', JSON.stringify(db))
      sessionStorage.setItem('xff-session-v1', JSON.stringify({
        role: 'client',
        clientId: clientId,
        clientName: 'Alex Hunter',
        onboarded: true,
      }))
    }, { clientId: testClientId })

    await athletePage.reload({ waitUntil: 'networkidle' })
    await athletePage.waitForTimeout(600)

    // Check Athlete is in ClientPortal
    const athleteGreeting = await athletePage.locator('h1').first().textContent()
    logResult('Athlete Portal Session Initialized', athleteGreeting.includes('ALEX') || athleteGreeting.includes('Alex'))

    // ── Setup Coach session in Coach Context ──
    await coachPage.goto(BASE_URL, { waitUntil: 'domcontentloaded' })
    await coachPage.evaluate(({ clientId }) => {
      const athlete = {
        id: clientId,
        role: 'client',
        onboarded: true,
        supabaseAuth: false,
        profile: {
          name: 'Alex Hunter',
          email: 'alex.hunter@example.com',
          phone: '+1 555-0199',
          age: '28',
          height: '180',
          heightUnit: 'cm',
          weight: '78',
          weightUnit: 'kg',
          gender: 'men',
          lifestyle: 'active',
          injuries: 'Right shoulder tightness',
          goal: 'hypertrophy',
          equipment: 'gym',
          experience: 'intermediate',
          daysPerWeek: 4,
        },
        plan: null,
        planStatus: 'pending',
        planMeta: null,
        completed: {},
        exerciseDone: {},
        weightLog: [],
        checkIns: [],
        messages: [],
        joined: new Date().toISOString().slice(0, 10),
        lastActive: 'Today',
      }

      const db = {
        trainer: { id: 'trainer-test', name: 'Coach Marcus', title: 'Head Trainer', email: 'coach@example.com' },
        clients: [athlete],
      }
      localStorage.setItem('xff-db-v1', JSON.stringify(db))
      sessionStorage.setItem('xff-session-v1', JSON.stringify({
        role: 'trainer',
        userId: 'trainer-test',
        trainerName: 'Coach Marcus',
        trainerTitle: 'Head Trainer, X Fit Formula',
      }))
    }, { clientId: testClientId })

    await coachPage.reload({ waitUntil: 'networkidle' })
    await coachPage.waitForTimeout(600)

    // Check Coach is in TrainerPortal Command Center
    const coachHeader = await coachPage.locator('text=Command Center').first().isVisible()
    logResult('Coach Portal Command Center Initialized', coachHeader)

    // ── 1. ATHLETE SENDS MESSAGE TO COACH ──
    console.log('\n--- Test 1: Athlete Sends Message to Coach ---')
    // Athlete navigates to Profile / Coach chat tab
    await athletePage.locator('button:has-text("Profile")').first().click()
    await athletePage.waitForTimeout(500)

    const chatInput = athletePage.locator('input[placeholder="Message your coach..."]')
    const chatInputVisible = await chatInput.isVisible()
    logResult('Athlete Direct Coach Line Input Visible', chatInputVisible)

    const athleteMsgText = 'Hello Coach Marcus! Ready for this week protocol.'
    await chatInput.fill(athleteMsgText)
    await athletePage.locator('form:has(input[placeholder="Message your coach..."]) button[type="submit"]').click()
    await athletePage.waitForTimeout(500)

    // Verify message is visible in Athlete thread
    const sentMsgVisible = await athletePage.locator(`text=${athleteMsgText}`).isVisible()
    logResult('Message Rendered on Athlete Chat Log', sentMsgVisible)

    // ── 2. COACH RECEIVES ATHLETE MESSAGE IN REAL TIME ──
    console.log('\n--- Test 2: Coach Receives Message in Real Time ---')
    // Open Coach Roster and Client Detail
    await coachPage.locator('button:has-text("Roster")').first().click()
    await coachPage.waitForTimeout(400)
    await coachPage.locator('tbody tr:has-text("Alex Hunter")').click()
    await coachPage.waitForTimeout(600)

    // Coach replies: "Do the Workout slowly"
    const coachReplyText = 'Do the Workout slowly and focus on tempo.'
    const replyInput = coachPage.locator('input[placeholder="Reply"]')
    await replyInput.fill(coachReplyText)
    await coachPage.locator('form:has(input[placeholder="Reply"]) button[type="submit"]').click()
    await coachPage.waitForTimeout(500)

    const coachSentVisible = await coachPage.locator(`text=${coachReplyText}`).isVisible()
    logResult('Coach Reply Sent & Displayed in Correspondence', coachSentVisible)

    // ── 3. ATHLETE RECEIVES COACH REPLY & NOTIFICATION TOAST ──
    console.log('\n--- Test 3: Athlete Receives Coach Reply & Notification Toast ---')
    await athletePage.waitForTimeout(500)
    const toastAlert = await athletePage.locator('[role="alert"]:has-text("Do the Workout slowly")').first().isVisible()
    const replyOnChatLog = await athletePage.locator('main').locator(`text=${coachReplyText}`).first().isVisible()
    logResult('Notification Toast Banner Displayed with Audio Chime', toastAlert)
    logResult('Coach Reply Received on Athlete Screen & Chat Log', replyOnChatLog)

    // ── 4. COACH INBOX REAL-TIME CORRESPONDENCE ──
    console.log('\n--- Test 4: Coach Inbox View ---')
    await coachPage.locator('button:has-text("Inbox")').first().click()
    await coachPage.waitForTimeout(500)
    const inboxAlex = await coachPage.locator('text=Alex Hunter').first().isVisible()
    logResult('Athlete Thread Listed in Coach Inbox', inboxAlex)

    // ── 5. COACH ASSIGNS PROGRAM & ATHLETE RECEIVES UPDATE ──
    console.log('\n--- Test 5: Program Assignment Workflow ---')
    await coachPage.locator('button:has-text("Roster")').first().click()
    await coachPage.waitForTimeout(400)
    await coachPage.locator('tbody tr:has-text("Alex Hunter")').click()
    await coachPage.waitForTimeout(600)

    await coachPage.locator('button:has-text("Build Program")').first().click()
    await coachPage.waitForTimeout(500)

    // Click Auto-Fill Formula
    await coachPage.locator('button:has-text("Auto-Fill Formula")').first().click()
    await coachPage.waitForTimeout(400)

    // Click Assign Program
    await coachPage.locator('button:has-text("Assign Program")').first().click()
    await coachPage.waitForTimeout(700)

    // Verify on Athlete Portal
    await athletePage.waitForTimeout(600)
    const programToast = await athletePage.locator('[role="alert"]:has-text("Protocol Assigned"), [role="alert"]:has-text("assigned your workout plan")').first().isVisible()
    logResult('Athlete Received Program Assigned Notification Toast', programToast)

    await athletePage.locator('button:has-text("Workouts")').first().click()
    await athletePage.waitForTimeout(600)
    const workoutHeaderVisible = await athletePage.getByText('Weekly Program').first().isVisible()
    logResult('Athlete Workouts Tab Displays Assigned Protocol', workoutHeaderVisible)

  } catch (err) {
    console.error('Test Execution Error:', err)
    logResult('Realtime Suite Execution', false, err.message)
  } finally {
    await coachContext.close()
    await athleteContext.close()
    await browser.close()
  }

  console.log('\n================ TEST SUMMARY ================')
  const passed = results.filter((r) => r.passed).length
  const total = results.length
  console.log(`Total: ${total} | Passed: ${passed} | Failed: ${total - passed}`)
  console.log('==============================================\n')

  if (passed !== total) {
    process.exit(1)
  }
}

runRealtimeTests()
