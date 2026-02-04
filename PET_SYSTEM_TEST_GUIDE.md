# 🐾 宠物系统测试指南

## ✅ 集成完成

宠物系统已成功集成到 Forest Quest RPG！

**新增文件**:
- `src/entities/Pet.js` (350行) - 宠物实体
- `src/ui/PetUI.js` (200行) - 宠物UI界面

**修改文件**:
- `src/scenes/GameScene.js` - 添加宠物系统初始化和更新
- `src/utils/AudioManager.js` - 添加宠物音效
- `index.html` - 添加脚本引用

---

## 🎮 测试步骤

### 1. 启动游戏

```bash
cd /Users/zuojg/Downloads/AI/Code/forest-quest-rpg
npx live-server --port=8080 --open=/index.html
```

或使用 Python:
```bash
python3 -m http.server 8080
```

### 2. 测试清单

#### ✅ 宠物跟随
- [ ] 游戏启动后，宠物出现在玩家旁边
- [ ] 宠物跟随玩家移动
- [ ] 宠物保持在约60像素的距离

#### ✅ 宠物战斗
- [ ] 靠近敌人时，宠物自动发射魔法弹
- [ ] 魔法弹造成10点伤害
- [ ] 伤害数字显示为青色(#00ffff)
- [ ] 攻击冷却约2秒

#### ✅ 宠物辅助
- [ ] 每10秒宠物为玩家回血5点
- [ ] 回血时显示绿色光环特效
- [ ] 回血数字显示为绿色

#### ✅ 宠物收集
- [ ] 宠物自动收集附近的金币
- [ ] 宠物自动收集附近的宝石
- [ ] 收集范围约100像素

#### ✅ 宠物升级
- [ ] 宠物攻击敌人获得10经验
- [ ] 经验满100时升级
- [ ] 升级时显示黄色光环特效
- [ ] 升级后属性提升（伤害、回血、范围）
- [ ] 显示"宠物升级！"消息

#### ✅ 宠物UI
- [ ] 按O键显示/隐藏宠物UI
- [ ] UI显示正确的等级和经验
- [ ] UI显示正确的属性值
- [ ] 经验条正确显示进度

#### ✅ 宠物音效
- [ ] 攻击时播放魔法音效
- [ ] 升级时播放升级音效

---

## 🎯 快捷键

| 按键 | 功能 |
|------|------|
| **O键** | 显示/隐藏宠物UI |

---

## 🐛 已知问题和解决方法

### 问题 1: 宠物不显示

**可能原因**: 纹理未正确生成

**解决方法**: 已使用程序化生成，应该没有问题。如果仍有问题，检查浏览器控制台错误信息。

---

### 问题 2: 宠物不攻击敌人

**可能原因**: CombatSystem未正确初始化

**解决方法**:
1. 检查控制台是否有"宠物系统已启动"消息
2. 检查是否有"CombatSystem 初始化"消息
3. 确保场景中有敌人

---

### 问题 3: 宠物UI不显示

**可能原因**: O键冲突或UI未正确初始化

**解决方法**:
1. 按O键时检查控制台是否有错误
2. 检查UI容器是否创建
3. 尝试刷新页面

---

### 问题 4: 宠物不收集物品

**可能原因**: collectibles组未正确初始化

**解决方法**:
1. 检查createPetSystem()中是否创建了collectibles组
2. 确认物品被正确添加到collectibles组
3. 检查物品是否有正确的'data'属性

---

## 📊 宠物属性（默认值）

```javascript
level: 1                      // 等级
experience: 0                 // 当前经验
experienceToNextLevel: 100    // 升级所需经验

// 战斗属性
damage: 10                    // 每次攻击伤害
attackCooldown: 2000          // 攻击冷却（毫秒）
attackRange: 150              // 攻击范围（像素）

// 辅助属性
healAmount: 5                 // 每次回血量
healCooldown: 10000           // 回血冷却（毫秒）

// 收集属性
collectRange: 100             // 收集范围（像素）

// 移动属性
followDistance: 60            // 跟随距离
moveSpeed: 150                // 移动速度
```

---

## 🎨 自定义宠物

### 修改宠物颜色

在 `Pet.js` 的 `createGlowEffect()` 方法中修改颜色：

```javascript
// 当前颜色：青色 (#00ffff)
this.glow = this.scene.add.circle(this.x, this.y, 15, 0x00ffff, 0.3);

// 改为其他颜色，例如紫色：
this.glow = this.scene.add.circle(this.x, this.y, 15, 0xff00ff, 0.3);
```

### 修改宠物属性

在 `Pet.js` 的 `constructor` 中修改默认值：

```javascript
// 增加伤害
this.damage = 20;  // 从10改为20

// 增加回血量
this.healAmount = 10;  // 从5改为10

// 增加收集范围
this.collectRange = 150;  // 从100改为150
```

---

## 💾 存档集成（可选）

如果要将宠物数据保存到存档中，需要修改 `saveGame()` 和 `loadGame()` 方法：

```javascript
// 在 saveGame() 中添加：
saveGame() {
    const saveData = {
        // ... 其他保存数据 ...
        pet: this.pet ? this.pet.getSaveData() : null
    };
    localStorage.setItem('forestQuestSave', JSON.stringify(saveData));
}

// 在 loadGame() 中添加：
loadGame() {
    const saveData = JSON.parse(localStorage.getItem('forestQuestSave'));

    if (saveData && saveData.pet) {
        this.pet.loadSaveData(saveData.pet);
        this.petUI.updatePetStats(this.pet);
    }
}
```

---

## 📝 版本信息

- **版本**: v1.9.5
- **发布日期**: 2026-02-04
- **开发者**: 左剑广 + Claude Code
- **状态**: ✅ 已集成，待测试

---

## 🚀 下一步

1. ✅ 完成基础测试
2. ⚠️ 修复发现的bug
3. 📊 调整属性平衡
4. 🎨 添加宠物精灵图（可选）
5. 💾 集成存档系统（可选）
6. 📝 更新 CHANGELOG.md
7. 🚀 发布 v1.9.5

---

## 🎉 祝贺！

宠物系统已成功集成！现在你有一只可爱的小精灵宠物，它会：
- ⚔️ 帮你战斗
- 💚 为你回血
- 💎 收集金币
- 📈 不断成长

享受游戏吧！🐾✨
