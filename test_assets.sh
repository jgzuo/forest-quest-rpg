#!/bin/bash

# Test script to verify all assets referenced in BootScene exist

echo "=== Forest Quest RPG Asset Verification ==="
echo ""

FAILED=0
PASSED=0

# Function to check if asset exists
check_asset() {
    local path=$1
    local full_path="/Users/zuojg/Downloads/AI/Code/forest-quest-rpg/$path"

    if [ -f "$full_path" ]; then
        echo "✓ $path"
        ((PASSED++))
    else
        echo "✗ MISSING: $path"
        ((FAILED++))
    fi
}

echo "Checking Hero assets..."
check_asset "assets/characters/hero/idle/hero-idle-front.png"
check_asset "assets/characters/hero/idle/hero-idle-back.png"
check_asset "assets/characters/hero/idle/hero-idle-side.png"
check_asset "assets/characters/hero/walk/hero-walk-front.png"
check_asset "assets/characters/hero/walk/hero-back-walk.png"
check_asset "assets/characters/hero/walk/hero-walk-side.png"
check_asset "assets/characters/hero/attack/hero-attack-front.png"
check_asset "assets/characters/hero/attack/hero-attack-back.png"
check_asset "assets/characters/hero/attack/hero-attack-side.png"

echo ""
echo "Checking Mole assets..."
check_asset "assets/characters/mole/idle/mole-idle.png"
check_asset "assets/characters/mole/walk/mole-walk.png"

echo ""
echo "Checking Treant assets..."
check_asset "assets/characters/treant/idle/treant-idle-front.png"
check_asset "assets/characters/treant/idle/treant-idle-back.png"
check_asset "assets/characters/treant/idle/treant-idle-side.png"
check_asset "assets/characters/treant/walk/treant-walk-front.png"
check_asset "assets/characters/treant/walk/treant-walk-back.png"
check_asset "assets/characters/treant/walk/treant-walk-side.png"

echo ""
echo "Checking NPC..."
check_asset "assets/characters/npc.png"

echo ""
echo "Checking Environment assets..."
check_asset "assets/environments/forest-tileset.png"
check_asset "assets/environments/forest-objects.png"
check_asset "assets/environments/tree-orange.png"
check_asset "assets/environments/tree-pink.png"
check_asset "assets/environments/tree-dried.png"
check_asset "assets/environments/rock.png"
check_asset "assets/environments/rock-monument.png"
check_asset "assets/environments/bush.png"
check_asset "assets/environments/bush-tall.png"
check_asset "assets/environments/trunk.png"
check_asset "assets/environments/sign.png"
check_asset "assets/environments/waterfall/waterfall-1.png"
check_asset "assets/environments/waterfall/waterfall-2.png"
check_asset "assets/environments/waterfall/waterfall-3.png"
check_asset "assets/environments/town/tileset.png"
check_asset "assets/environments/town/grass-tile.png"
check_asset "assets/environments/town/grass-tile-2.png"
check_asset "assets/environments/town/grass-tile-3.png"
check_asset "assets/environments/cave-tileset.png"

echo ""
echo "Checking UI assets..."
check_asset "assets/ui/gem.png"
check_asset "assets/ui/coin.png"
check_asset "assets/ui/enemy-death.png"

echo ""
echo "=== Summary ==="
echo "Passed: $PASSED"
echo "Failed: $FAILED"
echo ""

if [ $FAILED -gt 0 ]; then
    echo "❌ Some assets are missing!"
    exit 1
else
    echo "✅ All assets found!"
    exit 0
fi
