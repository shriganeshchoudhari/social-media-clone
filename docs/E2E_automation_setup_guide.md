# E2E Automation Setup & Execution Guide

## 1. Introduction
This guide walks you through the setup and execution of the Playwright test suite for the Social Media Clone frontend (`social-ui`).

---

## 2. Prerequisites
Before running tests, ensure all of the following are active:

| Service | URL |
|---------|-----|
| Frontend (`npm run dev`) | `http://localhost:5173` |
| Backend (`mvn spring-boot:run`) | `http://localhost:8080` |
| PostgreSQL | port `5432` |
| MongoDB | port `27017` |
| Redis | port `6379` |
| Elasticsearch | port `9200` |

**Node.js** v18+ required.

---

## 3. Setup

```bash
# Navigate to frontend directory
cd social-ui

# Install dependencies (first time only)
npm install

# Install Playwright browser binaries (first time only)
npx playwright install --with-deps
```

---

## 4. Running Tests

### Run all tests (headless)
```bash
npx playwright test
```

### Run in headed mode (watch the browser)
```bash
npx playwright test --headed
```

### Run in interactive UI mode (best for debugging)
```bash
npx playwright test --ui
```

### View HTML report after a run
```bash
npx playwright show-report
```

---

## 5. Module-by-Module Execution Plan

Run each module individually to isolate failures. All commands run from `social-ui/`:

| # | Module | Command |
|---|--------|---------|
| 1 | Authentication | `npx playwright test tests/social-platform.spec.js --grep "Authentication"` |
| 2 | Settings | `npx playwright test tests/settings.spec.js` |
| 3 | Post Management (text) | `npx playwright test tests/social-platform.spec.js --grep "Post Management"` |
| 4 | Post Upload (single image) | `npx playwright test tests/post_upload.spec.js` |
| 5 | Multi-Image Posts | `npx playwright test tests/multi-image.spec.js` |
| 6 | Post Edit & Delete | `npx playwright test tests/advanced-features.spec.js --grep "edit and delete"` |
| 7 | Follow / Unfollow | `npx playwright test tests/follow-unfollow.spec.js` |
| 8 | Bookmark / Save | `npx playwright test tests/bookmark.spec.js` |
| 9 | Stories | `npx playwright test tests/stories.spec.js` |
| 10 | Explore & Search | `npx playwright test tests/explore-search.spec.js` |
| 11 | Notifications | `npx playwright test tests/notifications.spec.js` |
| 12 | Direct Messaging | `npx playwright test tests/chat.spec.js` |
| 13 | Chat Image Sending | `npx playwright test tests/advanced-features.spec.js --grep "send image"` |
| 14 | Message Reactions | `npx playwright test tests/message-reactions.spec.js` |
| 15 | Community & Chat Groups | `npx playwright test tests/groups_and_chat.spec.js` |
| 16 | Account & Privacy | `npx playwright test tests/account-management.spec.js` |
| 17 | Personalization | `npx playwright test tests/personalization.spec.js` |
| 18 | Admin Moderation | `npx playwright test tests/advanced-moderation.spec.js tests/production-pack.spec.js` |

### Run full regression suite
```bash
npx playwright test
npx playwright show-report
```

---

## 6. Useful Flags

```bash
# Run with headed browser for any spec
npx playwright test tests/<file>.spec.js --headed

# Run a specific test by name
npx playwright test --grep "follow button toggles"

# Run only failed tests from last run
npx playwright test --last-failed

# Run with retries (useful in flaky network)
npx playwright test --retries=2
```

---

## 7. Test Fixtures

Test fixture files are in `tests/fixtures/`:
- `test-image.svg` — used by image upload, story, and chat image tests

---

## 8. Configuration

Playwright config: `playwright.config.js`

| Setting | Value |
|---------|-------|
| `baseURL` | `http://localhost:5173` |
| `workers` | `1` (sequential, avoids race conditions) |
| `reporter` | `html` |
| `screenshot` | `only-on-failure` |
| `video` | `retain-on-failure` |

---

## 9. CI/CD

Both test frameworks are configured to run automatically in GitHub Actions on pull requests. Refer to `.github/workflows/` for the pipeline definition. Tests run headlessly and upload HTML artifacts on failure.


