/**
 * 直接浏览器测试 - 玩家重复Bug调试
 * 使用Playwright自动化测试，不需要人工介入
 */

import { chromium } from 'playwright';
import fs from 'fs';

async function testPlayerBug() {
    console.log('🔍 启动浏览器自动化测试...\n');

    const browser = await chromium.launch({
        headless: false,  // 显示浏览器窗口，便于观察
        slowMo: 100,      // 放慢操作，便于观察
    });

    const context = await browser.newContext({
        viewport: { width: 1200, height: 800 }
    });

    const page = await context.newPage();

    try {
        // 监听控制台消息
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('玩家') || text.includes('create') || text.includes('Hero') || text.includes('error')) {
                console.log(`[浏览器控制台] ${text}`);
            }
        });

        // 访问游戏页面
        console.log('📄 加载游戏页面...');
        await page.goto('http://127.0.0.1:55573/index.html', {
            waitUntil: 'networkidle'
        });

        // 等待游戏初始化
        console.log('⏳ 等待游戏初始化...');
        await page.waitForTimeout(3000);

        // 截图：初始状态
        console.log('📸 截图1: 初始状态');
        await page.screenshot({
            path: 'test_screenshot_01_initial.png',
            fullPage: false
        });

        // 在浏览器中执行诊断代码
        const diagnosticResult = await page.evaluate(() => {
            const scene = window.game?.scene?.scenes?.find(s => s.scene.key === 'GameScene');
            if (!scene) return { error: 'GameScene not found' };

            let heroCount = 0;
            const heroInfo = [];
            scene.children.each((child, index) => {
                if (child.texture?.key?.startsWith('hero')) {
                    heroCount++;
                    heroInfo.push({
                        index,
                        key: child.texture.key,
                        x: Math.round(child.x),
                        y: Math.round(child.y),
                        visible: child.visible,
                        active: child.active,
                        depth: child.depth,
                        isPlayer: child === scene.player,
                        flipX: child.flipX
                    });
                }
            });

            return {
                heroCount,
                heroInfo,
                playerExists: !!scene.player,
                playerPosition: scene.player ? { x: scene.player.x, y: scene.player.y } : null,
                currentTextureKey: scene.player?.currentTextureKey,
                currentFlipX: scene.player?.currentFlipX
            };
        });

        console.log('\n📊 初始状态诊断结果:');
        console.log(JSON.stringify(diagnosticResult, null, 2));

        // 模拟按下W键（向上移动）
        console.log('\n⌨️  模拟按W键...');
        await page.keyboard.down('KeyW');
        await page.waitForTimeout(500);  // 持续500ms

        // 截图：按键状态
        console.log('📸 截图2: 按键中状态');
        await page.screenshot({
            path: 'test_screenshot_02_keydown.png',
            fullPage: false
        });

        // 在按键状态下诊断
        const keyDownResult = await page.evaluate(() => {
            const scene = window.game?.scene?.scenes?.find(s => s.scene.key === 'GameScene');
            if (!scene) return { error: 'GameScene not found' };

            let heroCount = 0;
            const heroInfo = [];
            scene.children.each((child, index) => {
                if (child.texture?.key?.startsWith('hero')) {
                    heroCount++;
                    heroInfo.push({
                        index,
                        key: child.texture.key,
                        x: Math.round(child.x),
                        y: Math.round(child.y),
                        visible: child.visible,
                        active: child.active,
                        depth: child.depth,
                        isPlayer: child === scene.player,
                        flipX: child.flipX
                    });
                }
            });

            // 检查update函数
            const updateCode = scene.update?.toString() || '';

            return {
                heroCount,
                heroInfo,
                playerPosition: scene.player ? { x: scene.player.x, y: scene.player.y } : null,
                currentTextureKey: scene.player?.currentTextureKey,
                currentFlipX: scene.player?.currentFlipX,
                hasFlipXInUpdate: updateCode.includes('flipX'),
                updateLength: updateCode.length
            };
        });

        console.log('\n📊 按键状态诊断结果:');
        console.log(JSON.stringify(keyDownResult, null, 2));

        // 释放W键
        console.log('\n⌨️  释放W键...');
        await page.keyboard.up('KeyW');
        await page.waitForTimeout(500);

        // 截图：按键释放后
        console.log('📸 截图3: 按键释放后');
        await page.screenshot({
            path: 'test_screenshot_03_keyup.png',
            fullPage: false
        });

        // 测试多个方向键
        console.log('\n⌨️  测试方向键序列...');
        const directions = [
            { key: 'KeyA', name: '左' },
            { key: 'KeyS', name: '下' },
            { key: 'KeyD', name: '右' }
        ];

        for (const dir of directions) {
            console.log(`  按${dir.name}键 (${dir.key})...`);
            await page.keyboard.down(dir.key);
            await page.waitForTimeout(300);

            const result = await page.evaluate(() => {
                const scene = window.game?.scene?.scenes?.find(s => s.scene.key === 'GameScene');
                let count = 0;
                scene.children.each(c => {
                    if (c.texture?.key?.startsWith('hero')) count++;
                });
                return { count };
            });

            console.log(`  → Hero对象数量: ${result.count}`);
            await page.screenshot({
                path: `test_screenshot_${dir.name}_keydown.png`,
                fullPage: false
            });

            await page.keyboard.up(dir.key);
            await page.waitForTimeout(300);
        }

        // 深度诊断：检查是否有多个GameScene实例
        console.log('\n🔬 深度诊断...');
        const deepDiagnostic = await page.evaluate(() => {
            const game = window.game;
            return {
                sceneCount: game?.scene?.scenes?.length || 0,
                sceneKeys: game?.scene?.scenes?.map(s => s.scene.key) || [],
                gameCanvasCount: document.querySelectorAll('canvas').length,
                allCanvasInfo: Array.from(document.querySelectorAll('canvas')).map((canvas, i) => ({
                    index: i,
                    width: canvas.width,
                    height: canvas.height,
                    display: window.getComputedStyle(canvas).display,
                    position: window.getComputedStyle(canvas).position
                }))
            };
        });

        console.log('\n📊 深度诊断结果:');
        console.log(JSON.stringify(deepDiagnostic, null, 2));

        // 分析问题
        console.log('\n🔍 问题分析:');
        console.log('================');

        if (diagnosticResult.heroCount > 1) {
            console.error('❌ 初始状态就有多个Hero对象!');
        } else {
            console.log('✅ 初始状态正常 (1个Hero)');
        }

        if (keyDownResult.heroCount > diagnosticResult.heroCount) {
            console.error(`❌ ❌ ❌ 按键后Hero数量增加: ${diagnosticResult.heroCount} → ${keyDownResult.heroCount}`);
            console.error('这是Bug! 按键时创建了新的Hero对象!');

            // 详细对比
            console.log('\n新增的Hero对象:');
            keyDownResult.heroInfo.forEach((hero, i) => {
                const existsBefore = diagnosticResult.heroInfo.some(h => h.index === hero.index);
                if (!existsBefore) {
                    console.log(`  新增 #${i}:`, hero);
                }
            });
        } else if (keyDownResult.heroCount > 1) {
            console.error(`❌ 按键时维持多个Hero对象 (${keyDownResult.heroCount}个)`);
        } else {
            console.log('✅ 按键时Hero数量正常');
        }

        // 生成测试报告
        const report = {
            timestamp: new Date().toISOString(),
            initialState: diagnosticResult,
            keyDownState: keyDownResult,
            deepDiagnostic: deepDiagnostic,
            bugDetected: keyDownResult.heroCount > diagnosticResult.heroCount || keyDownResult.heroCount > 1,
            analysis: {
                heroCountIncreased: keyDownResult.heroCount > diagnosticResult.heroCount,
                initialMultipleHeroes: diagnosticResult.heroCount > 1,
                keyDownMultipleHeroes: keyDownResult.heroCount > 1
            }
        };

        fs.writeFileSync('test_report.json', JSON.stringify(report, null, 2));
        console.log('\n📄 测试报告已保存: test_report.json');

        console.log('\n✅ 测试完成!');
        console.log('\n💡 请查看截图文件:');
        console.log('  - test_screenshot_01_initial.png (初始状态)');
        console.log('  - test_screenshot_02_keydown.png (按键中)');
        console.log('  - test_screenshot_03_keyup.png (按键后)');
        console.log('  - test_screenshot_左_keydown.png');
        console.log('  - test_screenshot_下_keydown.png');
        console.log('  - test_screenshot_右_keydown.png');

        // 保持浏览器打开5秒供观察
        console.log('\n⏳ 浏览器将保持打开5秒供观察...');
        await page.waitForTimeout(5000);

    } catch (error) {
        console.error('❌ 测试出错:', error.message);
        console.error(error.stack);
    } finally {
        await browser.close();
    }
}

// 运行测试
testPlayerBug().catch(console.error);
