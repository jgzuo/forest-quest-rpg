const { test, expect } = require('@playwright/test');

test.describe('综合战斗系统测试', () => {
  test('验证NPC显示和战斗系统完整功能', async ({ page }) => {
    console.log('🔍 开始综合测试...');

    await page.setViewportSize({ width: 800, height: 600 });
    await page.goto('/');

    console.log('⏳ 等待游戏加载...');
    await page.waitForTimeout(5000);

    // ========== 测试1：验证小镇NPC显示 ==========
    console.log('\n📋 测试1: 验证小镇NPC');
    const townInfo = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      if (!scene) return { error: '未找到游戏场景' };

      const npcs = [];
      scene.children.each(child => {
        if (child.texture && child.texture.key === 'npc') {
          // 安全地获取NPC数据
          const name = child.getData('name');
          const id = child.getData('id');
          npcs.push({
            x: child.x,
            y: child.y,
            name: name || 'Unknown',
            id: id || 'unknown',
            scaleX: child.scaleX,
            scaleY: child.scaleY
          });
        }
      });

      return {
        sceneName: scene.sceneManager?.currentScene,
        npcCount: npcs.length,
        npcs: npcs
      };
    });

    console.log('📍 小镇场景NPC信息:', JSON.stringify(townInfo, null, 2));

    // 验证小镇有且只有2个NPC
    expect(townInfo.sceneName).toBe('town');
    expect(townInfo.npcCount).toBe(2);

    // 验证两个不同的NPC
    const npcNames = townInfo.npcs.map(npc => npc.name);
    expect(npcNames).toContain('村长');
    expect(npcNames).toContain('商人');

    // 验证NPC使用单一图片（scaleX = scaleY，没有翻转）
    townInfo.npcs.forEach(npc => {
      expect(npc.scaleX).toBe(npc.scaleY);
    });

    console.log('✅ 小镇NPC显示正确：2个不同NPC，每个只显示一个方向');

    // 截图小镇场景
    await page.screenshot({
      path: 'test-results/town-npcs.png',
      fullPage: false
    });

    // ========== 测试2：传送到森林场景测试战斗 ==========
    console.log('\n🌲 测试2: 传送到森林测试战斗');
    await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      if (scene && scene.player) {
        scene.player.setPosition(700, 300); // 移动到传送点
      }
    });

    await page.waitForTimeout(3000); // 等待传送完成

    // 验证场景切换
    const sceneInfo = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      return {
        currentScene: scene.sceneManager?.currentScene,
        playerX: scene.player.x,
        playerY: scene.player.y
      };
    });

    console.log('🌲 森林场景信息:', JSON.stringify(sceneInfo, null, 2));
    expect(sceneInfo.currentScene).toBe('forest');

    // ========== 测试3：验证敌人生成和血条 ==========
    console.log('\n👹 测试3: 验证敌人和血条');
    const enemyInfo = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      const enemies = [];
      const enemiesGroup = scene.sceneManager?.enemies || scene.enemies;

      if (enemiesGroup) {
        enemiesGroup.getChildren().forEach(enemy => {
          enemies.push({
            hp: enemy.getData('hp'),
            maxHp: enemy.getData('maxHp'),
            gold: enemy.getData('gold'),
            xp: enemy.getData('xp'),
            hasHpBar: !!enemy.hpBar,
            hpBarWidth: enemy.hpBar ? enemy.hpBar.width : 0
          });
        });
      }

      return {
        enemyCount: enemies.length,
        enemies: enemies
      };
    });

    console.log('👹 敌人信息:', JSON.stringify(enemyInfo, null, 2));

    // 验证敌人生成
    expect(enemyInfo.enemyCount).toBeGreaterThan(0);

    // 验证每个敌人都有血条和奖励
    enemyInfo.enemies.forEach(enemy => {
      expect(enemy.hasHpBar).toBe(true);
      expect(enemy.hpBarWidth).toBe(40); // 初始血条宽度
      expect(enemy.gold).toBeGreaterThan(0);
      expect(enemy.xp).toBeGreaterThan(0);
    });

    console.log('✅ 所有敌人都有血条和奖励配置');

    // ========== 测试4：验证玩家金币和经验UI ==========
    console.log('\n💰 测试4: 验证玩家状态UI');
    const playerInfo = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      const goldText = document.getElementById('gold-text');
      const hpText = document.getElementById('hp-text');
      const xpText = document.getElementById('xp-text');
      const levelText = document.getElementById('level-text');

      return {
        gold: goldText ? parseInt(goldText.textContent) : 0,
        hp: scene.player.hp,
        maxHp: scene.player.maxHp,
        xp: scene.player.xp,
        xpToNextLevel: scene.player.xpToNextLevel,
        level: scene.player.level
      };
    });

    console.log('👤 玩家信息:', JSON.stringify(playerInfo, null, 2));

    // 验证初始状态
    expect(playerInfo.gold).toBe(100); // 初始金币
    expect(playerInfo.level).toBe(1); // 初始等级
    expect(playerInfo.hp).toBe(100); // 初始HP

    console.log('✅ 玩家初始状态正确');

    // 截图森林场景
    await page.screenshot({
      path: 'test-results/forest-combat.png',
      fullPage: false
    });

    console.log('\n📊 测试总结:');
    console.log(`  ✅ 小镇NPC: ${townInfo.npcCount}个 (${npcNames.join(', ')})`);
    console.log(`  ✅ 森林敌人: ${enemyInfo.enemyCount}个`);
    console.log(`  ✅ 玩家金币: ${playerInfo.gold}G`);
    console.log(`  ✅ 玩家等级: Lv.${playerInfo.level}`);
    console.log('\n🎉 所有测试通过！');
  });
});
