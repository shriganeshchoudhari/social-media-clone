import { test, expect } from '@playwright/test';
import path from 'path';

test('create post with image', async ({ page }) => {
    page.on('console', msg => console.log(`PAGE LOG: ${msg.text()}`));

    // 1. Register a new user
    const timestamp = Date.now();
    const username = `imguser_${timestamp}`;
    const password = "password";

    await page.goto('http://localhost:5173/register');
    await page.fill('input[placeholder="johndoe"]', username);
    await page.fill('input[type="email"]', `${username}@test.com`);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Register")');

    // Verify redirect to feed
    await expect(page).toHaveURL(/.*\/feed/);
    console.log(`User ${username} registered`);

    // 2. Create Post with Image
    const postContent = `Look at this photo! ${timestamp}`;
    const imagePath = path.resolve('tests', 'fixtures', 'test-image.svg');

    // Fill content
    // Fill content using pressSequentially to ensure React onChange fires
    await page.locator('textarea[placeholder="What\'s on your mind?"]').pressSequentially(postContent, { delay: 50 });

    // Upload file
    // Hack: Make the hidden input visible so Playwright interactions work reliably
    await page.evaluate(() => {
        const input = document.querySelector('input[type="file"]');
        if (input) {
            input.style.display = 'block';
            input.style.visibility = 'visible';
            input.style.width = '1px';
            input.style.height = '1px';
            input.style.opacity = '1';
        }
    });

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(imagePath);

    // Dispatch change event explicitly just in case
    await fileInput.evaluate(e => e.dispatchEvent(new Event('change', { bubbles: true })));

    // Verify button becomes enabled (means state updated)
    await expect(page.locator('button:has-text("Post")')).toBeEnabled();

    // Verify filename appears in UI
    await expect(page.locator('text=test-image.svg')).toBeVisible();

    // Click Post
    await page.click('button:has-text("Post")');

    // 3. Verify Post appeared
    // Wait for the post text
    await expect(page.locator(`text=${postContent}`)).toBeVisible();

    // Verify Image is rendered
    // We look for an image inside the post card that contains the content
    // Strategy: Find the container having the text, then find the img inside it
    const postLocator = page.locator('div', { hasText: postContent }).first();
    const imgLocator = postLocator.locator('img[alt="post"]');

    await expect(imgLocator).toBeVisible();

    // Optional: Check src attribute contains /uploads/
    const src = await imgLocator.getAttribute('src');
    expect(src).toContain('/uploads/');

    console.log("Post with image verified successfully!");
});
