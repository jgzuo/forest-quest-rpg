/**
 * MinimapManager - 小地图管理器
 * 显示当前场景的缩略地图和实体位置
 */
class MinimapManager {
    constructor(scene) {
        this.scene = scene;
        this.isVisible = true;
        this.zoomLevel = 0.15; // 缩放比例
        this.minimapSize = 150; // 小地图尺寸

        // 小地图容器
        this.minimapContainer = null;
        this.minimapBg = null;
        this.playerMarker = null;
        this.entityMarkers = [];

        // 实体类型颜色
        this.entityColors = {
            player: 0x00ff00,      // 绿色 - 玩家
            npc: 0x68d391,         // 青色 - NPC
            enemy: 0xff0000,        // 红色 - 敌人
            boss: 0xff6600,         // 橙色 - Boss
            teleport: 0x9b59b6,     // 紫色 - 传送点
            chest: 0xffd700,        // 金色 - 宝箱
            exit: 0xffffff          // 白色 - 出口
        };

        console.log('🗺️ 小地图管理器初始化');
    }

    /**
     * 创建小地图
     */
    create() {
        // 创建小地图容器
        this.minimapContainer = this.scene.add.container(730, 90);
        this.minimapContainer.setDepth(95);
        this.minimapContainer.setScrollFactor(0);

        // 创建小地图背景
        this.minimapBg = this.scene.add.rectangle(0, 0, this.minimapSize, this.minimapSize, 0x1a1a2e, 0.9);
        this.minimapBg.setStrokeStyle(2, 0x667eea);
        this.minimapContainer.add(this.minimapBg);

        // 创建小地图标题
        const title = this.scene.add.text(0, -this.minimapSize / 2 - 15, '🗺️', {
            font: '16px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        this.minimapContainer.add(title);

        // 创建玩家标记
        this.playerMarker = this.scene.add.circle(0, 0, 3, 0x00ff00);
        this.minimapContainer.add(this.playerMarker);

        // 设置可见性
        this.setVisible(this.isVisible);

        // 启动更新循环
        this.startUpdateLoop();

        console.log('✅ 小地图创建完成');
    }

    /**
     * 启动更新循环
     */
    startUpdateLoop() {
        // 每帧更新小地图
        this.scene.events.on('update', this.update, this);
    }

    /**
     * 更新小地图
     */
    update() {
        if (!this.isVisible || !this.playerMarker) return;

        // 场景重启期间的安全检查
        if (!this.scene || !this.scene.player) return;

        // 清除旧的实体标记
        this.clearEntityMarkers();

        // 更新玩家位置（始终在中心）
        this.updatePlayerPosition();

        // 更新实体标记
        this.updateEntityMarkers();
    }

    /**
     * 更新玩家位置
     */
    updatePlayerPosition() {
        // 玩家始终在小地图中心
        this.playerMarker.setPosition(0, 0);
    }

    /**
     * 更新实体标记
     */
    updateEntityMarkers() {
        const playerX = this.scene.player.x;
        const playerY = this.scene.player.y;
        const range = 400; // 小地图显示范围

        // 标记NPC
        if (this.scene.children && typeof this.scene.children.each === 'function') {
            this.scene.children.each((child) => {
                if (child.getData && child.getData('type') === 'npc' && child.active) {
                    const distance = Phaser.Math.Distance.Between(playerX, playerY, child.x, child.y);
                    if (distance <= range) {
                        this.addEntityMarker(child.x, child.y, playerX, playerY, 'npc');
                    }
                }
            });
        }

        // 标记敌人
        // 从 CombatSystem 或 SceneManager 获取敌人组
        let enemies = null;
        if (this.scene.combatSystem) {
            enemies = this.scene.combatSystem.getEnemiesGroup();
        } else if (this.scene.sceneManager && this.scene.sceneManager.enemies) {
            enemies = this.scene.sceneManager.enemies;
        }

        if (enemies && typeof enemies.getChildren === 'function') {
            enemies.getChildren().forEach((enemy) => {
                if (enemy.active) {
                    const distance = Phaser.Math.Distance.Between(playerX, playerY, enemy.x, enemy.y);
                    if (distance <= range) {
                        const isBoss = enemy.getData('isBoss');
                        const type = isBoss ? 'boss' : 'enemy';
                        this.addEntityMarker(enemy.x, enemy.y, playerX, playerY, type);
                    }
                }
            });
        }

        // 标记传送点
        if (this.scene.sceneManager && this.scene.sceneManager.teleports) {
            this.scene.sceneManager.teleports.forEach(teleport => {
                const distance = Phaser.Math.Distance.Between(playerX, playerY, teleport.x, teleport.y);
                if (distance <= range) {
                    this.addEntityMarker(teleport.x, teleport.y, playerX, playerY, 'teleport');
                }
            });
        }

        // 标记宝箱
        if (this.scene.children && typeof this.scene.children.each === 'function') {
            this.scene.children.each((child) => {
                if (child.getData && child.getData('type') === 'chest' && child.active) {
                    const distance = Phaser.Math.Distance.Between(playerX, playerY, child.x, child.y);
                    if (distance <= range) {
                        this.addEntityMarker(child.x, child.y, playerX, playerY, 'chest');
                    }
                }
            });
        }

        // 标记出口（无尽地牢）
        if (this.scene.infiniteDungeonManager && this.scene.infiniteDungeonManager.isActive) {
            // 在generateFloor时会创建exit，我们可以标记它
            // 这里暂时跳过，因为出口位置是动态的
        }
    }

    /**
     * 添加实体标记
     */
    addEntityMarker(entityX, entityY, playerX, playerY, entityType) {
        // 计算相对位置（缩放到小地图）
        const relativeX = (entityX - playerX) * this.zoomLevel;
        const relativeY = (entityY - playerY) * this.zoomLevel;

        // 限制在小地图范围内
        const halfSize = this.minimapSize / 2 - 5;
        const clampedX = Phaser.Math.Clamp(relativeX, -halfSize, halfSize);
        const clampedY = Phaser.Math.Clamp(relativeY, -halfSize, halfSize);

        // 创建标记
        const size = entityType === 'boss' ? 4 : 2;
        const color = this.entityColors[entityType] || 0xffffff;

        const marker = this.scene.add.circle(clampedX, clampedY, size, color);
        this.minimapContainer.add(marker);

        // 保存标记引用
        this.entityMarkers.push(marker);
    }

    /**
     * 清除实体标记
     */
    clearEntityMarkers() {
        this.entityMarkers.forEach(marker => {
            marker.destroy();
        });
        this.entityMarkers = [];
    }

    /**
     * 切换可见性
     */
    toggle() {
        this.setVisible(!this.isVisible);
    }

    /**
     * 设置可见性
     */
    setVisible(visible) {
        this.isVisible = visible;
        if (this.minimapContainer) {
            this.minimapContainer.setVisible(visible);
        }
    }

    /**
     * 设置缩放级别
     */
    setZoomLevel(zoom) {
        this.zoomLevel = Phaser.Math.Clamp(zoom, 0.1, 0.3);
    }

    /**
     * 增加缩放
     */
    zoomIn() {
        this.setZoomLevel(this.zoomLevel + 0.05);
        this.scene.showFloatingText(
            this.scene.player.x,
            this.scene.player.y - 100,
            `🔍 +${Math.floor(this.zoomLevel * 100)}%`,
            '#68d391',
            1000
        );
    }

    /**
     * 减少缩放
     */
    zoomOut() {
        this.setZoomLevel(this.zoomLevel - 0.05);
        this.scene.showFloatingText(
            this.scene.player.x,
            this.scene.player.y - 100,
            `🔍 ${Math.floor(this.zoomLevel * 100)}%`,
            '#68d391',
            1000
        );
    }

    /**
     * 调整大小
     */
    setSize(size) {
        this.minimapSize = Phaser.Math.Clamp(size, 100, 250);

        if (this.minimapBg) {
            this.minimapBg.setSize(this.minimapSize, this.minimapSize);
        }

        // 更新位置（保持右上角）
        if (this.minimapContainer) {
            this.minimapContainer.setPosition(730, 90);
        }
    }

    /**
     * 显示场景名称
     */
    showSceneName(sceneName) {
        const sceneNames = {
            'town': '小镇',
            'forest': '森林',
            'cave': '洞穴',
            'snow_mountain': '雪山',
            'volcanic_cavern': '火山'
        };

        const name = sceneNames[sceneName] || sceneName;

        // 在小地图下方显示场景名称
        if (this.minimapContainer) {
            // 移除旧的场景名称文本
            const oldText = this.minimapContainer.getByName('sceneName');
            if (oldText) {
                oldText.destroy();
            }

            const text = this.scene.add.text(
                0,
                this.minimapSize / 2 + 15,
                name,
                {
                    font: 'bold 12px Noto Sans SC',
                    fill: '#667eea'
                }
            ).setOrigin(0.5).setName('sceneName');
            this.minimapContainer.add(text);
        }
    }

    /**
     * 添加方向指示器（指北针）
     */
    addCompass() {
        if (!this.minimapContainer) return;

        // 创建简单的指北针
        const compassBg = this.scene.add.circle(-this.minimapSize / 2 + 15, -this.minimapSize / 2 + 15, 12, 0x2d3748, 0.8);
        compassBg.setStrokeStyle(1, 0xffffff);
        this.minimapContainer.add(compassBg);

        const northText = this.scene.add.text(-this.minimapSize / 2 + 15, -this.minimapSize / 2 + 15, 'N', {
            font: 'bold 10px Arial',
            fill: '#ff0000'
        }).setOrigin(0.5);
        this.minimapContainer.add(northText);
    }

    /**
     * 添加玩家方向指示
     */
    addPlayerDirectionIndicator() {
        if (!this.minimapContainer || !this.playerMarker) return;

        // 创建方向箭头
        const arrow = this.scene.add.text(0, -10, '↑', {
            font: 'bold 12px Arial',
            fill: '#00ff00'
        }).setOrigin(0.5);
        this.minimapContainer.add(arrow);
        this.playerDirectionArrow = arrow;
    }

    /**
     * 更新玩家方向指示器
     */
    updatePlayerDirectionIndicator() {
        if (!this.playerDirectionArrow || !this.scene.player) return;

        const facing = this.scene.player.facing;
        const rotationMap = {
            'up': 0,
            'down': Math.PI,
            'left': -Math.PI / 2,
            'right': Math.PI / 2
        };

        const rotation = rotationMap[facing] || 0;
        this.playerDirectionArrow.setRotation(rotation);
    }

    /**
     * 添加小地图图例
     */
    addLegend() {
        // 在小地图左侧显示图例
        const legendX = -this.minimapSize / 2 - 50;
        const legendY = -this.minimapSize / 2;

        const legendItems = [
            { color: 0x00ff00, label: '玩家' },
            { color: 0x68d391, label: 'NPC' },
            { color: 0xff0000, label: '敌人' },
            { color: 0xff6600, label: 'Boss' },
            { color: 0x9b59b6, label: '传送' }
        ];

        legendItems.forEach((item, index) => {
            const y = legendY + index * 20;

            // 颜色点
            const dot = this.scene.add.circle(legendX, y, 3, item.color);
            this.minimapContainer.add(dot);

            // 标签
            const text = this.scene.add.text(legendX + 10, y, item.label, {
                font: '10px Arial',
                fill: '#ffffff'
            }).setOrigin(0, 0.5);
            this.minimapContainer.add(text);
        });
    }

    /**
     * 切换图例显示
     */
    toggleLegend() {
        // 简化版本：暂时不实现动态切换
        // 在create()中调用addLegend()即可显示图例
    }

    /**
     * 销毁小地图
     */
    destroy() {
        if (this.minimapContainer) {
            this.minimapContainer.destroy();
            this.minimapContainer = null;
        }

        this.scene.events.off('update', this.update, this);

        console.log('🗺️ 小地图已销毁');
    }
}
