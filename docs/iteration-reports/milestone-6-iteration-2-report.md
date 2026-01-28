# Milestone 6 - Iteration 2: New Enemies - Summary

**Date**: 2026-01-24
**Iteration**: 2 of 10 (Milestone 6)
**Duration**: ~1 hour
**Status**: ✅ COMPLETE

---

## Objectives

### Primary Goals
1. ✅ Design 2 new enemy types (Bat, Skeleton) with unique stats
2. ✅ Implement enemy AI with behavior system
3. ✅ Add enemy spawn points in Cave scene
4. ⚠️ Test enemy flow (code implemented, manual testing pending)

---

## Enemies Added

### Enemy 1: 蝙蝠 (Bat)
- **Type**: `bat`
- **HP**: 25
- **ATK**: 8
- **Speed**: 90 (fast)
- **XP**: 20
- **Gold**: 15
- **Behavior**: `flying` - Evasive movement with random direction changes
- **Location**: Cave (5 spawns)
- **Sprite**: Purple-tinted placeholder (mole-side)

### Enemy 2: 骷髅战士 (Skeleton Warrior)
- **Type**: `skeleton`
- **HP**: 60
- **ATK**: 15
- **Speed**: 40 (slow)
- **XP**: 40
- **Gold**: 30
- **Behavior**: `undead` - Steady direct chase
- **Location**: Cave (3 spawns)
- **Sprite**: White-tinted placeholder (treant)

---

## Code Changes

### Enemy Definitions
**File**: `src/main.js` (Lines 63-86)

Added enemy definition library:
```javascript
enemyDefinitions: {
    bat: {
        name: '蝙蝠',
        type: 'bat',
        hp: 25,
        attack: 8,
        speed: 90,
        xp: 20,
        gold: 15,
        behavior: 'flying',
        description: '快速飞行的敌人，难以命中'
    },
    skeleton: {
        name: '骷髅',
        type: 'skeleton',
        hp: 60,
        attack: 15,
        speed: 40,
        xp: 40,
        gold: 30,
        behavior: 'undead',
        description: '不死战士，攻击力强但移动缓慢'
    }
}
```

### Enemy Spawn Enhancements
**File**: `src/utils/SceneManager.js` (Lines 578-640)

**Cave Enemy Distribution**:
- 5 Bats (fast, evasive)
- 3 Skeletons (slow, powerful)
- 2 Slimes (reduced from 3)
- 1 Boss (Treant King)

### Enemy AI Behavior System
**File**: `src/scenes/GameScene.js` (Lines 1138-1222)

**Bat AI**:
- Random direction changes every 1.5 seconds (±75 degrees)
- Occasional vertical movement bursts
- High speed (90) makes them difficult to hit

**Skeleton AI**:
- Steady, direct pursuit
- Lower speed (40) but predictable
- Higher damage output (15 ATK)

---

## Technical Implementation

### Behavior Flag System
```
Enemy Creation
    ↓
Set behavior flag (flying/undead)
    ↓
Update Loop Checks Behavior
    ↓
┌─────────────┬─────────────────┐
│  Flying     │  Undead         │
│  Evasive    │  Direct Chase   │
│  High Speed │  High Damage    │
└─────────────┴─────────────────┘
```

### AI Movement Calculation
**Bat**:
```javascript
// Random direction offset
directionOffset = (Math.random() - 0.5) * 1.5; // ±75°
velocityX = Math.cos(angle + directionOffset) * speed;
velocityY = Math.sin(angle + directionOffset) * speed;
```

**Skeleton**:
```javascript
// Direct pursuit
velocityX = Math.cos(angle) * speed;
velocityY = Math.sin(angle) * speed;
```

---

## Testing Status

### Automated Testing
- **Status**: Not executed (test environment non-functional)
- **Plan**: Manual testing when environment fixed

### Manual Testing Checklist
**Enemy Spawning**:
- [ ] 5 bats spawn in cave
- [ ] 3 skeletons spawn in cave
- [ ] 2 slimes spawn in cave
- [ ] Boss spawns correctly

**Enemy Behaviors**:
- [ ] Bats move erratically (change direction)
- [ ] Bats move faster than other enemies
- [ ] Skeletons move steadily toward player
- [ ] Skeletons are slower but hit harder

**Combat Balance**:
- [ ] Bat damage (8) feels balanced
- [ ] Skeleton damage (15) feels threatening
- [ ] Bat speed (90) makes them challenging
- [ ] Skeleton speed (40) makes them predictable

**Loot Drops**:
- [ ] Bat drops 20 XP, 15 gold
- [ ] Skeleton drops 40 XP, 30 gold

---

## Known Issues

### Placeholder Sprites
The new enemies use placeholder sprites:
- **Bat**: Purple-tinted mole sprite
- **Skeleton**: White-tinted treant sprite

**Resolution**: Create proper sprite assets in future iteration

### Test Environment
Playwright tests are non-functional in current environment.

**Resolution**: Manual testing required

---

## Next Steps

### Immediate (Future Iterations)
- [ ] Manual testing of enemy behaviors
- [ ] Create proper bat and skeleton sprites
- [ ] Add elite enemy variants
- [ ] Implement combat enhancements (skills)

### Future Iterations
- Iteration 3: Elite Enemies
- Iteration 4-5: Skill System
- Iteration 6: Combat Enhancements
- Iteration 7: Visual Polish
- Iteration 8: Equipment System
- Iteration 9: Quality of Life
- Iteration 10: Testing & Polish

---

## Files Modified

1. `src/main.js` - Added enemy definitions (bat, skeleton)
2. `src/utils/SceneManager.js` - Updated cave spawn distribution
3. `src/scenes/GameScene.js` - Enhanced enemy AI with behavior system

**Total**: 3 files, ~100 lines added

---

## Summary

### What Worked
- ✅ Enemy definition system is clean and extensible
- ✅ Behavior flags allow for AI customization
- ✅ Spawn distribution creates variety in caves

### What Could Be Improved
- Placeholder sprites need replacement
- Enemy behaviors could be more complex (dodge, special attacks)
- No visual distinction between enemy types beyond tint

### Lessons Learned
- Behavior-based AI system is flexible
- Speed and attack differences create tactical variety
- Placeholder sprites are acceptable for initial implementation

---

**Iteration Status**: ✅ CORE FUNCTIONALITY COMPLETE
**Testing**: Pending manual verification
**Quality**: ⭐⭐⭐☆☆ (3/5 - placeholder sprites)
