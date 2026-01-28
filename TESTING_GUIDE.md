# Bug 修复验证测试指南

**版本**: v1.6.3
**日期**: 2026-01-26
**目的**: 验证NPC对话和雪山传送功能修复

---

## 快速测试步骤（5分钟）

### 测试1：小镇NPC对话 ✅

**前置条件**:
- 游戏已启动
- 玩家在小镇场景

**测试步骤**:
1. 按`WASD`键移动玩家到村长附近（位置约 400, 200）
2. 当看到"E 对话"提示时，按`E`键
3. 验证对话框是否出现
4. 按`ESC`或点击关闭对话框
5. 移动到商人附近（位置约 600, 200）
6. 按`E`键尝试对话

**预期结果**:
- ✅ 村长对话框正常显示
- ✅ 商人对话框正常显示
- ✅ 控制台输出："✅ 找到NPC: [name], 距离: [distance]px"

**失败标志**:
- ❌ 按E键无反应
- ❌ 控制台输出："❌ 没有找到附近的NPC"

---

### 测试2：雪山场景传送 ✅

**前置条件**:
- 玩家在小镇场景
- 已击败足够的敌人，可以自由移动

**测试步骤**:
1. 从小镇→森林（传送点位置：700, 300）
2. 从森林→雪山（传送点位置：700, 300）
3. 到达雪山后，观察玩家出生位置（应在 100, 300）
4. 移动到雪山→森林传送点（新位置：50, 300）
5. 等待3秒冷却时间
6. 站在传送点上，验证是否传回森林
7. 从森林再次前往雪山
8. 移动到雪山→火山传送点（新位置：750, 100）
9. 验证是否传送到火山洞穴

**预期结果**:
- ✅ 玩家出生在雪山(100, 300)，不在返回传送点上
- ✅ 可以正常返回森林
- ✅ 可以正常前往火山洞穴
- ✅ 控制台输出："✅ 玩家已离开传送区域，现在可以重新触发传送了"

**失败标志**:
- ❌ 站在传送点上无反应
- ❌ 控制台输出："⏸️ 玩家刚传送过来，暂时不触发..."

---

### 测试3：宝箱交互 ✅

**前置条件**:
- 玩家在小镇场景

**测试步骤**:
1. 移动到宝箱附近（位置约 200, 400 或 600, 450）
2. 按`E`键尝试打开宝箱

**预期结果**:
- ✅ 宝箱打开，获得奖励
- ✅ 控制台输出："✅ 找到宝箱，距离: [distance]px"

**失败标志**:
- ❌ 按E键无反应

---

## 浏览器控制台调试技巧

### 1. 查看NPC对象
```javascript
// 在控制台执行，查看所有NPC
game.scene.scenes[0].children.list.forEach(child => {
    if (child.getData && child.getData('type') === 'npc') {
        console.log('NPC:', child.getData('name'), 'at', child.x, child.y);
    }
});
```

**预期输出**:
```
NPC: 村长 at 400 200
NPC: 商人 at 600 200
```

### 2. 查看传送点信息
```javascript
// 查看当前场景信息
console.log(game.scene.scenes[0].sceneManager.getSceneInfo());
```

**预期输出**:
```
{
    currentScene: "town",
    playerPosition: {x: 400, y: 300},
    spawnPoint: {x: 400, y: 300},
    isTransitioning: false,
    recentlyTeleported: false,
    activeTeleportsCount: 1
}
```

### 3. 手动触发交互
```javascript
// 测试NPC交互
game.scene.scenes[0].handleInteraction();
```

### 4. 手动触发场景切换
```javascript
// 测试传送功能
game.scene.scenes[0].sceneManager.switchScene('snow_mountain', { x: 100, y: 300 });
```

---

## 常见问题排查

### Q1: 按E键没反应，控制台提示"找不到NPC"

**可能原因**:
1. 距离太远：移动到NPC 100px 范围内
2. NPC对象未创建：检查控制台是否有"👤 创建NPC"日志
3. NPC数据未设置：执行上面的调试脚本1查看NPC对象

**解决方案**:
```javascript
// 查看玩家与NPC的距离
const player = game.scene.scenes[0].player;
game.scene.scenes[0].children.list.forEach(child => {
    if (child.getData && child.getData('type') === 'npc') {
        const distance = Phaser.Math.Distance.Between(
            player.x, player.y,
            child.x, child.y
        );
        console.log(child.getData('name'), '距离:', distance);
    }
});
```

### Q2: 雪山传送点无法触发

**可能原因**:
1. 传送冷却中：等待3秒
2. 刚传送过来：离开传送区域再回来
3. 场景切换中：等待切换完成

**解决方案**:
```javascript
// 查看传送状态
const sm = game.scene.scenes[0].sceneManager;
console.log('recentlyTeleported:', sm.recentlyTeleported);
console.log('isTransitioning:', sm.isTransitioning);
console.log('lastTeleportTime:', sm.lastTeleportTime);
console.log('activeTeleports:', sm.activeTeleports.length);
```

### Q3: 控制台没有日志输出

**可能原因**:
1. 浏览器控制台未打开
2. 日志级别设置过高

**解决方案**:
- 按`F12`打开浏览器开发者工具
- 切换到"Console"标签
- 确保没有过滤器屏蔽日志

---

## 性能验证

### FPS监控
```javascript
// 在控制台执行，实时监控FPS
setInterval(() => {
    console.log('FPS:', game.loop.actualFps);
}, 1000);
```

**预期结果**:
- 小镇场景：58-60 FPS
- 森林场景：55-60 FPS
- 雪山场景：55-60 FPS（有雪花效果）
- 火山洞穴：55-60 FPS

---

## 测试结果记录表

| 测试项 | 状态 | 备注 |
|--------|------|------|
| 小镇NPC对话（村长） | ☐ 通过 / ☐ 失败 | 距离: ___px |
| 小镇NPC对话（商人） | ☐ 通过 / ☐ 失败 | 距离: ___px |
| 宝箱打开 | ☐ 通过 / ☐ 失败 | 距离: ___px |
| 森林→雪山传送 | ☐ 通过 / ☐ 失败 | 出生点: (___, ___) |
| 雪山→森林传送 | ☐ 通过 / ☐ 失败 | 冷却时间: ___s |
| 雪山→火山传送 | ☐ 通过 / ☐ 失败 | 冷却时间: ___s |
| 火山→雪山传送 | ☐ 通过 / ☐ 失败 | 冷却时间: ___s |

---

## 修复验证清单

- [ ] 小镇场景下按E键能与村长对话
- [ ] 小镇场景下按E键能与商人对话
- [ ] 小镇场景下按E键能打开宝箱
- [ ] 雪山场景下能通过传送点返回森林
- [ ] 雪山场景下能通过传送点前往火山洞穴
- [ ] 火山洞穴场景下能通过传送点返回雪山
- [ ] 控制台输出正确的调试信息
- [ ] 游戏FPS保持在55-60之间

**全部通过** → ✅ 修复成功
**部分失败** → → 查看常见问题排查或提交Bug报告

---

## Bug报告模板

如果测试失败，请提供以下信息：

**问题描述**:
_简要描述遇到的问题_

**复现步骤**:
1. _步骤1_
2. _步骤2_
3. _步骤3_

**预期结果**:
_应该发生什么_

**实际结果**:
_实际发生了什么_

**控制台日志**:
```
_paste console output here_
```

**浏览器信息**:
- 浏览器: ___
- 版本: ___

**截图/录屏**:
_如果可能，提供截图或录屏_

---

**测试完成日期**: ___________
**测试人员**: ___________
**测试结果**: ☐ 全部通过  ☐ 部分失败  ☐ 严重失败
