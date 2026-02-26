# API Documentation

## 1. Introduction
The Social Media Clone API exposes RESTful endpoints for clients to interact with the system. It uses JSON for request and response payloads. The API is documented and testable via Swagger/OpenAPI (available at `/swagger-ui.html` on the backend host).

## 2. Authentication
All endpoints except registration and login require a valid JWT token.
- **Header**: `Authorization: Bearer <token>`

### Auth Endpoints
- `POST /api/auth/register` : Create a new user account.
- `POST /api/auth/login` : Authenticate user and receive JWT.

## 3. Core REST Endpoints

### Users
- `GET /api/users/me` : Get current user's profile.
- `GET /api/users/{username}` : Get profile of a specific user by username.
- `PUT /api/users/me` : Update user profile (consumes multipart/form-data).
- `GET /api/users/search?q={query}` : Search for users.

### Posts
- `GET /api/posts/feed` : Retrieve a paginated feed of posts.
- `POST /api/posts` : Create a new post (consumes multipart/form-data).
- `DELETE /api/posts/{id}` : Delete a post (owner/admin only).
- `POST /api/posts/{id}/like` : Like or unlike a post.
- `GET /api/posts/{id}/comments` : Retrieve comments for a post.
- `POST /api/posts/{id}/comments` : Add a comment to a post.

### Groups
- `GET /api/groups` : List available groups.
- `POST /api/groups` : Create a new group.
- `POST /api/groups/{id}/join` : Join a group.
- `GET /api/groups/{id}/members` : List group members.

### Stories
- `POST /api/stories` : Upload a new story.
- `GET /api/stories/feed` : Get active stories from followed users.

### Chat & Events
- `POST /api/chat/send/{username}` : Send a direct text message to a user.
- `POST /api/chat/send/{username}/image` : Send an image message to a user.
- `GET /api/chat/inbox` : Retrieve the user's active chat threads.
- `POST /api/chat/group/create` : Create a new multi-user chat group.
- `POST /api/chat/group/{groupId}/send` : Broadcast a message to a chat group.
- `GET /api/chat/group/{groupId}/messages` : Retrieve message history for a chat group.
- `POST /api/chat/group/{groupId}/add` : Add a user to an existing chat group.
- `POST /api/events` : Create a new event.
- `POST /api/events/{eventId}/join` : RSVP/Join a specific event.
- `GET /api/events/group/{groupId}` : List events associated with a specific group.

### Real-Time WebSockets
- **Endpoint**: `/ws` (SockJS/STOMP)
- **Topics**: 
  - `/topic/group/{groupId}` (Group Chat)
  - `/user/queue/private` (Direct Messages)
  - `/user/queue/notifications` (Push Notifications)
