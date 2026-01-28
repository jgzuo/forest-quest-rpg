/**
 * QuestTracker - 任务追踪器
 * 在游戏界面顶部显示当前激活任务的进度
 */
class QuestTracker {
    constructor(scene) {
        this.scene = scene;
        this.container = null;
        this.quests = [];
        this.visible = true;
    }

    /**
     * 创建任务追踪器UI
     */
    create() {
        // 创建容器
        this.container = this.scene.add.container(0, 0);
        this.container.setDepth(1000); // 确保在最上层

        // 背景框
        this.background = this.scene.add.graphics();
        this.background.fillStyle(0x000000, 0.7);
        this.background.lineStyle(2, 0x68d391, 1);
        this.container.add(this.background);

        // 标题
        this.titleText = this.scene.add.text(10, 10, '📋 当前任务', {
            font: '14px "Press Start 2P"',
            fill: '#68d391',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.container.add(this.titleText);

        // 任务列表文本
        this.questTexts = [];

        // 初始隐藏（有任务时才显示）
        this.container.setVisible(false);

        console.log('✅ 任务追踪器UI创建完成');
    }

    /**
     * 更新任务显示
     * @param {Array} activeQuests - 激活的任务列表
     */
    update(activeQuests) {
        // 清除旧的任务文本
        this.questTexts.forEach(text => text.destroy());
        this.questTexts = [];

        // 如果没有激活任务，隐藏追踪器
        if (!activeQuests || activeQuests.length === 0) {
            this.container.setVisible(false);
            return;
        }

        // 显示追踪器
        this.container.setVisible(this.visible);

        // 更新背景大小
        const questCount = Math.min(activeQuests.length, 3); // 最多显示3个任务
        const height = 40 + questCount * 50;

        this.background.clear();
        this.background.fillStyle(0x000000, 0.7);
        this.background.lineStyle(2, 0x68d391, 1);
        this.background.fillRect(0, 0, 350, height);
        this.background.strokeRect(0, 0, 350, height);

        // 定位到右上角
        const screenWidth = this.scene.cameras.main.width;
        this.container.setPosition(screenWidth - 360, 80);

        // 显示任务信息
        activeQuests.slice(0, 3).forEach((quest, index) => {
            const y = 40 + index * 50;

            // 任务名称
            const nameText = this.scene.add.text(15, y, quest.name, {
                font: '12px "Microsoft YaHei"',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3
            });
            this.container.add(nameText);
            this.questTexts.push(nameText);

            // 任务目标
            const objective = quest.getCurrentObjective();
            if (objective) {
                const progress = `${objective.current}/${objective.required}`;
                const progressText = this.scene.add.text(15, y + 18, `${objective.description}: ${progress}`, {
                    font: '11px "Microsoft YaHei"',
                    fill: '#ffd700',
                    stroke: '#000000',
                    strokeThickness: 2
                });
                this.container.add(progressText);
                this.questTexts.push(progressText);

                // 进度条
                const progressBar = this.scene.add.graphics();
                const barWidth = 200;
                const barHeight = 6;
                const progressPercent = objective.current / objective.required;

                // 进度条背景
                progressBar.fillStyle(0x333333, 1);
                progressBar.fillRect(15, y + 32, barWidth, barHeight);

                // 进度条填充
                progressBar.fillStyle(0x48bb78, 1);
                progressBar.fillRect(15, y + 32, barWidth * progressPercent, barHeight);

                this.container.add(progressBar);
                this.questTexts.push(progressBar);
            }
        });
    }

    /**
     * 显示/隐藏追踪器
     */
    toggle() {
        this.visible = !this.visible;
        this.container.setVisible(this.visible && this.quests.length > 0);
    }

    /**
     * 销毁追踪器
     */
    destroy() {
        this.questTexts.forEach(text => text.destroy());
        this.background.destroy();
        this.titleText.destroy();
        this.container.destroy();
    }
}
