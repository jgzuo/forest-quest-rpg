/**
 * DamageTypeManager - 伤害类型管理器
 * 管理伤害类型、敌人弱点/抗性和伤害计算
 * @version 1.0 - Milestone 7
 */
class DamageTypeManager {
    constructor(scene) {
        this.scene = scene;

        // 伤害类型定义
        this.damageTypes = {
            physical: {
                name: '物理',
                nameEn: 'Physical',
                color: '#ff6b6b',     // 红色
                icon: '⚔️'
            },
            magical: {
                name: '魔法',
                nameEn: 'Magical',
                color: '#9f7aea',     // 紫色
                icon: '✨'
            },
            fire: {
                name: '火焰',
                nameEn: 'Fire',
                color: '#ed8936',     // 橙色
                icon: '🔥'
            },
            ice: {
                name: '冰霜',
                nameEn: 'Ice',
                color: '#4299e1',     // 蓝色
                icon: '❄️'
            },
            poison: {
                name: '毒素',
                nameEn: 'Poison',
                color: '#48bb78',     // 绿色
                icon: '☠️'
            }
        };

        // 敌人弱点和抗性数据库
        this.enemyWeaknesses = {
            mole: {
                weak: ['fire'],              // 弱火焰
                resistant: [],                // 无抗性
                immune: []                    // 无免疫
            },
            treant: {
                weak: ['fire', 'ice'],        // 弱火焰和冰霜
                resistant: ['physical'],      // 抗物理（树皮）
                immune: ['poison']            // 免疫毒素
            },
            slime: {
                weak: ['physical', 'fire'],   // 弱物理和火焰
                resistant: ['magical'],       // 抗魔法
                immune: ['poison']            // 免疫毒素（本来就是毒）
            },
            bat: {
                weak: ['ice', 'poison'],      // 弱冰霜和毒素
                resistant: [],                // 无抗性
                immune: []                    // 无免疫
            },
            skeleton: {
                weak: ['physical', 'magical'], // 弱物理和魔法
                resistant: ['poison'],        // 抗毒素（骨骼）
                immune: ['ice']               // 免疫冰霜（没血）
            },
            // 精英敌人
            elite_mole_king: {
                weak: [],
                resistant: ['physical', 'fire'],
                immune: ['poison']
            },
            elite_ancient_treant: {
                weak: ['fire'],
                resistant: ['physical', 'ice'],
                immune: ['poison']
            },
            elite_mutated_slime: {
                weak: ['fire'],
                resistant: ['magical', 'poison'],
                immune: []
            },
            // ============ Milestone 7 Sprint 4: 新区域敌人 ============
            ice_elemental: {
                weak: ['fire', 'physical'],   // 火和物理可以破冰
                resistant: ['ice'],            // 抗冰霜
                immune: []
            },
            frost_wolf: {
                weak: ['fire'],                // 弱火焰
                resistant: ['ice'],            // 抗冰霜
                immune: []
            },
            fire_elemental: {
                weak: ['ice'],                 // 冰可以灭火
                resistant: ['fire'],           // 抗火焰
                immune: ['poison']             // 元素生物免疫毒素
            },
            lava_slime: {
                weak: ['ice', 'physical'],     // 冰和物理有效
                resistant: ['fire'],           // 抗火焰
                immune: ['poison']             // 史莱姆免疫毒素
            },
            elite_fire_dragon: {
                weak: ['ice'],                 // 弱冰霜（龙弱点）
                resistant: ['fire', 'poison'], // 抗火焰和毒素
                immune: []                     // 无免疫
            },
            // Boss
            boss_treant_king: {
                weak: ['fire'],
                resistant: ['physical', 'ice', 'magical'],
                immune: ['poison']
            },
            // ============ Milestone 7 Sprint 4: 新Boss ============
            boss_yeti_king: {
                weak: ['fire'],                // 弱火焰（融化冰雪）
                resistant: ['ice', 'physical'], // 抗冰霜和物理（厚皮毛）
                immune: ['poison']             // 免疫毒素
            },
            boss_dragon_lord: {
                weak: ['ice'],                 // 弱冰霜（龙弱点）
                resistant: ['fire', 'poison', 'physical'], // 抗多种伤害
                immune: []                     // 无免疫
            }
        };

        console.log('⚔️ DamageTypeManager 初始化完成');
    }

    /**
     * 计算最终伤害（考虑弱点和抗性）
     * @param {number} baseDamage - 基础伤害
     * @param {string} damageType - 伤害类型
     * @param {string} enemyType - 敌人类型
     * @returns {object} { finalDamage, effectiveness, message }
     */
    calculateDamage(baseDamage, damageType, enemyType) {
        // 获取敌人弱点数据
        const weaknesses = this.enemyWeaknesses[enemyType];
        if (!weaknesses) {
            // 未知敌人，无修正
            return {
                finalDamage: baseDamage,
                effectiveness: 'normal',
                multiplier: 1.0,
                message: ''
            };
        }

        let multiplier = 1.0;
        let effectiveness = 'normal';
        let message = '';
        let color = '#ffffff';

        // 检查免疫
        if (weaknesses.immune && weaknesses.immune.includes(damageType)) {
            multiplier = 0;
            effectiveness = 'immune';
            message = '免疫!';
            color = '#888888';
        }
        // 检查抗性
        else if (weaknesses.resistant && weaknesses.resistant.includes(damageType)) {
            multiplier = 0.5;  // 抗性：50%伤害
            effectiveness = 'resistant';
            message = '抗性';
            color = '#ffd700';
        }
        // 检查弱点
        else if (weaknesses.weak && weaknesses.weak.includes(damageType)) {
            multiplier = 1.5;  // 弱点：150%伤害
            effectiveness = 'weak';
            message = '弱点!';
            color = '#ff0000';
        }

        const finalDamage = Math.floor(baseDamage * multiplier);

        return {
            finalDamage,
            effectiveness,
            multiplier,
            message,
            color
        };
    }

    /**
     * 获取伤害类型信息
     */
    getDamageTypeInfo(damageType) {
        return this.damageTypes[damageType] || null;
    }

    /**
     * 获取敌人弱点信息
     */
    getEnemyWeakness(enemyType) {
        return this.enemyWeaknesses[enemyType] || null;
    }

    /**
     * 显示伤害类型效果提示
     */
    showDamageTypeEffect(x, y, effectiveness, message, color) {
        if (effectiveness === 'normal') return;

        const icon = effectiveness === 'weak' ? '💥' :
                    effectiveness === 'resistant' ? '🛡️' :
                    effectiveness === 'immune' ? '🚫' : '';

        const text = this.scene.add.text(x, y - 40, `${icon} ${message}`, {
            font: 'bold 20px Arial',
            fill: color,
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.scene.tweens.add({
            targets: text,
            y: y - 80,
            alpha: 0,
            duration: 800,
            onComplete: () => text.destroy()
        });
    }

    /**
     * 为敌人添加弱点提示UI
     */
    createWeaknessIndicator(enemy) {
        const enemyType = enemy.getData('type');
        const weaknesses = this.getEnemyWeakness(enemyType);

        if (!weaknesses) return;

        const indicator = this.scene.add.container(enemy.x, enemy.y - 50);
        indicator.setDepth(150);

        // 弱点图标
        if (weaknesses.weak && weaknesses.weak.length > 0) {
            weaknesses.weak.forEach((type, index) => {
                const typeInfo = this.getDamageTypeInfo(type);
                const text = this.scene.add.text(index * 25 - 12, 0, typeInfo.icon, {
                    font: '16px Arial',
                    fill: typeInfo.color
                });
                indicator.add(text);
            });
        }

        enemy.setData('weaknessIndicator', indicator);
    }

    /**
     * 更新弱点指示器位置
     */
    updateWeaknessIndicator(enemy) {
        const indicator = enemy.getData('weaknessIndicator');
        if (indicator && indicator.active) {
            indicator.setPosition(enemy.x, enemy.y - 50);
        }
    }

    /**
     * 移除弱点指示器
     */
    removeWeaknessIndicator(enemy) {
        const indicator = enemy.getData('weaknessIndicator');
        if (indicator && indicator.active) {
            indicator.destroy();
        }
    }
}
