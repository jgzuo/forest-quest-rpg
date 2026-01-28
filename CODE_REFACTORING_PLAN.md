# GameScene.js 代码重构计划

**文件**: src/scenes/GameScene.js
**当前行数**: 3018 行
**目标行数**: ~500 行
**重构日期**: 2026-01-27

---

## 🎯 重构目标

将 GameScene.js (3018 行) 拆分为多个专注的模块，每个文件职责单一。

---

## 📊 当前结构分析

### 主要功能模块（识别到）：

1. **初始化系统** (~200 行)
   - 各种 Manager 的初始化
   - DOM 元素缓存
   - 统计追踪

2. **场景管理** (~100 行)
   - switchScene
   - 场景切换逻辑

3. **玩家控制** (~400 行)
   - 键盘输入处理
   - createCursors
   - handlePlayerMovement

4. **战斗系统** (~600 行)
   - spawnEnemiesInForest/Cave/Snow
   - createEnemy
   - attackEnemy
   - damageEnemy
   - showDamageNumber

5. **交互系统** (~200 行)
   - handleInteraction
   - NPC 对话
   - 宝箱开启

6. **UI 管理** (~500 行)
   - 更新 UI (level, HP, XP, gold)
   - 技能栏
   - 任务日志
   - 各种 UI 元素

7. **对象池系统** (~300 行)
   - ObjectPool 使用
   - 粒子复用

8. **数据管理** (~400 行)
   - 存档系统
   - 加载系统
   - 统计系统

9. **音频系统** (~100 行)
   - 音效播放
   - 音乐切换

10. **其他系统** (~200 行)
    - 成就系统
    - 任务系统
    - 商店系统

---

## 🏗️ 重构方案

### 方案 A: 按功能模块拆分（推荐）

```
src/
├── scenes/
│   └── GameScene.js (~500 行) ✅ 主场景协调器
├── systems/
│   ├── CombatSystem.js (~600 行) ✅ 战斗系统
│   ├── PlayerController.js (~400 行) ✅ 玩家控制
│   ├── InteractionManager.js (~200 行) ✅ 交互管理
│   └── ObjectPoolManager.js (~300 行) ✅ 对象池（已有）
└── ui/
    ├── GameUI.js (~500 行) ✅ UI 管理（新建）
    └── HUDController.js (~300 行) ✅ HUD 控制（新建）
```

### 方案 B: 按层次拆分

```
src/
├── core/
│   ├── GameLoop.js (~200 行) 游戏主循环
│   └── GameState.js (~150 行) 游戏状态
├── systems/
│   ├── CombatSystem.js
│   ├── MovementSystem.js
│   └── InteractionSystem.js
└── managers/
    └── (保持现有 managers)
```

---

## 🚀 实施步骤

### 第一阶段：创建模块结构 (1 小时)

1. 创建 CombatSystem.js
2. 创建 PlayerController.js  
3. 创建 InteractionManager.js
4. 创建 GameUI.js

### 第二阶段：迁移代码 (2 小时)

5. 迁移战斗相关代码到 CombatSystem.js
6. 迁移玩家控制代码到 PlayerController.js
7. 迁移交互代码到 InteractionManager.js
8. 迁移 UI 代码到 GameUI.js

### 第三阶段：重构 GameScene (1 小时)

9. GameScene.js 改为协调器角色
10. 删除已迁移的代码
11. 使用新模块

### 第四阶段：测试验证 (30 分钟)

12. 功能测试
13. 性能测试
14. 修复问题

**总计**: 4-5 小时

---

## 📝 详细拆分清单

### CombatSystem.js (战斗系统)

**包含方法**:
- spawnEnemiesInForest()
- spawnEnemiesInCave()
- spawnEnemiesInSnowMountain()
- spawnEnemiesInVolcanicCavern()
- createEnemy(x, y, type)
- attackEnemy(enemy)
- damageEnemy(enemy, damage)
- showDamageNumber(x, y, damage, isCrit)
- checkAttackCollision(attacker, target)

**属性**:
- scene (引用)
- enemies (数组)

---

### PlayerController.js (玩家控制)

**包含方法**:
- createCursors()
- handlePlayerMovement()
- getPlayerSpeed()
- canMoveTo(x, y)

**属性**:
- cursors (Phaser.CursorKeys)
- wasd (对象)
- playerSpeed (数字)

---

### InteractionManager.js (交互管理)

**包含方法**:
- handleInteraction()
- talkToNPC(npc)
- openChest(chest)
- createChest(x, y)

**属性**:
- scene (引用)
- interactionDistance (数字)

---

### GameUI.js (游戏 UI)

**包含方法**:
- updateUI()
- updateLevelText()
- updateHPBar()
- updateXPBar()
- updateGoldText()
- createSkillBar()
- updateSkillBar()

**属性**:
- scene (引用)
- cachedDOMElements (对象)

---

## ⚠️ 风险评估

**高风险**:
- 代码迁移可能遗漏功能
- 模块间通信可能复杂
- 需要大量测试

**缓解措施**:
- 逐步迁移，每次迁移一个模块
- 每次迁移后立即测试
- 保留原始代码作为备份
- 使用 Git 版本控制

---

## 📊 预期效果

| 指标 | 重构前 | 重构后 | 改进 |
|------|--------|--------|------|
| GameScene.js 行数 | 3018 | ~500 | -83% |
| 文件数量 | 1 | 5 | +400% |
| 可维护性 | 低 | 高 | ⭐⭐⭐⭐⭐ |
| 可测试性 | 低 | 高 | ⭐⭐⭐⭐ |
| 代码复用性 | 低 | 高 | ⭐⭐⭐⭐ |

---

*计划生成时间: 2026-01-27 22:15*
