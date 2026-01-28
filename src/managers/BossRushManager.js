/**
 * BossRushManager - Boss Rush模式管理器
 * 玩家连续挑战所有Boss，计时计分
 */
class BossRushManager {
    constructor(scene) {
        this.scene = scene;
        this.isActive = false;
        this.currentBossIndex = 0;
        this.bosses = ['treant_king', 'yeti_king', 'dragon_lord'];
        this.startTime = 0;
        this.elanTime = 0;
        this.scores = [];
        this.attempts = 0;
        this.bestTime = null;
        this.bestScore = null;

        console.log('🏆 Boss Rush模式管理器初始化');
    }

    /**
     * 开始Boss Rush挑战
     */
    startBossRush() {
        if (this.isActive) {
            console.warn('⚠️ Boss Rush已在进行中');
            return false;
        }

        this.isActive = true;
        this.currentBossIndex = 0;
        this.startTime = Date.now();
        this.attempts++;

        console.log(`🏆 Boss Rush挑战开始！第${this.attempts}次尝试`);

        // 显示开始提示
        this.scene.showFloatingText(
            400,
            200,
            '🏆 Boss Rush模式!',
            '#ffd700',
            3000
        );

        this.scene.showFloatingText(
            400,
            240,
            '连续击败3个Boss!',
            '#ffffff',
            2500
        );

        // 记录开始时间
        this.scene.showFloatingText(
            400,
            280,
            '⏱️ 计时开始!',
            '#00ff00',
            2000
        );

        // 开始第一个Boss战
        this.startNextBoss();

        return true;
    }

    /**
     * 开始下一个Boss
     */
    startNextBoss() {
        if (this.currentBossIndex >= this.bosses.length) {
            // 所有Boss都击败了
            this.completeBossRush();
            return;
        }

        const bossType = this.bosses[this.currentBossIndex];
        console.log(`🏆 Boss Rush: 开始第${this.currentBossIndex + 1}个Boss - ${bossType}`);

        // 显示Boss提示
        const bossNames = {
            'treant_king': '树妖王',
            'yeti_king': '雪怪王',
            'dragon_lord': '龙王'
        };

        this.scene.showFloatingText(
            400,
            150,
            `Boss ${this.currentBossIndex + 1}/3`,
            '#ff0000',
            2000
        );

        this.scene.showFloatingText(
            400,
            180,
            bossNames[bossType],
            '#ffd700',
            2000
        );

        // 生成Boss
        this.scene.sceneManager.spawnBoss(bossType, 400, 300);
    }

    /**
     * Boss被击败
     */
    onBossDefeated(bossType) {
        if (!this.isActive) return;

        console.log(`🏆 Boss Rush: ${bossType} 被击败！`);

        const elapsedTime = Date.now() - this.startTime;
        const bossTime = Date.now();

        // 记录这个Boss的用时
        this.scores.push({
            boss: bossType,
            time: bossTime,
            elapsedTime: elapsedTime
        });

        // 显示完成提示
        this.scene.showFloatingText(
            400,
            200,
            `✅ ${bossType} 被击败!`,
            '#00ff00',
            2000
        );

        // 显示用时
        const seconds = Math.floor(elapsedTime / 1000);
        this.scene.showFloatingText(
            400,
            230,
            `⏱️ 用时: ${seconds}秒`,
            '#ffffff',
            2000
        );

        this.currentBossIndex++;

        // 延迟2秒后开始下一个Boss
        this.scene.time.delayedCall(2000, () => {
            this.startNextBoss();
        });
    }

    /**
     * Boss Rush完成
     */
    completeBossRush() {
        const totalTime = Date.now() - this.startTime;
        const seconds = Math.floor(totalTime / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        console.log(`🏆 Boss Rush完成！总用时: ${minutes}分${remainingSeconds}秒`);

        // 更新最佳记录
        if (!this.bestTime || totalTime < this.bestTime) {
            this.bestTime = totalTime;
            this.bestScore = {
                attempts: this.attempts,
                time: totalTime,
                date: new Date().toISOString()
            };

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
            '🏆 Boss Rush完成!',
            '#ffd700',
            3000
        );

        this.scene.showFloatingText(
            400,
            240,
            `⏱️ 总用时: ${minutes}分${remainingSeconds}秒`,
            '#ffffff',
            2500
        );

        if (this.bestTime === totalTime) {
            this.scene.showFloatingText(
                400,
                280,
                '🏅 最佳纪录!',
                '#ffd700',
                2500
            );
        }

        // 给予奖励
        const rewardXP = 1500;
        const rewardGold = 1000;

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

        // 停止Boss Rush
        this.isActive = false;

        // 保存记录
        this.saveRecords();

        // 延迟5秒后返回小镇
        this.scene.time.delayedCall(5000, () => {
            this.scene.sceneManager.switchScene('town', { x: 400, y: 300 });
        });
    }

    /**
     * Boss Rush失败
     */
    onPlayerDeath() {
        if (!this.isActive) return;

        console.log(`💀 Boss Rush失败！在第${this.currentBossIndex + 1}个Boss`);

        this.isActive = false;

        // 显示失败消息
        this.scene.showFloatingText(
            400,
            200,
            '💀 Boss Rush失败',
            '#ff0000',
            3000
        );

        const bossNames = {
            'treant_king': '树妖王',
            'yeti_king': '雪怪王',
            'dragon_lord': '龙王'
        };

        const currentBoss = this.bosses[this.currentBossIndex];

        this.scene.showFloatingText(
            400,
            240,
            `止步于: ${bossNames[currentBoss]}`,
            '#ff6600',
            2500
        );

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

        const elapsedTime = Date.now() - this.startTime;
        const seconds = Math.floor(elapsedTime / 1000);

        return {
            currentBoss: this.currentBossIndex + 1,
            totalBosses: this.bosses.length,
            elapsedTime: seconds,
            bossesDefeated: this.scores.length
        };
    }

    /**
     * 获取最佳记录
     */
    getBestRecords() {
        return {
            bestTime: this.bestTime,
            bestScore: this.bestScore,
            totalAttempts: this.attempts
        };
    }

    /**
     * 保存记录
     */
    saveRecords() {
        const records = {
            bestTime: this.bestTime,
            bestScore: this.bestScore,
            totalAttempts: this.attempts,
            lastUpdated: new Date().toISOString()
        };

        localStorage.setItem('forestQuestRPG_bossRush', JSON.stringify(records));
        console.log('💾 Boss Rush记录已保存');
    }

    /**
     * 加载记录
     */
    loadRecords() {
        try {
            const saved = localStorage.getItem('forestQuestRPG_bossRush');
            if (saved) {
                const records = JSON.parse(saved);
                this.bestTime = records.bestTime;
                this.bestScore = records.bestScore;
                this.attempts = records.totalAttempts || 0;
                console.log('📂 Boss Rush记录已加载');
            }
        } catch (error) {
            console.error('❌ 加载Boss Rush记录失败:', error);
        }
    }

    /**
     * 显示记录
     */
    showRecords() {
        const records = this.getBestRecords();

        if (!records.bestTime) {
            this.scene.showFloatingText(
                400,
                200,
                '📊 暂无记录',
                '#ffffff',
                2000
            );
            return;
        }

        const seconds = Math.floor(records.bestTime / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        this.scene.showFloatingText(
            400,
            150,
            '🏆 Boss Rush最佳纪录',
            '#ffd700',
            2500
        );

        this.scene.showFloatingText(
            400,
            190,
            `⏱️ 用时: ${minutes}分${remainingSeconds}秒`,
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
