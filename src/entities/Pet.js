/**
 * Pet Entity - 宠物实体类
 *
 * 功能：
 * - 跟随玩家移动
 * - 自动攻击敌人
 * - 辅助玩家（回血、增益）
 * - 收集掉落物
 * - 升级系统
 */

class Pet extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, player) {
        // 使用宠物精灵图
        super(scene, x, y, 'pet');

        this.scene = scene;
        this.player = player;

        // 宠物属性
        this.level = 1;
        this.experience = 0;
        this.experienceToNextLevel = 100;

        // 战斗属性
        this.damage = 10;           // 基础伤害
        this.attackCooldown = 2000; // 攻击冷却（毫秒）
        this.lastAttackTime = 0;
        this.attackRange = 150;     // 攻击范围

        // 辅助属性
        this.healAmount = 5;        // 每次回血量
        this.healCooldown = 10000;  // 回血冷却（毫秒）
        this.lastHealTime = 0;

        // 收集属性
        this.collectRange = 100;    // 收集范围

        // 移动属性
        this.followDistance = 60;   // 跟随距离
        this.moveSpeed = 150;       // 移动速度

        // 启用物理
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setSize(20, 20);
        this.body.setCollideWorldBounds(true);

        // 设置缩放比例，让宠物看起来更合适
        this.setScale(1);

        // 创建宠物光效
        this.createGlowEffect();

        // 显示宠物等级
        this.createLevelText();
    }

    /**
     * 创建宠物光效
     */
    createGlowEffect() {
        this.glow = this.scene.add.circle(this.x, this.y, 15, 0x00ffff, 0.3);
        this.glow.setDepth(this.depth - 1);
    }

    /**
     * 创建等级显示
     */
    createLevelText() {
        this.levelText = this.scene.add.text(this.x, this.y - 25, `Lv.${this.level}`, {
            fontSize: '12px',
            color: '#00ffff',
            stroke: '#000',
            strokeThickness: 2
        });
        this.levelText.setOrigin(0.5);
        this.levelText.setDepth(this.depth + 1);
    }

    /**
     * 更新宠物状态
     * @param {number} time - 当前时间
     * @param {number} delta - 时间增量
     */
    update(time, delta) {
        // 跟随玩家
        this.followPlayer();

        // 更新光效位置
        this.updateGlowEffect();

        // 更新等级文字位置
        this.updateLevelText();

        // 自动攻击
        this.autoAttack(time);

        // 辅助回血
        this.autoHeal(time);

        // 自动收集
        this.autoCollect();
    }

    /**
     * 跟随玩家
     */
    followPlayer() {
        if (!this.player || !this.player.active) return;

        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 如果距离超过跟随距离，移动向玩家
        if (distance > this.followDistance) {
            const angle = Math.atan2(dy, dx);
            this.body.setVelocity(
                Math.cos(angle) * this.moveSpeed,
                Math.sin(angle) * this.moveSpeed
            );
        } else {
            this.body.setVelocity(0, 0);
        }
    }

    /**
     * 更新光效位置
     */
    updateGlowEffect() {
        if (this.glow && this.glow.active) {
            this.glow.setPosition(this.x, this.y);
        }
    }

    /**
     * 更新等级文字位置
     */
    updateLevelText() {
        if (this.levelText && this.levelText.active) {
            this.levelText.setPosition(this.x, this.y - 25);
        }
    }

    /**
     * 自动攻击
     * @param {number} time - 当前时间
     */
    autoAttack(time) {
        // 检查攻击冷却
        if (time - this.lastAttackTime < this.attackCooldown) return;

        // 查找最近的可攻击敌人
        const enemy = this.findNearestEnemy();

        if (enemy) {
            this.attackEnemy(enemy);
            this.lastAttackTime = time;
        }
    }

    /**
     * 查找最近的敌人
     * @returns {Phaser.GameObjects.Sprite|null}
     */
    findNearestEnemy() {
        let nearestEnemy = null;
        let minDistance = this.attackRange;

        // 使用CombatSystem获取敌人组
        let enemies = null;
        if (this.scene.combatSystem) {
            enemies = this.scene.combatSystem.getEnemiesGroup();
        }

        if (!enemies) return null;

        // 遍历敌人数组
        const enemyArray = Array.isArray(enemies) ? enemies : enemies.getChildren();

        enemyArray.forEach(enemy => {
            if (!enemy || !enemy.active) return;

            // 检查敌人是否有生命值
            const hp = enemy.getData ? enemy.getData('hp') : enemy.hp;
            if (hp === undefined || hp <= 0) return;

            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < minDistance) {
                minDistance = distance;
                nearestEnemy = enemy;
            }
        });

        return nearestEnemy;
    }

    /**
     * 攻击敌人
     * @param {Phaser.GameObjects.Sprite} enemy - 目标敌人
     */
    attackEnemy(enemy) {
        // 创建魔法弹
        const projectile = this.scene.add.circle(this.x, this.y, 5, 0x00ffff);

        // 计算方向
        const dx = enemy.x - this.x;
        const dy = enemy.y - this.y;
        const angle = Math.atan2(dy, dx);

        // 发射魔法弹（使用tween）
        this.scene.tweens.add({
            targets: projectile,
            x: enemy.x,
            y: enemy.y,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                // 造成伤害
                if (enemy.active) {
                    const currentHp = enemy.getData ? enemy.getData('hp') : enemy.hp;
                    const damage = this.damage;
                    const newHp = Math.max(0, currentHp - damage);

                    // 更新敌人生命值
                    if (enemy.setData) {
                        enemy.setData('hp', newHp);
                    } else {
                        enemy.hp = newHp;
                    }

                    // 显示伤害数字（使用CombatSystem或直接创建）
                    if (this.scene.combatSystem) {
                        this.scene.combatSystem.showDamageNumber(enemy.x, enemy.y, damage, false, false, '#00ffff');
                    }

                    // 检查死亡
                    if (newHp <= 0) {
                        // 使用CombatSystem处理敌人死亡
                        if (this.scene.combatSystem) {
                            this.scene.combatSystem.onEnemyKilled(enemy);
                        }
                    }

                    // 获得经验
                    this.gainExperience(10);
                }

                // 移除魔法弹
                projectile.destroy();
            }
        });

        // 播放攻击音效
        if (this.scene.audioManager) {
            this.scene.audioManager.playPetAttack();
        }
    }

    /**
     * 自动回血
     * @param {number} time - 当前时间
     */
    autoHeal(time) {
        // 检查回血冷却
        if (time - this.lastHealTime < this.healCooldown) return;

        // 检查玩家是否需要回血
        if (!this.player || this.player.hp >= this.player.maxHp) return;

        // 回血
        const healAmount = Math.min(this.healAmount, this.player.maxHp - this.player.hp);
        this.player.hp += healAmount;

        // 显示回血数字
        this.scene.showDamageNumber(
            this.player.x,
            this.player.y - 30,
            healAmount,
            false,
            false,
            '#00ff00'
        );

        // 创建回血特效
        this.createHealEffect();

        this.lastHealTime = time;

        // 播放回血音效
        if (this.scene.audioManager) {
            this.scene.audioManager.playHealLight();
        }
    }

    /**
     * 创建回血特效
     */
    createHealEffect() {
        const healEffect = this.scene.add.circle(this.player.x, this.player.y, 30, 0x00ff00, 0.3);

        this.scene.tweens.add({
            targets: healEffect,
            scale: 2,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                healEffect.destroy();
            }
        });
    }

    /**
     * 自动收集
     */
    autoCollect() {
        if (!this.player || !this.scene.collectibles) return;

        const collectibles = this.scene.collectibles.getChildren();

        collectibles.forEach(item => {
            if (!item.active) return;

            const dx = item.x - this.x;
            const dy = item.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // 如果在收集范围内，自动拾取
            if (distance < this.collectRange) {
                this.scene.collectItem(item);
            }
        });
    }

    /**
     * 获得经验值
     * @param {number} amount - 经验值数量
     */
    gainExperience(amount) {
        this.experience += amount;

        // 检查升级
        while (this.experience >= this.experienceToNextLevel) {
            this.levelUp();
        }

        // 更新UI
        this.updatePetUI();
    }

    /**
     * 升级
     */
    levelUp() {
        this.level++;
        this.experience -= this.experienceToNextLevel;
        this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5);

        // 提升属性
        this.damage += 5;
        this.healAmount += 2;
        this.attackRange += 10;
        this.collectRange += 10;

        // 更新等级显示
        this.levelText.setText(`Lv.${this.level}`);

        // 升级特效
        this.createLevelUpEffect();

        // 显示升级提示
        this.scene.showMessage('宠物升级！');

        // 播放升级音效
        if (this.scene.audioManager) {
            this.scene.audioManager.playLevelUp();
        }
    }

    /**
     * 创建升级特效
     */
    createLevelUpEffect() {
        // 创建升级光环
        const levelUpEffect = this.scene.add.circle(this.x, this.y, 50, 0xffff00, 0.5);

        this.scene.tweens.add({
            targets: levelUpEffect,
            scale: 3,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                levelUpEffect.destroy();
            }
        });
    }

    /**
     * 更新宠物UI
     */
    updatePetUI() {
        if (this.scene.petUI) {
            this.scene.petUI.updatePetStats(this);
        }
    }

    /**
     * 获取宠物数据（用于保存）
     * @returns {Object}
     */
    getSaveData() {
        return {
            level: this.level,
            experience: this.experience,
            experienceToNextLevel: this.experienceToNextLevel,
            damage: this.damage,
            healAmount: this.healAmount,
            attackRange: this.attackRange,
            collectRange: this.collectRange
        };
    }

    /**
     * 加载宠物数据（用于读取）
     * @param {Object} data - 保存的数据
     */
    loadSaveData(data) {
        this.level = data.level || 1;
        this.experience = data.experience || 0;
        this.experienceToNextLevel = data.experienceToNextLevel || 100;
        this.damage = data.damage || 10;
        this.healAmount = data.healAmount || 5;
        this.attackRange = data.attackRange || 150;
        this.collectRange = data.collectRange || 100;

        // 更新等级显示
        this.levelText.setText(`Lv.${this.level}`);

        // 更新UI
        this.updatePetUI();
    }

    /**
     * 销毁宠物
     */
    destroy() {
        if (this.glow) this.glow.destroy();
        if (this.levelText) this.levelText.destroy();

        super.destroy();
    }
}
