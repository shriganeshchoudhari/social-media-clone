import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' };

test.describe('Advanced Moderation Features', () => {

    let targetUser;

    test.beforeEach(async ({ browser }) => {
        // Create a target user for moderation
        const context = await browser.newContext();
        const page = await context.newPage();

        targetUser = {
            username: `mod_target_${Date.now()}`,
            email: `mod_${Date.now()}@test.com`,
            password: 'Test123456!'
        };

        await page.goto(`${BASE_URL}/register`);

        // Debug: Listen to console logs
        page.on('console', msg => console.log(`BROWSER CONSOLE: ${msg.text()}`));
        page.on('pageerror', err => console.log(`BROWSER ERROR: ${err}`));

        // Wait for input first to ensure page loaded
        await page.getByPlaceholder('johndoe').waitFor({ timeout: 10000 });
        // Then check button
        await expect(page.getByRole('button', { name: /Register|Creating/i })).toBeVisible();

        await page.getByPlaceholder('johndoe').fill(targetUser.username);
        await page.getByPlaceholder('john@example.com').fill(targetUser.email);
        await page.getByPlaceholder('••••••••').fill(targetUser.password);

        await page.getByRole('button', { name: /Register|Creating/i }).click();
        await page.waitForURL(`${BASE_URL}/feed`);
        await context.close();
    });

    test('admin can warn a user', async ({ page }) => {
        // Login as admin
        await page.goto(`${BASE_URL}/login`);
        await page.getByPlaceholder('johndoe').fill(ADMIN_CREDENTIALS.username);
        await page.getByPlaceholder('••••••••').fill(ADMIN_CREDENTIALS.password);
        await page.getByRole('button', { name: /Login|Logging/i }).click();
        await page.waitForURL(`${BASE_URL}/feed`);

        // Go to admin dashboard
        await page.goto(`${BASE_URL}/admin`);

        // Find target user row
        const userRow = page.locator('div').filter({ hasText: targetUser.username }).last();
        await expect(userRow).toBeVisible();

        // Accept alert dialog
        page.on('dialog', async dialog => {
            console.log(`Dialog message: ${dialog.message()}`);
            expect(dialog.message()).toContain(`Warned ${targetUser.username}`);
            await dialog.accept();
        });

        // Click Warn button
        await userRow.locator('button:has-text("Warn")').click();
    });

    test('admin can suspend and unsuspend a user', async ({ page }) => {
        // Login as admin
        await page.goto(`${BASE_URL}/login`);
        await page.getByPlaceholder('johndoe').fill(ADMIN_CREDENTIALS.username);
        await page.getByPlaceholder('••••••••').fill(ADMIN_CREDENTIALS.password);
        await page.getByRole('button', { name: /Login|Logging/i }).click();
        await page.waitForURL(`${BASE_URL}/feed`);

        // Go to admin dashboard
        await page.goto(`${BASE_URL}/admin`);

        // Find target user row
        const userRow = page.locator('div').filter({ hasText: targetUser.username }).last();
        await expect(userRow).toBeVisible();

        // 1. Suspend User
        // ----------------------------------------
        page.on('dialog', async dialog => {
            console.log(`Dialog message: ${dialog.message()}`);
            await dialog.accept();
        });

        await userRow.locator('button:has-text("Suspend 7d")').click();
        // Wait a bit for action to complete
        await page.waitForTimeout(1000);

        // Verify user is actually suspended by trying to login
        const userContext = await page.context().browser().newContext();
        const userPage = await userContext.newPage();
        await userPage.goto(`${BASE_URL}/login`);
        await userPage.getByPlaceholder('johndoe').fill(targetUser.username);
        await userPage.getByPlaceholder('••••••••').fill(targetUser.password);
        await userPage.getByRole('button', { name: /Login|Logging/i }).click();

        // Should see error message or failing URL navigation
        // We expect the login to FAIL, so we should stay on login or see error
        const errorMsg = userPage.locator('text=/suspended/i');
        try {
            await expect(errorMsg).toBeVisible({ timeout: 5000 });
        } catch (e) {
            console.log("Strict suspension message check failed, checking URL");
            // Ensure we are NOT on feed
            await expect(userPage).not.toHaveURL(`${BASE_URL}/feed`);
        }

        await userContext.close();

        // 2. Unsuspend User
        // ----------------------------------------
        await userRow.locator('button:has-text("Unsuspend")').click();
        await page.waitForTimeout(1000);

        // Verify user can login again
        const userContext2 = await page.context().browser().newContext();
        const userPage2 = await userContext2.newPage();
        await userPage2.goto(`${BASE_URL}/login`);
        await userPage2.getByPlaceholder('johndoe').fill(targetUser.username);
        await userPage2.getByPlaceholder('••••••••').fill(targetUser.password);
        await userPage2.getByRole('button', { name: /Login|Logging/i }).click();

        await expect(userPage2).toHaveURL(`${BASE_URL}/feed`);
        await userContext2.close();
    });
});
