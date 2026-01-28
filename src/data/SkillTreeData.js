/**
 * SkillTreeData - 技能树数据定义
 * 定义技能树分支、节点、前置条件、效果等
 * @version 1.0 - Milestone 7 Sprint 3
 */

// ============ 技能树分支定义 ============
const SKILL_TREE_BRANCHES = {
    OFFENSE: {
        id: 'offense',
        name: '攻击',
        icon: '⚔️',
        color: '#ef4444',
        description: '增强攻击力和伤害输出'
    },
    DEFENSE: {
        id: 'defense',
        name: '防御',
        icon: '🛡️',
        color: '#3b82f6',
        description: '提升生存能力和防御力'
    },
    UTILITY: {
        id: 'utility',
        name: '辅助',
        icon: '✨',
        color: '#f59e0b',
        description: '改善资源管理和功能性'
    }
};

// ============ 技能节点类型 ============
const SKILL_NODE_TYPES = {
    PASSIVE: 'passive',     // 被动技能 (永久属性提升)
    ACTIVE_UPGRADE: 'active_upgrade',  // 主动技能升级
    ULTIMATE: 'ultimate'     // 终极技能
};

// ============ 技能树节点定义 ============
const SKILL_TREE_NODES = {
    // ============ 攻击分支 ============

    // 第一层 (Level 5)
    offensive_mind_1: {
        id: 'offensive_mind_1',
        name: '攻击意识 I',
        branch: SKILL_TREE_BRANCHES.OFFENSE.id,
        type: SKILL_NODE_TYPES.PASSIVE,
        level: 5,
        maxRank: 3,
        cost: 1,
        prerequisites: [],
        effects: {
            attackPercent: 0.05  // +5% 攻击力 (每级)
        },
        description: '攻击力提升 5%',
        icon: '⚔️'
    },

    critical_strike_1: {
        id: 'critical_strike_1',
        name: '致命打击 I',
        branch: SKILL_TREE_BRANCHES.OFFENSE.id,
        type: SKILL_NODE_TYPES.PASSIVE,
        level: 5,
        maxRank: 2,
        cost: 1,
        prerequisites: [],
        effects: {
            critChance: 0.03,  // +3% 暴击率 (每级)
            critDamage: 0.1    // +10% 暴击伤害 (每级)
        },
        description: '暴击率 +3%, 暴击伤害 +10%',
        icon: '💥'
    },

    // 第二层 (Level 10)
    offensive_mind_2: {
        id: 'offensive_mind_2',
        name: '攻击意识 II',
        branch: SKILL_TREE_BRANCHES.OFFENSE.id,
        type: SKILL_NODE_TYPES.PASSIVE,
        level: 10,
        maxRank: 3,
        cost: 2,
        prerequisites: ['offensive_mind_1'],
        effects: {
            attackPercent: 0.08  // +8% 攻击力 (每级)
        },
        description: '攻击力提升 8%',
        icon: '⚔️'
    },

    whirlwind_upgrade_1: {
        id: 'whirlwind_upgrade_1',
        name: '旋风斩强化 I',
        branch: SKILL_TREE_BRANCHES.OFFENSE.id,
        type: SKILL_NODE_TYPES.ACTIVE_UPGRADE,
        level: 10,
        maxRank: 2,
        cost: 2,
        prerequisites: ['offensive_mind_1'],
        skillToUpgrade: 'whirlwind_slash',
        effects: {
            damageMultiplier: 0.1,  // +10% 伤害 (每级)
            cooldownReduction: 500   // -0.5秒冷却 (每级)
        },
        description: '旋风斩伤害 +10%, 冷却 -0.5秒',
        icon: '🌀'
    },

    // 第三层 (Level 15)
    offensive_mind_3: {
        id: 'offensive_mind_3',
        name: '攻击意识 III',
        branch: SKILL_TREE_BRANCHES.OFFENSE.id,
        type: SKILL_NODE_TYPES.PASSIVE,
        level: 15,
        maxRank: 3,
        cost: 3,
        prerequisites: ['offensive_mind_2'],
        effects: {
            attackPercent: 0.12  // +12% 攻击力 (每级)
        },
        description: '攻击力提升 12%',
        icon: '⚔️'
    },

    critical_strike_2: {
        id: 'critical_strike_2',
        name: '致命打击 II',
        branch: SKILL_TREE_BRANCHES.OFFENSE.id,
        type: SKILL_NODE_TYPES.PASSIVE,
        level: 15,
        maxRank: 2,
        cost: 2,
        prerequisites: ['critical_strike_1'],
        effects: {
            critChance: 0.05,  // +5% 暴击率 (每级)
            critDamage: 0.15   // +15% 暴击伤害 (每级)
        },
        description: '暴击率 +5%, 暴击伤害 +15%',
        icon: '💥'
    },

    // 第四层 (Level 20)
    ultimate_damage: {
        id: 'ultimate_damage',
        name: '终极毁灭',
        branch: SKILL_TREE_BRANCHES.OFFENSE.id,
        type: SKILL_NODE_TYPES.ULTIMATE,
        level: 20,
        maxRank: 1,
        cost: 5,
        prerequisites: ['offensive_mind_3', 'critical_strike_2'],
        effects: {
            allDamagePercent: 0.25  // 所有伤害 +25%
        },
        description: '所有伤害提升 25%',
        icon: '👑'
    },

    // ============ 防御分支 ============

    // 第一层 (Level 5)
    vitality_1: {
        id: 'vitality_1',
        name: '生命强化 I',
        branch: SKILL_TREE_BRANCHES.DEFENSE.id,
        type: SKILL_NODE_TYPES.PASSIVE,
        level: 5,
        maxRank: 3,
        cost: 1,
        prerequisites: [],
        effects: {
            hpPercent: 0.1  // +10% 最大生命值 (每级)
        },
        description: '最大生命值提升 10%',
        icon: '❤️'
    },

    armor_mastery_1: {
        id: 'armor_mastery_1',
        name: '护甲精通 I',
        branch: SKILL_TREE_BRANCHES.DEFENSE.id,
        type: SKILL_NODE_TYPES.PASSIVE,
        level: 5,
        maxRank: 2,
        cost: 1,
        prerequisites: [],
        effects: {
            defense: 5,  // +5 防御力 (每级)
            damageReduction: 0.02  // -2% 受到的伤害 (每级)
        },
        description: '防御力 +5, 受到的伤害 -2%',
        icon: '🛡️'
    },

    // 第二层 (Level 10)
    vitality_2: {
        id: 'vitality_2',
        name: '生命强化 II',
        branch: SKILL_TREE_BRANCHES.DEFENSE.id,
        type: SKILL_NODE_TYPES.PASSIVE,
        level: 10,
        maxRank: 3,
        cost: 2,
        prerequisites: ['vitality_1'],
        effects: {
            hpPercent: 0.15  // +15% 最大生命值 (每级)
        },
        description: '最大生命值提升 15%',
        icon: '❤️'
    },

    regeneration: {
        id: 'regeneration',
        name: '生命恢复',
        branch: SKILL_TREE_BRANCHES.DEFENSE.id,
        type: SKILL_NODE_TYPES.PASSIVE,
        level: 10,
        maxRank: 2,
        cost: 2,
        prerequisites: ['vitality_1'],
        effects: {
            hpRegenPercent: 0.01  // 每秒恢复 1% 最大生命值 (每级)
        },
        description: '每秒恢复 1% 最大生命值',
        icon: '💚'
    },

    // 第三层 (Level 15)
    vitality_3: {
        id: 'vitality_3',
        name: '生命强化 III',
        branch: SKILL_TREE_BRANCHES.DEFENSE.id,
        type: SKILL_NODE_TYPES.PASSIVE,
        level: 15,
        maxRank: 3,
        cost: 3,
        prerequisites: ['vitality_2'],
        effects: {
            hpPercent: 0.2  // +20% 最大生命值 (每级)
        },
        description: '最大生命值提升 20%',
        icon: '❤️'
    },

    damage_reduction: {
        id: 'damage_reduction',
        name: '伤害减免',
        branch: SKILL_TREE_BRANCHES.DEFENSE.id,
        type: SKILL_NODE_TYPES.PASSIVE,
        level: 15,
        maxRank: 2,
        cost: 2,
        prerequisites: ['armor_mastery_1'],
        effects: {
            damageReduction: 0.05  // -5% 受到的伤害 (每级)
        },
        description: '受到的伤害减少 5%',
        icon: '🛡️'
    },

    // 第四层 (Level 20)
    ultimate_defense: {
        id: 'ultimate_defense',
        name: '钢铁意志',
        branch: SKILL_TREE_BRANCHES.DEFENSE.id,
        type: SKILL_NODE_TYPES.ULTIMATE,
        level: 20,
        maxRank: 1,
        cost: 5,
        prerequisites: ['vitality_3', 'damage_reduction'],
        effects: {
            maxHpPercent: 0.5,  // 最大生命值 +50%
            damageReduction: 0.15  // 受到的伤害 -15%
        },
        description: '最大生命值 +50%, 受到的伤害 -15%',
        icon: '👑'
    },

    // ============ 辅助分支 ============

    // 第一层 (Level 5)
    mana_flow_1: {
        id: 'mana_flow_1',
        name: '魔力流动 I',
        branch: SKILL_TREE_BRANCHES.UTILITY.id,
        type: SKILL_NODE_TYPES.PASSIVE,
        level: 5,
        maxRank: 3,
        cost: 1,
        prerequisites: [],
        effects: {
            mpPercent: 0.1,  // +10% 最大魔法值 (每级)
            mpRegen: 0.5     // 每秒恢复 0.5 MP (每级)
        },
        description: '最大魔法值 +10%, 每秒恢复 +0.5 MP',
        icon: '💙'
    },

    cooldown_mastery_1: {
        id: 'cooldown_mastery_1',
        name: '冷却缩减 I',
        branch: SKILL_TREE_BRANCHES.UTILITY.id,
        type: SKILL_NODE_TYPES.PASSIVE,
        level: 5,
        maxRank: 2,
        cost: 1,
        prerequisites: [],
        effects: {
            cooldownReduction: 0.05  // 技能冷却 -5% (每级)
        },
        description: '所有技能冷却时间减少 5%',
        icon: '⏱️'
    },

    // 第二层 (Level 10)
    mana_flow_2: {
        id: 'mana_flow_2',
        name: '魔力流动 II',
        branch: SKILL_TREE_BRANCHES.UTILITY.id,
        type: SKILL_NODE_TYPES.PASSIVE,
        level: 10,
        maxRank: 3,
        cost: 2,
        prerequisites: ['mana_flow_1'],
        effects: {
            mpPercent: 0.15,  // +15% 最大魔法值 (每级)
            mpRegen: 1.0      // 每秒恢复 1.0 MP (每级)
        },
        description: '最大魔法值 +15%, 每秒恢复 +1.0 MP',
        icon: '💙'
    },

    charge_upgrade_1: {
        id: 'charge_upgrade_1',
        name: '冲锋强化 I',
        branch: SKILL_TREE_BRANCHES.UTILITY.id,
        type: SKILL_NODE_TYPES.ACTIVE_UPGRADE,
        level: 10,
        maxRank: 2,
        cost: 2,
        prerequisites: ['cooldown_mastery_1'],
        skillToUpgrade: 'charge',
        effects: {
            dashDistance: 30,  // +30 像素冲锋距离 (每级)
            cooldownReduction: 500,  // -0.5秒冷却 (每级)
            knockbackForce: 20  // +20 击退力度 (每级)
        },
        description: '冲锋距离 +30, 冷却 -0.5秒, 击退 +20',
        icon: '💨'
    },

    // 第三层 (Level 15)
    mana_flow_3: {
        id: 'mana_flow_3',
        name: '魔力流动 III',
        branch: SKILL_TREE_BRANCHES.UTILITY.id,
        type: SKILL_NODE_TYPES.PASSIVE,
        level: 15,
        maxRank: 3,
        cost: 3,
        prerequisites: ['mana_flow_2'],
        effects: {
            mpPercent: 0.2,  // +20% 最大魔法值 (每级)
            mpRegen: 1.5     // 每秒恢复 1.5 MP (每级)
        },
        description: '最大魔法值 +20%, 每秒恢复 +1.5 MP',
        icon: '💙'
    },

    cooldown_mastery_2: {
        id: 'cooldown_mastery_2',
        name: '冷却缩减 II',
        branch: SKILL_TREE_BRANCHES.UTILITY.id,
        type: SKILL_NODE_TYPES.PASSIVE,
        level: 15,
        maxRank: 2,
        cost: 2,
        prerequisites: ['cooldown_mastery_1'],
        effects: {
            cooldownReduction: 0.08  // 技能冷却 -8% (每级)
        },
        description: '所有技能冷却时间减少 8%',
        icon: '⏱️'
    },

    // 第四层 (Level 20)
    ultimate_mana: {
        id: 'ultimate_mana',
        name: '无限魔力',
        branch: SKILL_TREE_BRANCHES.UTILITY.id,
        type: SKILL_NODE_TYPES.ULTIMATE,
        level: 20,
        maxRank: 1,
        cost: 5,
        prerequisites: ['mana_flow_3', 'cooldown_mastery_2'],
        effects: {
            maxMpPercent: 0.5,  // 最大魔法值 +50%
            cooldownReduction: 0.15,  // 技能冷却 -15%
            mpRegenPercent: 0.02  // 每秒恢复 2% 最大魔法值
        },
        description: '最大魔法值 +50%, 技能冷却 -15%, 每秒恢复 2% MP',
        icon: '👑'
    }
};

// ============ 获取技能树节点 ============
function getSkillTreeNode(id) {
    return SKILL_TREE_NODES[id] || null;
}

// ============ 获取分支的所有节点 ============
function getNodesByBranch(branchId) {
    const nodes = [];
    Object.values(SKILL_TREE_NODES).forEach(node => {
        if (node.branch === branchId) {
            nodes.push(node);
        }
    });
    return nodes.sort((a, b) => a.level - b.level);
}

// ============ 获取可解锁的节点 ============
function getUnlockableNodes(currentLevel, unlockedNodes) {
    const unlockable = [];

    Object.values(SKILL_TREE_NODES).forEach(node => {
        // 检查等级要求
        if (node.level > currentLevel) return;

        // 检查是否已解锁
        if (unlockedNodes[node.id]) return;

        // 检查前置条件
        const prerequisitesMet = node.prerequisites.every(prereqId => {
            return unlockedNodes[prereqId] && unlockedNodes[prereqId].rank > 0;
        });

        if (prerequisitesMet) {
            unlockable.push(node);
        }
    });

    return unlockable;
}

// ============ 获取节点效果描述 ============
function getEffectDescription(effect) {
    const descriptions = {
        attackPercent: value => `攻击力 +${(value * 100).toFixed(0)}%`,
        critChance: value => `暴击率 +${(value * 100).toFixed(0)}%`,
        critDamage: value => `暴击伤害 +${(value * 100).toFixed(0)}%`,
        hpPercent: value => `最大生命值 +${(value * 100).toFixed(0)}%`,
        mpPercent: value => `最大魔法值 +${(value * 100).toFixed(0)}%`,
        defense: value => `防御力 +${value}`,
        damageReduction: value => `受到的伤害减少 ${(value * 100).toFixed(0)}%`,
        damageMultiplier: value => `技能伤害 +${(value * 100).toFixed(0)}%`,
        cooldownReduction: value => `冷却时间 -${value}ms`,
        allDamagePercent: value => `所有伤害 +${(value * 100).toFixed(0)}%`,
        maxHpPercent: value => `最大生命值 +${(value * 100).toFixed(0)}%`,
        hpRegenPercent: value => `每秒恢复 ${(value * 100).toFixed(0)}% 最大生命值`,
        mpRegen: value => `每秒恢复 ${value} MP`,
        mpRegenPercent: value => `每秒恢复 ${(value * 100).toFixed(0)}% 最大魔法值`,
        cooldownReductionPercent: value => `冷却时间 -${(value * 100).toFixed(0)}%`,
        dashDistance: value => `冲锋距离 +${value}px`,
        knockbackForce: value => `击退力度 +${value}`
    };

    for (const [key, value] of Object.entries(effect)) {
        if (descriptions[key]) {
            return descriptions[key](value);
        }
    }

    return '未知效果';
}
