/**
 * EnhancedDamageText - 增强伤害数字系统
 *
 * 提供更丰富的伤害数字动画效果：
 * - 弹跳动画
 * - 缩放效果
 * - 颜色渐变
 * - 不同伤害类型的视觉差异化
 * - 暴击/格挡/闪避的特殊效果
 */

class EnhancedDamageText {
    constructor(scene) {
        this.scene = scene;
        this.activeTexts = [];

        // US-013: 伤害数字堆叠优化 - 网格系统
        this.gridSize = 40; // 网格大小（像素）
        this.grid = new Map(); // 网格位置到伤害数字数量的映射
        this.maxStackInGrid = 3; // 每个网格最大堆叠数

        // 配置
        this.config = {
            normal: {
                color: '#ff0000',
                size: 24,
                duration: 800,
                riseDistance: 60,
                bounceHeight: 10
            },
            crit: {
                color: '#ff00ff',
                size: 36,
                duration: 1200,
                riseDistance: 80,
                bounceHeight: 15
            },
            dot: {
                color: '#66ff66',
                size: 18,
                duration: 600,
                riseDistance: 40,
                bounceHeight: 5
            },
            heal: {
                color: '#48bb78',
                size: 20,
                duration: 1000,
                riseDistance: 70,
                bounceHeight: 8
            },
            blocked: {
                color: '#cccccc',
                size: 20,
                duration: 600,
                riseDistance: 30,
                bounceHeight: 5
            },
            dodged: {
                color: '#87ceeb',
                size: 18,
                duration: 500,
                riseDistance: 40,
                bounceHeight: 0
            }
        };

        console.log('💥 增强伤害数字系统初始化');
    }

    /**
     * 显示伤害数字（增强版）
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} damage - 伤害值
     * @param {string} type - 伤害类型（normal/crit/dot/heal/blocked/dodged）
     * @param {object} options - 可选配置
     */
    show(x, y, damage, type = 'normal', options = {}) {
        const config = this.config[type] || this.config.normal;
        const size = options.size || config.size;
        const color = options.color || config.color;
        const duration = options.duration || config.duration;

        // ============ US-013: 伤害数字堆叠优化 ============
        // 计算网格坐标
        const gridX = Math.floor(x / this.gridSize);
        const gridY = Math.floor(y / this.gridSize);
        const gridKey = `${gridX},${gridY}`;

        // 获取当前网格的堆叠数量
        let stackCount = this.grid.get(gridKey) || 0;

        // 如果堆叠过多，应用偏移或合并
        let finalX = x;
        let finalY = y;

        if (stackCount >= this.maxStackInGrid) {
            // 寻找相邻的稀疏网格
            const offset = this.findSparseGrid(gridX, gridY);
            if (offset) {
                finalX = x + offset.x * this.gridSize * 0.5;
                finalY = y + offset.y * this.gridSize * 0.5;
            } else {
                // 垂直偏移堆叠
                finalY = y - (stackCount - this.maxStackInGrid + 1) * 25;
            }
        }

        // 更新网格计数
        this.grid.set(gridKey, stackCount + 1);

        // 延迟清理网格计数
        this.scene.time.delayedCall(duration, () => {
            const current = this.grid.get(gridKey) || 0;
            if (current > 1) {
                this.grid.set(gridKey, current - 1);
            } else {
                this.grid.delete(gridKey);
            }
        });

        // 创建伤害数字文本
        const text = this.scene.add.text(finalX, finalY, damage.toString(), {
            fontFamily: 'Arial Black, Arial',
            fontSize: `bold ${size}px`,
            fill: color,
            stroke: '#000000',
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 3,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5);

        text.setDepth(150);

        // 添加到活跃列表
        this.activeTexts.push({
            text: text,
            type: type,
            age: 0,
            duration: duration
        });

        // 应用动画
        this.applyAnimation(text, type, config, options);

        return text;
    }

    /**
     * 应用动画效果
     */
    applyAnimation(text, type, config, options) {
        const riseDistance = options.riseDistance || config.riseDistance;
        const bounceHeight = options.bounceHeight || config.bounceHeight;
        const duration = options.duration || config.duration;

        // 初始缩放（从大到小）
        text.setScale(1.5);

        // 1. 弹跳动画（向上跳动）
        this.scene.tweens.add({
            targets: text,
            y: text.y - riseDistance,
            duration: duration,
            ease: 'Back.easeOut',
            onUpdate: (tween, target) => {
                // 添加正弦波动的横向偏移
                const progress = tween.progress;
                const wobble = Math.sin(progress * Math.PI * 2) * 5;
                target.x = text.x + wobble;
            }
        });

        // 2. 缩放动画（从大缩小到正常）
        this.scene.tweens.add({
            targets: text,
            scaleX: 1,
            scaleY: 1,
            duration: 200,
            ease: 'Power2'
        });

        // 3. 颜色渐变（淡出）
        this.scene.tweens.add({
            targets: text,
            alpha: 0,
            duration: duration,
            delay: duration * 0.3,
            ease: 'Power1'
        });

        // 4. 特殊效果：暴击额外动画
        if (type === 'crit') {
            // 暴击文字震动
            this.scene.tweens.add({
                targets: text,
                angle: Phaser.Math.Between(-10, 10),
                duration: 100,
                yoyo: true,
                repeat: 3
            });

            // 暴击额外缩放
            this.scene.tweens.add({
                targets: text,
                scale: 1.3,
                duration: 150,
                yoyo: true,
                ease: 'Power2',
                delay: 100
            });

            // 暴击闪光效果
            const flash = this.scene.add.graphics();
            flash.setDepth(149);
            flash.fillStyle(0xff00ff, 0.3);
            flash.fillCircle(text.x, text.y, 30);

            this.scene.tweens.add({
                targets: flash,
                scale: 2,
                alpha: 0,
                duration: 400,
                onComplete: () => {
                    flash.destroy();
                }
            });
        }

        // 5. 特殊效果：治疗爱心符号
        if (type === 'heal') {
            const heart = this.scene.add.text(text.x, text.y, '💚', {
                fontSize: '16px'
            }).setOrigin(0.5);
            heart.setDepth(151);

            this.scene.tweens.add({
                targets: heart,
                y: heart.y - 40,
                alpha: 0,
                duration: 800,
                onComplete: () => {
                    heart.destroy();
                }
            });
        }

        // 6. 特殊效果：格挡盾牌
        if (type === 'blocked') {
            const shield = this.scene.add.text(text.x + 30, text.y, '🛡️', {
                fontSize: '24px'
            }).setOrigin(0.5);
            shield.setDepth(151);

            this.scene.tweens.add({
                targets: shield,
                alpha: 0,
                scale: 1.5,
                duration: 600,
                onComplete: () => {
                    shield.destroy();
                }
            });
        }

        // 7. 特殊效果：闪避残影
        if (type === 'dodged') {
            for (let i = 0; i < 3; i++) {
                const afterImage = this.scene.add.text(text.x, text.y, '💨', {
                    fontSize: '20px',
                    fill: '#87ceeb',
                    stroke: '#000000',
                    strokeThickness: 2
                }).setOrigin(0.5);
                afterImage.setAlpha(0.5);
                afterImage.setDepth(149);

                this.scene.time.delayedCall(i * 100, () => {
                    this.scene.tweens.add({
                        targets: afterImage,
                        x: afterImage.x - 20,
                        alpha: 0,
                        duration: 400,
                        onComplete: () => {
                            afterImage.destroy();
                        }
                    });
                });
            }
        }

        // 8. 自动销毁
        this.scene.time.delayedCall(duration, () => {
            // 从活跃列表移除
            const index = this.activeTexts.findIndex(item => item.text === text);
            if (index > -1) {
                this.activeTexts.splice(index, 1);
            }
            text.destroy();
        });
    }

    /**
     * 显示组合伤害数字（连击伤害）
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {Array} damages - 伤害数组 [{damage: 100, type: 'normal'}, ...]
     */
    showComboDamage(x, y, damages) {
        const delay = 100;

        damages.forEach((damageInfo, index) => {
            this.scene.time.delayedCall(index * delay, () => {
                // 稍微偏移位置
                const offsetX = (Math.random() - 0.5) * 30;
                const offsetY = (Math.random() - 0.5) * 20;

                this.show(
                    x + offsetX,
                    y + offsetY,
                    damageInfo.damage,
                    damageInfo.type || 'normal'
                );
            });
        });
    }

    /**
     * 显示持续伤害数字
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} damage - 伤害值
     * @param {string} element - 元素类型（fire/ice/poison/lightning）
     */
    showDOT(x, y, damage, element) {
        const elementIcons = {
            fire: '🔥',
            ice: '❄️',
            poison: '☠️',
            lightning: '⚡'
        };

        const icon = elementIcons[element] || '';
        const text = `${icon}${damage}`;

        this.show(x, y, text, 'dot', {
            color: this.getElementColor(element)
        });
    }

    /**
     * 获取元素颜色
     */
    getElementColor(element) {
        const colors = {
            fire: '#ff6600',
            ice: '#66ccff',
            poison: '#66ff66',
            lightning: '#9966ff'
        };
        return colors[element] || '#ffffff';
    }

    /**
     * 显示等级提升文字
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} level - 新等级
     */
    showLevelUp(x, y, level) {
        const levelUpText = this.scene.add.text(x, y - 50, `LEVEL UP!`, {
            fontFamily: 'Press Start 2P',
            fontSize: 'bold 28px',
            fill: '#ffd700',
            stroke: '#000000',
            strokeThickness: 6,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#000000',
                blur: 5,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5);

        levelUpText.setDepth(160);

        // 升级动画
        this.scene.tweens.add({
            targets: levelUpText,
            y: levelUpText.y - 80,
            scale: 1.5,
            alpha: 0,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                levelUpText.destroy();
            }
        });

        // 显示等级数字
        const levelText = this.scene.add.text(x, y - 100, `${level}`, {
            fontFamily: 'Press Start 2P',
            fontSize: 'bold 48px',
            fill: '#ffffff',
            stroke: '#ffd700',
            strokeThickness: 8
        }).setOrigin(0.5);

        levelText.setDepth(161);

        this.scene.tweens.add({
            targets: levelText,
            y: levelText.y - 60,
            scale: 1.3,
            alpha: 0,
            duration: 2000,
            delay: 200,
            ease: 'Power2',
            onComplete: () => {
                levelText.destroy();
            }
        });
    }

    /**
     * 每帧更新
     * @param {number} time - 当前时间
     * @param {number} delta - 时间增量
     */
    update(time, delta) {
        // 清理过期的文本对象
        const now = this.scene.time.now;

        for (let i = this.activeTexts.length - 1; i >= 0; i--) {
            const item = this.activeTexts[i];
            item.age += delta;

            if (item.age >= item.duration) {
                // 文本应该已被自动销毁，但做个安全检查
                if (item.text && item.text.active) {
                    item.text.destroy();
                }
                this.activeTexts.splice(i, 1);
            }
        }
    }

    /**
     * US-013: 寻找稀疏的相邻网格
     * @param {number} gridX - 当前网格X
     * @param {number} gridY - 当前网格Y
     * @returns {object|null} 偏移量 {x, y} 或 null
     */
    findSparseGrid(gridX, gridY) {
        // 检查周围8个方向，找到最稀疏的
        const directions = [
            { x: 0, y: -1 }, { x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 },
            { x: 0, y: 1 }, { x: -1, y: 1 }, { x: -1, y: 0 }, { x: -1, y: -1 }
        ];

        let bestDirection = null;
        let minCount = Infinity;

        for (const dir of directions) {
            const key = `${gridX + dir.x},${gridY + dir.y}`;
            const count = this.grid.get(key) || 0;

            if (count < minCount) {
                minCount = count;
                bestDirection = dir;
            }
        }

        // 如果最稀疏的网格数量仍然很高，返回null（使用垂直堆叠）
        if (minCount >= this.maxStackInGrid) {
            return null;
        }

        return bestDirection;
    }

    /**
     * 获取活跃文本数量
     */
    getActiveCount() {
        return this.activeTexts.length;
    }

    /**
     * 清除所有文本
     */
    clear() {
        this.activeTexts.forEach(item => {
            if (item.text && item.text.active) {
                item.text.destroy();
            }
        });
        this.activeTexts = [];
    }

    /**
     * 销毁系统
     */
    destroy() {
        this.clear();
        console.log('💥 增强伤害数字系统已销毁');
    }
}
