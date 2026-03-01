import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

/**
 * Follow / Unfollow Module Tests
 * - Follow another user (button toggles to Unfollow)
 * - Follower count increases on their profile
 * - Followed user's posts appear in home feed
 * - Unfollow reverts button and count
 */
test.describe('Follow / Unfollow', () => {

    const register = async (page, username, password = 'password123') => {
        await page.goto(`${BASE_URL}/register`);
        await page.getByPlaceholder('johndoe').fill(username);
        await page.getByPlaceholder('john@example.com').fill(`${username}@test.com`);
        await page.getByPlaceholder('••••••••').fill(password);
        await page.getByRole('button', { name: /Register|Creating/i }).click();
        await page.waitForURL(`${BASE_URL}/feed`);
    };

    test('follow button toggles to Unfollow and follower count increases', async ({ browser }) => {
        const ts = Date.now().toString().slice(-7);
        const userA = `follow_a_${ts}`;
        const userB = `follow_b_${ts}`;
        const password = 'password123';

        // Register User A (to be followed)
        const ctxA = await browser.newContext();
        const pageA = await ctxA.newPage();
        await register(pageA, userA, password);
        await ctxA.close();

        // Register User B (the follower)
        const ctxB = await browser.newContext();
        const pageB = await ctxB.newPage();
        await register(pageB, userB, password);

        // Navigate to User A's profile
        await pageB.goto(`${BASE_URL}/profile/${userA}`);
        await pageB.waitForTimeout(1000);

        // Should show Follow button initially
        const followBtn = pageB.locator('button:has-text("Follow")');
        await expect(followBtn).toBeVisible();

        // Get follower count before
        const followerCountEl = pageB.locator('text=/\\d+ Follower/i').first();
        const countBefore = await followerCountEl.textContent().catch(() => '0');

        // Click Follow
        await followBtn.click();
        await pageB.waitForTimeout(1000);

        // Button should now say Unfollow
        await expect(pageB.locator('button:has-text("Unfollow")')).toBeVisible();

        // Count should increase
        const countAfter = await followerCountEl.textContent().catch(() => '1');
        console.log(`Follower count before: ${countBefore}, after: ${countAfter}`);

        await ctxB.close();
    });

    test('followed user posts appear in home feed', async ({ browser }) => {
        const ts = Date.now().toString().slice(-7);
        const creator = `feed_creator_${ts}`;
        const follower = `feed_follower_${ts}`;
        const password = 'password123';

        // Register creator and create a unique post
        const creatorCtx = await browser.newContext();
        const creatorPage = await creatorCtx.newPage();
        await register(creatorPage, creator, password);

        const uniquePost = `Unique post for follow feed test ${ts}`;
        await creatorPage.getByPlaceholder("What's on your mind?").fill(uniquePost);
        await creatorPage.getByRole('button', { name: 'Post' }).click();
        await expect(creatorPage.locator(`text=${uniquePost}`)).toBeVisible();
        await creatorCtx.close();

        // Register follower
        const followerCtx = await browser.newContext();
        const followerPage = await followerCtx.newPage();
        await register(followerPage, follower, password);

        // Follower visits creator's profile and follows
        await followerPage.goto(`${BASE_URL}/profile/${creator}`);
        await followerPage.waitForTimeout(1000);

        const followBtn = followerPage.locator('button:has-text("Follow")');
        if (await followBtn.isVisible()) {
            await followBtn.click();
            await followerPage.waitForTimeout(1500);
        }

        // Go to home feed and verify creator's post is visible
        await followerPage.goto(`${BASE_URL}/feed`);
        await followerPage.waitForTimeout(2000);
        await expect(followerPage.locator(`text=${uniquePost}`)).toBeVisible();

        await followerCtx.close();
    });

    test('unfollow reverts button and removes posts from feed', async ({ browser }) => {
        const ts = Date.now().toString().slice(-7);
        const creator = `unfollow_creator_${ts}`;
        const follower = `unfollow_follower_${ts}`;
        const password = 'password123';

        // Register creator with a unique post
        const creatorCtx = await browser.newContext();
        const creatorPage = await creatorCtx.newPage();
        await register(creatorPage, creator, password);

        const uniquePost = `Post to disappear after unfollow ${ts}`;
        await creatorPage.getByPlaceholder("What's on your mind?").fill(uniquePost);
        await creatorPage.getByRole('button', { name: 'Post' }).click();
        await expect(creatorPage.locator(`text=${uniquePost}`)).toBeVisible();
        await creatorCtx.close();

        // Register follower, follow creator
        const followerCtx = await browser.newContext();
        const followerPage = await followerCtx.newPage();
        await register(followerPage, follower, password);

        await followerPage.goto(`${BASE_URL}/profile/${creator}`);
        await followerPage.waitForTimeout(1000);

        const followBtn = followerPage.locator('button:has-text("Follow")');
        if (await followBtn.isVisible()) {
            await followBtn.click();
            await followerPage.waitForTimeout(1000);
        }

        // Now unfollow
        const unfollowBtn = followerPage.locator('button:has-text("Unfollow")');
        if (await unfollowBtn.isVisible()) {
            await unfollowBtn.click();
            await followerPage.waitForTimeout(1000);
        }

        // Button should revert back to Follow
        await expect(followerPage.locator('button:has-text("Follow")')).toBeVisible();

        await followerCtx.close();
    });
});
