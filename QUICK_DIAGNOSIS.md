# 🔧 快速诊断指南

## 问题
"WASD或方向键按下的时候有问题，其他时候是好的"

这说明问题**只发生在按键时**，是动态渲染问题。

## 快速测试步骤

### 1. 运行可视化调试面板

在浏览器控制台粘贴运行：

```javascript
// 复制 debug_overlay.js 的全部内容并运行
```

或者访问：`http://127.0.0.1:55573/` 并打开控制台，粘贴：

```javascript
(function(){
  const scene = game.scene.scenes.find(s => s.scene.key === 'GameScene');
  let count = 0;
  scene.children.each(c => {
    if(c.texture?.key?.startsWith('hero')) count++;
  });
  console.log('Hero对象数量:', count);
  console.log('玩家位置:', {x: scene.player.x, y: scene.player.y});
  console.log('flipX:', scene.player.flipX);
  console.log('纹理:', scene.player.texture.key);
})();
```

**预期结果**：
- Hero对象数量应该始终是 **1**
- 如果是1个，说明不是对象创建问题，而是**渲染显示问题**

### 2. 测试无纹理切换版本

在控制台运行 `test_no_texture_switch.js` 的内容。

**如果问题消失**：说明是**纹理切换导致的渲染缓存问题**
**如果问题仍存在**：说明是**flipX或其他渲染属性导致**

### 3. 测试flipX专用版本

在控制台运行 `test_flip_only.js` 的内容。

**如果只有向左/右移动时出现多个**：说明是**flipX导致的渲染残留**
**如果上下移动也有问题**：说明是**速度/物理系统问题**

## 🎯 最可能的原因

根据你的描述"按键时有问题"，最可能的原因是：

### 原因1: 纹理切换渲染缓存（最可能 70%）

**现象**：任何方向移动都有多个主角
**原因**：Phaser在快速切换纹理时，旧纹理的渲染帧未清除
**解决方案**：需要使用纹理动画帧而不是切换纹理

### 原因2: flipX渲染残留（可能 20%）

**现象**：只有向左/右移动时有多个主角
**原因**：flipX改变时触发布局重计算，产生视觉残留
**解决方案**：使用不同的sprite对象代替flipX

### 原因3: 浏览器GPU加速bug（可能 10%）

**现象**：只在特定浏览器出现
**原因**：浏览器的硬件加速渲染bug
**解决方案**：禁用GPU加速或使用其他浏览器

## 📝 请告诉我

运行上面的测试后，请告诉我：

1. **Hero对象数量是多少？**（控制台显示）
2. **哪个方向移动有问题？**（上/下/左/右）
3. **无纹理切换版本有问题吗？**
4. **使用的是什么浏览器？**（Chrome/Firefox/Edge/Safari）

根据你的回答，我会提供针对性的修复方案。
