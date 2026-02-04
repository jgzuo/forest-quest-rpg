/**
 * CombatCameraSystem - 战斗相机管理系统
 *
 * 为战斗系统提供完整的相机特效支持：
 * - 相机震动（攻击命中、暴击）
 * - 相机缩放（大招、特写）
 * - 慢动作效果（完美格挡、终极技能）
 * - 相机推拉（Boss击杀演出）
 * - 连击动态相机（晃动、缩放）
 * - 暴击特写（冻结、缩放）
 *
 * 使用 Phaser.Camera 内置方法，支持特效队列管理
 */

class CombatCameraSystem {
    constructor(scene) {
        this.scene = scene;

        // 相机引用
        this.camera = scene.cameras.main;

        // 特效队列（用于链式执行）
        this.effectQueue = [];
        this.isProcessingQueue = false;

        // 当前状态
        this.currentZoom = 1;
        this.currentShake = 0;
        this.timeScale = 1;

        // 配置
        this.config = {
            shake: {
                normal: { intensity: 0.005, duration: 100 },
                crit: { intensity: 0.015, duration: 150 },
                heavy: { intensity: 0.025, duration: 200 },
                boss: { intensity: 0.03, duration: 300 }
            },
            zoom: {
                in: { scale: 1.2, duration: 300 },
                out: { scale: 1.0, duration: 300 },
                combo: { scale: 1.1, duration: 200 },
                crit: { scale: 1.2, duration: 150 }
            },
            slowMotion: {
                ultimate: { factor: 0.3, duration: 500 },
                parry: { factor: 0.5, duration: 200 },
                bossDeath: { factor: 0.3, duration: 2000 }
            }
        };

        // 防抖/节流
        this.lastShakeTime = 0;
        this.shakeCooldown = 100; // 毫秒

        console.log('🎬 战斗相机管理系统初始化');
    }

    /**
     * 相机震动
     * @param {number} intensity - 震动强度 (0-1)
     * @param {number} duration - 震动时长（毫秒）
     * @param {boolean} force - 是否强制执行（忽略冷却）
     */
    shake(intensity = 0.01, duration = 200, force = false) {
        // 节流检查
        const now = this.scene.time.now;
        if (!force && now - this.lastShakeTime < this.shakeCooldown) {
            return;
        }
        this.lastShakeTime = now;

        // 执行震动
        this.camera.shake(duration, intensity);

        // 记录状态
        this.currentShake = intensity;
        this.scene.time.delayedCall(duration, () => {
            this.currentShake = 0;
        });
    }

    /**
     * 相机缩放
     * @param {number} scale - 缩放倍数
     * @param {number} duration - 缩放时长（毫秒）
     * @param {number} x - 缩放中心X（可选）
     * @param {number} y - 缩放中心Y（可选）
     */
    zoom(scale, duration = 300, x = null, y = null) {
        this.camera.zoomTo(scale, duration, x, y, false, (progress, zoom) => {
            // 缩放完成回调
            if (progress === 1) {
                this.currentZoom = zoom;
            }
        });
    }

    /**
     * 慢动作效果
     * @param {number} factor - 时间因子 (0.1-1.0, 1.0 = 正常速度)
     * @param {number} duration - 持续时长（毫秒）
     */
    slowMotion(factor = 0.5, duration = 500) {
        const originalTimeScale = this.scene.time.timeScale;

        // 应用慢动作
        this.scene.time.timeScale = factor;
        this.timeScale = factor;

        // 恢复正常速度
        this.scene.time.delayedCall(duration, () => {
            this.scene.time.timeScale = originalTimeScale;
            this.timeScale = 1;
        });
    }

    /**
     * 相机推拉
     * @param {number} offsetX - X偏移量
     * @param {number} offsetY - Y偏移量
     * @param {number} duration - 移动时长（毫秒）
     */
    push(offsetX, offsetY, duration = 300) {
        const targetX = this.camera.scrollX + offsetX;
        const targetY = this.camera.scrollY + offsetY;

        this.camera.pan(targetX, targetY, duration, 'Power2', true);
    }

    /**
     * 聚焦到目标
     * @param {object} target - 目标对象（必须有 x, y 属性）
     * @param {number} duration - 移动时长（毫秒）
     * @param {number} zoom - 缩放倍数（可选）
     */
    focusOn(target, duration = 500, zoom = null) {
        if (!target || !target.x || !target.y) {
            console.warn('无效的聚焦目标');
            return;
        }

        const centerX = this.camera.midPoint.x;
        const centerY = this.camera.midPoint.y;

        // 计算目标在世界坐标中的位置
        const targetWorldX = target.x - centerX;
        const targetWorldY = target.y - centerY;

        // 移动相机
        this.camera.pan(targetWorldX, targetWorldY, duration, 'Power2', true);

        // 如果指定了缩放
        if (zoom !== null) {
            this.zoom(zoom, duration, target.x, target.y);
        }
    }

    /**
     * 添加特效到队列
     * @param {Function} effect - 特效函数
     * @param {number} delay - 延迟时间（毫秒）
     */
    addToQueue(effect, delay = 0) {
        this.effectQueue.push({ effect, delay });
        this.processQueue();
    }

    /**
     * 处理特效队列
     */
    async processQueue() {
        if (this.isProcessingQueue || this.effectQueue.length === 0) {
            return;
        }

        this.isProcessingQueue = true;

        while (this.effectQueue.length > 0) {
            const { effect, delay } = this.effectQueue.shift();

            if (delay > 0) {
                await new Promise(resolve => {
                    this.scene.time.delayedCall(delay, resolve);
                });
            }

            try {
                await effect();
            } catch (error) {
                console.error('队列特效执行失败:', error);
            }
        }

        this.isProcessingQueue = false;
    }

    /**
     * 攻击命中震动（普通攻击）
     */
    onHitNormal() {
        this.shake(this.config.shake.normal.intensity, this.config.shake.normal.duration);
    }

    /**
     * 攻击命中震动（暴击）
     */
    onHitCrit() {
        const config = this.config.shake.crit;

        // 震动 + 屏幕闪光
        this.shake(config.intensity, config.duration);
        this.camera.flash(100, 255, 255, 255, false);

        // 相机快速缩放
        this.zoom(this.config.zoom.crit.scale, this.config.zoom.crit.duration);
    }

    /**
     * 攻击命中震动（重击）
     */
    onHitHeavy() {
        const config = this.config.shake.heavy;
        this.shake(config.intensity, config.duration);
    }

    /**
     * 大招慢动作效果
     */
    onUltimateCast() {
        const config = this.config.slowMotion.ultimate;

        // 慢动作 + 聚焦玩家
        this.slowMotion(config.factor, config.duration);

        if (this.scene.player) {
            this.focusOn(this.scene.player, 200, 1.1);
        }
    }

    /**
     * 完美格挡效果
     */
    onPerfectParry() {
        const config = this.config.slowMotion.parry;

        // 短暂慢动作 + 屏幕闪光
        this.slowMotion(config.factor, config.duration);
        this.camera.flash(50, 200, 200, 255, false);
    }

    /**
     * Boss击杀演出
     * @param {object} boss - Boss对象
     */
    onBossDeath(boss) {
        if (!boss) return;

        const x = boss.x;
        const y = boss.y;

        // 1. 慢动作
        this.slowMotion(this.config.slowMotion.bossDeath.factor, 500);

        // 2. 缩放到Boss
        this.focusOn(boss, 1000, 2.0);

        // 3. 环绕相机（360度）
        this.scene.time.delayedCall(1000, () => {
            // 简化版环绕：快速平移
            this.push(100, 0, 500);
            this.scene.time.delayedCall(500, () => {
                this.push(-200, 0, 500);
                this.scene.time.delayedCall(500, () => {
                    this.push(100, 0, 500);
                });
            });
        });

        // 4. 最终缩放还原
        this.scene.time.delayedCall(3000, () => {
            this.zoom(1.0, 1000);
        });
    }

    /**
     * 连击动态相机
     * @param {number} comboCount - 连击数
     */
    onComboUpdate(comboCount) {
        // 5+ 连击：轻微晃动
        if (comboCount >= 5 && comboCount < 10) {
            this.shake(0.002, 0);
        }
        // 10+ 连击：中等晃动
        else if (comboCount >= 10 && comboCount < 15) {
            this.shake(0.005, 0);
        }
        // 15+ 连击：缩放 + 晃动
        else if (comboCount >= 15 && comboCount < 20) {
            this.zoom(1.1, 200);
            this.shake(0.005, 0);
        }
        // 20+ 连击：屏幕脉冲
        else if (comboCount >= 20) {
            // 使用 tween 实现脉冲效果
            this.scene.tweens.add({
                targets: this.camera,
                zoom: 1.05,
                duration: 100,
                yoyo: true,
                repeat: 2
            });
            this.shake(0.008, 0);
        }
    }

    /**
     * 连击重置（恢复相机）
     */
    onComboReset() {
        this.zoom(1.0, 300);
        this.currentShake = 0;
    }

    /**
     * 暴击特写
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {boolean} isKillingBlow - 是否击杀
     */
    onCritHit(x, y, isKillingBlow = false) {
        // 1. 短暂冻结（10ms）
        this.scene.time.timeScale = 0.1;
        this.scene.time.delayedCall(10, () => {
            this.scene.time.timeScale = 1;
        });

        // 2. 快速缩放
        const config = this.config.zoom.crit;
        this.zoom(config.scale, config.duration, x, y);

        // 3. 屏幕闪光
        this.camera.flash(100, 255, 255, 255, false);

        // 4. 如果是击杀，添加X射线效果
        if (isKillingBlow) {
            this.scene.tweens.add({
                targets: this.camera,
                zoom: 1.3,
                duration: 100,
                yoyo: true,
                repeat: 1
            });
        }
    }

    /**
     * 低血量特效
     * @param {number} hpPercent - 血量百分比 (0-100)
     */
    onLowHealth(hpPercent) {
        if (hpPercent < 30) {
            // 脉冲效果（基于血量越低越快）
            const pulseSpeed = 1000 - (30 - hpPercent) * 30;
            const intensity = (30 - hpPercent) / 30 * 0.01;

            this.scene.time.addEvent({
                delay: pulseSpeed,
                loop: true,
                callback: () => {
                    this.shake(intensity, 200);
                }
            });
        }
    }

    /**
     * 阶段转换特效
     * @param {number} phaseNumber - 阶段数字
     */
    onPhaseTransition(phaseNumber) {
        // 震动 + 闪光
        this.shake(0.02, 500);
        this.camera.flash(300, 255, 255, 255, false);

        // 短暂慢动作
        this.slowMotion(0.5, 300);
    }

    /**
     * 重置相机状态
     */
    reset() {
        // 重置缩放
        this.zoom(1.0, 300);

        // 重置时间缩放
        this.scene.time.timeScale = 1;

        // 清空队列
        this.effectQueue = [];
        this.isProcessingQueue = false;
    }

    /**
     * 获取统计信息
     */
    getStats() {
        return {
            currentZoom: this.currentZoom,
            currentShake: this.currentShake,
            timeScale: this.timeScale,
            queueLength: this.effectQueue.length,
            isProcessing: this.isProcessingQueue
        };
    }

    /**
     * 清理资源
     */
    destroy() {
        this.reset();
        console.log('🎬 战斗相机管理系统已销毁');
    }
}
