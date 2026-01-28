/**
 * 自动诊断并生成详细报告
 */

import { chromium } from 'playwright';

async function autoDiagnose() {
    console.log('🔬 开始自动诊断...\n');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 100
    });

    const page = await browser.newPage();

    try {
        await page.goto('http://127.0.0.1:55573/index.html');
        await page.waitForTimeout(2000);

        // 注入debug_overlay.js的代码
        await page.evaluate(() => {
            const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
            if (!scene) return;

            // 创建监控数据
            window.diagnosticData = {
                heroCounts: [],
                flipXStates: [],
                textureKeys: [],
                timestamps: []
            };

            // 每帧记录数据
            const originalUpdate = scene.update.bind(scene);
            let frameCount = 0;

            scene.update = function() {
                frameCount++;

                // 每10帧记录一次
                if (frameCount % 10 === 0) {
                    let heroCount = 0;
                    this.children.each((child) => {
                        if (child.texture?.key?.startsWith('hero')) heroCount++;
                    });

                    window.diagnosticData.heroCounts.push(heroCount);
                    window.diagnosticData.flipXStates.push(this.player.flipX);
                    window.diagnosticData.textureKeys.push(this.player.texture.key);
                    window.diagnosticData.timestamps.push(Date.now());
                }

                return originalUpdate();
            };

            console.log('✅ 诊断监控已启动');
        });

        console.log('⏳ 测试各个方向的移动...\n');

        // 测试各个方向
        const directions = [
            { key: 'KeyW', name: '向上', duration: 1000 },
            { key: 'KeyS', name: '向下', duration: 1000 },
            { key: 'KeyA', name: '向左', duration: 1000 },
            { key: 'KeyD', name: '向右', duration: 1000 }
        ];

        for (const dir of directions) {
            console.log(`⌨️  测试${dir.name}移动...`);

            // 记录按键前的状态
            const beforeData = await page.evaluate(() => {
                const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
                let heroCount = 0;
                scene.children.each(c => {
                    if (c.texture?.key?.startsWith('hero')) heroCount++;
                });
                return {
                    heroCount,
                    flipX: scene.player.flipX,
                    texture: scene.player.texture.key,
                    position: { x: scene.player.x, y: scene.player.y }
                };
            });

            console.log(`  按键前: Hero=${beforeData.heroCount}, flipX=${beforeData.flipX}, ${beforeData.texture}`);

            // 按键
            await page.keyboard.down(dir.key);
            await page.waitForTimeout(dir.duration);

            // 记录按键中的状态
            const duringData = await page.evaluate(() => {
                const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
                let heroCount = 0;
                scene.children.each(c => {
                    if (c.texture?.key?.startsWith('hero')) heroCount++;
                });
                return {
                    heroCount,
                    flipX: scene.player.flipX,
                    texture: scene.player.texture.key,
                    position: { x: scene.player.x, y: scene.player.y }
                };
            });

            console.log(`  按键中: Hero=${duringData.heroCount}, flipX=${duringData.flipX}, ${duringData.texture}`);

            // 截图
            await page.screenshot({
                path: `diagnose_${dir.name}_moving.png`,
                fullPage: false
            });

            // 释放按键
            await page.keyboard.up(dir.key);
            await page.waitForTimeout(500);

            // 记录按键后的状态
            const afterData = await page.evaluate(() => {
                const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
                let heroCount = 0;
                scene.children.each(c => {
                    if (c.texture?.key?.startsWith('hero')) heroCount++;
                });
                return {
                    heroCount,
                    flipX: scene.player.flipX,
                    texture: scene.player.texture.key,
                    position: { x: scene.player.x, y: scene.player.y }
                };
            });

            console.log(`  按键后: Hero=${afterData.heroCount}, flipX=${afterData.flipX}, ${afterData.texture}\n`);

            // 检查是否出现多个Hero
            if (duringData.heroCount > 1) {
                console.error(`❌ ❌ ❌ ${dir.name}移动时发现${duringData.heroCount}个Hero对象！`);
            }
        }

        // 获取完整的诊断数据
        const diagnosticData = await page.evaluate(() => {
            return window.diagnosticData;
        });

        console.log('\n📊 完整诊断数据：');
        console.log('='.repeat(60));

        // 统计分析
        const uniqueCounts = [...new Set(diagnosticData.heroCounts)];
        const flipXChanges = diagnosticData.flipXStates.filter((v, i, a) => a.indexOf(v) !== i).length;
        const textureChanges = diagnosticData.textureKeys.filter((v, i, a) => a.indexOf(v) !== i).length;

        console.log(`Hero对象数量分布: ${uniqueCounts.join(', ')}`);
        console.log(`flipX状态种数: ${flipXChanges}`);
        console.log(`纹理种数: ${textureChanges}`);
        console.log(`总采样帧数: ${diagnosticData.heroCounts.length}`);

        if (uniqueCounts.includes(1) && uniqueCounts.length === 1) {
            console.log('\n✅ Hero对象数量始终是1个');
            console.log('💡 这说明"多个主角"是渲染显示问题，不是对象创建问题');
            console.log('\n🔧 可能的原因：');
            console.log('  1. 浏览器的GPU加速残影');
            console.log('  2. 显示器的响应时间/残影');
            console.log('  3. Phaser的纹理渲染缓存未清除');
            console.log('\n📝 建议的解决方案：');
            console.log('  1. 尝试禁用GPU加速（浏览器设置）');
            console.log('  2. 使用单一纹理+方向指示，而不是纹理切换');
            console.log('  3. 使用sprite sheet动画代替纹理切换');
        } else if (uniqueCounts.some(c => c > 1)) {
            console.error('\n❌ 发现多个Hero对象！');
            console.error('这是代码创建bug，需要修复！');
        }

        // 保存详细报告
        const fs = await import('fs');
        fs.writeFileSync('auto_diagnose_report.json', JSON.stringify({
            uniqueCounts,
            flipXChanges,
            textureChanges,
            totalSamples: diagnosticData.heroCounts.length,
            diagnosticData
        }, null, 2));

        console.log('\n📄 详细报告已保存: auto_diagnose_report.json');
        console.log('\n⏳ 浏览器将保持打开10秒供观察...');
        await page.waitForTimeout(10000);

    } catch (error) {
        console.error('❌ 诊断出错:', error.message);
    } finally {
        await browser.close();
    }
}

autoDiagnose().catch(console.error);
