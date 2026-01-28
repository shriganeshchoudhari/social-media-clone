import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('User Settings', () => {

    test('update profile bio', async ({ page }) => {
        page.on('console', msg => console.log(`PAGE LOG: ${msg.text()}`));

        // 1. Register a new user
        const timestamp = Date.now();
        const username = `biouser_${timestamp}`;
        const password = "password123";

        await page.goto('http://localhost:5173/register');
        await page.fill('input[placeholder="johndoe"]', username);
        await page.fill('input[type="email"]', `${username}@test.com`);
        await page.fill('input[type="password"]', password);
        await page.click('button:has-text("Register")');

        await expect(page).toHaveURL(/.*\/feed/);

        // 2. Navigate to Settings
        await page.click('button:has-text("Settings")');
        await expect(page).toHaveURL(/.*\/settings/);

        // 3. Update bio
        const bioText = `This is my bio - ${timestamp}`;
        await page.fill('textarea[placeholder*="Tell us about yourself"]', bioText);

        // 4. Save profile
        await page.click('button:has-text("Save Profile")');

        // Wait for success message
        await expect(page.locator('text=✅')).toBeVisible({ timeout: 10000 });

        console.log("✅ Profile bio update test passed!");
    });

    test('change password successfully', async ({ page }) => {
        page.on('console', msg => console.log(`PAGE LOG: ${msg.text()}`));

        // 1. Register a new user
        const timestamp = Date.now();
        const username = `pwduser_${timestamp}`;
        const oldPassword = "password123";
        const newPassword = "newpassword456";

        await page.goto('http://localhost:5173/register');
        await page.fill('input[placeholder="johndoe"]', username);
        await page.fill('input[type="email"]', `${username}@test.com`);
        await page.fill('input[type="password"]', oldPassword);
        await page.click('button:has-text("Register")');

        await expect(page).toHaveURL(/.*\/feed/);

        // 2. Navigate to Settings
        await page.click('button:has-text("Settings")');
        await expect(page).toHaveURL(/.*\/settings/);

        // 3. Fill password form - use more specific selectors
        const passwordInputs = await page.locator('input[type="password"]').all();
        await passwordInputs[0].fill(oldPassword); // Current password
        await passwordInputs[1].fill(newPassword); // New password

        // 4. Submit password change
        await page.click('button:has-text("Change Password")');

        // Wait for success message
        await expect(page.locator('text=✅ Password changed successfully!')).toBeVisible({ timeout: 10000 });

        // 5. Logout
        await page.click('button:has-text("Logout")');
        await expect(page).toHaveURL(/.*\/login/);

        // 6. Login with new password
        await page.fill('input[placeholder="johndoe"]', username);
        await page.fill('input[type="password"]', newPassword);
        await page.click('button:has-text("Login")');

        // Should successfully login
        await expect(page).toHaveURL(/.*\/feed/, { timeout: 10000 });

        console.log("✅ Password change test passed!");
    });

    test('fail password change with wrong old password', async ({ page }) => {
        page.on('console', msg => console.log(`PAGE LOG: ${msg.text()}`));

        // 1. Register a new user
        const timestamp = Date.now();
        const username = `pwdfail_${timestamp}`;
        const password = "password123";

        await page.goto('http://localhost:5173/register');
        await page.fill('input[placeholder="johndoe"]', username);
        await page.fill('input[type="email"]', `${username}@test.com`);
        await page.fill('input[type="password"]', password);
        await page.click('button:has-text("Register")');

        await expect(page).toHaveURL(/.*\/feed/);

        // 2. Navigate to Settings
        await page.click('button:has-text("Settings")');
        await expect(page).toHaveURL(/.*\/settings/);

        // 3. Fill with WRONG old password
        const passwordInputs = await page.locator('input[type="password"]').all();
        await passwordInputs[0].fill("wrongpassword");
        await passwordInputs[1].fill("newpassword456");

        // 4. Submit password change
        await page.click('button:has-text("Change Password")');

        // Wait for error message
        await expect(page.locator('text=/.*❌.*/')).toBeVisible({ timeout: 10000 });

        console.log("✅ Password validation test passed!");
    });

    test('fail to change password too short', async ({ page }) => {
        page.on('console', msg => console.log(`PAGE LOG: ${msg.text()}`));

        // 1. Register a new user
        const timestamp = Date.now();
        const username = `pwdshort_${timestamp}`;
        const password = "password123";

        await page.goto('http://localhost:5173/register');
        await page.fill('input[placeholder="johndoe"]', username);
        await page.fill('input[type="email"]', `${username}@test.com`);
        await page.fill('input[type="password"]', password);
        await page.click('button:has-text("Register")');

        await expect(page).toHaveURL(/.*\/feed/);

        // 2. Navigate to Settings
        await page.click('button:has-text("Settings")');
        await expect(page).toHaveURL(/.*\/settings/);

        // 3. Scroll to password form
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

        // 4. Try to use password that's too short (HTML5 validation should catch this)
        await page.fill('input[placeholder*="current password"]', password);

        const newPassInput = page.locator('input[placeholder*="new password"]');
        await newPassInput.fill("12345"); // Only 5 characters

        // HTML5 minlength should prevent form submission or show validation error
        const validationMessage = await newPassInput.evaluate((el) => el.validationMessage);
        expect(validationMessage).toBeTruthy();

        console.log("✅ Password length validation test passed!");
    });
});
