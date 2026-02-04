/**
 * SkillComboSystem - 技能连携系统
 *
 * 提供技能连携机制：
 * - 技能连携判定（旋风斩→冲锋增强）
 * - 完美连击奖励（伤害递增/特效升级）
 * - 蓄力条UI（按住蓄力/松开发射）
 * - 连携时间窗口
 */

class SkillComboSystem {
    constructor(scene) {
        this.scene = scene;
        this.player = scene.player;

        // 连携配置
        this.config = {
            comboWindow: 3000,       // 连携时间窗口（毫秒）
            maxCombo: 5,             // 最大连携层数
            damageBonusPerLevel: 0.2, // 每层20%伤害加成

            // 技能连携链
            chains: {
                'whirlwind_slash': {
                    next: 'charge',
                    bonus: 1.5,
                    effect: 'wind_boost'
                },
                'charge': {
                    next: 'ultimate',
                    bonus: 2.0,
                    effect: 'power_strike'
                },
                'healing_light': {
                    next: 'whirlwind_slash',
                    bonus: 1.3,
                    effect: 'holy_slash'
                }
            }
        };

        // 状态
        this.currentChain = [];      // 当前连携链
        this.comboLevel = 0;         // 连携层数
        this.lastSkillTime = 0;      // 最后技能时间
        this.lastSkillId = null;     // 最后技能ID
        this.isCharging = false;     // 是否正在蓄力
        this.chargeLevel = 0;        // 蓄力等级（0-3）
        this.chargeStartTime = 0;    // 蓄力开始时间

        // UI元素
        this.chargeBar = null;
        this.chargeBarBg = null;
        this.comboText = null;
        this.chainIndicator = null;

        // 初始化UI
        this.createChargeUI();

        console.log('⚡ 技能连携系统初始化');
    }

    /**
     * 创建蓄力条UI
     */
    createChargeUI() {
        // 蓄力条容器（玩家头顶）
        this.chargeContainer = this.scene.add.container(0, 0);
        this.chargeContainer.setDepth(200);
        this.chargeContainer.setVisible(false);

        // 背景
        this.chargeBarBg = this.scene.add.rectangle(0, -40, 60, 8, 0x333333, 0.8);
        this.chargeBarBg.setOrigin(0.5);
        this.chargeContainer.add(this.chargeBarBg);

        // 蓄力条
        this.chargeBar = this.scene.add.rectangle(-30, -40, 0, 8, 0xf6e05e, 1);
        this.chargeBar.setOrigin(0, 0.5);
        this.chargeContainer.add(this.chargeBar);

        // 蓄力等级指示器
        this.chargeLevelText = this.scene.add.text(0, -55, '', {
            fontFamily: 'Press Start 2P',
            fontSize: '10px',
            fill: '#f6e05e',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        this.chargeContainer.add(this.chargeLevelText);

        // 连携指示器
        this.chainIndicator = this.scene.add.text(400, 150, '', {
            fontFamily: 'Noto Sans SC',
            fontSize: 'bold 24px',
            fill: '#4facfe',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.chainIndicator.setScrollFactor(0);
        this.chainIndicator.setDepth(300);
        this.chainIndicator.setVisible(false);
    }

    /**
     * 开始蓄力
     * @param {string} skillId - 技能ID
     * @returns {boolean} 是否成功开始蓄力
     */
    startCharge(skillId) {
        if (this.isCharging) return false;

        this.isCharging = true;
        this.chargeStartTime = this.scene.time.now;
        this.chargingSkillId = skillId;
        this.chargeLevel = 0;

        // 显示蓄力条
        this.chargeContainer.setVisible(true);
        this.chargeContainer.setPosition(this.player.x, this.player.y);

        // 播放蓄力音效
        if (this.scene.audioManager) {
            this.scene.audioManager.playChargeStart();
        }

        return true;
    }

    /**
     * 更新蓄力
     */
    updateCharge() {
        if (!this.isCharging) return;

        // 更新蓄力条位置
        this.chargeContainer.setPosition(this.player.x, this.player.y);

        // 计算蓄力进度
        const elapsed = this.scene.time.now - this.chargeStartTime;
        const chargeDuration = 1500; // 最大蓄力时间
        const progress = Math.min(elapsed / chargeDuration, 1);

        // 计算蓄力等级（0-3）
        const newLevel = Math.floor(progress * 3);
        if (newLevel !== this.chargeLevel) {
            this.chargeLevel = newLevel;
            this.onChargeLevelUp();
        }

        // 更新蓄力条显示
        const barWidth = 60 * progress;
        this.chargeBar.width = barWidth;

        // 颜色变化
        const colors = [0xf6e05e, 0xff9500, 0xff0000];
        this.chargeBar.fillColor = colors[this.chargeLevel] || colors[0];

        // 更新文字
        const levelTexts = ['蓄力中...', 'Level 1', 'Level 2', 'MAX!'];
        this.chargeLevelText.setText(levelTexts[this.chargeLevel]);
    }

    /**
     * 蓄力等级提升
     */
    onChargeLevelUp() {
        // 震动效果
        this.scene.cameras.main.shake(50, 0.005 * this.chargeLevel);

        // 特效
        const colors = ['#f6e05e', '#ff9500', '#ff0000'];
        this.scene.showFloatingText(
            this.player.x,
            this.player.y - 70,
            `蓄力 ${this.chargeLevel}!`,
            colors[this.chargeLevel - 1] || '#f6e05e'
        );

        // 播放音效
        if (this.scene.audioManager) {
            this.scene.audioManager.playChargeLevelUp();
        }
    }

    /**
     * 释放蓄力技能
     * @returns {Object} 蓄力结果 {skillId, chargeLevel, damageMultiplier}
     */
    releaseCharge() {
        if (!this.isCharging) return null;

        const result = {
            skillId: this.chargingSkillId,
            chargeLevel: this.chargeLevel,
            damageMultiplier: 1 + this.chargeLevel * 0.5 // 每级50%加成
        };

        // 隐藏蓄力条
        this.chargeContainer.setVisible(false);
        this.isCharging = false;

        // 满蓄力特效
        if (this.chargeLevel >= 3) {
            this.createMaxChargeEffect();
        }

        return result;
    }

    /**
     * 取消蓄力
     */
    cancelCharge() {
        if (!this.isCharging) return;

        this.chargeContainer.setVisible(false);
        this.isCharging = false;
        this.chargeLevel = 0;
    }

    /**
     * 创建满蓄力特效
     */
    createMaxChargeEffect() {
        // 冲击波
        const shockwave = this.scene.add.graphics();
        shockwave.setDepth(100);
        shockwave.lineStyle(4, 0xff0000, 1);
        shockwave.strokeCircle(this.player.x, this.player.y, 40);

        this.scene.tweens.add({
            targets: shockwave,
            scale: 3,
            alpha: 0,
            duration: 500,
            onComplete: () => shockwave.destroy()
        });

        // 屏幕闪光
        this.scene.cameras.main.flash(200, 255, 100, 0);
    }

    /**
     * 检查技能连携
     * @param {string} currentSkillId - 当前技能ID
     * @returns {Object} 连携结果 {isCombo, bonus, effect, chainCount}
     */
    checkSkillChain(currentSkillId) {
        const now = this.scene.time.now;
        const timeSinceLastSkill = now - this.lastSkillTime;

        // 检查是否在连携窗口内
        if (timeSinceLastSkill > this.config.comboWindow) {
            this.resetChain();
        }

        // 检查是否是有效的连携
        const chainConfig = this.config.chains[this.lastSkillId];
        let result = {
            isCombo: false,
            bonus: 1,
            effect: null,
            chainCount: this.currentChain.length
        };

        if (chainConfig && chainConfig.next === currentSkillId) {
            // 成功连携！
            result.isCombo = true;
            result.bonus = chainConfig.bonus;
            result.effect = chainConfig.effect;

            // 增加连携层数
            this.comboLevel = Math.min(this.comboLevel + 1, this.config.maxCombo);
            this.currentChain.push(currentSkillId);

            // 显示连携提示
            this.showChainIndicator(currentSkillId, this.comboLevel);

            // 播放音效
            if (this.scene.audioManager) {
                this.scene.audioManager.playSkillChain();
            }
        } else {
            // 不是连携，重置链条
            this.resetChain();
            this.currentChain.push(currentSkillId);
        }

        // 更新最后技能信息
        this.lastSkillTime = now;
        this.lastSkillId = currentSkillId;

        return result;
    }

    /**
     * 显示连携指示器
     */
    showChainIndicator(skillId, level) {
        const skillNames = {
            'whirlwind_slash': '旋风斩',
            'charge': '冲锋',
            'healing_light': '治疗',
            'ultimate': '终极技'
        };

        const chainEmojis = ['⚡', '🔥', '💥', '👑', '🌟'];
        const emoji = chainEmojis[Math.min(level - 1, chainEmojis.length - 1)];

        this.chainIndicator.setText(`${emoji} 连携 x${level}! ${skillNames[skillId]} ${emoji}`);
        this.chainIndicator.setVisible(true);

        // 动画
        this.scene.tweens.add({
            targets: this.chainIndicator,
            scale: 1.3,
            duration: 200,
            yoyo: true
        });

        // 隐藏
        this.scene.time.delayedCall(2000, () => {
            this.scene.tweens.add({
                targets: this.chainIndicator,
                alpha: 0,
                duration: 300,
                onComplete: () => {
                    this.chainIndicator.setVisible(false);
                    this.chainIndicator.setAlpha(1);
                }
            });
        });
    }

    /**
     * 获取连携伤害加成
     * @returns {number} 总伤害倍数
     */
    getComboDamageMultiplier() {
        const baseMultiplier = 1 + this.comboLevel * this.config.damageBonusPerLevel;
        return baseMultiplier;
    }

    /**
     * 应用连携特效
     * @param {string} effectType - 特效类型
     * @param {Object} params - 特效参数
     */
    applyChainEffect(effectType, params) {
        switch (effectType) {
            case 'wind_boost':
                this.createWindBoostEffect(params);
                break;
            case 'power_strike':
                this.createPowerStrikeEffect(params);
                break;
            case 'holy_slash':
                this.createHolySlashEffect(params);
                break;
        }
    }

    /**
     * 风之加速特效（旋风斩→冲锋）
     */
    createWindBoostEffect(params) {
        const { x, y } = params;

        // 风之轨迹
        for (let i = 0; i < 8; i++) {
            const trail = this.scene.add.circle(x, y, 5, 0x87ceeb, 0.6);
            trail.setDepth(99);

            this.scene.tweens.add({
                targets: trail,
                x: x + (Math.random() - 0.5) * 100,
                y: y + (Math.random() - 0.5) * 100,
                alpha: 0,
                duration: 400,
                onComplete: () => trail.destroy()
            });
        }

        // 加速文字
        this.scene.showFloatingText(x, y - 50, '💨 风之加速!', '#87ceeb');
    }

    /**
     * 强力打击特效（冲锋→终极技）
     */
    createPowerStrikeEffect(params) {
        const { x, y } = params;

        // 能量聚集
        const orb = this.scene.add.circle(x, y, 30, 0xff0000, 0.8);
        orb.setDepth(100);

        this.scene.tweens.add({
            targets: orb,
            scale: 2,
            alpha: 0,
            duration: 500,
            onComplete: () => orb.destroy()
        });

        // 屏幕震动
        this.scene.cameras.main.shake(300, 0.02);

        // 文字
        this.scene.showFloatingText(x, y - 50, '💥 强力打击!', '#ff0000');
    }

    /**
     * 神圣斩击特效（治疗→旋风斩）
     */
    createHolySlashEffect(params) {
        const { x, y } = params;

        // 圣光十字架
        const graphics = this.scene.add.graphics();
        graphics.setDepth(100);
        graphics.lineStyle(4, 0xffd700, 1);

        const size = 40;
        graphics.beginPath();
        graphics.moveTo(x, y - size);
        graphics.lineTo(x, y + size);
        graphics.moveTo(x - size * 0.6, y);
        graphics.lineTo(x + size * 0.6, y);
        graphics.strokePath();

        this.scene.tweens.add({
            targets: graphics,
            rotation: Math.PI / 4,
            alpha: 0,
            duration: 600,
            onComplete: () => graphics.destroy()
        });

        // 文字
        this.scene.showFloatingText(x, y - 50, '✨ 神圣斩击!', '#ffd700');
    }

    /**
     * 重置连携链
     */
    resetChain() {
        this.currentChain = [];
        this.comboLevel = 0;
        this.lastSkillId = null;
    }

    /**
     * 检查完美连击（时机判定）
     * @param {number} inputTime - 输入时间
     * @param {number} perfectWindow - 完美窗口（毫秒）
     * @returns {Object} 判定结果
     */
    checkPerfectTiming(inputTime, perfectWindow = 100) {
        // 这里可以实现更复杂的时机判定
        // 例如：在特定帧输入获得完美判定
        const isPerfect = Math.random() < 0.3; // 简化示例

        return {
            isPerfect,
            timing: isPerfect ? 'perfect' : 'good',
            bonus: isPerfect ? 2.0 : 1.0
        };
    }

    /**
     * 完美连击奖励
     */
    applyPerfectComboBonus() {
        // 额外伤害加成
        const perfectBonus = 1.5;

        // 特效
        const text = this.scene.add.text(
            this.player.x,
            this.player.y - 80,
            '⭐ PERFECT! ⭐',
            {
                fontFamily: 'Noto Sans SC',
                fontSize: 'bold 28px',
                fill: '#ffd700',
                stroke: '#000000',
                strokeThickness: 5
            }
        ).setOrigin(0.5);
        text.setDepth(300);

        this.scene.tweens.add({
            targets: text,
            y: text.y - 50,
            scale: 1.3,
            alpha: 0,
            duration: 1200,
            onComplete: () => text.destroy()
        });

        // 屏幕闪光
        this.scene.cameras.main.flash(200, 255, 215, 0);

        return perfectBonus;
    }

    /**
     * 每帧更新
     */
    update(time, delta) {
        // 更新蓄力
        if (this.isCharging) {
            this.updateCharge();
        }

        // 检查连携窗口超时
        if (this.lastSkillTime > 0 && time - this.lastSkillTime > this.config.comboWindow) {
            if (this.currentChain.length > 0) {
                this.resetChain();
            }
        }
    }

    /**
     * 获取连携统计
     */
    getStats() {
        return {
            currentChain: [...this.currentChain],
            comboLevel: this.comboLevel,
            isCharging: this.isCharging,
            chargeLevel: this.chargeLevel,
            damageMultiplier: this.getComboDamageMultiplier()
        };
    }

    /**
     * 销毁系统
     */
    destroy() {
        if (this.chargeContainer) {
            this.chargeContainer.destroy();
        }
        if (this.chainIndicator) {
            this.chainIndicator.destroy();
        }
        console.log('⚡ 技能连携系统已销毁');
    }
}
