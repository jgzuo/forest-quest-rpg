/**
 * SkillSystem - 技能系统管理器
 * 管理技能解锁、冷却、施法等
 * @version 1.0 - Milestone 6 Iteration 4
 */
class SkillSystem {
    constructor(scene) {
        this.scene = scene;
        this.player = scene.player;

        // 初始化技能系统
        this.initSkillSystem();

        console.log('⚔️ SkillSystem 初始化完成');
    }

    /**
     * 初始化技能系统
     */
    initSkillSystem() {
        // 技能状态映射
        this.skills = {};
        this.skillKeys = ['whirlwind_slash', 'charge', 'healing_light', 'ultimate'];

        // 初始化每个技能的状态
        this.skillKeys.forEach(skillKey => {
            const def = SKILL_DEFINITIONS[skillKey];
            this.skills[skillKey] = {
                definition: def,
                unlocked: false,
                cooldownRemaining: 0,
                lastCast: 0
            };
        });

        // 检查已解锁的技能
        this.checkUnlockedSkills();

        console.log('⚔️ 技能系统初始化: ' + this.skillKeys.length + ' 个技能');
    }

    /**
     * 检查并解锁技能
     */
    checkUnlockedSkills() {
        const level = this.player?.level || 1;

        this.skillKeys.forEach(skillKey => {
            const skill = this.skills[skillKey];
            const def = skill.definition;

            if (level >= def.unlockLevel && !skill.unlocked) {
                skill.unlocked = true;
                this.onSkillUnlock(skillKey);
            }
        });
    }

    /**
     * 技能解锁时触发 - 增强版庆祝效果
     */
    onSkillUnlock(skillKey) {
        const skill = this.skills[skillKey];
        const def = skill.definition;

        console.log('🔓 技能解锁: ' + def.name);

        // ============ 视觉庆祝效果 ============

        // 1. 屏幕闪光
        this.scene.cameras.main.flash(300, 255, 255, 0);

        // 2. 屏幕震动（轻微）
        this.scene.cameras.main.shake(200, 0.005);

        // 3. 创建解锁圆环特效
        this.createUnlockEffect();

        // 4. 显示多个浮动文字（瀑布效果）
        let delayOffset = 0;
        const messages = [
            `🔓 技能解锁!`,
            def.name,
            `按 ${def.keybinding} 键施放`,
            `消耗 ${def.mpCost} MP`
        ];

        messages.forEach((msg, index) => {
            this.scene.time.delayedCall(delayOffset, () => {
                const color = index === 0 ? '#f6e05e' :
                             index === 1 ? '#4299e1' : '#68d391';
                this.scene.showFloatingText(
                    this.player.x,
                    this.player.y - 100 - (index * 30),
                    msg,
                    color,
                    2500
                );
            });
            delayOffset += 300;
        });

        // 5. 创建粒子爆炸（庆祝效果）
        this.createCelebrationParticles();

        // ============ 音效 ============
        this.scene.audioManager.playSkillUnlock();

        // 刷新技能 UI
        if (this.scene.skillBar) {
            this.scene.skillBar.updateSkillState();
        }
    }

    /**
     * 尝试施放技能
     * @param {string} skillKey - 技能 ID
     * @returns {boolean} 是否成功施放
     */
    castSkill(skillKey) {
        const skill = this.skills[skillKey];

        // 检查技能是否存在
        if (!skill) {
            console.warn('⚠️ 技能不存在: ' + skillKey);
            return false;
        }

        // 检查技能是否解锁
        if (!skill.unlocked) {
            this.scene.showFloatingText(
                this.player.x,
                this.player.y - 40,
                '技能未解锁!',
                '#e53e3e'
            );
            return false;
        }

        // 检查冷却中
        if (this.isCooldown(skillKey)) {
            const remaining = Math.ceil(skill.cooldownRemaining / 1000);
            this.scene.showFloatingText(
                this.player.x,
                this.player.y - 40,
                '冷却中: ' + remaining + '秒',
                '#ed8936'
            );
            return false;
        }

        // 检查 MP
        const def = skill.definition;
        if (!this.scene.resourceManager.consumeMP(def.mpCost)) {
            return false;
        }

        // 施放技能
        this.executeSkill(skillKey);

        // 记录施放时间
        skill.lastCast = this.scene.time.now;
        skill.cooldownRemaining = def.cooldown;

        // 更新技能 UI
        if (this.scene.skillBar) {
            this.scene.skillBar.updateSkillState();
        }

        return true;
    }

    /**
     * 执行技能效果 - 增强版施法动画
     */
    executeSkill(skillKey) {
        const skill = this.skills[skillKey];
        const def = skill.definition;

        console.log('⚔️ 施放技能: ' + def.name);

        // ============ 施法前摇动画 ============
        this.playCastAnimation(skillKey);

        // 延迟显示技能名称（配合前摇）
        this.scene.time.delayedCall(200, () => {
            this.scene.showFloatingText(
                this.player.x,
                this.player.y - 60,
                def.icon + ' ' + def.name,
                '#4299e1',
                1000
            );
        });

        // 根据技能类型执行不同逻辑
        switch (skillKey) {
            case 'whirlwind_slash':
                this.executeWhirlwindSlash(skill);
                break;
            case 'charge':
                this.executeCharge(skill);
                break;
            case 'healing_light':
                this.executeHealingLight(skill);
                break;
            case 'ultimate':
                this.executeUltimate(skill);
                break;
        }
    }

    /**
     * 执行旋风斩 - 增强版
     */
    executeWhirlwindSlash(skill) {
        const def = skill.definition;
        // 从 CombatSystem 或 SceneManager 获取敌人组
        let enemies = null;
        if (this.scene.combatSystem) {
            enemies = this.scene.combatSystem.getEnemiesGroup();
        } else if (this.scene.sceneManager && this.scene.sceneManager.enemies) {
            enemies = this.scene.sceneManager.enemies;
        } else if (this.scene.enemies) {
            enemies = this.scene.enemies;
        }

        if (!enemies) {
            console.warn('⚠️ No enemies group for whirlwind slash');
            return;
        }

        // 创建旋转动画
        this.createWhirlwindSpinEffect(def.aoeRadius);

        // 新增：创建风痕粒子
        if (this.scene.combatParticles) {
            this.scene.combatParticles.createWindTrails(
                this.player.x,
                this.player.y,
                def.aoeRadius * 0.7,
                16
            );
        }

        // 延迟伤害（配合旋转动画）
        this.scene.time.delayedCall(200, () => {
            let hitCount = 0;
            enemies.getChildren().forEach(enemy => {
                if (!enemy.active) return;

                const distance = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y,
                    enemy.x, enemy.y
                );

                if (distance <= def.aoeRadius) {
                    const baseDamage = Math.floor(this.player.attack * def.damageMultiplier);

                    // 创建斩击特效
                    this.createSlashEffect(enemy.x, enemy.y);

                    // 新增：命中时创建火花
                    if (this.scene.combatParticles) {
                        this.scene.combatParticles.createSparks(enemy.x, enemy.y, 10);
                    }

                    hitCount++;

                    // ============ Milestone 7: 使用新的伤害系统 ============
                    if (this.scene.applySkillDamage) {
                        this.scene.applySkillDamage(
                            enemy,
                            baseDamage,
                            def.damageType,
                            def.statusEffect,
                            this.player
                        );
                    } else if (this.scene.hitEnemy) {
                        // 降级处理：使用旧系统
                        enemy.setData('hp', enemy.getData('hp') || enemy.hp || 30);
                        enemy.setData('maxHp', enemy.getData('maxHp') || enemy.maxHp || 30);
                        this.scene.combatSystem.hitEnemy(enemy, baseDamage, 'whirlwind_slash');
                    } else {
                        // 最降级处理：直接伤害
                        const currentHp = enemy.getData('hp') - baseDamage;
                        enemy.setData('hp', currentHp);

                        if (this.scene.combatSystem) {
                            this.scene.combatSystem.showDamageNumber(enemy.x, enemy.y, baseDamage, '#4299e1');
                        }

                        if (currentHp <= 0 && this.scene.combatSystem) {
                            this.scene.combatSystem.enemyDeath(enemy);
                        }
                    }
                }
            });

            // 屏幕震动
            this.scene.cameras.main.shake(150, 0.008);
        });

        // ============ 音效 ============
        this.scene.audioManager.playWhirlwindSlash();

        // 战斗音效系统（新）
        if (this.scene.combatAudioManager) {
            this.scene.combatAudioManager.playSkillSound('whirlwind_slash', 'cast');
        }
    }

    /**
     * 执行冲锋 - 增强版
     */
    executeCharge(skill) {
        const def = skill.definition;
        const facing = this.player.facing || 'front';

        // 确定冲锋方向
        let dx = 0, dy = 0;
        switch (facing) {
            case 'left': dx = -def.dashDistance; break;
            case 'right': dx = def.dashDistance; break;
            case 'up': dy = -def.dashDistance; break;
            case 'down': dy = def.dashDistance; break;
            case 'front': dy = def.dashDistance; break;
            case 'back': dy = -def.dashDistance; break;
        }

        // 边界检测
        const targetX = this.player.x + dx;
        const targetY = this.player.y + dy;
        const clampedX = Phaser.Math.Clamp(targetX, 50, 750);
        const clampedY = Phaser.Math.Clamp(targetY, 50, 550);

        // 创建冲锋拖尾特效
        this.createDashTrail(this.player.x, this.player.y, clampedX, clampedY);

        // 新增：创建地面裂痕
        if (this.scene.combatParticles) {
            const angle = Math.atan2(clampedY - this.player.y, clampedX - this.player.x);
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, clampedX, clampedY);
            const crackCount = Math.floor(distance / 30);

            for (let i = 0; i < crackCount; i++) {
                const progress = i / crackCount;
                const crackX = this.player.x + (clampedX - this.player.x) * progress;
                const crackY = this.player.y + (clampedY - this.player.y) * progress;

                this.scene.time.delayedCall(i * 30, () => {
                    this.scene.combatParticles.createGroundCrack(crackX, crackY, angle, 30);
                });
            }
        }

        // 玩家闪烁（无敌效果）
        const originalAlpha = this.player.alpha;
        this.player.setAlpha(0.5);

        // 执行冲锋移动
        this.scene.tweens.add({
            targets: this.player,
            x: clampedX,
            y: clampedY,
            duration: def.dashDuration,
            ease: 'Power2',
            onComplete: () => {
                // 恢复透明度
                this.player.setAlpha(originalAlpha);

                // 冲锋结束，击退敌人
                this.knockbackEnemies(def.aoeRadius, def.knockbackForce);

                // 冲锋终点特效
                this.createDashImpactEffect(clampedX, clampedY);

                // 新增：多层冲击波
                if (this.scene.combatParticles) {
                    this.scene.combatParticles.createMultiLayerShockwave(clampedX, clampedY, 0xed8936, 3, 100);
                }

                // 屏幕震动
                this.scene.cameras.main.shake(100, 0.01);
            }
        });

        // ============ 音效 ============
        this.scene.audioManager.playCharge();

        // 战斗音效系统（新）
        if (this.scene.combatAudioManager) {
            this.scene.combatAudioManager.playSkillSound('charge', 'cast');
        }
    }

    /**
     * 执行治疗之光 - 增强版
     */
    executeHealingLight(skill) {
        const def = skill.definition;
        const totalHeal = Math.floor(this.player.maxHp * def.healPercent);
        const healPerTick = Math.floor(totalHeal / def.healTicks);

        // 创建持续治疗光环
        this.createHealingAura(def.healDuration);

        // 新增：创建十字架形状
        this.createHealingCross();

        let ticks = 0;
        const healInterval = this.scene.time.addEvent({
            delay: def.healDuration / def.healTicks,
            repeat: def.healTicks,
            callback: () => {
                this.scene.resourceManager.healHP(healPerTick);
                ticks++;

                // 每次治疗的特效
                this.createHealTickEffect();

                // 显示治疗数字
                this.scene.showFloatingText(
                    this.player.x + 30,
                    this.player.y - 40,
                    `+${healPerTick}`,
                    '#48bb78',
                    800
                );

                if (ticks >= def.healTicks) {
                    healInterval.destroy();
                }
            }
        });

        // ============ 音效 ============
        this.scene.audioManager.playHealingLight();

        // 战斗音效系统（新）
        if (this.scene.combatAudioManager) {
            this.scene.combatAudioManager.playSkillSound('healing_light', 'cast');
        }
    }

    /**
     * 新增：创建治疗十字架形状
     */
    createHealingCross() {
        const graphics = this.scene.add.graphics();
        graphics.setDepth(98);
        graphics.lineStyle(4, 0xffffff, 0.6);

        const centerX = this.player.x;
        const centerY = this.player.y;
        const size = 40;

        // 绘制十字架
        graphics.beginPath();
        // 竖线
        graphics.moveTo(centerX, centerY - size);
        graphics.lineTo(centerX, centerY + size);
        // 横线
        graphics.moveTo(centerX - size * 0.6, centerY - size * 0.3);
        graphics.lineTo(centerX + size * 0.6, centerY - size * 0.3);
        graphics.strokePath();

        // 旋转淡出动画
        this.scene.tweens.add({
            targets: graphics,
            rotation: Math.PI / 4,
            alpha: 0,
            scale: 2,
            duration: 1200,
            ease: 'Power2',
            onComplete: () => {
                graphics.destroy();
            }
        });

        // 创建光芒射线（8方向）
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const rayGraphics = this.scene.add.graphics();
            rayGraphics.setDepth(97);
            rayGraphics.lineStyle(2, 0xffffff, 0.4);

            rayGraphics.beginPath();
            rayGraphics.moveTo(centerX, centerY);
            rayGraphics.lineTo(
                centerX + Math.cos(angle) * 80,
                centerY + Math.sin(angle) * 80
            );
            rayGraphics.strokePath();

            this.scene.tweens.add({
                targets: rayGraphics,
                alpha: 0,
                duration: 800,
                delay: i * 50,
                onComplete: () => {
                    rayGraphics.destroy();
                }
            });
        }
    }

    /**
     * 执行终极技能 - 增强版
     */
    executeUltimate(skill) {
        const def = skill.definition;
        // 从 CombatSystem 或 SceneManager 获取敌人组
        let enemies = null;
        if (this.scene.combatSystem) {
            enemies = this.scene.combatSystem.getEnemiesGroup();
        } else if (this.scene.sceneManager && this.scene.sceneManager.enemies) {
            enemies = this.scene.sceneManager.enemies;
        } else if (this.scene.enemies) {
            enemies = this.scene.enemies;
        }

        if (!enemies) {
            console.warn('⚠️ No enemies group for ultimate');
            return;
        }

        // ============ 前摇动画 ============
        // 1. 玩家缩放蓄力
        this.scene.tweens.add({
            targets: this.player,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 300,
            yoyo: true,
            ease: 'Power2'
        });

        // ============ US-009: 大招慢动作效果 ============
        if (this.scene.combatCameraSystem) {
            this.scene.combatCameraSystem.onUltimateCast(this.player.x, this.player.y);
        }

        // 2. 延迟执行伤害（蓄力时间）
        this.scene.time.delayedCall(300, () => {
            // 终极技能期间无敌
            const originalInvincible = this.player.getData('invincible');
            this.player.setData('invincible', true);

            // 玩家发光效果
            const originalTint = this.player.tint;
            this.player.setTint(0xf6e05e);

            // 3倍伤害范围攻击
            enemies.getChildren().forEach(enemy => {
                if (!enemy.active) return;

                const distance = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y,
                    enemy.x, enemy.y
                );

                if (distance <= def.aoeRadius) {
                    const damage = Math.floor(this.player.attack * def.damageMultiplier);

                    // 终极技能特效（对每个敌人）
                    this.createUltimateHitEffect(enemy.x, enemy.y);

                    // 调用伤害函数
                    if (this.scene.combatSystem) {
                        enemy.setData('hp', enemy.getData('hp') || enemy.hp || 30);
                        enemy.setData('maxHp', enemy.getData('maxHp') || enemy.maxHp || 30);
                        this.scene.combatSystem.hitEnemy(enemy, damage, 'ultimate');
                    } else {
                        const currentHp = enemy.getData('hp') - damage;
                        enemy.setData('hp', currentHp);

                        if (this.scene.combatSystem) {
                            this.scene.combatSystem.showDamageNumber(enemy.x, enemy.y, damage, '#f6e05e', 24);
                        }

                        if (currentHp <= 0 && this.scene.combatSystem) {
                            this.scene.combatSystem.enemyDeath(enemy);
                        }
                    }
                }
            });

            // 终极技能视觉特效（更大、更华丽）
            this.createUltimateSuperEffect(def.aoeRadius, def.duration);

            // 新增：大量粒子爆炸
            if (this.scene.combatParticles) {
                this.scene.combatParticles.createDeathExplosion(this.player.x, this.player.y, 0xffcc00, 50);
            }

            // 新增：时间慢动作效果（敌人都减速）
            if (this.scene.enemies) {
                this.scene.enemies.forEach(enemy => {
                    if (enemy.setData) {
                        const originalSpeed = enemy.getData('speed') || 50;
                        enemy.setData('originalSpeed', originalSpeed);
                        enemy.setData('speed', originalSpeed * 0.3);
                    }
                });

                // 恢复敌人速度
                this.scene.time.delayedCall(def.duration, () => {
                    if (this.scene.enemies) {
                        this.scene.enemies.forEach(enemy => {
                            if (enemy.setData && enemy.getData) {
                                const originalSpeed = enemy.getData('originalSpeed');
                                if (originalSpeed) {
                                    enemy.setData('speed', originalSpeed);
                                }
                            }
                        });
                    }
                });
            }

            // 新增：背景变暗突出玩家
            const darkness = this.scene.add.graphics();
            darkness.setDepth(997);
            darkness.fillStyle(0x000000, 0.5);
            darkness.fillRect(0, 0, 800, 600);

            // 创建玩家周围的光圈
            const playerLight = this.scene.add.graphics();
            playerLight.setDepth(998);

            // 使用径向渐变（简化版：多个同心圆）
            for (let i = 10; i > 0; i--) {
                const alpha = 0.1 - (i * 0.008);
                playerLight.fillStyle(0xffcc00, alpha);
                playerLight.fillCircle(this.player.x, this.player.y, def.aoeRadius * (i / 10));
            }

            // 淡出
            this.scene.tweens.add({
                targets: [darkness, playerLight],
                alpha: 0,
                duration: def.duration,
                onComplete: () => {
                    darkness.destroy();
                    playerLight.destroy();
                }
            });

            // 技能结束后取消无敌
            this.scene.time.delayedCall(def.duration, () => {
                this.player.setData('invincible', originalInvincible);
                this.player.setTint(originalTint);
            });
        });

        // ============ 音效 ============
        this.scene.audioManager.playUltimate();

        // 战斗音效系统（新）- 终极技能分阶段音效
        if (this.scene.combatAudioManager) {
            this.scene.combatAudioManager.playSkillSound('ultimate', 'start');

            // 蓄力阶段音效
            this.scene.time.delayedCall(300, () => {
                if (this.scene.combatAudioManager) {
                    this.scene.combatAudioManager.playSkillSound('ultimate', 'release');
                }
            });
        }
    }

    /**
     * 检查技能是否在冷却中
     */
    isCooldown(skillKey) {
        const skill = this.skills[skillKey];
        return skill.cooldownRemaining > 0;
    }

    /**
     * 更新冷却时间
     * @param {number} delta - 时间增量
     */
    updateCooldowns(delta) {
        this.skillKeys.forEach(skillKey => {
            const skill = this.skills[skillKey];

            if (skill.cooldownRemaining > 0) {
                skill.cooldownRemaining = Math.max(0, skill.cooldownRemaining - delta);

                // 更新 UI
                if (this.scene.skillBar) {
                    this.scene.skillBar.updateCooldown(skillKey, skill.cooldownRemaining);
                }
            }
        });
    }

    /**
     * 创建旋风斩特效（旧版，保留兼容性）
     */
    createWhirlwindEffect(radius, duration) {
        // 使用对象池获取graphics对象
        const graphics = this.scene.objectPool.getGraphics();
        graphics.lineStyle(3, 0x4299e1, 0.8);
        graphics.strokeCircle(this.player.x, this.player.y, radius);

        this.scene.tweens.add({
            targets: graphics,
            alpha: 0,
            duration: duration,
            onComplete: () => {
                // 回收到对象池
                this.scene.objectPool.recycleGraphics(graphics);
            }
        });
    }

    /**
     * ============ 新增：旋风斩旋转动画 ============
     */
    createWhirlwindSpinEffect(radius) {
        // 创建多个旋转圆环
        const numRings = 3;
        const rings = [];

        for (let i = 0; i < numRings; i++) {
            // 使用对象池获取graphics对象
            const graphics = this.scene.objectPool.getGraphics();
            const ringRadius = radius * (0.5 + i * 0.25);
            graphics.lineStyle(3, 0x4299e1, 0.6 - i * 0.15);
            graphics.strokeCircle(this.player.x, this.player.y, ringRadius);

            rings.push({
                graphics: graphics,
                rotation: 0,
                radius: ringRadius,
                speed: (i + 1) * 0.1
            });
        }

        // 旋转动画
        const spinDuration = 500;
        const startTime = this.scene.time.now;

        const spinEvent = this.scene.time.addEvent({
            delay: 16,
            repeat: spinDuration / 16,
            callback: () => {
                rings.forEach((ring, index) => {
                    ring.rotation += ring.speed;

                    // 旋转缩放效果
                    const scale = 1 + Math.sin(ring.rotation) * 0.1;
                    ring.graphics.setScale(scale);
                });
            },
            onComplete: () => {
                // 回收所有graphics对象到对象池
                rings.forEach(ring => this.scene.objectPool.recycleGraphics(ring.graphics));
                spinEvent.destroy();
            }
        });
    }

    /**
     * ============ 新增：斩击特效 ============
     */
    createSlashEffect(x, y) {
        // 创建斩击弧线
        const graphics = this.scene.add.graphics();
        graphics.lineStyle(4, 0x4299e1, 1);

        // 绘制弧线
        graphics.beginPath();
        graphics.arc(x, y, 30, 0, Math.PI, false);
        graphics.strokePath();

        // 动画淡出
        this.scene.tweens.add({
            targets: graphics,
            alpha: 0,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 300,
            onComplete: () => {
                graphics.destroy();
            }
        });
    }

    /**
     * ============ 新增：冲锋拖尾特效 ============
     */
    createDashTrail(startX, startY, endX, endY) {
        const distance = Phaser.Math.Distance.Between(startX, startY, endX, endY);
        const numTrails = Math.floor(distance / 20);

        for (let i = 0; i < numTrails; i++) {
            const progress = i / numTrails;
            const x = startX + (endX - startX) * progress;
            const y = startY + (endY - startY) * progress;

            const trail = this.scene.add.circle(x, y, 8, 0xed8936, 0.5);

            this.scene.time.delayedCall(i * 20, () => {
                this.scene.tweens.add({
                    targets: trail,
                    alpha: 0,
                    scale: 0.5,
                    duration: 200,
                    onComplete: () => {
                        trail.destroy();
                    }
                });
            });
        }
    }

    /**
     * ============ 新增：冲锋落地特效 ============
     */
    createDashImpactEffect(x, y) {
        // 创建冲击波圆环
        const graphics = this.scene.add.graphics();
        graphics.lineStyle(4, 0xed8936, 1);
        graphics.strokeCircle(x, y, 30);

        // 扩散动画
        this.scene.tweens.add({
            targets: graphics,
            scale: 2,
            alpha: 0,
            duration: 400,
            ease: 'Power2',
            onComplete: () => {
                graphics.destroy();
            }
        });

        // 创建粒子
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const particle = this.scene.add.circle(x, y, 4, 0xed8936);

            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * 40,
                y: y + Math.sin(angle) * 40,
                alpha: 0,
                duration: 400,
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }

    /**
     * ============ 新增：治疗光环 ============
     */
    createHealingAura(duration) {
        const graphics = this.scene.add.graphics();
        graphics.lineStyle(3, 0x48bb78, 0.5);
        graphics.strokeCircle(this.player.x, this.player.y, 50);

        // 呼吸动画
        this.scene.tweens.add({
            targets: graphics,
            scaleX: 1.2,
            scaleY: 1.2,
            alpha: 0.3,
            duration: duration / 2,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                graphics.destroy();
            }
        });
    }

    /**
     * ============ 新增：单次治疗特效 ============
     */
    createHealTickEffect() {
        // 创建向上飘浮的治疗粒子
        const numParticles = 5;
        for (let i = 0; i < numParticles; i++) {
            const offsetX = (Math.random() - 0.5) * 40;
            const particle = this.scene.add.circle(
                this.player.x + offsetX,
                this.player.y,
                3,
                0x48bb78
            );

            this.scene.tweens.add({
                targets: particle,
                y: this.player.y - 50,
                alpha: 0,
                duration: 800,
                delay: i * 100,
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }

    /**
     * ============ 新增：施法动画 ============
     */
    playCastAnimation(skillKey) {
        // 玩家闪烁（前摇）
        const originalTint = this.player.tint;
        this.player.setTint(0xffffff);

        this.scene.time.delayedCall(200, () => {
            this.player.setTint(originalTint);
        });

        // 根据技能类型播放不同动画
        switch (skillKey) {
            case 'whirlwind_slash':
                // 旋转动画
                this.scene.tweens.add({
                    targets: this.player,
                    angle: this.player.angle + 360,
                    duration: 300,
                    ease: 'Power2',
                    onComplete: () => {
                        this.player.angle = 0;
                    }
                });
                break;
            case 'charge':
                // 向前倾斜
                this.scene.tweens.add({
                    targets: this.player,
                    angle: 15,
                    duration: 100,
                    yoyo: true,
                    onComplete: () => {
                        this.player.angle = 0;
                    }
                });
                break;
            case 'healing_light':
                // 向上浮起
                this.scene.tweens.add({
                    targets: this.player,
                    y: this.player.y - 10,
                    duration: 200,
                    yoyo: true
                });
                break;
            case 'ultimate':
                // 放大缩小（蓄力）
                // 已在executeUltimate中处理
                break;
        }
    }

    /**
     * ============ 新增：技能解锁圆环特效 ============
     */
    createUnlockEffect() {
        const graphics = this.scene.add.graphics();
        graphics.lineStyle(5, 0xf6e05e, 1);
        graphics.strokeCircle(this.player.x, this.player.y, 60);

        // 扩散动画
        this.scene.tweens.add({
            targets: graphics,
            scale: 2,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                graphics.destroy();
            }
        });

        // 第二个圆环（延迟）
        this.scene.time.delayedCall(200, () => {
            const graphics2 = this.scene.add.graphics();
            graphics2.lineStyle(3, 0x4299e1, 0.8);
            graphics2.strokeCircle(this.player.x, this.player.y, 60);

            this.scene.tweens.add({
                targets: graphics2,
                scale: 2,
                alpha: 0,
                duration: 800,
                ease: 'Power2',
                onComplete: () => {
                    graphics2.destroy();
                }
            });
        });
    }

    /**
     * ============ 新增：庆祝粒子爆炸 ============
     */
    createCelebrationParticles() {
        const numParticles = 20;
        const colors = [0xf6e05e, 0x4299e1, 0x48bb78, 0xed8936];

        for (let i = 0; i < numParticles; i++) {
            const angle = (Math.PI * 2 / numParticles) * i;
            const distance = 60 + Math.random() * 40;
            const color = colors[Math.floor(Math.random() * colors.length)];

            const particle = this.scene.add.circle(
                this.player.x,
                this.player.y,
                4,
                color
            );

            const targetX = this.player.x + Math.cos(angle) * distance;
            const targetY = this.player.y + Math.sin(angle) * distance;

            this.scene.tweens.add({
                targets: particle,
                x: targetX,
                y: targetY,
                alpha: 0,
                duration: 1000,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }

    /**
     * ============ 新增：终极技能超级特效 ============
     */
    createUltimateSuperEffect(radius, duration) {
        // 1. 巨大金色圆环
        const graphics = this.scene.add.graphics();
        graphics.lineStyle(8, 0xf6e05e, 1);
        graphics.strokeCircle(this.player.x, this.player.y, radius);

        this.scene.tweens.add({
            targets: graphics,
            alpha: 0,
            scale: 1.5,
            duration: duration,
            onComplete: () => {
                graphics.destroy();
            }
        });

        // 2. 屏幕大闪光
        this.scene.cameras.main.flash(300, 255, 255, 0);

        // 3. 屏幕大震动
        this.scene.cameras.main.shake(300, 0.02);

        // 4. 能量波纹（多个圆环扩散）
        for (let i = 0; i < 3; i++) {
            this.scene.time.delayedCall(i * 150, () => {
                const waveGraphics = this.scene.add.graphics();
                waveGraphics.lineStyle(4, 0xf6e05e, 0.8);
                waveGraphics.strokeCircle(this.player.x, this.player.y, radius * 0.5);

                this.scene.tweens.add({
                    targets: waveGraphics,
                    scale: 2,
                    alpha: 0,
                    duration: 600,
                    onComplete: () => {
                        waveGraphics.destroy();
                    }
                });
            });
        }

        // 5. 光柱效果
        const beamGraphics = this.scene.add.graphics();
        beamGraphics.fillStyle(0xf6e05e, 0.2);
        beamGraphics.fillRect(this.player.x - 20, 0, 40, 600);

        this.scene.tweens.add({
            targets: beamGraphics,
            alpha: 0,
            duration: duration,
            onComplete: () => {
                beamGraphics.destroy();
            }
        });
    }

    /**
     * ============ 新增：终极技能命中特效 ============
     */
    createUltimateHitEffect(x, y) {
        // 创建爆炸效果
        const graphics = this.scene.add.graphics();
        graphics.lineStyle(4, 0xf6e05e, 1);
        graphics.strokeCircle(x, y, 25);

        // 快速扩散
        this.scene.tweens.add({
            targets: graphics,
            scale: 2,
            alpha: 0,
            duration: 400,
            onComplete: () => {
                graphics.destroy();
            }
        });

        // 粒子爆炸
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i;
            const particle = this.scene.add.circle(x, y, 3, 0xf6e05e);

            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * 50,
                y: y + Math.sin(angle) * 50,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }

    /**
     * 击退敌人
     */
    knockbackEnemies(radius, force) {
        const enemies = this.scene.enemies || [];

        enemies.forEach(enemy => {
            if (!enemy.active) return;

            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                enemy.x, enemy.y
            );

            if (distance <= radius) {
                const angle = Phaser.Math.Angle.Between(
                    this.player.x, this.player.y,
                    enemy.x, enemy.y
                );

                const knockbackX = Math.cos(angle) * force;
                const knockbackY = Math.sin(angle) * force;

                enemy.x += knockbackX;
                enemy.y += knockbackY;

                // 伤害
                this.scene.damageEnemy(enemy, this.player.attack);
            }
        });
    }

    /**
     * 获取技能状态
     */
    getSkillState(skillKey) {
        return this.skills[skillKey];
    }

    /**
     * 获取所有技能
     */
    getAllSkills() {
        return this.skills;
    }
}
