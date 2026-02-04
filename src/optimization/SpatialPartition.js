/**
 * SpatialPartition - 空间分割系统（四叉树）
 *
 * 使用四叉树优化碰撞检测和范围查询：
 * - 动态四叉树管理移动对象
 * - 快速范围查询（圆形/矩形）
 * - 邻居查找优化
 * - 减少碰撞检测复杂度从O(n²)到O(n log n)
 */

class SpatialPartition {
    constructor(bounds, maxObjects = 10, maxLevels = 5, level = 0) {
        this.bounds = bounds; // {x, y, width, height}
        this.maxObjects = maxObjects;
        this.maxLevels = maxLevels;
        this.level = level;

        this.objects = [];
        this.nodes = []; // 四个子节点 [TL, TR, BL, BR]

        this.stats = {
            totalObjects: 0,
            totalNodes: 1,
            queryCount: 0
        };
    }

    /**
     * 清除四叉树
     */
    clear() {
        this.objects = [];

        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i]) {
                this.nodes[i].clear();
            }
        }

        this.nodes = [];
        this.stats.totalObjects = 0;
    }

    /**
     * 分割节点为四个子节点
     */
    split() {
        const subWidth = this.bounds.width / 2;
        const subHeight = this.bounds.height / 2;
        const x = this.bounds.x;
        const y = this.bounds.y;

        // 右上 (Top-Right)
        this.nodes[0] = new SpatialPartition(
            { x: x + subWidth, y: y, width: subWidth, height: subHeight },
            this.maxObjects,
            this.maxLevels,
            this.level + 1
        );

        // 左上 (Top-Left)
        this.nodes[1] = new SpatialPartition(
            { x: x, y: y, width: subWidth, height: subHeight },
            this.maxObjects,
            this.maxLevels,
            this.level + 1
        );

        // 左下 (Bottom-Left)
        this.nodes[2] = new SpatialPartition(
            { x: x, y: y + subHeight, width: subWidth, height: subHeight },
            this.maxObjects,
            this.maxLevels,
            this.level + 1
        );

        // 右下 (Bottom-Right)
        this.nodes[3] = new SpatialPartition(
            { x: x + subWidth, y: y + subHeight, width: subWidth, height: subHeight },
            this.maxObjects,
            this.maxLevels,
            this.level + 1
        );

        this.stats.totalNodes += 4;
    }

    /**
     * 获取对象所在的象限索引
     */
    getIndex(bounds) {
        let index = -1;
        const verticalMidpoint = this.bounds.x + this.bounds.width / 2;
        const horizontalMidpoint = this.bounds.y + this.bounds.height / 2;

        const topQuadrant = (bounds.y < horizontalMidpoint && bounds.y + bounds.height < horizontalMidpoint);
        const bottomQuadrant = (bounds.y > horizontalMidpoint);

        if (bounds.x < verticalMidpoint && bounds.x + bounds.width < verticalMidpoint) {
            if (topQuadrant) {
                index = 1; // 左上
            } else if (bottomQuadrant) {
                index = 2; // 左下
            }
        } else if (bounds.x > verticalMidpoint) {
            if (topQuadrant) {
                index = 0; // 右上
            } else if (bottomQuadrant) {
                index = 3; // 右下
            }
        }

        return index;
    }

    /**
     * 插入对象
     */
    insert(obj) {
        // 如果已有子节点，插入到子节点
        if (this.nodes.length > 0) {
            const index = this.getIndex(obj.bounds);

            if (index !== -1) {
                this.nodes[index].insert(obj);
                return;
            }
        }

        // 添加到当前节点
        this.objects.push(obj);
        this.stats.totalObjects++;

        // 检查是否需要分割
        if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
            if (this.nodes.length === 0) {
                this.split();
            }

            // 重新分配对象
            let i = 0;
            while (i < this.objects.length) {
                const index = this.getIndex(this.objects[i].bounds);
                if (index !== -1) {
                    this.nodes[index].insert(this.objects.splice(i, 1)[0]);
                } else {
                    i++;
                }
            }
        }
    }

    /**
     * 从四叉树中移除对象
     */
    remove(obj) {
        if (this.nodes.length > 0) {
            const index = this.getIndex(obj.bounds);
            if (index !== -1) {
                return this.nodes[index].remove(obj);
            }
        }

        const idx = this.objects.indexOf(obj);
        if (idx !== -1) {
            this.objects.splice(idx, 1);
            this.stats.totalObjects--;
            return true;
        }

        return false;
    }

    /**
     * 更新对象位置（先移除再重新插入）
     */
    update(obj, newBounds) {
        this.remove(obj);
        obj.bounds = newBounds;
        this.insert(obj);
    }

    /**
     * 范围查询 - 矩形
     */
    retrieve(bounds, returnObjects = []) {
        this.stats.queryCount++;

        const index = this.getIndex(bounds);

        // 如果跨越多个象限，检查所有子节点
        if (index !== -1 && this.nodes.length > 0) {
            this.nodes[index].retrieve(bounds, returnObjects);
        } else if (this.nodes.length > 0) {
            // 查询所有子节点
            for (let i = 0; i < this.nodes.length; i++) {
                this.nodes[i].retrieve(bounds, returnObjects);
            }
        }

        // 添加当前节点的对象
        for (let i = 0; i < this.objects.length; i++) {
            if (this.intersects(bounds, this.objects[i].bounds)) {
                returnObjects.push(this.objects[i]);
            }
        }

        return returnObjects;
    }

    /**
     * 圆形范围查询
     */
    retrieveInRadius(x, y, radius, returnObjects = []) {
        // 创建包围矩形进行粗略查询
        const bounds = {
            x: x - radius,
            y: y - radius,
            width: radius * 2,
            height: radius * 2
        };

        const candidates = this.retrieve(bounds);
        const radiusSq = radius * radius;

        // 精确圆形检测
        for (const obj of candidates) {
            const dx = obj.bounds.x + obj.bounds.width / 2 - x;
            const dy = obj.bounds.y + obj.bounds.height / 2 - y;
            if (dx * dx + dy * dy <= radiusSq) {
                returnObjects.push(obj);
            }
        }

        return returnObjects;
    }

    /**
     * 获取最近邻居
     */
    findNearest(x, y, maxDistance = Infinity, excludeObj = null) {
        const candidates = this.retrieveInRadius(x, y, maxDistance);

        let nearest = null;
        let minDistSq = maxDistance * maxDistance;

        for (const obj of candidates) {
            if (obj === excludeObj) continue;

            const dx = obj.bounds.x + obj.bounds.width / 2 - x;
            const dy = obj.bounds.y + obj.bounds.height / 2 - y;
            const distSq = dx * dx + dy * dy;

            if (distSq < minDistSq) {
                minDistSq = distSq;
                nearest = obj;
            }
        }

        return nearest;
    }

    /**
     * 检查两个矩形是否相交
     */
    intersects(a, b) {
        return !(b.x > a.x + a.width ||
                 b.x + b.width < a.x ||
                 b.y > a.y + a.height ||
                 b.y + b.height < a.y);
    }

    /**
     * 获取所有对象（调试用）
     */
    getAllObjects(returnObjects = []) {
        for (const obj of this.objects) {
            returnObjects.push(obj);
        }

        for (const node of this.nodes) {
            if (node) {
                node.getAllObjects(returnObjects);
            }
        }

        return returnObjects;
    }

    /**
     * 绘制四叉树边界（调试）
     */
    draw(graphics) {
        graphics.lineStyle(1, 0x00ff00, 0.3);
        graphics.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);

        for (const node of this.nodes) {
            if (node) {
                node.draw(graphics);
            }
        }
    }

    /**
     * 获取统计信息
     */
    getStats() {
        return {
            ...this.stats,
            depth: this.level,
            bounds: this.bounds
        };
    }
}

/**
 * 用于游戏的SpatialPartitionManager
 */
class SpatialPartitionManager {
    constructor(scene) {
        this.scene = scene;

        // 创建四叉树覆盖整个游戏世界
        this.quadTree = new SpatialPartition({
            x: -1000,
            y: -1000,
            width: 3000,
            height: 3000
        }, 10, 6);

        // 所有被管理的对象
        this.managedObjects = new Map();

        // 更新频率
        this.updateInterval = 100; // 每100ms更新一次四叉树
        this.lastUpdate = 0;

        // 调试图形
        this.debugGraphics = null;
        this.debugEnabled = false;

        console.log('🌲 空间分割系统初始化');
    }

    /**
     * 注册对象到空间分割
     */
    registerObject(gameObject, id = null) {
        const objId = id || `obj_${Date.now()}_${Math.random()}`;

        const bounds = {
            x: gameObject.x - (gameObject.width || 32) / 2,
            y: gameObject.y - (gameObject.height || 32) / 2,
            width: gameObject.width || 32,
            height: gameObject.height || 32
        };

        const spatialObj = {
            id: objId,
            gameObject: gameObject,
            bounds: bounds,
            type: gameObject.getData?.('type') || 'unknown'
        };

        this.quadTree.insert(spatialObj);
        this.managedObjects.set(objId, spatialObj);

        return objId;
    }

    /**
     * 更新对象位置
     */
    updateObject(id) {
        const obj = this.managedObjects.get(id);
        if (!obj || !obj.gameObject.active) return;

        const go = obj.gameObject;
        const newBounds = {
            x: go.x - (go.width || 32) / 2,
            y: go.y - (go.height || 32) / 2,
            width: go.width || 32,
            height: go.height || 32
        };

        this.quadTree.update(obj, newBounds);
    }

    /**
     * 移除对象
     */
    removeObject(id) {
        const obj = this.managedObjects.get(id);
        if (obj) {
            this.quadTree.remove(obj);
            this.managedObjects.delete(id);
        }
    }

    /**
     * 获取范围内的敌人
     */
    getEnemiesInRange(x, y, radius, typeFilter = null) {
        const results = this.quadTree.retrieveInRadius(x, y, radius);

        return results.filter(obj => {
            if (!obj.gameObject.active) return false;
            if (typeFilter && obj.type !== typeFilter) return false;
            return obj.type === 'enemy' || obj.gameObject.getData?.('isEnemy');
        }).map(obj => obj.gameObject);
    }

    /**
     * 获取最近的敌人
     */
    getNearestEnemy(x, y, maxDistance = Infinity, excludeId = null) {
        const excludeObj = excludeId ? this.managedObjects.get(excludeId) : null;
        const result = this.quadTree.findNearest(x, y, maxDistance, excludeObj);

        return result && result.gameObject.active ? result.gameObject : null;
    }

    /**
     * 批量更新（按间隔）
     */
    update(time, delta) {
        if (time - this.lastUpdate < this.updateInterval) return;
        this.lastUpdate = time;

        // 重建四叉树
        this.rebuild();

        // 调试绘制
        if (this.debugEnabled) {
            this.drawDebug();
        }
    }

    /**
     * 重建四叉树
     */
    rebuild() {
        // 保存所有活跃对象
        const activeObjects = [];

        for (const [id, obj] of this.managedObjects) {
            if (obj.gameObject.active) {
                activeObjects.push(obj);
            }
        }

        // 清空并重建
        this.quadTree.clear();

        for (const obj of activeObjects) {
            this.updateObject(obj.id);
            this.quadTree.insert(obj);
        }
    }

    /**
     * 启用/禁用调试绘制
     */
    setDebug(enabled) {
        this.debugEnabled = enabled;

        if (enabled && !this.debugGraphics) {
            this.debugGraphics = this.scene.add.graphics();
            this.debugGraphics.setDepth(1000);
        } else if (!enabled && this.debugGraphics) {
            this.debugGraphics.destroy();
            this.debugGraphics = null;
        }
    }

    /**
     * 绘制调试信息
     */
    drawDebug() {
        if (!this.debugGraphics) return;

        this.debugGraphics.clear();
        this.quadTree.draw(this.debugGraphics);
    }

    /**
     * 获取统计信息
     */
    getStats() {
        return {
            ...this.quadTree.getStats(),
            managedObjects: this.managedObjects.size
        };
    }

    /**
     * 清理
     */
    destroy() {
        this.quadTree.clear();
        this.managedObjects.clear();

        if (this.debugGraphics) {
            this.debugGraphics.destroy();
        }

        console.log('🌲 空间分割系统已销毁');
    }
}
