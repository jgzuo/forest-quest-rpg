/**
 * NewGamePlusManager - 二周目管理器
 * 保留装备和等级，敌人难度提升，更好的掉落
 */
class NewGamePlusManager {
    constructor(scene) {
        this.scene = scene;
        this.isActive = false;
        this.currentCycle = 1; // 1 = normal, 2 = NG+, 3 = NG++, etc.
        this.isUnlocked = false;

        console.log('🔄 二周目管理器初始化');
    }

    /**
     * 检查是否解锁二周目
     */
    checkUnlockStatus() {
        const dragonQuest = this.scene.questManager.getQuest('quest_11_dragon_lord');
        const hasBeatenGame = dragonQuest && dragonQuest.status.status === 'completed';

        if (hasBeatenGame && !this.isUnlocked) {
            this.isUnlocked = true;
            console.log('🔄 二周目已解锁！');
        }

        return this.isUnlocked;
    }

    /**
     * 开始新游戏+（二周目）
     */
    startNewGamePlus() {
        if (!this.checkUnlockStatus()) {
            this.scene.showFloatingText(
                400,
                300,
                '🔒 需要先击败龙王!',
                '#ff6b6b',
                3000
            );
            return false;
        }

        // 增加周目数
        this.currentCycle++;
        this.isActive = true;

        console.log(`🔄 开始第${this.currentCycle}周目！`);

        // 保存当前角色数据
        const playerData = this.savePlayerData();

        // 保存装备数据
        const equipmentData = this.saveEquipmentData();

        // 保存技能树数据
        const skillTreeData = this.saveSkillTreeData();

        // 清除游戏进度（但保留角色和装备）
        this.clearGameProgress();

        // 重置世界
        this.resetWorld();

        // 恢复角色数据
        this.restorePlayerData(playerData);

        // 恢复装备数据
        this.restoreEquipmentData(equipmentData);

        // 恢复技能树数据
        this.restoreSkillTreeData(skillTreeData);

        // 应用二周目难度系数
        this.applyNewGamePlusModifiers();

        // 显示开始提示
        this.showNewGamePlusIntro();

        // 保存二周目状态
        this.saveNewGamePlusStatus();

        return true;
    }

    /**
     * 保存玩家数据
     */
    savePlayerData() {
        return {
            level: this.scene.player.level,
            xp: this.scene.player.xp,
            xpToNextLevel: this.scene.player.xpToNextLevel,
            maxHp: this.scene.player.maxHp,
            hp: this.scene.player.maxHp, // 满血开始
            attack: this.scene.player.attack,
            speed: this.scene.player.speed,
            gold: this.scene.player.gold,
            mp: this.scene.player.mp || 50,
            maxMp: this.scene.player.maxMp || 50
        };
    }

    /**
     * 保存装备数据
     */
    saveEquipmentData() {
        if (!this.scene.equipmentManager) {
            return null;
        }

        return {
            equipped: this.scene.equipmentManager.getEquippedItems(),
            inventory: this.scene.equipmentManager.getInventory()
        };
    }

    /**
     * 保存技能树数据
     */
    saveSkillTreeData() {
        if (!this.scene.skillTreeManager) {
            return null;
        }

        return {
            unlockedSkills: this.scene.skillTreeManager.getUnlockedSkills(),
            skillPoints: this.scene.skillTreeManager.getSkillPoints()
        };
    }

    /**
     * 清除游戏进度（重置任务、Boss、NPC）
     */
    clearGameProgress() {
        // 重置所有任务
        if (this.scene.questManager) {
            this.scene.questManager.resetAllQuests();
        }

        // 重置Boss击败状态
        if (window.gameData && window.gameData.enemiesDefeated) {
            // 保留敌人击败统计
            const totalKills = window.gameData.progress.enemiesDefeated;

            // 清除Boss击败记录
            Object.keys(window.gameData.enemiesDefeated).forEach(key => {
                if (key.startsWith('boss_')) {
                    delete window.gameData.enemiesDefeated[key];
                }
            });
        }

        console.log('🔄 游戏进度已重置');
    }

    /**
     * 重置世界状态
     */
    resetWorld() {
        // 重置场景
        this.scene.sceneManager.loadScene('town');

        // 重置玩家位置
        this.scene.player.setPosition(400, 300);

        console.log('🔄 世界状态已重置');
    }

    /**
     * 恢复玩家数据
     */
    restorePlayerData(playerData) {
        if (!playerData) return;

        this.scene.player.level = playerData.level;
        this.scene.player.xp = playerData.xp;
        this.scene.player.xpToNextLevel = playerData.xpToNextLevel;
        this.scene.player.maxHp = playerData.maxHp;
        this.scene.player.hp = playerData.hp;
        this.scene.player.attack = playerData.attack;
        this.scene.player.speed = playerData.speed;
        this.scene.player.gold = playerData.gold;
        this.scene.player.mp = playerData.mp;
        this.scene.player.maxMp = playerData.maxMp;

        console.log(`🔄 玩家数据已恢复 - Lv.${playerData.level}`);
    }

    /**
     * 恢复装备数据
     */
    restoreEquipmentData(equipmentData) {
        if (!equipmentData || !this.scene.equipmentManager) return;

        // 恢复已装备物品
        if (equipmentData.equipped) {
            Object.keys(equipmentData.equipped).forEach(slot => {
                const item = equipmentData.equipped[slot];
                if (item) {
                    this.scene.equipmentManager.equipItem(slot, item);
                }
            });
        }

        // 恢复物品栏
        if (equipmentData.inventory) {
            this.scene.equipmentManager.setInventory(equipmentData.inventory);
        }

        console.log('🔄 装备数据已恢复');
    }

    /**
     * 恢复技能树数据
     */
    restoreSkillTreeData(skillTreeData) {
        if (!skillTreeData || !this.scene.skillTreeManager) return;

        // 恢复已解锁技能
        if (skillTreeData.unlockedSkills) {
            skillTreeData.unlockedSkills.forEach(skillId => {
                this.scene.skillTreeManager.unlockSkill(skillId, false); // false = 不扣点数
            });
        }

        // 恢复技能点
        if (skillTreeData.skillPoints !== undefined) {
            this.scene.skillTreeManager.setSkillPoints(skillTreeData.skillPoints);
        }

        console.log('🔄 技能树数据已恢复');
    }

    /**
     * 应用二周目难度修正
     */
    applyNewGamePlusModifiers() {
        // 敌人难度系数：每周目增加50%
        // NG+ = 1.5x, NG++ = 2.0x, NG+++ = 2.5x, etc.
        this.enemyDifficultyMultiplier = 1 + ((this.currentCycle - 1) * 0.5);

        // 奖励倍率：每周目增加30%
        this.rewardMultiplier = 1 + ((this.currentCycle - 1) * 0.3);

        // 掉落率提升：每周目增加20%
        this.dropRateMultiplier = 1 + ((this.currentCycle - 1) * 0.2);

        console.log(`🔄 二周目修正值已应用:`);
        console.log(`  - 敌人难度: x${this.enemyDifficultyMultiplier.toFixed(1)}`);
        console.log(`  - 奖励倍率: x${this.rewardMultiplier.toFixed(1)}`);
        console.log(`  - 掉落率: x${this.dropRateMultiplier.toFixed(1)}`);
    }

    /**
     * 显示二周目开场提示
     */
    showNewGamePlusIntro() {
        const cycleNames = {
            2: '二周目',
            3: '三周目',
            4: '四周目',
            5: '五周目'
        };

        const cycleName = cycleNames[this.currentCycle] || `${this.currentCycle}周目`;

        this.scene.showFloatingText(
            400,
            180,
            `🔄 ${cycleName} START!`,
            '#ffd700',
            3000
        );

        this.scene.showFloatingText(
            400,
            220,
            `✨ 保留等级和装备`,
            '#ffffff',
            2500
        );

        this.scene.showFloatingText(
            400,
            250,
            `⚠️ 敌人强度 x${this.enemyDifficultyMultiplier.toFixed(1)}`,
            '#ff6b6b',
            2500
        );

        this.scene.showFloatingText(
            400,
            280,
            `💰 奖励倍率 x${this.rewardMultiplier.toFixed(1)}`,
            '#ffd700',
            2500
        );

        this.scene.showFloatingText(
            400,
            310,
            `🎁 掉落率 x${this.dropRateMultiplier.toFixed(1)}`,
            '#68d391',
            2500
        );
    }

    /**
     * 保存二周目状态
     */
    saveNewGamePlusStatus() {
        const status = {
            currentCycle: this.currentCycle,
            isActive: this.isActive,
            isUnlocked: this.isUnlocked,
            enemyDifficultyMultiplier: this.enemyDifficultyMultiplier,
            rewardMultiplier: this.rewardMultiplier,
            dropRateMultiplier: this.dropRateMultiplier,
            lastUpdated: new Date().toISOString()
        };

        localStorage.setItem('forestQuestRPG_newGamePlus', JSON.stringify(status));
        console.log('💾 二周目状态已保存');
    }

    /**
     * 加载二周目状态
     */
    loadNewGamePlusStatus() {
        try {
            const saved = localStorage.getItem('forestQuestRPG_newGamePlus');
            if (saved) {
                const status = JSON.parse(saved);
                this.currentCycle = status.currentCycle || 1;
                this.isActive = status.isActive || false;
                this.isUnlocked = status.isUnlocked || false;
                this.enemyDifficultyMultiplier = status.enemyDifficultyMultiplier || 1.0;
                this.rewardMultiplier = status.rewardMultiplier || 1.0;
                this.dropRateMultiplier = status.dropRateMultiplier || 1.0;

                console.log('📂 二周目状态已加载');
                console.log(`  当前周目: ${this.currentCycle}`);

                return status;
            }
        } catch (error) {
            console.error('❌ 加载二周目状态失败:', error);
        }

        return null;
    }

    /**
     * 获取敌人HP修正值
     */
    getEnemyHPModifier(baseHP) {
        if (!this.isActive) return baseHP;
        return Math.floor(baseHP * this.enemyDifficultyMultiplier);
    }

    /**
     * 获取敌人攻击力修正值
     */
    getEnemyAttackModifier(baseAttack) {
        if (!this.isActive) return baseAttack;
        return Math.floor(baseAttack * this.enemyDifficultyMultiplier);
    }

    /**
     * 获取奖励修正值
     */
    getRewardModifier(baseReward) {
        if (!this.isActive) return baseReward;
        return Math.floor(baseReward * this.rewardMultiplier);
    }

    /**
     * 检查是否掉落额外物品
     */
    checkExtraDrop(baseDropRate) {
        if (!this.isActive) return false;

        // 应用掉落率倍率
        const adjustedDropRate = baseDropRate * this.dropRateMultiplier;
        return Math.random() < adjustedDropRate;
    }

    /**
     * 显示当前周目信息
     */
    showCurrentCycle() {
        const cycleNames = {
            1: '普通模式',
            2: '二周目',
            3: '三周目',
            4: '四周目',
            5: '五周目'
        };

        const cycleName = cycleNames[this.currentCycle] || `第${this.currentCycle}周目`;

        this.scene.showFloatingText(
            400,
            200,
            `🔄 ${cycleName}`,
            '#ffd700',
            2500
        );

        if (this.isActive) {
            this.scene.showFloatingText(
                400,
                230,
                `⚠️ 难度: x${this.enemyDifficultyMultiplier.toFixed(1)}`,
                '#ff6b6b',
                2000
            );

            this.scene.showFloatingText(
                400,
                260,
                `💰 奖励: x${this.rewardMultiplier.toFixed(1)}`,
                '#ffd700',
                2000
            );
        }

        if (!this.isUnlocked) {
            this.scene.showFloatingText(
                400,
                290,
                '💡 击败龙王解锁二周目',
                '#ffffff',
                2000
            );
        }
    }

    /**
     * 重置到普通模式（用于测试）
     */
    resetToNormal() {
        this.currentCycle = 1;
        this.isActive = false;
        this.enemyDifficultyMultiplier = 1.0;
        this.rewardMultiplier = 1.0;
        this.dropRateMultiplier = 1.0;

        this.saveNewGamePlusStatus();

        this.scene.showFloatingText(
            400,
            300,
            '🔄 已重置到普通模式',
            '#68d391',
            2000
        );
    }
}
