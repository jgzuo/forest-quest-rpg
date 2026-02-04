/**
 * ObjectPool - 对象池管理器
 * 用于复用游戏对象，减少垃圾回收开销
 * @version 1.0 - Milestone 6 Iteration 5+
 */

class ObjectPool {
    constructor(scene) {
        this.scene = scene;

        // 伤害数字池
        this.damageTextPool = [];
        this.activeDamageTexts = [];

        // 浮动文本池
        this.floatingTextPool = [];
        this.activeFloatingTexts = [];

        // 图形对象池（用于技能效果）
        this.graphicsPool = [];
        this.activeGraphics = [];

        // 圆形对象池（用于粒子效果）
        this.circlePool = [];
        this.activeCircles = [];

        // 扩展：容器对象池
        this.containerPool = [];
        this.activeContainers = [];

        // 扩展：精灵对象池
        this.spritePool = [];
        this.activeSprites = [];

        // 扩展：矩形对象池
        this.rectanglePool = [];
        this.activeRectangles = [];

        // 扩展：图像对象池
        this.imagePool = [];
        this.activeImages = [];

        // 扩展：粒子发射器池
        this.emitterPool = [];
        this.activeEmitters = [];

        // 池大小限制
        this.maxPoolSize = {
            damageText: 50,
            floatingText: 20,
            graphics: 30,
            circle: 100,
            container: 20,
            sprite: 50,
            rectangle: 50,
            image: 30,
            emitter: 10
        };

        // 预热配置
        this.warmedUp = false;

        console.log('🎱 ObjectPool 初始化完成');
    }

    /**
     * 预热对象池 - 预先创建常用对象避免运行时创建开销
     * @param {Object} counts - 各类型的预热数量
     */
    warmUp(counts = {}) {
        if (this.warmedUp) {
            console.log('🎱 ObjectPool 已经预热过');
            return;
        }

        console.log('🔥 预热对象池...');

        const defaults = {
            circle: 20,
            graphics: 10,
            rectangle: 15,
            text: 10
        };

        const finalCounts = { ...defaults, ...counts };

        // 预热圆形
        for (let i = 0; i < finalCounts.circle; i++) {
            const circle = this.scene.add.circle(0, 0, 5, 0xffffff, 0);
            circle.setActive(false);
            circle.setVisible(false);
            this.circlePool.push(circle);
        }

        // 预热图形
        for (let i = 0; i < finalCounts.graphics; i++) {
            const graphics = this.scene.add.graphics();
            graphics.setActive(false);
            graphics.setVisible(false);
            this.graphicsPool.push(graphics);
        }

        // 预热矩形
        for (let i = 0; i < finalCounts.rectangle; i++) {
            const rect = this.scene.add.rectangle(0, 0, 10, 10, 0xffffff, 0);
            rect.setActive(false);
            rect.setVisible(false);
            this.rectanglePool.push(rect);
        }

        this.warmedUp = true;
        console.log(`✅ 对象池预热完成: ${finalCounts.circle}圆形, ${finalCounts.graphics}图形, ${finalCounts.rectangle}矩形`);
    }

    /**
     * 批量获取对象（高效创建多个同类对象）
     * @param {string} type - 对象类型
     * @param {number} count - 数量
     * @param {Function} factory - 工厂函数
     * @returns {Array} 对象数组
     */
    batchGet(type, count, factory) {
        const result = [];

        for (let i = 0; i < count; i++) {
            let obj;

            switch (type) {
                case 'circle':
                    obj = this.getCircle(0, 0, 5, 0xffffff, 0);
                    break;
                case 'graphics':
                    obj = this.getGraphics();
                    break;
                case 'rectangle':
                    obj = this.getRectangle(0, 0, 10, 10, 0xffffff, 0);
                    break;
                default:
                    obj = factory ? factory() : null;
            }

            if (obj) {
                result.push(obj);
            }
        }

        return result;
    }

    /**
     * 批量回收对象
     * @param {string} type - 对象类型
     * @param {Array} objects - 对象数组
     */
    batchRecycle(type, objects) {
        objects.forEach(obj => {
            if (!obj || !obj.active) return;

            switch (type) {
                case 'circle':
                    this.recycleCircle(obj);
                    break;
                case 'graphics':
                    this.recycleGraphics(obj);
                    break;
                case 'rectangle':
                    this.recycleRectangle(obj);
                    break;
                case 'container':
                    this.recycleContainer(obj);
                    break;
                case 'sprite':
                    this.recycleSprite(obj);
                    break;
                case 'image':
                    this.recycleImage(obj);
                    break;
            }
        });
    }

    /**
     * 获取容器对象
     */
    getContainer(x = 0, y = 0) {
        let container;

        if (this.containerPool.length > 0) {
            container = this.containerPool.pop();
            container.setPosition(x, y);
            container.setAlpha(1);
            container.setScale(1);
            container.setActive(true);
            container.setVisible(true);
            // 清空子对象
            container.removeAll(true);
        } else {
            container = this.scene.add.container(x, y);
        }

        this.activeContainers.push(container);
        return container;
    }

    /**
     * 回收容器对象
     */
    recycleContainer(container) {
        const index = this.activeContainers.indexOf(container);
        if (index > -1) {
            this.activeContainers.splice(index, 1);
        }

        // 清空所有子对象
        container.removeAll(true);
        container.setActive(false);
        container.setVisible(false);

        if (this.containerPool.length < this.maxPoolSize.container) {
            this.containerPool.push(container);
        } else {
            container.destroy();
        }
    }

    /**
     * 获取精灵对象
     */
    getSprite(x, y, texture, frame = null) {
        let sprite;

        if (this.spritePool.length > 0) {
            sprite = this.spritePool.pop();
            sprite.setPosition(x, y);
            sprite.setTexture(texture, frame);
            sprite.setAlpha(1);
            sprite.setScale(1);
            sprite.setRotation(0);
            sprite.setTint(0xffffff);
            sprite.setActive(true);
            sprite.setVisible(true);
            sprite.clearTint();
        } else {
            sprite = this.scene.add.sprite(x, y, texture, frame);
        }

        this.activeSprites.push(sprite);
        return sprite;
    }

    /**
     * 回收精灵对象
     */
    recycleSprite(sprite) {
        const index = this.activeSprites.indexOf(sprite);
        if (index > -1) {
            this.activeSprites.splice(index, 1);
        }

        sprite.setActive(false);
        sprite.setVisible(false);
        sprite.stop();

        if (this.spritePool.length < this.maxPoolSize.sprite) {
            this.spritePool.push(sprite);
        } else {
            sprite.destroy();
        }
    }

    /**
     * 获取矩形对象
     */
    getRectangle(x, y, width, height, color, alpha = 1) {
        let rect;

        if (this.rectanglePool.length > 0) {
            rect = this.rectanglePool.pop();
            rect.setPosition(x, y);
            rect.setSize(width, height);
            rect.setFillStyle(color, alpha);
            rect.setAlpha(1);
            rect.setScale(1);
            rect.setActive(true);
            rect.setVisible(true);
        } else {
            rect = this.scene.add.rectangle(x, y, width, height, color, alpha);
        }

        this.activeRectangles.push(rect);
        return rect;
    }

    /**
     * 回收矩形对象
     */
    recycleRectangle(rect) {
        const index = this.activeRectangles.indexOf(rect);
        if (index > -1) {
            this.activeRectangles.splice(index, 1);
        }

        rect.setActive(false);
        rect.setVisible(false);

        if (this.rectanglePool.length < this.maxPoolSize.rectangle) {
            this.rectanglePool.push(rect);
        } else {
            rect.destroy();
        }
    }

    /**
     * 获取图像对象
     */
    getImage(x, y, texture, frame = null) {
        let image;

        if (this.imagePool.length > 0) {
            image = this.imagePool.pop();
            image.setPosition(x, y);
            image.setTexture(texture, frame);
            image.setAlpha(1);
            image.setScale(1);
            image.setRotation(0);
            image.setActive(true);
            image.setVisible(true);
        } else {
            image = this.scene.add.image(x, y, texture, frame);
        }

        this.activeImages.push(image);
        return image;
    }

    /**
     * 回收图像对象
     */
    recycleImage(image) {
        const index = this.activeImages.indexOf(image);
        if (index > -1) {
            this.activeImages.splice(index, 1);
        }

        image.setActive(false);
        image.setVisible(false);

        if (this.imagePool.length < this.maxPoolSize.image) {
            this.imagePool.push(image);
        } else {
            image.destroy();
        }
    }

    /**
     * 获取伤害数字对象
     */
    getDamageText(x, y, damage, color = '#ff0000', size = 20) {
        let text;

        if (this.damageTextPool.length > 0) {
            // 从池中获取
            text = this.damageTextPool.pop();
            text.setText(damage.toString());
            text.setPosition(x, y);
            text.setStyle({
                fontFamily: 'Arial',
                fontSize: size + 'px',
                color: color,
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 4
            });
            text.setAlpha(1);
            text.setActive(true);
            text.setVisible(true);
        } else {
            // 创建新对象
            text = this.scene.add.text(x, y, damage.toString(), {
                fontFamily: 'Arial',
                fontSize: size + 'px',
                color: color,
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 4
            }).setOrigin(0.5);
        }

        this.activeDamageTexts.push(text);
        return text;
    }

    /**
     * 回收伤害数字对象
     */
    recycleDamageText(text) {
        const index = this.activeDamageTexts.indexOf(text);
        if (index > -1) {
            this.activeDamageTexts.splice(index, 1);
        }

        text.setActive(false);
        text.setVisible(false);

        // 只有池未满时才回收
        if (this.damageTextPool.length < this.maxPoolSize.damageText) {
            this.damageTextPool.push(text);
        } else {
            text.destroy();
        }
    }

    /**
     * 获取浮动文本对象
     */
    getFloatingText(x, y, message, color = '#ffffff') {
        let text;

        if (this.floatingTextPool.length > 0) {
            text = this.floatingTextPool.pop();
            text.setText(message);
            text.setPosition(x, y);
            text.setStyle({
                font: '16px Arial',
                fill: color,
                stroke: '#000000',
                strokeThickness: 3
            });
            text.setAlpha(1);
            text.setActive(true);
            text.setVisible(true);
        } else {
            text = this.scene.add.text(x, y, message, {
                font: '16px Arial',
                fill: color,
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5);
        }

        this.activeFloatingTexts.push(text);
        return text;
    }

    /**
     * 回收浮动文本对象
     */
    recycleFloatingText(text) {
        const index = this.activeFloatingTexts.indexOf(text);
        if (index > -1) {
            this.activeFloatingTexts.splice(index, 1);
        }

        text.setActive(false);
        text.setVisible(false);

        if (this.floatingTextPool.length < this.maxPoolSize.floatingText) {
            this.floatingTextPool.push(text);
        } else {
            text.destroy();
        }
    }

    /**
     * 获取图形对象
     */
    getGraphics() {
        let graphics;

        if (this.graphicsPool.length > 0) {
            graphics = this.graphicsPool.pop();
            graphics.clear();
            graphics.setAlpha(1);
            graphics.setScale(1);
            graphics.setActive(true);
            graphics.setVisible(true);
        } else {
            graphics = this.scene.add.graphics();
        }

        this.activeGraphics.push(graphics);
        return graphics;
    }

    /**
     * 回收图形对象
     */
    recycleGraphics(graphics) {
        const index = this.activeGraphics.indexOf(graphics);
        if (index > -1) {
            this.activeGraphics.splice(index, 1);
        }

        graphics.clear();
        graphics.setActive(false);
        graphics.setVisible(false);

        if (this.graphicsPool.length < this.maxPoolSize.graphics) {
            this.graphicsPool.push(graphics);
        } else {
            graphics.destroy();
        }
    }

    /**
     * 获取圆形对象
     */
    getCircle(x, y, radius, color, alpha = 1) {
        let circle;

        if (this.circlePool.length > 0) {
            circle = this.circlePool.pop();
            circle.setPosition(x, y);
            circle.setRadius(radius);
            circle.setFillStyle(color, alpha);
            circle.setAlpha(1);
            circle.setScale(1);
            circle.setActive(true);
            circle.setVisible(true);
        } else {
            circle = this.scene.add.circle(x, y, radius, color, alpha);
        }

        this.activeCircles.push(circle);
        return circle;
    }

    /**
     * 回收圆形对象
     */
    recycleCircle(circle) {
        const index = this.activeCircles.indexOf(circle);
        if (index > -1) {
            this.activeCircles.splice(index, 1);
        }

        circle.setActive(false);
        circle.setVisible(false);

        if (this.circlePool.length < this.maxPoolSize.circle) {
            this.circlePool.push(circle);
        } else {
            circle.destroy();
        }
    }

    /**
     * 获取活跃对象统计
     */
    getStats() {
        const totalActive =
            this.activeDamageTexts.length +
            this.activeFloatingTexts.length +
            this.activeGraphics.length +
            this.activeCircles.length +
            this.activeContainers.length +
            this.activeSprites.length +
            this.activeRectangles.length +
            this.activeImages.length;

        const totalPooled =
            this.damageTextPool.length +
            this.floatingTextPool.length +
            this.graphicsPool.length +
            this.circlePool.length +
            this.containerPool.length +
            this.spritePool.length +
            this.rectanglePool.length +
            this.imagePool.length;

        return {
            damageTexts: {
                active: this.activeDamageTexts.length,
                pooled: this.damageTextPool.length
            },
            floatingTexts: {
                active: this.activeFloatingTexts.length,
                pooled: this.floatingTextPool.length
            },
            graphics: {
                active: this.activeGraphics.length,
                pooled: this.graphicsPool.length
            },
            circles: {
                active: this.activeCircles.length,
                pooled: this.circlePool.length
            },
            containers: {
                active: this.activeContainers.length,
                pooled: this.containerPool.length
            },
            sprites: {
                active: this.activeSprites.length,
                pooled: this.spritePool.length
            },
            rectangles: {
                active: this.activeRectangles.length,
                pooled: this.rectanglePool.length
            },
            images: {
                active: this.activeImages.length,
                pooled: this.imagePool.length
            },
            totals: {
                active: totalActive,
                pooled: totalPooled,
                total: totalActive + totalPooled
            },
            warmedUp: this.warmedUp
        };
    }

    /**
     * 清理所有对象池
     */
    destroy() {
        // 销毁所有池中的对象
        this.damageTextPool.forEach(text => text.destroy());
        this.floatingTextPool.forEach(text => text.destroy());
        this.graphicsPool.forEach(graphics => graphics.destroy());
        this.circlePool.forEach(circle => circle.destroy());
        this.containerPool.forEach(container => container.destroy());
        this.spritePool.forEach(sprite => sprite.destroy());
        this.rectanglePool.forEach(rect => rect.destroy());
        this.imagePool.forEach(image => image.destroy());

        // 销毁所有活跃对象
        this.activeDamageTexts.forEach(text => text.destroy());
        this.activeFloatingTexts.forEach(text => text.destroy());
        this.activeGraphics.forEach(graphics => graphics.destroy());
        this.activeCircles.forEach(circle => circle.destroy());
        this.activeContainers.forEach(container => container.destroy());
        this.activeSprites.forEach(sprite => sprite.destroy());
        this.activeRectangles.forEach(rect => rect.destroy());
        this.activeImages.forEach(image => image.destroy());

        // 清空数组
        this.damageTextPool = [];
        this.floatingTextPool = [];
        this.graphicsPool = [];
        this.circlePool = [];
        this.containerPool = [];
        this.spritePool = [];
        this.rectanglePool = [];
        this.imagePool = [];
        this.activeDamageTexts = [];
        this.activeFloatingTexts = [];
        this.activeGraphics = [];
        this.activeCircles = [];
        this.activeContainers = [];
        this.activeSprites = [];
        this.activeRectangles = [];
        this.activeImages = [];

        console.log('🎱 ObjectPool 已销毁');
    }
}
