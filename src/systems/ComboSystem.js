/**
 * ComboSystem - 连击系统
 * 追踪玩家的连续击杀，提供伤害加成奖励
 * @version 1.0 - Milestone 6 Iteration 5
 */
class ComboSystem {
    constructor(scene) {
        this.scene = scene;
        this.player = scene.player;

        // 连击状态
        this.comboCount = 0;
        this.maxCombo = 0;
        this.lastHitTime = 0;
        this.comboTimeout = 2000; // 2秒内没有击中则连击中断

        // 连击奖励配置
        this.config = {
            comboDamageBonus: 0.05, // 每次连击增加5%伤害
            maxDamageBonus: 2.0,    // 最大200%伤害
            showComboUI: true,       // 显示连击UI
            comboBreakWarning: true  // 连击中断时显示警告
        };

        // UI元素
        this.comboContainer = null;
        this.comboText = null;
        this.comboMultiplierText = null;
        this.comboBar = null;

        // 初始化
        this.initComboSystem();

        console.log('⚔️ ComboSystem 初始化完成');
    }

    /**
     * 初始化连击系统
     */
    initComboSystem() {
        // 创建连击UI
        this.createComboUI();

        // 监听敌人死亡事件
        this.scene.events.on('enemyDeath', () => {
            this.incrementCombo();
        });

        // 监听敌人受伤事件（用于连击保持）
        this.scene.events.on('enemyHit', () => {
            this.resetComboTimer();
        });
    }

    /**
     * 创建连击UI
     */
    createComboUI() {
        // 创建容器
        this.comboContainer = this.scene.add.container(680, 100);
        this.comboContainer.setScrollFactor(0);
        this.comboContainer.setDepth(200);
        this.comboContainer.setAlpha(0);

        // 连击标签
        const comboLabel = this.scene.add.text(0, 0, '连击', {
            fontFamily: 'Noto Sans SC',
            fontSize: 'bold 16px',
            fill: '#ffd700',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        this.comboContainer.add(comboLabel);

        // 连击数字
        this.comboText = this.scene.add.text(0, 30, '0', {
            fontFamily: 'Press Start 2P',
            fontSize: 'bold 48px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        this.comboContainer.add(this.comboText);

        // 伤害倍率文本
        this.comboMultiplierText = this.scene.add.text(0, 65, '100% 伤害', {
            fontFamily: 'Noto Sans SC',
            fontSize: '14px',
            fill: '#4facfe',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.comboContainer.add(this.comboMultiplierText);

        // 连击计时条背景
        const barBg = this.scene.add.rectangle(0, 85, 100, 8, 0x333333, 0.8);
        barBg.setOrigin(0.5);
        this.comboContainer.add(barBg);

        // 连击计时条（动态）
        this.comboBar = this.scene.add.rectangle(0, 85, 100, 8, 0x68d391, 1);
        this.comboBar.setOrigin(0.5);
        this.comboContainer.add(this.comboBar);

        console.log('✅ 连击UI创建完成');
    }

    /**
     * 增加连击数
     */
    incrementCombo() {
        this.comboCount++;
        this.lastHitTime = this.scene.time.now;

        // 更新最大连击
        if (this.comboCount > this.maxCombo) {
            this.maxCombo = this.comboCombo = this.comboCount;
        }

        // 显示UI
        this.comboContainer.setAlpha(1);

        // 更新显示
        this.updateComboDisplay();

        // 播放连击音效（根据连击数）
        this.playComboSound();

        // 连击动画效果
        this.playComboAnimation();

        console.log(`⚔️ 连击: ${this.comboCount} (最大: ${this.maxCombo})`);
    }

    /**
     * 重置连击计时器
     */
    resetComboTimer() {
        this.lastHitTime = this.scene.time.now;
    }

    /**
     * 检查连击是否超时
     */
    checkComboTimeout() {
        if (this.comboCount === 0) return;

        const elapsed = this.scene.time.now - this.lastHitTime;

        if (elapsed >= this.comboTimeout) {
            // 连击中断
            this.breakCombo();
        } else {
            // 更新计时条
            const remaining = 1 - (elapsed / this.comboTimeout);
            this.comboBar.width = 100 * remaining;
        }
    }

    /**
     * 连击中断
     */
    breakCombo() {
        if (this.comboCount === 0) return;

        console.log(`💔 连击中断: ${this.comboCount} 连击`);

        // 显示中断提示
        if (this.config.comboBreakWarning && this.comboCount >= 5) {
            this.scene.showFloatingText(
                this.player.x,
                this.player.y - 80,
                `连击中断! (${this.comboCount} 连击)`,
                '#ff6b6b',
                1500
            );
        }

        // 重置连击
        this.comboCount = 0;
        this.updateComboDisplay();

        // 淡出UI
        this.scene.tweens.add({
            targets: this.comboContainer,
            alpha: 0,
            duration: 500,
            delay: 500
        });
    }

    /**
     * 更新连击显示
     */
    updateComboDisplay() {
        // 防御性检查：确保UI元素存在
        if (!this.comboText || !this.comboMultiplierText) {
            console.warn('⚠️ Combo UI elements are null, skipping display update');
            return;
        }

        // 更新连击数字
        this.comboText.setText(this.comboCount.toString());

        // 计算伤害倍率
        const multiplier = this.getDamageMultiplier();
        const percentage = Math.round(multiplier * 100);

        // 更新倍率文本
        this.comboMultiplierText.setText(`${percentage}% 伤害`);

        // 根据连击数改变颜色
        if (this.comboCount >= 20) {
            this.comboText.setFill('#ff0000'); // 红色（超神）
        } else if (this.comboCount >= 10) {
            this.comboText.setFill('#ff6600'); // 橙色（完美）
        } else if (this.comboCount >= 5) {
            this.comboText.setFill('#ffd700'); // 金色（优秀）
        } else {
            this.comboText.setFill('#ffffff'); // 白色（普通）
        }
    }

    /**
     * 播放连击动画
     */
    playComboAnimation() {
        // 数字放大效果
        this.scene.tweens.add({
            targets: this.comboText,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 100,
            yoyo: true,
            ease: 'Power2'
        });

        // 容器晃动效果
        this.scene.tweens.add({
            targets: this.comboContainer,
            x: 680 + 5,
            duration: 50,
            yoyo: true,
            repeat: 3
        });
    }

    /**
     * 播放连击音效（占位符）
     */
    playComboSound() {
        // 根据连击数播放不同音效
        if (this.comboCount % 10 === 0 && this.comboCount > 0) {
            // 每10连击播放特殊音效
            console.log(`🎵 连击音效: ${this.comboCount} 连击!`);
            // this.scene.audioManager.playComboMilestone(this.comboCount);
        }
    }

    /**
     * 获取当前伤害倍率
     */
    getDamageMultiplier() {
        if (this.comboCount === 0) return 1.0;

        const bonus = Math.min(
            this.comboCount * this.config.comboDamageBonus,
            this.config.maxDamageBonus
        );

        return 1.0 + bonus;
    }

    /**
     * 应用连击加成到伤害
     */
    applyComboDamage(baseDamage) {
        const multiplier = this.getDamageMultiplier();
        return Math.floor(baseDamage * multiplier);
    }

    /**
     * 每帧更新
     */
    update(time, delta) {
        // 检查连击超时
        this.checkComboTimeout();
    }

    /**
     * 获取连击统计
     */
    getStats() {
        return {
            currentCombo: this.comboCount,
            maxCombo: this.maxCombo,
            damageMultiplier: this.getDamageMultiplier(),
            comboTimeout: this.comboTimeout
        };
    }

    /**
     * 重置连击系统
     */
    reset() {
        this.comboCount = 0;
        this.maxCombo = 0;
        this.lastHitTime = 0;
        this.updateComboDisplay();
        this.comboContainer.setAlpha(0);
    }

    /**
     * 清理资源
     */
    destroy() {
        if (this.comboContainer) {
            this.comboContainer.destroy();
            this.comboContainer = null;
        }
        console.log('⚔️ ComboSystem 已清理');
    }
}
