/**
 * CombatAtmosphereSystem - 战斗氛围增强系统
 *
 * Phase 8: 战斗氛围深度增强
 * - US-037: 战斗动态背景音乐（根据战斗强度变化）
 * - US-038: 低血量心跳音效和红屏脉冲
 * - US-039: 击杀血迹残留（地面血迹）
 * - US-040: 连击粒子风暴（高连击时粒子爆发）
 * - US-041: Boss战环境特效（环境变色、粒子背景）
 */
class CombatAtmosphereSystem {
    constructor(scene) {
        this.scene = scene;

        // ============ US-037: 战斗动态背景音乐 ============
        this.musicIntensity = 0; // 0-1
        this.baseMusicVolume = 0.3;
        this.combatMusicVolume = 0.6;
        this.currentMusicVolume = this.baseMusicVolume;

        // ============ US-038: 低血量心跳音效和红屏脉冲 ============
        this.lowHealthThreshold = 0.3; // HP < 30%
        this.heartbeatInterval = 1000; // 初始1秒
        this.lastHeartbeatTime = 0;
        this.heartbeatAudioContext = null;

        // 红屏脉冲特效
        this.lowHealthVignette = null;
        this.pulseTween = null;

        // ============ US-039: 击杀血迹残留 ============
        this.bloodStains = [];
        this.maxBloodStains = 50;

        // ============ US-040: 连击粒子风暴 ============
        this.comboStormThreshold = 20; // 20连击触发
        this.comboStormParticles = [];
        this.maxStormParticles = 100;

        // ============ US-041: Boss战环境特效 ============
        this.bossEnvironmentEffects = {
            active: false,
            overlay: null,
            backgroundParticles: [],
            ambientColor: 0x000000
        };

        console.log('🎭 战斗氛围增强系统初始化');
    }

    // ==================== US-037: 战斗动态背景音乐 ====================

    /**
     * 根据战斗强度更新音乐
     * @param {number} comboCount - 当前连击数
     * @param {number} healthPercent - 玩家血量百分比
     * @param {boolean} isBossFight - 是否Boss战
     */
    updateBattleMusic(comboCount, healthPercent, isBossFight) {
        // 计算音乐强度
        let intensity = 0;

        // 连击增加强度（最高30%）
        intensity += Math.min(comboCount / 50, 0.3);

        // 低血量增加强度（最高40%）
        if (healthPercent < 0.3) {
            intensity += (0.3 - healthPercent) / 0.3 * 0.4;
        }

        // Boss战增加强度（30%）
        if (isBossFight) {
            intensity += 0.3;
        }

        this.musicIntensity = Math.min(intensity, 1);

        // 平滑过渡音量
        const targetVolume = this.baseMusicVolume +
            (this.combatMusicVolume - this.baseMusicVolume) * this.musicIntensity;

        this.currentMusicVolume = Phaser.Math.Linear(this.currentMusicVolume, targetVolume, 0.05);

        // 应用到AudioManager
        if (this.scene.audioManager) {
            this.scene.audioManager.setMusicVolume(this.currentMusicVolume);
        }
    }

    // ==================== US-038: 低血量心跳音效和红屏脉冲 ====================

    /**
     * 更新低血量效果
     * @param {number} healthPercent - 血量百分比（0-1）
     */
    updateLowHealthEffects(healthPercent) {
        if (healthPercent >= this.lowHealthThreshold) {
            this.stopLowHealthEffects();
            return;
        }

        const now = this.scene.time.now;

        // 心跳加速（血量越低，心跳越快）
        const intensity = 1 - (healthPercent / this.lowHealthThreshold);
        this.heartbeatInterval = 1000 - intensity * 700; // 1000ms → 300ms

        if (now - this.lastHeartbeatTime >= this.heartbeatInterval) {
            this.playHeartbeat();
            this.lastHeartbeatTime = now;
        }

        // 红屏脉冲
        this.updateLowHealthVignette(intensity);
    }

    /**
     * 播放心跳音效（使用Web Audio API）
     */
    playHeartbeat() {
        if (!this.heartbeatAudioContext) {
            this.heartbeatAudioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const oscillator = this.heartbeatAudioContext.createOscillator();
        const gainNode = this.heartbeatAudioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.heartbeatAudioContext.destination);

        // 心跳音效（低频脉冲）
        oscillator.frequency.setValueAtTime(60, this.heartbeatAudioContext.currentTime);
        oscillator.type = 'sine';

        // 音量包络（咚-咚）
        gainNode.gain.setValueAtTime(0, this.heartbeatAudioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.8, this.heartbeatAudioContext.currentTime + 0.05);
        gainNode.gain.linearRampToValueAtTime(0.3, this.heartbeatAudioContext.currentTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0.8, this.heartbeatAudioContext.currentTime + 0.15);
        gainNode.gain.linearRampToValueAtTime(0, this.heartbeatAudioContext.currentTime + 0.3);

        oscillator.start(this.heartbeatAudioContext.currentTime);
        oscillator.stop(this.heartbeatAudioContext.currentTime + 0.3);
    }

    /**
     * 更新低血量红屏vignette
     * @param {number} intensity - 强度（0-1）
     */
    updateLowHealthVignette(intensity) {
        if (!this.lowHealthVignette) {
            this.createLowHealthVignette();
        }

        // 脉冲效果
        const pulse = Math.sin(this.scene.time.now * 0.01) * 0.5 + 0.5; // 0-1
        const alpha = 0.3 + intensity * 0.4 + pulse * 0.2;

        this.lowHealthVignette.alpha = alpha;
    }

    /**
     * 创建低血量vignette
     */
    createLowHealthVignette() {
        this.lowHealthVignette = this.scene.add.graphics();
        this.lowHealthVignette.setDepth(155);
        this.lowHealthVignette.setScrollFactor(0);

        // 绘制红色vignette（从中心透明到边缘红色）
        const centerX = 400;
        const centerY = 300;
        const maxRadius = 500;

        for (let r = maxRadius; r > 0; r -= 20) {
            const alpha = (1 - r / maxRadius) * 0.5;
            this.lowHealthVignette.fillStyle(0xff0000, alpha);
            this.lowHealthVignette.fillCircle(centerX, centerY, r);
        }
    }

    /**
     * 停止低血量效果
     */
    stopLowHealthEffects() {
        if (this.lowHealthVignette) {
            this.lowHealthVignette.alpha = 0;
        }
    }

    // ==================== US-039: 击杀血迹残留 ====================

    /**
     * 创建血迹（敌人死亡时）
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} enemyType - 敌人类型
     */
    createBloodStain(x, y, enemyType) {
        // 血迹大小根据敌人类型
        let size = 20;
        let color = 0x8b0000;

        if (enemyType === 'elite') {
            size = 30;
            color = 0xa00000;
        } else if (enemyType === 'boss') {
            size = 50;
            color = 0xc00000;
        }

        // 创建血迹图形
        const stain = this.scene.add.graphics();
        stain.setDepth(5); // 地面层

        // 绘制不规则血迹形状
        stain.fillStyle(color, 0.7);
        stain.beginPath();

        const points = 8;
        for (let i = 0; i <= points; i++) {
            const angle = (Math.PI * 2 / points) * i;
            const variance = 0.7 + Math.random() * 0.6;
            const px = x + Math.cos(angle) * size * variance;
            const py = y + Math.sin(angle) * size * variance;

            if (i === 0) {
                stain.moveTo(px, py);
            } else {
                stain.lineTo(px, py);
            }
        }

        stain.closePath();
        stain.fillPath();

        // 飞溅效果
        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = size + Math.random() * 20;
            const splashSize = 3 + Math.random() * 5;

            stain.fillCircle(
                x + Math.cos(angle) * distance,
                y + Math.sin(angle) * distance,
                splashSize
            );
        }

        this.bloodStains.push(stain);

        // 限制血迹数量
        if (this.bloodStains.length > this.maxBloodStains) {
            const oldStain = this.bloodStains.shift();
            oldStain.destroy();
        }

        // 血迹缓慢淡化（5分钟后）
        this.scene.time.delayedCall(300000, () => {
            this.scene.tweens.add({
                targets: stain,
                alpha: 0,
                duration: 10000,
                onComplete: () => {
                    stain.destroy();
                    const idx = this.bloodStains.indexOf(stain);
                    if (idx > -1) {
                        this.bloodStains.splice(idx, 1);
                    }
                }
            });
        });
    }

    // ==================== US-040: 连击粒子风暴 ====================

    /**
     * 触发连击粒子风暴
     * @param {number} comboCount - 连击数
     */
    triggerComboStorm(comboCount) {
        if (comboCount < this.comboStormThreshold) return;

        const intensity = Math.min((comboCount - this.comboStormThreshold) / 30, 1);
        const particleCount = Math.floor(20 + intensity * 30); // 20-50个粒子

        for (let i = 0; i < particleCount; i++) {
            const x = this.scene.player.x + (Math.random() - 0.5) * 100;
            const y = this.scene.player.y + (Math.random() - 0.5) * 100;

            this.createStormParticle(x, y, intensity);
        }
    }

    /**
     * 创建风暴粒子
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} intensity - 风暴强度
     */
    createStormParticle(x, y, intensity) {
        const colors = [0xff6600, 0xffcc00, 0xff00ff, 0x00ffff, 0xffffff];
        const color = Phaser.Utils.Array.GetRandom(colors);

        const particle = this.scene.add.circle(x, y, 3 + Math.random() * 3, color, 1);
        particle.setDepth(160);

        // 螺旋运动
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 50;
        const rotationSpeed = 0.02 + Math.random() * 0.03;
        const duration = 500 + intensity * 500;

        this.scene.tweens.add({
            targets: particle,
            x: x + Math.cos(angle) * distance,
            y: y + Math.sin(angle) * distance,
            alpha: 0,
            scale: 0,
            duration: duration,
            ease: 'Power2',
            onComplete: () => {
                particle.destroy();
                const idx = this.comboStormParticles.indexOf(particle);
                if (idx > -1) {
                    this.comboStormParticles.splice(idx, 1);
                }
            }
        });

        this.comboStormParticles.push(particle);

        // 限制粒子数量
        if (this.comboStormParticles.length > this.maxStormParticles) {
            const oldParticle = this.comboStormParticles.shift();
            oldParticle.destroy();
        }
    }

    // ==================== US-041: Boss战环境特效 ====================

    /**
     * 激活Boss战环境特效
     * @param {string} bossType - Boss类型（nature/dark/fire等）
     */
    activateBossEnvironment(bossType) {
        this.bossEnvironmentEffects.active = true;

        // 根据Boss类型设置环境色
        const environmentColors = {
            nature: { color: 0x228b22, name: '自然' },
            dark: { color: 0x2f0040, name: '暗影' },
            fire: { color: 0x4a0000, name: '火焰' },
            ice: { color: 0x001a33, name: '冰霜' },
            lightning: { color: 0x1a0033, name: '雷电' }
        };

        const config = environmentColors[bossType] || environmentColors.dark;
        this.bossEnvironmentEffects.ambientColor = config.color;

        // 1. 创建环境覆盖层
        this.bossEnvironmentEffects.overlay = this.scene.add.graphics();
        this.bossEnvironmentEffects.overlay.setDepth(154);
        this.bossEnvironmentEffects.overlay.setScrollFactor(0);
        this.bossEnvironmentEffects.overlay.fillStyle(config.color, 0.3);
        this.bossEnvironmentEffects.overlay.fillRect(0, 0, 800, 600);

        // 2. 背景粒子
        this.createBossBackgroundParticles(bossType);

        console.log(`🎭 Boss环境激活: ${config.name}`);
    }

    /**
     * 创建Boss背景粒子
     * @param {string} bossType - Boss类型
     */
    createBossBackgroundParticles(bossType) {
        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            const x = Math.random() * 800;
            const y = Math.random() * 600;
            const size = 2 + Math.random() * 4;

            let color = 0xffffff;
            if (bossType === 'nature') color = 0x90EE90;
            else if (bossType === 'dark') color = 0x993399;
            else if (bossType === 'fire') color = 0xff6600;
            else if (bossType === 'ice') color = 0x66ccff;
            else if (bossType === 'lightning') color = 0x9966ff;

            const particle = this.scene.add.circle(x, y, size, color, 0.6);
            particle.setDepth(153);

            // 缓慢浮动
            this.scene.tweens.add({
                targets: particle,
                y: particle.y - 50,
                alpha: 0.2,
                duration: 3000 + Math.random() * 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            this.bossEnvironmentEffects.backgroundParticles.push(particle);
        }
    }

    /**
     * 停用Boss战环境特效
     */
    deactivateBossEnvironment() {
        this.bossEnvironmentEffects.active = false;

        // 清除覆盖层
        if (this.bossEnvironmentEffects.overlay) {
            this.scene.tweens.add({
                targets: this.bossEnvironmentEffects.overlay,
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    this.bossEnvironmentEffects.overlay.destroy();
                    this.bossEnvironmentEffects.overlay = null;
                }
            });
        }

        // 清除背景粒子
        this.bossEnvironmentEffects.backgroundParticles.forEach(particle => {
            this.scene.tweens.add({
                targets: particle,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    particle.destroy();
                }
            });
        });
        this.bossEnvironmentEffects.backgroundParticles = [];

        console.log('🎭 Boss环境已停用');
    }

    // ==================== 系统更新 ====================

    /**
     * 每帧更新
     */
    update(time, delta) {
        // 更新战斗音乐
        const comboCount = this.scene.comboSystem?.comboCount || 0;
        const healthPercent = this.scene.player ?
            (this.scene.player.hp || 100) / (this.scene.player.maxHp || 100) : 1;
        const isBossFight = this.bossEnvironmentEffects.active;

        this.updateBattleMusic(comboCount, healthPercent, isBossFight);

        // 更新低血量效果
        this.updateLowHealthEffects(healthPercent);
    }

    /**
     * 销毁系统
     */
    destroy() {
        // 清除血迹
        this.bloodStains.forEach(stain => stain.destroy());
        this.bloodStains = [];

        // 清除连击粒子
        this.comboStormParticles.forEach(particle => particle.destroy());
        this.comboStormParticles = [];

        // 清除低血量特效
        if (this.lowHealthVignette) {
            this.lowHealthVignette.destroy();
        }

        // 停用Boss环境
        this.deactivateBossEnvironment();

        console.log('🎭 战斗氛围增强系统已销毁');
    }
}
