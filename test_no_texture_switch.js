/**
 * 测试版本：禁用纹理切换
 * 用于验证问题是否由纹理切换导致
 * 在浏览器控制台运行此脚本
 */

(function() {
    console.log('🧪 启动无纹理切换测试版本\n');
    console.log('⚠️  玩家将保持单一纹理，不随移动改变');
    console.log('💡 如果这样没有"多个主角"，说明是纹理切换导致的渲染问题\n');

    const scene = game.scene.scenes.find(s => s.scene.key === 'GameScene');
    if (!scene) {
        console.error('❌ GameScene未找到');
        return;
    }

    // 备份原始update
    const originalUpdate = scene.update.bind(scene);

    // 重写update，禁用纹理切换
    scene.update = function() {
        if (!this.player.isAttacking) {
            let velocityX = 0;
            let velocityY = 0;

            // 只更新速度，不改变纹理
            if (this.cursors.left.isDown || this.wasd.left.isDown) {
                velocityX = -this.player.speed;
            } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
                velocityX = this.player.speed;
            } else if (this.cursors.up.isDown || this.wasd.up.isDown) {
                velocityY = -this.player.speed;
            } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
                velocityY = this.player.speed;
            }

            this.player.setVelocity(velocityX, velocityY);
        }

        // 继续其他update逻辑（敌人AI等）
        const enemies = this.sceneManager?.enemies || this.enemies;
        if (enemies) {
            enemies.getChildren().forEach(enemy => {
                const angle = Phaser.Math.Angle.Between(
                    enemy.x, enemy.y,
                    this.player.x, this.player.y
                );
                const speed = enemy.getData('speed');
                enemy.setVelocity(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                );
                if (Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y) < 40) {
                    this.playerHitByEnemy(enemy);
                }
            });
        }
    };

    console.log('✅ 已禁用纹理切换');
    console.log('📝 现在请：');
    console.log('   1. 按WASD移动角色');
    console.log('   2. 观察是否还出现多个主角');
    console.log('   3. 如果没有多个主角了，说明是纹理切换导致的渲染问题');
    console.log('   4. 运行 restoreTextureSwitch() 恢复正常\n');

    // 提供恢复函数
    window.restoreTextureSwitch = () => {
        scene.update = originalUpdate;
        console.log('✅ 已恢复纹理切换');
    };

    console.log('💡 恢复正常: 运行 restoreTextureSwitch()');
})();
