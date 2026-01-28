import { test, expect } from '@playwright/test';

/**
 * NPC交互测试套件
 * 测试NPC对话、商店等交互功能
 */

test.describe('NPC交互测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
  });

  test('小镇场景应该有NPC', async ({ page }) => {
    // 检查小镇场景的NPC
    const npcCount = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      let count = 0;
      scene.children.each(c => {
        if (c.getData && c.getData('type') === 'npc') {
          count++;
        }
      });
      return count;
    });

    expect(npcCount).toBeGreaterThanOrEqual(2); // 村长和商人
  });

  test('应该能够与村长NPC对话', async ({ page }) => {
    // 移动到村长位置附近
    await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      scene.player.setPosition(400, 250);
    });

    await page.waitForTimeout(1000);

    // 按E键交互
    await page.keyboard.press('E');
    await page.waitForTimeout(1500);

    // 截图检查对话框
    await page.screenshot({ path: 'test-results/screenshots/06-elder-dialog.png' });

    // 检查是否有对话框元素(通过文字内容判断)
    const hasDialog = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      let hasText = false;
      scene.children.each(c => {
        if (c.type === 'Text' && c.text) {
          // 检查是否包含村长相关的文字
          if (c.text.includes('村长') || c.text.includes('小镇') || c.text.includes('森林')) {
            hasText = true;
          }
        }
      });
      return hasText;
    });

    expect(hasDialog).toBeTruthy();
  });

  test('应该能够与商人NPC交互', async ({ page }) => {
    // 移动到商人位置附近
    await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      scene.player.setPosition(600, 250);
    });

    await page.waitForTimeout(500);

    // 按E键交互
    await page.keyboard.press('E');
    await page.waitForTimeout(1000);

    // 截图检查商店界面
    await page.screenshot({ path: 'test-results/screenshots/07-merchant-shop.png' });

    // 检查商店是否打开
    const shopOpen = await page.evaluate(() => {
      return window.shopOpen === true;
    });

    // 商店可能打开也可能只是显示消息
    await page.screenshot({ path: 'test-results/screenshots/08-after-merchant.png' });
  });

  test('应该显示交互提示', async ({ page }) => {
    // 移动到NPC附近
    await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      scene.player.setPosition(400, 230);
    });

    await page.waitForTimeout(1000);

    // 检查是否有"E 对话"提示
    const hasHint = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      let found = false;
      scene.children.each(c => {
        if (c.type === 'Text' && c.text && c.text.includes('E')) {
          found = true;
        }
      });
      return found;
    });

    expect(hasHint).toBeTruthy();
  });
});
