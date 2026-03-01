# Test Plan & Test Cases

## 1. Introduction

This document defines the comprehensive testing strategy, test environments, test tools, and individual test cases for the Social Media Clone application. It covers all layers: backend unit tests, API integration tests, and end-to-end frontend tests.

---

## 2. Testing Strategy

The application follows the **Test Pyramid** approach with three layers:

```
         /‾‾‾‾‾‾‾‾\
        /  E2E Tests  \       (Few, slow, high confidence)
       / (Playwright)  \
      /-----------------\
     /  Integration Tests \    (Medium — API-level)
    /    (Postman/Newman)  \
   /---------------------------\
  /      Unit Tests            \   (Many, fast, focused)
 /   (JUnit 5 + Vitest)         \
/-------------------------------\
```

| Layer | Tools | Purpose |
|---|---|---|
| Unit | JUnit 5, Mockito, Vitest, React Testing Library | Test isolated functions/components |
| Integration/API | Postman, Newman, Spring Boot Test | Test REST endpoints end-to-end |
| E2E | Playwright, Cypress | Simulate real user browser interactions |

---

## 3. Test Environments

### 3.1 Local Development
- Backend running at `http://localhost:8080`
- Frontend running at `http://localhost:5173`
- All databases running in Docker containers
- Use `local.postman_environment.json` (sets `{{baseUrl}}` to `http://localhost:8080/api`)

### 3.2 CI/CD Pipeline (GitHub Actions)
- Backend and frontend are started as services in the GitHub Actions workflow.
- All databases are launched as dockerized service containers in the pipeline.
- Tests run headlessly and upload HTML reports as build artifacts on failure.
- Triggered on: every `push` and `pull_request` to the `main` branch.

---

## 4. Backend Unit Tests

### 4.1 Tools
- **JUnit 5**: Test framework
- **Mockito**: Mocking dependencies (e.g., Repositories, Services)
- **Spring Boot Test**: `@SpringBootTest`, `@WebMvcTest`, `@DataJpaTest` slices

### 4.2 Key Test Classes

| Test Class | Scope | Key Assertions |
|---|---|---|
| `JwtUtilsTest` | JwtUtils | Token generated correctly, expired token rejected, token version mismatch rejected |
| `FollowServiceTest` | FollowService | Self-follow throws exception, block prevents follow, follow/unfollow toggles correctly |
| `UserServiceTest` | UserService | Profile returned with correct counts, password change invalidates token version |
| `PostServiceTest` | PostService | Feed returns paginated posts, non-owner delete throws `AccessDeniedException` |
| `ChatMessageTest` | MongoDB integration | Message saved to MongoDB, inbox retrieval is correct |

### 4.3 Sample Test Case: Self-Follow Prevention
```java
@Test
void toggleFollow_shouldThrowException_whenFollowingSelf() {
    assertThrows(RuntimeException.class, () ->
        followService.toggleFollow("alice_w", "alice_w")
    );
}
```

---

## 5. Frontend Unit Tests

### 5.1 Tools
- **Vitest**: Fast unit test runner (Vite-compatible)
- **React Testing Library**: Component rendering and user event simulation

### 5.2 Key Tests

| Component | Test | Assertion |
|---|---|---|
| `Login.jsx` | Render & Submit | Form elements present; on submit, `axios.post /auth/login` is called |
| `PostCard.jsx` | Render | Displays username, content, like count |
| `PostCard.jsx` | Like Toggle | Clicking Like button triggers `POST /posts/:id/like` |
| `Navbar.jsx` | Dark Mode Toggle | Clicking toggle adds/removes `dark` class on `<html>` |
| `VerificationBadge.jsx` | Render | Badge renders when `verified=true`, absent when `verified=false` |

---

## 6. API Integration Tests (Postman / Newman)

### 6.1 Test Suite Structure
The full Postman collection is organized by feature module:
1. **Auth** — Registration, Login, Invalid tokens
2. **Users** — Profile retrieval, Search, Follow/Block
3. **Posts** — Create, Read, Like, Comment, Delete
4. **Groups** — Create, Join, List members
5. **Chat** — Send DM, Get inbox, Create group chat
6. **Admin** — Warn, Suspend, Verify, Unsuspend

### 6.2 Environment Variables
All tests use dynamic environment variables to chain requests:

```javascript
// Login test — post-response script
pm.test("Status is 200", () => pm.response.to.have.status(200));
const token = pm.response.json().token;
pm.environment.set("authToken", token);
```

### 6.3 Assertion Patterns
Every test case includes at minimum:
1. **Status Code Check**: `pm.response.to.have.status(201)`
2. **Response Schema Check**: Key fields present and of correct type.
3. **Business Logic Check**: (e.g., after adding a comment, the comment count increments)

### 6.4 Running Tests via Newman
```bash
# Install Newman globally
npm install -g newman newman-reporter-htmlextra

# Run the full collection
newman run docs/Social_Media_Clone_API.postman_collection.json \
  --environment docs/local.postman_environment.json \
  --reporters cli,htmlextra \
  --reporter-htmlextra-export docs/newman-report.html
```

---

## 7. End-to-End (E2E) Tests

### 7.1 Playwright

#### Configuration (`playwright.config.js`)
```javascript
module.exports = defineConfig({
  testDir: './tests',
  baseURL: 'http://localhost:5173',
  use: { headless: true, screenshot: 'only-on-failure' },
  reporter: [['html'], ['line']]
});
```

#### Key Test Scenarios

| Test File | Scenario | Steps |
|---|---|---|
| `auth.spec.js` | Valid login | Navigate to `/login`, fill email/password, click Login, assert redirect to `/feed` |
| `auth.spec.js` | Invalid login | Enter wrong password, assert error toast is shown |
| `post.spec.js` | Create post | Navigate to Feed, open create post modal, type text, click Post, assert new post appears |
| `profile.spec.js` | View profile | Click on a username in feed, assert `/profile/:username` loads with correct info |
| `admin.spec.js` | Admin login | Log in as admin, verify user menu shows admin-specific options |

#### Running Playwright Tests
```bash
# Run all tests headlessly
npx playwright test

# Run in UI mode for debugging
npx playwright test --ui

# Run specific file
npx playwright test tests/auth.spec.js

# Generate and view HTML report
npx playwright show-report
```

### 7.2 Cypress

#### Configuration (`cypress.config.js`)
```javascript
module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.js',
    video: true,
    screenshotOnRunFailure: true,
  }
});
```

#### Key Test Files (`cypress/e2e/`)

| Spec File | Scenarios |
|---|---|
| `login.cy.js` | Valid login, invalid credentials |
| `register.cy.js` | Successful registration, duplicate email error |
| `feed.cy.js` | Feed loads posts, infinite scroll works |
| `chat.cy.js` | Send message, message appears in history |
| `profile.cy.js` | Followers modal opens/closes, bio visible |

#### Running Cypress Tests
```bash
# Open interactive test runner
npx cypress open

# Run headlessly
npx cypress run

# Run specific spec
npx cypress run --spec "cypress/e2e/login.cy.js"
```

---

## 8. Test Coverage Goals

| Layer | Coverage Target |
|---|---|
| Backend Unit Tests | > 70% line coverage on `Service` classes |
| API Integration Tests | 100% of Controller endpoints (positive + negative) |
| E2E Frontend Tests | All critical user flows (login, post, chat, profile) |

---

## 9. Bug Classification & Tracking

| Severity | Definition | SLA |
|---|---|---|
| **P1 — Critical** | Core functionality broken (login, auth, data corruption) | Fix within 24h |
| **P2 — High** | Feature not working, workaround exists | Fix within 3 days |
| **P3 — Medium** | Cosmetic, performance, or minor UX issue | Fix in next sprint |
| **P4 — Low** | Nice-to-have improvement | Backlog |

All bugs are documented in [GitHub Issues](https://github.com/shriganeshchoudhari/social-media-clone/issues) with:
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (E2E failures include automatic screenshots)
- Severity label
