// Builds docs/TEST_CASES.md from the test catalogue (cases.js) and the latest Jest run (results.json).
// Run with: npm run test:report
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CASES } from './cases.js';

const dir = path.dirname(fileURLToPath(import.meta.url));
const results = JSON.parse(fs.readFileSync(path.join(dir, 'results.json'), 'utf8'));
const out = path.join(dir, '..', '..', 'docs', 'TEST_CASES.md');

// Map "TC-XXX-NN" → { status, message }
const outcome = {};
results.testResults.forEach((file) => file.assertionResults.forEach((a) => {
  const id = a.title.split(' ')[0];
  outcome[id] = { status: a.status, message: (a.failureMessages[0] || '').split('\n')[0] };
}));

const GROUPS = { AUTH: 'Authentication', CMP: 'Complaint submission', ASG: 'Assignment (admin)', STS: 'Status update (officer)', FB: 'Feedback', NTF: 'Notifications' };
const esc = (s) => String(s).replace(/\|/g, '\\|');

const rows = (prefix) => Object.entries(CASES)
  .filter(([id]) => id.startsWith(`TC-${prefix}-`))
  .map(([id, [desc, input, expected]]) => {
    const o = outcome[id];
    const actual = !o ? 'Not run' : o.status === 'passed' ? `As expected – ${expected}` : `Different: ${o.message}`;
    const result = !o ? '—' : o.status === 'passed' ? '✅ Pass' : '❌ Fail';
    return `| ${id} | ${esc(desc)} | ${esc(input)} | ${esc(expected)} | ${esc(actual)} | ${result} |`;
  });

const all = Object.keys(CASES).map((id) => outcome[id]?.status);
const passed = all.filter((s) => s === 'passed').length;
const date = new Date(results.startTime).toISOString().slice(0, 10);

const md = [
  '# UniVoice – Test Cases (Chapter 5)',
  '',
  `Automated backend tests written with **Jest** and **Supertest**. They run against a temporary in-memory MongoDB, so real data is never touched.`,
  '',
  `**Run date:** ${date} · **Total:** ${all.length} · **Passed:** ${passed} · **Failed:** ${all.length - passed}`,
  '',
  'To run them again: `cd server && npm test` (or `npm run test:report` to regenerate this file).',
  '',
  ...Object.entries(GROUPS).flatMap(([prefix, title]) => [
    `## ${title}`, '',
    '| ID | Description | Input | Expected result | Actual result | Result |',
    '|----|-------------|-------|-----------------|---------------|--------|',
    ...rows(prefix), '',
  ]),
  '## Manually verified',
  '',
  '| ID | Description | Input | Expected result | Actual result | Result |',
  '|----|-------------|-------|-----------------|---------------|--------|',
  '| TC-MAN-01 | Login rate limit | 11 login attempts from one IP within 15 minutes | 429 "Too many login attempts…" | As expected (checked with curl) | ✅ Pass |',
  '| TC-MAN-02 | Live profanity warning in the form | Type "kamina" in the complaint title | Yellow warning appears under the form | As expected (checked in the browser) | ✅ Pass |',
  '| TC-MAN-03 | Real-time notification | Officer changes status while the student is logged in | Within 15 s a toast appears and the bell count increases | As expected (browser test: toast shown, bell 6 → 7) | ✅ Pass |',
  '| TC-MAN-04 | Responsive layout | Open pages at 390 px (phone) and 1440 px (desktop) | No sideways scrolling; sidebar becomes a slide-in menu | As expected (screenshots at both sizes) | ✅ Pass |',
  '| TC-MAN-05 | CSV export | Reports → Export CSV with a date range | A .csv file downloads; anonymous rows show "Anonymous Teacher" | As expected (file content checked: 61 rows, 8 anonymous) | ✅ Pass |',
  '',
].join('\n');

fs.writeFileSync(out, md);
console.log(`Wrote ${path.relative(process.cwd(), out)} (${passed}/${all.length} passed)`);
