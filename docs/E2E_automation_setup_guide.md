# E2E Automation Setup & Execution Guide

## 1. Introduction
This guide walks you through the complete setup, configuration, and execution of the Playwright test suite for the Social Media Clone frontend (`social-ui`). Tests cover 155 test cases across 15 functional modules, validating positive (happy-path) and negative (edge/failure) scenarios end-to-end from the React UI down to the Spring Boot backend.

---

## 2. Prerequisites
Before running tests, ensure **all** of the following services are running:

| Service | Startup Command | URL / Port |
|---------|-----------------|------------|
| Frontend | `npm run dev` (in `social-ui/`) | `http://localhost:5173` |
| Backend | `mvn spring-boot:run` (in `backend/`) | `http://localhost:8080` |
| PostgreSQL | System service or Docker | `localhost:5432` |
| MongoDB | System service or Docker | `localhost:27017` |
| Redis | System service or Docker | `localhost:6379` |
| Elasticsearch | System service or Docker | `localhost:9200` |

**Required Tooling:**
- **Node.js** v18 or higher
- **Java 17+** and **Maven** (for backend)
- **Docker** (optional, recommended for running infra services)

---

## 3. First-Time Setup

```bash
# Step 1: Navigate to frontend directory
cd social-ui

# Step 2: Install Node dependencies
npm install

# Step 3: Install Playwright browser binaries with system dependencies
npx playwright install --with-deps

# Step 4: Verify Playwright is installed correctly
npx playwright --version
```

---

## 4. Test Fixtures

Place all fixture files in `social-ui/tests/fixtures/` before running tests:

| File | Purpose |
|------|---------|
| `test-image.svg` | Used by post upload, story upload, and chat image tests |
| `test-video.mp4` (optional) | For future video post upload tests |

```bash
# Create fixtures directory if it doesn't exist
mkdir -p social-ui/tests/fixtures
```

---

## 5. Running Tests

### Run all tests (headless, default)
```bash
npx playwright test
```

### Run in headed mode (watch the browser)
```bash
npx playwright test --headed
```

### Run in interactive UI mode (best for debugging and authoring)
```bash
npx playwright test --ui
```

### View HTML report after a run
```bash
npx playwright show-report
```

---

## 6. Module-by-Module Execution Plan

Run each module individually to isolate failures. All commands run from `social-ui/`:

| # | Module | Spec File(s) | Command |
|---|--------|-------------|---------|
| 1 | Authentication | `auth.spec.js`, `social-platform.spec.js` | `npx playwright test tests/auth.spec.js tests/social-platform.spec.js --grep "Auth"` |
| 2 | Settings | `settings.spec.js` | `npx playwright test tests/settings.spec.js` |
| 3 | Post Management (text) | `social-platform.spec.js` | `npx playwright test tests/social-platform.spec.js --grep "Post Management"` |
| 4 | Post Upload (single image) | `post_upload.spec.js` | `npx playwright test tests/post_upload.spec.js` |
| 5 | Multi-Image Posts | `multi-image.spec.js` | `npx playwright test tests/multi-image.spec.js` |
| 6 | Post Edit & Delete | `advanced-features.spec.js` | `npx playwright test tests/advanced-features.spec.js --grep "edit and delete"` |
| 7 | Poll Voting | `social-platform.spec.js` | `npx playwright test tests/social-platform.spec.js --grep "Poll"` |
| 8 | Stories | `stories.spec.js` | `npx playwright test tests/stories.spec.js` |
| 9 | Follow / Unfollow | `follow-unfollow.spec.js` | `npx playwright test tests/follow-unfollow.spec.js` |
| 10 | Bookmark / Save | `bookmark.spec.js` | `npx playwright test tests/bookmark.spec.js` |
| 11 | Explore & Search | `explore-search.spec.js` | `npx playwright test tests/explore-search.spec.js` |
| 12 | Notifications | `notifications.spec.js` | `npx playwright test tests/notifications.spec.js` |
| 13 | Direct Messaging | `chat.spec.js` | `npx playwright test tests/chat.spec.js` |
| 14 | Chat Image Sending | `advanced-features.spec.js` | `npx playwright test tests/advanced-features.spec.js --grep "send image"` |
| 15 | Message Reactions | `message-reactions.spec.js` | `npx playwright test tests/message-reactions.spec.js` |
| 16 | Chat Groups | `groups_and_chat.spec.js` | `npx playwright test tests/groups_and_chat.spec.js --grep "Chat Group"` |
| 17 | Community Groups | `group-features.spec.js`, `groups_and_chat.spec.js` | `npx playwright test tests/group-features.spec.js tests/groups_and_chat.spec.js` |
| 18 | Profile | `profile.spec.js` | `npx playwright test tests/profile.spec.js` |
| 19 | Account & Privacy | `account-management.spec.js` | `npx playwright test tests/account-management.spec.js` |
| 20 | Personalization | `personalization.spec.js` | `npx playwright test tests/personalization.spec.js` |
| 21 | Admin Moderation | `advanced-moderation.spec.js`, `production-pack.spec.js` | `npx playwright test tests/advanced-moderation.spec.js tests/production-pack.spec.js` |

### Run full regression suite
```bash
npx playwright test
npx playwright show-report
```

---

## 7. Useful Flags

```bash
# Run with visible browser for any spec
npx playwright test tests/<file>.spec.js --headed

# Run a single test case by name
npx playwright test --grep "TC_AUTH_01"

# Run only failed tests from the last run
npx playwright test --last-failed

# Run with retries on flaky network or race conditions
npx playwright test --retries=2

# Run specific test file with full verbose output
npx playwright test tests/auth.spec.js --reporter=list

# Run tests in debug mode (step through actions)
npx playwright test tests/auth.spec.js --debug
```

---

## 8. Playwright Configuration

Playwright config: `social-ui/playwright.config.js`

```js
// playwright.config.js (recommended configuration)
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 1,
  workers: 1,               // Sequential — avoids race conditions with shared DB state
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
});
```

| Setting | Value | Reason |
|---------|-------|--------|
| `baseURL` | `http://localhost:5173` | React dev server |
| `workers` | `1` | Sequential execution; avoids DB race conditions |
| `reporter` | `html` | Visual HTML report after test run |
| `screenshot` | `only-on-failure` | Captures screenshots on failures for debugging |
| `video` | `retain-on-failure` | Records video for failed tests |
| `trace` | `on-first-retry` | Playwright trace viewer for retried failures |
| `timeout` | `30000ms` | Allows time for WebSocket events and slow API responses |

---

## 9. Writing Tests — Conventions

### File Naming
All test files live in `social-ui/tests/` and follow the naming pattern: `<module>.spec.js`

### Helper: Login Function
All protected tests should reuse a shared login helper to avoid repetition:

```js
// tests/helpers/auth.js
export async function loginAs(page, username, password) {
  await page.goto('/login');
  await page.fill('input[placeholder="johndoe"]', username);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/feed');
}
```

### Helper: Two-User Context (for real-time tests)
Chat and notification real-time tests require two separate browser contexts:

```js
test('real-time message delivery', async ({ browser }) => {
  const ctx1 = await browser.newContext();
  const ctx2 = await browser.newContext();
  const page1 = await ctx1.newPage();
  const page2 = await ctx2.newPage();

  await loginAs(page1, 'user1', 'password1');
  await loginAs(page2, 'user2', 'password2');

  // ... test real-time interaction
  await ctx1.close();
  await ctx2.close();
});
```

### Negative Test Pattern
Negative tests should assert error state elements, not merely the absence of success:

```js
// Good negative test example
test('login with wrong password shows error', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[placeholder="johndoe"]', 'user1');
  await page.fill('input[type="password"]', 'wrongpassword');
  await page.click('button[type="submit"]');
  await expect(page.locator('.bg-red-50')).toContainText('Invalid credentials');
  await expect(page).not.toHaveURL('/feed');
});
```

---

## 10. Test Coverage by Module

| Module | Spec File | Positive | Negative | Total |
|--------|-----------|----------|----------|-------|
| Authentication | `auth.spec.js`, `social-platform.spec.js` | 10 | 11 | 21 |
| Settings | `settings.spec.js` | 10 | 6 | 16 |
| Post Management | `social-platform.spec.js`, `advanced-features.spec.js` | 13 | 7 | 20 |
| Stories | `stories.spec.js` | 7 | 2 | 9 |
| Follow / Unfollow | `follow-unfollow.spec.js` | 4 | 2 | 6 |
| Explore & Search | `explore-search.spec.js` | 5 | 5 | 10 |
| Notifications | `notifications.spec.js` | 7 | 1 | 8 |
| Direct Messaging | `chat.spec.js`, `advanced-features.spec.js` | 6 | 3 | 9 |
| Message Reactions | `message-reactions.spec.js` | 3 | 1 | 4 |
| Chat Groups | `groups_and_chat.spec.js` | 7 | 2 | 9 |
| Community Groups | `group-features.spec.js`, `groups_and_chat.spec.js` | 11 | 3 | 14 |
| Profile | `profile.spec.js` | 4 | 2 | 6 |
| Account Management | `account-management.spec.js` | 4 | 1 | 5 |
| Admin & Moderation | `advanced-moderation.spec.js`, `production-pack.spec.js` | 11 | 4 | 15 |
| Personalization | `personalization.spec.js` | 2 | 1 | 3 |
| **Total** | **17 spec files** | **104** | **51** | **155** |

---

## 11. CI/CD Integration

Both test frameworks are configured to run automatically in GitHub Actions on pull requests. Refer to `.github/workflows/` for the pipeline definition.

### GitHub Actions Workflow (recommended)

```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on: [pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd social-ui && npm ci
      - name: Install Playwright browsers
        run: cd social-ui && npx playwright install --with-deps
      - name: Run E2E tests
        run: cd social-ui && npx playwright test
      - name: Upload HTML Report on failure
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: social-ui/playwright-report/
```

### Key CI Behaviours
- Tests run **headlessly** in CI
- HTML report is uploaded as an artifact on failure
- Retries are set to `1` to handle transient network failures
- Workers are set to `1` to prevent database state conflicts between parallel tests

---

## 12. Troubleshooting

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| `Error: browserType.launch: Executable doesn't exist` | Browser not installed | Run `npx playwright install --with-deps` |
| Tests time out waiting for elements | Backend not running or slow | Ensure all 6 services are running; increase `timeout` in config |
| Real-time tests fail intermittently | WebSocket connection race | Increase socket wait timeout to 8–10 seconds; use `page.waitForSelector` |
| Admin tests fail with 403 | Wrong user role for test | Ensure `adminUser` has `ADMIN` role in DB seed data |
| Story expiry test fails | Time manipulation needed | Seed a story with past `expiresAt` or adjust backend cleanup job schedule |
| Login test fails after account deletion test | Shared state between tests | Ensure test isolation; re-seed database or use `beforeEach` hooks |
