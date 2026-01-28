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

        // 池大小限制
        this.maxPoolSize = {
            damageText: 50,
            floatingText: 20,
            graphics: 30,
            circle: 100
        };

        console.log('🎱 ObjectPool 初始化完成');
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
            }
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

        // 销毁所有活跃对象
        this.activeDamageTexts.forEach(text => text.destroy());
        this.activeFloatingTexts.forEach(text => text.destroy());
        this.activeGraphics.forEach(graphics => graphics.destroy());
        this.activeCircles.forEach(circle => circle.destroy());

        // 清空数组
        this.damageTextPool = [];
        this.floatingTextPool = [];
        this.graphicsPool = [];
        this.circlePool = [];
        this.activeDamageTexts = [];
        this.activeFloatingTexts = [];
        this.activeGraphics = [];
        this.activeCircles = [];

        console.log('🎱 ObjectPool 已销毁');
    }
}
