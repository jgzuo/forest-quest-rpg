const { test, expect } = require('@playwright/test');

test.describe('NPC显示测试', () => {
  test('完整游戏画面和NPC显示检查', async ({ page }) => {
    console.log('🔍 开始完整游戏画面和NPC检查...');

    // 设置视口大小为游戏画布大小
    await page.setViewportSize({ width: 800, height: 600 });

    await page.goto('/');

    // 等待游戏完全加载
    console.log('⏳ 等待游戏加载...');
    await page.waitForTimeout(5000);

    // 检查游戏画布
    const canvasInfo = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return { error: '未找到游戏画布' };

      return {
        width: canvas.width,
        height: canvas.height,
        styleWidth: canvas.style.width,
        styleHeight: canvas.style.height
      };
    });

    console.log('📐 游戏画布信息:', JSON.stringify(canvasInfo, null, 2));

    // 截取完整游戏画面
    await page.screenshot({
      path: 'test-results/npc-full-game.png',
      fullPage: false
    });

    console.log('✅ 已保存完整游戏截图: test-results/npc-full-game.png');

    // 检查NPC数量和位置
    const npcInfo = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      if (!scene) return { error: '未找到游戏场景' };

      const npcs = [];
      scene.children.each(child => {
        if (child.texture && child.texture.key === 'npc') {
          npcs.push({
            x: child.x,
            y: child.y,
            scaleX: child.scaleX,
            scaleY: child.scaleY,
            frame: child.frame.name,
            visible: child.visible,
            alpha: child.alpha
          });
        }
      });

      return {
        npcCount: npcs.length,
        npcs: npcs
      };
    });

    console.log('👥 NPC信息:', JSON.stringify(npcInfo, null, 2));

    // 检查NPC纹理帧信息
    const textureInfo = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      if (!scene) return { error: '未找到游戏场景' };

      const npcTexture = scene.textures.get('npc');
      if (!npcTexture) return { error: '未找到NPC纹理' };

      return {
        key: npcTexture.key,
        width: npcTexture.source.width,
        height: npcTexture.source.height,
        totalFrames: npcTexture.totalFrameCount,
        frameWidth: npcTexture.width,
        frameHeight: npcTexture.height
      };
    });

    console.log('🎨 NPC纹理信息:', JSON.stringify(textureInfo, null, 2));

    // 收集控制台日志
    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('NPC') || text.includes('村长') || text.includes('商人')) {
        logs.push(text);
      }
    });

    await page.waitForTimeout(2000);

    console.log('📋 NPC相关日志:');
    logs.forEach(log => console.log(log));

    // 保存测试报告
    console.log('\n📊 测试总结:');
    console.log(`  - NPC数量: ${npcInfo.npcCount}`);
    console.log(`  - 纹理宽度: ${textureInfo.width}x${textureInfo.height}`);
    console.log(`  - 纹理总帧数: ${textureInfo.totalFrames}`);
    console.log(`  - 单帧尺寸: ${textureInfo.frameWidth}x${textureInfo.frameHeight}`);
  });
});
