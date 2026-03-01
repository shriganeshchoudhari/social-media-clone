# API Documentation

## 1. Introduction

The Social Media Clone backend API is a RESTful service built with **Spring Boot 3 + Java 21**. It serves all frontend interactions and third-party integrations. The API uses JSON as the primary data format for both request and response bodies.

- **Base URL**: `http://localhost:8080/api`
- **Interactive Docs**: Swagger/OpenAPI UI available at `http://localhost:8080/swagger-ui.html`
- **Content-Type**: `application/json` (unless stated otherwise, e.g., file uploads use `multipart/form-data`)

---

## 2. Authentication

All endpoints (except `/auth/register` and `/auth/login`) require a valid JWT Bearer token.

### Header Format
```
Authorization: Bearer <jwt_token>
```

### Token Lifecycle
- Tokens expire after a configurable duration (default: 86400 seconds / 24 hours).
- Token version (stored on the User entity) is incremented when a user changes their password, which effectively invalidates all existing tokens.
- On failure, the API returns `401 Unauthorized`.

---

## 3. Core REST Endpoints

### 3.1 Authentication (`/auth`)

#### `POST /api/auth/register`
Register a new user account.
- **Request Body (JSON)**:
  ```json
  { "username": "john_doe", "email": "john@example.com", "password": "securePass1" }
  ```
- **Success Response**: `201 Created` – Returns the created user object (without password).
- **Failure Responses**:
  - `400 Bad Request` – Email already exists, username taken, or validation failure (e.g. password too short).

#### `POST /api/auth/login`
Authenticate a user and receive a JWT.
- **Request Body (JSON)**:
  ```json
  { "email": "john@example.com", "password": "securePass1" }
  ```
- **Success Response**: `200 OK`
  ```json
  { "token": "<jwt_string>", "username": "john_doe", "role": "USER" }
  ```
- **Failure Responses**:
  - `401 Unauthorized` – Incorrect credentials.
  - `403 Forbidden` – Account is suspended or banned.

---

### 3.2 Users (`/users`)

#### `GET /api/users/me`
Get the currently authenticated user's profile details.
- **Success**: `200 OK` – Returns `ProfileResponse` including `followersCount`, `followingCount`, `postCount`, `bio`, `profileImageUrl`, `bannerImage`, `verified`.
- **Failure**: `401 Unauthorized` if token is missing or invalid.

#### `GET /api/users/{username}`
Get the public profile of a specific user by their username.
- **Success**: `200 OK` – Returns `ProfileResponse` plus `following: true/false` indicating if the requesting user follows the target.
- **Failure**: `404 Not Found` if the username does not exist.

#### `PUT /api/users/me`
Update the authenticated user's profile. Uses `multipart/form-data`.
- **Form Fields** (all optional): `bio` (text), `website` (text), `interests` (text list), `avatar` (image file), `banner` (image file).
- **Success**: `200 OK` – Returns the updated `User` entity.
- **Failure**: `400 Bad Request` on validation failure.

#### `GET /api/users/search?q={query}`
Search for users by username.
- **Query Param**: `q` — partial or full username string.
- **Success**: `200 OK` – Returns an array of `UserSearchResponse` objects `[{username, bio, profileImageUrl}]`.
- **Failure**: `200 OK` with empty array if no results found.

#### `GET /api/users/{username}/followers`
Retrieve the list of usernames who follow the target user.
- **Success**: `200 OK` – Returns `["alice_w", "bob_builder", ...]`.

#### `GET /api/users/{username}/following`
Retrieve the list of usernames the target user is following.
- **Success**: `200 OK` – Returns `["george_k", "ian_t", ...]`.

#### `POST /api/users/{username}/follow`
Toggle follow/unfollow for the given username. Idempotent.
- **Success**: `200 OK` – Follow created or removed. Cache evicted for the target user's profile.
- **Failure**: `400 Bad Request` if attempting to follow yourself, or if blocked.

#### `POST /api/users/{username}/block`
Toggle block/unblock for the given username. Blocking automatically unfollows both parties.
- **Success**: `200 OK` – Returns the updated block status.
- **Failure**: `400 Bad Request` if attempting to block yourself.

---

### 3.3 Posts (`/posts`)

#### `GET /api/posts/feed`
Retrieve a paginated feed of posts from users the requester follows.
- **Query Params**: `page` (default: 0), `size` (default: 10).
- **Success**: `200 OK` – Returns a page of `PostResponse` objects, each containing: `id`, `content`, `authorUsername`, `authorVerified`, `images: [urls]`, `likeCount`, `commentCount`, `liked: true/false`, `createdAt`.

#### `POST /api/posts`
Create a new text or image post. Uses `multipart/form-data`.
- **Form Fields**: `content` (text, required), `images` (file[], optional, up to 4).
- **Success**: `201 Created` – Returns the created post object.

#### `DELETE /api/posts/{id}`
Delete a post. Only the post author or an Admin may perform this action.
- **Success**: `204 No Content`.
- **Failure**: `403 Forbidden` if the user is not the owner or an admin.

#### `POST /api/posts/{id}/like`
Toggle like/unlike on a post. Sending request a second time undoes the like.
- **Success**: `200 OK`.

#### `GET /api/posts/{id}/comments`
Retrieve paginated comments for a specific post.
- **Success**: `200 OK` – Returns a list of comments with `content`, `authorUsername`, `createdAt`.

#### `POST /api/posts/{id}/comments`
Add a comment to a post.
- **Request Body**: `{ "content": "Great post!" }`
- **Success**: `201 Created` – Returns the created comment.

#### `GET /api/trending`
Retrieve the current trending topics / hashtags across the platform.
- **Success**: `200 OK` – Returns a list of `TrendingTopic` objects `[{tag: "#Spring", count: 45}]`.

---

### 3.4 Stories (`/stories`)

#### `POST /api/stories`
Upload a new ephemeral story (image or video). Valid for 24 hours.
- **Form Fields**: `media` (file, required).
- **Success**: `201 Created`.

#### `GET /api/stories/feed`
Get active stories from users the authenticated user follows.
- **Success**: `200 OK` – Returns grouped story data by user.

---

### 3.5 Follow & Social Graph (`/users`)

Refer to Section 3.2 for `/follow`, `/followers`, and `/following` endpoints.

---

### 3.6 Groups (`/groups`)

#### `GET /api/groups`
List all discoverable groups.
- **Success**: `200 OK` – Returns array of group objects.

#### `POST /api/groups`
Create a new community group.
- **Request Body**: `{ "name": "Tech Enthusiasts", "description": "...", "isPrivate": false }`
- **Success**: `201 Created`.

#### `POST /api/groups/{id}/join`
Join or leave a group (toggle).
- **Success**: `200 OK`.

#### `GET /api/groups/{id}/members`
List all members of a specific group with their roles.
- **Success**: `200 OK` – Returns `[{username, role: "MEMBER" | "ADMIN"}]`.

---

### 3.7 Chat (`/chat`)

#### `POST /api/chat/send/{username}`
Send a direct text message to a user.
- **Request Body**: `{ "content": "Hey there!" }`
- **Success**: `200 OK` or `201 Created`.

#### `POST /api/chat/send/{username}/image`
Send an image file in a direct message.
- **Form Fields**: `image` (file).
- **Success**: `200 OK`.

#### `GET /api/chat/messages/{username}`
Retrieve the complete message history with a specific user.
- **Success**: `200 OK` – Returns a chronologically sorted list of `ChatMessage` objects including `readStatus` and `timestamp`.

#### `GET /api/chat/inbox`
Retrieve all active direct message conversation threads for the authenticated user.
- **Success**: `200 OK` – Returns array of conversation summaries with last message and unread count.

#### `POST /api/chat/group/create`
Create a new multi-user group chat.
- **Request Body**: `{ "name": "Weekend Trip", "memberUsernames": ["alice_w", "bob_builder"] }`
- **Success**: `201 Created` – Returns the new group chat's ID.

#### `POST /api/chat/group/{groupId}/send`
Broadcast a message to a multi-user chat group.
- **Request Body**: `{ "content": "See you all Saturday!" }`
- **Success**: `200 OK`.

#### `GET /api/chat/group/{groupId}/messages`
Retrieve message history for a group chat.
- **Success**: `200 OK` – Returns list of messages with sender info.

#### `POST /api/chat/group/{groupId}/add`
Add a new user to an existing group chat.
- **Request Body**: `{ "username": "charlie_d" }`
- **Success**: `200 OK`.

---

### 3.8 Events (`/events`)

#### `POST /api/events`
Create a new event.
- **Request Body**: `{ "title": "Annual Hackathon", "description": "...", "eventDate": "2025-06-01T09:00:00", "groupId": 5 }`
- **Success**: `201 Created`.

#### `POST /api/events/{eventId}/join`
RSVP / join an event.
- **Success**: `200 OK`.

#### `GET /api/events/group/{groupId}`
List all events associated with a specific group.
- **Success**: `200 OK` – Returns event list.

---

### 3.9 Administration (`/admin`)

All admin endpoints require `ROLE_ADMIN`.

#### `GET /api/admin/users`
Retrieve a paginated list of all registered users.
- **Success**: `200 OK`.

#### `POST /api/admin/warn/{username}`
Send a warning to a user (increments the user's `warningCount`).
- **Success**: `200 OK`.

#### `POST /api/admin/suspend/{username}?days={days}`
Suspend a user for a specified number of days. They will be barred from logging in.
- **Success**: `200 OK`.

#### `POST /api/admin/unsuspend/{username}`
Lift a suspension on a user immediately.
- **Success**: `200 OK`.

#### `POST /api/admin/verify/{username}`
Grant the verified badge to a user. Sets `verified = true`.
- **Success**: `200 OK`.

#### `DELETE /api/admin/posts/{id}`
Delete any post as an administrator.
- **Success**: `204 No Content`.

---

## 4. Real-Time WebSockets

| Endpoint | Protocol | Description |
|---|---|---|
| `/ws` | SockJS/STOMP | Base endpoint for WebSocket connections |

### Subscribable Topics
| Topic | Description |
|---|---|
| `/topic/group/{groupId}` | Receive real-time group chat messages |
| `/user/queue/private` | Receive real-time direct messages |
| `/user/queue/notifications` | Receive real-time push notifications (likes, follows, new messages) |

### Connection Authentication
On the STOMP `CONNECT` frame, clients must pass the JWT:
```javascript
stompClient.connect({ Authorization: `Bearer ${token}` }, onConnected);
```

---

## 5. Error Response Format

All error responses follow a consistent structure:
```json
{
  "timestamp": "2025-02-28T12:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Username already exists"
}
```
