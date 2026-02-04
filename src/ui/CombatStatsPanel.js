/**
 * CombatStatsPanel - 战斗统计面板
 *
 * 显示实时战斗统计数据：
 * - DPS（每秒伤害）
 * - 命中率
 * - 暴击率
 * - 总伤害
 * - 击杀数
 * - 连击统计
 */
class CombatStatsPanel {
    constructor(scene) {
        this.scene = scene;
        this.isVisible = false;

        // 统计数据
        this.stats = {
            totalDamage: 0,
            hits: 0,
            attacks: 0,
            crits: 0,
            kills: 0,
            maxCombo: 0,
            startTime: 0,
            lastDamageTime: 0,
            damageHistory: [] // 用于计算DPS（最近5秒）
        };

        // DPS计算窗口
        this.dpsWindow = 5000; // 5秒
        this.dpsUpdateInterval = 500;
        this.lastDpsUpdate = 0;

        // UI元素
        this.panel = null;
        this.dpsText = null;
        this.hitRateText = null;
        this.critRateText = null;
        this.totalDamageText = null;
        this.killsText = null;
        this.comboText = null;

        console.log('📊 战斗统计面板初始化');
    }

    /**
     * 初始化统计面板
     */
    createPanel() {
        // 创建容器（左下角）
        this.panel = this.scene.add.container(20, 400);
        this.panel.setScrollFactor(0);
        this.panel.setDepth(200);
        this.panel.setAlpha(0);

        // 背景面板
        const bg = this.scene.add.graphics();
        bg.setDepth(0);
        bg.fillStyle(0x000000, 0.7);
        bg.fillRoundedRect(0, 0, 180, 150, 10);
        bg.lineStyle(2, 0x4facfe, 0.8);
        bg.strokeRoundedRect(0, 0, 180, 150, 10);
        this.panel.add(bg);

        // 标题
        const title = this.scene.add.text(90, 15, '📊 战斗统计', {
            fontFamily: 'Noto Sans SC',
            fontSize: 'bold 16px',
            fill: '#4facfe',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        this.panel.add(title);

        // DPS显示
        const dpsLabel = this.scene.add.text(15, 40, 'DPS:', {
            fontFamily: 'Noto Sans SC',
            fontSize: '12px',
            fill: '#ffd700'
        });
        this.panel.add(dpsLabel);

        this.dpsText = this.scene.add.text(90, 40, '0', {
            fontFamily: 'Press Start 2P',
            fontSize: 'bold 14px',
            fill: '#ffffff'
        }).setOrigin(0, 0.5);
        this.panel.add(this.dpsText);

        // 命中率显示
        const hitLabel = this.scene.add.text(15, 60, '命中:', {
            fontFamily: 'Noto Sans SC',
            fontSize: '12px',
            fill: '#68d391'
        });
        this.panel.add(hitLabel);

        this.hitRateText = this.scene.add.text(90, 60, '0%', {
            fontFamily: 'Arial',
            fontSize: 'bold 14px',
            fill: '#ffffff'
        }).setOrigin(0, 0.5);
        this.panel.add(this.hitRateText);

        // 暴击率显示
        const critLabel = this.scene.add.text(15, 80, '暴击:', {
            fontFamily: 'Noto Sans SC',
            fontSize: '12px',
            fill: '#ff6b6b'
        });
        this.panel.add(critLabel);

        this.critRateText = this.scene.add.text(90, 80, '0%', {
            fontFamily: 'Arial',
            fontSize: 'bold 14px',
            fill: '#ffffff'
        }).setOrigin(0, 0.5);
        this.panel.add(this.critRateText);

        // 总伤害显示
        const damageLabel = this.scene.add.text(15, 100, '总伤:', {
            fontFamily: 'Noto Sans SC',
            fontSize: '12px',
            fill: '#ff9500'
        });
        this.panel.add(damageLabel);

        this.totalDamageText = this.scene.add.text(90, 100, '0', {
            fontFamily: 'Press Start 2P',
            fontSize: 'bold 14px',
            fill: '#ffffff'
        }).setOrigin(0, 0.5);
        this.panel.add(this.totalDamageText);

        // 击杀数显示
        const killsLabel = this.scene.add.text(15, 120, '击杀:', {
            fontFamily: 'Noto Sans SC',
            fontSize: '12px',
            fill: '#9f7aea'
        });
        this.panel.add(killsLabel);

        this.killsText = this.scene.add.text(90, 120, '0', {
            fontFamily: 'Press Start 2P',
            fontSize: 'bold 14px',
            fill: '#ffffff'
        }).setOrigin(0, 0.5);
        this.panel.add(this.killsText);

        // 最大连击显示
        const comboLabel = this.scene.add.text(15, 140, '连击:', {
            fontFamily: 'Noto Sans SC',
            fontSize: '12px',
            fill: '#00bfff'
        });
        this.panel.add(comboLabel);

        this.comboText = this.scene.add.text(90, 140, '0', {
            fontFamily: 'Press Start 2P',
            fontSize: 'bold 14px',
            fill: '#ffffff'
        }).setOrigin(0, 0.5);
        this.panel.add(this.comboText);

        console.log('✅ 战斗统计面板创建完成');
    }

    /**
     * 开始战斗统计
     */
    startBattle() {
        this.stats.startTime = this.scene.time.now;
        this.stats.lastDamageTime = this.scene.time.now;
        this.stats.damageHistory = [];
        this.resetStats();
    }

    /**
     * 重置统计数据
     */
    resetStats() {
        this.stats = {
            totalDamage: 0,
            hits: 0,
            attacks: 0,
            crits: 0,
            kills: 0,
            maxCombo: 0,
            startTime: this.scene.time.now,
            lastDamageTime: this.scene.time.now,
            damageHistory: []
        };
    }

    /**
     * 记录攻击
     * @param {number} damage - 造成伤害
     * @param {boolean} isCrit - 是否暴击
     * @param {boolean} isHit - 是否命中
     */
    recordAttack(damage, isCrit = false, isHit = true) {
        if (!isHit) {
            this.stats.attacks++;
            return;
        }

        const now = this.scene.time.now;

        // 更新基础统计
        this.stats.totalDamage += damage;
        this.stats.hits++;
        this.stats.attacks++;
        this.stats.lastDamageTime = now;

        if (isCrit) {
            this.stats.crits++;
        }

        // 记录伤害历史（用于DPS计算）
        this.stats.damageHistory.push({
            damage: damage,
            time: now
        });

        // 清理超出窗口的旧数据
        const cutoffTime = now - this.dpsWindow;
        this.stats.damageHistory = this.stats.damageHistory.filter(
            entry => entry.time > cutoffTime
        );

        // 更新UI
        this.updateDisplay();
    }

    /**
     * 记录击杀
     */
    recordKill() {
        this.stats.kills++;
        this.updateDisplay();
    }

    /**
     * 更新最大连击
     * @param {number} combo - 连击数
     */
    updateMaxCombo(combo) {
        if (combo > this.stats.maxCombo) {
            this.stats.maxCombo = combo;
        }
        this.updateDisplay();
    }

    /**
     * 计算DPS
     */
    calculateDPS() {
        const now = this.scene.time.now;
        const cutoffTime = now - this.dpsWindow;

        // 统计最近5秒的伤害
        const recentDamage = this.stats.damageHistory
            .filter(entry => entry.time > cutoffTime)
            .reduce((sum, entry) => sum + entry.damage, 0);

        return Math.round(recentDamage / (this.dpsWindow / 1000));
    }

    /**
     * 更新显示
     */
    updateDisplay() {
        if (!this.panel || !this.isVisible) return;

        const now = this.scene.time.now;

        // 每隔一定时间更新DPS
        if (now - this.lastDpsUpdate >= this.dpsUpdateInterval) {
            const dps = this.calculateDPS();
            this.dpsText.setText(dps.toString());
            this.lastDpsUpdate = now;
        }

        // 命中率
        const hitRate = this.stats.attacks > 0
            ? Math.round((this.stats.hits / this.stats.attacks) * 100)
            : 0;
        this.hitRateText.setText(hitRate + '%');

        // 暴击率
        const critRate = this.stats.hits > 0
            ? Math.round((this.stats.crits / this.stats.hits) * 100)
            : 0;
        this.critRateText.setText(critRate + '%');

        // 总伤害
        this.totalDamageText.setText(this.stats.totalDamage.toString());

        // 击杀数
        this.killsText.setText(this.stats.kills.toString());

        // 最大连击
        this.comboText.setText(this.stats.maxCombo.toString());
    }

    /**
     * 显示面板
     */
    show() {
        if (!this.panel) {
            this.createPanel();
        }
        this.isVisible = true;
        this.scene.tweens.add({
            targets: this.panel,
            alpha: 1,
            duration: 300
        });
    }

    /**
     * 隐藏面板
     */
    hide() {
        this.isVisible = false;
        if (this.panel) {
            this.scene.tweens.add({
                targets: this.panel,
                alpha: 0,
                duration: 300
            });
        }
    }

    /**
     * 每帧更新
     */
    update(time, delta) {
        if (this.isVisible && this.panel) {
            this.updateDisplay();
        }
    }

    /**
     * 获取统计摘要
     */
    getSummary() {
        return {
            totalDamage: this.stats.totalDamage,
            dps: this.calculateDPS(),
            hitRate: this.stats.attacks > 0
                ? (this.stats.hits / this.stats.attacks * 100).toFixed(1) + '%'
                : '0%',
            critRate: this.stats.hits > 0
                ? (this.stats.crits / this.stats.hits * 100).toFixed(1) + '%'
                : '0%',
            kills: this.stats.kills,
            maxCombo: this.stats.maxCombo
        };
    }

    /**
     * 销毁面板
     */
    destroy() {
        if (this.panel) {
            this.panel.destroy();
            this.panel = null;
        }
        console.log('📊 战斗统计面板已销毁');
    }
}
