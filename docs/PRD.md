# Product Requirements Document (PRD)

## 1. Introduction

### Document Purpose
This document defines the complete product requirements for the **Social Media Clone** application — a full-stack web application that replicates the core functionality of modern social media platforms. It serves as the reference for developers, QA engineers, and stakeholders throughout the development lifecycle.

### Product Summary
The Social Media Clone is a scalable, feature-rich social networking platform. Users can create accounts, share posts (text and images), follow other users, react to content, join communities, chat in real-time, and interact through events. Administrators have elevated controls for moderating content and users.

---

## 2. Product Vision & Objectives

**Vision**: To deliver a premium, full-featured social media experience that is extensible, performant, and developer-friendly.

**Objectives**:
1. Build a robust authentication system with security best practices (JWT, RBAC, rate limiting).
2. Enable rich social interactions (posts, likes, comments, stories, polls).
3. Support real-time communication (direct messages, group chats, WebSocket notifications).
4. Provide community features (groups, events).
5. Build a scalable architecture backed by multiple specialized data stores.
6. Implement an admin panel for content moderation and user management.

---

## 3. Target Users

| User Type | Description |
|---|---|
| **General User** | Any registered user who creates content, follows others, and interacts on the platform |
| **Administrator** | A user with elevated privileges who can moderate users and content |
| **Visitor** | An unauthenticated person (limited to registration/login pages) |

---

## 4. Core Feature Modules

### 4.1 Authentication & Authorization
- **User Registration**: Sign up with unique username, email, and password. Passwords are BCrypt hashed.
- **User Login**: Authenticate with email and password, receive a JWT access token.
- **JWT Security**: All protected routes require `Authorization: Bearer <token>` header.
- **Token Invalidation**: Token version increments on password change, invalidating all old sessions.
- **Role-Based Access**: Two roles: `USER` and `ADMIN`. Admin routes are restricted.
- **Rate Limiting**: Login endpoint is rate-limited to prevent brute-force attacks (Bucket4j).
- **Account Suspension**: Admins can suspend users for a specified number of days. Suspended users cannot log in.

### 4.2 User Profiles & Social Graph
- **Profile Management**: Users can update bio, website, profile picture (avatar), and banner image.
- **Follow/Unfollow**: Users can follow or unfollow others. Following updates are cache-invalidated immediately.
- **Follower/Following Lists**: Clickable counts on profiles open a modal with the full user list.
- **Block/Unblock**: Users can block others, which automatically removes follow relationships.
- **Private Profiles**: Users can toggle their profile to private, preventing their posts from public feeds.
- **Verified Badge**: Administrators can grant the verified badge to notable users.
- **User Search**: Real-time search for users by username.
- **User Interests**: Users can select interest tags for a personalized feed.

### 4.3 Content Creation
- **Text Posts**: Create posts with up to multi-line text content.
- **Image Posts**: Attach up to 4 images per post using multipart upload.
- **Stories**: Upload ephemeral media (images) that automatically expire after 24 hours.
- **Polls**: Create polls with multiple options for community voting.
- **Post Feed**: A personalized, paginated home feed showing posts from followed users.
- **Explore/Trending**: Discover trending hashtags and recommended posts.

### 4.4 Social Interactions
- **Likes**: Toggle like/unlike on any post.
- **Comments**: Add text comments to posts.
- **Share**: Share content across the platform.
- **Report**: Report posts for admin review via the moderation system.

### 4.5 Real-Time Communication
- **Direct Messages**: 1-on-1 text and image messaging between users.
- **Group Chats**: Create a named multi-user chat room with any set of users.
- **Message History**: Full persistent chat history per conversation thread.
- **Read Receipts**: Messages show whether they have been read by the recipient.
- **Real-Time Delivery**: All messages and notifications are pushed via STOMP WebSockets. No polling needed.
- **Audio/Video Calls**: Real-time audio and video call capabilities (WebRTC-based `call` module).

### 4.6 Community Building (Groups)
- **Create Groups**: Users can create public or private community groups.
- **Join/Leave Groups**: Toggle group membership.
- **Group Roles**: Members can be `MEMBER` or `ADMIN`.
- **Group Events**: Create and RSVP to events associated with a group.
- **Group Chat**: Each community group has its own dedicated group chat channel.

### 4.7 Notifications
- **Real-Time Push**: Notifications are pushed via WebSocket (no page refresh needed).
- **Supported Types**: `LIKE`, `COMMENT`, `FOLLOW`, `MESSAGE`, `MENTION`.
- **Persistence**: Notifications are stored in PostgreSQL and marked `read/unread`.
- **Notification Bell**: A badge counter in the navbar shows unread count.

### 4.8 Discovery & Search
- **User Search**: Fast partial/full username search (DB or Elasticsearch).
- **Content Explore**: A dedicated explore page with recommended posts.
- **Trending Topics**: End-to-end trending hashtag computation and display on the Explore page.

### 4.9 Administration & Moderation
- **Admin Dashboard**: A dedicated admin-only page showing all registered users.
- **Warn User**: Send a formal warning to a user (increments `warningCount`).
- **Suspend User**: Temporarily ban a user for N days.
- **Verify User**: Grant a verified badge to a user.
- **Delete Post**: Admins can delete any post on the platform.
- **Unsuspend User**: Lift a suspension immediately.
- **Activity Logs**: All admin actions are persisted in an `activity_log` for auditing.

---

## 5. User Stories

### Authentication
- As a new visitor, I want to create an account so I can access the platform.
- As a registered user, I want to log in securely, so my activity is associated to my account.
- As a user, I want to change my password and have all old sessions invalidated for security.

### Profile & Social Graph
- As a user, I want to edit my profile picture, bio, and website so I can express my identity.
- As a user, I want to follow other users so their content appears in my feed.
- As a user, I want to see who follows me and who I am following via clickable stats on my profile.
- As a user, I want to block someone so they cannot interact with my content.

### Content
- As a user, I want to create text posts and attach images to share updates.
- As a user, I want to view a personalized feed of posts from people I follow.
- As a user, I want to like and comment on posts to engage with others.
- As a user, I want to scroll through Stories from followed users for quick visual updates.
- As a user, I want to discover trending hashtags to see what topics are popular.

### Communication
- As a user, I want to send direct messages to friends.
- As a user, I want to create group chats so I can coordinate with multiple people.
- As a user, I want to receive a real-time notification when someone likes or comments on my post.
- As a user, I want to see when my messages have been read.

### Communities
- As a user, I want to create a community group around my interests.
- As a user, I want to join existing groups to connect with like-minded people.
- As an organizer, I want to create events within a group so members can RSVP.

### Administration
- As an admin, I want to warn or suspend rule-violating users.
- As an admin, I want to delete inappropriate posts.
- As an admin, I want to verify notable accounts with a badge to combat impersonation.

---

## 6. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | API response time < 500ms for 95% of requests under normal load |
| **Scalability** | Architecture supports horizontal scaling of the backend via stateless JWT auth |
| **Reliability** | Automated database backups; Flyway migrations ensure zero-downtime schema updates |
| **Security** | BCrypt passwords, JWT auth, rate limiting, CORS, XSS protection (see Security doc) |
| **Maintainability** | Comprehensive documentation, code structured by domain modules |
| **Accessibility** | UI follows WCAG 2.1 Level AA guidelines |
| **Browser Support** | Chrome, Firefox, Edge (latest 2 versions). Responsive on mobile. |

---

## 7. Constraints & Dependencies

- **Java 21**: Required for the backend. Uses record types and new API features.
- **Node.js 18+**: Required for the frontend.
- **Docker**: Required to run dependent services (PostgreSQL, MongoDB, Redis, Elasticsearch) locally.
- **Postman/Newman**: Required for automated API testing.
