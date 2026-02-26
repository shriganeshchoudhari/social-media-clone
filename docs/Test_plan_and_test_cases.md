# Test Plan and Test Cases

## 1. Test Strategy
The application utilizes a comprehensive, multi-layered testing strategy to ensure reliability and performance.
- **Unit Testing**: Testing individual Java classes and React components.
- **Integration Testing**: Verifying interactions between Spring components and databases (using Testcontainers).
- **End-to-End (E2E) Testing**: Simulating real user flows via browser automation.
- **API Testing**: Validating RESTful endpoints via Postman scripts.

## 2. Environments
- **Local Dev**: In-memory H2 database (for Spring unit tests) or local Dockerized PostgreSQL/MongoDB.
- **CI/CD Pipeline**: GitHub Actions running automated checks on every push.

## 3. Test Tools
- **Backend Unit/Integration**: JUnit 5, Mockito, Spring Boot Test.
- **Frontend Unit**: Vitest, React Testing Library.
- **E2E Automation**: Playwright and Cypress.
- **API Automation**: Postman + Newman.

## 4. Test Scenarios (Highlight)
### Frontend E2E
1. **User Login Flow**: Verify that entering valid credentials correctly updates the auth context and redirects to the feed.
2. **Post Creation**: Verify a user can type a status, click "Post", and see it appear at the top of the feed immediately.
3. **Admin Controls**: Verify that an Admin user logs in and can see the "Delete" options on any user's post.

### Backend Unit
1. **JWT Generation**: Verify `JwtUtils` generates a valid token with correct claims given a User Principal.
2. **Follow Logic**: Verify `FollowService` throws an exception if a user tries to follow themselves.
3. **Chat WebSocket**: Verify messages published to a specific group channel are broadcasted successfully to all active subscribers.

## 5. Bug Tracking
Bugs identified during manual exploratory or automated testing are categorized by severity and recorded in the repository's Issue Tracker. E2E failures generate screenshots and `lint_errors.txt`/`test_failure.txt` logs.
