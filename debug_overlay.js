/**
 * 可视化调试面板
 * 在游戏画面上实时显示Hero对象信息
 * 在浏览器控制台运行此脚本
 */

(function() {
    console.log('🔍 启动可视化调试面板...\n');

    const scene = game.scene.scenes.find(s => s.scene.key === 'GameScene');
    if (!scene) {
        console.error('❌ GameScene未找到');
        return;
    }

    // 创建调试面板背景
    const panelBg = scene.add.rectangle(650, 150, 280, 200, 0x1a1a2e, 0.95);
    panelBg.setDepth(9999);
    panelBg.setScrollFactor(0);  // 固定在屏幕上

    // 创建调试文本
    const debugText = scene.add.text(520, 60, '', {
        font: '14px Courier New',
        fill: '#00ff00',
        lineSpacing: 5
    });
    debugText.setDepth(10000);
    debugText.setScrollFactor(0);

    // 创建高亮框（用于标记玩家）
    const highlightBox = scene.add.rectangle(0, 0, 100, 100, 0xff0000, 0.3);
    highlightBox.setStrokeStyle(3, 0xff0000);
    highlightBox.setDepth(9998);
    highlightBox.setVisible(false);

    // 监控循环
    let frameCount = 0;
    let heroCount = 0;

    const updateMonitor = () => {
        frameCount++;

        // 统计Hero对象
        heroCount = 0;
        const heroInfo = [];

        scene.children.each((child) => {
            if (child.texture?.key?.startsWith('hero')) {
                heroCount++;
                heroInfo.push({
                    key: child.texture.key,
                    x: Math.round(child.x),
                    y: Math.round(child.y),
                    isPlayer: child === scene.player,
                    flipX: child.flipX,
                    visible: child.visible,
                    alpha: child.alpha
                });
            }
        });

        // 更新高亮框位置
        if (scene.player) {
            highlightBox.setPosition(scene.player.x, scene.player.y);
            highlightBox.setVisible(true);
        }

        // 每10帧更新一次文本（避免闪烁）
        if (frameCount % 10 === 0) {
            const player = scene.player;
            const velocity = player?.body?.velocity || { x: 0, y: 0 };

            let statusText = `🔍 实时调试面板\n`;
            statusText += `═`.repeat(25) + `\n`;
            statusText += `📊 Hero对象: ${heroCount} 个\n`;
            statusText += `📍 玩家位置: (${Math.round(player?.x || 0)}, ${Math.round(player?.y || 0)})\n`;
            statusText += `🔄 速度: (${Math.round(velocity.x)}, ${Math.round(velocity.y)})\n`;
            statusText += `🎭 纹理: ${player?.texture?.key || 'N/A'}\n`;
            statusText += `🔃 flipX: ${player?.flipX ? 'TRUE' : 'FALSE'}\n`;
            statusText += `👥 面向: ${player?.facing || 'N/A'}\n`;
            statusText += `⚔️  攻击中: ${player?.isAttacking ? '是' : '否'}\n`;
            statusText += `\n`;
            statusText += `⚠️  ${heroCount > 1 ? '发现多个Hero对象!' : '正常'}`;
            statusText += `\n`;

            debugText.setText(statusText);
        }

        // 继续循环
        if (scene.isActive()) {
            scene.time.delayedCall(16, updateMonitor);  // ~60fps
        }
    };

    // 启动监控
    updateMonitor();

    console.log('✅ 调试面板已启动！');
    console.log('💡 屏幕右上角会显示实时信息');
    console.log('💡 红色框标记玩家位置');
    console.log('💡 按WASD移动，观察Hero对象数量\n');

    // 添加键盘监听来记录按键事件
    const keyLog = [];
    const keys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

    keys.forEach(keyCode => {
        scene.input.keyboard.on(`keydown-${keyCode}`, (event) => {
            const log = `⬇️  按下: ${event.code}`;
            console.log(log);
            keyLog.push({ time: Date.now(), event: 'down', key: event.code });
        });

        scene.input.keyboard.on(`keyup-${keyCode}`, (event) => {
            const log = `⬆️  释放: ${event.code}`;
            console.log(log);
            keyLog.push({ time: Date.now(), event: 'up', key: event.code });
        });
    });

    console.log('✅ 键盘监听已启动');
    console.log('💡 按键事件会在控制台显示\n');

    // 5秒后检查状态
    scene.time.delayedCall(5000, () => {
        console.log('📊 5秒状态报告:');
        console.log(`  - 总按键事件: ${keyLog.length}`);
        console.log(`  - 当前Hero数量: ${heroCount}`);
        console.log(`  - 玩家位置: (${scene.player.x}, ${scene.player.y})`);
        console.log(`  - 玩家flipX: ${scene.player.flipX}`);
        console.log(`  - 玩家纹理: ${scene.player.texture.key}\n`);

        if (heroCount > 1) {
            console.error('🐛 警告: 发现多个Hero对象！');
            console.error('详细信息:', heroInfo);
        } else {
            console.log('✅ Hero对象数量正常 (1个)');
        }
    });

    // 返回清理函数
    window.stopDebugMonitor = () => {
        panelBg.destroy();
        debugText.destroy();
        highlightBox.destroy();
        console.log('🛑 调试面板已停止');
    };

    console.log('💡 停止监控: 运行 stopDebugMonitor()\n');
})();
