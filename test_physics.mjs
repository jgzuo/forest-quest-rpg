/**
 * 深度物理系统和输入测试
 */

import { chromium } from 'playwright';

async function testPhysicsAndInput() {
    console.log('🔬 深度物理系统和输入测试\n');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 50,
    });

    const page = await browser.newPage();

    try {
        await page.goto('http://127.0.0.1:55573/index.html');
        await page.waitForTimeout(3000);

        // 详细检查物理系统
        const physicsCheck = await page.evaluate(() => {
            const scene = window.game?.scene?.scenes?.find(s => s.scene.key === 'GameScene');
            if (!scene) return { error: 'No scene' };

            const player = scene.player;

            return {
                playerExists: !!player,
                playerType: player?.type,
                hasPhysics: !!player?.body,
                physicsType: player?.body?.type,
                velocity: {
                    x: player?.body?.velocity?.x || 0,
                    y: player?.body?.velocity?.y || 0
                },
                speed: player?.speed,
                enableBody: scene.physics?.world?.enabled,
                gravity: {
                    x: scene.physics?.world?.gravity?.x || 0,
                    y: scene.physics?.world?.gravity?.y || 0
                },
                arcadePhysics: scene.physics?.config?.arcade,
                keysConfigured: {
                    cursors: !!scene.cursors,
                    wasd: !!scene.wasd
                }
            };
        });

        console.log('📊 物理系统检查:');
        console.log(JSON.stringify(physicsCheck, null, 2));

        // 截图初始状态
        await page.screenshot({ path: 'test_01_before_input.png' });

        // 测试1: 直接调用update()
        console.log('\n🧪 测试1: 手动调用update()');
        const manualUpdateResult = await page.evaluate(() => {
            const scene = window.game?.scene?.scenes?.find(s => s.scene.key === 'GameScene');

            // 模拟按键按下
            if (scene.wasd) {
                scene.wasd.up.isDown = true;
            }

            // 调用update 10次（模拟10帧）
            for (let i = 0; i < 10; i++) {
                scene.update();
            }

            const newPlayer = scene.player;

            return {
                position: { x: newPlayer.x, y: newPlayer.y },
                velocity: { x: newPlayer.body.velocity.x, y: newPlayer.body.velocity.y },
                currentTextureKey: newPlayer.currentTextureKey,
                facing: newPlayer.facing
            };
        });

        console.log('手动调用update()后:');
        console.log(JSON.stringify(manualUpdateResult, null, 2));

        await page.screenshot({ path: 'test_02_after_manual_update.png' });

        // 测试2: 使用真实的键盘事件
        console.log('\n🧪 测试2: 真实键盘事件');
        await page.keyboard.down('KeyW');
        await page.waitForTimeout(500);

        const realKeyEventResult = await page.evaluate(() => {
            const scene = window.game?.scene?.scenes?.find(s => s.scene.key === 'GameScene');
            const player = scene.player;

            // 检查键盘状态
            const wasdDown = scene.wasd?.up?.isDown;
            const cursorsDown = scene.cursors?.up?.isDown;

            // 检查玩家状态
            const isAttacking = player.isAttacking;
            const velocity = { x: player.body.velocity.x, y: player.body.velocity.y };
            const position = { x: player.x, y: player.y };

            return {
                wasdUpDown: wasdDown,
                cursorsUpDown: cursorsDown,
                isAttacking,
                velocity,
                position,
                texture: player.currentTextureKey,
                facing: player.facing
            };
        });

        console.log('真实键盘事件后:');
        console.log(JSON.stringify(realKeyEventResult, null, 2));

        await page.screenshot({ path: 'test_03_real_keyboard_event.png' });

        // 测试3: 检查是否有多个canvas或渲染层
        console.log('\n🧪 测试3: 渲染层检查');
        const renderCheck = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            const ctx = canvas?.getContext('2d');

            return {
                canvasCount: document.querySelectorAll('canvas').length,
                canvasSize: { width: canvas?.width, height: canvas?.height },
                contextExists: !!ctx,
                phaserVersion: window.Phaser?.VERSION,
                rendererType: window.game?.renderer?.type,
                gameConfig: {
                    type: window.game?.config?.type,
                    width: window.game?.config?.width,
                    height: window.game?.config?.height,
                    parent: window.game?.config?.parent
                }
            };
        });

        console.log('渲染层信息:');
        console.log(JSON.stringify(renderCheck, null, 2));

        // 测试4: 检查GameScene是否被多次创建
        console.log('\n🧪 测试4: 场景生命周期检查');
        const lifecycleCheck = await page.evaluate(() => {
            const scene = window.game?.scene?.scenes?.find(s => s.scene.key === 'GameScene');
            const sys = scene?.sys;

            return {
                sceneKey: scene?.scene.key,
                sceneActive: sys?.isActive(),
                sceneVisible: sys?.isVisible(),
                sceneStarted: sys?.settings?.status,
                displayList: scene?.children?.list?.length,
                updateList: scene?.sys?.updateList?.length,
                sceneWasRestarted: window._createCallCount > 1
            };
        });

        console.log('场景生命周期:');
        console.log(JSON.stringify(lifecycleCheck, null, 2));

        // 测试5: 检查是否有物理body可视化
        console.log('\n🧪 测试5: 物理调试检查');
        const debugCheck = await page.evaluate(() => {
            const scene = window.game?.scene?.scenes?.find(s => s.scene.key === 'GameScene');
            const config = scene?.game?.config;

            return {
                physicsDebug: config?.physics?.arcade?.debug,
                debugMode: scene?.physics?.world?.drawDebug,
                hasDebugGraphics: !!scene?.physics?.world?.debugGraphics
            };
        });

        console.log('物理调试状态:');
        console.log(JSON.stringify(debugCheck, null, 2));

        console.log('\n💡 分析结论:');

        if (realKeyEventResult.velocity.y === 0) {
            console.error('❌ 玩家没有速度！物理系统可能未正常工作');
        } else {
            console.log('✅ 玩家有速度，物理系统正常');
        }

        if (realKeyEventResult.wasdUpDown) {
            console.log('✅ 键盘输入检测正常');
        } else {
            console.error('❌ 键盘输入未检测到！输入系统有问题');
        }

        if (realKeyEventResult.isAttacking) {
            console.warn('⚠️  玩家处于攻击状态，无法移动！');
        }

        await page.waitForTimeout(3000);

    } catch (error) {
        console.error('❌ 测试出错:', error.message);
    } finally {
        await browser.close();
    }
}

testPhysicsAndInput().catch(console.error);
