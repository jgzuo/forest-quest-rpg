/**
 * 玩家重复bug调试脚本
 * 直接在游戏页面的浏览器控制台运行此脚本
 * 不使用iframe，避免跨域问题
 */

(function() {
    console.log('='.repeat(60));
    console.log('🔍 开始深入诊断玩家重复问题');
    console.log('='.repeat(60));

    // 获取场景
    const scene = game?.scene?.scenes?.find(s => s.scene.key === 'GameScene');
    if (!scene) {
        console.error('❌ GameScene未找到');
        console.log('当前场景列表:', game?.scene?.scenes?.map(s => s.scene.key));
        return;
    }

    console.log('✅ GameScene已找到');
    console.log('场景key:', scene.scene.key);

    // 1. 检查玩家对象
    console.log('\n📊 步骤1: 检查scene.player引用');
    console.log('scene.player:', scene.player);
    console.log('scene.player类型:', scene.player?.type);
    console.log('scene.player位置:', scene.player ? { x: scene.player.x, y: scene.player.y } : null);

    // 2. 统计所有hero纹理的对象
    console.log('\n📊 步骤2: 统计所有使用hero纹理的对象');
    let heroSpriteCount = 0;
    const heroSprites = [];

    scene.children.each((child) => {
        if (child.texture?.key?.startsWith('hero')) {
            heroSpriteCount++;
            heroSprites.push({
                key: child.texture.key,
                x: child.x,
                y: child.y,
                visible: child.visible,
                active: child.active,
                depth: child.depth,
                isPlayer: child === scene.player
            });
        }
    });

    console.log(`Hero纹理对象总数: ${heroSpriteCount}`);
    if (heroSpriteCount > 1) {
        console.error('🐛 BUG确认: 发现多个使用hero纹理的对象!');
        console.table(heroSprites);
    } else {
        console.log('✅ 只有一个hero纹理对象');
    }

    // 3. 检查是否有多个相同的玩家位置
    console.log('\n📊 步骤3: 检查玩家对象引用次数');
    let playerRefCount = 0;
    scene.children.each((child) => {
        if (child === scene.player) {
            playerRefCount++;
        }
    });
    console.log(`scene.player在children中的引用次数: ${playerRefCount}`);

    if (playerRefCount > 1) {
        console.error('🐛 发现多个player引用!');
    } else if (playerRefCount === 0) {
        console.warn('⚠️ player不在children中!');
    }

    // 4. 检查场景对象总数
    console.log('\n📊 步骤4: 场景对象统计');
    const stats = {
        total: scene.children.list.length,
        sprite: 0,
        image: 0,
        text: 0,
        graphics: 0,
        container: 0,
        other: 0
    };

    scene.children.each((child) => {
        const type = child.type || 'unknown';
        if (stats[type] !== undefined) {
            stats[type]++;
        } else if (type === 'unknown') {
            stats.other++;
        }
    });

    console.table(stats);

    // 5. 检查update函数
    console.log('\n📊 步骤5: 检查update函数');
    console.log('update存在:', typeof scene.update === 'function');
    console.log('update长度:', scene.update?.toString()?.length || 0);

    // 检查update中的可疑代码
    const updateCode = scene.update?.toString() || '';
    const hasCreateSprite = updateCode.includes('physics.add.sprite');
    const hasAddImage = updateCode.includes('add.image');
    const hasPlayerAssignment = updateCode.includes('this.player =');

    console.log('update中是否包含physics.add.sprite:', hasCreateSprite);
    console.log('update中是否包含add.image:', hasAddImage);
    console.log('update中是否包含this.player =', hasPlayerAssignment);

    if (hasCreateSprite || hasAddImage || hasPlayerAssignment) {
        console.error('🐛 update函数中发现可疑代码!');
        console.log('这些操作不应该在update()中执行!');
    }

    // 6. 检查GameScene.create是否被多次调用
    console.log('\n📊 步骤6: 检查create调用次数');
    if (!window._createCallCount) {
        window._createCallCount = 0;
        const originalCreate = scene.create;
        scene.create = function() {
            window._createCallCount++;
            console.log(`🔄 create()被调用，第${window._createCallCount}次`);
            console.trace('调用堆栈:');
            return originalCreate.apply(this, arguments);
        };
        console.log('✅ 已监控create()调用，请刷新页面或触发场景重新创建');
    } else {
        console.log(`create()已被调用${window._createCallCount}次`);
        if (window._createCallCount > 1) {
            console.error('🐛 create()被多次调用!');
        }
    }

    // 7. 测试移动并监控
    console.log('\n📊 步骤7: 移动测试');
    if (scene.player) {
        const beforeX = scene.player.x;
        const beforeY = scene.player.y;
        console.log('移动前:', { x: beforeX, y: beforeY });

        // 模拟按键
        console.log('模拟按W键（向上移动）...');
        const wKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        wKey.isDown = true;

        setTimeout(() => {
            wKey.isDown = false;

            setTimeout(() => {
                const afterX = scene.player.x;
                const afterY = scene.player.y;
                console.log('移动后:', { x: afterX, y: afterY });

                if (afterY !== beforeY) {
                    console.log('✅ 玩家移动了', afterY - beforeY, '像素');

                    // 移动后再次检查hero对象数量
                    let afterMoveHeroCount = 0;
                    scene.children.each((child) => {
                        if (child.texture?.key?.startsWith('hero')) {
                            afterMoveHeroCount++;
                        }
                    });

                    console.log(`移动后hero对象数量: ${afterMoveHeroCount}`);
                    if (afterMoveHeroCount > heroSpriteCount) {
                        console.error(`🐛 🐛 🐛 严重BUG! 移动后hero对象从${heroSpriteCount}增加到${afterMoveHeroCount}!`);
                        console.error('这说明移动过程中创建了新的hero对象!');
                    } else if (afterMoveHeroCount > 1) {
                        console.error('🐛 移动前后都有多个hero对象');
                    }
                } else {
                    console.warn('⚠️ 玩家未移动');
                }

                console.log('\n✅ 诊断完成!');
                console.log('='.repeat(60));

                // 给出建议
                if (heroSpriteCount > 1 || afterMoveHeroCount > 1) {
                    console.log('\n🔧 修复建议:');
                    console.log('1. 确认createPlayer()只被调用一次');
                    console.log('2. 检查是否有代码在其他地方创建了hero纹理的对象');
                    console.log('3. 检查SceneManager.cleanupScene()是否正确清理');
                    console.log('4. 搜索所有"hero-idle"或"hero-walk"纹理的使用');
                    console.log('5. 检查是否有动画系统在创建新对象而不是切换纹理');
                }
            }, 500);
        }, 500);
    }

    // 8. 监控纹理切换
    console.log('\n📊 步骤8: 监控纹理切换');
    if (!window._textureChangeCount) {
        window._textureChangeCount = 0;
        const originalSetTexture = Phaser.GameObjects.Sprite.prototype.setTexture;
        Phaser.GameObjects.Sprite.prototype.setTexture = function(key, frame) {
            if (this.texture?.key?.startsWith('hero')) {
                window._textureChangeCount++;
                if (window._textureChangeCount <= 10) {
                    console.log(`🎨 纹理切换#${window._textureChangeCount}: ${this.texture.key} → ${key}`);
                }
            }
            return originalSetTexture.apply(this, arguments);
        };
        console.log('✅ 已开始监控纹理切换');
    } else {
        console.log(`已监控到${window._textureChangeCount}次纹理切换`);
    }

    console.log('\n💡 提示: 按方向键移动角色，观察是否有新的hero对象被创建');
    console.log('💡 运行完诊断后，检查浏览器控制台的完整输出');
})();
