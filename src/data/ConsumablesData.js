/**
 * ConsumablesData - 消耗品数据
 * 定义游戏中所有消耗品（药水、卷轴、食物等）
 * @version 1.0 - Milestone 7 Content Expansion
 */

// ============ 消耗品类型 ============
const CONSUMABLE_TYPES = {
    POTION: 'potion',           // 药水（一次性使用）
    SCROLL: 'scroll',           // 卷轴（一次性效果）
    FOOD: 'food',               // 食物（恢复HP/MP）
    MISC: 'misc'                // 杂项
};

// ============ 消耗品稀有度 ============
const CONSUMABLE_RARITY = {
    COMMON: {
        name: '普通',
        color: '#9ca3af',
        statMultiplier: 1.0
    },
    UNCOMMON: {
        name: '优秀',
        color: '#22c55e',
        statMultiplier: 1.3
    },
    RARE: {
        name: '稀有',
        color: '#3b82f6',
        statMultiplier: 1.6
    },
    LEGENDARY: {
        name: '传说',
        color: '#f59e0b',
        statMultiplier: 2.0
    }
};

// ============ 药水 ============
const POTIONS = {
    // 恢复类药水
    small_hp_potion: {
        id: 'small_hp_potion',
        name: '小型生命药水',
        type: CONSUMABLE_TYPES.POTION,
        rarity: 'COMMON',
        icon: '🧪',
        effect: {
            type: 'restore_hp',
            value: 30,
            description: '恢复30点生命值'
        },
        price: 25,
        description: '淡淡红色的药水，带有草药味',
        stackSize: 99
    },

    medium_hp_potion: {
        id: 'medium_hp_potion',
        name: '中型生命药水',
        type: CONSUMABLE_TYPES.POTION,
        rarity: 'UNCOMMON',
        icon: '🧴',
        effect: {
            type: 'restore_hp',
            value: 75,
            description: '恢复75点生命值'
        },
        price: 60,
        description: '鲜红色的药水，效果显著',
        stackSize: 99
    },

    large_hp_potion: {
        id: 'large_hp_potion',
        name: '大型生命药水',
        type: CONSUMABLE_TYPES.POTION,
        rarity: 'RARE',
        icon: '🍷',
        effect: {
            type: 'restore_hp',
            value: 150,
            description: '恢复150点生命值'
        },
        price: 120,
        description: '深红色的药水，散发着强大的生命力',
        stackSize: 99
    },

    ultimate_hp_potion: {
        id: 'ultimate_hp_potion',
        name: '终极生命药水',
        type: CONSUMABLE_TYPES.POTION,
        rarity: 'LEGENDARY',
        icon: '💎',
        effect: {
            type: 'restore_hp_percent',
            value: 100,
            description: '恢复100%生命值'
        },
        price: 500,
        description: '传说中的神药，能够完全恢复生命',
        stackSize: 10
    },

    small_mp_potion: {
        id: 'small_mp_potion',
        name: '小型魔法药水',
        type: CONSUMABLE_TYPES.POTION,
        rarity: 'COMMON',
        icon: '💧',
        effect: {
            type: 'restore_mp',
            value: 25,
            description: '恢复25点魔法值'
        },
        price: 30,
        description: '淡蓝色的药水，带有薄荷味',
        stackSize: 99
    },

    medium_mp_potion: {
        id: 'medium_mp_potion',
        name: '中型魔法药水',
        type: CONSUMABLE_TYPES.POTION,
        rarity: 'UNCOMMON',
        icon: '💙',
        effect: {
            type: 'restore_mp',
            value: 60,
            description: '恢复60点魔法值'
        },
        price: 70,
        description: '深蓝色的药水，散发着魔力',
        stackSize: 99
    },

    large_mp_potion: {
        id: 'large_mp_potion',
        name: '大型魔法药水',
        type: CONSUMABLE_TYPES.POTION,
        rarity: 'RARE',
        icon: '🔮',
        effect: {
            type: 'restore_mp',
            value: 120,
            description: '恢复120点魔法值'
        },
        price: 140,
        description: '闪耀的蓝色药水，魔力充沛',
        stackSize: 99
    },

    // 混合药水
    elixir_of_life: {
        id: 'elixir_of_life',
        name: '生命灵药',
        type: CONSUMABLE_TYPES.POTION,
        rarity: 'LEGENDARY',
        icon: '✨',
        effect: {
            type: 'restore_both',
            hp: 200,
            mp: 100,
            description: '恢复200点生命值和100点魔法值'
        },
        price: 300,
        description: '珍贵的灵药，同时恢复生命和魔力',
        stackSize: 20
    },

    // 增益类药水
    strength_potion: {
        id: 'strength_potion',
        name: '力量药水',
        type: CONSUMABLE_TYPES.POTION,
        rarity: 'UNCOMMON',
        icon: '💪',
        effect: {
            type: 'buff_attack',
            value: 20,
            duration: 60,
            description: '60秒内攻击力+20%'
        },
        price: 80,
        description: '红色的力量药水，增强攻击力',
        stackSize: 20
    },

    iron_skin_potion: {
        id: 'iron_skin_potion',
        name: '铁皮药水',
        type: CONSUMABLE_TYPES.POTION,
        rarity: 'UNCOMMON',
        icon: '🛡️',
        effect: {
            type: 'buff_defense',
            value: 30,
            duration: 60,
            description: '60秒内防御力+30%'
        },
        price: 80,
        description: '灰色的铁皮药水，增强防御力',
        stackSize: 20
    },

    speed_potion: {
        id: 'speed_potion',
        name: '疾风药水',
        type: CONSUMABLE_TYPES.POTION,
        rarity: 'RARE',
        icon: '💨',
        effect: {
            type: 'buff_speed',
            value: 30,
            duration: 45,
            description: '45秒内移动速度+30%'
        },
        price: 100,
        description: '透明的疾风电水，大幅提升速度',
        stackSize: 15
    },

    rage_potion: {
        id: 'rage_potion',
        name: '狂暴药水',
        type: CONSUMABLE_TYPES.POTION,
        rarity: 'LEGENDARY',
        icon: '🔥',
        effect: {
            type: 'buff_rage',
            attackBonus: 50,
            speedBonus: 20,
            duration: 30,
            description: '30秒内攻击力+50%，速度+20%'
        },
        price: 250,
        description: '狂战士的秘药，大幅提升战斗能力',
        stackSize: 5
    },

    // 抗性药水
    fire_resistance_potion: {
        id: 'fire_resistance_potion',
        name: '火焰抗性药水',
        type: CONSUMABLE_TYPES.POTION,
        rarity: 'UNCOMMON',
        icon: '🔥',
        effect: {
            type: 'resistance',
            element: 'fire',
            duration: 120,
            description: '120秒内火焰抗性+50%'
        },
        price: 90,
        description: '抵抗火焰伤害的药水',
        stackSize: 15
    },

    ice_resistance_potion: {
        id: 'ice_resistance_potion',
        name: '冰霜抗性药水',
        type: CONSUMABLE_TYPES.POTION,
        rarity: 'UNCOMMON',
        icon: '❄️',
        effect: {
            type: 'resistance',
            element: 'ice',
            duration: 120,
            description: '120秒内冰霜抗性+50%'
        },
        price: 90,
        description: '抵抗冰霜伤害的药水',
        stackSize: 15
    }
};

// ============ 卷轴 ============
const SCROLLS = {
    // 传送卷轴
    town_teleport_scroll: {
        id: 'town_teleport_scroll',
        name: '回城卷轴',
        type: CONSUMABLE_TYPES.SCROLL,
        rarity: 'COMMON',
        icon: '📜',
        effect: {
            type: 'teleport',
            target: 'town',
            description: '立即传送回小镇'
        },
        price: 50,
        description: '能够瞬间传送回小镇的魔法卷轴',
        stackSize: 10
    },

    // 战斗卷轴
    confusion_scroll: {
        id: 'confusion_scroll',
        name: '混乱卷轴',
        type: CONSUMABLE_TYPES.SCROLL,
        rarity: 'RARE',
        icon: '🌀',
        effect: {
            type: 'debuff_enemies',
            effect: 'confused',
            radius: 150,
            duration: 5,
            description: '使周围150像素内的敌人混乱5秒'
        },
        price: 200,
        description: '让敌人陷入混乱状态的诅咒卷轴',
        stackSize: 5
    },

    reveal_scroll: {
        id: 'reveal_scroll',
        name: '显形卷轴',
        type: CONSUMABLE_TYPES.SCROLL,
        rarity: 'UNCOMMON',
        icon: '👁️',
        effect: {
            type: 'reveal_hidden',
            duration: 30,
            description: '显示隐藏物品和敌人30秒'
        },
        price: 120,
        description: '能够显示隐藏事物的魔法卷轴',
        stackSize: 10
    },

    // 强化卷轴
    weapon_enhancement_scroll: {
        id: 'weapon_enhancement_scroll',
        name: '武器强化卷轴',
        type: CONSUMABLE_TYPES.SCROLL,
        rarity: 'LEGENDARY',
        icon: '⚔️',
        effect: {
            type: 'enhance_weapon',
            bonus: 5,
            description: '武器攻击力+5'
        },
        price: 500,
        description: '能够强化武器的古代卷轴',
        stackSize: 3
    },

    armor_enhancement_scroll: {
        id: 'armor_enhancement_scroll',
        name: '护甲强化卷轴',
        type: CONSUMABLE_TYPES.SCROLL,
        rarity: 'LEGENDARY',
        icon: '🛡️',
        effect: {
            type: 'enhance_armor',
            bonus: 5,
            description: '护甲防御力+5'
        },
        price: 500,
        description: '能够强化护甲的古代卷轴',
        stackSize: 3
    }
};

// ============ 食物 ============
const FOODS = {
    apple: {
        id: 'apple',
        name: '苹果',
        type: CONSUMABLE_TYPES.FOOD,
        rarity: 'COMMON',
        icon: '🍎',
        effect: {
            type: 'restore_hp',
            value: 10,
            description: '恢复10点生命值'
        },
        price: 5,
        description: '新鲜的红苹果',
        stackSize: 99
    },

    bread: {
        id: 'bread',
        name: '面包',
        type: CONSUMABLE_TYPES.FOOD,
        rarity: 'COMMON',
        icon: '🍞',
        effect: {
            type: 'restore_hp',
            value: 20,
            description: '恢复20点生命值'
        },
        price: 10,
        description: '刚出炉的面包',
        stackSize: 99
    },

    cooked_meat: {
        id: 'cooked_meat',
        name: '烤肉',
        type: CONSUMABLE_TYPES.FOOD,
        rarity: 'UNCOMMON',
        icon: '🍖',
        effect: {
            type: 'restore_hp',
            value: 50,
            description: '恢复50点生命值'
        },
        price: 25,
        description: '香气扑鼻的烤肉',
        stackSize: 50
    },

    royal_feast: {
        id: 'royal_feast',
        name: '皇家盛宴',
        type: CONSUMABLE_TYPES.FOOD,
        rarity: 'LEGENDARY',
        icon: '🍽️',
        effect: {
            type: 'restore_both',
            hp: 100,
            mp: 50,
            description: '恢复100点生命值和50点魔法值',
            buff: 'well_fed',
            buffDuration: 300
        },
        price: 200,
        description: '国王级的美味大餐，同时提供增益',
        stackSize: 10
    }
};

// ============ 杂项 ============
const MISC_ITEMS = {
    // 复活道具
    phoenix_down: {
        id: 'phoenix_down',
        name: '凤凰羽毛',
        type: CONSUMABLE_TYPES.MISC,
        rarity: 'RARE',
        icon: '🪶',
        effect: {
            type: 'revive',
            hpPercent: 50,
            description: '复活并恢复50%生命值'
        },
        price: 300,
        description: '能够起死回生的神奇羽毛',
        stackSize: 5
    },

    // 宝石（特殊货币）
    small_gem: {
        id: 'small_gem',
        name: '小型宝石',
        type: CONSUMABLE_TYPES.MISC,
        rarity: 'UNCOMMON',
        icon: '💎',
        effect: {
            type: 'currency',
            value: 100,
            description: '可用于购买特殊物品'
        },
        price: 0,
        description: '闪闪发光的小宝石',
        stackSize: 99
    },

    large_gem: {
        id: 'large_gem',
        name: '大型宝石',
        type: CONSUMABLE_TYPES.MISC,
        rarity: 'RARE',
        icon: '💠',
        effect: {
            type: 'currency',
            value: 500,
            description: '可用于购买稀有物品'
        },
        price: 0,
        description: '光芒四射的大宝石',
        stackSize: 50
    },

    // 陷阱工具
    smoke_bomb: {
        id: 'smoke_bomb',
        name: '烟雾弹',
        type: CONSUMABLE_TYPES.MISC,
        rarity: 'UNCOMMON',
        icon: '💨',
        effect: {
            type: 'escape',
            radius: 200,
            duration: 5,
            description: '制造烟雾，使敌人失去目标'
        },
        price: 80,
        description: '用于逃跑的烟雾弹',
        stackSize: 20
    },

    bait: {
        id: 'bait',
        name: '诱饵',
        type: CONSUMABLE_TYPES.MISC,
        rarity: 'COMMON',
        icon: '🍖',
        effect: {
            type: 'lure',
            radius: 300,
            duration: 10,
            description: '吸引周围敌人'
        },
        price: 20,
        description: '能够吸引敌人的诱饵',
        stackSize: 50
    }
};

// ============ 获取所有消耗品 ============
function getAllConsumables() {
    return {
        potions: POTIONS,
        scrolls: SCROLLS,
        foods: FOODS,
        misc: MISC_ITEMS
    };
}

// ============ 根据ID获取消耗品 ============
function getConsumableById(id) {
    const all = getAllConsumables();
    return all.potions[id] || all.scrolls[id] || all.foods[id] || all.misc[id] || null;
}

// ============ 根据类型获取消耗品 ============
function getConsumablesByType(type) {
    const all = getAllConsumables();

    switch(type) {
        case CONSUMABLE_TYPES.POTION:
            return POTIONS;
        case CONSUMABLE_TYPES.SCROLL:
            return SCROLLS;
        case CONSUMABLE_TYPES.FOOD:
            return FOODS;
        case CONSUMABLE_TYPES.MISC:
            return MISC_ITEMS;
        default:
            return {};
    }
}
