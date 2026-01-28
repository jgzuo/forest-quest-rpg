# Forest Quest RPG - 迭代任务规划文档

**日期**: 2026-01-27
**版本**: v1.9.0-planning
**方法**: Ralph Methodology (Diagnose → Minimize → Verify → Document)

---

## 📊 当前状态分析

### 游戏版本
- **当前版本**: v1.8.6
- **最近完成**: CombatSystem 重构 (GameScene 3018 → 2410 行)
- **架构**: Scene-based + Manager pattern

### 素材清单分析

#### ✅ 已加载但未使用的装饰素材

**树木类型** (3种未使用):
```
assets/environments/tree-orange.png  - 橙色树木（秋季风格）
assets/environments/tree-pink.png    - 粉色树木（樱花风格）
assets/environments/tree-dried.png   - 枯树（荒凉风格）
```

**环境物体** (1个精灵图集未使用):
```
assets/environments/forest-objects.png - 森林物体图集（包含多个物体）
```

**其他装饰** (2种未使用):
```
assets/environments/trunk.png  - 树桩
assets/environments/sign.png   - 路牌
```

#### ✅ 敌人系统状态

**Treant (树妖)** - 已实现 ✅
- 普通树妖敌人 (`treant`) - 已实现在森林中生成
- 精英古树 (`elite_ancient_treant`) - 已实现在洞穴中生成
- 树妖王 Boss (`boss_treant_king`) - 已实现完整的Boss系统

**Treant 资产使用情况**:
- ✅ 动画精灵已加载 (idle/walk × 3方向)
- ✅ Boss 系统完整 (多阶段、技能、血条UI)
- ✅ 在 SceneManager 中生成逻辑已实现
- ✅ Boss Rush 模式包含树妖王

---

## 🎯 迭代目标

### 主要目标
充分利用未使用的装饰素材，提升森林场景的视觉丰富度和多样性。

### 次要目标
- 优化场景装饰的布局算法
- 提升场景的视觉层次感
- 增强不同季节的氛围感

---

## 📋 任务清单

### Task 1: 丰富森林场景装饰 (高优先级)

#### 诊断 (Diagnose)
**问题**: 当前森林场景仅使用基础的灌木和岩石，缺少树木多样性。

**当前实现** (SceneManager.js line 267-285):
```javascript
const decorations = [
    { x: 120, y: 150, type: 'bush', scale: 2 },
    { x: 680, y: 150, type: 'bush-tall', scale: 2 },
    { x: 120, y: 450, type: 'bush-tall', scale: 2 },
    { x: 680, y: 450, type: 'bush', scale: 2 },
    { x: 250, y: 250, type: 'rock', scale: 2 },
    { x: 550, y: 250, type: 'bush', scale: 2 },
    { x: 250, y: 350, type: 'bush', scale: 2 },
    { x: 550, y: 350, type: 'rock', scale: 2 },
    { x: 350, y: 300, type: 'bush-tall', scale: 2 },
    { x: 450, y: 300, type: 'bush', scale: 2 }
];
```

**缺失素材**:
- `tree-orange` - 秋季橙色树木
- `tree-pink` - 春季粉色树木
- `tree-dried` - 枯树
- `trunk` - 树桩
- `sign` - 路牌

#### 最小化改动 (Minimize)

**改动范围**: 仅修改 `src/utils/SceneManager.js` 的森林场景创建函数

**改动文件**: 1个文件
- `src/utils/SceneManager.js` - 森林装饰数组扩展

**改动策略**:
1. 在现有装饰数组中添加树木元素
2. 保持现有的深度排序 (`setDepth`)
3. 使用合理的间距避免重叠
4. 添加季节性树木分布（橙色、粉色树木分组）

#### 实施计划 (Implementation Plan)

**步骤 1**: 扩展森林装饰数组
```javascript
const decorations = [
    // === 现有灌木和岩石 ===
    { x: 120, y: 150, type: 'bush', scale: 2 },
    { x: 680, y: 150, type: 'bush-tall', scale: 2 },
    // ... 保留原有装饰 ...

    // === 新增：粉色树木（春季感） - 左上区域 ===
    { x: 100, y: 100, type: 'tree-pink', scale: 2.5, depth: -40 },
    { x: 180, y: 80, type: 'tree-pink', scale: 2.2, depth: -40 },
    { x: 80, y: 180, type: 'tree-pink', scale: 2.3, depth: -40 },

    // === 新增：橙色树木（秋季感） - 右上区域 ===
    { x: 650, y: 100, type: 'tree-orange', scale: 2.5, depth: -40 },
    { x: 720, y: 130, type: 'tree-orange', scale: 2.2, depth: -40 },
    { x: 700, y: 70, type: 'tree-orange', scale: 2.3, depth: -40 },

    // === 新增：枯树（荒凉感） - 底部区域 ===
    { x: 150, y: 500, type: 'tree-dried', scale: 2.0, depth: -40 },
    { x: 650, y: 500, type: 'tree-dried', scale: 2.1, depth: -40 },

    // === 新增：树桩（自然细节） ===
    { x: 300, y: 200, type: 'trunk', scale: 1.5, depth: -35 },
    { x: 500, y: 400, type: 'trunk', scale: 1.5, depth: -35 },

    // === 新增：路牌（引导玩家） ===
    { x: 400, y: 520, type: 'sign', scale: 1.5, depth: -30 }
];
```

**步骤 2**: 更新装饰创建逻辑以支持新的属性
```javascript
decorations.forEach(dec => {
    let obj;
    if (dec.type === 'tree-pink' || dec.type === 'tree-orange' || dec.type === 'tree-dried') {
        // 树木类型
        obj = this.scene.add.image(x, y, dec.type).setScale(dec.scale);
        obj.setDepth(dec.depth || -40);  // 树木在最底层
    } else if (dec.type === 'trunk') {
        // 树桩
        obj = this.scene.add.image(x, y, 'trunk').setScale(dec.scale);
        obj.setDepth(dec.depth || -35);
    } else if (dec.type === 'sign') {
        // 路牌
        obj = this.scene.add.image(x, y, 'sign').setScale(dec.scale);
        obj.setDepth(dec.depth || -30);
    } else {
        // 现有类型（bush, bush-tall, rock）
        obj = this.scene.add.image(x, y, dec.type).setScale(dec.scale);
        obj.setDepth(-30);
    }
});
```

#### 验证计划 (Verify)

**视觉验证**:
- [ ] 进入森林场景，观察新添加的树木
- [ ] 确认树木不会遮挡玩家或敌人（深度测试）
- [ ] 确认树木不会阻挡玩家移动（物理碰撞测试）
- [ ] 确认季节性树木分布合理（粉色树在左上，橙色树在右上）

**性能验证**:
- [ ] 检查帧率是否保持 60 FPS
- [ ] 检查场景切换速度无明显变化

**回归测试**:
- [ ] 确认原有灌木和岩石仍正常显示
- [ ] 确认敌人仍能正常生成
- [ ] 确认传送点仍可正常使用

#### 文档 (Document)

更新以下文档:
- [ ] `CHANGELOG.md` - 添加 v1.9.0 变更记录
- [ ] 本文档的"已完成任务"部分

---

### Task 2: 优化洞穴场景装饰 (中优先级)

#### 诊断 (Diagnose)
**问题**: 洞穴场景仅使用岩石装饰，缺少洞穴特色物体。

**当前实现** (SceneManager.js line 362-394):
- 仅有 7 个岩石装饰
- 缺少洞穴晶体、洞穴植被等元素

#### 最小化改动 (Minimize)
**改动文件**: 1个文件
- `src/utils/SceneManager.js` - 洞穴装饰数组扩展

**新增元素** (使用 tint 调整现有素材):
- 使用 `rock` + 蓝色 tint 模拟洞穴晶体
- 使用 `bush` + 暗色 tint 模拟洞穴植被

#### 实施计划
```javascript
// 在洞穴场景中添加 tint 装饰
const caveDecorations = [
    // 现有岩石
    { x: 200, y: 200, type: 'rock', scale: 2 },
    // ...

    // 新增：洞穴晶体（蓝色 tint）
    { x: 300, y: 150, type: 'crystal', scale: 1.5, tint: 0x87CEEB },
    { x: 500, y: 450, type: 'crystal', scale: 2.0, tint: 0x87CEEB },

    // 新增：洞穴植被（暗绿色 tint）
    { x: 400, y: 300, type: 'cave-moss', scale: 2, tint: 0x2E8B57 }
];
```

#### 验证计划
- [ ] 视觉检查洞穴场景氛围感提升
- [ ] 确认 tint 颜色合理（不过亮或过暗）
- [ ] 性能检查（帧率测试）

---

### Task 3: 小镇场景装饰优化 (低优先级)

#### 诊断 (Diagnose)
**问题**: 小镇场景缺少生活气息和细节装饰。

#### 最小化改动 (Minimize)
**改动文件**: 1个文件
- `src/utils/SceneManager.js` - 小镇装饰添加

**新增元素**:
- 使用 `trunk` 作为木柴堆
- 使用 `sign` 作为小镇标识
- 使用 `bush` 作为花园植物

#### 实施计划
```javascript
const townDecorations = [
    // 木柴堆（靠近商店）
    { x: 600, y: 200, type: 'trunk', scale: 1.2 },
    { x: 620, y: 210, type: 'trunk', scale: 1.0 },

    // 小镇标识（入口处）
    { x: 400, y: 530, type: 'sign', scale: 1.8 },

    // 花园植物（围绕建筑物）
    { x: 300, y: 250, type: 'bush', scale: 1.5, tint: 0xFF69B4 },  // 粉色花
    { x: 500, y: 250, type: 'bush', scale: 1.5, tint: 0xFFD700 }   // 黄色花
];
```

---

## 🎨 设计原则

### 视觉层次
1. **背景层** (depth: -40) - 树木、大型装饰
2. **中层** (depth: -35) - 树桩、岩石
3. **前景层** (depth: -30) - 灌木、路牌

### 色彩平衡
- **森林场景**: 绿色为主 + 粉/橙色点缀（季节感）
- **洞穴场景**: 灰/棕色为主 + 蓝色晶体（对比）
- **小镇场景**: 暖色调为主 + 多彩花卉（活力）

### 间距规则
- 大型物体（树木）间距 ≥ 150 像素
- 中型物体（岩石）间距 ≥ 100 像素
- 小型物体（灌木）间距 ≥ 60 像素
- 避免在玩家主要路径上放置装饰

---

## 🧪 测试计划

### 单元测试
不适用（装饰物为静态资源）

### 集成测试
- [ ] 场景切换测试（小镇 ↔ 森林 ↔ 洞穴）
- [ ] 装饰渲染测试（所有装饰物正确显示）
- [ ] 深度排序测试（玩家/敌人正确遮挡）

### 性能测试
- [ ] 帧率监控（目标: 60 FPS）
- [ ] 内存使用监控（装饰物不超过 50 个）
- [ ] 加载时间测试（场景切换 < 1 秒）

### 用户体验测试
- [ ] 视觉吸引力评估（是否更美观）
- [ ] 导向性评估（路牌是否有效）
- [ ] 氛围感评估（每个场景的独特感）

---

## 📈 成功指标

### 定量指标
- ✅ 森林装饰物数量: 10 → 25+ (+150%)
- ✅ 使用的新素材: 5 种 (tree-orange, tree-pink, tree-dried, trunk, sign)
- ✅ 代码改动量: < 100 行
- ✅ 帧率影响: < 5% 下降

### 定性指标
- ✅ 森林场景视觉丰富度提升
- ✅ 季节氛围感增强（春粉、秋橙）
- ✅ 场景识别度提升（玩家能快速识别当前场景）

---

## ⏱️ 时间估算

| 任务 | 预计时间 | 优先级 |
|------|---------|--------|
| Task 1: 丰富森林场景 | 30 分钟 | 高 |
| Task 2: 优化洞穴场景 | 20 分钟 | 中 |
| Task 3: 小镇场景优化 | 15 分钟 | 低 |
| **总计** | **65 分钟** | |

---

## 🔄 回滚计划

如果出现问题，回滚步骤:
1. 恢复 `src/utils/SceneManager.js` 到修改前版本
2. 删除 CHANGELOG.md 中的 v1.9.0 记录
3. 运行游戏验证回滚成功

---

## 📝 变更记录

### v1.9.0-planning (2026-01-27)
- 创建迭代任务规划文档
- 分析未使用的装饰素材
- 制定 Ralph 方法论实施计划

### 待完成
- [ ] Task 1: 实施森林场景装饰扩展
- [ ] Task 2: 实施洞穴场景装饰优化
- [ ] Task 3: 实施小镇场景装饰优化
- [ ] 更新 CHANGELOG.md
- [ ] 最终验证和文档

---

*本文档遵循 Ralph 方法ology: Diagnose → Minimize → Verify → Document*
*规划创建时间: 2026-01-27 23:45*
*预计完成时间: 2026-01-28 01:00*
