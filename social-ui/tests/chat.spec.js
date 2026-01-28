import { test, expect } from '@playwright/test';

test('chat flow between two users', async ({ browser }) => {
    test.slow(); // Increase timeout
    // Create two isolated browser contexts representing two different users
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    const timestamp = Date.now();
    const user1 = `userA_${timestamp}`;
    const user2 = `userB_${timestamp}`;
    const password = "password";

    console.log(`Testing with User1: ${user1}, User2: ${user2}`);

    // --- 1. Register User 1 ---
    await page1.goto('http://localhost:5173/register');
    await page1.fill('input[placeholder="johndoe"]', user1);
    await page1.fill('input[type="email"]', `${user1}@test.com`);
    await page1.fill('input[type="password"]', password);
    await page1.click('button:has-text("Register")');

    // Verify redirect to feed
    await expect(page1).toHaveURL(/.*\/feed/);
    console.log("User 1 registered and logged in.");

    // --- 2. Register User 2 ---
    await page2.goto('http://localhost:5173/register');
    await page2.fill('input[placeholder="johndoe"]', user2);
    await page2.fill('input[type="email"]', `${user2}@test.com`);
    await page2.fill('input[type="password"]', password);
    await page2.click('button:has-text("Register")');

    // Verify redirect to feed
    await expect(page2).toHaveURL(/.*\/feed/);
    console.log("User 2 registered and logged in.");

    // --- 3. User 2 sends message to User 1 ---
    // Navigate directly to chat with User 1
    await page2.goto(`http://localhost:5173/chat/${user1}`);

    // Wait for chat to load to avoid race condition (history overwrite)
    await expect(page2.locator('text=No messages yet')).toBeVisible();

    const messageContent = `Hello ${user1} from ${user2}`;
    await page2.fill('input[placeholder="Type a message..."]', messageContent);
    // Send button is inside the form, let's target it specifically
    const sendBtn = page2.locator('form button:has(svg)');
    await expect(sendBtn).toBeEnabled();
    await sendBtn.click();

    // Verify message appears in User 2's chat window (Optimistic UI)
    await expect(page2.locator(`text=${messageContent}`)).toBeVisible();
    console.log("User 2 sent message.");

    // --- 4. User 1 receives message ---
    // Go to Inbox
    await page1.goto('http://localhost:5173/inbox');

    // Verify the conversation with User 2 is listed
    await expect(page1.locator(`h3:has-text("${user2}")`)).toBeVisible();

    // Click on the conversation
    await page1.click(`h3:has-text("${user2}")`);

    // Verify the message content is present
    await expect(page1.locator(`text=${messageContent}`)).toBeVisible();
    console.log("User 1 received message.");

    // --- 5. User 1 replies ---
    const replyContent = "Got it, thanks!";
    await page1.fill('input[placeholder="Type a message..."]', replyContent);
    // Press Enter to submit (more reliable than clicking sometimes)
    await page1.keyboard.press('Enter');

    // Verify reply appears in User 1's window
    await expect(page1.getByText(replyContent).last()).toBeVisible();
    console.log("User 1 replied.");

    // --- 6. Verify User 2 sees the reply ---
    // User 2 should see it appear in real-time nicely
    await expect(page2.getByText(replyContent).last()).toBeVisible();
    console.log("User 2 received reply.");
});
