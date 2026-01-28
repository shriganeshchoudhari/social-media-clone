import { test, expect } from '@playwright/test';
import path from 'path';

test('create post with multiple images', async ({ page }) => {
    page.on('console', msg => console.log(`PAGE LOG: ${msg.text()}`));

    // 1. Register a new user
    const timestamp = Date.now();
    const username = `multiimg_${timestamp}`;
    const password = "password";

    await page.goto('http://localhost:5173/register');
    await page.fill('input[placeholder="johndoe"]', username);
    await page.fill('input[type="email"]', `${username}@test.com`);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Register")');

    // Verify redirect to feed
    await expect(page).toHaveURL(/.*\/feed/);
    console.log(`User ${username} registered`);

    // 2. Create Post with Multiple Images
    const postContent = `Check out these ${timestamp} photos!`;
    const image1Path = path.resolve('tests', 'fixtures', 'test-image.svg');
    const image2Path = path.resolve('tests', 'fixtures', 'test-image.svg'); // Using same image for demo

    // Fill content
    await page.locator('textarea[placeholder="What\'s on your mind?"]').pressSequentially(postContent, { delay: 50 });

    // Make file input visible
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

    // Upload multiple files
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles([image1Path, image2Path]);

    // Verify preview shows correct count
    await expect(page.locator('text=2 images selected')).toBeVisible();

    // Verify preview thumbnails are visible
    const previewImages = page.locator('img[alt^="Preview"]');
    await expect(previewImages).toHaveCount(2);

    // Click Post
    await page.click('button:has-text("Post")');

    // 3. Verify Post appeared with multiple images
    await expect(page.locator(`text=${postContent}`)).toBeVisible();

    // Find the post container
    const postLocator = page.locator('div', { hasText: postContent }).first();

    // Verify it has the grid container
    const gridLocator = postLocator.locator('div.grid');
    await expect(gridLocator).toBeVisible();

    // Check that 2 images are rendered in the post
    const postImages = postLocator.locator('img[alt^="post image"]');
    await expect(postImages).toHaveCount(2);

    // Verify both images have correct src
    const firstImgSrc = await postImages.nth(0).getAttribute('src');
    const secondImgSrc = await postImages.nth(1).getAttribute('src');

    expect(firstImgSrc).toContain('/uploads/');
    expect(secondImgSrc).toContain('/uploads/');

    console.log("Multi-image post verified successfully!");
});

test('remove image from preview before posting', async ({ page }) => {
    page.on('console', msg => console.log(`PAGE LOG: ${msg.text()}`));

    // 1. Login or Register
    const timestamp = Date.now();
    const username = `removetest_${timestamp}`;
    const password = "password";

    await page.goto('http://localhost:5173/register');
    await page.fill('input[placeholder="johndoe"]', username);
    await page.fill('input[type="email"]', `${username}@test.com`);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Register")');

    await expect(page).toHaveURL(/.*\/feed/);

    // 2. Upload multiple images
    const image1Path = path.resolve('tests', 'fixtures', 'test-image.svg');
    const image2Path = path.resolve('tests', 'fixtures', 'test-image.svg');

    await page.locator('textarea[placeholder="What\'s on your mind?"]').fill("Testing remove");

    await page.evaluate(() => {
        const input = document.querySelector('input[type="file"]');
        if (input) {
            input.style.display = 'block';
            input.style.visibility = 'visible';
        }
    });

    await page.locator('input[type="file"]').first().setInputFiles([image1Path, image2Path]);

    // Verify 2 images in preview
    await expect(page.locator('text=2 images selected')).toBeVisible();
    let previewImages = page.locator('img[alt^="Preview"]');
    await expect(previewImages).toHaveCount(2);

    // 3. Remove one image using the × button
    // Hover over the first preview to make remove button visible
    await previewImages.first().hover();

    // Click the remove button
    const removeButton = page.locator('button:has-text("×")').first();
    await removeButton.click();

    // 4. Verify only 1 image remains
    await expect(page.locator('text=1 image selected')).toBeVisible();
    previewImages = page.locator('img[alt^="Preview"]');
    await expect(previewImages).toHaveCount(1);

    console.log("Image removal from preview verified successfully!");
});
