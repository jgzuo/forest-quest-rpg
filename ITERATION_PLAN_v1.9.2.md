# Forest Quest RPG - 迭代规划 v1.9.2

**日期**: 2026-01-27
**版本**: v1.9.1 → v1.9.2
**方法**: Ralph Methodology (Diagnose → Minimize → Verify → Document)

---

## 📊 当前游戏状态分析

### 已完成的功能 (v1.9.1)

**核心系统**:
- ✅ 玩家控制（移动、攻击、技能）
- ✅ 敌人系统（鼹鼠、树妖、史莱姆、蝙蝠）
- ✅ Boss系统（树妖王、雪怪王、龙王）
- ✅ 战斗系统（CombatSystem 430行）
- ✅ 技能系统（旋风斩、冲锋、治疗之光、终极技能）
- ✅ 状态效果系统（中毒、燃烧、冰冻、减速、眩晕、击退）
- ✅ 连击系统（ComboSystem）
- ✅ 伤害类型系统（物理、火焰、冰霜、魔法）

**场景系统**:
- ✅ 5个场景（小镇、森林、洞穴、雪山、火山洞穴）
- ✅ 场景装饰（洞穴40个装饰物，已优化）
- ✅ 传送系统（8个传送点，已修复对称性）

**装备系统** (部分实现):
- ✅ 装备数据定义（30+件装备）
- ✅ 装备UI（Inventory.js 640行）
- ⚠️ 装备效果未完全应用

---

## 🔍 诊断 (Diagnose)

### 发现的问题

#### 问题 1: 暴击伤害系统不完整 ⭐ **高优先级**

**当前状态** (CombatSystem.js line 131-136):
```javascript
// 检查暴击
const critChance = player.getData('critChance') || 0.1;
const isCrit = Math.random() < critChance;
if (isCrit) {
    damage = Math.floor(damage * 1.5);  // ❌ 固定1.5倍
}
```

**问题**:
- ❌ 暴击伤害固定为1.5倍，未使用装备的critDamage属性
- ❌ 装备数据定义了critDamage（0.50-1.00），但未生效
- ❌ 玩家装备高级武器后，暴击伤害没有提升

**影响**:
- 降低了装备系统的深度
- 削弱了装备升级的动力
- 战斗数值成长感不足

**装备数据中的critDamage** (EquipmentData.js):
```javascript
dragon_slayer_sword: {
    stats: {
        attack: 100,
        critChance: 0.20,
        critDamage: 0.50  // ❌ 未使用
    }
}

eternal_blade: {
    stats: {
        attack: 150,
        critChance: 0.25,
        critDamage: 1.00  // ❌ 未使用（应该是2.0倍暴击）
    }
}
```

#### 问题 2: UI显示不完整

**缺失的UI元素**:
- ❌ 未显示暴击率（critChance）
- ❌ 未显示暴击伤害（critDamage）
- ❌ 未显示金币数量（DEVELOPMENT_TODO.md line 93）
- ❌ 敌人血条未显示（DEVELOPMENT_TODO.md line 86）

#### 问题 3: 未使用资产

**forest-objects.png** (384x240像素):
- ❌ 未加载到BootScene.js
- ❌ 未在场景中使用
- 可能包含额外的森林装饰物

---

## 🎯 迭代目标

### 主要目标
**完善暴击系统** - 让装备的暴击属性生效

### 次要目标
- 优化UI显示（暴击率、暴击伤害）
- 添加金币显示
- 敌人血条显示

---

## 📋 任务清单 (按Ralph方法论)

### Task 1: 完善暴击伤害计算 ⭐ **核心任务**

#### 1.1 Diagnose（诊断）

**问题描述**:
- 当前暴击伤害固定为1.5倍
- 装备的critDamage属性未被应用
- 玩家无法通过装备提升暴击伤害

**影响范围**:
- `src/systems/CombatSystem.js` (hitEnemy方法)
- 所有暴击相关计算

**期望行为**:
```javascript
// 基础暴击倍率: 1.5倍
// 装备加成: critDamage (0.0-1.0)
// 最终倍率: 1.5 + critDamage

// 示例:
// 无装备: 1.5倍
// 王者之剑 (critDamage: 0.25): 1.75倍
// 屠龙剑 (critDamage: 0.50): 2.0倍
// 永恒之剑 (critDamage: 1.00): 2.5倍
```

#### 1.2 Minimize（最小化改动）

**改动文件**: 1个
- `src/systems/CombatSystem.js` (hitEnemy方法)

**改动量**: ~5行代码

**实现方案**:
```javascript
// 修改前 (line 131-136):
const critChance = player.getData('critChance') || 0.1;
const isCrit = Math.random() < critChance;
if (isCrit) {
    damage = Math.floor(damage * 1.5);
}

// 修改后:
const critChance = player.getData('critChance') || 0.1;
const critDamage = player.getData('critDamage') || 0;
const isCrit = Math.random() < critChance;
if (isCrit) {
    const critMultiplier = 1.5 + critDamage;  // 基础1.5倍 + 装备加成
    damage = Math.floor(damage * critMultiplier);
}
```

#### 1.3 Verify（验证）

**验证方法**:
1. 在浏览器中打开游戏
2. 使用控制台命令测试：
```javascript
// 测试基础暴击
game.scene.player.setData('critChance', 1.0);  // 100%暴击
game.scene.player.setData('critDamage', 0);    // 无加成
// 攻击敌人，验证暴击伤害为 基础伤害 × 1.5

// 测试装备暴击加成
game.scene.player.setData('critDamage', 0.5);  // 屠龙剑
// 攻击敌人，验证暴击伤害为 基础伤害 × 2.0
```

3. 测试装备系统：
```javascript
// 装备王者之剑
game.scene.equipmentManager.equip('excalibur');
// 攻击敌人，验证暴击伤害提升
```

#### 1.4 Document（文档）

**更新内容**:
- CHANGELOG.md - 添加v1.9.2变更记录
- 代码注释 - 解释暴击伤害计算公式

---

### Task 2: 优化暴击UI显示

#### 2.1 Diagnose

**问题**:
- 玩家无法看到自己的暴击率和暴击伤害
- 无法评估装备的价值

**当前UI** (src/scenes/GameScene.js):
- 显示: 等级、HP、MP、XP、攻击力
- 缺失: 暴击率、暴击伤害

#### 2.2 Minimize

**改动文件**: 1个
- `src/scenes/GameScene.js` (updateUI方法)

**改动量**: ~10行代码

**实现方案**:
```javascript
// 在状态面板中添加
updateUI() {
    // ... 现有代码 ...

    // 新增: 显示暴击信息
    const critChance = this.player.getData('critChance') || 0;
    const critDamage = this.player.getData('critDamage') || 0;
    const critMultiplier = (1.5 + critDamage).toFixed(1);

    this.critText.setText(`暴击: ${(critChance * 100).toFixed(0)}% (${critMultiplier}x)`);
}
```

#### 2.3 Verify

- [ ] 检查UI是否正确显示暴击率
- [ ] 检查UI是否正确显示暴击倍率
- [ ] 更换装备后UI是否实时更新

#### 2.4 Document

- 更新CHANGELOG.md
- 截图记录UI改进

---

### Task 3: 添加金币显示

#### 3.1 Diagnose

**问题**:
- 玩家金币数据存在但未显示
- 无法确认金币获取

**当前状态**:
- `player.gold` 数据存在
- UI未显示（DEVELOPMENT_TODO.md line 93标记为未完成）

#### 3.2 Minimize

**改动文件**: 1个
- `src/scenes/GameScene.js` (create方法，updateUI方法)

**改动量**: ~15行代码

**实现方案**:
```javascript
// 在create()中添加金币文本
this.goldText = this.add.text(750, 20, '💰 0', {
    font: 'bold 16px Arial',
    fill: '#ffd700',
    stroke: '#000000',
    strokeThickness: 3
}).setOrigin(1, 0.5);

// 在updateUI()中更新
this.goldText.setText(`💰 ${this.player.gold}`);
```

#### 3.3 Verify

- [ ] 击杀敌人后金币增加
- [ ] UI正确显示金币数量
- [ ] 购买物品后金币减少

#### 3.4 Document

- 更新CHANGELOG.md
- 更新DEVELOPMENT_TODO.md（标记为已完成）

---

### Task 4: 加载并使用forest-objects.png（可选）

#### 4.1 Diagnose

**问题**:
- forest-objects.png未被使用
- 可能包含额外的森林装饰

**文件信息**:
- 尺寸: 384x240像素
- 路径: assets/environments/forest-objects.png
- 状态: 未加载，未使用

#### 4.2 Minimize

**改动文件**:
- `src/scenes/BootScene.js` (添加加载)
- `src/utils/SceneManager.js` (添加使用)

**风险**:
- ⚠️ 需要先分析图集内容
- ⚠️ 可能需要切分精灵图
- ⚠️ 优先级较低

**建议**: 本次迭代暂不实现，作为后续优化方向

---

## 🎯 实施计划

### Phase 1: 核心功能（必需）

| 任务 | 优先级 | 预计时间 | 状态 |
|------|--------|----------|------|
| Task 1: 完善暴击伤害计算 | 🔴 高 | 15分钟 | 待开始 |
| Task 2: 优化暴击UI显示 | 🟡 中 | 20分钟 | 待开始 |
| Task 3: 添加金币显示 | 🟢 低 | 15分钟 | 待开始 |

### Phase 2: 后续优化（可选）

| 任务 | 优先级 | 预计时间 | 状态 |
|------|--------|----------|------|
| Task 4: 使用forest-objects.png | 🟢 低 | 30分钟 | 待规划 |
| 敌人血条显示 | 🟡 中 | 25分钟 | 待规划 |

---

## 📊 成功指标

### 定量指标

| 指标 | 目标 | 验证方法 |
|------|------|----------|
| 暴击伤害计算 | 使用critDamage属性 | 代码审查 + 游戏内测试 |
| 暴击UI显示 | 显示暴击率和暴击倍率 | 截图验证 |
| 金币UI显示 | 显示金币数量 | 截图验证 |
| 代码改动量 | <50行 | Git diff |

### 定性指标

- ✅ 装备系统深度提升（暴击属性生效）
- ✅ 战斗数值成长感增强
- ✅ UI信息完整性提升
- ✅ 玩家体验改善

---

## ⏱️ 时间估算

| 阶段 | 任务 | 预计时间 |
|------|------|----------|
| Phase 1 | Task 1: 暴击伤害计算 | 15分钟 |
| Phase 1 | Task 2: 暴击UI显示 | 20分钟 |
| Phase 1 | Task 3: 金币UI显示 | 15分钟 |
| Phase 1 | 文档更新 | 10分钟 |
| **总计** | | **60分钟** |

---

## 🔄 回滚计划

如果出现问题，回滚步骤：
1. 恢复 `src/systems/CombatSystem.js` 到修改前版本
2. 恢复 `src/scenes/GameScene.js` 到修改前版本
3. 恢复 `CHANGELOG.md` 到修改前版本
4. 运行游戏验证回滚成功

---

## 📝 参考资料

**相关文件**:
- `src/systems/CombatSystem.js` - 战斗系统（暴击计算）
- `src/data/EquipmentData.js` - 装备数据（critDamage属性）
- `src/scenes/GameScene.js` - UI系统
- `docs/DEVELOPMENT_TODO.md` - 开发TODO清单

**设计原则**:
- Ralph方法论: Diagnose → Minimize → Verify → Document
- 最小改动原则: <50行代码
- 向后兼容: 不破坏现有功能

---

*规划创建时间: 2026-01-27 00:20*
*预计完成时间: 2026-01-27 01:30*
*状态: 待执行*
