/**
 * CombatDataAnalyzer - 战斗数据分析系统
 *
 * Phase 7: 深度战斗数据分析
 * - US-032: 实时DPS计算（已由CombatStatsPanel实现）
 * - US-033: 伤害来源统计（按元素/技能分类）
 * - US-034: 命中率暴击率追踪（已由CombatStatsPanel实现）
 * - US-035: 战斗历史记录（详细日志）
 * - US-036: 性能数据可视化（FPS、粒子数量、内存）
 */
class CombatDataAnalyzer {
    constructor(scene) {
        this.scene = scene;

        // ============ US-033: 伤害来源统计 ============
        this.damageSources = {
            // 按元素类型分类
            elements: {
                fire: { damage: 0, hits: 0, color: 0xff4500 },
                ice: { damage: 0, hits: 0, color: 0x66ccff },
                lightning: { damage: 0, hits: 0, color: 0x9966ff },
                poison: { damage: 0, hits: 0, color: 0x33cc33 },
                light: { damage: 0, hits: 0, color: 0xffff99 },
                shadow: { damage: 0, hits: 0, color: 0x660066 },
                earth: { damage: 0, hits: 0, color: 0x8b4513 },
                storm: { damage: 0, hits: 0, color: 0x87ceeb }
            },
            // 按技能分类
            skills: {
                basic: { damage: 0, hits: 0, name: '普攻' },
                whirlwind: { damage: 0, hits: 0, name: '旋风斩' },
                charge: { damage: 0, hits: 0, name: '冲锋' },
                heal: { damage: 0, hits: 0, name: '治疗' },
                ultimate: { damage: 0, hits: 0, name: '终极技' }
            },
            // 按装备特效分类
            equipment: {
                weapon: { damage: 0, hits: 0, name: '武器' },
                armor: { damage: 0, hits: 0, name: '护甲' },
                accessory: { damage: 0, hits: 0, name: '饰品' }
            }
        };

        // ============ US-035: 战斗历史记录 ============
        this.combatLog = [];
        this.maxLogEntries = 100; // 最多保存100条记录
        this.sessionStartTime = this.scene.time.now;

        // ============ US-036: 性能数据可视化 ============
        this.performanceData = {
            fps: [],
            particleCount: [],
            memoryUsage: [],
            maxSamples: 60 // 保存60个样本（约60秒）
        };
        this.lastPerfUpdate = 0;
        this.perfUpdateInterval = 1000; // 每秒更新一次

        // UI元素
        this.analyzerPanel = null;
        this.damageChart = null;
        this.logPanel = null;
        this.perfPanel = null;
        this.isVisible = false;

        console.log('📊 战斗数据分析系统初始化');
    }

    // ==================== US-033: 伤害来源统计 ====================

    /**
     * 记录伤害来源
     * @param {string} source - 来源类型（element/skill/equipment）
     * @param {string} subtype - 子类型（fire/whirlwind等）
     * @param {number} damage - 伤害值
     */
    recordDamage(source, subtype, damage) {
        const category = this.damageSources[source];
        if (!category || !category[subtype]) return;

        category[subtype].damage += damage;
        category[subtype].hits += 1;

        // 添加到战斗日志
        this.addCombatLogEntry('damage', {
            source: source,
            subtype: subtype,
            damage: damage,
            time: this.scene.time.now
        });

        // 更新图表
        if (this.isVisible) {
            this.updateDamageChart();
        }
    }

    /**
     * 获取伤害来源统计
     * @param {string} source - 来源类型
     */
    getDamageStats(source) {
        return this.damageSources[source] || {};
    }

    /**
     * 获取主要伤害来源（排序）
     * @param {string} source - 来源类型
     * @param {number} topN - 返回前N个
     */
    getTopDamageSources(source, topN = 3) {
        const category = this.damageSources[source];
        if (!category) return [];

        return Object.entries(category)
            .map(([key, data]) => ({ key, ...data }))
            .sort((a, b) => b.damage - a.damage)
            .slice(0, topN);
    }

    // ==================== US-035: 战斗历史记录 ====================

    /**
     * 添加战斗日志条目
     * @param {string} type - 日志类型（damage/kill/combo/skill/etc）
     * @param {object} data - 日志数据
     */
    addCombatLogEntry(type, data) {
        const entry = {
            id: this.combatLog.length,
            type: type,
            data: data,
            timestamp: this.scene.time.now,
            formattedTime: this.formatTime(this.scene.time.now - this.sessionStartTime)
        };

        this.combatLog.push(entry);

        // 限制日志长度
        if (this.combatLog.length > this.maxLogEntries) {
            this.combatLog.shift();
        }

        // 更新日志面板
        if (this.isVisible && this.logPanel) {
            this.updateLogPanel();
        }
    }

    /**
     * 格式化时间（毫秒 → MM:SS）
     */
    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * 获取战斗日志
     * @param {number} count - 返回最近N条
     * @param {string} type - 过滤类型（可选）
     */
    getCombatLog(count = 10, type = null) {
        let entries = this.combatLog;

        if (type) {
            entries = entries.filter(e => e.type === type);
        }

        return entries.slice(-count);
    }

    /**
     * 导出战斗日志为JSON
     */
    exportCombatLog() {
        return JSON.stringify(this.combatLog, null, 2);
    }

    // ==================== US-036: 性能数据可视化 ====================

    /**
     * 记录性能数据
     * @param {number} fps - 当前FPS
     * @param {number} particleCount - 粒子数量
     * @param {number} memory - 内存使用（MB）
     */
    recordPerformance(fps, particleCount, memory) {
        const now = this.scene.time.now;

        if (now - this.lastPerfUpdate < this.perfUpdateInterval) {
            return;
        }

        this.lastPerfUpdate = now;

        // 记录数据
        this.performanceData.fps.push(fps);
        this.performanceData.particleCount.push(particleCount);
        this.performanceData.memoryUsage.push(memory);

        // 限制样本数
        if (this.performanceData.fps.length > this.performanceData.maxSamples) {
            this.performanceData.fps.shift();
            this.performanceData.particleCount.shift();
            this.performanceData.memoryUsage.shift();
        }

        // 更新性能面板
        if (this.isVisible && this.perfPanel) {
            this.updatePerfPanel();
        }
    }

    /**
     * 获取平均FPS
     */
    getAverageFPS() {
        if (this.performanceData.fps.length === 0) return 0;
        const sum = this.performanceData.fps.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.performanceData.fps.length);
    }

    /**
     * 获取平均粒子数量
     */
    getAverageParticleCount() {
        if (this.performanceData.particleCount.length === 0) return 0;
        const sum = this.performanceData.particleCount.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.performanceData.particleCount.length);
    }

    // ==================== UI 创建与更新 ====================

    /**
     * 创建分析面板
     */
    createAnalyzerPanel() {
        if (this.analyzerPanel) return;

        // 主容器（右上角）
        this.analyzerPanel = this.scene.add.container(580, 20);
        this.analyzerPanel.setScrollFactor(0);
        this.analyzerPanel.setDepth(200);
        this.analyzerPanel.setAlpha(0);

        // 1. 伤害来源面板
        this.createDamageChart();

        // 2. 战斗日志面板
        this.createLogPanel();

        // 3. 性能数据面板
        this.createPerfPanel();

        console.log('📊 分析面板已创建');
    }

    /**
     * 创建伤害来源图表
     */
    createDamageChart() {
        const bg = this.scene.add.graphics();
        bg.setDepth(0);
        bg.fillStyle(0x000000, 0.7);
        bg.fillRoundedRect(0, 0, 200, 180, 10);
        bg.lineStyle(2, 0x4facfe, 0.8);
        bg.strokeRoundedRect(0, 0, 200, 180, 10);
        this.analyzerPanel.add(bg);

        // 标题
        const title = this.scene.add.text(100, 15, '📊 伤害来源', {
            fontFamily: 'Noto Sans SC',
            fontSize: 'bold 14px',
            fill: '#4facfe',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        this.analyzerPanel.add(title);

        this.damageChart = {
            bg: bg,
            bars: [],
            labels: []
        };

        this.updateDamageChart();
    }

    /**
     * 更新伤害来源图表
     */
    updateDamageChart() {
        if (!this.damageChart) return;

        // 清除旧的条形图
        this.damageChart.bars.forEach(bar => bar.destroy());
        this.damageChart.labels.forEach(label => label.destroy());
        this.damageChart.bars = [];
        this.damageChart.labels = [];

        // 获取元素伤害排行
        const topElements = this.getTopDamageSources('elements', 5);
        const maxDamage = Math.max(...topElements.map(e => e.damage), 1);

        let y = 50;
        topElements.forEach((item, index) => {
            // 条形图
            const barWidth = 120;
            const barHeight = 15;
            const fillWidth = (item.damage / maxDamage) * barWidth;

            const barBg = this.scene.add.graphics();
            barBg.setDepth(1);
            barBg.fillStyle(0x333333, 0.8);
            barBg.fillRoundedRect(40, y, barWidth, barHeight, 3);
            this.analyzerPanel.add(barBg);
            this.damageChart.bars.push(barBg);

            const barFill = this.scene.add.graphics();
            barFill.setDepth(2);
            barFill.fillStyle(item.color, 0.9);
            barFill.fillRoundedRect(40, y, fillWidth, barHeight, 3);
            this.analyzerPanel.add(barFill);
            this.damageChart.bars.push(barFill);

            // 标签
            const name = this.scene.add.text(15, y + 7, this.getElementName(item.key), {
                fontFamily: 'Noto Sans SC',
                fontSize: '10px',
                fill: '#ffffff'
            }).setOrigin(1, 0.5);
            this.analyzerPanel.add(name);
            this.damageChart.labels.push(name);

            // 伤害值
            const damage = this.scene.add.text(165, y + 7, Math.round(item.damage).toString(), {
                fontFamily: 'Arial',
                fontSize: '10px',
                fill: '#ffd700'
            }).setOrigin(0, 0.5);
            this.analyzerPanel.add(damage);
            this.damageChart.labels.push(damage);

            y += 25;
        });
    }

    /**
     * 获取元素中文名
     */
    getElementName(key) {
        const names = {
            fire: '火',
            ice: '冰',
            lightning: '雷',
            poison: '毒',
            light: '光',
            shadow: '暗',
            earth: '地',
            storm: '风'
        };
        return names[key] || key;
    }

    /**
     * 创建战斗日志面板
     */
    createLogPanel() {
        const bg = this.scene.add.graphics();
        bg.setDepth(0);
        bg.fillStyle(0x000000, 0.7);
        bg.fillRoundedRect(0, 190, 200, 140, 10);
        bg.lineStyle(2, 0x68d391, 0.8);
        bg.strokeRoundedRect(0, 190, 200, 140, 10);
        this.analyzerPanel.add(bg);

        // 标题
        const title = this.scene.add.text(100, 205, '📜 战斗日志', {
            fontFamily: 'Noto Sans SC',
            fontSize: 'bold 14px',
            fill: '#68d391',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        this.analyzerPanel.add(title);

        this.logPanel = {
            bg: bg,
            entries: []
        };

        this.updateLogPanel();
    }

    /**
     * 更新战斗日志面板
     */
    updateLogPanel() {
        if (!this.logPanel) return;

        // 清除旧的日志条目
        this.logPanel.entries.forEach(entry => entry.destroy());
        this.logPanel.entries = [];

        // 获取最近6条日志
        const recentLogs = this.getCombatLog(6);

        let y = 225;
        recentLogs.forEach(entry => {
            let text = '';
            let color = '#ffffff';

            switch (entry.type) {
                case 'damage':
                    const elemName = this.getElementName(entry.data.subtype);
                    text = `${entry.formattedTime} ${elemName} ${entry.data.damage}`;
                    color = `#${this.damageSources.elements[entry.data.subtype]?.color.toString(16).padStart(6, '0') || 'ffffff'}`;
                    break;
                case 'kill':
                    text = `${entry.formattedTime} 💀 击杀!`;
                    color = '#ff6600';
                    break;
                case 'combo':
                    text = `${entry.formattedTime} ⚡ ${entry.data.count}连击`;
                    color = '#ffd700';
                    break;
                default:
                    text = `${entry.formattedTime} ${entry.type}`;
            }

            const logText = this.scene.add.text(10, y, text, {
                fontFamily: 'Arial',
                fontSize: '10px',
                fill: color
            });
            this.analyzerPanel.add(logText);
            this.logPanel.entries.push(logText);

            y += 18;
        });
    }

    /**
     * 创建性能数据面板
     */
    createPerfPanel() {
        const bg = this.scene.add.graphics();
        bg.setDepth(0);
        bg.fillStyle(0x000000, 0.7);
        bg.fillRoundedRect(0, 340, 200, 100, 10);
        bg.lineStyle(2, 0xf6e05e, 0.8);
        bg.strokeRoundedRect(0, 340, 200, 100, 10);
        this.analyzerPanel.add(bg);

        // 标题
        const title = this.scene.add.text(100, 355, '⚡ 性能监控', {
            fontFamily: 'Noto Sans SC',
            fontSize: 'bold 14px',
            fill: '#f6e05e',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        this.analyzerPanel.add(title);

        // FPS显示
        this.perfPanel = {
            fpsText: this.scene.add.text(20, 378, 'FPS: --', {
                fontFamily: 'Arial',
                fontSize: '12px',
                fill: '#68d391'
            }),
            particleText: this.scene.add.text(20, 398, '粒子: --', {
                fontFamily: 'Arial',
                fontSize: '12px',
                fill: '#4facfe'
            }),
            memoryText: this.scene.add.text(20, 418, '内存: -- MB', {
                fontFamily: 'Arial',
                fontSize: '12px',
                fill: '#ffd700'
            })
        };

        this.analyzerPanel.add(this.perfPanel.fpsText);
        this.analyzerPanel.add(this.perfPanel.particleText);
        this.analyzerPanel.add(this.perfPanel.memoryText);

        this.updatePerfPanel();
    }

    /**
     * 更新性能面板
     */
    updatePerfPanel() {
        if (!this.perfPanel) return;

        const avgFPS = this.getAverageFPS();
        const avgParticles = this.getAverageParticleCount();
        const avgMemory = this.performanceData.memoryUsage.length > 0
            ? Math.round(this.performanceData.memoryUsage[this.performanceData.memoryUsage.length - 1])
            : 0;

        this.perfPanel.fpsText.setText(`FPS: ${avgFPS}`);
        this.perfPanel.particleText.setText(`粒子: ${avgParticles}`);
        this.perfPanel.memoryText.setText(`内存: ${avgMemory} MB`);

        // FPS颜色指示
        if (avgFPS >= 55) {
            this.perfPanel.fpsText.setColor('#68d391'); // 绿色
        } else if (avgFPS >= 40) {
            this.perfPanel.fpsText.setColor('#ffd700'); // 黄色
        } else {
            this.perfPanel.fpsText.setColor('#ff6600'); // 红色
        }
    }

    // ==================== 面板控制 ====================

    /**
     * 显示面板
     */
    show() {
        if (!this.analyzerPanel) {
            this.createAnalyzerPanel();
        }

        this.isVisible = true;
        this.scene.tweens.add({
            targets: this.analyzerPanel,
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });

        console.log('📊 分析面板已显示');
    }

    /**
     * 隐藏面板
     */
    hide() {
        if (!this.analyzerPanel) return;

        this.isVisible = false;
        this.scene.tweens.add({
            targets: this.analyzerPanel,
            alpha: 0,
            duration: 300,
            ease: 'Power2'
        });

        console.log('📊 分析面板已隐藏');
    }

    /**
     * 切换显示状态
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    // ==================== 数据重置 ====================

    /**
     * 重置统计数据
     */
    reset() {
        // 重置伤害统计
        for (const source in this.damageSources) {
            for (const key in this.damageSources[source]) {
                this.damageSources[source][key].damage = 0;
                this.damageSources[source][key].hits = 0;
            }
        }

        // 重置战斗日志
        this.combatLog = [];
        this.sessionStartTime = this.scene.time.now;

        // 重置性能数据
        this.performanceData = {
            fps: [],
            particleCount: [],
            memoryUsage: [],
            maxSamples: 60
        };

        // 更新UI
        if (this.isVisible) {
            this.updateDamageChart();
            this.updateLogPanel();
            this.updatePerfPanel();
        }

        console.log('📊 数据已重置');
    }

    /**
     * 每帧更新
     */
    update(time, delta) {
        // 自动记录性能数据（如果存在performanceMonitor）
        if (this.scene.performanceMonitor && this.scene.performanceMonitor.getReport) {
            const report = this.scene.performanceMonitor.getReport();
            const fps = report.fps?.current || 60;
            const particleCount = report.particles || 0;
            const memory = report.memory || 0;

            this.recordPerformance(fps, particleCount, memory);
        }
    }

    /**
     * 销毁系统
     */
    destroy() {
        if (this.analyzerPanel) {
            this.analyzerPanel.destroy();
        }
        console.log('📊 战斗数据分析系统已销毁');
    }
}
