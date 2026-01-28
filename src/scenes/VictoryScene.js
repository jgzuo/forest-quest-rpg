/**
 * VictoryScene - 胜利场景
 * 当玩家击败Boss后显示
 */
class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VictoryScene' });
    }

    create() {
        console.log('🎉 进入胜利场景');

        // 创建半透明背景
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
        overlay.setDepth(0);

        // 背景颜色（绿色渐变）
        const bg = this.add.rectangle(400, 300, 800, 600, 0x228b22);
        bg.setDepth(-1);

        // 标题
        const title = this.add.text(400, 150, '🎉 森林恢复了平静! 🎉', {
            font: 'bold 28px "Press Start 2P"',
            fill: '#ffd700',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);
        title.setDepth(1);

        // 副标题
        const subtitle = this.add.text(400, 200, '你击败了树妖王，拯救了森林！', {
            font: '18px "Microsoft YaHei"',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        subtitle.setDepth(1);

        // 统计信息
        const statsText = this.add.text(400, 300, this.getVictoryStats(), {
            font: '16px "Microsoft YaHei"',
            fill: '#68d391',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);
        statsText.setDepth(1);

        // 感谢文字
        const thanksText = this.add.text(400, 450, '感谢游玩 Forest Quest RPG!', {
            font: 'bold 16px "Microsoft YaHei"',
            fill: '#ffd700',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        thanksText.setDepth(1);

        // 作者信息
        const authorText = this.add.text(400, 480, 'Created by Jianguang ZUO', {
            font: '14px Arial',
            fill: '#a0aec0'
        }).setOrigin(0.5);
        authorText.setDepth(1);

        // 提示文字
        const hint = this.add.text(400, 530, '按 R 键重新开始游戏', {
            font: '16px "Microsoft YaHei"',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        hint.setDepth(1);

        // 闪烁动画
        this.tweens.add({
            targets: hint,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // 键盘监听
        this.input.keyboard.on('keydown-R', () => {
            this.restartGame();
        });

        // 庆祝粒子效果
        this.createCelebrationParticles();

        console.log('✅ 胜利场景创建完成');
    }

    /**
     * 获取胜利统计信息
     */
    getVictoryStats() {
        const saveData = this.loadSaveData();
        if (!saveData) {
            return '游戏完成！';
        }

        const stats = [
            `最终等级: ${saveData.player.level}`,
            `总金币: ${saveData.player.gold}`,
            `当前场景: ${saveData.scene.currentScene}`,
            '',
            '完成的任务:',
            ...this.getQuestSummary(saveData.quests)
        ];

        return stats.join('\n');
    }

    /**
     * 获取任务摘要
     */
    getQuestSummary(questData) {
        if (!questData) return ['无任务数据'];

        const summary = [];
        questData.quests.forEach(quest => {
            if (quest.completed) {
                summary.push(`✅ ${quest.name}`);
            } else if (quest.accepted) {
                summary.push(`🔵 ${quest.name}`);
            }
        });

        if (summary.length === 0) {
            summary.push('无完成的任务');
        }

        return summary;
    }

    /**
     * 加载存档数据
     */
    loadSaveData() {
        try {
            const saveString = localStorage.getItem('forestQuestRPG_save');
            if (!saveString) return null;
            return JSON.parse(saveString);
        } catch (error) {
            console.error('❌ 读取存档失败:', error);
            return null;
        }
    }

    /**
     * 创建庆祝粒子效果
     */
    createCelebrationParticles() {
        // 从顶部掉落的金色粒子
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, 800);
            const delay = Phaser.Math.Between(0, 2000);

            this.time.delayedCall(delay, () => {
                const particle = this.add.circle(x, -20, Phaser.Math.Between(3, 8), 0xffd700);
                particle.setAlpha(0.8);

                this.tweens.add({
                    targets: particle,
                    y: 650,
                    alpha: 0,
                    duration: 3000,
                    ease: 'Linear',
                    onComplete: () => particle.destroy()
                });
            });
        }
    }

    /**
     * 重新开始游戏
     */
    restartGame() {
        console.log('🔄 重新开始游戏');

        // 删除存档
        localStorage.removeItem('forestQuestRPG_save');
        localStorage.removeItem('forestQuestRPG_achievements');

        console.log('🗑️ 存档已清除');

        // 重启游戏场景
        this.scene.start('GameScene');
    }
}
