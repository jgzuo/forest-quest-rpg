/**
 * ArenaManager - 竞技场管理器
 * 生存竞技场和限时挑战
 */
class ArenaManager {
    constructor(scene) {
        this.scene = scene;
        this.isActive = false;
        this.arenaType = null; // 'survival' or 'time_attack'
        this.currentWave = 1;
        this.totalWaves = 0; // 无尽模式
        this.survivalTime = 0; // 生存时间（秒）
        this.startTime = 0;
        this.enemiesDefeated = 0;
        this.bestWave = 0;
        this.bestTime = 0;
        this.totalAttempts = 0;

        console.log('⚔️ 竞技场管理器初始化');
    }

    /**
     * 开始生存竞技场（无尽波次）
     */
    startSurvivalArena() {
        if (this.isActive) {
            console.warn('⚠️ 竞技场已在进行中');
            return false;
        }

        // 检查是否解锁（需要击败雪怪王）
        const yetiQuest = this.scene.questManager.getQuest('quest_8_snow_guardian');
        const hasBeatenYeti = yetiQuest && yetiQuest.status === 'completed';

        if (!hasBeatenYeti) {
            this.scene.showFloatingText(400, 300, '🔒 需要先击败雪怪王!', '#ff6b6b', 3000);
            return false;
        }

        this.arenaType = 'survival';
        this.isActive = true;
        this.currentWave = 1;
        this.totalWaves = 0; // 无尽模式
        this.enemiesDefeated = 0;
        this.startTime = Date.now();
        this.totalAttempts++;

        console.log(`⚔️ 生存竞技场开始！第${this.totalAttempts}次尝试`);

        // 显示开始提示
        this.scene.showFloatingText(
            400,
            200,
            '⚔️ 生存竞技场!',
            '#ff6600',
            3000
        );

        this.scene.showFloatingText(
            400,
            240,
            '尽可能生存更多波次!',
            '#ffffff',
            2500
        );

        // 生成第一波敌人
        this.generateWave();

        // 启动计时器
        this.startTimer();

        return true;
    }

    /**
     * 开始限时挑战（5分钟内击败最多敌人）
     */
    startTimeAttackArena() {
        if (this.isActive) {
            console.warn('⚠️ 竞技场已在进行中');
            return false;
        }

        // 检查是否解锁（需要击败龙王）
        const dragonQuest = this.scene.questManager.getQuest('quest_11_dragon_lord');
        const hasBeatenDragon = dragonQuest && dragonQuest.status === 'completed';

        if (!hasBeatenDragon) {
            this.scene.showFloatingText(400, 300, '🔒 需要先击败龙王!', '#ff6b6b', 3000);
            return false;
        }

        this.arenaType = 'time_attack';
        this.isActive = true;
        this.currentWave = 1;
        this.totalWaves = 10; // 10波限时挑战
        this.enemiesDefeated = 0;
        this.startTime = Date.now();
        this.totalAttempts++;

        console.log(`⚔️ 限时挑战开始！第${this.totalAttempts}次尝试`);

        // 显示开始提示
        this.scene.showFloatingText(
            400,
            200,
            '⚔️ 限时挑战!',
            '#ff0000',
            3000
        );

        this.scene.showFloatingText(
            400,
            240,
            '5分钟内击败最多敌人!',
            '#ffffff',
            2500
        );

        // 生成第一波敌人
        this.generateWave();

        // 启动计时器
        this.startTimer();

        // 5分钟后结束挑战
        this.scene.time.delayedCall(300000, () => { // 5分钟 = 300秒
            if (this.isActive && this.arenaType === 'time_attack') {
                this.completeTimeAttackArena();
            }
        });

        return true;
    }

    /**
     * 生成一波敌人
     */
    generateWave() {
        if (!this.isActive) return;

        console.log(`⚔️ 生成第${this.currentWave}波敌人`);

        // 清理当前场景
        this.scene.sceneManager.cleanupScene();

        // 创建竞技场背景
        this.createArenaBackground();

        // 生成敌人
        this.spawnWaveEnemies();

        // 显示波次信息
        this.showWaveInfo();

        // 保存记录
        this.saveRecords();
    }

    /**
     * 创建竞技场背景
     */
    createArenaBackground() {
        // 竞技场背景（深灰色）
        const bg = this.scene.add.rectangle(400, 300, 800, 600, 0x2d2d2d);
        bg.setDepth(-100);

        // 添加竞技场装饰（柱子、旗帜）
        for (let i = 0; i < 8; i++) {
            const x = i % 2 === 0 ? 100 : 700;
            const y = 100 + i * 60;

            // 柱子
            const pillar = this.scene.add.rectangle(x, y, 20, 80, 0x8b4513);
            pillar.setDepth(-90);
        }

        // 旗帜
        for (let i = 0; i < 4; i++) {
            const x = i === 0 || i === 2 ? 200 : 600;
            const y = i === 0 || i === 1 ? 150 : 450;

            const flag = this.scene.add.rectangle(x, y, 40, 30, this.arenaType === 'survival' ? 0xff6600 : 0xff0000);
            flag.setDepth(-85);
        }

        // 地面纹理
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(50, 750);
            const y = Phaser.Math.Between(50, 550);

            const tile = this.scene.add.rectangle(x, y, 20, 20, 0x3d3d3d);
            tile.setDepth(-95);
        }
    }

    /**
     * 生成波次敌人
     */
    spawnWaveEnemies() {
        // 清除现有敌人
        if (this.scene.enemies) {
            this.scene.enemies.clear(true, true);
        }

        this.scene.enemies = this.scene.physics.add.group();

        // 计算敌人数量（随波次增加）
        const baseEnemyCount = this.arenaType === 'survival' ? 8 : 5;
        const enemyCount = Math.floor(baseEnemyCount + (this.currentWave * 0.8));

        console.log(`⚔️ 第${this.currentWave}波生成${enemyCount}个敌人`);

        // 敌人类型池
        const enemyTypes = ['mole', 'slime', 'bat', 'skeleton', 'ice_elemental', 'fire_elemental'];
        const eliteTypes = ['elite_mole_king', 'elite_ancient_treant', 'elite_mutated_slime'];

        // 每3波添加精英敌人
        const hasElite = this.currentWave % 3 === 0;

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

            console.log(`⭐ 第${this.currentWave}波生成精英敌人: ${eliteType}`);
        }

        // 应用波次难度系数
        this.applyWaveDifficulty();
    }

    /**
     * 应用波次难度系数
     */
    applyWaveDifficulty() {
        if (!this.scene.enemies) return;

        // 难度系数：每波增加20%
        const waveMultiplier = 1 + (this.currentWave - 1) * 0.2;

        this.scene.enemies.getChildren().forEach(enemy => {
            const baseHp = enemy.getData('maxHp');
            const baseAttack = enemy.getData('attack');

            // 增加HP和攻击力
            const newHp = Math.floor(baseHp * waveMultiplier);
            const newAttack = Math.floor(baseAttack * waveMultiplier);

            enemy.setData('hp', newHp);
            enemy.setData('maxHp', newHp);
            enemy.setData('attack', newAttack);
        });

        console.log(`⚔️ 波次难度系数: ${waveMultiplier.toFixed(2)}x`);
    }

    /**
     * 显示波次信息
     */
    showWaveInfo() {
        const waveType = this.arenaType === 'survival' ? '生存竞技场' : '限时挑战';

        this.scene.showFloatingText(
            400,
            150,
            `${waveType} - 第 ${this.currentWave} 波`,
            this.arenaType === 'survival' ? '#ff6600' : '#ff0000',
            3000
        );

        if (this.arenaType === 'time_attack') {
            const remainingTime = 300 - Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(remainingTime / 60);
            const seconds = remainingTime % 60;

            this.scene.showFloatingText(
                400,
                180,
                `⏱️ 剩余时间: ${minutes}:${seconds.toString().padStart(2, '0')}`,
                '#ffffff',
                2500
            );
        }

        // 显示击败数
        this.scene.showFloatingText(
            400,
            210,
            `💀 击败: ${this.enemiesDefeated}`,
            '#ffd700',
            2000
        );
    }

    /**
     * 启动计时器
     */
    startTimer() {
        // 每秒更新生存时间
        this.timerEvent = this.scene.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }

    /**
     * 更新计时器
     */
    updateTimer() {
        if (!this.isActive) return;

        this.survivalTime = Math.floor((Date.now() - this.startTime) / 1000);

        // 生存模式：每30秒生成新波次
        if (this.arenaType === 'survival' && this.survivalTime % 30 === 0 && this.scene.enemies.getChildren().length === 0) {
            this.nextWave();
        }

        // 限时模式：显示倒计时
        if (this.arenaType === 'time_attack') {
            const remainingTime = 300 - this.survivalTime;
            if (remainingTime <= 60 && remainingTime % 10 === 0) {
                const minutes = Math.floor(remainingTime / 60);
                const seconds = remainingTime % 60;
                this.scene.showFloatingText(
                    400,
                    250,
                    `⏱️ ${minutes}:${seconds.toString().padStart(2, '0')}`,
                    remainingTime <= 30 ? '#ff0000' : '#ffffff',
                    2000
                );
            }
        }
    }

    /**
     * 下一波
     */
    nextWave() {
        console.log(`🚶 进入第${this.currentWave + 1}波`);

        // 更新最高波次
        if (this.currentWave > this.bestWave) {
            this.bestWave = this.currentWave;
            this.scene.showFloatingText(
                400,
                200,
                `🎉 新纪录! 到达第${this.bestWave}波!`,
                '#ffd700',
                3000
            );
        }

        this.currentWave++;

        // 延迟1秒后生成下一波
        this.scene.time.delayedCall(1000, () => {
            this.generateWave();
        });
    }

    /**
     * 敌人死亡
     */
    onEnemyDeath() {
        if (!this.isActive) return;

        this.enemiesDefeated++;

        // 检查是否所有敌人被击败
        if (this.scene.enemies && this.scene.enemies.getChildren().length === 0) {
            if (this.arenaType === 'survival') {
                // 生存模式：等待计时器触发下一波
                console.log('✅ 所有敌人被击败！等待下一波...');
            } else {
                // 限时模式：立即进入下一波
                this.scene.time.delayedCall(2000, () => {
                    if (this.currentWave < this.totalWaves) {
                        this.nextWave();
                    } else {
                        this.completeTimeAttackArena();
                    }
                });
            }
        }
    }

    /**
     * 完成限时挑战
     */
    completeTimeAttackArena() {
        console.log(`⚔️ 限时挑战完成！击败${this.enemiesDefeated}个敌人`);

        this.isActive = false;

        // 停止计时器
        if (this.timerEvent) {
            this.timerEvent.remove();
        }

        // 更新最佳记录
        if (this.enemiesDefeated > this.bestTime) {
            this.bestTime = this.enemiesDefeated;

            // 新记录提示
            this.scene.showFloatingText(
                400,
                150,
                '🎉 新纪录! 🎉',
                '#ffd700',
                3000
            );
        }

        // 显示完成消息
        this.scene.showFloatingText(
            400,
            200,
            '⚔️ 限时挑战完成!',
            '#ff0000',
            3000
        );

        this.scene.showFloatingText(
            400,
            240,
            `💀 击败敌人: ${this.enemiesDefeated}`,
            '#ffffff',
            2500
        );

        if (this.enemiesDefeated === this.bestTime) {
            this.scene.showFloatingText(
                400,
                280,
                '🏅 最佳纪录!',
                '#ffd700',
                2500
            );
        }

        // 给予奖励
        const rewardXP = 500 + (this.enemiesDefeated * 10);
        const rewardGold = 300 + (this.enemiesDefeated * 5);

        this.scene.player.xp += rewardXP;
        this.scene.player.gold += rewardGold;

        setTimeout(() => {
            this.scene.showFloatingText(
                400,
                320,
                `⭐ +${rewardXP} XP`,
                '#00bfff',
                2000
            );
        }, 500);

        setTimeout(() => {
            this.scene.showFloatingText(
                400,
                350,
                `💰 +${rewardGold} 金币`,
                '#ffd700',
                2000
            );
        }, 1000);

        // 保存记录
        this.saveRecords();

        // 延迟5秒后返回小镇
        this.scene.time.delayedCall(5000, () => {
            this.scene.sceneManager.switchScene('town', { x: 400, y: 300 });
        });
    }

    /**
     * 玩家死亡
     */
    onPlayerDeath() {
        if (!this.isActive) return;

        console.log(`💀 竞技场失败！到达第${this.currentWave}波`);

        this.isActive = false;

        // 停止计时器
        if (this.timerEvent) {
            this.timerEvent.remove();
        }

        // 显示失败消息
        const arenaName = this.arenaType === 'survival' ? '生存竞技场' : '限时挑战';

        this.scene.showFloatingText(
            400,
            200,
            `💀 ${arenaName}失败`,
            '#ff0000',
            3000
        );

        this.scene.showFloatingText(
            400,
            240,
            `到达波次: ${this.currentWave}`,
            '#ffffff',
            2500
        );

        this.scene.showFloatingText(
            400,
            280,
            `击败敌人: ${this.enemiesDefeated}`,
            '#ffd700',
            2500
        );

        if (this.currentWave === this.bestWave) {
            this.scene.showFloatingText(
                400,
                320,
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
            arenaType: this.arenaType,
            currentWave: this.currentWave,
            enemiesDefeated: this.enemiesDefeated,
            survivalTime: this.survivalTime
        };
    }

    /**
     * 保存记录
     */
    saveRecords() {
        const records = {
            bestWave: this.bestWave,
            bestTime: this.bestTime,
            totalAttempts: this.totalAttempts,
            lastUpdated: new Date().toISOString()
        };

        localStorage.setItem('forestQuestRPG_arena', JSON.stringify(records));
        console.log('💾 竞技场记录已保存');
    }

    /**
     * 加载记录
     */
    loadRecords() {
        try {
            const saved = localStorage.getItem('forestQuestRPG_arena');
            if (saved) {
                const records = JSON.parse(saved);
                this.bestWave = records.bestWave || 0;
                this.bestTime = records.bestTime || 0;
                this.totalAttempts = records.totalAttempts || 0;
                console.log('📂 竞技场记录已加载');
            }
        } catch (error) {
            console.error('❌ 加载竞技场记录失败:', error);
        }
    }

    /**
     * 显示记录
     */
    showRecords() {
        if (this.bestWave === 0 && this.bestTime === 0) {
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
            '⚔️ 竞技场最佳纪录',
            '#ff6600',
            2500
        );

        this.scene.showFloatingText(
            400,
            190,
            `🏅 生存模式: 第${this.bestWave}波`,
            '#ffffff',
            2000
        );

        this.scene.showFloatingText(
            400,
            220,
            `⏱️ 限时模式: ${this.bestTime}个敌人`,
            '#ffffff',
            2000
        );

        this.scene.showFloatingText(
            400,
            250,
            `🎮 尝试次数: ${this.totalAttempts}`,
            '#ffffff',
            2000
        );
    }
}
