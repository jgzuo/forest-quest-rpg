/**
 * SettingsScene - 游戏设置场景
 * 提供游戏选项设置界面
 */
class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SettingsScene' });

        // 设置数据
        this.settings = {
            musicEnabled: true,
            sfxEnabled: true,
            musicVolume: 0.3,
            sfxVolume: 0.5,
            difficulty: 'normal', // easy, normal, hard
            autoSave: 'scene_change', // scene_change, level_up, never
            fullscreen: false
        };

        // UI元素引用
        this.uiElements = {};

        console.log('⚙️ 设置场景构造函数');
    }

    create() {
        console.log('⚙️ 创建设置场景');

        // 创建半透明遮罩背景
        this.createOverlay();

        // 创建设置面板
        this.createSettingsPanel();

        // 创建设置项
        this.createSettingsItems();

        // 创建底部提示
        this.createFooter();

        // 加载已保存的设置
        this.loadSettings();

        // ESC键监听（关闭设置）
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.escKey.on('down', () => {
            this.closeSettings();
        });

        // 播放UI音效
        if (this.scene.get('GameScene') && this.scene.get('GameScene').audioManager) {
            this.scene.get('GameScene').audioManager.playUIClick();
        }

        console.log('✅ 设置场景创建完成');
    }

    /**
     * 创建半透明遮罩
     */
    createOverlay() {
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
        overlay.setDepth(900);
        overlay.setInteractive(); // 允许点击

        // 点击遮罩关闭设置
        overlay.on('pointerdown', () => {
            this.closeSettings();
        });

        this.uiElements.overlay = overlay;
    }

    /**
     * 创建设置面板
     */
    createSettingsPanel() {
        const panel = this.add.container(400, 300);

        // 面板背景
        const bg = this.add.rectangle(0, 0, 500, 520, 0x1a1a2e, 0.95);
        bg.setStrokeStyle(4, 0x4facfe);
        panel.add(bg);

        // 面板标题
        const title = this.add.text(0, -230, '⚙️ 游戏设置', {
            fontFamily: 'Noto Sans SC',
            fontSize: 'bold 28px',
            fill: '#4facfe',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        panel.add(title);

        // 分隔线
        const divider = this.add.graphics();
        divider.lineStyle(2, 0x4facfe, 0.5);
        divider.beginPath();
        divider.moveTo(-220, -200);
        divider.lineTo(220, -200);
        divider.strokePath();
        panel.add(divider);

        panel.setDepth(901);
        panel.setScrollFactor(0);

        this.uiElements.panel = panel;
    }

    /**
     * 创建设置项
     */
    createSettingsItems() {
        const startY = -170;
        const lineHeight = 65;

        // 1. 音乐开关
        this.createToggleSetting(
            'musicEnabled',
            '🎵 背景音乐',
            startY,
            (value) => {
                this.settings.musicEnabled = value;
                this.updateMusicState();
            }
        );

        // 2. 音效开关
        this.createToggleSetting(
            'sfxEnabled',
            '🔊 音效',
            startY + lineHeight,
            (value) => {
                this.settings.sfxEnabled = value;
                this.updateSFXState();
            }
        );

        // 3. 音乐音量
        this.createSliderSetting(
            'musicVolume',
            '📢 音乐音量',
            startY + lineHeight * 2,
            0, 1, 0.1,
            (value) => {
                this.settings.musicVolume = value;
                this.updateMusicVolume();
            }
        );

        // 4. 音效音量
        this.createSliderSetting(
            'sfxVolume',
            '📢 音效音量',
            startY + lineHeight * 3,
            0, 1, 0.1,
            (value) => {
                this.settings.sfxVolume = value;
                this.updateSFXVolume();
            }
        );

        // 5. 难度选择
        this.createSelectSetting(
            'difficulty',
            '🎮 游戏难度',
            startY + lineHeight * 4,
            ['简单', '普通', '困难'],
            ['easy', 'normal', 'hard'],
            (value) => {
                this.settings.difficulty = value;
                this.updateDifficulty();
            }
        );

        // 6. 自动保存频率
        this.createSelectSetting(
            'autoSave',
            '💾 自动保存',
            startY + lineHeight * 5,
            ['场景切换时', '升级时', '手动'],
            ['scene_change', 'level_up', 'never'],
            (value) => {
                this.settings.autoSave = value;
            }
        );

        // 7. 全屏模式
        this.createToggleSetting(
            'fullscreen',
            '🖥️ 全屏模式',
            startY + lineHeight * 6,
            (value) => {
                this.settings.fullscreen = value;
                this.toggleFullscreen();
            }
        );
    }

    /**
     * 创建开关设置项
     */
    createToggleSetting(key, label, y, onChange) {
        const panel = this.uiElements.panel;

        // 标签文本
        const labelObj = this.add.text(-200, y, label, {
            fontFamily: 'Noto Sans SC',
            fontSize: '18px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0, 0.5);
        panel.add(labelObj);

        // 开关按钮背景
        const toggleBg = this.add.rectangle(180, y, 80, 36, 0x333333, 1);
        toggleBg.setStrokeStyle(2, 0x666666);
        panel.add(toggleBg);

        // 开关指示器
        const toggleIndicator = this.add.circle(155, y, 14, 0x4facfe);
        panel.add(toggleIndicator);

        // 状态文本
        const stateText = this.add.text(180, y, 'ON', {
            fontFamily: 'Arial',
            fontSize: 'bold 14px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        panel.add(stateText);

        // 交互区域
        const hitArea = this.add.zone(180, y, 100, 50);
        hitArea.setInteractive();
        panel.add(hitArea);

        // 点击事件
        let isOn = true;
        hitArea.on('pointerdown', () => {
            isOn = !isOn;
            this.updateToggleVisual(toggleIndicator, stateText, toggleBg, isOn);
            onChange(isOn);
            this.playClickSound();
        });

        // 悬停效果
        hitArea.on('pointerover', () => {
            toggleBg.setFillStyle(0x444444);
            document.body.style.cursor = 'pointer';
        });

        hitArea.on('pointerout', () => {
            toggleBg.setFillStyle(0x333333);
            document.body.style.cursor = 'default';
        });

        // 保存引用以便更新
        this.uiElements[key] = {
            toggleIndicator,
            stateText,
            toggleBg,
            isOn
        };
    }

    /**
     * 更新开关视觉状态
     */
    updateToggleVisual(indicator, text, bg, isOn) {
        if (isOn) {
            indicator.x = 155;
            indicator.setFillStyle(0x4facfe);
            text.setText('ON');
            text.setX(180);
            bg.setStrokeStyle(2, 0x4facfe);
        } else {
            indicator.x = 205;
            indicator.setFillStyle(0x666666);
            text.setText('OFF');
            text.setX(180);
            bg.setStrokeStyle(2, 0x666666);
        }
    }

    /**
     * 创建滑块设置项
     */
    createSliderSetting(key, label, y, min, max, step, onChange) {
        const panel = this.uiElements.panel;

        // 标签文本
        const labelObj = this.add.text(-200, y, label, {
            fontFamily: 'Noto Sans SC',
            fontSize: '18px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0, 0.5);
        panel.add(labelObj);

        // 滑块背景
        const sliderBg = this.add.rectangle(140, y, 200, 8, 0x333333, 1);
        sliderBg.setStrokeStyle(1, 0x666666);
        panel.add(sliderBg);

        // 滑块按钮
        const sliderBtn = this.add.circle(140, y, 12, 0x4facfe);
        sliderBtn.setStrokeStyle(2, 0xffffff);
        panel.add(sliderBtn);

        // 数值显示
        const valueText = this.add.text(240, y, '30%', {
            fontFamily: 'Arial',
            fontSize: '14px',
            fill: '#4facfe',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0, 0.5);
        panel.add(valueText);

        // 交互逻辑
        let isDragging = false;
        const sliderRange = 200;
        const sliderMinX = 40; // 140 - 100
        const sliderMaxX = 240; // 140 + 100

        sliderBtn.setInteractive();
        sliderBtn.on('pointerdown', () => {
            isDragging = true;
            sliderBtn.setFillStyle(0x68d391);
            this.playClickSound();
        });

        this.input.on('pointerup', () => {
            if (isDragging) {
                isDragging = false;
                sliderBtn.setFillStyle(0x4facfe);
                document.body.style.cursor = 'default';
            }
        });

        this.input.on('pointermove', (pointer) => {
            if (!isDragging) return;

            const localX = this.uiElements.panel.getWorldTransform().applyInverse(pointer.x, pointer.y).x;
            let newX = Phaser.Math.Clamp(localX, sliderMinX, sliderMaxX);

            sliderBtn.x = newX;

            // 计算值
            const ratio = (newX - sliderMinX) / sliderRange;
            const value = min + ratio * (max - min);
            const roundedValue = Math.round(value / step) * step;

            // 更新显示
            valueText.setText(`${Math.round(roundedValue * 100)}%`);
            onChange(roundedValue);
        });

        // 悬停效果
        sliderBtn.on('pointerover', () => {
            if (!isDragging) {
                document.body.style.cursor = 'pointer';
            }
        });

        sliderBtn.on('pointerout', () => {
            if (!isDragging) {
                document.body.style.cursor = 'default';
            }
        });

        // 保存引用
        this.uiElements[key] = {
            sliderBtn,
            valueText,
            min,
            max,
            sliderMinX,
            sliderMaxX,
            sliderRange
        };
    }

    /**
     * 创建下拉选择设置项
     */
    createSelectSetting(key, label, y, displayOptions, valueOptions, onChange) {
        const panel = this.uiElements.panel;

        // 标签文本
        const labelObj = this.add.text(-200, y, label, {
            fontFamily: 'Noto Sans SC',
            fontSize: '18px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0, 0.5);
        panel.add(labelObj);

        // 下拉框背景
        const selectBg = this.add.rectangle(140, y, 150, 36, 0x333333, 1);
        selectBg.setStrokeStyle(2, 0x666666);
        panel.add(selectBg);

        // 当前值文本
        const valueText = this.add.text(140, y, displayOptions[1], {
            fontFamily: 'Noto Sans SC',
            fontSize: '16px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        panel.add(valueText);

        // 下拉箭头
        const arrow = this.add.text(210, y, '▼', {
            fontFamily: 'Arial',
            fontSize: '14px',
            fill: '#4facfe'
        }).setOrigin(0, 0.5);
        panel.add(arrow);

        // 交互区域
        const hitArea = this.add.zone(140, y, 150, 36);
        hitArea.setInteractive();
        panel.add(hitArea);

        let currentIndex = 1; // 默认选择第二个选项

        hitArea.on('pointerdown', () => {
            currentIndex = (currentIndex + 1) % displayOptions.length;
            valueText.setText(displayOptions[currentIndex]);
            onChange(valueOptions[currentIndex]);
            this.playClickSound();
        });

        // 悬停效果
        hitArea.on('pointerover', () => {
            selectBg.setFillStyle(0x444444);
            selectBg.setStrokeStyle(2, 0x4facfe);
            document.body.style.cursor = 'pointer';
        });

        hitArea.on('pointerout', () => {
            selectBg.setFillStyle(0x333333);
            selectBg.setStrokeStyle(2, 0x666666);
            document.body.style.cursor = 'default';
        });

        // 保存引用
        this.uiElements[key] = {
            valueText,
            displayOptions,
            valueOptions
        };
    }

    /**
     * 创建底部提示
     */
    createFooter() {
        const panel = this.uiElements.panel;

        // 提示文本
        const footer = this.add.text(0, 230, '按 ESC 键或点击外部区域关闭', {
            fontFamily: 'Noto Sans SC',
            fontSize: '14px',
            fill: '#68d391',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        panel.add(footer);
    }

    /**
     * 更新音乐状态
     */
    updateMusicState() {
        const gameScene = this.scene.get('GameScene');
        if (gameScene && gameScene.audioManager) {
            if (this.settings.musicEnabled) {
                gameScene.audioManager.toggleMusic();
            } else {
                gameScene.audioManager.toggleMusic();
            }
        }
    }

    /**
     * 更新音效状态
     */
    updateSFXState() {
        const gameScene = this.scene.get('GameScene');
        if (gameScene && gameScene.audioManager) {
            if (this.settings.sfxEnabled) {
                gameScene.audioManager.toggleSFX();
            } else {
                gameScene.audioManager.toggleSFX();
            }
        }
    }

    /**
     * 更新音乐音量
     */
    updateMusicVolume() {
        const gameScene = this.scene.get('GameScene');
        if (gameScene && gameScene.audioManager) {
            gameScene.audioManager.setMusicVolume(this.settings.musicVolume);
        }
    }

    /**
     * 更新音效音量
     */
    updateSFXVolume() {
        const gameScene = this.scene.get('GameScene');
        if (gameScene && gameScene.audioManager) {
            gameScene.audioManager.setSFXVolume(this.settings.sfxVolume);
        }
    }

    /**
     * 更新难度
     */
    updateDifficulty() {
        console.log(`🎮 难度更改为: ${this.settings.difficulty}`);
        // 难度系统的具体实现可以在这里添加
    }

    /**
     * 切换全屏
     */
    toggleFullscreen() {
        if (this.settings.fullscreen) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen && document.fullscreenElement) {
                document.exitFullscreen();
            }
        }
    }

    /**
     * 播放点击音效
     */
    playClickSound() {
        const gameScene = this.scene.get('GameScene');
        if (gameScene && gameScene.audioManager && this.settings.sfxEnabled) {
            gameScene.audioManager.playUIClick();
        }
    }

    /**
     * 加载设置
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('forestQuestRPG_settings');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.settings = { ...this.settings, ...parsed };
                console.log('⚙️ 已加载保存的设置:', this.settings);

                // 更新UI显示
                this.updateSettingsUI();
            }
        } catch (error) {
            console.warn('⚠️ 加载设置失败:', error);
        }
    }

    /**
     * 更新UI显示
     */
    updateSettingsUI() {
        // 更新音乐开关
        if (this.uiElements.musicEnabled) {
            this.updateToggleVisual(
                this.uiElements.musicEnabled.toggleIndicator,
                this.uiElements.musicEnabled.stateText,
                this.uiElements.musicEnabled.toggleBg,
                this.settings.musicEnabled
            );
        }

        // 更新音效开关
        if (this.uiElements.sfxEnabled) {
            this.updateToggleVisual(
                this.uiElements.sfxEnabled.toggleIndicator,
                this.uiElements.sfxEnabled.stateText,
                this.uiElements.sfxEnabled.toggleBg,
                this.settings.sfxEnabled
            );
        }

        // 更新音乐音量滑块
        if (this.uiElements.musicVolume) {
            const { sliderBtn, valueText, sliderMinX, sliderRange, min, max } = this.uiElements.musicVolume;
            const ratio = (this.settings.musicVolume - min) / (max - min);
            sliderBtn.x = sliderMinX + ratio * sliderRange;
            valueText.setText(`${Math.round(this.settings.musicVolume * 100)}%`);
        }

        // 更新音效音量滑块
        if (this.uiElements.sfxVolume) {
            const { sliderBtn, valueText, sliderMinX, sliderRange, min, max } = this.uiElements.sfxVolume;
            const ratio = (this.settings.sfxVolume - min) / (max - min);
            sliderBtn.x = sliderMinX + ratio * sliderRange;
            valueText.setText(`${Math.round(this.settings.sfxVolume * 100)}%`);
        }

        // 更新难度选择
        if (this.uiElements.difficulty) {
            const { displayOptions, valueOptions } = this.uiElements.difficulty;
            const index = valueOptions.indexOf(this.settings.difficulty);
            if (index !== -1) {
                this.uiElements.difficulty.valueText.setText(displayOptions[index]);
            }
        }
    }

    /**
     * 保存设置
     */
    saveSettings() {
        try {
            localStorage.setItem('forestQuestRPG_settings', JSON.stringify(this.settings));
            console.log('⚙️ 设置已保存');
        } catch (error) {
            console.warn('⚠️ 保存设置失败:', error);
        }
    }

    /**
     * 关闭设置界面
     */
    closeSettings() {
        // 保存设置
        this.saveSettings();

        // 播放音效
        this.playClickSound();

        // 停止场景
        this.scene.stop();

        // 恢复游戏场景
        const gameScene = this.scene.get('GameScene');
        if (gameScene) {
            gameScene.scene.resume();
            if (gameScene.physics) {
                gameScene.physics.resume();
            }
        }

        console.log('✅ 设置界面已关闭');
    }

    /**
     * 清理资源
     */
    destroy() {
        if (this.escKey) {
            this.escKey.destroy();
        }
        console.log('⚙️ 设置场景已清理');
    }
}
