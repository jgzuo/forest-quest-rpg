/**
 * SkillData - 技能数据定义
 * 定义所有技能的属性和配置
 * @version 1.0 - Milestone 6 Iteration 4
 */

const SKILL_DEFINITIONS = {
    whirlwind_slash: {
        id: 'whirlwind_slash',
        name: '旋风斩',
        nameEn: 'Whirlwind Slash',
        unlockLevel: 3,
        mpCost: 20,
        cooldown: 5000, // 5 seconds
        damageMultiplier: 1.5,
        aoeRadius: 120,
        duration: 500,
        keybinding: '1',  // 修复：改为小写
        description: '360度范围攻击，造成1.5倍伤害',
        icon: '🌀',
        // Milestone 7: 伤害类型和效果
        damageType: 'physical',
        statusEffect: null
    },

    charge: {
        id: 'charge',
        name: '冲锋',
        nameEn: 'Charge',
        unlockLevel: 5,
        mpCost: 15,
        cooldown: 3000, // 3 seconds
        damageMultiplier: 1.0,
        dashDistance: 150,
        dashDuration: 200,
        knockbackForce: 100,
        keybinding: '2',  // 修复：改为小写
        description: '向前冲锋，击退敌人',
        icon: '⚡',
        // Milestone 7: 伤害类型和效果
        damageType: 'physical',
        statusEffect: 'knockback'
    },

    healing_light: {
        id: 'healing_light',
        name: '治疗之光',
        nameEn: 'Healing Light',
        unlockLevel: 7,
        mpCost: 40,
        cooldown: 10000, // 10 seconds
        healPercent: 0.3, // 30% of max HP
        healDuration: 5000, // 5 seconds
        healTicks: 5, // 5 ticks over 5 seconds
        keybinding: '3',  // 修复：改为小写
        description: '恢复30%生命值（5秒内）',
        icon: '💚',
        // Milestone 7: 伤害类型和效果
        damageType: null,
        statusEffect: null
    },

    ultimate: {
        id: 'ultimate',
        name: '守护者之怒',
        nameEn: "Guardian's Fury",
        unlockLevel: 10,
        mpCost: 100,
        cooldown: 30000, // 30 seconds
        damageMultiplier: 3.0,
        aoeRadius: 200,
        duration: 1500,
        invincible: true,
        keybinding: '4',  // 修复：改为小写
        description: '终极技能：3倍伤害范围攻击，期间无敌',
        icon: '👑',
        // Milestone 7: 伤害类型和效果
        damageType: 'magical',
        statusEffect: 'burn'
    }
};

// 导出技能定义供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SKILL_DEFINITIONS;
}
