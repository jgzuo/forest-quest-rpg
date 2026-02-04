/**
 * ParryDodgeSystem - 完美格挡/闪避系统
 *
 * 提供时机判定的格挡和闪避机制：
 * - 完美格挡：在攻击命中瞬间格挡，减少伤害并反击
 * - 完美闪避：在攻击命中瞬间闪避，完全避免伤害
 * - 视觉特效：闪光、残影、时间慢动作
 * - 音效反馈
 */

class ParryDodgeSystem {
    constructor(scene) {
        this.scene = scene;
        this.player = scene.player;

        // 格挡/闪避状态
        this.isParrying = false;
        this.isDodging = false;
        this.parryWindow = 200; // 格挡窗口（毫秒）
        this.dodgeWindow = 300; // 闪避窗口（毫秒）

        // 格挡/闪避冷却
        this.parryCooldown = 0;
        this.dodgeCooldown = 0;
        this.maxParryCooldown = 1000;
        this.maxDodgeCooldown = 1500;

        // 配置
        this.config = {
            parry: {
                damageReduction: 0.8, // 格挡减少80%伤害
                stunDuration: 500,    // 反击眩晕时间
                counterDamage: 1.5    // 反击倍率
            },
            dodge: {
                iframeDuration: 300,  // 无敌帧持续时间
                slowMotionFactor: 0.3 // 闪避时时间变慢
            }
        };

        // 视觉特效
        this.parryEffect = null;
        this.dodgeTrails = [];

        console.log('🛡️ 格挡/闪避系统初始化');
    }

    /**
     * 尝试格挡（玩家主动触发）
     * @returns {boolean} 是否成功格挡
     */
    tryParry() {
        const now = this.scene.time.now;

        // 检查冷却
        if (now < this.parryCooldown) {
            this.showCooldownMessage('格挡');
            return false;
        }

        // 检查是否正在格挡
        if (this.isParrying) {
            return false;
        }

        // 开始格挡
        this.isParrying = true;
        this.parryEndTime = now + this.parryWindow;

        // 视觉特效：格挡姿势
        this.createParryStanceEffect();

        // 播放格挡音效（如果存在combatAudioManager）
        if (this.scene.combatAudioManager && this.scene.combatAudioManager.playParryDodgeSound) {
            this.scene.combatAudioManager.playParryDodgeSound('parry');
        } else if (this.scene.audioManager && this.scene.audioManager.playParryStance) {
            this.scene.audioManager.playParryStance();
        }

        // 自动结束格挡（如果没有被攻击）
        this.scene.time.delayedCall(this.parryWindow, () => {
            if (this.isParrying && !this.parryTriggered) {
                this.endParry(false);
            }
        });

        return true;
    }

    /**
     * 尝试闪避（玩家主动触发）
     * @returns {boolean} 是否成功闪避
     */
    tryDodge() {
        const now = this.scene.time.now;

        // 检查冷却
        if (now < this.dodgeCooldown) {
            this.showCooldownMessage('闪避');
            return false;
        }

        // 检查是否正在闪避
        if (this.isDodging) {
            return false;
        }

        // 开始闪避
        this.isDodging = true;
        this.dodgeEndTime = now + this.dodgeWindow;
        this.player.setData('invincible', true);

        // 视觉特效：闪避残影
        this.createDodgeTrailEffect();

        // 闪避移动（快速向后）
        const facing = this.player.facing || 'front';
        let dodgeDistance = 80;

        let dx = 0, dy = 0;
        switch (facing) {
            case 'left': dx = -dodgeDistance; break;
            case 'right': dx = dodgeDistance; break;
            case 'up': dy = -dodgeDistance; break;
            case 'down': dy = dodgeDistance; break;
            case 'front': dy = dodgeDistance; break;
            case 'back': dy = -dodgeDistance; break;
        }

        // 执行闪避移动
        this.scene.tweens.add({
            targets: this.player,
            x: this.player.x + dx,
            y: this.player.y + dy,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                // 闪避结束
                this.scene.time.delayedCall(this.dodgeWindow - 200, () => {
                    this.endDodge();
                });
            }
        });

        // 播放闪避音效（如果存在combatAudioManager）
        if (this.scene.combatAudioManager && this.scene.combatAudioManager.playParryDodgeSound) {
            this.scene.combatAudioManager.playParryDodgeSound('dodge');
        } else if (this.scene.audioManager && this.scene.audioManager.playDodge) {
            this.scene.audioManager.playDodge();
        }

        return true;
    }

    /**
     * 检查完美格挡（敌人攻击时调用）
     * @param {Phaser.GameObjects.Sprite} enemy - 攻击者
     * @returns {boolean} 是否完美格挡
     */
    checkPerfectParry(enemy) {
        if (!this.isParrying) {
            return false;
        }

        const now = this.scene.time.now;

        // 检查是否在格挡窗口内
        if (now < this.parryEndTime) {
            // 完美格挡成功！
            this.parryTriggered = true;

            // 视觉特效：完美格挡闪光
            this.createPerfectParryEffect();

            // 时间慢动作（短暂）
            this.scene.time.timeScale = 0.3;
            this.scene.time.delayedCall(200, () => {
                this.scene.time.timeScale = 1;
            });

            // 屏幕震动
            this.scene.cameras.main.shake(100, 0.01);

            // 显示完美格挡文字
            this.showPerfectParryText();

            // 战斗音效系统（新）- 完美格挡
            if (this.scene.combatAudioManager && this.scene.combatAudioManager.playPerfectParry) {
                this.scene.combatAudioManager.playPerfectParry();
            }

            // 反击敌人
            this.counterAttack(enemy);

            // 结束格挡
            this.endParry(true);

            return true;
        }

        return false;
    }

    /**
     * 检查完美闪避（敌人攻击时调用）
     * @returns {boolean} 是否完美闪避
     */
    checkPerfectDodge() {
        if (!this.isDodging) {
            return false;
        }

        const now = this.scene.time.now;

        // 检查是否在闪避窗口内
        if (now < this.dodgeEndTime) {
            // 完美闪避成功！
            this.dodgeTriggered = true;

            // 视觉特效：完美闪避残影
            this.createPerfectDodgeEffect();

            // 显示完美闪避文字
            this.showPerfectDodgeText();

            // 战斗音效系统（新）- 完美闪避
            if (this.scene.combatAudioManager && this.scene.combatAudioManager.playPerfectDodge) {
                this.scene.combatAudioManager.playPerfectDodge();
            }

            return true;
        }

        return false;
    }

    /**
     * 创建格挡姿势特效
     */
    createParryStanceEffect() {
        // 玩家周围发光
        const aura = this.scene.add.graphics();
        aura.setDepth(99);
        aura.lineStyle(3, 0x4fc3f7, 0.6);
        aura.strokeCircle(this.player.x, this.player.y, 40);

        this.parryEffect = aura;

        // 呼吸动画
        this.scene.tweens.add({
            targets: aura,
            scale: 1.2,
            alpha: 0.8,
            duration: 300,
            yoyo: true,
            repeat: -1
        });
    }

    /**
     * 创建完美格挡特效
     */
    createPerfectParryEffect() {
        // 移除格挡姿势特效
        if (this.parryEffect) {
            this.parryEffect.destroy();
            this.parryEffect = null;
        }

        // 创建闪光特效
        const flash = this.scene.add.graphics();
        flash.setDepth(150);

        // 绘制闪光星形
        const x = this.player.x;
        const y = this.player.y;

        flash.fillStyle(0x4fc3f7, 0.8);
        flash.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
            const outerRadius = 50;
            const innerRadius = 25;

            const outerX = x + Math.cos(angle) * outerRadius;
            const outerY = y + Math.sin(angle) * outerRadius;
            const innerX = x + Math.cos(angle + Math.PI / 5) * innerRadius;
            const innerY = y + Math.sin(angle + Math.PI / 5) * innerRadius;

            if (i === 0) {
                flash.moveTo(outerX, outerY);
            } else {
                flash.lineTo(outerX, outerY);
            }
            flash.lineTo(innerX, innerY);
        }
        flash.closePath();
        flash.fillPath();

        // 扩散淡出
        this.scene.tweens.add({
            targets: flash,
            scale: 2,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                flash.destroy();
            }
        });

        // 冲击波
        const shockwave = this.scene.add.graphics();
        shockwave.setDepth(149);
        shockwave.lineStyle(4, 0x4fc3f7, 1);
        shockwave.strokeCircle(x, y, 30);

        this.scene.tweens.add({
            targets: shockwave,
            scale: 3,
            alpha: 0,
            duration: 600,
            onComplete: () => {
                shockwave.destroy();
            }
        });
    }

    /**
     * 创建闪避残影效果
     */
    createDodgeTrailEffect() {
        // 创建多个残影
        for (let i = 0; i < 5; i++) {
            this.scene.time.delayedCall(i * 40, () => {
                const trail = this.scene.add.image(
                    this.player.x,
                    this.player.y,
                    'hero-walk-front'
                );
                trail.setTint(0x87ceeb);
                trail.setAlpha(0.4 - i * 0.08);
                trail.setScale(this.player.scaleX, this.player.scaleY);
                trail.setDepth(this.player.depth - 1);

                this.dodgeTrails.push(trail);

                // 淡出销毁
                this.scene.tweens.add({
                    targets: trail,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => {
                        trail.destroy();
                        const index = this.dodgeTrails.indexOf(trail);
                        if (index > -1) {
                            this.dodgeTrails.splice(index, 1);
                        }
                    }
                });
            });
        }
    }

    /**
     * 创建完美闪避特效
     */
    createPerfectDodgeEffect() {
        // 风字特效
        const windText = this.scene.add.text(
            this.player.x,
            this.player.y - 50,
            '疾!',
            {
                fontFamily: 'Noto Sans SC',
                fontSize: 'bold 48px',
                fill: '#87ceeb',
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5);
        windText.setDepth(160);

        this.scene.tweens.add({
            targets: windText,
            y: windText.y - 80,
            alpha: 0,
            scale: 1.5,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                windText.destroy();
            }
        });

        // 旋风特效
        const vortex = this.scene.add.graphics();
        vortex.setDepth(149);

        for (let i = 0; i < 3; i++) {
            vortex.lineStyle(2, 0x87ceeb, 0.6 - i * 0.15);
            vortex.strokeCircle(this.player.x, this.player.y, 30 + i * 15);
        }

        // 旋转扩散
        this.scene.tweens.add({
            targets: vortex,
            rotation: Math.PI * 2,
            scale: 2,
            alpha: 0,
            duration: 600,
            onComplete: () => {
                vortex.destroy();
            }
        });
    }

    /**
     * 反击攻击
     */
    counterAttack(enemy) {
        if (!enemy || !enemy.active) return;

        const counterDamage = Math.floor(
            this.player.attack * this.config.parry.counterDamage
        );

        // 显示反击伤害
        if (this.scene.enhancedDamageText) {
            this.scene.enhancedDamageText.show(
                enemy.x,
                enemy.y - 30,
                `反击 ${counterDamage}`,
                'crit'
            );
        }

        // 应用伤害
        if (this.scene.combatSystem) {
            // 临时设置无敌，避免敌人反击
            const wasInvincible = this.player.getData('invincible');
            this.player.setData('invincible', true);

            this.scene.combatSystem.hitEnemy(enemy, counterDamage);

            this.scene.time.delayedCall(100, () => {
                this.player.setData('invincible', wasInvincible);
            });
        }

        // 眩晕敌人
        if (enemy.setData) {
            enemy.setData('stunned', true);
            this.scene.time.delayedCall(this.config.parry.stunDuration, () => {
                if (enemy.setData) {
                    enemy.setData('stunned', false);
                }
            });
        }

        // 播放反击音效
        if (this.scene.combatAudioManager) {
            this.scene.combatAudioManager.playCounterAttack();
        }
    }

    /**
     * 显示完美格挡文字
     */
    showPerfectParryText() {
        const text = this.scene.add.text(
            this.player.x,
            this.player.y - 80,
            '⚡ 完美格挡! ⚡',
            {
                fontFamily: 'Noto Sans SC',
                fontSize: 'bold 32px',
                fill: '#4fc3f7',
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5);
        text.setDepth(160);

        this.scene.tweens.add({
            targets: text,
            y: text.y - 50,
            alpha: 0,
            scale: 1.3,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                text.destroy();
            }
        });
    }

    /**
     * 显示完美闪避文字
     */
    showPerfectDodgeText() {
        const text = this.scene.add.text(
            this.player.x,
            this.player.y - 80,
            '💨 完美闪避! 💨',
            {
                fontFamily: 'Noto Sans SC',
                fontSize: 'bold 32px',
                fill: '#87ceeb',
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5);
        text.setDepth(160);

        this.scene.tweens.add({
            targets: text,
            y: text.y - 50,
            alpha: 0,
            scale: 1.3,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                text.destroy();
            }
        });
    }

    /**
     * 显示冷却提示
     */
    showCooldownMessage(action) {
        const remaining = Math.ceil((this[action === '格挡' ? 'parryCooldown' : 'dodgeCooldown'] - this.scene.time.now) / 1000);

        if (this.scene.showFloatingText) {
            this.scene.showFloatingText(
                this.player.x,
                this.player.y - 40,
                `${action}冷却: ${remaining}秒`,
                '#ff6b6b'
            );
        }
    }

    /**
     * 结束格挡
     */
    endParry(perfect = false) {
        this.isParrying = false;
        this.parryTriggered = false;

        // 移除格挡特效
        if (this.parryEffect) {
            this.parryEffect.destroy();
            this.parryEffect = null;
        }

        // 设置冷却
        this.parryCooldown = this.scene.time.now + this.maxParryCooldown;

        // 如果不是完美格挡，显示失败提示
        if (!perfect && this.scene.showFloatingText) {
            this.scene.showFloatingText(
                this.player.x,
                this.player.y - 40,
                '格挡未触发',
                '#ed8936'
            );
        }
    }

    /**
     * 结束闪避
     */
    endDodge() {
        this.isDodging = false;
        this.dodgeTriggered = false;

        // 移除无敌状态
        this.player.setData('invincible', false);

        // 设置冷却
        this.dodgeCooldown = this.scene.time.now + this.maxDodgeCooldown;
    }

    /**
     * 每帧更新
     */
    update(time, delta) {
        // 更新格挡特效位置
        if (this.parryEffect && this.isParrying) {
            this.parryEffect.setPosition(this.player.x, this.player.y);
        }
    }

    /**
     * 销毁系统
     */
    destroy() {
        // 清理特效
        if (this.parryEffect) {
            this.parryEffect.destroy();
        }

        this.dodgeTrails.forEach(trail => {
            if (trail.active) {
                trail.destroy();
            }
        });
        this.dodgeTrails = [];

        console.log('🛡️ 格挡/闪避系统已销毁');
    }
}
