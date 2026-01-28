/**
 * SkillTreeManager - 技能树系统管理器
 * 管理技能点、技能节点解锁、效果应用等
 * @version 1.0 - Milestone 7 Sprint 3
 */
class SkillTreeManager {
    constructor(scene) {
        this.scene = scene;
        this.player = scene.player;

        // 技能点 (每级获得1点)
        this.skillPoints = 0;

        // 已解锁的技能节点 { nodeId: { rank: number } }
        this.unlockedNodes = {};

        // 技能树效果加成
        this.bonuses = {
            attackPercent: 0,
            critChance: 0,
            critDamage: 0,
            hpPercent: 0,
            mpPercent: 0,
            defense: 0,
            damageReduction: 0,
            cooldownReduction: 0,
            allDamagePercent: 0,
            hpRegenPercent: 0,
            mpRegen: 0,
            mpRegenPercent: 0
        };

        console.log('🌳 SkillTreeManager 初始化完成');
    }

    /**
     * 添加技能点 (升级时调用)
     * @param {number} amount - 增加的点数
     */
    addSkillPoints(amount = 1) {
        this.skillPoints += amount;
        console.log(`⭐ 获得技能点: +${amount}, 当前: ${this.skillPoints}`);

        // 显示提示
        this.scene.showFloatingText(
            this.player.x,
            this.player.y - 80,
            `技能点 +${amount}`,
            '#f59e0b',
            2000
        );
    }

    /**
     * 获取可用技能点
     * @returns {number}
     */
    getAvailableSkillPoints() {
        return this.skillPoints;
    }

    /**
     * 解锁/升级技能节点
     * @param {string} nodeId - 节点ID
     * @returns {boolean} 是否成功
     */
    unlockNode(nodeId) {
        const node = getSkillTreeNode(nodeId);
        if (!node) {
            console.error(`❌ 技能节点不存在: ${nodeId}`);
            return false;
        }

        // 检查当前等级
        const currentRank = this.unlockedNodes[nodeId] ? this.unlockedNodes[nodeId].rank : 0;

        // 检查是否已满级
        if (currentRank >= node.maxRank) {
            this.scene.showFloatingText(
                this.player.x,
                this.player.y - 60,
                '已满级!',
                '#ff6b6b',
                1500
            );
            return false;
        }

        // 检查技能点是否足够
        if (this.skillPoints < node.cost) {
            this.scene.showFloatingText(
                this.player.x,
                this.player.y - 60,
                `技能点不足! 需要 ${node.cost} 点`,
                '#ff6b6b',
                2000
            );
            return false;
        }

        // 检查等级要求
        const playerLevel = this.player.level || 1;
        if (node.level > playerLevel) {
            this.scene.showFloatingText(
                this.player.x,
                this.player.y - 60,
                `等级不足! 需要 ${node.level} 级`,
                '#ff6b6b',
                2000
            );
            return false;
        }

        // 检查前置条件
        const prerequisitesMet = node.prerequisites.every(prereqId => {
            const prereqNode = this.unlockedNodes[prereqId];
            return prereqNode && prereqNode.rank > 0;
        });

        if (!prerequisitesMet) {
            this.scene.showFloatingText(
                this.player.x,
                this.player.y - 60,
                '需要先解锁前置技能!',
                '#ff6b6b',
                2000
            );
            return false;
        }

        // 消耗技能点
        this.skillPoints -= node.cost;

        // 升级节点
        this.unlockedNodes[nodeId] = {
            rank: currentRank + 1,
            unlockedAt: Date.now()
        };

        // 应用效果
        this.applyNodeEffect(node, currentRank + 1);

        // 显示成功提示
        this.scene.showFloatingText(
            this.player.x,
            this.player.y - 40,
            `解锁: ${node.name} (${currentRank + 1}/${node.maxRank})`,
            '#68d391',
            2000
        );

        // 播放音效 (占位符)
        // this.scene.audioManager.playSkillUnlock();

        console.log(`✅ 解锁技能节点: ${node.name} (Rank ${currentRank + 1}/${node.maxRank})`);
        return true;
    }

    /**
     * 应用技能节点效果
     * @param {object} node - 节点对象
     * @param {number} rank - 等级
     */
    applyNodeEffect(node, rank) {
        const effects = node.effects || {};

        // 累加效果
        Object.entries(effects).forEach(([key, value]) => {
            if (this.bonuses.hasOwnProperty(key)) {
                this.bonuses[key] += value * rank;
                console.log(`  ${key}: +${value * rank}`);
            }
        });

        // 主动技能升级特殊处理
        if (node.type === SKILL_NODE_TYPES.ACTIVE_UPGRADE) {
            this.upgradeActiveSkill(node, rank);
        }

        // 重新计算玩家属性
        this.recalculatePlayerStats();
    }

    /**
     * 升级主动技能
     * @param {object} node - 节点对象
     * @param {number} rank - 等级
     */
    upgradeActiveSkill(node, rank) {
        const skillId = node.skillToUpgrade;
        if (!skillId) return;

        const skillSystem = this.scene.skillSystem;
        if (!skillSystem) return;

        const skill = skillSystem.getSkillState(skillId);
        if (!skill) return;

        // 应用技能升级效果
        const effects = node.effects || {};

        if (effects.damageMultiplier && skill.definition) {
            skill.definition.damageMultiplier += effects.damageMultiplier * rank;
            console.log(`⚔️ ${skill.definition.name} 伤害提升: +${(effects.damageMultiplier * rank * 100).toFixed(0)}%`);
        }

        if (effects.cooldownReduction && skill.definition) {
            skill.definition.cooldown -= effects.cooldownReduction * rank;
            console.log(`⏱️ ${skill.definition.name} 冷却减少: -${(effects.cooldownReduction * rank / 1000).toFixed(1)}秒`);
        }

        if (effects.aoeRadius && skill.definition) {
            skill.definition.aoeRadius += effects.aoeRadius * rank;
            console.log(`🌀 ${skill.definition.name} 范围扩大: +${effects.aoeRadius * rank}px`);
        }

        if (effects.dashDistance && skill.definition) {
            skill.definition.dashDistance += effects.dashDistance * rank;
            console.log(`💨 ${skill.definition.name} 冲锋距离: +${effects.dashDistance * rank}px`);
        }

        if (effects.knockbackForce && skill.definition) {
            skill.definition.knockbackForce += effects.knockbackForce * rank;
            console.log(`💨 ${skill.definition.name} 击退力度: +${effects.knockbackForce * rank}`);
        }

        if (effects.healPercent && skill.definition) {
            skill.definition.healPercent += effects.healPercent * rank;
            console.log(`💚 ${skill.definition.name} 治疗量: +${(effects.healPercent * rank * 100).toFixed(0)}%`);
        }
    }

    /**
     * 重新计算玩家属性
     */
    recalculatePlayerStats() {
        // 应用百分比加成到玩家基础属性
        const baseAttack = this.player.attack || 0;
        const baseMaxHp = this.player.maxHp || 0;
        const baseMaxMp = this.player.maxMp || 0;

        // 攻击力加成
        if (this.bonuses.attackPercent > 0) {
            const bonusAttack = Math.floor(baseAttack * this.bonuses.attackPercent);
            this.player.attack = baseAttack + bonusAttack;
            console.log(`⚔️ 攻击力: ${baseAttack} → ${this.player.attack} (+${bonusAttack})`);
        }

        // 生命值加成
        if (this.bonuses.hpPercent > 0) {
            const bonusHp = Math.floor(baseMaxHp * this.bonuses.hpPercent);
            this.player.maxHp = baseMaxHp + bonusHp;
            this.player.hp = Math.min(this.player.hp, this.player.maxHp);
            console.log(`❤️ 最大生命值: ${baseMaxHp} → ${this.player.maxHp} (+${bonusHp})`);
        }

        // 魔法值加成
        if (this.bonuses.mpPercent > 0) {
            const bonusMp = Math.floor(baseMaxMp * this.bonuses.mpPercent);
            this.player.maxMp = baseMaxMp + bonusMp;
            if (this.player.mp) {
                this.player.mp = Math.min(this.player.mp, this.player.maxMp);
            }
            console.log(`💙 最大魔法值: ${baseMaxMp} → ${this.player.maxMp} (+${bonusMp})`);
        }

        // 暴击率
        if (this.bonuses.critChance > 0) {
            this.player.critChance = (this.player.critChance || 0.15) + this.bonuses.critChance;
            console.log(`💥 暴击率: ${(this.player.critChance * 100).toFixed(1)}%`);
        }

        // 防御力
        if (this.bonuses.defense > 0) {
            this.player.defense = (this.player.defense || 0) + this.bonuses.defense;
            console.log(`🛡️ 防御力: ${this.player.defense}`);
        }

        // 更新UI
        if (this.scene.updateUI) {
            this.scene.updateUI();
        }
    }

    /**
     * 获取节点信息
     * @param {string} nodeId - 节点ID
     * @returns {object|null}
     */
    getNodeInfo(nodeId) {
        const node = getSkillTreeNode(nodeId);
        if (!node) return null;

        const currentRank = this.unlockedNodes[nodeId] ? this.unlockedNodes[nodeId].rank : 0;
        const canUnlock = this.canUnlock(nodeId);

        return {
            ...node,
            currentRank: currentRank,
            canUnlock: canUnlock,
            isMaxed: currentRank >= node.maxRank,
            nextRankCost: node.cost,
            description: this.getNodeDescription(node, currentRank)
        };
    }

    /**
     * 检查节点是否可解锁
     * @param {string} nodeId - 节点ID
     * @returns {boolean}
     */
    canUnlock(nodeId) {
        const node = getSkillTreeNode(nodeId);
        if (!node) return false;

        // 检查等级
        const playerLevel = this.player.level || 1;
        if (node.level > playerLevel) return false;

        // 检查技能点
        if (this.skillPoints < node.cost) return false;

        // 检查前置条件
        const prerequisitesMet = node.prerequisites.every(prereqId => {
            const prereqNode = this.unlockedNodes[prereqId];
            return prereqNode && prereqNode.rank > 0;
        });

        return prerequisitesMet;
    }

    /**
     * 获取节点描述
     * @param {object} node - 节点对象
     * @param {number} currentRank - 当前等级
     * @returns {string}
     */
    getNodeDescription(node, currentRank) {
        let desc = `${node.name}\n`;
        desc += `[${SKILL_TREE_BRANCHES[node.branch.toUpperCase()].name}]\n\n`;
        desc += `${node.description}\n\n`;

        // 当前效果
        if (currentRank > 0) {
            desc += `当前效果 (等级 ${currentRank}/${node.maxRank}):\n`;
            Object.entries(node.effects).forEach(([key, value]) => {
                const currentValue = value * currentRank;
                desc += `  ${getEffectDescription({ [key]: currentValue })}\n`;
            });
            desc += '\n';
        }

        // 下一级效果
        if (currentRank < node.maxRank) {
            const nextRank = currentRank + 1;
            desc += `下一级效果 (等级 ${nextRank}):\n`;
            Object.entries(node.effects).forEach(([key, value]) => {
                const nextValue = value * nextRank;
                desc += `  ${getEffectDescription({ [key]: nextValue })}\n`;
            });
        } else {
            desc += '已达到最大等级\n';
        }

        return desc;
    }

    /**
     * 获取所有已解锁节点
     * @returns {object}
     */
    getUnlockedNodes() {
        return { ...this.unlockedNodes };
    }

    /**
     * 获取可解锁节点列表
     * @returns {array}
     */
    getUnlockableNodes() {
        const playerLevel = this.player.level || 1;
        return getUnlockableNodes(playerLevel, this.unlockedNodes);
    }

    /**
     * 获取技能树效果加成
     * @returns {object}
     */
    getBonuses() {
        return { ...this.bonuses };
    }

    /**
     * 获取存档数据
     * @returns {object}
     */
    getSaveData() {
        return {
            skillPoints: this.skillPoints,
            unlockedNodes: this.unlockedNodes,
            bonuses: this.bonuses
        };
    }

    /**
     * 加载存档数据
     * @param {object} data - 存档数据
     */
    loadSaveData(data) {
        if (!data) {
            console.log('📦 无技能树存档数据，使用默认值');
            return;
        }

        console.log('📦 加载技能树存档');

        // 加载技能点
        this.skillPoints = data.skillPoints || 0;

        // 加载已解锁节点
        this.unlockedNodes = data.unlockedNodes || {};

        // 加载效果加成
        this.bonuses = data.bonuses || {
            attackPercent: 0,
            critChance: 0,
            critDamage: 0,
            hpPercent: 0,
            mpPercent: 0,
            defense: 0,
            damageReduction: 0,
            cooldownReduction: 0,
            allDamagePercent: 0,
            hpRegenPercent: 0,
            mpRegen: 0,
            mpRegenPercent: 0
        };

        // 重新计算玩家属性
        this.recalculatePlayerStats();

        console.log('✅ 技能树存档加载完成');
    }

    /**
     * 销毁技能树管理器
     */
    destroy() {
        console.log('🧹 清理 SkillTreeManager');
        this.unlockedNodes = null;
        this.bonuses = null;
    }
}
