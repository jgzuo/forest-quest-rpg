/**
 * BossHealthBar - Boss血条UI系统
 *
 * 负责渲染和管理Boss相关的UI元素：
 * - Boss名称显示
 * - 大血条（顶部中央）
 * - 血量数字
 * - 阶段指示器（如有）
 */

class BossHealthBar {
    constructor(scene) {
        this.scene = scene;
        this.container = null;
        this.nameText = null;
        this.phaseText = null;
        this.healthBarBg = null;
        this.healthBar = null;
        this.healthText = null;

        // 当前Boss信息
        this.currentBoss = null;
        this.maxHp = 0;
        this.currentHp = 0;
        this.currentPhase = 1;
        this.totalPhases = 1;

        console.log('👑 Boss血条UI初始化');
    }

    /**
     * 显示Boss血条
     * @param {string} bossName - Boss名称
     * @param {number} currentHp - 当前血量
     * @param {number} maxHp - 最大血量
     * @param {number} currentPhase - 当前阶段（可选）
     * @param {number} totalPhases - 总阶段数（可选）
     */
    show(bossName, currentHp, maxHp, currentPhase = 1, totalPhases = 1) {
        this.currentBoss = bossName;
        this.maxHp = maxHp;
        this.currentHp = currentHp;
        this.currentPhase = currentPhase;
        this.totalPhases = totalPhases;

        // 如果容器不存在，创建UI
        if (!this.container) {
            this.createUI();
        }

        // 更新显示
        this.updateDisplay();

        // 显示动画
        this.container.setAlpha(0);
        this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            y: 50,
            duration: 500,
            ease: 'Power2'
        });
    }

    /**
     * 创建UI
     */
    createUI() {
        // 创建主容器（顶部中央）
        this.container = this.scene.add.container(400, 50);
        this.container.setScrollFactor(0);
        this.container.setDepth(300);
        this.container.setAlpha(0);

        // 背景
        const bg = this.scene.add.rectangle(0, 0, 350, 80, 0x1a1a2e, 0.9);
        bg.setOrigin(0.5);
        this.container.add(bg);

        // 边框
        const border = this.scene.add.graphics();
        border.lineStyle(3, 0xf6e05e, 1);
        border.strokeRect(-175, -40, 350, 80);
        this.container.add(border);

        // Boss名称
        this.nameText = this.scene.add.text(0, -20, '', {
            fontFamily: 'Noto Sans SC',
            fontSize: 'bold 18px',
            fill: '#f6e05e',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.container.add(this.nameText);

        // 阶段文本（右侧）
        this.phaseText = this.scene.add.text(150, -20, '', {
            fontFamily: 'Press Start 2P',
            fontSize: '12px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        this.container.add(this.phaseText);

        // 血条背景
        this.healthBarBg = this.scene.add.rectangle(0, 15, 300, 20, 0x333333, 1);
        this.healthBarBg.setOrigin(0.5);
        this.container.add(this.healthBarBg);

        // 血条（动态）
        this.healthBar = this.scene.add.rectangle(-150, 15, 300, 20, 0xff6b6b, 1);
        this.healthBar.setOrigin(0, 0.5);
        this.container.add(this.healthBar);

        // 血条边框
        const healthBorder = this.scene.add.graphics();
        healthBorder.lineStyle(2, 0xffffff, 0.8);
        healthBorder.strokeRect(-150, 5, 300, 20);
        this.container.add(healthBorder);

        // 血量数字
        this.healthText = this.scene.add.text(0, 35, '', {
            fontFamily: 'Press Start 2P',
            fontSize: '10px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        this.container.add(this.healthText);

        console.log('✅ Boss血条UI创建完成');
    }

    /**
     * 更新Boss血量
     * @param {number} hp - 当前血量
     */
    update(hp) {
        if (!this.container) return;

        this.currentHp = Math.max(0, hp);
        this.updateDisplay();
    }

    /**
     * 更新显示
     */
    updateDisplay() {
        if (!this.container) return;

        // 更新Boss名称（添加图标）
        this.nameText.setText(`🌳 ${this.currentBoss}`);

        // 更新阶段文本
        if (this.totalPhases > 1) {
            this.phaseText.setText(`${this.currentPhase}/${this.totalPhases}`);
            this.phaseText.setVisible(true);
        } else {
            this.phaseText.setVisible(false);
        }

        // 更新血条宽度
        const healthPercent = this.currentHp / this.maxHp;
        const barWidth = 300 * healthPercent;
        this.healthBar.width = barWidth;

        // 血条颜色变化
        if (healthPercent > 0.6) {
            this.healthBar.fillColor = 0xff6b6b; // 红色（健康）
        } else if (healthPercent > 0.3) {
            this.healthBar.fillColor = 0xf6e05e; // 黄色（警告）
        } else {
            this.healthBar.fillColor = 0xff3333; // 深红（危险）
        }

        // 更新血量数字
        this.healthText.setText(`${this.currentHp} / ${this.maxHp} HP`);
    }

    /**
     * 设置Boss阶段
     * @param {number} currentPhase - 当前阶段
     * @param {number} totalPhases - 总阶段数
     */
    setPhase(currentPhase, totalPhases) {
        if (!this.container) return;

        this.currentPhase = currentPhase;
        this.totalPhases = totalPhases;

        // 阶段转换动画
        this.scene.tweens.add({
            targets: this.container,
            scaleX: 1.1,
            duration: 100,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                this.updateDisplay();
            }
        });

        // 显示阶段转换文字
        const phaseText = this.scene.add.text(
            400,
            150,
            `⚠️ 阶段 ${currentPhase}!`,
            {
                fontFamily: 'Noto Sans SC',
                fontSize: 'bold 32px',
                fill: '#ff6600',
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5);
        phaseText.setScrollFactor(0);
        phaseText.setDepth(301);

        this.scene.tweens.add({
            targets: phaseText,
            y: 100,
            alpha: 0,
            scale: 1.5,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => {
                phaseText.destroy();
            }
        });
    }

    /**
     * 隐藏Boss血条
     */
    hide() {
        if (!this.container) return;

        this.scene.tweens.add({
            targets: this.container,
            alpha: 0,
            y: 30,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                this.container.setAlpha(0);
                this.currentBoss = null;
            }
        });
    }

    /**
     * 检查是否是Boss
     * @param {string} enemyName - 敌人名称
     * @returns {boolean} 是否是Boss
     */
    isBoss(enemyName) {
        if (!enemyName) return false;

        // 检查是否包含Boss关键字
        const bossKeywords = ['Boss', '王', '领主', '主', 'Queen', 'King', 'Lord'];
        return bossKeywords.some(keyword => enemyName.includes(keyword));
    }

    /**
     * 检测敌人并显示Boss血条
     * @param {Phaser.GameObjects.Sprite} enemy - 敌人对象
     */
    detectBoss(enemy) {
        if (!enemy) return;

        const enemyName = enemy.getData('name') || enemy.name || '';
        const currentHp = enemy.hp || enemy.getData('hp') || 100;
        const maxHp = enemy.maxHp || enemy.getData('maxHp') || 100;

        if (this.isBoss(enemyName)) {
            // 检查是否有阶段信息
            const currentPhase = enemy.getData('phase') || 1;
            const totalPhases = enemy.getData('totalPhases') || 1;

            this.show(enemyName, currentHp, maxHp, currentPhase, totalPhases);
        }
    }

    /**
     * 每帧更新
     * @param {number} time - 当前时间
     * @param {number} delta - 时间增量
     */
    update(time, delta) {
        // 添加轻微的脉冲动画（当Boss血量低时）
        if (this.container && this.container.alpha > 0) {
            const healthPercent = this.currentHp / this.maxHp;

            if (healthPercent < 0.3) {
                // 危险状态：快速脉冲
                const pulse = (Math.sin(time / 200) + 1) / 2;
                this.healthBar.setAlpha(0.7 + pulse * 0.3);
            } else if (healthPercent < 0.6) {
                // 警告状态：慢速脉冲
                const pulse = (Math.sin(time / 500) + 1) / 2;
                this.healthBar.setAlpha(0.8 + pulse * 0.2);
            } else {
                this.healthBar.setAlpha(1);
            }
        }
    }

    /**
     * 销毁Boss血条UI
     */
    destroy() {
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
        console.log('👑 Boss血条UI已销毁');
    }
}
