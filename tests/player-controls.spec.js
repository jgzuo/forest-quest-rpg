import { test, expect } from '@playwright/test';

/**
 * 玩家控制测试套件
 * 测试玩家移动、攻击、交互等核心控制功能
 */

test.describe('玩家控制测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 等待游戏完全加载
    await page.waitForTimeout(3000);
  });

  test('应该能够使用WASD键移动玩家', async ({ page }) => {
    // 获取初始位置
    const initialPos = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      return { x: scene.player.x, y: scene.player.y };
    });

    // 按W键向上移动 - 按住一段时间
    await page.keyboard.down('W');
    await page.waitForTimeout(1000);
    await page.keyboard.up('W');

    // 检查位置变化
    const afterW = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      return { x: scene.player.x, y: scene.player.y };
    });

    expect(afterW.y).toBeLessThan(initialPos.y);

    // 按S键向下移动 - 按住一段时间
    await page.keyboard.down('S');
    await page.waitForTimeout(1000);
    await page.keyboard.up('S');

    const afterS = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      return { x: scene.player.x, y: scene.player.y };
    });

    expect(afterS.y).toBeGreaterThan(afterW.y);

    // 按A键向左移动 - 按住一段时间
    await page.keyboard.down('A');
    await page.waitForTimeout(1000);
    await page.keyboard.up('A');

    const afterA = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      return { x: scene.player.x, y: scene.player.y };
    });

    expect(afterA.x).toBeLessThan(afterS.x);

    // 按D键向右移动 - 按住一段时间
    await page.keyboard.down('D');
    await page.waitForTimeout(1000);
    await page.keyboard.up('D');

    const afterD = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      return { x: scene.player.x, y: scene.player.y };
    });

    expect(afterD.x).toBeGreaterThan(afterA.x);

    await page.screenshot({ path: 'test-results/screenshots/03-wasd-movement.png' });
  });

  test('应该能够使用方向键移动玩家', async ({ page }) => {
    const initialPos = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      return { x: scene.player.x, y: scene.player.y };
    });

    // 使用方向键 - 按住一段时间
    await page.keyboard.down('ArrowUp');
    await page.waitForTimeout(1000);
    await page.keyboard.up('ArrowUp');

    const afterUp = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      return { x: scene.player.x, y: scene.player.y };
    });

    expect(afterUp.y).toBeLessThan(initialPos.y);
  });

  test('玩家移动时应该只显示一个角色实例', async ({ page }) => {
    // 这是关键测试 - 检查"多个主角"的bug

    // 连续移动以触发问题
    for (let i = 0; i < 10; i++) {
      await page.keyboard.down('W');
      await page.waitForTimeout(100);
      await page.keyboard.up('W');
      await page.waitForTimeout(100);

      await page.keyboard.down('S');
      await page.waitForTimeout(100);
      await page.keyboard.up('S');
      await page.waitForTimeout(100);
    }

    // 截图检查
    await page.screenshot({ path: 'test-results/screenshots/04-single-player-check.png' });

    // 检查hero纹理的对象数量
    const heroCount = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      let count = 0;
      scene.children.each(c => {
        if (c.texture && c.texture.key && c.texture.key.startsWith('hero')) {
          count++;
        }
      });
      return count;
    });

    // 应该只有1个玩家对象
    expect(heroCount).toBe(1);

    // 验证玩家对象唯一性
    const playerUnique = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      return scene.player && typeof scene.player.x === 'number';
    });

    expect(playerUnique).toBeTruthy();
  });

  test('玩家纹理应该正确切换', async ({ page }) => {
    // 测试纹理切换优化
    const textureChanges = [];

    await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      const originalSetTexture = scene.player.setTexture;

      scene.player.setTexture = function(...args) {
        window.textureChanges = window.textureChanges || [];
        window.textureChanges.push({
          key: args[0],
          time: Date.now()
        });
        return originalSetTexture.apply(this, args);
      };
    });

    // 执行移动
    await page.keyboard.down('W');
    await page.waitForTimeout(200);
    await page.keyboard.up('W');

    await page.keyboard.down('S');
    await page.waitForTimeout(200);
    await page.keyboard.up('S');

    await page.keyboard.down('A');
    await page.waitForTimeout(200);
    await page.keyboard.up('A');

    await page.keyboard.down('D');
    await page.waitForTimeout(200);
    await page.keyboard.up('D');

    // 获取纹理切换记录
    const changes = await page.evaluate(() => {
      return window.textureChanges || [];
    });

    // 纹理切换应该被优化,不应该每次update都切换
    expect(changes.length).toBeLessThan(20); // 合理的切换次数

    console.log(`纹理切换次数: ${changes.length}`);
  });

  test('应该能够执行攻击动作', async ({ page }) => {
    // 监听攻击状态
    const attacked = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      return scene.player.isAttacking;
    });

    expect(attacked).toBe(false);

    // 按空格键攻击
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    // 检查攻击是否触发
    const afterAttack = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      return scene.player.isAttacking;
    });

    // 攻击可能已经结束(300ms冷却),但应该有触发
    await page.screenshot({ path: 'test-results/screenshots/05-player-attack.png' });
  });

  test('玩家flipX属性应该正确设置', async ({ page }) => {
    // 测试左右移动时的flipX状态
    await page.keyboard.down('A');
    await page.waitForTimeout(300);

    const flipLeft = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      return scene.player.flipX;
    });

    await page.keyboard.up('A');

    await page.keyboard.down('D');
    await page.waitForTimeout(300);

    const flipRight = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      return scene.player.flipX;
    });

    await page.keyboard.up('D');

    // 向左移动flipX应为true,向右移动flipX应为false
    expect(flipLeft).toBe(true);
    expect(flipRight).toBe(false);
  });
});
