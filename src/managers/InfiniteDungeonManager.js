/**
 * InfiniteDungeonManager - 无尽地牢管理器
 * 程序化生成楼层，难度递增
 */
class InfiniteDungeonManager {
    constructor(scene) {
        this.scene = scene;
        this.isActive = false;
        this.currentFloor = 1;
        this.maxFloors = 0; // 无尽模式
        this.enemySpawnRate = 0.8; // 敌人生成率
        this.difficultyMultiplier = 1.0;

        // 楼层记录
        this.bestFloor = 0;
        this.totalAttempts = 0;

        console.log('🏰 无尽地牢管理器初始化');
    }

    /**
     * 开始无尽地牢挑战
     */
    startInfiniteDungeon() {
        if (this.isActive) {
            console.warn('⚠️ 无尽地牢已在进行中');
            return false;
        }

        // 检查是否解锁（需要击败树妖王）
        const treantKingQuest = this.scene.questManager.getQuest('quest_3_boss');
        const hasBeatenTreant = treantKingQuest && treantKingQuest.status === 'completed';

        if (!hasBeatenTreant) {
            this.scene.showFloatingText(400, 300, '🔒 需要先击败树妖王!', '#ff6b6b', 3000);
            return false;
        }

        this.isActive = true;
        this.currentFloor = 1;
        this.difficultyMultiplier = 1.0;
        this.totalAttempts++;

        console.log(`🏰 无尽地牢挑战开始！第${this.totalAttempts}次尝试`);

        // 显示开始提示
        this.scene.showFloatingText(
            400,
            200,
            '🏰 无尽地牢模式!',
            '#9b59b6',
            3000
        );

        this.scene.showFloatingText(
            400,
            240,
            '尽可能深入地牢!',
            '#ffffff',
            2500
        );

        // 生成第一层
        this.generateFloor();

        return true;
    }

    /**
     * 生成楼层
     */
    generateFloor() {
        if (!this.isActive) return;

        console.log(`🏰 生成第${this.currentFloor}层`);

        // 清理当前场景
        this.scene.sceneManager.cleanupScene();

        // 计算难度系数
        this.difficultyMultiplier = 1 + (this.currentFloor - 1) * 0.15;

        // 创建地牢背景
        this.createDungeonBackground();

        // 生成敌人
        this.spawnFloorEnemies();

        // 生成出口
        this.createExit();

        // 显示楼层信息
        this.showFloorInfo();

        // 保存记录
        this.saveRecords();
    }

    /**
     * 创建地牢背景
     */
    createDungeonBackground() {
        // 地牢墙壁背景
        const bg = this.scene.add.rectangle(400, 300, 800, 600, 0x1a1a2e);
        bg.setDepth(-100);

        // 添加地牢装饰（岩石、火把）
        for (let i = 0; i < 30; i++) {
            const x = Phaser.Math.Between(50, 750);
            const y = Phaser.Math.Between(50, 550);

            if (i % 3 === 0) {
                // 火把
                const torch = this.scene.add.circle(x, y, 5, 0xff6b00, 0.8);
                torch.setDepth(-90);
            } else {
                // 岩石
                const rock = this.scene.add.image(x, y, 'rock').setScale(2);
                rock.setTint(0x4a4a4a);
                rock.setDepth(-80);
            }
        }
    }

    /**
     * 生成楼层敌人
     */
    spawnFloorEnemies() {
        // 清除现有敌人
        if (this.scene.enemies) {
            this.scene.enemies.clear(true, true);
        }

        this.scene.enemies = this.scene.physics.add.group();

        // 计算敌人数量（随楼层增加）
        const baseEnemyCount = 5;
        const enemyCount = Math.floor(baseEnemyCount + (this.currentFloor * 0.5));

        console.log(`👹 第${this.currentFloor}层生成${enemyCount}个敌人`);

        // 敌人类型池
        const enemyTypes = ['mole', 'slime', 'bat', 'skeleton'];
        const eliteTypes = ['elite_mole_king', 'elite_ancient_treant', 'elite_mutated_slime'];

        // 每5层添加精英敌人
        const hasElite = this.currentFloor % 5 === 0;

        const playerX = this.scene.player.x || 400;
        const playerY = this.scene.player.y || 300;
        const safeDistance = 200;

        // 生成普通敌人
        for (let i = 0; i < enemyCount; i++) {
            let x, y, distance;
            let attempts = 0;
            do {
                x = Phaser.Math.Between(100, 700);
                y = Phaser.Math.Between(100, 500);
                distance = Phaser.Math.Distance.Between(x, y, playerX, playerY);
                attempts++;
            } while (distance < safeDistance && attempts < 10);

            // 随机选择敌人类型
            const enemyType = Phaser.Math.RND.pick(enemyTypes);
            this.scene.sceneManager.spawnEnemy(enemyType, x, y);
        }

        // 生成精英敌人
        if (hasElite) {
            let eliteX, eliteY, eliteDistance;
            let attempts = 0;
            do {
                eliteX = Phaser.Math.Between(200, 600);
                eliteY = Phaser.Math.Between(200, 400);
                eliteDistance = Phaser.Math.Distance.Between(eliteX, eliteY, playerX, playerY);
                attempts++;
            } while (eliteDistance < safeDistance && attempts < 10);

            const eliteType = Phaser.Math.RND.pick(eliteTypes);
            this.scene.sceneManager.spawnEnemy(eliteType, eliteX, eliteY);

            console.log(`⭐ 第${this.currentFloor}层生成精英敌人: ${eliteType}`);
        }

        // 应用难度系数到所有敌人
        this.applyDifficultyToEnemies();
    }

    /**
     * 应用难度系数到敌人
     */
    applyDifficultyToEnemies() {
        if (!this.scene.enemies) return;

        this.scene.enemies.getChildren().forEach(enemy => {
            const baseHp = enemy.getData('maxHp');
            const baseAttack = enemy.getData('attack');

            // 增加HP和攻击力
            const newHp = Math.floor(baseHp * this.difficultyMultiplier);
            const newAttack = Math.floor(baseAttack * this.difficultyMultiplier);

            enemy.setData('hp', newHp);
            enemy.setData('maxHp', newHp);
            enemy.setData('attack', newAttack);
        });

        console.log(`📈 难度系数: ${this.difficultyMultiplier.toFixed(2)}x`);
    }

    /**
     * 创建出口
     */
    createExit() {
        // 随机位置生成出口
        const exitX = Phaser.Math.Between(100, 700);
        const exitY = Phaser.Math.Between(100, 500);

        // 出口视觉效果
        const exit = this.scene.add.rectangle(exitX, exitY, 60, 60, 0x9b59b6);
        exit.setDepth(-50);
        exit.setStrokeStyle(4, 0xffffff);

        // 出口标签
        const exitText = this.scene.add.text(exitX, exitY, '↓ 出口', {
            font: 'bold 14px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // 出口传送区域
        const exitZone = this.scene.add.zone(exitX, exitY, 60, 60);
        this.scene.physics.add.existing(exitZone);
        exitZone.body.setAllowGravity(false);

        // 出口交互检测
        this.scene.physics.add.overlap(
            this.scene.player,
            exitZone,
            () => {
                // 检查是否所有敌人被击败
                if (this.scene.enemies && this.scene.enemies.getChildren().length === 0) {
                    this.nextFloor();
                } else {
                    const remaining = this.scene.enemies.getChildren().length;
                    this.scene.showFloatingText(
                        this.scene.player.x,
                        this.scene.player.y - 50,
                        `还需击败${remaining}个敌人!`,
                        '#ff6b6b',
                        1500
                    );
                }
            }
        );

        console.log(`🚪 出口位置: (${exitX}, ${exitY})`);
    }

    /**
     * 显示楼层信息
     */
    showFloorInfo() {
        this.scene.showFloatingText(
            400,
            150,
            `🏰 第 ${this.currentFloor} 层`,
            '#9b59b6',
            3000
        );

        const difficultyPercent = Math.floor((this.difficultyMultiplier - 1) * 100);
        this.scene.showFloatingText(
            400,
            180,
            `📈 难度: +${difficultyPercent}%`,
            '#ffffff',
            2500
        );

        // 显示奖励倍率
        const rewardMultiplier = this.getRewardMultiplier();
        this.scene.showFloatingText(
            400,
            210,
            `💰 奖励倍率: x${rewardMultiplier.toFixed(1)}`,
            '#ffd700',
            2000
        );
    }

    /**
     * 进入下一层
     */
    nextFloor() {
        console.log(`🚶 进入第${this.currentFloor + 1}层`);

        // 给予楼层奖励
        this.giveFloorRewards();

        // 更新最高楼层
        if (this.currentFloor > this.bestFloor) {
            this.bestFloor = this.currentFloor;
            this.scene.showFloatingText(
                400,
                200,
                `🎉 新纪录! 到达第${this.bestFloor}层!`,
                '#ffd700',
                3000
            );
        }

        this.currentFloor++;

        // 延迟1秒后生成下一层
        this.scene.time.delayedCall(1000, () => {
            this.generateFloor();
        });
    }

    /**
     * 给予楼层奖励
     */
    giveFloorRewards() {
        const rewardMultiplier = this.getRewardMultiplier();

        const baseXP = 50;
        const baseGold = 30;

        const xpReward = Math.floor(baseXP * rewardMultiplier);
        const goldReward = Math.floor(baseGold * rewardMultiplier);

        this.scene.player.xp += xpReward;
        this.scene.player.gold += goldReward;

        console.log(`💰 楼层奖励: ${xpReward} XP, ${goldReward} 金币`);

        // 显示奖励
        this.scene.showFloatingText(
            this.scene.player.x,
            this.scene.player.y - 80,
            `⭐ +${xpReward} XP`,
            '#00bfff',
            1500
        );

        this.scene.showFloatingText(
            this.scene.player.x,
            this.scene.player.y - 110,
            `💰 +${goldReward} 金币`,
            '#ffd700',
            1500
        );
    }

    /**
     * 获取奖励倍率
     */
    getRewardMultiplier() {
        return 1 + (this.currentFloor - 1) * 0.1;
    }

    /**
     * 玩家死亡
     */
    onPlayerDeath() {
        if (!this.isActive) return;

        console.log(`💀 无尽地牢失败！到达第${this.currentFloor}层`);

        this.isActive = false;

        // 显示失败消息
        this.scene.showFloatingText(
            400,
            200,
            '💀 无尽地牢挑战失败',
            '#ff0000',
            3000
        );

        this.scene.showFloatingText(
            400,
            240,
            `到达楼层: ${this.currentFloor}`,
            '#ffffff',
            2500
        );

        if (this.currentFloor === this.bestFloor) {
            this.scene.showFloatingText(
                400,
                280,
                '🏅 最佳纪录!',
                '#ffd700',
                2500
            );
        }

        // 保存记录
        this.saveRecords();

        // 返回小镇
        this.scene.time.delayedCall(3000, () => {
            this.scene.sceneManager.switchScene('town', { x: 400, y: 300 });
        });
    }

    /**
     * 获取当前进度
     */
    getProgress() {
        if (!this.isActive) {
            return null;
        }

        return {
            currentFloor: this.currentFloor,
            difficultyMultiplier: this.difficultyMultiplier,
            enemiesRemaining: this.scene.enemies ? this.scene.enemies.getChildren().length : 0,
            rewardMultiplier: this.getRewardMultiplier()
        };
    }

    /**
     * 保存记录
     */
    saveRecords() {
        const records = {
            bestFloor: this.bestFloor,
            totalAttempts: this.totalAttempts,
            lastUpdated: new Date().toISOString()
        };

        localStorage.setItem('forestQuestRPG_infiniteDungeon', JSON.stringify(records));
        console.log('💾 无尽地牢记录已保存');
    }

    /**
     * 加载记录
     */
    loadRecords() {
        try {
            const saved = localStorage.getItem('forestQuestRPG_infiniteDungeon');
            if (saved) {
                const records = JSON.parse(saved);
                this.bestFloor = records.bestFloor || 0;
                this.totalAttempts = records.totalAttempts || 0;
                console.log('📂 无尽地牢记录已加载');
            }
        } catch (error) {
            console.error('❌ 加载无尽地牢记录失败:', error);
        }
    }

    /**
     * 显示记录
     */
    showRecords() {
        const records = {
            bestFloor: this.bestFloor,
            totalAttempts: this.totalAttempts
        };

        if (records.bestFloor === 0) {
            this.scene.showFloatingText(
                400,
                200,
                '📊 暂无记录',
                '#ffffff',
                2000
            );
            return;
        }

        this.scene.showFloatingText(
            400,
            150,
            '🏰 无尽地牢最佳纪录',
            '#9b59b6',
            2500
        );

        this.scene.showFloatingText(
            400,
            190,
            `🏅 最高楼层: ${records.bestFloor}`,
            '#ffffff',
            2000
        );

        this.scene.showFloatingText(
            400,
            220,
            `🎮 尝试次数: ${records.totalAttempts}`,
            '#ffffff',
            2000
        );
    }
}
