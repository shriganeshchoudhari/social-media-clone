# E2E Automation Test Cases

## 1. Overview
This document outlines the End-to-End (E2E) automation test cases developed for the Social Media Clone using **Playwright** and **Cypress**. These tests validate core user flows from the frontend interface down to the backend services.

## 2. Playwright Test Suites (Located in `tests/`)
Playwright is primarily used for comprehensive UI testing, cross-browser support, and complex user interactions (like WebSockets).

### 2.1. Account Management (`account-management.spec.js`)
- **TC_AM_01**: Verify successful user registration with valid data.
- **TC_AM_02**: Verify successful login and feed redirection.
- **TC_AM_03**: Verify error handling on invalid login credentials.
- **TC_AM_04**: Verify user logout functionality.

### 2.2. Social Platform Core (`social-platform.spec.js` & `post_upload.spec.js`)
- **TC_SP_01**: Verify a user can create a standard text post.
- **TC_SP_02**: Verify a user can create a post containing multiple images (`multi-image.spec.js`).
- **TC_SP_03**: Verify liking and unliking a post accurately updates the interaction count.
- **TC_SP_04**: Verify adding a comment to a post displays it immediately in the UI.

### 2.3. Real-Time Chat (`chat.spec.js` & `groups_and_chat.spec.js`)
- **TC_CH_01**: Verify user can start a direct message with a followed user.
- **TC_CH_02**: Verify messages sent appear in real-time on both sender's and receiver's screens (WebSocket validation).
- **TC_CH_03**: Verify creation of a new Chat Group.
- **TC_CH_04**: Verify broadcast message to all users in a specific Chat Group.

### 2.4. Advanced Features & Moderation (`advanced-features.spec.js`, `advanced-moderation.spec.js`, `settings.spec.js`)
- **TC_AF_01**: Verify Search functionality for users and posts using Elasticsearch backend.
- **TC_AF_02**: Verify user settings update (e.g., changing bio or visual preferences) (`settings.spec.js`).
- **TC_AF_03**: Verify Admin role can delete inappropriate posts.
- **TC_AF_04**: Verify Admin role can ban/suspend users from the moderation panel.
- **TC_AF_05**: Verify push notifications trigger upon receiving a new comment or message.

## 3. Cypress Test Suites (Located in `cypress/e2e/`)
Cypress is utilized for rapid component integration checks and developer-friendly local flow testing.

### 3.1. General Flow tests
- **TC_CY_01**: Verify homepage rendering without authentication (marketing/login redirect).
- **TC_CY_02**: Verify responsive layouts behave correctly on mobile viewports.
- **TC_CY_03**: Verify network error handling gracefully shows a fallback UI or toast notification when the API is down.
