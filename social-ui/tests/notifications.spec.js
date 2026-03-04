import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Notifications Module', () => {

    const register = async (page, username, password = 'Password123!') => {
        await page.goto(`${BASE_URL}/register`);
        await page.getByPlaceholder('johndoe').fill(username);
        await page.locator('input[type="email"]').fill(`${username}@examplenet.com`);
        await page.locator('input[type="password"]').fill(password);
        await page.getByRole('button', { name: /Register|Creating/i }).click();
        await page.waitForURL(`${BASE_URL}/feed`, { timeout: 10000 });
    };

    test('TC_NOTIF_01 - Like another users post -> notification appears', async ({ browser }) => {
        const ts = Date.now().toString().slice(-7);
        const author = `author_like_${ts}`;
        const liker = `liker_${ts}`;

        const authorCtx = await browser.newContext();
        const authorPage = await authorCtx.newPage();
        await register(authorPage, author);

        const postText = `Post for liking ${ts}`;
        await authorPage.getByPlaceholder("What's on your mind?").fill(postText);
        await authorPage.getByRole('button', { name: 'Post' }).click();
        await expect(authorPage.getByText(postText).first()).toBeVisible();
        await authorCtx.close();

        const likerCtx = await browser.newContext();
        const likerPage = await likerCtx.newPage();
        await register(likerPage, liker);

        await likerPage.waitForTimeout(1000);
        const postCard = likerPage.locator('div').filter({ hasText: postText }).first();
        await postCard.locator('button').filter({ hasText: /0/ }).first().click();
        await likerPage.waitForTimeout(1000);
        await likerCtx.close();

        // Check author notifications
        const authorCtx2 = await browser.newContext();
        const authorPage2 = await authorCtx2.newPage();
        await authorPage2.goto(`${BASE_URL}/login`);
        await authorPage2.getByPlaceholder('johndoe').fill(author);
        await authorPage2.locator('input[type="password"]').fill('Password123!');
        await authorPage2.getByRole('button', { name: /Login/i }).click();

        await authorPage2.waitForURL(`${BASE_URL}/feed`);
        await authorPage2.goto(`${BASE_URL}/notifications`);

        await expect(authorPage2.locator(`text=/${liker} liked your post/i`).first()).toBeVisible({ timeout: 5000 });
        await authorCtx2.close();
    });

    test('TC_NOTIF_02 - Follow a user -> follow notification created', async ({ browser }) => {
        const ts = Date.now().toString().slice(-7);
        const target = `target_fol_${ts}`;
        const follower = `follower_${ts}`;

        const targetCtx = await browser.newContext();
        const targetPage = await targetCtx.newPage();
        await register(targetPage, target);
        await targetCtx.close();

        const followerCtx = await browser.newContext();
        const followerPage = await followerCtx.newPage();
        await register(followerPage, follower);

        await followerPage.goto(`${BASE_URL}/profile/${target}`);
        await followerPage.getByRole('button', { name: /^Follow$/i }).click();
        await followerPage.waitForTimeout(1000);
        await followerCtx.close();

        const targetCtx2 = await browser.newContext();
        const targetPage2 = await targetCtx2.newPage();
        await targetPage2.goto(`${BASE_URL}/login`);
        await targetPage2.getByPlaceholder('johndoe').fill(target);
        await targetPage2.locator('input[type="password"]').fill('Password123!');
        await targetPage2.getByRole('button', { name: /Login/i }).click();

        await targetPage2.waitForURL(`${BASE_URL}/feed`);
        await targetPage2.goto(`${BASE_URL}/notifications`);

        await expect(targetPage2.locator(`text=/${follower} started following you/i`).first()).toBeVisible({ timeout: 5000 });
        await targetCtx2.close();
    });

    test('TC_NOTIF_03 - Comment on a post -> notification created', async ({ browser }) => {
        const ts = Date.now().toString().slice(-7);
        const author = `author_com_${ts}`;
        const commenter = `cmter_${ts}`;

        const authorCtx = await browser.newContext();
        const authorPage = await authorCtx.newPage();
        await register(authorPage, author);

        const postText = `Post for comment ${ts}`;
        await authorPage.getByPlaceholder("What's on your mind?").fill(postText);
        await authorPage.getByRole('button', { name: 'Post' }).click();
        await expect(authorPage.getByText(postText).first()).toBeVisible();
        await authorCtx.close();

        const commenterCtx = await browser.newContext();
        const commenterPage = await commenterCtx.newPage();
        await register(commenterPage, commenter);

        await commenterPage.waitForTimeout(1000);
        // Expand comments
        const commentToggleBtn = commenterPage.locator('div').filter({ hasText: postText }).locator('button').filter({ hasText: /0/ }).nth(1);
        await commentToggleBtn.click();
        await commenterPage.locator('input[placeholder="Write a comment..."]').fill('Nice post!');
        await commenterPage.locator('button.bg-blue-600').filter({ has: commenterPage.locator('svg.fa-paper-plane') }).or(commenterPage.getByRole('button', { name: /Post|Send/i })).first().click();
        await commenterPage.waitForTimeout(1000);
        await commenterCtx.close();

        const authorCtx2 = await browser.newContext();
        const authorPage2 = await authorCtx2.newPage();
        await authorPage2.goto(`${BASE_URL}/login`);
        await authorPage2.getByPlaceholder('johndoe').fill(author);
        await authorPage2.locator('input[type="password"]').fill('Password123!');
        await authorPage2.getByRole('button', { name: /Login/i }).click();

        await authorPage2.waitForURL(`${BASE_URL}/feed`);
        await authorPage2.goto(`${BASE_URL}/notifications`);

        await expect(authorPage2.locator(`text=/${commenter} commented on your post/i`).first()).toBeVisible({ timeout: 5000 });
        await authorCtx2.close();
    });

    test('TC_NOTIF_04 - Unread notification badge count is correct', async ({ browser }) => {
        const ts = Date.now().toString().slice(-7);
        const target = `badge_target_${ts}`;
        const actor = `actor_${ts}`;

        const targetCtx = await browser.newContext();
        const targetPage = await targetCtx.newPage();
        await register(targetPage, target);
        await targetCtx.close();

        const actorCtx = await browser.newContext();
        const actorPage = await actorCtx.newPage();
        await register(actorPage, actor);
        await actorPage.goto(`${BASE_URL}/profile/${target}`);
        await actorPage.getByRole('button', { name: /^Follow$/i }).click(); // 1 notification
        await actorCtx.close();

        const targetCtx2 = await browser.newContext();
        const targetPage2 = await targetCtx2.newPage();
        await targetPage2.goto(`${BASE_URL}/login`);
        await targetPage2.getByPlaceholder('johndoe').fill(target);
        await targetPage2.locator('input[type="password"]').fill('Password123!');
        await targetPage2.getByRole('button', { name: /Login/i }).click();
        await targetPage2.waitForURL(`${BASE_URL}/feed`);

        // Check badge on navbar
        const bellBtn = targetPage2.locator('button[title*="Notification"], button[aria-label*="Notification"], nav button').filter({ hasText: '1' }).first();
        await expect(bellBtn).toBeVisible({ timeout: 5000 });
        await targetCtx2.close();
    });

    test('TC_NOTIF_05 - Click Mark all read clears badge', async ({ browser }) => {
        const ts = Date.now().toString().slice(-7);
        const target = `target_readall_${ts}`;
        const actor = `actor_${ts}`;

        const targetCtx = await browser.newContext();
        const targetPage = await targetCtx.newPage();
        await register(targetPage, target);
        await targetCtx.close();

        const actorCtx = await browser.newContext();
        const actorPage = await actorCtx.newPage();
        await register(actorPage, actor);
        await actorPage.goto(`${BASE_URL}/profile/${target}`);
        await actorPage.getByRole('button', { name: /^Follow$/i }).click();
        await actorCtx.close();

        const targetCtx2 = await browser.newContext();
        const targetPage2 = await targetCtx2.newPage();
        await targetPage2.goto(`${BASE_URL}/login`);
        await targetPage2.getByPlaceholder('johndoe').fill(target);
        await targetPage2.locator('input[type="password"]').fill('Password123!');
        await targetPage2.getByRole('button', { name: /Login/i }).click();
        await targetPage2.waitForURL(`${BASE_URL}/feed`);

        await targetPage2.goto(`${BASE_URL}/notifications`);
        await targetPage2.getByRole('button', { name: /Mark all read|Mark all as read/i }).click();

        await targetPage2.waitForTimeout(1000);
        // The badge with number 1 should disappear
        const bellBtn = targetPage2.locator('nav button').filter({ hasText: '1' });
        await expect(bellBtn).toBeHidden({ timeout: 5000 });
        await targetCtx2.close();
    });

    test('TC_NOTIF_06 - Click individual notification -> marks as read', async ({ browser }) => {
        const ts = Date.now().toString().slice(-7);
        const target = `ind_read_${ts}`;
        const actor = `actor_${ts}`;

        const targetCtx = await browser.newContext();
        const targetPage = await targetCtx.newPage();
        await register(targetPage, target);
        await targetCtx.close();

        const actorCtx = await browser.newContext();
        const actorPage = await actorCtx.newPage();
        await register(actorPage, actor);
        await actorPage.goto(`${BASE_URL}/profile/${target}`);
        await actorPage.getByRole('button', { name: /^Follow$/i }).click();
        await actorCtx.close();

        const targetCtx2 = await browser.newContext();
        const targetPage2 = await targetCtx2.newPage();
        await targetPage2.goto(`${BASE_URL}/login`);
        await targetPage2.getByPlaceholder('johndoe').fill(target);
        await targetPage2.locator('input[type="password"]').fill('Password123!');
        await targetPage2.getByRole('button', { name: /Login/i }).click();
        await targetPage2.waitForURL(`${BASE_URL}/feed`);

        await targetPage2.goto(`${BASE_URL}/notifications`);

        // Find the unread notification and click it
        const notif = targetPage2.locator(`text=/${actor} started following you/i`);
        await notif.click();

        await targetPage2.waitForTimeout(1000);
        // Should navigate to profile
        await expect(targetPage2).toHaveURL(new RegExp(`.*\/profile\/${actor}`));

        // Badge should clear
        const bellBtn = targetPage2.locator('nav button').filter({ hasText: '1' });
        await expect(bellBtn).toBeHidden();
        await targetCtx2.close();
    });

    test('TC_NOTIF_07 - Notification links navigate to content', async ({ browser }) => {
        // Handled in TC_NOTIF_06 indirectly, let's explicitly do a post one
        const ts = Date.now().toString().slice(-7);
        const target = `link_nav_${ts}`;
        const actor = `actor_${ts}`;

        const targetCtx = await browser.newContext();
        const targetPage = await targetCtx.newPage();
        await register(targetPage, target);
        const postText = `Nav test post ${ts}`;
        await targetPage.getByPlaceholder("What's on your mind?").fill(postText);
        await targetPage.getByRole('button', { name: 'Post' }).click();
        await expect(targetPage.getByText(postText).first()).toBeVisible();
        await targetCtx.close();

        const actorCtx = await browser.newContext();
        const actorPage = await actorCtx.newPage();
        await register(actorPage, actor);
        await actorPage.waitForTimeout(1000);
        const postCard = actorPage.locator('div').filter({ hasText: postText }).first();
        await postCard.locator('button').filter({ hasText: /0/ }).first().click();
        await actorPage.waitForTimeout(1000);
        await actorCtx.close();

        const targetCtx2 = await browser.newContext();
        const targetPage2 = await targetCtx2.newPage();
        await targetPage2.goto(`${BASE_URL}/login`);
        await targetPage2.getByPlaceholder('johndoe').fill(target);
        await targetPage2.locator('input[type="password"]').fill('Password123!');
        await targetPage2.getByRole('button', { name: /Login/i }).click();

        await targetPage2.goto(`${BASE_URL}/notifications`);
        await targetPage2.locator(`text=/${actor} liked your post/i`).first().click();

        // Should navigate to single post view (assuming click on post notif routes there)
        await page.waitForTimeout(1000);
        await expect(targetPage2.url()).toContain('/post/');
        await targetCtx2.close();
    });

    test('TC_NOTIF_08 - New notification appears in real-time without refresh', async ({ browser }) => {
        const ts = Date.now().toString().slice(-7);
        const target = `target_rt_${ts}`;
        const actor = `actor_rt_${ts}`;

        const targetCtx = await browser.newContext();
        const targetPage = await targetCtx.newPage();
        await register(targetPage, target);

        const actorCtx = await browser.newContext();
        const actorPage = await actorCtx.newPage();
        await register(actorPage, actor);

        // Keep target open on feed
        await targetPage.goto(`${BASE_URL}/feed`);

        // Actor follows target
        await actorPage.goto(`${BASE_URL}/profile/${target}`);
        await actorPage.getByRole('button', { name: /^Follow$/i }).click();

        // Target should see badge update instantly (wait up to 10s for websocket)
        const bellBtn = targetPage.locator('nav button').filter({ hasText: '1' }).first();
        await expect(bellBtn).toBeVisible({ timeout: 10000 });

        await targetCtx.close();
        await actorCtx.close();
    });

});
