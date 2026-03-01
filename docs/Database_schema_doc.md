# Database Schema Documentation

## 1. Overview
The Social Media Clone uses a **polyglot persistence architecture** that leverages the strengths of three different databases:
- **PostgreSQL**: Primary relational database for all structured, transactional data.
- **MongoDB**: NoSQL document store for high-write-throughput chat messages.
- **Redis**: In-memory cache for ephemeral data, rate-limiting state, and frequently read aggregates.
- **Elasticsearch**: Distributed full-text search index for user and content discovery.

---

## 2. Relational Schema (PostgreSQL)

Database: `socialdb`

### `users`
Stores all user accounts and their profile data.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT | Unique user identifier |
| `username` | VARCHAR(30) | NOT NULL, UNIQUE | Public display username |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Login email address |
| `password` | VARCHAR(255) | NOT NULL | BCrypt hashed password |
| `bio` | VARCHAR(200) | NULLABLE | Short profile description |
| `profile_image_url` | VARCHAR(255) | NULLABLE | Path to the user's avatar image |
| `banner_image` | VARCHAR(255) | NULLABLE | Path to the profile banner image |
| `website` | VARCHAR(100) | NULLABLE | Personal website URL |
| `role` | VARCHAR(20) | DEFAULT 'USER' | Role: `USER` or `ADMIN` |
| `is_private` | BOOLEAN | DEFAULT false | Whether the profile is private |
| `is_banned` | BOOLEAN | DEFAULT false | Whether the account is globally banned |
| `verified` | BOOLEAN | DEFAULT false | Whether the user has a verified badge |
| `warning_count` | INT | DEFAULT 0 | Number of admin warnings received |
| `banned_until` | TIMESTAMP | NULLABLE | Suspension expiry date (null = not suspended) |
| `token_version` | INT | DEFAULT 0 | Incremented on password change to invalidate old tokens |
| `created_at` | TIMESTAMP | NOT NULL | Account creation timestamp |

---

### `posts`
Stores user-created posts (text, images).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT | Unique post ID |
| `author_id` | BIGINT | FK → `users.id`, NOT NULL | Author of the post |
| `content` | TEXT | NULLABLE | Text content of the post |
| `created_at` | TIMESTAMP | NOT NULL | Post creation timestamp |

### `post_images`
Stores image URLs associated with a post (up to 4 per post).

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | PK |
| `post_id` | BIGINT | FK → `posts.id` |
| `url` | VARCHAR(255) | Relative path to the stored image file |

---

### `comments`
Stores comments made on posts.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT | Unique comment ID |
| `post_id` | BIGINT | FK → `posts.id`, NOT NULL | The post this comment belongs to |
| `author_id` | BIGINT | FK → `users.id`, NOT NULL | Comment author |
| `content` | TEXT | NOT NULL | Comment text |
| `created_at` | TIMESTAMP | NOT NULL | Comment creation timestamp |

---

### `post_likes`
Tracks which users liked which posts. Enforces no duplicate likes via unique constraint.

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | PK |
| `post_id` | BIGINT | FK → `posts.id` |
| `user_id` | BIGINT | FK → `users.id` |
| — | UNIQUE | `(post_id, user_id)` |

---

### `follows`
Tracks the follow/following relationships between users.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT | Unique follow ID |
| `follower_id` | BIGINT | FK → `users.id` | The user doing the following |
| `following_id` | BIGINT | FK → `users.id` | The user being followed |
| — | UNIQUE | `(follower_id, following_id)` | Prevents duplicate follows |

---

### `blocks`
Tracks user block relationships.

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | PK |
| `blocker_id` | BIGINT | FK → `users.id` (the user who blocked) |
| `blocked_id` | BIGINT | FK → `users.id` (the user who is blocked) |

---

### `stories`
Stores ephemeral stories that expire after 24 hours.

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | PK |
| `user_id` | BIGINT | FK → `users.id` |
| `media_url` | VARCHAR(255) | Path to the story media file |
| `created_at` | TIMESTAMP | Creation timestamp |
| `expires_at` | TIMESTAMP | Expiry = created_at + 24h |

---

### `groups`
Stores community groups.

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | PK |
| `name` | VARCHAR(100) | Group name |
| `description` | TEXT | Group description |
| `created_by_id` | BIGINT | FK → `users.id` |
| `is_private` | BOOLEAN | Whether approval is required to join |

### `group_members`
Maps users to groups with a role.

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | PK |
| `group_id` | BIGINT | FK → `groups.id` |
| `user_id` | BIGINT | FK → `users.id` |
| `role` | VARCHAR(20) | `MEMBER` or `ADMIN` |
| `joined_at` | TIMESTAMP | Join timestamp |

---

### `polls` & `poll_options` & `poll_votes`
Support the polling/voting feature.

**`polls`**: `id`, `author_id` (FK), `question`, `created_at`
**`poll_options`**: `id`, `poll_id` (FK), `text`
**`poll_votes`**: `id`, `option_id` (FK), `user_id` (FK) — UNIQUE(`option_id`, `user_id`)

---

### `events`
Community events that can be linked to a group.

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | PK |
| `title` | VARCHAR(200) | Event name |
| `description` | TEXT | Event details |
| `event_date` | TIMESTAMP | When the event occurs |
| `group_id` | BIGINT | FK → `groups.id` (Optional) |
| `organizer_id` | BIGINT | FK → `users.id` |

### `event_attendees`
Many-to-many mapping of users RSVPing to events.

| Column | Type | Description |
|---|---|---|
| `event_id` | BIGINT | FK → `events.id` |
| `user_id` | BIGINT | FK → `users.id` |

---

### `notifications`
Stores push notification records for each user.

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | PK |
| `recipient_id` | BIGINT | FK → `users.id` (who receives it) |
| `type` | VARCHAR(50) | `LIKE`, `COMMENT`, `FOLLOW`, `MESSAGE`, etc. |
| `actor_id` | BIGINT | ID of the user who triggered the event |
| `actor_username` | VARCHAR(30) | Denormalized for fast display |
| `message` | VARCHAR(255) | Human-readable notification text |
| `is_read` | BOOLEAN | DEFAULT false |
| `created_at` | TIMESTAMP | When it was created |

---

### `user_interests`
Stores tags/hashtags that a user has selected as interests (used for personalized feed).

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | PK |
| `user_id` | BIGINT | FK → `users.id` |
| `tag` | VARCHAR(50) | Interest hashtag, e.g. `Spring`, `React` |

---

## 3. NoSQL Schema (MongoDB)

MongoDB is used exclusively for Chat Messages due to its high write throughput and flexible schema.

### Collection: `chat_messages`

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | MongoDB auto-generated primary key |
| `senderUsername` | String | Username of the sender |
| `recipientUsername` | String | Username of recipient (null if group message) |
| `groupId` | String | Group ID (null if direct message) |
| `content` | String | Text content of the message |
| `imageUrl` | String | Optional URL if an image was shared |
| `timestamp` | DateTime | When the message was sent |
| `readByRecipient` | Boolean | Whether the recipient has read the message |
| `senderVerified` | Boolean | Denormalized — verified status of sender |

---

## 4. Caching (Redis)

Redis is used for:

| Purpose | Key Pattern | TTL |
|---|---|---|
| User Profile Cache | `userProfiles::{username}` | Evicted on profile or follow update |
| Trending Hashtag Cache | `trending` | Configurable (e.g., 10 minutes) |
| Bucket4j Rate Limiting State | `bucket4j:{ip}` | Per-window |
| Stories Active Flag | `story:active:{userId}` | 24 hours |

---

## 5. Search Index (Elasticsearch)

Elasticsearch is used for fast full-text user search.

### Index: `users`
| Field | Type | Description |
|---|---|---|
| `username` | keyword/text | Searchable username |
| `bio` | text | Searchable bio |
| `profileImageUrl` | keyword | For display in results |
| `verified` | boolean | Filterable verified status |

> **Note**: Elasticsearch integration is partially implemented. The active code path in `UserService.searchUsers()` currently uses JPA-based search (`LIKE` query on username). The Elasticsearch path is commented out but remains in `UserSyncService`.

---

## 6. Key Constraints & Indexes

| Table | Constraint/Index | Notes |
|---|---|---|
| `users` | UNIQUE(`email`), UNIQUE(`username`) | Enforced at DB level |
| `follows` | UNIQUE(`follower_id`, `following_id`) | Prevents double-follows |
| `post_likes` | UNIQUE(`post_id`, `user_id`) | Prevents double-likes |
| `poll_votes` | UNIQUE(`option_id`, `user_id`) | One vote per option |
| `posts` | INDEX on `author_id` | Fast profile-feed queries |
| `comments` | INDEX on `post_id` | Fast comment retrieval per post |
| `notifications` | INDEX on `recipient_id` | Fast inbox retrieval |
