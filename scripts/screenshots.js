// Takes high-quality screenshots of UniVoice for the thesis and saves them in ./thesis-screenshots.
//
// Before running:  1) MongoDB running   2) npm run seed   3) npm run dev
// Run with:        node scripts/screenshots.js
// Optional:        BASE_URL=http://localhost:5173 node scripts/screenshots.js
//
// Uses Playwright (npm i -D playwright && npx playwright install chromium if it is not installed).
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'http://localhost:5173';
const OUT = path.join(__dirname, '..', 'thesis-screenshots');
const PASSWORD = 'Password@123';
const ACCOUNTS = {
  admin: 'admin@univoice.edu.pk',
  officer: 'it.officer@univoice.edu.pk',
  student: 'ali.student@univoice.edu.pk',
  teacher: 'sana.teacher@univoice.edu.pk',
};
const TOPBAR = 64; // height of the sticky top bar (px)

// ---------- helpers ----------

// Waits until the page is fully loaded: no network activity, no loading skeletons or spinners,
// fonts ready and chart animations finished.
async function settle(page, extra = 600) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForFunction(() => !document.querySelector('.animate-shimmer, .animate-spin'), null, { timeout: 20000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(extra);
}

// Toasts disappear after 4 seconds; wait for them to go (and hide any that remain).
async function closeToasts(page) {
  await page.waitForFunction(() => !document.querySelector('[role="status"]'), null, { timeout: 9000 }).catch(() => {});
  await page.addStyleTag({ content: '[role="status"], div[style*="z-index: 9999"] { display: none !important; }' });
}

// Scrolls through the whole page so every "fade in on scroll" section appears, then goes back to the top.
async function revealAll(page) {
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y <= height; y += 300) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
}

// Scrolls so that an element sits just below the sticky top bar.
async function scrollToElement(page, locator, gap = 16) {
  await locator.first().evaluate((el, offset) => {
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - offset);
  }, TOPBAR + gap);
  await page.waitForTimeout(1500); // charts animate when they come into view
}

// Refuses to save a screenshot that shows an error or empty state.
async function assertHealthy(page, name) {
  const bad = await page.evaluate(() => {
    const text = document.body.innerText;
    const patterns = ['Something went wrong', 'No data yet', 'No complaints found', 'Cannot reach the server'];
    return patterns.find((p) => text.includes(p)) || null;
  });
  if (bad) throw new Error(`${name}: page shows "${bad}"`);
}

async function capture(page, name, { fullPage = false } = {}) {
  await closeToasts(page);
  await assertHealthy(page, name);
  await page.screenshot({ path: path.join(OUT, name), fullPage });
  console.log(`  ✓ ${name}`);
}

async function login(context, role) {
  const page = await context.newPage();
  await page.goto(`${BASE}/login`);
  await page.fill('input[type="email"]', ACCOUNTS[role]);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
  await settle(page, 1500);
  return page;
}

async function newContext(browser) {
  return browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, colorScheme: 'light' });
}

// ---------- screenshots ----------

async function publicPages(browser) {
  const context = await newContext(browser);
  const page = await context.newPage();

  await page.goto(BASE);
  await settle(page, 1800); // hero animations
  await capture(page, '01_prototype.png');

  await revealAll(page);
  await capture(page, '02_landing.png', { fullPage: true });

  await page.goto(`${BASE}/login`);
  await settle(page, 1000);
  await capture(page, '03_login.png');
  await context.close();
}

async function studentPages(browser) {
  const context = await newContext(browser);
  const page = await login(context, 'student');
  await settle(page, 1200);
  await capture(page, '04_user_dashboard.png');

  // A resolved complaint with its timeline and remarks.
  await page.goto(`${BASE}/complaints?status=resolved&sort=updated`);
  await settle(page);
  await page.locator('tbody tr').first().click();
  await page.waitForURL(/\/complaints\/[a-f0-9]{24}$/);
  await settle(page, 1200);
  // Start at the description so the whole timeline (status changes + remarks) fits in the view.
  await scrollToElement(page, page.getByRole('heading', { name: 'Description' }));
  await capture(page, '06_complaint_detail.png');
  await context.close();
}

async function teacherPages(browser) {
  const context = await newContext(browser);
  const page = await login(context, 'teacher');
  await page.goto(`${BASE}/complaints/new`);
  await settle(page);
  await page.fill('input[maxlength="150"]', 'Unfair marking in mid-term evaluation');
  await page.fill('textarea', 'Marks for the mid-term evaluation were changed after the result was announced, without any explanation to the faculty members involved.');
  await page.getByRole('switch').click(); // turn the anonymous toggle on so its explanation is highlighted
  await settle(page, 900); // live text check runs after a short delay
  await capture(page, '05_new_complaint.png');
  await context.close();
}

async function adminPages(browser) {
  const context = await newContext(browser);
  const page = await login(context, 'admin');

  // Dashboard: scroll to the chart area so all four charts are in view.
  await settle(page, 1500);
  await scrollToElement(page, page.getByRole('heading', { name: 'Monthly trend' }), 28);
  await capture(page, '07_admin_dashboard.png');

  // All complaints + Review & assign drawer on a pending complaint, with a department and officer chosen.
  await page.goto(`${BASE}/complaints?status=pending`);
  await settle(page);
  await page.getByRole('button', { name: /Review & assign/ }).first().click();
  const drawer = page.getByRole('dialog');
  await drawer.waitFor();
  await page.waitForTimeout(600);
  const deptSelect = drawer.locator('select');
  const firstDept = await deptSelect.locator('option:not([value=""])').first().getAttribute('value');
  await deptSelect.selectOption(firstDept);
  await drawer.locator('label:has(input[name="officer"])').first().waitFor();
  await drawer.locator('label:has(input[name="officer"])').first().click();
  await drawer.locator('label:has(input[name="priority"])').first().click(); // urgent
  await page.waitForTimeout(700);
  await capture(page, '08_review_assign.png');
  await page.keyboard.press('Escape');

  await page.goto(`${BASE}/admin/users`);
  await settle(page);
  await capture(page, '10_users.png');

  // Reports: scroll past the date filter so the summary and charts fill the view.
  await page.goto(`${BASE}/admin/reports`);
  await settle(page, 1500);
  await scrollToElement(page, page.getByText('Total complaints').first(), 110);
  await capture(page, '11_reports.png');
  await context.close();
}

async function officerPages(browser) {
  const context = await newContext(browser);
  const page = await login(context, 'officer');
  await page.goto(`${BASE}/complaints`);
  await settle(page);
  await capture(page, '09_officer.png');
  await context.close();
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  try {
    console.log(`Taking screenshots of ${BASE} → ${OUT}`);
    await publicPages(browser);
    await studentPages(browser);
    await teacherPages(browser);
    await adminPages(browser);
    await officerPages(browser);
    console.log('Done.');
  } finally {
    await browser.close();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
