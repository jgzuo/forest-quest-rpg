/**
 * 实时监控flipX和纹理切换
 * 在游戏中直接添加监控，观察每一帧的变化
 */

import { chromium } from 'playwright';

async function monitorRealtime() {
    console.log('🔬 实时监控flipX和纹理切换\n');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 0,  // 不放慢，实时监控
    });

    const page = await browser.newPage();

    try {
        await page.goto('http://127.0.0.1:55573/index.html');
        await page.waitForTimeout(2000);

        // 注入监控代码
        await page.evaluate(() => {
            const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
            if (!scene) return;

            // 保存原始update
            const originalUpdate = scene.update.bind(scene);

            // 监控数据
            window.monitorData = {
                flipXChanges: [],
                textureChanges: [],
                frameCount: 0,
                lastFlipX: scene.player.flipX,
                lastTexture: scene.player.texture.key
            };

            // 重写update以监控
            scene.update = function() {
                window.monitorData.frameCount++;

                // 检查flipX变化
                const currentFlipX = this.player.flipX;
                if (currentFlipX !== window.monitorData.lastFlipX) {
                    window.monitorData.flipXChanges.push({
                        frame: window.monitorData.frameCount,
                        from: window.monitorData.lastFlipX,
                        to: currentFlipX,
                        position: { x: this.player.x, y: this.player.y }
                    });
                    window.monitorData.lastFlipX = currentFlipX;
                    console.log(`[FlipX变化] 帧${window.monitorData.frameCount}: ${window.monitorData.lastFlipX} → ${currentFlipX}`);
                }

                // 检查纹理变化
                const currentTexture = this.player.texture.key;
                if (currentTexture !== window.monitorData.lastTexture) {
                    window.monitorData.textureChanges.push({
                        frame: window.monitorData.frameCount,
                        from: window.monitorData.lastTexture,
                        to: currentTexture,
                        position: { x: this.player.x, y: this.player.y }
                    });
                    window.monitorData.lastTexture = currentTexture;
                    console.log(`[纹理变化] 帧${window.monitorData.frameCount}: ${window.monitorData.lastTexture} → ${currentTexture}`);
                }

                // 每60帧输出一次统计
                if (window.monitorData.frameCount % 60 === 0) {
                    console.log(`[帧统计] 已运行${window.monitorData.frameCount}帧`);
                    console.log(`  - FlipX变化次数: ${window.monitorData.flipXChanges.length}`);
                    console.log(`  - 纹理变化次数: ${window.monitorData.textureChanges.length}`);
                    console.log(`  - 当前flipX: ${currentFlipX}`);
                    console.log(`  - 当前纹理: ${currentTexture}`);
                }

                // 调用原始update
                return originalUpdate();
            };

            console.log('✅ 监控已启动！');
        });

        console.log('\n📝 监控中...');
        console.log('💡 在游戏中按WASD移动，观察控制台输出\n');

        // 模拟按键
        console.log('⌨️  模拟按W键（向上）...');
        await page.keyboard.down('KeyW');
        await page.waitForTimeout(1000);  // 持续1秒
        await page.keyboard.up('KeyW');

        await page.waitForTimeout(500);

        console.log('⌨️  模拟按A键（向左）...');
        await page.keyboard.down('KeyA');
        await page.waitForTimeout(1000);
        await page.keyboard.up('KeyA');

        await page.waitForTimeout(500);

        console.log('⌨️  模拟按D键（向右）...');
        await page.keyboard.down('KeyD');
        await page.waitForTimeout(1000);
        await page.keyboard.up('KeyD');

        await page.waitForTimeout(500);

        console.log('⌨️  模拟按S键（向下）...');
        await page.keyboard.down('KeyS');
        await page.waitForTimeout(1000);
        await page.keyboard.up('KeyS');

        await page.waitForTimeout(1000);

        // 获取监控数据
        const monitorData = await page.evaluate(() => {
            return window.monitorData;
        });

        console.log('\n📊 监控报告：');
        console.log('='.repeat(60));
        console.log(`总帧数: ${monitorData.frameCount}`);
        console.log(`FlipX变化次数: ${monitorData.flipXChanges.length}`);
        console.log(`纹理变化次数: ${monitorData.textureChanges.length}`);

        if (monitorData.flipXChanges.length > 0) {
            console.log('\nFlipX变化详情:');
            console.table(monitorData.flipXChanges.slice(0, 10));  // 只显示前10个
        }

        if (monitorData.textureChanges.length > 0) {
            console.log('\n纹理变化详情:');
            console.table(monitorData.textureChanges.slice(0, 10));
        }

        // 分析问题
        console.log('\n🔍 问题分析：');

        // 计算每秒平均变化次数
        const seconds = monitorData.frameCount / 60;
        const flipXPerSec = monitorData.flipXChanges.length / seconds;
        const texturePerSec = monitorData.textureChanges.length / seconds;

        console.log(`FlipX变化频率: ${flipXPerSec.toFixed(2)} 次/秒`);
        console.log(`纹理变化频率: ${texturePerSec.toFixed(2)} 次/秒`);

        if (flipXPerSec > 10) {
            console.error('❌ FlipX变化过于频繁！这可能导致渲染问题！');
        } else {
            console.log('✅ FlipX变化频率正常');
        }

        if (texturePerSec > 10) {
            console.error('❌ 纹理变化过于频繁！这可能导致渲染问题！');
        } else {
            console.log('✅ 纹理变化频率正常');
        }

        // 保存报告
        const fs = await import('fs');
        fs.writeFileSync('monitor_report.json', JSON.stringify(monitorData, null, 2));
        console.log('\n📄 详细报告已保存: monitor_report.json');

        console.log('\n⏳ 浏览器将保持打开5秒供手动测试...');
        await page.waitForTimeout(5000);

    } catch (error) {
        console.error('❌ 监控出错:', error.message);
        console.error(error.stack);
    } finally {
        await browser.close();
    }
}

monitorRealtime().catch(console.error);
