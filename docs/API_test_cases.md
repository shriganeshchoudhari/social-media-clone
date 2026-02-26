# API Test Cases

## 1. Overview
This document specifies the standard API tests executed to ensure the backend endpoints function properly. For execution, these tests can be run via Newman in CI/CD or directly in Postman.

## 2. Test Environment Setup
- **Base URL**: `http://localhost:8080/api`
- **Environment Variables**:
  - `{{authToken}}`: Extracted automatically on successful login.
  - `{{userId}}`, `{{postId}}`, `{{groupId}}`: Extracted from creation responses to be used in subsequent requests.

## 3. High Priority Endpoints

### Authentication
- `POST /auth/register` :
  - **Success**: Return 201 Created. Response contains user object.
  - **Failure**: Return 400 Bad Request on duplicate email or invalid password format.
- `POST /auth/login` :
  - **Success**: Return 200 OK. Verify JWT token is present in the response body.
  - **Failure**: Return 401 Unauthorized for bad credentials.

### Users
- `GET /users/me` :
  - **Success**: Must pass `Authorization` header. Verify matching `username`.
  - **Failure**: Return 401 Unauthorized without token.

### Posts
- `POST /posts` (multipart/form-data) :
  - **Pre-requisite**: Login to get token.
  - **Success**: Return 201. Must contain text/image URL.
- `GET /posts/feed` :
  - **Success**: Return 200. Validate pagination (`page`, `size`, `totalElements`).

### Groups
- `POST /groups` :
  - **Success**: Create group name and type. Return 201 Created.
- `GET /groups/{id}/members` :
  - **Success**: Must reflect the user who just created the group as an ADMIN member. Return 200 OK.

### Chat & Events (Real-Time Communication)
- `POST /chat/send/{username}` :
  - **Success**: Send a text message; receive HTTP 200/201 confirming queueing or delivery.
- `GET /chat/inbox` :
  - **Success**: Get a list of active conversation threads (HTTP 200).
- `POST /chat/group/create` :
  - **Success**: Create a multi-user chat room; receive group ID.
- `POST /events` :
  - **Success**: Schedule a new event with a description; Return 201.
