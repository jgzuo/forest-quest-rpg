/**
 * WeatherParticles - 天气粒子系统
 *
 * 负责渲染和管理各种天气粒子效果：
 * - 雨滴粒子（小雨/大雨）
 * - 雪花粒子（小雪/暴雪）
 * - 雾气效果（薄雾/浓雾）
 * - 环境光覆盖
 */

class WeatherParticles {
    constructor(scene) {
        this.scene = scene;
        this.particles = null;
        this.overlay = null;
        this.currentWeather = 'clear';
        this.intensity = 0; // 0-1，天气强度

        // 粒子配置
        this.config = {
            rain: {
                count: 100,           // 粒子数量
                speed: 800,           // 下落速度（像素/秒）
                color: 0x88ccff,       // 雨滴颜色
                alpha: 0.6,            // 透明度
                size: 2,              // 粒子大小
                wind: 0               // 风向
            },
            snow: {
                count: 50,
                speed: 100,
                color: 0xffffff,
                alpha: 0.8,
                size: 3,
                wind: 20
            },
            fog: {
                color: 0xcccccc,
                alpha: 0.3,
                density: 0.5
            }
        };

        console.log('🌤️ 天气粒子系统初始化');
    }

    /**
     * 设置天气
     * @param {string} weather - 天气类型（clear/rain/snow/fog）
     * @param {number} intensity - 强度（0-1）
     */
    setWeather(weather, intensity = 0.5) {
        // 清除现有天气
        this.clearWeather();

        this.currentWeather = weather;
        this.intensity = intensity;

        switch (weather) {
            case 'rain':
                this.createRain(intensity);
                break;
            case 'snow':
                this.createSnow(intensity);
                break;
            case 'fog':
                this.createFog(intensity);
                break;
            case 'clear':
            default:
                // 默认晴天，什么都不做
                break;
        }

        // 创建天气覆盖层（变暗效果）
        this.createWeatherOverlay(weather, intensity);
    }

    /**
     * 创建雨滴效果
     * @param {number} intensity - 强度（0-1）
     */
    createRain(intensity) {
        const config = this.config.rain;
        const count = Math.floor(config.count + intensity * 400); // 100-500个粒子

        // 创建粒子容器
        this.particles = this.scene.add.container(0, 0);
        this.particles.setDepth(1000);

        // 创建每个雨滴
        for (let i = 0; i < count; i++) {
            const raindrop = this.scene.add.graphics();
            const x = Phaser.Math.Between(0, this.scene.cameras.main.width);
            const y = Phaser.Math.Between(-500, 0);
            const length = Phaser.Math.Between(10, 20);
            const speed = config.speed + Phaser.Math.Between(-100, 100);

            // 绘制雨滴线条
            raindrop.lineStyle(1, config.color, config.alpha);
            raindrop.lineBetween(x, y, x - 2, y + length);

            // 存储雨滴数据
            raindrop.setData('speed', speed);
            raindrop.setData('x', x);
            raindrop.setData('y', y);

            this.particles.add(raindrop);
        }

        // 更新事件
        this.scene.events.on('update', this.updateRain, this);
    }

    /**
     * 更新雨滴位置
     * @param {number} time - 当前时间
     * @param {number} delta - 时间增量
     */
    updateRain(time, delta) {
        if (!this.particles || !this.particles.active) return;

        const cameraHeight = this.scene.cameras.main.height;
        const cameraWidth = this.scene.cameras.main.width;

        this.particles.each((particle) => {
            if (!particle.active) return;

            const speed = particle.getData('speed');
            const y = particle.getData('y');
            const x = particle.getData('x');

            // 更新位置
            const newY = y + (speed * delta / 1000);
            const newX = x + this.config.rain.wind * delta / 1000;

            // 检查是否超出屏幕
            if (newY > cameraHeight) {
                // 重置到顶部
                particle.clear();
                particle.lineStyle(1, this.config.rain.color, this.config.rain.alpha);
                particle.lineBetween(
                    Phaser.Math.Between(0, cameraWidth),
                    Phaser.Math.Between(-50, 0),
                    Phaser.Math.Between(0, cameraWidth) - 2,
                    Phaser.Math.Between(-50, 0) + 15
                );

                particle.setData('x', particle.getData('x'));
                particle.setData('y', Phaser.Math.Between(-50, 0));
            } else {
                // 移动雨滴
                const length = 15; // 雨滴长度
                particle.clear();
                particle.lineStyle(1, this.config.rain.color, this.config.rain.alpha);
                particle.lineBetween(newX, newY, newX - 2, newY + length);

                particle.setData('x', newX);
                particle.setData('y', newY);
            }
        });
    }

    /**
     * 创建雪花效果
     * @param {number} intensity - 强度（0-1）
     */
    createSnow(intensity) {
        const config = this.config.snow;
        const count = Math.floor(config.count + intensity * 250); // 50-300个粒子

        // 创建粒子容器
        this.particles = this.scene.add.container(0, 0);
        this.particles.setDepth(1000);

        // 创建每个雪花
        for (let i = 0; i < count; i++) {
            const size = Phaser.Math.Between(2, 5);
            const snowflake = this.scene.add.circle(
                Phaser.Math.Between(0, this.scene.cameras.main.width),
                Phaser.Math.Between(-500, this.scene.cameras.main.height),
                size,
                config.color,
                config.alpha
            );

            // 存储雪花数据
            snowflake.setData('speed', config.speed + Phaser.Math.Between(-30, 30));
            snowflake.setData('drift', Phaser.Math.Between(-20, 20));
            snowflake.setData('rotation', Phaser.Math.Between(0, 360));
            snowflake.setData('rotationSpeed', Phaser.Math.Between(-90, 90));

            this.particles.add(snowflake);
        }

        // 更新事件
        this.scene.events.on('update', this.updateSnow, this);
    }

    /**
     * 更新雪花位置
     * @param {number} time - 当前时间
     * @param {number} delta - 时间增量
     */
    updateSnow(time, delta) {
        if (!this.particles || !this.particles.active) return;

        const cameraHeight = this.scene.cameras.main.height;
        const cameraWidth = this.scene.cameras.main.width;

        this.particles.each((particle) => {
            if (!particle.active) return;

            const speed = particle.getData('speed');
            const drift = particle.getData('drift');
            const rotationSpeed = particle.getData('rotationSpeed');

            // 更新位置和旋转
            let newY = particle.y + (speed * delta / 1000);
            let newX = particle.x + (drift * delta / 1000);
            const newRotation = particle.angle + (rotationSpeed * delta / 1000);

            // 检查是否超出屏幕
            if (newY > cameraHeight || newX < -20 || newX > cameraWidth + 20) {
                // 重置到顶部
                particle.setPosition(
                    Phaser.Math.Between(0, cameraWidth),
                    Phaser.Math.Between(-50, 0)
                );
                particle.setData('y', particle.y);
                particle.setData('x', particle.x);
            } else {
                // 移动雪花
                particle.setPosition(newX, newY);
                particle.setRotation(newRotation);
            }
        });
    }

    /**
     * 创建雾气效果
     * @param {number} intensity - 强度（0-1）
     */
    createFog(intensity) {
        const config = this.config.fog;
        const alpha = config.alpha + intensity * 0.4; // 0.3-0.7

        // 创建雾气覆盖层
        this.particles = this.scene.add.graphics();
        this.particles.setDepth(999);

        this.particles.fillStyle(config.color, alpha);
        this.particles.fillRect(
            0,
            0,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height
        );

        // 创建多层雾气效果（带透明度变化）
        this.createFogLayers(intensity);
    }

    /**
     * 创建多层雾气效果
     * @param {number} intensity - 强度
     */
    createFogLayers(intensity) {
        const layerCount = 3;

        for (let i = 0; i < layerCount; i++) {
            const fogLayer = this.scene.add.image(
                this.scene.cameras.main.width / 2,
                this.scene.cameras.main.height / 2,
                'fog-layer-' + i
            );

            fogLayer.setAlpha(0.1 + intensity * 0.2);
            fogLayer.setDepth(998 - i);
            fogLayer.setScrollFactor(0.5 + i * 0.2); // 视差效果

            // 浮动动画
            this.scene.tweens.add({
                targets: fogLayer,
                x: fogLayer.x + 50,
                y: fogLayer.y + 20,
                duration: 10000 + i * 2000,
                yoyo: true,
                repeat: -1
            });
        }
    }

    /**
     * 创建天气覆盖层（变暗效果）
     * @param {string} weather - 天气类型
     * @param {number} intensity - 强度
     */
    createWeatherOverlay(weather, intensity) {
        // 清除现有覆盖层
        if (this.overlay) {
            this.overlay.destroy();
        }

        // 根据天气类型确定覆盖层颜色和透明度
        let color, alpha;

        switch (weather) {
            case 'rain':
                color = 0x333366;
                alpha = 0.1 + intensity * 0.2; // 0.1-0.3
                break;
            case 'snow':
                color = 0xccccff;
                alpha = 0.05 + intensity * 0.15; // 0.05-0.2
                break;
            case 'fog':
                color = 0x999999;
                alpha = 0.2 + intensity * 0.3; // 0.2-0.5
                break;
            default:
                return; // 晴天不需要覆盖层
        }

        // 创建覆盖层
        this.overlay = this.scene.add.graphics();
        this.overlay.setDepth(998);
        this.overlay.fillStyle(color, alpha);
        this.overlay.fillRect(
            0,
            0,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height
        );
    }

    /**
     * 清除当前天气
     */
    clearWeather() {
        // 清除粒子
        if (this.particles) {
            this.particles.destroy();
            this.particles = null;
        }

        // 清除覆盖层
        if (this.overlay) {
            this.overlay.destroy();
            this.overlay = null;
        }

        // 移除更新事件
        this.scene.events.off('update', this.updateRain, this);
        this.scene.events.off('update', this.updateSnow, this);

        this.currentWeather = 'clear';
        this.intensity = 0;
    }

    /**
     * 获取当前天气
     * @returns {string} 当前天气类型
     */
    getCurrentWeather() {
        return this.currentWeather;
    }

    /**
     * 获取天气强度
     * @returns {number} 强度（0-1）
     */
    getIntensity() {
        return this.intensity;
    }

    /**
     * 更新天气（用于每一帧）
     * @param {number} time - 当前时间
     * @param {number} delta - 时间增量
     */
    update(time, delta) {
        // 粒子更新由事件监听器处理
        // 这里可以添加其他全局天气效果
    }

    /**
     * 销毁天气系统
     */
    destroy() {
        this.clearWeather();
        console.log('🌤️ 天气粒子系统已销毁');
    }
}
