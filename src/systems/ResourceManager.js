/**
 * ResourceManager - 管理游戏资源系统 (HP 和 MP)
 * 负责生命值和法力值的追踪、恢复、更新UI
 * @version 1.0 - Milestone 6 Iteration 4
 */
class ResourceManager {
    constructor(scene) {
        this.scene = scene;
        this.player = scene.player;

        // 初始化 MP 系统
        this.initMPSystem();

        console.log('💎 ResourceManager 初始化完成');
    }

    /**
     * 初始化 MP 系统
     */
    initMPSystem() {
        if (this.player) {
            // 如果玩家已存在，初始化 MP
            this.player.mp = this.player.mp || 50;
            this.player.maxMp = this.player.maxMp || 50;
            this.player.mpRegenRate = 1; // 每秒恢复 1 MP
            this.player.lastMpRegen = 0;

            console.log(`💎 MP 系统初始化: ${this.player.mp}/${this.player.maxMp}`);
        }
    }

    /**
     * 更新资源系统 (每帧调用)
     * @param {number} time - Phaser time
     * @param {number} delta - 时间增量
     */
    update(time, delta) {
        // MP 自然恢复 (每秒恢复)
        if (time - this.player.lastMpRegen > 1000) {
            this.regenMP(this.player.mpRegenRate);
            this.player.lastMpRegen = time;
        }
    }

    /**
     * 恢复 MP
     * @param {number} amount - 恢复量
     * @returns {number} 实际恢复量
     */
    regenMP(amount) {
        if (!this.player) return 0;

        const oldMp = this.player.mp;
        this.player.mp = Math.min(this.player.mp + amount, this.player.maxMp);
        const actualRegen = this.player.mp - oldMp;

        if (actualRegen > 0) {
            this.updateMPUI();
        }

        return actualRegen;
    }

    /**
     * 消耗 MP
     * @param {number} amount - 消耗量
     * @returns {boolean} 是否有足够的 MP
     */
    consumeMP(amount) {
        if (!this.player) return false;

        if (this.player.mp >= amount) {
            this.player.mp -= amount;
            this.updateMPUI();
            return true;
        }

        // MP 不足提示
        this.scene.showFloatingText(
            this.player.x,
            this.player.y - 40,
            '法力不足!',
            '#9f7aea'
        );
        return false;
    }

    /**
     * 恢复 HP
     * @param {number} amount - 恢复量
     * @returns {number} 实际恢复量
     */
    healHP(amount) {
        if (!this.player) return 0;

        const oldHp = this.player.hp;
        this.player.hp = Math.min(this.player.hp + amount, this.player.maxHp);
        const actualHeal = this.player.hp - oldHp;

        if (actualHeal > 0) {
            this.scene.showFloatingText(
                this.player.x,
                this.player.y - 40,
                '+' + actualHeal + ' HP',
                '#48bb78'
            );
            this.updateHPUI();
        }

        return actualHeal;
    }

    /**
     * 升级时更新 MP 最大值
     */
    onLevelUp() {
        if (!this.player) return;

        const level = this.player.level || 1;
        // 每级增加 10 MP
        this.player.maxMp = 50 + (level - 1) * 10;
        this.player.mp = this.player.maxMp; // 升级恢复满 MP

        console.log('💎 升级! MP 上限提升至: ' + this.player.maxMp);
        this.updateMPUI();
    }

    /**
     * 更新 MP UI
     */
    updateMPUI() {
        if (!this.player) return;

        const mpBar = document.getElementById('mp-bar');
        const mpText = document.getElementById('mp-text');
        const mpBarFill = mpBar?.querySelector('.bar-fill');

        if (mpBar && mpText && mpBarFill) {
            const mpPercent = (this.player.mp / this.player.maxMp) * 100;
            mpText.textContent = Math.floor(this.player.mp) + '/' + this.player.maxMp;
            mpBarFill.style.width = mpPercent + '%';
        }
    }

    /**
     * 更新 HP UI
     */
    updateHPUI() {
        if (!this.player) return;

        const hpBar = document.getElementById('hp-bar');
        const hpText = document.getElementById('hp-text');
        const hpBarFill = hpBar?.querySelector('.bar-fill');

        if (hpBar && hpText && hpBarFill) {
            const hpPercent = (this.player.hp / this.player.maxHp) * 100;
            hpText.textContent = this.player.hp + '/' + this.player.maxHp;
            hpBarFill.style.width = hpPercent + '%';
        }
    }

    /**
     * 获取当前 MP
     * @returns {number}
     */
    getCurrentMP() {
        return this.player?.mp || 0;
    }

    /**
     * 获取最大 MP
     * @returns {number}
     */
    getMaxMP() {
        return this.player?.maxMp || 50;
    }

    /**
     * 获取当前 HP
     * @returns {number}
     */
    getCurrentHP() {
        return this.player?.hp || 0;
    }

    /**
     * 获取最大 HP
     * @returns {number}
     */
    getMaxHP() {
        return this.player?.maxHp || 100;
    }
}
