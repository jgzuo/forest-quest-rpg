/**
 * WeaponComboSystem - 武器连招系统
 *
 * 实现基于攻击序列的连招系统：
 * - 武器连招（LLH, LHL等序列）
 * - 环境连招（撞墙造成额外伤害）
 * - 空中连招（空中攻击保持浮空）
 * - 完美连招奖励（高连击时的特殊效果）
 */
class WeaponComboSystem {
    constructor(scene) {
        this.scene = scene;
        this.player = scene.player;

        // 连击序列追踪
        this.attackSequence = [];
        this.sequenceTimeout = 2000; // 序列超时（毫秒）
        this.lastAttackTime = 0;

        // 配置（从CombatConfig导入）
        this.config = WEAPON_COMBO_CONFIG || {
            timeout: 2000,
            maxSequence: 5,
            patterns: {
                'LLH': { name: '三连击', multiplier: 1.5, finisher: true },
                'LHL': { name: '突刺连击', multiplier: 1.8, finisher: true },
                'HLL': { name: '重击连击', multiplier: 2.0, finisher: true },
                'LLHH': { name: '四连击', multiplier: 2.2, finisher: true },
                'LHLH': { name: '五连击', multiplier: 2.5, finisher: true }
            },
            attackTypes: {
                light: { damage: 1.0, range: 50, cooldown: 200 },
                heavy: { damage: 1.5, range: 60, cooldown: 400 }
            }
        };

        // 环境连招配置
        this.environmentConfig = ENVIRONMENT_COMBO_CONFIG || {
            wallSlamMultiplier: 1.5,
            wallSlamStun: 500,
            chainBonus: 2.0,
            maxChain: 3
        };

        // 空中连招配置
        this.aerialConfig = AERIAL_COMBO_CONFIG || {
            gravity: 0.3,
            airJuggleMultiplier: 1.2,
            maxAirHits: 10,
            groundSlamMultiplier: 2.0,
            groundSlamRadius: 100,
            groundSlamAOE: true
        };

        // 完美连击配置
        this.perfectComboConfig = COMBO_CONFIG?.perfectCombo || {
            threshold: 10,
            damageBonus: 1.5,
            speedBonus: 1.2,
            invincibilityFrames: 200
        };

        // 状态追踪
        this.isInAir = false;
        this.airHits = 0;
        this.lastWallSlam = 0;
        this.chainCount = 0;

        // UI元素
        this.sequenceDisplay = null;

        console.log('⚔️ 武器连招系统初始化');
    }

    /**
     * 记录攻击（轻击或重击）
     * @param {string} attackType - 'light' 或 'heavy'
     */
    recordAttack(attackType) {
        const now = this.scene.time.now;

        // 检查序列超时
        if (now - this.lastAttackTime > this.sequenceTimeout) {
            this.attackSequence = [];
        }

        // 添加攻击到序列
        const shortType = attackType === 'light' ? 'L' : 'H';
        this.attackSequence.push(shortType);

        // 限制序列长度
        if (this.attackSequence.length > this.config.maxSequence) {
            this.attackSequence.shift();
        }

        this.lastAttackTime = now;

        // 检查连招模式
        this.checkComboPattern();

        // 更新显示
        this.updateSequenceDisplay();
    }

    /**
     * 检查连招模式
     */
    checkComboPattern() {
        const sequence = this.attackSequence.join('');

        // 检查是否有匹配的连招
        for (const [pattern, data] of Object.entries(this.config.patterns)) {
            if (sequence.endsWith(pattern)) {
                this.executeComboFinisher(pattern, data);
                // 清空序列
                this.attackSequence = [];
                break;
            }
        }
    }

    /**
     * 执行连招终结技
     */
    executeComboFinisher(pattern, data) {
        const multiplier = data.multiplier;

        // 显示连招名称
        if (this.scene.showFloatingText) {
            this.scene.showFloatingText(
                this.player.x,
                this.player.y - 60,
                `⚡ ${data.name}! x${multiplier}`,
                '#ffd700',
                1500
            );
        }

        // 相机特效
        if (this.scene.combatCameraSystem) {
            this.scene.combatCameraSystem.zoom(1.15, 300);
            this.scene.combatCameraSystem.shake(200, 0.01);
        }

        // 特效：能量爆发
        this.createEnergyBurst();

        console.log(`⚔️ 连招触发: ${pattern}, 倍率: ${multiplier}`);
    }

    /**
     * 创建能量爆发特效
     */
    createEnergyBurst() {
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 / 20) * i;
            const particle = this.scene.add.circle(
                this.player.x,
                this.player.y,
                4,
                0xffd700,
                0.8
            );
            particle.setDepth(100);

            this.scene.tweens.add({
                targets: particle,
                x: this.player.x + Math.cos(angle) * 80,
                y: this.player.y + Math.sin(angle) * 80,
                alpha: 0,
                scale: 0,
                duration: 600,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }

    /**
     * 更新序列显示
     */
    updateSequenceDisplay() {
        if (!this.sequenceDisplay) {
            this.createSequenceDisplay();
        }

        const sequence = this.attackSequence.join('');
        this.sequenceDisplay.setText(sequence);

        // 序列满时闪烁
        if (sequence.length >= this.config.maxSequence) {
            this.sequenceDisplay.setFill('#ff6600');
        } else {
            this.sequenceDisplay.setFill('#ffffff');
        }
    }

    /**
     * 创建序列显示
     */
    createSequenceDisplay() {
        this.sequenceDisplay = this.scene.add.text(
            this.player.x,
            this.player.y - 100,
            '',
            {
                fontFamily: 'Press Start 2P',
                fontSize: 'bold 24px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);
        this.sequenceDisplay.setDepth(160);
        this.sequenceDisplay.setScrollFactor(0);
    }

    /**
     * US-024: 环境连招 - 检测撞墙
     */
    checkWallSlam(oldX, oldY, newX, newY) {
        // 简化检测：如果位置未改变，可能是撞墙
        if (Math.abs(newX - oldX) < 1 && Math.abs(newY - oldY) < 1) {
            return;
        }

        // 检查是否撞墙（基于地图边界）
        const hitWall = newX < 50 || newX > 750 || newY < 50 || newY > 550;

        if (hitWall && this.scene.combatSystem) {
            // 造成额外伤害
            const baseDamage = this.player.attack || 30;
            const damage = Math.floor(baseDamage * this.environmentConfig.wallSlamMultiplier);

            // 显示撞墙特效
            this.createWallSlamEffect(newX, newY);

            // 对范围内敌人造成连锁伤害
            this.chainDamageToEnemies(newX, newY);

            // 击退敌人
            this.knockbackEnemiesFromWall(newX, newY);
        }
    }

    /**
     * 创建撞墙特效
     */
    createWallSlamEffect(x, y) {
        const shockwave = this.scene.add.graphics();
        shockwave.setDepth(100);
        shockwave.lineStyle(4, 0xd2691e, 0.9);
        shockwave.strokeCircle(x, y, 40);

        this.scene.tweens.add({
            targets: shockwave,
            scale: 2.5,
            alpha: 0,
            duration: 400,
            onComplete: () => {
                shockwave.destroy();
            }
        });

        // 碎石粒子
        for (let i = 0; i < 8; i++) {
            const rock = this.scene.add.rectangle(
                x + (Math.random() - 0.5) * 30,
                y + (Math.random() - 0.5) * 30,
                4 + Math.random() * 4,
                4 + Math.random() * 4,
                0x8b4513
            );
            rock.setDepth(101);

            this.scene.tweens.add({
                targets: rock,
                y: rock.y + 50,
                alpha: 0,
                rotation: Math.random() * Math.PI,
                duration: 400,
                onComplete: () => {
                    rock.destroy();
                }
            });
        }
    }

    /**
     * 对连锁范围内的敌人造成伤害
     */
    chainDamageToEnemies(x, y) {
        const chainRange = 100;
        const enemies = this.scene.combatSystem?.getEnemiesGroup();

        if (!enemies) return;

        let chainedEnemies = 0;

        enemies.getChildren().forEach(enemy => {
            if (!enemy.active) return;

            const distance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);

            if (distance <= chainRange && chainedEnemies < this.environmentConfig.maxChain) {
                // 连锁伤害
                const damage = Math.floor(
                    (this.player.attack || 30) * this.environmentConfig.chainBonus
                );

                if (this.scene.combatSystem) {
                    this.scene.combatSystem.hitEnemy(enemy, damage);
                }

                chainedEnemies++;

                // 连锁视觉特效
                this.createChainEffect(x, y, enemy.x, enemy.y);
            }
        });
    }

    /**
     * 创建连锁视觉特效
     */
    createChainEffect(x1, y1, x2, y2) {
        const chain = this.scene.add.graphics();
        chain.setDepth(99);
        chain.lineStyle(3, 0xffd700, 0.8);
        chain.beginPath();
        chain.moveTo(x1, y1);

        // 绘制闪电状连线
        const segments = 5;
        let currentX = x1;
        let currentY = y1;

        for (let i = 0; i < segments; i++) {
            currentX += (Math.random() - 0.5) * 30;
            currentY += (Math.random() - 0.5) * 30;
            chain.lineTo(currentX, currentY);
        }

        chain.strokePath();

        this.scene.time.delayedCall(100, () => {
            this.scene.tweens.add({
                targets: chain,
                alpha: 0,
                duration: 300,
                onComplete: () => {
                    chain.destroy();
                }
            });
        });
    }

    /**
     * 击退敌人离开墙壁
     */
    knockbackEnemiesFromWall(x, y) {
        // 简化：由战斗系统处理
        // 这里只触发击退
    }

    /**
     * US-025: 空中连招系统
     */
    enterAirMode() {
        this.isInAir = true;
        this.airHits = 0;

        // 减少重力
        if (this.player.body) {
            this.player.body.gravity.y = 200 * this.aerialConfig.gravity;
        }

        console.log('🌀 进入空中连招模式');
    }

    /**
     * 离开空中模式
     */
    exitAirMode() {
        this.isInAir = false;
        this.airHits = 0;

        // 恢复重力
        if (this.player.body) {
            this.player.body.gravity.y = 1600; // 默认重力
        }

        console.log('🌀 离开空中连招模式');
    }

    /**
     * 记录空中攻击
     */
    recordAirAttack() {
        if (!this.isInAir) return;

        this.airHits++;
        console.log(`🌀 空中连击: ${this.airHits}/${this.aerialConfig.maxAirHits}`);

        if (this.airHits >= this.aerialConfig.maxAirHits) {
            // 空中连击已满，强制落地
            this.exitAirMode();
        }
    }

    /**
     * 下砸攻击（空中结束）
     */
    groundSlam() {
        if (!this.isInAir) return;

        const x = this.player.x;
        const y = this.player.y;

        // 创建下砸特效
        this.createGroundSlamEffect(x, y);

        // AOE伤害
        if (this.aerialConfig.groundSlamAOE) {
            const radius = this.aerialConfig.groundSlamRadius;
            const damage = Math.floor(
                (this.player.attack || 30) * this.aerialConfig.groundSlamMultiplier
            );

            // 对范围内敌人造成伤害
            const enemies = this.scene.combatSystem?.getEnemiesGroup();
            if (enemies) {
                enemies.getChildren().forEach(enemy => {
                    if (!enemy.active) return;

                    const distance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
                    if (distance <= radius) {
                        if (this.scene.combatSystem) {
                            this.scene.combatSystem.hitEnemy(enemy, damage);
                        }
                    }
                });
            }
        }

        this.exitAirMode();
    }

    /**
     * 创建下砸特效
     */
    createGroundSlamEffect(x, y) {
        // 多层冲击波
        for (let i = 0; i < 4; i++) {
            this.scene.time.delayedCall(i * 100, () => {
                const wave = this.scene.add.graphics();
                wave.setDepth(100 - i);
                wave.lineStyle(4, 0xf6e05e, 0.8 - i * 0.15);
                wave.strokeCircle(x, y, 30 + i * 20);

                this.scene.tweens.add({
                    targets: wave,
                    scale: 3,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => {
                        wave.destroy();
                    }
                });
            });
        }

        // 相机震动
        if (this.scene.cameras.main) {
            this.scene.cameras.main.shake(300, 0.02);
        }

        // 尘土飞溅
        for (let i = 0; i < 12; i++) {
            const rock = this.scene.add.rectangle(
                x + (Math.random() - 0.5) * 60,
                y + (Math.random() - 0.5) * 40,
                3 + Math.random() * 4,
                3 + Math.random() * 4,
                0x8b4513
            );
            rock.setDepth(101);

            this.scene.tweens.add({
                targets: rock,
                y: rock.y + 40,
                alpha: 0,
                duration: 400,
                onComplete: () => {
                    rock.destroy();
                }
            });
        }
    }

    /**
     * US-026: 完美连击奖励系统
     */
    checkPerfectCombo(comboCount, multiplier) {
        if (comboCount < this.perfectComboConfig.threshold) {
            return false;
        }

        // 完美连击奖励
        const bonusMultiplier = this.perfectComboConfig.damageBonus;

        // 显示完美连击特效
        if (this.scene.showFloatingText) {
            this.scene.showFloatingText(
                this.player.x,
                this.player.y - 120,
                `🌟 完美连击! x${bonusMultiplier}!`,
                '#ff00ff',
                2500
            );
        }

        // 相机特效
        if (this.scene.combatCameraSystem) {
            this.scene.combatCameraSystem.zoom(1.2, 400);
            this.scene.combatCameraSystem.shake(300, 0.015);
        }

        // 无敌帧（短暂无敌）
        const player = this.player;
        const originalInvincible = player.getData('invincible') || false;
        player.setData('invincible', true);

        this.scene.time.delayedCall(this.perfectComboConfig.invincibilityFrames, () => {
            player.setData('invincible', originalInvincible);
        });

        // 速度加成
        if (player.body) {
            const originalSpeed = player.body.velocity.x || 200;
            player.body.velocity.x = originalSpeed * this.perfectComboConfig.speedBonus;
        }

        // 创建完美连击粒子
        this.createPerfectComboParticles();

        console.log(`🌟 完美连击: ${comboCount}连击, 倍率: x${bonusMultiplier}`);
        return true;
    }

    /**
     * 创建完美连击粒子
     */
    createPerfectComboParticles() {
        const colors = [0xff00ff, 0x00ffff, 0xffd700, 0xffffff];

        for (let i = 0; i < 30; i++) {
            const angle = (Math.PI * 2 / 30) * i;
            const color = Phaser.Utils.Array.GetRandom(colors);
            const particle = this.scene.add.circle(
                this.player.x,
                this.player.y,
                5,
                color,
                1
            );
            particle.setDepth(160);

            this.scene.tweens.add({
                targets: particle,
                x: this.player.x + Math.cos(angle) * 100,
                y: this.player.y + Math.sin(angle) * 100,
                alpha: 0,
                scale: 0,
                duration: 1000,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }

    /**
     * 每帧更新
     */
    update(time, delta) {
        // 更新序列显示位置
        if (this.sequenceDisplay) {
            this.sequenceDisplay.setPosition(
                this.player.x,
                this.player.y - 100
            );
        }

        // 检查序列超时
        if (this.attackSequence.length > 0) {
            const timeSinceLastAttack = time - this.lastAttackTime;
            if (timeSinceLastAttack > this.sequenceTimeout) {
                this.attackSequence = [];
                this.updateSequenceDisplay();
            }
        }
    }

    /**
     * 销毁系统
     */
    destroy() {
        if (this.sequenceDisplay) {
            this.sequenceDisplay.destroy();
        }
        console.log('⚔️ 武器连招系统已销毁');
    }
}
