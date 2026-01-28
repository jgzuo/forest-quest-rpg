/**
 * QuestManager - 任务管理器
 * 管理游戏中所有任务的创建、更新、完成和保存
 */
class QuestManager {
    constructor(scene) {
        this.scene = scene;
        this.quests = new Map(); // 所有可用任务
        this.activeQuests = []; // 当前激活的任务
        this.completedQuests = []; // 已完成的任务

        console.log('📜 任务管理器初始化');
        this.initializeQuests();
    }

    /**
     * 初始化所有任务
     */
    initializeQuests() {
        // 导入任务定义
        const questDefs = window.QUEST_DEFINITIONS || {};

        for (const [key, questDef] of Object.entries(questDefs)) {
            const quest = new Quest(questDef);
            this.quests.set(questDef.id, quest);
            console.log(`📋 任务加载: ${quest.name} (${quest.id})`);
        }

        console.log(`✅ 已加载 ${this.quests.size} 个任务`);
    }

    /**
     * 开始任务
     * @param {string} questId - 任务ID
     */
    startQuest(questId) {
        const quest = this.quests.get(questId);

        if (!quest) {
            console.warn(`⚠️ 任务不存在: ${questId}`);
            return false;
        }

        if (quest.status === 'in_progress') {
            console.warn(`⚠️ 任务已在进行中: ${quest.name}`);
            return false;
        }

        if (quest.status === 'completed') {
            console.warn(`⚠️ 任务已完成: ${quest.name}`);
            return false;
        }

        // Milestone 6: Check prerequisites
        if (!quest.checkPrerequisites(this)) {
            const prereqDesc = quest.getPrerequisiteDescription();
            this.scene.showFloatingText(400, 300, `🔒 ${prereqDesc}`, '#ff6b6b', 3000);
            return false;
        }

        quest.start();
        this.activeQuests.push(quest);

        console.log(`📜 接受任务: ${quest.name}`);
        this.scene.events.emit('questStarted', quest);

        return true;
    }

    /**
     * 完成任务并领取奖励
     * @param {string} questId - 任务ID
     */
    completeQuest(questId) {
        const quest = this.quests.get(questId);

        if (!quest) {
            console.warn(`⚠️ 任务不存在: ${questId}`);
            return false;
        }

        if (!quest.completed) {
            console.warn(`⚠️ 任务未完成: ${quest.name}`);
            return false;
        }

        // 领取奖励
        const rewardsClaimed = quest.claimRewards(this.scene);

        if (rewardsClaimed) {
            // 从激活任务列表移除
            this.activeQuests = this.activeQuests.filter(q => q.id !== questId);
            this.completedQuests.push(quest);

            this.scene.events.emit('questCompleted', quest);

            // 自动保存
            if (this.scene.saveManager) {
                this.scene.saveManager.autoSave();
            }

            return true;
        }

        return false;
    }

    /**
     * 更新任务目标进度
     * @param {string} objectiveType - 目标类型 (kill, collect, etc.)
     * @param {string} target - 目标对象
     * @param {number} amount - 增加的数量
     */
    updateQuestObjectives(objectiveType, target, amount = 1) {
        let updatedCount = 0;
        let questCompleted = false;

        this.activeQuests.forEach(quest => {
            const updated = quest.updateObjective(objectiveType, target, amount);

            if (updated) {
                updatedCount++;
                this.scene.events.emit('questUpdated', quest);

                // 检查任务是否刚刚完成
                if (quest.completed && !quest.rewardsClaimed) {
                    questCompleted = true;
                    this.scene.events.emit('questObjectiveCompleted', quest);

                    // 显示任务完成提示 - 更明显的视觉效果
                    const playerX = this.scene.player.x;
                    const playerY = this.scene.player.y;

                    // 主完成提示 - 更大、更显眼
                    this.scene.showFloatingText(
                        playerX,
                        playerY - 80,
                        `✨ 任务完成! ✨`,
                        '#ffd700',
                        3000
                    );

                    // 任务名称
                    this.scene.showFloatingText(
                        playerX,
                        playerY - 60,
                        quest.name,
                        '#00ff00',
                        2500
                    );

                    console.log(`🎉 任务完成: ${quest.name}`);
                }
            }
        });

        if (updatedCount > 0) {
            console.log(`📊 更新了 ${updatedCount} 个任务目标`);
        }

        if (questCompleted) {
            // 自动保存
            if (this.scene.saveManager) {
                this.scene.saveManager.autoSave();
            }
        }

        return updatedCount > 0;
    }

    /**
     * 处理敌人击杀事件
     * @param {string} enemyType - 敌人类型
     */
    onEnemyKilled(enemyType) {
        console.log(`⚔️ 敌人被击败: ${enemyType}`);
        this.updateQuestObjectives('kill', enemyType, 1);
    }

    /**
     * 处理物品收集事件
     * @param {string} itemType - 物品类型
     * @param {number} amount - 收集数量
     */
    onItemCollected(itemType, amount = 1) {
        console.log(`🎁 物品收集: ${itemType} x${amount}`);
        this.updateQuestObjectives('collect', itemType, amount);
    }

    /**
     * 处理Boss击败事件
     * @param {string} bossId - Boss ID
     */
    onBossDefeated(bossId) {
        console.log(`👑 Boss被击败: ${bossId}`);
        this.updateQuestObjectives('kill', bossId, 1);
    }

    /**
     * 获取任务信息
     * @param {string} questId - 任务ID
     */
    getQuest(questId) {
        return this.quests.get(questId);
    }

    /**
     * 获取所有激活任务
     */
    getActiveQuests() {
        return this.activeQuests;
    }

    /**
     * 获取已完成任务
     */
    getCompletedQuests() {
        return this.completedQuests;
    }

    /**
     * 获取所有任务
     */
    getAllQuests() {
        return Array.from(this.quests.values());
    }

    /**
     * 检查任务是否可接受
     * @param {string} questId - 任务ID
     */
    canAcceptQuest(questId) {
        const quest = this.quests.get(questId);

        if (!quest) {
            return false;
        }

        return quest.status === 'not_started';
    }

    /**
     * 检查任务是否已完成
     * @param {string} questId - 任务ID
     */
    isQuestCompleted(questId) {
        const quest = this.quests.get(questId);
        return quest && quest.completed;
    }

    /**
     * 序列化任务数据（用于保存）
     */
    toJSON() {
        return {
            quests: Array.from(this.quests.values()).map(quest => quest.toJSON()),
            activeQuests: this.activeQuests.map(q => q.id),
            completedQuests: this.completedQuests.map(q => q.id)
        };
    }

    /**
     * 从保存数据加载任务状态
     * @param {Object} saveData - 保存的任务数据
     */
    loadFromSaveData(saveData) {
        if (!saveData.quests) {
            console.warn('⚠️ 存档中没有任务数据');
            return;
        }

        console.log('📂 加载任务数据...');

        // 恢复任务状态
        saveData.quests.forEach(questData => {
            const quest = new Quest(questData);
            this.quests.set(quest.id, quest);
        });

        // 恢复激活任务列表
        this.activeQuests = saveData.activeQuests
            .map(id => this.quests.get(id))
            .filter(q => q !== undefined);

        // 恢复已完成任务列表
        this.completedQuests = saveData.completedQuests
            .map(id => this.quests.get(id))
            .filter(q => q !== undefined);

        console.log(`✅ 任务加载完成: ${this.activeQuests.length} 进行中, ${this.completedQuests.length} 已完成`);
    }

    /**
     * 获取任务统计信息
     */
    getStats() {
        return {
            total: this.quests.size,
            active: this.activeQuests.length,
            completed: this.completedQuests.length,
            available: Array.from(this.quests.values()).filter(q => q.status === 'not_started').length
        };
    }

    /**
     * 显示当前任务目标
     */
    showCurrentObjectives() {
        if (this.activeQuests.length === 0) {
            console.log('📋 当前没有激活的任务');
            return;
        }

        console.log('📋 当前任务目标:');
        this.activeQuests.forEach(quest => {
            const objective = quest.getCurrentObjective();
            if (objective) {
                console.log(`  - ${quest.name}: ${objective.description} (${objective.current}/${objective.required})`);
            }
        });
    }
}
