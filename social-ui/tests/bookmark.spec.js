import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

/**
 * Bookmark / Save Module Tests
 * - Bookmark a post → icon fills (saved state)
 * - Bookmarked post appears in profile "Saved" tab
 * - Unbookmark → post removed from Saved tab
 */
test.describe('Bookmark / Save Posts', () => {

    const register = async (page, username, password = 'password123') => {
        await page.goto(`${BASE_URL}/register`);
        await page.getByPlaceholder('johndoe').fill(username);
        await page.getByPlaceholder('john@example.com').fill(`${username}@test.com`);
        await page.getByPlaceholder('••••••••').fill(password);
        await page.getByRole('button', { name: /Register|Creating/i }).click();
        await page.waitForURL(`${BASE_URL}/feed`);
    };

    test('bookmark post and verify in Saved tab on profile', async ({ page }) => {
        const ts = Date.now().toString().slice(-7);
        const username = `bookmark_user_${ts}`;

        await register(page, username);

        // Create a unique post to bookmark
        const postContent = `Bookmark test post ${ts}`;
        await page.getByPlaceholder("What's on your mind?").fill(postContent);
        await page.getByRole('button', { name: 'Post' }).click();
        await expect(page.locator(`text=${postContent}`)).toBeVisible();

        await page.waitForTimeout(1000);

        // Find the bookmark icon on the post
        // Bookmark button is typically a bookmark/ribbon SVG at end of post actions
        const postCard = page.locator('div', { hasText: postContent }).first();
        const bookmarkBtn = postCard.locator('button').last(); // bookmark is usually last action button
        await bookmarkBtn.click();
        await page.waitForTimeout(1000);

        // Navigate to own profile → Saved tab
        await page.goto(`${BASE_URL}/profile/${username}`);
        await page.waitForTimeout(1500);

        // Click "Saved" tab
        const savedTab = page.locator('button:has-text("Saved"), [role="tab"]:has-text("Saved")');
        await expect(savedTab).toBeVisible();
        await savedTab.click();
        await page.waitForTimeout(1000);

        // Post should appear in Saved tab
        await expect(page.locator(`text=${postContent}`)).toBeVisible();

        console.log('✅ Bookmark test passed — post appears in Saved tab');
    });

    test('unbookmark removes post from Saved tab', async ({ page }) => {
        const ts = Date.now().toString().slice(-7);
        const username = `unbookmark_user_${ts}`;

        await register(page, username);

        // Create and bookmark a post
        const postContent = `Unbookmark test post ${ts}`;
        await page.getByPlaceholder("What's on your mind?").fill(postContent);
        await page.getByRole('button', { name: 'Post' }).click();
        await expect(page.locator(`text=${postContent}`)).toBeVisible();
        await page.waitForTimeout(1000);

        // Bookmark it
        const postCard = page.locator('div', { hasText: postContent }).first();
        const bookmarkBtn = postCard.locator('button').last();
        await bookmarkBtn.click();
        await page.waitForTimeout(1000);

        // Verify it's in the Saved tab
        await page.goto(`${BASE_URL}/profile/${username}`);
        await page.waitForTimeout(1500);
        const savedTab = page.locator('button:has-text("Saved"), [role="tab"]:has-text("Saved")');
        await savedTab.click();
        await page.waitForTimeout(1000);
        await expect(page.locator(`text=${postContent}`)).toBeVisible();

        // Now unbookmark from Saved tab
        const savedPostCard = page.locator('div', { hasText: postContent }).first();
        const unbookmarkBtn = savedPostCard.locator('button').last();
        await unbookmarkBtn.click();
        await page.waitForTimeout(1000);

        // Reload saved tab
        await page.reload();
        await page.waitForTimeout(1500);
        const savedTabAgain = page.locator('button:has-text("Saved"), [role="tab"]:has-text("Saved")');
        await savedTabAgain.click();
        await page.waitForTimeout(1000);

        // Post should no longer be in Saved
        await expect(page.locator(`text=${postContent}`)).not.toBeVisible();

        console.log('✅ Unbookmark test passed — post removed from Saved tab');
    });
});
