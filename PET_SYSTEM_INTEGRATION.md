# 宠物系统集成指南

## 📋 概述

本指南说明如何将宠物系统集成到 Forest Quest RPG 的主游戏场景中。

**新增文件**:
- `src/entities/Pet.js` - 宠物实体类（350行）
- `src/ui/PetUI.js` - 宠物UI界面（200行）

**功能**:
- ⚔️ **战斗**：宠物自动攻击敌人（伤害：10+，冷却：2秒）
- 💚 **辅助**：宠物每10秒为玩家回血（5+）
- 💎 **收集**：宠物自动收集金币和宝石（范围：100+）
- 📈 **升级**：宠物通过战斗升级，属性提升

---

## 🔧 集成步骤

### 步骤 1: 在 index.html 中添加宠物精灵图

在 `preload()` 函数中添加宠物纹理（如果没有宠物图片，使用程序化生成）：

```javascript
// 在 BootScene.js 的 preload() 函数中
// 如果有宠物精灵图，加载它：
// this.load.image('pet', 'assets/characters/pet.png');

// 或者使用程序化生成（无需外部资源）
```

---

### 步骤 2: 在 GameScene.js 中添加宠物初始化

在 `create()` 函数中添加：

```javascript
// ==================== 宠物系统 ====================

// 导入Pet类（在文件顶部）
import Pet from './entities/Pet.js';
import PetUI from './ui/PetUI.js';

// 在 GameScene 的 create() 函数中，添加：
createPet() {
    // 创建宠物
    this.pet = new Pet(this, this.player.x + 60, this.player.y, this.player);

    // 创建宠物UI
    this.petUI = new PetUI(this);

    // 初始化宠物UI显示
    this.petUI.updatePetStats(this.pet);

    console.log('宠物系统已启动');
}
```

---

### 步骤 3: 在 update() 函数中更新宠物

```javascript
// 在 GameScene 的 update() 函数中，添加：
update(time, delta) {
    // ... 其他更新代码 ...

    // 更新宠物
    if (this.pet && this.pet.active) {
        this.pet.update(time, delta);
    }
}
```

---

### 步骤 4: 添加宠物UI切换（快捷键）

在 `setupControls()` 函数中添加：

```javascript
// 在 setupControls() 函数中，添加P键切换宠物UI：
if (Phaser.Input.Keyboard.JustDown(this.keys.p)) {
    this.togglePause();
    this.togglePetUI(); // 添加这一行
}

// 添加切换宠物UI方法
togglePetUI() {
    if (this.petUI) {
        this.petUI.toggle();
    }
}
```

---

### 步骤 5: 修复 collectibles 组引用

宠物需要访问 `this.scene.collectibles` 来收集物品。确保在 `create()` 函数中创建了 collectibles 组：

```javascript
// 在 GameScene 的 create() 函数中，添加：
this.collectibles = this.physics.add.group();

// 当创建金币/宝石时，添加到组中：
// this.collectibles.add(coin);
```

---

### 步骤 6: 添加宠物音频方法（可选）

在 `AudioManager.js` 中添加宠物音效：

```javascript
/**
 * 播放宠物攻击音效
 */
playPetAttack() {
    this.playSound('petAttack', {
        frequency: 800,
        type: 'sine',
        duration: 0.1,
        volume: 0.3
    });
}

/**
 * 播放宠物升级音效
 */
playLevelUp() {
    this.playSound('levelUp', {
        frequency: 600,
        type: 'triangle',
        duration: 0.3,
        volume: 0.5
    });
}
```

---

### 步骤 7: 添加宠物到存档系统

在 `saveGame()` 和 `loadGame()` 方法中添加宠物数据：

```javascript
// 在 saveGame() 方法中：
saveGame() {
    const saveData = {
        // ... 其他保存数据 ...
        pet: this.pet ? this.pet.getSaveData() : null
    };
    localStorage.setItem('forestQuestSave', JSON.stringify(saveData));
}

// 在 loadGame() 方法中：
loadGame() {
    const saveData = JSON.parse(localStorage.getItem('forestQuestSave'));

    if (saveData && saveData.pet) {
        this.pet.loadSaveData(saveData.pet);
    }
}
```

---

### 步骤 8: 修复方法引用

确保 `GameScene` 有以下方法（宠物系统需要）：

```javascript
/**
 * 显示伤害数字
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @param {number} damage - 伤害值
 * @param {boolean} isCrit - 是否暴击
 * @param {boolean} isPet - 是否是宠物攻击
 * @param {string} color - 文本颜色
 */
showDamageNumber(x, y, damage, isCrit = false, isPet = false, color = null) {
    // ... 现有代码 ...

    // 如果是宠物攻击，使用青色
    if (isPet && !color) {
        color = '#00ffff';
    }

    // ... 创建伤害数字文本 ...
}

/**
 * 显示消息
 * @param {string} message - 消息内容
 */
showMessage(message) {
    // 创建临时文本显示
    const msgText = this.add.text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 - 100,
        message,
        {
            fontSize: '20px',
            color: '#ffff00',
            stroke: '#000',
            strokeThickness: 3
        }
    );
    msgText.setOrigin(0.5);

    // 2秒后消失
    this.time.delayedCall(2000, () => {
        msgText.destroy();
    });
}

/**
 * 收集物品
 * @param {Phaser.GameObjects.Sprite} item - 物品对象
 */
collectItem(item) {
    if (!item.active) return;

    const itemType = item.getData('type');

    switch (itemType) {
        case 'coin':
            this.gold += item.getData('value') || 1;
            break;
        case 'gem':
            this.gems += item.getData('value') || 1;
            break;
        case 'potion':
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + 20);
            break;
    }

    // 播放音效
    this.audioManager.playCollectCoin();

    // 显示收集提示
    this.showDamageNumber(item.x, item.y, '+1', false, false, '#ffff00');

    // 移除物品
    item.destroy();
}
```

---

## 🎮 测试检查清单

集成完成后，测试以下功能：

- [ ] 宠物跟随玩家移动
- [ ] 宠物自动攻击附近的敌人
- [ ] 宠物每10秒为玩家回血
- [ ] 宠物自动收集金币和宝石
- [ ] 宠物获得经验并升级
- [ ] 宠物升级时属性提升
- [ ] 按P键显示/隐藏宠物UI
- [ ] 宠物UI显示正确的属性
- [ ] 宠物数据正确保存和读取

---

## 🐛 常见问题

### 问题 1：宠物不显示

**原因**：宠物精灵图未加载

**解决**：使用程序化生成圆形代替精灵图，修改 `Pet.js`：

```javascript
constructor(scene, x, y, player) {
    // 创建圆形代替精灵图
    super(scene, x, y);

    // 绘制宠物外观
    const graphics = scene.add.graphics();
    graphics.fillStyle(0x00ffff, 1);
    graphics.fillCircle(0, 0, 10);
    graphics.generateTexture('pet', 20, 20);
    graphics.destroy();

    this.setTexture('pet');
    // ... 其他代码 ...
}
```

---

### 问题 2：宠物不攻击敌人

**原因**：`this.scene.enemyGroups` 未定义

**解决**：在 `GameScene` 的 `create()` 函数中添加：

```javascript
// 收集所有敌人组
this.enemyGroups = [
    this.molesGroup,
    this.shamansGroup,
    this.treeEnemiesGroup,
    // ... 其他敌人组
];
```

---

### 问题 3：宠物不收集物品

**原因**：`this.scene.collectibles` 未定义或物品未添加到组

**解决**：确保所有掉落物添加到 `collectibles` 组：

```javascript
// 在创建金币/宝石时
this.collectibles.add(coin);
```

---

## 📊 属性平衡建议

### 当前默认值
- **等级**: 1
- **伤害**: 10
- **攻击范围**: 150
- **回血量**: 5
- **回血冷却**: 10秒
- **收集范围**: 100
- **升级经验**: 100 (×1.5递增)

### 平衡调整
- 如果宠物太强，减少基础伤害（10 → 5）
- 如果回血太快，增加冷却时间（10秒 → 15秒）
- 如果收集范围太小，增加收集范围（100 → 150）

---

## 🎨 自定义宠物外观

如果有宠物精灵图：

1. 将精灵图放在 `assets/characters/pet.png`
2. 在 `BootScene.js` 中加载：
   ```javascript
   this.load.spritesheet('pet', 'assets/characters/pet.png', {
       frameWidth: 32,
       frameHeight: 32
   });
   ```
3. 在 `Pet.js` 中使用动画：
   ```javascript
   this.anims.play('pet-idle', true);
   ```

---

## 📝 集成代码示例

完整的集成代码示例请参考：
- `src/entities/Pet.js` - 宠物实体类
- `src/ui/PetUI.js` - 宠物UI类

---

**版本**: v1.0.0
**创建日期**: 2026-02-04
**作者**: Claude Code + 左剑广
**状态**: ✅ 待集成

---

## 🚀 下一步

1. 按照"集成步骤"将宠物系统集成到 GameScene.js
2. 测试所有宠物功能
3. 调整属性平衡
4. 添加宠物音效（可选）
5. 更新 CHANGELOG.md
6. 发布 v1.9.5

祝你开发顺利！🐾
