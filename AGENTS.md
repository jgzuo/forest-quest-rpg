# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development commands

### Install dependencies

- From the project root:
  - `npm install`
  - Install Playwright browsers (required for tests): `npm run install:browsers`

### Run the game locally

There is no dedicated dev server script; the game is a static site served from the project root.

- Option 1 (matches the Playwright test server configuration):
  - `npx -y http-server -p 55573 --silent`
  - Open `http://127.0.0.1:55573` in a browser and load `index.html`.
- Option 2 (from the project README):
  - `npx live-server --port=8080`
  - Open `http://localhost:8080`.

### Run Playwright tests

Playwright is configured via `playwright.config.js` to start its own static server (`npx -y http-server -p 55573 --silent`) and run tests against `http://127.0.0.1:55573`.

Common commands (run from the project root):

- Run all tests headless:
  - `npm test`
- Run all tests with a visible browser:
  - `npm run test:headed`
- Run tests in debug mode (Playwright inspector):
  - `npm run test:debug`
- Generate and open the HTML test report:
  - `npm run test:report`
  - Or directly: `npx playwright show-report`
- Run a single test file:
  - `npx playwright test tests/player-controls.spec.js`
- Run tests matching a specific title:
  - `npx playwright test --grep "玩家移动时应该只显示一个角色实例"`

Refer to `README_TESTING.md` for the current test coverage status and additional debugging commands.

## High-level architecture

### Runtime layout

- `index.html` is the main entry page:
  - Defines the `#game-container` element that hosts the Phaser canvas and the overlay UI for HP/XP bars and level display (`#hp-bar`, `#xp-bar`, `#level-display`).
  - Includes Phaser via CDN and then loads the game scripts in this order:
    1. `src/utils/SaveManager.js`
    2. `src/utils/SceneManager.js`
    3. `src/utils/ShopManager.js`
    4. `src/scenes/BootScene.js`
    5. `src/scenes/GameScene.js`
    6. `src/main.js`
- The game uses a single Phaser `Game` instance attached to `window.game`, and a global `window.gameData` object for persistent meta-state (player stats, progress, settings, gold, inventory).

### Core game bootstrap (Phaser config and scenes)

- `src/main.js`:
  - Defines the Phaser configuration (800×600 canvas, `Phaser.AUTO`, arcade physics without gravity, `pixelArt: true`, `Phaser.Scale.FIT` with auto-centering).
  - Registers the scene sequence `[BootScene, GameScene]`.
  - Initializes the global `window.gameData` structure with:
    - `player` stats (level, XP, HP, attack, speed).
    - `progress` (current scene key, gems collected, enemies defeated, total coins).
    - `settings` (music/sfx volume and enabled flags).
  - On `window.load`, hides the placeholder content inside `#game-container`, constructs `new Phaser.Game(config)`, and logs the current feature set and roadmap to the console.

- `src/scenes/BootScene.js`:
  - A lightweight preload scene responsible for:
    - Showing a loading bar and percentage text while assets are loaded.
    - Loading all core assets for characters, enemies, environments (forest, town, cave), UI icons (gem, coin, enemy-death), and tilesets.
  - Once loading is complete, it destroys the loading UI and transitions immediately to `GameScene`.

### Main gameplay scene and systems

- `src/scenes/GameScene.js` is the central orchestrator of gameplay and composes multiple systems:
  - On `create()` it:
    - Instantiates `SaveManager`, `ShopManager`, and `SceneManager` with the current scene.
    - Checks for existing save data and, if present, shows a load prompt (`Y` to load, `N` to start a new game).
    - Creates the player sprite and initializes its stats and animation bookkeeping (`currentTextureKey`, `facing`, `lastDirection`, `isAttacking`).
    - Loads the initial world scene (`'town'`) via `SceneManager.loadScene('town')`.
    - Sets up keyboard controls (WASD, arrow keys, `Space` for attack, `E` for interaction, `F5`/`F9` for quick save/load).
    - Initializes the in-DOM UI overlay and a scene name indicator text.
    - Shows a sequence of on-screen tutorial messages via `showWelcomeMessage()`.

  - Player control and animation:
    - Movement is handled in `update()` by reading both arrow keys and WASD, computing velocity, and choosing walk/idle textures for `hero-*` sprites based on the active direction.
    - Horizontal movement controls `flipX` (left = `true`, right = `false`), while vertical movement preserves the last horizontal facing.
    - Texture switching is explicitly guarded by `player.currentTextureKey` and `setFrame(0)` calls to avoid redundant texture changes and GPU artifacts; Playwright tests assert on this optimization.

  - Combat and enemies:
    - `playerAttack()` spawns a temporary rectangular hitbox in front of the player (position depends on `facing` and `flipX`), overlaps it with the `enemies` group supplied by `SceneManager`, and routes damage to `hitEnemy()`.
    - `hitEnemy()` reduces enemy HP, shows a damage number, and calls `enemyDeath()` when HP <= 0.
    - `enemyDeath()` awards XP, drops a coin, shows floating XP text, increments `window.gameData.progress.enemiesDefeated`, and destroys the enemy.
    - `gainXP()` and `levelUp()` update XP/level, buff stats, show feedback text, and invoke `SaveManager.autoSave()` to persist progress.
    - `playerHitByEnemy()` is invoked from the enemy AI loop and handles damage, temporary invincibility, UI updates, and transitions to `gameOver()` when HP reaches 0. It respects `SceneManager.isTransitioning` to avoid damage during scene transitions.

  - World interaction:
    - The scene exposes `handleInteraction()` bound to the `E` key:
      - Iterates scene children to find nearby NPCs (`type: 'npc'`) and chests (`type: 'chest'`) by distance threshold.
      - Routes interactions to `talkToNPC()` and `openChest()`.
    - `talkToNPC()` currently supports at least two named NPCs:
      - `村长` (village chief) who explains the main quest when in `town`.
      - `商人` (merchant) who opens the shop via `ShopManager.openShop()`.
    - Dialogs (`showDialog`) and load prompts (`showLoadPrompt`) are implemented as layered Phaser UI elements (rectangles + texts) with input-blocking overlays and close interactions bound to keyboard or pointer events.
    - Chests (`openChest`) randomly yield coins, gems, or HP restoration, trigger floating text and UI updates, and visually mark the chest as opened.

  - UI integration:
    - `initUI()` reveals the DOM-based HP/XP bars and level display inside `#ui-overlay` and initializes the scene name indicator.
    - `updateUI()` is responsible for syncing Phaser-side state into the DOM:
      - Updates `#hp-text` and its `.bar-fill` width based on `player.hp` and `player.maxHp`.
      - Updates `#xp-text` and XP bar width based on `player.xp` and `player.xpToNextLevel`.
      - Updates `#level-text` with the current player level.
    - The scene name indicator text is updated via `updateSceneIndicator()` calls from `SceneManager` when the logical location changes.

### Scene management and world structure

- `src/utils/SceneManager.js` encapsulates high-level world layout and transitions between logical areas:
  - Tracks:
    - `currentScene` (`'town'`, `'forest'`, `'cave'`).
    - A `playerSpawnPoint` used when entering a scene.
    - `isTransitioning` and a teleport cooldown to prevent repeated scene-switch calls and teleport loops.
  - `switchScene(targetScene, spawnPoint?)`:
    - Enforces the cooldown and `isTransitioning` guard.
    - Pauses physics during the transition.
    - Runs a fade-out via the camera, then:
      - Calls `cleanupScene()` to remove non-player, non-UI objects.
      - Calls `loadScene(targetScene)` to reconstruct the new area.
      - Updates the scene indicator (`GameScene.updateSceneIndicator`) if available.
      - Repositions the player to the new spawn point.
      - Triggers `SaveManager.autoSave()`.
      - Performs a flash-in effect and resumes physics after a fixed delay.
  - `loadScene(name)` dispatches to:
    - `loadTownScene()` — creates a grass background, decorative trees, buildings, NPCs (village chief and merchant), chests, and a forest teleport.
    - `loadForestScene()` — dense forest background, trees/rocks/bushes, teleports back to town and onward to cave, and spawns mixed enemies (moles and treants) via `spawnEnemiesInForest()`.
    - `loadCaveScene()` — cave background, rock decorations, a teleport back to forest, and stronger treants via `spawnEnemiesInCave()`.
  - Teleports and environmental interactables:
    - `createTeleport()` builds a physics-enabled zone which, when overlapped by the player, calls `switchScene()` with a target name and spawn point. Visuals (glowing circle + label) are created alongside.
    - `createNPC()` sets up NPC sprites, interaction zones, and text hints, and hooks them into physics overlaps with the player.
    - `createChest()` constructs chests plus interaction zones and hint text that integrate with `GameScene.handleInteraction()`.
  - Enemies:
    - `spawnEnemiesInForest()` and `spawnEnemiesInCave()` recreate the `scene.enemies` physics group and use `spawnEnemy(type, x, y)` to add configured moles/treants with HP, attack, speed, and XP rewards.
    - `GameScene.update()` then drives enemy AI each frame by steering enemies toward the player and invoking `playerHitByEnemy()` on close contact.

### Persistence (SaveManager)

- `src/utils/SaveManager.js` owns save/load semantics, backed by `localStorage` under the key `forestQuestRPG_save`:
  - `saveGame()` serializes:
    - Player stats and position from `GameScene.player`.
    - Scene state from `SceneManager` (current scene and spawn point).
    - Progress metrics from `window.gameData.progress`.
    - Inventory from `window.gameData.inventory` (if present).
  - `loadGame()` reverses the process:
    - Restores player stats.
    - Either switches scenes via `SceneManager.switchScene()` or just moves the player if already in the right scene.
    - Restores `window.gameData.progress` and `inventory`.
    - Calls `GameScene.updateUI()` and shows a floating "game loaded" message.
  - `hasSaveData()` / `getSaveInfo()` allow `GameScene` to decide whether to show a load prompt and what summary to display (level, scene, localized timestamp).
  - `autoSave()` is called on key events (e.g., level-up and scene transitions) when enabled.

### Shop and economy (ShopManager)

- `src/utils/ShopManager.js` implements a simple economy and shop UI:
  - Uses and initializes `window.gameData.gold` as the central gold counter.
  - Exposes methods:
    - `getGold()`, `addGold(amount)`, `spendGold(amount)` for currency management.
    - `openShop(merchantName)` and `createShopUI()` to render an in-game shop overlay with items, prices, and click-to-buy interaction.
    - `buyItem(item)` and `applyItemEffect(item)` to perform purchases and apply effects to the player (HP recovery, permanent attack/HP increases, crit chance, or timed attack buffs), then update UI and show feedback.
  - The shop UI is entirely Phaser-based (rectangles + text + interactive regions) layered above the game using depth values and an input-blocking rectangle; it is closed via `ESC` or clicking the background.
  - Shop inventory is defined as a static array of item definitions at construction time.

## Testing architecture

- Playwright configuration (`playwright.config.js`):
  - `testDir: './tests'`.
  - Single-worker, non-parallel execution to avoid issues with shared game state.
  - `webServer` section launches `npx -y http-server -p 55573 --silent` and waits for `http://127.0.0.1:55573`.
  - Global `use.baseURL` is set to the same URL; tests generally call `page.goto('/')`.
  - Reporters: HTML (to `playwright-report`), JSON (to `test-results.json`), and a list reporter in the terminal.

- Test suites (`tests/*.spec.js`) are organized by gameplay concerns:
  - `game-loading.spec.js` — verifies the page, canvas, UI elements, JavaScript resource loading, absence of severe JS errors, and existence of the `GameScene` player instance.
  - `player-controls.spec.js` — exercises WASD and arrow movement, validates no duplicate hero sprites, inspects texture-switch behavior, checks attack triggering, and asserts correct `flipX` semantics.
  - Other specs (combat, NPC interaction, scene switching, save/load) follow similar patterns (see `README_TESTING.md` for coverage and pass/fail status).

- Many tests introspect Phaser state directly via `page.evaluate()` by locating `window.game.scene.scenes` and finding the scene whose key is `'GameScene'`. Changes that rename the scene key or significantly alter how `GameScene` exposes `player`, `enemies`, or UI state will break these tests.

- Time-based waits (1–3 seconds) are used throughout the tests to give the canvas game loop time to settle before assertions. When changing movement speeds, animation timing, or scene initialization, review and, if necessary, adjust these waits.

## Repo-specific notes for agents

- When modifying scene or asset loading behavior:
  - Keep asset keys in `BootScene` and their usage in `SceneManager`/`GameScene` in sync; `game-loading.spec.js` and resource-error listeners expect all `/assets` and `/src` resources to load without HTTP errors.

- When editing `GameScene`:
  - Preserve the `GameScene` scene key (`'GameScene'`) and the existence of `scene.player`, `scene.enemies`, and `scene.updateUI()`; Playwright tests rely on these.
  - Be careful with `player.currentTextureKey` and `setFrame(0)` usage; tests assert that texture changes are not excessively frequent and that only one hero sprite exists.

- When changing world structure or teleports:
  - Keep `SceneManager.currentScene` values (`'town'`, `'forest'`, `'cave'`) and teleport wiring consistent with the narrative and tests (e.g., town → forest → cave loops and back-teleports).
  - Ensure `SceneManager.isTransitioning` and teleport cooldown semantics remain intact to avoid rapid re-entry into teleports and to keep damage disabled during transitions.

- When adjusting save/load or progression:
  - Coordinate changes between `SaveManager`, `GameScene` (quick save/load and auto-save hooks), and `window.gameData.progress` to keep serialization/deserialization round-trips consistent.
  - Use `getSaveInfo()` and the existing load prompt UI as the starting point if you need to extend the save UI.

- Before making large changes to movement, combat, saving, or scene switching, skim `README_TESTING.md` and the latest test reports (`FINAL_TEST_REPORT.md`, `FINAL_SUMMARY.md`) to understand which behaviors are currently under automated test and which areas are still unstable.