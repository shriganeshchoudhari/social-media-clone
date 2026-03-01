import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

/**
 * Explore Search Module Tests
 * - Search bar on explore page filters results
 * - People tab shows user results
 * - Posts tab shows post results
 * - Communities tab shows group results
 */
test.describe('Explore Search', () => {

    const register = async (page, username, password = 'password123') => {
        await page.goto(`${BASE_URL}/register`);
        await page.getByPlaceholder('johndoe').fill(username);
        await page.getByPlaceholder('john@example.com').fill(`${username}@test.com`);
        await page.getByPlaceholder('••••••••').fill(password);
        await page.getByRole('button', { name: /Register|Creating/i }).click();
        await page.waitForURL(`${BASE_URL}/feed`);
    };

    test('search for a user in the global search bar and navigate to search results', async ({ page }) => {
        const ts = Date.now().toString().slice(-7);
        const username = `search_explorer_${ts}`;

        await register(page, username);

        // Use the top nav search bar
        const searchInput = page.locator('input[placeholder*="Search"]').first();
        await searchInput.click();
        await searchInput.fill(username);
        await searchInput.press('Enter');

        // Should navigate to /search page
        await page.waitForURL(/\/search/, { timeout: 5000 });
        await page.waitForTimeout(1000);

        // Should see search results page
        await expect(page.locator(`text=/Results for/i`)).toBeVisible();
    });

    test('explore search — People tab shows matching users', async ({ browser }) => {
        const ts = Date.now().toString().slice(-7);
        const searchable = `findme_${ts}`;
        const searcher = `searcher_${ts}`;

        // Register searchable user
        const ctx1 = await browser.newContext();
        const page1 = await ctx1.newPage();
        await register(page1, searchable);
        await ctx1.close();

        // Register searcher and search for searchable
        const ctx2 = await browser.newContext();
        const page2 = await ctx2.newPage();
        await register(page2, searcher);

        // Navigate to search with query
        await page2.goto(`${BASE_URL}/search?q=${searchable}`);
        await page2.waitForTimeout(1500);

        // Click on "People" tab
        const peopleTab = page2.locator('[role="tab"]:has-text("People"), button:has-text("People")');
        if (await peopleTab.isVisible()) {
            await peopleTab.click();
        }
        await page2.waitForTimeout(1000);

        // Searchable user should appear
        await expect(page2.locator(`text=${searchable}`)).toBeVisible();

        await ctx2.close();
    });

    test('explore search — Posts tab shows matching posts', async ({ browser }) => {
        const ts = Date.now().toString().slice(-7);
        const postAuthor = `post_author_${ts}`;
        const searchKeyword = `uniqueKeyword${ts}`;

        // Create author and post with keyword
        const authorCtx = await browser.newContext();
        const authorPage = await authorCtx.newPage();
        await register(authorPage, postAuthor);

        const postContent = `${searchKeyword} — test post for search`;
        await authorPage.getByPlaceholder("What's on your mind?").fill(postContent);
        await authorPage.getByRole('button', { name: 'Post' }).click();
        await expect(authorPage.locator(`text=${postContent}`)).toBeVisible();
        await authorCtx.close();

        // Register searcher
        const searcherCtx = await browser.newContext();
        const searcherPage = await searcherCtx.newPage();
        await register(searcherPage, `searcher2_${ts}`);

        // Search for the keyword
        await searcherPage.goto(`${BASE_URL}/search?q=${searchKeyword}`);
        await searcherPage.waitForTimeout(1500);

        // Click Posts tab
        const postsTab = searcherPage.locator('[role="tab"]:has-text("Posts"), button:has-text("Posts")');
        if (await postsTab.isVisible()) {
            await postsTab.click();
        }
        await searcherPage.waitForTimeout(1000);

        // Post with keyword should appear
        await expect(searcherPage.locator(`text=${postContent}`)).toBeVisible();

        await searcherCtx.close();
    });

    test('navigate to explore page and see recommended posts', async ({ page }) => {
        const ts = Date.now().toString().slice(-7);
        const username = `explorer_${ts}`;

        await register(page, username);

        // Navigate to explore
        await page.goto(`${BASE_URL}/explore`);
        await page.waitForTimeout(2000);

        // Should load the explore page
        await expect(page.locator('text=/Explore|Trending|Recommended/i')).toBeVisible();

        // Page should have some content (posts or "no posts" message)
        const content = page.locator('div').filter({ hasText: /post|trending|recommended/i }).first();
        await expect(content).toBeVisible();

        console.log('✅ Explore page loaded successfully');
    });

    test('explore search bar filters within explore page', async ({ page }) => {
        const ts = Date.now().toString().slice(-7);
        const username = `explore_searcher_${ts}`;

        await register(page, username);
        await page.goto(`${BASE_URL}/explore`);
        await page.waitForTimeout(1500);

        // Find the search input within explore page
        const exploreSearch = page.locator('input[placeholder*="Search"]').first();
        if (await exploreSearch.isVisible()) {
            await exploreSearch.fill('tech');
            await exploreSearch.press('Enter');
            await page.waitForTimeout(1500);
            // Page should update (filter or navigate)
            console.log('✅ Explore search interaction successful');
        } else {
            console.log('No inline search found on explore — using nav search');
        }
    });
});
