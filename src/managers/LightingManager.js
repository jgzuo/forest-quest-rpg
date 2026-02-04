/**
 * LightingManager - 动态光照管理器
 *
 * 负责管理游戏中的光照效果：
 * - 动态光源（火把、魔法光）
 * - 阴影系统
 * - 环境光颜色
 * - 光源切换和渐变
 */

class LightingManager {
    constructor(scene) {
        this.scene = scene;

        // 光源列表
        this.lights = [];

        // 环境光配置
        this.ambientLight = {
            color: { r: 255, g: 255, b: 255 },
            intensity: 1.0
        };

        // 光照覆盖层
        this.overlay = null;
        this.lightContainer = null;

        console.log('💡 动态光照系统初始化');
    }

    /**
     * 创建光照系统
     */
    create() {
        // 创建光源容器
        this.lightContainer = this.scene.add.container(0, 0);
        this.lightContainer.setDepth(996);

        // 创建光照覆盖层
        this.overlay = this.scene.add.graphics();
        this.overlay.setDepth(999);
        this.overlay.setScrollFactor(0);

        // 更新光照
        this.update();
    }

    /**
     * 更新光照效果
     */
    update() {
        // 清除覆盖层
        if (this.overlay) {
            this.overlay.clear();
        }

        // 绘制环境光
        this.drawAmbientLight();

        // 绘制所有光源
        this.drawLights();
    }

    /**
     * 绘制环境光
     */
    drawAmbientLight() {
        if (!this.overlay) return;

        const { color, intensity } = this.ambientLight;
        const alpha = 1 - intensity;

        this.overlay.fillStyle(
            (color.r << 16) | (color.g << 8) | color.b,
            alpha
        );
        this.overlay.fillRect(
            0,
            0,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height
        );
    }

    /**
     * 绘制所有光源
     */
    drawLights() {
        // 使用Phaser的BitmapData创建光照效果
        // 这是一个简化版本，实际项目中可以使用更复杂的光照算法

        this.lights.forEach(light => {
            if (!light.active) return;

            this.drawLight(light);
        });
    }

    /**
     * 绘制单个光源
     * @param {Object} light - 光源对象
     */
    drawLight(light) {
        if (!this.overlay) return;

        // 创建径向渐变（简化版：使用多个同心圆）
        const layers = 10;
        const maxRadius = light.radius;

        for (let i = layers; i > 0; i--) {
            const radius = (maxRadius / layers) * i;
            const alpha = (light.intensity / layers) * (1 - i / layers);

            // 根据光源颜色混合
            const r = Math.min(255, light.color.r * alpha);
            const g = Math.min(255, light.color.g * alpha);
            const b = Math.min(255, light.color.b * alpha);

            this.overlay.fillStyle(
                (Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b),
                alpha * 0.3
            );

            this.overlay.fillCircle(light.x, light.y, radius);
        }
    }

    /**
     * 添加光源
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {Object} color - RGB颜色
     * @param {number} intensity - 强度（0-1）
     * @param {number} radius - 半径（像素）
     * @returns {Object} 光源对象
     */
    addLight(x, y, color = { r: 255, g: 255, b: 255 }, intensity = 0.8, radius = 200) {
        const light = {
            id: Phaser.Utils.String.UUID(),
            x: x,
            y: y,
            color: color,
            intensity: intensity,
            radius: radius,
            active: true,
            pulsing: false,
            pulseSpeed: 0,
            pulsePhase: 0
        };

        this.lights.push(light);

        // 创建光源视觉指示器（可选）
        const lightSprite = this.scene.add.circle(x, y, 5, 0xffff00, 0.3);
        lightSprite.setDepth(995);
        light.sprite = lightSprite;
        this.lightContainer.add(lightSprite);

        return light;
    }

    /**
     * 移除光源
     * @param {string} lightId - 光源ID
     */
    removeLight(lightId) {
        const index = this.lights.findIndex(l => l.id === lightId);
        if (index !== -1) {
            const light = this.lights[index];

            // 移除视觉指示器
            if (light.sprite) {
                light.sprite.destroy();
            }

            this.lights.splice(index, 1);
        }
    }

    /**
     * 更新光源位置
     * @param {string} lightId - 光源ID
     * @param {number} x - 新X坐标
     * @param {number} y - 新Y坐标
     */
    updateLightPosition(lightId, x, y) {
        const light = this.lights.find(l => l.id === lightId);
        if (light) {
            light.x = x;
            light.y = y;

            // 更新视觉指示器
            if (light.sprite) {
                light.sprite.setPosition(x, y);
            }
        }
    }

    /**
     * 设置光源脉冲效果
     * @param {string} lightId - 光源ID
     * @param {number} speed - 脉冲速度
     */
    setLightPulse(lightId, speed = 2) {
        const light = this.lights.find(l => l.id === lightId);
        if (light) {
            light.pulsing = true;
            light.pulseSpeed = speed;
            light.pulsePhase = 0;
        }
    }

    /**
     * 移除光源脉冲效果
     * @param {string} lightId - 光源ID
     */
    removeLightPulse(lightId) {
        const light = this.lights.find(l => l.id === lightId);
        if (light) {
            light.pulsing = false;
        }
    }

    /**
     * 更新环境光
     * @param {Object} color - RGB颜色
     * @param {number} intensity - 强度（0-1）
     */
    setAmbientLight(color, intensity = 1.0) {
        this.ambientLight.color = color;
        this.ambientLight.intensity = intensity;
        this.update();
    }

    /**
     * 创建跟随玩家的光源（如火把）
     * @param {Object} color - RGB颜色
     * @param {number} intensity - 强度
     * @param {number} radius - 半径
     * @returns {string} 光源ID
     */
    createPlayerLight(color = { r: 255, g: 200, b: 100 }, intensity = 0.6, radius = 150) {
        const playerX = this.scene.player ? this.scene.player.x : 400;
        const playerY = this.scene.player ? this.scene.player.y : 300;

        const light = this.addLight(playerX, playerY, color, intensity, radius);

        // 添加脉冲效果（火把闪烁）
        this.setLightPulse(light.id, 3);

        return light.id;
    }

    /**
     * 每帧更新（用于脉冲动画）
     * @param {number} time - 当前时间
     * @param {number} delta - 时间增量
     */
    update(time, delta) {
        // 更新脉冲光源
        this.lights.forEach(light => {
            if (!light.active || !light.pulsing) return;

            // 更新脉冲相位
            light.pulsePhase += (light.pulseSpeed * delta / 1000);

            // 计算新的强度（正弦波）
            const pulseFactor = (Math.sin(light.pulsePhase) + 1) / 2; // 0-1
            const newIntensity = light.intensity * (0.7 + pulseFactor * 0.6); // 0.7-1.3倍

            // 更新光源强度（临时）
            light.savedIntensity = light.intensity;
            light.intensity = newIntensity;
        });

        // 清除并重新绘制光照
        if (this.overlay) {
            this.overlay.clear();
            this.drawAmbientLight();
            this.drawLights();
        }

        // 恢复光源强度
        this.lights.forEach(light => {
            if (light.savedIntensity !== undefined) {
                light.intensity = light.savedIntensity;
                delete light.savedIntensity;
            }
        });
    }

    /**
     * 清除所有光源
     */
    clearLights() {
        this.lights.forEach(light => {
            if (light.sprite) {
                light.sprite.destroy();
            }
        });
        this.lights = [];
    }

    /**
     * 销毁光照系统
     */
    destroy() {
        this.clearLights();

        if (this.lightContainer) {
            this.lightContainer.destroy();
        }

        if (this.overlay) {
            this.overlay.destroy();
        }

        console.log('💡 动态光照系统已销毁');
    }
}
