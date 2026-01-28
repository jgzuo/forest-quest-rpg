/**
 * 测试版本：只允许flipX切换，禁用纹理切换
 * 验证flipX是否是问题原因
 */

(function() {
    console.log('🧪 启动flipX专用测试版本\n');

    const scene = game.scene.scenes.find(s => s.scene.key === 'GameScene');
    if (!scene) return;

    const originalUpdate = scene.update.bind(scene);

    scene.update = function() {
        if (!this.player.isAttacking) {
            let velocityX = 0;
            let velocityY = 0;

            if (this.cursors.left.isDown || this.wasd.left.isDown) {
                velocityX = -this.player.speed;
                // 只改变flipX
                if (!this.player.flipX) this.player.flipX = true;
            } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
                velocityX = this.player.speed;
                // 只改变flipX
                if (this.player.flipX) this.player.flipX = false;
            } else if (this.cursors.up.isDown || this.wasd.up.isDown) {
                velocityY = -this.player.speed;
            } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
                velocityY = this.player.speed;
            }

            this.player.setVelocity(velocityX, velocityY);
        }

        // 敌人AI
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

    console.log('✅ 已启用：只改变flipX，不切换纹理');
    console.log('💡 如果向左/右移动时出现多个主角，说明是flipX导致的');

    window.restoreNormal = () => {
        scene.update = originalUpdate;
        console.log('✅ 已恢复正常');
    };
})();
