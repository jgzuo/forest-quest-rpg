/**
 * Quest - 任务数据结构
 * 定义单个任务的所有属性和状态
 */
class Quest {
    constructor(questData) {
        this.id = questData.id;
        this.name = questData.name;
        this.description = questData.description;
        this.objectives = questData.objectives || [];
        this.rewards = questData.rewards || {};
        this.status = questData.status || 'not_started'; // not_started, in_progress, completed, failed
        this.currentStep = questData.currentStep || 0;
        this.accepted = questData.accepted || false;
        this.completed = questData.completed || false;

        // Milestone 6: New properties
        this.unlocks = questData.unlocks || null; // What this quest unlocks
        this.prerequisites = questData.prerequisites || []; // Quest IDs required to start this quest
    }

    /**
     * 开始任务
     */
    start() {
        this.status = 'in_progress';
        this.accepted = true;
        console.log(`📜 任务开始: ${this.name}`);
    }

    /**
     * 更新任务目标进度
     * @param {string} objectiveType - 目标类型 (kill, collect, etc.)
     * @param {string} target - 目标对象
     * @param {number} amount - 增加的数量
     */
    updateObjective(objectiveType, target, amount = 1) {
        if (this.status !== 'in_progress') {
            return false;
        }

        let updated = false;

        this.objectives.forEach((objective, index) => {
            if (objective.type === objectiveType && objective.target === target) {
                if (!objective.current) {
                    objective.current = 0;
                }
                objective.current = Math.min(objective.current + amount, objective.required);
                updated = true;
                console.log(`📊 任务目标更新: [${index + 1}/${this.objectives.length}] ${objective.description} - ${objective.current}/${objective.required}`);
            }
        });

        if (updated) {
            this.checkCompletion();
        }

        return updated;
    }

    /**
     * 检查任务是否完成
     */
    checkCompletion() {
        if (this.status !== 'in_progress') {
            return;
        }

        const allCompleted = this.objectives.every(objective => {
            const current = objective.current || 0;
            return current >= objective.required;
        });

        if (allCompleted) {
            this.status = 'completed';
            this.completed = true;
            console.log(`✅ 任务完成: ${this.name}`);
            return true;
        }

        return false;
    }

    /**
     * 获取任务进度百分比
     */
    getProgress() {
        if (this.objectives.length === 0) {
            return 0;
        }

        let totalProgress = 0;
        this.objectives.forEach(objective => {
            const current = objective.current || 0;
            const progress = (current / objective.required) * 100;
            totalProgress += progress;
        });

        return Math.floor(totalProgress / this.objectives.length);
    }

    /**
     * 获取当前目标描述
     */
    getCurrentObjective() {
        if (this.status !== 'in_progress') {
            return null;
        }

        for (let i = 0; i < this.objectives.length; i++) {
            const objective = this.objectives[i];
            const current = objective.current || 0;
            if (current < objective.required) {
                return {
                    index: i,
                    description: objective.description,
                    current: current,
                    required: objective.required
                };
            }
        }

        return null;
    }

    /**
     * 领取奖励
     */
    claimRewards(scene) {
        if (!this.completed) {
            console.warn('⚠️ 任务未完成，无法领取奖励');
            return false;
        }

        const playerX = scene.player.x;
        const playerY = scene.player.y;
        let rewardCount = 0;
        let yOffset = 0;

        // 给予金币奖励
        if (this.rewards.gold) {
            scene.player.gold += this.rewards.gold;
            console.log(`💰 获得金币: +${this.rewards.gold}`);

            // 显示金币奖励
            scene.showFloatingText(
                playerX,
                playerY - 100 - (yOffset * 20),
                `💰 +${this.rewards.gold} 金币`,
                '#ffd700',
                2000
            );
            yOffset++;
            rewardCount++;
        }

        // 给予经验奖励
        if (this.rewards.xp) {
            console.log(`⭐ 获得经验: +${this.rewards.xp}`);

            // 显示经验奖励
            scene.showFloatingText(
                playerX,
                playerY - 100 - (yOffset * 20),
                `⭐ +${this.rewards.xp} XP`,
                '#00bfff',
                2000
            );
            yOffset++;
            rewardCount++;

            // 实际给予经验
            scene.gainXP(this.rewards.xp);
        }

        // 给予物品奖励
        if (this.rewards.items && this.rewards.items.length > 0) {
            this.rewards.items.forEach(item => {
                console.log(`🎁 获得物品: ${item.name}`);

                // 显示物品奖励
                scene.showFloatingText(
                    playerX,
                    playerY - 100 - (yOffset * 20),
                    `🎁 ${item.name}`,
                    '#ff69b4',
                    2000
                );
                yOffset++;
                rewardCount++;
            });
        }

        // 如果有奖励，显示奖励总计提示
        if (rewardCount > 0) {
            scene.showFloatingText(
                playerX,
                playerY - 120 - (yOffset * 20),
                `🎉 领取 ${rewardCount} 项奖励!`,
                '#00ff00',
                2500
            );
        }

        console.log(`🎉 已领取任务奖励: ${this.name}`);
        return true;
    }

    /**
     * 检查任务的前置条件是否满足
     * @param {QuestManager} questManager - 任务管理器
     * @returns {boolean} 前置条件是否满足
     */
    checkPrerequisites(questManager) {
        if (!this.prerequisites || this.prerequisites.length === 0) {
            return true; // 无前置条件
        }

        // 检查所有前置任务是否完成
        const allPrerequisitesMet = this.prerequisites.every(prereqId => {
            const prereqQuest = questManager.getQuest(prereqId);
            return prereqQuest && prereqQuest.status === 'completed';
        });

        if (!allPrerequisitesMet) {
            console.log(`🔒 任务 "${this.name}" 的前置条件未满足`);
            return false;
        }

        console.log(`✅ 任务 "${this.name}" 的前置条件已满足`);
        return true;
    }

    /**
     * 获取任务的前置条件描述
     * @returns {string} 前置条件描述
     */
    getPrerequisiteDescription() {
        if (!this.prerequisites || this.prerequisites.length === 0) {
            return '无前置条件';
        }

        const questNames = {
            'quest_1_moles': '鼹鼠威胁',
            'quest_2_gems': '宝石收集',
            'quest_3_boss': '树妖王',
            'quest_4_slime_hunter': '史莱姆狩猎',
            'quest_5_blade_guardian': '守护者之刃',
            'quest_6_lost_cargo': '失落的货物'
        };

        const requiredQuests = this.prerequisites.map(id => questNames[id] || id).join('、');
        return `需要完成: ${requiredQuests}`;
    }

    /**
     * 序列化任务数据（用于保存）
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            objectives: this.objectives,
            rewards: this.rewards,
            status: this.status,
            accepted: this.accepted,
            completed: this.completed
        };
    }

    /**
     * 从JSON数据创建Quest对象
     */
    static fromJSON(json) {
        return new Quest(json);
    }
}
