import { test, expect } from '@playwright/test';

test('Verify Community Group and Chat Group creation', async ({ browser }) => {
    test.slow();

    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    const timestamp = Date.now();
    const splitTs = timestamp.toString().slice(-6); // Shorter for username
    const user1 = `alice_${splitTs}`;
    const user2 = `bob_${splitTs}`;
    const password = "password";

    // --- Helper to register ---
    const register = async (page, username) => {
        await page.goto('http://localhost:5173/register');
        await page.fill('input[placeholder="johndoe"]', username);
        await page.fill('input[type="email"]', `${username}@test.com`);
        await page.fill('input[type="password"]', password);
        await page.click('button:has-text("Register")');
        // Wait for feed or home redirection
        await expect(page).toHaveURL(/.*\/feed/);
    };

    console.log(`Registering ${user1} and ${user2}...`);
    await register(page1, user1);
    await register(page2, user2);

    // ==========================================
    // TEST 1: Community Group Creation (Groups.jsx)
    // ==========================================
    console.log("Testing Community Group Creation...");
    await page1.goto('http://localhost:5173/groups');

    // Open Modal - Use exact text or broader if necessary, but avoid "Create Group" inside modal
    await page1.click('button:has-text("+ Create Group")');
    await expect(page1.locator('h2:has-text("Create New Group")')).toBeVisible();

    // Fill details
    const commGroupName = `Comm Group ${timestamp}`;
    await page1.fill('input[placeholder="e.g. Weekend Trip"]', commGroupName);
    await page1.fill('textarea[placeholder="What\'s this group about?"]', 'Community Desc');

    // Add Member (Bob)
    await page1.fill('input[placeholder="Search people..."]', user2);
    // Wait for search results
    await page1.waitForTimeout(1000); // Wait for debounce and search
    // Click the user in the list (not the selected chip)
    await page1.click(`div.p-2:has-text("${user2}")`);

    // Verify Bob is selected (chip appears)
    await expect(page1.locator(`span:has-text("${user2}")`).first()).toBeVisible();

    // Create - Use specific selector for modal submit button
    await page1.click('.fixed button:has-text("Create Group")');

    // Expected: Redirect to /groups/<id>
    await expect(page1).toHaveURL(/\/groups\/\d+/);
    await expect(page1.locator(`h1:has-text("${commGroupName}")`)).toBeVisible();

    // Verify Member Count (Should be 2: Alice + Bob)
    // "1 members" text (Creator only, others are invited)
    await expect(page1.locator('text=1 members')).toBeVisible();
    console.log("Community Group Verified.");


    // ==========================================
    // TEST 2: Chat Group Creation (Inbox.jsx)
    // ==========================================
    console.log("Testing Chat Group Creation...");
    await page1.goto('http://localhost:5173/inbox');

    // Open Modal
    await page1.click('button:has-text("+ New Group")');
    await expect(page1.locator('h2:has-text("Create New Group")')).toBeVisible();

    // Fill details
    const chatGroupName = `Chat Group ${timestamp}`;
    await page1.fill('input[placeholder="e.g. Weekend Trip"]', chatGroupName);

    // Add Member (Bob)
    await page1.fill('input[placeholder="Search people..."]', user2);
    await page1.waitForTimeout(1000);
    await page1.click(`div.p-2:has-text("${user2}")`);

    // Create
    await page1.click('.fixed button:has-text("Create Group")');

    // Expected: Stay on Inbox (modal closes) and group appears
    await expect(page1.locator('h2:has-text("Create New Group")')).not.toBeVisible();
    await expect(page1.locator(`h3:has-text("${chatGroupName}")`)).toBeVisible();

    // Enter the chat
    await page1.click(`h3:has-text("${chatGroupName}")`);
    await expect(page1).toHaveURL(/\/chat\/group\/\d+/);

    // Send Message
    const msg = "Hello Chat Group";
    await page1.fill('input[placeholder="Type a message..."]', msg);
    await page1.click('button:has-text("Send")');
    await expect(page1.locator(`text=${msg}`)).toBeVisible();

    // Verify Bob sees it
    console.log("Verifying Bob sees the chat group...");
    await page2.goto('http://localhost:5173/inbox');

    // Bob should see the group
    await expect(page2.locator(`h3:has-text("${chatGroupName}")`)).toBeVisible();
    await page2.click(`h3:has-text("${chatGroupName}")`);

    // Bob should see the message
    await expect(page2.locator(`text=${msg}`)).toBeVisible();

    console.log("Chat Group Verified.");
});
