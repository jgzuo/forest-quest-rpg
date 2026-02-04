/**
 * ParticleLOD - 粒子LOD（细节层次）系统
 *
 * 根据距离、重要性、屏幕位置动态调整粒子质量：
 * - 远距离粒子：简化/禁用
 * - 近处粒子：完整特效
 * - 屏幕外粒子：暂停更新
 * - 重要性分级：关键特效优先保留
 */

class ParticleLOD {
    constructor(scene) {
        this.scene = scene;
        this.camera = scene.cameras.main;

        // LOD配置
        this.config = {
            // 距离层级（像素）
            distance: {
                near: 200,      // 近距离：完整特效
                medium: 400,    // 中距离：简化特效
                far: 600        // 远距离：最小特效/禁用
            },
            // 质量倍数
            quality: {
                near: 1.0,      // 100%粒子
                medium: 0.6,    // 60%粒子
                far: 0.3,       // 30%粒子
                offscreen: 0    // 0%粒子（暂停）
            },
            // 更新频率（每N帧更新一次）
            updateRate: {
                near: 1,        // 每帧更新
                medium: 2,      // 每2帧更新
                far: 3,         // 每3帧更新
                offscreen: 10   // 每10帧更新（仅位置检查）
            },
            // 粒子类型重要性（0-10）
            importance: {
                blood: 5,       // 血液中等重要
                spark: 8,       // 火花重要（反馈）
                magicTrail: 4,  // 魔法残影较低
                energy: 7,      // 能量重要
                wind: 3,        // 风痕较低
                crack: 2,       // 裂痕最低
                crit: 10,       // 暴击最重要
                boss: 10        // Boss特效最重要
            }
        };

        // 统计信息
        this.stats = {
            totalParticles: 0,
            activeParticles: 0,
            culledParticles: 0,
            simplifiedParticles: 0,
            avgUpdateRate: 1
        };

        // 帧计数器
        this.frameCount = 0;

        console.log('📊 粒子LOD系统初始化');
    }

    /**
     * 计算粒子质量等级
     * @param {number} x - 粒子X坐标
     * @param {number} y - 粒子Y坐标
     * @param {string} type - 粒子类型
     * @returns {Object} LOD信息 {quality, updateRate, shouldRender}
     */
    calculateLOD(x, y, type) {
        // 检查是否在屏幕内
        const cameraView = this.camera.worldView;
        const margin = 100; // 边界余量

        const isOnScreen = (
            x >= cameraView.x - margin &&
            x <= cameraView.right + margin &&
            y >= cameraView.y - margin &&
            y <= cameraView.bottom + margin
        );

        // 屏幕外：最低更新频率
        if (!isOnScreen) {
            return {
                quality: 0,
                updateRate: this.config.updateRate.offscreen,
                shouldRender: false,
                level: 'offscreen'
            };
        }

        // 计算到屏幕中心的距离
        const centerX = this.camera.midPoint.x;
        const centerY = this.camera.midPoint.y;
        const distance = Phaser.Math.Distance.Between(x, y, centerX, centerY);

        // 获取重要性
        const importance = this.config.importance[type] || 5;

        // 根据距离和重要性确定LOD等级
        let level, quality, updateRate;

        if (distance <= this.config.distance.near) {
            // 近距离：完整质量
            level = 'near';
            quality = this.config.quality.near;
            updateRate = this.config.updateRate.near;
        } else if (distance <= this.config.distance.medium) {
            // 中距离：根据重要性调整
            level = 'medium';
            const importanceFactor = importance / 10;
            quality = this.config.quality.medium * (0.5 + importanceFactor * 0.5);
            updateRate = this.config.updateRate.medium;
        } else if (distance <= this.config.distance.far) {
            // 远距离：进一步简化
            level = 'far';
            const importanceFactor = importance / 10;
            quality = this.config.quality.far * importanceFactor;
            updateRate = this.config.updateRate.far;

            // 低重要性粒子远距离禁用
            if (importance < 4) {
                quality = 0;
                shouldRender = false;
            }
        } else {
            // 超远距离：只有最高重要性粒子
            level = 'extreme';
            quality = importance >= 9 ? 0.1 : 0;
            updateRate = this.config.updateRate.far;
        }

        return {
            quality: Math.max(0, Math.min(1, quality)),
            updateRate: Math.max(1, Math.floor(updateRate)),
            shouldRender: quality > 0,
            level,
            distance,
            importance
        };
    }

    /**
     * 检查是否应该更新粒子
     * @param {Object} particle - 粒子对象
     * @returns {boolean} 是否应该更新
     */
    shouldUpdateParticle(particle) {
        // 计算LOD
        const lod = this.calculateLOD(
            particle.sprite.x,
            particle.sprite.y,
            particle.type
        );

        // 存储LOD信息供后续使用
        particle.lod = lod;

        // 检查更新频率
        const shouldUpdate = this.frameCount % lod.updateRate === 0;

        return shouldUpdate && lod.shouldRender;
    }

    /**
     * 应用LOD到粒子数量
     * @param {number} requestedCount - 请求的粒子数量
     * @param {Object} lod - LOD信息
     * @returns {number} 实际创建的粒子数量
     */
    applyParticleCountLOD(requestedCount, lod) {
        if (!lod.shouldRender) {
            return 0;
        }

        return Math.floor(requestedCount * lod.quality);
    }

    /**
     * 批量更新粒子（带LOD）
     * @param {Array} particles - 粒子数组
     * @param {number} delta - 时间增量
     * @param {Function} updateFn - 更新函数
     */
    updateParticlesWithLOD(particles, delta, updateFn) {
        this.frameCount++;

        let activeCount = 0;
        let culledCount = 0;
        let simplifiedCount = 0;

        const dt = delta / 1000;

        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];

            if (!particle.sprite || !particle.sprite.active) {
                particles.splice(i, 1);
                continue;
            }

            // 检查是否应该更新（LOD）
            if (!this.shouldUpdateParticle(particle)) {
                // 如果完全不可见，暂停渲染
                if (particle.lod && !particle.lod.shouldRender) {
                    particle.sprite.setVisible(false);
                    culledCount++;
                } else {
                    // 可见但跳过更新
                    simplifiedCount++;
                }
                continue;
            }

            // 恢复可见性
            particle.sprite.setVisible(true);

            // 执行更新
            particle.age += delta;

            // 检查粒子是否过期
            if (particle.age >= particle.lifetime) {
                particle.sprite.destroy();
                particles.splice(i, 1);
                continue;
            }

            // 应用LOD到透明度（远距离粒子更快淡出）
            let alpha = 1 - (particle.age / particle.lifetime);
            if (particle.lod && particle.lod.quality < 1) {
                alpha *= particle.lod.quality;
            }
            particle.sprite.setAlpha(alpha);

            // 执行自定义更新
            if (updateFn) {
                updateFn(particle, dt);
            } else {
                // 默认更新
                particle.sprite.x += particle.vx * dt;
                particle.sprite.y += particle.vy * dt;
                particle.vy += particle.gravity * dt;
            }

            activeCount++;
        }

        // 更新统计
        this.stats.totalParticles = particles.length;
        this.stats.activeParticles = activeCount;
        this.stats.culledParticles = culledCount;
        this.stats.simplifiedParticles = simplifiedCount;
    }

    /**
     * 智能粒子创建（自动应用LOD）
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} count - 请求数量
     * @param {string} type - 粒子类型
     * @returns {number} 实际创建数量
     */
    getSmartParticleCount(x, y, count, type) {
        const lod = this.calculateLOD(x, y, type);
        return this.applyParticleCountLOD(count, lod);
    }

    /**
     * 设置LOD距离阈值
     * @param {string} level - 等级（near/medium/far）
     * @param {number} distance - 距离值
     */
    setDistanceThreshold(level, distance) {
        if (this.config.distance[level] !== undefined) {
            this.config.distance[level] = distance;
        }
    }

    /**
     * 设置质量倍数
     * @param {string} level - 等级
     * @param {number} quality - 质量值（0-1）
     */
    setQualityMultiplier(level, quality) {
        if (this.config.quality[level] !== undefined) {
            this.config.quality[level] = Math.max(0, Math.min(1, quality));
        }
    }

    /**
     * 获取性能建议
     * @returns {Object} 建议信息
     */
    getPerformanceAdvice() {
        const total = this.stats.totalParticles;
        const culled = this.stats.culledParticles;
        const culledPercent = total > 0 ? (culled / total * 100).toFixed(1) : 0;

        let advice = '良好';
        let color = '#48bb78';

        if (total > 300) {
            advice = '粒子过多，建议降低特效质量';
            color = '#ed8936';
        } else if (total > 500) {
            advice = '严重过载，强制降低特效质量';
            color = '#f56565';
        } else if (culledPercent > 50) {
            advice = '大量粒子被剔除，当前设置合理';
            color = '#4299e1';
        }

        return {
            totalParticles: total,
            activeParticles: this.stats.activeParticles,
            culledPercent: culledPercent,
            advice,
            color
        };
    }

    /**
     * 紧急性能模式（当FPS过低时调用）
     */
    enableEmergencyMode() {
        console.warn('🚨 粒子LOD进入紧急模式，大幅降低特效质量');

        // 大幅降低所有质量设置
        this.config.quality.near = 0.7;
        this.config.quality.medium = 0.3;
        this.config.quality.far = 0.1;

        // 增加更新间隔
        this.config.updateRate.medium = 3;
        this.config.updateRate.far = 5;
    }

    /**
     * 恢复正常模式
     */
    disableEmergencyMode() {
        console.log('✅ 粒子LOD恢复正常模式');

        this.config.quality.near = 1.0;
        this.config.quality.medium = 0.6;
        this.config.quality.far = 0.3;

        this.config.updateRate.medium = 2;
        this.config.updateRate.far = 3;
    }

    /**
     * 每帧更新
     * @param {number} time - 当前时间
     * @param {number} delta - 时间增量
     */
    update(time, delta) {
        // 可以在这里添加自动LOD调整逻辑
        // 根据当前FPS动态调整质量
    }

    /**
     * 获取统计信息
     */
    getStats() {
        return { ...this.stats };
    }

    /**
     * 销毁LOD系统
     */
    destroy() {
        console.log('📊 粒子LOD系统已销毁');
    }
}
