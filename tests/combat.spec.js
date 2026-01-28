import { test, expect } from '@playwright/test';

/**
 * 战斗系统测试套件
 * 测试玩家攻击、敌人AI、伤害计算等战斗功能
 */

// Helper function to safely get enemies from scene
async function getEnemies(page) {
  return await page.evaluate(() => {
    const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');

    // Try multiple ways to access enemies
    if (scene.sceneManager && scene.sceneManager.enemies) {
      return scene.sceneManager.enemies.getChildren();
    } else if (scene.enemies) {
      return scene.enemies.getChildren();
    } else {
      // Fallback: search all children
      const enemies = [];
      scene.children.each(c => {
        if (c.getData && c.getData('type') === 'enemy') {
          enemies.push(c);
        }
      });
      return enemies;
    }
  });
}

// Helper function to switch to forest scene
async function switchToForest(page) {
  // Directly call scene switch for more reliable testing
  await page.evaluate(() => {
    const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
    if (scene.sceneManager) {
      scene.sceneManager.switchScene('forest', { x: 100, y: 300 });
    }
  });
  await page.waitForTimeout(5000); // Wait for scene transition + fade effect
}

test.describe('战斗系统测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 等待游戏完全加载
    await page.waitForTimeout(3000);
  });

  test('森林场景应该生成敌人', async ({ page }) => {
    // 传送到森林场景
    await switchToForest(page);

    // 检查敌人数量
    const enemies = await getEnemies(page);
    const enemyCount = enemies.length;

    // 检查当前场景
    const currentScene = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      return scene.sceneManager ? scene.sceneManager.getCurrentScene() : 'unknown';
    });

    console.log(`当前场景: ${currentScene}, 敌人数量: ${enemyCount}`);

    // 验证当前场景是森林
    expect(currentScene).toBe('forest');

    // 验证有敌人生成
    expect(enemyCount).toBeGreaterThan(0);

    await page.screenshot({ path: 'test-results/screenshots/09-forest-enemies.png' });
  });

  test('玩家应该能够攻击敌人', async ({ page }) => {
    // 传送到森林
    await switchToForest(page);

    // 获取初始敌人HP
    const enemyInfo = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');

      if (scene.sceneManager && scene.sceneManager.enemies) {
        const enemyList = scene.sceneManager.enemies.getChildren();
        if (enemyList.length > 0) {
          const enemy = enemyList[0];
          // 移动玩家到敌人附近
          scene.player.setPosition(enemy.x, enemy.y - 50);
          return {
            hp: enemy.getData('hp'),
            exists: true
          };
        }
      }
      return { hp: 0, exists: false };
    });

    expect(enemyInfo.exists).toBeTruthy();
    expect(enemyInfo.hp).toBeGreaterThan(0);

    await page.waitForTimeout(1000);

    // 攻击
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);

    // 检查敌人HP是否减少
    const finalHP = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');

      if (scene.sceneManager && scene.sceneManager.enemies) {
        const enemyList = scene.sceneManager.enemies.getChildren();
        return enemyList.length > 0 ? enemyList[0].getData('hp') : 0;
      }
      return 0;
    });

    expect(finalHP).toBeLessThan(enemyInfo.hp);

    await page.screenshot({ path: 'test-results/screenshots/10-combat-attack.png' });
  });

  test('击败敌人应该获得XP', async ({ page }) => {
    // 传送到森林
    await switchToForest(page);

    // 获取初始XP并设置敌人HP为1
    const setupResult = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');

      if (scene.sceneManager && scene.sceneManager.enemies) {
        const enemyList = scene.sceneManager.enemies.getChildren();
        if (enemyList.length > 0) {
          const enemy = enemyList[0];
          // 设置敌人HP为1以便一击击败
          enemy.setData('hp', 1);
          // 移动玩家到敌人附近
          scene.player.setPosition(enemy.x, enemy.y - 50);
          return {
            initialXP: scene.player.xp,
            hasEnemy: true
          };
        }
      }
      return { initialXP: scene.player.xp, hasEnemy: false };
    });

    expect(setupResult.hasEnemy).toBeTruthy();

    await page.waitForTimeout(500);
    await page.keyboard.press('Space');
    await page.waitForTimeout(1500);

    // 检查XP是否增加
    const finalXP = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      return scene.player.xp;
    });

    expect(finalXP).toBeGreaterThan(setupResult.initialXP);

    await page.screenshot({ path: 'test-results/screenshots/11-xp-gain.png' });
  });

  test('敌人应该追踪玩家', async ({ page }) => {
    // 传送到森林
    await switchToForest(page);

    // 获取敌人初始位置
    const initialPositions = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      const positions = [];

      if (scene.sceneManager && scene.sceneManager.enemies) {
        scene.sceneManager.enemies.getChildren().forEach(enemy => {
          positions.push({ x: enemy.x, y: enemy.y });
        });
      } else if (scene.enemies) {
        scene.enemies.getChildren().forEach(enemy => {
          positions.push({ x: enemy.x, y: enemy.y });
        });
      }

      return positions;
    });

    expect(initialPositions.length).toBeGreaterThan(0);

    // 等待敌人AI更新
    await page.waitForTimeout(2000);

    // 获取敌人新位置
    const newPositions = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      const positions = [];

      if (scene.sceneManager && scene.sceneManager.enemies) {
        scene.sceneManager.enemies.getChildren().forEach(enemy => {
          positions.push({ x: enemy.x, y: enemy.y });
        });
      } else if (scene.enemies) {
        scene.enemies.getChildren().forEach(enemy => {
          positions.push({ x: enemy.x, y: enemy.y });
        });
      }

      return positions;
    });

    // 检查至少有一个敌人移动了
    let hasMovement = false;
    for (let i = 0; i < Math.min(initialPositions.length, newPositions.length); i++) {
      const distance = Math.sqrt(
        Math.pow(newPositions[i].x - initialPositions[i].x, 2) +
        Math.pow(newPositions[i].y - initialPositions[i].y, 2)
      );
      if (distance > 0) {
        hasMovement = true;
        break;
      }
    }

    expect(hasMovement).toBeTruthy();
  });

  test('玩家应该受到敌人伤害', async ({ page }) => {
    // 传送到森林
    await switchToForest(page);

    // 获取初始HP并移动到敌人附近
    const setupResult = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');

      if (scene.sceneManager && scene.sceneManager.enemies) {
        const enemyList = scene.sceneManager.enemies.getChildren();
        if (enemyList.length > 0) {
          const enemy = enemyList[0];
          // 移动玩家到敌人位置以触发碰撞
          scene.player.setPosition(enemy.x, enemy.y + 40);
          return {
            initialHP: scene.player.hp,
            hasEnemy: true
          };
        }
      }
      return { initialHP: scene.player.hp, hasEnemy: false };
    });

    expect(setupResult.hasEnemy).toBeTruthy();

    // 等待碰撞伤害
    await page.waitForTimeout(3000);

    // 检查HP是否减少
    const finalHP = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      return scene.player.hp;
    });

    expect(finalHP).toBeLessThan(setupResult.initialHP);

    await page.screenshot({ path: 'test-results/screenshots/12-player-damaged.png' });
  });
});
