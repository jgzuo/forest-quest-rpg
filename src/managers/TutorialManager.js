/**
 * TutorialManager - 新手教程管理器
 * 引导新玩家学习游戏机制
 */
class TutorialManager {
    constructor(scene) {
        this.scene = scene;
        this.isActive = false;
        this.currentStep = 0;
        this.completedTutorials = [];
        this.tutorialQueue = [];

        // 教程数据
        this.tutorials = {
            movement: {
                id: 'movement',
                name: '移动控制',
                steps: [
                    {
                        text: '欢迎来到森林探险！🌲',
                        highlight: null,
                        action: null
                    },
                    {
                        text: '使用 W A S D 或 方向键 移动角色',
                        highlight: null,
                        action: 'move_any_direction'
                    },
                    {
                        text: '尝试向上移动！',
                        highlight: null,
                        action: 'move_up'
                    },
                    {
                        text: '很好！向下移动。',
                        highlight: null,
                        action: 'move_down'
                    },
                    {
                        text: '向左移动！',
                        highlight: null,
                        action: 'move_left'
                    },
                    {
                        text: '向右移动！',
                        highlight: null,
                        action: 'move_right'
                    },
                    {
                        text: '✅ 移动控制完成！',
                        highlight: null,
                        action: null
                    }
                ]
            },
            combat: {
                id: 'combat',
                name: '战斗系统',
                steps: [
                    {
                        text: '现在学习如何战斗！⚔️',
                        highlight: null,
                        action: null
                    },
                    {
                        text: '按 空格键 攻击敌人',
                        highlight: null,
                        action: 'attack_enemy'
                    },
                    {
                        text: '先击败1只鼹鼠！',
                        highlight: null,
                        action: 'kill_mole'
                    },
                    {
                        text: '✅ 战斗教程完成！',
                        highlight: null,
                        action: null
                    }
                ]
            },
            interaction: {
                id: 'interaction',
                name: 'NPC交互',
                steps: [
                    {
                        text: '与NPC交谈可以接受任务！💬',
                        highlight: null,
                        action: null
                    },
                    {
                        text: '走到村长附近，按 E键 与他交谈',
                        highlight: 'elder',
                        action: 'talk_to_elder'
                    },
                    {
                        text: '村长会给你发布任务。',
                        highlight: null,
                        action: null
                    },
                    {
                        text: '与村长交谈后，按 E键 接受任务',
                        highlight: null,
                        action: 'accept_quest'
                    },
                    {
                        text: '✅ 交互教程完成！',
                        highlight: null,
                        action: null
                    }
                ]
            },
            skills: {
                id: 'skills',
                name: '技能系统',
                steps: [
                    {
                        text: '你拥有强大的技能！⚡',
                        highlight: null,
                        action: null
                    },
                    {
                        text: '按 1键 释放旋风斩（范围攻击）',
                        highlight: null,
                        action: 'cast_whirlwind'
                    },
                    {
                        text: '按 2键 释放冲锋（快速接近敌人）',
                        highlight: null,
                        action: 'cast_charge'
                    },
                    {
                        text: '按 3键 释放治疗之光（恢复生命值）',
                        highlight: null,
                        action: 'cast_heal'
                    },
                    {
                        text: '注意：技能需要消耗MP！💎',
                        highlight: null,
                        action: null
                    },
                    {
                        text: '✅ 技能教程完成！',
                        highlight: null,
                        action: null
                    }
                ]
            },
            quest: {
                id: 'quest',
                name: '任务系统',
                steps: [
                    {
                        text: '任务指引你的冒险！📜',
                        highlight: null,
                        action: null
                    },
                    {
                        text: '按 Q键 打开任务日志',
                        highlight: null,
                        action: 'open_quest_log'
                    },
                    {
                        text: '任务日志显示所有任务详情。',
                        highlight: null,
                        action: null
                    },
                    {
                        text: '屏幕左侧显示当前任务追踪。',
                        highlight: null,
                        action: null
                    },
                    {
                        text: '✅ 任务教程完成！',
                        highlight: null,
                        action: null
                    }
                ]
            },
            ui: {
                id: 'ui',
                name: 'UI界面',
                steps: [
                    {
                        text: '了解游戏界面！📊',
                        highlight: null,
                        action: null
                    },
                    {
                        text: '左上角：生命值条（红色）',
                        highlight: 'hp-bar',
                        action: null
                    },
                    {
                        text: '左上角：经验值条（蓝色）',
                        highlight: 'xp-bar',
                        action: null
                    },
                    {
                        text: '左上角：法力值条（紫色）',
                        highlight: 'mp-bar',
                        action: null
                    },
                    {
                        text: '右上角：等级和金币',
                        highlight: 'level-display',
                        action: null
                    },
                    {
                        text: '底部：技能栏（1-4键）',
                        highlight: 'skill-bar',
                        action: null
                    },
                    {
                        text: '✅ UI教程完成！',
                        highlight: null,
                        action: null
                    }
                ]
            },
            save_load: {
                id: 'save_load',
                name: '存档系统',
                steps: [
                    {
                        text: '记得保存进度！💾',
                        highlight: null,
                        action: null
                    },
                    {
                        text: '按 F5键 快速保存游戏',
                        highlight: null,
                        action: 'quick_save'
                    },
                    {
                        text: '按 F9键 快速加载游戏',
                        highlight: null,
                        action: 'quick_load'
                    },
                    {
                        text: '游戏也会在重要时刻自动保存。',
                        highlight: null,
                        action: null
                    },
                    {
                        text: '✅ 存档教程完成！',
                        highlight: null,
                        action: null
                    }
                ]
            }
        };

        console.log('📚 教程管理器初始化');
    }

    /**
     * 开始教程
     */
    startTutorial(tutorialId) {
        const tutorial = this.tutorials[tutorialId];
        if (!tutorial) {
            console.warn(`⚠️ 教程不存在: ${tutorialId}`);
            return false;
        }

        // 检查是否已完成
        if (this.completedTutorials.includes(tutorialId)) {
            console.log(`✅ 教程已完成: ${tutorial.name}`);
            return false;
        }

        this.isActive = true;
        this.currentStep = 0;
        this.tutorialQueue = [...tutorial.steps];

        console.log(`📚 开始教程: ${tutorial.name}`);

        // 显示第一步
        this.showCurrentStep();

        return true;
    }

    /**
     * 显示当前步骤
     */
    showCurrentStep() {
        if (this.currentStep >= this.tutorialQueue.length) {
            this.completeTutorial();
            return;
        }

        const step = this.tutorialQueue[this.currentStep];

        // 清除之前的提示
        this.clearTutorialOverlay();

        // 创建教程提示框
        this.createTutorialOverlay(step);
    }

    /**
     * 创建教程覆盖层
     */
    createTutorialOverlay(step) {
        // 创建半透明背景
        const overlay = this.scene.add.rectangle(400, 300, 800, 600, 0x000000, 0.6);
        overlay.setDepth(200);
        this.tutorialOverlay = overlay;

        // 创建教程框
        const box = this.scene.add.rectangle(400, 500, 600, 120, 0x2d3748, 0.95);
        box.setStrokeStyle(3, 0x68d391);
        box.setDepth(201);
        this.tutorialBox = box;

        // 创建教程文字
        const text = this.scene.add.text(400, 480, step.text, {
            font: '18px Noto Sans SC',
            fill: '#ffffff',
            align: 'center',
            lineSpacing: 5
        }).setOrigin(0.5);
        text.setDepth(202);
        this.tutorialText = text;

        // 创建跳过提示
        const skipHint = this.scene.add.text(400, 530, '按 ESC 跳过教程 | 按任意键继续', {
            font: '14px Arial',
            fill: '#ffd700'
        }).setOrigin(0.5);
        skipHint.setDepth(202);
        this.skipHint = skipHint;

        // 高亮元素（如果需要）
        if (step.highlight) {
            this.highlightElement(step.highlight);
        }

        // 添加继续按钮监听
        this.scene.time.delayedCall(500, () => {
            const continueKey = this.scene.input.keyboard.once('keydown', () => {
                if (this.isActive) {
                    this.nextStep();
                }
            });

            overlay.setInteractive();
            overlay.on('pointerdown', () => {
                if (this.isActive) {
                    this.nextStep();
                }
            });
        });

        // ESC键跳过
        this.scene.time.delayedCall(500, () => {
            this.scene.input.keyboard.once('keydown-ESC', () => {
                if (this.isActive) {
                    this.skipTutorial();
                }
            });
        });
    }

    /**
     * 高亮元素
     */
    highlightElement(elementId) {
        // 根据元素ID创建高亮效果
        let highlightElement;

        switch (elementId) {
            case 'hp-bar':
                highlightElement = this.scene.add.rectangle(110, 30, 200, 40, 0xff6b6b, 0.3);
                highlightElement.setStrokeStyle(3, 0xffffff);
                break;
            case 'xp-bar':
                highlightElement = this.scene.add.rectangle(110, 80, 200, 40, 0x4facfe, 0.3);
                highlightElement.setStrokeStyle(3, 0xffffff);
                break;
            case 'mp-bar':
                highlightElement = this.scene.add.rectangle(110, 130, 200, 40, 0x9f7aea, 0.3);
                highlightElement.setStrokeStyle(3, 0xffffff);
                break;
            case 'level-display':
                highlightElement = this.scene.add.rectangle(730, 20, 100, 40, 0x68d391, 0.3);
                highlightElement.setStrokeStyle(3, 0xffffff);
                break;
            case 'skill-bar':
                highlightElement = this.scene.add.rectangle(400, 560, 300, 70, 0x667eea, 0.3);
                highlightElement.setStrokeStyle(3, 0xffffff);
                break;
            case 'elder':
                // 高亮村长NPC
                highlightElement = this.scene.add.circle(600, 350, 80, 0xffd700, 0.2);
                highlightElement.setStrokeStyle(4, 0xffd700);
                break;
        }

        if (highlightElement) {
            highlightElement.setDepth(199);
            this.highlightElement = highlightElement;

            // 添加脉冲动画
            this.scene.tweens.add({
                targets: highlightElement,
                alpha: 0.5,
                duration: 500,
                yoyo: true,
                repeat: -1
            });
        }
    }

    /**
     * 清除教程覆盖层
     */
    clearTutorialOverlay() {
        if (this.tutorialOverlay) {
            this.tutorialOverlay.destroy();
            this.tutorialOverlay = null;
        }
        if (this.tutorialBox) {
            this.tutorialBox.destroy();
            this.tutorialBox = null;
        }
        if (this.tutorialText) {
            this.tutorialText.destroy();
            this.tutorialText = null;
        }
        if (this.skipHint) {
            this.skipHint.destroy();
            this.skipHint = null;
        }
        if (this.highlightElement) {
            this.highlightElement.destroy();
            this.highlightElement = null;
        }
    }

    /**
     * 下一步
     */
    nextStep() {
        this.currentStep++;
        this.showCurrentStep();
    }

    /**
     * 完成教程
     */
    completeTutorial() {
        const currentTutorial = this.getCurrentTutorialId();

        if (currentTutorial && !this.completedTutorials.includes(currentTutorial)) {
            this.completedTutorials.push(currentTutorial);
        }

        this.isActive = false;
        this.clearTutorialOverlay();

        console.log(`✅ 教程完成: ${currentTutorial}`);

        // 保存进度
        this.saveProgress();

        // 显示完成提示
        this.scene.showFloatingText(
            400,
            300,
            '🎉 教程完成！',
            '#68d391',
            2000
        );
    }

    /**
     * 跳过教程
     */
    skipTutorial() {
        this.isActive = false;
        this.clearTutorialOverlay();

        console.log('⏭️ 教程已跳过');

        this.scene.showFloatingText(
            400,
            300,
            '⏭️ 教程已跳过',
            '#ffd700',
            2000
        );
    }

    /**
     * 检查教程动作
     */
    checkAction(action) {
        if (!this.isActive) return false;

        const currentStepData = this.tutorialQueue[this.currentStep];
        if (!currentStepData || !currentStepData.action) return false;

        const requiredAction = currentStepData.action;

        // 检查动作是否匹配
        if (action === requiredAction || (requiredAction === 'move_any_direction' && action.startsWith('move_'))) {
            this.scene.time.delayedCall(500, () => {
                this.nextStep();
            });
            return true;
        }

        return false;
    }

    /**
     * 获取当前教程ID
     */
    getCurrentTutorialId() {
        for (const [id, tutorial] of Object.entries(this.tutorials)) {
            if (this.tutorialQueue === tutorial.steps) {
                return id;
            }
        }
        return null;
    }

    /**
     * 保存进度
     */
    saveProgress() {
        const progress = {
            completedTutorials: this.completedTutorials,
            lastUpdated: new Date().toISOString()
        };

        localStorage.setItem('forestQuestRPG_tutorials', JSON.stringify(progress));
        console.log('💾 教程进度已保存');
    }

    /**
     * 加载进度
     */
    loadProgress() {
        try {
            const saved = localStorage.getItem('forestQuestRPG_tutorials');
            if (saved) {
                const progress = JSON.parse(saved);
                this.completedTutorials = progress.completedTutorials || [];
                console.log('📂 教程进度已加载');
                console.log(`  已完成: ${this.completedTutorials.length} 个教程`);
            }
        } catch (error) {
            console.error('❌ 加载教程进度失败:', error);
        }
    }

    /**
     * 检查教程是否已完成
     */
    isTutorialCompleted(tutorialId) {
        return this.completedTutorials.includes(tutorialId);
    }

    /**
     * 重置教程进度
     */
    resetProgress() {
        this.completedTutorials = [];
        this.saveProgress();

        this.scene.showFloatingText(
            400,
            300,
            '🔄 教程进度已重置',
            '#68d391',
            2000
        );
    }

    /**
     * 显示教程状态
     */
    showTutorialStatus() {
        const completedCount = this.completedTutorials.length;
        const totalCount = Object.keys(this.tutorials).length;

        this.scene.showFloatingText(
            400,
            150,
            `📚 教程进度: ${completedCount}/${totalCount}`,
            '#68d391',
            2500
        );

        let y = 190;
        for (const [id, tutorial] of Object.entries(this.tutorials)) {
            const status = this.completedTutorials.includes(id) ? '✅' : '⏳';
            this.scene.showFloatingText(
                400,
                y,
                `${status} ${tutorial.name}`,
                this.completedTutorials.includes(id) ? '#68d391' : '#ffffff',
                2000
            );
            y += 30;
        }

        this.scene.showFloatingText(
            400,
            y + 20,
            '按 N 开始新手教程',
            '#ffd700',
            2500
        );
    }

    /**
     * 开始新手教程序列
     */
    startNewPlayerTutorial() {
        if (this.completedTutorials.includes('movement')) {
            this.scene.showFloatingText(
                400,
                300,
                '✅ 新手教程已完成！',
                '#68d391',
                2000
            );
            return;
        }

        // 按顺序开始教程
        const tutorialSequence = ['movement', 'combat', 'interaction', 'skills', 'quest', 'ui', 'save_load'];
        let currentIndex = 0;

        const startNext = () => {
            if (currentIndex >= tutorialSequence.length) {
                this.scene.showFloatingText(
                    400,
                    300,
                    '🎉 所有教程完成！',
                    '#ffd700',
                    3000
                );
                return;
            }

            const tutorialId = tutorialSequence[currentIndex];
            if (!this.completedTutorials.includes(tutorialId)) {
                this.startTutorial(tutorialId);
            } else {
                currentIndex++;
                startNext();
            }
        };

        startNext();
    }
}
