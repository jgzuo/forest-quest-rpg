/**
 * ElementEffects - 元素伤害特效系统
 *
 * 负责渲染和管理元素相关的视觉特效：
 * - 火焰：燃烧粒子、火光闪烁
 * - 冰霜：冻结碎片、冰晶效果
 * - 雷电：电弧闪烁、雷电粒子
 * - 毒素：毒气泡、绿色烟雾
 */

class ElementEffects {
    constructor(scene) {
        this.scene = scene;

        // 元素配置
        this.config = {
            fire: {
                colors: [0xff6600, 0xff9900, 0xffcc00],
                particleCount: 8,
                duration: 500,
                tint: 0xff3333
            },
            ice: {
                colors: [0x66ccff, 0x99ddff, 0xffffff],
                particleCount: 6,
                duration: 600,
                tint: 0x66ccff,
                slowFactor: 0.5
            },
            lightning: {
                colors: [0x9966ff, 0xcc99ff, 0xffffff],
                particleCount: 5,
                duration: 300,
                tint: 0xffffff
            },
            poison: {
                colors: [0x339933, 0x66cc66, 0x99ff99],
                particleCount: 10,
                duration: 700,
                tint: 0x66ff66
            }
        };

        console.log('🔮 元素特效系统初始化');
    }

    /**
     * 应用火焰特效
     * @param {Phaser.GameObjects.Sprite} enemy - 敌人对象
     * @param {number} damage - 伤害值
     */
    applyFireEffect(enemy, damage) {
        const config = this.config.fire;

        // 1. 创建火焰粒子
        this.createFireParticles(enemy.x, enemy.y, config.colors, config.particleCount);

        // 2. 敌人红色闪烁
        const originalTint = enemy.tint;
        enemy.setTint(config.tint);
        this.scene.time.delayedCall(100, () => {
            if (enemy.active) {
                enemy.clearTint();
            }
        });

        // 3. 屏幕边缘橙色闪烁
        this.flashScreenEdges(0xff6600, 200);

        // 4. 显示燃烧文字
        if (this.scene.showFloatingText) {
            this.scene.showFloatingText(enemy.x, enemy.y - 40, '🔥 燃烧!', '#ff6600', 600);
        }

        // 5. 播放火焰音效
        if (this.scene.combatAudioManager) {
            this.scene.combatAudioManager.playElementSound('fire', damage);
        }
    }

    /**
     * 创建火焰粒子
     */
    createFireParticles(x, y, colors, count) {
        for (let i = 0; i < count; i++) {
            const offsetX = (Math.random() - 0.5) * 30;
            const offsetY = (Math.random() - 0.5) * 30;
            const color = Phaser.Utils.Array.GetRandom(colors);

            const particle = this.scene.add.circle(x + offsetX, y + offsetY, 4, color, 0.8);
            particle.setDepth(101);

            // 向上飘动
            this.scene.tweens.add({
                targets: particle,
                y: particle.y - Phaser.Math.Between(30, 60),
                alpha: 0,
                scale: 0.5,
                duration: Phaser.Math.Between(300, 500),
                ease: 'Power1',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }

    /**
     * 应用冰霜特效
     * @param {Phaser.GameObjects.Sprite} enemy - 敌人对象
     * @param {number} damage - 伤害值
     */
    applyIceEffect(enemy, damage) {
        const config = this.config.ice;

        // 1. 创建冰晶粒子
        this.createIceParticles(enemy.x, enemy.y, config.colors, config.particleCount);

        // 2. 敌人蓝色色调 + 减速效果
        const originalTint = enemy.tint;
        enemy.setTint(config.tint);

        // 如果敌人有速度属性，临时减速
        const originalSpeed = enemy.getData('speed') || 50;
        enemy.setData('speed', originalSpeed * config.slowFactor);

        // 恢复效果
        this.scene.time.delayedCall(200, () => {
            if (enemy.active) {
                enemy.clearTint();
                enemy.setData('speed', originalSpeed);
            }
        });

        // 3. 冻结圆环
        const freezeGraphics = this.scene.add.graphics();
        freezeGraphics.setDepth(100);
        freezeGraphics.lineStyle(2, 0x66ccff, 0.8);
        freezeGraphics.strokeCircle(enemy.x, enemy.y, 35);

        this.scene.tweens.add({
            targets: freezeGraphics,
            scale: 1.2,
            alpha: 0,
            duration: 400,
            onComplete: () => {
                freezeGraphics.destroy();
            }
        });

        // 4. 显示冻结文字
        if (this.scene.showFloatingText) {
            this.scene.showFloatingText(enemy.x, enemy.y - 40, '❄️ 冻结!', '#66ccff', 600);
        }

        // 5. 播放冰霜音效
        if (this.scene.combatAudioManager) {
            this.scene.combatAudioManager.playElementSound('ice', damage);
        }
    }

    /**
     * 创建冰晶粒子
     */
    createIceParticles(x, y, colors, count) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const distance = 25;
            const particleX = x + Math.cos(angle) * distance;
            const particleY = y + Math.sin(angle) * distance;
            const color = Phaser.Utils.Array.GetRandom(colors);

            // 绘制菱形冰晶
            const graphics = this.scene.add.graphics();
            graphics.setDepth(101);
            graphics.fillStyle(color, 0.7);

            const size = 5;
            graphics.beginPath();
            graphics.moveTo(particleX, particleY - size);
            graphics.lineTo(particleX + size, particleY);
            graphics.lineTo(particleX, particleY + size);
            graphics.lineTo(particleX - size, particleY);
            graphics.closePath();
            graphics.fillPath();

            this.scene.tweens.add({
                targets: graphics,
                y: graphics.y - Phaser.Math.Between(20, 40),
                alpha: 0,
                rotation: 0.5,
                duration: 500,
                onComplete: () => {
                    graphics.destroy();
                }
            });
        }
    }

    /**
     * 应用雷电特效
     * @param {Phaser.GameObjects.Sprite} enemy - 敌人对象
     * @param {number} damage - 伤害值
     */
    applyLightningEffect(enemy, damage) {
        const config = this.config.lightning;

        // 1. 创建电弧线条
        this.createLightningBolts(enemy.x, enemy.y, config.colors, 5);

        // 2. 屏幕白色闪烁
        this.scene.cameras.main.flash(150, 255, 255, 255);

        // 3. 敌人白色闪烁
        const originalTint = enemy.tint;
        enemy.setTint(config.tint);
        this.scene.time.delayedCall(100, () => {
            if (enemy.active) {
                enemy.clearTint();
            }
        });

        // 4. 麻痹震动效果
        if (enemy.active) {
            this.scene.tweens.add({
                targets: enemy,
                x: enemy.x + Phaser.Math.Between(-5, 5),
                y: enemy.y + Phaser.Math.Between(-5, 5),
                duration: 50,
                yoyo: true,
                repeat: 3
            });
        }

        // 5. 显示麻痹文字
        if (this.scene.showFloatingText) {
            this.scene.showFloatingText(enemy.x, enemy.y - 40, '⚡ 麻痹!', '#9966ff', 600);
        }

        // 6. 播放雷电音效
        if (this.scene.combatAudioManager) {
            this.scene.combatAudioManager.playElementSound('lightning', damage);
        }
    }

    /**
     * 创建电弧线条
     */
    createLightningBolts(x, y, colors, count) {
        for (let i = 0; i < count; i++) {
            const graphics = this.scene.add.graphics();
            graphics.setDepth(102);
            graphics.lineStyle(2, Phaser.Utils.Array.GetRandom(colors), 1);

            // 生成随机折线
            graphics.beginPath();
            graphics.moveTo(x, y);

            let currentX = x;
            let currentY = y;
            const segments = 5;

            for (let j = 0; j < segments; j++) {
                const angle = Math.random() * Math.PI * 2;
                const length = 15;
                currentX += Math.cos(angle) * length;
                currentY += Math.sin(angle) * length;
                graphics.lineTo(currentX, currentY);
            }

            graphics.strokePath();

            // 快速闪烁
            this.scene.tweens.add({
                targets: graphics,
                alpha: 0,
                duration: 200,
                onComplete: () => {
                    graphics.destroy();
                }
            });
        }
    }

    /**
     * 应用毒素特效
     * @param {Phaser.GameObjects.Sprite} enemy - 敌人对象
     * @param {number} damage - 伤害值
     */
    applyPoisonEffect(enemy, damage) {
        const config = this.config.poison;

        // 1. 创建毒气泡
        this.createPoisonBubbles(enemy.x, enemy.y, config.colors, config.particleCount);

        // 2. 绿色烟雾扩散
        this.createPoisonCloud(enemy.x, enemy.y);

        // 3. 敌人绿色色调
        const originalTint = enemy.tint;
        enemy.setTint(config.tint);
        this.scene.time.delayedCall(150, () => {
            if (enemy.active) {
                enemy.clearTint();
            }
        });

        // 4. 绿色光环
        const poisonGraphics = this.scene.add.graphics();
        poisonGraphics.setDepth(99);
        poisonGraphics.lineStyle(2, 0x66ff66, 0.6);
        poisonGraphics.strokeCircle(enemy.x, enemy.y, 40);

        this.scene.tweens.add({
            targets: poisonGraphics,
            scale: 1.5,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                poisonGraphics.destroy();
            }
        });

        // 5. 显示中毒文字
        if (this.scene.showFloatingText) {
            this.scene.showFloatingText(enemy.x, enemy.y - 40, '☠️ 中毒!', '#66ff66', 600);
        }

        // 6. 播放毒素音效
        if (this.scene.combatAudioManager) {
            this.scene.combatAudioManager.playElementSound('poison', damage);
        }
    }

    /**
     * 创建毒气泡
     */
    createPoisonBubbles(x, y, colors, count) {
        for (let i = 0; i < count; i++) {
            const offsetX = (Math.random() - 0.5) * 40;
            const offsetY = (Math.random() - 0.5) * 40;
            const color = Phaser.Utils.Array.GetRandom(colors);
            const size = Phaser.Math.Between(3, 6);

            const bubble = this.scene.add.circle(x + offsetX, y + offsetY, size, color, 0.6);
            bubble.setDepth(100);

            // 向上飘动并摆动
            this.scene.tweens.add({
                targets: bubble,
                y: bubble.y - Phaser.Math.Between(40, 80),
                x: bubble.x + Phaser.Math.Between(-20, 20),
                alpha: 0,
                duration: Phaser.Math.Between(600, 900),
                ease: 'Sine.easeInOut',
                onComplete: () => {
                    bubble.destroy();
                }
            });
        }
    }

    /**
     * 创建绿色烟雾
     */
    createPoisonCloud(x, y) {
        const cloudGraphics = this.scene.add.graphics();
        cloudGraphics.setDepth(98);
        cloudGraphics.fillStyle(0x66ff66, 0.15);
        cloudGraphics.fillCircle(x, y, 50);

        this.scene.tweens.add({
            targets: cloudGraphics,
            scale: 2,
            alpha: 0,
            duration: 800,
            onComplete: () => {
                cloudGraphics.destroy();
            }
        });
    }

    /**
     * 屏幕边缘闪烁
     * @param {number} color - 颜色
     * @param {number} duration - 持续时间
     */
    flashScreenEdges(color, duration) {
        const overlay = this.scene.add.graphics();
        overlay.setDepth(999);

        // 绘制边框
        overlay.lineStyle(20, color, 0.3);
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
     * 根据伤害类型应用特效
     * @param {string} damageType - 伤害类型（fire/ice/lightning/poison）
     * @param {Phaser.GameObjects.Sprite} enemy - 敌人对象
     * @param {number} damage - 伤害值
     */
    applyEffect(damageType, enemy, damage) {
        switch (damageType) {
            case 'fire':
                this.applyFireEffect(enemy, damage);
                break;
            case 'ice':
                this.applyIceEffect(enemy, damage);
                break;
            case 'lightning':
                this.applyLightningEffect(enemy, damage);
                break;
            case 'poison':
                this.applyPoisonEffect(enemy, damage);
                break;
            default:
                console.warn(`未知伤害类型: ${damageType}`);
        }
    }

    /**
     * 清除所有特效
     */
    clear() {
        // Effects are self-managing via tween callbacks
        // This method is kept for API compatibility
    }

    /**
     * 销毁特效系统
     */
    destroy() {
        this.clear();
        console.log('🔮 元素特效系统已销毁');
    }
}
