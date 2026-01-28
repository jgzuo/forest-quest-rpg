# Iteration 5: Comprehensive Regression Test Plan

**Date**: 2026-01-23
**Purpose**: Final bug-fixing iteration before Milestone 4
**Goal**: Ensure all systems work together correctly

---

## Test Categories

### 1. Core Gameplay Loop Test
**Goal**: Verify complete playability from start to current end

**Test Steps**:
1. Start new game
2. Walk around town
3. Talk to village elder
4. Visit shop (press E near merchant)
5. Walk to forest
6. Fight enemies
7. Gain XP and level up
8. Collect gold
9. Save game (F5)
10. Refresh browser
11. Load game (F9)
12. Verify all stats restored
13. Walk to cave
14. Return to town

**Expected Results**:
- ✅ All movement smooth
- ✅ No crashes
- ✅ All interactions work
- ✅ Save/load works correctly
- ✅ No console errors

---

### 2. Combat System Regression Test
**Goal**: Verify Iteration 1 & 2 fixes still work

**Test Cases**:

#### Test 2.1: Enemy Spawning
```javascript
// In forest scene, check console:
const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
const enemies = scene.getEnemiesGroup();
console.log('Enemy count:', enemies ? enemies.getChildren().length : 0);
```
**Expected**: 8 enemies (5 moles + 3 treants)

#### Test 2.2: Player Attack
**Steps**:
1. Walk close to enemy
2. Press Spacebar
3. Check console for: "⚔️ Hit enemy! Damage: 20"
4. Verify enemy HP decreases

**Expected**: Enemy takes damage, HP bar updates

#### Test 2.3: Enemy AI
**Steps**:
1. Stand still
2. Observe enemies moving toward player
3. Check enemy paths are reasonable

**Expected**: Enemies track player, HP bars follow

#### Test 2.4: Player Damage
**Steps**:
1. Let enemy touch player
2. Check console for: "💔 Player hit by mole! Damage: 5"
3. Verify screen shakes
4. Verify player transparency (alpha 0.5)
5. Wait 1 second
6. Try to get hit again

**Expected**: Only one damage per second per enemy

#### Test 2.5: Enemy Death
**Steps**:
1. Attack enemy until HP reaches 0
2. Check console for XP and gold rewards
3. Verify enemy disappears
4. Check UI updates

**Expected**: Enemy death, rewards given, UI updated

---

### 3. Save/Load System Test
**Goal**: Verify Iteration 3 fixes work correctly

#### Test 3.1: Gold Persistence
**Steps**:
1. Note current gold
2. Kill enemies to gain more gold
3. Press F5 (save)
4. Refresh browser
5. Press F9 (load)
6. Verify gold count matches

**Expected**: ✅ Gold saved correctly (critical fix!)

#### Test 3.2: Facing Direction
**Steps**:
1. Move left (character flips)
2. Press F5 (save)
3. Refresh & load
4. Verify character still facing left

**Expected**: ✅ Facing preserved

#### Test 3.3: Auto-Save Triggers
**Steps**:
1. Level up and check console
2. Switch scenes and check console
3. Verify "💾 自动保存成功" appears

**Expected**: ✅ Auto-save works on level up and scene switch

#### Test 3.4: Corrupted Save Handling
**Steps**:
1. Open DevTools → Application → Local Storage
2. Manually corrupt the save data
3. Try to load with F9

**Expected**: ✅ Error message "存档损坏!" appears

---

### 4. Scene Switching Test
**Goal**: Verify Iteration 4 improvements work

#### Test 4.1: All Scene Transitions
**Test Matrix**:
| From | To | Check Spawn Point |
|------|-----|------------------|
| Town | Forest | (100, 300) |
| Forest | Town | (650, 300) |
| Forest | Cave | (100, 100) |
| Cave | Forest | (700, 500) |

**Steps**:
1. Test each transition
2. Run: `scene.sceneManager.getSceneInfo()` in console
3. Verify playerPosition matches spawnPoint

**Expected**: ✅ All spawn points accurate

#### Test 4.2: No Infinite Loops
**Steps**:
1. Rapidly enter teleport zones
2. Try to teleport multiple times
3. Watch console for cooldown messages

**Expected**: ✅ Cooldown prevents loops

#### Test 4.3: Scene Cleanup
**Steps**:
1. Note enemy count in forest
2. Switch to town
3. Switch back to forest
4. Verify old enemies are gone, new ones spawned

**Expected**: ✅ Scene cleanup complete

---

### 5. Integration Tests

#### Test 5.1: Combat + Save Integration
**Steps**:
1. Fight enemies, gain XP/gold
2. Level up during combat
3. Check console for auto-save
4. Refresh and load
5. Verify level, XP, gold correct

**Expected**: ✅ Auto-save triggered, data correct

#### Test 5.2: Scene Switch + Combat
**Steps**:
1. Fight enemy to low HP
2. Quickly switch scene before enemy dies
3. Switch back
4. Verify enemy not there (cleaned up)

**Expected**: ✅ Scene cleanup removes enemy

#### Test 5.3: All Systems Together
**Steps**:
1. 30-minute playthrough
2. Visit all scenes
3. Fight multiple enemies
4. Level up multiple times
5. Save/load multiple times
6. Use shop

**Expected**: ✅ No crashes, smooth gameplay

---

### 6. Performance Tests

#### Test 6.1: Frame Rate
**Steps**:
1. Open DevTools → Performance
2. Record 30 seconds of gameplay
3. Check frame rate stays near 60 FPS

**Expected**: ✅ Consistent 60 FPS (or close to it)

#### Test 6.2: Memory Leaks
**Steps**:
1. Open DevTools → Memory
2. Scene switch 10 times
3. Check memory usage doesn't grow

**Expected**: ✅ Memory stable (cleanup working)

#### Test 6.3: Console Errors
**Steps**:
1. Play for 10 minutes
2. Check console for errors

**Expected**: ✅ No errors, only info logs

---

### 7. Edge Cases

#### Test 7.1: Death Test
**Steps**:
1. Let player HP reach 0
2. Verify game over screen appears
3. Press R to restart
4. Verify game resets correctly

**Expected**: ✅ Game over and restart work

#### Test 7.2: Boundary Test
**Steps**:
1. Walk to edge of each scene
2. Verify player stops at edge

**Expected**: ✅ World bounds working

#### Test 7.3: Rapid Input Test
**Steps**:
1. Mash all keys (WASD, Space, E)
2. Rapidly switch directions
3. Attack while moving

**Expected**: ✅ No crashes, animations work

---

## Bug Tracking Template

Use this format to document any bugs found:

```
Bug #X: [Title]
Severity: [CRITICAL/HIGH/MEDIUM/LOW]
Location: [File:Line]
Description: [What happens]
Steps to Reproduce: [1, 2, 3]
Expected: [What should happen]
Actual: [What actually happens]
Fix: [How to fix it]
Status: [FIXED/VERIFIED/PENDING]
```

---

## Quick Test Commands

### Browser Console

```javascript
// Get complete game state
const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
console.table(scene.sceneManager.getSceneInfo());

// Check player stats
console.log({
    level: scene.player.level,
    hp: scene.player.hp,
    maxHp: scene.player.maxHp,
    xp: scene.player.xp,
    gold: scene.player.gold,
    facing: scene.player.facing
});

// Test save directly
scene.saveManager.saveGame();

// Test load directly
scene.saveManager.loadGame();

// Force level up (for testing)
scene.player.xp = scene.player.xpToNextLevel;
scene.levelUp();

// Teleport to specific scene
scene.sceneManager.switchScene('forest', { x: 100, y: 300 });

// Kill all enemies (for testing)
const enemies = scene.getEnemiesGroup();
enemies.getChildren().forEach(e => e.destroy());

// Give player max gold
scene.player.gold = 99999;
scene.updateUI();
```

---

## Success Criteria

Iteration 5 is complete when:
- [ ] All core gameplay tests pass
- [ ] All combat tests pass
- [ ] All save/load tests pass
- [ ] All scene switching tests pass
- [ ] Integration tests pass
- [ ] Performance is acceptable
- [ ] No critical bugs remain
- [ ] No console errors during 30-minute playthrough

---

## Next Steps After Iteration 5

If all tests pass:
- → Proceed to Milestone 4 (Quest System)
- → Start Iteration 6 (Quest Manager)

If bugs found:
- → Fix critical bugs first
- → Re-run failed tests
- → Verify fixes don't break other features

---

**Test Execution Date**: _____________
**Tester**: _____________
**Overall Result**: [PASS/FAIL]
**Notes**: _____________
