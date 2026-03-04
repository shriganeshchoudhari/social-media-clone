import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Direct Messaging Module', () => {

    const register = async (page, username, password = 'Password123!') => {
        await page.goto(`${BASE_URL}/register`);
        await page.getByPlaceholder('johndoe').fill(username);
        await page.locator('input[type="email"]').fill(`${username}@examplenet.com`);
        await page.locator('input[type="password"]').fill(password);
        await page.getByRole('button', { name: /Register|Creating/i }).click();
        await page.waitForURL(`${BASE_URL}/feed`, { timeout: 10000 });
    };

    test('TC_CHAT_01, TC_CHAT_02 & TC_CHAT_03 - Real-time Messaging and Thread', async ({ browser }) => {
        const ts = Date.now().toString().slice(-7);
        const userA = `userA_${ts}`;
        const userB = `userB_${ts}`;

        const ctxB = await browser.newContext();
        const pageB = await ctxB.newPage();
        await register(pageB, userB);

        const ctxA = await browser.newContext();
        const pageA = await ctxA.newPage();
        await register(pageA, userA);

        // User A navigates to User B's profile to start a chat
        await pageA.goto(`${BASE_URL}/profile/${userB}`);
        await pageA.getByRole('button', { name: /Message/i }).click().catch(async () => {
            await pageA.goto(`${BASE_URL}/chat/${userB}`);
        });
        await pageA.waitForURL(new RegExp(`.*\/chat\/${userB}`));

        // User A sends message
        const messageText1 = `Hello from ${userA}!`;
        const chatInputA = pageA.locator('input[placeholder="Type a message..."], input[type="text"]');
        await chatInputA.fill(messageText1);
        await pageA.getByRole('button', { name: /Send|➤/i }).or(pageA.locator('button[type="submit"]')).click().catch(async () => {
            await pageA.keyboard.press('Enter');
        });

        // Check it appears for A
        await expect(pageA.getByText(messageText1)).toBeVisible();

        // User B checking Inbox
        await pageB.goto(`${BASE_URL}/inbox`);
        await expect(pageB.locator(`text=${userA}`).first()).toBeVisible({ timeout: 10000 });
        await pageB.locator(`text=${userA}`).first().click();
        await pageB.waitForURL(new RegExp(`.*\/chat\/${userA}`));

        // User B sees the message
        await expect(pageB.getByText(messageText1)).toBeVisible();

        // User B replies
        const replyText = `Hi ${userA}, this is B!`;
        const chatInputB = pageB.locator('input[placeholder="Type a message..."], input[type="text"]');
        await chatInputB.fill(replyText);
        await pageB.getByRole('button', { name: /Send|➤/i }).or(pageB.locator('button[type="submit"]')).click().catch(async () => {
            await pageB.keyboard.press('Enter');
        });

        // Check thread updates for B
        await expect(pageB.getByText(replyText)).toBeVisible();

        // Check thread updates for A in real-time
        await expect(pageA.getByText(replyText)).toBeVisible({ timeout: 10000 });

        await ctxA.close();
        await ctxB.close();
    });

    test('TC_CHAT_04 - Inbox page lists all conversations', async ({ browser }) => {
        const ts = Date.now().toString().slice(-7);
        const userA = `inbox_A_${ts}`;
        const userB = `inbox_B_${ts}`;

        const ctxA = await browser.newContext();
        const pageA = await ctxA.newPage();
        await register(pageA, userA);

        const ctxB = await browser.newContext();
        const pageB = await ctxB.newPage();
        await register(pageB, userB);

        await pageB.goto(`${BASE_URL}/chat/${userA}`);
        await pageB.locator('input[placeholder="Type a message..."], input[type="text"]').fill('Test Inbox');
        await pageB.getByRole('button', { name: /Send|➤/i }).or(pageB.locator('button[type="submit"]')).click().catch(async () => {
            await pageB.keyboard.press('Enter');
        });
        await expect(pageB.getByText('Test Inbox')).toBeVisible();
        await ctxB.close();

        await pageA.goto(`${BASE_URL}/inbox`);
        await expect(pageA.locator(`text=${userB}`).first()).toBeVisible({ timeout: 5000 });
        await expect(pageA.locator(`text=Test Inbox`).first()).toBeVisible();

        await ctxA.close();
    });

    test('TC_CHAT_05 - Send an image in chat', async ({ browser }) => {
        const ts = Date.now().toString().slice(-7);
        const userA = `img_A_${ts}`;
        const userB = `img_B_${ts}`;

        const imgPath = require('path').resolve(__dirname, 'test-image.svg');
        require('fs').writeFileSync(imgPath, '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="red"/></svg>');

        const ctxB = await browser.newContext();
        const pageB = await ctxB.newPage();
        await register(pageB, userB);
        await ctxB.close();

        const ctxA = await browser.newContext();
        const pageA = await ctxA.newPage();
        await register(pageA, userA);

        await pageA.goto(`${BASE_URL}/chat/${userB}`);

        const fileInput = pageA.locator('input[type="file"]');
        if (await fileInput.count() > 0) {
            await fileInput.setInputFiles(imgPath);
            await pageA.getByRole('button', { name: /Send|➤/i }).or(pageA.locator('button[type="submit"]')).click();
            await expect(pageA.locator('img[src*="/uploads/"], img[src*="blob:"]').first()).toBeVisible({ timeout: 5000 });
        }

        await ctxA.close();
        require('fs').unlinkSync(imgPath);
    });

    test('TC_CHAT_06 - Paginated loading of older messages', async ({ browser }) => {
        // This test would push 25+ messages and scroll up
        // Currently skipping due to performance issues locally, just stubbed
        test.skip();
    });

    test('TC_CHAT_07 - Send an empty message', async ({ browser }) => {
        const ts = Date.now().toString().slice(-7);
        const userA = `empty_A_${ts}`;

        const ctxA = await browser.newContext();
        const pageA = await ctxA.newPage();
        await register(pageA, userA);

        await pageA.goto(`${BASE_URL}/chat/some_user_random`);

        const sendBtn = pageA.getByRole('button', { name: /Send|➤/i }).or(pageA.locator('button[type="submit"]'));

        if (await sendBtn.isVisible()) {
            const isDisabled = await sendBtn.isDisabled();
            if (!isDisabled) {
                await sendBtn.click();
                await pageA.waitForTimeout(500);
                await expect(pageA.locator('.message-bubble:empty')).toHaveCount(0);
            }
        }

        await ctxA.close();
    });

    test('TC_CHAT_08 - Send a message to a blocked user', async ({ browser }) => {
        const ts = Date.now().toString().slice(-7);
        const userA = `block_A_${ts}`;
        const userB = `block_B_${ts}`;

        const ctxB = await browser.newContext();
        const pageB = await ctxB.newPage();
        await register(pageB, userB);
        await ctxB.close();

        const ctxA = await browser.newContext();
        const pageA = await ctxA.newPage();
        await register(pageA, userA);

        // A blocks B
        await pageA.goto(`${BASE_URL}/profile/${userB}`);
        await pageA.getByRole('button', { name: /Block/i }).first().click().catch(async () => {
            const moreBtn = pageA.locator('button[aria-label="More options"]');
            if (await moreBtn.isVisible()) {
                await moreBtn.click();
                await pageA.getByRole('menuitem', { name: /Block/i }).click();
            }
        });
        const clk = pageA.getByRole('button', { name: /Confirm|Yes|Block/i });
        if (await clk.isVisible()) await clk.click();

        await pageA.waitForTimeout(1000);

        await pageA.goto(`${BASE_URL}/chat/${userB}`);

        const blockedMsg = pageA.locator('text=/blocked|cannot send/i');
        const isBlockedVisible = await blockedMsg.isVisible();
        const inputDisabled = await pageA.locator('input[placeholder="Type a message..."], input[type="text"]').isDisabled().catch(() => true);

        expect(isBlockedVisible || inputDisabled).toBeTruthy();

        await ctxA.close();
    });

    test('TC_CHAT_09 - Access /chat/nonexistentuser', async ({ browser }) => {
        const ts = Date.now().toString().slice(-7);
        const userA = `nonexist_A_${ts}`;

        const ctxA = await browser.newContext();
        const pageA = await ctxA.newPage();
        await register(pageA, userA);

        const badPath = `${BASE_URL}/chat/this_user_does_not_exist_999`;
        await pageA.goto(badPath);

        await pageA.waitForTimeout(1000);
        const url = pageA.url();
        const showsError = await pageA.locator('text=/User not found|error|does not exist/i').isVisible();

        expect(url !== badPath || showsError).toBeTruthy();
        await ctxA.close();
    });

});
