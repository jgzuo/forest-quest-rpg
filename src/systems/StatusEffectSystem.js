/**
 * StatusEffectSystem - 状态效果系统
 * 管理战斗中的状态效果（中毒、减速、眩晕等）
 * @version 1.0 - Milestone 7
 */
class StatusEffectSystem {
    constructor(scene) {
        this.scene = scene;
        this.activeEffects = [];  // 所有活动状态效果

        // 状态效果定义
        this.effectTypes = {
            poison: {
                name: '中毒',
                nameEn: 'Poison',
                color: '#48bb78',
                icon: '☠️',
                duration: 5000,      // 持续5秒
                tickRate: 1000,     // 每1秒造成一次伤害
                damagePercent: 0.05, // 每次造成最大HP的5%伤害
                stackable: true      // 可叠加
            },
            burn: {
                name: '燃烧',
                nameEn: 'Burn',
                color: '#ed8936',
                icon: '🔥',
                duration: 4000,
                tickRate: 500,      // 每0.5秒造成一次伤害
                damagePercent: 0.03,
                stackable: true
            },
            freeze: {
                name: '冰冻',
                nameEn: 'Freeze',
                color: '#4299e1',
                icon: '❄️',
                duration: 2000,
                tickRate: 0,
                damagePercent: 0,
                slowPercent: 1.0,   // 100%减速（无法移动）
                stackable: false
            },
            slow: {
                name: '减速',
                nameEn: 'Slow',
                color: '#9f7aea',
                icon: '🐌',
                duration: 3000,
                tickRate: 0,
                damagePercent: 0,
                slowPercent: 0.5,   // 50%减速
                stackable: false
            },
            stun: {
                name: '眩晕',
                nameEn: 'Stun',
                color: '#ffd700',
                icon: '💫',
                duration: 1000,
                tickRate: 0,
                damagePercent: 0,
                slowPercent: 1.0,   // 无法移动或攻击
                stackable: false
            },
            knockback: {
                name: '击退',
                nameEn: 'Knockback',
                color: '#ff6b6b',
                icon: '💨',
                duration: 500,
                tickRate: 0,
                damagePercent: 0,
                pushForce: 100,      // 击退力度
                stackable: false
            }
        };

        console.log('🌡️ StatusEffectSystem 初始化完成');
    }

    /**
     * 对目标应用状态效果
     * @param {object} target - 目标（敌人或玩家）
     * @param {string} effectType - 效果类型
     * @param {object} source - 施放者（玩家或敌人）
     */
    applyEffect(target, effectType, source = null) {
        const effectDef = this.effectTypes[effectType];
        if (!effectDef) {
            console.warn(`⚠️ 未知状态效果: ${effectType}`);
            return;
        }

        // 检查目标是否已有该效果
        const existingEffect = this.activeEffects.find(e =>
            e.target === target && e.type === effectType
        );

        if (existingEffect) {
            if (effectDef.stackable) {
                // 可叠加效果：增加层数
                existingEffect.stacks++;
                existingEffect.endTime = this.scene.time.now + effectDef.duration;
                console.log(`📈 ${effectType} 叠加到 ${existingEffect.stacks} 层`);
            } else {
                // 不可叠加效果：刷新持续时间
                existingEffect.endTime = this.scene.time.now + effectDef.duration;
                console.log(`🔄 ${effectType} 持续时间刷新`);
            }
        } else {
            // 新效果
            const effect = {
                id: `${effectType}_${target.getData('type')}_${Date.now()}`,
                type: effectType,
                target: target,
                source: source,
                startTime: this.scene.time.now,
                endTime: this.scene.time.now + effectDef.duration,
                lastTick: 0,
                stacks: 1,
                definition: effectDef
            };

            this.activeEffects.push(effect);
            console.log(`✨ 应用 ${effectType} 到 ${target.getData('type')}`);

            // 应用即时效果
            this.applyInstantEffect(effect);

            // 显示状态图标
            this.showStatusIcon(target, effect);
        }
    }

    /**
     * 应用即时效果（减速、击退等）
     */
    applyInstantEffect(effect) {
        const target = effect.target;
        const def = effect.definition;

        // 减速效果
        if (def.slowPercent > 0) {
            const baseSpeed = target.getData('speed') || target.speed || 100;
            const newSpeed = baseSpeed * (1 - def.slowPercent);
            target.setData('originalSpeed', baseSpeed);
            target.setData('speed', newSpeed);

            // 如果是敌人，更新速度
            if (target.setVelocity) {
                target.speed = newSpeed;
            }
        }

        // 击退效果
        if (def.pushForce && effect.source) {
            const angle = Phaser.Math.Angle.Between(
                effect.source.x,
                effect.source.y,
                target.x,
                target.y
            );

            const pushX = Math.cos(angle) * def.pushForce;
            const pushY = Math.sin(angle) * def.pushForce;

            if (target.body && target.body.active) {
                target.body.setVelocity(pushX, pushY);
            }
        }
    }

    /**
     * 显示状态图标
     */
    showStatusIcon(target, effect) {
        const def = effect.definition;
        const icon = this.scene.add.text(target.x, target.y - 40, def.icon, {
            font: '20px Arial',
            fill: def.color,
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(200);

        // 添加呼吸动画
        this.scene.tweens.add({
            targets: icon,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        effect.icon = icon;
    }

    /**
     * 更新所有活动状态效果
     */
    update(time, delta) {
        // 从后往前遍历，方便删除
        for (let i = this.activeEffects.length - 1; i >= 0; i--) {
            const effect = this.activeEffects[i];

            // 检查效果是否过期
            if (time >= effect.endTime) {
                this.removeEffect(effect);
                this.activeEffects.splice(i, 1);
                continue;
            }

            // 更新图标位置
            if (effect.icon && effect.icon.active && effect.target.active) {
                effect.icon.setPosition(effect.target.x, effect.target.y - 40);
            }

            // DoT效果（持续伤害）
            const def = effect.definition;
            if (def.tickRate > 0 && def.damagePercent > 0) {
                if (time - effect.lastTick >= def.tickRate) {
                    this.applyDotDamage(effect);
                    effect.lastTick = time;
                }
            }
        }
    }

    /**
     * 应用持续伤害
     */
    applyDotDamage(effect) {
        const target = effect.target;
        const def = effect.definition;

        if (!target.active) return;

        const maxHp = target.getData('maxHp') || target.maxHp || 100;
        const baseDamage = Math.floor(maxHp * def.damagePercent);
        const totalDamage = baseDamage * effect.stacks;

        const currentHp = target.getData('hp') || target.hp;
        const newHp = Math.max(0, currentHp - totalDamage);

        target.setData('hp', newHp);

        // 显示伤害数字
        const color = def.color;
        if (this.scene.combatSystem) {
            this.scene.combatSystem.showDamageNumber(target.x, target.y, totalDamage, color, 16);
        }

        // 更新血条
        if (target.hpBar && target.hpBar.active) {
            const hpPercent = newHp / maxHp;
            target.hpBar.width = 40 * hpPercent;
        }

        // 检查死亡
        if (newHp <= 0 && this.scene.combatSystem) {
            this.scene.combatSystem.enemyDeath(target);
        }
    }

    /**
     * 移除状态效果
     */
    removeEffect(effect) {
        const target = effect.target;
        const def = effect.definition;

        // 恢复速度
        if (def.slowPercent > 0 && target.active) {
            const originalSpeed = target.getData('originalSpeed');
            if (originalSpeed) {
                target.setData('speed', originalSpeed);
                if (target.setVelocity) {
                    target.speed = originalSpeed;
                }
            }
        }

        // 销毁图标
        if (effect.icon && effect.icon.active) {
            effect.icon.destroy();
        }

        console.log(`🔚 移除 ${effect.type} 从 ${target.getData('type')}`);
    }

    /**
     * 清除目标的所有状态效果
     */
    clearAllEffects(target) {
        const toRemove = this.activeEffects.filter(e => e.target === target);
        toRemove.forEach(effect => {
            this.removeEffect(effect);
        });
        this.activeEffects = this.activeEffects.filter(e => e.target !== target);
    }

    /**
     * 获取目标的状态效果列表
     */
    getEffectsOnTarget(target) {
        return this.activeEffects.filter(e => e.target === target);
    }

    /**
     * 检查目标是否有特定状态效果
     */
    hasEffect(target, effectType) {
        return this.activeEffects.some(e =>
            e.target === target && e.type === effectType
        );
    }

    /**
     * 获取状态效果定义
     */
    getEffectDefinition(effectType) {
        return this.effectTypes[effectType] || null;
    }

    /**
     * 清理所有状态效果
     */
    destroy() {
        this.activeEffects.forEach(effect => {
            if (effect.icon && effect.icon.active) {
                effect.icon.destroy();
            }
        });
        this.activeEffects = [];
        console.log('🧹 StatusEffectSystem 已清理');
    }
}
