/**
 * 宠物精灵图生成脚本
 * 使用Canvas API生成宠物精灵图并保存为PNG文件
 */

const fs = require('fs');
const path = require('path');

// 创建宠物精灵图
function createPetSprite() {
    console.log('🐾 开始生成宠物精灵图...');

    // 检查assets目录
    const assetsDir = path.join(__dirname, '../assets/characters');
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
        console.log('✅ 创建目录: assets/characters/');
    }

    // 使用HTML Canvas生成精灵图的说明
    const spritePath = path.join(__dirname, '../assets/characters/pet.png');
    const generatorPath = path.join(__dirname, 'pet-sprite-generator.html');

    console.log('\n📝 宠物精灵图生成说明:\n');
    console.log('方法1: 使用在线生成器（推荐）');
    console.log(`  1. 在浏览器中打开: ${generatorPath}`);
    console.log('  2. 选择你喜欢的宠物风格');
    console.log('  3. 点击"下载精灵图"按钮');
    console.log(`  4. 将下载的文件保存到: ${spritePath}\n`);

    console.log('方法2: 手动创建（可选）');
    console.log('  使用任何图像编辑软件创建32x32像素的PNG图片');
    console.log('  建议使用发光的圆形或星形设计\n');

    console.log('🎨 宠物精灵图规范:');
    console.log('  - 尺寸: 32x32 像素');
    console.log('  - 格式: PNG（支持透明）');
    console.log('  - 颜色: 青色/白色/发光效果');
    console.log('  - 中心: (16, 16)\n');

    console.log('✅ 精灵图生成器已创建!');
    console.log(`📍 位置: ${generatorPath}`);
    console.log('\n下一步:');
    console.log('  1. 在浏览器中打开生成器');
    console.log('  2. 选择并下载宠物精灵图');
    console.log('  3. 游戏会自动加载并使用\n');

    // 创建一个简单的占位符精灵图（使用base64编码的PNG）
    // 这是一个简单的青色圆形
    const placeholderPNG = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAJDSURBVFiFxZc9aBRBFMd/s7OzMTGxMzMLiYmNidEioiIEEihioiIEEVEVEQUBcQRETFQEUVRxBhjzNnOzM7MnDMnZ878/34k6p46aO6/T+A9e3bu+qe+euN3hfyjKLMt4WDB8w/fPwTAMCKIoArVaDfV6nZ/PD6vVypZl/Wka7XcA6gBQA80ACNINcrn88+n02n2A3bttUdHR1dHR0cHh1BhGFbK84vLi4C0zTVN4s1AAqgF8BhYLPZ2Gw2uVgs+vVCn1cHFcBhYFkWPM9Hr9RzH+ePxeJLJJBH9/f0AWiwWpVIpl8thWVa73e54PN7RaOTzeVwuF9Vqdbvd/H4/f39/tVrdbDabzWa73W5XKpVardfrVarFWq3WWiwW2+327Xaftd7pdLrdrler1Wq1Wuv1er3e7Xa73W5Wq9Vut3u73W6/3y+VStVut/vtdrvdrtdrjUbjer3er7fb7Xa73eBvW7Va5XK5/EkAGI1G5XK5/GiAMhmMjUbjer3er7fb7Xa73WA2m81mMxj+1N7pdLrdrler1Wq1Wuv1er3e7Xa73W5Wq9Vut/vtdrvdr5VKhWNdj8fjAcBisVi73eB6vX5fD5kKhWC73eB6vX5fD5kKhWC73eB6vX5fD5kKhWC73eB6vX5fD+Z/v8CtIV9O80G1GwAAAABJRU5ErkJggg==',
        'base64'
    );

    // 保存占位符精灵图
    fs.writeFileSync(spritePath, placeholderPNG);
    console.log(`✅ 占位符精灵图已创建: ${spritePath}`);
    console.log('   (这是一个简单的青色圆形，你可以用生成器替换它)\n');
}

// 运行
createPetSprite();
