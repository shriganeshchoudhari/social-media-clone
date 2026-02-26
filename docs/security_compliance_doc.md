# Security Compliance Document

## 1. Overview
This document details the security mechanisms protecting the Social Media Clone data, infrastructure, and user privacy. 

## 2. Authentication & Authorization
- **JWT (JSON Web Tokens)**: Used for stateless session management. Tokens are signed with a secure, random secret key and expire after a set duration.
- **Passwords**: Hashed and salted using `BCryptPasswordEncoder` before storage. Plain-text passwords are never logged or stored.
- **Role-Based Access Control (RBAC)**: Enforced via Spring Security's `@PreAuthorize("hasRole('ADMIN')")` and filter chains to differentiate between standard `USER` and `ADMIN` privileges.

## 3. Data Protection
- **CORS Configuration**: Restricted to trusted frontend origins (e.g., typically `http://localhost:5173` for Vite in dev, or specific production domains).
- **SQL Injection Prevention**: Spring Data JPA and Hibernate strictly use parameterized queries.
- **XSS Prevention**: React automatically escapes values injected into the DOM, preventing Cross-Site Scripting.
- **CSRF Protection**: Typically disabled for stateless API designs using JWT, as tokens are passed via the `Authorization` header rather than cookies.

## 4. API Security & Rate Limiting
- **Rate Limiting**: Implemented via **Bucket4j** to prevent brute-force attacks on login endpoints and to manage general API abuse (DDoS mitigation).
- **WebSockets Security**: STOMP over WebSockets endpoints require a valid JWT token upon connection initialization before subscribing to channels.

## 5. Vulnerability Management
- Server runs on Java 21 with regular library updates to patch known CVEs.
- Environment configurations `.env` and application secrets (DB credentials) are never committed to the frontend repository. Backend configuration overrides these via environment variables in production.
