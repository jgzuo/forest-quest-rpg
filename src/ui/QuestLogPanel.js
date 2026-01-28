/**
 * QuestLogPanel - 任务日志面板
 * 显示所有任务的详细信息（按Q键打开/关闭）
 */
class QuestLogPanel {
    constructor(scene) {
        this.scene = scene;
        this.container = null;
        this.isOpen = false;
        this.questElements = [];
    }

    /**
     * 创建任务日志面板
     */
    create() {
        // 创建半透明遮罩（点击关闭）
        this.overlay = this.scene.add.graphics();
        this.overlay.fillStyle(0x000000, 0.5);
        this.overlay.fillRect(0, 0, 2000, 2000);
        this.overlay.setInteractive({ useHandCursor: true });
        this.overlay.on('pointerdown', () => this.close());
        this.overlay.setVisible(false);
        this.overlay.setDepth(999);

        // 创建主面板
        this.container = this.scene.add.container(150, 100);
        this.container.setDepth(1000);
        this.container.setVisible(false);

        // 面板背景
        this.background = this.scene.add.graphics();
        this.background.fillStyle(0x1a202c, 0.95);
        this.background.lineStyle(4, 0x48bb78, 1);
        this.background.fillRoundedRect(0, 0, 500, 450, 10);
        this.background.strokeRoundedRect(0, 0, 500, 450, 10);
        this.container.add(this.background);

        // 标题栏
        this.headerBg = this.scene.add.graphics();
        this.headerBg.fillStyle(0x2d3748, 1);
        this.headerBg.fillRoundedRect(10, 10, 480, 50, 8);
        this.container.add(this.headerBg);

        // 标题文字
        this.titleText = this.scene.add.text(250, 35, '📜 任务日志', {
            font: '18px "Press Start 2P"',
            fill: '#68d391'
        }).setOrigin(0.5);
        this.container.add(this.titleText);

        // 关闭按钮
        this.closeButton = this.scene.add.text(480, 20, '✕', {
            font: '20px Arial',
            fill: '#ff6b6b'
        }).setOrigin(1, 0);
        this.closeButton.setInteractive({ useHandCursor: true });
        this.closeButton.on('pointerdown', () => this.close());
        this.closeButton.on('pointerover', () => this.closeButton.setScale(1.2));
        this.closeButton.on('pointerout', () => this.closeButton.setScale(1));
        this.container.add(this.closeButton);

        // 任务内容区域
        this.contentContainer = this.scene.add.container(20, 80);
        this.container.add(this.contentContainer);

        // 提示文字
        this.hintText = this.scene.add.text(250, 430, '按 Q 键或点击外部关闭', {
            font: '12px "Microsoft YaHei"',
            fill: '#a0aec0'
        }).setOrigin(0.5);
        this.container.add(this.hintText);

        console.log('✅ 任务日志面板创建完成');
    }

    /**
     * 打开任务日志
     */
    open() {
        if (this.isOpen) return;

        this.isOpen = true;
        this.overlay.setVisible(true);
        this.container.setVisible(true);

        // 刷新任务列表
        this.refresh();

        console.log('📜 任务日志已打开');
    }

    /**
     * 关闭任务日志
     */
    close() {
        if (!this.isOpen) return;

        this.isOpen = false;
        this.overlay.setVisible(false);
        this.container.setVisible(false);

        console.log('📜 任务日志已关闭');
    }

    /**
     * 切换任务日志显示状态
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * 刷新任务列表
     */
    refresh() {
        // 清除旧的任务元素
        this.questElements.forEach(el => el.destroy());
        this.questElements = [];

        if (!this.scene.questManager) {
            this.showNoQuestsMessage();
            return;
        }

        const activeQuests = this.scene.questManager.getActiveQuests();
        const completedQuests = this.scene.questManager.getCompletedQuests();

        let y = 0;

        // 显示激活任务
        if (activeQuests.length > 0) {
            y = this.addSectionTitle('进行中的任务', y);

            activeQuests.forEach((quest, index) => {
                y = this.addQuestInfo(quest, y, true);
                y += 15;
            });
        }

        // 显示已完成任务
        if (completedQuests.length > 0) {
            y += 10;
            y = this.addSectionTitle('已完成的任务', y);

            completedQuests.forEach((quest, index) => {
                y = this.addQuestInfo(quest, y, false);
                y += 15;
            });
        }

        // 如果没有任务
        if (activeQuests.length === 0 && completedQuests.length === 0) {
            this.showNoQuestsMessage();
        }

        // 添加滚动支持（如果内容过长）
        if (y > 350) {
            this.addScrollHint();
        }
    }

    /**
     * 添加分区标题
     */
    addSectionTitle(title, y) {
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x48bb78, 0.3);
        bg.fillRoundedRect(0, y, 460, 30, 5);
        this.contentContainer.add(bg);
        this.questElements.push(bg);

        const text = this.scene.add.text(230, y + 15, title, {
            font: '14px "Microsoft YaHei"',
            fill: '#68d391',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.contentContainer.add(text);
        this.questElements.push(text);

        return y + 40;
    }

    /**
     * 添加任务信息
     */
    addQuestInfo(quest, y, isActive) {
        // 任务名称背景
        const questBg = this.scene.add.graphics();
        const bgColor = isActive ? 0x2d3748 : 0x1a202c;
        questBg.fillStyle(bgColor, 1);
        questBg.fillRoundedRect(0, y, 460, 100, 8);
        this.contentContainer.add(questBg);
        this.questElements.push(questBg);

        // 任务名称
        const nameText = this.scene.add.text(15, y + 15, quest.name, {
            font: '14px "Microsoft YaHei"',
            fill: '#ffd700',
            fontStyle: 'bold'
        });
        this.contentContainer.add(nameText);
        this.questElements.push(nameText);

        // 任务描述
        const descText = this.scene.add.text(15, y + 35, quest.description, {
            font: '11px "Microsoft YaHei"',
            fill: '#e2e8f0',
            wordWrap: { width: 430 }
        });
        this.contentContainer.add(descText);
        this.questElements.push(descText);

        // 任务目标
        let objectiveY = y + 60;
        quest.objectives.forEach((objective, index) => {
            const current = objective.current || 0;
            const isComplete = current >= objective.required;

            const color = isComplete ? '#68d391' : '#ffffff';
            const prefix = isComplete ? '✓' : '○';

            const objText = this.scene.add.text(
                25,
                objectiveY,
                `${prefix} ${objective.description}: ${current}/${objective.required}`,
                {
                    font: '12px "Microsoft YaHei"',
                    fill: color
                }
            );
            this.contentContainer.add(objText);
            this.questElements.push(objText);

            objectiveY += 18;
        });

        // 进度条
        const progress = quest.getProgress();
        const progressBar = this.scene.add.graphics();

        // 进度条背景
        progressBar.fillStyle(0x000000, 0.5);
        progressBar.fillRect(15, y + 85, 430, 8);

        // 进度条填充
        const progressColor = progress === 100 ? 0x68d391 : 0x4facfe;
        progressBar.fillStyle(progressColor, 1);
        progressBar.fillRect(15, y + 85, 430 * (progress / 100), 8);

        this.contentContainer.add(progressBar);
        this.questElements.push(progressBar);

        // 进度百分比
        const progressText = this.scene.add.text(
            445,
            y + 85,
            `${progress}%`,
            {
                font: '10px "Microsoft YaHei"',
                fill: '#ffffff'
            }
        ).setOrigin(1, 0);
        this.contentContainer.add(progressText);
        this.questElements.push(progressText);

        return y + 110;
    }

    /**
     * 显示无任务消息
     */
    showNoQuestsMessage() {
        const text = this.scene.add.text(
            230,
            150,
            '暂无任务\n\n与村长对话接取任务',
            {
                font: '14px "Microsoft YaHei"',
                fill: '#a0aec0',
                align: 'center'
            }
        ).setOrigin(0.5);
        this.contentContainer.add(text);
        this.questElements.push(text);
    }

    /**
     * 添加滚动提示
     */
    addScrollHint() {
        const hintText = this.scene.add.text(
            230,
            320,
            '↓ 更多任务 ↓',
            {
                font: '12px "Microsoft YaHei"',
                fill: '#ffd700'
            }
        ).setOrigin(0.5);
        this.contentContainer.add(hintText);
        this.questElements.push(hintText);
    }

    /**
     * 销毁面板
     */
    destroy() {
        this.questElements.forEach(el => el.destroy());
        this.overlay.destroy();
        this.background.destroy();
        this.headerBg.destroy();
        this.titleText.destroy();
        this.closeButton.destroy();
        this.hintText.destroy();
        this.container.destroy();
    }
}
