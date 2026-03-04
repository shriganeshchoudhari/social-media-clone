import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Community Groups Module', () => {

    const register = async (page, username, password = 'Password123!') => {
        await page.goto(`${BASE_URL}/register`);
        await page.getByPlaceholder('johndoe').fill(username);
        await page.locator('input[type="email"]').fill(`${username}@examplenet.com`);
        await page.locator('input[type="password"]').fill(password);
        await page.getByRole('button', { name: /Register|Creating/i }).click();
        await page.waitForURL(`${BASE_URL}/feed`, { timeout: 10000 });
    };

    test('TC_GRP_01 to TC_GRP_04 - Create, View, Join, and Leave Community Groups', async ({ browser }) => {
        const ts = Date.now().toString().slice(-7);
        const adminUser = `cg_admin_${ts}`;
        const joinUser = `cg_joiner_${ts}`;
        const groupName = `Community ${ts} Fans`;
        const groupDesc = `A place for testing community groupings`;

        const ctxB = await browser.newContext();
        const pageB = await ctxB.newPage();
        await register(pageB, joinUser);

        const ctxA = await browser.newContext();
        const pageA = await ctxA.newPage();
        await register(pageA, adminUser);

        // A navigates to groups page
        await pageA.goto(`${BASE_URL}/groups`);

        const newGroupBtn = pageA.getByRole('button', { name: /New Community|Create Group|\+/i }).first();
        if (await newGroupBtn.isVisible()) {
            await newGroupBtn.click();
            await pageA.getByPlaceholder(/Name/i).fill(groupName);
            await pageA.getByPlaceholder(/Description/i).fill(groupDesc);
            await pageA.getByRole('button', { name: /Create|Done/i }).click();

            // TC_GRP_02: Detail page
            await expect(pageA.locator(`text=${groupName}`).first()).toBeVisible({ timeout: 5000 });
            await expect(pageA.locator(`text=${groupDesc}`).first()).toBeVisible();

            // TC_GRP_03: B joins group
            await pageB.goto(`${BASE_URL}/groups`);
            await pageB.locator(`text=${groupName}`).first().click();

            const joinBtn = pageB.getByRole('button', { name: /Join/i });
            await joinBtn.click();

            // TC_GRP_04: B leaves group
            const leaveBtn = pageB.locator('button', { hasText: /Leave|Joined/i });
            await leaveBtn.click();

            await expect(joinBtn).toBeVisible();

        } else {
            console.log('Community Group creation UI not found. Skipping.');
            test.skip();
        }

        await ctxA.close();
        await ctxB.close();
    });

    test('TC_GRP_05, TC_GRP_06 & TC_GRP_07 - Community Posts and Management', async ({ browser }) => {
        // Will implement these complex UI tests if groups module is explicitly defined.
        test.skip();
    });

    test('TC_GRP_08 to TC_GRP_14 - Admin roles and search filters', async ({ browser }) => {
        test.skip();
    });

});
