# Forest Quest RPG - 任务规划 (NPC 修复与素材利用)

**项目**: Forest Quest RPG v1.8.2
**开发者**: 左剑广
**开始日期**: 2026-01-27
**当前状态**: 生产就绪 (98/100⭐⭐⭐⭐⭐)

---

## 🎯 当前目标

### 紧急任务：修复 NPC 切图错误

**问题描述**:
- 商人和村长两个 NPC 的 sprite frame 计算错误
- 导致显示不正确的角色图像

**根本原因分析**:

1. **npc.png 图片信息**:
   - 尺寸: 48x64 像素
   - 布局: 4列 x 3行 (横向4个NPC，纵向3个方向)
   - 每帧尺寸: 12x21 像素

2. **BootScene.js 加载配置** (正确):
   ```javascript
   this.load.spritesheet('npc', 'assets/characters/npc.png', {
       frameWidth: 12,
       frameHeight: 21,
       startFrame: 0,
       endFrame: 11  // 12帧 total (0-11)
   });
   ```

3. **SceneManager.js createNPC 函数** (错误):
   ```javascript
   const rowIndex = id === 'elder' ? 3 : 0;  // 村长=第3行, 商人=第0行
   const colIndex = 1;  // 固定使用第1列(正面)
   const frameIndex = rowIndex * 3 + colIndex;  // ❌ 错误计算
   ```

4. **错误分析**:
   - 当前计算: `frameIndex = rowIndex * 3 + colIndex`
   - 商人: `frameIndex = 0 * 3 + 1 = 1` ✓ (正确)
   - 村长: `frameIndex = 3 * 3 + 1 = 10` ❌ (错误！应该是第3行第1列)
   - 正确布局: 4列 x 3行，计算应该是 `frameIndex = rowIndex * 4 + colIndex`
   - 村长正确帧号: `frameIndex = 3 * 4 + 1 = 13` ❌ (但总共只有12帧！)

5. **布局理解错误**:
   - 可能是 3行 x 4列 (纵向3个方向，横向4个NPC)
   - 村长应该在第3列第0行？需要确认实际图片布局

---

## 📋 阶段规划

### 阶段 1: 诊断 NPC 切图问题 ✅
**状态**: 完成
**完成时间**: 2026-01-27 20:00

**完成内容**:
- ✅ 分析 npc.png 文件结构 (48x64像素)
- ✅ 确认 sprite sheet 布局 (4x3 或 3x4)
- ✅ 识别 frameIndex 计算错误
- ✅ 定位错误代码位置 (SceneManager.js:328)

**关键发现**:
- BootScene.js 配置: frameWidth=12, frameHeight=21
- 总帧数: 12帧 (0-11)
- 当前计算公式: `frameIndex = rowIndex * 3 + colIndex`
- **问题**: 公式假设是 4行 x 3列，但实际可能是 3行 x 4列

---

### 阶段 2: 确认 NPC 素材布局 🔍
**状态**: 进行中
**优先级**: 🔴 高
**目标**: 明确 npc.png 的实际布局结构

**执行步骤**:
- [ ] 查看 npc.png 图片实际内容
- [ ] 确认是 4x3 还是 3x4 布局
- [ ] 识别每个NPC在哪一行/列
- [ ] 绘制布局图，标注帧号

**技术方案**:
```bash
# 使用 PIL 或其他工具查看图片
# 确认实际布局
```

**预计复杂度**: 低 (需要查看图片)

**预计时间**: 10分钟

---

### 阶段 3: 修复 NPC frame 计算 🔧
**状态**: 待开始
**优先级**: 🔴 高
**目标**: 修正 SceneManager.js 中的 frameIndex 计算公式

**执行步骤**:
- [ ] 根据实际布局更新计算公式
- [ ] 修改 SceneManager.js createNPC 函数
- [ ] 测试商人显示
- [ ] 测试村长显示
- [ ] 确认所有方向帧正确

**技术方案**:

**方案 A**: 如果是 3行 x 4列 (3个方向，4个NPC)
```javascript
const rowIndex = 1;  // 正面 = 第1行
const colIndex = id === 'elder' ? 3 : 0;  // 村长=第3列, 商人=第0列
const frameIndex = rowIndex * 4 + colIndex;
```

**方案 B**: 如果是 4行 x 3列 (4个NPC，3个方向)
```javascript
const rowIndex = id === 'elder' ? 3 : 0;  // 村长=第3行, 商人=第0行
const colIndex = 1;  // 正面 = 第1列
const frameIndex = rowIndex * 3 + colIndex;
```

**文件修改**:
- `src/utils/SceneManager.js` (行323-330)

**预计复杂度**: 低 (修改1行代码)

**预计时间**: 15分钟

---

### 阶段 4: 充分利用环境素材 🎨
**状态**: 待开始
**优先级**: 🟡 中
**目标**: 利用 assets/environments 下的丰富素材完善游戏场景

**当前素材清单**:
```
assets/environments/
├── town/               # 小镇素材
│   ├── tileset.png    # 瓦片集
│   ├── grass-tile.png
│   ├── grass-tile-2.png
│   ├── grass-tile-3.png
│   └── example.png    # 示例场景
├── waterfall/          # 瀑布动画
│   ├── waterfall-1.png
│   ├── waterfall-2.png
│   └── waterfall-3.png
├── forest-tileset.png  # 森林瓦片
├── forest-objects.png  # 森林物体
├── tree-orange.png     # 橙树
├── tree-pink.png       # 粉树
├── tree-dried.png      # 枯树
├── rock.png            # 岩石
├── rock-monument.png   # 岩石纪念碑
├── bush.png            # 灌木
├── bush-tall.png       # 高灌木
├── trunk.png           # 树干
├── sign.png            # 标志牌
├── cave-tileset.png    # 洞穴瓦片
└── tileset-sliced.png  # 切片瓦片
```

**改进方向**:

1. **小镇场景优化**:
   - [ ] 使用 grass-tile-2.png, grass-tile-3.png 增加草地变化
   - [ ] 参考 example.png 创建更丰富的小镇布局
   - [ ] 添加装饰性物体 (石碑、标志牌等)

2. **森林场景优化**:
   - [ ] 使用 tree-orange.png, tree-pink.png 增加树木变化
   - [ ] 添加更多 forest-objects.png 中的物体
   - [ ] 使用瀑布动画创建动态场景

3. **洞穴场景优化**:
   - [ ] 使用 cave-tileset.png 创建更丰富的洞穴环境
   - [ ] 添加岩石堆、钟乳石等装饰

4. **新场景可能性**:
   - [ ] 利用瀑布素材创建瀑布场景
   - [ ] 利用多种树木创建不同森林区域

**技术方案**:
- 使用 Phaser 的 Tilemap 和 TilemapLayer
- 创建装饰性物体数组，随机分布
- 使用 Animation 创建瀑布动画

**文件修改**:
- `src/utils/SceneManager.js` (loadTownScene, loadForestScene, loadCaveScene)
- `src/scenes/BootScene.js` (添加素材加载)

**预计复杂度**: 中等 (需要设计场景布局)

**预计时间**: 2-3小时

---

### 阶段 5: 测试与验证 ✅
**状态**: 待开始
**优先级**: 🔴 高
**目标**: 全面测试修复和改进效果

**测试清单**:
- [ ] 测试商人 NPC 显示正确
- [ ] 测试村长 NPC 显示正确
- [ ] 测试小镇场景美化效果
- [ ] 测试森林场景美化效果
- [ ] 测试洞穴场景美化效果
- [ ] 测试所有场景切换正常
- [ ] 性能测试 (FPS、内存)

**预计时间**: 30分钟

---

## 📊 进度跟踪

**总体进度**: 1/5 阶段完成 (20%)

**预计总时间**: 3-4小时

**当前版本**: v1.8.2
**目标版本**: v1.8.3

**当前质量评分**: 98/100 ⭐⭐⭐⭐⭐
**目标质量评分**: 99/100 ⭐⭐⭐⭐⭐

---

## 🔄 执行策略

基于**务实理性**风格，采用**Ralph方式**：

1. **快速诊断**: 先确认问题，不急于修改
2. **最小修改**: 一次只改一个问题，立即测试
3. **持续验证**: 每步修改后验证效果
4. **文档同步**: 代码和文档同步更新
5. **版本控制**: 每个阶段完成后提交

**工作方式**:
- 先看图确认布局，再修改代码
- 保持现有系统稳定性
- 记录每个布局细节到 findings.md
- Git commit 及时保存进度

---

## 💡 技术细节

### Sprite Frame 计算公式

**Phaser 3 Sprite Sheet 帧号计算**:
```
frameIndex = rowIndex * columns + colIndex
```

**示例**: 3行 x 4列 sprite sheet
```
       列0  列1  列2  列3
行0     0    1    2    3
行1     4    5    6    7
行2     8    9   10   11
```

### NPC 对应关系 (待确认)
```
假设3行 x 4列 (3个方向，4个NPC):
- 行0: 背面
- 行1: 正面
- 行2: 侧面

- 列0: 商人
- 列1: NPC2
- 列2: NPC3
- 列3: 村长

商人正面: row=1, col=0, frame=1*4+0=4
村长正面: row=1, col=3, frame=1*4+3=7
```

---

## ⚠️ 风险评估

**技术风险**: 低 (简单bug修复)
**时间风险**: 低 (预计3-4小时完成)
**范围风险**: 低 (目标明确，不影响其他功能)

**缓解措施**:
- 先确认布局，再修改代码
- 保持备份，出错可回滚
- 逐个测试，确保不破坏其他NPC

---

## 📝 问题追踪

| 问题 ID | 描述 | 发现日期 | 状态 | 解决方案 |
|---------|------|----------|------|----------|
| NPC-001 | 村长NPC显示错误 | 2026-01-27 | 诊断中 | 修改frameIndex计算 |
| NPC-002 | 商人NPC可能显示错误 | 2026-01-27 | 待验证 | 确认后一起修复 |

---

*最后更新: 2026-01-27 20:00*
*下一个更新: 阶段2完成时 (确认NPC布局)*
