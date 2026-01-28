# Iteration 1: Combat System Debugging Guide

**Date**: 2026-01-23
**Goal**: Fix combat system - enemy spawning and attack detection
**Status**: In Progress

---

## Current Issues Identified

### 1. Test Configuration (SKIPPED per user request)
- Import/export mismatch in test files
- Tests not runnable
- **Decision**: Manual testing only

### 2. Potential Combat Issues (from code review)

#### Issue A: Enemy Group Reference
**Location**: `GameScene.js:327`, `GameScene.js:632`
**Problem**: Fallback logic for accessing enemies group
```javascript
this.physics.add.overlap(hitbox, this.sceneManager?.enemies || this.enemies, ...)
const enemies = this.sceneManager?.enemies || this.enemies;
```
**Impact**: May cause undefined enemies if sceneManager not initialized
**Status**: Needs verification

#### Issue B: Hitbox Timing
**Location**: `GameScene.js:338-341`
**Problem**: Hitbox destroyed after 100ms, but overlap callback might not execute
```javascript
this.time.delayedCall(100, () => {
    if (hitbox.active) hitbox.destroy();
});
```
**Impact**: Attacks might miss on slower machines
**Fix**: Increase to 200ms if needed

#### Issue C: HP Bar Position Update
**Location**: `GameScene.js:650-652`
**Status**: ✅ Code looks correct - HP bars follow enemies

#### Issue D: Enemy Data Access
**Location**: `GameScene.js:344-363`
**Status**: ✅ Consistent use of `getData('hp')` pattern

---

## Manual Testing Procedure

### Step 1: Start the Game
```bash
cd Code/forest-quest-rpg
npx live-server --port=8080
```

### Step 2: Open in Browser
Navigate to: http://localhost:8080

### Step 3: Open Developer Tools
- Press F12 or right-click → Inspect
- Go to Console tab

### Step 4: Navigate to Forest Scene
- Use WASD to walk right
- Find the blue teleport circle (forest entrance)
- Walk into it to teleport to forest

### Step 5: Run Test Suite

#### Test 1: Enemy Spawning
**Console Command**:
```javascript
const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
const enemies = scene.sceneManager?.enemies || scene.enemies;
console.log('✅ Test 1 - Enemy Count:', enemies ? enemies.getChildren().length : 0);
console.log('✅ Test 1 - Expected: 8 (5 moles + 3 treants)');
```

**Expected Result**: 8 enemies spawned
**If Failed**: Run Test 6

#### Test 2: Enemy Data Integrity
**Console Command**:
```javascript
const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
const enemies = scene.sceneManager?.enemies || scene.enemies;
if (enemies && enemies.getChildren().length > 0) {
    const enemy = enemies.getChildren()[0];
    console.log('✅ Test 2 - Enemy HP:', enemy.getData('hp'));
    console.log('✅ Test 2 - Enemy Max HP:', enemy.getData('maxHp'));
    console.log('✅ Test 2 - Enemy Attack:', enemy.getData('attack'));
    console.log('✅ Test 2 - Enemy Speed:', enemy.getData('speed'));
} else {
    console.log('❌ Test 2 Failed - No enemies found');
}
```

**Expected Result**: All data values present (hp: 30/80, attack: 5/12, speed: 50/30)
**If Failed**: Check `SceneManager.spawnEnemy()` method

#### Test 3: HP Bar Existence
**Console Command**:
```javascript
const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
const enemies = scene.sceneManager?.enemies || scene.enemies;
if (enemies) {
    enemies.getChildren().forEach((enemy, index) => {
        console.log(`✅ Test 3 - Enemy ${index}: HP Bar=${enemy.hpBar ? '✓' : '✗'}, HP Bar BG=${enemy.hpBarBg ? '✓' : '✗'}`);
    });
}
```

**Expected Result**: All enemies have both hpBar and hpBarBg
**If Failed**: Check `SceneManager.spawnEnemy()` lines 600-618

#### Test 4: Manual Attack Test
**Console Command**:
```javascript
const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
const enemies = scene.sceneManager?.enemies || scene.enemies;
if (enemies && enemies.getChildren().length > 0) {
    const enemy = enemies.getChildren()[0];
    console.log('✅ Test 4 - Enemy HP before attack:', enemy.getData('hp'));
    scene.hitEnemy(enemy);
    console.log('✅ Test 4 - Enemy HP after attack:', enemy.getData('hp'));
} else {
    console.log('❌ Test 4 Failed - No enemies to attack');
}
```

**Expected Result**: Enemy HP decreases by player.attack value (default: 20)
**If Failed**: Check `GameScene.hitEnemy()` method

#### Test 5: Player Attack via Keyboard
**Manual Action**:
1. Walk close to an enemy
2. Press Spacebar
3. Observe enemy HP decrease

**Expected Result**:
- Attack animation plays
- Enemy takes damage
- Damage number appears
- HP bar shrinks

**If Failed**:
- Check console for errors
- Verify hitbox overlap detection
- Check attack cooldown (300ms)

#### Test 6: Manual Enemy Spawn
**Console Command** (if enemies didn't spawn):
```javascript
const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
scene.sceneManager.spawnEnemiesInForest();
console.log('✅ Test 6 - Enemies spawned manually');
```

---

## Known Issues & Fixes

### Issue #1: Enemies Not Spawning
**Symptom**: `enemies.getChildren().length` returns 0
**Possible Causes**:
1. Scene not fully initialized
2. SceneManager not loaded
3. Assets not loaded

**Fix**:
```javascript
// Check if SceneManager is initialized
const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
console.log('SceneManager exists:', scene.sceneManager ? 'Yes' : 'No');

// Force spawn enemies
scene.sceneManager.spawnEnemiesInForest();
```

### Issue #2: Attack Not Working
**Symptom**: Pressing Spacebar does nothing
**Possible Causes**:
1. Player too far from enemy
2. Hitbox timing too short
3. Attack cooldown not reset

**Fix**:
```javascript
// Increase hitbox lifetime
// In GameScene.js line 338, change 100 to 200
this.time.delayedCall(200, () => {
    if (hitbox.active) hitbox.destroy();
});
```

### Issue #3: Enemies Not Moving
**Symptom**: Enemies spawn but don't track player
**Possible Causes**:
1. Physics system paused
2. Speed data not set
3. Update loop not running

**Fix**:
```javascript
// Check physics
const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
console.log('Physics active:', scene.physics.world.isRunning ? 'Yes' : 'No');

// Check enemy speed
const enemies = scene.sceneManager?.enemies || scene.enemies;
enemies.getChildren().forEach(enemy => {
    console.log('Enemy speed:', enemy.getData('speed'));
});
```

---

## Fixes Applied

### Fix 1: Increase Hitbox Lifetime (if needed)
**File**: `src/scenes/GameScene.js:338`
**Change**: 100ms → 200ms
**Reason**: Give overlap callback more time to execute

### Fix 2: Add Debug Logging (if needed)
**File**: `src/scenes/GameScene.js:308-342`
**Add**: Console logs in playerAttack() method

### Fix 3: Ensure Enemy Group Reference (if needed)
**File**: `src/scenes/GameScene.js:327, 632`
**Add**: Fallback for missing sceneManager

---

## Test Results Template

After testing, fill this out:

```
=== ITERATION 1 TEST RESULTS ===

Date: 2026-01-23
Tester: _____________

Test 1 - Enemy Spawning:
Expected: 8 enemies
Actual: _____ enemies
Status: [PASS/FAIL]

Test 2 - Enemy Data:
Status: [PASS/FAIL]
Details: ___________

Test 3 - HP Bars:
Status: [PASS/FAIL]
Details: ___________

Test 4 - Manual Attack:
Status: [PASS/FAIL]
Details: ___________

Test 5 - Keyboard Attack:
Status: [PASS/FAIL]
Details: ___________

Overall Status: [PASS/FAIL]

Bugs Found:
1. ___________
2. ___________
3. ___________

Fixes Applied:
1. ___________
2. ___________
3. ___________
```

---

## Next Steps

After completing manual testing:

1. **If all tests PASS**: Proceed to Iteration 2
2. **If tests FAIL**: Document bugs, apply fixes, re-test
3. **Update PROJECT_STATUS.md**: Mark Iteration 1 as complete

---

## Quick Reference

### Key Files
- `src/scenes/GameScene.js` - Combat logic (lines 308-395)
- `src/utils/SceneManager.js` - Enemy spawning (lines 500-621)
- `test-combat.html` - Debug test page

### Key Methods
- `GameScene.playerAttack()` - Player attack logic
- `GameScene.hitEnemy()` - Damage application
- `GameScene.enemyDeath()` - Enemy cleanup
- `SceneManager.spawnEnemiesInForest()` - Enemy spawning
- `SceneManager.spawnEnemy()` - Individual enemy creation

### Console Commands
```javascript
// Get GameScene
const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');

// Get enemies
const enemies = scene.sceneManager?.enemies || scene.enemies;

// Spawn enemies
scene.sceneManager.spawnEnemiesInForest();

// Test attack
scene.hitEnemy(enemies.getChildren()[0]);
```

---

**End of Iteration 1 Debug Guide**
