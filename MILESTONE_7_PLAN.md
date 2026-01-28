# Forest Quest RPG - Milestone 7 Development Plan

**Project**: Forest Quest RPG - Content & Gameplay Expansion
**Milestone**: 7 - Narrative & Gameplay Depth
**Current Iteration**: 3 - Progression Variety ✅ COMPLETE
**Status**: 🎉 Sprint 3 Complete - Ready for Testing
**Last Updated**: 2026-01-26

---

## 🎯 Overall Goal

Transform Forest Quest RPG from a technical demo into a engaging game experience by:
1. **Enhancing Narrative**: Add story context, NPC personality, and world-building
2. **Deepening Gameplay**: Add strategic combat choices, progression variety, and replayability
3. **Expanding Content**: Add new features, items, enemies, and areas
4. **Polishing Experience**: Improve UI feedback, tutorials, and quality of life

---

## 📊 Current Game State Review

### ✅ Completed (Milestone 1-6)
- Core combat system (melee, skills, MP, cooldowns)
- 6 quests (3 main + 3 side quests with prerequisites)
- 9 enemy types (3 normal + 3 elite + 3 special)
- Boss battle system (3-phase Treant King)
- Save/load system (auto-save + manual)
- Shop system (8 items)
- Achievement system (4 achievements)
- Skill system (4 skills, level-based unlocks)
- Visual polish (crits, effects, animations)

### 🎮 Current Limitations
- **Weak Story**: Minimal narrative context, no character development
- **Repetitive Combat**: No tactical depth, all enemies same strategy
- **Simple Progression**: Only stat increases, no build variety
- **Limited Content**: Only 3 areas, 6 quests, 8 shop items
- **No Endgame**: Nothing to do after main quests
- **Basic UI**: Minimal feedback, no tutorials

---

## 🗺️ Milestone 7 Roadmap

### **Phase 1: Story & Dialogue Enhancement** ⭐ HIGH PRIORITY
**Objective**: Add narrative context and NPC personality
**Estimated Time**: 2-3 hours
**Impact**: HIGH (Improves immersion and player motivation)

**Tasks**:
1. **Main Story Framework** (Priority: CRITICAL)
   - [ ] Create story progression system (intro → conflict → climax → resolution)
   - [ ] Add intro scene with narrative context
   - [ ] Add boss defeat cutscene
   - [ ] Add victory ending scene
   - [ ] Create StoryManager class

2. **NPC Dialogue Expansion** (Priority: HIGH)
   - [ ] Add dialogue trees for Elder (村长)
   - [ ] Add dialogue trees for Merchant (商人)
   - [ ] Add multiple conversation states (greeting, quest progress, post-quest)
   - [ ] Add personality hints and lore snippets
   - [ ] Create DialogueManager class

3. **Quest Story Integration** (Priority: HIGH)
   - [ ] Add quest descriptions with narrative context
   - [ ] Add quest completion dialogue
   - [ ] Add quest rewards with story significance
   - [ ] Connect quests into cohesive story arc

4. **Environmental Storytelling** (Priority: MEDIUM)
   - [ ] Add scene descriptions on load
   - [ ] Add flavor text for areas
   - [ ] Add item lore in shop descriptions
   - [ ] Add enemy lore in bestiary

---

### **Phase 2: Combat Depth Enhancement** ⭐ HIGH PRIORITY
**Objective**: Add strategic choices to combat
**Estimated Time**: 2-3 hours
**Impact**: HIGH (Makes combat engaging, not repetitive)

**Tasks**:
1. **Enemy Weakness System** (Priority: HIGH)
   - [ ] Add damage type system (physical, magical, fire, ice)
   - [ ] Assign damage types to player skills
   - [ ] Add enemy weaknesses/resistances
   - [ ] Visual feedback for effective/not effective damage
   - [ ] Create DamageTypeManager class

2. **Enemy Attack Variety** (Priority: HIGH)
   - [ ] Add different attack patterns per enemy type
   - [ ] Implement telegraphed attacks (charging animations)
   - [ ] Add dodge timing window
   - [ ] Add block/parry system (optional)
   - [ ] Add enemy ability cooldowns

3. **Combat Status Effects** (Priority: MEDIUM)
   - [ ] Add poison (damage over time)
   - [ ] Add slow (reduced movement)
   - [ ] Add stun (cannot act)
   - [ ] Add knockback (pushback on hit)
   - [ ] Visual indicators for status effects

4. **Tactical Items** (Priority: MEDIUM)
   - [ ] Add bombs (AOE damage)
   - [ ] Add traps (crowd control)
   - [ ] Add consumable buffs (temporary stat boost)
   - [ ] Add item cooldowns

---

### **Phase 3: Progression Variety** ⭐ HIGH PRIORITY
**Objective**: Add build diversity and meaningful choices
**Estimated Time**: 2-3 hours
**Impact**: HIGH (Replayability and character expression)

**Tasks**:
1. **Equipment System** (Priority: CRITICAL)
   - [ ] Create equipment slots (weapon, armor, accessory)
   - [ ] Add 5 weapons per tier (swords, axes, bows, staves)
   - [ ] Add 5 armor pieces per tier (light, medium, heavy)
   - [ ] Add 5 accessories per tier (rings, amulets, belts)
   - [ ] Add equipment stats (ATK, DEF, HP, MP, crit chance)
   - [ ] Create EquipmentManager class

2. **Skill Tree System** (Priority: HIGH)
   - [ ] Create skill tree with branches (offense, defense, utility)
   - [ ] Add skill points per level (1 point/level)
   - [ ] Add passive skills (stat boosts, new abilities)
   - [ ] Add active skill upgrades (improve existing skills)
   - [ ] Visual skill tree UI
   - [ ] Create SkillTreeManager class

3. **Talent/Perk System** (Priority: MEDIUM)
   - [ ] Add talent choices at levels 5, 10, 15, 20
   - [ ] Each talent offers 2-3 mutually exclusive options
   - [ ] Examples: "Sword Master" (ATK+20%) vs "Tank" (HP+30%)
   - [ ] Respec option (cost gold)

4. **Inventory System** (Priority: MEDIUM)
   - [ ] Create inventory UI (grid-based)
   - [ ] Add equipment comparison
   - [ ] Add item sorting and filtering
   - [ ] Add item rarity colors (common, uncommon, rare, legendary)

---

### **Phase 4: Content Expansion** ⭐ MEDIUM PRIORITY
**Objective**: Add new areas, enemies, quests
**Estimated Time**: 3-4 hours
**Impact**: MEDIUM (More content = more playtime)

**Tasks**:
1. **New Area: Snow Mountain** (Priority: HIGH)
   - [ ] Create snow mountain scene
   - [ ] Add ice-themed enemies (yeti, ice elemental, frost wolf)
   - [ ] Add ice-themed elite enemies
   - [ ] Add snow mechanics (slippery terrain, visibility)
   - [ ] Connect to cave

2. **New Area: Volcanic Cavern** (Priority: HIGH)
   - [ ] Create volcanic cavern scene
   - [ ] Add fire-themed enemies (fire elemental, lava slime, fire drake)
   - [ ] Add fire-themed elite enemies
   - [ ] Add lava hazards (damage zones)
   - [ ] Connect to snow mountain

3. **New Boss: Dragon Lord** (Priority: HIGH)
   - [ ] Create dragon boss with multiple phases
   - [ ] Phase 1: Ground attacks (tail whip, bite)
   - [ ] Phase 2: AOE breath attacks
   - [ ] Phase 3: Enraged mode with flight
   - [ ] Unique drops (legendary equipment)

4. **New Quest Chain** (Priority: MEDIUM)
   - [ ] Create 5-quest story arc spanning all areas
   - [ ] Quest 1: Investigate strange disturbances
   - [ ] Quest 2: Defeat snow mountain guardian
   - [ ] Quest 3: Explore volcanic cavern
   - [ ] Quest 4: Collect dragon artifacts
   - [ ] Quest 5: Defeat Dragon Lord

5. **New Enemy Types** (Priority: MEDIUM)
   - [ ] Add ranged enemies (archers, mages)
   - [ ] Add summoner enemies (call reinforcements)
   - [ ] Add tank enemies (high HP, low damage)
   - [ ] Add support enemies (heal/buff allies)

6. **Mini-Bosses** (Priority: LOW)
   - [ ] Add mini-bosses in each area
   - [ ] Spawn every 5 minutes or after X enemies killed
   - [ ] Drop rare loot
   - [ ] Announce spawn with warning

---

### **Phase 5: Endgame Content** ⭐ MEDIUM PRIORITY
**Objective**: Keep players engaged after main story
**Estimated Time**: 2-3 hours
**Impact**: MEDIUM (Extends game lifespan)

**Tasks**:
1. **Boss Rush Mode** (Priority: HIGH)
   - [ ] Fight all bosses back-to-back
   - [ ] Timer-based scoring
   - [ ] Leaderboard tracking (local)
   - [ ] Unlockable after beating main story

2. **Infinite Dungeon** (Priority: HIGH)
   - [ ] Procedurally generated floors
   - [ ] Increasing difficulty each floor
   - [ ] Special rewards every 10 floors
   - [ ] Death starts over from floor 1

3. **Challenge Arenas** (Priority: MEDIUM)
   - [ ] Survival arena (endless waves)
   - [ ] Time attack arenas (beat X enemies in Y seconds)
   - [ ] Puzzle arenas (environmental hazards)
   - [ ] Unlock special achievements

4. **New Game+** (Priority: MEDIUM)
   - [ ] Keep equipment and level on replay
   - [ ] Enemies deal 2x damage, have 2x HP
   - [ ] Better loot drop rates
   - [ ] Unlock exclusive items

---

### **Phase 6: UI & UX Improvements** ⭐ MEDIUM PRIORITY
**Objective**: Improve game feel and usability
**Estimated Time**: 1-2 hours
**Impact**: MEDIUM (Quality of life)

**Tasks**:
1. **Tutorial System** (Priority: HIGH)
   - [ ] Add interactive tutorial for first-time players
   - [ ] Cover movement, combat, skills, shops
   - [ ] Progress hints during gameplay
   - [ ] Skipable for experienced players

2. **Enhanced UI Feedback** (Priority: HIGH)
   - [ ] Add damage numbers popups (already done, enhance)
   - [ ] Add pickup text (auto-loot notifications)
   - [ ] Add quest progress popups
   - [ ] Add achievement unlock toasts
   - [ ] Add cooldown countdown timers

3. **Minimap** (Priority: MEDIUM)
   - [ ] Create minimap UI
   - [ ] Show player position
   - [ ] Show NPC locations
   - [ ] Show teleport destinations
   - [ ] Show unexplored areas (fog of war)

4. **Settings Menu** (Priority: MEDIUM)
   - [ ] Volume controls (music, SFX)
   - [ ] Graphics options (particle quality, shadows)
   - [ ] Keybinding customization
   - [ ] Display options (fullscreen, resolution)

5. **Pause Menu** (Priority: LOW)
   - [ ] Pause game with ESC
   - [ ] Resume, Settings, Quit options
   - [ ] Show current stats

---

### **Phase 7: Audio & Atmosphere** ⭐ LOW PRIORITY
**Objective**: Add polish with sound and music
**Estimated Time**: 2-3 hours (depending on asset availability)
**Impact**: MEDIUM (Immersion)

**Tasks**:
1. **Sound Effects** (Priority: HIGH)
   - [ ] Add attack hit sounds
   - [ ] Add skill cast sounds
   - [ ] Add enemy death sounds
   - [ ] Add UI click sounds
   - [ ] Add pickup sounds
   - [ ] Use free assets (Freesound.org) or generate programmatically

2. **Background Music** (Priority: MEDIUM)
   - [ ] Town theme (peaceful)
   - [ ] Forest theme (ambient)
   - [ ] Cave theme (tense)
   - [ ] Boss battle theme (epic)
   - [ ] Victory theme (triumphant)
   - [ ] Use free assets or generate procedurally

3. **Audio Manager** (Priority: MEDIUM)
   - [ ] Implement AudioManager class (already exists, expand)
   - [ ] Add volume controls
   - [ ] Add music crossfading between scenes
   - [ ] Add dynamic music (combat vs exploration)

---

### **Phase 8: Performance & Polish** ⭐ LOW PRIORITY
**Objective**: Ensure smooth 60 FPS experience
**Estimated Time**: 1-2 hours
**Impact**: LOW (Quality assurance)

**Tasks**:
1. **Performance Profiling** (Priority: HIGH)
   - [ ] Profile skill effects with many enemies
   - [ ] Test particle systems on low-end devices
   - [ ] Identify bottlenecks
   - [ ] Optimize rendering (object pooling, sprite atlases)

2. **Bug Fixes** (Priority: HIGH)
   - [ ] Fix any discovered bugs from playtesting
   - [ ] Fix edge cases (save/load errors, collision bugs)
   - [ ] Add error handling for corrupted saves

3. **Code Refactoring** (Priority: MEDIUM)
   - [ ] Extract magic numbers to constants
   - [ ] Improve code organization
   - [ ] Add JSDoc comments
   - [ ] Remove dead code

4. **Testing & QA** (Priority: HIGH)
   - [ ] Playtest all new features
   - [ ] Test on different browsers
   - [ ] Test save/load extensively
   - [ ] Balance adjustments

---

## 📈 Execution Priority

### Sprint 1 (Week 1-2): Narrative Foundation
**Focus**: Phase 1 (Story & Dialogue)
**Deliverables**:
- StoryManager with intro/outro scenes
- Enhanced NPC dialogue
- Quest story integration

### Sprint 2 (Week 2-3): Combat Depth
**Focus**: Phase 2 (Combat Enhancement)
**Deliverables**:
- Damage type system
- Enemy attack variety
- Status effects

### Sprint 3 (Week 3-4): Progression Variety
**Focus**: Phase 3 (Progression)
**Deliverables**:
- Equipment system
- Skill tree system
- Talent system

### Sprint 4 (Week 4-5): Content Expansion
**Focus**: Phase 4 (New Content)
**Deliverables**:
- Snow Mountain area
- Volcanic Cavern area
- Dragon Lord boss
- New quest chain

### Sprint 5 (Week 5-6): Endgame & Polish
**Focus**: Phase 5-6 (Endgame + UI)
**Deliverables**:
- Boss Rush mode
- Infinite Dungeon
- Tutorial system
- UI improvements

### Sprint 6 (Week 6+): Audio & Final Polish
**Focus**: Phase 7-8 (Audio + Performance)
**Deliverables**:
- Sound effects
- Background music
- Performance optimization
- Bug fixes

---

## 🎯 Success Criteria

### Milestone 7 Complete When:
- ✅ Story intro and ending implemented
- ✅ All NPCs have dialogue trees
- ✅ Combat has strategic depth (damage types, status effects)
- ✅ Equipment system functional
- ✅ At least 2 new areas added
- ✅ At least 1 new boss added
- ✅ Tutorial system in place
- ✅ All features documented
- ✅ Game tested from start to finish
- ✅ 60 FPS maintained

---

## 📝 Implementation Notes

### File Organization
```
src/
├── managers/          (NEW)
│   ├── StoryManager.js
│   ├── DialogueManager.js
│   ├── EquipmentManager.js
│   ├── SkillTreeManager.js
│   └── DamageTypeManager.js
├── systems/           (EXISTING, expand)
│   ├── CombatSystem.js
│   ├── StatusEffectSystem.js
│   └── AudioSystem.js
├── ui/                (EXISTING, expand)
│   ├── EquipmentUI.js
│   ├── SkillTreeUI.js
│   ├── Minimap.js
│   └── TutorialUI.js
└── content/           (NEW)
    ├── story/
    │   ├── intro.js
    │   └── ending.js
    ├── dialogue/
    │   ├── elder.json
    │   └── merchant.json
    └── areas/
        ├── snow_mountain.js
        └── volcanic_cavern.js
```

### Technical Considerations
- **Modular Design**: Each system should be independent and loosely coupled
- **Data-Driven**: Use JSON for dialogue, story, equipment data
- **Extensibility**: Easy to add new enemies, items, skills
- **Performance**: Object pooling for effects, limit concurrent particles
- **Testing**: Create test scenes for each new feature

---

## 🚀 Immediate Next Actions

### Week 1 Tasks (In Order):
1. **StoryManager Implementation** (2-3 hours)
   - Create StoryManager class
   - Implement intro scene
   - Implement ending scene
   - Test scene transitions

2. **DialogueManager Implementation** (2-3 hours)
   - Create DialogueManager class
   - Create elder dialogue JSON
   - Create merchant dialogue JSON
   - Integrate with NPC interaction

3. **Quest Story Integration** (1-2 hours)
   - Enhance quest descriptions
   - Add quest completion dialogue
   - Connect quests into story arc

4. **Testing & Documentation** (1 hour)
   - Playtest story flow
   - Write iteration report
   - Update progress documentation

---

**Plan Created**: 2026-01-26
**Author**: Claude Sonnet 4.5
**Status**: ✅ Planning Complete - Ready for Execution
**Next Step**: Begin Sprint 1 - Story & Dialogue Enhancement
