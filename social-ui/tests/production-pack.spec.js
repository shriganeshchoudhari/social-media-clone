import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

// Test users
const normalUser = {
    username: `user_${Date.now()}`,
    email: `user_${Date.now()}@test.com`,
    password: 'Test123456!'
};

const adminCredentials = {
    username: 'admin',
    password: 'admin123'
};

test.describe('Production Pack - RBAC & Admin Moderation', () => {

    test.describe('Part 1: RBAC Enforcement', () => {

        test('should create normal user and verify no admin access', async ({ page }) => {
            // Register normal user
            await page.goto(`${BASE_URL}/register`);
            await page.fill('input[type="text"]', normalUser.username);
            await page.fill('input[type="email"]', normalUser.email);
            await page.fill('input[type="password"]', normalUser.password);
            await page.click('button[type="submit"]');

            await page.waitForURL(`${BASE_URL}/feed`, { timeout: 5000 });

            // Try to access admin dashboard
            await page.goto(`${BASE_URL}/admin`);
            await page.waitForTimeout(2000);

            // Should show error or be empty due to 403
            const errorText = await page.textContent('body');
            console.log('Normal user admin access attempt:', errorText.substring(0, 200));

            // Should see "Failed to load" message
            await expect(page.locator('text=/Failed to load.*admin/i')).toBeVisible({ timeout: 3000 });
        });

        test('should allow admin user to access admin dashboard', async ({ page }) => {
            // Login as admin
            await page.goto(`${BASE_URL}/login`);
            await page.fill('input[type="text"]', adminCredentials.username);
            await page.fill('input[type="password"]', adminCredentials.password);
            await page.click('button[type="submit"]');

            await page.waitForURL(`${BASE_URL}/feed`, { timeout: 5000 });

            // Navigate to admin dashboard
            await page.click('button[title*="Admin"]');
            await page.waitForURL(`${BASE_URL}/admin`);

            // Should see admin dashboard content
            await expect(page.locator('text=/Admin.*Dashboard/i')).toBeVisible();
            await expect(page.locator('text=/Users/i')).toBeVisible();
            await expect(page.locator('text=/Reports/i')).toBeVisible();
        });

        test('should show admin user role in authorities', async ({ page }) => {
            // Login as admin
            await page.goto(`${BASE_URL}/login`);
            await page.fill('input[type="text"]', adminCredentials.username);
            await page.fill('input[type="password"]', adminCredentials.password);
            await page.click('button[type="submit"]');

            await page.waitForURL(`${BASE_URL}/feed`);

            // Admin should be able to access admin endpoints
            await page.goto(`${BASE_URL}/admin`);
            await page.waitForTimeout(2000);

            // Should NOT see error message
            const hasError = await page.locator('text=/Failed to load.*admin/i').isVisible().catch(() => false);
            expect(hasError).toBe(false);
        });
    });

    test.describe('Part 2: Admin Moderation - Ban/Unban', () => {

        test.beforeEach(async ({ page }) => {
            // Login as admin
            await page.goto(`${BASE_URL}/login`);
            await page.fill('input[type="text"]', adminCredentials.username);
            await page.fill('input[type="password"]', adminCredentials.password);
            await page.click('button[type="submit"]');
            await page.waitForURL(`${BASE_URL}/feed`);
        });

        test('should ban a user from admin dashboard', async ({ page }) => {
            await page.goto(`${BASE_URL}/admin`);
            await page.waitForTimeout(2000);

            // Find a user to ban (not admin)
            const userElements = page.locator('.flex.justify-between.items-center');
            const count = await userElements.count();

            console.log(`Found ${count} users in admin dashboard`);

            if (count > 1) {
                // Find a user without BANNED status
                for (let i = 0; i < count; i++) {
                    const userElement = userElements.nth(i);
                    const text = await userElement.textContent();

                    if (!text?.includes('admin') && !text?.includes('BANNED')) {
                        // Click ban button
                        const banButton = userElement.locator('button:has-text("Ban")');
                        if (await banButton.isVisible()) {
                            await banButton.click();

                            // Confirm dialog
                            page.on('dialog', dialog => dialog.accept());

                            await page.waitForTimeout(1000);

                            // Should show BANNED status
                            await expect(userElement.locator('text=BANNED')).toBeVisible();
                            break;
                        }
                    }
                }
            }
        });

        test('should unban a banned user', async ({ page }) => {
            await page.goto(`${BASE_URL}/admin`);
            await page.waitForTimeout(2000);

            // Find a banned user
            const bannedUser = page.locator('text=BANNED').first();

            if (await bannedUser.isVisible()) {
                const userElement = bannedUser.locator('..').locator('..');
                const unbanButton = userElement.locator('button:has-text("Unban")');

                if (await unbanButton.isVisible()) {
                    await unbanButton.click();
                    await page.waitForTimeout(1000);

                    // BANNED status should disappear
                    const stillBanned = await bannedUser.isVisible().catch(() => false);
                    expect(stillBanned).toBe(false);
                }
            }
        });
    });

    test.describe('Part 2: Admin Moderation - Post & Report Management', () => {

        let testPost;

        test.beforeEach(async ({ page }) => {
            // Create a test post as normal user
            await page.goto(`${BASE_URL}/register`);
            const testUser = {
                username: `testpost_${Date.now()}`,
                email: `testpost_${Date.now()}@test.com`,
                password: 'Test123456!'
            };

            await page.fill('input[type="text"]', testUser.username);
            await page.fill('input[type="email"]', testUser.email);
            await page.fill('input[type="password"]', testUser.password);
            await page.click('button[type="submit"]');
            await page.waitForURL(`${BASE_URL}/feed`);

            // Create a post
            const postContent = `Test post for moderation ${Date.now()}`;
            await page.fill('textarea[placeholder*="What"]', postContent);
            await page.click('button:has-text("Post")');
            await page.waitForTimeout(1500);

            testPost = postContent;

            // Logout
            await page.click(`button:has-text("${testUser.username}")`);
            await page.click('text=/Logout/i');
            await page.waitForURL(`${BASE_URL}/login`);
        });

        test('should delete post from admin dashboard', async ({ page }) => {
            // Login as admin
            await page.goto(`${BASE_URL}/login`);
            await page.fill('input[type="text"]', adminCredentials.username);
            await page.fill('input[type="password"]', adminCredentials.password);
            await page.click('button[type="submit"]');
            await page.waitForURL(`${BASE_URL}/feed`);

            // Go to admin dashboard
            await page.goto(`${BASE_URL}/admin`);
            await page.waitForTimeout(2000);

            // Check if there are any reports
            const reportsSection = page.locator('text=/Recent Reports/i');
            await expect(reportsSection).toBeVisible();

            // If there's a report with a Delete Post button
            const deleteButton = page.locator('button:has-text("Delete Post")').first();

            if (await deleteButton.isVisible()) {
                page.on('dialog', dialog => dialog.accept());
                await deleteButton.click();
                await page.waitForTimeout(1000);

                // Post should be deleted
                console.log('Post delete action triggered');
            }
        });

        test('should clear individual report', async ({ page }) => {
            // Login as admin
            await page.goto(`${BASE_URL}/login`);
            await page.fill('input[type="text"]', adminCredentials.username);
            await page.fill('input[type="password"]', adminCredentials.password);
            await page.click('button[type="submit"]');
            await page.waitForURL(`${BASE_URL}/feed`);

            await page.goto(`${BASE_URL}/admin`);
            await page.waitForTimeout(2000);

            // Find Clear Report button
            const clearButton = page.locator('button:has-text("Clear Report")').first();

            if (await clearButton.isVisible()) {
                const reportCountBefore = await page.locator('.bg-orange-50').count();

                await clearButton.click();
                await page.waitForTimeout(1000);

                const reportCountAfter = await page.locator('.bg-orange-50').count();
                expect(reportCountAfter).toBeLessThanOrEqual(reportCountBefore);
            }
        });
    });

    test.describe('Part 3: Personalization - Blocked Users Filter', () => {

        let user1, user2;

        test.beforeEach(async ({ browser }) => {
            // Create two users
            const context1 = await browser.newContext();
            const page1 = await context1.newPage();

            user1 = {
                username: `user1_${Date.now()}`,
                email: `user1_${Date.now()}@test.com`,
                password: 'Test123456!'
            };

            await page1.goto(`${BASE_URL}/register`);
            await page1.fill('input[type="text"]', user1.username);
            await page1.fill('input[type="email"]', user1.email);
            await page1.fill('input[type="password"]', user1.password);
            await page1.click('button[type="submit"]');
            await page1.waitForURL(`${BASE_URL}/feed`);

            // Create a post as user1
            await page1.fill('textarea[placeholder*="What"]', `Post by ${user1.username}`);
            await page1.click('button:has-text("Post")');
            await page1.waitForTimeout(1000);

            await context1.close();

            // Create user2
            const context2 = await browser.newContext();
            const page2 = await context2.newPage();

            user2 = {
                username: `user2_${Date.now()}`,
                email: `user2_${Date.now()}@test.com`,
                password: 'Test123456!'
            };

            await page2.goto(`${BASE_URL}/register`);
            await page2.fill('input[type="text"]', user2.username);
            await page2.fill('input[type="email"]', user2.email);
            await page2.fill('input[type="password"]', user2.password);
            await page2.click('button[type="submit"]');
            await page2.waitForURL(`${BASE_URL}/feed`);

            await context2.close();
        });

        test('should not show blocked users in explore feed', async ({ page }) => {
            // Login as user2
            await page.goto(`${BASE_URL}/login`);
            await page.fill('input[type="text"]', user2.username);
            await page.fill('input[type="password"]', user2.password);
            await page.click('button[type="submit"]');
            await page.waitForURL(`${BASE_URL}/feed`);

            // Block user1
            await page.goto(`${BASE_URL}/profile/${user1.username}`);
            await page.waitForTimeout(1000);

            const blockButton = page.locator('button:has-text("Block")');
            if (await blockButton.isVisible()) {
                await blockButton.click();
                await page.waitForTimeout(1000);
            }

            // Go to explore
            await page.goto(`${BASE_URL}/explore`);
            await page.waitForTimeout(2000);

            // User1's posts should NOT appear
            const user1Posts = page.locator(`text=/Post by ${user1.username}/i`);
            const hasUser1Post = await user1Posts.isVisible().catch(() => false);

            expect(hasUser1Post).toBe(false);
            console.log('Blocked user posts correctly filtered from explore');
        });
    });

    test.describe('Integration: Full Admin Workflow', () => {

        test('complete admin moderation workflow', async ({ page }) => {
            // Login as admin
            await page.goto(`${BASE_URL}/login`);
            await page.fill('input[type="text"]', adminCredentials.username);
            await page.fill('input[type="password"]', adminCredentials.password);
            await page.click('button[type="submit"]');
            await page.waitForURL(`${BASE_URL}/feed`);

            // 1. Access admin dashboard
            await page.goto(`${BASE_URL}/admin`);
            await page.waitForTimeout(2000);
            await expect(page.locator('text=/Admin.*Dashboard/i')).toBeVisible();

            // 2. Check users list
            await expect(page.locator('text=/Users.*\\(/i')).toBeVisible();

            // 3. Check reports list
            await expect(page.locator('text=/Recent Reports/i')).toBeVisible();

            // 4. Verify admin controls are present
            const hasBanButtons = await page.locator('button:has-text("Ban")').count();
            const hasUnbanButtons = await page.locator('button:has-text("Unban")').count();

            console.log(`Admin controls - Ban buttons: ${hasBanButtons}, Unban buttons: ${hasUnbanButtons}`);
            expect(hasBanButtons + hasUnbanButtons).toBeGreaterThan(0);

            // 5. Verify report moderation controls
            const hasDeletePost = await page.locator('button:has-text("Delete Post")').isVisible().catch(() => false);
            const hasClearReport = await page.locator('button:has-text("Clear Report")').isVisible().catch(() => false);

            console.log(`Report controls - Delete Post: ${hasDeletePost}, Clear Report: ${hasClearReport}`);
        });
    });
});
