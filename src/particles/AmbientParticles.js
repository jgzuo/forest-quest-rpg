/**
 * AmbientParticles - 环境粒子效果系统
 *
 * 负责渲染环境装饰粒子：
 * - 萤火虫（夜晚）
 * - 落叶（秋天/森林）
 * - 花瓣（春天）
 * - 灰尘（洞穴/矿区）
 */

class AmbientParticles {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.particleConfig = {};

        // 粒子类型配置
        this.configs = {
            firefly: {
                count: 20,
                color: 0xffff66,
                size: 2,
                speed: 30,
                alpha: 0.8,
                pulse: true,
                timeOfDay: ['night', 'dusk']
            },
            leaf: {
                count: 15,
                colors: [0x66aa33, 0x886633, 0xaa5533],
                size: 4,
                speed: 50,
                alpha: 0.9,
                rotation: true,
                season: ['autumn']
            },
            petal: {
                count: 20,
                colors: [0xffb3d9, 0xff66b3, 0xffccdd],
                size: 3,
                speed: 40,
                alpha: 0.8,
                rotation: true,
                season: ['spring']
            },
            dust: {
                count: 30,
                color: 0x888888,
                size: 1,
                speed: 20,
                alpha: 0.4,
                location: ['cave', 'mine']
            }
        };

        console.log('✨ 环境粒子系统初始化');
    }

    /**
     * 创建环境粒子
     * @param {string} type - 粒子类型（firefly/leaf/petal/dust）
     */
    create(type) {
        this.clear();

        const config = this.configs[type];
        if (!config) {
            console.warn(`未知的粒子类型: ${type}`);
            return;
        }

        this.particleConfig = config;
        this.currentType = type;

        // 创建粒子容器
        const container = this.scene.add.container(0, 0);
        container.setDepth(995);

        // 创建粒子
        for (let i = 0; i < config.count; i++) {
            const particle = this.createParticle(type, config, i);
            this.particles.push(particle);
            container.add(particle.sprite);
        }

        this.container = container;

        // 注册更新事件
        this.scene.events.on('update', this.update, this);
    }

    /**
     * 创建单个粒子
     * @param {string} type - 粒子类型
     * @param {Object} config - 配置
     * @param {number} index - 粒子索引
     * @returns {Object} 粒子对象
     */
    createParticle(type, config, index) {
        const cameraWidth = this.scene.cameras.main.width;
        const cameraHeight = this.scene.cameras.main.height;

        let sprite;
        let data = {};

        switch (type) {
            case 'firefly':
                sprite = this.createFirefly(config);
                data = {
                    baseX: Phaser.Math.Between(50, cameraWidth - 50),
                    baseY: Phaser.Math.Between(50, cameraHeight - 50),
                    phase: Phaser.Math.Between(0, Math.PI * 2),
                    speed: Phaser.Math.Between(0.5, 1.5),
                    radius: Phaser.Math.Between(20, 50)
                };
                break;

            case 'leaf':
                sprite = this.createLeaf(config);
                data = {
                    x: Phaser.Math.Between(0, cameraWidth),
                    y: Phaser.Math.Between(-100, -10),
                    speedX: Phaser.Math.Between(-30, 30),
                    speedY: Phaser.Math.Between(30, 80),
                    rotation: Phaser.Math.Between(0, 360),
                    rotationSpeed: Phaser.Math.Between(-180, 180)
                };
                break;

            case 'petal':
                sprite = this.createPetal(config);
                data = {
                    x: Phaser.Math.Between(0, cameraWidth),
                    y: Phaser.Math.Between(-100, -10),
                    speedX: Phaser.Math.Between(-20, 20),
                    speedY: Phaser.Math.Between(20, 50),
                    rotation: Phaser.Math.Between(0, 360),
                    rotationSpeed: Phaser.Math.Between(-90, 90)
                };
                break;

            case 'dust':
                sprite = this.createDust(config);
                data = {
                    x: Phaser.Math.Between(0, cameraWidth),
                    y: Phaser.Math.Between(0, cameraHeight),
                    phase: Phaser.Math.Between(0, Math.PI * 2),
                    speed: Phaser.Math.Between(10, 30),
                    radius: Phaser.Math.Between(10, 30)
                };
                break;
        }

        return { sprite, data, type };
    }

    /**
     * 创建萤火虫粒子
     * @param {Object} config - 配置
     * @returns {Phaser.GameObjects.GameObject}
     */
    createFirefly(config) {
        const graphics = this.scene.add.graphics();

        // 外发光晕
        graphics.fillStyle(config.color, 0.2);
        graphics.fillCircle(0, 0, config.size * 2);

        // 核心
        graphics.fillStyle(config.color, config.alpha);
        graphics.fillCircle(0, 0, config.size);

        // 生成纹理
        graphics.generateTexture('firefly', config.size * 4, config.size * 4);

        const sprite = this.scene.add.image(0, 0, 'firefly');
        sprite.setScale(0.5);

        graphics.destroy();

        return sprite;
    }

    /**
     * 创建落叶粒子
     * @param {Object} config - 配置
     * @returns {Phaser.GameObjects.GameObject}
     */
    createLeaf(config) {
        const color = Phaser.Utils.Array.GetRandom(config.colors);
        const graphics = this.scene.add.graphics();

        // 绘制叶子形状（椭圆）
        graphics.fillStyle(color, config.alpha);
        graphics.fillEllipse(0, 0, config.size, config.size * 0.6);

        // 生成纹理
        graphics.generateTexture('leaf', config.size * 2, config.size * 2);

        const sprite = this.scene.add.image(0, 0, 'leaf');
        sprite.setScale(0.5);

        graphics.destroy();

        return sprite;
    }

    /**
     * 创建花瓣粒子
     * @param {Object} config - 配置
     * @returns {Phaser.GameObjects.GameObject}
     */
    createPetal(config) {
        const color = Phaser.Utils.Array.GetRandom(config.colors);
        const graphics = this.scene.add.graphics();

        // 绘制花瓣形状（圆角）
        graphics.fillStyle(color, config.alpha);
        graphics.fillCircle(0, 0, config.size * 0.5);

        // 生成纹理
        graphics.generateTexture('petal', config.size, config.size);

        const sprite = this.scene.add.image(0, 0, 'petal');
        sprite.setScale(0.5);

        graphics.destroy();

        return sprite;
    }

    /**
     * 创建灰尘粒子
     * @param {Object} config - 配置
     * @returns {Phaser.GameObjects.GameObject}
     */
    createDust(config) {
        const graphics = this.scene.add.graphics();

        // 绘制小圆点
        graphics.fillStyle(config.color, config.alpha);
        graphics.fillCircle(0, 0, config.size);

        // 生成纹理
        graphics.generateTexture('dust', config.size * 2, config.size * 2);

        const sprite = this.scene.add.image(0, 0, 'dust');
        sprite.setScale(0.5);

        graphics.destroy();

        return sprite;
    }

    /**
     * 更新粒子
     * @param {number} time - 当前时间
     * @param {number} delta - 时间增量
     */
    update(time, delta) {
        if (!this.particles.length) return;

        const cameraWidth = this.scene.cameras.main.width;
        const cameraHeight = this.scene.cameras.main.height;

        this.particles.forEach(particle => {
            if (!particle.sprite || !particle.sprite.active) return;

            const data = particle.data;
            const dt = delta / 1000;

            switch (particle.type) {
                case 'firefly':
                    // 圆周运动
                    data.phase += data.speed * dt;
                    const newX = data.baseX + Math.cos(data.phase) * data.radius;
                    const newY = data.baseY + Math.sin(data.phase) * data.radius;
                    particle.sprite.setPosition(newX, newY);

                    // 脉冲效果
                    const pulse = (Math.sin(time / 500) + 1) / 2;
                    particle.sprite.setAlpha(0.3 + pulse * 0.5);
                    break;

                case 'leaf':
                case 'petal':
                    // 飘落运动
                    data.x += data.speedX * dt;
                    data.y += data.speedY * dt;
                    data.rotation += data.rotationSpeed * dt;

                    // 检查是否超出屏幕
                    if (data.y > cameraHeight + 20 || data.x < -20 || data.x > cameraWidth + 20) {
                        // 重置到顶部
                        data.x = Phaser.Math.Between(-20, cameraWidth + 20);
                        data.y = Phaser.Math.Between(-50, -10);
                    }

                    particle.sprite.setPosition(data.x, data.y);
                    particle.sprite.setRotation(data.rotation);
                    break;

                case 'dust':
                    // 浮动运动
                    data.phase += data.speed * dt;
                    const dustX = data.x + Math.cos(data.phase) * data.radius * 0.5;
                    const dustY = data.y + Math.sin(data.phase * 0.7) * data.radius * 0.3;

                    particle.sprite.setPosition(dustX, dustY);

                    // 缓慢漂移
                    data.x += Math.cos(data.phase * 0.3) * 5 * dt;
                    data.y += Math.sin(data.phase * 0.5) * 5 * dt;

                    // 边界检查
                    if (data.x < 0) data.x = cameraWidth;
                    if (data.x > cameraWidth) data.x = 0;
                    if (data.y < 0) data.y = cameraHeight;
                    if (data.y > cameraHeight) data.y = 0;
                    break;
            }
        });
    }

    /**
     * 根据时间/天气切换粒子
     * @param {string} timeOfDay - 时间段（dawn/day/dusk/night）
     * @param {string} weather - 天气（clear/rain/snow/fog）
     * @param {string} location - 地点（forest/cave/town等）
     */
    changeByContext(timeOfDay, weather, location) {
        // 下雨天不显示萤火虫
        if (weather === 'rain' || weather === 'snow') {
            this.clear();
            return;
        }

        // 夜晚显示萤火虫
        if (timeOfDay === 'night' && location === 'forest') {
            this.create('firefly');
            return;
        }

        // 森林显示落叶
        if (location === 'forest') {
            this.create('leaf');
            return;
        }

        // 春天显示花瓣
        // if (season === 'spring') {
        //     this.create('petal');
        //     return;
        // }

        // 洞穴显示灰尘
        if (location === 'cave') {
            this.create('dust');
            return;
        }
    }

    /**
     * 清除所有粒子
     */
    clear() {
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }

        this.particles = [];
        this.scene.events.off('update', this.update, this);
    }

    /**
     * 销毁环境粒子系统
     */
    destroy() {
        this.clear();
        console.log('✨ 环境粒子系统已销毁');
    }
}
