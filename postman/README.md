# Postman API Automation – Social Media Clone

This folder contains a fully automated Postman test collection for the **Social Media Clone** REST API.

## Files

| File | Purpose |
|---|---|
| `Social_Media_Clone.postman_collection.json` | Main collection with all requests, pre-request scripts, and test assertions |
| `Social_Media_Clone_ENV.postman_environment.json` | Environment variables (tokens, IDs, URLs) |

---

## Quick Start

### 1. Import into Postman
1. Open Postman → **Import**
2. Import **both** JSON files
3. Select the `Social Media Clone - Local` environment from the top-right dropdown

### 2. Start the backend
```bash
# In the backend directory
mvn spring-boot:run
```

### 3. Run the collection
**Option A – UI (step-by-step)**:  
Click a folder → Send each request in order starting with **01 - Auth**

**Option B – Collection Runner (full regression)**:
1. Right-click collection → **Run collection**
2. Select `Social Media Clone - Local` environment
3. Enable **Persist responses** and **Save responses**
4. Click **Run**

**Option C – Newman CLI (CI/CD)**:
```bash
npm install -g newman newman-reporter-htmlextra

newman run Social_Media_Clone.postman_collection.json \
  --environment Social_Media_Clone_ENV.postman_environment.json \
  --reporters cli,htmlextra \
  --reporter-htmlextra-export newman-report.html
```

---

## Folder Structure

```
01 - Auth
  ├── Register new user              (populates USERNAME, EMAIL)
  ├── Register – duplicate (negative)
  ├── Register – invalid email (negative)
  ├── Login – valid credentials       (populates USER_TOKEN)
  ├── Login – wrong password (negative)
  ├── Login – non-existent user (negative)
  └── Admin Login                    (populates ADMIN_TOKEN)

02 - Users & Profile
  ├── Get my profile
  ├── Get profile – unauthenticated (negative)
  ├── Get user by username
  ├── Get user – non-existent (negative)
  ├── Search users
  ├── Update profile
  ├── Get followers / following
  ├── Follow self (negative)
  └── Block self (negative)

03 - Posts
  ├── Create post                     (populates POST_ID)
  ├── Create post – empty content (negative)
  ├── Get feed (paginated)
  ├── Like / Unlike post (toggle)
  ├── Add comment, Get comments
  ├── Get trending topics
  ├── Delete own post
  └── Delete non-existent post (negative)

04 - Stories
  ├── Get story feed
  └── Stories – unauthenticated (negative)

05 - Notifications
  ├── Get notifications
  ├── Mark all as read
  └── Notifications – unauthenticated (negative)

06 - Groups
  ├── Get all groups
  ├── Create group                    (populates GROUP_ID)
  ├── Get group members
  └── Join / Leave group (toggle)

07 - Chat (DM)
  ├── Get inbox
  ├── Send DM to user
  ├── Get conversation history
  ├── Create group chat               (populates CHAT_GROUP_ID)
  ├── Send group chat message
  ├── Get group chat messages
  └── Inbox – unauthenticated (negative)

08 - Events
  ├── Create event                    (populates EVENT_ID)
  ├── Join event (RSVP)
  └── Get events for group

09 - Reports & Moderation
  └── Report a post

10 - Admin  (requires ADMIN_TOKEN)
  ├── List all users
  ├── Admin access with user token (negative)
  ├── Warn user
  ├── Suspend user
  ├── Unsuspend user
  ├── Verify user
  └── Delete post (admin)
```

---

## How Scripts Work

### Pre-request Scripts
Every request that needs a unique value (timestamp-based usernames, post content, etc.) generates them in its **Pre-request Script** tab. The **Collection-level** pre-request script automatically attaches `Authorization: Bearer {{USER_TOKEN}}` to every request.

### Test Scripts (Post-response)
Each request has a **Tests** tab with:
- **Status code checks** (`pm.response.to.have.status(...)`)
- **Response body assertions** (field presence, value equality)
- **Chained variable saves** (`pm.environment.set('POST_ID', json.id)`) so later requests can use the created resource IDs
- **Negative test guards** (admin tests skip gracefully if `ADMIN_TOKEN` is not set)

---

## Environment Variables Reference

| Variable | Set By | Used By |
|---|---|---|
| `BASE_URL` | You (default: `http://localhost:8080/api`) | All requests |
| `USER_TOKEN` | Login response | Protected endpoints |
| `ADMIN_TOKEN` | Admin Login response | Admin folder |
| `USERNAME` | Register pre-request + Login | Profile, Follow, Admin |
| `EMAIL` | Register pre-request | Login |
| `PASSWORD` | Environment default | Register, Login |
| `POST_ID` | Create Post response | Like, Comment, Delete, Report, Admin delete |
| `CHAT_GROUP_ID` | Create Group Chat response | Chat group messages, Events |
| `GROUP_ID` | Create Group response | Group members, Join |
| `EVENT_ID` | Create Event response | RSVP |
| `TARGET_USER` | You (set manually or via script) | DM send, conversation history |
| `ADMIN_EMAIL` | Environment default | Admin Login |
| `ADMIN_PASSWORD` | Environment default | Admin Login |

---

## CI/CD Integration (GitHub Actions example)

```yaml
- name: Run API Tests
  run: |
    npm install -g newman newman-reporter-htmlextra
    newman run postman/Social_Media_Clone.postman_collection.json \
      --environment postman/Social_Media_Clone_ENV.postman_environment.json \
      --env-var BASE_URL=http://localhost:8080/api \
      --reporters cli,htmlextra \
      --reporter-htmlextra-export postman/newman-report.html
  
- name: Upload Test Report
  uses: actions/upload-artifact@v4
  with:
    name: postman-report
    path: postman/newman-report.html
```
