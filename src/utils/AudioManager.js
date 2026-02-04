/**
 * AudioManager - 音频管理器
 * 使用Web Audio API生成游戏音效，不依赖外部音频文件
 */
class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.musicEnabled = true;
        this.sfxEnabled = true;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.5;

        this.currentMusic = null;
        this.sounds = {};

        // 初始化Web Audio API
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        console.log('🎵 音频管理器初始化（Web Audio API）');
    }

    /**
     * 生成音效（使用OscillatorNode）
     * @param {object} config - 音效配置
     * @returns {AudioBuffer} - 音频缓冲区
     */
    generateSound(config) {
        const sampleRate = this.audioContext.sampleRate;
        const duration = config.duration || 0.1; // 秒
        const frameCount = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
        const data = buffer.getChannelData(0);

        // 生成波形
        for (let i = 0; i < frameCount; i++) {
            const t = i / sampleRate;
            let value = 0;

            // 基础波形
            switch (config.type) {
                case 'sine':
                    value = Math.sin(2 * Math.PI * config.frequency * t);
                    break;
                case 'square':
                    value = Math.sign(Math.sin(2 * Math.PI * config.frequency * t));
                    break;
                case 'sawtooth':
                    value = 2 * (t * config.frequency - Math.floor(t * config.frequency + 0.5));
                    break;
                case 'noise':
                    value = Math.random() * 2 - 1;
                    break;
            }

            // 频率包络（pitch变化）
            if (config.pitchEnvelope) {
                const pitchFactor = 1 + (config.pitchEnvelope.start - config.pitchEnvelope.end) * (t / duration);
                value *= pitchFactor;
            }

            // 振幅包络（volume变化）
            let amplitude = 1;
            if (config.amplitudeEnvelope) {
                const { attack, decay } = config.amplitudeEnvelope;
                if (t < attack) {
                    amplitude = t / attack; // Attack
                } else if (t < attack + decay) {
                    amplitude = 1 - (t - attack) / decay; // Decay
                } else {
                    amplitude = 0;
                }
            }

            data[i] = value * amplitude;
        }

        return buffer;
    }

    /**
     * 播放音效
     * @param {string} sfxKey - 音效标识
     */
    playSFX(sfxKey) {
        if (!this.sfxEnabled) return;

        // 如果AudioContext被暂停，恢复它
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        // 音效配置
        const soundConfigs = {
            attack: {
                type: 'sawtooth',
                frequency: 800,
                duration: 0.08,
                amplitudeEnvelope: { attack: 0.01, decay: 0.07 }
            },
            hit: {
                type: 'square',
                frequency: 200,
                duration: 0.1,
                amplitudeEnvelope: { attack: 0.01, decay: 0.09 }
            },
            enemy_death: {
                type: 'sawtooth',
                frequency: 150,
                duration: 0.3,
                pitchEnvelope: { start: 1.5, end: 0.5 },
                amplitudeEnvelope: { attack: 0.05, decay: 0.25 }
            },
            player_death: {
                type: 'sine',
                frequency: 100,
                duration: 0.8,
                pitchEnvelope: { start: 2, end: 0.3 },
                amplitudeEnvelope: { attack: 0.1, decay: 0.7 }
            },
            level_up: {
                type: 'sine',
                frequency: 600,
                duration: 0.5,
                pitchEnvelope: { start: 1, end: 2 },
                amplitudeEnvelope: { attack: 0.1, decay: 0.4 }
            },
            quest_complete: {
                type: 'sine',
                frequency: 800,
                duration: 0.6,
                pitchEnvelope: { start: 1, end: 1.5 },
                amplitudeEnvelope: { attack: 0.1, decay: 0.5 }
            },
            boss_skill: {
                type: 'square',
                frequency: 120,
                duration: 0.5,
                pitchEnvelope: { start: 0.5, end: 2 },
                amplitudeEnvelope: { attack: 0.1, decay: 0.4 }
            },
            boss_death: {
                type: 'sawtooth',
                frequency: 100,
                duration: 1.5,
                pitchEnvelope: { start: 2, end: 0.2 },
                amplitudeEnvelope: { attack: 0.2, decay: 1.3 }
            },
            ui_click: {
                type: 'sine',
                frequency: 1000,
                duration: 0.05,
                amplitudeEnvelope: { attack: 0.01, decay: 0.04 }
            },
            coin_pickup: {
                type: 'sine',
                frequency: 1200,
                duration: 0.15,
                pitchEnvelope: { start: 1, end: 1.5 },
                amplitudeEnvelope: { attack: 0.02, decay: 0.13 }
            },
            chest_open: {
                type: 'square',
                frequency: 400,
                duration: 0.2,
                pitchEnvelope: { start: 1, end: 1.3 },
                amplitudeEnvelope: { attack: 0.05, decay: 0.15 }
            },
            // ========== 新增音效 ==========

            // 战斗音效
            critical_hit: {
                type: 'sawtooth',
                frequency: 1200,
                duration: 0.15,
                pitchEnvelope: { start: 1.5, end: 0.8 },
                amplitudeEnvelope: { attack: 0.02, decay: 0.13 }
            },
            player_hit: {
                type: 'square',
                frequency: 150,
                duration: 0.12,
                pitchEnvelope: { start: 1.2, end: 0.7 },
                amplitudeEnvelope: { attack: 0.02, decay: 0.10 }
            },
            skill_whirlwind: {
                type: 'sawtooth',
                frequency: 300,
                duration: 0.4,
                pitchEnvelope: { start: 0.5, end: 1.5 },
                amplitudeEnvelope: { attack: 0.1, decay: 0.3 }
            },
            skill_charge: {
                type: 'square',
                frequency: 200,
                duration: 0.3,
                pitchEnvelope: { start: 1, end: 2 },
                amplitudeEnvelope: { attack: 0.05, decay: 0.25 }
            },
            skill_heal: {
                type: 'sine',
                frequency: 800,
                duration: 0.5,
                pitchEnvelope: { start: 1, end: 1.3 },
                amplitudeEnvelope: { attack: 0.1, decay: 0.4 }
            },
            skill_ultimate: {
                type: 'sawtooth',
                frequency: 100,
                duration: 1.0,
                pitchEnvelope: { start: 0.3, end: 2 },
                amplitudeEnvelope: { attack: 0.2, decay: 0.8 }
            },
            boss_roar: {
                type: 'square',
                frequency: 80,
                duration: 0.8,
                pitchEnvelope: { start: 1, end: 0.5 },
                amplitudeEnvelope: { attack: 0.1, decay: 0.7 }
            },

            // UI音效
            equip_item: {
                type: 'sine',
                frequency: 600,
                duration: 0.1,
                pitchEnvelope: { start: 1, end: 1.2 },
                amplitudeEnvelope: { attack: 0.02, decay: 0.08 }
            },
            skill_unlock: {
                type: 'sine',
                frequency: 1000,
                duration: 0.4,
                pitchEnvelope: { start: 1, end: 1.5 },
                amplitudeEnvelope: { attack: 0.1, decay: 0.3 }
            },
            victory: {
                type: 'sine',
                frequency: 523.25,
                duration: 0.8,
                pitchEnvelope: { start: 1, end: 1.3 },
                amplitudeEnvelope: { attack: 0.1, decay: 0.7 }
            },
            defeat: {
                type: 'sawtooth',
                frequency: 200,
                duration: 0.6,
                pitchEnvelope: { start: 1, end: 0.5 },
                amplitudeEnvelope: { attack: 0.1, decay: 0.5 }
            },

            // 环境音效（循环播放）
            torch_fire: {
                type: 'noise',
                frequency: 1000,
                duration: 0.5,
                amplitudeEnvelope: { attack: 0.1, decay: 0.4 }
            },
            cave_ambience: {
                type: 'sine',
                frequency: 80,
                duration: 2.0,
                amplitudeEnvelope: { attack: 0.5, decay: 1.5 }
            },
            snow_wind: {
                type: 'noise',
                frequency: 500,
                duration: 1.5,
                amplitudeEnvelope: { attack: 0.3, decay: 1.2 }
            },
            lava_bubble: {
                type: 'sine',
                frequency: 150,
                duration: 0.3,
                pitchEnvelope: { start: 1, end: 0.7 },
                amplitudeEnvelope: { attack: 0.05, decay: 0.25 }
            },
            forest_bird: {
                type: 'sine',
                frequency: 2000,
                duration: 0.1,
                pitchEnvelope: { start: 1.2, end: 0.8 },
                amplitudeEnvelope: { attack: 0.01, decay: 0.09 }
            },
            // 宠物音效
            pet_attack: {
                type: 'sine',
                frequency: 800,
                duration: 0.1,
                amplitudeEnvelope: { attack: 0.01, decay: 0.09 }
            }
        };

        const config = soundConfigs[sfxKey];
        if (!config) {
            console.warn(`⚠️ 未找到音效配置: ${sfxKey}`);
            return;
        }

        // 生成或获取音效缓冲区
        if (!this.sounds[sfxKey]) {
            this.sounds[sfxKey] = this.generateSound(config);
        }

        // 播放音效
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();

        source.buffer = this.sounds[sfxKey];
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        gainNode.gain.value = this.sfxVolume;

        source.start(0);
    }

    /**
     * 播放背景音乐（使用循环音效模拟）
     * @param {string} musicKey - 音乐标识
     */
    playMusic(musicKey) {
        if (!this.musicEnabled) return;

        // 停止当前音乐
        if (this.currentMusic) {
            this.stopMusic();
        }

        console.log(`🎵 播放音乐: ${musicKey}`);

        // 使用环境音效模拟背景音乐
        const musicConfigs = {
            town_music: {
                type: 'sine',
                frequency: 440, // A4
                duration: 2,
                pitchEnvelope: { start: 1, end: 1 },
                amplitudeEnvelope: { attack: 0.5, decay: 1.5 }
            },
            forest_music: {
                type: 'sine',
                frequency: 523.25, // C5
                duration: 2,
                pitchEnvelope: { start: 1, end: 1.1 },
                amplitudeEnvelope: { attack: 0.5, decay: 1.5 }
            },
            cave_music: {
                type: 'square',
                frequency: 196, // G3
                duration: 2,
                pitchEnvelope: { start: 1, end: 0.9 },
                amplitudeEnvelope: { attack: 0.5, decay: 1.5 }
            }
        };

        const config = musicConfigs[musicKey];
        if (config) {
            // 生成音乐缓冲区
            this.currentMusic = {
                buffer: this.generateSound(config),
                source: null,
                gainNode: null
            };

            // 循环播放
            this.playMusicLoop();
        }
    }

    /**
     * 循环播放背景音乐
     */
    playMusicLoop() {
        if (!this.currentMusic) return;

        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();

        source.buffer = this.currentMusic.buffer;
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        gainNode.gain.value = this.musicVolume;

        // 循环播放
        source.loop = true;
        source.start(0);

        this.currentMusic.source = source;
        this.currentMusic.gainNode = gainNode;
    }

    /**
     * 停止背景音乐
     */
    stopMusic() {
        if (this.currentMusic && this.currentMusic.source) {
            try {
                this.currentMusic.source.stop();
            } catch (e) {
                // 已经停止，忽略错误
            }
            this.currentMusic = null;
        }
    }

    /**
     * 战斗音效（快捷方法）
     */
    playAttack() {
        this.playSFX('attack');
    }

    playHit() {
        this.playSFX('hit');
    }

    playEnemyDeath() {
        this.playSFX('enemy_death');
    }

    playPlayerDeath() {
        this.playSFX('player_death');
    }

    playLevelUp() {
        this.playSFX('level_up');
    }

    playQuestComplete() {
        this.playSFX('quest_complete');
    }

    playBossSkill() {
        this.playSFX('boss_skill');
    }

    playBossDeath() {
        this.playSFX('boss_death');
    }

    playCoinPickup() {
        this.playSFX('coin_pickup');
    }

    playChestOpen() {
        this.playSFX('chest_open');
    }

    playUIClick() {
        this.playSFX('ui_click');
    }

    // ========== 新增音效播放方法 ==========

    // 战斗音效
    playCriticalHit() {
        this.playSFX('critical_hit');
    }

    playPlayerHit() {
        this.playSFX('player_hit');
    }

    playWhirlwindSlash() {
        this.playSFX('skill_whirlwind');
    }

    playCharge() {
        this.playSFX('skill_charge');
    }

    playHealingLight() {
        this.playSFX('skill_heal');
    }

    playUltimate() {
        this.playSFX('skill_ultimate');
    }

    playBossRoar() {
        this.playSFX('boss_roar');
    }

    // UI音效
    playEquipItem() {
        this.playSFX('equip_item');
    }

    playSkillUnlock() {
        this.playSFX('skill_unlock');
    }

    playVictory() {
        this.playSFX('victory');
    }

    playDefeat() {
        this.playSFX('defeat');
    }

    // 环境音效
    playTorchFire() {
        this.playSFX('torch_fire');
    }

    playCaveAmbience() {
        this.playSFX('cave_ambience');
    }

    playSnowWind() {
        this.playSFX('snow_wind');
    }

    playLavaBubble() {
        this.playSFX('lava_bubble');
    }

    playForestBird() {
        this.playSFX('forest_bird');
    }

    /**
     * 场景音乐切换
     * @param {string} sceneName - 场景名称
     */
    changeSceneMusic(sceneName) {
        const musicMap = {
            'town': 'town_music',
            'forest': 'forest_music',
            'cave': 'cave_music',
            'snow_mountain': 'cave_music', // 使用洞穴音乐
            'volcanic_cavern': 'cave_music' // 使用洞穴音乐
        };

        const musicKey = musicMap[sceneName];
        if (musicKey) {
            this.playMusic(musicKey);
        }
    }

    /**
     * 设置音乐音量
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));

        // 实时更新正在播放的音乐音量
        if (this.currentMusic && this.currentMusic.gainNode) {
            this.currentMusic.gainNode.gain.value = this.musicVolume;
        }

        console.log(`🎵 音乐音量: ${this.musicVolume}`);
    }

    /**
     * 设置音效音量
     */
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        console.log(`🔊 音效音量: ${this.sfxVolume}`);
    }

    /**
     * 切换音乐开关
     */
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (this.musicEnabled) {
            console.log('🎵 音乐已启用');
            // 恢复播放
            if (this.scene.sceneManager) {
                this.changeSceneMusic(this.scene.sceneManager.getCurrentScene());
            }
        } else {
            this.stopMusic();
            console.log('🎵 音乐已禁用');
        }
        return this.musicEnabled;
    }

    /**
     * 切换音效开关
     */
    toggleSFX() {
        this.sfxEnabled = !this.sfxEnabled;
        console.log(`🔊 音效已${this.sfxEnabled ? '启用' : '禁用'}`);
        return this.sfxEnabled;
    }

    // ============ 🐾 宠物系统音效 ============

    /**
     * 播放宠物攻击音效
     */
    playPetAttack() {
        this.playSFX('pet_attack');
    }
}
