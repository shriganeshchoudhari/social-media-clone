import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:8080/api';

test.describe('Settings Module', () => {
    // Generate a unique user per worker/suite to ensure isolated settings tests
    let validUser;

    test.beforeAll(async ({ browser }) => {
        // Context setup if needed, but we'll do straight registration in a beforeEach for isolation or a single user for the whole suite
    });

    test.beforeEach(async ({ page }) => {
        const ts = Date.now();
        validUser = {
            username: `setuser_${ts}`,
            email: `setuser_${ts}@test.com`,
            password: 'Password123!'
        };

        // Register the user
        await page.goto(`${BASE_URL}/register`);
        await page.locator('input[placeholder="johndoe"]').fill(validUser.username);
        await page.locator('input[type="email"]').fill(validUser.email);
        await page.locator('input[type="password"]').fill(validUser.password);
        await page.getByRole('button', { name: /Register|Creating Account/i }).click();
        await page.waitForURL(`${BASE_URL}/feed`, { timeout: 10000 });

        // Navigate to settings
        await page.goto(`${BASE_URL}/settings`);
        await page.waitForTimeout(1000); // give it a second to load profile
    });

    test.afterEach(async ({ page }) => {
        await page.evaluate(() => localStorage.clear());
    });

    test.describe('3.1 Profile Update', () => {
        test('TC_SET_01 - Update bio with valid text and save', async ({ page }) => {
            const newBio = 'This is an automated test bio updated!';
            await page.locator('textarea').fill(newBio);
            await page.getByRole('button', { name: /Save Profile/i }).click();
            await expect(page.locator('text=/Profile updated successfully/i')).toBeVisible({ timeout: 5000 });

            // Reload and verify persistence
            await page.reload();
            await expect(page.locator('textarea')).toHaveValue(newBio);
        });

        test('TC_SET_02 - Update website URL and save', async ({ page }) => {
            const newWebsite = 'https://playwright.dev';
            await page.locator('input[placeholder="https://example.com"]').fill(newWebsite);
            await page.getByRole('button', { name: /Save Profile/i }).click();
            await expect(page.locator('text=/Profile updated successfully/i')).toBeVisible({ timeout: 5000 });

            // Reload and verify persistence
            await page.reload();
            await expect(page.locator('input[placeholder="https://example.com"]')).toHaveValue(newWebsite);
        });

        test('TC_SET_05 - Add a new interest tag and save profile', async ({ page }) => {
            await page.locator('input[placeholder="Add interest"]').fill('Automation');
            await page.getByRole('button', { name: 'Add' }).click();
            await page.getByRole('button', { name: /Save Profile/i }).click();
            await expect(page.locator('text=/Profile updated successfully/i')).toBeVisible({ timeout: 5000 });

            await page.reload();
            await expect(page.locator('span', { hasText: 'Automation' }).first()).toBeVisible();
        });

        test('TC_SET_06 - Remove an existing interest tag and save', async ({ page }) => {
            // First add it
            await page.locator('input[placeholder="Add interest"]').fill('To Be Removed');
            await page.getByRole('button', { name: 'Add' }).click();
            await page.getByRole('button', { name: /Save Profile/i }).click();
            await expect(page.locator('text=/Profile updated successfully/i')).toBeVisible({ timeout: 5000 });

            // Now remove it
            await page.locator('span', { hasText: 'To Be Removed' }).locator('button').click();
            await page.getByRole('button', { name: /Save Profile/i }).click();
            await expect(page.locator('span', { hasText: 'To Be Removed' })).toBeHidden();
        });

        test('TC_SET_07 - Add duplicate interest tag', async ({ page }) => {
            await page.locator('input[placeholder="Add interest"]').fill('Duplicate');
            await page.getByRole('button', { name: 'Add' }).click();
            // Try adding again
            await page.locator('input[placeholder="Add interest"]').fill('Duplicate');
            await page.getByRole('button', { name: 'Add' }).click();

            // Check that there is only one Duplicate span
            const spans = page.locator('span', { hasText: 'Duplicate' });
            await expect(spans).toHaveCount(1);
        });
    });

    test.describe('3.2 Change Password', () => {
        test('TC_SET_09 - Change password with correct current password and matching new passwords', async ({ page }) => {
            await page.locator('label', { hasText: 'Current Password' }).locator('~ input').fill(validUser.password);
            await page.locator('label', { hasText: 'New Password' }).locator('~ input').fill('NewValidPassword123!');
            await page.locator('label', { hasText: 'Confirm Password' }).locator('~ input').fill('NewValidPassword123!');

            await page.getByRole('button', { name: /Update Password/i }).click();
            await expect(page.locator('text=/Password changed successfully/i')).toBeVisible({ timeout: 5000 });

            // verify login with new password works
            await page.evaluate(() => localStorage.clear());
            await page.goto(`${BASE_URL}/login`);
            await page.locator('input[placeholder="johndoe"]').fill(validUser.username);
            await page.locator('input[type="password"]').fill('NewValidPassword123!');
            await page.getByRole('button', { name: /Login|Logging in/i }).click();
            await page.waitForURL(`${BASE_URL}/feed`, { timeout: 10000 });
            await expect(page).toHaveURL(/.*\/feed/);
        });

        test('TC_SET_10 - Change password with wrong current password', async ({ page }) => {
            await page.locator('label', { hasText: 'Current Password' }).locator('~ input').fill('IncorrectPass000!');
            await page.locator('label', { hasText: 'New Password' }).locator('~ input').fill('NewValidPassword123!');
            await page.locator('label', { hasText: 'Confirm Password' }).locator('~ input').fill('NewValidPassword123!');

            await page.getByRole('button', { name: /Update Password/i }).click();
            await expect(page.locator('text=/Failed to change password|Incorrect current password/i')).toBeVisible({ timeout: 5000 });
        });

        test('TC_SET_11 - New password and confirm password dont match', async ({ page }) => {
            await page.locator('label', { hasText: 'Current Password' }).locator('~ input').fill(validUser.password);
            await page.locator('label', { hasText: 'New Password' }).locator('~ input').fill('NewValidPassword123!');
            await page.locator('label', { hasText: 'Confirm Password' }).locator('~ input').fill('MismatchedPassword999!');

            await page.getByRole('button', { name: /Update Password/i }).click();
            await expect(page.locator('text=/New passwords do not match/i')).toBeVisible({ timeout: 5000 });
        });

        test('TC_SET_12 - Leave all password fields empty and submit', async ({ page }) => {
            await page.getByRole('button', { name: /Update Password/i }).click();
            // Since they have `required` html5 attributes:
            const currentPass = page.locator('label', { hasText: 'Current Password' }).locator('~ input');
            const isInvalid = await currentPass.evaluate(node => !node.validity.valid);
            expect(isInvalid).toBeTruthy();
        });
    });

    test.describe('3.3 Privacy Toggle', () => {
        test('TC_SET_13 - Toggle account from Public to Private', async ({ page }) => {
            await page.waitForSelector('text=Private Account');
            // Using the toggle button sibling of 'Private Account'
            await page.locator('button', { has: page.locator('span.bg-white') }).click();
            await expect(page.locator('text=/Account is now Private/i')).toBeVisible({ timeout: 5000 });
        });

        test('TC_SET_14 - Toggle account from Private back to Public', async ({ page }) => {
            // First make it private
            await page.locator('button', { has: page.locator('span.bg-white') }).click();
            await expect(page.locator('text=/Account is now Private/i')).toBeVisible({ timeout: 5000 });

            // Wait a moment and toggle it back
            await page.waitForTimeout(1000);
            await page.locator('button', { has: page.locator('span.bg-white') }).click();
            await expect(page.locator('text=/Account is now Public/i')).toBeVisible({ timeout: 5000 });
        });
    });

    test.describe('3.4 Delete Account', () => {
        test('TC_SET_15 - Click Delete Account, confirm in dialog', async ({ page }) => {
            page.on('dialog', dialog => dialog.accept());
            await page.getByTestId('delete-account-button').click();

            await page.waitForURL(`${BASE_URL}/login`, { timeout: 10000 });
            await expect(page).toHaveURL(/.*\/login/);

            // Attempt to login with deleted credentials
            await page.locator('input[placeholder="johndoe"]').fill(validUser.username);
            await page.locator('input[type="password"]').fill(validUser.password);
            await page.getByRole('button', { name: /Login|Logging in/i }).click();
            await expect(page.getByText(/credentials|not found|doesn't exist|invalid|bad/i)).toBeVisible({ timeout: 5000 });
        });

        test('TC_SET_16 - Click Delete Account but cancel the confirmation dialog', async ({ page }) => {
            page.on('dialog', dialog => dialog.dismiss());
            await page.getByTestId('delete-account-button').click();

            // Should stay on settings page
            await page.waitForTimeout(1000);
            await expect(page).toHaveURL(/.*\/settings/);
        });
    });
});
