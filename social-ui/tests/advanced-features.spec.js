import { test, expect } from '@playwright/test';

test('edit and delete post', async ({ page }) => {
    page.on('console', msg => console.log(`PAGE LOG: ${msg.text()}`));

    // 1. Register
    const timestamp = Date.now();
    const username = `edituser_${timestamp}`;
    const password = "password";

    await page.goto('http://localhost:5173/register');
    await page.fill('input[placeholder="johndoe"]', username);
    await page.fill('input[type="email"]', `${username}@test.com`);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Register")');

    await expect(page).toHaveURL(/.*\/feed/);

    // 2. Create a post
    const originalContent = `Original post ${timestamp}`;
    await page.locator('textarea[placeholder="What\'s on your mind?"]').fill(originalContent);
    await page.click('button:has-text("Post")');

    // Wait for post to appear
    await expect(page.locator(`text=${originalContent}`)).toBeVisible();

    // 3. Edit the post
    // Find the three-dot menu button and hover
    const postCard = page.locator('div', { hasText: originalContent }).first();
    const menuButton = postCard.locator('button:has-text("⋮")');
    await menuButton.hover();

    // Click Edit
    await page.click('button:has-text("Edit")');

    // Change the content
    const editedContent = `Edited post ${timestamp}`;
    const textarea = page.locator('textarea').first();
    await textarea.clear();
    await textarea.fill(editedContent);

    // Save
    await page.click('button:has-text("Save")');

    // Verify edited content appears
    await expect(page.locator(`text=${editedContent}`)).toBeVisible();
    await expect(page.locator(`text=${originalContent}`)).not.toBeVisible();

    // 4. Delete the post
    const editedPostCard = page.locator('div', { hasText: editedContent }).first();
    const deleteMenuButton = editedPostCard.locator('button:has-text("⋮")');
    await deleteMenuButton.hover();

    // Set up dialog handler before clicking delete
    page.once('dialog', dialog => {
        expect(dialog.message()).toContain('Are you sure');
        dialog.accept();
    });

    await page.click('button:has-text("Delete")');

    // Verify post is gone
    await expect(page.locator(`text=${editedContent}`)).not.toBeVisible();

    console.log("Edit and delete verified successfully!");
});

test('send image in chat', async ({ page }) => {
    page.on('console', msg => console.log(`PAGE LOG: ${msg.text()}`));

    const timestamp = Date.now();

    // 1. Register user 1
    const user1 = `chatuser1_${timestamp}`;
    await page.goto('http://localhost:5173/register');
    await page.fill('input[placeholder="johndoe"]', user1);
    await page.fill('input[type="email"]', `${user1}@test.com`);
    await page.fill('input[type="password"]', "password");
    await page.click('button:has-text("Register")');
    await expect(page).toHaveURL(/.*\/feed/);

    // 2. Register user 2 in a new context (simulating another user)
    const context2 = await page.context().browser().newContext();
    const page2 = await context2.newPage();
    const user2 = `chatuser2_${timestamp}`;

    await page2.goto('http://localhost:5173/register');
    await page2.fill('input[placeholder="johndoe"]', user2);
    await page2.fill('input[type="email"]', `${user2}@test.com`);
    await page2.fill('input[type="password"]', "password");
    await page2.click('button:has-text("Register")');
    await expect(page2).toHaveURL(/.*\/feed/);

    // 3. User1 searches for user2
    await page.click('input[placeholder="Search users..."]');
    await page.fill('input[placeholder="Search users..."]', user2);
    await page.click(`text=${user2}`);

    // Navigate to profile and start chat
    await expect(page).toHaveURL(new RegExp(`/profile/${user2}`));
    await page.click('button:has-text("Message")');

    // Should be on chat page
    await expect(page).toHaveURL(new RegExp(`/chat/${user2}`));

    // 4. Send image with text
    const imagePath = require('path').resolve('tests', 'fixtures', 'test-image.svg');

    // Make file input visible
    await page.evaluate(() => {
        const input = document.querySelector('input[type="file"]');
        if (input) {
            input.style.display = 'block';
            input.style.visibility = 'visible';
        }
    });

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(imagePath);

    // Verify preview appears
    await expect(page.locator('img[alt="Preview"]')).toBeVisible();

    // Add message text
    await page.fill('input[placeholder="Type a message..."]', `Here's a photo! ${timestamp}`);

    // Send
    await page.click('button[type="submit"]');

    // Wait a bit for the message to appear
    await page.waitForTimeout(1000);

    // Verify image appears in chat
    const chatImage = page.locator('img[alt="chat"]');
    await expect(chatImage).toBeVisible();

    // Verify the src contains /uploads/
    const src = await chatImage.getAttribute('src');
    expect(src).toContain('/uploads/');

    // Clean up
    await context2.close();

    console.log("Chat image verified successfully!");
});
