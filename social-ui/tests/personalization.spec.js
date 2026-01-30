import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Personalization Features', () => {

    test('user can add interest and see personalized content', async ({ browser }) => {
        // 1. Create a user (Author) and post about "tech"
        // ------------------------------------------------
        const authorContext = await browser.newContext();
        const authorPage = await authorContext.newPage();
        const authorUser = {
            username: `tech_guru_${Date.now()}`,
            email: `tech_${Date.now()}@test.com`,
            password: 'Test123456!'
        };

        await authorPage.goto(`${BASE_URL}/register`);
        // Wait for input first to ensure page loaded
        await authorPage.getByPlaceholder('johndoe').waitFor();
        await expect(authorPage.getByRole('button', { name: /Register|Creating/i })).toBeVisible();
        await authorPage.getByPlaceholder('johndoe').fill(authorUser.username);
        await authorPage.getByPlaceholder('john@example.com').fill(authorUser.email);
        await authorPage.getByPlaceholder('••••••••').fill(authorUser.password);
        await authorPage.getByRole('button', { name: /Register|Creating/i }).click();
        await authorPage.waitForURL(`${BASE_URL}/feed`);

        // Create a tech post
        const techContent = `This is a post about #tech and #coding ${Date.now()}`;
        await authorPage.getByPlaceholder("What's on your mind?").fill(techContent);
        await authorPage.getByRole('button', { name: 'Post' }).click();
        // Wait for post to appear
        await expect(authorPage.locator('div').filter({ hasText: techContent }).first()).toBeVisible();

        await authorContext.close();


        // 2. Create another user (Reader) and add "tech" interest
        // ------------------------------------------------------
        const readerContext = await browser.newContext();
        const readerPage = await readerContext.newPage();
        const readerUser = {
            username: `reader_${Date.now()}`,
            email: `reader_${Date.now()}@test.com`,
            password: 'Test123456!'
        };

        await readerPage.goto(`${BASE_URL}/register`);
        // Wait for input first
        await readerPage.getByPlaceholder('johndoe').waitFor();
        await expect(readerPage.getByRole('button', { name: /Register|Creating/i })).toBeVisible();
        await readerPage.getByPlaceholder('johndoe').fill(readerUser.username);
        await readerPage.getByPlaceholder('john@example.com').fill(readerUser.email);
        await readerPage.getByPlaceholder('••••••••').fill(readerUser.password);
        await readerPage.getByRole('button', { name: /Register|Creating/i }).click();
        await readerPage.waitForURL(`${BASE_URL}/feed`);

        // Go to Settings
        await readerPage.goto(`${BASE_URL}/settings`);

        // Add Interest
        const interestInput = readerPage.getByPlaceholder('tech');
        await expect(interestInput).toBeVisible();
        await interestInput.fill('tech');
        await readerPage.getByRole('button', { name: 'Add Interest' }).click();

        // Verify success message
        await expect(readerPage.locator('text=Interest saved')).toBeVisible();

        // 3. Go to Explore and verify I see the tech post
        // ------------------------------------------------
        await readerPage.goto(`${BASE_URL}/explore`);

        // Should see the tech post
        await expect(readerPage.locator('div').filter({ hasText: techContent }).first()).toBeVisible();

        await readerContext.close();
    });
});
