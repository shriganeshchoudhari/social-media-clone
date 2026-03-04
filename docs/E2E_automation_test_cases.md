# E2E Automation Test Cases

## 1. Overview
This document outlines the comprehensive End-to-End (E2E) automation test cases for the Social Media Clone using **Playwright**. Test cases cover **positive (happy-path)** and **negative (edge/failure)** scenarios derived from analysis of the Java Spring Boot backend controllers and the React frontend pages.

> All test files are located in `social-ui/tests/`.  
> Run from the `social-ui/` directory using `npx playwright test`.

---

## 2. Authentication (`social-platform.spec.js`, `auth.spec.js`)

### 2.1 Register

| ID | Type | Test Case | Expected Result |
|----|------|-----------|-----------------|
| TC_AUTH_01 | ✅ Positive | Register with valid username, email, and password | JWT stored in `localStorage`, redirected to `/feed` |
| TC_AUTH_02 | ✅ Positive | Register then immediately login with same credentials | Login succeeds; redirected to `/feed` |
| TC_AUTH_03 | ❌ Negative | Register with a duplicate username | Error message: "Registration failed. Try a different username/email." shown in red |
| TC_AUTH_04 | ❌ Negative | Register with a duplicate email | Error message shown; registration blocked |
| TC_AUTH_05 | ❌ Negative | Register leaving all fields empty and submit | Frontend error: "All fields are required"; no API call made |
| TC_AUTH_06 | ❌ Negative | Register with an invalid email format (e.g. `notanemail`) | Browser HTML5 validation blocks form submission |
| TC_AUTH_07 | ❌ Negative | Register with a blank username only | Error: "All fields are required" |

### 2.2 Login

| ID | Type | Test Case | Expected Result |
|----|------|-----------|-----------------|
| TC_AUTH_08 | ✅ Positive | Login with correct username and password | JWT stored, redirected to `/feed` |
| TC_AUTH_09 | ✅ Positive | Login shows loading state while submitting | "Logging in..." text appears on button during request |
| TC_AUTH_10 | ❌ Negative | Login with wrong password | Red error message: "Invalid credentials. Please try again." |
| TC_AUTH_11 | ❌ Negative | Login with non-existent username | Red error shown; no redirect |
| TC_AUTH_12 | ❌ Negative | Submit login form with empty username and password | Frontend error: "Username and password are required"; no API call |
| TC_AUTH_13 | ❌ Negative | Banned user attempts login | Error message shown indicating account is banned |

### 2.3 Logout

| ID | Type | Test Case | Expected Result |
|----|------|-----------|-----------------|
| TC_AUTH_14 | ✅ Positive | Logged-in user clicks logout from user menu | Token removed from `localStorage`; redirected to `/login` |
| TC_AUTH_15 | ✅ Positive | After logout, accessing `/feed` directly redirects to `/login` | Route guard prevents access to protected pages |

### 2.4 Forgot Password & Reset Password

| ID | Type | Test Case | Expected Result |
|----|------|-----------|-----------------|
| TC_AUTH_16 | ✅ Positive | Enter registered email on Forgot Password page | Success message: "OTP sent to your email." and "Proceed to Reset Password" link appears |
| TC_AUTH_17 | ✅ Positive | Use valid OTP to reset password on Reset Password page | Success message shown; user can login with new password |
| TC_AUTH_18 | ❌ Negative | Enter unregistered email on Forgot Password page | Error message from backend: user not found |
| TC_AUTH_19 | ❌ Negative | Submit Forgot Password with empty email field | HTML5 `required` validation blocks submission |
| TC_AUTH_20 | ❌ Negative | Submit Reset Password with incorrect OTP | Error message shown: invalid OTP |
| TC_AUTH_21 | ❌ Negative | Submit Reset Password with mismatched new passwords | Frontend error: passwords do not match |

---

## 3. Settings (`settings.spec.js`)

### 3.1 Profile Update

| ID | Type | Test Case | Expected Result |
|----|------|-----------|-----------------|
| TC_SET_01 | ✅ Positive | Update bio with valid text and save | Success message: "Profile updated successfully"; bio visible on profile page |
| TC_SET_02 | ✅ Positive | Update website URL and save | Website field persists; visible on profile |
| TC_SET_03 | ✅ Positive | Upload a profile avatar image and save | Avatar preview updates; profile image reflected on navbar |
| TC_SET_04 | ✅ Positive | Upload a banner image and save | Banner preview updates; visible on profile page |
| TC_SET_05 | ✅ Positive | Add a new interest tag and save profile | Interest chip appears in profile settings and on explore feed |
| TC_SET_06 | ✅ Positive | Remove an existing interest tag and save | Tag chip disappears from interests list |
| TC_SET_07 | ❌ Negative | Add duplicate interest tag | Duplicate tag is silently ignored; not added twice |
| TC_SET_08 | ❌ Negative | Submit profile update when backend is unreachable | Error message: "Failed to update profile" displayed |

### 3.2 Change Password

| ID | Type | Test Case | Expected Result |
|----|------|-----------|-----------------|
| TC_SET_09 | ✅ Positive | Change password with correct current password and matching new passwords | Success: "Password changed successfully"; login with new password works |
| TC_SET_10 | ❌ Negative | Change password with wrong current password | Error: "Failed to change password" shown |
| TC_SET_11 | ❌ Negative | New password and confirm password don't match | Frontend error: "New passwords do not match"; no API call |
| TC_SET_12 | ❌ Negative | Leave all password fields empty and submit | HTML5 `required` validation prevents submission |

### 3.3 Privacy Toggle

| ID | Type | Test Case | Expected Result |
|----|------|-----------|-----------------|
| TC_SET_13 | ✅ Positive | Toggle account from Public to Private | Toggle turns blue; success message "Account is now Private" |
| TC_SET_14 | ✅ Positive | Toggle account from Private back to Public | Toggle turns grey; success message "Account is now Public" |

### 3.4 Delete Account

| ID | Type | Test Case | Expected Result |
|----|------|-----------|-----------------|
| TC_SET_15 | ✅ Positive | Click Delete Account, confirm in dialog | Account deleted; redirected to `/login`; re-login with same credentials fails |
| TC_SET_16 | ❌ Negative | Click Delete Account but cancel the confirmation dialog | Account not deleted; user stays on Settings page |

---

## 4. Post Management (`social-platform.spec.js`, `advanced-features.spec.js`)

### 4.1 Create Post

| ID | Type | Test Case | Expected Result |
|----|------|-----------|-----------------|
| TC_POST_01 | ✅ Positive | Create a text-only post with valid content | Post appears at top of feed with correct text |
| TC_POST_02 | ✅ Positive | Create a post with a single image attached | Post renders in feed with image thumbnail |
| TC_POST_03 | ✅ Positive | Create a post with multiple images (up to limit) | All images render in a grid layout in feed |
| TC_POST_04 | ✅ Positive | Create a post with a poll (question + options + duration) | Post renders with poll widget; options are clickable |
| TC_POST_05 | ✅ Positive | Share/repost another user's existing post | Shared post card appears in feed referencing original |
| TC_POST_06 | ❌ Negative | Submit Create Post form with empty content | Submit is blocked or error shown; no post created |
| TC_POST_07 | ❌ Negative | Attach a file exceeding 10MB image size limit | Error shown about file size; post not created |
| TC_POST_08 | ❌ Negative | Create post while unauthenticated (token removed) | Redirected to login page |

### 4.2 Edit & Delete Post

| ID | Type | Test Case | Expected Result |
|----|------|-----------|-----------------|
| TC_POST_09 | ✅ Positive | Edit own post via three-dot menu → updated content visible in feed | Post content updated immediately |
| TC_POST_10 | ✅ Positive | Delete own post via three-dot menu → post removed from feed | Post disappears from global and personal feed |
| TC_POST_11 | ❌ Negative | Edit/delete menu not visible on another user's post | Three-dot menu does not show edit/delete options for others' posts |

### 4.3 Like & Comment

| ID | Type | Test Case | Expected Result |
|----|------|-----------|-----------------|
| TC_POST_12 | ✅ Positive | Click like on a post → like count increments and button becomes active | Like count +1; heart icon fills/activates |
| TC_POST_13 | ✅ Positive | Click like again on an already-liked post → like count decrements | Toggle unlike; count -1 |
| TC_POST_14 | ✅ Positive | Add a comment to a post | Comment appears immediately below the post |
| TC_POST_15 | ✅ Positive | Add a reply comment (nested) to an existing comment | Reply appears indented below parent comment |
| TC_POST_16 | ❌ Negative | Submit empty comment | Submit blocked; comment not created |

### 4.4 Save / Bookmark Post

| ID | Type | Test Case | Expected Result |
|----|------|-----------|-----------------|
| TC_POST_17 | ✅ Positive | Bookmark a post via save icon | Bookmark icon activates; post appears in `/profile/saved` tab |
| TC_POST_18 | ✅ Positive | Unbookmark a saved post | Bookmark icon deactivates; post removed from saved tab |

### 4.5 Report Post

| ID | Type | Test Case | Expected Result |
|----|------|-----------|-----------------|
| TC_POST_19 | ✅ Positive | Report a post via three-dot menu | Report submitted; confirmation shown; report appears in admin dashboard |
| TC_POST_20 | ❌ Negative | Report own post (if blocked by UI) | Report option not visible on own posts |

### 4.6 Poll Voting

| ID | Type | Test Case | Expected Result |
|----|------|-----------|-----------------|
| TC_POST_21 | ✅ Positive | Vote on a poll option in a post | Selected option highlights; vote count updates |
| TC_POST_22 | ❌ Negative | Vote again on same poll (backend should prevent duplicate votes) | Second vote is rejected; vote count unchanged |

---

## 5. Stories (`stories.spec.js`)

| ID | Type | Test Case | Expected Result |
|----|------|-----------|-----------------|
| TC_STORY_01 | ✅ Positive | Upload an image as a story via "+ Add Story" button | Story bubble with user's avatar appears in the story bar |
| TC_STORY_02 | ✅ Positive | Follower sees the story bubble in their feed story bar | Story bubble visible for following users |
| TC_STORY_03 | ✅ Positive | Click story bubble → story viewer opens full-screen | Story viewer modal opens and shows the story image |
| TC_STORY_04 | ✅ Positive | Story is marked as viewed after opening | Story bubble becomes muted/grey indicating viewed status |
| TC_STORY_05 | ✅ Positive | Story owner can view the list of viewers | Viewers list shown in story viewer (eye icon) |
| TC_STORY_06 | ✅ Positive | Create a story with a poll question and options | Poll widget appears in story viewer; options are tappable |
| TC_STORY_07 | ✅ Positive | Vote on a story poll | Chosen option shows percentage; vote recorded |
| TC_STORY_08 | ❌ Negative | Upload a story with no file selected | Submit is blocked; error shown or button remains disabled |
| TC_STORY_09 | ❌ Negative | Story disappears after 24 hours (expiry) | Expired story no longer appears in the feed story bar |

---

## 6. Follow / Unfollow (`follow-unfollow.spec.js`)

| ID | Type | Test Case | Expected Result |
|----|------|-----------|-----------------|
| TC_FOL_01 | ✅ Positive | Click "Follow" on another user's profile | Button text changes to "Unfollow"; follower count on their profile increments |
| TC_FOL_02 | ✅ Positive | Followed user's posts now appear in home feed | Personal feed reflects posts from the followed user |
| TC_FOL_03 | ✅ Positive | Click "Unfollow" on a followed user's profile | Button reverts to "Follow"; their posts no longer appear in personal feed |
| TC_FOL_04 | ✅ Positive | Follow generates a follow notification for target user | Target user sees follow notification in `/notifications` |
| TC_FOL_05 | ❌ Negative | Attempt to follow yourself | Follow button not visible on own profile |
| TC_FOL_06 | ❌ Negative | Follow a private user → request pending until approved | For private accounts, posts hidden until follow accepted |

---

## 7. Explore & Search (`explore-search.spec.js`)

### 7.1 Search

| ID | Type | Test Case | Expected Result |
|----|------|-----------|-----------------|
| TC_EXP_01 | ✅ Positive | Type a username in the search bar and navigate to `/search` | Search results page loads with matching users in "People" tab |
| TC_EXP_02 | ✅ Positive | Switch to "Posts" tab in search results | Matching posts appear for the search keyword |
| TC_EXP_03 | ✅ Positive | Click a user result in search → navigate to their profile | Profile page for that user loads |
| TC_EXP_04 | ❌ Negative | Search with an empty query string | No results shown or a "please enter a search term" message |
| TC_EXP_05 | ❌ Negative | Search for a non-existent username | "No users found" state displayed |
| TC_EXP_06 | ❌ Negative | Search for a keyword that matches no posts | "No posts found" state displayed |

### 7.2 Explore Feed

| ID | Type | Test Case | Expected Result |
|----|------|-----------|-----------------|
| TC_EXP_07 | ✅ Positive | Navigate to `/explore` — recommended posts load | "Recommended for you" section renders with posts |
| TC_EXP_08 | ✅ Positive | User with interests set sees interest-relevant posts in explore | Posts tagged with user's interests appear in explore |
| TC_EXP_09 | ✅ Positive | Trending sidebar shows current trending topics | Trending section renders with topic hashtags |
| TC_EXP_10 | ❌ Negative | Blocked user's posts do not appear in explore | Posts from blocked users are filtered from explore feed |

---

## 8. Notifications (`notifications.spec.js`)

| ID | Type | Test Case | Expected Result |
|----|------|-----------|-----------------|
| TC_NOTIF_01 | ✅ Positive | Like another user's post → notification appears for post owner | Post owner's notifications page shows a like notification |
| TC_NOTIF_02 | ✅ Positive | Follow a user → follow notification created for that user | Target user sees "followed you" notification |
| TC_NOTIF_03 | ✅ Positive | Comment on a post → notification created for post owner | Post owner receives comment notification |
| TC_NOTIF_04 | ✅ Positive | Unread notification badge count is correct | Navbar badge shows correct unread count number |
| TC_NOTIF_05 | ✅ Positive | Click "Mark all read" → badge clears and all notifications show as read | Unread count goes to 0; notifications no longer highlighted |
| TC_NOTIF_06 | ✅ Positive | Click individual notification → marks it as read | Single notification loses unread highlight |
| TC_NOTIF_07 | ✅ Positive | Notification links navigate to the relevant post/profile | Clicking like notification opens the liked post |
| TC_NOTIF_08 | ❌ Negative | New notification appears in real-time without page refresh (WebSocket) | Notification badge increments without manual refresh |

---

## 9. Direct Messaging (`chat.spec.js`, `advanced-features.spec.js`)

### 9.1 Send & Receive Messages

| ID | Type | Test Case | Expected Result |
|----|------|-----------|-----------------|
| TC_CHAT_01 | ✅ Positive | User A sends a text message to User B | Message appears in User A's chat window immediately |
| TC_CHAT_02 | ✅ Positive | User B receives the message in real-time without refresh | Message appears in User B's chat via WebSocket |
| TC_CHAT_03 | ✅ Positive | User B replies → both sides see full conversation thread | Conversation thread in correct order for both users |
| TC_CHAT_04 | ✅ Positive | Inbox page (`/inbox`) lists all conversations | All conversation partners appear in inbox with last message preview |
| TC_CHAT_05 | ✅ Positive | Send an image in chat | Image renders with `/uploads/` src in conversation |
| TC_CHAT_06 | ✅ Positive | Paginated loading of older messages (scroll up) | Older messages load via pagination (page > 0) |
| TC_CHAT_07 | ❌ Negative | Send an empty message | Send button disabled or message not sent |
| TC_CHAT_08 | ❌ Negative | Send a message to a blocked user | Message blocked or error shown |
| TC_CHAT_09 | ❌ Negative | Access `/chat/nonexistentuser` | Error state or redirect shown |

### 9.2 Message Reactions (`message-reactions.spec.js`)

| ID | Type | Test Case | Expected Result |
|----|------|-----------|-----------------|
| TC_REACT_01 | ✅ Positive | Hover over a message → emoji reaction picker appears | Reaction picker is visible near the message |
| TC_REACT_02 | ✅ Positive | Click an emoji reaction → reaction icon appears on message | Chosen emoji displays on the message bubble |
| TC_REACT_03 | ✅ Positive | Sender sees the receiver's reaction in real-time (WebSocket) | Reaction appears without page refresh on sender's screen |
| TC_REACT_04 | ❌ Negative | React to a message that no longer exists | Graceful error; reaction picker disappears without crash |

---

## 10. Chat Groups (`groups_and_chat.spec.js`)

| ID | Type | Test Case | Expected Result |
|----|------|-----------|-----------------|
| TC_CGRP_01 | ✅ Positive | Create a chat group with a name and participants from inbox | Group appears in inbox group list |
| TC_CGRP_02 | ✅ Positive | Send a message in a chat group → all members see it | Message visible in group conversation for each member |
| TC_CGRP_03 | ✅ Positive | Search for a public chat group and join it | Group appears in user's group list |
| TC_CGRP_04 | ✅ Positive | Group admin adds a new member | New member appears in group participant list |
| TC_CGRP_05 | ✅ Positive | Group admin removes a member | Member removed; they can no longer access group messages |
| TC_CGRP_06 | ✅ Positive | User leaves a chat group | Group removed from user's inbox; other members unaffected |
| TC_CGRP_07 | ✅ Positive | Group admin updates group name/description/image | Updated info reflects in group details header |
| TC_CGRP_08 | ❌ Negative | Non-admin tries to remove a member | Action blocked; error shown |
| TC_CGRP_09 | ❌ Negative | Send a message in a group the user has left | Access denied; user redirected or error shown |

---

## 11. Community Groups (`groups_and_chat.spec.js`, `group-features.spec.js`)

| ID | Type | Test Case | Expected Result |
|----|------|-----------|-----------------|
| TC_GRP_01 | ✅ Positive | Create a community group with name, description, and rules | Group appears in `/groups`; creator is admin member |
| TC_GRP_02 | ✅ Positive | Group detail page shows member count, description, and rules | All group metadata correctly displayed |
| TC_GRP_03 | ✅ Positive | Non-member joins a public group | "Join" button changes to "Leave"; member count increments |
| TC_GRP_04 | ✅ Positive | Member leaves a group | User removed from group; "Leave" button reverts to "Join" |
| TC_GRP_05 | ✅ Positive | Post content inside a group | Post appears in the group's post feed |
| TC_GRP_06 | ✅ Positive | Group admin pins a post in the group | Pinned post appears at the top of the group feed |
| TC_GRP_07 | ✅ Positive | Group admin uploads a cover image | Cover image updates in the group header |
| TC_GRP_08 | ✅ Positive | Group admin promotes a member to admin role | Member's role updates; they gain admin capabilities |
| TC_GRP_09 | ✅ Positive | Search for groups by keyword | Matching groups appear in search results |
| TC_GRP_10 | ✅ Positive | Group admin removes a member from community group | Member removed; listed in members tab update |
| TC_GRP_11 | ✅ Positive | Group admin deletes the group | Group no longer appears in `/groups` list |
| TC_GRP_12 | ❌ Negative | Regular member tries to delete the group | Action blocked; no delete option in UI |
| TC_GRP_13 | ❌ Negative | Regular member tries to pin a post | Pin option not visible or action returns 403 |
| TC_GRP_14 | ❌ Negative | Search groups with empty query | No results or validation message shown |

---

## 12. Profile (`profile.spec.js`)

| ID | Type | Test Case | Expected Result |
|----|------|-----------|-----------------|
| TC_PROF_01 | ✅ Positive | Navigate to own profile `/profile/:username` | Shows own posts, follower/following counts, bio, avatar |
| TC_PROF_02 | ✅ Positive | Navigate to another user's public profile | Profile data visible; follow button shown |
| TC_PROF_03 | ✅ Positive | Saved posts tab on own profile shows bookmarked posts | Saved posts appear in "Saved" tab |
| TC_PROF_04 | ✅ Positive | Block a user from their profile | Blocked user's posts no longer appear in feed or explore |
| TC_PROF_05 | ❌ Negative | Navigate to profile of a private account as non-follower | Posts hidden; "This account is private" message shown |
| TC_PROF_06 | ❌ Negative | Navigate to a non-existent user profile | 404 / "User not found" state shown |

---

## 13. Account Management & Privacy (`account-management.spec.js`)

| ID | Type | Test Case | Expected Result |
|----|------|-----------|-----------------|
| TC_AM_01 | ✅ Positive | Private account hides posts from non-followers | Non-follower visiting private profile cannot see posts |
| TC_AM_02 | ✅ Positive | Follower can see private account posts after following | After follow accepted, private posts become visible |
| TC_AM_03 | ✅ Positive | Account deletion logs user out and prevents re-login | Deleted account credentials rejected on login |
| TC_AM_04 | ✅ Positive | Unauthenticated user redirected from any protected route | Accessing `/feed`, `/inbox`, `/settings`, etc. without token → redirect to `/login` |
| TC_AM_05 | ❌ Negative | JWT token manually removed from localStorage mid-session | API calls fail with 401; user redirected to login |

---

## 14. Admin & Moderation (`advanced-moderation.spec.js`, `production-pack.spec.js`)

| ID | Type | Test Case | Expected Result |
|----|------|-----------|-----------------|
| TC_ADMIN_01 | ✅ Positive | Admin user navigates to `/admin` → dashboard loads with Reports and Users tabs | All tabs visible and data loaded for admin |
| TC_ADMIN_02 | ✅ Positive | Admin sees Audit Logs tab (ADMIN role only) | Audit Logs tab visible only for ADMIN role |
| TC_ADMIN_03 | ✅ Positive | Admin clicks "Warn" on a user → alert confirms warning sent | Alert: "Warned [username]" is shown |
| TC_ADMIN_04 | ✅ Positive | Admin clicks "Suspend 7d" on a user → suspended user cannot login | Suspended account gets a login error during suspension period |
| TC_ADMIN_05 | ✅ Positive | Admin clicks "Unsuspend" → user can login again | Suspended user successfully logs in post-unsuspend |
| TC_ADMIN_06 | ✅ Positive | Admin clicks "Ban" on a user and confirms | User shows as "BANNED" in users list; banned user cannot log in |
| TC_ADMIN_07 | ✅ Positive | Admin clicks "Unban" on a banned user | User no longer marked as BANNED; login restored |
| TC_ADMIN_08 | ✅ Positive | Admin deletes a reported post from Reports tab | Post deleted; report removed from reports list |
| TC_ADMIN_09 | ✅ Positive | Admin clicks "Clear Report" on a report | Report removed from reports list; post not deleted |
| TC_ADMIN_10 | ✅ Positive | Admin verifies a user → verification badge appears on profile | User's profile shows a verification/checkmark badge |
| TC_ADMIN_11 | ✅ Positive | Audit log tab records admin actions | Each admin action (ban, suspend, etc.) appears in audit log with timestamp |
| TC_ADMIN_12 | ❌ Negative | Non-admin (MODERATOR) user navigates to `/admin` | 403 error from API; dashboard shows "Failed to load admin dashboard" |
| TC_ADMIN_13 | ❌ Negative | Regular user navigates to `/admin` | 403 from backend; page shows access error |
| TC_ADMIN_14 | ❌ Negative | Admin tries to ban a user who is already banned | Confirm dialog; attempted double-ban handled gracefully |
| TC_ADMIN_15 | ❌ Negative | Admin tries to delete a post that no longer exists | Error alert shown: "Failed to delete post" |

---

## 15. Personalization (`personalization.spec.js`)

| ID | Type | Test Case | Expected Result |
|----|------|-----------|-----------------|
| TC_PERS_01 | ✅ Positive | Add "tech" as an interest in Settings → tech-tagged posts appear in Explore | Interest-based recommendations are present in Explore |
| TC_PERS_02 | ✅ Positive | Remove all interests → generic explore feed with no personalization | Explore falls back to general recommendations |
| TC_PERS_03 | ❌ Negative | Add an interest with only whitespace | Whitespace-only tag is ignored; not added |

---

## 16. Summary Table

| Module | Spec File(s) | Positive | Negative | Total |
|--------|-------------|----------|----------|-------|
| Authentication | `social-platform.spec.js`, `auth.spec.js` | 10 | 11 | 21 |
| Settings | `settings.spec.js` | 10 | 6 | 16 |
| Post Management | `social-platform.spec.js`, `advanced-features.spec.js` | 13 | 7 | 20 |
| Stories | `stories.spec.js` | 7 | 2 | 9 |
| Follow / Unfollow | `follow-unfollow.spec.js` | 4 | 2 | 6 |
| Explore & Search | `explore-search.spec.js` | 5 | 5 | 10 |
| Notifications | `notifications.spec.js` | 7 | 1 | 8 |
| Direct Messaging | `chat.spec.js`, `advanced-features.spec.js` | 6 | 3 | 9 |
| Message Reactions | `message-reactions.spec.js` | 3 | 1 | 4 |
| Chat Groups | `groups_and_chat.spec.js` | 7 | 2 | 9 |
| Community Groups | `groups_and_chat.spec.js`, `group-features.spec.js` | 11 | 3 | 14 |
| Profile | `profile.spec.js` | 4 | 2 | 6 |
| Account Management | `account-management.spec.js` | 4 | 1 | 5 |
| Admin & Moderation | `advanced-moderation.spec.js`, `production-pack.spec.js` | 11 | 4 | 15 |
| Personalization | `personalization.spec.js` | 2 | 1 | 3 |
| **Total** | **17 spec files** | **104** | **51** | **155** |

---

## 17. Test Data Requirements

| Data Item | Used In |
|-----------|---------|
| `user1` (regular user, seeded) | Auth, Post, Chat, Follow, Notification tests |
| `user2` (regular user, seeded) | Follow, Chat, Notification tests |
| `adminUser` (ADMIN role) | Admin dashboard tests |
| `moderatorUser` (MODERATOR role) | Admin access control negative tests |
| `privateUser` (private account) | Account management, Profile tests |
| `bannedUser` | Login negative test (TC_AUTH_13) |
| `tests/fixtures/test-image.svg` | Post upload, Story, Chat image tests |
| Post with poll (seeded) | Poll vote tests |

---

## 18. Notes

- Tests that require two simultaneous users (real-time chat/notification) use **two browser contexts** (Playwright's `browser.newContext()`).
- WebSocket-dependent tests should use `page.waitForEvent` or `page.waitForSelector` with a suitable timeout (≥ 5 seconds) to allow socket events to arrive.
- Story expiry test (TC_STORY_09) requires either time-manipulation or a seed with a past `expiresAt` timestamp.
- All admin tests must log in as a user with the `ADMIN` role JWT; role is decoded from the JWT in the frontend.
