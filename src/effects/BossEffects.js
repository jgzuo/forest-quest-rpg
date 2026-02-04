/**
 * BossEffects - Boss战增强特效系统
 *
 * 提供Boss战斗专属的视觉特效：
 * - 大招预警特效（地面标记、警告圈、倒计时）
 * - 阶段转换演出（屏幕震动、闪光、黑屏过渡）
 * - Boss死亡爆炸（多层爆炸、慢动作、战利品展示）
 * - 狂暴模式特效（红色滤镜、呼吸效果）
 */

class BossEffects {
    constructor(scene) {
        this.scene = scene;

        // 配置
        this.config = {
            warning: {
                duration: 2000,      // 预警持续时间
                pulseRate: 300,      // 脉冲频率
                colors: [0xff0000, 0xff6600, 0xffff00]
            },
            phase: {
                transitionDuration: 2000,
                screenShakeIntensity: 0.02
            },
            death: {
                explosionLayers: 5,  // 爆炸层数
                slowMotionFactor: 0.3,
                lootDisplayDuration: 5000
            }
        };

        // 活动效果
        this.activeWarnings = new Map();

        console.log('👑 Boss特效系统初始化');
    }

    // ==================== 大招预警特效 ====================

    /**
     * 创建大招预警
     * @param {number} x - 预警中心X
     * @param {number} y - 预警中心Y
     * @param {number} radius - 预警范围
     * @param {string} warningText - 警告文字
     * @param {number} duration - 预警持续时间（毫秒）
     * @returns {string} 预警ID
     */
    createUltimateWarning(x, y, radius, warningText = '⚠️ 危险!', duration = 2000) {
        const warningId = `warning_${Date.now()}_${Math.random()}`;
        const warningContainer = this.scene.add.container(x, y);
        warningContainer.setDepth(500);

        // 1. 地面红圈
        const groundMarker = this.scene.add.graphics();
        groundMarker.setDepth(50);

        // 2. 警告文字
        const text = this.scene.add.text(0, -radius - 30, warningText, {
            fontFamily: 'Noto Sans SC',
            fontSize: 'bold 24px',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5);
        warningContainer.add(text);

        // 3. 倒计时
        const countdownText = this.scene.add.text(0, 0, '3', {
            fontFamily: 'Press Start 2P',
            fontSize: 'bold 48px',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        warningContainer.add(countdownText);

        // 4. 外圈警告环
        const warningRing = this.scene.add.graphics();
        warningRing.setDepth(49);
        warningContainer.add(warningRing);

        // 存储预警信息
        this.activeWarnings.set(warningId, {
            container: warningContainer,
            groundMarker: groundMarker,
            startTime: this.scene.time.now,
            duration: duration,
            radius: radius
        });

        // 动画：倒计时
        let remaining = Math.ceil(duration / 1000);
        const countdownEvent = this.scene.time.addEvent({
            delay: 1000,
            repeat: remaining - 1,
            callback: () => {
                remaining--;
                if (remaining > 0) {
                    countdownText.setText(remaining.toString());
                    // 缩放动画
                    this.scene.tweens.add({
                        targets: countdownText,
                        scale: 1.3,
                        duration: 200,
                        yoyo: true
                    });
                }
            }
        });

        // 动画：脉冲效果
        const pulseEvent = this.scene.time.addEvent({
            delay: this.config.warning.pulseRate,
            loop: true,
            callback: () => {
                if (!warningContainer.active) {
                    pulseEvent.destroy();
                    return;
                }

                // 绘制脉冲环
                warningRing.clear();
                warningRing.lineStyle(4, 0xff0000, 0.8);
                warningRing.strokeCircle(0, 0, radius);

                // 脉冲动画
                this.scene.tweens.add({
                    targets: warningRing,
                    scale: 1.3,
                    alpha: 0,
                    duration: this.config.warning.pulseRate,
                    onComplete: () => {
                        warningRing.setScale(1);
                        warningRing.setAlpha(1);
                    }
                });

                // 地面标记脉冲
                groundMarker.clear();
                const alpha = 0.3 + Math.sin(this.scene.time.now / 100) * 0.2;
                groundMarker.fillStyle(0xff0000, alpha);
                groundMarker.fillCircle(x, y, radius);
            }
        });

        // 自动清理
        this.scene.time.delayedCall(duration, () => {
            this.removeWarning(warningId);
        });

        return warningId;
    }

    /**
     * 移除预警
     */
    removeWarning(warningId) {
        const warning = this.activeWarnings.get(warningId);
        if (warning) {
            warning.container.destroy();
            warning.groundMarker.destroy();
            this.activeWarnings.delete(warningId);
        }
    }

    // ==================== 阶段转换演出 ====================

    /**
     * 播放阶段转换演出
     * @param {number} phaseNumber - 新阶段数字
     * @param {string} phaseName - 阶段名称
     */
    playPhaseTransition(phaseNumber, phaseName) {
        const duration = this.config.phase.transitionDuration;

        // 1. 屏幕震动
        this.scene.cameras.main.shake(duration * 0.5, this.config.phase.screenShakeIntensity);

        // 2. 屏幕闪光
        this.scene.cameras.main.flash(duration * 0.3, 255, 255, 255);

        // 3. 黑屏过渡
        const blackScreen = this.scene.add.rectangle(
            this.scene.cameras.main.midPoint.x,
            this.scene.cameras.main.midPoint.y,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0x000000,
            0
        );
        blackScreen.setScrollFactor(0);
        blackScreen.setDepth(999);

        // 渐入
        this.scene.tweens.add({
            targets: blackScreen,
            alpha: 1,
            duration: duration * 0.2,
            onComplete: () => {
                // 显示阶段文字
                this.showPhaseText(phaseNumber, phaseName);

                // 渐出
                this.scene.tweens.add({
                    targets: blackScreen,
                    alpha: 0,
                    duration: duration * 0.3,
                    delay: duration * 0.3,
                    onComplete: () => blackScreen.destroy()
                });
            }
        });

        // 4. 粒子爆发
        this.createPhaseTransitionParticles();

        // 5. 播放音效
        if (this.scene.audioManager) {
            this.scene.audioManager.playPhaseTransition();
        }
    }

    /**
     * 显示阶段文字
     */
    showPhaseText(phaseNumber, phaseName) {
        const centerX = this.scene.cameras.main.midPoint.x;
        const centerY = this.scene.cameras.main.midPoint.y;

        // 阶段数字
        const phaseNumberText = this.scene.add.text(centerX, centerY - 50, `第 ${phaseNumber} 阶段`, {
            fontFamily: 'Press Start 2P',
            fontSize: 'bold 36px',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);
        phaseNumberText.setScrollFactor(0);
        phaseNumberText.setDepth(1000);

        // 阶段名称
        const phaseNameText = this.scene.add.text(centerX, centerY + 30, phaseName, {
            fontFamily: 'Noto Sans SC',
            fontSize: 'bold 28px',
            fill: '#ffd700',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        phaseNameText.setScrollFactor(0);
        phaseNameText.setDepth(1000);

        // 动画
        this.scene.tweens.add({
            targets: [phaseNumberText, phaseNameText],
            scale: 1.2,
            alpha: 0,
            duration: 1500,
            delay: 500,
            onComplete: () => {
                phaseNumberText.destroy();
                phaseNameText.destroy();
            }
        });
    }

    /**
     * 创建阶段转换粒子
     */
    createPhaseTransitionParticles() {
        const centerX = this.scene.cameras.main.midPoint.x;
        const centerY = this.scene.cameras.main.midPoint.y;

        for (let i = 0; i < 50; i++) {
            const angle = (Math.PI * 2 / 50) * i;
            const color = i % 2 === 0 ? 0xff0000 : 0xffd700;

            const particle = this.scene.add.circle(centerX, centerY, 4, color, 1);
            particle.setScrollFactor(0);
            particle.setDepth(999);

            const distance = 200 + Math.random() * 200;

            this.scene.tweens.add({
                targets: particle,
                x: centerX + Math.cos(angle) * distance,
                y: centerY + Math.sin(angle) * distance,
                alpha: 0,
                scale: 0,
                duration: 1000,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }
    }

    // ==================== Boss死亡爆炸 ====================

    /**
     * 播放Boss死亡特效
     * @param {Phaser.GameObjects.Sprite} boss - Boss对象
     * @param {Array} lootItems - 掉落物品数组
     */
    playBossDeath(boss, lootItems = []) {
        if (!boss || !boss.active) return;

        const x = boss.x;
        const y = boss.y;

        // 1. 时间慢动作
        this.scene.time.timeScale = this.config.death.slowMotionFactor;

        // 2. 多层爆炸
        this.createMultiLayerExplosion(x, y);

        // 3. 屏幕大震动
        this.scene.cameras.main.shake(1000, 0.03);

        // 4. 屏幕闪光
        this.scene.cameras.main.flash(500, 255, 200, 0);

        // 5. 冲击波
        this.createDeathShockwave(x, y);

        // 6. 背景变暗聚焦
        this.createDeathFocusEffect(x, y);

        // 7. 恢复时间并显示战利品
        this.scene.time.delayedCall(1500, () => {
            this.scene.time.timeScale = 1;
            this.showLootDisplay(lootItems, x, y);
        });

        // 8. 显示"VICTORY"文字
        this.scene.time.delayedCall(500, () => {
            this.showVictoryText();
        });
    }

    /**
     * 创建多层爆炸
     */
    createMultiLayerExplosion(x, y) {
        const colors = [0xff0000, 0xff6600, 0xffff00, 0xffffff];

        for (let layer = 0; layer < this.config.death.explosionLayers; layer++) {
            this.scene.time.delayedCall(layer * 200, () => {
                // 爆炸环
                const ring = this.scene.add.graphics();
                ring.setDepth(200 + layer);
                ring.lineStyle(5 - layer, colors[layer % colors.length], 1);
                ring.strokeCircle(x, y, 20 + layer * 15);

                this.scene.tweens.add({
                    targets: ring,
                    scale: 4 - layer * 0.5,
                    alpha: 0,
                    duration: 800,
                    ease: 'Power2',
                    onComplete: () => ring.destroy()
                });

                // 爆炸粒子
                const particleCount = 20 - layer * 3;
                for (let i = 0; i < particleCount; i++) {
                    const angle = (Math.PI * 2 / particleCount) * i;
                    const particle = this.scene.add.circle(x, y, 6 - layer, colors[layer % colors.length], 1);
                    particle.setDepth(201 + layer);

                    const distance = 100 + layer * 50;

                    this.scene.tweens.add({
                        targets: particle,
                        x: x + Math.cos(angle) * distance,
                        y: y + Math.sin(angle) * distance,
                        alpha: 0,
                        scale: 0,
                        duration: 1000,
                        ease: 'Power2',
                        onComplete: () => particle.destroy()
                    });
                }
            });
        }
    }

    /**
     * 创建死亡冲击波
     */
    createDeathShockwave(x, y) {
        for (let i = 0; i < 3; i++) {
            this.scene.time.delayedCall(i * 300, () => {
                const shockwave = this.scene.add.graphics();
                shockwave.setDepth(199);
                shockwave.lineStyle(8 - i * 2, 0xffffff, 0.8 - i * 0.2);
                shockwave.strokeCircle(x, y, 50);

                this.scene.tweens.add({
                    targets: shockwave,
                    scale: 5,
                    alpha: 0,
                    duration: 1000,
                    onComplete: () => shockwave.destroy()
                });
            });
        }
    }

    /**
     * 创建死亡聚焦效果
     */
    createDeathFocusEffect(x, y) {
        // 暗角效果
        const vignette = this.scene.add.graphics();
        vignette.setDepth(198);
        vignette.fillStyle(0x000000, 0);

        // 创建暗角（四周黑，中心透明）
        const camera = this.scene.cameras.main;
        vignette.fillRect(camera.worldView.x, camera.worldView.y, camera.width, camera.height);

        // 挖空中心
        const maskGraphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
        maskGraphics.fillCircle(x, y, 150);
        const mask = maskGraphics.createGeometryMask();
        mask.setInvertAlpha(true);
        vignette.setMask(mask);

        this.scene.tweens.add({
            targets: vignette,
            alpha: 0.7,
            duration: 500,
            yoyo: true,
            hold: 1000,
            onComplete: () => {
                vignette.destroy();
                maskGraphics.destroy();
            }
        });
    }

    /**
     * 显示战利品
     */
    showLootDisplay(lootItems, x, y) {
        if (lootItems.length === 0) return;

        lootItems.forEach((item, index) => {
            this.scene.time.delayedCall(index * 300, () => {
                const itemX = x + (index - lootItems.length / 2) * 60;
                const itemY = y - 100;

                // 物品图标（使用emoji或图形）
                const icon = this.scene.add.text(itemX, itemY, item.icon || '🎁', {
                    fontSize: '32px'
                }).setOrigin(0.5);
                icon.setDepth(300);

                // 物品名称
                const nameText = this.scene.add.text(itemX, itemY + 30, item.name, {
                    fontFamily: 'Noto Sans SC',
                    fontSize: '12px',
                    fill: '#ffd700',
                    stroke: '#000000',
                    strokeThickness: 3
                }).setOrigin(0.5);
                nameText.setDepth(300);

                // 动画：从Boss位置飞散
                this.scene.tweens.add({
                    targets: [icon, nameText],
                    y: itemY - 50,
                    alpha: 0,
                    duration: 2000,
                    ease: 'Power2',
                    onComplete: () => {
                        icon.destroy();
                        nameText.destroy();
                    }
                });
            });
        });
    }

    /**
     * 显示胜利文字
     */
    showVictoryText() {
        const centerX = this.scene.cameras.main.midPoint.x;
        const centerY = this.scene.cameras.main.midPoint.y;

        const victoryText = this.scene.add.text(centerX, centerY, 'VICTORY!', {
            fontFamily: 'Press Start 2P',
            fontSize: 'bold 48px',
            fill: '#ffd700',
            stroke: '#ff0000',
            strokeThickness: 8,
            shadow: {
                offsetX: 4,
                offsetY: 4,
                color: '#000000',
                blur: 10,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5);
        victoryText.setScrollFactor(0);
        victoryText.setDepth(1000);

        // 动画
        this.scene.tweens.add({
            targets: victoryText,
            scale: 1.3,
            alpha: 0,
            duration: 2500,
            ease: 'Power2',
            onComplete: () => victoryText.destroy()
        });

        // 彩虹背景效果
        const colors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3];
        colors.forEach((color, index) => {
            const ray = this.scene.add.graphics();
            ray.setDepth(990 + index);
            ray.fillStyle(color, 0.1);
            ray.fillRect(0, centerY - 100 + index * 30, this.scene.cameras.main.width, 30);
            ray.setScrollFactor(0);

            this.scene.tweens.add({
                targets: ray,
                alpha: 0,
                duration: 2000,
                onComplete: () => ray.destroy()
            });
        });
    }

    // ==================== 狂暴模式 ====================

    /**
     * 启用Boss狂暴模式
     * @param {Phaser.GameObjects.Sprite} boss - Boss对象
     */
    enableBerserkMode(boss) {
        if (!boss || !boss.active) return;

        // 1. 红色滤镜
        boss.setTint(0xff0000);

        // 2. 红色呼吸光环
        this.createBerserkAura(boss);

        // 3. 屏幕边缘红色警告
        this.createBerserkScreenEffect();

        // 4. 显示狂暴文字
        this.showBerserkText(boss.x, boss.y - 80);

        // 5. 播放狂暴音效
        if (this.scene.audioManager) {
            this.scene.audioManager.playBerserk();
        }
    }

    /**
     * 创建狂暴光环
     */
    createBerserkAura(boss) {
        const aura = this.scene.add.graphics();
        aura.setDepth(boss.depth - 1);

        // 呼吸动画
        const breathe = this.scene.tweens.add({
            targets: aura,
            scale: 1.3,
            alpha: { from: 0.6, to: 0.2 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            onUpdate: () => {
                if (!boss.active) {
                    breathe.stop();
                    aura.destroy();
                    return;
                }

                aura.clear();
                aura.lineStyle(3, 0xff0000, aura.alpha);
                aura.strokeCircle(boss.x, boss.y, 50);
            }
        });

        return aura;
    }

    /**
     * 创建狂暴屏幕效果
     */
    createBerserkScreenEffect() {
        const vignette = this.scene.add.graphics();
        vignette.setDepth(900);
        vignette.setScrollFactor(0);

        // 红色暗角
        vignette.fillStyle(0xff0000, 0);
        const camera = this.scene.cameras.main;

        // 创建暗角动画
        this.scene.tweens.add({
            targets: vignette,
            alpha: 0.3,
            duration: 500,
            yoyo: true,
            repeat: 3,
            onUpdate: () => {
                vignette.clear();
                vignette.fillStyle(0xff0000, vignette.alpha);
                // 简单的四角暗角
                vignette.fillRect(0, 0, camera.width, 50);
                vignette.fillRect(0, camera.height - 50, camera.width, 50);
                vignette.fillRect(0, 0, 50, camera.height);
                vignette.fillRect(camera.width - 50, 0, 50, camera.height);
            },
            onComplete: () => vignette.destroy()
        });
    }

    /**
     * 显示狂暴文字
     */
    showBerserkText(x, y) {
        const text = this.scene.add.text(x, y, '🔥 狂暴! 🔥', {
            fontFamily: 'Noto Sans SC',
            fontSize: 'bold 32px',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        text.setDepth(300);

        this.scene.tweens.add({
            targets: text,
            y: y - 50,
            scale: 1.2,
            alpha: 0,
            duration: 1500,
            onComplete: () => text.destroy()
        });
    }

    /**
     * 销毁系统
     */
    destroy() {
        // 清理所有活动预警
        this.activeWarnings.forEach((warning, id) => {
            this.removeWarning(id);
        });
        this.activeWarnings.clear();

        console.log('👑 Boss特效系统已销毁');
    }
}
