import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Follow / Unfollow System', () => {

    let currentUser;
    let targetUser;

    test.beforeEach(async ({ page }) => {
        // We need an isolated current user
        const ts = Date.now();
        currentUser = `userA_${ts}`;
        targetUser = `userB_${ts}`;

        // 1. Create Target User (User B)
        await page.goto(`${BASE_URL}/register`);
        await page.locator('input[placeholder="johndoe"]').fill(targetUser);
        await page.locator('input[type="email"]').fill(`${targetUser}@example.com`);
        await page.locator('input[type="password"]').fill('Password123!');
        await page.getByRole('button', { name: /Register|Creating Account/i }).click();
        await page.waitForURL(`${BASE_URL}/feed`, { timeout: 10000 });

        // Let User B create a post so it can appear in feed later
        await page.locator('textarea[placeholder="What\'s on your mind?"]').fill(`Hello from ${targetUser}`);
        await page.getByRole('button', { name: 'Post' }).click();
        await expect(page.getByText(`Hello from ${targetUser}`).first()).toBeVisible({ timeout: 10000 });
        await page.waitForTimeout(2000);

        // Logout User B
        await page.evaluate(() => localStorage.clear());

        // 2. Create Current User (User A)
        await page.goto(`${BASE_URL}/register`);
        await page.locator('input[placeholder="johndoe"]').fill(currentUser);
        await page.locator('input[type="email"]').fill(`${currentUser}@example.com`);
        await page.locator('input[type="password"]').fill('Password123!');
        await page.getByRole('button', { name: /Register|Creating Account/i }).click();
        await page.waitForURL(`${BASE_URL}/feed`, { timeout: 10000 });
    });

    test.afterEach(async ({ page }) => {
        await page.evaluate(() => localStorage.clear());
    });

    test('TC_FOL_01 - Click Follow on another user profile', async ({ page }) => {
        // Go to target profile
        await page.goto(`${BASE_URL}/profile/${targetUser}`);

        // Initial state: Button says Follow
        const followBtn = page.getByRole('button', { name: /^Follow$/i });
        await expect(followBtn).toBeVisible();

        // Click Follow
        await followBtn.click();
        // State updates to Following
        await expect(page.getByRole('button', { name: /^Following$/i })).toBeVisible({ timeout: 5000 });

        // Follower count should be 1 (since target user was fresh)
        // Wait for UI to update (React state)
        await expect(page.locator('button', { hasText: /1\s*Followers/i })).toBeVisible({ timeout: 5000 });
    });

    test('TC_FOL_02 - Followed users posts now appear in home feed', async ({ page }) => {
        // Follow target
        await page.goto(`${BASE_URL}/profile/${targetUser}`);
        await page.getByRole('button', { name: /^Follow$/i }).click();
        await expect(page.getByRole('button', { name: /^Following$/i })).toBeVisible({ timeout: 5000 });

        // Go home
        await page.goto(`${BASE_URL}/feed`);
        await expect(page.getByText(`Hello from ${targetUser}`).first()).toBeVisible({ timeout: 10000 });
    });

    test('TC_FOL_03 - Click Unfollow on a followed user profile', async ({ page }) => {
        // First Follow
        await page.goto(`${BASE_URL}/profile/${targetUser}`);
        await page.getByRole('button', { name: /^Follow$/i }).click();
        await expect(page.getByRole('button', { name: /^Following$/i })).toBeVisible({ timeout: 5000 });

        // Now Unfollow
        await page.getByRole('button', { name: /^Following$/i }).click();
        await expect(page.getByRole('button', { name: /^Follow$/i })).toBeVisible({ timeout: 5000 });
    });

    test('TC_FOL_04 - Follow generates a follow notification for target user', async ({ page }) => {
        // User A follows User B
        await page.goto(`${BASE_URL}/profile/${targetUser}`);
        await page.getByRole('button', { name: /^Follow$/i }).click();
        await expect(page.getByRole('button', { name: /^Following$/i })).toBeVisible({ timeout: 5000 });

        // Switch back to User B to check notification
        await page.evaluate(() => localStorage.clear());
        await page.goto(`${BASE_URL}/login`);
        await page.locator('input[placeholder="johndoe"]').fill(targetUser);
        await page.locator('input[type="password"]').fill('Password123!');
        await page.getByRole('button', { name: /Login|Logging in/i }).click();
        await page.waitForURL(`${BASE_URL}/feed`, { timeout: 10000 });

        await page.goto(`${BASE_URL}/notifications`);
        await expect(page.getByText(`${currentUser} followed you`).first()).toBeVisible({ timeout: 5000 });
    });

    test('TC_FOL_05 - Attempt to follow yourself', async ({ page }) => {
        await page.goto(`${BASE_URL}/profile/${currentUser}`);
        const followBtn = page.getByRole('button', { name: /^Follow$/i });
        const followingBtn = page.getByRole('button', { name: /^Following$/i });
        // According to AC, button should not be visible
        await expect(followBtn).toBeHidden();
        await expect(followingBtn).toBeHidden();
    });

    test('TC_FOL_06 - Follow a private user', async ({ page }) => {
        // Target User setup: make them private first
        // Need to login as Target User and toggle privacy
        await page.evaluate(() => localStorage.clear());
        await page.goto(`${BASE_URL}/login`);
        await page.locator('input[placeholder="johndoe"]').fill(targetUser);
        await page.locator('input[type="password"]').fill('Password123!');
        await page.getByRole('button', { name: /Login|Logging in/i }).click();
        await page.waitForURL(`${BASE_URL}/feed`, { timeout: 10000 });

        await page.goto(`${BASE_URL}/settings`);
        await page.waitForSelector('text=Private Account');
        await page.locator('button', { has: page.locator('span.bg-white') }).click();
        await expect(page.locator('text=/Account is now Private/i')).toBeVisible({ timeout: 5000 });

        // Switch to User A
        await page.evaluate(() => localStorage.clear());
        await page.goto(`${BASE_URL}/login`);
        await page.locator('input[placeholder="johndoe"]').fill(currentUser);
        await page.locator('input[type="password"]').fill('Password123!');
        await page.getByRole('button', { name: /Login|Logging in/i }).click();
        await page.waitForURL(`${BASE_URL}/feed`, { timeout: 10000 });

        // User A visits User B
        await page.goto(`${BASE_URL}/profile/${targetUser}`);
        await expect(page.locator('text=/This account is private/i')).toBeVisible();

        // There might not be a "Requested" state, but we can verify the text is present when private
        // and following state behavior if supported. The frontend shows simple follow/unfollow per Profile.jsx
        await expect(page.getByRole('button', { name: /^Follow$/i })).toBeVisible();
    });
});
