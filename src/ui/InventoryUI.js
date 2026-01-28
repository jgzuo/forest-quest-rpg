/**
 * InventoryUI - 物品栏UI组件
 * 显示玩家物品栏，支持物品使用、丢弃
 * @version 1.0 - Milestone 6 Iteration 6
 */
class InventoryUI {
    constructor(scene, inventory) {
        this.scene = scene;
        this.inventory = inventory;
        this.isOpen = false;
        this.slotElements = [];
        this.tooltipElement = null;

        // UI配置
        this.config = {
            slotSize: 50,           // 每个格子大小
            slotGap: 8,             // 格子间距
            cols: 6,                // 每行6个格子
            rows: 4,                // 4行
            panelWidth: 680,        // 面板宽度
            panelHeight: 520        // 面板高度
        };

        this.create();
        console.log('🎒 InventoryUI 初始化完成');
    }

    /**
     * 创建物品栏UI
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
        this.background.lineStyle(3, 0x4facfe, 1);
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
            '🎒 物品栏',
            {
                fontFamily: 'Press Start 2P',
                fontSize: '20px',
                fill: '#4facfe',
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

        // 物品统计信息
        this.statsText = this.scene.add.text(20, 45, '', {
            fontFamily: 'Noto Sans SC',
            fontSize: '12px',
            fill: '#a0aec0'
        });
        this.container.add(this.statsText);

        // 创建物品格子容器
        const gridStartX = 40;
        const gridStartY = 80;
        this.slotsContainer = this.scene.add.container(gridStartX, gridStartY);
        this.container.add(this.slotsContainer);

        // 创建24个物品格子
        this.createSlots();

        // 物品详情区域
        this.createDetailsPanel();

        // 提示文字
        this.hintText = this.scene.add.text(
            this.config.panelWidth / 2,
            this.config.panelHeight - 25,
            '左键: 使用 | 右键: 丢弃 | 按 I 键或 ESC 键关闭',
            {
                fontFamily: 'Noto Sans SC',
                fontSize: '13px',
                fill: '#a0aec0'
            }
        ).setOrigin(0.5);
        this.container.add(this.hintText);

        console.log('✅ 物品栏UI创建完成');
    }

    /**
     * 创建物品格子
     */
    createSlots() {
        const { slotSize, slotGap, cols, rows } = this.config;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const slotIndex = row * cols + col;
                const x = col * (slotSize + slotGap);
                const y = row * (slotSize + slotGap);

                // 格子背景
                const slotBg = this.scene.add.graphics();
                slotBg.fillStyle(0x2d3748, 0.8);
                slotBg.lineStyle(2, 0x4a5568, 1);
                slotBg.fillRoundedRect(x, y, slotSize, slotSize, 5);
                slotBg.strokeRoundedRect(x, y, slotSize, slotSize, 5);
                this.slotsContainer.add(slotBg);

                // 格子索引标记（用于调试）
                const indexText = this.scene.add.text(
                    x + slotSize / 2,
                    y + slotSize / 2,
                    slotIndex.toString(),
                    {
                        fontFamily: 'Arial',
                        fontSize: '10px',
                        fill: 'rgba(255, 255, 255, 0.2)'
                    }
                ).setOrigin(0.5);
                this.slotsContainer.add(indexText);

                // 物品图标容器（动态填充）
                const iconContainer = this.scene.add.container(x, y);
                iconContainer.setSize(slotSize, slotSize);
                this.slotsContainer.add(iconContainer);

                // 物品图标
                const iconText = this.scene.add.text(
                    slotSize / 2,
                    slotSize / 2,
                    '',
                    {
                        fontFamily: 'Arial',
                        fontSize: '24px'
                    }
                ).setOrigin(0.5);
                iconContainer.add(iconText);

                // 物品数量
                const quantityText = this.scene.add.text(
                    slotSize - 5,
                    slotSize - 5,
                    '',
                    {
                        fontFamily: 'Arial',
                        fontSize: '12px',
                        fill: '#ffffff',
                        stroke: '#000000',
                        strokeThickness: 3,
                        fontStyle: 'bold'
                    }
                ).setOrigin(1, 1);
                iconContainer.add(quantityText);

                // 交互区域
                iconContainer.setInteractive(
                    new Phaser.Geom.Rectangle(0, 0, slotSize, slotSize),
                    Phaser.Geom.Rectangle.Contains
                );
                iconContainer.on('pointerdown', (pointer) => {
                    if (pointer.rightButtonDown()) {
                        this.onRightClick(slotIndex);
                    } else {
                        this.onLeftClick(slotIndex);
                    }
                });
                iconContainer.on('pointerover', () => this.onSlotHover(slotIndex));
                iconContainer.on('pointerout', () => this.onSlotHoverEnd());

                // 保存格子元素
                this.slotElements[slotIndex] = {
                    bg: slotBg,
                    container: iconContainer,
                    icon: iconText,
                    quantity: quantityText,
                    index: indexText
                };
            }
        }
    }

    /**
     * 创建物品详情面板
     */
    createDetailsPanel() {
        const panelX = 450;
        const panelY = 80;
        const panelWidth = 210;
        const panelHeight = 250;

        // 详情面板背景
        this.detailsBg = this.scene.add.graphics();
        this.detailsBg.fillStyle(0x2d3748, 0.9);
        this.detailsBg.lineStyle(2, 0x4facfe, 1);
        this.detailsBg.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 8);
        this.detailsBg.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 8);
        this.container.add(this.detailsBg);

        // 详情标题
        this.detailsName = this.scene.add.text(
            panelX + panelWidth / 2,
            panelY + 25,
            '选择一个物品',
            {
                fontFamily: 'Noto Sans SC',
                fontSize: '16px',
                fill: '#ffd700',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5);
        this.container.add(this.detailsName);

        // 详情类型
        this.detailsType = this.scene.add.text(
            panelX + panelWidth / 2,
            panelY + 50,
            '',
            {
                fontFamily: 'Noto Sans SC',
                fontSize: '12px',
                fill: '#4facfe'
            }
        ).setOrigin(0.5);
        this.container.add(this.detailsType);

        // 详情描述
        this.detailsDesc = this.scene.add.text(
            panelX + 15,
            panelY + 75,
            '悬停在物品上\n查看详细信息',
            {
                fontFamily: 'Noto Sans SC',
                fontSize: '12px',
                fill: '#e2e8f0',
                wordWrap: { width: panelWidth - 30 },
                lineSpacing: 5
            }
        );
        this.container.add(this.detailsDesc);

        // 详情效果
        this.detailsEffect = this.scene.add.text(
            panelX + 15,
            panelY + 160,
            '',
            {
                fontFamily: 'Noto Sans SC',
                fontSize: '12px',
                fill: '#68d391',
                wordWrap: { width: panelWidth - 30 },
                lineSpacing: 3
            }
        );
        this.container.add(this.detailsEffect);

        // 详情价格
        this.detailsPrice = this.scene.add.text(
            panelX + panelWidth / 2,
            panelY + 230,
            '',
            {
                fontFamily: 'Noto Sans SC',
                fontSize: '12px',
                fill: '#ffd700'
            }
        ).setOrigin(0.5);
        this.container.add(this.detailsPrice);
    }

    /**
     * 左键点击格子
     */
    onLeftClick(slotIndex) {
        const slot = this.inventory.slots[slotIndex];
        if (!slot) {
            this.scene.showFloatingText(400, 300, '该格子为空', '#a0aec0');
            return;
        }

        const itemDef = this.inventory.itemDefinitions[slot.id];
        if (!itemDef) return;

        // 使用物品
        const success = this.inventory.useItem(slotIndex);
        if (success) {
            this.scene.showFloatingText(400, 300, `使用: ${itemDef.name}`, '#68d391');
            this.refresh();
        }
    }

    /**
     * 右键点击格子
     */
    onRightClick(slotIndex) {
        const slot = this.inventory.slots[slotIndex];
        if (!slot) {
            this.scene.showFloatingText(400, 300, '该格子为空', '#a0aec0');
            return;
        }

        const itemDef = this.inventory.itemDefinitions[slot.id];
        if (!itemDef) return;

        // 丢弃物品
        const success = this.inventory.dropItem(slotIndex);
        if (success) {
            this.scene.showFloatingText(400, 300, `丢弃: ${itemDef.name}`, '#ff6b6b');
            this.refresh();
        }
    }

    /**
     * 悬停在格子上
     */
    onSlotHover(slotIndex) {
        // 高亮格子背景
        if (this.slotElements[slotIndex]) {
            this.slotElements[slotIndex].bg.setFillStyle(0x4facfe, 0.3);
        }

        // 显示物品详情
        const slot = this.inventory.slots[slotIndex];
        if (!slot) {
            this.updateDetailsPanel(null);
            return;
        }

        const itemDef = this.inventory.itemDefinitions[slot.id];
        if (!itemDef) return;

        this.updateDetailsPanel(itemDef, slot.quantity);
    }

    /**
     * 悬停结束
     */
    onSlotHoverEnd() {
        // 恢复格子背景
        this.slotElements.forEach(element => {
            if (element && element.bg) {
                element.bg.setFillStyle(0x2d3748, 0.8);
            }
        });

        // 恢复详情面板
        this.updateDetailsPanel(null);
    }

    /**
     * 更新详情面板
     */
    updateDetailsPanel(itemDef, quantity) {
        if (!itemDef) {
            this.detailsName.setText('选择一个物品');
            this.detailsName.setFill('#ffd700');
            this.detailsType.setText('');
            this.detailsDesc.setText('悬停在物品上\n查看详细信息');
            this.detailsEffect.setText('');
            this.detailsPrice.setText('');
            return;
        }

        // 类型名称映射
        const typeNames = {
            'consumable': '消耗品',
            'equipment': '装备',
            'material': '材料',
            'key': '任务物品',
            'misc': '杂项'
        };

        // 更新详情
        this.detailsName.setText(`${itemDef.icon} ${itemDef.name}`);
        this.detailsType.setText(`[${typeNames[itemDef.type] || itemDef.type}]`);
        this.detailsDesc.setText(itemDef.description);

        // 显示效果
        if (itemDef.effect) {
            const effects = [];
            if (itemDef.effect.heal) {
                effects.push(`恢复 ${itemDef.effect.heal} HP`);
            }
            if (itemDef.effect.restoreMP) {
                effects.push(`恢复 ${itemDef.effect.restoreMP} MP`);
            }
            if (itemDef.effect.attack) {
                effects.push(`攻击力 +${itemDef.effect.attack}`);
            }
            if (effects.length > 0) {
                this.detailsEffect.setText('效果:\n' + effects.join('\n'));
            } else {
                this.detailsEffect.setText('');
            }
        } else {
            this.detailsEffect.setText('');
        }

        // 显示价格
        if (itemDef.buyPrice > 0) {
            this.detailsPrice.setText(`购买: ${itemDef.buyPrice}G | 出售: ${itemDef.sellPrice}G`);
        } else {
            this.detailsPrice.setText('不可交易');
        }

        // 数量提示
        if (quantity && quantity > 1) {
            this.detailsName.setText(`${itemDef.icon} ${itemDef.name} x${quantity}`);
        }
    }

    /**
     * 刷新物品栏显示
     */
    refresh() {
        // 如果UI还没打开过，跳过刷新（避免null引用错误）
        if (!this.isOpen) {
            console.warn('⚠️ InventoryUI未打开，跳过刷新');
            return;
        }

        // 如果UI还没完全初始化，跳过刷新
        if (!this.statsText || !this.slotElements || this.slotElements.length === 0) {
            console.warn('⚠️ InventoryUI未初始化，跳过刷新');
            return;
        }

        // 更新统计信息
        const stats = this.inventory.getStats();
        this.statsText.setText(
            `格子: ${stats.usedSlots}/${stats.totalSlots} | 物品: ${stats.totalItems}`
        );

        // 更新每个格子
        this.slotElements.forEach((element, index) => {
            const slot = this.inventory.slots[index];

            if (slot && slot.id) {
                const itemDef = this.inventory.itemDefinitions[slot.id];
                if (itemDef) {
                    element.icon.setText(itemDef.icon);
                    element.quantity.setText(slot.quantity > 1 ? slot.quantity.toString() : '');
                    element.index.setText(''); // 隐藏索引
                }
            } else {
                element.icon.setText('');
                element.quantity.setText('');
                element.index.setText(index.toString()); // 显示空格子索引
            }
        });

        console.log('🔄 物品栏UI已刷新');
    }

    /**
     * 打开物品栏
     */
    open() {
        if (this.isOpen) return;

        this.isOpen = true;
        this.overlay.setVisible(true);
        this.container.setVisible(true);

        // 刷新物品显示
        this.refresh();

        console.log('🎒 物品栏已打开');
    }

    /**
     * 关闭物品栏
     */
    close() {
        if (!this.isOpen) return;

        this.isOpen = false;
        this.overlay.setVisible(false);
        this.container.setVisible(false);

        // 清除详情面板
        this.onSlotHoverEnd();

        console.log('🎒 物品栏已关闭');
    }

    /**
     * 切换物品栏显示状态
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
        this.slotElements.forEach(element => {
            if (element.bg) element.bg.destroy();
            if (element.container) element.container.destroy();
        });

        this.overlay.destroy();
        this.background.destroy();
        this.headerBg.destroy();
        this.titleText.destroy();
        this.closeButton.destroy();
        this.statsText.destroy();
        this.detailsBg.destroy();
        this.detailsName.destroy();
        this.detailsType.destroy();
        this.detailsDesc.destroy();
        this.detailsEffect.destroy();
        this.detailsPrice.destroy();
        this.hintText.destroy();
        this.slotsContainer.destroy();
        this.container.destroy();

        console.log('🎒 InventoryUI 已销毁');
    }
}
