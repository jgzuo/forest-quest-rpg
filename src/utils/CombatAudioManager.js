/**
 * CombatAudioManager - 战斗音效管理系统
 *
 * 为战斗系统提供完整的音效支持：
 * - 元素专属音效（8种元素）
 * - 连击音效渐强系统
 * - 技能音效反馈
 * - Boss战史诗音乐
 * - 格挡/闪避音效
 *
 * 使用 Web Audio API 程序化生成音效，无需外部音频文件
 */

class CombatAudioManager {
    constructor(scene) {
        this.scene = scene;
        this.audioContext = null;

        // 主音量控制
        this.masterVolume = 0.5;
        this.sfxVolume = 0.6;
        this.musicVolume = 0.4;

        // 音效缓存
        this.soundCache = new Map();
        this.musicCache = new Map();

        // 当前播放的音乐
        this.currentMusic = null;
        this.currentMusicLoop = false;

        // 音效配置映射
        this.soundConfig = {
            // 元素音效（8种基础元素）
            elements: {
                fire: { type: 'noise', filter: 'lowpass', frequency: [200, 800], duration: 0.3 },
                ice: { type: 'sine', filter: 'highpass', frequency: [1200, 2000], duration: 0.2 },
                lightning: { type: 'sawtooth', filter: 'none', frequency: [100, 500], duration: 0.15 },
                poison: { type: 'triangle', filter: 'lowpass', frequency: [300, 600], duration: 0.25 },
                light: { type: 'sine', filter: 'none', frequency: [800, 1600], duration: 0.4 },
                shadow: { type: 'sawtooth', filter: 'lowpass', frequency: [100, 300], duration: 0.35 },
                earth: { type: 'square', filter: 'lowpass', frequency: [80, 200], duration: 0.4 },
                storm: { type: 'sawtooth', filter: 'none', frequency: [200, 600], duration: 0.3 }
            },

            // 连击音效（5个层级）
            combo: {
                tier1: { frequency: 400, duration: 0.1, volume: 0.3 },      // 0-5 连击
                tier2: { frequency: 600, duration: 0.12, volume: 0.4 },     // 6-10 连击
                tier3: { frequency: 800, duration: 0.15, volume: 0.5 },     // 11-15 连击
                tier4: { frequency: 1000, duration: 0.18, volume: 0.6 },    // 16-20 连击
                tier5: { frequency: 1200, duration: 0.2, volume: 0.7 },     // 20+ 连击
                milestone: { frequency: 1500, duration: 0.3, volume: 0.8 }  // 里程碑（10/15/20）
            },

            // 技能音效
            skills: {
                whirlwind_slash: { type: 'sawtooth', frequency: [200, 600], duration: 0.5 },
                charge: { type: 'square', frequency: [100, 400], duration: 0.3 },
                healing_light: { type: 'sine', frequency: [600, 1200], duration: 0.6 },
                ultimate: { type: 'sawtooth', frequency: [100, 800], duration: 1.0 },
                charge_start: { type: 'sine', frequency: 400, duration: 0.2 },
                charge_levelup: { type: 'sine', frequency: 600, duration: 0.15 },
                charge_release: { type: 'sawtooth', frequency: [200, 1000], duration: 0.4 },
                cooldown_ready: { type: 'sine', frequency: 800, duration: 0.1 },
                insufficient_mana: { type: 'square', frequency: [200, 100], duration: 0.2 }
            },

            // Boss战音乐
            boss: {
                phase1_music: { type: 'ambient', frequency: 60, tempo: 80 },
                phase2_music: { type: 'ambient', frequency: 80, tempo: 100 },
                phase3_music: { type: 'ambient', frequency: 100, tempo: 120 },
                phase_transition: { type: 'sawtooth', frequency: [100, 500], duration: 1.0 },
                victory_fanfare: { type: 'sine', frequency: [400, 800], duration: 2.0 },
                death_sound: { type: 'sawtooth', frequency: [200, 50], duration: 2.5 }
            },

            // 格挡/闪避音效
            combat: {
                parry_perfect: { type: 'square', frequency: [800, 1200], duration: 0.15 },
                parry_broken: { type: 'sawtooth', frequency: [400, 100], duration: 0.2 },
                dodge_perfect: { type: 'sine', frequency: 1000, duration: 0.1 },
                counter_attack: { type: 'sawtooth', frequency: [200, 800], duration: 0.25 },
                hit_normal: { type: 'triangle', frequency: 200, duration: 0.1 },
                hit_crit: { type: 'sawtooth', frequency: [200, 600], duration: 0.15 }
            }
        };

        console.log('🔊 战斗音效管理系统初始化');
    }

    /**
     * 初始化音频上下文（需要用户交互后才能创建）
     */
    initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('🎵 音频上下文已创建');
        }
        return this.audioContext;
    }

    /**
     * 播放音效
     * @param {string} effectName - 音效名称（如 'elements.fire', 'combo.tier1'）
     * @param {number} volume - 音量 (0-1)
     * @param {number} pitch - 音高倍率 (0.5-2.0)
     */
    playSoundEffect(effectName, volume = 1.0, pitch = 1.0) {
        try {
            const ctx = this.initAudioContext();

            // 解析音效名称（如 'elements.fire'）
            const config = this.getConfig(effectName);
            if (!config) {
                console.warn(`音效配置不存在: ${effectName}`);
                return null;
            }

            // 根据类型生成音效
            const sound = this.generateSound(ctx, config, volume * this.sfxVolume * this.masterVolume, pitch);

            if (sound) {
                sound.start(ctx.currentTime);
                return sound;
            }
        } catch (error) {
            console.error(`播放音效失败 [${effectName}]:`, error);
        }

        return null;
    }

    /**
     * 获取音效配置（支持点号分隔的路径）
     */
    getConfig(path) {
        const keys = path.split('.');
        let config = this.soundConfig;

        for (const key of keys) {
            if (config && config[key]) {
                config = config[key];
            } else {
                return null;
            }
        }

        return config;
    }

    /**
     * 生成音效（使用 Web Audio API 振荡器）
     */
    generateSound(ctx, config, volume, pitch) {
        const now = ctx.currentTime;
        const duration = config.duration || 0.3;
        const type = config.type || 'sine';

        // 创建振荡器
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // 设置类型
        osc.type = type;

        // 设置频率
        if (Array.isArray(config.frequency)) {
            // 频率滑音
            const [startFreq, endFreq] = config.frequency;
            osc.frequency.setValueAtTime(startFreq * pitch, now);
            osc.frequency.exponentialRampToValueAtTime(endFreq * pitch, now + duration);
        } else {
            // 固定频率
            osc.frequency.setValueAtTime((config.frequency || 440) * pitch, now);
        }

        // 设置音量包络
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

        // 连接节点
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        // 设置停止时间
        osc.stop(now + duration);

        return osc;
    }

    /**
     * 播放元素音效（快捷方法）
     * @param {string} elementType - 元素类型（fire, ice, lightning, poison, light, shadow, earth, storm）
     * @param {number} damage - 伤害值（影响音量）
     */
    playElementSound(elementType, damage = 50) {
        const volume = Math.min(0.3 + damage / 200, 1.0);
        const variant = Math.floor(Math.random() * 3); // 3个变体
        this.playSoundEffect(`elements.${elementType}`, volume, 0.9 + variant * 0.2);
    }

    /**
     * 播放连击音效
     * @param {number} comboCount - 连击数
     */
    playComboSound(comboCount) {
        let tier;

        if (comboCount < 6) {
            tier = 'tier1';
        } else if (comboCount < 11) {
            tier = 'tier2';
        } else if (comboCount < 16) {
            tier = 'tier3';
        } else if (comboCount < 21) {
            tier = 'tier4';
        } else {
            tier = 'tier5';
        }

        this.playSoundEffect(`combo.${tier}`, 1.0, 1.0);

        // 里程碑音效（10/15/20连击）
        if ([10, 15, 20].includes(comboCount)) {
            this.playSoundEffect('combo.milestone', 1.0, 1.2);
        }
    }

    /**
     * 播放技能音效
     * @param {string} skillName - 技能名称
     * @param {string} phase - 阶段（start, cast, release）
     */
    playSkillSound(skillName, phase = 'cast') {
        const soundKey = `skills.${skillName}_${phase}`;
        this.playSoundEffect(soundKey, 1.0, 1.0);
    }

    /**
     * 播放Boss战音乐
     * @param {string} bossName - Boss名称
     * @param {number} phase - 阶段（1, 2, 3）
     */
    playBossMusic(bossName, phase = 1) {
        const musicKey = `boss.phase${phase}_music`;
        this.playMusic(musicKey, true, 2000);
    }

    /**
     * 播放Boss阶段转换音效
     */
    playBossPhaseTransition() {
        this.playSoundEffect('boss.phase_transition', 1.0, 1.0);
    }

    /**
     * 播放Boss胜利音乐
     */
    playBossVictory() {
        this.stopMusic(1000);
        this.playSoundEffect('boss.victory_fanfare', 1.0, 1.0);
    }

    /**
     * 播放完美格挡音效
     */
    playPerfectParry() {
        this.playSoundEffect('combat.parry_perfect', 1.0, 1.2);
    }

    /**
     * 播放格挡破坏音效
     */
    playParryBroken() {
        this.playSoundEffect('combat.parry_broken', 1.0, 0.8);
    }

    /**
     * 播放完美闪避音效
     */
    playPerfectDodge() {
        this.playSoundEffect('combat.dodge_perfect', 1.0, 1.5);
    }

    /**
     * 播放反击音效
     */
    playCounterAttack() {
        this.playSoundEffect('combat.counter_attack', 1.0, 1.1);
    }

    /**
     * 播放命中音效
     * @param {boolean} isCrit - 是否暴击
     */
    playHitSound(isCrit = false) {
        const soundKey = isCrit ? 'combat.hit_crit' : 'combat.hit_normal';
        this.playSoundEffect(soundKey, 1.0, isCrit ? 1.2 : 1.0);
    }

    /**
     * 播放背景音乐
     * @param {string} musicName - 音乐名称
     * @param {boolean} loop - 是否循环
     * @param {number} fadeIn - 淡入时长（毫秒）
     */
    playMusic(musicName, loop = false, fadeIn = 0) {
        try {
            const ctx = this.initAudioContext();

            // 停止当前音乐
            if (this.currentMusic) {
                this.stopMusic(fadeIn);
            }

            const config = this.getConfig(musicName);
            if (!config) {
                console.warn(`音乐配置不存在: ${musicName}`);
                return;
            }

            // TODO: 实现音乐播放逻辑
            // 这里可以使用简单的振荡器组合或加载音频文件
            this.currentMusic = musicName;
            this.currentMusicLoop = loop;

            console.log(`🎵 播放音乐: ${musicName} (loop: ${loop})`);
        } catch (error) {
            console.error(`播放音乐失败 [${musicName}]:`, error);
        }
    }

    /**
     * 停止背景音乐
     * @param {number} fadeOut - 淡出时长（毫秒）
     */
    stopMusic(fadeOut = 0) {
        if (this.currentMusic) {
            // TODO: 实现淡出逻辑
            console.log(`🎵 停止音乐: ${this.currentMusic}`);
            this.currentMusic = null;
            this.currentMusicLoop = false;
        }
    }

    /**
     * 设置主音量
     * @param {number} volume - 音量 (0-1)
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        console.log(`🔊 主音量设置为: ${Math.round(this.masterVolume * 100)}%`);
    }

    /**
     * 设置音效音量
     * @param {number} volume - 音量 (0-1)
     */
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        console.log(`🔊 音效音量设置为: ${Math.round(this.sfxVolume * 100)}%`);
    }

    /**
     * 设置音乐音量
     * @param {number} volume - 音量 (0-1)
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        console.log(`🔊 音乐音量设置为: ${Math.round(this.musicVolume * 100)}%`);
    }

    /**
     * 获取统计信息
     */
    getStats() {
        return {
            masterVolume: this.masterVolume,
            sfxVolume: this.sfxVolume,
            musicVolume: this.musicVolume,
            cachedSounds: this.soundCache.size,
            currentMusic: this.currentMusic
        };
    }

    /**
     * 清理资源
     */
    destroy() {
        this.stopMusic();
        this.soundCache.clear();
        this.musicCache.clear();

        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }

        console.log('🔊 战斗音效管理系统已销毁');
    }
}
