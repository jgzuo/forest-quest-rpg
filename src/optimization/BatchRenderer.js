/**
 * BatchRenderer - 批量渲染系统
 *
 * 批量渲染相似粒子减少draw call：
 * - 使用Phaser.Graphics批量绘制圆形/线条
 * - 按颜色/类型分组渲染
 * - 自动合批相邻粒子
 * - 减少GPU状态切换
 */

class BatchRenderer {
    constructor(scene) {
        this.scene = scene;

        // 批次配置
        this.config = {
            maxBatchSize: 1000,      // 每批最大粒子数
            batchInterval: 16,       // 批处理间隔（ms）
            enableBatching: true,    // 是否启用批处理
            debugMode: false         // 调试模式
        };

        // 批次队列
        this.batches = {
            circles: new Map(),      // 圆形批次：color -> Array
            lines: new Map(),        // 线条批次
            rects: new Map()         // 矩形批次
        };

        // 渲染统计
        this.stats = {
            drawCalls: 0,
            batchedDraws: 0,
            skippedDraws: 0,
            lastFrameDrawCalls: 0
        };

        // 图形对象（复用）
        this.graphics = null;
        this.debugGraphics = null;

        // 初始化
        this.init();

        console.log('🎨 批量渲染系统初始化');
    }

    /**
     * 初始化渲染系统
     */
    init() {
        // 创建主图形对象
        this.graphics = this.scene.add.graphics();
        this.graphics.setDepth(100);

        // 创建调试图形对象
        if (this.config.debugMode) {
            this.debugGraphics = this.scene.add.graphics();
            this.debugGraphics.setDepth(999);
        }
    }

    /**
     * 添加圆形到批次
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} radius - 半径
     * @param {number} color - 颜色
     * @param {number} alpha - 透明度
     */
    addCircle(x, y, radius, color, alpha = 1) {
        if (!this.config.enableBatching) {
            // 直接绘制（不批处理）
            this.graphics.fillStyle(color, alpha);
            this.graphics.fillCircle(x, y, radius);
            this.stats.drawCalls++;
            return;
        }

        // 确保颜色键存在
        if (!this.batches.circles.has(color)) {
            this.batches.circles.set(color, []);
        }

        // 添加到批次
        this.batches.circles.get(color).push({
            x, y, radius, alpha
        });
    }

    /**
     * 添加线条到批次
     * @param {number} x1 - 起点X
     * @param {number} y1 - 起点Y
     * @param {number} x2 - 终点X
     * @param {number} y2 - 终点Y
     * @param {number} lineWidth - 线宽
     * @param {number} color - 颜色
     * @param {number} alpha - 透明度
     */
    addLine(x1, y1, x2, y2, lineWidth, color, alpha = 1) {
        if (!this.config.enableBatching) {
            this.graphics.lineStyle(lineWidth, color, alpha);
            this.graphics.lineBetween(x1, y1, x2, y2);
            this.stats.drawCalls++;
            return;
        }

        const key = `${color}_${lineWidth}`;
        if (!this.batches.lines.has(key)) {
            this.batches.lines.set(key, []);
        }

        this.batches.lines.get(key).push({
            x1, y1, x2, y2, alpha
        });
    }

    /**
     * 添加矩形到批次
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {number} color - 颜色
     * @param {number} alpha - 透明度
     * @param {boolean} isFill - 是否填充
     * @param {number} lineWidth - 线宽（仅描边时）
     */
    addRect(x, y, width, height, color, alpha = 1, isFill = true, lineWidth = 1) {
        if (!this.config.enableBatching) {
            if (isFill) {
                this.graphics.fillStyle(color, alpha);
                this.graphics.fillRect(x, y, width, height);
            } else {
                this.graphics.lineStyle(lineWidth, color, alpha);
                this.graphics.strokeRect(x, y, width, height);
            }
            this.stats.drawCalls++;
            return;
        }

        const key = `${color}_${isFill}_${lineWidth}`;
        if (!this.batches.rects.has(key)) {
            this.batches.rects.set(key, []);
        }

        this.batches.rects.get(key).push({
            x, y, width, height, alpha
        });
    }

    /**
     * 批量绘制圆形
     */
    renderCircleBatch() {
        let batchCount = 0;

        this.batches.circles.forEach((circles, color) => {
            if (circles.length === 0) return;

            // 按透明度分组（相近透明度一起渲染）
            const alphaGroups = this.groupByAlpha(circles);

            alphaGroups.forEach((group, alpha) => {
                this.graphics.fillStyle(color, alpha);

                // 批量绘制
                group.forEach(circle => {
                    this.graphics.fillCircle(circle.x, circle.y, circle.radius);
                });

                batchCount++;
            });

            // 清空批次
            circles.length = 0;
        });

        return batchCount;
    }

    /**
     * 批量绘制线条
     */
    renderLineBatch() {
        let batchCount = 0;

        this.batches.lines.forEach((lines, key) => {
            if (lines.length === 0) return;

            const [color, lineWidth] = key.split('_').map(Number);

            // 按透明度分组
            const alphaGroups = this.groupByAlpha(lines);

            alphaGroups.forEach((group, alpha) => {
                this.graphics.lineStyle(lineWidth, color, alpha);
                this.graphics.beginPath();

                group.forEach(line => {
                    this.graphics.moveTo(line.x1, line.y1);
                    this.graphics.lineTo(line.x2, line.y2);
                });

                this.graphics.strokePath();
                batchCount++;
            });

            lines.length = 0;
        });

        return batchCount;
    }

    /**
     * 批量绘制矩形
     */
    renderRectBatch() {
        let batchCount = 0;

        this.batches.rects.forEach((rects, key) => {
            if (rects.length === 0) return;

            const [color, isFill, lineWidth] = key.split('_');
            const colorNum = Number(color);

            // 按透明度分组
            const alphaGroups = this.groupByAlpha(rects);

            alphaGroups.forEach((group, alpha) => {
                if (isFill === 'true') {
                    this.graphics.fillStyle(colorNum, alpha);
                    group.forEach(rect => {
                        this.graphics.fillRect(rect.x, rect.y, rect.width, rect.height);
                    });
                } else {
                    this.graphics.lineStyle(Number(lineWidth), colorNum, alpha);
                    group.forEach(rect => {
                        this.graphics.strokeRect(rect.x, rect.y, rect.width, rect.height);
                    });
                }

                batchCount++;
            });

            rects.length = 0;
        });

        return batchCount;
    }

    /**
     * 按透明度分组（合并相近透明度）
     * @param {Array} items - 项目数组
     * @returns {Map} 分组结果
     */
    groupByAlpha(items) {
        const groups = new Map();

        items.forEach(item => {
            // 将透明度量化为10个等级
            const quantizedAlpha = Math.floor(item.alpha * 10) / 10;

            if (!groups.has(quantizedAlpha)) {
                groups.set(quantizedAlpha, []);
            }

            groups.get(quantizedAlpha).push(item);
        });

        return groups;
    }

    /**
     * 执行批量渲染
     */
    render() {
        // 清空图形
        this.graphics.clear();

        if (this.config.debugMode && this.debugGraphics) {
            this.debugGraphics.clear();
        }

        // 重置统计
        this.stats.lastFrameDrawCalls = this.stats.drawCalls;
        this.stats.drawCalls = 0;
        let totalBatched = 0;

        // 批量渲染圆形
        totalBatched += this.renderCircleBatch();

        // 批量渲染线条
        totalBatched += this.renderLineBatch();

        // 批量渲染矩形
        totalBatched += this.renderRectBatch();

        this.stats.batchedDraws = totalBatched;

        // 调试信息
        if (this.config.debugMode) {
            this.renderDebugInfo();
        }
    }

    /**
     * 渲染调试信息
     */
    renderDebugInfo() {
        if (!this.debugGraphics) return;

        this.debugGraphics.fillStyle(0x000000, 0.7);
        this.debugGraphics.fillRect(10, 10, 200, 80);

        // 这里应该用文本，但为了性能使用图形
        // 实际项目中可以使用固定的调试文本对象
    }

    /**
     * 快速渲染单个粒子（不批处理）
     * 用于紧急或特殊粒子
     */
    renderImmediate(type, params) {
        switch (type) {
            case 'circle':
                this.graphics.fillStyle(params.color, params.alpha);
                this.graphics.fillCircle(params.x, params.y, params.radius);
                break;
            case 'line':
                this.graphics.lineStyle(params.lineWidth, params.color, params.alpha);
                this.graphics.lineBetween(params.x1, params.y1, params.x2, params.y2);
                break;
            case 'rect':
                if (params.isFill) {
                    this.graphics.fillStyle(params.color, params.alpha);
                    this.graphics.fillRect(params.x, params.y, params.width, params.height);
                } else {
                    this.graphics.lineStyle(params.lineWidth, params.color, params.alpha);
                    this.graphics.strokeRect(params.x, params.y, params.width, params.height);
                }
                break;
        }

        this.stats.drawCalls++;
    }

    /**
     * 启用/禁用批处理
     * @param {boolean} enabled - 是否启用
     */
    setBatchingEnabled(enabled) {
        this.config.enableBatching = enabled;

        if (!enabled) {
            // 立即渲染所有待处理批次
            this.render();
        }
    }

    /**
     * 清除所有批次
     */
    clearBatches() {
        this.batches.circles.clear();
        this.batches.lines.clear();
        this.batches.rects.clear();
        this.graphics.clear();
    }

    /**
     * 获取渲染统计
     */
    getStats() {
        // 计算节省的draw call
        const saved = this.stats.lastFrameDrawCalls - this.stats.batchedDraws;
        const savedPercent = this.stats.lastFrameDrawCalls > 0
            ? (saved / this.stats.lastFrameDrawCalls * 100).toFixed(1)
            : 0;

        return {
            lastFrameDrawCalls: this.stats.lastFrameDrawCalls,
            batchedDraws: this.stats.batchedDraws,
            savedDrawCalls: saved,
            savedPercent: savedPercent,
            batchingEnabled: this.config.enableBatching
        };
    }

    /**
     * 每帧更新
     * @param {number} time - 当前时间
     * @param {number} delta - 时间增量
     */
    update(time, delta) {
        // 自动执行渲染
        this.render();
    }

    /**
     * 销毁渲染系统
     */
    destroy() {
        this.clearBatches();

        if (this.graphics) {
            this.graphics.destroy();
        }

        if (this.debugGraphics) {
            this.debugGraphics.destroy();
        }

        console.log('🎨 批量渲染系统已销毁');
    }
}
