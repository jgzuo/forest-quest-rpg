import { test, expect } from '@playwright/test';

/**
 * 场景切换测试套件
 * 测试小镇、森林、洞穴之间的场景切换
 */

test.describe('场景切换测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
  });

  test('应该从小镇传送到森林', async ({ page }) => {
    // 初始场景应该是小镇
    const initialScene = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      return scene.sceneManager.getCurrentScene();
    });

    expect(initialScene).toBe('town');

    // 移动到森林传送点
    await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      scene.player.setPosition(700, 300);
    });

    // 等待场景切换
    await page.waitForTimeout(3000);

    // 检查当前场景
    const currentScene = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      return scene.sceneManager.getCurrentScene();
    });

    expect(currentScene).toBe('forest');

    await page.screenshot({ path: 'test-results/screenshots/13-town-to-forest.png' });
  });

  test('应该从森林传送到洞穴', async ({ page }) => {
    // 先传送到森林
    await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      scene.player.setPosition(700, 300);
    });

    await page.waitForTimeout(3000);

    // 移动到洞穴传送点
    await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      scene.player.setPosition(700, 500);
    });

    // 等待场景切换
    await page.waitForTimeout(3000);

    // 检查当前场景
    const currentScene = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      return scene.sceneManager.getCurrentScene();
    });

    expect(currentScene).toBe('cave');

    await page.screenshot({ path: 'test-results/screenshots/14-forest-to-cave.png' });
  });

  test('应该从洞穴传送回森林', async ({ page }) => {
    // 快速传送到洞穴
    await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      scene.sceneManager.switchScene('cave', { x: 100, y: 100 });
    });

    await page.waitForTimeout(3000);

    // 移动到森林传送点
    await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      scene.player.setPosition(100, 100);
    });

    // 等待场景切换
    await page.waitForTimeout(3000);

    // 检查当前场景
    const currentScene = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      return scene.sceneManager.getCurrentScene();
    });

    expect(currentScene).toBe('forest');

    await page.screenshot({ path: 'test-results/screenshots/15-cave-to-forest.png' });
  });

  test('场景切换应该有淡入淡出效果', async ({ page }) => {
    // 这个测试验证场景切换过程中的视觉效果
    const sceneSwitchTime = await page.evaluate(async () => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      const startTime = Date.now();

      scene.player.setPosition(700, 300);

      // 等待场景切换完成
      await new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (scene.sceneManager.getCurrentScene() === 'forest' &&
              !scene.sceneManager.isTransitioning) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      });

      return Date.now() - startTime;
    });

    // 场景切换应该在合理时间内完成(2-4秒)
    expect(sceneSwitchTime).toBeGreaterThan(2000);
    expect(sceneSwitchTime).toBeLessThan(5000);
  });

  test('场景切换时玩家位置应该正确', async ({ page }) => {
    // 记录小镇位置
    const townPos = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      return { x: scene.player.x, y: scene.player.y };
    });

    // 传送到森林
    await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      scene.player.setPosition(700, 300);
    });

    await page.waitForTimeout(3000);

    // 检查森林中的位置(应该从传送点出生)
    const forestPos = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      return { x: scene.player.x, y: scene.player.y };
    });

    // 玩家应该在指定的出生点
    expect(forestPos.x).toBe(100);
    expect(forestPos.y).toBe(300);
  });

  test('场景切换不应该丢失玩家对象', async ({ page }) => {
    // 多次场景切换
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
        const currentScene = scene.sceneManager.getCurrentScene();

        if (currentScene === 'town') {
          scene.player.setPosition(700, 300);
        } else if (currentScene === 'forest') {
          scene.player.setPosition(700, 500);
        } else if (currentScene === 'cave') {
          scene.player.setPosition(100, 100);
        }
      });

      await page.waitForTimeout(3000);
    }

    // 验证玩家对象仍然存在
    const playerExists = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      return scene.player && typeof scene.player.x === 'number';
    });

    expect(playerExists).toBeTruthy();
  });
});
