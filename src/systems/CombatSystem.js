/**
 * CombatSystem - 战斗系统
 * 
 * 负责处理所有战斗相关的逻辑：
 * - 玩家攻击
 * - 敌人伤害和死亡
 * - 伤害显示
 * - 战斗特效
 * - 掉落物品
 * 
 * 从 GameScene.js 提取的战斗相关代码
 * 原始位置：行 893-1487, 1656-1670
 */

class CombatSystem {
    constructor(scene) {
        this.scene = scene;
        this.enemies = [];
        console.log('⚔️ CombatSystem 初始化');
    }

    /**
     * 获取敌人组
     * 用于碰撞检测
     */
    getEnemiesGroup() {
        // 优先从 SceneManager 获取
        if (this.scene.sceneManager && this.scene.sceneManager.enemies) {
            return this.scene.sceneManager.enemies;
        }
        // 其次从 scene 直接获取
        if (this.scene.enemies) {
            return this.scene.enemies;
        }
        return null;
    }

    /**
     * 玩家攻击
     * 原始位置：GameScene.js 893-942
     */
    playerAttack() {
        if (!this.scene.player || !this.scene.player.active) return;

        const player = this.scene.player;

        // 检查是否正在攻击
        if (player.isAttacking) return;

        player.isAttacking = true;

        // 播放攻击动画（使用动画系统）
        const attackAnimKey = `attack-${player.facing}`;
        player.anims.play(attackAnimKey, true);

        // 获取敌人组（使用安全方法）
        const enemies = this.getEnemiesGroup();
        if (!enemies || enemies.getChildren().length === 0) {
            console.log('⚠️ No enemies to attack');
            player.isAttacking = false;
            return;
        }

        // ============ 修复：使用手动距离检测而不是overlap ============
        const hitboxX = player.x + (player.facing === 'side' && player.flipX ? -30 : 30);
        const hitboxY = player.y;
        const hitboxRadius = 50; // 攻击范围半径

        // 标记是否已击中敌人（防止多重命中）
        let hasHit = false;

        enemies.getChildren().forEach(enemy => {
            // 验证敌人活跃
            if (!enemy.active) return;

            // 计算玩家到敌人的距离
            const distance = Phaser.Math.Distance.Between(hitboxX, hitboxY, enemy.x, enemy.y);

            // 如果在攻击范围内
            if (distance <= hitboxRadius) {
                console.log(`🎯 击中敌人！距离: ${distance.toFixed(1)}`);
                this.hitEnemy(enemy);
                hasHit = true;
            }
        });

        if (!hasHit) {
            console.log('❌ 未击中任何敌人');
        }

        // 攻击冷却（300ms后恢复）
        this.scene.time.delayedCall(300, () => {
            player.isAttacking = false;
            if (this.scene.resetPlayerAnimation) {
                this.scene.resetPlayerAnimation();
            }
        });
    }

    /**
     * 应用技能伤害
     * 原始位置：GameScene.js 962-1030
     */
    applySkillDamage(skillId, enemies, damage) {
        if (!enemies || enemies.length === 0) return;

        enemies.forEach((enemy, index) => {
            if (enemy && enemy.active) {
                // 延迟伤害应用，产生波次效果
                this.scene.time.delayedCall(index * 50, () => {
                    this.hitEnemy(enemy, damage, skillId);
                });
            }
        });
    }

    /**
     * 击中敌人
     * 原始位置：GameScene.js 1032-1146
     */
    hitEnemy(enemy, damage = null, skillId = null) {
        if (!enemy || !enemy.active) return;

        const player = this.scene.player;

        // 如果未指定伤害，使用基础伤害
        if (damage === null) {
            damage = player.getData('attack') || 10;
        }

        // ============ v1.9.4: 修复属性访问方式 ============
        // 检查暴击（使用直接属性访问，而不是getData）
        const critChance = player.critChance || 0.1;
        const critDamage = player.critDamage || 0;  // 装备的暴击伤害加成
        const isCrit = Math.random() < critChance;
        if (isCrit) {
            // 基础暴击倍率1.5倍 + 装备加成（0.0-1.0）
            // 例如：王者之剑(critDamage:0.25) = 1.75倍，屠龙剑(critDamage:0.5) = 2.0倍
            const critMultiplier = 1.5 + critDamage;
            damage = Math.floor(damage * critMultiplier);
        }

        // 应用连击加成
        let finalDamage = damage;
        if (this.scene.comboSystem) {
            finalDamage = this.scene.comboSystem.applyComboDamage(damage);
        }

        // 应用伤害类型加成
        if (this.scene.damageTypeManager && skillId) {
            const skillData = this.scene.skillSystem.getSkillData(skillId);
            if (skillData && skillData.damageType) {
                finalDamage = this.scene.damageTypeManager.calculateDamage(
                    finalDamage,
                    skillData.damageType,
                    enemy.getData('weaknesses') || []
                );
            }
        }

        // 扣减敌人 HP
        const currentHP = enemy.hp || 10;
        enemy.hp = Math.max(0, currentHP - finalDamage);

        // 显示伤害数字
        const damageColor = isCrit ? '#ff00ff' : '#ff0000';
        const damageSize = isCrit ? 30 : 20;

        // 使用增强伤害数字系统（如果可用）
        if (this.scene.enhancedDamageText) {
            this.scene.enhancedDamageText.show(
                enemy.x,
                enemy.y,
                finalDamage,
                isCrit ? 'crit' : 'normal'
            );

            // 暴击时添加装备发光特效
            if (isCrit && this.scene.equipmentEffects) {
                this.scene.equipmentEffects.createCritWeaponGlow(this.player);
            }
        } else {
            // 降级到旧系统
            this.showDamageNumber(enemy.x, enemy.y, finalDamage, damageColor, damageSize);
        }

        // 创建命中特效
        if (isCrit) {
            this.createCriticalHitEffect(enemy.x, enemy.y);
            // 暴击时创建火花
            if (this.scene.combatParticles) {
                this.scene.combatParticles.createSparks(enemy.x, enemy.y, 20);
            }
        } else {
            this.createHitEffect(enemy.x, enemy.y);
            // 普通攻击创建血液溅射
            if (this.scene.combatParticles) {
                this.scene.combatParticles.createBloodSplatter(enemy.x, enemy.y, 8);
            }
        }

        // 应用元素伤害特效（如果有技能ID）
        if (skillId && this.scene.elementEffects && this.scene.skillSystem) {
            const skillData = this.scene.skillSystem.getSkillData(skillId);
            if (skillData && skillData.damageType) {
                this.scene.elementEffects.applyEffect(skillData.damageType, enemy, finalDamage);
            }
        }

        // 添加连击
        if (this.scene.comboSystem) {
            this.scene.comboSystem.incrementCombo();
        }

        // 播放音效
        if (this.scene.audioManager) {
            if (isCrit) {
                this.scene.audioManager.playCriticalHit();
            } else {
                this.scene.audioManager.playPlayerHit();
            }
        }

        // ============ 战斗相机系统 ============
        // US-008: 攻击命中相机震动 / US-012: 暴击特写效果
        if (this.scene.combatCameraSystem) {
            if (isCrit) {
                // 暴击：强烈震动 + 缩放特写
                this.scene.combatCameraSystem.onHitCrit(enemy.x, enemy.y);
            } else {
                // 普通命中：轻微震动
                this.scene.combatCameraSystem.onHitNormal();
            }
        }

        // 更新敌人状态
        this.updateEnemyState(enemy);

        // 检查敌人是否死亡
        if (enemy.hp <= 0) {
            this.enemyDeath(enemy);
        }
    }

    /**
     * 更新敌人状态（被击中后）
     * ============ US-018: 敌人受击反馈动画增强 ============
     */
    updateEnemyState(enemy) {
        if (!enemy) return;

        const isElite = enemy.getData('isElite') || false;
        const isBoss = enemy.getData('isBoss') || false;

        // 1. 闪烁效果
        enemy.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            if (enemy.active) {
                enemy.clearTint();
            }
        });

        // 2. 击中缩放动画（Pop效果）
        const originalScale = enemy.scaleX;
        enemy.setScale(originalScale * 1.1);
        this.scene.tweens.add({
            targets: enemy,
            scaleX: originalScale,
            scaleY: originalScale,
            duration: 150,
            ease: 'Elastic.easeOut'
        });

        // 3. 精英/Boss特殊受击反应
        if (isElite || isBoss) {
            // 精英敌人受击时震动
            this.scene.tweens.add({
                targets: enemy,
                x: enemy.x + Phaser.Math.Between(-3, 3),
                y: enemy.y + Phaser.Math.Between(-3, 3),
                duration: 100,
                repeat: 2,
                ease: 'Power2'
            });

            // 受击文字提示
            if (this.scene.showFloatingText) {
                const text = isBoss ? '💢 BOSS!' : '⚠️ 精英!';
                this.scene.showFloatingText(enemy.x, enemy.y - 50, text, '#ff6600', 600);
            }
        }

        // 4. 添加击退效果
        const knockbackDistance = isBoss ? 10 : (isElite ? 15 : 20);
        const angle = Phaser.Math.Angle.Between(
            this.player.x,
            this.player.y,
            enemy.x,
            enemy.y
        );

        const oldX = enemy.x;
        const oldY = enemy.y;
        const newX = enemy.x + Math.cos(angle) * knockbackDistance;
        const newY = enemy.y + Math.sin(angle) * knockbackDistance;

        // 创建击退轨迹
        if (this.scene.combatParticles) {
            this.scene.combatParticles.createContinuousKnockbackTrail(enemy, 200);
        }

        // 执行击退移动
        this.scene.tweens.add({
            targets: enemy,
            x: newX,
            y: newY,
            duration: 200,
            ease: 'Power2'
        });
    }

    /**
     * 创建暴击特效
     * 原始位置：GameScene.js 1151-1171
     */
    createCriticalHitEffect(x, y) {
        const effect = this.scene.add.graphics();
        effect.setDepth(100);

        // 绘制暴击图标
        effect.lineStyle(3, 0xff00ff);
        effect.strokeCircle(x, y - 40, 30);

        const text = this.scene.add.text(x, y - 40, 'CRITICAL!', {
            font: 'bold 20px Arial',
            fill: '#ff00ff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        text.setDepth(101);

        // 动画后销毁
        this.scene.tweens.add({
            targets: [effect, text],
            alpha: 0,
            duration: 500,
            onComplete: () => {
                effect.destroy();
                text.destroy();
            }
        });
    }

    /**
     * 创建命中特效
     * 原始位置：GameScene.js 1176-1201
     */
    createHitEffect(x, y) {
        const effect = this.scene.add.graphics();
        effect.setDepth(100);

        // 绘制命中波纹
        effect.lineStyle(2, 0xffffff);
        effect.strokeCircle(x, y, 20);

        this.scene.tweens.add({
            targets: effect,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                effect.destroy();
            }
        });
    }

    /**
     * 创建死亡特效
     * 原始位置：GameScene.js 1206-1239
     */
    createDeathEffect(x, y) {
        // 创建死亡动画
        const effect = this.scene.add.graphics();
        effect.setDepth(100);

        // 绘制死亡光圈
        effect.lineStyle(3, 0xffff00);
        effect.strokeCircle(x, y, 30);

        this.scene.tweens.add({
            targets: effect,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                effect.destroy();
            }
        });

        // 显示"击败"文字
        const text = this.scene.add.text(x, y, '击败!', {
            font: 'bold 16px Arial',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        text.setDepth(101);

        this.scene.tweens.add({
            targets: text,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                text.destroy();
            }
        });
    }

    /**
     * 敌人死亡处理
     * 原始位置：GameScene.js 1241-1374
     */
    enemyDeath(enemy) {
        if (!enemy) return;

        const enemyType = enemy.getData('type') || 'unknown';
        const enemyLevel = enemy.getData('level') || 1;

        // 创建死亡特效
        this.createDeathEffect(enemy.x, enemy.y);

        // 创建死亡粒子爆炸
        if (this.scene.combatParticles) {
            this.scene.combatParticles.createDeathExplosion(enemy.x, enemy.y, null, 25);
        }

        // 检查是否是Boss死亡，隐藏Boss血条
        const isBoss = enemy.getData('isBoss') || false;
        if (this.scene.bossHealthBar) {
            const enemyName = enemy.getData('name') || enemy.name || '';
            if (this.scene.bossHealthBar.isBoss(enemyName)) {
                this.scene.bossHealthBar.hide();
            }
        }

        // ============ US-010: Boss击杀相机推拉效果 ============
        if (isBoss && this.scene.combatCameraSystem) {
            this.scene.combatCameraSystem.onBossDeath(enemy.x, enemy.y);
        }

        // 应用状态效果（如果有）
        if (this.scene.statusEffectSystem && enemy.statusEffects) {
            this.scene.statusEffectSystem.clearStatusEffects(enemy);
        }

        // 获取经验值和金币
        const xp = enemy.getData('xp') || 10;
        const gold = enemy.getData('gold') || 5;
        const specialAbility = enemy.getData('specialAbility');

        // 调用 GameScene 的方法处理奖励和逻辑
        if (this.scene.gainXP) {
            this.scene.gainXP(xp);
        }

        // 增加金币
        if (this.scene.player) {
            this.scene.player.gold += gold;
        }

        // 移除敌人
        enemy.destroy();

        // 显示获得奖励提示
        if (this.scene.showFloatingText) {
            this.scene.showFloatingText(enemy.x, enemy.y, `+${xp} XP`, '#4facfe');
            this.scene.showFloatingText(enemy.x, enemy.y - 20, `+${gold} G`, '#ffd700');

            // ============ Milestone 7: 消耗品掉落系统 ============
            this.rollConsumableDrop(enemy, enemyType, specialAbility);
        }

        // 更新UI
        if (this.scene.updateUI) {
            this.scene.updateUI();
        }

        // 更新游戏进度
        if (window.gameData && window.gameData.progress) {
            window.gameData.progress.enemiesDefeated++;

            // 检查成就：第一次击杀
            if (window.gameData.progress.enemiesDefeated === 1 && this.scene.achievementManager) {
                this.scene.achievementManager.unlock('first_blood');
            }

            // 检查成就：鼹鼠猎人
            if (window.gameData.progress.enemiesDefeated >= 10 && this.scene.achievementManager) {
                this.scene.achievementManager.unlock('mole_hunter');
            }
        }

        // 更新敌人类型统计
        if (window.gameData && window.gameData.enemiesDefeated && enemyType) {
            if (!window.gameData.enemiesDefeated[enemyType]) {
                window.gameData.enemiesDefeated[enemyType] = 0;
            }
            window.gameData.enemiesDefeated[enemyType]++;

            // Boss特殊处理
            if (enemy.getData('isBoss')) {
                const bossKey = `boss_${enemyType}`;
                if (!window.gameData.enemiesDefeated[bossKey]) {
                    window.gameData.enemiesDefeated[bossKey] = 0;
                }
                window.gameData.enemiesDefeated[bossKey]++;
            }
        }

        // 播放音效
        if (this.scene.audioManager) {
            this.scene.audioManager.playEnemyDeath();
        }

        // 更新任务目标
        if (this.scene.questManager && enemyType) {
            this.scene.questManager.onEnemyKilled(enemyType);
        }

        // 触发敌人死亡事件（用于竞技场系统）
        if (this.scene.events) {
            this.scene.events.emit('enemyDeath', enemyType);
        }
    }

    /**
     * 随机掉落物品
     * 原始位置：GameScene.js 1380-1487
     */
    rollConsumableDrop(enemy) {
        if (!enemy) return;

        const dropChance = 0.3; // 30% 掉落率

        if (Math.random() < dropChance) {
            // 随机选择消耗品
            const consumables = [
                { id: 'health_potion_small', name: '小生命药水', effect: 'heal', value: 30 },
                { id: 'mana_potion_small', name: '小魔力药水', effect: 'restore_mp', value: 20 }
            ];

            const drop = consumables[Math.floor(Math.random() * consumables.length)];

            // 添加到物品栏
            if (this.scene.inventory) {
                this.scene.inventory.addItem(drop.id);
            }

            // 显示获得提示
            if (this.scene.showFloatingText) {
                this.scene.showFloatingText(
                    enemy.x,
                    enemy.y,
                    `获得 ${drop.name}!`,
                    '#ffd700'
                );
            }

            console.log(`🎁 掉落物品: ${drop.name}`);
        }
    }

    /**
     * 显示伤害数字
     * 原始位置：GameScene.js 1656-1670
     */
    showDamageNumber(x, y, damage, color = '#ff0000', size = 20) {
        // 使用对象池获取文本对象
        const text = this.scene.objectPool.getDamageText(x, y, damage, color, size);

        this.scene.tweens.add({
            targets: text,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                // 回收到对象池而不是销毁
                this.scene.objectPool.recycleDamageText(text);
            }
        });
    }

    /**
     * 添加敌人到管理器
     */
    addEnemy(enemy) {
        if (enemy) {
            this.enemies.push(enemy);
        }
    }

    /**
     * 移除敌人
     */
    removeEnemy(enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }
    }

    /**
     * 清除所有敌人
     */
    clearEnemies() {
        this.enemies = [];
    }

    /**
     * 获取所有敌人
     */
    getAllEnemies() {
        return this.enemies;
    }
}
