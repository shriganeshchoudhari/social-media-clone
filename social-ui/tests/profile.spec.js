import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Profile Module', () => {

    let currentUser;
    let targetUser;

    test.beforeEach(async ({ page }) => {
        // We need an isolated current user
        const ts = Date.now().toString().slice(-7);
        currentUser = `prof_userA_${ts}`;
        targetUser = `prof_userB_${ts}`;

        // Create Target User (User B)
        await page.goto(`${BASE_URL}/register`);
        await page.locator('input[placeholder="johndoe"]').fill(targetUser);
        await page.locator('input[type="email"]').fill(`${targetUser}@example.com`);
        await page.locator('input[type="password"]').fill('Password123!');
        await page.getByRole('button', { name: /Register|Creating Account/i }).click();
        await page.waitForURL(`${BASE_URL}/feed`, { timeout: 10000 });

        // Let User B create a post so it can appear in feed later
        await page.getByPlaceholder("What's on your mind?").fill(`Profile test post from ${targetUser}`);
        await page.getByRole('button', { name: 'Post' }).click();
        await expect(page.getByText(`Profile test post from ${targetUser}`).first()).toBeVisible({ timeout: 10000 });

        // Logout User B
        await page.evaluate(() => localStorage.clear());

        // Create Current User (User A)
        await page.goto(`${BASE_URL}/register`);
        await page.locator('input[placeholder="johndoe"]').fill(currentUser);
        await page.locator('input[type="email"]').fill(`${currentUser}@example.com`);
        await page.locator('input[type="password"]').fill('Password123!');
        await page.getByRole('button', { name: /Register|Creating Account/i }).click();
        await page.waitForURL(`${BASE_URL}/feed`, { timeout: 10000 });

        // Let User A create a post
        await page.getByPlaceholder("What's on your mind?").fill(`Profile test post from ${currentUser}`);
        await page.getByRole('button', { name: 'Post' }).click();
        await expect(page.getByText(`Profile test post from ${currentUser}`).first()).toBeVisible({ timeout: 10000 });
    });

    test.afterEach(async ({ page }) => {
        await page.evaluate(() => localStorage.clear());
    });

    test('TC_PROF_01 - Navigate to own profile', async ({ page }) => {
        await page.goto(`${BASE_URL}/profile/${currentUser}`);

        await expect(page).toHaveURL(new RegExp(`.*\/profile\/${currentUser}`));
        // Should show own post
        await expect(page.getByText(`Profile test post from ${currentUser}`).first()).toBeVisible();
        await expect(page.locator('text=Followers')).toBeVisible();
        await expect(page.locator('text=Following')).toBeVisible();
    });

    test('TC_PROF_02 - Navigate to another users public profile', async ({ page }) => {
        await page.goto(`${BASE_URL}/profile/${targetUser}`);
        // Profile data visible
        await expect(page.getByText(`Profile test post from ${targetUser}`).first()).toBeVisible();
        // Follow button shown
        await expect(page.getByRole('button', { name: /^Follow$/i })).toBeVisible();
    });

    test('TC_PROF_03 - Saved posts tab on own profile shows bookmarked posts', async ({ page }) => {
        // Bookmark target user's post
        await page.goto(`${BASE_URL}/profile/${targetUser}`);
        await expect(page.getByText(`Profile test post from ${targetUser}`).first()).toBeVisible();

        // Find bookmark button on the post card
        // Assuming there is a standard bookmark icon/button. Let's look for a button with an SVG or aria-label for bookmarking.
        const bookmarkBtn = page.getByRole('button', { name: /bookmark|save/i }).first().or(page.locator('button svg.fa-bookmark').first());
        await bookmarkBtn.click();
        await page.waitForTimeout(1000); // Give it a sec to save

        // Go to own profile saved tab
        await page.goto(`${BASE_URL}/profile/${currentUser}`);
        await page.getByRole('tab', { name: /Saved/i }).click().catch(async () => {
            await page.locator('text=Saved').click();
        });

        await expect(page.getByText(`Profile test post from ${targetUser}`).first()).toBeVisible({ timeout: 5000 });
    });

    test('TC_PROF_04 - Block a user from their profile', async ({ page }) => {
        await page.goto(`${BASE_URL}/profile/${targetUser}`);
        await expect(page.getByText(`Profile test post from ${targetUser}`).first()).toBeVisible();

        // Find block button. Often hidden in a 3-dot menu on profile or a specific button
        await page.getByRole('button', { name: /Block/i }).first().click().catch(async () => {
            // Might be in a menu
            await page.locator('button.profile-menu-button, button[aria-label="More options"]').click();
            await page.getByRole('menuitem', { name: /Block/i }).click();
        });

        // Wait for confirmation dialogue or directly block
        const confirmBlock = page.getByRole('button', { name: /Confirm|Yes|Block/i });
        if (await confirmBlock.isVisible()) {
            await confirmBlock.click();
        }

        await expect(page.locator('text=/Blocked successfully|blocked/i')).toBeVisible({ timeout: 5000 });

        // Go home and check feed
        await page.goto(`${BASE_URL}/feed`);
        await page.reload();
        await page.waitForTimeout(1000);
        await expect(page.getByText(`Profile test post from ${targetUser}`)).toBeHidden();
    });

    test('TC_PROF_05 - Navigate to profile of a private account as non-follower', async ({ page }) => {
        // Logout User A
        await page.evaluate(() => localStorage.clear());

        // Login Target User
        await page.goto(`${BASE_URL}/login`);
        await page.locator('input[placeholder="johndoe"]').fill(targetUser);
        await page.locator('input[type="password"]').fill('Password123!');
        await page.getByRole('button', { name: /Login|Logging in/i }).click();
        await page.waitForURL(`${BASE_URL}/feed`);

        // Change to private
        await page.goto(`${BASE_URL}/settings`);
        await page.waitForSelector('text=Private Account');
        await page.locator('button', { has: page.locator('span.bg-white') }).click();
        await expect(page.locator('text=/Account is now Private/i')).toBeVisible({ timeout: 5000 });

        // Logout Target User
        await page.evaluate(() => localStorage.clear());

        // Login User A
        await page.goto(`${BASE_URL}/login`);
        await page.locator('input[placeholder="johndoe"]').fill(currentUser);
        await page.locator('input[type="password"]').fill('Password123!');
        await page.getByRole('button', { name: /Login|Logging in/i }).click();
        await page.waitForURL(`${BASE_URL}/feed`);

        // Go to Target User profile
        await page.goto(`${BASE_URL}/profile/${targetUser}`);
        await expect(page.locator('text=/This account is private|Private/i')).toBeVisible();
        await expect(page.getByText(`Profile test post from ${targetUser}`)).toBeHidden();
    });

    test('TC_PROF_06 - Navigate to a non-existent user profile', async ({ page }) => {
        await page.goto(`${BASE_URL}/profile/this_user_does_not_exist_at_all_999`);
        await expect(page.locator('text=/User not found|404|not exist/i')).toBeVisible();
    });
});
