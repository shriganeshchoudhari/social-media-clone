
import { test, expect } from '@playwright/test';

test.describe('Account Management & Privacy', () => {

    test('privacy toggle and enforcement', async ({ page }) => {
        // 1. Register User A (The Private User)
        const timestamp = Date.now();
        const userA = `private_${timestamp}`;
        const userB = `viewer_${timestamp}`;
        const password = "password123";

        await page.goto('http://localhost:5173/register');
        await page.fill('input[placeholder="johndoe"]', userA);
        await page.fill('input[type="email"]', `${userA}@test.com`);
        await page.fill('input[type="password"]', password);
        await page.click('button:has-text("Register")');
        await expect(page).toHaveURL(/.*\/feed/);

        // 2. Create a post as User A (to verify visibility later)
        await page.click('button:has-text("Create Post")');
        await page.fill('textarea[placeholder*="mind"]', 'Secret Post content');
        await page.click('button:has-text("Post")');
        await expect(page.locator('text=Secret Post content')).toBeVisible();

        // 3. Go to Settings and Toggle Privacy ON
        await page.click('button:has-text("Settings")');
        await expect(page.locator('text=Private Account')).toBeVisible();

        // Find toggle button - it's a button with specific classes in the Privacy section
        // We can find it by the sibling text or structure. 
        // Strategy: Click the button next to "Private Account" text container
        await page.locator('button.rounded-full').first().click();

        // Wait for success message
        await expect(page.locator('text=✅ Privacy settings updated!')).toBeVisible();

        // 4. Logout User A
        await page.click('button:has-text("Logout")');
        await expect(page).toHaveURL(/.*\/login/);

        // 5. Register User B (The Viewer)
        await page.goto('http://localhost:5173/register');
        await page.fill('input[placeholder="johndoe"]', userB);
        await page.fill('input[type="email"]', `${userB}@test.com`);
        await page.fill('input[type="password"]', password);
        await page.click('button:has-text("Register")');
        await expect(page).toHaveURL(/.*\/feed/);

        // 6. Visit User A's profile
        await page.goto(`http://localhost:5173/profile/${userA}`);

        // 7. Verify Content Hidden (Private Account Message)
        await expect(page.locator('text=🔒 This account is private')).toBeVisible();
        await expect(page.locator('text=Secret Post content')).not.toBeVisible();

        // 8. Follow User A
        await page.click('button:has-text("Follow")');

        // 9. Verify Content Visible (Unfollow button appears, lock message gone)
        // Note: Our current logic allows followers to see posts immediately.
        await expect(page.locator('text=Unfollow')).toBeVisible();
        await expect(page.locator('text=🔒 This account is private')).not.toBeVisible();

        // Posts might need a reload or re-fetch in real app, but our Profile.jsx re-fetches on follow toggle.
        // Let's check if post is visible.
        // Wait a bit for fetch
        await page.waitForTimeout(1000);
        await expect(page.locator('text=Secret Post content')).toBeVisible();
    });

    test('account deletion', async ({ page }) => {
        // 1. Register User C (Disposable)
        const timestamp = Date.now();
        const userC = `deleted_${timestamp}`;
        const password = "password123";

        await page.goto('http://localhost:5173/register');
        await page.fill('input[placeholder="johndoe"]', userC);
        await page.fill('input[type="email"]', `${userC}@test.com`);
        await page.fill('input[type="password"]', password);
        await page.click('button:has-text("Register")');
        await expect(page).toHaveURL(/.*\/feed/);

        // 2. Go to Settings
        await page.click('[data-testid="user-menu-button"]');
        await page.click('button:has-text("Settings")');
        await expect(page).toHaveURL(/.*\/settings/);

        // 3. Handle Confirm Dialog
        page.on('dialog', dialog => dialog.accept());

        // 4. Click Delete Account
        // Scroll to bottom to ensure Danger Zone is in view (sometimes needed if layout is tall)
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

        // Wait for the button to be visible first to avoid race conditions
        const deleteBtn = page.locator('button:has-text("Delete Account")');
        await deleteBtn.waitFor({ state: 'visible', timeout: 5000 });
        await deleteBtn.click();

        // 5. Verify Redirect to Login (Logout)
        await expect(page).toHaveURL(/.*\/login/);

        // 6. Try to Login again
        await page.fill('input[placeholder="johndoe"]', userC);
        await page.fill('input[type="password"]', password);
        await page.click('button:has-text("Login")');

        // 7. Verify Login Fails
        // Check for UI error message
        await expect(page.locator('text=Invalid credentials')).toBeVisible({ timeout: 5000 });

        expect(page.url()).toContain('/login');
    });

});
