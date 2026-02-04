/**
 * ComboEffects - 连击视觉反馈系统
 *
 * 负责渲染和管理连击相关的视觉反馈：
 * - 连击计数显示（屏幕角落）
 * - 连击等级特效（5/10/15/20连击不同效果）
 * - 连击槽显示（连击超时倒计时）
 * - 连击升级动画
 */

class ComboEffects {
    constructor(scene) {
        this.scene = scene;
        this.container = null;
        this.comboText = null;
        this.levelIcon = null;
        this.timerBar = null;
        this.timerBarBg = null;
        this.multiplierText = null;

        // 连击等级配置
        this.levelConfig = {
            1: { icon: '', color: '#ffffff', name: '普通' },
            5: { icon: '⚡', color: '#ffd700', name: '优秀' },
            10: { icon: '🔥', color: '#ff6600', name: '完美' },
            15: { icon: '💜', color: '#9966ff', name: '超凡' },
            20: { icon: '👑', color: '#ffcc00', name: '传说' }
        };

        // 当前连击等级
        this.currentLevel = 1;
        this.previousLevel = 1;

        // US-014: 动画tween引用
        this.pulseTween = null;
        this.glowTween = null;

        console.log('⚡ 连击特效系统初始化');
    }

    /**
     * 创建连击UI
     */
    createUI() {
        // 创建主容器（右上角）
        this.container = this.scene.add.container(720, 80);
        this.container.setScrollFactor(0);
        this.container.setDepth(200);
        this.container.setAlpha(0);

        // 连击标签
        const comboLabel = this.scene.add.text(0, 0, '连击', {
            fontFamily: 'Noto Sans SC',
            fontSize: 'bold 14px',
            fill: '#ffd700',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        this.container.add(comboLabel);

        // 连击等级图标
        this.levelIcon = this.scene.add.text(0, 25, '', {
            fontSize: '32px'
        }).setOrigin(0.5);
        this.container.add(this.levelIcon);

        // 连击数字
        this.comboText = this.scene.add.text(0, 60, '0', {
            fontFamily: 'Press Start 2P',
            fontSize: 'bold 42px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        this.container.add(this.comboText);

        // 伤害倍率文本
        this.multiplierText = this.scene.add.text(0, 90, '100% 伤害', {
            fontFamily: 'Noto Sans SC',
            fontSize: '12px',
            fill: '#4facfe',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.container.add(this.multiplierText);

        // 计时条背景
        this.timerBarBg = this.scene.add.rectangle(0, 110, 80, 6, 0x333333, 0.8);
        this.timerBarBg.setOrigin(0.5);
        this.container.add(this.timerBarBg);

        // 计时条
        this.timerBar = this.scene.add.rectangle(0, 110, 80, 6, 0x68d391, 1);
        this.timerBar.setOrigin(0.5);
        this.container.add(this.timerBar);

        console.log('✅ 连击UI创建完成');
    }

    /**
     * 更新连击显示
     * @param {number} comboCount - 连击数
     * @param {number} multiplier - 伤害倍率
     * @param {number} remainingTime - 剩余时间（毫秒）
     * @param {number} maxTime - 最大时间（毫秒）
     */
    updateCombo(comboCount, multiplier, remainingTime, maxTime) {
        if (!this.container) return;

        // 显示容器
        if (comboCount > 0 && this.container.alpha === 0) {
            this.container.setAlpha(1);
        }

        // 更新连击数字
        this.comboText.setText(comboCount.toString());

        // 计算连击等级
        const level = this.getComboLevel(comboCount);
        this.currentLevel = level;

        // 更新等级图标和颜色
        const config = this.levelConfig[level];
        this.levelIcon.setText(config.icon);
        this.comboText.setFill(config.color);

        // 检查连击升级
        if (level > this.previousLevel && comboCount >= 5) {
            this.showComboLevelUp(level, config.name);
        }
        this.previousLevel = level;

        // 播放连击音效
        if (this.scene.combatAudioManager) {
            this.scene.combatAudioManager.playComboSound(comboCount);
        }

        // 更新倍率文本
        const percentage = Math.round(multiplier * 100);
        this.multiplierText.setText(`${percentage}% 伤害`);

        // ============ US-014: 连击槽动画增强 ============
        const progress = Math.max(0, remainingTime / maxTime);
        const targetWidth = 80 * progress;

        // 使用tween实现平滑过渡
        this.scene.tweens.add({
            targets: this.timerBar,
            width: targetWidth,
            duration: 100,
            ease: 'Linear'
        });

        // 计时条颜色变化（时间越少越红）+ 闪烁警告
        if (progress < 0.3) {
            this.timerBar.fillColor = 0xff6b6b;
            // 低时间闪烁效果
            if (!this.pulseTween || !this.pulseTween.isPlaying()) {
                this.pulseTween = this.scene.tweens.add({
                    targets: this.timerBar,
                    alpha: 0.3,
                    duration: 200,
                    yoyo: true,
                    repeat: -1
                });
            }
        } else if (progress < 0.6) {
            this.timerBar.fillColor = 0xf6e05e;
            this.timerBar.alpha = 1;
            if (this.pulseTween) {
                this.pulseTween.stop();
                this.pulseTween = null;
            }
        } else {
            this.timerBar.fillColor = 0x68d391;
            this.timerBar.alpha = 1;
            if (this.pulseTween) {
                this.pulseTween.stop();
                this.pulseTween = null;
            }
        }

        // 高连击时添加发光效果
        if (comboCount >= 15 && !this.glowTween) {
            this.glowTween = this.scene.tweens.add({
                targets: this.comboText,
                scale: 1.1,
                duration: 300,
                yoyo: true,
                repeat: -1
            });
        } else if (comboCount < 15 && this.glowTween) {
            this.glowTween.stop();
            this.comboText.setScale(1);
            this.glowTween = null;
        }
    }

    /**
     * 获取连击等级
     * @param {number} comboCount - 连击数
     * @returns {number} 等级
     */
    getComboLevel(comboCount) {
        if (comboCount >= 20) return 20;
        if (comboCount >= 15) return 15;
        if (comboCount >= 10) return 10;
        if (comboCount >= 5) return 5;
        return 1;
    }

    /**
     * 显示连击升级动画
     * @param {number} level - 等级
     * @param {string} name - 等级名称
     */
    showComboLevelUp(level, name) {
        const config = this.levelConfig[level];

        // 1. 容器缩放动画
        this.scene.tweens.add({
            targets: [this.comboText, this.levelIcon],
            scaleX: 1.8,
            scaleY: 1.8,
            duration: 150,
            yoyo: true,
            ease: 'Power2'
        });

        // 2. 容器震动
        this.scene.tweens.add({
            targets: this.container,
            x: 720 + 8,
            duration: 50,
            yoyo: true,
            repeat: 5
        });

        // 3. 屏幕边缘闪光
        this.flashScreenColor(config.color, 300);

        // 4. 升级文字提示
        const playerX = this.scene.player?.x || 400;
        const playerY = this.scene.player?.y || 300;

        const levelUpText = this.scene.add.text(
            playerX,
            playerY - 100,
            `⚡ ${name}!`,
            {
                fontFamily: 'Noto Sans SC',
                fontSize: 'bold 28px',
                fill: config.color,
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5);
        levelUpText.setDepth(201);

        this.scene.tweens.add({
            targets: levelUpText,
            y: levelUpText.y - 50,
            alpha: 0,
            scale: 1.5,
            duration: 1200,
            ease: 'Power2',
            onComplete: () => {
                levelUpText.destroy();
            }
        });

        // 5. 创建庆祝粒子
        this.createCelebrationParticles(level);

        // 6. 播放里程碑音效（10/15/20连击）
        if (this.scene.combatAudioManager) {
            if (level === 10) {
                this.scene.combatAudioManager.playSoundEffect('combo_milestone_10', 0.6);
            } else if (level === 15) {
                this.scene.combatAudioManager.playSoundEffect('combo_milestone_15', 0.7);
            } else if (level === 20) {
                this.scene.combatAudioManager.playSoundEffect('combo_milestone_20', 0.8);
            }
        }
    }

    /**
     * 屏幕边缘颜色闪烁
     * @param {number} color - 颜色
     * @param {number} duration - 持续时间
     */
    flashScreenColor(color, duration) {
        const overlay = this.scene.add.graphics();
        overlay.setDepth(998);
        overlay.lineStyle(30, color, 0.4);
        overlay.strokeRect(0, 0, 800, 600);

        this.scene.tweens.add({
            targets: overlay,
            alpha: 0,
            duration: duration,
            onComplete: () => {
                overlay.destroy();
            }
        });
    }

    /**
     * 创建庆祝粒子
     * @param {number} level - 连击等级
     */
    createCelebrationParticles(level) {
        const count = 10 + level; // 等级越高粒子越多
        const colors = [0xffd700, 0xff6600, 0x9966ff, 0xffffff];

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const color = Phaser.Utils.Array.GetRandom(colors);

            const particle = this.scene.add.circle(
                this.scene.player.x,
                this.scene.player.y,
                4,
                color
            );
            particle.setDepth(100);

            const distance = 60 + Math.random() * 40;

            this.scene.tweens.add({
                targets: particle,
                x: this.scene.player.x + Math.cos(angle) * distance,
                y: this.scene.player.y + Math.sin(angle) * distance,
                alpha: 0,
                scale: 0,
                duration: 800,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }

    /**
     * 隐藏连击UI
     */
    hide() {
        if (this.container) {
            this.scene.tweens.add({
                targets: this.container,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    this.container.setAlpha(0);
                }
            });
        }
    }

    /**
     * 重置连击显示
     */
    reset() {
        if (this.container) {
            this.container.setAlpha(0);
        }
        if (this.comboText) {
            this.comboText.setText('0');
        }
        if (this.levelIcon) {
            this.levelIcon.setText('');
        }
        if (this.multiplierText) {
            this.multiplierText.setText('100% 伤害');
        }
        if (this.timerBar) {
            this.timerBar.width = 80;
        }
        this.currentLevel = 1;
        this.previousLevel = 1;
    }

    /**
     * 每帧更新
     * @param {number} time - 当前时间
     * @param {number} delta - 时间增量
     */
    update(time, delta) {
        // 添加轻微的浮动动画
        if (this.container && this.container.alpha > 0) {
            const floatY = Math.sin(time / 200) * 3;
            this.container.setY(80 + floatY);
        }
    }

    /**
     * 销毁连击特效系统
     */
    destroy() {
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
        console.log('⚡ 连击特效系统已销毁');
    }
}
