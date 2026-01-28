# Forest Quest RPG - 素材清单

## 📋 素材复制命令

### 角色素材（Characters）

```bash
# 英雄角色
cp "/Users/zuojg/Downloads/AI/Code/LegacyCollection/Assets/Packs/tiny-RPG-forest-files/PNG/spritesheets/hero/"* assets/characters/

# 鼹鼠敌人
cp "/Users/zuojg/Downloads/AI/Code/LegacyCollection/Assets/Packs/tiny-RPG-forest-files/PNG/spritesheets/mole/"* assets/characters/

# 树妖敌人
cp "/Users/zuojg/Downloads/AI/Code/LegacyCollection/Assets/Packs/tiny-RPG-forest-files/PNG/spritesheets/treant/"* assets/characters/

# NPC
cp "/Users/zuojg/Downloads/AI/Code/LegacyCollection/Assets/Packs/tiny-rpg-town-files/Environments/Town/spritesheets/npc.png" assets/characters/
```

### 环境素材（Environments）

```bash
# 森林环境
cp "/Users/zuojg/Downloads/AI/Code/LegacyCollection/Assets/Packs/tiny-RPG-forest-files/PNG/environment/tileset.png" assets/environments/forest-tileset.png
cp "/Users/zuojg/Downloads/AI/Code/LegacyCollection/Assets/Packs/tiny-RPG-forest-files/PNG/environment/tileset-sliced.png" assets/environments/
cp "/Users/zuojg/Downloads/AI/Code/LegacyCollection/Assets/Packs/tiny-RPG-forest-files/PNG/environment/objects.png" assets/environments/forest-objects.png

# 森林物体
cp "/Users/zuojg/Downloads/AI/Code/LegacyCollection/Assets/Packs/tiny-RPG-forest-files/PNG/environment/sliced-objects/"* assets/environments/

# 瀑布动画
cp "/Users/zuojg/Downloads/AI/Code/LegacyCollection/Assets/Packs/tiny-RPG-forest-files/PNG/environment/waterfall animation/"* assets/environments/

# 小镇环境
cp "/Users/zuojg/Downloads/AI/Code/LegacyCollection/Assets/Packs/tiny-rpg-town-files/Environments/Town/tileset/"* assets/environments/town/

# 洞穴环境
cp "/Users/zuojg/Downloads/AI/Code/LegacyCollection/Assets/Packs/tiny-rpg-town-files/Environments/Cave/tileset.png" assets/environments/cave-tileset.png
```

### 道具素材（Items）

```bash
# 宝石、金币等
cp "/Users/zuojg/Downloads/AI/Code/LegacyCollection/Assets/Packs/tiny-RPG-forest-files/PNG/spritesheets/misc/"* assets/ui/
```

---

## 📊 素材分类清单

### ✅ 已确认存在的素材

#### 角色类（Characters）
- [x] **英雄（Hero）**
  - idle-front, idle-back, idle-side
  - walk-front, walk-back, walk-side
  - attack-front, attack-back, attack-side
  - attack-front-weapon, attack-back-weapon, attack-side-weapon

- [x] **鼹鼠（Mole）**
  - idle动画
  - walk动画

- [x] **树妖（Treant）**
  - idle-front, idle-back, idle-side
  - walk-front, walk-back, walk-side

- [x] **NPC**
  - town NPC sprites

#### 环境类（Environments）

**森林环境**
- [x] tileset.png（主瓦片地图）
- [x] tileset-sliced.png（切片瓦片）
- [x] objects.png（物体集合）
- [x] rock-monument.png（岩石纪念碑）
- [x] bush-tall.png（高灌木）
- [x] tree-dried.png（枯树）
- [x] rock.png（岩石）
- [x] tree-orange.png（橙色树）
- [x] sign.png（路标）
- [x] bush.png（灌木）
- [x] trunk.png（树干）
- [x] tree-pink.png（粉色树）
- [x] waterfall-1.png, waterfall-2.png, waterfall-3.png（瀑布动画）

**小镇环境**
- [x] grass-tile.png, grass-tile-2.png, grass-tile-3.png（草地瓦片）
- [x] tileset.png（小镇瓦片地图）
- [x] example.png（示例地图）

**洞穴环境**
- [x] tileset.png（洞穴瓦片地图）

**实验室环境**
- [x] tileset.png（实验室瓦片地图）

**植被装饰**
- [x] tree-1.png, tree-2.png
- [x] bush-1.png, bush-2.png, bush-3.png
- [x] plant-1.png, plant-2.png, plant-3.png

#### 道具类（Items）
- [x] gem.png（宝石）
- [x] coin.png（金币）
- [x] enemy-death.png（敌人死亡效果）

---

## 🎨 素材使用建议

### 1. 角色精灵表配置
```javascript
// 英雄角色
{
    frameWidth: 16,
    frameHeight: 16,
    animations: {
        idle: { frames: [0, 1, 2], frameRate: 5, repeat: -1 },
        walk: { frames: [0, 1, 2, 3], frameRate: 8, repeat: -1 },
        attack: { frames: [0, 1, 2], frameRate: 10, hideOnComplete: true }
    }
}
```

### 2. 瓦片地图配置
```javascript
// 森林瓦片
const forestTilemap = {
    tileSize: 16,
    layers: ['ground', 'objects', 'decoration']
};
```

### 3. 敌人配置
```javascript
// 鼹鼠
const moleConfig = {
    hp: 30,
    attack: 5,
    speed: 50,
    xp: 15
};

// 树妖
const treantConfig = {
    hp: 80,
    attack: 12,
    speed: 30,
    xp: 50
};
```

---

## 📝 需要额外创建的素材

### UI元素（需要自行设计或使用CSS）
- [ ] 生命条（Health Bar）
- [ ] 经验条（XP Bar）
- [ ] 技能冷却图标
- [ ] 对话框UI
- [ ] 商店界面
- [ ] 任务列表UI

### 音效（可选）
- [ ] 背景音乐：小镇、森林、洞穴、Boss战
- [ ] 音效：攻击、受伤、死亡、拾取道具、升级

---

## 🔧 素材处理建议

1. **图片优化**
   - 使用 TinyPNG 压缩图片
   - 确保所有 PNG 格式一致

2. **精灵表合并**
   - 使用 TexturePacker 合并小图片
   - 减少HTTP请求

3. **备用方案**
   - 如果素材缺失，使用简单的几何图形临时替代
   - 后续可替换为正式素材

---

**清单版本：** 1.0
**最后更新：** 2026-01-22
