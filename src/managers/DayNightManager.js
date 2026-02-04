/**
 * DayNightManager - 昼夜循环管理器
 *
 * 负责管理游戏中的昼夜循环：
 * - 时间系统（14分钟完整循环）
 * - 光照颜色计算
 * - 环境光变化
 * - 时间显示UI
 */

class DayNightManager {
    constructor(scene) {
        this.scene = scene;

        // 时间配置
        this.cycleDuration = 14 * 60 * 1000; // 14分钟（毫秒）
        this.currentTime = 0; // 当前时间（0-1）
        this.timeScale = 1; // 时间流逝速度

        // 昼夜阶段定义
        this.phases = {
            dawn: {
                name: 'dawn',
                displayName: '早晨',
                start: 0.0,    // 00:00
                end: 0.214,    // 03:00 (3分钟)
                color: { r: 255, g: 200, b: 150 },
                ambient: 0.3
            },
            day: {
                name: 'day',
                displayName: '中午',
                start: 0.214,  // 03:00
                end: 0.643,    // 09:00 (6分钟)
                color: { r: 255, g: 255, b: 255 },
                ambient: 0.0
            },
            dusk: {
                name: 'dusk',
                displayName: '黄昏',
                start: 0.643,  // 09:00
                end: 0.857,    // 12:00 (3分钟)
                color: { r: 255, g: 200, b: 100 },
                ambient: 0.2
            },
            night: {
                name: 'night',
                displayName: '深夜',
                start: 0.857,  // 12:00
                end: 1.0,      // 14:00 (2分钟)
                color: { r: 50, g: 50, b: 100 },
                ambient: 0.5
            }
        };

        // 当前阶段
        this.currentPhase = 'day';

        // UI元素
        this.timeText = null;
        this.phaseText = null;
        this.overlay = null;

        console.log('🌅 昼夜循环系统初始化');
    }

    /**
     * 创建时间显示UI
     */
    createTimeUI() {
        const x = 20;
        const y = 20;

        // 时间文本（游戏内时间）
        this.timeText = this.scene.add.text(x, y, '12:00', {
            fontSize: '16px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.timeText.setOrigin(0, 0);
        this.timeText.setDepth(2000);
        this.timeText.setScrollFactor(0);

        // 阶段文本
        this.phaseText = this.scene.add.text(x, y + 25, '中午', {
            fontSize: '14px',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.phaseText.setOrigin(0, 0);
        this.phaseText.setDepth(2000);
        this.phaseText.setScrollFactor(0);

        // 创建光照覆盖层
        this.overlay = this.scene.add.graphics();
        this.overlay.setDepth(997);
    }

    /**
     * 更新时间
     * @param {number} delta - 时间增量（毫秒）
     */
    update(delta) {
        // 更新当前时间
        this.currentTime += (delta * this.timeScale) / this.cycleDuration;

        // 循环时间
        if (this.currentTime >= 1) {
            this.currentTime = 0;
        }

        // 更新当前阶段
        this.updatePhase();

        // 更新光照
        this.updateLighting();

        // 更新UI
        this.updateUI();
    }

    /**
     * 更新当前阶段
     */
    updatePhase() {
        let newPhase = this.currentPhase;

        // 检查当前时间属于哪个阶段
        for (const key in this.phases) {
            const phase = this.phases[key];
            if (this.currentTime >= phase.start && this.currentTime < phase.end) {
                newPhase = key;
                break;
            }
        }

        // 阶段切换
        if (newPhase !== this.currentPhase) {
            this.currentPhase = newPhase;
            this.onPhaseChange(newPhase);
        }
    }

    /**
     * 阶段切换回调
     * @param {string} newPhase - 新阶段
     */
    onPhaseChange(newPhase) {
        const phase = this.phases[newPhase];
        console.log(`🌅 时间变化: ${phase.displayName}`);

        // 可以在这里触发阶段切换事件
        this.scene.events.emit('dayNightPhaseChange', newPhase);
    }

    /**
     * 更新光照效果
     */
    updateLighting() {
        if (!this.overlay || !this.overlay.active) return;

        // 获取当前阶段和下一个阶段
        const phase = this.phases[this.currentPhase];
        const nextPhase = this.getNextPhase();

        // 计算插值因子
        const phaseDuration = phase.end - phase.start;
        const phaseProgress = (this.currentTime - phase.start) / phaseDuration;

        // 插值计算当前颜色
        const color = this.lerpColor(phase.color, nextPhase.color, phaseProgress);
        const ambient = phase.ambient + (nextPhase.ambient - phase.ambient) * phaseProgress;

        // 更新覆盖层
        this.overlay.clear();
        this.overlay.fillStyle(
            (color.r << 16) | (color.g << 8) | color.b,
            ambient
        );
        this.overlay.fillRect(
            0,
            0,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height
        );
    }

    /**
     * 获取下一个阶段
     * @returns {Object} 下一阶段配置
     */
    getNextPhase() {
        const phases = Object.keys(this.phases);
        const currentIndex = phases.indexOf(this.currentPhase);
        const nextIndex = (currentIndex + 1) % phases.length;
        return this.phases[phases[nextIndex]];
    }

    /**
     * 颜色插值
     * @param {Object} color1 - 起始颜色
     * @param {Object} color2 - 结束颜色
     * @param {number} t - 插值因子（0-1）
     * @returns {Object} 插值后的颜色
     */
    lerpColor(color1, color2, t) {
        return {
            r: Math.floor(color1.r + (color2.r - color1.r) * t),
            g: Math.floor(color1.g + (color2.g - color1.g) * t),
            b: Math.floor(color1.b + (color2.b - color1.b) * t)
        };
    }

    /**
     * 更新UI显示
     */
    updateUI() {
        if (!this.timeText || !this.phaseText) return;

        // 计算游戏内时间（24小时制）
        const gameHours = Math.floor(this.currentTime * 24);
        const gameMinutes = Math.floor((this.currentTime * 24 * 60) % 60);

        // 更新时间文本
        this.timeText.setText(
            `${String(gameHours).padStart(2, '0')}:${String(gameMinutes).padStart(2, '0')}`
        );

        // 更新阶段文本
        const phase = this.phases[this.currentPhase];
        this.phaseText.setText(phase.displayName);

        // 根据阶段改变文本颜色
        const colors = {
            dawn: '#ff9966',
            day: '#ffff66',
            dusk: '#ffcc66',
            night: '#9999ff'
        };
        this.phaseText.setColor(colors[this.currentPhase]);
    }

    /**
     * 获取当前光照颜色
     * @returns {Object} RGB颜色
     */
    getCurrentColor() {
        const phase = this.phases[this.currentPhase];
        return phase.color;
    }

    /**
     * 获取当前环境光强度
     * @returns {number} 环境光强度（0-1）
     */
    getCurrentAmbient() {
        const phase = this.phases[this.currentPhase];
        return phase.ambient;
    }

    /**
     * 获取当前阶段
     * @returns {string} 阶段名称
     */
    getCurrentPhase() {
        return this.currentPhase;
    }

    /**
     * 获取游戏内时间（分钟）
     * @returns {number} 游戏内时间（0-1440分钟）
     */
    getGameTime() {
        return Math.floor(this.currentTime * 24 * 60);
    }

    /**
     * 设置时间（用于测试或跳转）
     * @param {number} hours - 小时（0-24）
     * @param {number} minutes - 分钟（0-60）
     */
    setTime(hours, minutes = 0) {
        const totalMinutes = hours * 60 + minutes;
        this.currentTime = totalMinutes / (24 * 60);
        this.updatePhase();
        this.updateLighting();
        this.updateUI();
    }

    /**
     * 设置时间流逝速度
     * @param {number} scale - 速度倍数（1=正常，2=两倍速）
     */
    setTimeScale(scale) {
        this.timeScale = scale;
    }

    /**
     * 销毁昼夜循环系统
     */
    destroy() {
        if (this.timeText) this.timeText.destroy();
        if (this.phaseText) this.phaseText.destroy();
        if (this.overlay) this.overlay.destroy();

        console.log('🌅 昼夜循环系统已销毁');
    }
}
