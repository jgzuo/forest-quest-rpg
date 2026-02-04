/**
 * CombatParticles - 战斗粒子系统
 *
 * 负责渲染和管理战斗相关的粒子效果：
 * - 血液溅射（敌人受击）
 * - 火花效果（暴击/金属撞击）
 * - 魔法残影（技能释放）
 * - 冲击波圆环（扩散动画）
 * - 能量碎片（敌人死亡）
 * - 风痕粒子（旋风斩）
 * - 地面裂痕（冲锋）
 */

class CombatParticles {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.activeParticles = [];

        // 粒子数量限制（防止性能问题）
        this.MAX_PARTICLES = 500;

        // 粒子配置
        this.config = {
            blood: {
                color: 0x990000,
                size: 3,
                gravity: 400,
                fadeRate: 0.002,
                lifetime: 300
            },
            spark: {
                colors: [0xffaa00, 0xffcc00, 0xff6600],
                size: 2,
                gravity: 300,
                fadeRate: 0.003,
                lifetime: 200
            },
            magicTrail: {
                color: 0x9966ff,
                size: 4,
                gravity: 0,
                fadeRate: 0.004,
                lifetime: 400
            },
            energy: {
                colors: [0xffff00, 0xffcc00, 0xff6600, 0xffffff],
                size: 5,
                gravity: 200,
                fadeRate: 0.002,
                lifetime: 500
            },
            wind: {
                color: 0x66ccff,
                size: 2,
                gravity: 50,
                fadeRate: 0.003,
                lifetime: 300
            },
            crack: {
                color: 0x8B4513,
                size: 3,
                gravity: 0,
                fadeRate: 0.002,
                lifetime: 600
            }
        };

        console.log('⚔️ 战斗粒子系统初始化');
    }

    /**
     * 创建血液溅射
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} count - 粒子数量
     */
    createBloodSplatter(x, y, count = 10) {
        // 检查粒子数量限制
        if (this.activeParticles.length >= this.MAX_PARTICLES) {
            return;
        }

        const config = this.config.blood;

        for (let i = 0; i < count; i++) {
            const angle = Phaser.Math.Between(0, 360);
            const speed = Phaser.Math.Between(50, 150);
            const velocityX = Math.cos(angle * Math.PI / 180) * speed;
            const velocityY = Math.sin(angle * Math.PI / 180) * speed;

            const particle = this.scene.add.circle(x, y, config.size, config.color, 1);
            particle.setDepth(100);

            this.activeParticles.push({
                sprite: particle,
                vx: velocityX,
                vy: velocityY,
                gravity: config.gravity,
                fadeRate: config.fadeRate,
                lifetime: config.lifetime,
                age: 0,
                type: 'blood'
            });
        }
    }

    /**
     * 创建火花效果
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} count - 粒子数量
     * @param {number} color - 颜色（可选）
     */
    createSparks(x, y, count = 15, color = null) {
        const config = this.config.spark;
        const sparkColor = color || Phaser.Utils.Array.GetRandom(config.colors);

        for (let i = 0; i < count; i++) {
            const angle = Phaser.Math.Between(0, 360);
            const speed = Phaser.Math.Between(100, 250);
            const velocityX = Math.cos(angle * Math.PI / 180) * speed;
            const velocityY = Math.sin(angle * Math.PI / 180) * speed;

            const particle = this.scene.add.circle(x, y, config.size, sparkColor, 1);
            particle.setDepth(101);

            this.activeParticles.push({
                sprite: particle,
                vx: velocityX,
                vy: velocityY,
                gravity: config.gravity,
                fadeRate: config.fadeRate,
                lifetime: config.lifetime,
                age: 0,
                type: 'spark'
            });
        }
    }

    /**
     * 创建魔法残影
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} color - 颜色
     */
    createMagicTrail(x, y, color = 0x9966ff) {
        const config = this.config.magicTrail;

        const particle = this.scene.add.circle(x, y, config.size, color, 0.6);
        particle.setDepth(99);

        const angle = Math.random() * Math.PI * 2;
        const speed = 20;

        this.activeParticles.push({
            sprite: particle,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 30,
            gravity: config.gravity,
            fadeRate: config.fadeRate,
            lifetime: config.lifetime,
            age: 0,
            type: 'magic'
        });
    }

    /**
     * 创建冲击波圆环
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} color - 颜色
     * @param {number} maxRadius - 最大半径
     * @param {number} duration - 持续时间（毫秒）
     */
    createShockwave(x, y, color = 0xffffff, maxRadius = 100, duration = 300) {
        const graphics = this.scene.add.graphics();
        graphics.setDepth(98);
        graphics.lineStyle(3, color, 1);
        graphics.strokeCircle(x, y, 10);

        this.scene.tweens.add({
            targets: graphics,
            scale: maxRadius / 10,
            alpha: 0,
            duration: duration,
            ease: 'Power2',
            onComplete: () => {
                graphics.destroy();
            }
        });
    }

    /**
     * 创建死亡爆炸效果
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} color - 颜色
     * @param {number} count - 粒子数量
     */
    createDeathExplosion(x, y, color = null, count = 20) {
        const config = this.config.energy;
        const explosionColor = color || Phaser.Utils.Array.GetRandom(config.colors);

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const speed = Phaser.Math.Between(100, 200);
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;

            const particle = this.scene.add.circle(x, y, config.size, explosionColor, 1);
            particle.setDepth(102);

            this.activeParticles.push({
                sprite: particle,
                vx: velocityX,
                vy: velocityY,
                gravity: config.gravity,
                fadeRate: config.fadeRate,
                lifetime: config.lifetime,
                age: 0,
                type: 'energy'
            });
        }
    }

    /**
     * 创建风痕粒子（旋风斩）
     * @param {number} centerX - 中心X坐标
     * @param {number} centerY - 中心Y坐标
     * @param {number} radius - 半径
     * @param {number} count - 粒子数量
     */
    createWindTrails(centerX, centerY, radius, count = 12) {
        const config = this.config.wind;

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            const particle = this.scene.add.circle(x, y, config.size, config.color, 0.7);
            particle.setDepth(97);

            // 粒子沿切线方向移动
            const speed = 100;
            const tangentAngle = angle + Math.PI / 2;
            const velocityX = Math.cos(tangentAngle) * speed;
            const velocityY = Math.sin(tangentAngle) * speed;

            this.activeParticles.push({
                sprite: particle,
                vx: velocityX,
                vy: velocityY,
                gravity: config.gravity,
                fadeRate: config.fadeRate,
                lifetime: config.lifetime,
                age: 0,
                type: 'wind'
            });
        }
    }

    /**
     * 创建地面裂痕（冲锋）
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} angle - 角度（弧度）
     * @param {number} length - 长度
     */
    createGroundCrack(x, y, angle = 0, length = 40) {
        const graphics = this.scene.add.graphics();
        graphics.setDepth(50);

        // 绘制裂痕
        graphics.lineStyle(2, this.config.crack.color, 1);
        graphics.beginPath();

        const endX = x + Math.cos(angle) * length;
        const endY = y + Math.sin(angle) * length;

        graphics.moveTo(x, y);
        graphics.lineTo(endX, endY);
        graphics.strokePath();

        // 添加一些分支裂痕
        for (let i = 0; i < 3; i++) {
            const branchAngle = angle + (Math.random() - 0.5) * Math.PI / 2;
            const branchLength = length * (0.3 + Math.random() * 0.3);
            const branchX = x + (endX - x) * (0.3 + i * 0.2);
            const branchY = y + (endY - y) * (0.3 + i * 0.2);

            graphics.beginPath();
            graphics.moveTo(branchX, branchY);
            graphics.lineTo(
                branchX + Math.cos(branchAngle) * branchLength,
                branchY + Math.sin(branchAngle) * branchLength
            );
            graphics.strokePath();
        }

        // 淡出动画
        this.scene.tweens.add({
            targets: graphics,
            alpha: 0,
            duration: this.config.crack.lifetime,
            onComplete: () => {
                graphics.destroy();
            }
        });
    }

    /**
     * 创建多层冲击波
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} color - 颜色
     * @param {number} layers - 层数
     * @param {number} delay - 层间延迟
     */
    createMultiLayerShockwave(x, y, color, layers = 3, delay = 150) {
        for (let i = 0; i < layers; i++) {
            this.scene.time.delayedCall(i * delay, () => {
                this.createShockwave(x, y, color, 100 + i * 20, 400);
            });
        }
    }

    /**
     * 更新所有粒子
     * @param {number} time - 当前时间
     * @param {number} delta - 时间增量
     */
    update(time, delta) {
        const dt = delta / 1000;

        // 更新活跃粒子
        for (let i = this.activeParticles.length - 1; i >= 0; i--) {
            const particle = this.activeParticles[i];
            particle.age += delta;

            // 检查粒子是否过期
            if (particle.age >= particle.lifetime) {
                particle.sprite.destroy();
                this.activeParticles.splice(i, 1);
                continue;
            }

            // 更新位置
            particle.sprite.x += particle.vx * dt;
            particle.sprite.y += particle.vy * dt;
            particle.vy += particle.gravity * dt;

            // 更新透明度
            const alpha = 1 - (particle.age / particle.lifetime);
            particle.sprite.setAlpha(alpha);
        }
    }

    /**
     * 清除所有粒子
     */
    clear() {
        this.activeParticles.forEach(particle => {
            if (particle.sprite && particle.sprite.active) {
                particle.sprite.destroy();
            }
        });
        this.activeParticles = [];
    }

    /**
     * 获取活跃粒子数量
     */
    getActiveParticleCount() {
        return this.activeParticles.length;
    }

    /**
     * 创建击退轨迹残影效果
     * @param {Phaser.GameObjects.Sprite} target - 目标对象
     * @param {number} startX - 起始X
     * @param {number} startY - 起始Y
     * @param {number} endX - 结束X
     * @param {number} endY - 结束Y
     * @param {number} trailCount - 残影数量
     * @param {number} color - 残影颜色
     */
    createKnockbackTrail(target, startX, startY, endX, endY, trailCount = 8, color = 0xff6600) {
        const distance = Phaser.Math.Distance.Between(startX, startY, endX, endY);
        const angle = Math.atan2(endY - startY, endX - startX);

        for (let i = 0; i < trailCount; i++) {
            const progress = i / trailCount;
            const trailX = startX + (endX - startX) * progress;
            const trailY = startY + (endY - startY) * progress;

            this.scene.time.delayedCall(i * 30, () => {
                // 创建残影
                const trail = this.scene.add.circle(trailX, trailY, target.width / 3, color, 0.3);
                trail.setDepth(target.depth - 1);

                // 淡出动画
                this.scene.tweens.add({
                    targets: trail,
                    alpha: 0,
                    scale: 0.5,
                    duration: 400,
                    onComplete: () => {
                        trail.destroy();
                    }
                });
            });
        }
    }

    /**
     * 创建连续击退轨迹（跟随移动的敌人）
     * @param {Phaser.GameObjects.Sprite} target - 被击退的敌人
     * @param {number} duration - 击退持续时间（毫秒）
     * @param {number} color - 轨迹颜色
     */
    createContinuousKnockbackTrail(target, duration = 300, color = 0xff6600) {
        const trailInterval = 30; // 每30ms创建一个残影
        const trailCount = Math.floor(duration / trailInterval);

        for (let i = 0; i < trailCount; i++) {
            this.scene.time.delayedCall(i * trailInterval, () => {
                if (!target.active) return;

                // 创建残影
                const trail = this.scene.add.circle(
                    target.x,
                    target.y,
                    target.width / 3,
                    color,
                    0.4
                );
                trail.setDepth(target.depth - 1);

                // 淡出动画
                this.scene.tweens.add({
                    targets: trail,
                    alpha: 0,
                    scale: 0.3,
                    duration: 500,
                    onComplete: () => {
                        trail.destroy();
                    }
                });
            });
        }
    }

    /**
     * 创建冲击轨迹（冲击波路径上的粒子）
     * @param {number} startX - 起始X
     * @param {number} startY - 起始Y
     * @param {number} angle - 角度（弧度）
     * @param {number} distance - 距离
     * @param {number} color - 粒子颜色
     */
    createImpactTrail(startX, startY, angle, distance, color = 0xffaa00) {
        const particleCount = Math.floor(distance / 15);

        for (let i = 0; i < particleCount; i++) {
            const progress = i / particleCount;
            const x = startX + Math.cos(angle) * distance * progress;
            const y = startY + Math.sin(angle) * distance * progress;

            this.scene.time.delayedCall(i * 20, () => {
                // 粒子沿路径扩散
                const particle = this.scene.add.circle(x, y, 3, color, 0.8);
                particle.setDepth(100);

                // 垂直于路径方向扩散
                const spreadAngle = angle + Math.PI / 2;
                const spreadDistance = (Math.random() - 0.5) * 30;

                const targetX = x + Math.cos(spreadAngle) * spreadDistance;
                const targetY = y + Math.sin(spreadAngle) * spreadDistance;

                this.scene.tweens.add({
                    targets: particle,
                    x: targetX,
                    y: targetY,
                    alpha: 0,
                    duration: 400,
                    onComplete: () => {
                        particle.destroy();
                    }
                });
            });
        }
    }

    /**
     * 销毁粒子系统
     */
    destroy() {
        this.clear();
        console.log('⚔️ 战斗粒子系统已销毁');
    }
}
