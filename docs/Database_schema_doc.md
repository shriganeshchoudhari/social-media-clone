# Database Schema Documentation

## 1. Overview
The Social Media Clone uses a polyglot persistence architecture. High-value structured, transactional data is stored in **PostgreSQL**, while unstructured, high-volume real-time data is stored in **MongoDB**. Fast localized caching and ephemeral data use **Redis**.

## 2. Relational Schema (PostgreSQL)
The primary SQL database (`socialdb`) manages complex relations between users and content.
- **`users`**: user_id (PK), username, email, password_hash, created_at, bio, avatar_url.
- **`roles`**: role_id (PK), name (USER, ADMIN).
- **`user_roles`**: Join table mapping users to roles.
- **`posts`**: post_id (PK), user_id (FK), content, image_url, created_at.
- **`comments`**: comment_id (PK), post_id (FK), user_id (FK), content, created_at.
- **`likes`**: like_id (PK), post_id (FK), user_id (FK), created_at.
- **`follows`**: follower_id (FK), following_id (FK), created_at.
- **`groups`**: group_id (PK), name, description, created_by (FK), is_private.
- **`group_members`**: group_id (FK), user_id (FK), joined_at, role (MEMBER, ADMIN).
- **`stories`**: story_id (PK), user_id (FK), media_url, expires_at.
- **`polls`**: poll_id (PK), user_id (FK), question, created_at.
- **`poll_options`**: option_id (PK), poll_id (FK), text.
- **`poll_votes`**: vote_id (PK), option_id (FK), user_id (FK).

## 3. NoSQL Schema (MongoDB)
MongoDB is used for chat messages to handle high write throughput and dynamic structures.
- **`chat_messages`**: 
  - `_id`: ObjectId
  - `sender_id`: String/UUID
  - `receiver_id`: String/UUID (Optional, for 1-1)
  - `group_id`: String/UUID (Optional, for group chats)
  - `content`: String
  - `timestamp`: DateTime
  - `read_status`: Boolean

## 4. Caching & Search
- **Redis**: Stores JWT blacklists, temporary OTPs, Bucket4j rate limiting states, and frequent aggregate queries (e.g., trending hashtags).
- **Elasticsearch**: Indexes user profiles, groups, and posts for fuzzy and fast text-based searching.

## 5. Indexes & Constraints
- Unique constraints on `users.email` and `users.username`.
- Foreign key constraints with `ON DELETE CASCADE` applied logically between user dependencies (like posts and comments).
- B-Tree indexes on query-heavy columns: `posts.user_id`, `comments.post_id`.
