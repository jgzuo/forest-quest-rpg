/**
 * ElementEffectsExtended - 扩展元素特效系统
 *
 * 新增四大元素：
 * - 圣光（Light）：金色光芒、十字架、治愈效果
 * - 暗影（Shadow）：紫色黑洞、暗影触手、腐蚀效果
 * - 地震（Earth）：地面裂痕、石块飞溅、震动波
 * - 风暴（Storm）：龙卷风、闪电链、飓风眼
 */

class ElementEffectsExtended {
    constructor(scene) {
        this.scene = scene;
        this.activeEffects = [];

        // 元素配置
        this.config = {
            light: {
                colors: [0xfff8dc, 0xffd700, 0xffffff, 0xfffacd],
                duration: 600,
                particleCount: 12
            },
            shadow: {
                colors: [0x4b0082, 0x800080, 0x000000, 0x483d8b],
                duration: 800,
                particleCount: 10
            },
            earth: {
                colors: [0x8b4513, 0xd2691e, 0xa0522d, 0xcd853f],
                duration: 700,
                particleCount: 15
            },
            storm: {
                colors: [0x4682b4, 0x87ceeb, 0xffffff, 0xb0c4de],
                duration: 500,
                particleCount: 20
            }
        };

        console.log('✨ 扩展元素特效系统初始化');
    }

    // ==================== 圣光特效 ====================

    /**
     * 圣光伤害特效
     */
    applyLightEffect(target, damage) {
        const config = this.config.light;

        // 1. 金色光芒爆发
        this.createLightBurst(target.x, target.y);

        // 2. 十字架光效
        this.createHolyCross(target.x, target.y - 30);

        // 3. 天使羽毛飘落
        this.createFallingFeathers(target.x, target.y);

        // 4. 目标金色闪烁
        this.applyLightTint(target);

        // 5. 显示特效文字
        this.showElementText(target.x, target.y, '✨ 圣光!', '#ffd700');

        // 6. 播放圣光音效
        if (this.scene.combatAudioManager) {
            this.scene.combatAudioManager.playElementSound('light', damage);
        }
    }

    createLightBurst(x, y) {
        // 光芒射线
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const graphics = this.scene.add.graphics();
            graphics.setDepth(102);
            graphics.lineStyle(3, 0xffd700, 0.8);

            const length = 60;
            graphics.beginPath();
            graphics.moveTo(x, y);
            graphics.lineTo(
                x + Math.cos(angle) * length,
                y + Math.sin(angle) * length
            );
            graphics.strokePath();

            this.scene.tweens.add({
                targets: graphics,
                alpha: 0,
                scale: 1.5,
                duration: 400,
                onComplete: () => graphics.destroy()
            });
        }

        // 中心光球
        const orb = this.scene.add.circle(x, y, 25, 0xfff8dc, 0.9);
        orb.setDepth(101);

        this.scene.tweens.add({
            targets: orb,
            scale: 2,
            alpha: 0,
            duration: 500,
            onComplete: () => orb.destroy()
        });
    }

    createHolyCross(x, y) {
        const graphics = this.scene.add.graphics();
        graphics.setDepth(103);
        graphics.lineStyle(5, 0xffd700, 1);

        const size = 40;
        graphics.beginPath();
        // 竖线
        graphics.moveTo(x, y - size);
        graphics.lineTo(x, y + size);
        // 横线
        graphics.moveTo(x - size * 0.6, y - size * 0.2);
        graphics.lineTo(x + size * 0.6, y - size * 0.2);
        graphics.strokePath();

        // 旋转发光
        this.scene.tweens.add({
            targets: graphics,
            rotation: Math.PI / 4,
            alpha: 0,
            scale: 1.5,
            duration: 800,
            ease: 'Power2',
            onComplete: () => graphics.destroy()
        });

        // 外圈光环
        const halo = this.scene.add.graphics();
        halo.setDepth(100);
        halo.lineStyle(2, 0xfffacd, 0.6);
        halo.strokeCircle(x, y, 50);

        this.scene.tweens.add({
            targets: halo,
            scale: 2,
            alpha: 0,
            duration: 600,
            onComplete: () => halo.destroy()
        });
    }

    createFallingFeathers(x, y) {
        for (let i = 0; i < 6; i++) {
            const feather = this.scene.add.text(
                x + (Math.random() - 0.5) * 60,
                y - 20,
                '🪶',
                { fontSize: '20px' }
            ).setOrigin(0.5);
            feather.setDepth(99);

            this.scene.tweens.add({
                targets: feather,
                y: y + 50,
                x: feather.x + (Math.random() - 0.5) * 30,
                rotation: Math.random() * Math.PI,
                alpha: 0,
                duration: 1000 + i * 100,
                ease: 'Power1',
                onComplete: () => feather.destroy()
            });
        }
    }

    applyLightTint(target) {
        target.setTint(0xfff8dc);
        this.scene.time.delayedCall(150, () => {
            if (target.active) target.clearTint();
        });
    }

    // ==================== 暗影特效 ====================

    /**
     * 暗影伤害特效
     */
    applyShadowEffect(target, damage) {
        const config = this.config.shadow;

        // 1. 黑洞效果
        this.createVoidHole(target.x, target.y);

        // 2. 暗影触手
        this.createShadowTentacles(target.x, target.y);

        // 3. 腐蚀效果
        this.createCorrosionEffect(target.x, target.y);

        // 4. 目标暗化
        this.applyShadowTint(target);

        // 5. 显示特效文字
        this.showElementText(target.x, target.y, '👁️ 暗影!', '#800080');

        // 6. 播放暗影音效
        if (this.scene.combatAudioManager) {
            this.scene.combatAudioManager.playElementSound('shadow', 50); // damage参数已弃用，传默认值
        }
    }

    createVoidHole(x, y) {
        // 黑洞漩涡
        const hole = this.scene.add.graphics();
        hole.setDepth(100);

        for (let i = 0; i < 5; i++) {
            hole.lineStyle(2 + i, 0x4b0082, 0.8 - i * 0.15);
            hole.strokeCircle(x, y, 20 + i * 8);
        }

        // 旋转动画
        this.scene.tweens.add({
            targets: hole,
            rotation: Math.PI * 2,
            scale: 0.3,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => hole.destroy()
        });

        // 吸引粒子
        for (let i = 0; i < 15; i++) {
            const angle = (Math.PI * 2 / 15) * i;
            const distance = 80;
            const particle = this.scene.add.circle(
                x + Math.cos(angle) * distance,
                y + Math.sin(angle) * distance,
                3,
                0x800080,
                0.8
            );
            particle.setDepth(99);

            this.scene.tweens.add({
                targets: particle,
                x: x,
                y: y,
                scale: 0,
                duration: 600,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }
    }

    createShadowTentacles(x, y) {
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i;
            const graphics = this.scene.add.graphics();
            graphics.setDepth(101);
            graphics.lineStyle(4, 0x483d8b, 0.9);

            // 绘制触手
            graphics.beginPath();
            graphics.moveTo(x, y);

            const segments = 5;
            let currentX = x;
            let currentY = y;

            for (let j = 0; j < segments; j++) {
                const progress = (j + 1) / segments;
                const wobble = Math.sin(j * 0.8) * 15;
                currentX += Math.cos(angle) * 15 + Math.cos(angle + Math.PI/2) * wobble;
                currentY += Math.sin(angle) * 15 + Math.sin(angle + Math.PI/2) * wobble;
                graphics.lineTo(currentX, currentY);
            }

            graphics.strokePath();

            // 蠕动动画
            this.scene.tweens.add({
                targets: graphics,
                alpha: 0,
                duration: 700,
                delay: i * 50,
                onComplete: () => graphics.destroy()
            });
        }
    }

    createCorrosionEffect(x, y) {
        // 腐蚀气泡
        for (let i = 0; i < 8; i++) {
            const bubble = this.scene.add.circle(
                x + (Math.random() - 0.5) * 50,
                y + (Math.random() - 0.5) * 50,
                5 + Math.random() * 8,
                0x800080,
                0.5
            );
            bubble.setDepth(98);

            this.scene.tweens.add({
                targets: bubble,
                scale: 0,
                alpha: 0,
                duration: 600 + Math.random() * 200,
                onComplete: () => bubble.destroy()
            });
        }
    }

    applyShadowTint(target) {
        target.setTint(0x4b0082);
        this.scene.time.delayedCall(200, () => {
            if (target.active) target.clearTint();
        });
    }

    // ==================== 地震特效 ====================

    /**
     * 地震伤害特效
     */
    applyEarthEffect(target, damage) {
        const config = this.config.earth;

        // 1. 地面裂痕
        this.createGroundFissure(target.x, target.y);

        // 2. 石块飞溅
        this.createFlyingRocks(target.x, target.y);

        // 3. 震动波
        this.createShockWave(target.x, target.y);

        // 4. 屏幕震动
        this.scene.cameras.main.shake(200, 0.015);

        // 5. 显示特效文字
        this.showElementText(target.x, target.y, '🪨 地震!', '#8b4513');

        // 6. 播放地震音效
        if (this.scene.combatAudioManager) {
            this.scene.combatAudioManager.playElementSound('earth', 50);
        }
    }

    createGroundFissure(x, y) {
        const graphics = this.scene.add.graphics();
        graphics.setDepth(50);

        // 主裂缝
        graphics.lineStyle(4, 0x3d2817, 1);
        graphics.beginPath();

        const length = 80;
        const angle = Math.random() * Math.PI;

        graphics.moveTo(x - Math.cos(angle) * length, y - Math.sin(angle) * length);
        graphics.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
        graphics.strokePath();

        // 分支裂缝
        graphics.lineStyle(2, 0x5d4037, 0.8);
        for (let i = 0; i < 4; i++) {
            const branchAngle = angle + (Math.random() - 0.5) * Math.PI / 2;
            const branchLength = 30 + Math.random() * 20;
            const startX = x + (Math.random() - 0.5) * length;
            const startY = y + (Math.random() - 0.5) * 10;

            graphics.beginPath();
            graphics.moveTo(startX, startY);
            graphics.lineTo(
                startX + Math.cos(branchAngle) * branchLength,
                startY + Math.sin(branchAngle) * branchLength
            );
            graphics.strokePath();
        }

        // 持续显示一段时间
        this.scene.time.delayedCall(2000, () => {
            this.scene.tweens.add({
                targets: graphics,
                alpha: 0,
                duration: 500,
                onComplete: () => graphics.destroy()
            });
        });
    }

    createFlyingRocks(x, y) {
        for (let i = 0; i < 10; i++) {
            const size = 4 + Math.random() * 6;
            const rock = this.scene.add.rectangle(
                x + (Math.random() - 0.5) * 40,
                y,
                size,
                size,
                0x8b4513
            );
            rock.setDepth(101);
            rock.setRotation(Math.random() * Math.PI);

            const velocityX = (Math.random() - 0.5) * 150;
            const velocityY = -100 - Math.random() * 100;

            this.scene.tweens.add({
                targets: rock,
                x: rock.x + velocityX,
                y: rock.y + velocityY,
                rotation: rock.rotation + Math.PI * 2,
                duration: 600,
                ease: 'Power2',
                onComplete: () => {
                    // 下落
                    this.scene.tweens.add({
                        targets: rock,
                        y: rock.y + 150,
                        alpha: 0,
                        duration: 400,
                        onComplete: () => rock.destroy()
                    });
                }
            });
        }
    }

    createShockWave(x, y) {
        for (let i = 0; i < 3; i++) {
            this.scene.time.delayedCall(i * 150, () => {
                const wave = this.scene.add.graphics();
                wave.setDepth(99);
                wave.lineStyle(3, 0xd2691e, 0.8 - i * 0.2);
                wave.strokeCircle(x, y, 30);

                this.scene.tweens.add({
                    targets: wave,
                    scale: 3,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => wave.destroy()
                });
            });
        }
    }

    // ==================== 风暴特效 ====================

    /**
     * 风暴伤害特效
     */
    applyStormEffect(target, damage) {
        const config = this.config.storm;

        // 1. 小型龙卷风
        this.createMiniTornado(target.x, target.y);

        // 2. 闪电链
        this.createLightningChain(target.x, target.y);

        // 3. 风刃
        this.createWindBlades(target.x, target.y);

        // 4. 目标蓝色闪烁
        this.applyStormTint(target);

        // 5. 显示特效文字
        this.showElementText(target.x, target.y, '🌪️ 风暴!', '#4682b4');

        // 6. 播放风暴音效
        if (this.scene.combatAudioManager) {
            this.scene.combatAudioManager.playElementSound('storm', 50);
        }
    }

    createMiniTornado(x, y) {
        // 龙卷风主体
        const tornadoContainer = this.scene.add.container(x, y);
        tornadoContainer.setDepth(100);

        // 创建多层旋风
        for (let i = 0; i < 5; i++) {
            const ring = this.scene.add.ellipse(0, -i * 15, 60 - i * 8, 20, 0x87ceeb, 0.3);
            ring.setDepth(i);
            tornadoContainer.add(ring);

            // 旋转动画
            this.scene.tweens.add({
                targets: ring,
                rotation: i % 2 === 0 ? Math.PI * 2 : -Math.PI * 2,
                duration: 800 + i * 100,
                repeat: 2
            });
        }

        // 上升并消散
        this.scene.tweens.add({
            targets: tornadoContainer,
            y: y - 100,
            alpha: 0,
            duration: 1000,
            onComplete: () => tornadoContainer.destroy()
        });

        // 风粒子
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 / 20) * i;
            const particle = this.scene.add.circle(x, y, 2, 0xffffff, 0.6);
            particle.setDepth(99);

            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * 60,
                y: y + Math.sin(angle) * 60,
                alpha: 0,
                duration: 400,
                onComplete: () => particle.destroy()
            });
        }
    }

    createLightningChain(x, y) {
        // 多道闪电
        for (let i = 0; i < 4; i++) {
            this.scene.time.delayedCall(i * 80, () => {
                const graphics = this.scene.add.graphics();
                graphics.setDepth(102);
                graphics.lineStyle(3, 0xffffff, 1);

                // 生成锯齿状闪电
                graphics.beginPath();
                let currentX = x;
                let currentY = y - 60;
                graphics.moveTo(currentX, currentY);

                const segments = 6;
                for (let j = 0; j < segments; j++) {
                    currentX += (Math.random() - 0.5) * 30;
                    currentY += 20;
                    graphics.lineTo(currentX, currentY);
                }

                graphics.strokePath();

                // 闪光效果
                this.scene.cameras.main.flash(50, 200, 200, 255, 0.3);

                // 快速消失
                this.scene.time.delayedCall(100, () => {
                    graphics.destroy();
                });
            });
        }
    }

    createWindBlades(x, y) {
        // 风刃飞散
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i;
            const blade = this.scene.add.graphics();
            blade.setDepth(101);
            blade.lineStyle(2, 0xb0c4de, 0.8);

            // 绘制弯月形风刃
            blade.beginPath();
            blade.arc(x, y, 30, angle - 0.3, angle + 0.3);
            blade.strokePath();

            const targetX = x + Math.cos(angle) * 80;
            const targetY = y + Math.sin(angle) * 80;

            this.scene.tweens.add({
                targets: blade,
                x: targetX - x,
                y: targetY - y,
                alpha: 0,
                duration: 400,
                onComplete: () => blade.destroy()
            });
        }
    }

    applyStormTint(target) {
        target.setTint(0x4682b4);
        this.scene.time.delayedCall(100, () => {
            if (target.active) target.clearTint();
        });
    }

    // ==================== 通用方法 ====================

    /**
     * 显示元素特效文字
     */
    showElementText(x, y, text, color) {
        const elementText = this.scene.add.text(x, y - 50, text, {
            fontFamily: 'Noto Sans SC',
            fontSize: 'bold 20px',
            fill: color,
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        elementText.setDepth(150);

        this.scene.tweens.add({
            targets: elementText,
            y: elementText.y - 40,
            alpha: 0,
            duration: 800,
            onComplete: () => elementText.destroy()
        });
    }

    /**
     * 应用扩展元素效果（统一接口）
     */
    applyExtendedEffect(elementType, target, damage) {
        switch (elementType) {
            case 'light':
                this.applyLightEffect(target, damage);
                break;
            case 'shadow':
                this.applyShadowEffect(target, damage);
                break;
            case 'earth':
                this.applyEarthEffect(target, damage);
                break;
            case 'storm':
                this.applyStormEffect(target, damage);
                break;
            default:
                console.warn(`未知扩展元素类型: ${elementType}`);
        }
    }

    /**
     * 获取所有可用元素类型
     */
    getAvailableElements() {
        return ['fire', 'ice', 'lightning', 'poison', 'light', 'shadow', 'earth', 'storm'];
    }

    /**
     * 销毁系统
     */
    destroy() {
        this.activeEffects = [];
        console.log('✨ 扩展元素特效系统已销毁');
    }
}
