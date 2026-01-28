/**
 * EquipmentUI - 装备UI组件
 * 显示玩家装备槽位、属性加成、装备详情
 * @version 1.0 - Milestone 6 Iteration 7
 */
class EquipmentUI {
    constructor(scene, equipmentManager) {
        this.scene = scene;
        this.equipmentManager = equipmentManager;
        this.isOpen = false;
        this.slotElements = {};

        // UI配置
        this.config = {
            panelWidth: 580,
            panelHeight: 450,
            slotSize: 70,           // 装备槽大小
            slotGap: 15,            // 槽位间距
        };

        this.create();
        console.log('🛡️ EquipmentUI 初始化完成');
    }

    /**
     * 创建装备UI
     */
    create() {
        // 创建半透明遮罩（点击关闭）
        this.overlay = this.scene.add.graphics();
        this.overlay.fillStyle(0x000000, 0.7);
        this.overlay.fillRect(0, 0, 2000, 2000);
        this.overlay.setInteractive({ useHandCursor: true });
        this.overlay.on('pointerdown', () => this.close());
        this.overlay.setVisible(false);
        this.overlay.setDepth(999);

        // 计算面板位置（居中）
        const panelX = (800 - this.config.panelWidth) / 2;
        const panelY = (600 - this.config.panelHeight) / 2;

        // 创建主面板
        this.container = this.scene.add.container(panelX, panelY);
        this.container.setDepth(1000);
        this.container.setVisible(false);

        // 面板背景
        this.background = this.scene.add.graphics();
        this.background.fillStyle(0x1a1a2e, 0.95);
        this.background.lineStyle(3, 0xf59e0b, 1);
        this.background.fillRoundedRect(0, 0, this.config.panelWidth, this.config.panelHeight, 10);
        this.background.strokeRoundedRect(0, 0, this.config.panelWidth, this.config.panelHeight, 10);
        this.container.add(this.background);

        // 标题栏
        this.headerBg = this.scene.add.graphics();
        this.headerBg.fillStyle(0x2d3748, 1);
        this.headerBg.fillRoundedRect(10, 10, this.config.panelWidth - 20, 50, 8);
        this.container.add(this.headerBg);

        // 标题文字
        this.titleText = this.scene.add.text(
            this.config.panelWidth / 2,
            35,
            '🛡️ 装备',
            {
                fontFamily: 'Press Start 2P',
                fontSize: '20px',
                fill: '#f59e0b',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);
        this.container.add(this.titleText);

        // 关闭按钮
        this.closeButton = this.scene.add.text(
            this.config.panelWidth - 20,
            20,
            '✕',
            {
                font: '20px Arial',
                fill: '#ff6b6b'
            }
        ).setOrigin(1, 0);
        this.closeButton.setInteractive({ useHandCursor: true });
        this.closeButton.on('pointerdown', () => this.close());
        this.closeButton.on('pointerover', () => this.closeButton.setScale(1.2));
        this.closeButton.on('pointerout', () => this.closeButton.setScale(1));
        this.container.add(this.closeButton);

        // 创建装备槽位区域
        this.createEquipmentSlots();

        // 创建属性显示区域
        this.createStatsPanel();

        // 提示文字
        this.hintText = this.scene.add.text(
            this.config.panelWidth / 2,
            this.config.panelHeight - 25,
            '点击装备槽查看详情 | 右键卸下装备 | 按 C 键或 ESC 键关闭',
            {
                fontFamily: 'Noto Sans SC',
                fontSize: '12px',
                fill: '#a0aec0'
            }
        ).setOrigin(0.5);
        this.container.add(this.hintText);

        console.log('✅ 装备UI创建完成');
    }

    /**
     * 创建装备槽位
     */
    createEquipmentSlots() {
        const { slotSize, slotGap } = this.config;
        const startX = 30;
        const startY = 80;

        // 定义装备槽位
        const slots = [
            { key: 'weapon', name: '武器', icon: '⚔️', x: startX, y: startY },
            { key: 'armor', name: '护甲', icon: '🛡️', x: startX + slotSize + slotGap, y: startY },
            { key: 'accessory', name: '饰品', icon: '💍', x: startX + (slotSize + slotGap) * 2, y: startY }
        ];

        slots.forEach(slotDef => {
            // 槽位背景
            const slotBg = this.scene.add.graphics();
            slotBg.fillStyle(0x2d3748, 0.8);
            slotBg.lineStyle(2, 0x4a5568, 1);
            slotBg.fillRoundedRect(slotDef.x, slotDef.y, slotSize, slotSize, 8);
            slotBg.strokeRoundedRect(slotDef.x, slotDef.y, slotSize, slotSize, 8);
            this.container.add(slotBg);

            // 槽位图标（默认图标）
            const slotIcon = this.scene.add.text(
                slotDef.x + slotSize / 2,
                slotDef.y + slotSize / 2,
                slotDef.icon,
                {
                    fontFamily: 'Arial',
                    fontSize: '32px'
                }
            ).setOrigin(0.5);
            this.container.add(slotIcon);

            // 槽位名称
            const slotName = this.scene.add.text(
                slotDef.x + slotSize / 2,
                slotDef.y + slotSize + 15,
                slotDef.name,
                {
                    fontFamily: 'Noto Sans SC',
                    fontSize: '12px',
                    fill: '#a0aec0'
                }
            ).setOrigin(0.5);
            this.container.add(slotName);

            // 交互区域
            const hitArea = this.scene.add.container(slotDef.x, slotDef.y);
            hitArea.setSize(slotSize, slotSize);
            hitArea.setInteractive(
                new Phaser.Geom.Rectangle(0, 0, slotSize, slotSize),
                Phaser.Geom.Rectangle.Contains
            );

            // 左键点击：查看详情
            hitArea.on('pointerdown', (pointer) => {
                if (!pointer.rightButtonDown()) {
                    this.onSlotClick(slotDef.key);
                }
            });

            // 右键点击：卸下装备
            hitArea.on('pointerdown', (pointer) => {
                if (pointer.rightButtonDown()) {
                    this.onSlotRightClick(slotDef.key);
                }
            });

            // 悬停效果
            hitArea.on('pointerover', () => {
                slotBg.setFillStyle(0xf59e0b, 0.3);
            });
            hitArea.on('pointerout', () => {
                const equipment = this.equipmentManager.getEquipment(slotDef.key);
                const color = this.getSlotColor(equipment);
                slotBg.setFillStyle(color, 0.8);
            });

            this.container.add(hitArea);

            // 保存槽位元素
            this.slotElements[slotDef.key] = {
                bg: slotBg,
                icon: slotIcon,
                name: slotName,
                hitArea: hitArea,
                key: slotDef.key
            };
        });
    }

    /**
     * 创建属性面板
     */
    createStatsPanel() {
        const panelX = 330;
        const panelY = 80;
        const panelWidth = 240;
        const panelHeight = 200;

        // 属性面板背景
        this.statsBg = this.scene.add.graphics();
        this.statsBg.fillStyle(0x2d3748, 0.9);
        this.statsBg.lineStyle(2, 0x4facfe, 1);
        this.statsBg.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 8);
        this.statsBg.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 8);
        this.container.add(this.statsBg);

        // 属性标题
        this.statsTitle = this.scene.add.text(
            panelX + panelWidth / 2,
            panelY + 20,
            '📊 装备属性',
            {
                fontFamily: 'Noto Sans SC',
                fontSize: '14px',
                fill: '#4facfe',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);
        this.container.add(this.statsTitle);

        // 属性显示（动态更新）
        this.statsElements = {};

        const stats = [
            { key: 'attack', name: '攻击力', icon: '⚔️', y: panelY + 50 },
            { key: 'defense', name: '防御力', icon: '🛡️', y: panelY + 80 },
            { key: 'hp', name: '生命值', icon: '❤️', y: panelY + 110 },
            { key: 'mp', name: '魔法值', icon: '💙', y: panelY + 140 },
            { key: 'critChance', name: '暴击率', icon: '💥', y: panelY + 170 }
        ];

        stats.forEach(stat => {
            const iconText = this.scene.add.text(
                panelX + 20,
                stat.y,
                stat.icon,
                {
                    fontFamily: 'Arial',
                    fontSize: '18px'
                }
            );
            this.container.add(iconText);

            const nameText = this.scene.add.text(
                panelX + 50,
                stat.y,
                stat.name + ':',
                {
                    fontFamily: 'Noto Sans SC',
                    fontSize: '12px',
                    fill: '#a0aec0'
                }
            );
            this.container.add(nameText);

            const valueText = this.scene.add.text(
                panelX + panelWidth - 20,
                stat.y,
                '0',
                {
                    fontFamily: 'Arial',
                    fontSize: '14px',
                    fill: '#68d391',
                    fontStyle: 'bold'
                }
            ).setOrigin(1, 0);
            this.container.add(valueText);

            this.statsElements[stat.key] = valueText;
        });
    }

    /**
     * 获取槽位颜色（基于稀有度）
     */
    getSlotColor(equipment) {
        if (!equipment) return 0x2d3748;

        const rarityColors = {
            'COMMON': 0x9ca3af,      // 灰色
            'UNCOMMON': 0x22c55e,     // 绿色
            'RARE': 0x3b82f6,        // 蓝色
            'LEGENDARY': 0xf59e0b     // 金色
        };

        return rarityColors[equipment.rarity] || 0x2d3748;
    }

    /**
     * 左键点击槽位
     */
    onSlotClick(slot) {
        const equipment = this.equipmentManager.getEquipment(slot);
        if (!equipment) {
            this.scene.showFloatingText(400, 300, '该槽位为空', '#a0aec0');
            return;
        }

        // 显示装备详情
        const desc = this.equipmentManager.getEquipmentDescription(equipment);
        console.log(`📋 装备详情:\n${desc}`);

        // 显示简要提示
        this.scene.showFloatingText(400, 300, `${equipment.name} (${equipment.rarity})`, '#ffd700', 2000);
    }

    /**
     * 右键点击槽位（卸下装备）
     */
    onSlotRightClick(slot) {
        const equipment = this.equipmentManager.getEquipment(slot);
        if (!equipment) {
            this.scene.showFloatingText(400, 300, '该槽位为空', '#a0aec0');
            return;
        }

        // 卸下装备
        const unequipped = this.equipmentManager.unequipItem(slot);
        if (unequipped) {
            // 将装备返回物品栏（如果物品栏有空间）
            const added = this.scene.inventory.addItem(unequipped.id, 1);
            if (added) {
                this.scene.showFloatingText(400, 300, `已卸下: ${unequipped.name}`, '#68d391', 2000);
            } else {
                // 物品栏已满，装备丢失（或者可以放到地上）
                this.scene.showFloatingText(400, 300, `物品栏已满，装备已丢失!`, '#ff6b6b', 3000);
            }

            // 刷新装备显示
            this.refresh();
        }
    }

    /**
     * 刷新装备显示
     */
    refresh() {
        // 更新每个槽位
        Object.values(this.slotElements).forEach(element => {
            const equipment = this.equipmentManager.getEquipment(element.key);

            if (equipment) {
                // 显示装备图标
                element.icon.setText(equipment.icon || this.getSlotIcon(element.key));
                // 更新槽位背景颜色
                const color = this.getSlotColor(equipment);
                element.bg.setFillStyle(color, 0.8);
            } else {
                // 显示默认图标
                const defaultIcons = {
                    'weapon': '⚔️',
                    'armor': '🛡️',
                    'accessory': '💍'
                };
                element.icon.setText(defaultIcons[element.key]);
                element.bg.setFillStyle(0x2d3748, 0.8);
            }
        });

        // 更新属性显示
        const totalStats = this.equipmentManager.getTotalStats();
        const bonus = totalStats.equipmentBonus;

        if (this.statsElements.attack) {
            const baseAtk = this.scene.player.attack || 0;
            this.statsElements.attack.setText(`${baseAtk} +${bonus.attack || 0} = ${totalStats.attack}`);
        }

        if (this.statsElements.defense) {
            const baseDef = this.scene.player.defense || 0;
            this.statsElements.defense.setText(`${baseDef} +${bonus.defense || 0} = ${totalStats.defense}`);
        }

        if (this.statsElements.hp) {
            const baseHp = this.scene.player.maxHp || 0;
            this.statsElements.hp.setText(`${baseHp} +${bonus.hp || 0} = ${totalStats.maxHp}`);
        }

        if (this.statsElements.mp) {
            const baseMp = this.scene.player.maxMp || 0;
            this.statsElements.mp.setText(`${baseMp} +${bonus.mp || 0} = ${totalStats.maxMp}`);
        }

        if (this.statsElements.critChance) {
            const baseCrit = this.scene.player.critChance || 0.15;
            const bonusCrit = (bonus.critChance || 0) * 100;
            const totalCrit = (baseCrit + (bonus.critChance || 0)) * 100;
            this.statsElements.critChance.setText(`${(baseCrit * 100).toFixed(1)}% +${bonusCrit.toFixed(1)}% = ${totalCrit.toFixed(1)}%`);
        }

        console.log('🔄 装备UI已刷新');
    }

    /**
     * 获取槽位默认图标
     */
    getSlotIcon(slot) {
        const icons = {
            'weapon': '⚔️',
            'armor': '🛡️',
            'accessory': '💍'
        };
        return icons[slot] || '❓';
    }

    /**
     * 打开装备界面
     */
    open() {
        if (this.isOpen) return;

        this.isOpen = true;
        this.overlay.setVisible(true);
        this.container.setVisible(true);

        // 刷新装备显示
        this.refresh();

        console.log('🛡️ 装备界面已打开');
    }

    /**
     * 关闭装备界面
     */
    close() {
        if (!this.isOpen) return;

        this.isOpen = false;
        this.overlay.setVisible(false);
        this.container.setVisible(false);

        console.log('🛡️ 装备界面已关闭');
    }

    /**
     * 切换装备界面显示状态
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * 销毁UI
     */
    destroy() {
        Object.values(this.slotElements).forEach(element => {
            if (element.bg) element.bg.destroy();
            if (element.icon) element.icon.destroy();
            if (element.name) element.name.destroy();
            if (element.hitArea) element.hitArea.destroy();
        });

        this.overlay.destroy();
        this.background.destroy();
        this.headerBg.destroy();
        this.titleText.destroy();
        this.closeButton.destroy();
        this.statsBg.destroy();
        this.statsTitle.destroy();
        Object.values(this.statsElements).forEach(el => el.destroy());
        this.hintText.destroy();
        this.container.destroy();

        console.log('🛡️ EquipmentUI 已销毁');
    }
}
