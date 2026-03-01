# UI/UX Design Specification

## 1. Overview

This document specifies the design principles, component architecture, visual language, and interaction patterns for the Social Media Clone frontend. The frontend is a **single-page application (SPA)** built with React 18 + Vite, styled using **Tailwind CSS**.

---

## 2. Tech Stack

| Technology | Purpose |
|---|---|
| **React 18** | Component-based UI library |
| **Vite** | Lightning-fast build tool and dev server |
| **Tailwind CSS** | Utility-first CSS framework for styling |
| **React Router v6** | Client-side routing and navigation |
| **Axios** | HTTP client for all API calls |
| **SockJS + STOMP.js** | WebSocket client for real-time messaging |
| **react-hot-toast** | Toast notification system |
| **Lucide React** | Icon library with consistent line icons |

---

## 3. Design Language & Visual System

### 3.1 Color Palette

The application supports both **Light** and **Dark** modes using Tailwind's `dark:` selector.

| Semantic Token | Light Mode Value | Dark Mode Value |
|---|---|---|
| Background | `#F9FAFB` (gray-50) | `#111827` (gray-900) |
| Surface / Cards | `#FFFFFF` (white) | `#1F2937` (gray-800) |
| Primary / Brand | `#2563EB` (blue-600) | `#3B82F6` (blue-500) |
| Text Primary | `#111827` (gray-900) | `#F9FAFB` (gray-50) |
| Text Secondary | `#6B7280` (gray-500) | `#9CA3AF` (gray-400) |
| Borders/Dividers | `#E5E7EB` (gray-200) | `#374151` (gray-700) |
| Danger/Destructive | `#DC2626` (red-600) | `#FCA5A5` (red-300) |
| Success | `#16A34A` (green-600) | `#86EFAC` (green-300) |

### 3.2 Typography

- **Primary Font**: `Inter` (loaded via Google Fonts or `font-sans` Tailwind fallback)
- **Heading (h1)**: `text-2xl font-bold`
- **Subheading (h2)**: `text-xl font-semibold`
- **Body text**: `text-sm` or `text-base`
- **Button text**: `font-medium`
- **Captions / Labels**: `text-xs text-gray-500`

### 3.3 Iconography

All icons come from **Lucide React** (`lucide-react` package). Icons are consistently sized:
- Navigation icons: `w-5 h-5` or `w-6 h-6`
- Action icons on cards: `w-4 h-4` or `w-5 h-5`
- Emoji reactions use native Unicode emojis for simple cross-platform rendering.

---

## 4. Application Layout

### 4.1 Desktop Layout (≥768px)

```
+--------------------------------------------------+
|  GLOBAL NAVBAR (top bar, full width)             |
|  Logo | Search Bar | Nav Icons | Notifications   |
+--------------------------------------------------+
|               |                                  |
|  LEFT SIDEBAR |  MAIN CONTENT AREA               |
|  (Optional)   |                                  |
|               |  Renders current route component |
|               |                                  |
+--------------------------------------------------+
```

### 4.2 Mobile Layout (<768px)

- **Navbar** collapses to show only the logo and icon buttons.
- **Sidebar** is hidden; navigation happens via the Navbar icons directly.
- The main content area takes full width.

---

## 5. Page Components (Routes)

| Route | Component | Description |
|---|---|---|
| `/` | `Feed.jsx` | Personalized home feed |
| `/register` | `Register.jsx` | User registration form |
| `/login` | `Login.jsx` | Login form |
| `/profile/:username` | `Profile.jsx` | User profile page |
| `/explore` | `Explore.jsx` | Trending topics + explore posts |
| `/chat/:username` | `ChatPage.jsx` | Direct message conversation |
| `/search` | `Search.jsx` | Global user search results |
| `/notifications` | `Notifications.jsx` | Notification inbox |
| `/settings` | `Settings.jsx` | Account settings |
| `/admin` | `AdminDashboard.jsx` | Admin moderation panel (admin only) |

---

## 6. Reusable Component Library (`src/components/`)

### `Navbar.jsx`
The global top navigation bar. Contains:
- **Logo**: "Social" brand text (links to `/`).
- **Search Bar**: Real-time input that navigates to `/search?q=...`.
- **Nav Icons**: Links to Home, Chat, Explore, Notifications, People.
- **User Menu**: Logout button (accessible from the avatar or icon).
- **Dark Mode Toggle**: Switches between light and dark themes by toggling `dark` class on `<html>`.

### `Layout.jsx`
A wrapper component that applies consistent padding and structure to all page content.

### `PostCard.jsx`
The primary content card. Displays:
- Author avatar (with fallback initials), username, and verified badge if applicable.
- Post text content and up to 4 images (with media gallery modal on click).
- Like button (live count), Comment button (live count), and Share button.
- Three-dot menu: Delete option for owner/admin, Report option for others.
- Timestamp in relative format (e.g., "2 hours ago").

### `StoriesBar.jsx`
A horizontal scrolling row at the top of the Feed page showing active stories from followed users. Each story bubble shows the user's avatar and username.

### `VerificationBadge.jsx`
A small SVG checkmark badge displayed next to the username of verified users. Styled in blue to match the platform brand.

### `GroupEvents.jsx`
Renders events linked to a specific community group. Shows event title, date, and an RSVP button.

---

## 7. Profile Page UX

The Profile page (`/profile/:username`) has been carefully designed to match modern social media conventions:

### Header Layout
```
[ Banner Image (gradient fallback)             ]
[ Avatar  ]     [ Block ] [ Message ] [ Follow ]
[ username  ✓ ]
[ X Followers   Y Following ]
[ bio text here... ]
[ 🔗 website link ]
```

- The **Avatar** overlaps the bottom of the banner by using negative top margin (`-mt-12`).
- **Action buttons** (Block, Message, Follow) appear in the top-right of the card, aligned with the banner bottom.
- Username, follower counts, and bio are placed below the avatar in a clean left-aligned block.
- Follower and Following counts are **clickable** and open a modal listing all users.

### Tabs
Two tabs below the profile header:
- **My Posts**: Grid of all user's posts (click to open full media modal).
- **Saved Posts**: Grid of all posts the user has bookmarked/saved.

---

## 8. Chat Page UX

The Chat Page (`/chat/:username`) provides a real-time messaging experience:
- **Message History**: Displayed in a reverse-chronological scrollable list. User's own messages are right-aligned, others are left-aligned.
- **Auto-Scroll**: The chat view automatically scrolls to the latest message when the page loads or when a new message arrives.
- **Read Receipts**: A checkmark indicator (✓ for sent, ✓✓ for read) on each message.
- **Image Upload**: Users can send images in chats via file attachment.
- **WebSocket Connection**: Messages appear instantly without requiring a page refresh.

---

## 9. Search Page UX

The Search page (`/search`) shows user results:
- Each result card displays the user's avatar, username, and bio.
- **Action Buttons** on each result:
  - **View Profile**: Navigate to `/profile/:username`.
  - **Message**: Navigate to `/chat/:username`.
  - **Follow**: Toggle follow/unfollow directly from the search results.

---

## 10. Interaction & Feedback Patterns

### Toasts (react-hot-toast)
Non-intrusive popup messages appear in the top-right corner for all key actions:
- ✅ Success: "Post created!", "Followed successfully"
- ❌ Error: "Failed to load posts", "Login failed"
- ⏳ Loading: Shown as a spinner toast while async operations are pending.

### Button States
- All interactive buttons have `:hover` styles (darkening or lightening background).
- Follow button changes text and style based on state: "Follow" (blue fill) vs. "Following" (gray/red on hover).
- Disabled buttons are visually dimmed (`opacity-50`).

### Loading States
- Skeleton loaders (pulsing placeholder cards) are shown while feed/posts are fetching.
- Infinite scroll is used on the Feed and Explore pages — new posts load automatically as the user scrolls to the bottom.

### Modals
- The Followers/Following lists, post media gallery, and post creation form all use overlay modals.
- Modals close on clicking the backdrop or the `✕` button.
- Focus is trapped within modals for accessibility.

---

## 11. Responsiveness

| Breakpoint | Tailwind prefix | Layout behavior |
|---|---|---|
| < 640px | (default/mobile) | Single column, compact cards |
| 640px+ | `sm:` | Slightly wider cards, buttons inline |
| 768px+ | `md:` | Profile info switches to horizontal layout |
| 1024px+ | `lg:` | Optional sidebar becomes visible |

---

## 12. Dark Mode

Dark mode is enabled by toggling the `dark` class on the `<html>` element.

- The preference is persisted in `localStorage` (`theme: 'dark' | 'light'`).
- All components use `dark:` prefixed Tailwind classes for dark-mode-specific styles.
- Icon colors, backgrounds, borders, and text colors all adapt automatically.
