# Integration Test Plan - Forest Quest RPG

## Test Environment Status
**Note:** Test environment currently non-functional. This plan serves as documentation for manual testing when environment is fixed.

## Test Scope

### Systems to Test
1. **Save/Load System** (Iterations 1-3)
2. **Quest System** (Iteration 5)
3. **Boss Battle System** (Iteration 6)
4. **Statistics Tracking** (Iteration 7)
5. **Scene Switching** (Iteration 2)
6. **Combat System** (All iterations)

---

## Test Scenarios

### Scenario 1: Complete Game Playthrough

**Objective:** Verify all systems work together from start to victory

**Steps:**
1. Start new game (no existing save)
2. Accept quest from village chief
3. Fight enemies in forest
4. Level up character
5. Collect coins and gems
6. Switch scenes (town → forest → cave)
7. Defeat cave enemies
8. Trigger boss fight (Treant King)
9. Survive all 3 boss phases
10. Defeat boss
11. View victory scene
12. Check statistics

**Expected Results:**
- ✅ Quest progress updates correctly
- ✅ Level up triggers auto-save
- ✅ Scene switches trigger auto-save
- ✅ Coins/gems add to totals
- ✅ Boss phases transition correctly
- ✅ Boss skills show warnings
- ✅ Boss defeat shows celebration
- ✅ Victory scene loads
- ✅ Statistics track all events

**Data to Verify:**
```javascript
// After game completion
window.gameData.progress.playtimeSeconds > 0
window.gameData.enemiesDefeated.mole > 0
window.gameData.enemiesDefeated.treant > 0
window.gameData.enemiesDefeated.boss_treant_king === 1
window.gameData.progress.totalCoins > 0
window.gameData.progress.gemsCollected >= 0
```

---

### Scenario 2: Save/Load Integration

**Objective:** Verify save system preserves all game state

**Test Cases:**

#### TC 2.1: Save on Level Up
1. Start game, gain XP to level up
2. Check localStorage for updated timestamp
3. Verify save data contains:
   - player.level (incremented)
   - player.xp (carryover)
   - progress.enemiesDefeated
   - progress.playtimeSeconds
   - enemiesDefeated by type

#### TC 2.2: Save on Scene Switch
1. Save game in town
2. Switch to forest
3. Check localStorage for new timestamp
4. Verify currentScene updated

#### TC 2.3: Load Save Game
1. Play for 5+ minutes
2. Defeat various enemies
3. Collect coins/gems
4. Save game
5. Refresh page (F5)
6. Load game (F9)
7. Verify:
   - Player position restored
   - Player level/XP restored
   - Enemy statistics restored
   - Playtime continues counting
   - Quest progress restored

#### TC 2.4: Save Data Structure
1. Save game
2. Inspect `localStorage.getItem('forestQuestRPG_save')`
3. Verify all required fields present:
   ```json
   {
     "version": "1.2.0",
     "timestamp": "...",
     "player": { ... },
     "currentScene": "town",
     "progress": { ... },
     "enemiesDefeated": { ... }
   }
   ```

---

### Scenario 3: Quest System Integration

**Objective:** Verify quest rewards and auto-save

**Test Cases:**

#### TC 3.1: Quest Acceptance
1. Talk to village chief
2. Accept "鼹鼠威胁" quest
3. Verify:
   - Quest added to active list
   - Quest tracker shows objective
   - Quest manager logged event

#### TC 3.2: Quest Progress
1. Have active quest
2. Kill required enemy type
3. Verify:
   - Objective counter increments
   - Quest notification appears
   - Auto-save triggers on objective complete

#### TC 3.3: Quest Completion
1. Complete all quest objectives
2. Verify:
   - "✨ 任务完成! ✨" notification
   - Quest name shown in green
   - Auto-save triggers

#### TC 3.4: Quest Rewards
1. Complete quest
2. Claim rewards
3. Verify:
   - 💰 +100 金币 notification
   - ⭐ +50 XP notification
   - 🎉 领取 N 项奖励! notification
   - Gold added to player
   - XP added to player
   - Level up if XP threshold reached

---

### Scenario 4: Boss Battle Integration

**Objective:** Verify boss mechanics and player feedback

**Test Cases:**

#### TC 4.1: Boss Spawn
1. Enter cave with boss fight
2. Verify:
   - Treant King spawns
   - Boss health bar appears at top
   - P1 indicator shows (gold)
   - Boss size is 4x normal

#### TC 4.2: Boss Phase Transitions
1. Fight boss to 50% HP
2. Verify P2 transition:
   - Orange camera flash
   - 🔥 第二阶段! 🔥 notification
   - Screen shake
   - Boss attack increases (+5)
   - Phase indicator turns orange

3. Fight boss to 20% HP
4. Verify P3 transition:
   - Red camera flash
   - 💀 狂暴模式! 💀 notification
   - ⚠️ Boss已进入狂暴状态! notification
   - Screen shake
   - Boss attack increases (+10 more)
   - Boss speed increases (+20)
   - Phase indicator turns red

#### TC 4.3: Boss Skill Warnings
1. Trigger RootBind skill (P2, close range)
2. Verify:
   - Green warning circle appears (60px)
   - 🌿 根须缠绕! text shows
   - 1 second delay before activation
   - Player rooted for 2 seconds

3. Trigger RockFall skill (P2)
4. Verify:
   - Red warning circle appears (80px)
   - ⚠️ emoji shows
   - 1.5 second delay before damage
   - Can dodge by moving out

5. Trigger Summon skill (P3)
6. Verify:
   - 3 green warning circles appear
   - 🌱 召唤树苗! text shows
   - 1.5 second delay
   - 3 treant minions spawn

#### TC 4.4: Boss Defeat
1. Reduce boss HP to 0
2. Verify:
   - 🎉 胜利! 🎉 notification
   - 👑 树妖王被击败! notification
   - 💰 +500 金币 notification
   - ⭐ +500 XP notification
   - Gold camera flash
   - Screen shake
   - Boss death sound plays
   - Achievements unlock (forest_guardian, survivor)
   - Quest updates (boss_defeated)
   - Victory scene loads after 4 seconds

---

### Scenario 5: Statistics Tracking

**Objective:** Verify statistics accuracy

**Test Cases:**

#### TC 5.1: Playtime Tracking
1. Start new game
2. Note current time
3. Play for exactly 60 seconds
4. Call `showStatistics()`
5. Verify playtime ≈ 1 minute

#### TC 5.2: Enemy Type Tracking
1. Defeat 3 moles
2. Defeat 2 treants
3. Defeat 1 slime
4. Check `window.gameData.enemiesDefeated`:
   ```javascript
   {
     mole: 3,
     treant: 2,
     slime: 1
   }
   ```

#### TC 5.3: Boss Tracking
1. Defeat Treant King boss
2. Check `window.gameData.enemiesDefeated`:
   ```javascript
   {
     boss_treant_king: 1,
     treant: 1  // Boss counted separately
   }
   ```

#### TC 5.4: Statistics Persistence
1. Play game, accumulate stats
2. Save game
3. Refresh page
4. Load game
5. Call `showStatistics()`
6. Verify all statistics preserved

#### TC 5.5: Statistics Display
1. Call `showStatistics()`
2. Verify console output shows:
   - 👤 玩家信息 section
   - ⏱️ 游戏时间 section (formatted H:M:S)
   - ⚔️ 战斗统计 section
   - 💀 敌人击败详情 section
   - 📜 任务统计 section
   - 🏆 成就统计 section
   - 📊 统计已显示在控制台 in-game

---

### Scenario 6: Edge Cases

**Objective:** Test error handling and edge cases

**Test Cases:**

#### TC 6.1: No Save Data
1. Start new game (no localStorage)
2. Press F9 (load)
3. Verify:
   - "未找到存档" message
   - Game continues normally

#### TC 6.2: Corrupt Save Data
1. Save game
2. Manually corrupt localStorage
3. Try to load
4. Verify:
   - "存档损坏" message
   - Game doesn't crash

#### TC 6.3: Quick Save/Load
1. Start game
2. Immediately save (F8)
3. Immediately load (F9)
4. Verify:
   - Save succeeds
   - Load succeeds
   - No errors

#### TC 6.4: Multiple Level Ups
1. Gain enough XP for 2+ level ups at once
2. Verify:
   - Each level up triggers auto-save
   - Each level up shows notification
   - All levels gained correctly

#### TC 6.5: Scene Switch During Combat
1. Fight enemy in forest
2. Quickly switch to cave before enemy dies
3. Verify:
   - Scene transition completes
   - Auto-save triggers
   - No errors

#### TC 6.6: Die During Boss Fight
1. Fight boss
2. Let player die (HP → 0)
3. Verify:
   - Game over scene loads
   - Statistics saved up to death
   - Can load from last save

#### TC 6.7: Complete Quest Without Accepting
1. Don't accept quest
2. Kill quest enemies anyway
3. Verify:
   - Enemies still give XP/gold
   - Quest doesn't complete
   - No quest rewards

---

## Manual Testing Checklist

### Pre-Test Setup
- [ ] Open browser DevTools (F12)
- [ ] Check Console tab for errors
- [ ] Open Application → Local Storage
- [ ] Navigate to http://localhost:8080

### Core Functionality
- [ ] Game loads without errors
- [ ] Player can move (WASD/Arrows)
- [ ] Player can attack (Space)
- [ ] UI displays correctly (HP, XP, gold)
- [ ] Enemies spawn and fight back

### Save/Load System
- [ ] F8 saves game
- [ ] F9 loads game
- [ ] Save notification appears
- [ ] Load notification appears
- [ ] localStorage has `forestQuestRPG_save` key
- [ ] Save data has all required fields

### Auto-Save Triggers
- [ ] Level up triggers auto-save
- [ ] Scene switch triggers auto-save
- [ ] Quest completion triggers auto-save

### Quest System
- [ ] Can accept quest from NPC
- [ ] Quest tracker shows objective
- [ ] Killing quest enemies updates progress
- [ ] Quest completion notification shows
- [ ] Quest rewards display correctly
- [ ] Quest rewards added to player

### Boss Battle
- [ ] Boss spawns in cave
- [ ] Boss health bar appears
- [ ] Phase 1 → 2 transition works
- [ ] Phase 2 → 3 transition works
- [ ] RootBind has warning
- [ ] RockFall has warning
- [ ] Summon has warning
- [ ] Boss defeat celebration shows
- [ ] Victory scene loads

### Statistics
- [ ] Playtime increases
- [ ] Enemy kills tracked by type
- [ ] Boss kills tracked separately
- [ ] `showStatistics()` works
- [ ] Statistics persist after save/load

### Scene Switching
- [ ] Town → Forest works
- [ ] Forest → Cave works
- [ ] Cave → Forest works
- [ ] Player position updates
- [ ] Enemies load correctly

---

## Test Data Verification

### Expected Save Structure
```json
{
  "version": "1.2.0",
  "timestamp": "2026-01-24T12:34:56.789Z",
  "player": {
    "level": 5,
    "xp": 350,
    "hp": 150,
    "maxHp": 150,
    "attack": 20,
    "gold": 1250,
    "x": 400,
    "y": 300
  },
  "currentScene": "town",
  "progress": {
    "totalCoins": 150,
    "gemsCollected": 5,
    "enemiesDefeated": 25,
    "playtimeSeconds": 2700
  },
  "enemiesDefeated": {
    "mole": 15,
    "treant": 8,
    "slime": 2,
    "boss_treant_king": 1
  },
  "quests": {
    "quests": [...],
    "activeQuests": [...],
    "completedQuests": [...]
  }
}
```

---

## Bug Report Template

If any test fails, document:

```markdown
## Bug Report: [Title]

**Scenario:** [Which test case]
**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected:** [What should happen]
**Actual:** [What actually happened]
**Error Message:** [Console errors if any]
**Screenshot:** [If applicable]

**Frequency:** [Always/Sometimes/Once]
**Severity:** [Critical/High/Medium/Low]
```

---

## Success Criteria

### All Systems Working
- ✅ Save/Load: 100% reliable
- ✅ Auto-save: Triggers on all key events
- ✅ Quests: Complete flow works
- ✅ Boss: All 3 phases + skills work
- ✅ Statistics: Accurate tracking
- ✅ Scenes: Smooth transitions

### No Critical Bugs
- ✅ No crashes
- ✅ No data loss
- ✅ No broken saves
- ✅ No stuck states

### Performance
- ✅ 60 FPS during normal play
- ✅ < 3s load time
- ✅ No memory leaks
- ✅ Smooth animations

---

**Test Plan Created:** 2026-01-24
**Estimated Testing Time:** 2-3 hours
**Status:** Ready for manual testing when test environment is fixed
