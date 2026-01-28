#!/usr/bin/env node

/**
 * Forest Quest RPG - 自动化浏览器测试
 * 使用 Puppeteer 进行完整的游戏功能测试
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

// 测试结果记录
const testResults = {
    passed: [],
    failed: [],
    startTime: new Date(),
    errors: []
};

// 辅助函数：记录测试结果
function logTest(name, passed, details = '') {
    const result = { name, passed, details, time: new Date() };
    if (passed) {
        testResults.passed.push(result);
        console.log(`✅ ${name}`);
    } else {
        testResults.failed.push(result);
        console.log(`❌ ${name}`);
        if (details) console.log(`   详情: ${details}`);
    }
}

// 辅助函数：等待条件
function waitForCondition(page, condition, timeout = 5000) {
    return page.evaluate((cond) => {
        return new Promise((resolve) => {
            const maxTime = Date.now() + timeout;
            const check = () => {
                if (cond()) resolve(true);
                else if (Date.now() < maxTime) setTimeout(check, 100);
                else resolve(false);
            };
            check();
        });
    }, condition);
}

async function runTests() {
    console.log('🎮 Forest Quest RPG - 自动化测试启动\n');
    console.log('=' .repeat(60));

    const browser = await puppeteer.launch({
        headless: false,  // 显示浏览器窗口
        devtools: true,   // 打开开发者工具
        slowMo: 50        // 放慢操作以便观察
    });

    const page = await browser.newPage();

    // 监听控制台消息
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('error') || text.includes('Error')) {
            testResults.errors.push({
                type: 'console',
                message: text,
                time: new Date()
            });
            console.log(`🔴 控制台错误: ${text}`);
        } else if (text.includes('✅') || text.includes('🎮')) {
            console.log(`   📋 ${text}`);
        }
    });

    // 监听页面错误
    page.on('pageerror', error => {
        testResults.errors.push({
            type: 'page',
            message: error.message,
            stack: error.stack,
            time: new Date()
        });
        console.log(`🔴 页面错误: ${error.message}`);
    });

    try {
        // ========== 测试1: 页面加载 ==========
        console.log('\n📋 测试组1: 页面加载');
        console.log('-'.repeat(60));

        const response = await page.goto('http://127.0.0.1:55573', {
            waitUntil: 'networkidle2',
            timeout: 10000
        });

        logTest('页面加载成功', response.ok(), `HTTP ${response.status()}`);

        // 等待游戏容器出现
        await page.waitForSelector('#game-container', { timeout: 5000 });
        logTest('游戏容器加载', true);

        // 检查canvas元素
        const canvasExists = await page.evaluate(() => {
            return document.querySelector('#game-container canvas') !== null;
        });
        logTest('Canvas元素存在', canvasExists);

        // ========== 测试2: JavaScript初始化 ==========
        console.log('\n📋 测试组2: JavaScript初始化');
        console.log('-'.repeat(60));

        // 等待Phaser初始化
        await page.waitForTimeout(2000);

        const gameInitialized = await page.evaluate(() => {
            return typeof window.game !== 'undefined' && window.game !== null;
        });
        logTest('Phaser游戏实例初始化', gameInitialized);

        // 检查是否有JavaScript错误
        const hasErrors = testResults.errors.filter(e =>
            e.type === 'console' && e.message.includes('Uncaught')
        ).length > 0;
        logTest('无严重JavaScript错误', !hasErrors,
            hasErrors ? '发现未捕获的异常' : '');

        // ========== 测试3: 玩家角色检测 ==========
        console.log('\n📋 测试组3: 玩家角色');
        console.log('-'.repeat(60));

        // 检查玩家精灵数量（这是bug所在）
        const playerCount = await page.evaluate(() => {
            if (!window.game || !window.game.scene.scenes[0]) return 0;
            const scene = window.game.scene.scenes[0];
            if (!scene.player) return 0;

            // 计算所有type为'sprite'的子对象数量
            let count = 0;
            scene.children.each((child) => {
                if (child === scene.player) count++;
            });
            return count;
        });
        logTest('玩家角色唯一性', playerCount === 1,
            `发现 ${playerCount} 个玩家对象`);

        // 检查玩家属性
        const playerHasHealth = await page.evaluate(() => {
            const scene = window.game?.scene?.scenes[0];
            return scene && scene.player && typeof scene.player.hp === 'number';
        });
        logTest('玩家有生命值属性', playerHasHealth);

        // ========== 测试4: UI元素检测 ==========
        console.log('\n📋 测试组4: UI元素');
        console.log('-'.repeat(60));

        const uiElements = await page.evaluate(() => {
            return {
                hpBar: !!document.getElementById('hp-bar'),
                xpBar: !!document.getElementById('xp-bar'),
                levelDisplay: !!document.getElementById('level-display')
            };
        });

        logTest('生命条UI存在', uiElements.hpBar);
        logTest('经验条UI存在', uiElements.xpBar);
        logTest('等级显示存在', uiElements.levelDisplay);

        // ========== 测试5: 场景对象检测 ==========
        console.log('\n📋 测试组5: 场景对象');
        console.log('-'.repeat(60));

        const sceneObjects = await page.evaluate(() => {
            if (!window.game || !window.game.scene.scenes[0]) return {};

            const scene = window.game.scene.scenes[0];
            let npcs = 0;
            let enemies = 0;
            let chests = 0;

            scene.children.each((child) => {
                const type = child.getData && child.getData('type');
                if (type === 'npc') npcs++;
                if (child.texture && child.texture.key.includes('mole')) enemies++;
                if (child.texture && child.texture.key.includes('treant')) enemies++;
                if (type === 'chest') chests++;
            });

            return { npcs, enemies, chests };
        });

        logTest('NPC对象存在', sceneObjects.npcs > 0,
            `发现 ${sceneObjects.npcs} 个NPC`);
        logTest('敌人对象存在', sceneObjects.enemies > 0,
            `发现 ${sceneObjects.enemies} 个敌人`);
        logTest('宝箱对象存在', sceneObjects.chests > 0,
            `发现 ${sceneObjects.chests} 个宝箱`);

        // ========== 测试6: 资源加载检测 ==========
        console.log('\n📋 测试组6: 资源加载');
        console.log('-'.repeat(60));

        const textureKeys = await page.evaluate(() => {
            if (!window.game || !window.game.textures) return [];
            const tm = window.game.textures;
            const keys = [];
            tm.each((texture, key) => {
                keys.push(key);
            });
            return keys;
        });

        const requiredTextures = [
            'hero-idle-front',
            'mole-idle-front',
            'treant-idle-front',
            'gem',
            'coin'
        ];

        requiredTextures.forEach(tex => {
            const exists = textureKeys.includes(tex);
            logTest(`纹理 ${tex} 加载`, exists);
        });

        // ========== 测试7: 玩家移动测试 ==========
        console.log('\n📋 测试组7: 玩家移动模拟');
        console.log('-'.repeat(60));

        // 记录玩家初始位置
        const initialPos = await page.evaluate(() => {
            const scene = window.game?.scene?.scenes[0];
            return scene && scene.player ? { x: scene.player.x, y: scene.player.y } : null;
        });

        if (initialPos) {
            // 模拟按键 - 按下W键
            await page.keyboard.down('KeyW');
            await page.waitForTimeout(500);
            await page.keyboard.up('KeyW');

            // 等待物理更新
            await page.waitForTimeout(200);

            // 检查玩家是否移动
            const afterMove = await page.evaluate(() => {
                const scene = window.game?.scene?.scenes[0];
                return scene && scene.player ? { x: scene.player.x, y: scene.player.y } : null;
            });

            const moved = afterMove && (afterMove.y !== initialPos.y);
            logTest('玩家可以向上移动', moved,
                moved ? `从 ${initialPos.y} 到 ${afterMove.y}` : '位置未变化');

            // 再次检查玩家数量（检测bug）
            const playerCountAfterMove = await page.evaluate(() => {
                if (!window.game || !window.game.scene.scenes[0]) return 0;
                const scene = window.game.scene.scenes[0];
                let count = 0;
                scene.children.each((child) => {
                    if (child === scene.player) count++;
                });
                return count;
            });

            logTest('移动后玩家仍然唯一', playerCountAfterMove === 1,
                `发现 ${playerCountAfterMove} 个玩家对象 - ${playerCountAfterMove === 1 ? '正常' : 'BUG！'}`);
        }

        // ========== 测试8: 场景管理器检测 ==========
        console.log('\n📋 测试组8: 系统组件');
        console.log('-'.repeat(60));

        const components = await page.evaluate(() => {
            const scene = window.game?.scene?.scenes[0];
            if (!scene) return {};

            return {
                saveManager: !!scene.saveManager,
                sceneManager: !!scene.sceneManager,
                shopManager: !!scene.shopManager,
                enemies: !!scene.enemies
            };
        });

        logTest('SaveManager已初始化', components.saveManager);
        logTest('SceneManager已初始化', components.sceneManager);
        logTest('ShopManager已初始化', components.shopManager);
        logTest('敌人组已创建', components.enemies);

    } catch (error) {
        console.error('\n❌ 测试执行失败:', error.message);
        testResults.errors.push({
            type: 'execution',
            message: error.message,
            stack: error.stack
        });
    } finally {
        // 生成测试报告
        console.log('\n' + '='.repeat(60));
        console.log('📊 测试报告');
        console.log('='.repeat(60));

        const totalTests = testResults.passed.length + testResults.failed.length;
        const passRate = totalTests > 0 ? ((testResults.passed.length / totalTests) * 100).toFixed(1) : 0;

        console.log(`\n总测试数: ${totalTests}`);
        console.log(`✅ 通过: ${testResults.passed.length}`);
        console.log(`❌ 失败: ${testResults.failed.length}`);
        console.log(`📈 通过率: ${passRate}%`);

        if (testResults.errors.length > 0) {
            console.log(`\n⚠️  发现 ${testResults.errors.length} 个错误:`);
            testResults.errors.forEach((err, i) => {
                console.log(`\n${i + 1}. [${err.type}] ${err.message}`);
            });
        }

        // 保存测试结果到文件
        const reportPath = '/Users/zuojg/Downloads/AI/Code/forest-quest-rpg/test_results.json';
        fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
        console.log(`\n📄 测试结果已保存到: ${reportPath}`);

        // 如果玩家数量测试失败，给出诊断
        const playerUniquenessTest = testResults.failed.find(t =>
            t.name.includes('玩家') && t.name.includes('唯一')
        );
        if (playerUniquenessTest) {
            console.log('\n🔍 诊断: 发现玩家对象重复问题');
            console.log('建议检查:');
            console.log('  1. GameScene.create() 是否重复调用createPlayer()');
            console.log('  2. SceneManager.cleanupScene() 是否正确保留玩家');
            console.log('  3. 场景切换时是否错误地创建了新玩家');
        }

        console.log('\n' + '='.repeat(60));
        console.log('测试完成！浏览器窗口将在10秒后关闭...');
        console.log('='.repeat(60) + '\n');

        // 等待一段时间以便观察
        await page.waitForTimeout(10000);

        await browser.close();
    }
}

// 运行测试
runTests().catch(console.error);
