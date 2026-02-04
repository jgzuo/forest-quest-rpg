/**
 * SceneManager - 场景管理器
 * 负责管理游戏场景的加载和切换
 */
class SceneManager {
    constructor(scene) {
        this.scene = scene;
        this.currentScene = 'town';
        this.playerSpawnPoint = { x: 400, y: 300 };
        this.isTransitioning = false;  // 防止场景切换时的频闪
        this.lastTeleportTime = 0;  // 记录上次传送时间，防止死循环
        this.TELEPORT_COOLDOWN = 2000;  // 传送冷却时间（毫秒）

        // 新增：防止出生点在传送区域内立即触发返回
        this.recentlyTeleported = false;  // 是否刚传送过来
        this.teleportCounter = 0;  // 传送点计数器，用于生成唯一ID
        this.activeTeleports = [];  // 存储所有传送点引用

        // 新增：NPC管理器 - 用于可靠地跟踪和交互NPC
        this.npcs = [];  // 存储所有NPC对象的数组
        this.chests = [];  // 存储所有宝箱对象的数组
    }

    /**
     * 切换到指定场景
     * @param {string} sceneName - 场景名称 ('town', 'forest', 'cave')
     * @param {object} spawnPoint - 玩家出生点 {x, y}
     */
    switchScene(sceneName, spawnPoint = null) {
        const now = Date.now();

        // 防止重复切换场景
        if (this.isTransitioning) {
            console.log('⏸️ 场景切换中，忽略重复调用');
            return;
        }

        // 防止传送死循环（检查冷却时间）
        if (now - this.lastTeleportTime < this.TELEPORT_COOLDOWN) {
            console.log(`⏸️ 传送冷却中，还需等待 ${this.TELEPORT_COOLDOWN - (now - this.lastTeleportTime)}ms`);
            return;
        }

        this.lastTeleportTime = now;
        this.isTransitioning = true;
        console.log(`🔄 切换场景: ${this.currentScene} → ${sceneName}`);

        // 暂停游戏，防止敌人攻击和玩家移动
        this.scene.physics.pause();

        // 保存当前场景信息
        const previousScene = this.currentScene;

        // 设置新场景
        this.currentScene = sceneName;

        // 设置玩家出生点
        if (spawnPoint) {
            this.playerSpawnPoint = spawnPoint;
        }

        // 创建淡出效果
        this.createTransition(() => {
            // 清理当前场景对象
            this.cleanupScene();

            // 加载新场景
            this.loadScene(sceneName);

            // 更新场景名称显示
            if (this.scene.updateSceneIndicator) {
                this.scene.updateSceneIndicator(sceneName);
            }

            // 设置玩家位置
            if (this.scene.player) {
                this.scene.player.setPosition(
                    this.playerSpawnPoint.x,
                    this.playerSpawnPoint.y
                );
                console.log(`📍 玩家位置设置为: (${this.playerSpawnPoint.x}, ${this.playerSpawnPoint.y})`);
            }

            // 自动保存游戏
            if (this.scene.saveManager) {
                console.log('💾 [Scene Switch] Triggering auto-save...');
                const saveSuccess = this.scene.saveManager.autoSave();
                console.log(`💾 [Scene Switch] Auto-save result: ${saveSuccess}`);
            } else {
                console.warn('⚠️ [Scene Switch] SaveManager not found!');
            }

            // 淡入效果（从黑色淡入到正常，更快）
            this.scene.cameras.main.resetFX();
            this.scene.cameras.main.fadeIn(300, 0, 0, 0);

            // 标记玩家刚传送过来，防止立即触发返回传送
            this.recentlyTeleported = true;
            console.log('🚀 玩家刚传送过来，需要离开传送区域后再回来才能触发返回');

            // 场景切换完成后，重置标志（fadeOut 300ms + fadeIn 300ms = 600ms后）
            this.scene.time.delayedCall(600, () => {
                this.isTransitioning = false;
                // 恢复游戏物理
                this.scene.physics.resume();
                console.log('✅ 场景切换完成，物理系统已恢复');
            });
        });
    }

    /**
     * 创建场景过渡效果
     */
    createTransition(callback) {
        // 淡出
        this.scene.cameras.main.fade(300, 0, 0, 0);

        // 等待淡出完成后执行回调
        this.scene.time.delayedCall(300, () => {
            callback();
        });
    }

    /**
     * 清理当前场景对象
     */
    cleanupScene() {
        const objectsToRemove = [];
        let removedCount = 0;

        this.scene.children.each((child) => {
            // 保留玩家对象、场景名称文本、连击UI容器、以及相机相关的Graphics
            if (child !== this.scene.player &&
                child !== this.scene.sceneNameText &&
                child !== this.scene.comboSystem?.comboContainer &&
                child.type !== 'Graphics' &&
                child.type !== 'Text') {
                objectsToRemove.push(child);
            }
        });

        // 销毁所有标记的对象
        objectsToRemove.forEach(obj => {
            if (obj && obj.active) {
                obj.destroy();
                removedCount++;
            }
        });

        // 清空传送点数组，因为旧场景的传送点已被销毁
        const previousTeleportCount = this.activeTeleports.length;
        this.activeTeleports = [];

        // 清空NPC和宝箱数组
        const previousNPCCount = this.npcs.length;
        const previousChestCount = this.chests.length;
        this.npcs = [];
        this.chests = [];

        // 清理Boss（如果存在）
        if (this.boss) {
            this.boss.destroy();
            this.boss = null;
            console.log('👑 Boss已清理');
        }

        console.log(`🧹 场景清理完成: 移除了 ${removedCount} 个对象，${previousTeleportCount} 个传送点，${previousNPCCount} 个NPC，${previousChestCount} 个宝箱`);
    }

    /**
     * 加载场景
     */
    loadScene(sceneName) {
        // 切换场景音乐
        if (this.scene.audioManager) {
            this.scene.audioManager.changeSceneMusic(sceneName);
        }

        switch (sceneName) {
            case 'town':
                this.loadTownScene();
                break;
            case 'forest':
                this.loadForestScene();
                break;
            case 'cave':
                this.loadCaveScene();
                break;
            case 'snow_mountain':
                this.loadSnowMountainScene();
                break;
            case 'volcanic_cavern':
                this.loadVolcanicCavernScene();
                break;
            default:
                console.warn(`未知场景: ${sceneName}`);
        }
    }

    /**
     * 加载小镇场景
     */
    loadTownScene() {
        console.log('🏘️ 加载小镇场景');

        // 使用草地瓦片创建背景 (48x48px tiles)
        // 交替使用3种草地瓦片增加视觉变化
        const tileSize = 48;
        const tilesX = Math.ceil(800 / tileSize);
        const tilesY = Math.ceil(600 / tileSize);

        const grassTiles = ['grass-tile', 'grass-tile-2', 'grass-tile-3'];

        for (let y = 0; y < tilesY; y++) {
            for (let x = 0; x < tilesX; x++) {
                // 随机选择草地类型，但倾向于使用 grass-tile (50%)
                let tileType;
                const rand = Math.random();
                if (rand < 0.5) {
                    tileType = grassTiles[0]; // grass-tile (50%)
                } else if (rand < 0.75) {
                    tileType = grassTiles[1]; // grass-tile-2 (25%)
                } else {
                    tileType = grassTiles[2]; // grass-tile-3 (25%)
                }

                const tile = this.scene.add.image(
                    x * tileSize + tileSize / 2,
                    y * tileSize + tileSize / 2,
                    tileType
                );
                tile.setDisplaySize(tileSize, tileSize);
                tile.setDepth(-100);
            }
        }
        console.log(`✅ 草地背景创建完成: ${tilesX * tilesY} 个瓦片`);

        // 添加更多树木和变化 (增加到15棵，混合橙树和粉树)
        const treePositions = [
            // 四周的大树
            { x: 80, y: 80, type: 'tree-orange' },
            { x: 720, y: 80, type: 'tree-pink' },
            { x: 80, y: 520, type: 'tree-pink' },
            { x: 720, y: 520, type: 'tree-orange' },
            // 中心区域的树木
            { x: 300, y: 100, type: 'tree-orange' },
            { x: 500, y: 100, type: 'tree-pink' },
            { x: 300, y: 500, type: 'tree-pink' },
            { x: 500, y: 500, type: 'tree-orange' },
            // 随机分布的树木
            { x: 150, y: 300, type: 'tree-orange' },
            { x: 650, y: 300, type: 'tree-pink' },
            { x: 400, y: 150, type: 'tree-pink' },
            { x: 400, y: 450, type: 'tree-orange' },
            { x: 200, y: 200, type: 'tree-orange' },
            { x: 600, y: 200, type: 'tree-pink' },
            { x: 200, y: 400, type: 'tree-pink' },
            { x: 600, y: 400, type: 'tree-orange' }
        ];

        treePositions.forEach(pos => {
            const tree = this.scene.add.image(pos.x, pos.y, pos.type).setScale(3);
            tree.setDepth(-50);
        });
        console.log(`✅ 添加了 ${treePositions.length} 棵树木`);

        // 添加装饰性灌木和岩石 (使用 bush, bush-tall, rock)
        const decorations = [
            { x: 120, y: 150, type: 'bush', scale: 2 },
            { x: 680, y: 150, type: 'bush-tall', scale: 2 },
            { x: 120, y: 450, type: 'bush-tall', scale: 2 },
            { x: 680, y: 450, type: 'bush', scale: 2 },
            { x: 250, y: 250, type: 'rock', scale: 2 },
            { x: 550, y: 250, type: 'bush', scale: 2 },
            { x: 250, y: 350, type: 'bush', scale: 2 },
            { x: 550, y: 350, type: 'rock', scale: 2 },
            { x: 350, y: 300, type: 'bush-tall', scale: 2 },
            { x: 450, y: 300, type: 'bush', scale: 2 }
        ];

        decorations.forEach(dec => {
            const obj = this.scene.add.image(dec.x, dec.y, dec.type).setScale(dec.scale);
            obj.setDepth(-30);
        });
        console.log(`✅ 添加了 ${decorations.length} 个装饰物`);

        // 添加标志牌（在小镇入口）
        const sign = this.scene.add.image(650, 350, 'sign').setScale(2);
        sign.setDepth(-25);
        console.log('✅ 添加了小镇标志牌');

        // 添加NPC（村长）
        this.createNPC('elder', 400, 200, '村长');

        // 添加NPC（商人）
        this.createNPC('merchant', 600, 200, '商人');

        // 添加宝箱
        this.createChest(200, 400);
        this.createChest(600, 450);

        // 添加传送点（到森林）
        this.createTeleport('forest', 700, 300, '→ 森林', { x: 100, y: 300 });

        // 添加建筑物（使用素材）
        this.createBuilding(200, 150, 120, 100, 'elder-house');  // 村长屋
        this.createBuilding(600, 150, 100, 80, 'shop');          // 商店

        console.log('✅ 小镇场景加载完成（美化版）');
    }

    /**
     * 加载森林场景
     */
    loadForestScene() {
        console.log('🌲 加载森林场景');

        // 创建森林背景
        const bg = this.scene.add.rectangle(400, 300, 800, 600, 0x2d5a27);
        bg.setDepth(-100);
        console.log(`✅ 森林背景创建完成: 颜色=0x2d5a27(深绿色), depth=-100`);

        // 添加树木（增加到40棵，优化分布）
        const treePositions = [
            // 边界树木（形成森林边界）
            { x: 60, y: 60, type: 'tree-dried' },
            { x: 740, y: 60, type: 'tree-orange' },
            { x: 60, y: 540, type: 'tree-pink' },
            { x: 740, y: 540, type: 'tree-dried' },
            { x: 400, y: 60, type: 'tree-orange' },
            { x: 400, y: 540, type: 'tree-pink' },
            // 中间区域的树木（避开路径）
            { x: 150, y: 150, type: 'tree-orange' },
            { x: 650, y: 150, type: 'tree-pink' },
            { x: 150, y: 450, type: 'tree-pink' },
            { x: 650, y: 450, type: 'tree-orange' },
            // 随机树木（30棵）
        ];

        // 添加随机树木
        for (let i = 0; i < 30; i++) {
            const x = Phaser.Math.Between(100, 700);
            const y = Phaser.Math.Between(100, 500);
            const treeType = Phaser.Math.RND.pick(['tree-orange', 'tree-pink', 'tree-dried']);
            treePositions.push({ x, y, type: treeType });
        }

        treePositions.forEach(pos => {
            const tree = this.scene.add.image(pos.x, pos.y, pos.type).setScale(3);
            tree.setDepth(Phaser.Math.Between(-50, -10));
        });
        console.log(`✅ 添加了 ${treePositions.length} 棵树木`);

        // 添加瀑布（动态效果）
        const waterfall = this.scene.add.sprite(650, 150, 'waterfall-1');
        waterfall.setScale(4);
        waterfall.play('waterfall-flow');
        waterfall.setDepth(-40);
        console.log('✅ 添加了动态瀑布');

        // 添加岩石和灌木（增加到20个）
        const decorations = [
            // 岩石
            { x: 200, y: 200, type: 'rock', scale: 2 },
            { x: 600, y: 400, type: 'rock', scale: 2.5 },
            { x: 300, y: 350, type: 'rock', scale: 1.8 },
            { x: 500, y: 250, type: 'rock', scale: 2.2 },
            { x: 150, y: 400, type: 'rock', scale: 2 },
            { x: 700, y: 200, type: 'rock', scale: 2.3 },
            // 灌木
            { x: 250, y: 150, type: 'bush', scale: 2 },
            { x: 550, y: 150, type: 'bush-tall', scale: 2 },
            { x: 250, y: 450, type: 'bush-tall', scale: 2 },
            { x: 550, y: 450, type: 'bush', scale: 2 },
            { x: 350, y: 250, type: 'bush', scale: 2 },
            { x: 450, y: 350, type: 'bush-tall', scale: 2 },
            { x: 180, y: 300, type: 'bush', scale: 2 },
            { x: 620, y: 300, type: 'bush-tall', scale: 2 },
            // 树干
            { x: 300, y: 500, type: 'trunk', scale: 2 },
            { x: 500, y: 100, type: 'trunk', scale: 2 },
            { x: 400, y: 300, type: 'trunk', scale: 2 },
            { x: 200, y: 400, type: 'trunk', scale: 1.8 },
            { x: 600, y: 200, type: 'trunk', scale: 2.2 },
            // 石碑
            { x: 100, y: 250, type: 'rock-monument', scale: 2.5 },
            { x: 700, y: 450, type: 'rock-monument', scale: 2 }
        ];

        decorations.forEach(dec => {
            const obj = this.scene.add.image(dec.x, dec.y, dec.type).setScale(dec.scale);
            obj.setDepth(-20);
        });
        console.log(`✅ 添加了 ${decorations.length} 个装饰物`);

        // 添加标志牌（指向不同方向）
        const sign1 = this.scene.add.image(150, 350, 'sign').setScale(2);
        sign1.setDepth(-15);
        const sign2 = this.scene.add.image(650, 250, 'sign').setScale(2);
        sign2.setDepth(-15);
        console.log('✅ 添加了森林标志牌');

        // 添加传送点（回到小镇）
        this.createTeleport('town', 50, 300, '→ 小镇', { x: 650, y: 300 });

        // 添加传送点（到洞穴）
        this.createTeleport('cave', 700, 500, '→ 洞穴', { x: 100, y: 100 });

        // 添加传送点（到雪山）
        this.createTeleport('snow_mountain', 700, 300, '→ 雪山', { x: 100, y: 300 });

        // 在森林中生成一些敌人
        this.spawnEnemiesInForest();

        console.log('✅ 森林场景加载完成（美化版）');
    }

    /**
     * 加载洞穴场景
     */
    loadCaveScene() {
        console.log('⛰️ 加载洞穴场景');

        // 创建洞穴背景
        const bg = this.scene.add.rectangle(400, 300, 800, 600, 0x1a1a2e);
        bg.setDepth(-100);

        // 添加洞穴装饰（岩石）
        for (let i = 0; i < 15; i++) {
            const x = Phaser.Math.Between(50, 750);
            const y = Phaser.Math.Between(50, 550);
            this.scene.add.image(x, y, 'rock').setScale(2.5).setDepth(-30);
        }

        // 添加洞穴晶体（蓝色 - 12个）
        const crystalPositions = [
            { x: 150, y: 150 }, { x: 650, y: 150 },
            { x: 150, y: 450 }, { x: 650, y: 450 },
            { x: 300, y: 100 }, { x: 500, y: 100 },
            { x: 300, y: 500 }, { x: 500, y: 500 },
            { x: 400, y: 200 }, { x: 400, y: 400 },
            { x: 200, y: 300 }, { x: 600, y: 300 }
        ];

        crystalPositions.forEach(pos => {
            const crystal = this.scene.add.image(pos.x, pos.y, 'rock').setScale(1.5);
            crystal.setTint(0x87CEEB);  // 冰蓝色（洞穴晶体）
            crystal.setDepth(-25);
        });
        console.log(`✅ 添加了 ${crystalPositions.length} 个洞穴晶体`);

        // 添加洞穴植被（暗绿色 - 8个）
        const mossPositions = [
            { x: 250, y: 200 }, { x: 550, y: 200 },
            { x: 250, y: 400 }, { x: 550, y: 400 },
            { x: 350, y: 250 }, { x: 450, y: 250 },
            { x: 350, y: 350 }, { x: 450, y: 350 }
        ];

        mossPositions.forEach(pos => {
            const moss = this.scene.add.image(pos.x, pos.y, 'bush').setScale(1.8);
            moss.setTint(0x2E8B57);  // 暗绿色（洞穴植被）
            moss.setDepth(-20);
        });
        console.log(`✅ 添加了 ${mossPositions.length} 个洞穴植被`);

        // 添加洞穴特色装饰（树桩和石碑）
        const specialDecorations = [
            { x: 100, y: 250, type: 'rock-monument', scale: 2.2, tint: 0x4a4a6a },
            { x: 700, y: 350, type: 'rock-monument', scale: 1.8, tint: 0x4a4a6a },
            { x: 400, y: 300, type: 'trunk', scale: 2.0, tint: 0x3a3a4a },
            { x: 200, y: 150, type: 'trunk', scale: 1.5, tint: 0x3a3a4a },
            { x: 600, y: 450, type: 'trunk', scale: 1.8, tint: 0x3a3a4a }
        ];

        specialDecorations.forEach(dec => {
            const obj = this.scene.add.image(dec.x, dec.y, dec.type).setScale(dec.scale);
            obj.setTint(dec.tint);
            obj.setDepth(-28);
        });
        console.log(`✅ 添加了 ${specialDecorations.length} 个洞穴特色装饰`);

        // 添加传送点（回到森林）
        this.createTeleport('forest', 100, 100, '→ 森林', { x: 700, y: 500 });

        // Milestone 6: 在洞穴中生成敌人（蝙蝠和史莱姆）
        this.spawnEnemiesInCave();

        // 生成Boss
        this.spawnBoss('treant_king', 400, 300);

        console.log('✅ 洞穴场景加载完成（美化版）');
    }

    /**
     * 创建NPC
     */
    createNPC(id, x, y, name) {
        console.log(`🔨 开始创建NPC: ${name} at (${x}, ${y})`);

        // 二维sprite sheet：3个方向(行) × 4个NPC(列)
        // 布局: 3行 x 4列 (背面/正面/侧面 × 商人/NPC2/NPC3/村长)
        // 帧号 = 行号 * 4 + 列号
        const rowIndex = 1;  // 正面 = 第1行 (0=背面, 1=正面, 2=侧面)
        const colIndex = id === 'elder' ? 3 : 0;  // 村长=第3列, 商人=第0列
        const frameIndex = rowIndex * 4 + colIndex;

        const npc = this.scene.add.sprite(x, y, 'npc');
        npc.setFrame(frameIndex);
        npc.setScale(3);
        npc.setData('type', 'npc');
        npc.setData('id', id);
        npc.setData('name', name);

        console.log(`✅ NPC对象已创建并设置数据:`);
        console.log(`   - type: ${npc.getData('type')}`);
        console.log(`   - id: ${npc.getData('id')}`);
        console.log(`   - name: ${npc.getData('name')}`);
        console.log(`   - 位置: (${npc.x}, ${npc.y})`);
        console.log(`   - 帧号: ${frameIndex}`);

        // 将NPC添加到管理器数组中
        this.npcs.push(npc);
        console.log(`📝 NPC已添加到管理器数组，当前总数: ${this.npcs.length}`);

        // 添加对话提示
        const hint = this.scene.add.text(x, y - 30, 'E 对话', {
            font: '12px Arial',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // NPC交互区域
        const interactionZone = this.scene.add.zone(x, y, 60, 60);
        interactionZone.setData('npc', npc);
        interactionZone.setData('hint', hint);

        // 设置物理体
        this.scene.physics.add.existing(interactionZone);
        interactionZone.body.setAllowGravity(false);
        interactionZone.body.setImmovable(true);

        // 碰撞检测
        this.scene.physics.add.overlap(
            this.scene.player,
            interactionZone,
            () => this.showInteractionHint(hint)
        );

        console.log(`👤 创建NPC完成: ${name} (总场景对象数: ${this.scene.children.list.length})`);
    }

    /**
     * 显示交互提示
     */
    showInteractionHint(hint) {
        if (hint && hint.active) {
            hint.setVisible(true);

            // 3秒后隐藏
            this.scene.time.delayedCall(3000, () => {
                if (hint.active) hint.setVisible(false);
            });
        }
    }

    /**
     * 创建传送点
     */
    createTeleport(targetScene, x, y, label, spawnPoint) {
        // 为每个传送点生成唯一ID
        const teleportId = `teleport_${this.teleportCounter++}`;

        // 传送区域
        const teleport = this.scene.add.zone(x, y, 60, 60);
        teleport.setData('type', 'teleport');
        teleport.setData('teleportId', teleportId);
        teleport.setData('targetScene', targetScene);
        teleport.setData('spawnPoint', spawnPoint);
        teleport.setData('lastTriggerTime', 0); // 为每个传送点单独记录触发时间

        // 视觉标识
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(0x4facfe, 0.3);
        graphics.fillCircle(x, y, 30);
        graphics.setDepth(-5);

        // 传送标签
        const text = this.scene.add.text(x, y, label, {
            font: '14px Arial',
            fill: '#4facfe',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // 设置物理体
        this.scene.physics.add.existing(teleport);
        teleport.body.setAllowGravity(false);
        teleport.body.setImmovable(true);

        // 碰撞检测 - 防止刚传送过来就立即触发返回
        this.scene.physics.add.overlap(
            this.scene.player,
            teleport,
            () => {
                // 关键修复：如果玩家刚传送过来，不触发传送
                if (this.recentlyTeleported) {
                    console.log(`⏸️ 玩家刚传送过来，暂时不触发 ${label}，请先离开传送区域再回来`);
                    return;
                }

                const now = Date.now();
                const lastTime = teleport.getData('lastTriggerTime');
                const cooldown = 3000; // 3秒冷却时间

                // 检查是否在冷却时间内
                if (now - lastTime < cooldown) {
                    return; // 在冷却中，不触发传送
                }

                // 检查是否正在进行场景切换
                if (this.isTransitioning) {
                    return; // 正在切换，不触发传送
                }

                // 更新这个传送点的触发时间
                teleport.setData('lastTriggerTime', now);

                // 执行场景切换
                console.log(`🚀 触发传送: ${label} → ${targetScene}`);
                this.switchScene(targetScene, spawnPoint);
            }
        );

        // 将传送点保存到数组中，用于后续检查玩家是否离开
        this.activeTeleports.push(teleport);

        console.log(`🚪 创建传送点: ${label} → ${targetScene} (ID: ${teleportId})`);
    }

    /**
     * 检查玩家是否离开传送区域（每帧调用）
     * 这个方法应该在GameScene的update()中调用
     */
    checkTeleportExit() {
        // 如果玩家没有刚传送过来，不需要检查
        if (!this.recentlyTeleported) {
            return;
        }

        // 检查玩家是否离开了所有传送区域
        const playerBounds = this.scene.player.getBounds();
        let isInsideAnyTeleport = false;

        for (const teleport of this.activeTeleports) {
            const teleportBounds = teleport.getBounds();
            if (Phaser.Geom.Rectangle.Overlaps(playerBounds, teleportBounds)) {
                isInsideAnyTeleport = true;
                break;
            }
        }

        // 如果玩家不在任何传送区域内，清除标志
        if (!isInsideAnyTeleport) {
            this.recentlyTeleported = false;
            console.log(`✅ 玩家已离开传送区域，现在可以重新触发传送了`);
        }
    }

    /**
     * 创建建筑物
     */
    /**
     * 创建建筑物（使用素材）
     */
    createBuilding(x, y, width, height, buildingType) {
        console.log(`🏠 创建建筑物: ${buildingType} at (${x}, ${y})`);

        // 根据建筑类型创建不同的外观
        if (buildingType === 'elder-house') {
            // 村长屋 - 使用 town-tileset.png
            const building = this.scene.add.image(x, y, 'town-tileset');
            building.setScale(0.8);  // 调整大小
            building.setDepth(-20);

            // 添加屋顶装饰（深色覆盖）
            const roof = this.scene.add.rectangle(x, y - 50, 140, 60, 0x8B4513);
            roof.setDepth(-19);

            // 添加门窗
            const door = this.scene.add.rectangle(x, y + 20, 30, 50, 0x4a3728);
            door.setDepth(-18);

            // 添加窗户
            const window1 = this.scene.add.rectangle(x - 40, y - 10, 25, 25, 0x87CEEB);
            window1.setDepth(-18);

            const window2 = this.scene.add.rectangle(x + 40, y - 10, 25, 25, 0x87CEEB);
            window2.setDepth(-18);

            // 添加标志
            const sign = this.scene.add.text(x, y + 60, '村长屋', {
                font: 'bold 14px Arial',
                fill: '#FFD700',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5);
            sign.setDepth(-15);

        } else if (buildingType === 'shop') {
            // 商店 - 使用 town-tileset.png + 装饰
            const building = this.scene.add.image(x, y, 'town-tileset');
            building.setScale(0.7);  // 商店稍小一点
            building.setDepth(-20);

            // 添加屋顶（不同颜色）
            const roof = this.scene.add.rectangle(x, y - 40, 120, 50, 0xCD853F);
            roof.setDepth(-19);

            // 添加大门（商店门更大）
            const door = this.scene.add.rectangle(x, y + 25, 40, 50, 0x654321);
            door.setDepth(-18);

            // 添加展示窗
            const showcase1 = this.scene.add.rectangle(x - 35, y, 30, 30, 0xFFD700);
            showcase1.setDepth(-18);

            const showcase2 = this.scene.add.rectangle(x + 35, y, 30, 30, 0xFFD700);
            showcase2.setDepth(-18);

            // 添加商店招牌
            const signBg = this.scene.add.rectangle(x, y - 70, 100, 30, 0x8B0000);
            signBg.setDepth(-17);

            const signText = this.scene.add.text(x, y - 70, '商店', {
                font: 'bold 16px Arial',
                fill: '#FFD700',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);
            signText.setDepth(-16);

            // 添加商品图标提示
            const itemIcon = this.scene.add.text(x, y + 60, '🛒', {
                font: '24px Arial'
            }).setOrigin(0.5);
            itemIcon.setDepth(-15);
        }

        console.log(`✅ 建筑物创建完成: ${buildingType}`);
    }

    /**
     * 创建宝箱
     */
    createChest(x, y) {
        // 创建宝箱图形
        const chest = this.scene.add.rectangle(x, y, 30, 25, 0xdaa520);
        chest.setStrokeStyle(3, 0x8b4513);
        chest.setDepth(-10);

        // 添加宝箱装饰
        const lock = this.scene.add.circle(x, y, 4, 0xffd700);
        lock.setDepth(-9);

        // 设置宝箱数据
        chest.setData('type', 'chest');
        chest.setData('opened', false);

        // 将宝箱添加到管理器数组中
        this.chests.push(chest);
        console.log(`🎁 宝箱已添加到管理器数组 at (${x}, ${y})，当前总数: ${this.chests.length}`);

        // 添加交互提示
        const hint = this.scene.add.text(x, y - 20, 'E 打开', {
            font: '10px Arial',
            fill: '#ffd700',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        hint.setVisible(false);

        // 创建交互区域
        const zone = this.scene.add.zone(x, y, 50, 50);
        this.scene.physics.add.existing(zone);
        zone.body.setAllowGravity(false);
        zone.body.setImmovable(true);

        // 显示提示
        this.scene.physics.add.overlap(
            this.scene.player,
            zone,
            () => {
                if (!chest.getData('opened')) {
                    hint.setVisible(true);
                    this.scene.time.delayedCall(3000, () => {
                        if (hint.active) hint.setVisible(false);
                    });
                }
            }
        );

        console.log(`🎁 创建宝箱 at (${x}, ${y})`);
    }

    /**
     * 在森林中生成敌人
     */
    spawnEnemiesInForest() {
        // 清除现有敌人
        if (this.scene.enemies) {
            this.scene.enemies.clear(true, true);
        }

        this.scene.enemies = this.scene.physics.add.group();

        // 获取玩家当前位置，确保敌人生成在安全距离外
        const playerX = this.playerSpawnPoint.x || 400;
        const playerY = this.playerSpawnPoint.y || 300;
        const safeDistance = 200; // 安全距离：敌人至少距离玩家200像素

        // 生成鼹鼠（远离玩家）
        for (let i = 0; i < 5; i++) {
            let x, y, distance;
            let attempts = 0;
            do {
                x = Phaser.Math.Between(150, 650);
                y = Phaser.Math.Between(100, 500);
                distance = Phaser.Math.Distance.Between(x, y, playerX, playerY);
                attempts++;
            } while (distance < safeDistance && attempts < 10);

            this.spawnEnemy('mole', x, y);
            console.log(`🐹 生成鼹鼠 at (${x}, ${y}), 距离玩家 ${Math.round(distance)}px`);
        }

        // 生成树妖（远离玩家）
        for (let i = 0; i < 3; i++) {
            let x, y, distance;
            let attempts = 0;
            do {
                x = Phaser.Math.Between(200, 600);
                y = Phaser.Math.Between(150, 450);
                distance = Phaser.Math.Distance.Between(x, y, playerX, playerY);
                attempts++;
            } while (distance < safeDistance && attempts < 10);

            this.spawnEnemy('treant', x, y);
            console.log(`🌳 生成树妖 at (${x}, ${y}), 距离玩家 ${Math.round(distance)}px`);
        }

        // Milestone 6: 生成精英敌人
        // 精英鼹鼠王（森林深处）
        let eliteX, eliteY, eliteDistance;
        let attempts = 0;
        do {
            eliteX = Phaser.Math.Between(300, 700);
            eliteY = Phaser.Math.Between(200, 500);
            eliteDistance = Phaser.Math.Distance.Between(eliteX, eliteY, playerX, playerY);
            attempts++;
        } while (eliteDistance < safeDistance && attempts < 10);
        this.spawnEnemy('elite_mole_king', eliteX, eliteY);
        console.log(`⭐ 生成精英鼹鼠王 at (${eliteX}, ${eliteY}), 距离玩家 ${Math.round(eliteDistance)}px`);

        // 精英远古树妖（森林深处）
        attempts = 0;
        do {
            eliteX = Phaser.Math.Between(250, 650);
            eliteY = Phaser.Math.Between(150, 450);
            eliteDistance = Phaser.Math.Distance.Between(eliteX, eliteY, playerX, playerY);
            attempts++;
        } while (eliteDistance < safeDistance && attempts < 10);
        this.spawnEnemy('elite_ancient_treant', eliteX, eliteY);
        console.log(`⭐ 生成精英远古树妖 at (${eliteX}, ${eliteY}), 距离玩家 ${Math.round(eliteDistance)}px`);

        console.log('👹 森林敌人生成完成（包含2个精英敌人）');
    }

    /**
     * 在洞穴中生成敌人
     */
    spawnEnemiesInCave() {
        // 清除现有敌人
        if (this.scene.enemies) {
            this.scene.enemies.clear(true, true);
        }

        this.scene.enemies = this.scene.physics.add.group();

        // Milestone 6: 在洞穴中生成蝙蝠（适合洞穴环境）
        const playerX = this.playerSpawnPoint.x || 400;
        const playerY = this.playerSpawnPoint.y || 300;
        const safeDistance = 200;

        // 生成蝙蝠
        for (let i = 0; i < 5; i++) {
            let x, y, distance;
            let attempts = 0;
            do {
                x = Phaser.Math.Between(150, 650);
                y = Phaser.Math.Between(100, 500);
                distance = Phaser.Math.Distance.Between(x, y, playerX, playerY);
                attempts++;
            } while (distance < safeDistance && attempts < 10);

            this.spawnEnemy('bat', x, y);
            console.log(`🦇 生成蝙蝠 at (${x}, ${y}), 距离玩家 ${Math.round(distance)}px`);
        }

        // 生成骷髅战士
        for (let i = 0; i < 3; i++) {
            let x, y, distance;
            let attempts = 0;
            do {
                x = Phaser.Math.Between(200, 600);
                y = Phaser.Math.Between(150, 450);
                distance = Phaser.Math.Distance.Between(x, y, playerX, playerY);
                attempts++;
            } while (distance < safeDistance && attempts < 10);

            this.spawnEnemy('skeleton', x, y);
            console.log(`💀 生成骷髅 at (${x}, ${y}), 距离玩家 ${Math.round(distance)}px`);
        }

        // 生成少量史莱姆
        for (let i = 0; i < 2; i++) {
            let x, y, distance;
            let attempts = 0;
            do {
                x = Phaser.Math.Between(250, 550);
                y = Phaser.Math.Between(200, 400);
                distance = Phaser.Math.Distance.Between(x, y, playerX, playerY);
                attempts++;
            } while (distance < safeDistance && attempts < 10);

            this.spawnEnemy('slime', x, y);
            console.log(`🦠 生成史莱姆 at (${x}, ${y}), 距离玩家 ${Math.round(distance)}px`);
        }

        // Milestone 6: 生成精英变异史莱姆（洞穴深处）
        let eliteX, eliteY, eliteDistance;
        let attempts = 0;
        do {
            eliteX = Phaser.Math.Between(300, 600);
            eliteY = Phaser.Math.Between(250, 450);
            eliteDistance = Phaser.Math.Distance.Between(eliteX, eliteY, playerX, playerY);
            attempts++;
        } while (eliteDistance < safeDistance && attempts < 10);
        this.spawnEnemy('elite_mutated_slime', eliteX, eliteY);
        console.log(`⭐ 生成精英变异史莱姆 at (${eliteX}, ${eliteY}), 距离玩家 ${Math.round(eliteDistance)}px`);

        // 生成Boss
        this.spawnBoss('treant_king', 400, 300);

        console.log('👹 洞穴敌人生成完成（包含1个精英敌人）');
    }

    /**
     * 生成单个敌人
     */
    spawnEnemy(type, x, y) {
        let enemy;
        let hp, attack, speed, xp, gold;
        let spriteKey;

        // Milestone 6: Use enemy definitions from global config
        const enemyDefs = window.gameData?.enemyDefinitions;

        if (type === 'mole') {
            enemy = this.scene.enemies.create(x, y, 'mole-idle-front');
            enemy.setScale(3);
            hp = 50;  // 从30改为50（玩家攻击30，2次=60，正好击杀；暴击60可能1次击杀）
            attack = 5;
            speed = 50;
            xp = 15;
            gold = 10;
            spriteKey = 'mole-idle-front';
        } else if (type === 'treant') {
            enemy = this.scene.enemies.create(x, y, 'treant-idle-front');
            enemy.setScale(3);
            hp = 60;  // 从80改为60（玩家攻击30，2次=60，正好击杀）
            attack = 10;  // 从12改为10（稍微降低难度）
            speed = 30;
            xp = 40;  // 从50改为40（降低XP匹配难度）
            gold = 20;  // 从25改为20
            spriteKey = 'treant-idle-front';
        } else if (type === 'bat') {
            // Milestone 6: Bat enemy - 使用mole侧身作为临时占位符
            enemy = this.scene.enemies.create(x, y, 'mole-idle-side');
            enemy.setScale(2); // 蝙蝠稍小
            enemy.setTint(0x6b5b95); // 紫色调表示蝙蝠
            hp = 35;  // 从25改为35（玩家攻击30，2次击杀；暴击1次）
            attack = enemyDefs?.bat?.attack || 8;
            speed = enemyDefs?.bat?.speed || 90;
            xp = enemyDefs?.bat?.xp || 25;  // 从20改为25
            gold = enemyDefs?.bat?.gold || 15;
            spriteKey = 'bat-temp';
        } else if (type === 'skeleton') {
            // Milestone 6: Skeleton enemy - 使用treant作为临时占位符
            enemy = this.scene.enemies.create(x, y, 'treant-idle-front');
            enemy.setScale(3);
            enemy.setTint(0xffffff); // 白色调表示骷髅
            hp = enemyDefs?.skeleton?.hp || 60;
            attack = enemyDefs?.skeleton?.attack || 15;
            speed = enemyDefs?.skeleton?.speed || 40;
            xp = enemyDefs?.skeleton?.xp || 40;
            gold = enemyDefs?.skeleton?.gold || 30;
            spriteKey = 'skeleton-temp';
        } else if (type === 'elite_mole_king') {
            // 精英敌人：巨型鼹鼠王
            enemy = this.scene.enemies.create(x, y, 'mole-idle-front');
            enemy.setScale(4.5); // 精英敌人更大
            enemy.setTint(0xffd700); // 金色调表示精英
            hp = enemyDefs?.elite_mole_king?.hp || 150;
            attack = enemyDefs?.elite_mole_king?.attack || 15;
            speed = enemyDefs?.elite_mole_king?.speed || 60;
            xp = enemyDefs?.elite_mole_king?.xp || 100;
            gold = enemyDefs?.elite_mole_king?.gold || 80;
            spriteKey = 'elite-mole-king';
        } else if (type === 'elite_ancient_treant') {
            // 精英敌人：远古树妖
            enemy = this.scene.enemies.create(x, y, 'treant-idle-front');
            enemy.setScale(4.5); // 精英敌人更大
            enemy.setTint(0x228b22); // 深绿色调表示精英树妖
            hp = enemyDefs?.elite_ancient_treant?.hp || 200;
            attack = enemyDefs?.elite_ancient_treant?.attack || 20;
            speed = enemyDefs?.elite_ancient_treant?.speed || 25;
            xp = enemyDefs?.elite_ancient_treant?.xp || 150;
            gold = enemyDefs?.elite_ancient_treant?.gold || 100;
            spriteKey = 'elite-ancient-treant';
        } else if (type === 'slime') {
            // Milestone 6: Slime enemy - 使用mole作为临时占位符
            enemy = this.scene.enemies.create(x, y, 'mole-idle-front');
            enemy.setScale(2.5);
            enemy.setTint(0x90ee90); // 浅绿色调表示史莱姆
            hp = 25;  // 从20改为25（玩家攻击30，1次击杀；升级前攻击20需要2次）
            attack = 6;
            speed = 45;
            xp = 15;  // 从12改为15
            gold = 10;  // 从8改为10
            spriteKey = 'slime-temp';
        } else if (type === 'elite_mutated_slime') {
            // 精英敌人：变异史莱姆（使用史莱姆图块，如果存在的话）
            enemy = this.scene.enemies.create(x, y, 'mole-idle-front'); // 临时占位
            enemy.setScale(4);
            enemy.setTint(0x00ff00); // 鲜绿色调表示变异
            hp = enemyDefs?.elite_mutated_slime?.hp || 120;
            attack = enemyDefs?.elite_mutated_slime?.attack || 18;
            speed = enemyDefs?.elite_mutated_slime?.speed || 50;
            xp = enemyDefs?.elite_mutated_slime?.xp || 120;
            gold = enemyDefs?.elite_mutated_slime?.gold || 90;
            spriteKey = 'elite-mutated-slime';
        }
        // ============ Milestone 7 Sprint 4: 新区域敌人 ============
        else if (type === 'ice_elemental') {
            // 雪山敌人：冰元素
            enemy = this.scene.enemies.create(x, y, 'mole-idle-front');
            enemy.setScale(3.5);
            enemy.setTint(0x87ceeb); // 冰蓝色
            hp = 80;
            attack = 12;
            speed = 35;
            xp = 50;
            gold = 35;
            spriteKey = 'ice-elemental';
            enemy.setData('behavior', 'elemental');
            enemy.setData('damageType', 'ice');
        } else if (type === 'frost_wolf') {
            // 雪山敌人：霜狼
            enemy = this.scene.enemies.create(x, y, 'mole-idle-side');
            enemy.setScale(3);
            enemy.setTint(0xe0ffff); // 淡青色
            hp = 70;
            attack = 18;
            speed = 80; // 快速
            xp = 60;
            gold = 40;
            spriteKey = 'frost-wolf';
            enemy.setData('behavior', 'fast_melee');
            enemy.setData('damageType', 'physical');
        } else if (type === 'fire_elemental') {
            // 火山洞穴敌人：火元素
            enemy = this.scene.enemies.create(x, y, 'mole-idle-front');
            enemy.setScale(3.5);
            enemy.setTint(0xff4500); // 火红色
            hp = 90;
            attack = 15;
            speed = 40;
            xp = 60;
            gold = 45;
            spriteKey = 'fire-elemental';
            enemy.setData('behavior', 'elemental');
            enemy.setData('damageType', 'fire');
        } else if (type === 'lava_slime') {
            // 火山洞穴敌人：熔岩史莱姆
            enemy = this.scene.enemies.create(x, y, 'mole-idle-front');
            enemy.setScale(3);
            enemy.setTint(0xff6b00); // 橙红色
            hp = 75;
            attack = 14;
            speed = 50;
            xp = 55;
            gold = 40;
            spriteKey = 'lava-slime';
            enemy.setData('behavior', 'slime');
            enemy.setData('damageType', 'fire');
        } else if (type === 'elite_fire_dragon') {
            // 火山洞穴精英敌人：火龙
            enemy = this.scene.enemies.create(x, y, 'mole-idle-side');
            enemy.setScale(5); // 更大
            enemy.setTint(0xff0000); // 鲜红色
            hp = 250;
            attack = 25;
            speed = 70;
            xp = 200;
            gold = 150;
            spriteKey = 'elite-fire-dragon';
            enemy.setData('behavior', 'elite');
            enemy.setData('isElite', true);
            enemy.setData('specialAbility', 'fire_breath');
            enemy.setData('damageType', 'fire');
            console.log(`⭐ 精英敌人生成: ${type}, 特殊能力: fire_breath`);
        }

        // 验证敌人对象已创建
        if (!enemy) {
            console.error(`❌ 无法创建敌人，未知类型: ${type}`);
            return;
        }

        enemy.setData('type', type);
        enemy.setData('hp', hp);
        enemy.setData('maxHp', hp);
        enemy.setData('attack', attack);
        enemy.setData('speed', speed);
        enemy.setData('xp', xp);
        enemy.setData('gold', gold);
        enemy.setData('lastHitTime', 0); // 初始化攻击冷却时间
        enemy.setData('spriteKey', spriteKey);

        // 设置敌人名称（用于Boss检测）
        const enemyName = enemyDefs?.[type]?.name || type;
        enemy.setData('name', enemyName);

        // 检测是否是Boss并显示Boss血条
        if (this.scene.bossHealthBar) {
            this.scene.bossHealthBar.detectBoss(enemy);
        }

        // Milestone 6: Add behavior flag for AI customization
        if (type === 'bat') {
            enemy.setData('behavior', 'flying');
            enemy.setData('verticalMovement', true); // 蝙蝠会上下移动
        } else if (type === 'skeleton') {
            enemy.setData('behavior', 'undead');
            enemy.setData('regeneration', 0); // 未来可实现再生能力
        } else if (type.startsWith('elite_')) {
            enemy.setData('behavior', 'elite');
            enemy.setData('isElite', true);
            enemy.setData('specialAbility', enemyDefs?.[type]?.specialAbility);
            console.log(`⭐ 精英敌人生成: ${type}, 特殊能力: ${enemy.getData('specialAbility')}`);
        }

        // 创建血条背景
        const hpBarWidth = 40;
        const hpBarHeight = 4;
        const hpBarX = x;
        const hpBarY = y - 25;

        const hpBarBg = this.scene.add.rectangle(hpBarX, hpBarY, hpBarWidth, hpBarHeight, 0x000000);
        hpBarBg.setOrigin(0.5);
        hpBarBg.setDepth(100);
        // 禁用交互性，防止Phaser输入检测错误
        hpBarBg.disableInteractive();

        // 创建血条前景（红色）
        const hpBar = this.scene.add.rectangle(hpBarX, hpBarY, hpBarWidth, hpBarHeight, 0xff0000);
        hpBar.setOrigin(0.5);
        hpBar.setDepth(101);
        // 禁用交互性，防止Phaser输入检测错误
        hpBar.disableInteractive();

        // 保存血条引用到enemy对象
        enemy.hpBar = hpBar;
        enemy.hpBarBg = hpBarBg;

        // ============ Milestone 7: 创建弱点指示器 ============
        if (this.scene.damageTypeManager) {
            this.scene.damageTypeManager.createWeaknessIndicator(enemy);
        }

        console.log(`👹 生成敌人: ${type} at (${x}, ${y}), HP=${hp}, Attack=${attack}, Speed=${speed}`);
    }

    /**
     * 生成Boss
     */
    spawnBoss(type, x, y) {
        console.log(`👑 生成Boss: ${type} at (${x}, ${y})`);

        // 创建Boss实例
        const boss = new Boss(this.scene, type, x, y);
        boss.create();

        // 激活Boss血条
        boss.showHealthBar();

        // 保存Boss引用到SceneManager
        this.boss = boss;

        console.log(`✅ Boss生成完成: ${type}`);
    }

    /**
     * 获取当前场景名称
     */
    getCurrentScene() {
        return this.currentScene;
    }

    /**
     * 获取场景信息（用于调试）
     */
    getSceneInfo() {
        return {
            currentScene: this.currentScene,
            playerPosition: this.scene.player ? {
                x: Math.round(this.scene.player.x),
                y: Math.round(this.scene.player.y)
            } : null,
            spawnPoint: this.playerSpawnPoint,
            isTransitioning: this.isTransitioning,
            recentlyTeleported: this.recentlyTeleported,
            activeTeleportsCount: this.activeTeleports.length,
            enemiesCount: this.enemies ? this.enemies.getChildren().length : 0
        };
    }

    /**
     * ============ Milestone 7 Sprint 4: 加载雪山场景 ============
     */
    loadSnowMountainScene() {
        console.log('🏔️ 加载雪山场景');

        // 创建雪山背景（淡蓝色）
        const bg = this.scene.add.rectangle(400, 300, 800, 600, 0xe8f4f8);
        bg.setDepth(-100);

        // 添加雪花粒子效果
        this.createSnowEffect();

        // 添加雪地岩石
        for (let i = 0; i < 15; i++) {
            const x = Phaser.Math.Between(50, 750);
            const y = Phaser.Math.Between(50, 550);
            const rock = this.scene.add.image(x, y, 'rock').setScale(2.5);
            rock.setTint(0xe0e8f0);  // 冰雪色
            rock.setDepth(-30);
        }

        // 添加冰晶
        for (let i = 0; i < 10; i++) {
            const x = Phaser.Math.Between(100, 700);
            const y = Phaser.Math.Between(100, 500);
            const crystal = this.scene.add.image(x, y, 'rock').setScale(1.5);
            crystal.setTint(0x87ceeb);  // 冰蓝色
            crystal.setDepth(-25);
        }

        // 添加传送点（回到森林）- 移到左侧，避免与玩家出生点重叠
        this.createTeleport('forest', 50, 300, '→ 森林', { x: 700, y: 300 });

        // 添加传送点（到火山洞穴）- 移到右上方，避免与森林传送点靠近
        this.createTeleport('volcanic_cavern', 750, 100, '→ 火山洞穴', { x: 100, y: 500 });

        // 在雪山中生成敌人
        this.spawnEnemiesInSnowMountain();

        // 生成雪山Boss（雪怪）
        this.spawnBoss('yeti_king', 400, 300);

        console.log('✅ 雪山场景加载完成');
    }

    /**
     * 创建雪花效果
     */
    createSnowEffect() {
        // 创建雪花粒子
        const snowflakes = [];
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, 800);
            const y = Phaser.Math.Between(0, 600);
            const size = Phaser.Math.Between(1, 3);
            const speed = Phaser.Math.Between(20, 50);

            const snowflake = this.scene.add.circle(x, y, size, 0xffffff, 0.6);
            snowflake.setDepth(50);
            snowflakes.push({
                sprite: snowflake,
                speed: speed,
                wind: Math.random() * 20 - 10
            });
        }

        // 雪花下落动画
        this.scene.time.addEvent({
            delay: 16,
            callback: () => {
                snowflakes.forEach(snow => {
                    snow.sprite.y += snow.speed * 0.016;
                    snow.sprite.x += snow.wind * 0.016;

                    // 重置雪花位置
                    if (snow.sprite.y > 600) {
                        snow.sprite.y = -10;
                        snow.sprite.x = Phaser.Math.Between(0, 800);
                    }
                    if (snow.sprite.x < 0) snow.sprite.x = 800;
                    if (snow.sprite.x > 800) snow.sprite.x = 0;
                });
            },
            loop: true
        });
    }

    /**
     * 在雪山中生成敌人
     */
    spawnEnemiesInSnowMountain() {
        // 清除现有敌人
        if (this.scene.enemies) {
            this.scene.enemies.clear(true, true);
        }

        this.scene.enemies = this.scene.physics.add.group();

        const playerX = this.playerSpawnPoint.x || 400;
        const playerY = this.playerSpawnPoint.y || 300;
        const safeDistance = 200;

        // 生成冰元素
        for (let i = 0; i < 4; i++) {
            let x, y, distance;
            let attempts = 0;
            do {
                x = Phaser.Math.Between(150, 650);
                y = Phaser.Math.Between(100, 500);
                distance = Phaser.Math.Distance.Between(x, y, playerX, playerY);
                attempts++;
            } while (distance < safeDistance && attempts < 10);

            this.spawnEnemy('ice_elemental', x, y);
            console.log(`❄️ 生成冰元素 at (${x}, ${y}), 距离玩家 ${Math.round(distance)}px`);
        }

        // 生成霜狼
        for (let i = 0; i < 3; i++) {
            let x, y, distance;
            let attempts = 0;
            do {
                x = Phaser.Math.Between(200, 600);
                y = Phaser.Math.Between(150, 450);
                distance = Phaser.Math.Distance.Between(x, y, playerX, playerY);
                attempts++;
            } while (distance < safeDistance && attempts < 10);

            this.spawnEnemy('frost_wolf', x, y);
            console.log(`🐺 生成霜狼 at (${x}, ${y}), 距离玩家 ${Math.round(distance)}px`);
        }

        console.log('👹 雪山敌人生成完成');
    }

    /**
     * ============ Milestone 7 Sprint 4: 加载火山洞穴场景 ============
     */
    loadVolcanicCavernScene() {
        console.log('🌋 加载火山洞穴场景');

        // 创建火山背景（暗红色）
        const bg = this.scene.add.rectangle(400, 300, 800, 600, 0x1a0a0a);
        bg.setDepth(-100);

        // 添加熔岩池（伤害区域）
        this.createLavaPools();

        // 添加火山岩
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(50, 750);
            const y = Phaser.Math.Between(50, 550);
            const rock = this.scene.add.image(x, y, 'rock').setScale(3);
            rock.setTint(0x8b4513);  // 棕色
            rock.setDepth(-30);
        }

        // 添加火晶
        for (let i = 0; i < 8; i++) {
            const x = Phaser.Math.Between(100, 700);
            const y = Phaser.Math.Between(100, 500);
            const crystal = this.scene.add.circle(x, y, 8, 0xff4500, 0.8);
            crystal.setDepth(-25);
        }

        // 添加传送点（回到雪山）- 匹配雪山场景的新位置
        this.createTeleport('snow_mountain', 100, 500, '→ 雪山', { x: 750, y: 100 });

        // 在火山洞穴中生成敌人
        this.spawnEnemiesInVolcanicCavern();

        // 生成最终Boss：龙王
        this.spawnBoss('dragon_lord', 400, 300);

        console.log('✅ 火山洞穴场景加载完成');
    }

    /**
     * 创建熔岩池（伤害区域）
     */
    createLavaPools() {
        // 创建几个熔岩池
        const lavaPools = [
            { x: 200, y: 200, radius: 60 },
            { x: 600, y: 400, radius: 80 },
            { x: 400, y: 500, radius: 50 }
        ];

        lavaPools.forEach(pool => {
            // 熔岩池背景
            const lava = this.scene.add.circle(pool.x, pool.y, pool.radius, 0xff4500, 0.8);
            lava.setDepth(-90);

            // 熔岩池物理体（伤害区域）
            // 注意：Zone物理体是矩形，不支持圆形形状
            // Zone大小设置为直径大小，用于碰撞检测
            const lavaZone = this.scene.add.zone(pool.x, pool.y, pool.radius * 2, pool.radius * 2);
            this.scene.physics.add.existing(lavaZone);
            lavaZone.body.setAllowGravity(false);
            lavaZone.body.setImmovable(true);

            // 玩家碰到熔岩的伤害
            this.scene.physics.add.overlap(
                this.scene.player,
                lavaZone,
                () => {
                    // 每秒造成10点伤害
                    const now = this.scene.time.now;
                    if (!this.scene.player.lastLavaDamage || now - this.scene.player.lastLavaDamage > 1000) {
                        this.scene.player.hp = Math.max(0, this.scene.player.hp - 10);
                        this.scene.showFloatingText(this.scene.player.x, this.scene.player.y - 40, '-10 HP (熔岩)', '#ff4500');
                        this.scene.updateUI();
                        this.scene.player.lastLavaDamage = now;

                        if (this.scene.player.hp <= 0) {
                            this.scene.gameOver();
                        }
                    }
                }
            );
        });

        console.log('🌋 熔岩池创建完成');
    }

    /**
     * 在火山洞穴中生成敌人
     */
    spawnEnemiesInVolcanicCavern() {
        // 清除现有敌人
        if (this.scene.enemies) {
            this.scene.enemies.clear(true, true);
        }

        this.scene.enemies = this.scene.physics.add.group();

        const playerX = this.playerSpawnPoint.x || 400;
        const playerY = this.playerSpawnPoint.y || 300;
        const safeDistance = 200;

        // 生成火元素
        for (let i = 0; i < 4; i++) {
            let x, y, distance;
            let attempts = 0;
            do {
                x = Phaser.Math.Between(150, 650);
                y = Phaser.Math.Between(100, 500);
                distance = Phaser.Math.Distance.Between(x, y, playerX, playerY);
                attempts++;
            } while (distance < safeDistance && attempts < 10);

            this.spawnEnemy('fire_elemental', x, y);
            console.log(`🔥 生成火元素 at (${x}, ${y}), 距离玩家 ${Math.round(distance)}px`);
        }

        // 生成熔岩史莱姆
        for (let i = 0; i < 3; i++) {
            let x, y, distance;
            let attempts = 0;
            do {
                x = Phaser.Math.Between(200, 600);
                y = Phaser.Math.Between(150, 450);
                distance = Phaser.Math.Distance.Between(x, y, playerX, playerY);
                attempts++;
            } while (distance < safeDistance && attempts < 10);

            this.spawnEnemy('lava_slime', x, y);
            console.log(`🌋 生成熔岩史莱姆 at (${x}, ${y}), 距离玩家 ${Math.round(distance)}px`);
        }

        // 生成火龙（精英敌人）
        let eliteX, eliteY, eliteDistance;
        let attempts = 0;
        do {
            eliteX = Phaser.Math.Between(300, 500);
            eliteY = Phaser.Math.Between(300, 400);
            eliteDistance = Phaser.Math.Distance.Between(eliteX, eliteY, playerX, playerY);
            attempts++;
        } while (eliteDistance < safeDistance && attempts < 10);

        this.spawnEnemy('elite_fire_dragon', eliteX, eliteY);
        console.log(`🐉 生成精英火龙 at (${eliteX}, ${eliteY}), 距离玩家 ${Math.round(eliteDistance)}px`);

        console.log('👹 火山洞穴敌人生成完成');
    }
}
