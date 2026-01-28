/**
 * ShopManager - 商店管理器
 * 处理商店系统、买卖物品、金币管理
 * @version 1.1 - Milestone 7 Content Expansion: Added consumables from ConsumablesData
 */
class ShopManager {
    constructor(scene) {
        this.scene = scene;
        this.shopOpen = false;

        // 商店物品清单（包含ConsumablesData中的物品）
        this.shopItems = [
            // 基础药水
            {
                id: 'small_hp_potion',
                name: '小型生命药水',
                description: '恢复30点生命值',
                price: 25,
                type: 'consumable'
            },
            {
                id: 'medium_hp_potion',
                name: '中型生命药水',
                description: '恢复75点生命值',
                price: 60,
                type: 'consumable'
            },
            {
                id: 'large_hp_potion',
                name: '大型生命药水',
                description: '恢复150点生命值',
                price: 120,
                type: 'consumable'
            },
            {
                id: 'small_mp_potion',
                name: '小型魔法药水',
                description: '恢复25点法力值',
                price: 30,
                type: 'consumable'
            },
            {
                id: 'medium_mp_potion',
                name: '中型魔法药水',
                description: '恢复60点法力值',
                price: 70,
                type: 'consumable'
            },
            // 增益药水
            {
                id: 'strength_potion',
                name: '力量药水',
                description: '60秒内攻击力+20%',
                price: 80,
                type: 'consumable'
            },
            {
                id: 'iron_skin_potion',
                name: '铁皮药水',
                description: '60秒内防御力+30%',
                price: 80,
                type: 'consumable'
            },
            {
                id: 'speed_potion',
                name: '疾风药水',
                description: '45秒内移动速度+30%',
                price: 100,
                type: 'consumable'
            },
            // 食物
            {
                id: 'apple',
                name: '苹果',
                description: '恢复10点生命值',
                price: 5,
                type: 'consumable'
            },
            {
                id: 'bread',
                name: '面包',
                description: '恢复20点生命值',
                price: 10,
                type: 'consumable'
            },
            {
                id: 'cooked_meat',
                name: '烤肉',
                description: '恢复50点生命值',
                price: 25,
                type: 'consumable'
            },
            // 卷轴
            {
                id: 'town_teleport_scroll',
                name: '回城卷轴',
                description: '立即传送回小镇',
                price: 50,
                type: 'consumable'
            },
            // 特殊物品
            {
                id: 'phoenix_down',
                name: '凤凰羽毛',
                description: '复活并恢复50%生命值',
                price: 300,
                type: 'consumable'
            },
            // 基础装备（保留原有）
            {
                id: 'wooden_sword',
                name: '木剑',
                description: '攻击力+3',
                price: 50,
                type: 'equipment'
            },
            {
                id: 'iron_sword',
                name: '铁剑',
                description: '攻击力+8',
                price: 150,
                type: 'equipment'
            },
            {
                id: 'steel_sword',
                name: '钢剑',
                description: '攻击力+15',
                price: 400,
                type: 'equipment'
            },
            {
                id: 'leather_armor',
                name: '皮甲',
                description: '防御力+2, HP+20',
                price: 120,
                type: 'equipment'
            },
            {
                id: 'iron_armor',
                name: '铁甲',
                description: '防御力+5, HP+50',
                price: 350,
                type: 'equipment'
            }
        ];

        // 确保游戏数据中有金币跟踪
        this.initializeGold();
    }

    /**
     * 初始化金币系统
     */
    initializeGold() {
        if (!window.gameData) {
            window.gameData = {};
        }
        if (!window.gameData.gold) {
            window.gameData.gold = 0;
        }
    }

    /**
     * 获取当前金币数量
     */
    getGold() {
        return this.scene.player.gold || 0;
    }

    /**
     * 增加金币
     */
    addGold(amount) {
        this.scene.player.gold = (this.scene.player.gold || 0) + amount;
        console.log(`💰 获得 ${amount} 金币，当前: ${this.scene.player.gold}`);
        this.scene.updateUI();
    }

    /**
     * 扣除金币
     */
    spendGold(amount) {
        if (this.scene.player.gold >= amount) {
            this.scene.player.gold -= amount;
            console.log(`💸 花费 ${amount} 金币，剩余: ${this.scene.player.gold}`);
            this.scene.updateUI();
            return true;
        }
        console.log(`❌ 金币不足！需要 ${amount}，拥有 ${this.scene.player.gold}`);
        return false;
    }

    /**
     * 打开商店界面
     */
    openShop(merchantName = '商人') {
        if (this.shopOpen) return;

        this.shopOpen = true;
        console.log(`🏪 打开商店: ${merchantName}`);

        // 创建商店UI
        this.createShopUI(merchantName);
    }

    /**
     * 创建商店UI
     */
    createShopUI(merchantName) {
        // 半透明背景
        const bg = this.scene.add.rectangle(400, 300, 700, 500, 0x1a1a2e, 0.95);
        bg.setStrokeStyle(4, 0xffd700);
        bg.setDepth(200);

        // 商店标题
        const title = this.scene.add.text(400, 100, `${merchantName}的商店`, {
            font: 'bold 24px Noto Sans SC',
            fill: '#ffd700',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(201);

        // 金币显示（使用函数以便更新）
        const updateGoldDisplay = () => {
            goldText.setText(`💰 金币: ${this.getGold()}`);
        };

        const goldText = this.scene.add.text(400, 140, '', {
            font: '18px Noto Sans SC',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(201);

        // 初始化金币显示
        updateGoldDisplay();

        // 物品列表容器
        const itemsContainer = this.scene.add.container(0, 0);
        itemsContainer.setDepth(201);

        // 显示前6个物品
        this.shopItems.slice(0, 6).forEach((item, index) => {
            const y = 190 + index * 50;

            // 物品背景
            const itemBg = this.scene.add.rectangle(400, y, 650, 45, 0x2d3748);
            itemBg.setStrokeStyle(2, 0x4a5568);
            itemBg.setDepth(202);

            // 物品名称
            const itemName = this.scene.add.text(130, y, item.name, {
                font: 'bold 16px Noto Sans SC',
                fill: '#ffffff'
            }).setOrigin(0, 0.5).setDepth(203);

            // 物品价格
            const itemPrice = this.scene.add.text(620, y, `${item.price}G`, {
                font: 'bold 16px Arial',
                fill: '#ffd700',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(1, 0.5).setDepth(203);

            // 购买按钮提示
            const buyHint = this.scene.add.text(400, y, `[点击购买 - ${item.description}]`, {
                font: '12px Noto Sans SC',
                fill: '#68d391'
            }).setOrigin(0.5).setDepth(203);

            // 使物品背景可交互
            itemBg.setInteractive();
            itemBg.on('pointerdown', () => {
                const success = this.buyItem(item);
                if (success) {
                    // 更新金币显示
                    updateGoldDisplay();
                }
            });

            itemBg.on('pointerover', () => {
                itemBg.setFillStyle(0x4a5568);
            });

            itemBg.on('pointerout', () => {
                itemBg.setFillStyle(0x2d3748);
            });

            itemsContainer.add(itemBg);
            itemsContainer.add(itemName);
            itemsContainer.add(itemPrice);
            itemsContainer.add(buyHint);
        });

        // 关闭提示
        const closeHint = this.scene.add.text(400, 500, '按 ESC 或点击此处关闭商店', {
            font: '14px Noto Sans SC',
            fill: '#ff6b6b',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(201);

        // 创建输入阻止层
        const inputBlocker = this.scene.add.rectangle(400, 300, 800, 600, 0x000000, 0);
        inputBlocker.setDepth(199);
        inputBlocker.setInteractive();

        // 关闭商店函数
        const closeShop = () => {
            bg.destroy();
            title.destroy();
            goldText.destroy();
            itemsContainer.destroy();
            closeHint.destroy();
            inputBlocker.destroy();
            this.scene.input.keyboard.off('keydown-ESC', closeShop);
            inputBlocker.off('pointerdown', closeShop);
            this.shopOpen = false;
            console.log('🏪 关闭商店');
        };

        // ESC键关闭
        this.scene.input.keyboard.on('keydown-ESC', closeShop);

        // 点击背景关闭
        inputBlocker.on('pointerdown', closeShop);
    }

    /**
     * 购买物品
     * @returns {boolean} 是否购买成功
     */
    buyItem(item) {
        // 检查金币
        if (!this.spendGold(item.price)) {
            this.scene.showFloatingText(400, 300, '金币不足!', '#ff0000');
            return false;
        }

        // 应用物品效果
        this.applyItemEffect(item);

        // 显示购买成功提示
        this.scene.showFloatingText(400, 300, `购买成功: ${item.name}`, '#68d391');

        console.log(`🛒 购买: ${item.name}`);
        return true;
    }

    /**
     * 应用物品效果
     */
    applyItemEffect(item) {
        const player = this.scene.player;
        const effect = item.effect;

        if (effect.hp) {
            if (effect.hp === 'full') {
                // 完全恢复
                player.hp = player.maxHp;
                this.scene.showFloatingText(player.x, player.y, '生命值已完全恢复!', '#ff6b6b');
            } else {
                // 部分恢复
                const healAmount = Math.min(effect.hp, player.maxHp - player.hp);
                player.hp += healAmount;
                this.scene.showFloatingText(player.x, player.y, `+${healAmount} HP`, '#ff6b6b');
            }
        }

        if (effect.permanentAttack) {
            player.attack += effect.permanentAttack;
            this.scene.showFloatingText(player.x, player.y, `攻击力+${effect.permanentAttack}!`, '#ffd700');
        }

        if (effect.permanentMaxHp) {
            player.maxHp += effect.permanentMaxHp;
            player.hp += effect.permanentMaxHp;
            this.scene.showFloatingText(player.x, player.y, `最大生命+${effect.permanentMaxHp}!`, '#ff6b6b');
        }

        if (effect.critChance) {
            if (!player.critChance) player.critChance = 0;
            player.critChance += effect.critChance;
            this.scene.showFloatingText(player.x, player.y, `暴击率+${(effect.critChance * 100).toFixed(0)}%!`, '#ffd700');
        }

        if (effect.attack && effect.duration) {
            // 临时增益效果
            if (!player.tempAttackBoost) player.tempAttackBoost = 0;
            player.tempAttackBoost += effect.attack;

            this.scene.time.delayedCall(effect.duration, () => {
                player.tempAttackBoost -= effect.attack;
                this.scene.showFloatingText(player.x, player.y, '攻击药水效果消失', '#888888');
            });

            this.scene.showFloatingText(player.x, player.y, `攻击+${effect.attack} (${Math.floor(effect.duration / 1000)}秒)`, '#ffd700');
        }

        // 更新UI
        this.scene.updateUI();
    }

    /**
     * 获取商店物品列表
     */
    getShopItems() {
        return this.shopItems;
    }
}
