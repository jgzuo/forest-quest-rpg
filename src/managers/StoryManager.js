/**
 * StoryManager - 故事管理器
 * 管理游戏剧情进度、过场动画和叙事系统
 * @version 1.0 - Milestone 7
 */
class StoryManager {
    constructor(scene) {
        this.scene = scene;

        // 故事进度跟踪
        this.storyProgress = {
            hasSeenIntro: false,
            hasStartedQuest1: false,
            hasCompletedQuest1: false,
            hasCompletedQuest2: false,
            hasStartedBossQuest: false,
            hasDefeatedBoss: false,
            currentChapter: 0, // 0: 开始, 1: 森林探索, 2: 洞穴深入, 3: Boss战, 4: 胜利
            storyFlags: {} // 自定义标志，用于触发特殊对话/事件
        };

        // 章芽数据
        this.chapters = {
            0: { name: '开始', title: '森林的召唤' },
            1: { name: '森林探索', title: '神秘的威胁' },
            2: { name: '洞穴深入', title: '黑暗深处' },
            3: { name: 'Boss战', title: '最终决战' },
            4: { name: '胜利', title: '森林恢复和平' }
        };

        console.log('📖 StoryManager 初始化完成');
    }

    /**
     * 显示游戏开场动画
     */
    showIntro() {
        if (this.storyProgress.hasSeenIntro) {
            console.log('⏭️ 跳过开场动画（已观看过）');
            return;
        }

        console.log('🎬 开始播放开场动画');

        // 创建半透明黑色背景
        const overlay = this.scene.add.rectangle(400, 300, 800, 600, 0x000000, 0.95);
        overlay.setDepth(500);

        // 标题文字
        const title = this.scene.add.text(400, 200, 'Forest Quest', {
            fontFamily: 'Press Start 2P',
            fontSize: '48px',
            fill: '#68d391',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5).setDepth(501);

        const subtitle = this.scene.add.text(400, 260, '森林探险 RPG', {
            fontFamily: 'Noto Sans SC',
            fontSize: '24px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(501);

        // 跳过提示
        const skipHint = this.scene.add.text(400, 550, '按 SPACE 或 ENTER 跳过', {
            fontFamily: 'Noto Sans SC',
            fontSize: '14px',
            fill: '#68d391',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setAlpha(0.8).setDepth(502);

        // 背景介绍文字（淡入）
        const storyLines = [
            '在遥远的森林深处，',
            '曾经是一片和平的土地。',
            '',
            '然而，邪恶的力量正在苏醒...',
            '森林的守护者们被腐化，',
            '黑暗吞噬了这片土地。',
            '',
            '你是唯一的希望，',
            '年轻的冒险者。',
            '',
            '击败邪恶的根源，',
            '让森林重获光明！'
        ];

        let lineIndex = 0;
        const storyText = this.scene.add.text(400, 350, '', {
            fontFamily: 'Noto Sans SC',
            fontSize: '18px',
            fill: '#ffffff',
            align: 'center',
            lineSpacing: 10
        }).setOrigin(0.5).setDepth(501);

        // 淡入效果
        storyText.setAlpha(0);

        // 保存所有动画事件，以便跳过
        this.introEvents = [];

        // 跳过开场动画的方法
        const skipIntro = () => {
            console.log('⏭️ 跳过开场动画');

            // 取消所有延迟事件
            this.introEvents.forEach(event => {
                if (event && event.remove) {
                    event.remove();
                }
            });
            this.introEvents = [];

            // 停止所有tween
            this.scene.tweens.killTweensOf(storyText);

            // 立即淡出所有元素
            this.scene.tweens.add({
                targets: [overlay, title, subtitle, storyText, skipHint],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    overlay.destroy();
                    title.destroy();
                    subtitle.destroy();
                    storyText.destroy();
                    skipHint.destroy();
                    this.markIntroSeen();
                    console.log('✅ 开场动画已跳过');
                }
            });

            // 移除键盘监听
            this.scene.input.keyboard.off('keydown-SPACE', skipHandler);
            this.scene.input.keyboard.off('keydown-ENTER', skipHandler);
        };

        // 创建键盘监听处理器
        const skipHandler = (e) => {
            if ((e.code === 'Space' || e.code === 'Enter') && !this.isSkippingIntro) {
                this.isSkippingIntro = true;
                skipIntro();
            }
        };

        // 添加键盘监听
        this.scene.input.keyboard.on('keydown-SPACE', skipHandler);
        this.scene.input.keyboard.on('keydown-ENTER', skipHandler);

        // 逐行显示故事
        const showNextLine = () => {
            if (lineIndex < storyLines.length) {
                storyText.setText(storyLines.slice(0, lineIndex + 1).join('\n'));
                storyText.setAlpha(1);

                // 淡入动画
                this.scene.tweens.add({
                    targets: storyText,
                    alpha: 1,
                    duration: 500,
                    ease: 'Linear'
                });

                lineIndex++;
                const event = this.scene.time.delayedCall(2500, showNextLine); // 每2.5秒显示一行
                this.introEvents.push(event);
            } else {
                // 所有文字显示完毕，等待后关闭
                const event = this.scene.time.delayedCall(3000, () => {
                    // 淡出所有元素
                    this.scene.tweens.add({
                        targets: [overlay, title, subtitle, storyText, skipHint],
                        alpha: 0,
                        duration: 1000,
                        onComplete: () => {
                            overlay.destroy();
                            title.destroy();
                            subtitle.destroy();
                            storyText.destroy();
                            skipHint.destroy();
                            this.markIntroSeen();
                            console.log('✅ 开场动画播放完毕');

                            // 移除键盘监听
                            this.scene.input.keyboard.off('keydown-SPACE', skipHandler);
                            this.scene.input.keyboard.off('keydown-ENTER', skipHandler);
                        }
                    });
                });
                this.introEvents.push(event);
            }
        };

        // 开始显示故事
        const event = this.scene.time.delayedCall(1000, showNextLine);
        this.introEvents.push(event);
    }

    /**
     * 标记开场动画已观看
     */
    markIntroSeen() {
        this.storyProgress.hasSeenIntro = true;
        this.storyProgress.currentChapter = 1;
        console.log('✅ 开场动画已标记为观看');
    }

    /**
     * 显示Boss击败过场动画
     */
    showBossVictory(bossName) {
        console.log(`🎉 显示Boss击败动画: ${bossName}`);

        // 屏幕闪光
        this.scene.cameras.main.flash(1000, 255, 255, 0);

        // 震动
        this.scene.cameras.main.shake(500, 0.02);

        // 创建胜利文字
        const victoryText = this.scene.add.text(400, 200, 'VICTORY!', {
            fontFamily: 'Press Start 2P',
            fontSize: '64px',
            fill: '#ffd700',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5).setDepth(500);

        const bossText = this.scene.add.text(400, 280, `击败了 ${bossName}!`, {
            fontFamily: 'Noto Sans SC',
            fontSize: '32px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(500);

        // 动画效果
        this.scene.tweens.add({
            targets: [victoryText, bossText],
            y: '-=20',
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 3秒后继续到结局
        this.scene.time.delayedCall(3000, () => {
            this.scene.tweens.killTweensOf([victoryText, bossText]);
            this.showEnding();
        });
    }

    /**
     * 显示游戏结局动画
     */
    showEnding() {
        console.log('🎬 显示游戏结局');

        // 暂停游戏
        this.scene.physics.pause();

        // 创建半透明背景
        const overlay = this.scene.add.rectangle(400, 300, 800, 600, 0x000000, 0.95);
        overlay.setDepth(500);

        // 结局文字序列
        const endingLines = [
            '随着树妖王的倒下，',
            '森林中的黑暗力量逐渐消散。',
            '',
            '被腐化的生物恢复了本性，',
            '阳光重新照耀大地。',
            '',
            '村民们欢呼雀跃，',
            '庆祝和平的到来。',
            '',
            '你，年轻的冒险者，',
            '成为了森林的传说。',
            '',
            '但冒险从未结束...',
            '',
            '新的挑战在远方等待。',
            '',
            '感谢游玩 Forest Quest!',
            '',
            '按任意键继续...'
        ];

        let lineIndex = 0;
        const endingText = this.scene.add.text(400, 300, '', {
            fontFamily: 'Noto Sans SC',
            fontSize: '20px',
            fill: '#ffffff',
            align: 'center',
            lineSpacing: 12
        }).setOrigin(0.5).setDepth(501);

        endingText.setAlpha(0);

        const showNextLine = () => {
            if (lineIndex < endingLines.length) {
                endingText.setText(endingLines.slice(0, lineIndex + 1).join('\n'));
                endingText.setAlpha(1);

                this.scene.tweens.add({
                    targets: endingText,
                    alpha: 1,
                    duration: 500,
                    ease: 'Linear'
                });

                lineIndex++;
                this.scene.time.delayedCall(2000, showNextLine);
            }
        };

        showNextLine();

        // 按键继续到胜利场景
        const continueHandler = () => {
            this.scene.input.keyboard.off('keydown', continueHandler);
            this.scene.tweens.add({
                targets: [overlay, endingText],
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    overlay.destroy();
                    endingText.destroy();
                    this.scene.scene.start('VictoryScene');
                }
            });
        };

        this.scene.time.delayedCall((endingLines.length + 1) * 2000, () => {
            this.scene.input.keyboard.on('keydown', continueHandler);
        });

        this.storyProgress.hasDefeatedBoss = true;
        this.storyProgress.currentChapter = 4;
    }

    /**
     * 显示章节标题
     */
    showChapterTitle(chapterNumber) {
        const chapter = this.chapters[chapterNumber];
        if (!chapter) {
            console.warn(`⚠️ 章节不存在: ${chapterNumber}`);
            return;
        }

        console.log(`📖 显示章节标题: ${chapter.name} - ${chapter.title}`);

        // 创建背景
        const bg = this.scene.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
        bg.setDepth(400);

        // 章节名称
        const chapterText = this.scene.add.text(400, 280, `第 ${this.convertToChineseNum(chapterNumber)} 章`, {
            fontFamily: 'Noto Sans SC',
            fontSize: '32px',
            fill: '#68d391',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(401);

        // 章节标题
        const titleText = this.scene.add.text(400, 340, chapter.title, {
            fontFamily: 'Noto Sans SC',
            fontSize: '40px',
            fill: '#ffd700',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5).setDepth(401);

        // 淡入淡出动画
        const timeline = this.scene.tweens.createTimeline();

        timeline.add({
            targets: [chapterText, titleText],
            alpha: 0,
            duration: 0
        });

        timeline.add({
            targets: [chapterText, titleText],
            alpha: 1,
            duration: 1000,
            ease: 'Linear'
        });

        timeline.add({
            targets: [chapterText, titleText],
            alpha: 0,
            duration: 1000,
            ease: 'Linear',
            delay: 2000,
            onComplete: () => {
                bg.destroy();
                chapterText.destroy();
                titleText.destroy();
            }
        });

        timeline.play();

        // 更新当前章节
        this.storyProgress.currentChapter = chapterNumber;
    }

    /**
     * 转换数字为中文
     */
    convertToChineseNum(num) {
        const chinese = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
        return chinese[num] || num;
    }

    /**
     * 设置故事标志
     */
    setStoryFlag(flag, value = true) {
        this.storyProgress.storyFlags[flag] = value;
        console.log(`🚩 故事标志设置: ${flag} = ${value}`);
    }

    /**
     * 检查故事标志
     */
    getStoryFlag(flag) {
        return this.storyProgress.storyFlags[flag] || false;
    }

    /**
     * 更新章节进度
     */
    advanceChapter() {
        if (this.storyProgress.currentChapter < 4) {
            this.storyProgress.currentChapter++;
            this.showChapterTitle(this.storyProgress.currentChapter);
        }
    }

    /**
     * 获取当前章节
     */
    getCurrentChapter() {
        return this.storyProgress.currentChapter;
    }

    /**
     * 获取故事进度（用于保存）
     */
    getSaveData() {
        return {
            storyProgress: this.storyProgress
        };
    }

    /**
     * 加载故事进度（用于读档）
     */
    loadSaveData(data) {
        if (data && data.storyProgress) {
            this.storyProgress = { ...this.storyProgress, ...data.storyProgress };
            console.log('📖 故事进度已加载');
            console.log(`  当前章节: ${this.storyProgress.currentChapter}`);
            console.log(`  已观看开场: ${this.storyProgress.hasSeenIntro}`);
            console.log(`  已击败Boss: ${this.storyProgress.hasDefeatedBoss}`);
        }
    }

    /**
     * 重置故事进度（新游戏）
     */
    reset() {
        this.storyProgress = {
            hasSeenIntro: false,
            hasStartedQuest1: false,
            hasCompletedQuest1: false,
            hasCompletedQuest2: false,
            hasStartedBossQuest: false,
            hasDefeatedBoss: false,
            currentChapter: 0,
            storyFlags: {}
        };
        console.log('📖 故事进度已重置');
    }

    /**
     * 调试方法：打印故事进度
     */
    debugPrintProgress() {
        console.log('📊 故事进度:');
        console.log('====================');
        console.log(`当前章节: ${this.storyProgress.currentChapter}`);
        console.log(`已观看开场: ${this.storyProgress.hasSeenIntro}`);
        console.log(`已完成任务1: ${this.storyProgress.hasCompletedQuest1}`);
        console.log(`已完成任务2: ${this.storyProgress.hasCompletedQuest2}`);
        console.log(`已击败Boss: ${this.storyProgress.hasDefeatedBoss}`);
        console.log('故事标志:', this.storyProgress.storyFlags);
        console.log('====================');
    }
}
