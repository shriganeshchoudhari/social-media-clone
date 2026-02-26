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
- `GET /api/users/profile` : Get current user's profile.
- `GET /api/users/{id}` : Get profile of a specific user.
- `PUT /api/users/profile` : Update user profile.
- `GET /api/search?q={query}` : Search for users, groups, or posts.

### Posts
- `GET /api/posts` : Retrieve a paginated feed of posts.
- `POST /api/posts` : Create a new post.
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

### Real-Time WebSockets
- **Endpoint**: `/ws` (SockJS/STOMP)
- **Topics**: 
  - `/topic/group/{groupId}` (Group Chat)
  - `/user/queue/private` (Direct Messages)
  - `/user/queue/notifications` (Push Notifications)
