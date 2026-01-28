// 在浏览器控制台粘贴此代码，手动检查NPC对象
console.log('========== 手动NPC检查 ==========');
console.log('玩家位置:', game.scene.scenes[0].player.x, game.scene.scenes[0].player.y);
console.log('\n场景对象总数:', game.scene.scenes[0].children.list.length);
console.log('\n所有对象类型:');
game.scene.scenes[0].children.list.forEach((child, index) => {
    console.log(`[${index}] type: ${child.type || 'unknown'}, getData: ${typeof child.getData}`);
    if (child.getData) {
        const data = child.getData('type');
        if (data) {
            console.log(`    → 数据类型: ${data}`);
            if (data === 'npc') {
                console.log(`    → NPC名称: ${child.getData('name')}`);
                console.log(`    → NPC位置: (${child.x}, ${child.y})`);
                const dist = Phaser.Math.Distance.Between(
                    game.scene.scenes[0].player.x,
                    game.scene.scenes[0].player.y,
                    child.x,
                    child.y
                );
                console.log(`    → 距离玩家: ${Math.round(dist)}px`);
            }
        }
    }
});

console.log('\n========== 手动触发交互 ==========');
game.scene.scenes[0].handleInteraction();
