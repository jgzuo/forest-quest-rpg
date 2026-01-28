/**
 * Inventory - 物品栏系统
 * 管理玩家的物品收集、使用、丢弃
 * @version 1.1 - Milestone 7 Content Expansion: Integrated ConsumablesData
 */
class Inventory {
    constructor(scene) {
        this.scene = scene;
        this.player = scene.player;

        // 物品栏配置
        this.config = {
            maxSlots: 24,           // 最大物品栏格子数
            maxStack: 99,           // 每种物品最大堆叠数
            autoSort: true          // 自动整理物品
        };

        // 物品栏数据
        this.slots = new Array(this.config.maxSlots).fill(null);

        // 预定义物品类型
        this.itemTypes = {
            consumable: 'consumable',  // 消耗品（药水等）
            equipment: 'equipment',    // 装备（武器、防具）
            material: 'material',      // 材料（宝石、矿石等）
            key: 'key',               // 任务物品
            misc: 'misc'              // 杂项
        };

        // 物品定义
        this.itemDefinitions = {
            // 消耗品
            health_potion_small: {
                id: 'health_potion_small',
                name: '小生命药水',
                nameEn: 'Small Health Potion',
                type: this.itemTypes.consumable,
                icon: '🧪',
                description: '恢复30点生命值',
                effect: { heal: 30 },
                stackable: true,
                sellPrice: 10,
                buyPrice: 20
            },
            health_potion_large: {
                id: 'health_potion_large',
                name: '大生命药水',
                nameEn: 'Large Health Potion',
                type: this.itemTypes.consumable,
                icon: '🧴',
                description: '恢复100点生命值',
                effect: { heal: 100 },
                stackable: true,
                sellPrice: 40,
                buyPrice: 80
            },
            mana_potion: {
                id: 'mana_potion',
                name: '法力药水',
                nameEn: 'Mana Potion',
                type: this.itemTypes.consumable,
                icon: '💎',
                description: '恢复30点法力值',
                effect: { restoreMP: 30 },
                stackable: true,
                sellPrice: 15,
                buyPrice: 30
            },

            // 任务物品
            gem: {
                id: 'gem',
                name: '神秘宝石',
                nameEn: 'Mysterious Gem',
                type: this.itemTypes.key,
                icon: '💎',
                description: '任务物品：用于宝石收集任务',
                stackable: false,
                sellPrice: 0,
                buyPrice: 0
            },
            weapon_fragment: {
                id: 'weapon_fragment',
                name: '古代武器碎片',
                nameEn: 'Ancient Weapon Fragment',
                type: this.itemTypes.key,
                icon: '⚔️',
                description: '任务物品：用于重新铸造守护者之刃',
                stackable: true,
                sellPrice: 0,
                buyPrice: 0
            },

            // 装备（简单示例）
            wooden_sword: {
                id: 'wooden_sword',
                name: '木剑',
                nameEn: 'Wooden Sword',
                type: this.itemTypes.equipment,
                icon: '🗡️',
                description: '基础武器，攻击力+3',
                effect: { attack: 3 },
                stackable: false,
                sellPrice: 5,
                buyPrice: 10,
                equipSlot: 'weapon'
            },
            iron_sword: {
                id: 'iron_sword',
                name: '铁剑',
                nameEn: 'Iron Sword',
                type: this.itemTypes.equipment,
                icon: '⚔️',
                description: '精良武器，攻击力+8',
                effect: { attack: 8 },
                stackable: false,
                sellPrice: 20,
                buyPrice: 50,
                equipSlot: 'weapon'
            }
        };

        // 从ConsumablesData加载所有消耗品定义
        this.loadConsumablesData();

        console.log('🎒 Inventory 初始化完成');
    }

    /**
     * 从ConsumablesData加载消耗品定义
     */
    loadConsumablesData() {
        if (typeof getAllConsumables === 'undefined') {
            console.warn('⚠️ ConsumablesData未加载，跳过消耗品数据加载');
            return;
        }

        const allConsumables = getAllConsumables();

        // 合并所有消耗品类型
        ['potions', 'scrolls', 'foods', 'misc'].forEach(category => {
            const items = allConsumables[category];
            if (!items) return;

            Object.values(items).forEach(item => {
                // 转换ConsumablesData格式到Inventory格式
                this.itemDefinitions[item.id] = {
                    id: item.id,
                    name: item.name,
                    type: this.itemTypes.consumable,
                    icon: item.icon,
                    description: item.description,
                    effect: item.effect,
                    stackable: true,
                    sellPrice: Math.floor(item.price * 0.5), // 售价是购买价的一半
                    buyPrice: item.price,
                    rarity: item.rarity,
                    maxStackSize: item.stackSize
                };
            });
        });

        console.log(`✅ 从ConsumablesData加载了 ${Object.keys(allConsumables.potions).length + Object.keys(allConsumables.scrolls).length + Object.keys(allConsumables.foods).length + Object.keys(allConsumables.misc).length} 个消耗品`);
    }

    /**
     * 添加物品到物品栏
     * @param {string} itemId - 物品ID
     * @param {number} quantity - 数量
     * @returns {boolean} 是否成功添加
     */
    addItem(itemId, quantity = 1) {
        const itemDef = this.itemDefinitions[itemId];
        if (!itemDef) {
            console.warn('⚠️ 未知的物品ID: ' + itemId);
            return false;
        }

        // 如果物品可堆叠，先检查是否已有
        if (itemDef.stackable) {
            for (let i = 0; i < this.slots.length; i++) {
                const slot = this.slots[i];
                if (slot && slot.id === itemId && slot.quantity < this.config.maxStack) {
                    // 添加到现有格子
                    const canAdd = Math.min(quantity, this.config.maxStack - slot.quantity);
                    slot.quantity += canAdd;
                    const remaining = quantity - canAdd;

                    if (remaining <= 0) {
                        this.onItemAdded(itemId, canAdd);
                        return true;
                    } else {
                        // 继续添加剩余数量
                        quantity = remaining;
                    }
                }
            }
        }

        // 查找空格子
        if (itemDef.stackable) {
            // 可堆叠物品，一次填满一个格子
            while (quantity > 0) {
                const slotIndex = this.findEmptySlot();
                if (slotIndex === -1) {
                    console.warn('⚠️ 物品栏已满');
                    this.scene.showFloatingText(
                        this.player.x,
                        this.player.y - 40,
                        '物品栏已满!',
                        '#ff6b6b'
                    );
                    return false;
                }

                const addAmount = Math.min(quantity, this.config.maxStack);
                this.slots[slotIndex] = {
                    id: itemId,
                    quantity: addAmount
                };

                this.onItemAdded(itemId, addAmount);
                quantity -= addAmount;
            }
        } else {
            // 不可堆叠物品，需要独立格子
            for (let q = 0; q < quantity; q++) {
                const slotIndex = this.findEmptySlot();
                if (slotIndex === -1) {
                    console.warn('⚠️ 物品栏已满');
                    this.scene.showFloatingText(
                        this.player.x,
                        this.player.y - 40,
                        '物品栏已满!',
                        '#ff6b6b'
                    );
                    return false;
                }

                this.slots[slotIndex] = {
                    id: itemId,
                    quantity: 1
                };

                this.onItemAdded(itemId, 1);
            }
        }

        return true;
    }

    /**
     * 移除物品
     * @param {number} slotIndex - 格子索引
     * @param {number} quantity - 数量
     * @returns {boolean} 是否成功移除
     */
    removeItem(slotIndex, quantity = 1) {
        if (slotIndex < 0 || slotIndex >= this.slots.length) {
            console.warn('⚠️ 无效的格子索引: ' + slotIndex);
            return false;
        }

        const slot = this.slots[slotIndex];
        if (!slot) {
            console.warn('⚠️ 格子为空: ' + slotIndex);
            return false;
        }

        if (slot.quantity < quantity) {
            console.warn('⚠️ 物品数量不足');
            return false;
        }

        slot.quantity -= quantity;

        if (slot.quantity <= 0) {
            this.slots[slotIndex] = null;
        }

        this.onItemRemoved(slot.id, quantity);
        return true;
    }

    /**
     * 使用物品
     * @param {number} slotIndex - 格子索引
     * @returns {boolean} 是否成功使用
     */
    useItem(slotIndex) {
        if (slotIndex < 0 || slotIndex >= this.slots.length) {
            console.warn('⚠️ 无效的格子索引: ' + slotIndex);
            return false;
        }

        const slot = this.slots[slotIndex];
        if (!slot) {
            console.warn('⚠️ 格子为空: ' + slotIndex);
            return false;
        }

        const itemDef = this.itemDefinitions[slot.id];
        if (!itemDef) {
            console.warn('⚠️ 未知的物品ID: ' + slot.id);
            return false;
        }

        // 处理不同类型物品
        if (itemDef.type === this.itemTypes.consumable) {
            return this.useConsumable(slotIndex, itemDef);
        } else if (itemDef.type === this.itemTypes.equipment) {
            return this.equipItem(slotIndex, itemDef);
        } else {
            this.scene.showFloatingText(
                this.player.x,
                this.player.y - 40,
                '此物品无法使用',
                '#ff6b6b'
            );
            return false;
        }
    }

    /**
     * 使用消耗品（增强版 - 支持ConsumablesData）
     */
    useConsumable(slotIndex, itemDef) {
        const effect = itemDef.effect;

        // ============ 恢复类效果 ============

        // 恢复HP (固定值)
        if (effect.heal || (effect.type === 'restore_hp')) {
            const healAmount = effect.heal || effect.value || 0;

            if (this.player.hp >= this.player.maxHp) {
                this.scene.showFloatingText(
                    this.player.x,
                    this.player.y - 40,
                    '生命值已满',
                    '#ff6b6b'
                );
                return false;
            }

            const actualHeal = Math.min(healAmount, this.player.maxHp - this.player.hp);
            this.player.hp += actualHeal;
            this.scene.updateUI();
            this.scene.showFloatingText(
                this.player.x,
                this.player.y - 60,
                `+${actualHeal} HP`,
                '#68d391'
            );
        }

        // 恢复HP百分比
        if (effect.type === 'restore_hp_percent') {
            const percent = effect.value || 100;
            const healAmount = Math.floor(this.player.maxHp * percent / 100);

            if (this.player.hp >= this.player.maxHp) {
                this.scene.showFloatingText(
                    this.player.x,
                    this.player.y - 40,
                    '生命值已满',
                    '#ff6b6b'
                );
                return false;
            }

            const actualHeal = Math.min(healAmount, this.player.maxHp - this.player.hp);
            this.player.hp += actualHeal;
            this.scene.updateUI();
            this.scene.showFloatingText(
                this.player.x,
                this.player.y - 60,
                `+${actualHeal} HP (${percent}%)`,
                '#68d391'
            );
        }

        // 恢复MP
        if (effect.restoreMP || (effect.type === 'restore_mp')) {
            if (!this.scene.resourceManager) {
                console.warn('⚠️ ResourceManager未初始化');
                return false;
            }

            const restoreAmount = effect.restoreMP || effect.value || 0;
            const currentMp = this.player.mp || 50;
            const maxMp = this.player.maxMp || 50;

            if (currentMp >= maxMp) {
                this.scene.showFloatingText(
                    this.player.x,
                    this.player.y - 40,
                    '法力值已满',
                    '#ff6b6b'
                );
                return false;
            }

            this.scene.resourceManager.restoreMP(restoreAmount);
            this.scene.showFloatingText(
                this.player.x,
                this.player.y - 80,
                `+${restoreAmount} MP`,
                '#9f7aea'
            );
        }

        // 同时恢复HP和MP
        if (effect.type === 'restore_both') {
            const hpRestore = effect.hp || 0;
            const mpRestore = effect.mp || 0;

            // 恢复HP
            if (hpRestore > 0 && this.player.hp < this.player.maxHp) {
                const actualHeal = Math.min(hpRestore, this.player.maxHp - this.player.hp);
                this.player.hp += actualHeal;
                this.scene.updateUI();
                this.scene.showFloatingText(
                    this.player.x,
                    this.player.y - 60,
                    `+${actualHeal} HP`,
                    '#68d391'
                );
            }

            // 恢复MP
            if (mpRestore > 0 && this.scene.resourceManager) {
                this.scene.resourceManager.restoreMP(mpRestore);
                this.scene.showFloatingText(
                    this.player.x,
                    this.player.y - 80,
                    `+${mpRestore} MP`,
                    '#9f7aea'
                );
            }
        }

        // ============ 增益类效果 ============

        // 攻击力增益
        if (effect.type === 'buff_attack') {
            const bonus = effect.value || 0;
            const duration = effect.duration || 60;

            if (!this.scene.activeBuffs) {
                this.scene.activeBuffs = [];
            }

            this.scene.activeBuffs.push({
                type: 'attack',
                value: bonus,
                duration: duration * 1000, // 转换为毫秒
                startTime: Date.now()
            });

            this.scene.showFloatingText(
                this.player.x,
                this.player.y - 60,
                `攻击+${bonus}% (${duration}秒)`,
                '#f59e0b'
            );
        }

        // 防御力增益
        if (effect.type === 'buff_defense') {
            const bonus = effect.value || 0;
            const duration = effect.duration || 60;

            if (!this.scene.activeBuffs) {
                this.scene.activeBuffs = [];
            }

            this.scene.activeBuffs.push({
                type: 'defense',
                value: bonus,
                duration: duration * 1000,
                startTime: Date.now()
            });

            this.scene.showFloatingText(
                this.player.x,
                this.player.y - 60,
                `防御+${bonus}% (${duration}秒)`,
                '#3b82f6'
            );
        }

        // 速度增益
        if (effect.type === 'buff_speed') {
            const bonus = effect.value || 0;
            const duration = effect.duration || 45;

            if (!this.scene.activeBuffs) {
                this.scene.activeBuffs = [];
            }

            this.scene.activeBuffs.push({
                type: 'speed',
                value: bonus,
                duration: duration * 1000,
                startTime: Date.now()
            });

            // 应用速度增益
            this.player.speed *= (1 + bonus / 100);
            this.scene.time.delayedCall(duration * 1000, () => {
                this.player.speed /= (1 + bonus / 100);
            });

            this.scene.showFloatingText(
                this.player.x,
                this.player.y - 60,
                `速度+${bonus}% (${duration}秒)`,
                '#22c55e'
            );
        }

        // 狂暴增益（攻击+速度）
        if (effect.type === 'buff_rage') {
            const attackBonus = effect.attackBonus || 0;
            const speedBonus = effect.speedBonus || 0;
            const duration = effect.duration || 30;

            if (!this.scene.activeBuffs) {
                this.scene.activeBuffs = [];
            }

            this.scene.activeBuffs.push({
                type: 'rage',
                attackBonus: attackBonus,
                speedBonus: speedBonus,
                duration: duration * 1000,
                startTime: Date.now()
            });

            // 应用速度增益
            this.player.speed *= (1 + speedBonus / 100);
            this.scene.time.delayedCall(duration * 1000, () => {
                this.player.speed /= (1 + speedBonus / 100);
            });

            this.scene.showFloatingText(
                this.player.x,
                this.player.y - 60,
                `狂暴! (${duration}秒)`,
                '#ef4444'
            );
        }

        // ============ 特殊效果 ============

        // 传送回城
        if (effect.type === 'teleport' && effect.target === 'town') {
            this.scene.sceneManager.loadScene('town');
            this.scene.showFloatingText(
                400,
                300,
                '传送回小镇...',
                '#ffd700'
            );
        }

        // 复活
        if (effect.type === 'revive') {
            this.scene.showFloatingText(
                this.player.x,
                this.player.y - 60,
                '复活道具',
                '#ffd700'
            );
            // TODO: 实现复活逻辑
        }

        // ============ 未实现的效果 ============

        const unimplementedEffects = [
            'resistance',      // 抗性
            'debuff_enemies',  // 敌人减益
            'reveal_hidden',   // 显示隐藏物品
            'enhance_weapon',  // 武器强化
            'enhance_armor',   // 护甲强化
            'escape',          // 逃跑
            'lure'             // 诱饵
        ];

        if (unimplementedEffects.includes(effect.type)) {
            this.scene.showFloatingText(
                this.player.x,
                this.player.y - 60,
                '效果开发中...',
                '#ffd700'
            );
            console.log(`🔧 消耗品效果待实现: ${effect.type}`);
            // 不消耗物品，允许玩家保留
            return false;
        }

        // 消耗物品
        this.removeItem(slotIndex, 1);
        return true;
    }

    /**
     * 装备物品
     * @param {number} slotIndex - 格子索引
     * @param {object} itemDef - 物品定义
     * @returns {boolean} 是否成功
     */
    equipItem(slotIndex, itemDef) {
        // ============ v1.9.3: 集成装备系统 ============

        // 确定装备槽位
        let slot = itemDef.slot || 'weapon';

        // 调用EquipmentManager装备物品
        if (this.scene.equipmentManager) {
            const oldEquipment = this.scene.equipmentManager.equipItem(slot, itemDef);

            // 如果装备成功，从物品栏移除已装备的物品
            if (oldEquipment !== undefined) {
                this.removeItem(slotIndex, 1);

                // 如果有旧装备，放回物品栏
                if (oldEquipment && this.addItem) {
                    this.addItem(oldEquipment.id);
                }

                return true;
            } else {
                // 装备失败（等级不足等原因）
                return false;
            }
        } else {
            console.error('❌ EquipmentManager未初始化');
            this.scene.showFloatingText(
                this.player.x,
                this.player.y - 40,
                '装备系统未初始化',
                '#ff6b6b'
            );
            return false;
        }
    }

    /**
     * 丢弃物品
     * @param {number} slotIndex - 格子索引
     */
    dropItem(slotIndex) {
        if (slotIndex < 0 || slotIndex >= this.slots.length) {
            return false;
        }

        const slot = this.slots[slotIndex];
        if (!slot) {
            return false;
        }

        const itemDef = this.itemDefinitions[slot.id];

        // 在玩家位置生成物品
        this.scene.dropItem(this.player.x, this.player.y, slot.id);

        // 移除物品
        this.removeItem(slotIndex, slot.quantity);

        this.scene.showFloatingText(
            this.player.x,
            this.player.y - 40,
            `丢弃: ${itemDef.name}`,
            '#888888'
        );

        return true;
    }

    /**
     * 查找空格子
     */
    findEmptySlot() {
        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i] === null) {
                return i;
            }
        }
        return -1;
    }

    /**
     * 获取物品统计
     */
    getStats() {
        let totalItems = 0;
        let uniqueItems = 0;

        this.slots.forEach(slot => {
            if (slot) {
                uniqueItems++;
                totalItems += slot.quantity;
            }
        });

        return {
            totalSlots: this.config.maxSlots,
            usedSlots: uniqueItems,
            freeSlots: this.config.maxSlots - uniqueItems,
            totalItems: totalItems,
            uniqueItems: uniqueItems
        };
    }

    /**
     * 物品添加回调
     */
    onItemAdded(itemId, quantity) {
        console.log(`📦 添加物品: ${itemId} x${quantity}`);

        // 刷新UI
        if (this.scene.inventoryUI) {
            this.scene.inventoryUI.refresh();
        }
    }

    /**
     * 物品移除回调
     */
    onItemRemoved(itemId, quantity) {
        console.log(`📦 移除物品: ${itemId} x${quantity}`);

        // 刷新UI
        if (this.scene.inventoryUI) {
            this.scene.inventoryUI.refresh();
        }
    }

    /**
     * 保存物品栏数据
     */
    save() {
        return {
            slots: this.slots,
            config: this.config
        };
    }

    /**
     * 加载物品栏数据
     */
    load(data) {
        if (!data) return;

        if (data.slots) {
            this.slots = data.slots;
        }

        if (data.config) {
            this.config = { ...this.config, ...data.config };
        }

        console.log('📦 物品栏数据已加载');
    }

    /**
     * 清理资源
     */
    destroy() {
        console.log('🎒 Inventory 已清理');
    }
}
