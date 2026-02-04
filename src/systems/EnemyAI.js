/**
 * EnemyAI - 敌人AI行为系统
 *
 * 实现敌人智能行为：
 * - 精英敌人特殊攻击模式
 * - Boss多阶段AI行为
 * - 敌人协作（群体攻击）
 * - 格挡/闪避反应
 * - 追踪和逃跑行为
 */
class EnemyAI {
    constructor(scene) {
        this.scene = scene;
        this.player = scene.player;
        this.enemies = [];

        // AI行为配置（从CombatConfig导入）
        this.config = ENEMY_AI_CONFIG || {
            aggroRange: 150,
            loseAggroRange: 300,
            attackRange: 50,
            blockChance: 0.1,
            dodgeChance: 0.05,
            elite: {
                blockChance: 0.2,
                dodgeChance: 0.1,
                damageMultiplier: 2.0,
                healthMultiplier: 5.0,
                speedMultiplier: 1.3
            },
            boss: {
                blockChance: 0.3,
                dodgeChance: 0.15,
                damageMultiplier: 3.0,
                healthMultiplier: 20.0,
                speedMultiplier: 1.5
            },
            cooperation: {
                helpRange: 200,
                callCooldown: 5000,
                maxAttackers: 3
            }
        };

        // 精英特殊攻击模式
        this.eliteAttackPatterns = {
            fire_breath: {
                name: '火焰吐息',
                cooldown: 5000,
                range: 150,
                damage: 25,
                warningTime: 1000,
                execute: (enemy, player) => this.executeFireBreath(enemy, player)
            },
            chain_lightning: {
                name: '连锁闪电',
                cooldown: 8000,
                range: 200,
                damage: 20,
                execute: (enemy, player) => this.executeChainLightning(enemy, player)
            },
            whirlwind: {
                name: '旋风斩',
                cooldown: 10000,
                range: 80,
                damage: 30,
                execute: (enemy, player) => this.executeWhirlwind(enemy)
            }
        };

        // 协作状态
        this.cooperationState = {
            lastCallTime: 0,
            callCooldown: this.config.cooperation?.callCooldown || 5000
        };

        this.aiTimers = new Map(); // 存储每个敌人的AI定时器

        console.log('🤖 敌人AI系统初始化');
    }

    /**
     * 更新所有敌人AI
     */
    update(time, delta) {
        if (!this.scene.enemies) return;

        const enemies = this.scene.enemies.getChildren();
        enemies.forEach(enemy => {
            if (enemy.active) {
                this.updateEnemyAI(enemy, time, delta);
            }
        });
    }

    /**
     * 更新单个敌人AI
     */
    updateEnemyAI(enemy, time, delta) {
        if (enemy.getData('isStunned')) return; // 被眩晕时不行动

        const isElite = enemy.getData('isElite') || false;
        const isBoss = enemy.getData('isBoss') || false;
        const specialAbility = enemy.getData('specialAbility');

        const distance = Phaser.Math.Distance.Between(
            enemy.x, enemy.y,
            this.player.x, this.player.y
        );

        // Boss多阶段行为（US-020）
        if (isBoss && enemy.boss) {
            this.updateBossAI(enemy.boss, distance, time);
            return;
        }

        // 精英特殊攻击（US-019）
        if (isElite && specialAbility && this.eliteAttackPatterns[specialAbility]) {
            this.updateEliteAttack(enemy, specialAbility, distance, time);
        }

        // 注意：基础移动由GameScene.js的原始逻辑处理
        // EnemyAI系统只负责精英特殊攻击和Boss多阶段行为
        // 不在这里调用moveToPlayer()，避免与原始移动逻辑冲突

        // 格挡/闪避反应（US-022）
        if (this.shouldBlockOrDodge(enemy)) {
            this.attemptBlockOrDodge(enemy);
        }
    }

    /**
     * US-019: 精英敌人特殊攻击
     */
    updateEliteAttack(enemy, ability, distance, time) {
        const pattern = this.eliteAttackPatterns[ability];
        if (!pattern) return;

        const lastUse = enemy.getData(`last_${ability}_time`) || 0;

        if (time - lastUse >= pattern.cooldown && distance < pattern.range) {
            // 执行特殊攻击
            if (pattern.execute) {
                pattern.execute(enemy, this.player);
            }

            // 记录使用时间
            enemy.setData(`last_${ability}_time`, time);

            // 显示攻击警告
            if (this.scene.showFloatingText) {
                this.scene.showFloatingText(
                    enemy.x,
                    enemy.y - 60,
                    `⚠️ ${pattern.name}!`,
                    '#ff6600',
                    1200
                );
            }
        }
    }

    /**
     * US-020: Boss多阶段AI行为
     */
    updateBossAI(boss, distance, time) {
        const hpPercent = boss.hp / boss.maxHp;
        const currentPhase = boss.phase || 1;

        // 检查是否需要转换阶段
        let newPhase = 1;
        if (hpPercent <= 0.2) newPhase = 3;
        else if (hpPercent <= 0.5) newPhase = 2;

        if (newPhase !== currentPhase) {
            // 阶段转换（已由Boss类的updatePhase处理）
            boss.phase = newPhase;

            // AI根据阶段改变行为
            this.adjustBossAIByPhase(boss, newPhase);
        }

        // Boss特殊技能释放
        this.useBossSkills(boss, distance, time, currentPhase);
    }

    /**
     * 根据阶段调整Boss AI
     */
    adjustBossAIByPhase(boss, phase) {
        // P1: 基础攻击为主
        // P2: 频繁使用技能
        // P3: 狂暴模式 - 快速攻击 + 高伤害
        boss.aggression = phase === 3 ? 2 : (phase === 2 ? 1.5 : 1);
    }

    /**
     * Boss技能释放
     */
    useBossSkills(boss, distance, time, phase) {
        // 根据Boss类型和阶段使用不同技能
        if (boss.skillType === 'nature' && this.castNatureSkills) {
            // 由Boss类处理，这里留空
        }
    }

    /**
     * US-021: 敌人协作
     */
    triggerCooperation(attacker) {
        const now = this.scene.time.now;

        if (now - this.cooperationState.lastCallTime < this.cooperationState.callCooldown) {
            return;
        }

        // 召唤附近敌人一起攻击
        const nearbyEnemies = this.getNearbyEnemies(attacker, this.config.cooperation?.helpRange || 200);

        nearbyEnemies.forEach(ally => {
            if (ally.active && ally !== attacker) {
                // 设置协作攻击状态
                ally.setData('cooperating', true);
                ally.setData('cooperationTarget', this.player);

                // 协作加速
                const originalSpeed = ally.getData('speed') || 50;
                ally.setData('speed', originalSpeed * 1.2);

                // 5秒后恢复正常
                this.scene.time.delayedCall(5000, () => {
                    if (ally.active) {
                        ally.setData('cooperating', false);
                        ally.setData('cooperationTarget', null);
                        ally.setData('speed', originalSpeed);
                    }
                });
            }
        });

        this.cooperationState.lastCallTime = now;
    }

    /**
     * 获取附近敌人
     */
    getNearbyEnemies(sourceEnemy, range) {
        const nearby = [];
        const enemies = this.scene.enemies.getChildren();

        enemies.forEach(enemy => {
            if (enemy.active && enemy !== sourceEnemy) {
                const distance = Phaser.Math.Distance.Between(
                    sourceEnemy.x, sourceEnemy.y,
                    enemy.x, enemy.y
                );
                if (distance <= range) {
                    nearby.push(enemy);
                }
            }
        });

        // 限制最大同时攻击数量
        return nearby.slice(0, this.config.cooperation?.maxAttackers || 3);
    }

    /**
     * US-022: 格挡/闪避反应
     */
    shouldBlockOrDodge(enemy) {
        const isElite = enemy.getData('isElite') || false;
        const isBoss = enemy.getData('isBoss') || false;

        // 精英/Boss有更高的格挡/闪避几率
        let blockChance = this.config.blockChance;
        let dodgeChance = this.config.dodgeChance;

        if (isElite) {
            blockChance = this.config.elite.blockChance;
            dodgeChance = this.config.elite.dodgeChance;
        } else if (isBoss) {
            blockChance = this.config.boss.blockChance;
            dodgeChance = this.config.boss.dodgeChance;
        }

        // 随机判断
        return Math.random() < blockChance || Math.random() < dodgeChance;
    }

    /**
     * 尝试格挡或闪避
     */
    attemptBlockOrDodge(enemy) {
        const action = Math.random() < 0.5 ? 'block' : 'dodge';

        if (action === 'block') {
            this.performBlock(enemy);
        } else {
            this.performDodge(enemy);
        }
    }

    /**
     * 执行格挡
     */
    performBlock(enemy) {
        // 显示格挡图标
        const blockIcon = this.scene.add.text(
            enemy.x,
            enemy.y - 40,
            '🛡️',
            { fontSize: '24px' }
        ).setOrigin(0.5);
        blockIcon.setDepth(151);

        // 格挡姿态
        enemy.setTint(0x4fc3f7);

        this.scene.time.delayedCall(300, () => {
            if (enemy.active) {
                enemy.clearTint();
                blockIcon.destroy();
            }
        });
    }

    /**
     * 执行闪避
     */
    performDodge(enemy) {
        // 计算闪避方向（远离玩家）
        const angle = Phaser.Math.Angle.Between(
            this.player.x, this.player.y,
            enemy.x, enemy.y
        );

        // 快速移动
        const dodgeDistance = 50;
        const newX = enemy.x + Math.cos(angle) * dodgeDistance;
        const newY = enemy.y + Math.sin(angle) * dodgeDistance;

        this.scene.tweens.add({
            targets: enemy,
            x: newX,
            y: newY,
            duration: 200,
            ease: 'Power2'
        });

        // 显示闪避图标
        const dodgeIcon = this.scene.add.text(
            enemy.x,
            enemy.y - 40,
            '💨',
            { fontSize: '20px' }
        ).setOrigin(0.5);
        dodgeIcon.setDepth(151);

        this.scene.time.delayedCall(200, () => {
            dodgeIcon.destroy();
        });
    }

    /**
     * 移动向玩家
     */
    moveToPlayer(enemy) {
        const speed = enemy.getData('speed') || 50;
        const angle = Phaser.Math.Angle.Between(
            enemy.x, enemy.y,
            this.player.x, this.player.y
        );

        enemy.x += Math.cos(angle) * speed * 0.016; // delta time approximation
        enemy.y += Math.sin(angle) * speed * 0.016;
    }

    // ==================== 精英特殊攻击实现 ====================

    /**
     * 火焰吐息
     */
    executeFireBreath(enemy, player) {
        const pattern = this.eliteAttackPatterns.fire_breath;

        // 显示预警锥形
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
        const warningCone = this.scene.add.graphics();
        warningCone.setDepth(150);
        warningCone.lineStyle(3, 0xff4500, 0.8);
        warningCone.beginPath();

        for (let a = angle - 0.4; a <= angle + 0.4; a += 0.1) {
            const r = a === angle - 0.4 ? 0 : angle + 0.4;
            warningCone.lineTo(
                enemy.x + Math.cos(a) * pattern.range,
                enemy.y + Math.sin(a) * pattern.range
            );
        }
        warningCone.closePath();
        warningCone.strokePath();

        // 预警文字
        const warningText = this.scene.add.text(
            enemy.x,
            enemy.y - 50,
            '🔥 火焰!',
            { font: 'bold 18px Arial', fill: '#ff4500' }
        ).setOrigin(0.5);
        warningText.setDepth(151);

        // 延迟释放伤害
        this.scene.time.delayedCall(pattern.warningTime, () => {
            warningCone.destroy();
            warningText.destroy();

            // 检查玩家是否在范围内
            const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, player.x, player.y);
            const playerAngle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
            const angleDiff = Math.abs(playerAngle - angle);

            if (distance < pattern.range && angleDiff < 0.4) {
                // 造成伤害
                if (this.scene.damagePlayer) {
                    this.scene.damagePlayer(pattern.damage);
                }
            }
        });
    }

    /**
     * 连锁闪电
     */
    executeChainLightning(enemy, player) {
        // 显示闪电警告
        for (let i = 0; i < 3; i++) {
            this.scene.time.delayedCall(i * 200, () => {
                const lightning = this.scene.add.graphics();
                lightning.setDepth(150);
                lightning.lineStyle(3, 0x9966ff, 1);
                lightning.beginPath();
                lightning.moveTo(enemy.x, enemy.y);

                const targets = [player].concat(
                    this.getNearbyEnemies(enemy, 150).slice(0, 2)
                );

                targets.forEach((target, index) => {
                    if (target && target.active && target !== enemy) {
                        lightning.lineTo(target.x, target.y);
                        if (index < targets.length - 1) {
                            lightning.moveTo(enemy.x, enemy.y);
                        }
                    }
                });

                lightning.strokePath();

                // 伤害
                if (this.scene.damagePlayer) {
                    this.scene.damagePlayer(20);
                }

                this.scene.time.delayedCall(100, () => {
                    lightning.destroy();
                });
            });
        }
    }

    /**
     * 旋风斩
     */
    executeWhirlwind(enemy) {
        // 显示旋风效果
        const whirlwind = this.scene.add.graphics();
        whirlwind.setDepth(149);

        for (let i = 0; i < 4; i++) {
            whirlwind.lineStyle(3, 0x87ceeb, 0.6);
            whirlwind.strokeCircle(enemy.x, enemy.y, 40 + i * 15);
        }

        // 旋转
        this.scene.tweens.add({
            targets: whirlwind,
            rotation: Math.PI * 2,
            duration: 1000,
            onComplete: () => {
                whirlwind.destroy();
            }
        });

        // 范围内伤害
        const nearbyEnemies = this.getNearbyEnemies(enemy, 60);
        // 简化：直接对玩家造成伤害
        if (this.scene.damagePlayer) {
            this.scene.damagePlayer(30);
        }
    }

    /**
     * 清理AI系统
     */
    destroy() {
        this.aiTimers.forEach(timer => {
            if (timer) timer.remove();
        });
        this.aiTimers.clear();
        console.log('🤖 敌人AI系统已销毁');
    }
}
