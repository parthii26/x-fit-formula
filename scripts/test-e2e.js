import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';

async function runTests() {
  console.log('?? Launching Chromium for E2E System Verification...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const results = [];
  function logResult(testName, passed, details = '') {
    results.push({ testName, passed, details });
    const status = passed ? '? PASS' : '? FAIL';
    console.log(`${status}: ${testName} ${details ? '(' + details + ')' : ''}`);
  }

  try {
    // -- 1. LANDING PAGE VERIFICATION --
    console.log('\n--- 1. Testing Landing Page ---');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const title = await page.textContent('header');
    logResult('Landing Header & Brand Loaded', title.includes('X FIT FORMULA'));

    const clientCard = await page.locator('text=Client Portal').first().isVisible();
    const trainerCard = await page.locator('text=Trainer Access').first().isVisible();
    const libraryBtn = await page.locator('button:has-text("Workout Library")').first().isVisible();
    logResult('Portal Entrance Cards & Library Button Present', clientCard && trainerCard && libraryBtn);

    // -- 2. WORKOUT LIBRARY (ALL 3 TABS & SPLITS) --
    console.log('\n--- 2. Testing Workout Library ---');
    await page.locator('button:has-text("Workout Library")').first().click();
    await page.waitForTimeout(600);

    // Tab 1: Gym Workouts (Client Collection)
    const gymTab = await page.locator('button:has-text("Gym Workouts")').first().isVisible();
    const homeTab = await page.locator('button:has-text("Home Workouts")').first().isVisible();
    const fullLibTab = await page.locator('button:has-text("Full Movement Library")').first().isVisible();
    logResult('All 3 Collection Switcher Tabs Visible', gymTab && homeTab && fullLibTab);

    // Level Chips in Gym
    const allLevels108 = await page.locator('button:has-text("All Levels (108)")').first().isVisible();
    const beginner21 = await page.locator('button:has-text("Beginner (21)")').first().isVisible();
    const intermediate33 = await page.locator('button:has-text("Intermediate (33)")').first().isVisible();
    const advanced54 = await page.locator('button:has-text("Advanced (54)")').first().isVisible();
    logResult('Gym Level Matrix (108/21/33/54) Present', allLevels108 && beginner21 && intermediate33 && advanced54);

    // Day Split Filter in Gym
    const mondayChip = await page.locator('button:has-text("Monday")').first().isVisible();
    logResult('Gym Day Split Chips Present', mondayChip);

    // Click Beginner Filter
    await page.locator('button:has-text("Beginner (21)")').first().click();
    await page.waitForTimeout(400);
    const beginnerHeading = await page.locator('text=Beginner Curriculum').first().isVisible();
    logResult('Beginner Gym Split Heading Rendered', beginnerHeading);

    // Switch to Home Workouts Tab
    await page.locator('button:has-text("Home Workouts")').first().click();
    await page.waitForTimeout(400);
    const homeBeginner = await page.locator('button:has-text("Beginner (7)")').first().isVisible();
    const homeDays = await page.locator('button:has-text("Monday")').first().isVisible();
    logResult('Home Workout Collection with Day Splits Loaded', homeBeginner && homeDays);

    // Switch to Full Movement Library Tab
    await page.locator('button:has-text("Full Movement Library")').first().click();
    await page.waitForTimeout(400);
    const fullLibSearch = await page.locator('input[placeholder*="Search all movements"]').first().isVisible();
    const filtersPresent = await page.locator('text=Difficulty').first().isVisible();
    logResult('Full Movement Library Search & Filter Grid Loaded', fullLibSearch && filtersPresent);

    // Return to Landing
    await page.locator('button:has-text("Return")').first().click();
    await page.waitForTimeout(500);

    // -- 3. AUTHENTICATION SCREENS & GOOGLE BUTTON --
    console.log('\n--- 3. Testing Authentication Panels ---');
    // Client Portal Auth
    await page.locator('button:has-text("Client Portal")').first().click();
    await page.waitForTimeout(400);
    const clientGoogleBtn = await page.locator('button:has-text("Continue with Google")').first().isVisible();
    const clientEmailInput = await page.locator('input[type="email"]').first().isVisible();
    logResult('Client Auth Panel with Email + Google Sign-In Present', clientGoogleBtn && clientEmailInput);

    await page.locator('button:has-text("Return")').first().click();
    await page.waitForTimeout(400);

    // Trainer Access Auth
    await page.locator('button:has-text("Trainer Access")').first().click();
    await page.waitForTimeout(400);
    const trainerGoogleBtn = await page.locator('button:has-text("Continue with Google")').first().isVisible();
    const trainerPasswordInput = await page.locator('input[type="password"]').first().isVisible();
    logResult('Trainer Auth Panel with Email + Google Sign-In Present', trainerGoogleBtn && trainerPasswordInput);

    // -- 4. CLIENT ONBOARDING & PORTAL WORKFLOW --
    console.log('\n--- 4. Testing Client Portal Flow ---');
    await page.evaluate(() => {
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
        plan: [
          { day: 'Monday', focus: 'Upper Body', rest: false, exercises: [{ name: 'Bench Press', sets: '3', reps: '10' }, { name: 'Lat Pulldown', sets: '3', reps: '12' }] },
          { day: 'Tuesday', focus: 'Lower Body', rest: false, exercises: [{ name: 'Barbell Squat', sets: '4', reps: '10' }] },
          { day: 'Wednesday', focus: 'Rest', rest: true, exercises: [] },
          { day: 'Thursday', focus: 'Upper Body', rest: false, exercises: [{ name: 'Overhead Press', sets: '3', reps: '10' }] },
          { day: 'Friday', focus: 'Lower Body', rest: false, exercises: [{ name: 'Leg Press', sets: '3', reps: '12' }] },
          { day: 'Saturday', focus: 'Rest', rest: true, exercises: [] },
          { day: 'Sunday', focus: 'Rest', rest: true, exercises: [] }
        ],
        planStatus: 'assigned',
        planMeta: { split: 'Upper / Lower', assignedBy: 'Coach King' },
        completed: { Monday: true },
        exerciseDone: { 'Monday:0': true, 'Monday:1': true },
        weightLog: [{ date: 'Aug 10', value: 63.5 }, { date: 'Aug 20', value: 62.0 }],
        checkIns: [{ id: 'ci-1', date: '2026-09-03', session: 'Upper session completed', protein: '120', calories: '1700', water: '3', sleep: '8', weight: '62.0', status: 'new' }],
        messages: [{ from: 'trainer', text: 'Welcome Sarah! Program is locked in.', ts: 'Yesterday' }]
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

    const clientWelcome = await page.locator('text=Sarah').first().isVisible();
    const workoutsTab = await page.locator('button:has-text("Workouts")').first().isVisible();
    const progressTab = await page.locator('button:has-text("Progress")').first().isVisible();
    logResult('Client Dashboard Loaded with Personal Routine', clientWelcome && workoutsTab && progressTab);

    // Test Workouts tab
    await page.locator('button:has-text("Workouts")').first().click();
    await page.waitForTimeout(400);
    const mondayWorkout = await page.locator('text=Upper Body').first().isVisible();
    logResult('Client Weekly Workout Split Rendered', mondayWorkout);

    // -- 5. TRAINER PORTAL, ROSTER & BUILDER --
    console.log('\n--- 5. Testing Trainer Portal & Roster ---');
    await page.evaluate(() => {
      sessionStorage.setItem('xff-session-v1', JSON.stringify({ role: 'trainer', userId: 't-king', trainerName: 'Coach King', trainerTitle: 'Head Trainer, X Fit Formula' }));
    });

    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    const trainerHeader = await page.locator('text=King').first().isVisible();
    const overviewVisible = await page.locator('text=Command Center').first().isVisible();
    logResult('Trainer Command Center with Coach King Identity Loaded', trainerHeader && overviewVisible);

    // Open Roster via sidebar nav
    await page.locator('aside nav button:has-text("Roster")').click();
    await page.waitForTimeout(500);
    const sarahRow = await page.locator('tbody tr:has-text("Sarah Connor")').isVisible();
    logResult('Client Record (Sarah Connor) Visible in Trainer Roster', sarahRow);

    // Click client row to view Intake & Details
    await page.locator('tbody tr:has-text("Sarah Connor")').click();
    await page.waitForTimeout(500);
    const injuryBanner = await page.locator('text=Mild lower back stiffness').isVisible();
    const clientDataGrid = await page.locator('text=Client Data').isVisible();
    const reviseBtn = await page.locator('button:has-text("Revise Program")').isVisible();
    logResult('Client Detail with Injuries & Biometrics Grid Rendered', injuryBanner && clientDataGrid && reviseBtn);

    // Open Workout Builder
    await page.locator('button:has-text("Revise Program")').click();
    await page.waitForTimeout(500);
    const builderTitle = await page.locator('text=Program Builder').isVisible();
    const autoFillBtn = await page.locator('button:has-text("Auto-Fill Formula")').isVisible();
    logResult('Workout Builder Loaded for Athlete', builderTitle && autoFillBtn);

  } catch (err) {
    console.error('? Test execution error:', err);
    logResult('E2E Test Execution', false, err.message);
  } finally {
    await browser.close();
    console.log('\n=========================================');
    console.log('?? E2E TEST SUMMARY:');
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    console.log(`Passed: ${passed} / ${total}`);
    console.log('=========================================\n');
  }
}

runTests();
