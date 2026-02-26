# Technical Design Document (TTD)

## 1. Architecture Overview
The Social Media Clone is built as a monolithic client-server architecture with real-time capabilities. It separates concerns between a React-based single-page application (SPA) frontend and a Spring Boot RESTful API backend.

## 2. System Components
### Backend (Spring Boot)
- **Core Framework**: Spring Boot 3.3.2 running on Java 21.
- **Security**: Spring Security with JWT (JSON Web Tokens) for stateless authentication.
- **Real-Time Communication**: Spring WebSocket for chat and notifications, using STOMP protocol.
- **Data Access**: Spring Data JPA for relational data, Spring Data MongoDB for NoSQL data.

### Frontend (React + Vite)
- **Framework**: React 18, Vite for fast bundling.
- **Styling**: Tailwind CSS for utility-first styling.
- **Routing**: React Router DOM.
- **Real-Time Client**: `@stomp/stompjs` and `sockjs-client` for connecting to backend WebSockets.
- **State Management & Data Fetching**: Standard React hooks and Context API, along with Axios for HTTP requests.

## 3. Technology Stack & Databases
- **Relational Database**: PostgreSQL (configured via Flyway for migrations) - stores structured data like Users, Roles, Posts, Groups, and standard relationships.
- **NoSQL Database**: MongoDB - likely used for unstructured or high-volume data like chat message histories or telemetry.
- **Caching & Key-Value Store**: Redis - used for rate-limiting (via Bucket4j), temporary tokens, session caching, and fast lookups.
- **Search Engine**: Elasticsearch - used for advanced, full-text search across users, posts, and groups.
- **Observability**: Prometheus & Spring Boot Actuator for health checks and metrics.

## 4. Key Workflows
- **Authentication Flow**: Client posts credentials -> Server validates and issues JWT -> Client stores JWT and attaches to `Authorization: Bearer` header in subsequent requests.
- **Real-Time Messaging Flow**: Client connects to STOMP endpoint (`/ws`) -> Subscribes to user-specific or group-specific topic -> Server routes messages via message broker -> Client receives payload and updates UI.
