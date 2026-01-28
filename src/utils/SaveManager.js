/**
 * SaveManager - 游戏存档管理器
 * 使用 localStorage 实现游戏保存和读取
 */
class SaveManager {
    constructor(scene) {
        this.scene = scene;
        this.saveKey = 'forestQuestRPG_save';
        this.autoSaveEnabled = true;
    }

    /**
     * 保存游戏状态
     */
    saveGame() {
        try {
            // Ensure all managers exist
            if (!this.scene.player) {
                console.warn('⚠️ [SaveManager] Player not initialized');
                return false;
            }

            if (!this.scene.sceneManager) {
                console.warn('⚠️ [SaveManager] SceneManager not initialized');
                return false;
            }

            const saveData = {
                version: '1.8.0',  // Milestone 7: Complete (Equipment, Skill Tree, New Regions, Endgame, UI/UX)
                timestamp: new Date().toISOString(),

                // 玩家数据
                player: {
                    level: this.scene.player.level || 1,
                    xp: this.scene.player.xp || 0,
                    xpToNextLevel: this.scene.player.xpToNextLevel || 100,
                    hp: this.scene.player.hp || 100,
                    maxHp: this.scene.player.maxHp || 100,
                    attack: this.scene.player.attack || 10,
                    speed: this.scene.player.speed || 160,
                    gold: this.scene.player.gold || 100,
                    x: this.scene.player.x || 400,
                    y: this.scene.player.y || 300,
                    facing: this.scene.player.facing || 'front',
                    flipX: this.scene.player.flipX || false,
                    // Milestone 6: MP系统
                    mp: this.scene.player.mp || 50,
                    maxMp: this.scene.player.maxMp || 50,
                    mpRegenRate: this.scene.player.mpRegenRate || 1
                },

                // Milestone 6: 技能冷却数据
                skills: this.scene.skillSystem ? this.scene.skillSystem.getAllSkills() : {},

                // 当前场景（根级别，用于测试兼容性）
                currentScene: this.scene.sceneManager.getCurrentScene() || 'town',

                // 场景数据
                scene: {
                    currentScene: this.scene.sceneManager.getCurrentScene() || 'town',
                    spawnPoint: this.scene.sceneManager.playerSpawnPoint || { x: 400, y: 300 }
                },

                // 游戏进度
                progress: {
                    totalCoins: window.gameData?.progress?.totalCoins || 0,
                    gemsCollected: window.gameData?.progress?.gemsCollected || 0,
                    enemiesDefeated: window.gameData?.progress?.enemiesDefeated || 0,
                    playtimeSeconds: window.gameData?.progress?.playtimeSeconds || 0
                },

                // 敌人击败统计
                enemiesDefeated: window.gameData?.enemiesDefeated || {
                    mole: 0,
                    treant: 0,
                    slime: 0,
                    boss_treant_king: 0
                },

                // 库存（如果实现了）
                inventory: window.gameData?.inventory || [],

                // 任务数据 (QuestManager)
                quests: this.scene.questManager ? this.scene.questManager.toJSON() : {
                    quests: [],
                    activeQuests: [],
                    completedQuests: []
                },

                // Milestone 7: 故事进度 (StoryManager)
                storyData: this.scene.storyManager ? this.scene.storyManager.getSaveData() : {
                    storyProgress: {
                        hasSeenIntro: false,
                        currentChapter: 0,
                        storyFlags: {}
                    }
                },

                // Milestone 7: 对话状态 (DialogueManager)
                dialogueData: this.scene.dialogueManager ? this.scene.dialogueManager.getSaveData() : {
                    conversationStates: {},
                    dialogueHistory: []
                },

                // Milestone 7 Sprint 3: 装备数据 (EquipmentManager)
                equipmentData: this.scene.equipmentManager ? this.scene.equipmentManager.getSaveData() : {
                    equipment: { weapon: null, armor: null, accessory: null }
                },

                // Milestone 7 Sprint 3: 技能树数据 (SkillTreeManager)
                skillTreeData: this.scene.skillTreeManager ? this.scene.skillTreeManager.getSaveData() : {
                    skillPoints: 0,
                    unlockedNodes: {},
                    bonuses: {}
                }
            };

            localStorage.setItem(this.saveKey, JSON.stringify(saveData));
            console.log('💾 [SaveManager] Game saved successfully');
            console.log('💾 [SaveManager] Save data structure:', Object.keys(saveData));
            console.log('💾 [SaveManager] Save data:', saveData);
            this.scene.showFloatingText(400, 300, '游戏已保存!', '#68d391');
            return true;
        } catch (error) {
            console.error('❌ [SaveManager] Save failed:', error);
            this.scene.showFloatingText(400, 300, '保存失败!', '#ff0000');
            return false;
        }
    }

    /**
     * 加载游戏状态
     */
    loadGame() {
        try {
            const saveString = localStorage.getItem(this.saveKey);

            if (!saveString) {
                console.log('📭 未找到存档');
                return false;
            }

            const saveData = JSON.parse(saveString);

            // 验证存档数据
            const validation = this.validateSaveData(saveData);
            if (!validation.valid) {
                console.error('❌ 存档数据无效:', validation.error);
                this.scene.showFloatingText(400, 300, '存档损坏!', '#ff0000');
                return false;
            }

            console.log('📂 加载存档:', saveData);

            // 恢复玩家数据
            if (saveData.player) {
                this.scene.player.level = saveData.player.level;
                this.scene.player.xp = saveData.player.xp;
                this.scene.player.xpToNextLevel = saveData.player.xpToNextLevel;
                this.scene.player.hp = saveData.player.hp;
                this.scene.player.maxHp = saveData.player.maxHp;
                this.scene.player.attack = saveData.player.attack;
                this.scene.player.speed = saveData.player.speed;
                this.scene.player.gold = saveData.player.gold || 100;  // 恢复金币
                this.scene.player.facing = saveData.player.facing || 'front';  // 恢复朝向

                // 恢复水平翻转状态（如果有）
                if (saveData.player.flipX !== undefined) {
                    this.scene.player.flipX = saveData.player.flipX;
                }

                // Milestone 6: 恢复MP数据
                this.scene.player.mp = saveData.player.mp || 50;
                this.scene.player.maxMp = saveData.player.maxMp || 50;
                this.scene.player.mpRegenRate = saveData.player.mpRegenRate || 1;

                console.log('💎 MP数据已恢复: ' + this.scene.player.mp + '/' + this.scene.player.maxMp);
            }

            // Milestone 6: 恢复技能冷却数据
            if (saveData.skills && this.scene.skillSystem) {
                const savedSkills = saveData.skills;
                const currentSkills = this.scene.skillSystem.getAllSkills();

                // 恢复冷却状态
                Object.keys(currentSkills).forEach(skillKey => {
                    if (savedSkills[skillKey]) {
                        currentSkills[skillKey].cooldownRemaining = savedSkills[skillKey].cooldownRemaining || 0;
                        currentSkills[skillKey].lastCast = savedSkills[skillKey].lastCast || 0;
                        currentSkills[skillKey].unlocked = savedSkills[skillKey].unlocked || false;
                    }
                });

                console.log('⚔️ 技能冷却数据已恢复');
            }

            // 恢复场景数据
            if (saveData.scene) {
                // 如果当前场景不同，需要切换场景
                const currentScene = this.scene.sceneManager.getCurrentScene();
                if (currentScene !== saveData.scene.currentScene) {
                    this.scene.sceneManager.switchScene(
                        saveData.scene.currentScene,
                        saveData.scene.spawnPoint
                    );
                } else {
                    // 同一场景，直接设置位置
                    this.scene.player.setPosition(saveData.player.x, saveData.player.y);
                }
            }

            // 恢复游戏进度
            if (saveData.progress) {
                if (!window.gameData) {
                    window.gameData = { progress: {} };
                }
                window.gameData.progress = saveData.progress;

                // 重置会话开始时间（从加载时间继续计时）
                window.gameData.progress.sessionStartTime = Date.now();

                console.log(`📊 游戏时间: ${Math.floor(saveData.progress.playtimeSeconds / 60)}分钟`);
            }

            // 恢复敌人击败统计
            if (saveData.enemiesDefeated) {
                if (!window.gameData) {
                    window.gameData = {};
                }
                window.gameData.enemiesDefeated = saveData.enemiesDefeated;
                console.log('💀 敌人统计已恢复');
            }

            // 恢复库存
            if (saveData.inventory) {
                if (!window.gameData) {
                    window.gameData = {};
                }
                window.gameData.inventory = saveData.inventory;
            }

            // 恢复任务数据 (QuestManager)
            if (saveData.quests && this.scene.questManager) {
                this.scene.questManager.loadFromSaveData(saveData.quests);
                console.log('📜 任务数据已恢复');
            }

            // Milestone 7: 恢复故事进度 (StoryManager)
            if (saveData.storyData && this.scene.storyManager) {
                this.scene.storyManager.loadSaveData(saveData.storyData);
                console.log('📖 故事进度已恢复');
            }

            // Milestone 7: 恢复对话状态 (DialogueManager)
            if (saveData.dialogueData && this.scene.dialogueManager) {
                this.scene.dialogueManager.loadSaveData(saveData.dialogueData);
                console.log('💬 对话状态已恢复');
            }

            // Milestone 7 Sprint 3: 恢复装备数据 (EquipmentManager)
            if (saveData.equipmentData && this.scene.equipmentManager) {
                this.scene.equipmentManager.loadSaveData(saveData.equipmentData);
                console.log('🛡️ 装备数据已恢复');
            }

            // Milestone 7 Sprint 3: 恢复技能树数据 (SkillTreeManager)
            if (saveData.skillTreeData && this.scene.skillTreeManager) {
                this.scene.skillTreeManager.loadSaveData(saveData.skillTreeData);
                console.log('🌳 技能树数据已恢复');
            }

            // 更新UI
            this.scene.updateUI();

            // 显示加载成功提示
            this.scene.showFloatingText(400, 300, '游戏已加载!', '#68d391');

            console.log('✅ 存档加载完成');
            return true;
        } catch (error) {
            console.error('❌ 加载失败:', error);
            this.scene.showFloatingText(400, 300, '加载失败!', '#ff0000');
            return false;
        }
    }

    /**
     * 检查是否存在存档
     */
    hasSaveData() {
        return localStorage.getItem(this.saveKey) !== null;
    }

    /**
     * 获取存档信息
     */
    getSaveInfo() {
        try {
            const saveString = localStorage.getItem(this.saveKey);
            if (!saveString) return null;

            const saveData = JSON.parse(saveString);
            return {
                level: saveData.player.level,
                scene: saveData.scene.currentScene,
                timestamp: new Date(saveData.timestamp).toLocaleString('zh-CN')
            };
        } catch (error) {
            console.error('❌ 读取存档信息失败:', error);
            return null;
        }
    }

    /**
     * 删除存档
     */
    deleteSave() {
        try {
            localStorage.removeItem(this.saveKey);
            console.log('🗑️ 存档已删除');
            this.scene.showFloatingText(400, 300, '存档已删除!', '#ffd700');
            return true;
        } catch (error) {
            console.error('❌ 删除存档失败:', error);
            return false;
        }
    }

    /**
     * 自动保存（在特定事件后调用）
     */
    autoSave() {
        console.log('💾 [AutoSave] Auto-save triggered');
        if (this.autoSaveEnabled) {
            const success = this.saveGame();
            if (success) {
                console.log('💾 [AutoSave] Auto-save completed successfully');
            } else {
                console.warn('⚠️ [AutoSave] Auto-save failed');
            }
            return success;
        } else {
            console.log('💾 [AutoSave] Auto-save is disabled');
            return false;
        }
    }

    /**
     * 验证存档数据完整性
     */
    validateSaveData(saveData) {
        if (!saveData) {
            return { valid: false, error: '存档数据为空' };
        }

        if (!saveData.player) {
            return { valid: false, error: '玩家数据缺失' };
        }

        // 检查必需的玩家属性
        const requiredFields = ['level', 'xp', 'hp', 'maxHp', 'attack', 'gold'];
        for (const field of requiredFields) {
            if (saveData.player[field] === undefined || saveData.player[field] === null) {
                return { valid: false, error: `缺少必需字段: player.${field}` };
            }
        }

        if (!saveData.scene || !saveData.scene.currentScene) {
            return { valid: false, error: '场景数据缺失或无效' };
        }

        return { valid: true };
    }

    /**
     * 获取存档版本
     */
    getSaveVersion() {
        try {
            const saveString = localStorage.getItem(this.saveKey);
            if (!saveString) return null;

            const saveData = JSON.parse(saveString);
            return saveData.version || '1.0.0';
        } catch (error) {
            console.error('❌ 读取存档版本失败:', error);
            return null;
        }
    }

    /**
     * 启用/禁用自动保存
     */
    setAutoSave(enabled) {
        this.autoSaveEnabled = enabled;
        console.log(`⚙️ 自动保存: ${enabled ? '启用' : '禁用'}`);
    }
}
