/**
 * BootScene - 预加载游戏素材
 * 负责加载所有游戏资源并显示加载进度
 */
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // 创建加载进度条
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: '加载中...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        const percentText = this.make.text({
            x: width / 2,
            y: height / 2 - 15,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        // 加载进度更新
        this.load.on('progress', (value) => {
            percentText.setText(`${Math.floor(value * 100)}%`);
            progressBar.clear();
            progressBar.fillStyle(0x68d391, 1);
            progressBar.fillRect(250, 280, 300 * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
        });

        // ============ 加载角色素材 ============

        // 英雄角色 - Idle 动画 (单帧)
        this.load.image('hero-idle-front', 'assets/characters/hero/idle/hero-idle-front.png');
        this.load.image('hero-idle-back', 'assets/characters/hero/idle/hero-idle-back.png');
        this.load.image('hero-idle-side', 'assets/characters/hero/idle/hero-idle-side.png');

        // 英雄角色 - Walk 动画 (精灵图 - 包含多个帧)
        // 图片尺寸: 192x32, 包含3帧 (每帧 64x32) 或 6帧 (每帧 32x32)
        this.load.spritesheet('hero-walk-front', 'assets/characters/hero/walk/hero-walk-front.png', {
            frameWidth: 32,   // 每帧宽度 (192/6=32 或 192/3=64)
            frameHeight: 32,  // 每帧高度
            endFrame: 5       // 6帧 (0-5)
        });
        this.load.spritesheet('hero-walk-back', 'assets/characters/hero/walk/hero-back-walk.png', {
            frameWidth: 32,
            frameHeight: 32,
            endFrame: 5
        });
        this.load.spritesheet('hero-walk-side', 'assets/characters/hero/walk/hero-walk-side.png', {
            frameWidth: 32,
            frameHeight: 32,
            endFrame: 5
        });

        // 英雄角色 - Attack 动画 (spritesheet - 包含多个帧)
        // 图片尺寸: 96x32, 包含3帧 (每帧 32x32)
        this.load.spritesheet('hero-attack-front', 'assets/characters/hero/attack/hero-attack-front.png', {
            frameWidth: 32,
            frameHeight: 32,
            endFrame: 2   // 3帧 (0-2)
        });
        this.load.spritesheet('hero-attack-back', 'assets/characters/hero/attack/hero-attack-back.png', {
            frameWidth: 32,
            frameHeight: 32,
            endFrame: 2
        });
        this.load.spritesheet('hero-attack-side', 'assets/characters/hero/attack/hero-attack-side.png', {
            frameWidth: 32,
            frameHeight: 32,
            endFrame: 2
        });

        // 鼹鼠敌人
        this.load.image('mole-idle-front', 'assets/characters/mole/idle/mole-idle-front.png');
        this.load.image('mole-idle-back', 'assets/characters/mole/idle/mole-idle-back.png');
        this.load.image('mole-idle-side', 'assets/characters/mole/idle/mole-idle-side.png');
        this.load.image('mole-walk-front', 'assets/characters/mole/walk/mole-walk-front.png');
        this.load.image('mole-walk-back', 'assets/characters/mole/walk/mole-walk-back.png');
        this.load.image('mole-walk-side', 'assets/characters/mole/walk/mole-walk-side.png');

        // 树妖敌人
        this.load.image('treant-idle-front', 'assets/characters/treant/idle/treant-idle-front.png');
        this.load.image('treant-idle-back', 'assets/characters/treant/idle/treant-idle-back.png');
        this.load.image('treant-idle-side', 'assets/characters/treant/idle/treant-idle-side.png');
        this.load.image('treant-walk-front', 'assets/characters/treant/walk/treant-walk-front.png');
        this.load.image('treant-walk-back', 'assets/characters/treant/walk/treant-walk-back.png');
        this.load.image('treant-walk-side', 'assets/characters/treant/walk/treant-walk-side.png');

        // NPC - 二维sprite sheet：横向4个NPC，纵向3个方向
        // 总共12帧：4个NPC × 3个方向
        this.load.spritesheet('npc', 'assets/characters/npc.png', {
            frameWidth: 12,   // 每帧宽度12像素
            frameHeight: 21,  // 每帧高度21像素
            startFrame: 0,
            endFrame: 11      // 12帧 total (0-11)
        });

        // ============ 加载环境素材 ============

        // 森林瓦片地图
        this.load.image('forest-tileset', 'assets/environments/forest-tileset.png');
        this.load.image('forest-objects', 'assets/environments/forest-objects.png');

        // 森林物体
        this.load.image('tree-orange', 'assets/environments/tree-orange.png');
        this.load.image('tree-pink', 'assets/environments/tree-pink.png');
        this.load.image('tree-dried', 'assets/environments/tree-dried.png');
        this.load.image('rock', 'assets/environments/rock.png');
        this.load.image('rock-monument', 'assets/environments/rock-monument.png');
        this.load.image('bush', 'assets/environments/bush.png');
        this.load.image('bush-tall', 'assets/environments/bush-tall.png');
        this.load.image('trunk', 'assets/environments/trunk.png');
        this.load.image('sign', 'assets/environments/sign.png');

        // 瀑布动画
        this.load.image('waterfall-1', 'assets/environments/waterfall/waterfall-1.png');
        this.load.image('waterfall-2', 'assets/environments/waterfall/waterfall-2.png');
        this.load.image('waterfall-3', 'assets/environments/waterfall/waterfall-3.png');

        // 小镇瓦片
        this.load.image('town-tileset', 'assets/environments/town/tileset.png');
        this.load.image('grass-tile', 'assets/environments/town/grass-tile.png');
        this.load.image('grass-tile-2', 'assets/environments/town/grass-tile-2.png');
        this.load.image('grass-tile-3', 'assets/environments/town/grass-tile-3.png');

        // 洞穴瓦片
        this.load.image('cave-tileset', 'assets/environments/cave-tileset.png');

        // ============ 加载道具素材 ============

        this.load.image('gem', 'assets/ui/gem.png');
        this.load.image('coin', 'assets/ui/coin.png');
        this.load.image('enemy-death', 'assets/ui/enemy-death.png');

        console.log('📦 所有素材已加载');
    }

    create() {
        console.log('✅ BootScene 完成');

        // 创建瀑布动画
        this.anims.create({
            key: 'waterfall-flow',
            frames: [
                { key: 'waterfall-1' },
                { key: 'waterfall-2' },
                { key: 'waterfall-3' }
            ],
            frameRate: 3,        // 3 FPS (较慢的速度)
            repeat: -1           // 无限循环
        });
        console.log('✅ 瀑布动画已创建');

        // 添加简单的场景过渡
        this.scene.start('GameScene');
    }
}
