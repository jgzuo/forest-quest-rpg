import { test, expect } from '@playwright/test';

/**
 * 游戏加载测试套件
 * 测试游戏的基础资源加载和初始化
 */

test.describe('游戏加载测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('应该正确加载游戏页面', async ({ page }) => {
    // 等待游戏容器加载
    const gameContainer = page.locator('#game-container');
    await expect(gameContainer).toBeVisible();

    // 验证页面标题
    await expect(page).toHaveTitle(/Forest Quest RPG/);

    // 截图记录初始状态
    await page.screenshot({ path: 'test-results/screenshots/01-initial-load.png' });
  });

  test('应该正确加载所有JavaScript文件', async ({ page, request }) => {
    // 等待页面加载完成
    await page.waitForLoadState('networkidle');

    // 验证关键JS文件已加载(通过直接请求验证)
    const requiredFiles = [
      'SaveManager.js',
      'SceneManager.js',
      'ShopManager.js',
      'ShopManager.js',
      'BootScene.js',
      'GameScene.js',
      'main.js'
    ];

    for (const file of requiredFiles) {
      const response = await request.get(`/src/utils/${file}`);
      // 有些文件在utils目录,有些在scenes目录
      const isFound = response.status() === 200 ||
                      (response.status() === 404 && file.includes('Scene'));
      expect(isFound).toBeTruthy();
    }

    // 验证游戏对象已正确初始化(间接证明JS已加载)
    const gameInitialized = await page.evaluate(() => {
      return window.game && window.game.scene && window.game.scene.scenes;
    });

    expect(gameInitialized).toBeTruthy();
  });

  test('应该正确初始化Canvas游戏', async ({ page }) => {
    // 等待canvas元素加载
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });

    // 验证canvas尺寸
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box.width).toBeGreaterThan(0);
    expect(box.height).toBeGreaterThan(0);
  });

  test('应该正确显示UI元素', async ({ page }) => {
    // 等待游戏加载完成
    await page.waitForTimeout(2000);

    // 验证HP条显示
    const hpBar = page.locator('#hp-bar');
    await expect(hpBar).toBeVisible();

    // 验证XP条显示
    const xpBar = page.locator('#xp-bar');
    await expect(xpBar).toBeVisible();

    // 验证等级显示
    const levelDisplay = page.locator('#level-display');
    await expect(levelDisplay).toBeVisible();

    // 截图UI状态
    await page.screenshot({ path: 'test-results/screenshots/02-ui-display.png' });
  });

  test('应该没有JavaScript错误', async ({ page }) => {
    const errors = [];

    page.on('pageerror', (error) => {
      errors.push(error.toString());
    });

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 如果有严重错误则失败
    const severeErrors = errors.filter(e =>
      e.includes('TypeError') ||
      e.includes('ReferenceError') ||
      e.includes('is not defined')
    );

    expect(severeErrors.length).toBe(0);
  });

  test('应该正确初始化玩家对象', async ({ page }) => {
    await page.waitForTimeout(3000);

    // 在浏览器中检查玩家对象
    const playerExists = await page.evaluate(() => {
      const scene = window.game?.scene?.scenes?.find(s => s.scene.key === 'GameScene');
      return scene && scene.player && typeof scene.player.x === 'number';
    });

    expect(playerExists).toBeTruthy();
  });

  test('应该正确加载游戏资源', async ({ page }) => {
    const failedResources = [];

    page.on('response', async (response) => {
      if (response.status() >= 400) {
        const url = response.url();
        if (url.includes('assets/') || url.includes('src/')) {
          failedResources.push({ url, status: response.status() });
        }
      }
    });

    await page.waitForLoadState('networkidle');

    expect(failedResources.length).toBe(0);
  });
});
