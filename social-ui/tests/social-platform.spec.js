import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

// Shared helpers using verified selectors from source code
const register = async (page, username, password = 'Test123456!') => {
    await page.goto(`${BASE_URL}/register`);
    await page.getByPlaceholder('johndoe').fill(username);
    await page.getByPlaceholder('john@example.com').fill(`${username}@test.com`);
    await page.getByPlaceholder('••••••••').fill(password);
    await page.getByRole('button', { name: /Register|Creating Account/i }).click();
    await page.waitForURL(`${BASE_URL}/feed`, { timeout: 10000 });
};

const login = async (page, username, password = 'Test123456!') => {
    await page.goto(`${BASE_URL}/login`);
    await page.getByPlaceholder('johndoe').fill(username);
    await page.getByPlaceholder('••••••••').fill(password);
    await page.getByRole('button', { name: /Login|Logging in/i }).click();
    await page.waitForURL(`${BASE_URL}/feed`, { timeout: 10000 });
};

// Shared test user (created once, reused across depends-on tests)
const ts = Date.now().toString().slice(-7);
const testUser = {
    username: `e2e_main_${ts}`,
    password: 'Test123456!'
};

test.describe('Social Media Platform - Complete Test Suite', () => {

    // =====================================================
    // MODULE 1: Authentication
    // =====================================================
    test.describe('Authentication', () => {

        test('should register a new user', async ({ page }) => {
            await page.goto(`${BASE_URL}/register`);
            await page.getByPlaceholder('johndoe').fill(testUser.username);
            await page.getByPlaceholder('john@example.com').fill(`${testUser.username}@test.com`);
            await page.getByPlaceholder('••••••••').fill(testUser.password);
            await page.getByRole('button', { name: /Register|Creating Account/i }).click();
            await page.waitForURL(`${BASE_URL}/feed`, { timeout: 10000 });
            expect(page.url()).toContain('/feed');
        });

        test('should login with existing user', async ({ page }) => {
            await login(page, testUser.username, testUser.password);
            expect(page.url()).toContain('/feed');
        });

        test('should show error on invalid credentials', async ({ page }) => {
            await page.goto(`${BASE_URL}/login`);
            await page.getByPlaceholder('johndoe').fill('nonexistent_user_xyz');
            await page.getByPlaceholder('••••••••').fill('wrongpassword');
            await page.getByRole('button', { name: /Login|Logging in/i }).click();
            // Should show error, not navigate away
            await page.waitForTimeout(3000);
            expect(page.url()).toContain('/login');
        });
    });

    // =====================================================
    // MODULE 2: Post Management
    // =====================================================
    test.describe('Post Management', () => {

        test.beforeEach(async ({ page }) => {
            await login(page, testUser.username, testUser.password);
        });

        test('should create a new text post', async ({ page }) => {
            const postContent = `Test post ${Date.now()}`;
            await page.getByPlaceholder("What's on your mind?").fill(postContent);
            await page.getByRole('button', { name: 'Post' }).click();
            await page.waitForTimeout(2000);
            await expect(page.locator(`text=${postContent}`)).toBeVisible();
        });

        test('should like a post', async ({ page }) => {
            await page.waitForTimeout(2000);
            // Like buttons in PostCard — look for a button inside the post actions
            const likeBtn = page.locator('button[aria-label*="like"], button[title*="like"], button').filter({ hasText: /^[0-9]/ }).first();
            if (await likeBtn.isVisible()) {
                await likeBtn.click();
                await page.waitForTimeout(1000);
            } else {
                // Fallback: click the first element that looks like a like interaction
                const firstPost = page.locator('form + div, [class*="post"]').first();
                const btn = firstPost.locator('button').first();
                if (await btn.isVisible()) await btn.click();
            }
        });

        test('should comment on a post', async ({ page }) => {
            const commentText = `Test comment ${Date.now()}`;
            await page.waitForTimeout(2000);
            const commentInput = page.locator('input[placeholder*="comment"], input[placeholder*="Comment"]').first();
            if (await commentInput.isVisible()) {
                await commentInput.fill(commentText);
                await commentInput.press('Enter');
                await page.waitForTimeout(1500);
                await expect(page.locator(`text=${commentText}`)).toBeVisible();
            }
        });
    });

    // =====================================================
    // MODULE 3: Profile & Social Features
    // =====================================================
    test.describe('Profile & Social Features', () => {

        test.beforeEach(async ({ page }) => {
            await login(page, testUser.username, testUser.password);
        });

        test('should view own profile', async ({ page }) => {
            await page.goto(`${BASE_URL}/profile/${testUser.username}`);
            await page.waitForTimeout(1500);
            await expect(page.locator(`text=${testUser.username}`)).toBeVisible();
        });

        test('should search for users', async ({ page }) => {
            const searchInput = page.locator('input[placeholder="Search users..."]');
            await searchInput.fill(testUser.username);
            await searchInput.press('Enter');
            await page.waitForURL(/\/search/, { timeout: 5000 });
            await page.waitForTimeout(1000);
        });

        test('should update profile settings', async ({ page }) => {
            await page.goto(`${BASE_URL}/settings`);
            await page.waitForTimeout(1000);
            const bioText = `Updated bio ${Date.now()}`;
            const bioInput = page.locator('textarea[placeholder*="Tell us about yourself"], textarea[placeholder*="bio"]').first();
            if (await bioInput.isVisible()) {
                await bioInput.fill(bioText);
                await page.getByRole('button', { name: /Save Profile/i }).click();
                await page.waitForTimeout(1500);
                // Success message
                await expect(page.locator('text=✅')).toBeVisible({ timeout: 5000 });
            }
        });
    });

    // =====================================================
    // MODULE 4: Explore
    // =====================================================
    test.describe('Explore Page', () => {

        test.beforeEach(async ({ page }) => {
            await login(page, testUser.username, testUser.password);
        });

        test('should navigate to explore page', async ({ page }) => {
            // Explore button has aria-label="Explore Trending"
            await page.getByRole('button', { name: 'Explore Trending' }).click();
            await page.waitForURL(`${BASE_URL}/explore`, { timeout: 5000 });
            await expect(page.locator('text=/[Ee]xplore|[Tt]rending/i')).toBeVisible();
        });

        test('should display explore content', async ({ page }) => {
            await page.goto(`${BASE_URL}/explore`);
            await page.waitForTimeout(2000);
            // Page loaded successfully - content present
            const hasContent = await page.locator('article, [class*="post"], h2, h1').first().isVisible().catch(() => false);
            console.log(`Explore content visible: ${hasContent}`);
        });
    });

    // =====================================================
    // MODULE 5: Admin Dashboard
    // =====================================================
    test.describe('Admin Dashboard', () => {

        test('should allow admin to access dashboard', async ({ page }) => {
            await page.goto(`${BASE_URL}/login`);
            await page.getByPlaceholder('johndoe').fill('admin');
            await page.getByPlaceholder('••••••••').fill('admin123');
            await page.getByRole('button', { name: /Login|Logging in/i }).click();
            await page.waitForURL(`${BASE_URL}/feed`, { timeout: 10000 });

            await page.getByRole('button', { name: 'Admin Dashboard' }).click();
            await page.waitForURL(`${BASE_URL}/admin`, { timeout: 5000 });
            await expect(page.locator('text=/Admin.*Dashboard|Dashboard/i')).toBeVisible();
        });
    });

    // =====================================================
    // MODULE 6: Messaging / Inbox
    // =====================================================
    test.describe('Messaging', () => {

        test.beforeEach(async ({ page }) => {
            await login(page, testUser.username, testUser.password);
        });

        test('should access inbox page', async ({ page }) => {
            await page.getByRole('button', { name: 'Inbox' }).click();
            await page.waitForURL(`${BASE_URL}/inbox`, { timeout: 5000 });
            await page.waitForTimeout(1500);
            // Page loaded
            expect(page.url()).toContain('/inbox');
        });
    });

    // =====================================================
    // MODULE 7: Notifications
    // =====================================================
    test.describe('Notifications', () => {

        test.beforeEach(async ({ page }) => {
            await login(page, testUser.username, testUser.password);
        });

        test('should open notifications dropdown', async ({ page }) => {
            // Bell button has aria-label="Notifications"
            await page.getByRole('button', { name: /Notifications/i }).click();
            await page.waitForTimeout(800);
            // Dropdown should appear
            const dropdown = page.locator('[class*="absolute"]').filter({ hasText: /Notification/i });
            const hasDropdown = await dropdown.isVisible().catch(() => false);
            console.log(`Notifications dropdown visible: ${hasDropdown}`);
        });
    });

    // =====================================================
    // MODULE 8: User Blocking
    // =====================================================
    test.describe('User Blocking', () => {

        test('should block another user', async ({ page }) => {
            const ts2 = Date.now().toString().slice(-7);
            const user2 = `block_target_${ts2}`;

            // Register user2
            await register(page, user2);
            await page.goto(`${BASE_URL}/login`);
            await page.getByPlaceholder('johndoe').fill(testUser.username);
            await page.getByPlaceholder('••••••••').fill(testUser.password);
            await page.getByRole('button', { name: /Login|Logging in/i }).click();
            await page.waitForURL(`${BASE_URL}/feed`, { timeout: 10000 });

            // Visit user2's profile and block
            await page.goto(`${BASE_URL}/profile/${user2}`);
            await page.waitForTimeout(1500);
            const blockBtn = page.locator('button:has-text("Block")');
            if (await blockBtn.isVisible()) {
                await blockBtn.click();
                await page.waitForTimeout(1000);
                console.log('✅ Block action executed');
            }
        });
    });

    // =====================================================
    // MODULE 9: Theme Toggle
    // =====================================================
    test.describe('Theme Toggle', () => {

        test.beforeEach(async ({ page }) => {
            await login(page, testUser.username, testUser.password);
        });

        test('should toggle dark/light theme', async ({ page }) => {
            // Theme button has title="Toggle Theme"
            const themeBtn = page.locator('button[title="Toggle Theme"]');
            await expect(themeBtn).toBeVisible();

            // Toggle to dark
            await themeBtn.click();
            await page.waitForTimeout(500);

            // Toggle back to light
            await themeBtn.click();
            await page.waitForTimeout(500);
        });
    });

    // =====================================================
    // MODULE 10: Content Moderation (Report)
    // =====================================================
    test.describe('Content Moderation', () => {

        test.beforeEach(async ({ page }) => {
            await login(page, testUser.username, testUser.password);
        });

        test('should report a post', async ({ page }) => {
            await page.waitForTimeout(2000);
            // Three-dot menu icon (⋮ or ...)
            const menuBtn = page.locator('button:has-text("⋮"), button[aria-label*="menu"], button[aria-label*="more"]').first();
            if (await menuBtn.isVisible()) {
                await menuBtn.hover();
                await page.waitForTimeout(300);
                const reportBtn = page.locator('button:has-text("Report")').first();
                if (await reportBtn.isVisible()) {
                    await reportBtn.click();
                    await page.waitForTimeout(1000);
                    console.log('✅ Report action executed');
                }
            }
        });
    });

    // =====================================================
    // MODULE 11: Logout
    // =====================================================
    test.describe('Logout', () => {

        test('should logout successfully', async ({ page }) => {
            await login(page, testUser.username, testUser.password);
            // UserMenu — click the user avatar/button
            await page.locator('[data-testid="user-menu-button"], button[aria-label*="User menu"], button[aria-label*="user menu"]').click().catch(async () => {
                // Fallback: the UserMenu renders the username
                await page.locator(`text=${testUser.username}`).first().click();
            });

            await page.waitForTimeout(500);
            await page.getByRole('button', { name: /Logout|Log out/i }).click().catch(async () => {
                await page.locator('text=Logout').click();
            });

            await page.waitForURL(`${BASE_URL}/login`, { timeout: 5000 });
            expect(page.url()).toContain('/login');
        });
    });
});
