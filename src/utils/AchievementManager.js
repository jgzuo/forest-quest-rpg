/**
 * AchievementManager - 成就管理器
 * 管理游戏成就的解锁和显示
 */
class AchievementManager {
    constructor(scene) {
        this.scene = scene;
        this.achievements = new Map();
        this.unlockedAchievements = [];

        this.initializeAchievements();
        console.log('🏆 成就管理器初始化');
    }

    /**
     * 初始化所有成就
     */
    initializeAchievements() {
        const achievementList = [
            {
                id: 'first_blood',
                name: '初次胜利',
                description: '击败第一个敌人',
                icon: '⚔️',
                unlocked: false
            },
            {
                id: 'mole_hunter',
                name: '鼹鼠猎人',
                description: '击败10只鼹鼠',
                icon: '🐹',
                unlocked: false
            },
            {
                id: 'gem_collector',
                name: '宝石猎人',
                description: '收集3颗宝石',
                icon: '💎',
                unlocked: false
            },
            {
                id: 'forest_guardian',
                name: '森林守护者',
                description: '击败树妖王',
                icon: '🌲',
                unlocked: false
            },
            {
                id: 'max_level',
                name: '满级英雄',
                description: '达到等级10',
                icon: '⭐',
                unlocked: false
            },
            {
                id: 'wealthy',
                name: '富有之人',
                description: '拥有1000金币',
                icon: '💰',
                unlocked: false
            },
            {
                id: 'quest_master',
                name: '任务大师',
                description: '完成所有任务',
                icon: '📜',
                unlocked: false
            },
            {
                id: 'survivor',
                name: '幸存者',
                description: '在Boss战中存活',
                icon: '💪',
                unlocked: false
            },
            // ============ Milestone 7: 新区域成就 ============
            {
                id: 'snow_explorer',
                name: '冰雪征服者',
                description: '到达雪山区域',
                icon: '🏔️',
                unlocked: false
            },
            {
                id: 'yeti_slayer',
                name: '雪山大屠杀者',
                description: '击败雪山之王',
                icon: '❄️',
                unlocked: false
            },
            {
                id: 'volcanic_survivor',
                name: '熔岩幸存者',
                description: '到达火山区域',
                icon: '🌋',
                unlocked: false
            },
            {
                id: 'dragon_lord',
                name: '龙王终结者',
                description: '击败龙王',
                icon: '🐉',
                unlocked: false
            },
            // ============ Milestone 7: 终局内容成就 ============
            {
                id: 'boss_rush_veteran',
                name: 'Boss Rush老手',
                description: '完成Boss Rush模式',
                icon: '👑',
                unlocked: false
            },
            {
                id: 'infinite_explorer',
                name: '无尽探索者',
                description: '在无尽地牢中达到10层',
                icon: '🏰',
                unlocked: false
            },
            {
                id: 'arena_champion',
                name: '竞技场冠军',
                description: '在生存竞技场中存活20波',
                icon: '🏆',
                unlocked: false
            },
            {
                id: 'speed_runner',
                name: '速度之星',
                description: '在限时挑战中50秒内击败50个敌人',
                icon: '⚡',
                unlocked: false
            },
            // ============ 装备成就 ============
            {
                id: 'legendary_collector',
                name: '传说收藏家',
                description: '收集5件传说装备',
                icon: '💎',
                unlocked: false
            },
            {
                id: 'dragon_hero',
                name: '屠龙英雄',
                description: '装备全套屠龙装备',
                icon: '🐲',
                unlocked: false
            },
            // ============ 技能成就 ============
            {
                id: 'skill_master',
                name: '技能大师',
                description: '解锁所有技能树节点',
                icon: '🌳',
                unlocked: false
            },
            {
                id: 'combo_king',
                name: '连击之王',
                description: '达到30连击',
                icon: '🔥',
                unlocked: false
            },
            // ============ 二周目成就 ============
            {
                id: 'new_game_plus',
                name: '轮回者',
                description: '开始第一次二周目',
                icon: '🔄',
                unlocked: false
            },
            {
                id: 'cycle_master',
                name: '永恒轮回者',
                description: '完成5次二周目',
                icon: '♾️',
                unlocked: false
            },
            // ============ 统计成就 ============
            {
                id: 'enemy_slayer_100',
                name: '百斩',
                description: '累计击败100个敌人',
                icon: '⚔️',
                unlocked: false
            },
            {
                id: 'enemy_slayer_1000',
                name: '千斩',
                description: '累计击败1000个敌人',
                icon: '💀',
                unlocked: false
            },
            {
                id: 'gold_tycoon',
                name: '黄金大亨',
                description: '累计获得10000金币',
                icon: '💰',
                unlocked: false
            },
            {
                id: 'completionist',
                name: '完美主义者',
                description: '解锁所有其他成就',
                icon: '🌟',
                unlocked: false
            }
        ];

        achievementList.forEach(achievement => {
            this.achievements.set(achievement.id, achievement);
        });

        console.log(`🏆 已加载 ${this.achievements.size} 个成就`);
    }

    /**
     * 解锁成就
     * @param {string} achievementId - 成就ID
     */
    unlock(achievementId) {
        const achievement = this.achievements.get(achievementId);

        if (!achievement) {
            console.warn(`⚠️ 成不存在: ${achievementId}`);
            return false;
        }

        if (achievement.unlocked) {
            return false; // 已解锁
        }

        // 解锁成就
        achievement.unlocked = true;
        this.unlockedAchievements.push(achievement);

        console.log(`🏆 成就解锁: ${achievement.icon} ${achievement.name}`);

        // 显示成就解锁通知
        this.showAchievementNotification(achievement);

        // 保存成就状态
        this.saveAchievements();

        return true;
    }

    /**
     * 显示成就解锁通知（增强版）
     */
    showAchievementNotification(achievement) {
        const screenCenterX = this.scene.cameras.main.width / 2;
        const screenCenterY = this.scene.cameras.main.height / 2;

        // 播放成就解锁音效
        if (this.scene.audioManager) {
            this.scene.audioManager.playLevelUp(); // 使用升级音效作为成就音效
        }

        // 创建容器
        const container = this.scene.add.container(screenCenterX, screenCenterY - 100);
        container.setScrollFactor(0);
        container.setDepth(5000);
        container.setAlpha(0); // 初始透明，用于淡入动画

        // 创建闪光背景效果
        const flashBg = this.scene.add.rectangle(0, 0, 420, 100, 0xffd700, 0.3);
        flashBg.setStrokeStyle(6, 0xffd700);
        container.add(flashBg);

        // 创建半透明黑色背景
        const bg = this.scene.add.rectangle(0, 0, 400, 90, 0x000000, 0.95);
        container.add(bg);

        // 创建左侧金色竖条装饰
        const leftBar = this.scene.add.rectangle(-190, 0, 6, 80, 0xffd700);
        container.add(leftBar);

        // 创建右侧金色竖条装饰
        const rightBar = this.scene.add.rectangle(190, 0, 6, 80, 0xffd700);
        container.add(rightBar);

        // 创建成就图标（带发光效果）
        const iconBg = this.scene.add.circle(-150, 5, 35, 0xffd700, 0.2);
        container.add(iconBg);

        const icon = this.scene.add.text(-150, 5, achievement.icon, {
            fontFamily: 'Arial',
            fontSize: '48px',
            fill: '#ffd700',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        icon.setScale(0); // 初始缩放为0，用于弹出动画
        container.add(icon);

        // 创建"成就解锁"标题
        const title = this.scene.add.text(30, -30, '🏆 成就解锁！', {
            fontFamily: 'Noto Sans SC',
            fontSize: 'bold 20px',
            fill: '#ffd700',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0, 0.5);
        container.add(title);

        // 创建成就名称
        const name = this.scene.add.text(30, 0, achievement.name, {
            fontFamily: 'Noto Sans SC',
            fontSize: '18px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0, 0.5);
        container.add(name);

        // 创建成就描述
        const desc = this.scene.add.text(30, 25, achievement.description, {
            fontFamily: 'Noto Sans SC',
            fontSize: '13px',
            fill: '#aaaaaa'
        }).setOrigin(0, 0.5);
        container.add(desc);

        // 创建粒子效果（金色星星）
        const particles = [];
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const distance = 180;
            const star = this.scene.add.text(
                Math.cos(angle) * distance,
                Math.sin(angle) * distance,
                '✨',
                {
                    font: '16px Arial',
                    fill: '#ffd700'
                }
            ).setOrigin(0.5);
            star.setScale(0);
            star.setAlpha(0);
            container.add(star);
            particles.push(star);
        }

        // 添加到场景
        this.scene.add.existing(container);

        // 淡入动画
        this.scene.tweens.add({
            targets: container,
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });

        // 图标弹出动画
        this.scene.tweens.add({
            targets: icon,
            scaleX: 1,
            scaleY: 1,
            duration: 400,
            delay: 100,
            ease: 'Back.easeOut'
        });

        // 粒子动画
        particles.forEach((star, index) => {
            this.scene.tweens.add({
                targets: star,
                scaleX: 1,
                scaleY: 1,
                alpha: 1,
                duration: 300,
                delay: 200 + index * 50,
                ease: 'Power2',
                yoyo: true,
                repeat: 1,
                onYoyo: () => {
                    // 第二次播放：向外扩散
                    this.scene.tweens.add({
                        targets: star,
                        x: star.x * 1.5,
                        y: star.y * 1.5,
                        alpha: 0,
                        duration: 500,
                        ease: 'Power2'
                    });
                }
            });
        });

        // 闪光背景闪烁动画
        this.scene.tweens.add({
            targets: flashBg,
            alpha: 0.6,
            duration: 200,
            yoyo: true,
            repeat: 2,
            delay: 300
        });

        // 背景轻微缩放动画（呼吸效果）
        this.scene.tweens.add({
            targets: bg,
            scaleX: 1.02,
            scaleY: 1.02,
            duration: 800,
            yoyo: true,
            repeat: 2,
            delay: 400,
            ease: 'Sine.easeInOut'
        });

        // 3秒后淡出并销毁
        this.scene.tweens.add({
            targets: container,
            alpha: 0,
            duration: 500,
            delay: 3000,
            ease: 'Power2',
            onComplete: () => {
                container.destroy();
                console.log(`✅ 成就通知已销毁: ${achievement.name}`);
            }
        });
    }

    /**
     * 检查成就条件
     */
    checkAchievements() {
        const player = this.scene.player;
        if (!player) return;

        // 检查等级成就
        if (player.level >= 10) {
            this.unlock('max_level');
        }

        // 检查金币成就
        if (player.gold >= 1000) {
            this.unlock('wealthy');
        }

        // 检查任务完成成就
        if (this.scene.questManager) {
            const completedCount = this.scene.questManager.getCompletedQuests().length;
            if (completedCount >= 3) {
                this.unlock('quest_master');
            }
        }
    }

    /**
     * 保存成就状态
     */
    saveAchievements() {
        const achievementData = {
            unlocked: this.unlockedAchievements.map(a => a.id)
        };

        try {
            localStorage.setItem('forestQuestRPG_achievements', JSON.stringify(achievementData));
            console.log('💾 成就已保存');
        } catch (error) {
            console.error('❌ 保存成就失败:', error);
        }
    }

    /**
     * 加载成就状态
     */
    loadAchievements() {
        try {
            const data = localStorage.getItem('forestQuestRPG_achievements');
            if (!data) return;

            const achievementData = JSON.parse(data);

            // 恢复解锁状态
            achievementData.unlocked.forEach(id => {
                const achievement = this.achievements.get(id);
                if (achievement && !achievement.unlocked) {
                    achievement.unlocked = true;
                    this.unlockedAchievements.push(achievement);
                }
            });

            console.log(`📂 已加载 ${achievementData.unlocked.length} 个成就`);
        } catch (error) {
            console.error('❌ 加载成就失败:', error);
        }
    }

    /**
     * 获取成就统计
     */
    getStats() {
        return {
            total: this.achievements.size,
            unlocked: this.unlockedAchievements.length,
            locked: this.achievements.size - this.unlockedAchievements.length,
            percentage: Math.floor((this.unlockedAchievements.length / this.achievements.size) * 100)
        };
    }

    /**
     * 获取所有成就
     */
    getAllAchievements() {
        return Array.from(this.achievements.values());
    }

    /**
     * 获取已解锁成就
     */
    getUnlockedAchievements() {
        return this.unlockedAchievements;
    }

    /**
     * 清理
     */
    destroy() {
        console.log('🏆 成就管理器已清理');
    }
}
