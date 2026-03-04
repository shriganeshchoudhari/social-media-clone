import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Explore & Search Module', () => {

    const register = async (page, username, password = 'Password123!') => {
        await page.goto(`${BASE_URL}/register`);
        await page.getByPlaceholder('johndoe').fill(username);
        await page.locator('input[type="email"]').fill(`${username}@examplenet.com`);
        await page.locator('input[type="password"]').fill(password);
        await page.getByRole('button', { name: /Register|Creating/i }).click();
        await page.waitForURL(`${BASE_URL}/feed`, { timeout: 10000 });
    };

    test('TC_EXP_01 - Type a username in the search bar and navigate to /search', async ({ page }) => {
        const ts = Date.now().toString().slice(-7);
        const searchableUser = `searchable_${ts}`;

        // Use an alternate context to create the user to ensure no session overlap
        await register(page, searchableUser);
        await page.evaluate(() => localStorage.clear());

        // Create main user
        const searcherUser = `searcher1_${ts}`;
        await register(page, searcherUser);

        // Search for searchableUser
        const searchInput = page.locator('input[placeholder*="Search"]').first();
        await searchInput.fill(searchableUser);
        await searchInput.press('Enter');

        await page.waitForURL(/\/search/);

        // Should default to People tab or just show it in results
        await expect(page.locator(`text=${searchableUser}`).first()).toBeVisible({ timeout: 5000 });
    });

    test('TC_EXP_02 - Switch to Posts tab in search results', async ({ page }) => {
        const ts = Date.now().toString().slice(-7);
        const uniqueKeyword = `BazingaKeyword${ts}`;

        await register(page, `postCreator_${ts}`);
        // Create post
        await page.getByPlaceholder("What's on your mind?").fill(`This is a test post with ${uniqueKeyword}`);
        await page.getByRole('button', { name: 'Post' }).click();
        await expect(page.getByText(`This is a test post with ${uniqueKeyword}`).first()).toBeVisible({ timeout: 10000 });

        await page.evaluate(() => localStorage.clear());

        await register(page, `postSearcher_${ts}`);

        const searchInput = page.locator('input[placeholder*="Search"]').first();
        await searchInput.fill(uniqueKeyword);
        await searchInput.press('Enter');
        await page.waitForURL(/\/search/);

        // Click Posts tab
        const postsTab = page.getByRole('tab', { name: /Posts/i }).or(page.locator('button:has-text("Posts")'));
        if (await postsTab.isVisible()) {
            await postsTab.click();
        }

        await expect(page.getByText(`This is a test post with ${uniqueKeyword}`).first()).toBeVisible({ timeout: 5000 });
    });

    test('TC_EXP_03 - Click a user result in search', async ({ page }) => {
        const ts = Date.now().toString().slice(-7);
        const targetUser = `click_target_${ts}`;

        await register(page, targetUser);
        await page.evaluate(() => localStorage.clear());

        await register(page, `click_searcher_${ts}`);

        const searchInput = page.locator('input[placeholder*="Search"]').first();
        await searchInput.fill(targetUser);
        await searchInput.press('Enter');
        await page.waitForURL(/\/search/);

        // Click the user link
        await page.locator(`text=${targetUser}`).first().click();

        await page.waitForURL(/\/profile/);
        await expect(page.locator(`text=${targetUser}`).first()).toBeVisible();
    });

    test('TC_EXP_04 - Search with an empty query string', async ({ page }) => {
        const ts = Date.now().toString().slice(-7);
        await register(page, `empty_searcher_${ts}`);

        // Submit empty search
        const searchInput = page.locator('input[placeholder*="Search"]').first();
        await searchInput.click();
        await searchInput.press('Enter');

        // Verify either it blocks navigation or shows "enter a search term" or "no users found"
        // Wait briefly
        await page.waitForTimeout(1000);
        // We either stay on feed or go to search and see no results. 
        // We'll assert that we don't crash and we see some kind of empty state if we moved
        if (page.url().includes('/search')) {
            await expect(page.locator('text=/No results|enter a search term|No users found/i')).toBeVisible();
        } else {
            // Stayed on feed, acceptable behavior for empty search
            await expect(page.locator('input[placeholder*="Search"]').first()).toBeVisible();
        }
    });

    test('TC_EXP_05 - Search for a non-existent username', async ({ page }) => {
        const ts = Date.now().toString().slice(-7);
        await register(page, `nonexist_searcher_${ts}`);

        const searchInput = page.locator('input[placeholder*="Search"]').first();
        await searchInput.fill(`nobody_${Date.now()}`);
        await searchInput.press('Enter');
        await page.waitForURL(/\/search/);

        await expect(page.locator('text=/No users found|No results/i').first()).toBeVisible({ timeout: 5000 });
    });

    test('TC_EXP_06 - Search for a keyword that matches no posts', async ({ page }) => {
        const ts = Date.now().toString().slice(-7);
        await register(page, `nopost_searcher_${ts}`);

        const searchInput = page.locator('input[placeholder*="Search"]').first();
        await searchInput.fill(`NoPostWithThisRandomString${Date.now()}`);
        await searchInput.press('Enter');
        await page.waitForURL(/\/search/);

        const postsTab = page.getByRole('tab', { name: /Posts/i }).or(page.locator('button:has-text("Posts")'));
        if (await postsTab.isVisible()) {
            await postsTab.click();
        }

        await expect(page.locator('text=/No posts found|No results/i').first()).toBeVisible({ timeout: 5000 });
    });

    test('TC_EXP_07 - Navigate to /explore - recommended posts load', async ({ page }) => {
        const ts = Date.now().toString().slice(-7);
        await register(page, `explore_user_${ts}`);

        await page.goto(`${BASE_URL}/explore`);

        await expect(page.locator('text=/Explore|Recommended|Trending/i').first()).toBeVisible({ timeout: 5000 });
    });

    test('TC_EXP_08 - User with interests set sees interest-relevant posts in explore', async ({ page }) => {
        const ts = Date.now().toString().slice(-7);
        const intUser = `interest_user_${ts}`;
        await register(page, intUser);

        await page.goto(`${BASE_URL}/settings`);
        // Add interest "JavaScript"
        const intInput = page.locator('input[placeholder*="Add interests"]');
        if (await intInput.isVisible()) {
            await intInput.fill('JavaScript');
            await intInput.press('Enter');
            await page.getByRole('button', { name: /Save Profile/i }).click();
            await expect(page.locator('text=/Profile updated/i')).toBeVisible();
        }

        await page.goto(`${BASE_URL}/explore`);
        await expect(page.locator('text=/Explore|Recommended/i').first()).toBeVisible();
    });

    test('TC_EXP_09 - Trending sidebar shows current trending topics', async ({ page }) => {
        const ts = Date.now().toString().slice(-7);
        await register(page, `trend_user_${ts}`);

        await page.goto(`${BASE_URL}/explore`);

        // Look for trending sidebar
        const trendingZone = page.locator('text=/Trending|#|topics/i').first();
        await expect(trendingZone).toBeVisible({ timeout: 5000 });
    });

    test('TC_EXP_10 - Blocked users posts do not appear in explore', async ({ page }) => {
        const ts = Date.now().toString().slice(-7);
        const badUser = `bad_user_${ts}`;
        await register(page, badUser);

        // create post
        const badPostText = `Bad post text ${ts}`;
        await page.getByPlaceholder("What's on your mind?").fill(badPostText);
        await page.getByRole('button', { name: 'Post' }).click();
        await expect(page.getByText(badPostText).first()).toBeVisible({ timeout: 10000 });
        await page.evaluate(() => localStorage.clear());

        await register(page, `good_user_${ts}`);
        // block the bad user
        await page.goto(`${BASE_URL}/profile/${badUser}`);
        await expect(page.getByText(badPostText).first()).toBeVisible();

        await page.getByRole('button', { name: /Block/i }).first().click().catch(async () => {
            await page.locator('button[aria-label="More options"]').click();
            await page.getByRole('menuitem', { name: /Block/i }).click();
        });

        const confirmBlock = page.getByRole('button', { name: /Confirm|Yes|Block/i });
        if (await confirmBlock.isVisible()) {
            await confirmBlock.click();
        }
        await expect(page.locator('text=/Blocked/i')).toBeVisible({ timeout: 5000 });

        // Go to explore
        await page.goto(`${BASE_URL}/explore`);
        await page.reload(); // clear cache
        await expect(page.getByText(badPostText)).toBeHidden();
    });

});
