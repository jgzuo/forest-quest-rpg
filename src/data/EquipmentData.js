/**
 * EquipmentData - 装备数据定义
 * 定义游戏中所有装备的属性、稀有度、加成等
 * @version 1.0 - Milestone 7 Sprint 3
 */

// ============ 装备稀有度定义 ============
const EQUIPMENT_RARITY = {
    COMMON: {
        name: '普通',
        color: '#9ca3af', // 灰色
        statMultiplier: 1.0
    },
    UNCOMMON: {
        name: '优秀',
        color: '#22c55e', // 绿色
        statMultiplier: 1.3
    },
    RARE: {
        name: '稀有',
        color: '#3b82f6', // 蓝色
        statMultiplier: 1.6
    },
    LEGENDARY: {
        name: '传说',
        color: '#f59e0b', // 金色
        statMultiplier: 2.0
    }
};

// ============ 装备槽位定义 ============
const EQUIPMENT_SLOTS = {
    WEAPON: 'weapon',
    ARMOR: 'armor',
    ACCESSORY: 'accessory'
};

// ============ 武器数据 ============
const WEAPONS = {
    // 1级武器 (Tier 1)
    wooden_sword: {
        id: 'wooden_sword',
        name: '木剑',
        slot: EQUIPMENT_SLOTS.WEAPON,
        level: 1,
        rarity: 'COMMON',
        stats: {
            attack: 5,
            critChance: 0.05,
            damageType: 'physical'
        },
        description: '一把简单的木剑，勉强能用'
    },
    rusty_dagger: {
        id: 'rusty_dagger',
        name: '生锈匕首',
        slot: EQUIPMENT_SLOTS.WEAPON,
        level: 1,
        rarity: 'COMMON',
        stats: {
            attack: 4,
            critChance: 0.10,
            damageType: 'physical'
        },
        description: '虽然生锈了，但依然锋利'
    },

    // 5级武器 (Tier 2)
    iron_sword: {
        id: 'iron_sword',
        name: '铁剑',
        slot: EQUIPMENT_SLOTS.WEAPON,
        level: 5,
        rarity: 'UNCOMMON',
        stats: {
            attack: 12,
            critChance: 0.08,
            damageType: 'physical'
        },
        description: '一把坚固的铁剑'
    },
    fire_wand: {
        id: 'fire_wand',
        name: '火焰法杖',
        slot: EQUIPMENT_SLOTS.WEAPON,
        level: 5,
        rarity: 'UNCOMMON',
        stats: {
            attack: 10,
            critChance: 0.05,
            damageType: 'fire'
        },
        description: '散发着火焰之力的法杖'
    },

    // 10级武器 (Tier 3)
    steel_blade: {
        id: 'steel_blade',
        name: '钢刃',
        slot: EQUIPMENT_SLOTS.WEAPON,
        level: 10,
        rarity: 'RARE',
        stats: {
            attack: 25,
            critChance: 0.12,
            damageType: 'physical'
        },
        description: '精钢打造的利刃'
    },
    ice_staff: {
        id: 'ice_staff',
        name: '冰霜法杖',
        slot: EQUIPMENT_SLOTS.WEAPON,
        level: 10,
        rarity: 'RARE',
        stats: {
            attack: 22,
            critChance: 0.08,
            damageType: 'ice'
        },
        description: '蕴含冰霜魔力的法杖'
    },

    // 15级武器 (Tier 4)
    dragon_blade: {
        id: 'dragon_blade',
        name: '龙骨剑',
        slot: EQUIPMENT_SLOTS.WEAPON,
        level: 15,
        rarity: 'LEGENDARY',
        stats: {
            attack: 45,
            critChance: 0.18,
            damageType: 'physical'
        },
        description: '用龙骨打造的传奇之剑'
    },
    phoenix_staff: {
        id: 'phoenix_staff',
        name: '凤凰法杖',
        slot: EQUIPMENT_SLOTS.WEAPON,
        level: 15,
        rarity: 'LEGENDARY',
        stats: {
            attack: 40,
            critChance: 0.15,
            damageType: 'fire'
        },
        description: '传说中的凤凰之火附在其中'
    },

    // 20级武器 (Tier 5)
    excalibur: {
        id: 'excalibur',
        name: '王者之剑',
        slot: EQUIPMENT_SLOTS.WEAPON,
        level: 20,
        rarity: 'LEGENDARY',
        stats: {
            attack: 80,
            critChance: 0.25,
            damageType: 'physical'
        },
        description: '传说中的圣剑，唯有王者才能 wield'
    }
};

// ============ 护甲数据 ============
const ARMORS = {
    // 1级护甲
    cloth_vest: {
        id: 'cloth_vest',
        name: '布衣',
        slot: EQUIPMENT_SLOTS.ARMOR,
        level: 1,
        rarity: 'COMMON',
        stats: {
            defense: 3,
            hp: 10,
            mp: 5
        },
        description: '简单的布制衣物'
    },

    // 5级护甲
    leather_armor: {
        id: 'leather_armor',
        name: '皮甲',
        slot: EQUIPMENT_SLOTS.ARMOR,
        level: 5,
        rarity: 'UNCOMMON',
        stats: {
            defense: 8,
            hp: 25,
            mp: 10
        },
        description: '皮革制成的护甲'
    },
    mage_robe: {
        id: 'mage_robe',
        name: '法师长袍',
        slot: EQUIPMENT_SLOTS.ARMOR,
        level: 5,
        rarity: 'UNCOMMON',
        stats: {
            defense: 5,
            hp: 15,
            mp: 30
        },
        description: '增加魔力的长袍'
    },

    // 10级护甲
    chain_mail: {
        id: 'chain_mail',
        name: '锁子甲',
        slot: EQUIPMENT_SLOTS.ARMOR,
        level: 10,
        rarity: 'RARE',
        stats: {
            defense: 18,
            hp: 50,
            mp: 15
        },
        description: '环环相扣的锁子甲'
    },
    silk_robe: {
        id: 'silk_robe',
        name: '丝绸法袍',
        slot: EQUIPMENT_SLOTS.ARMOR,
        level: 10,
        rarity: 'RARE',
        stats: {
            defense: 10,
            hp: 30,
            mp: 60
        },
        description: '精美的丝绸法袍'
    },

    // 15级护甲
    dragon_armor: {
        id: 'dragon_armor',
        name: '龙鳞甲',
        slot: EQUIPMENT_SLOTS.ARMOR,
        level: 15,
        rarity: 'LEGENDARY',
        stats: {
            defense: 35,
            hp: 100,
            mp: 25
        },
        description: '龙鳞制成的强力护甲'
    },

    // 20级护甲
    divine_armor: {
        id: 'divine_armor',
        name: '神圣铠甲',
        slot: EQUIPMENT_SLOTS.ARMOR,
        level: 20,
        rarity: 'LEGENDARY',
        stats: {
            defense: 60,
            hp: 200,
            mp: 50
        },
        description: '拥有神圣力量的铠甲'
    }
};

// ============ 饰品数据 ============
const ACCESSORIES = {
    // 1级饰品
    copper_ring: {
        id: 'copper_ring',
        name: '铜戒指',
        slot: EQUIPMENT_SLOTS.ACCESSORY,
        level: 1,
        rarity: 'COMMON',
        stats: {
            attack: 2,
            defense: 2
        },
        description: '普通的铜戒指'
    },

    // 5级饰品
    silver_necklace: {
        id: 'silver_necklace',
        name: '银项链',
        slot: EQUIPMENT_SLOTS.ACCESSORY,
        level: 5,
        rarity: 'UNCOMMON',
        stats: {
            hp: 20,
            mp: 20
        },
        description: '银制的护身符'
    },
    power_glove: {
        id: 'power_glove',
        name: '力量手套',
        slot: EQUIPMENT_SLOTS.ACCESSORY,
        level: 5,
        rarity: 'UNCOMMON',
        stats: {
            attack: 5,
            critChance: 0.05
        },
        description: '增加攻击力的手套'
    },

    // 10级饰品
    mana_amulet: {
        id: 'mana_amulet',
        name: '魔力护符',
        slot: EQUIPMENT_SLOTS.ACCESSORY,
        level: 10,
        rarity: 'RARE',
        stats: {
            mp: 50,
            attack: 5
        },
        description: '大幅增加魔力的护符'
    },
    vitality_belt: {
        id: 'vitality_belt',
        name: '生命腰带',
        slot: EQUIPMENT_SLOTS.ACCESSORY,
        level: 10,
        rarity: 'RARE',
        stats: {
            hp: 60,
            defense: 5
        },
        description: '增加生命值的腰带'
    },

    // 15级饰品
    phoenix_feather: {
        id: 'phoenix_feather',
        name: '凤凰羽毛',
        slot: EQUIPMENT_SLOTS.ACCESSORY,
        level: 15,
        rarity: 'LEGENDARY',
        stats: {
            hp: 100,
            mp: 100,
            attack: 10,
            defense: 10
        },
        description: '传说中的凤凰羽毛，拥有强大的力量'
    },

    // 20级饰品
    celestial_ring: {
        id: 'celestial_ring',
        name: '天界之戒',
        slot: EQUIPMENT_SLOTS.ACCESSORY,
        level: 20,
        rarity: 'LEGENDARY',
        stats: {
            attack: 20,
            defense: 20,
            critChance: 0.10,
            hp: 50,
            mp: 50
        },
        description: '来自天界的戒指'
    },

    // ============ 25级传说装备（龙王后解锁）============

    // 25级武器
    dragon_slayer_sword: {
        id: 'dragon_slayer_sword',
        name: '屠龙者',
        slot: EQUIPMENT_SLOTS.WEAPON,
        level: 25,
        rarity: 'LEGENDARY',
        stats: {
            attack: 100,
            critChance: 0.20,
            critDamage: 0.50,
            damageType: 'fire'
        },
        description: '专门为屠龙而锻造的传说之剑'
    },
    void_staff: {
        id: 'void_staff',
        name: '虚空法杖',
        slot: EQUIPMENT_SLOTS.WEAPON,
        level: 25,
        rarity: 'LEGENDARY',
        stats: {
            attack: 80,
            mp: 200,
            critChance: 0.15,
            damageType: 'magic'
        },
        description: '汲取虚空之力的法杖'
    },

    // 25级护甲
    dragon_scale_armor: {
        id: 'dragon_scale_armor',
        name: '龙鳞甲',
        slot: EQUIPMENT_SLOTS.ARMOR,
        level: 25,
        rarity: 'LEGENDARY',
        stats: {
            defense: 35,
            hp: 200,
            attack: 15,
            damageReduction: 0.10
        },
        description: '由真龙鳞片制成的无敌铠甲'
    },
    abyssal_robe: {
        id: 'abyssal_robe',
        name: '深渊法袍',
        slot: EQUIPMENT_SLOTS.ARMOR,
        level: 25,
        rarity: 'LEGENDARY',
        stats: {
            defense: 15,
            mp: 150,
            attack: 30,
            hp: 50
        },
        description: '来自深渊的魔法长袍'
    },

    // 25级饰品
    dragons_heart: {
        id: 'dragons_heart',
        name: '龙王之心',
        slot: EQUIPMENT_SLOTS.ACCESSORY,
        level: 25,
        rarity: 'LEGENDARY',
        stats: {
            hp: 300,
            mp: 200,
            attack: 30,
            defense: 30,
            critChance: 0.15,
            hpRegen: 5,
            mpRegen: 5
        },
        description: '龙王的心脏，蕴含无穷的力量',
        icon: '❤️‍🔥'
    },
    time_twister: {
        id: 'time_twister',
        name: '时光扭曲者',
        slot: EQUIPMENT_SLOTS.ACCESSORY,
        level: 25,
        rarity: 'LEGENDARY',
        stats: {
            attack: 40,
            critChance: 0.25,
            cooldownReduction: 0.20
        },
        description: '能够扭曲时光流速的神器',
        icon: '⏳'
    },

    // ============ 30级神话装备（二周目奖励）============

    // 30级武器
    eternal_blade: {
        id: 'eternal_blade',
        name: '永恒之刃',
        slot: EQUIPMENT_SLOTS.WEAPON,
        level: 30,
        rarity: 'LEGENDARY',
        stats: {
            attack: 150,
            critChance: 0.25,
            critDamage: 1.00,
            damageType: 'void'
        },
        description: '超越时间的传说之剑，一切尽斩',
        icon: '⚔️'
    },
    genesis_staff: {
        id: 'genesis_staff',
        name: '创世法杖',
        slot: EQUIPMENT_SLOTS.WEAPON,
        level: 30,
        rarity: 'LEGENDARY',
        stats: {
            attack: 120,
            mp: 400,
            critChance: 0.20,
            damageType: 'divine'
        },
        description: '创造与毁灭并存的神器',
        icon: '🪄'
    },

    // 30级护甲
    divine_plate: {
        id: 'divine_plate',
        name: '神圣战甲',
        slot: EQUIPMENT_SLOTS.ARMOR,
        level: 30,
        rarity: 'LEGENDARY',
        stats: {
            defense: 50,
            hp: 300,
            attack: 25,
            damageReduction: 0.20,
            hpRegen: 10
        },
        description: '神赐予的无敌铠甲',
        icon: '🛡️'
    },
    ethereal_vest: {
        id: 'ethereal_vest',
        name: '灵体法衣',
        slot: EQUIPMENT_SLOTS.ARMOR,
        level: 30,
        rarity: 'LEGENDARY',
        stats: {
            defense: 20,
            mp: 300,
            attack: 50,
            critChance: 0.15,
            mpRegen: 10
        },
        description: '由纯净灵体织成的法衣',
        icon: '👻'
    },

    // 30级饰品
    world_seed: {
        id: 'world_seed',
        name: '世界种子',
        slot: EQUIPMENT_SLOTS.ACCESSORY,
        level: 30,
        rarity: 'LEGENDARY',
        stats: {
            hp: 500,
            mp: 500,
            attack: 50,
            defense: 50,
            critChance: 0.20,
            critDamage: 0.50,
            allStats: 100
        },
        description: '创世之源，掌握世界之力',
        icon: '🌍'
    },
    chaos_orb: {
        id: 'chaos_orb',
        name: '混沌之珠',
        slot: EQUIPMENT_SLOTS.ACCESSORY,
        level: 30,
        rarity: 'LEGENDARY',
        stats: {
            attack: 100,
            mp: 200,
            critChance: 0.30,
            critDamage: 1.50,
            chaosDamage: 50
        },
        description: '混沌与秩序的完美结合',
        icon: '💠'
    }
};

// ============ 获取所有装备 ============
function getAllEquipment() {
    return {
        weapons: WEAPONS,
        armors: ARMORS,
        accessories: ACCESSORIES
    };
}

// ============ 按等级获取装备 ============
function getEquipmentByLevel(level) {
    const all = getAllEquipment();
    const result = {
        weapons: [],
        armors: [],
        accessories: []
    };

    // 获取武器
    Object.values(all.weapons).forEach(weapon => {
        if (weapon.level === level) {
            result.weapons.push(weapon);
        }
    });

    // 获取护甲
    Object.values(all.armors).forEach(armor => {
        if (armor.level === level) {
            result.armors.push(armor);
        }
    });

    // 获取饰品
    Object.values(all.accessories).forEach(acc => {
        if (acc.level === level) {
            result.accessories.push(acc);
        }
    });

    return result;
}

// ============ 获取装备ID列表 ============
function getEquipmentIds() {
    return {
        weapons: Object.keys(WEAPONS),
        armors: Object.keys(ARMORS),
        accessories: Object.keys(ACCESSORIES)
    };
}

// ============ 根据ID获取装备 ============
function getEquipmentById(id) {
    const all = getAllEquipment();
    return all.weapons[id] || all.armors[id] || all.accessories[id] || null;
}
