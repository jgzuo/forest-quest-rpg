/**
 * 诊断脚本: 检测主角重复问题
 * 使用方法: 在浏览器控制台中运行此脚本
 */

(function() {
    console.log('🔍 开始诊断主角重复问题...\n');

    // 获取游戏场景
    const scene = window.game?.scene?.scenes[0];
    if (!scene) {
        console.error('❌ 游戏场景未找到');
        return;
    }

    console.log('✅ 游戏场景已找到');

    // 1. 检查玩家对象
    console.log('\n=== 1. 玩家对象检查 ===');
    console.log('scene.player:', scene.player);
    console.log('player类型:', scene.player?.type);
    console.log('player位置:', scene.player ? { x: scene.player.x, y: scene.player.y } : null);

    // 2. 统计所有子对象
    console.log('\n=== 2. 子对象统计 ===');
    let spriteCount = 0;
    let imageCount = 0;
    let textCount = 0;
    let graphicsCount = 0;
    let otherCount = 0;

    const playerReferences = [];

    scene.children.each((child, index) => {
        if (child === scene.player) {
            playerReferences.push(index);
        }

        switch(child.type) {
            case 'Sprite':
                spriteCount++;
                break;
            case 'Image':
                imageCount++;
                break;
            case 'Text':
                textCount++;
                break;
            case 'Graphics':
                graphicsCount++;
                break;
            default:
                otherCount++;
        }
    });

    console.log('总数:', scene.children.list.length);
    console.log('Sprite数量:', spriteCount);
    console.log('Image数量:', imageCount);
    console.log('Text数量:', textCount);
    console.log('Graphics数量:', graphicsCount);
    console.log('其他数量:', otherCount);

    console.log('\n玩家引用次数:', playerReferences.length);
    if (playerReferences.length > 1) {
        console.error('🐛 BUG确认: 发现多个玩家引用!');
        console.log('引用索引:', playerReferences);
    } else if (playerReferences.length === 1) {
        console.log('✅ 玩家对象唯一');
    } else {
        console.error('❌ 未找到玩家对象!');
    }

    // 3. 检查是否有重复纹理的玩家
    console.log('\n=== 3. 纹理检查 ===');
    let heroTextureCount = 0;
    scene.children.each((child) => {
        if (child.texture && child.texture.key.startsWith('hero')) {
            heroTextureCount++;
            if (child !== scene.player) {
                console.warn(`⚠️  发现额外的hero纹理对象:`, child.texture.key, child);
            }
        }
    });
    console.log('Hero纹理对象总数:', heroTextureCount);

    // 4. 测试移动
    console.log('\n=== 4. 移动测试 ===');
    if (scene.player) {
        const beforeX = scene.player.x;
        const beforeY = scene.player.y;
        console.log('移动前位置:', beforeX, beforeY);

        // 模拟按下W键
        const wKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        wKey.isDown = true;

        // 强制update执行一次
        scene.update();

        const afterX = scene.player.x;
        const afterY = scene.player.y;
        console.log('移动后位置:', afterX, afterY);

        if (afterY !== beforeY) {
            console.log('✅ 移动正常');
        } else {
            console.warn('⚠️  玩家未移动');
        }

        // 再次检查玩家数量
        console.log('\n=== 5. 移动后玩家数量检查 ===');
        let playerCountAfterMove = 0;
        scene.children.each((child) => {
            if (child === scene.player) playerCountAfterMove++;
        });
        console.log('移动后玩家引用数:', playerCountAfterMove);

        if (playerCountAfterMove > 1) {
            console.error('🐛 BUG确认: 移动后出现多个玩家!');
        }
    }

    // 6. 检查update函数
    console.log('\n=== 6. 代码分析 ===');
    console.log('update函数是否定义:', typeof scene.update === 'function');
    console.log('update函数源代码长度:', scene.update.toString().length);

    // 检查update中是否有create/sprite等关键词
    const updateCode = scene.update.toString();
    const suspiciousPatterns = [
        { pattern: 'physics\\.add\\.sprite', desc: '创建新精灵' },
        { pattern: 'add\\.image', desc: '添加图像' },
        { pattern: 'this\\.player\\s*=', desc: '重新赋值player' }
    ];

    suspiciousPatterns.forEach(({ pattern, desc }) => {
        if (updateCode.includes(pattern)) {
            console.warn(`⚠️  update函数中发现可疑代码: ${desc}`);
        }
    });

    // 7. 建议
    console.log('\n=== 7. 诊断建议 ===');
    if (playerReferences.length > 1 || heroTextureCount > 1) {
        console.log('🔧 建议修复方案:');
        console.log('1. 确保createPlayer()只在create()中调用一次');
        console.log('2. 在update()中使用setTexture()而不是创建新对象');
        console.log('3. 检查SceneManager.cleanupScene()是否正确保留玩家');
        console.log('4. 为玩家添加唯一ID标识符来追踪问题');
    } else {
        console.log('✅ 未发现明显的玩家重复问题');
        console.log('💡 如果视觉上仍看到多个主角,可能是:');
        console.log('   - 残影/拖尾效果');
        console.log('   - 物理body未正确清理');
        console.log('   - 渲染层重叠');
    }

    console.log('\n✅ 诊断完成!');
})();
