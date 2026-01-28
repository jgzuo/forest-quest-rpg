/**
 * Forest Quest RPG - 主入口文件
 * 初始化 Phaser 游戏实例并配置场景
 */

// 游戏配置
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#2d3748',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // 俯视视角，无重力
            debug: false
        }
    },
    scene: [
        BootScene,    // 预加载素材
        GameScene,    // 主游戏场景
        SettingsScene, // 设置场景
        VictoryScene  // 胜利场景
    ],
    pixelArt: true, // 像素艺术模式
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// 游戏全局状态
window.gameData = {
    // 玩家数据（增强版）
    player: {
        level: 1,
        xp: 0,
        hp: 200,         // 从100增加到200（翻倍）
        maxHp: 200,      // 从100增加到200（翻倍）
        attack: 30,      // 从10增加到30（提升3倍）
        speed: 150,
        // Milestone 6: MP系统
        mp: 50,
        maxMp: 50,
        mpRegenRate: 1
    },
    // 游戏进度
    progress: {
        currentScene: 'GameScene',
        gemsCollected: 0,
        enemiesDefeated: 0,
        totalCoins: 0,
        // 统计数据
        playtimeSeconds: 0,      // 总游戏时间（秒）
        sessionStartTime: null   // 本次会话开始时间
    },
    // 敌人击败统计
    enemiesDefeated: {
        mole: 0,
        treant: 0,
        slime: 0,
        bat: 0,
        skeleton: 0,
        elite_mole_king: 0,
        elite_ancient_treant: 0,
        elite_mutated_slime: 0,
        boss_treant_king: 0
    },
    // Milestone 6: 敌人定义库
    enemyDefinitions: {
        bat: {
            name: '蝙蝠',
            type: 'bat',
            hp: 25,
            attack: 8,
            speed: 90,
            xp: 20,
            gold: 15,
            behavior: 'flying',
            description: '快速飞行的敌人，难以命中'
        },
        skeleton: {
            name: '骷髅',
            type: 'skeleton',
            hp: 60,
            attack: 15,
            speed: 40,
            xp: 40,
            gold: 30,
            behavior: 'undead',
            description: '不死战士，攻击力强但移动缓慢'
        },
        // 精英敌人
        elite_mole_king: {
            name: '巨型鼹鼠王',
            type: 'elite_mole_king',
            hp: 150,
            attack: 15,
            speed: 60,
            xp: 100,
            gold: 80,
            behavior: 'elite',
            isElite: true,
            specialAbility: 'burrow_ambush',
            description: '精英鼹鼠，能够钻地伏击'
        },
        elite_ancient_treant: {
            name: '远古树妖',
            type: 'elite_ancient_treant',
            hp: 200,
            attack: 20,
            speed: 25,
            xp: 150,
            gold: 100,
            behavior: 'elite',
            isElite: true,
            specialAbility: 'root_bind_heal',
            description: '精英树妖，能够束缚敌人并治疗盟友'
        },
        elite_mutated_slime: {
            name: '变异史莱姆',
            type: 'elite_mutated_slime',
            hp: 120,
            attack: 18,
            speed: 50,
            xp: 120,
            gold: 90,
            behavior: 'elite',
            isElite: true,
            specialAbility: 'split_on_death',
            description: '精英史莱姆，死亡时会分裂成小史莱姆'
        }
    },
    // 设置
    settings: {
        musicVolume: 0.5,
        sfxVolume: 0.7,
        musicEnabled: true,
        sfxEnabled: true
    },
    // 任务数据
    quests: {
        activeQuests: [],
        completedQuests: []
    }
};

// 导出任务定义（供QuestManager使用）
window.QUEST_DEFINITIONS = {
    quest_1_moles: {
        id: 'quest_1_moles',
        name: '鼹鼠威胁',
        description: '森林里的鼹鼠太多了，它们在破坏树木的根系。请击败10只鼹鼠来保护森林！',
        objectives: [
            {
                type: 'kill',
                target: 'mole',
                description: '击败鼹鼠',
                required: 10,
                current: 0
            }
        ],
        rewards: {
            xp: 100,
            gold: 50
        }
    },

    quest_2_gems: {
        id: 'quest_2_gems',
        name: '宝石收集',
        description: '据说森林深处散落着3颗神秘的宝石。找到它们并带回来，我将告诉你关于树妖王的秘密。',
        objectives: [
            {
                type: 'collect',
                target: 'gem',
                description: '收集宝石',
                required: 3,
                current: 0
            }
        ],
        rewards: {
            xp: 150,
            gold: 100
        }
    },

    quest_3_boss: {
        id: 'quest_3_boss',
        name: '树妖王',
        description: '树妖王是森林腐化的根源。它盘踞在洞穴深处，等待着勇敢的挑战者。击败它，拯救森林！',
        objectives: [
            {
                type: 'kill',
                target: 'treant_king',
                description: '击败树妖王',
                required: 1,
                current: 0
            }
        ],
        rewards: {
            xp: 500,
            gold: 500,
            items: [
                { name: '森林之心', type: 'legendary' }
            ]
        }
    },

    // Milestone 6 - New Quests
    quest_4_slime_hunter: {
        id: 'quest_4_slime_hunter',
        name: '史莱姆狩猎',
        description: '洞穴里的史莱姆数量激增，开始威胁到探险者的安全。请击败5只史莱姆来清理洞穴！',
        objectives: [
            {
                type: 'kill',
                target: 'slime',
                description: '击败史莱姆',
                required: 5,
                current: 0
            }
        ],
        rewards: {
            xp: 30,
            gold: 50
        },
        unlocks: 'slime_bestiary',
        prerequisites: ['quest_1_moles'] // Requires completing鼹鼠威胁quest
    },

    quest_5_blade_guardian: {
        id: 'quest_5_blade_guardian',
        name: '守护者之刃',
        description: '传说古代守护者使用一把魔剑保护森林。这把剑破碎成3块碎片散落在森林各处。找到所有碎片，重新铸造守护者之刃！',
        objectives: [
            {
                type: 'collect',
                target: 'weapon_fragment',
                description: '收集武器碎片',
                required: 3,
                current: 0
            }
        ],
        rewards: {
            xp: 100,
            gold: 75,
            items: [
                {
                    name: '守护者之刃',
                    type: 'weapon',
                    attack: 5,
                    description: '古代守护者的传奇之剑，攻击力+5'
                }
            ]
        },
        unlocks: 'weapon_upgrade',
        prerequisites: ['quest_1_moles'] // Requires completing鼹鼠威胁quest
    },

    quest_6_lost_cargo: {
        id: 'quest_6_lost_cargo',
        name: '失落的货物',
        description: '商人的马车在森林遇袭，3个装有珍贵货物的箱子散落各地。帮助商人找回这些失落的货物！',
        objectives: [
            {
                type: 'collect',
                target: 'cargo_box',
                description: '找回货物箱子',
                required: 3,
                current: 0
            }
        ],
        rewards: {
            xp: 50,
            gold: 200,
            items: [
                {
                    name: '商人优惠券',
                    type: 'consumable',
                    description: '可以在商店享受8折优惠'
                }
            ]
        },
        unlocks: 'trading_system',
        prerequisites: [] // No prerequisites
    },

    // ============ Milestone 7 Sprint 4: 新区域任务链 ============
    quest_7_investigation: {
        id: 'quest_7_investigation',
        name: '调查异动',
        description: '村长告诉我，雪山方向出现了奇怪的能量波动。请与村长交谈，了解更多关于这些异动的信息。',
        objectives: [
            {
                type: 'talk',
                target: 'elder',
                description: '与村长交谈',
                required: 1,
                current: 0
            }
        ],
        rewards: {
            xp: 200,
            gold: 150
        },
        unlocks: 'snow_mountain_area',
        prerequisites: ['quest_3_boss'] // 需要先击败树妖王
    },

    quest_8_snow_guardian: {
        id: 'quest_8_snow_guardian',
        name: '雪山守护者',
        description: '村长说雪山深处有一只强大的雪怪王在阻挡道路。击败它，才能继续前进！',
        objectives: [
            {
                type: 'kill',
                target: 'yeti_king',
                description: '击败雪怪王',
                required: 1,
                current: 0
            }
        ],
        rewards: {
            xp: 700,
            gold: 600,
            items: [
                { name: '冰霜护符', type: 'accessory', description: '提升对冰霜伤害的抗性' }
            ]
        },
        unlocks: 'volcanic_cavern_area',
        prerequisites: ['quest_7_investigation'] // 需要先完成调查异动
    },

    quest_9_volcanic_cavern: {
        id: 'quest_9_volcanic_cavern',
        name: '探索火山洞穴',
        description: '穿过雪山后，你发现了一个充满熔岩的火山洞穴。探索这个危险的地方，找到龙王的位置！',
        objectives: [
            {
                type: 'explore',
                target: 'volcanic_cavern',
                description: '到达火山洞穴',
                required: 1,
                current: 0
            }
        ],
        rewards: {
            xp: 300,
            gold: 250
        },
        unlocks: 'dragon_lair',
        prerequisites: ['quest_8_snow_guardian'] // 需要先击败雪怪王
    },

    quest_10_dragon_artifacts: {
        id: 'quest_10_dragon_artifacts',
        name: '收集龙族神器',
        description: '在火山洞穴中收集龙族遗留的神器碎片，这些神器可以帮助你对抗龙王！击败火元素、熔岩史莱姆和火龙来获取神器。',
        objectives: [
            {
                type: 'kill',
                target: 'fire_elemental',
                description: '击败火元素',
                required: 5,
                current: 0
            },
            {
                type: 'kill',
                target: 'lava_slime',
                description: '击败熔岩史莱姆',
                required: 5,
                current: 0
            },
            {
                type: 'kill',
                target: 'elite_fire_dragon',
                description: '击败精英火龙',
                required: 1,
                current: 0
            }
        ],
        rewards: {
            xp: 500,
            gold: 400,
            items: [
                { name: '龙族神剑', type: 'weapon', attack: 20, description: '龙族铸造的神剑，攻击力+20' }
            ]
        },
        unlocks: 'dragon_lord_boss',
        prerequisites: ['quest_9_volcanic_cavern'] // 需要先到达火山洞穴
    },

    quest_11_dragon_lord: {
        id: 'quest_11_dragon_lord',
        name: '龙王',
        description: '龙王是所有混乱的根源。它盘踞在火山洞穴的最深处，掌握着强大的火焰力量。击败它，拯救这片土地！',
        objectives: [
            {
                type: 'kill',
                target: 'dragon_lord',
                description: '击败龙王',
                required: 1,
                current: 0
            }
        ],
        rewards: {
            xp: 2000,
            gold: 1500,
            items: [
                { name: '龙王之心', type: 'legendary', description: '传说级物品，蕴含着龙族的力量' },
                { name: '英雄徽章', type: 'legendary', description: '证明你击败了龙王，成为真正的英雄' }
            ]
        },
        unlocks: 'new_game_plus',
        prerequisites: ['quest_10_dragon_artifacts'] // 需要先收集龙族神器
    },

    // ============ Milestone 7: 支线任务（雪山区域）============
    quest_12_snow_treasures: {
        id: 'quest_12_snow_treasures',
        name: '雪山宝藏',
        description: '传说中的雪山中埋藏着古代宝藏，但也被危险的冰霜生物守护着。',
        type: 'side',
        objectives: [{
            type: 'collect',
            target: 'snow_treasure',
            description: '在雪山中找到3个古代宝藏',
            required: 3,
            current: 0
        }],
        rewards: {
            xp: 300,
            gold: 500,
            items: [
                { name: '冰霜护符', type: 'rare', id: 'frost_amulet' }
            ],
            unlocks: 'quest_13_frozen_heart'
        },
        prerequisites: ['quest_9_yeti_king'],
        optional: true
    },

    quest_13_frozen_heart: {
        id: 'quest_13_frozen_heart',
        name: '冰冻之心',
        description: '雪山深处有一颗神秘的冰冻之心，据说能够赋予人不死的力量。',
        type: 'side',
        objectives: [{
            type: 'kill',
            target: 'frost_golem',
            description: '击败冰霜巨人',
            required: 1,
            current: 0
        }, {
            type: 'collect',
            target: 'frozen_heart',
            description: '收集冰冻之心',
            required: 1,
            current: 0
        }],
        rewards: {
            xp: 500,
            gold: 800,
            items: [
                { name: '冰霜之心', type: 'legendary', id: 'frost_heart' }
            ]
        },
        prerequisites: ['quest_12_snow_treasures'],
        optional: true
    },

    // ============ Milestone 7: 支线任务（火山区域）============
    quest_14_fire_crystals: {
        id: 'quest_14_fire_crystals',
        name: '火焰晶体',
        description: '火山洞穴中有珍贵的火焰晶体，许多冒险者为了它们丧命。',
        type: 'side',
        objectives: [{
            type: 'collect',
            target: 'fire_crystal',
            description: '收集5个火焰晶体',
            required: 5,
            current: 0
        }],
        rewards: {
            xp: 400,
            gold: 600,
            items: [
                { name: '火焰护符', type: 'rare', id: 'flame_amulet' }
            ],
            unlocks: 'quest_15_phoenix_ash'
        },
        prerequisites: ['quest_11_dragon_lord'],
        optional: true
    },

    quest_15_phoenix_ash: {
        id: 'quest_15_phoenix_ash',
        name: '凤凰灰烬',
        description: '据说在火山的最深处，有凤凰涅槃后留下的灰烬，拥有强大的复活之力。',
        type: 'side',
        objectives: [{
            type: 'kill',
            target: 'phoenix_guardian',
            description: '击败凤凰守护者',
            required: 1,
            current: 0
        }, {
            type: 'collect',
            target: 'phoenix_ash',
            description: '收集凤凰灰烬',
            required: 1,
            current: 0
        }],
        rewards: {
            xp: 1000,
            gold: 1500,
            items: [
                { name: '凤凰羽毛', type: 'legendary', id: 'phoenix_feather' }
            ]
        },
        prerequisites: ['quest_14_fire_crystals'],
        optional: true
    },

    // ============ Milestone 7: 挑战任务（精英敌人狩猎）============
    quest_16_elite_hunt: {
        id: 'quest_16_elite_hunt',
        name: '精英猎人',
        description: '世界各地出现了强大的精英怪物，击败它们证明你的实力！',
        type: 'challenge',
        objectives: [{
            type: 'kill',
            target: 'elite_mole_king',
            description: '击败巨型鼹鼠王',
            required: 1,
            current: 0
        }, {
            type: 'kill',
            target: 'elite_ancient_treant',
            description: '击败远古树妖',
            required: 1,
            current: 0
        }, {
            type: 'kill',
            target: 'elite_mutated_slime',
            description: '击败变异史莱姆',
            required: 1,
            current: 0
        }],
        rewards: {
            xp: 800,
            gold: 1200,
            items: [
                { name: '猎人徽章', type: 'legendary', id: 'hunter_badge' }
            ],
            unlocks: 'quest_17_boss_rush'
        },
        prerequisites: ['quest_8_snow_mountain'],
        optional: true
    },

    quest_17_boss_rush: {
        id: 'quest_17_boss_rush',
        name: 'Boss Rush挑战',
        description: '连续击败所有Boss，证明你是最强的战士！',
        type: 'challenge',
        objectives: [{
            type: 'special',
            target: 'boss_rush_complete',
            description: '完成Boss Rush模式',
            required: 1,
            current: 0
        }],
        rewards: {
            xp: 2000,
            gold: 3000,
            items: [
                { name: '冠军之剑', type: 'legendary', id: 'champion_blade' }
            ]
        },
        prerequisites: ['quest_16_elite_hunt'],
        optional: true
    },

    // ============ Milestone 7: 收藏任务（装备收集）============
    quest_18_legendary_collector: {
        id: 'quest_18_legendary_collector',
        name: '传说收藏家',
        description: '收集5件传说装备，成为装备大师！',
        type: 'collection',
        objectives: [{
            type: 'collect',
            target: 'legendary_equipment',
            description: '收集5件传说装备',
            required: 5,
            current: 0
        }],
        rewards: {
            xp: 1500,
            gold: 2000,
            items: [
                { name: '收藏家宝箱', type: 'legendary', id: 'collector_chest' }
            ]
        },
        prerequisites: ['quest_11_dragon_lord'],
        optional: true
    },

    quest_19_skill_master: {
        id: 'quest_19_skill_master',
        name: '技能大师',
        description: '解锁技能树的所有节点，成为技能大师！',
        type: 'collection',
        objectives: [{
            type: 'special',
            target: 'unlock_all_skill_nodes',
            description: '解锁所有技能树节点',
            required: 1,
            current: 0
        }],
        rewards: {
            xp: 3000,
            gold: 5000,
            items: [
                { name: '技能之书', type: 'legendary', id: 'skill_book' }
            ],
            unlocks: 'new_game_plus'
        },
        prerequisites: ['quest_11_dragon_lord'],
        optional: true
    },

    // ============ Milestone 7: 特殊任务（每周挑战）============
    quest_20_weekly_challenge: {
        id: 'quest_20_weekly_challenge',
        name: '每周挑战：无尽地牢',
        description: '这周的挑战是：在无尽地牢中达到15层！',
        type: 'weekly',
        objectives: [{
            type: 'special',
            target: 'infinite_dungeon_floor_15',
            description: '在无尽地牢中达到15层',
            required: 1,
            current: 0
        }],
        rewards: {
            xp: 2500,
            gold: 4000,
            items: [
                { name: '挑战者之冠', type: 'legendary', id: 'challenger_crown' }
            ]
        },
        prerequisites: ['quest_11_dragon_lord'],
        optional: true,
        weekly: true
    }
};

// 创建游戏实例
window.addEventListener('load', () => {
    console.log('🌲 Forest Quest RPG');
    console.log('==================');
    console.log('版本：Milestone 1 - 核心战斗系统');
    console.log('状态：开发环境已就绪');
    console.log('==================');

    // 隐藏占位画面
    const placeholderCanvas = document.querySelector('#game-container canvas');
    if (placeholderCanvas) {
        placeholderCanvas.style.display = 'none';
    }

    // 初始化游戏
    window.game = new Phaser.Game(config);

    console.log('✅ 游戏已启动');
    console.log('📝 当前功能：');
    console.log('  - 玩家移动（WASD/方向键）');
    console.log('  - 玩家攻击（空格键）');
    console.log('  - 敌人AI（自动追踪）');
    console.log('  - 战斗系统（伤害、死亡）');
    console.log('  - 经验值升级');
    console.log('  - UI显示（生命条、经验条）');
    console.log('');
    console.log('🚀 下一步计划：');
    console.log('  - 完善动画系统');
    console.log('  - 添加更多敌人类型');
    console.log('  - 实现瓦片地图');
    console.log('  - 添加场景切换');
});
