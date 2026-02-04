/**
 * EquipmentEffects - 装备特效系统
 *
 * 提供装备相关的视觉特效：
 * - 暴击时武器发光
 * - 稀有装备粒子拖尾
 * - 传说装备特殊光环
 * - 套装激活特效组合
 * - 装备升级特效
 * - 附魔特效（元素光环）
 * - 神器光效（artifact tier）
 * - 装备获得动画
 */

class EquipmentEffects {
    constructor(scene) {
        this.scene = scene;
        this.activeEffects = [];

        // 装备稀有度配置
        this.rarityConfig = {
            common: {
                color: 0xcccccc,
                glowIntensity: 0.3,
                particleCount: 0
            },
            uncommon: {
                color: 0x4facfe,
                glowIntensity: 0.5,
                particleCount: 3
            },
            rare: {
                color: 0x9f7aea,
                glowIntensity: 0.7,
                particleCount: 5
            },
            epic: {
                color: 0xf6e05e,
                glowIntensity: 0.9,
                particleCount: 8
            },
            legendary: {
                color: 0xff6600,
                glowIntensity: 1.0,
                particleCount: 12
            }
        };

        console.log('✨ 装备特效系统初始化');
    }

    /**
     * 暴击时武器发光特效
     * @param {Phaser.GameObjects.Sprite} player - 玩家对象
     * @param {number} critMultiplier - 暴击倍率
     */
    createCritWeaponGlow(player, critMultiplier = 1.5) {
        if (!player || !player.active) return;

        // 创建武器发光效果
        const glow = this.scene.add.graphics();
        glow.setDepth(player.depth + 1);

        const x = player.x;
        const y = player.y;
        const size = 30;

        // 绘制发光光晕
        const glowIntensity = 0.6 + (critMultiplier - 1.5) * 0.2;
        glow.fillStyle(0xff00ff, glowIntensity);
        glow.fillCircle(x, y, size);

        // 外圈光晕
        glow.lineStyle(3, 0xff00ff, 0.8);
        glow.strokeCircle(x, y, size + 10);

        // 快速闪烁动画
        this.scene.tweens.add({
            targets: glow,
            scale: 1.5,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                glow.destroy();
            }
        });

        // 粒子爆炸
        this.createCritParticles(x, y, 15);
    }

    /**
     * 创建暴击粒子
     */
    createCritParticles(x, y, count) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const distance = 40 + Math.random() * 20;

            const particle = this.scene.add.circle(x, y, 3, 0xff00ff, 1);
            particle.setDepth(150);

            const targetX = x + Math.cos(angle) * distance;
            const targetY = y + Math.sin(angle) * distance;

            this.scene.tweens.add({
                targets: particle,
                x: targetX,
                y: targetY,
                alpha: 0,
                scale: 0,
                duration: 400,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }

    /**
     * 创建装备粒子拖尾（稀有装备）
     * @param {string} rarity - 稀有度（common/uncommon/rare/epic/legendary）
     * @param {Phaser.GameObjects.Sprite} owner - 装备拥有者
     */
    createEquipmentTrail(rarity, owner) {
        const config = this.rarityConfig[rarity] || this.rarityConfig.common;

        if (config.particleCount === 0) return;

        // 创建粒子
        for (let i = 0; i < config.particleCount; i++) {
            const angle = (Math.PI * 2 / config.particleCount) * i;
            const distance = 25;

            const particle = this.scene.add.circle(
                owner.x + Math.cos(angle) * distance,
                owner.y + Math.sin(angle) * distance,
                2,
                config.color,
                0.6
            );
            particle.setDepth(owner.depth - 1);

            // 浮动动画
            this.scene.tweens.add({
                targets: particle,
                y: particle.y - 5,
                alpha: 0.3,
                duration: 500 + i * 100,
                yoyo: true,
                repeat: -1
            });

            this.activeEffects.push({
                type: 'trail',
                particle: particle,
                owner: owner,
                rarity: rarity
            });
        }
    }

    /**
     * 更新装备拖尾位置
     */
    updateTrailPositions() {
        const time = this.scene.time.now;

        this.activeEffects.forEach(effect => {
            if (!effect.owner || !effect.owner.active) return;

            if (effect.type === 'trail' && effect.owner && effect.owner.active) {
                // 更新粒子位置跟随玩家
                const angle = Math.atan2(
                    effect.particle.y - effect.owner.y,
                    effect.particle.x - effect.owner.x
                );
                const distance = 25;

                effect.particle.x = effect.owner.x + Math.cos(angle) * distance;
                effect.particle.y = effect.owner.y + Math.sin(angle) * distance;
            } else if (effect.type === 'legendaryTrail') {
                // 传奇拖尾：螺旋运动
                const currentAngle = effect.baseAngle + time * 0.002;
                const wobbleDistance = effect.baseDistance + Math.sin(time * 0.005) * 5;

                effect.particle.x = effect.owner.x + Math.cos(currentAngle) * wobbleDistance;
                effect.particle.y = effect.owner.y + Math.sin(currentAngle) * wobbleDistance;
            } else if (effect.type === 'enchantParticle') {
                // 附魔粒子：旋转
                const currentAngle = effect.baseAngle + time * effect.rotationSpeed;
                effect.particle.x = effect.owner.x + Math.cos(currentAngle) * effect.distance;
                effect.particle.y = effect.owner.y + Math.sin(currentAngle) * effect.distance;
            } else if (effect.type === 'artifactStar') {
                // 神器星形粒子：轨道运动
                const currentAngle = effect.baseAngle + time * 0.001;
                effect.star.x = effect.owner.x + Math.cos(currentAngle) * effect.distance;
                effect.star.y = effect.owner.y + Math.sin(currentAngle) * effect.distance;
            }
        });
    }

    /**
     * 创建传说装备光环
     * @param {Phaser.GameObjects.Sprite} owner - 装备拥有者
     */
    createLegendaryAura(owner) {
        const config = this.rarityConfig.legendary;

        // 创建多层光环
        for (let i = 0; i < 3; i++) {
            const aura = this.scene.add.graphics();
            aura.setDepth(owner.depth - 2);
            aura.lineStyle(2, config.color, 0.4 - i * 0.1);
            aura.strokeCircle(owner.x, owner.y, 40 + i * 10);

            // 呼吸动画
            this.scene.tweens.add({
                targets: aura,
                scale: 1.2,
                alpha: 0.2,
                duration: 1000 + i * 200,
                yoyo: true,
                repeat: -1
            });

            this.activeEffects.push({
                type: 'aura',
                graphics: aura,
                owner: owner
            });
        }
    }

    /**
     * 更新光环位置
     */
    updateAuraPositions() {
        this.activeEffects.forEach(effect => {
            // 所有光环类型都需要跟随玩家移动
            if (['aura', 'legendaryAura', 'setAura', 'enchantAura', 'artifactAura'].includes(effect.type)) {
                if (effect.owner && effect.owner.active) {
                    effect.graphics.x = effect.owner.x;
                    effect.graphics.y = effect.owner.y;
                }
            }
        });
    }

    /**
     * 装备获得动画
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} rarity - 稀有度
     * @param {string} itemName - 装备名称
     */
    showEquipmentGain(x, y, rarity, itemName) {
        const config = this.rarityConfig[rarity] || this.rarityConfig.common;

        // 1. 创建闪光特效
        const flash = this.scene.add.graphics();
        flash.setDepth(200);

        flash.fillStyle(config.color, 0.5);
        flash.fillCircle(x, y, 50);

        this.scene.tweens.add({
            targets: flash,
            scale: 2,
            alpha: 0,
            duration: 600,
            onComplete: () => {
                flash.destroy();
            }
        });

        // 2. 粒子爆炸
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 / 20) * i;
            const distance = 60 + Math.random() * 40;

            const particle = this.scene.add.circle(x, y, 4, config.color, 1);
            particle.setDepth(201);

            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                alpha: 0,
                duration: 800,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }

        // 3. 显示装备名称
        const rarityTexts = {
            common: '普通',
            uncommon: '优秀',
            rare: '稀有',
            epic: '史诗',
            legendary: '传说'
        };

        const text = this.scene.add.text(
            x,
            y - 80,
            `${rarityTexts[rarity]} ${itemName}`,
            {
                fontFamily: 'Noto Sans SC',
                fontSize: 'bold 20px',
                fill: `#${config.color.toString(16).padStart(6, '0')}`,
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);
        text.setDepth(202);

        this.scene.tweens.add({
            targets: text,
            y: text.y - 40,
            alpha: 0,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => {
                text.destroy();
            }
        });
    }

    /**
     * 装备升级特效
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} oldLevel - 旧等级
     * @param {number} newLevel - 新等级
     */
    showEquipmentUpgrade(x, y, oldLevel, newLevel) {
        // 1. 升级闪光
        const flash = this.scene.add.graphics();
        flash.setDepth(200);
        flash.fillStyle(0xffd700, 0.6);
        flash.fillCircle(x, y, 60);

        this.scene.tweens.add({
            targets: flash,
            scale: 2.5,
            alpha: 0,
            duration: 800,
            onComplete: () => {
                flash.destroy();
            }
        });

        // 2. 金色粒子
        for (let i = 0; i < 30; i++) {
            const angle = (Math.PI * 2 / 30) * i;
            const distance = 80 + Math.random() * 40;

            const particle = this.scene.add.star(
                x, y,
                4,  // points
                3,  // innerRadius
                6,  // outerRadius
                0xffd700,  // color
                1  // alpha
            );
            particle.setDepth(201);

            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                rotation: Math.PI * 2,
                alpha: 0,
                duration: 1000,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }

        // 3. 等级提升文字
        const levelText = this.scene.add.text(
            x,
            y - 100,
            `+${oldLevel} → +${newLevel}`,
            {
                fontFamily: 'Press Start 2P',
                fontSize: 'bold 24px',
                fill: '#ffd700',
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5);
        levelText.setDepth(202);

        this.scene.tweens.add({
            targets: levelText,
            y: levelText.y - 60,
            scale: 1.3,
            alpha: 0,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => {
                levelText.destroy();
            }
        });

        // 4. "UPGRADE!" 文字
        const upgradeText = this.scene.add.text(
            x,
            y - 150,
            '⬆️ UPGRADE! ⬆️',
            {
                fontFamily: 'Noto Sans SC',
                fontSize: 'bold 32px',
                fill: '#ffd700',
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5);
        upgradeText.setDepth(203);

        this.scene.tweens.add({
            targets: upgradeText,
            y: upgradeText.y - 50,
            alpha: 0,
            duration: 2000,
            delay: 300,
            ease: 'Power2',
            onComplete: () => {
                upgradeText.destroy();
            }
        });
    }

    /**
     * 移除装备特效
     * @param {string} effectType - 特效类型（trail/aura）
     * @param {Phaser.GameObjects.Sprite} owner - 装备拥有者
     */
    removeEquipmentEffect(effectType, owner) {
        for (let i = this.activeEffects.length - 1; i >= 0; i--) {
            const effect = this.activeEffects[i];

            if (effect.type === effectType && effect.owner === owner) {
                if (effect.particle) {
                    effect.particle.destroy();
                }
                if (effect.graphics) {
                    effect.graphics.destroy();
                }

                this.activeEffects.splice(i, 1);
            }
        }
    }

    // ==================== Phase 6: 装备特效深度系统 ====================

    /**
     * US-027: 传奇装备粒子拖尾增强
     * @param {Phaser.GameObjects.Sprite} owner - 装备拥有者
     * @param {string} element - 元素类型（fire/ice/lightning/poison/light/shadow）
     */
    createLegendaryTrail(owner, element = 'fire') {
        const elementColors = {
            fire: { primary: 0xff6600, secondary: 0xffcc00 },
            ice: { primary: 0x66ccff, secondary: 0xffffff },
            lightning: { primary: 0x9966ff, secondary: 0xffccff },
            poison: { primary: 0x33cc33, secondary: 0x66ff66 },
            light: { primary: 0xffff99, secondary: 0xffffff },
            shadow: { primary: 0x660066, secondary: 0x993399 }
        };

        const colors = elementColors[element] || elementColors.fire;

        // 创建更密集的粒子拖尾（20个粒子）
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 / 20) * i;
            const distance = 30 + Math.sin(this.scene.time.now * 0.003 + i) * 5;

            const particle = this.scene.add.circle(
                owner.x + Math.cos(angle) * distance,
                owner.y + Math.sin(angle) * distance,
                2 + Math.random() * 2,
                Math.random() > 0.5 ? colors.primary : colors.secondary,
                0.8
            );
            particle.setDepth(owner.depth - 1);

            // 螺旋上升动画
            this.scene.tweens.add({
                targets: particle,
                y: particle.y - 8,
                alpha: 0.4,
                duration: 600 + i * 50,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // 旋转
            this.scene.tweens.add({
                targets: particle,
                angle: 360,
                duration: 2000 + i * 100,
                repeat: -1,
                ease: 'Linear'
            });

            this.activeEffects.push({
                type: 'legendaryTrail',
                particle: particle,
                owner: owner,
                baseAngle: angle,
                baseDistance: distance
            });
        }

        // 传说装备额外光环
        const aura = this.scene.add.graphics();
        aura.setDepth(owner.depth - 2);
        aura.lineStyle(3, colors.primary, 0.5);
        aura.strokeCircle(owner.x, owner.y, 45);

        // 呼吸脉动
        this.scene.tweens.add({
            targets: aura,
            scale: 1.3,
            alpha: 0.3,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.activeEffects.push({
            type: 'legendaryAura',
            graphics: aura,
            owner: owner
        });

        console.log(`✨ 传奇装备拖尾: ${element}`);
    }

    /**
     * US-028: 套装激活特效组合
     * @param {Phaser.GameObjects.Sprite} owner - 玩家
     * @param {string} setName - 套装名称（warrior/mage/rogue/hunter）
     * @param {number} pieces - 已装备件数（2-5件）
     */
    activateSetBonus(owner, setName, pieces) {
        const setConfigs = {
            warrior: {
                color: 0xff6600,
                icon: '⚔️',
                name: '战士套装',
                bonusNames: ['2件: 攻击+10%', '3件: 防御+15%', '4件: 暴击+20%', '5件: 终极战神']
            },
            mage: {
                color: 0x9966ff,
                icon: '🔮',
                name: '法师套装',
                bonusNames: ['2件: 法力+20%', '3件: 伤害+15%', '4件: 冷却-10%', '5件: 元素主宰']
            },
            rogue: {
                color: 0x33cc33,
                icon: '🗡️',
                name: '刺客套装',
                bonusNames: ['2件: 速度+15%', '3件: 暴击+15%', '4件: 闪避+20%', '5代: 影之化身']
            },
            hunter: {
                color: 0x66ccff,
                icon: '🏹',
                name: '猎人套装',
                bonusNames: ['2件: 命中+15%', '3件: 射程+20%', '4件: 攻速+15%', '5件: 猎人之眼']
            }
        };

        const config = setConfigs[setName] || setConfigs.warrior;
        const bonusIndex = Math.min(pieces - 2, 3);

        // 1. 创建套装图标
        const icon = this.scene.add.text(
            owner.x,
            owner.y - 70,
            config.icon,
            { fontSize: '32px' }
        ).setOrigin(0.5);
        icon.setDepth(160);

        this.scene.tweens.add({
            targets: icon,
            y: icon.y - 20,
            alpha: 0,
            scale: 1.5,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                icon.destroy();
            }
        });

        // 2. 套装光环
        const aura = this.scene.add.graphics();
        aura.setDepth(owner.depth - 2);

        // 绘制多边形（代表套装件数）
        const sides = pieces + 2; // 4件=六边形, 5件=七边形
        const radius = 50;
        aura.lineStyle(3, config.color, 0.6);
        aura.beginPath();

        for (let i = 0; i <= sides; i++) {
            const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
            const x = owner.x + Math.cos(angle) * radius;
            const y = owner.y + Math.sin(angle) * radius;
            if (i === 0) {
                aura.moveTo(x, y);
            } else {
                aura.lineTo(x, y);
            }
        }
        aura.closePath();
        aura.strokePath();

        // 旋转动画
        this.scene.tweens.add({
            targets: aura,
            rotation: Math.PI * 2,
            duration: 8000,
            repeat: -1,
            ease: 'Linear'
        });

        // 呼吸效果
        this.scene.tweens.add({
            targets: aura,
            scale: 1.2,
            alpha: 0.4,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.activeEffects.push({
            type: 'setAura',
            graphics: aura,
            owner: owner
        });

        // 3. 显示套装激活文字
        const bonusText = this.scene.add.text(
            owner.x,
            owner.y - 120,
            `${config.name} ${config.bonusNames[bonusIndex]}`,
            {
                fontFamily: 'Noto Sans SC',
                fontSize: 'bold 18px',
                fill: `#${config.color.toString(16).padStart(6, '0')}`,
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);
        bonusText.setDepth(161);

        this.scene.tweens.add({
            targets: bonusText,
            y: bonusText.y - 40,
            alpha: 0,
            duration: 2000,
            delay: 500,
            ease: 'Power2',
            onComplete: () => {
                bonusText.destroy();
            }
        });

        // 4. 粒子爆发
        for (let i = 0; i < 15; i++) {
            const angle = (Math.PI * 2 / 15) * i;
            const distance = 60 + Math.random() * 30;

            const particle = this.scene.add.star(
                owner.x, owner.y,
                5,  // points
                3,  // innerRadius
                6,  // outerRadius
                config.color,
                1
            );
            particle.setDepth(159);

            this.scene.tweens.add({
                targets: particle,
                x: owner.x + Math.cos(angle) * distance,
                y: owner.y + Math.sin(angle) * distance,
                rotation: Math.PI * 2,
                alpha: 0,
                duration: 800,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }

        console.log(`✨ 套装激活: ${config.name} ${pieces}件`);
    }

    /**
     * US-030: 附魔特效（元素光环）
     * @param {Phaser.GameObjects.Sprite} owner - 装备拥有者
     * @param {string} enchantType - 附魔类型（fire/ice/lightning/poison/holy/shadow）
     * @param {number} level - 附魔等级（1-10）
     */
    applyEnchantment(owner, enchantType, level = 1) {
        const enchantConfigs = {
            fire: {
                color: 0xff4500,
                particle: '🔥',
                name: '烈焰附魔'
            },
            ice: {
                color: 0x66ccff,
                particle: '❄️',
                name: '冰霜附魔'
            },
            lightning: {
                color: 0x9966ff,
                particle: '⚡',
                name: '雷电附魔'
            },
            poison: {
                color: 0x33cc33,
                particle: '☠️',
                name: '剧毒附魔'
            },
            holy: {
                color: 0xffff99,
                particle: '✨',
                name: '神圣附魔'
            },
            shadow: {
                color: 0x660066,
                particle: '🌑',
                name: '暗影附魔'
            }
        };

        const config = enchantConfigs[enchantType] || enchantConfigs.fire;

        // 附魔强度基于等级
        const intensity = 0.5 + (level / 10) * 0.5;
        const particleCount = 8 + level;

        // 1. 元素粒子环绕
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i;
            const distance = 35;

            const particle = this.scene.add.text(
                owner.x + Math.cos(angle) * distance,
                owner.y + Math.sin(angle) * distance,
                config.particle,
                { fontSize: `${12 + level}px` }
            ).setOrigin(0.5);
            particle.setDepth(owner.depth + 1);
            particle.setAlpha(intensity);

            // 旋转动画
            this.scene.tweens.add({
                targets: particle,
                angle: 360,
                duration: 3000 - level * 100,
                repeat: -1,
                ease: 'Linear'
            });

            // 浮动
            this.scene.tweens.add({
                targets: particle,
                scale: 1.2,
                duration: 500 + i * 50,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            this.activeEffects.push({
                type: 'enchantParticle',
                particle: particle,
                owner: owner,
                baseAngle: angle,
                distance: distance,
                rotationSpeed: 0.002 - level * 0.0001
            });
        }

        // 2. 附魔光环
        const aura = this.scene.add.graphics();
        aura.setDepth(owner.depth - 1);
        aura.lineStyle(2, config.color, intensity);
        aura.strokeCircle(owner.x, owner.y, 40);

        this.scene.tweens.add({
            targets: aura,
            scale: 1.3,
            alpha: intensity * 0.5,
            duration: 1000 - level * 50,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.activeEffects.push({
            type: 'enchantAura',
            graphics: aura,
            owner: owner
        });

        // 3. 附魔激活文字
        const enchantText = this.scene.add.text(
            owner.x,
            owner.y - 90,
            `${config.name} +${level}`,
            {
                fontFamily: 'Noto Sans SC',
                fontSize: 'bold 16px',
                fill: `#${config.color.toString(16).padStart(6, '0')}`,
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);
        enchantText.setDepth(161);

        this.scene.tweens.add({
            targets: enchantText,
            y: enchantText.y - 30,
            alpha: 0,
            duration: 1200,
            ease: 'Power2',
            onComplete: () => {
                enchantText.destroy();
            }
        });

        console.log(`✨ 附魔激活: ${config.name} +${level}`);
    }

    /**
     * US-031: 神器光效（Artifact tier，比legendary更高）
     * @param {Phaser.GameObjects.Sprite} owner - 神器拥有者
     * @param {string} artifactName - 神器名称
     */
    activateArtifactAura(owner, artifactName) {
        // 神器使用彩虹色渐变
        const rainbowColors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x8b00ff];

        // 1. 多层彩虹光环（6层，每层不同颜色）
        for (let i = 0; i < 6; i++) {
            const aura = this.scene.add.graphics();
            aura.setDepth(owner.depth - 3 - i);
            aura.lineStyle(3, rainbowColors[i], 0.4);
            aura.strokeCircle(owner.x, owner.y, 45 + i * 8);

            // 每层不同速度旋转
            const rotationDuration = 5000 + i * 1000;
            const direction = i % 2 === 0 ? 1 : -1;

            this.scene.tweens.add({
                targets: aura,
                rotation: direction * Math.PI * 2,
                duration: rotationDuration,
                repeat: -1,
                ease: 'Linear'
            });

            // 呼吸效果
            this.scene.tweens.add({
                targets: aura,
                scale: 1.2,
                alpha: 0.2,
                duration: 1200 + i * 100,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            this.activeEffects.push({
                type: 'artifactAura',
                graphics: aura,
                owner: owner
            });
        }

        // 2. 神器专属粒子（星形粒子）
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i;
            const distance = 55;

            const star = this.scene.add.star(
                owner.x + Math.cos(angle) * distance,
                owner.y + Math.sin(angle) * distance,
                5,  // points
                4,  // innerRadius
                8,  // outerRadius
                rainbowColors[i % 6],
                1
            );
            star.setDepth(owner.depth + 2);

            // 旋转
            this.scene.tweens.add({
                targets: star,
                angle: 360,
                duration: 4000,
                repeat: -1,
                ease: 'Linear'
            });

            // 轨道运动
            this.scene.tweens.add({
                targets: star,
                angle: (angle * 180 / Math.PI) + 360,
                duration: 8000,
                repeat: -1,
                ease: 'Linear'
            });

            // 闪烁
            this.scene.tweens.add({
                targets: star,
                alpha: 0.5,
                scale: 1.3,
                duration: 600 + i * 50,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            this.activeEffects.push({
                type: 'artifactStar',
                star: star,
                owner: owner,
                baseAngle: angle,
                distance: distance
            });
        }

        // 3. 神器名称文字（金色发光）
        const artifactText = this.scene.add.text(
            owner.x,
            owner.y - 110,
            `👑 ${artifactName} 👑`,
            {
                fontFamily: 'Press Start 2P',
                fontSize: 'bold 20px',
                fill: '#ffd700',
                stroke: '#000000',
                strokeThickness: 6,
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#ff6600',
                    blur: 5,
                    shadowStroke: true,
                    shadowFill: true
                }
            }
        ).setOrigin(0.5);
        artifactText.setDepth(170);

        this.scene.tweens.add({
            targets: artifactText,
            y: artifactText.y - 50,
            alpha: 0,
            duration: 2500,
            ease: 'Power2',
            onComplete: () => {
                artifactText.destroy();
            }
        });

        // 4. 光柱效果（从下方升起）
        const pillar = this.scene.add.graphics();
        pillar.setDepth(owner.depth - 4);
        pillar.fillStyle(0xffd700, 0.3);
        pillar.fillCircle(owner.x, owner.y, 30);

        this.scene.tweens.add({
            targets: pillar,
            scale: 4,
            alpha: 0,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                pillar.destroy();
            }
        });

        console.log(`👑 神器激活: ${artifactName}`);
    }

    // ==================== Phase 6 结束 ====================

    /**
     * 每帧更新
     * @param {number} time - 当前时间
     * @param {number} delta - 时间增量
     */
    update(time, delta) {
        // 更新拖尾位置
        this.updateTrailPositions();

        // 更新光环位置
        this.updateAuraPositions();
    }

    /**
     * 清除所有特效
     */
    clear() {
        this.activeEffects.forEach(effect => {
            if (effect.particle && effect.particle.active) {
                effect.particle.destroy();
            }
            if (effect.graphics && effect.graphics.active) {
                effect.graphics.destroy();
            }
            if (effect.star && effect.star.active) {
                effect.star.destroy();
            }
        });
        this.activeEffects = [];
    }

    /**
     * 销毁系统
     */
    destroy() {
        this.clear();
        console.log('✨ 装备特效系统已销毁');
    }
}
