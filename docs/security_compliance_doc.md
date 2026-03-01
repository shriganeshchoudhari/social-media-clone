# Security & Compliance Document

## 1. Overview
This document details the security architecture, mechanisms, and best practices protecting the Social Media Clone's data, infrastructure, and user privacy. It covers the full stack: Spring Boot backend, React frontend, and the underlying databases.

---

## 2. Authentication & Authorization

### JWT (JSON Web Tokens)
- **Technology**: Stateless session management using `io.jsonwebtoken (JJWT)`.
- **Algorithm**: HS256 (HMAC-SHA256) with a secret key stored in `application.yml` or environment variables. **Never hardcoded.**
- **Token Expiry**: Configurable (default: 86400 seconds — 24 hours).
- **Token Invalidation**: Each `User` entity stores a `tokenVersion` integer. On password change, this is incremented. The JWT filter validates the `tokenVersion` claim stored in the token against the database, effectively invalidating all previously issued tokens.
- **Token Transmission**: Tokens are sent in the `Authorization: Bearer <token>` HTTP header, never in a URL, query parameter, or cookie.

### Password Security
- All passwords are hashed using **BCryptPasswordEncoder** with a strength factor of 10 (default in Spring Security), producing individual random salts per password.
- Plain-text passwords are **never** stored, logged, or returned in API responses.
- Password change endpoint validates the old password before allowing an update.
- Minimum password length: 6 characters (configurable).

### Role-Based Access Control (RBAC)
- Two roles are defined: `USER` (standard) and `ADMIN`.
- Admin routes are protected by Spring Security's `@PreAuthorize("hasRole('ADMIN')")` annotation.
- The SecurityConfig defines public routes (registration, login) and protects all others with `authenticated()`.
- Admin checks are also enforced at the service level for critical actions.

---

## 3. Data Protection

### CORS (Cross-Origin Resource Sharing)
- Configured in `SecurityConfig` via `CorsConfigurationSource`.
- Allowed origins are explicitly whitelisted. In development, this is typically `http://localhost:5173` (Vite dev server).
- **In production**, only the verified frontend domain should be whitelisted. Wildcard `*` origins should **never** be used in production.

### SQL Injection Prevention
- Spring Data JPA / Hibernate uses **parameterized queries exclusively**. User input is never interpolated directly into SQL strings.
- JPQL and named parameter usage prevents any raw SQL construction with user data.

### XSS (Cross-Site Scripting) Prevention
- **React's JSX** auto-escapes all values rendered into the DOM by default. Unescaped rendering (`dangerouslySetInnerHTML`) is not used anywhere in this codebase.
- All API responses are `Content-Type: application/json`, which are not executed by the browser as HTML.

### CSRF (Cross-Site Request Forgery)
- **Disabled** in `SecurityConfig`, as is standard for stateless REST APIs using Bearer token authentication. Since JWT tokens are sent via the `Authorization` header (not Cookies), CSRF attacks are not applicable.

### User Data Isolation
- The `Authentication` object from Spring Security's context is always used (never user-supplied parameters) to determine the "current" user for sensitive operations.
- For example, creating a post always sets `authorId` from the authenticated user, never from the request body.

---

## 4. API Security & Rate Limiting

### Rate Limiting (Bucket4j)
- Implemented via the **Bucket4j** library integrated as a Spring filter.
- Prevents brute-force attacks on the `/auth/login` endpoint (e.g., a max of 20 requests per minute per IP).
- Also provides general API abuse prevention (DDoS mitigation) for all endpoints.
- Rate limit state is stored in **Redis**, enabling distributed rate limiting across multiple backend instances.

### WebSocket Security (STOMP over WebSockets)
- The WebSocket handshake endpoint `/ws` is secured.
- On STOMP `CONNECT`, clients must supply the JWT token in the `Authorization` header.
- The JWT is validated before the connection is established, preventing anonymous connections to real-time data channels.

---

## 5. File Upload Security

- Uploaded files (images for posts, stories, profile avatars, etc.) are stored on the local filesystem or cloud storage, not in the database.
- The backend validates file MIME types before storing them to prevent executable file uploads.
- Stored files are served via a controlled endpoint (`/uploads/**`) that is separate from the API logic.
- Directory traversal attacks are prevented by using `Path.resolve()` with the configured upload directory as the root.

---

## 6. Infrastructure & Secrets Management

### Environment Variables & Secrets
- **All secrets** (database credentials, JWT secret, API keys) are stored as environment variables or in `application-prod.yml` which is excluded from version control via `.gitignore`.
- The `application.yml` committed to GitHub contains only placeholder values or points to `${ENV_VAR}` references.
- `.env` files containing real secrets are added to `.gitignore`.

### Dependency Management
- Backend runs on **Java 21 LTS**, which includes the latest security patches from Oracle/OpenJDK.
- `pom.xml` dependencies are regularly reviewed for known CVEs using `mvn dependency-check`.

### API Exposure
- In development, only `localhost` is used.
- For external access (e.g., using Ngrok tunnels for testing), tunnels should be treated as temporary and revoked after use. Access tokens or Ngrok auth headers can be used to restrict tunnel access.

---

## 7. User Privacy

| Feature | Implementation |
|---|---|
| Follow/Follower data | Only accessible to authenticated users |
| Private profile | When `isPrivate = true`, the user's posts are not included in the public feed |
| Block | Blocking a user prevents them from seeing your content and messaging you |
| Account deletion | Triggers cascade deletion of all posts, likes, comments, follows, and blocks |
| Notifications | Each user only has access to their own notification stream |

---

## 8. Known Limitations & Future Improvements

| Area | Current State | Recommended Improvement |
|---|---|---|
| Elasticsearch | Partially disabled | Re-enable with proper authentication |
| HTTPS | Not enforced locally | Enforce TLS in production behind a reverse proxy (Nginx + Let's Encrypt) |
| Refresh Tokens | Not implemented | Add short-lived access tokens + long-lived refresh tokens for higher security |
| 2FA | Not implemented | Consider TOTP (Time-based One-Time Password) for admin accounts |
| Audit Logging | Partial (via ActivityLogService) | Centralize logs to ELK stack in production |
