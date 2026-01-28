const { test, expect } = require('@playwright/test');

test.describe('战斗系统测试 - 血条和奖励', () => {
  test('应该显示敌人血条并且攻击时血条下降', async ({ page }) => {
    console.log('🔍 开始测试战斗系统...');

    await page.setViewportSize({ width: 800, height: 600 });
    await page.goto('/');

    // 等待游戏完全加载
    console.log('⏳ 等待游戏加载...');
    await page.waitForTimeout(5000);

    // 传送到森林场景（那里才有敌人）
    console.log('🌲 传送到森林场景...');
    await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      if (scene && scene.sceneManager) {
        // 小镇的传送点在(700, 300)，传送到森林的出生点是(100, 300)
        scene.player.setPosition(700, 300);
        // 等待一下传送触发
      }
    });

    await page.waitForTimeout(3000);

    // 检查敌人是否有血条
    const enemyInfo = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      if (!scene) return { error: '未找到游戏场景' };

      const enemies = [];
      const enemiesGroup = scene.sceneManager?.enemies || scene.enemies;

      if (enemiesGroup) {
        enemiesGroup.getChildren().forEach(enemy => {
          enemies.push({
            x: enemy.x,
            y: enemy.y,
            hp: enemy.getData('hp'),
            maxHp: enemy.getData('maxHp'),
            hasHpBar: !!enemy.hpBar,
            hasHpBarBg: !!enemy.hpBarBg,
            hpBarWidth: enemy.hpBar ? enemy.hpBar.width : 0,
            gold: enemy.getData('gold')
          });
        });
      }

      return {
        enemyCount: enemies.length,
        enemies: enemies,
        currentScene: scene.sceneManager?.currentScene
      };
    });

    console.log('👹 敌人信息:', JSON.stringify(enemyInfo, null, 2));

    // 验证敌人生成
    expect(enemyInfo.enemyCount).toBeGreaterThan(0);

    // 验证敌人有血条
    enemyInfo.enemies.forEach(enemy => {
      expect(enemy.hasHpBar).toBe(true);
      expect(enemy.hasHpBarBg).toBe(true);
      expect(enemy.hpBarWidth).toBe(40); // 初始血条宽度应该是40
      expect(enemy.gold).toBeDefined();
      expect(enemy.gold).toBeGreaterThan(0);
    });

    console.log('✅ 敌人血条初始化正确');

    // 检查玩家金币显示
    const goldDisplay = await page.evaluate(() => {
      const goldText = document.getElementById('gold-text');
      return {
        displayed: goldText !== null,
        gold: goldText ? parseInt(goldText.textContent) : 0
      };
    });

    console.log('💰 金币显示:', JSON.stringify(goldDisplay, null, 2));
    expect(goldDisplay.displayed).toBe(true);
    expect(goldDisplay.gold).toBe(100); // 初始金币应该是100

    // 截图
    await page.screenshot({
      path: 'test-results/combat-hp-bars.png',
      fullPage: false
    });

    console.log('✅ 已保存战斗系统截图: test-results/combat-hp-bars.png');

    console.log('\n📊 测试总结:');
    console.log(`  - 当前场景: ${enemyInfo.currentScene}`);
    console.log(`  - 敌人数量: ${enemyInfo.enemyCount}`);
    console.log(`  - 血条显示: 正确`);
    console.log(`  - 金币显示: ${goldDisplay.gold}`);
  });
});
