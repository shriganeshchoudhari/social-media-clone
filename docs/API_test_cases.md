# API Test Cases

## 1. Overview

This document specifies comprehensive API test cases for all backend endpoints. Each test case includes the HTTP method, URL, request payload, pre-conditions, and expected responses for both positive (happy-path) and negative (error/edge-case) scenarios.

These test cases are designed for automation via **Postman + Newman** and map directly to the Postman Collection (`Social Media Clone API.postman_collection.json`).

---

## 2. Test Environment Setup

### Environment Variables
| Variable | How to Set | Example Value |
|---|---|---|
| `{{baseUrl}}` | Static | `http://localhost:8080/api` |
| `{{authToken}}` | Extracted from `/auth/login` response script | `eyJhbGciOi...` |
| `{{adminToken}}` | Extracted from admin login | `eyJhbGciOi...` |
| `{{postId}}` | Extracted after creating a post | `42` |
| `{{groupId}}` | Extracted after creating a group | `7` |
| `{{targetUsername}}` | Static value for test | `diana_p` |

### Postman Pre-Request Script (Login)
```javascript
// Automatically stored on successful login
pm.test("Set auth token", () => {
    pm.environment.set("authToken", pm.response.json().token);
});
```

---

## 3. Auth Endpoints

### TC-001 — Register: Success
- **Method**: `POST {{baseUrl}}/auth/register`
- **Body**: `{ "username": "test_user_01", "email": "test01@test.com", "password": "Password123" }`
- **Expected**: `201 Created`, body contains `username: "test_user_01"`, no `password` field in response.

### TC-002 — Register: Duplicate Email
- **Method**: `POST {{baseUrl}}/auth/register`
- **Body**: `{ "username": "another_user", "email": "test01@test.com", "password": "Password123" }`
- **Expected**: `400 Bad Request`, body contains error message about duplicate email.

### TC-003 — Register: Short Password
- **Method**: `POST {{baseUrl}}/auth/register`
- **Body**: `{ "username": "test_user_02", "email": "test02@test.com", "password": "abc" }`
- **Expected**: `400 Bad Request`, validation error response.

### TC-004 — Login: Success
- **Method**: `POST {{baseUrl}}/auth/login`
- **Body**: `{ "email": "test01@test.com", "password": "Password123" }`
- **Expected**: `200 OK`, response contains `token` string with length > 10.
- **Post-script**: Save `token` to `{{authToken}}`.

### TC-005 — Login: Wrong Password
- **Method**: `POST {{baseUrl}}/auth/login`
- **Body**: `{ "email": "test01@test.com", "password": "WrongPass!" }`
- **Expected**: `401 Unauthorized`.

### TC-006 — Login: Non-existent User
- **Method**: `POST {{baseUrl}}/auth/login`
- **Body**: `{ "email": "nobody@doesnotexist.com", "password": "abc" }`
- **Expected**: `401 Unauthorized`.

---

## 4. User Endpoints

### TC-010 — Get My Profile: Success
- **Method**: `GET {{baseUrl}}/users/me`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Expected**: `200 OK`, body contains `username`, `followersCount`, `followingCount`, `postCount`, `verified`.

### TC-011 — Get My Profile: No Token
- **Method**: `GET {{baseUrl}}/users/me`
- **Headers**: *(none)*
- **Expected**: `401 Unauthorized`.

### TC-012 — Get Profile by Username: Success
- **Method**: `GET {{baseUrl}}/users/{{targetUsername}}`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Expected**: `200 OK`, body `username` matches `{{targetUsername}}`.

### TC-013 — Get Profile by Username: User Not Found
- **Method**: `GET {{baseUrl}}/users/i_do_not_exist_xyz`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Expected**: `404 Not Found`.

### TC-014 — Follow User: Success
- **Method**: `POST {{baseUrl}}/users/{{targetUsername}}/follow`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Expected**: `200 OK`.

### TC-015 — Follow Self: Failure
- **Setup**: Log in as `test_user_01`. Target username is also `test_user_01`.
- **Method**: `POST {{baseUrl}}/users/test_user_01/follow`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Expected**: `400 Bad Request`, error message "You cannot follow yourself".

### TC-016 — Get Followers: Success
- **Method**: `GET {{baseUrl}}/users/{{targetUsername}}/followers`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Expected**: `200 OK`, response is a JSON array of strings (usernames).

### TC-017 — Search Users: Found
- **Method**: `GET {{baseUrl}}/users/search?q=diana`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Expected**: `200 OK`, array contains at least one object with `username` containing "diana".

### TC-018 — Search Users: No Results
- **Method**: `GET {{baseUrl}}/users/search?q=xyznotexistsatall`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Expected**: `200 OK`, empty array `[]`.

### TC-019 — Block User: Success
- **Method**: `POST {{baseUrl}}/users/{{targetUsername}}/block`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Expected**: `200 OK`.

---

## 5. Post Endpoints

### TC-020 — Create Post: Text Only
- **Method**: `POST {{baseUrl}}/posts`
- **Headers**: `Authorization: Bearer {{authToken}}`, `Content-Type: multipart/form-data`
- **Form Data**: `content = "My first automated test post!"`
- **Expected**: `201 Created`. Response body contains `id`, `content`, `authorUsername`. Save `id` to `{{postId}}`.

### TC-021 — Create Post: No Content
- **Method**: `POST {{baseUrl}}/posts`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Form Data**: *(empty)*
- **Expected**: `400 Bad Request`.

### TC-022 — Get Feed: Success
- **Method**: `GET {{baseUrl}}/posts/feed?page=0&size=5`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Expected**: `200 OK`. Response contains `content` array, `totalElements`, `pageable`.

### TC-023 — Like Post: Success
- **Method**: `POST {{baseUrl}}/posts/{{postId}}/like`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Expected**: `200 OK`.

### TC-024 — Like Post: Already Liked (Toggle Off)
- **Method**: `POST {{baseUrl}}/posts/{{postId}}/like` *(send again)*
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Expected**: `200 OK` (toggled off).

### TC-025 — Add Comment: Success
- **Method**: `POST {{baseUrl}}/posts/{{postId}}/comments`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Body**: `{ "content": "Automated test comment!" }`
- **Expected**: `201 Created`.

### TC-026 — Get Comments: Success
- **Method**: `GET {{baseUrl}}/posts/{{postId}}/comments`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Expected**: `200 OK`, array contains at least the comment from TC-025.

### TC-027 — Delete Post: Non-Owner
- **Method**: `DELETE {{baseUrl}}/posts/{{postId}}`
- **Headers**: `Authorization: Bearer {{differentUserToken}}`
- **Expected**: `403 Forbidden`.

### TC-028 — Delete Post: Owner
- **Method**: `DELETE {{baseUrl}}/posts/{{postId}}`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Expected**: `204 No Content`.

### TC-029 — Get Trending: Success
- **Method**: `GET {{baseUrl}}/trending`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Expected**: `200 OK`, response is an array of trending topic objects.

---

## 6. Group Endpoints

### TC-030 — Create Group: Success
- **Method**: `POST {{baseUrl}}/groups`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Body**: `{ "name": "Test Automation Group", "description": "Created by API test", "isPrivate": false }`
- **Expected**: `201 Created`. Save group `id` to `{{groupId}}`.

### TC-031 — Get Groups: Success
- **Method**: `GET {{baseUrl}}/groups`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Expected**: `200 OK`, list includes the group from TC-030.

### TC-032 — Join Group: Success
- **Method**: `POST {{baseUrl}}/groups/{{groupId}}/join`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Expected**: `200 OK`.

### TC-033 — Get Group Members: Success
- **Method**: `GET {{baseUrl}}/groups/{{groupId}}/members`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Expected**: `200 OK`. Response contains at least one member with role `ADMIN` (the creator).

---

## 7. Chat Endpoints

### TC-040 — Send Direct Message: Success
- **Method**: `POST {{baseUrl}}/chat/send/{{targetUsername}}`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Body**: `{ "content": "Hello from Postman!" }`
- **Expected**: `200 OK` or `201 Created`.

### TC-041 — Send Direct Message: To Non-Existent User
- **Method**: `POST {{baseUrl}}/chat/send/i_do_not_exist_xyz`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Body**: `{ "content": "This should fail" }`
- **Expected**: `404 Not Found`.

### TC-042 — Get Inbox: Success
- **Method**: `GET {{baseUrl}}/chat/inbox`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Expected**: `200 OK`, array of chat threads.

### TC-043 — Get Message History: Success
- **Method**: `GET {{baseUrl}}/chat/messages/{{targetUsername}}`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Expected**: `200 OK`, array of message objects including the message from TC-040.

### TC-044 — Create Group Chat: Success
- **Method**: `POST {{baseUrl}}/chat/group/create`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Body**: `{ "name": "Test Chat Room", "memberUsernames": ["{{targetUsername}}"] }`
- **Expected**: `201 Created`.

---

## 8. Admin Endpoints

### TC-050 — Warn User: Admin Success
- **Method**: `POST {{baseUrl}}/admin/warn/{{targetUsername}}`
- **Headers**: `Authorization: Bearer {{adminToken}}`
- **Expected**: `200 OK`.

### TC-051 — Warn User: Non-Admin
- **Method**: `POST {{baseUrl}}/admin/warn/{{targetUsername}}`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Expected**: `403 Forbidden`.

### TC-052 — Verify User: Admin Success
- **Method**: `POST {{baseUrl}}/admin/verify/{{targetUsername}}`
- **Headers**: `Authorization: Bearer {{adminToken}}`
- **Expected**: `200 OK`.
- **Follow-up**: `GET {{baseUrl}}/users/{{targetUsername}}` should now return `verified: true`.

### TC-053 — Suspend User: Admin
- **Method**: `POST {{baseUrl}}/admin/suspend/{{targetUsername}}?days=3`
- **Headers**: `Authorization: Bearer {{adminToken}}`
- **Expected**: `200 OK`.

### TC-054 — Login While Suspended
- **Method**: `POST {{baseUrl}}/auth/login` *(as the suspended user)*
- **Expected**: `403 Forbidden`.

### TC-055 — Unsuspend User: Admin
- **Method**: `POST {{baseUrl}}/admin/unsuspend/{{targetUsername}}`
- **Headers**: `Authorization: Bearer {{adminToken}}`
- **Expected**: `200 OK`.

---

## 9. Newman CLI Automation

### Run Full Collection
```bash
newman run "docs/Social_Media_Clone_API.postman_collection.json" \
  --environment "docs/local.postman_environment.json" \
  --reporters "cli,htmlextra" \
  --reporter-htmlextra-export "newman-report.html"
```

### Run with CI/CD (GitHub Actions)
Add a step in `.github/workflows/api-tests.yml`:
```yaml
- name: Run API Tests
  run: |
    newman run docs/Social_Media_Clone_API.postman_collection.json \
      --environment docs/local.postman_environment.json \
      --bail
```
