# E2E Automation Setup & Execution Guide

## 1. Introduction
This guide walks you through the setup and execution of the Playwright and Cypress test suites intended for validating the Social Media Clone frontend (`social-ui`).

## 2. Prerequisites
Before running UI automation tests, ensure you have the following ready:
1. **Node.js** (v18+) installed.
2. The **Backend application** must be up and running locally at `http://localhost:8080`.
3. The **Frontend application** must be served locally at `http://localhost:5173` (either via `npm run dev` or the production build preview).
4. All databases (PostgreSQL, MongoDB, Redis, Elasticsearch) are active.

## 3. Setup Dependencies
Navigate to the frontend directory and install the necessary testing libraries (if not already done via standard `npm install`).
```bash
cd f:\DEVOPS\social-media-clone\social-ui
npm install
```

### Install Playwright Browsers
Playwright requires its own specific browser binaries to run tests cross-browser.
```bash
npx playwright install --with-deps
```

## 4. Running Playwright Tests

Playwright configuration is managed in `playwright.config.js`.

### Run all tests in headless mode (Default)
```bash
npx playwright test
```

### Run tests in UI Mode
This is highly recommended for debugging. It opens a visual test runner where you can inspect DOM, network requests, and step through tests.
```bash
npx playwright test --ui
```

### Run a specific test file
```bash
npx playwright test tests/chat.spec.js
```

### View Playwright HTML Report
If tests fail, Playwright generates a detailed report. To view it:
```bash
npx playwright show-report
```

## 5. Running Cypress Tests

Cypress configuration is managed in `cypress.config.js`.

### Open the Cypress Test Runner (Interactive Mode)
Recommended for test development and debugging.
```bash
npx cypress open
```
This will open the Cypress Launchpad. Select "E2E Testing" and choose a browser to run the tests visually.

### Run Cypress tests headlessly
To run all tests in the terminal without opening a GUI (ideal for CI/CD pipelines):
```bash
npx cypress run
```

### Run a specific Cypress test module
```bash
npx cypress run --spec "cypress/e2e/login.cy.js"
```

## 6. Continuous Integration (CI/CD)
Both test frameworks are configured to run automatically in GitHub Actions on pull requests and commits to the main branch. 
- Refer to the `.github/workflows` directory (if configured) for the pipeline definition.
- Pipeline tests run completely headlessly and upload HTML artifacts on failure for debugging.
