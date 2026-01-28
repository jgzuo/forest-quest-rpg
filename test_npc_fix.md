# NPC Fix Test Plan

## Test Environment
- Browser: Chrome/Firefox/Safari
- URL: http://localhost:8080
- Test Date: 2026-01-27

## Test Cases

### Test Case 1: Merchant NPC Display
**Steps**:
1. Launch game
2. Start new game or load save
3. Go to Town scene (小镇)
4. Find Merchant NPC at position (600, 200)
5. Observe NPC sprite

**Expected Result**:
- ✅ Merchant displays correct front-facing sprite
- ✅ Sprite matches frame 4 of npc.png
- ✅ NPC looks like a merchant character

**Actual Result**: [To be filled during testing]

---

### Test Case 2: Elder NPC Display
**Steps**:
1. In Town scene
2. Find Elder NPC at position (400, 200)
3. Observe NPC sprite

**Expected Result**:
- ✅ Elder displays correct front-facing sprite
- ✅ Sprite matches frame 7 of npc.png
- ✅ NPC looks like an elder character

**Actual Result**: [To be filled during testing]

---

### Test Case 3: NPC Interaction
**Steps**:
1. Walk close to Merchant NPC
2. Press 'E' key to interact
3. Check dialogue appears
4. Walk close to Elder NPC
5. Press 'E' key to interact
6. Check dialogue appears

**Expected Result**:
- ✅ Interaction hint "E 对话" appears
- ✅ Dialogue system works correctly
- ✅ No console errors

**Actual Result**: [To be filled during testing]

---

## Console Verification

### Expected Log Output
```
🔨 开始创建NPC: 商人 at (600, 200)
✅ NPC对象已创建并设置数据:
   - type: npc
   - id: merchant
   - name: 商人
   - 位置: (600, 200)
   - 帧号: 4  ← Correct frame number
📝 NPC已添加到管理器数组，当前总数: 1

🔨 开始创建NPC: 村长 at (400, 200)
✅ NPC对象已创建并设置数据:
   - type: npc
   - id: elder
   - name: 村长
   - 位置: (400, 200)
   - 帧号: 7  ← Correct frame number
📝 NPC已添加到管理器数组，当前总数: 2
```

---

## Performance Check

### Metrics
- FPS: Should be 60
- Memory: Should be stable
- No memory leaks

---

## Regression Testing

### Test Other Systems
- [ ] Player movement works
- [ ] Combat system works
- [ ] Scene switching works
- [ ] Other NPCs (if any) display correctly

---

## Sign-off

**Tester**: __________
**Date**: __________
**Status**: Pass / Fail
**Notes**: __________

