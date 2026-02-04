/**
 * CombatConfig - 战斗系统配置文件
 *
 * 集中管理所有战斗系统的平衡参数：
 * - 音效系统配置
 * - 相机系统配置
 * - 连击系统配置
 * - 敌人AI配置
 * - 装备系统配置
 * - 技能系统配置
 *
 * 修改此文件可以快速调整游戏平衡性
 */

// ============ 音效系统配置 ============
export const AUDIO_CONFIG = {
    // 主音量
    masterVolume: 0.5,
    sfxVolume: 0.6,
    musicVolume: 0.4,

    // 元素音效
    elements: {
        fire: { volume: 0.5, pitch: 1.0 },
        ice: { volume: 0.5, pitch: 1.0 },
        lightning: { volume: 0.5, pitch: 1.0 },
        poison: { volume: 0.5, pitch: 1.0 },
        light: { volume: 0.5, pitch: 1.0 },
        shadow: { volume: 0.5, pitch: 1.0 },
        earth: { volume: 0.5, pitch: 1.0 },
        storm: { volume: 0.5, pitch: 1.0 }
    },

    // 连击音效
    combo: {
        tier1: { threshold: 5, volume: 0.3 },
        tier2: { threshold: 10, volume: 0.4 },
        tier3: { threshold: 15, volume: 0.5 },
        tier4: { threshold: 20, volume: 0.6 },
        tier5: { threshold: 25, volume: 0.7 },
        milestones: [10, 15, 20]
    },

    // 技能音效
    skills: {
        whirlwind_slash: { volume: 0.6, duration: 0.5 },
        charge: { volume: 0.6, duration: 0.3 },
        healing_light: { volume: 0.5, duration: 0.6 },
        ultimate: { volume: 0.8, duration: 1.0 }
    }
};

// ============ 相机系统配置 ============
export const CAMERA_CONFIG = {
    // 震动强度
    shake: {
        normal: { intensity: 0.005, duration: 100 },
        crit: { intensity: 0.015, duration: 150 },
        heavy: { intensity: 0.025, duration: 200 },
        boss: { intensity: 0.03, duration: 300 }
    },

    // 缩放倍数
    zoom: {
        in: { scale: 1.2, duration: 300 },
        out: { scale: 1.0, duration: 300 },
        combo: { scale: 1.1, duration: 200 },
        crit: { scale: 1.2, duration: 150 }
    },

    // 慢动作
    slowMotion: {
        ultimate: { factor: 0.3, duration: 500 },
        parry: { factor: 0.5, duration: 200 },
        bossDeath: { factor: 0.3, duration: 2000 }
    },

    // 连击动态相机
    comboCamera: {
        tier1: { combo: 5, sway: 0.002, zoom: 1.0 },
        tier2: { combo: 10, sway: 0.005, zoom: 1.0 },
        tier3: { combo: 15, sway: 0.005, zoom: 1.1 },
        tier4: { combo: 20, sway: 0.008, zoom: 1.05, pulse: true }
    },

    // 冷却时间（防止特效滥用）
    cooldowns: {
        shake: 100, // 毫秒
        flash: 50,
        slowMotion: 1000
    }
};

// ============ 连击系统配置 ============
export const COMBO_CONFIG = {
    // 连击超时（毫秒）
    timeout: 3000,

    // 最大连击数
    maxCombo: 99,

    // 伤害倍数（每层）
    damageBonusPerLevel: 0.2,

    // 连击层级
    tiers: [
        { threshold: 5, name: 'Good', color: '#ffff00', icon: '⚡' },
        { threshold: 10, name: 'Great', color: '#ff9500', icon: '🔥' },
        { threshold: 15, name: 'Awesome', color: '#ff00ff', icon: '💜' },
        { threshold: 20, name: 'Perfect', color: '#ffd700', icon: '👑' },
        { threshold: 25, name: 'Legendary', color: '#00ffff', icon: '🌟' }
    ],

    // 完美连击奖励
    perfectCombo: {
        threshold: 10,
        damageBonus: 1.5,
        speedBonus: 1.2,
        invincibilityFrames: 200
    }
};

// ============ 武器连招系统配置 ============
export const WEAPON_COMBO_CONFIG = {
    // 连击超时
    timeout: 2000,

    // 最大序列长度
    maxSequence: 5,

    // 连击模式定义
    patterns: {
        'LLH': { name: '三连击', multiplier: 1.5, finisher: true },
        'LHL': { name: '突刺连击', multiplier: 1.8, finisher: true },
        'HLL': { name: '重击连击', multiplier: 2.0, finisher: true },
        'LLHH': { name: '四连击', multiplier: 2.2, finisher: true },
        'LHLH': { name: '五连击', multiplier: 2.5, finisher: true }
    },

    // 攻击类型
    attackTypes: {
        light: { damage: 1.0, range: 50, cooldown: 200 },
        heavy: { damage: 1.5, range: 60, cooldown: 400 }
    }
};

// ============ 环境连招系统配置 ============
export const ENVIRONMENT_COMBO_CONFIG = {
    // 撞墙伤害倍数
    wallSlamMultiplier: 1.5,

    // 撞墙眩晕时间（毫秒）
    wallSlamStun: 500,

    // 连锁奖励（撞墙后撞另一个敌人）
    chainBonus: 2.0,

    // 最大连锁数
    maxChain: 3
};

// ============ 空中连招系统配置 ============
export const AERIAL_COMBO_CONFIG = {
    // 浮空重力系数（越小浮空越久）
    gravity: 0.3,

    // 空中连击伤害倍数
    airJuggleMultiplier: 1.2,

    // 最大空中连击数
    maxAirHits: 10,

    // 下砸伤害
    groundSlamMultiplier: 2.0,
    groundSlamRadius: 100,

    // 下砸AOE
    groundSlamAOE: true
};

// ============ 敌人AI配置 ============
export const ENEMY_AI_CONFIG = {
    // 仇恨范围
    aggroRange: 150,

    // 失去仇恨范围
    loseAggroRange: 300,

    // 攻击范围
    attackRange: 50,

    // 格挡几率（基础）
    blockChance: 0.1,

    // 闪避几率（基础）
    dodgeChance: 0.05,

    // 精英敌人加成
    elite: {
        blockChance: 0.2,
        dodgeChance: 0.1,
        damageMultiplier: 2.0,
        healthMultiplier: 5.0,
        speedMultiplier: 1.3
    },

    // Boss加成
    boss: {
        blockChance: 0.3,
        dodgeChance: 0.15,
        damageMultiplier: 3.0,
        healthMultiplier: 20.0,
        speedMultiplier: 1.5
    },

    // 受击反馈
    hitReaction: {
        flashDuration: 50, // 毫秒
        knockbackForce: 100,
        stunDuration: 200, // 毫秒
        popScale: 1.1
    },

    // 敌人协作
    cooperation: {
        helpRange: 200, // 呼救范围
        maxAttackers: 2, // 同时攻击的最大数量
        retreatThreshold: 0.3 // 30%血量以下撤退
    }
};

// ============ 装备特效配置 ============
export const EQUIPMENT_EFFECT_CONFIG = {
    // 稀有度属性
    rarity: {
        common: { color: 0xffffff, glow: false, trail: false },
        rare: { color: 0x0070dd, glow: true, trail: false },
        epic: { color: 0xa335ee, glow: true, trail: true },
        legendary: { color: 0xff8000, glow: true, trail: true }
    },

    // 装备强化视觉效果
    enhancement: {
        tier1: { level: [0, 3], glow: 0.0 },
        tier2: { level: [4, 6], glow: 0.3 },
        tier3: { level: [7, 9], glow: 0.6, particles: true },
        tier4: { level: [10, 12], glow: 1.0, rainbow: true },
        tier5: { level: [13, 15], glow: 1.0, rainbow: true, pulse: true }
    },

    // 附魔特效
    enchantment: {
        fire: { color: 0xff6600, particle: 'flame', intensity: 1.0 },
        ice: { color: 0x66ccff, particle: 'frost', intensity: 1.0 },
        lightning: { color: 0x9966ff, particle: 'spark', intensity: 1.0 },
        poison: { color: 0x339933, particle: 'cloud', intensity: 1.0 }
    },

    // 套装奖励
    sets: {
        warrior: {
            pieces2: { aura: 0x3366ff, intensity: 0.3 },
            pieces4: { aura: 0x3366ff, intensity: 0.6, particles: true },
            pieces6: { aura: 0x3366ff, intensity: 1.0, particles: true, special: true }
        },
        mage: {
            pieces2: { aura: 0x9933ff, intensity: 0.3 },
            pieces4: { aura: 0x9933ff, intensity: 0.6, particles: true },
            pieces6: { aura: 0x9933ff, intensity: 1.0, particles: true, special: true }
        },
        rogue: {
            pieces2: { aura: 0x00cc66, intensity: 0.3 },
            pieces4: { aura: 0x00cc66, intensity: 0.6, particles: true },
            pieces6: { aura: 0x00cc66, intensity: 1.0, particles: true, special: true }
        }
    }
};

// ============ 技能系统配置 ============
export const SKILL_CONFIG = {
    // 技能连携
    chains: {
        comboWindow: 3000, // 连携时间窗口（毫秒）
        maxCombo: 5,        // 最大连携层数
        chains: {
            'whirlwind_slash': { next: 'charge', bonus: 1.5 },
            'charge': { next: 'ultimate', bonus: 2.0 },
            'healing_light': { next: 'whirlwind_slash', bonus: 1.3 }
        }
    },

    // 蓄力系统
    charge: {
        maxLevel: 3,
        duration: 1500, // 最大蓄力时间（毫秒）
        levels: [
            { threshold: 0.33, damageBonus: 0.5 },
            { threshold: 0.66, damageBonus: 1.0 },
            { threshold: 1.0, damageBonus: 1.5 }
        ]
    },

    // 冷却时间（毫秒）
    cooldowns: {
        whirlwind_slash: 5000,
        charge: 3000,
        healing_light: 8000,
        ultimate: 30000
    }
};

// ============ UI系统配置 ============
export const UI_CONFIG = {
    // 伤害数字
    damageText: {
        gridSize: { width: 40, height: 30 },
        maxSimultaneous: 30,
        fadeTime: 800,
        overlapFade: 500
    },

    // 低血量警告
    lowHealth: {
        threshold: 0.3, // 30%血量
        vignetteAlpha: 0.5,
        pulseSpeed: 1000 // 毫秒
    },

    // 技能冷却
    skillCooldown: {
        showSeconds: true,
        threshold: 2.0, // 显示秒数的最小CD
        flashOnReady: true
    }
};

// ============ 数据分析配置 ============
export const ANALYTICS_CONFIG = {
    // DPS计算
    dps: {
        windows: [5000, 10000, 30000], // 5s, 10s, 30s窗口
        updateInterval: 500, // 毫秒
        resetTimeout: 5000 // 5秒无伤害重置
    },

    // 战斗历史
    history: {
        maxFights: 10,
        saveOnEnd: true
    },

    // 性能监控
    performance: {
        fpsUpdateInterval: 1000,
        particleCountInterval: 1000,
        memoryEstimateInterval: 5000,
        fpsGraphSize: 60 // 最近60秒
    }
};

// ============ Boss战配置 ============
export const BOSS_CONFIG = {
    // 阶段
    phases: {
        phase1: { healthPercent: [1.0, 0.66], speedMultiplier: 1.0 },
        phase2: { healthPercent: [0.66, 0.33], speedMultiplier: 1.2 },
        phase3: { healthPercent: [0.33, 0.0], speedMultiplier: 1.5, enrage: true }
    },

    // 大招预警
    ultimateWarning: {
        duration: 2000, // 毫秒
        pulseRate: 300
    },

    // 死亡特效
    death: {
        slowMotionFactor: 0.3,
        slowMotionDuration: 1500,
        explosionLayers: 5
    }
};

// ============ 环境特效配置 ============
export const ATMOSPHERE_CONFIG = {
    // 血迹残留
    bloodStains: {
        maxCount: 20,
        duration: 60000, // 60秒
        boss: { scale: 2.0, persistent: true },
        elite: { scale: 1.5, persistent: false },
        normal: { scale: 1.0, persistent: false }
    },

    // 连击粒子风暴
    comboParticles: {
        tier1: { combo: 5, count: 10, color: '#ffff00' },
        tier2: { combo: 10, count: 20, color: '#ff9500' },
        tier3: { combo: 15, count: 30, color: '#ff0000' },
        tier4: { combo: 20, count: 40, color: '#ff00ff' }
    },

    // Boss战环境
    bossEnvironment: {
        darkness: 0.3, // 暗化强度
        lightningFrequency: 2000, // 闪电频率（毫秒）
        debrisParticles: 50
    }
};

// ============ 导出所有配置 ============
export const COMBAT_CONFIG = {
    audio: AUDIO_CONFIG,
    camera: CAMERA_CONFIG,
    combo: COMBO_CONFIG,
    weaponCombo: WEAPON_COMBO_CONFIG,
    environmentCombo: ENVIRONMENT_COMBO_CONFIG,
    aerialCombo: AERIAL_COMBO_CONFIG,
    enemyAI: ENEMY_AI_CONFIG,
    equipment: EQUIPMENT_EFFECT_CONFIG,
    skills: SKILL_CONFIG,
    ui: UI_CONFIG,
    analytics: ANALYTICS_CONFIG,
    boss: BOSS_CONFIG,
    atmosphere: ATMOSPHERE_CONFIG
};

// 默认导出（便于导入）
export default COMBAT_CONFIG;
