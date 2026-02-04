/**
 * PetUI - 宠物界面
 *
 * 显示宠物状态：
 * - 宠物等级
 * - 经验值进度条
 * - 战斗属性（伤害、攻击范围）
 * - 辅助属性（回血量、冷却时间）
 * - 收集属性（收集范围）
 */

class PetUI {
    constructor(scene) {
        this.scene = scene;
        this.container = null;
        this.visible = false;

        this.createUI();
    }

    /**
     * 创建宠物UI
     */
    createUI() {
        // 创建容器
        this.container = this.scene.add.container(0, 0);
        this.container.setDepth(1000);
        this.container.setVisible(false);

        // 背景面板
        const bg = this.scene.add.rectangle(0, 0, 300, 400, 0x1a1a2e);
        bg.setStrokeStyle(2, 0x00ffff);
        this.container.add(bg);

        // 标题
        const title = this.scene.add.text(0, -170, '🐾 小精灵', {
            fontSize: '24px',
            color: '#00ffff',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        this.container.add(title);

        // 等级显示
        this.levelText = this.scene.add.text(0, -130, '等级: Lv.1', {
            fontSize: '18px',
            color: '#ffffff'
        });
        this.levelText.setOrigin(0.5);
        this.container.add(this.levelText);

        // 经验值进度条背景
        const expBarBg = this.scene.add.rectangle(0, -100, 250, 20, 0x000000);
        expBarBg.setStrokeStyle(1, 0xffffff);
        this.container.add(expBarBg);

        // 经验值进度条
        this.expBar = this.scene.add.rectangle(-123, -100, 2, 18, 0x00ff00);
        this.expBar.setOrigin(0, 0.5);
        this.container.add(this.expBar);

        // 经验值文本
        this.expText = this.scene.add.text(0, -100, '0 / 100 XP', {
            fontSize: '12px',
            color: '#ffffff'
        });
        this.expText.setOrigin(0.5);
        this.container.add(this.expText);

        // 战斗属性标题
        const combatTitle = this.scene.add.text(-120, -60, '⚔️ 战斗', {
            fontSize: '16px',
            color: '#ff6b6b',
            fontStyle: 'bold'
        });
        combatTitle.setOrigin(0, 0.5);
        this.container.add(combatTitle);

        // 伤害
        this.damageText = this.scene.add.text(-120, -30, '伤害: 10', {
            fontSize: '14px',
            color: '#ffffff'
        });
        this.damageText.setOrigin(0, 0.5);
        this.container.add(this.damageText);

        // 攻击范围
        this.attackRangeText = this.scene.add.text(-120, -5, '攻击范围: 150', {
            fontSize: '14px',
            color: '#ffffff'
        });
        this.attackRangeText.setOrigin(0, 0.5);
        this.container.add(this.attackRangeText);

        // 辅助属性标题
        const supportTitle = this.scene.add.text(-120, 30, '💚 辅助', {
            fontSize: '16px',
            color: '#4ecdc4',
            fontStyle: 'bold'
        });
        supportTitle.setOrigin(0, 0.5);
        this.container.add(supportTitle);

        // 回血量
        this.healAmountText = this.scene.add.text(-120, 60, '回血量: 5', {
            fontSize: '14px',
            color: '#ffffff'
        });
        this.healAmountText.setOrigin(0, 0.5);
        this.container.add(this.healAmountText);

        // 回血冷却
        this.healCooldownText = this.scene.add.text(-120, 85, '回血冷却: 10秒', {
            fontSize: '14px',
            color: '#ffffff'
        });
        this.healCooldownText.setOrigin(0, 0.5);
        this.container.add(this.healCooldownText);

        // 收集属性标题
        const collectTitle = this.scene.add.text(-120, 120, '💎 收集', {
            fontSize: '16px',
            color: '#ffd93d',
            fontStyle: 'bold'
        });
        collectTitle.setOrigin(0, 0.5);
        this.container.add(collectTitle);

        // 收集范围
        this.collectRangeText = this.scene.add.text(-120, 150, '收集范围: 100', {
            fontSize: '14px',
            color: '#ffffff'
        });
        this.collectRangeText.setOrigin(0, 0.5);
        this.container.add(this.collectRangeText);

        // 关闭按钮提示
        const closeHint = this.scene.add.text(0, 180, '按 P 键关闭', {
            fontSize: '14px',
            color: '#888888'
        });
        closeHint.setOrigin(0.5);
        this.container.add(closeHint);

        // 设置位置
        this.container.setPosition(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2
        );
    }

    /**
     * 更新宠物状态
     * @param {Pet} pet - 宠物对象
     */
    updatePetStats(pet) {
        if (!pet) return;

        // 更新等级
        this.levelText.setText(`等级: Lv.${pet.level}`);

        // 更新经验条
        const expPercent = pet.experience / pet.experienceToNextLevel;
        const expBarWidth = 246 * expPercent;
        this.expBar.width = Math.max(2, expBarWidth);
        this.expText.setText(`${pet.experience} / ${pet.experienceToNextLevel} XP`);

        // 更新战斗属性
        this.damageText.setText(`伤害: ${pet.damage}`);
        this.attackRangeText.setText(`攻击范围: ${pet.attackRange}`);

        // 更新辅助属性
        this.healAmountText.setText(`回血量: ${pet.healAmount}`);
        const healCooldownSec = Math.round(pet.healCooldown / 1000);
        this.healCooldownText.setText(`回血冷却: ${healCooldownSec}秒`);

        // 更新收集属性
        this.collectRangeText.setText(`收集范围: ${pet.collectRange}`);
    }

    /**
     * 显示UI
     */
    show() {
        this.visible = true;
        this.container.setVisible(true);
    }

    /**
     * 隐藏UI
     */
    hide() {
        this.visible = false;
        this.container.setVisible(false);
    }

    /**
     * 切换显示状态
     */
    toggle() {
        if (this.visible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * 销毁UI
     */
    destroy() {
        if (this.container) {
            this.container.destroy();
        }
    }
}
