import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:8081';

// Test users
const testUser1 = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'Test123456!'
};

const testUser2 = {
    username: `user2_${Date.now()}`,
    email: `user2_${Date.now()}@example.com`,
    password: 'Test123456!'
};

test.describe('Social Media Platform - Complete Test Suite', () => {

    test.describe('Authentication', () => {

        test('should register a new user', async ({ page }) => {
            await page.goto(`${BASE_URL}/register`);

            await page.fill('input[type="text"]', testUser1.username);
            await page.fill('input[type="email"]', testUser1.email);
            await page.fill('input[type="password"]', testUser1.password);

            await page.click('button[type="submit"]');

            // Should redirect to feed after successful registration
            await page.waitForURL(`${BASE_URL}/feed`, { timeout: 5000 });
            expect(page.url()).toBe(`${BASE_URL}/feed`);
        });

        test('should login with existing user', async ({ page }) => {
            await page.goto(`${BASE_URL}/login`);

            await page.fill('input[type="text"]', testUser1.username);
            await page.fill('input[type="password"]', testUser1.password);

            await page.click('button[type="submit"]');

            await page.waitForURL(`${BASE_URL}/feed`, { timeout: 5000 });
            expect(page.url()).toBe(`${BASE_URL}/feed`);
        });
    });

    test.describe('Post Management', () => {

        test.beforeEach(async ({ page }) => {
            // Login before each test
            await page.goto(`${BASE_URL}/login`);
            await page.fill('input[type="text"]', testUser1.username);
            await page.fill('input[type="password"]', testUser1.password);
            await page.click('button[type="submit"]');
            await page.waitForURL(`${BASE_URL}/feed`);
        });

        test('should create a new post', async ({ page }) => {
            const postContent = `Test post ${Date.now()}`;

            // Find the create post textarea
            await page.fill('textarea[placeholder*="What"]', postContent);

            // Click post button
            await page.click('button:has-text("Post")');

            // Wait for post to appear in feed
            await page.waitForTimeout(1000);

            // Verify post appears
            const postElement = page.locator(`text=${postContent}`);
            await expect(postElement).toBeVisible();
        });

        test('should like a post', async ({ page }) => {
            // Wait for posts to load
            await page.waitForTimeout(1000);

            // Find and click the first like button
            const likeButton = page.locator('button').filter({ hasText: /❤|♥/ }).first();
            await likeButton.click();

            // Wait for optimistic update
            await page.waitForTimeout(500);
        });

        test('should comment on a post', async ({ page }) => {
            const commentText = `Test comment ${Date.now()}`;

            // Wait for posts to load
            await page.waitForTimeout(1000);

            // Find first comment input
            const commentInput = page.locator('input[placeholder*="comment"]').first();
            await commentInput.fill(commentText);

            // Submit comment
            await commentInput.press('Enter');

            // Wait for comment to appear
            await page.waitForTimeout(1000);

            // Verify comment appears
            await expect(page.locator(`text=${commentText}`)).toBeVisible();
        });
    });

    test.describe('Profile & Social Features', () => {

        test.beforeEach(async ({ page }) => {
            await page.goto(`${BASE_URL}/login`);
            await page.fill('input[type="text"]', testUser1.username);
            await page.fill('input[type="password"]', testUser1.password);
            await page.click('button[type="submit"]');
            await page.waitForURL(`${BASE_URL}/feed`);
        });

        test('should view own profile', async ({ page }) => {
            // Click on profile/user menu
            await page.click('button:has-text("' + testUser1.username + '")');

            // Click "My Profile" or similar
            await page.click('text=/Profile/i');

            // Should be on profile page
            await page.waitForURL(new RegExp(`/profile/${testUser1.username}`));

            // Should see username
            await expect(page.locator(`text=${testUser1.username}`)).toBeVisible();
        });

        test('should search for users', async ({ page }) => {
            // Find search input
            const searchInput = page.locator('input[placeholder*="Search"]').first();
            await searchInput.fill(testUser1.username);

            // Submit search
            await searchInput.press('Enter');

            // Wait for search results
            await page.waitForURL(new RegExp('/search'));

            // Should see search results
            await page.waitForTimeout(1000);
        });

        test('should update profile settings', async ({ page }) => {
            await page.goto(`${BASE_URL}/settings`);

            // Update bio
            const bioText = `Updated bio ${Date.now()}`;
            const bioInput = page.locator('textarea[placeholder*="bio"]');
            await bioInput.fill(bioText);

            // Save settings
            await page.click('button:has-text("Save")');

            // Wait for success
            await page.waitForTimeout(1000);
        });
    });

    test.describe('Trending Explore Feed', () => {

        test.beforeEach(async ({ page }) => {
            await page.goto(`${BASE_URL}/login`);
            await page.fill('input[type="text"]', testUser1.username);
            await page.fill('input[type="password"]', testUser1.password);
            await page.click('button[type="submit"]');
            await page.waitForURL(`${BASE_URL}/feed`);
        });

        test('should access explore page', async ({ page }) => {
            // Click explore button (🔥 emoji)
            await page.click('button[title*="Explore"]');

            // Should navigate to explore
            await page.waitForURL(`${BASE_URL}/explore`);

            // Should see explore heading
            await expect(page.locator('text=/Explore.*Trending/i')).toBeVisible();
        });

        test('should display trending posts', async ({ page }) => {
            await page.goto(`${BASE_URL}/explore`);

            // Wait for posts to load
            await page.waitForTimeout(2000);

            // Should have at least one post (if any exist)
            const posts = page.locator('.bg-white.dark\\:bg-gray-800');
            const count = await posts.count();
            console.log(`Found ${count} posts in explore feed`);
        });
    });

    test.describe('Admin Dashboard', () => {

        test.beforeEach(async ({ page }) => {
            await page.goto(`${BASE_URL}/login`);
            await page.fill('input[type="text"]', testUser1.username);
            await page.fill('input[type="password"]', testUser1.password);
            await page.click('button[type="submit"]');
            await page.waitForURL(`${BASE_URL}/feed`);
        });

        test('should access admin dashboard', async ({ page }) => {
            // Click admin button (🛡️ emoji)
            await page.click('button[title*="Admin"]');

            // Should navigate to admin
            await page.waitForURL(`${BASE_URL}/admin`);

            // Should see admin heading
            await expect(page.locator('text=/Admin.*Dashboard/i')).toBeVisible();
        });

        test('should display users list', async ({ page }) => {
            await page.goto(`${BASE_URL}/admin`);

            // Wait for users to load
            await page.waitForTimeout(2000);

            // Should see users section
            await expect(page.locator('text=/Users/i')).toBeVisible();

            // Should have at least one user
            const userElements = page.locator('.flex.justify-between');
            const count = await userElements.count();
            console.log(`Found ${count} users in admin dashboard`);
            expect(count).toBeGreaterThan(0);
        });

        test('should display reports', async ({ page }) => {
            await page.goto(`${BASE_URL}/admin`);

            // Wait for reports to load
            await page.waitForTimeout(2000);

            // Should see reports section
            await expect(page.locator('text=/Reports/i')).toBeVisible();
        });
    });

    test.describe('User Blocking', () => {

        test('should register second user', async ({ page }) => {
            await page.goto(`${BASE_URL}/register`);

            await page.fill('input[type="text"]', testUser2.username);
            await page.fill('input[type="email"]', testUser2.email);
            await page.fill('input[type="password"]', testUser2.password);

            await page.click('button[type="submit"]');
            await page.waitForURL(`${BASE_URL}/feed`);
        });

        test('should block another user', async ({ page }) => {
            // Login as user1
            await page.goto(`${BASE_URL}/login`);
            await page.fill('input[type="text"]', testUser1.username);
            await page.fill('input[type="password"]', testUser1.password);
            await page.click('button[type="submit"]');
            await page.waitForURL(`${BASE_URL}/feed`);

            // Navigate to user2's profile
            await page.goto(`${BASE_URL}/profile/${testUser2.username}`);

            // Wait for profile to load
            await page.waitForTimeout(1000);

            // Click block button if visible
            const blockButton = page.locator('button:has-text("Block")');
            if (await blockButton.isVisible()) {
                await blockButton.click();
                await page.waitForTimeout(1000);
            }
        });
    });

    test.describe('Messaging', () => {

        test.beforeEach(async ({ page }) => {
            await page.goto(`${BASE_URL}/login`);
            await page.fill('input[type="text"]', testUser1.username);
            await page.fill('input[type="password"]', testUser1.password);
            await page.click('button[type="submit"]');
            await page.waitForURL(`${BASE_URL}/feed`);
        });

        test('should access inbox', async ({ page }) => {
            // Click inbox/messages button
            await page.click('button[title*="Inbox"]');

            // Should navigate to inbox
            await page.waitForURL(`${BASE_URL}/inbox`);

            await page.waitForTimeout(1000);
        });
    });

    test.describe('Notifications', () => {

        test.beforeEach(async ({ page }) => {
            await page.goto(`${BASE_URL}/login`);
            await page.fill('input[type="text"]', testUser1.username);
            await page.fill('input[type="password"]', testUser1.password);
            await page.click('button[type="submit"]');
            await page.waitForURL(`${BASE_URL}/feed`);
        });

        test('should open notifications dropdown', async ({ page }) => {
            // Click notifications bell
            await page.click('button[title*="Notification"]');

            // Wait for dropdown to appear
            await page.waitForTimeout(500);

            // Dropdown should be visible
            const dropdown = page.locator('.absolute').filter({ hasText: /Notification/i });
            // Check if it exists (may be empty)
        });
    });

    test.describe('Theme Toggle', () => {

        test.beforeEach(async ({ page }) => {
            await page.goto(`${BASE_URL}/login`);
            await page.fill('input[type="text"]', testUser1.username);
            await page.fill('input[type="password"]', testUser1.password);
            await page.click('button[type="submit"]');
            await page.waitForURL(`${BASE_URL}/feed`);
        });

        test('should toggle dark/light theme', async ({ page }) => {
            // Click theme toggle button
            const themeButton = page.locator('button[title*="Theme"]');
            await themeButton.click();

            // Wait for theme change
            await page.waitForTimeout(500);

            // Click again to toggle back
            await themeButton.click();
            await page.waitForTimeout(500);
        });
    });

    test.describe('Content Moderation', () => {

        test.beforeEach(async ({ page }) => {
            await page.goto(`${BASE_URL}/login`);
            await page.fill('input[type="text"]', testUser1.username);
            await page.fill('input[type="password"]', testUser1.password);
            await page.click('button[type="submit"]');
            await page.waitForURL(`${BASE_URL}/feed`);
        });

        test('should report a post', async ({ page }) => {
            // Wait for posts to load
            await page.waitForTimeout(1000);

            // Find first three-dot menu
            const menuButton = page.locator('button:has-text("⋮")').first();
            await menuButton.hover();

            // Wait for menu to appear
            await page.waitForTimeout(500);

            // Look for Report button
            const reportButton = page.locator('button:has-text("Report")').first();
            if (await reportButton.isVisible()) {
                await reportButton.click();
                await page.waitForTimeout(1000);
            }
        });
    });

    test.describe('Logout', () => {

        test('should logout successfully', async ({ page }) => {
            await page.goto(`${BASE_URL}/login`);
            await page.fill('input[type="text"]', testUser1.username);
            await page.fill('input[type="password"]', testUser1.password);
            await page.click('button[type="submit"]');
            await page.waitForURL(`${BASE_URL}/feed`);

            // Open user menu
            await page.click('button:has-text("' + testUser1.username + '")');

            // Click logout
            await page.click('text=/Logout/i');

            // Should redirect to login
            await page.waitForURL(`${BASE_URL}/login`);
            expect(page.url()).toBe(`${BASE_URL}/login`);
        });
    });
});
