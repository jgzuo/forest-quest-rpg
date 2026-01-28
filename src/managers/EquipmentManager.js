/**
 * EquipmentManager - 装备系统管理器
 * 管理装备槽位、装备加成、装备切换等
 * @version 1.0 - Milestone 7 Sprint 3
 */
class EquipmentManager {
    constructor(scene) {
        this.scene = scene;
        this.player = scene.player;

        // 装备槽位
        this.equipment = {
            weapon: null,      // 武器槽
            armor: null,       // 护甲槽
            accessory: null    // 饰品槽
        };

        // 装备加成统计
        this.stats = {
            attack: 0,
            defense: 0,
            hp: 0,
            mp: 0,
            critChance: 0
        };

        console.log('🛡️ EquipmentManager 初始化完成');
    }

    /**
     * 装备物品到指定槽位
     * @param {string} slot - 槽位 ('weapon', 'armor', 'accessory')
     * @param {object} equipmentData - 装备数据对象
     * @returns {object} 旧装备 (如果有)
     */
    equipItem(slot, equipmentData) {
        console.log(`⚔️ 装备: ${equipmentData.name} 到 ${slot}`);

        // 检查槽位是否有效
        if (!this.equipment.hasOwnProperty(slot)) {
            console.error(`❌ 无效的装备槽位: ${slot}`);
            return null;
        }

        // 检查装备数据是否有效
        if (!equipmentData || !equipmentData.id) {
            console.error('❌ 无效的装备数据');
            return null;
        }

        // 检查等级要求
        const playerLevel = this.player.level || 1;
        if (equipmentData.level > playerLevel) {
            this.scene.showFloatingText(
                this.player.x,
                this.player.y - 60,
                `等级不足! 需要 ${equipmentData.level} 级`,
                '#ff6b6b',
                2000
            );
            return null;
        }

        // 卸下旧装备 (保存到返回值)
        const oldEquipment = this.equipment[slot];

        // 装备新物品
        this.equipment[slot] = equipmentData;

        // 重新计算属性
        this.recalculateStats();

        // 应用属性到玩家
        this.applyStatsToPlayer();

        // 显示装备提示
        this.scene.showFloatingText(
            this.player.x,
            this.player.y - 40,
            `装备: ${equipmentData.name}`,
            '#68d391',
            1500
        );

        // 播放音效 (占位符)
        // this.scene.audioManager.playEquipSound();

        console.log(`✅ 装备成功: ${equipmentData.name}`);
        return oldEquipment;
    }

    /**
     * 卸下装备
     * @param {string} slot - 槽位
     * @returns {object} 卸下的装备
     */
    unequipItem(slot) {
        if (!this.equipment.hasOwnProperty(slot)) {
            console.error(`❌ 无效的装备槽位: ${slot}`);
            return null;
        }

        const equipment = this.equipment[slot];
        if (!equipment) {
            console.warn(`⚠️ 槽位 ${slot} 没有装备`);
            return null;
        }

        console.log(`🔓 卸下装备: ${equipment.name} 从 ${slot}`);

        // 清空槽位
        this.equipment[slot] = null;

        // 重新计算属性
        this.recalculateStats();

        // 应用属性到玩家
        this.applyStatsToPlayer();

        // 显示提示
        this.scene.showFloatingText(
            this.player.x,
            this.player.y - 40,
            `卸下: ${equipment.name}`,
            '#ffd700',
            1500
        );

        return equipment;
    }

    /**
     * 重新计算装备加成
     */
    recalculateStats() {
        // 重置统计
        this.stats = {
            attack: 0,
            defense: 0,
            hp: 0,
            mp: 0,
            critChance: 0,
            critDamage: 0  // ============ v1.9.3: 添加critDamage支持 ============
        };

        // 遍历所有装备槽位
        Object.values(this.equipment).forEach(equipment => {
            if (!equipment || !equipment.stats) return;

            const equipmentStats = equipment.stats;

            // 累加属性
            if (equipmentStats.attack) this.stats.attack += equipmentStats.attack;
            if (equipmentStats.defense) this.stats.defense += equipmentStats.defense;
            if (equipmentStats.hp) this.stats.hp += equipmentStats.hp;
            if (equipmentStats.mp) this.stats.mp += equipmentStats.mp;
            if (equipmentStats.critChance) this.stats.critChance += equipmentStats.critChance;
            // ============ v1.9.3: 累加critDamage ============
            if (equipmentStats.critDamage) this.stats.critDamage += equipmentStats.critDamage;
        });

        console.log('📊 装备加成:', this.stats);
    }

    /**
     * 应用装备属性到玩家
     */
    applyStatsToPlayer() {
        // ============ v1.9.4: 将装备属性应用到玩家对象 ============
        // CombatSystem通过player.xxx读取这些属性

        // 计算总暴击率 = 基础暴击率 + 装备加成
        const baseCritChance = this.player.critChance || 0.1;
        this.player.critChance = baseCritChance + this.stats.critChance;

        // 计算总暴击伤害 = 基础暴击伤害 + 装备加成
        const baseCritDamage = this.player.critDamage || 0;
        this.player.critDamage = baseCritDamage + this.stats.critDamage;

        // 计算总防御力 = 基础防御 + 装备加成
        const baseDefense = this.player.defense || 0;
        this.player.defense = baseDefense + this.stats.defense;

        console.log(`📊 装备属性已应用到玩家:`, {
            critChance: this.player.critChance,
            critDamage: this.player.critDamage,
            defense: this.player.defense,
            equipmentBonus: this.stats
        });

        // HP和MP的特殊处理
        if (this.stats.hp > 0) {
            console.log(`❤️ HP加成: +${this.stats.hp}`);
        }

        if (this.stats.mp > 0) {
            console.log(`💙 MP加成: +${this.stats.mp}`);
        }

        // 更新UI显示
        if (this.scene.updateUI) {
            this.scene.updateUI();
        }
    }

    /**
     * 获取玩家总属性 (基础值 + 装备加成)
     */
    getTotalStats() {
        return {
            // 基础属性 + 装备加成
            attack: (this.player.attack || 0) + this.stats.attack,
            defense: (this.player.defense || 0) + this.stats.defense,
            maxHp: (this.player.maxHp || 0) + this.stats.hp,
            maxMp: (this.player.maxMp || 0) + this.stats.mp,
            critChance: (this.player.critChance || 0.15) + this.stats.critChance,
            critDamage: (this.player.critDamage || 0) + this.stats.critDamage,  // ============ v1.9.3: 添加critDamage ============

            // 装备加成 (单独显示)
            equipmentBonus: { ...this.stats }
        };
    }

    /**
     * 获取指定槽位的装备
     * @param {string} slot - 槽位
     * @returns {object|null} 装备对象或null
     */
    getEquipment(slot) {
        return this.equipment[slot] || null;
    }

    /**
     * 获取所有装备
     * @returns {object} 所有装备槽位
     */
    getAllEquipment() {
        return { ...this.equipment };
    }

    /**
     * 检查是否有装备在指定槽位
     * @param {string} slot - 槽位
     * @returns {boolean}
     */
    hasEquipment(slot) {
        return this.equipment[slot] !== null;
    }

    /**
     * 比较两个装备的属性
     * @param {object} equipment1 - 装备1
     * @param {object} equipment2 - 装备2
     * @returns {object} 比较结果 { better, same, worse, diffStats }
     */
    compareEquipment(equipment1, equipment2) {
        if (!equipment1 || !equipment2) {
            return { better: false, same: false, worse: false, diffStats: {} };
        }

        // 检查是否同一装备
        if (equipment1.id === equipment2.id) {
            return { better: false, same: true, worse: false, diffStats: {} };
        }

        // 比较属性
        const stats1 = equipment1.stats || {};
        const stats2 = equipment2.stats || {};
        const diffStats = {};
        let betterCount = 0;
        let worseCount = 0;

        // 比较所有属性
        const allKeys = new Set([
            ...Object.keys(stats1),
            ...Object.keys(stats2)
        ]);

        allKeys.forEach(key => {
            const val1 = stats1[key] || 0;
            const val2 = stats2[key] || 0;
            const diff = val2 - val1;

            if (diff !== 0) {
                diffStats[key] = {
                    old: val1,
                    new: val2,
                    diff: diff,
                    better: diff > 0
                };

                if (diff > 0) betterCount++;
                if (diff < 0) worseCount++;
            }
        });

        // 判断整体优劣
        let result = 'same';
        if (betterCount > worseCount) {
            result = 'better';
        } else if (worseCount > betterCount) {
            result = 'worse';
        }

        return {
            better: result === 'better',
            same: result === 'same',
            worse: result === 'worse',
            diffStats: diffStats
        };
    }

    /**
     * 获取装备描述文本 (包含属性和对比)
     * @param {object} equipment - 装备对象
     * @param {object} compareWith - 对比装备 (可选)
     * @returns {string} 描述文本
     */
    getEquipmentDescription(equipment, compareWith = null) {
        if (!equipment) return '';

        let desc = `${equipment.name}\n`;
        desc += `${equipment.description}\n\n`;

        // 稀有度
        const rarity = EQUIPMENT_RARITY[equipment.rarity];
        desc += `[${rarity.name}]\n`;

        // 属性
        const stats = equipment.stats || {};
        if (stats.attack) desc += `⚔️ 攻击力: +${stats.attack}\n`;
        if (stats.defense) desc += `🛡️ 防御力: +${stats.defense}\n`;
        if (stats.hp) desc += `❤️ 生命值: +${stats.hp}\n`;
        if (stats.mp) desc += `💙 魔法值: +${stats.mp}\n`;
        if (stats.critChance) desc += `💥 暴击率: +${(stats.critChance * 100).toFixed(1)}%\n`;

        // 对比
        if (compareWith) {
            const comparison = this.compareEquipment(equipment, compareWith);
            if (!comparison.same) {
                desc += '\n--- 对比 ---\n';
                Object.entries(comparison.diffStats).forEach(([key, data]) => {
                    const icon = this.getStatIcon(key);
                    const symbol = data.better ? '▲' : '▼';
                    const color = data.better ? '#22c55e' : '#ef4444';
                    desc += `${icon} ${symbol} ${data.old} → ${data.new}\n`;
                });
            }
        }

        return desc;
    }

    /**
     * 获取属性图标
     * @param {string} statName - 属性名称
     * @returns {string} 图标emoji
     */
    getStatIcon(statName) {
        const icons = {
            attack: '⚔️',
            defense: '🛡️',
            hp: '❤️',
            mp: '💙',
            critChance: '💥'
        };
        return icons[statName] || '📊';
    }

    /**
     * 获取存档数据
     * @returns {object} 存档数据
     */
    getSaveData() {
        return {
            equipment: {
                weapon: this.equipment.weapon ? this.equipment.weapon.id : null,
                armor: this.equipment.armor ? this.equipment.armor.id : null,
                accessory: this.equipment.accessory ? this.equipment.accessory.id : null
            }
        };
    }

    /**
     * 加载存档数据
     * @param {object} data - 存档数据
     */
    loadSaveData(data) {
        if (!data || !data.equipment) {
            console.log('📦 无装备存档数据，使用默认装备');
            return;
        }

        console.log('📦 加载装备存档:', data.equipment);

        // 根据ID重新加载装备对象
        const savedEquipment = data.equipment;
        const allEquipment = getAllEquipment();

        // 加载武器
        if (savedEquipment.weapon) {
            const weapon = allEquipment.weapons[savedEquipment.weapon];
            if (weapon) {
                this.equipment.weapon = weapon;
            }
        }

        // 加载护甲
        if (savedEquipment.armor) {
            const armor = allEquipment.armors[savedEquipment.armor];
            if (armor) {
                this.equipment.armor = armor;
            }
        }

        // 加载饰品
        if (savedEquipment.accessory) {
            const accessory = allEquipment.accessories[savedEquipment.accessory];
            if (accessory) {
                this.equipment.accessory = accessory;
            }
        }

        // 重新计算属性
        this.recalculateStats();
        this.applyStatsToPlayer();

        console.log('✅ 装备存档加载完成');
    }

    /**
     * 销毁装备管理器
     */
    destroy() {
        console.log('🧹 清理 EquipmentManager');
        this.equipment = null;
        this.stats = null;
    }
}
