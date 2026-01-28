# Iteration 7 Report: Game Statistics Tracking

## Goal
Track total playtime, enemies defeated by type, and add statistics display functionality

## Changes

### Task 7.1: Analysis
**Current State:**
- `window.gameData.progress` tracked: gemsCollected, enemiesDefeated (total only), totalCoins
- No playtime tracking
- No enemy type breakdown
- No statistics display

### Task 7.2: Playtime Tracking

**File Modified:** `src/main.js` (Lines 33-72)

**Added to gameData structure:**
```javascript
progress: {
    currentScene: 'GameScene',
    gemsCollected: 0,
    enemiesDefeated: 0,
    totalCoins: 0,
    // 统计数据
    playtimeSeconds: 0,      // 总游戏时间（秒）
    sessionStartTime: null   // 本次会话开始时间
}
```

**File Modified:** `src/scenes/GameScene.js`

**Initialize tracking (Lines 14-19):**
```javascript
// 记录本次会话开始时间
if (window.gameData && window.gameData.progress) {
    window.gameData.progress.sessionStartTime = Date.now();
    console.log('⏱️ 统计追踪已启动');
}
```

**Update playtime every frame (Lines 1390-1394):**
```javascript
update(time, delta) {
    if (window.gameData && window.gameData.progress && window.gameData.progress.sessionStartTime) {
        const elapsedSeconds = Math.floor((Date.now() - window.gameData.progress.sessionStartTime) / 1000);
        window.gameData.progress.playtimeSeconds = elapsedSeconds;
    }
}
```

### Task 7.3: Enemy Type Tracking

**File Modified:** `src/main.js` (Lines 53-59)

**Added enemiesDefeated object:**
```javascript
enemiesDefeated: {
    mole: 0,
    treant: 0,
    slime: 0,
    boss_treant_king: 0
}
```

**File Modified:** `src/scenes/GameScene.js` (Lines 675-691)

**Track enemy type on defeat:**
```javascript
const enemyType = enemy.getData('type');
if (window.gameData && window.gameData.enemiesDefeated && enemyType) {
    if (!window.gameData.enemiesDefeated[enemyType]) {
        window.gameData.enemiesDefeated[enemyType] = 0;
    }
    window.gameData.enemiesDefeated[enemyType]++;

    // Boss特殊处理
    if (enemy.getData('isBoss')) {
        const bossKey = `boss_${enemyType}`;
        if (!window.gameData.enemiesDefeated[bossKey]) {
            window.gameData.enemiesDefeated[bossKey] = 0;
        }
        window.gameData.enemiesDefeated[bossKey]++;
    }
}
```

**File Modified:** `src/utils/SaveManager.js`

**Save statistics (Lines 57-71):**
```javascript
progress: {
    playtimeSeconds: window.gameData?.progress?.playtimeSeconds || 0
},
enemiesDefeated: window.gameData?.enemiesDefeated || {
    mole: 0,
    treant: 0,
    slime: 0,
    boss_treant_king: 0
}
```

**Load statistics (Lines 154-174):**
```javascript
// 恢复游戏进度
window.gameData.progress = saveData.progress;
window.gameData.progress.sessionStartTime = Date.now();
console.log(`📊 游戏时间: ${Math.floor(saveData.progress.playtimeSeconds / 60)}分钟`);

// 恢复敌人击败统计
window.gameData.enemiesDefeated = saveData.enemiesDefeated;
console.log('💀 敌人统计已恢复');
```

### Task 7.4: Statistics Display

**File Modified:** `src/scenes/GameScene.js` (Lines 1291-1383)

**Added `showStatistics()` method:**

Displays comprehensive statistics to console:
- 👤 玩家信息: level, gold, XP
- ⏱️ 游戏时间: formatted as H:M:S
- ⚔️ 战斗统计: total kills, coins, gems
- 💀 敌人击败详情: breakdown by type
- 📜 任务统计: total, active, completed, available
- 🏆 成就统计: unlocked/total

**Usage:**
```javascript
// In browser console
window.game.scene.scenes.find(s => s.scene.key === 'GameScene').showStatistics()
```

**Output Example:**
```
📊 ===== 游戏统计 =====
====================

👤 玩家信息:
  等级: 5
  金币: 1250
  经验: 350/500

⏱️ 游戏时间:
  45分钟 30秒

⚔️ 战斗统计:
  总击败数: 25
  收集金币: 150
  收集宝石: 5

💀 敌人击败详情:
  mole: 15
  treant: 8
  slime: 2
  👑 Boss(treant_king): 1

📜 任务统计:
  总计: 3
  进行中: 1
  已完成: 1
  可接受: 1

🏆 成就统计:
  已解锁: 5/8

====================
📊 统计结束
```

## Data Structure

### Before
```javascript
window.gameData = {
    progress: {
        enemiesDefeated: 0,  // Total only
        totalCoins: 0,
        gemsCollected: 0
    }
}
```

### After
```javascript
window.gameData = {
    progress: {
        enemiesDefeated: 0,
        totalCoins: 0,
        gemsCollected: 0,
        playtimeSeconds: 4500,      // NEW
        sessionStartTime: 1706145600000  // NEW
    },
    enemiesDefeated: {             // NEW
        mole: 15,
        treant: 8,
        slime: 2,
        boss_treant_king: 1
    }
}
```

## Persistence

### Save Format (localStorage)
```json
{
    "version": "1.2.0",
    "timestamp": "2026-01-24T...",
    "player": { ... },
    "scene": { ... },
    "progress": {
        "totalCoins": 150,
        "gemsCollected": 5,
        "enemiesDefeated": 25,
        "playtimeSeconds": 4500
    },
    "enemiesDefeated": {
        "mole": 15,
        "treant": 8,
        "slime": 2,
        "boss_treant_king": 1
    },
    "quests": { ... }
}
```

### Load Behavior
- Restores `playtimeSeconds` from save
- Resets `sessionStartTime` to current time
- Tracking continues from loaded time
- Displays playtime in minutes on load

## Features

1. **Playtime Tracking:**
   - Tracks total seconds played
   - Session-based tracking (resets on load)
   - Continues counting across saves
   - Formats as H:M:S for display

2. **Enemy Type Tracking:**
   - Counts each enemy type separately
   - Special tracking for bosses
   - Extensible (new types auto-initialized)
   - Saved/loaded with game data

3. **Statistics Display:**
   - Console-based display
   - Comprehensive game overview
   - Formatted for readability
   - In-game notification when shown

## Use Cases

1. **Player Progress Tracking:**
   - See total time played
   - Check kill counts by enemy type
   - Review collection progress

2. **Achievement Verification:**
   - Confirm "Defeat 10 moles" achievement
   - Verify boss defeats
   - Check collection milestones

3. **Debugging:**
   - Verify statistics are saving correctly
   - Check enemy tracking is working
   - Validate playtime calculation

4. **Future Enhancements:**
   - Add UI-based statistics screen
   - Create statistics summary on game complete
   - Track additional metrics (damage dealt, etc.)
   - Compare statistics across playthroughs

## Testing Verification

**Manual Testing Steps:**
1. Start game, verify `sessionStartTime` is set
2. Play for 1+ minute, check `playtimeSeconds` increases
3. Defeat enemies, verify `enemiesDefeated[type]` increments
4. Defeat boss, verify `boss_treant_king` tracked
5. Save game, verify statistics in localStorage
6. Load game, verify statistics restored
7. Call `showStatistics()`, verify console output

**Console Commands:**
```javascript
// Check current playtime
window.gameData.progress.playtimeSeconds

// Check enemy stats
window.gameData.enemiesDefeated

// Show full statistics
window.game.scene.scenes.find(s => s.scene.key === 'GameScene').showStatistics()
```

## Files Modified
1. `src/main.js` - Added playtimeSeconds, sessionStartTime, enemiesDefeated object
2. `src/scenes/GameScene.js` - Initialize tracking, update playtime, track enemies, showStatistics()
3. `src/utils/SaveManager.js` - Save/load new statistics fields

## Next Iteration
Comprehensive integration testing (test full game flow)
