import { test, expect } from '@playwright/test';

/**
 * 保存/加载测试套件
 * 测试游戏的保存和读取功能
 */

test.describe('保存/加载测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
  });

  test('应该能够快速保存游戏', async ({ page }) => {
    // 修改玩家状态
    await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      scene.player.setPosition(500, 400);
      scene.player.xp = 50;
      scene.player.hp = 80;
    });

    await page.waitForTimeout(500);

    // 按F5保存
    await page.keyboard.press('F5');
    await page.waitForTimeout(1000);

    // 检查保存提示
    const hasSaveMessage = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      let found = false;
      scene.children.each(c => {
        if (c.type === 'Text' && c.text && c.text.includes('保存')) {
          found = true;
        }
      });
      return found;
    });

    expect(hasSaveMessage).toBeTruthy();

    await page.screenshot({ path: 'test-results/screenshots/16-quick-save.png' });
  });

  test('应该能够检测存档存在', async ({ page }) => {
    // 先保存游戏
    await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      scene.player.setPosition(500, 400);
      scene.player.xp = 50;
      scene.saveManager.saveGame();
    });

    await page.waitForTimeout(1000);

    // 刷新页面
    await page.goto('/');
    await page.waitForTimeout(3000);

    // 检查是否显示加载提示
    const hasLoadPrompt = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      let found = false;
      scene.children.each(c => {
        if (c.type === 'Text' && c.text && c.text.includes('存档')) {
          found = true;
        }
      });
      return found;
    });

    expect(hasLoadPrompt).toBeTruthy();

    await page.screenshot({ path: 'test-results/screenshots/17-save-detected.png' });
  });

  test('应该能够快速加载游戏', async ({ page }) => {
    // 保存特定状态
    const savedState = {
      x: 550,
      y: 450,
      xp: 75,
      hp: 90,
      level: 2
    };

    await page.evaluate((state) => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      scene.player.setPosition(state.x, state.y);
      scene.player.xp = state.xp;
      scene.player.hp = state.hp;
      scene.player.level = state.level;
      scene.saveManager.saveGame();
    }, savedState);

    await page.waitForTimeout(1000);

    // 修改状态到不同值
    await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      scene.player.setPosition(400, 300);
      scene.player.xp = 0;
      scene.player.hp = 100;
    });

    await page.waitForTimeout(500);

    // 按F9加载
    await page.keyboard.press('F9');
    await page.waitForTimeout(1000);

    // 检查状态是否恢复
    const loadedState = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      return {
        x: scene.player.x,
        y: scene.player.y,
        xp: scene.player.xp,
        hp: scene.player.hp,
        level: scene.player.level
      };
    });

    expect(loadedState.x).toBeCloseTo(savedState.x, 0);
    expect(loadedState.y).toBeCloseTo(savedState.y, 0);
    expect(loadedState.xp).toBe(savedState.xp);
    expect(loadedState.level).toBe(savedState.level);

    await page.screenshot({ path: 'test-results/screenshots/18-quick-load.png' });
  });

  test('升级后应该自动保存', async ({ page }) => {
    // 获取初始保存时间
    const initialSaveTime = await page.evaluate(() => {
      const saves = JSON.parse(localStorage.getItem('forestQuestRPG_save') || '{}');
      return saves.timestamp;
    });

    // 让玩家升级
    await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      scene.player.xp = 100; // 足够升级
      scene.gainXP(0); // 触发升级检查
    });

    await page.waitForTimeout(1500);

    // 检查是否自动保存
    const newSaveTime = await page.evaluate(() => {
      const saves = JSON.parse(localStorage.getItem('forestQuestRPG_save') || '{}');
      return saves.timestamp;
    });

    expect(newSaveTime).not.toBe(initialSaveTime);
  });

  test('场景切换后应该自动保存', async ({ page }) => {
    const initialSaveTime = await page.evaluate(() => {
      const saves = JSON.parse(localStorage.getItem('forestQuestRPG_save') || '{}');
      return saves.timestamp;
    });

    // 切换场景
    await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      scene.player.setPosition(700, 300);
    });

    await page.waitForTimeout(3000);

    // 检查是否自动保存
    const newSaveTime = await page.evaluate(() => {
      const saves = JSON.parse(localStorage.getItem('forestQuestRPG_save') || '{}');
      return saves.timestamp;
    });

    expect(newSaveTime).not.toBe(initialSaveTime);
  });

  test('存档应该包含所有关键数据', async ({ page }) => {
    // 保存游戏
    await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      scene.saveManager.saveGame();
    });

    await page.waitForTimeout(1000);

    // 检查存档数据
    const saveData = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('forestQuestRPG_save') || '{}');
    });

    // 验证关键字段
    expect(saveData).toHaveProperty('player');
    expect(saveData.player).toHaveProperty('x');
    expect(saveData.player).toHaveProperty('y');
    expect(saveData.player).toHaveProperty('hp');
    expect(saveData.player).toHaveProperty('xp');
    expect(saveData.player).toHaveProperty('level');
    expect(saveData).toHaveProperty('currentScene');
    expect(saveData).toHaveProperty('timestamp');
  });

  test('没有存档时按F9应该显示提示', async ({ page }) => {
    // 清除存档
    await page.evaluate(() => {
      localStorage.removeItem('forestQuestRPG_save');
    });

    await page.waitForTimeout(500);

    // 按F9
    await page.keyboard.press('F9');
    await page.waitForTimeout(1000);

    // 检查错误提示
    const hasErrorMessage = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      let found = false;
      scene.children.each(c => {
        if (c.type === 'Text' && c.text && c.text.includes('未找到')) {
          found = true;
        }
      });
      return found;
    });

    expect(hasErrorMessage).toBeTruthy();
  });
});
