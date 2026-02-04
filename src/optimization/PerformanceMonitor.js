/**
 * PerformanceMonitor - 性能监控面板
 *
 * 实时显示游戏性能指标：
 * - FPS监控
 * - 粒子数量统计
 * - 对象池状态
 * - 内存使用估算
 * - Draw Call统计
 * - 自动性能警告
 */

class PerformanceMonitor {
    constructor(scene) {
        this.scene = scene;

        // 配置
        this.config = {
            enabled: true,
            updateInterval: 500, // 更新间隔（ms）
            showGraph: true,     // 显示FPS图表
            warningThreshold: {
                fps: 30,         // FPS警告阈值
                particles: 400,  // 粒子数量警告
                memory: 100      // 内存警告（MB）
            }
        };

        // 统计数据
        this.stats = {
            fps: 60,
            avgFps: 60,
            minFps: 60,
            maxFps: 60,
            frameCount: 0,
            lastUpdateTime: 0,
            fpsHistory: [],
            particleCount: 0,
            drawCalls: 0,
            objectPoolStats: {},
            memoryEstimate: 0
        };

        // UI元素
        this.container = null;
        this.fpsText = null;
        this.particleText = null;
        this.memoryText = null;
        this.poolText = null;
        this.warningText = null;
        this.graphGraphics = null;

        // 警告状态
        this.warnings = {
            fps: false,
            particles: false,
            memory: false
        };

        // 初始化
        this.init();

        console.log('📊 性能监控面板初始化');
    }

    /**
     * 初始化监控面板
     */
    init() {
        this.createUI();

        // 开始更新循环
        this.scene.time.addEvent({
            delay: this.config.updateInterval,
            callback: this.updateStats,
            callbackScope: this,
            loop: true
        });
    }

    /**
     * 创建UI
     */
    createUI() {
        // 主容器（左上角）
        this.container = this.scene.add.container(10, 100);
        this.container.setScrollFactor(0);
        this.container.setDepth(1000);
        this.container.setAlpha(0.9);

        // 背景
        const bg = this.scene.add.rectangle(0, 0, 220, 180, 0x000000, 0.7);
        bg.setOrigin(0, 0);
        this.container.add(bg);

        // 标题
        const title = this.scene.add.text(10, 10, '📊 性能监控', {
            fontFamily: 'Noto Sans SC',
            fontSize: '14px',
            fill: '#ffffff',
            fontStyle: 'bold'
        });
        this.container.add(title);

        // FPS显示
        this.fpsText = this.scene.add.text(10, 35, 'FPS: 60', {
            fontFamily: 'Courier New',
            fontSize: '12px',
            fill: '#48bb78'
        });
        this.container.add(this.fpsText);

        // 粒子数量
        this.particleText = this.scene.add.text(10, 55, 'Particles: 0', {
            fontFamily: 'Courier New',
            fontSize: '12px',
            fill: '#ffffff'
        });
        this.container.add(this.particleText);

        // Draw Calls
        this.drawCallText = this.scene.add.text(10, 75, 'Draw Calls: 0', {
            fontFamily: 'Courier New',
            fontSize: '12px',
            fill: '#ffffff'
        });
        this.container.add(this.drawCallText);

        // 对象池状态
        this.poolText = this.scene.add.text(10, 95, 'Pool: 0/0', {
            fontFamily: 'Courier New',
            fontSize: '12px',
            fill: '#ffffff'
        });
        this.container.add(this.poolText);

        // 内存估算
        this.memoryText = this.scene.add.text(10, 115, 'Memory: ~0 MB', {
            fontFamily: 'Courier New',
            fontSize: '12px',
            fill: '#ffffff'
        });
        this.container.add(this.memoryText);

        // 警告文本
        this.warningText = this.scene.add.text(10, 145, '', {
            fontFamily: 'Noto Sans SC',
            fontSize: '11px',
            fill: '#ff6b6b',
            fontStyle: 'bold'
        });
        this.container.add(this.warningText);

        // FPS图表
        if (this.config.showGraph) {
            this.graphGraphics = this.scene.add.graphics();
            this.graphGraphics.setDepth(1001);
            this.container.add(this.graphGraphics);
        }

        // 默认隐藏（按P键切换）
        this.container.setVisible(false);
    }

    /**
     * 更新统计数据
     */
    updateStats() {
        if (!this.config.enabled) return;

        // 计算FPS
        const now = performance.now();
        const delta = now - this.stats.lastUpdateTime;

        if (delta > 0) {
            const instantFps = Math.round(1000 / delta * this.stats.frameCount);
            this.stats.fps = instantFps;
            this.stats.fpsHistory.push(instantFps);

            // 限制历史记录长度
            if (this.stats.fpsHistory.length > 60) {
                this.stats.fpsHistory.shift();
            }

            // 计算平均/最小/最大FPS
            this.stats.avgFps = Math.round(
                this.stats.fpsHistory.reduce((a, b) => a + b, 0) / this.stats.fpsHistory.length
            );
            this.stats.minFps = Math.min(...this.stats.fpsHistory);
            this.stats.maxFps = Math.max(...this.stats.fpsHistory);
        }

        this.stats.lastUpdateTime = now;
        this.stats.frameCount = 0;

        // 获取粒子数量
        this.updateParticleCount();

        // 获取对象池统计
        this.updateObjectPoolStats();

        // 估算内存使用
        this.estimateMemory();

        // 更新UI
        this.updateUI();

        // 检查警告
        this.checkWarnings();
    }

    /**
     * 更新粒子数量
     */
    updateParticleCount() {
        let count = 0;

        // 从各个系统获取粒子数量
        if (this.scene.combatParticles) {
            count += this.scene.combatParticles.getActiveParticleCount();
        }

        if (this.scene.weatherParticles) {
            // WeatherParticles使用不同的计数方式
            const weather = this.scene.weatherParticles;
            if (weather.particles) {
                if (Array.isArray(weather.particles)) {
                    count += weather.particles.length;
                } else if (weather.particles.getChildren) {
                    count += weather.particles.getChildren().length;
                }
            }
        }

        if (this.scene.ambientParticles) {
            count += this.scene.ambientParticles.particles?.length || 0;
        }

        this.stats.particleCount = count;
    }

    /**
     * 更新对象池统计
     */
    updateObjectPoolStats() {
        if (this.scene.objectPool) {
            this.stats.objectPoolStats = this.scene.objectPool.getStats();
        }
    }

    /**
     * 估算内存使用
     */
    estimateMemory() {
        let estimate = 0;

        // 粒子内存估算（每个粒子约0.5KB）
        estimate += this.stats.particleCount * 0.5;

        // 对象池内存估算
        if (this.stats.objectPoolStats.totals) {
            estimate += this.stats.objectPoolStats.totals.total * 2;
        }

        // 纹理内存（简化估算）
        if (this.scene.textures) {
            const textureList = this.scene.textures.getTextureKeys();
            estimate += textureList.length * 500; // 每个纹理约500KB
        }

        this.stats.memoryEstimate = Math.round(estimate / 1024 * 10) / 10; // 转换为MB
    }

    /**
     * 更新UI显示
     */
    updateUI() {
        // 如果UI未创建，跳过更新
        if (!this.fpsText || !this.particleText) {
            return;
        }

        // FPS颜色根据性能变化
        let fpsColor = '#48bb78'; // 绿色
        if (this.stats.fps < 50) fpsColor = '#f6e05e'; // 黄色
        if (this.stats.fps < 30) fpsColor = '#ff6b6b'; // 红色

        this.fpsText.setText(`FPS: ${this.stats.fps} [${this.stats.avgFps}]`);
        this.fpsText.setFill(fpsColor);

        // 粒子数量
        let particleColor = '#ffffff';
        if (this.stats.particleCount > 300) particleColor = '#f6e05e';
        if (this.stats.particleCount > 500) particleColor = '#ff6b6b';

        this.particleText.setText(`Particles: ${this.stats.particleCount}`);
        this.particleText.setFill(particleColor);

        // Draw Calls
        this.drawCallText.setText(`Draw Calls: ${this.stats.drawCalls}`);

        // 对象池
        const poolStats = this.stats.objectPoolStats.totals || { active: 0, pooled: 0 };
        this.poolText.setText(`Pool: ${poolStats.active}/${poolStats.total || 0}`);

        // 内存
        let memoryColor = '#ffffff';
        if (this.stats.memoryEstimate > 50) memoryColor = '#f6e05e';
        if (this.stats.memoryEstimate > 100) memoryColor = '#ff6b6b';

        this.memoryText.setText(`Memory: ~${this.stats.memoryEstimate} MB`);
        this.memoryText.setFill(memoryColor);

        // 绘制FPS图表
        if (this.config.showGraph && this.graphGraphics) {
            this.drawFPSGraph();
        }
    }

    /**
     * 绘制FPS图表
     */
    drawFPSGraph() {
        this.graphGraphics.clear();

        const graphX = 120;
        const graphY = 35;
        const graphWidth = 90;
        const graphHeight = 40;

        // 背景
        this.graphGraphics.fillStyle(0x000000, 0.5);
        this.graphGraphics.fillRect(graphX, graphY, graphWidth, graphHeight);

        // 网格线
        this.graphGraphics.lineStyle(1, 0x333333, 0.5);
        this.graphGraphics.beginPath();
        // 30 FPS线
        const y30 = graphY + graphHeight - (30 / 60) * graphHeight;
        this.graphGraphics.moveTo(graphX, y30);
        this.graphGraphics.lineTo(graphX + graphWidth, y30);
        // 60 FPS线
        const y60 = graphY + graphHeight - (60 / 60) * graphHeight;
        this.graphGraphics.moveTo(graphX, y60);
        this.graphGraphics.lineTo(graphX + graphWidth, y60);
        this.graphGraphics.strokePath();

        // FPS曲线
        if (this.stats.fpsHistory.length > 1) {
            this.graphGraphics.lineStyle(2, 0x48bb78, 1);
            this.graphGraphics.beginPath();

            const stepX = graphWidth / (this.stats.fpsHistory.length - 1);

            this.stats.fpsHistory.forEach((fps, index) => {
                const x = graphX + index * stepX;
                const normalizedFps = Math.min(fps, 60) / 60;
                const y = graphY + graphHeight - normalizedFps * graphHeight;

                if (index === 0) {
                    this.graphGraphics.moveTo(x, y);
                } else {
                    this.graphGraphics.lineTo(x, y);
                }
            });

            this.graphGraphics.strokePath();
        }
    }

    /**
     * 检查性能警告
     */
    checkWarnings() {
        const warnings = [];

        // FPS警告
        if (this.stats.fps < this.config.warningThreshold.fps) {
            if (!this.warnings.fps) {
                this.warnings.fps = true;
                console.warn(`⚠️ 性能警告: FPS过低 (${this.stats.fps})`);

                // 自动降低特效质量
                this.autoOptimize();
            }
            warnings.push('FPS低');
        } else {
            this.warnings.fps = false;
        }

        // 粒子数量警告
        if (this.stats.particleCount > this.config.warningThreshold.particles) {
            if (!this.warnings.particles) {
                this.warnings.particles = true;
                console.warn(`⚠️ 性能警告: 粒子数量过多 (${this.stats.particleCount})`);
            }
            warnings.push('粒子过多');
        } else {
            this.warnings.particles = false;
        }

        // 内存警告
        if (this.stats.memoryEstimate > this.config.warningThreshold.memory) {
            if (!this.warnings.memory) {
                this.warnings.memory = true;
                console.warn(`⚠️ 性能警告: 内存使用过高 (${this.stats.memoryEstimate}MB)`);
            }
            warnings.push('内存高');
        } else {
            this.warnings.memory = false;
        }

        // 更新警告文本
        if (warnings.length > 0) {
            this.warningText.setText(`⚠️ ${warnings.join(', ')}`);
            this.warningText.setVisible(true);
        } else {
            this.warningText.setVisible(false);
        }
    }

    /**
     * 自动优化（当性能不足时）
     */
    autoOptimize() {
        // 启用粒子LOD紧急模式
        if (this.scene.combatParticles && this.scene.combatParticles.lod) {
            this.scene.combatParticles.lod.enableEmergencyMode();
        }

        // 减少天气粒子
        if (this.scene.weatherParticles) {
            // 可以在这里调整天气强度
        }

        // 显示优化提示
        if (this.scene.showFloatingText) {
            this.scene.showFloatingText(
                this.scene.player?.x || 400,
                this.scene.player?.y || 300,
                '自动优化特效质量',
                '#f6e05e',
                2000
            );
        }
    }

    /**
     * 切换显示/隐藏
     */
    toggle() {
        if (this.container) {
            const newVisible = !this.container.visible;
            this.container.setVisible(newVisible);

            if (newVisible) {
                console.log('📊 性能监控面板已显示 (按P键隐藏)');
            } else {
                console.log('📊 性能监控面板已隐藏 (按P键显示)');
            }
        }
    }

    /**
     * 显示面板
     */
    show() {
        if (this.container) {
            this.container.setVisible(true);
        }
    }

    /**
     * 隐藏面板
     */
    hide() {
        if (this.container) {
            this.container.setVisible(false);
        }
    }

    /**
     * 设置更新间隔
     */
    setUpdateInterval(interval) {
        this.config.updateInterval = interval;
    }

    /**
     * 记录帧（每帧调用）
     */
    recordFrame() {
        this.stats.frameCount++;
    }

    /**
     * 记录Draw Call
     */
    recordDrawCall(count = 1) {
        this.stats.drawCalls += count;
    }

    /**
     * 重置Draw Call计数
     */
    resetDrawCalls() {
        this.stats.drawCalls = 0;
    }

    /**
     * 获取性能报告
     */
    getReport() {
        return {
            fps: {
                current: this.stats.fps,
                average: this.stats.avgFps,
                min: this.stats.minFps,
                max: this.stats.maxFps
            },
            particles: this.stats.particleCount,
            drawCalls: this.stats.drawCalls,
            memory: this.stats.memoryEstimate,
            objectPool: this.stats.objectPoolStats,
            warnings: { ...this.warnings }
        };
    }

    /**
     * 销毁监控面板
     */
    destroy() {
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }

        console.log('📊 性能监控面板已销毁');
    }
}
