# UI/UX Design Specification

## 1. Overview
The front-end is designed to be fully responsive (mobile-first), fast, and intuitive. It uses an aesthetic that mimics modern social networks, featuring a sidebar navigation pattern on desktops and a bottom navigation bar on mobile devices.

## 2. Design System & Typography
- **Framework**: React.js with Vite.
- **Styling**: Tailwind CSS.
- **Typography**: Inter (or system-ui variations).
- **Icons**: Lucide React for consistent line-style iconology.

## 3. Color Palette
Defined within the `tailwind.config.js` or `index.css` via CSS variables:
- **Primary**: Brand Blue `#1D4ED8`.
- **Background (Light Mode)**: Off-white `#F9FAFB`.
- **Text (Light Mode)**: Slate/Gray `#1F2937`.
- **Borders/Dividers**: `#E5E7EB`.
- *Dark mode variables can be introduced utilizing Tailwind's `dark:` selectors.*

## 4. Component Library
The UI is composed of several reusable components located in `src/components/`:
- **Navbar/Sidebar**: Contains navigation links (Home, Profile, Messages, Notifications).
- **Feed**: Renders lists of `PostCard` components.
- **PostCard**: Displays user avatar, username, timestamp, post content, and interaction buttons (Like, Comment, Share).
- **StoriesBar**: A horizontal scrolling section at the top of the feed showing active stories.
- **Modals**: Used for creating posts, joining groups, and logging out without losing current page context.

## 5. Interactions & Feedback
- `react-hot-toast` is used for non-intrusive, global alert messages (e.g., "Post created successfully", "Error logging in").
- Buttons utilize hover and active states (e.g., changing background color opacity) for immediate visual feedback.
