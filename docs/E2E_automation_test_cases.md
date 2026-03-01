# E2E Automation Test Cases

## 1. Overview
This document outlines the End-to-End (E2E) automation test cases developed for the Social Media Clone using **Playwright**. These tests validate core user flows from the frontend interface down to the backend services.

> All test files are located in `social-ui/tests/`.  
> Run from `social-ui/` directory using `npx playwright test`.

---

## 2. Playwright Test Suites

### 2.1. Authentication (`social-platform.spec.js`)
| ID | Test Case | File |
|----|-----------|------|
| TC_AUTH_01 | Register a new user and redirect to feed | `social-platform.spec.js` |
| TC_AUTH_02 | Login with existing credentials | `social-platform.spec.js` |
| TC_AUTH_03 | Logout and redirect to login page | `social-platform.spec.js` |

---

### 2.2. Account Management & Privacy (`account-management.spec.js`)
| ID | Test Case |
|----|-----------|
| TC_AM_01 | Private account hides posts from non-followers |
| TC_AM_02 | Follower can see private account posts after following |
| TC_AM_03 | Account deletion logs user out and prevents re-login |

---

### 2.3. Settings (`settings.spec.js`)
| ID | Test Case |
|----|-----------|
| TC_SET_01 | Update profile bio and confirm success message |
| TC_SET_02 | Change password with correct old password — login succeeds |
| TC_SET_03 | Change password with wrong old password — error shown |
| TC_SET_04 | Password too short — HTML5 validation blocks submit |

---

### 2.4. Post Management (`social-platform.spec.js`, `advanced-features.spec.js`)
| ID | Test Case |
|----|-----------|
| TC_POST_01 | Create a text post — appears in feed |
| TC_POST_02 | Like a post — count updates |
| TC_POST_03 | Comment on a post — comment appears immediately |
| TC_POST_04 | Edit a post — updated content visible |
| TC_POST_05 | Delete a post — removed from feed |
| TC_POST_06 | Report a post via three-dot menu |

---

### 2.5. Media Posts (`post_upload.spec.js`, `multi-image.spec.js`)
| ID | Test Case |
|----|-----------|
| TC_MEDIA_01 | Create post with single image — image appears in feed |
| TC_MEDIA_02 | Create post with multiple images — grid renders all |
| TC_MEDIA_03 | Remove one image from preview before posting |

---

### 2.6. Follow / Unfollow (`follow-unfollow.spec.js`) *(New)*
| ID | Test Case |
|----|-----------|
| TC_FOL_01 | Follow a user — button toggles to "Unfollow", follower count increases |
| TC_FOL_02 | Followed user's posts appear in home feed |
| TC_FOL_03 | Unfollow — button reverts to "Follow" |

---

### 2.7. Bookmark / Save (`bookmark.spec.js`) *(New)*
| ID | Test Case |
|----|-----------|
| TC_BK_01 | Bookmark a post — appears in profile "Saved" tab |
| TC_BK_02 | Unbookmark — post removed from "Saved" tab |

---

### 2.8. Stories (`stories.spec.js`) *(New)*
| ID | Test Case |
|----|-----------|
| TC_STORY_01 | Upload an image as a story via "+ Add Story" |
| TC_STORY_02 | Another user (follower) sees the story bubble in feed |
| TC_STORY_03 | Clicking story bubble opens the story viewer |

---

### 2.9. Explore & Search (`social-platform.spec.js`, `explore-search.spec.js`) *(New)*
| ID | Test Case |
|----|-----------|
| TC_EXP_01 | Global search bar navigates to `/search` results page |
| TC_EXP_02 | Search "People" tab shows matching users |
| TC_EXP_03 | Search "Posts" tab shows matching posts |
| TC_EXP_04 | Explore page loads with "Recommended for you" content |
| TC_EXP_05 | Explore internal search bar filters results |

---

### 2.10. Notifications (`notifications.spec.js`) *(New)*
| ID | Test Case |
|----|-----------|
| TC_NOTIF_01 | Like action creates a notification for post owner |
| TC_NOTIF_02 | Follow action creates a follow notification |
| TC_NOTIF_03 | "Mark all read" clears the notification badge |

---

### 2.11. Direct Messaging (`chat.spec.js`, `advanced-features.spec.js`)
| ID | Test Case |
|----|-----------|
| TC_CHAT_01 | User 2 sends message to User 1 — received in real-time |
| TC_CHAT_02 | User 1 replies — User 2 sees reply in real-time |
| TC_CHAT_03 | Send image in chat — image renders with `/uploads/` src |

---

### 2.12. Message Reactions (`message-reactions.spec.js`) *(New)*
| ID | Test Case |
|----|-----------|
| TC_REACT_01 | Hover message → reaction picker appears |
| TC_REACT_02 | Click emoji reaction — appears on the message |
| TC_REACT_03 | Sender sees receiver's reaction in real-time (WebSocket) |

---

### 2.13. Groups (`groups_and_chat.spec.js`)
| ID | Test Case |
|----|-----------|
| TC_GRP_01 | Create a Community Group with description and member |
| TC_GRP_02 | Group detail page shows correct member count |
| TC_GRP_03 | Create a Chat Group from Inbox |
| TC_GRP_04 | Send group message — all members see it |

---

### 2.14. Personalization (`personalization.spec.js`)
| ID | Test Case |
|----|-----------|
| TC_PERS_01 | Add "tech" interest — tech posts appear in Explore |

---

### 2.15. Admin & Moderation (`advanced-moderation.spec.js`, `production-pack.spec.js`)
| ID | Test Case |
|----|-----------|
| TC_ADMIN_01 | Normal user cannot access `/admin` dashboard |
| TC_ADMIN_02 | Admin user can access `/admin` dashboard |
| TC_ADMIN_03 | Admin can warn a user (alert dialog confirms) |
| TC_ADMIN_04 | Admin can suspend user — suspended user cannot login |
| TC_ADMIN_05 | Admin can unsuspend user — user can login again |
| TC_ADMIN_06 | Admin can ban/unban a user |
| TC_ADMIN_07 | Admin can delete a reported post |
| TC_ADMIN_08 | Admin can clear a report |
| TC_ADMIN_09 | Blocked user's posts filtered from Explore feed |

---

## 3. Summary Table

| Module | Spec File | Tests |
|--------|-----------|-------|
| Authentication | `social-platform.spec.js` | 3 |
| Account Management | `account-management.spec.js` | 3 |
| Settings | `settings.spec.js` | 4 |
| Post Management | `social-platform.spec.js`, `advanced-features.spec.js` | 6 |
| Media Posts | `post_upload.spec.js`, `multi-image.spec.js` | 3 |
| Follow/Unfollow *(New)* | `follow-unfollow.spec.js` | 3 |
| Bookmark/Save *(New)* | `bookmark.spec.js` | 2 |
| Stories *(New)* | `stories.spec.js` | 3 |
| Explore & Search *(New)* | `explore-search.spec.js`, `social-platform.spec.js` | 5 |
| Notifications *(New)* | `notifications.spec.js` | 3 |
| Direct Messaging | `chat.spec.js`, `advanced-features.spec.js` | 3 |
| Message Reactions *(New)* | `message-reactions.spec.js` | 3 |
| Groups | `groups_and_chat.spec.js` | 4 |
| Personalization | `personalization.spec.js` | 1 |
| Admin & Moderation | `advanced-moderation.spec.js`, `production-pack.spec.js` | 9 |
| **Total** | **17 spec files** | **55 tests** |


