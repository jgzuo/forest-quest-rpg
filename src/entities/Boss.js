/**
 * Boss - Boss敌人基类
 * 扩展敌人功能，支持多阶段战斗和特殊技能
 */
class Boss {
    constructor(scene, type, x, y) {
        this.scene = scene;
        this.type = type;
        this.x = x;
        this.y = y;

        // Boss配置数据库
        const bossConfigs = {
            treant_king: {
                name: '树妖王',
                nameEn: 'Treant King',
                sprite: 'treant-idle-front',
                scale: 4,
                hp: 500,
                maxHp: 500,
                attack: 25,
                speed: 40,
                xp: 500,
                gold: 500,
                color: 0x228b22,  // 绿色
                skills: 'nature'  // 自然技能组
            },
            // ============ Milestone 7 Sprint 4: 新Boss ============
            yeti_king: {
                name: '雪怪王',
                nameEn: 'Yeti King',
                sprite: 'mole-idle-front',  // 临时占位符
                scale: 5,
                tint: 0xe0ffff,  // 冰雪色
                hp: 600,
                maxHp: 600,
                attack: 30,
                speed: 50,
                xp: 700,
                gold: 600,
                color: 0x87ceeb,  // 冰蓝色
                skills: 'ice'  // 冰雪技能组
            },
            dragon_lord: {
                name: '龙王',
                nameEn: 'Dragon Lord',
                sprite: 'mole-idle-side',  // 临时占位符
                scale: 6,
                tint: 0xff0000,  // 鲜红色
                hp: 800,
                maxHp: 800,
                attack: 40,
                speed: 60,
                xp: 1000,
                gold: 800,
                color: 0xff4500,  // 火红色
                skills: 'fire'  // 火焰技能组
            }
        };

        // 获取Boss配置
        const config = bossConfigs[type] || bossConfigs.treant_king;

        // Boss基础属性
        this.enemy = null;
        this.hp = config.hp;
        this.maxHp = config.maxHp;
        this.attack = config.attack;
        this.speed = config.speed;
        this.xp = config.xp;
        this.gold = config.gold;
        this.bossName = config.name;
        this.spriteKey = config.sprite;
        this.spriteScale = config.scale;
        this.spriteTint = config.tint || null;
        this.bossColor = config.color;
        this.skillType = config.skills;

        // Boss特有属性
        this.phase = 1;           // 当前阶段 (1, 2, 3)
        this.maxPhases = 3;       // 最大阶段数
        this.isEnraged = false;   // 是否狂暴状态

        // 初始化技能系统
        this.initializeSkills(this.skillType);

        this.activeSkill = null;  // 当前正在释放的技能
        this.skillWarnings = [];  // 技能预警标记

        // Boss状态
        this.isActive = false;
        this.isDead = false;

        console.log(`👑 创建Boss: ${this.bossName} (${type}) at (${x}, ${y})`);
    }

    /**
     * 初始化技能系统
     */
    initializeSkills(skillType) {
        const skillSets = {
            nature: {
                rootBind: {
                    name: '根须缠绕',
                    cooldown: 8000,
                    lastUsed: 0,
                    minPhase: 2,
                    damage: 15,
                    duration: 2000
                },
                rockFall: {
                    name: '落石攻击',
                    cooldown: 12000,
                    lastUsed: 0,
                    minPhase: 2,
                    damage: 30,
                    warningTime: 1500
                },
                summon: {
                    name: '召唤树苗',
                    cooldown: 15000,
                    lastUsed: 0,
                    minPhase: 3,
                    count: 3,
                    enemyType: 'treant'
                }
            },
            ice: {
                frostBreath: {
                    name: '霜冻吐息',
                    cooldown: 10000,
                    lastUsed: 0,
                    minPhase: 1,
                    damage: 25,
                    slowDuration: 3000  // 减速3秒
                },
                blizzard: {
                    name: '暴风雪',
                    cooldown: 15000,
                    lastUsed: 0,
                    minPhase: 2,
                    damage: 20,
                    duration: 5000  // 持续5秒
                },
                avalanche: {
                    name: '雪崩',
                    cooldown: 20000,
                    lastUsed: 0,
                    minPhase: 3,
                    damage: 50,
                    warningTime: 2000
                }
            },
            fire: {
                fireBreath: {
                    name: '火焰吐息',
                    cooldown: 8000,
                    lastUsed: 0,
                    minPhase: 1,
                    damage: 35,
                    burnDamage: 10,  // 燃烧伤害
                    burnDuration: 5000
                },
                wingFlap: {
                    name: '翅膀拍击',
                    cooldown: 12000,
                    lastUsed: 0,
                    minPhase: 2,
                    damage: 30,
                    knockback: 100  // 击退距离
                },
                inferno: {
                    name: '炼狱',
                    cooldown: 18000,
                    lastUsed: 0,
                    minPhase: 3,
                    damage: 60,
                    duration: 8000  // 持续8秒
                }
            }
        };

        this.skills = skillSets[skillType] || skillSets.nature;
        console.log(`⚔️ Boss技能组初始化: ${skillType}`);
    }

    /**
     * 创建Boss精灵
     */
    create() {
        // 使用Boss配置的sprite
        this.enemy = this.scene.enemies.create(this.x, this.y, this.spriteKey);
        this.enemy.setScale(this.spriteScale);

        // 应用tint（如果有）
        if (this.spriteTint) {
            this.enemy.setTint(this.spriteTint);
        }

        this.enemy.setData('type', this.type);
        this.enemy.setData('hp', this.hp);
        this.enemy.setData('maxHp', this.maxHp);
        this.enemy.setData('attack', this.attack);
        this.enemy.setData('speed', this.speed);
        this.enemy.setData('xp', this.xp);
        this.enemy.setData('gold', this.gold);
        this.enemy.setData('isBoss', true); // 标记为Boss
        this.enemy.setData('lastHitTime', 0);

        // 创建Boss血条（更大、更明显）
        this.createBossHealthBar();

        this.isActive = true;
        console.log(`👑 Boss激活: ${this.bossName}, HP=${this.hp}/${this.maxHp}`);
    }

    /**
     * 创建Boss血条UI
     */
    createBossHealthBar() {
        const screenCenterX = this.scene.cameras.main.width / 2;
        const barY = 50;
        const barWidth = 400;
        const barHeight = 25;

        // 血条背景
        this.hpBarBg = this.scene.add.rectangle(screenCenterX, barY, barWidth, barHeight, 0x000000);
        this.hpBarBg.setScrollFactor(0); // 固定在屏幕上
        this.hpBarBg.setDepth(200);
        this.hpBarBg.setVisible(false);

        // 血条前景
        this.hpBar = this.scene.add.rectangle(screenCenterX - barWidth/2 + 2, barY, barWidth - 4, barHeight - 4, 0xff0000);
        this.hpBar.setOrigin(0, 0.5);
        this.hpBar.setScrollFactor(0);
        this.hpBar.setDepth(201);
        this.hpBar.setVisible(false);

        // Boss名称
        this.nameText = this.scene.add.text(screenCenterX, barY - 15, `👑 ${this.bossName}`, {
            font: 'bold 16px "Microsoft YaHei"',
            fill: '#' + this.bossColor.toString(16).padStart(6, '0'),
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.nameText.setScrollFactor(0);
        this.nameText.setDepth(202);
        this.nameText.setVisible(false);

        // HP文字
        this.hpText = this.scene.add.text(screenCenterX, barY, `${this.hp}/${this.maxHp}`, {
            font: 'bold 14px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        this.hpText.setScrollFactor(0);
        this.hpText.setDepth(203);
        this.hpText.setVisible(false);

        // 阶段指示器
        this.phaseText = this.scene.add.text(screenCenterX + barWidth/2 + 20, barY, 'P1', {
            font: 'bold 18px Arial',
            fill: '#ffd700',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0, 0.5);
        this.phaseText.setScrollFactor(0);
        this.phaseText.setDepth(204);
        this.phaseText.setVisible(false);

        console.log('✅ Boss血条UI创建完成');
    }

    /**
     * 显示Boss血条
     */
    showHealthBar() {
        this.hpBarBg.setVisible(true);
        this.hpBar.setVisible(true);
        this.nameText.setVisible(true);
        this.hpText.setVisible(true);
        this.phaseText.setVisible(true);
    }

    /**
     * 隐藏Boss血条
     */
    hideHealthBar() {
        this.hpBarBg.setVisible(false);
        this.hpBar.setVisible(false);
        this.nameText.setVisible(false);
        this.hpText.setVisible(false);
        this.phaseText.setVisible(false);
    }

    /**
     * 更新Boss血条
     */
    updateHealthBar(currentHp, maxHp) {
        if (!this.hpBar) return;

        const hpPercent = Math.max(0, currentHp / maxHp);
        const barWidth = 400;
        this.hpBar.width = (barWidth - 4) * hpPercent;

        // 更新HP文字
        this.hpText.setText(`${Math.ceil(currentHp)}/${maxHp}`);

        // 根据血量改变颜色
        if (hpPercent > 0.5) {
            this.hpBar.fillColor = 0xff0000; // 红色
        } else if (hpPercent > 0.2) {
            this.hpBar.fillColor = 0xff6600; // 橙色
        } else {
            this.hpBar.fillColor = 0xff0066; // 深红色
        }
    }

    /**
     * 更新Boss阶段
     */
    updatePhase(hpPercent) {
        const oldPhase = this.phase;

        if (hpPercent > 0.5) {
            this.phase = 1;
        } else if (hpPercent > 0.2) {
            this.phase = 2;
        } else {
            this.phase = 3;
            this.isEnraged = true;
        }

        // 阶段变化时触发特效
        if (oldPhase !== this.phase) {
            this.onPhaseChange(oldPhase, this.phase);
        }

        // 更新阶段显示
        this.phaseText.setText(`P${this.phase}`);

        // 根据阶段改变颜色
        if (this.phase === 1) {
            this.phaseText.setColor('#ffd700'); // 金色
        } else if (this.phase === 2) {
            this.phaseText.setColor('#ff6600'); // 橙色
        } else {
            this.phaseText.setColor('#ff0000'); // 红色
        }
    }

    /**
     * 阶段变化时的处理
     */
    onPhaseChange(oldPhase, newPhase) {
        console.log(`👑 Boss阶段变化: P${oldPhase} → P${newPhase}`);

        // 相机闪光效果
        const flashColor = newPhase === 2 ? 0xff6600 : 0xff0000; // P2橙色, P3红色
        this.scene.cameras.main.flash(500, flashColor >> 16 & 255, flashColor >> 8 & 255, flashColor & 255);

        // 屏幕震动
        this.scene.cameras.main.shake(500, 0.02);

        // 显示阶段转换消息 - 更显著
        const phaseNames = ['', '第一阶段', '第二阶段', '狂暴模式'];
        const phaseEmojis = ['', '⚔️', '🔥', '💀'];

        // 主标题
        this.scene.showFloatingText(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2 - 30,
            `${phaseEmojis[newPhase]} ${phaseNames[newPhase]}! ${phaseEmojis[newPhase]}`,
            '#ff0000',
            3000
        );

        // 副标题（P3显示特别提示）
        if (newPhase === 3) {
            this.scene.showFloatingText(
                this.scene.cameras.main.width / 2,
                this.scene.cameras.main.height / 2,
                '⚠️ Boss已进入狂暴状态! ⚠️',
                '#ff0000',
                2500
            );
        }

        // P2时提升攻击力
        if (newPhase === 2 && oldPhase === 1) {
            const attackBoost = 5;
            this.enemy.setData('attack', this.attack + attackBoost);
            console.log(`⚔️ Boss攻击力提升: ${this.attack} → ${this.attack + attackBoost}`);
        }

        // P3时大幅提升攻击力和速度
        if (newPhase === 3 && oldPhase === 2) {
            const attackBoost = 10;
            const speedBoost = 20;
            this.enemy.setData('attack', this.attack + attackBoost);
            this.enemy.setData('speed', this.speed + speedBoost);
            console.log(`⚔️ Boss进入狂暴模式! 攻击+${attackBoost}, 速度+${speedBoost}`);
        }
    }

    /**
     * 更新Boss（每帧调用）
     */
    update(time, delta, player) {
        if (!this.isActive || this.isDead || !this.enemy) return;

        // 更新血条显示
        const currentHp = this.enemy.getData('hp');
        const maxHp = this.enemy.getData('maxHp');
        this.updateHealthBar(currentHp, maxHp);

        // 更新阶段
        const hpPercent = currentHp / maxHp;
        this.updatePhase(hpPercent);

        // 尝试释放技能
        this.tryCastSkill(time, player);

        // 检查Boss是否死亡
        if (currentHp <= 0 && !this.isDead) {
            this.die();
        }
    }

    /**
     * 尝试释放技能
     */
    tryCastSkill(time, player) {
        // 如果正在释放技能，不释放新技能
        if (this.activeSkill) return;

        // 计算与玩家的距离
        const distance = Phaser.Math.Distance.Between(
            this.enemy.x,
            this.enemy.y,
            player.x,
            player.y
        );

        // 根据技能类型释放技能
        if (this.skillType === 'nature') {
            this.castNatureSkills(time, player, distance);
        } else if (this.skillType === 'ice') {
            this.castIceSkills(time, player, distance);
        } else if (this.skillType === 'fire') {
            this.castFireSkills(time, player, distance);
        }
    }

    /**
     * 释放自然系技能 (树妖王)
     */
    castNatureSkills(time, player, distance) {
        // P2+技能: 根须缠绕 (8秒冷却，距离近时释放)
        if (this.phase >= 2 && distance < 150) {
            if (this.canUseSkill('rootBind', time)) {
                this.castRootBind(player, time);
                return;
            }
        }

        // P2+技能: 落石攻击 (12秒冷却，持续释放)
        if (this.phase >= 2) {
            if (this.canUseSkill('rockFall', time)) {
                this.castRockFall(player, time);
                return;
            }
        }

        // P3技能: 召唤树苗 (15秒冷却)
        if (this.phase >= 3) {
            if (this.canUseSkill('summon', time)) {
                this.castSummon(time);
                return;
            }
        }
    }

    /**
     * 释放冰系技能 (雪怪王)
     */
    castIceSkills(time, player, distance) {
        // P1+技能: 霜冻吐息 (10秒冷却)
        if (this.phase >= 1 && distance < 200) {
            if (this.canUseSkill('frostBreath', time)) {
                this.castFrostBreath(player, time);
                return;
            }
        }

        // P2+技能: 暴风雪 (15秒冷却)
        if (this.phase >= 2) {
            if (this.canUseSkill('blizzard', time)) {
                this.castBlizzard(time);
                return;
            }
        }

        // P3技能: 雪崩 (20秒冷却)
        if (this.phase >= 3) {
            if (this.canUseSkill('avalanche', time)) {
                this.castAvalanche(player, time);
                return;
            }
        }
    }

    /**
     * 释放火系技能 (龙王)
     */
    castFireSkills(time, player, distance) {
        // P1+技能: 火焰吐息 (8秒冷却)
        if (this.phase >= 1 && distance < 250) {
            if (this.canUseSkill('fireBreath', time)) {
                this.castFireBreath(player, time);
                return;
            }
        }

        // P2+技能: 翅膀拍击 (12秒冷却)
        if (this.phase >= 2 && distance < 150) {
            if (this.canUseSkill('wingFlap', time)) {
                this.castWingFlap(player, time);
                return;
            }
        }

        // P3技能: 炼狱 (18秒冷却)
        if (this.phase >= 3) {
            if (this.canUseSkill('inferno', time)) {
                this.castInferno(time);
                return;
            }
        }
    }

    /**
     * 检查技能是否可用
     */
    canUseSkill(skillName, time) {
        const skill = this.skills[skillName];
        if (!skill) return false;

        // 检查阶段是否足够
        if (this.phase < skill.minPhase) return false;

        // 检查冷却
        if (time - skill.lastUsed < skill.cooldown) return false;

        return true;
    }

    /**
     * 技能1: 根须缠绕
     */
    castRootBind(player, time) {
        const skill = this.skills.rootBind;
        skill.lastUsed = time;

        console.log(`🌿 Boss准备释放技能: ${skill.name}`);

        // 显示预警圈（绿色）
        const warningCircle = this.scene.add.graphics();
        warningCircle.lineStyle(3, 0x00ff00, 0.8);
        warningCircle.strokeCircle(player.x, player.y, 60);
        warningCircle.setDepth(150);
        this.skillWarnings.push(warningCircle);

        // 预警文字
        const warningText = this.scene.add.text(
            player.x,
            player.y - 50,
            '🌿 根须缠绕!',
            { font: 'bold 20px Arial', fill: '#00ff00', stroke: '#000', strokeThickness: 3 }
        ).setOrigin(0.5).setDepth(151);
        this.skillWarnings.push(warningText);

        // 1秒后定身玩家
        this.scene.time.delayedCall(1000, () => {
            // 清除警告
            warningCircle.destroy();
            warningText.destroy();

            console.log(`🌿 Boss释放技能: ${skill.name}`);

            // 显示技能提示
            this.scene.showFloatingText(
                player.x,
                player.y - 40,
                `🌿 ${skill.name}!`,
                '#00ff00',
                1500
            );

            // 定身玩家（无法移动）
            const originalSpeed = player.speed;
            player.speed = 0;
            player.setData('rooted', true);

            // 2秒后恢复
            this.scene.time.delayedCall(skill.duration, () => {
                if (player.active) {
                    player.speed = originalSpeed;
                    player.setData('rooted', false);
                    console.log('🌿 玩家从根须中解脱');
                }
            });

            // 造成伤害
            this.damagePlayer(player, skill.damage);
        });
    }

    /**
     * 技能2: 落石攻击
     */
    castRockFall(player, time) {
        const skill = this.skills.rockFall;
        skill.lastUsed = time;

        console.log(`🪨 Boss释放技能: ${skill.name}`);

        // 显示警告圈
        const warningCircle = this.scene.add.graphics();
        warningCircle.fillStyle(0xff0000, 0.3);
        warningCircle.fillCircle(player.x, player.y, 80);
        warningCircle.setDepth(150);
        this.skillWarnings.push(warningCircle);

        // 警告文字
        const warningText = this.scene.add.text(
            player.x,
            player.y,
            '⚠️',
            { font: '40px Arial', fill: '#ff0000' }
        ).setOrigin(0.5).setDepth(151);
        this.skillWarnings.push(warningText);

        // 1.5秒后造成伤害
        this.scene.time.delayedCall(skill.warningTime, () => {
            // 清除警告
            warningCircle.destroy();
            warningText.destroy();

            // 检查玩家是否还在范围内
            const distance = Phaser.Math.Distance.Between(
                player.x,
                player.y,
                player.x,  // 落石中心就是玩家当时的位置
                player.y
            );

            if (distance < 80) {
                this.damagePlayer(player, skill.damage);
                this.scene.showFloatingText(
                    player.x,
                    player.y - 20,
                    `🪨 ${skill.name}! -${skill.damage}`,
                    '#ff6600'
                );
            }
        });
    }

    /**
     * 技能3: 召唤树苗
     */
    castSummon(time) {
        const skill = this.skills.summon;
        skill.lastUsed = time;

        console.log(`🌱 Boss准备释放技能: ${skill.name}`);

        // 显示多个预警圈（在召唤位置）
        const warningCircles = [];
        for (let i = 0; i < skill.count; i++) {
            const offsetX = Phaser.Math.Between(-100, 100);
            const offsetY = Phaser.Math.Between(-100, 100);
            const spawnX = Phaser.Math.Clamp(this.enemy.x + offsetX, 100, 700);
            const spawnY = Phaser.Math.Clamp(this.enemy.y + offsetY, 100, 500);

            const warningCircle = this.scene.add.graphics();
            warningCircle.lineStyle(3, 0x68d391, 0.8);
            warningCircle.strokeCircle(spawnX, spawnY, 40);
            warningCircle.setDepth(150);
            warningCircles.push(warningCircle);
            this.skillWarnings.push(warningCircle);
        }

        // 预警文字
        const warningText = this.scene.add.text(
            this.enemy.x,
            this.enemy.y - 60,
            '🌱 召唤树苗!',
            { font: 'bold 20px Arial', fill: '#68d391', stroke: '#000', strokeThickness: 3 }
        ).setOrigin(0.5).setDepth(151);
        this.skillWarnings.push(warningText);

        // 1.5秒后召唤
        this.scene.time.delayedCall(1500, () => {
            // 清除警告
            warningCircles.forEach(circle => circle.destroy());
            warningText.destroy();

            console.log(`🌱 Boss释放技能: ${skill.name}`);

            // 显示技能提示
            this.scene.showFloatingText(
                400,
                250,
                `🌱 ${skill.name}!`,
                '#68d391',
                2000
            );

            // 召唤3只小树妖
            for (let i = 0; i < skill.count; i++) {
                const offsetX = Phaser.Math.Between(-100, 100);
                const offsetY = Phaser.Math.Between(-100, 100);
                const spawnX = Phaser.Math.Clamp(this.enemy.x + offsetX, 100, 700);
                const spawnY = Phaser.Math.Clamp(this.enemy.y + offsetY, 100, 500);

                this.scene.sceneManager.spawnEnemy('treant', spawnX, spawnY);
            }

            console.log(`🌱 召唤了${skill.count}只小树妖`);
        });
    }

    // ============ Milestone 7 Sprint 4: 冰系技能 (雪怪王) ============

    /**
     * 冰系技能1: 霜冻吐息
     */
    castFrostBreath(player, time) {
        const skill = this.skills.frostBreath;
        skill.lastUsed = time;

        console.log(`❄️ Boss准备释放技能: ${skill.name}`);

        // 显示预警锥形（蓝色）
        const angle = Phaser.Math.Angle.Between(this.enemy.x, this.enemy.y, player.x, player.y);
        const warningCone = this.scene.add.graphics();
        warningCone.lineStyle(3, 0x87ceeb, 0.8);
        warningCone.setDepth(150);

        // 画一个扇形预警区
        warningCone.beginPath();
        warningCone.moveTo(this.enemy.x, this.enemy.y);
        for (let a = angle - 0.3; a <= angle + 0.3; a += 0.1) {
            warningCone.lineTo(this.enemy.x + Math.cos(a) * 200, this.enemy.y + Math.sin(a) * 200);
        }
        warningCone.closePath();
        warningCone.strokePath();
        this.skillWarnings.push(warningCone);

        // 预警文字
        const warningText = this.scene.add.text(
            this.enemy.x,
            this.enemy.y - 60,
            '❄️ 霜冻吐息!',
            { font: 'bold 20px Arial', fill: '#87ceeb', stroke: '#000', strokeThickness: 3 }
        ).setOrigin(0.5).setDepth(151);
        this.skillWarnings.push(warningText);

        // 1秒后释放
        this.scene.time.delayedCall(1000, () => {
            // 清除警告
            warningCone.destroy();
            warningText.destroy();

            console.log(`❄️ Boss释放技能: ${skill.name}`);

            // 检查玩家是否在锥形范围内
            const distance = Phaser.Math.Distance.Between(this.enemy.x, this.enemy.y, player.x, player.y);
            const playerAngle = Phaser.Math.Angle.Between(this.enemy.x, this.enemy.y, player.x, player.y);
            const angleDiff = Math.abs(playerAngle - angle);

            if (distance < 200 && angleDiff < 0.3) {
                this.damagePlayer(player, skill.damage);

                // 减速效果
                const originalSpeed = player.speed;
                player.speed = player.speed * 0.5; // 减速50%

                this.scene.showFloatingText(
                    player.x,
                    player.y - 40,
                    `❄️ ${skill.name}! -${skill.damage} (减速)`,
                    '#87ceeb',
                    2000
                );

                // 3秒后恢复速度
                this.scene.time.delayedCall(skill.slowDuration, () => {
                    if (player.active) {
                        player.speed = originalSpeed;
                    }
                });
            }
        });
    }

    /**
     * 冰系技能2: 暴风雪
     */
    castBlizzard(time) {
        const skill = this.skills.blizzard;
        skill.lastUsed = time;

        console.log(`🌨️ Boss准备释放技能: ${skill.name}`);

        // 全屏预警（蓝色雪花）
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(100, 700);
            const y = Phaser.Math.Between(50, 550);
            const warning = this.scene.add.text(x, y, '❄️', { font: '30px Arial', fill: '#87ceeb' });
            warning.setDepth(150);
            this.skillWarnings.push(warning);

            // 2秒后消失
            this.scene.time.delayedCall(2000, () => warning.destroy());
        }

        // 预警文字
        const warningText = this.scene.add.text(
            400,
            250,
            '🌨️ 暴风雪来袭!',
            { font: 'bold 24px Arial', fill: '#87ceeb', stroke: '#000', strokeThickness: 4 }
        ).setOrigin(0.5).setDepth(151);
        this.skillWarnings.push(warningText);

        // 2秒后开始造成伤害
        this.scene.time.delayedCall(2000, () => {
            warningText.destroy();

            console.log(`🌨️ Boss释放技能: ${skill.name}`);

            this.scene.showFloatingText(
                400,
                300,
                `🌨️ ${skill.name}!`,
                '#87ceeb',
                3000
            );

            // 持续伤害
            const blizzardTimer = this.scene.time.addEvent({
                delay: 1000,  // 每秒造成一次伤害
                callback: () => {
                    if (this.scene.player && this.scene.player.active) {
                        this.damagePlayer(this.scene.player, skill.damage);
                        this.scene.showFloatingText(
                            this.scene.player.x,
                            this.scene.player.y - 30,
                            `🌨️ -${skill.damage}`,
                            '#87ceeb',
                            1000
                        );
                    }
                },
                repeat: skill.duration / 1000  // 持续5秒 = 5次伤害
            });
        });
    }

    /**
     * 冰系技能3: 雪崩
     */
    castAvalanche(player, time) {
        const skill = this.skills.avalanche;
        skill.lastUsed = time;

        console.log(`🏔️ Boss准备释放技能: ${skill.name}`);

        // 显示多个预警圆
        const warningCircles = [];
        const dropPositions = [];

        for (let i = 0; i < 5; i++) {
            const x = Phaser.Math.Between(200, 600);
            const y = Phaser.Math.Between(200, 400);
            dropPositions.push({ x, y });

            const warningCircle = this.scene.add.graphics();
            warningCircle.fillStyle(0xe0ffff, 0.4);
            warningCircle.fillCircle(x, y, 60);
            warningCircle.setDepth(150);
            warningCircles.push(warningCircle);
            this.skillWarnings.push(warningCircle);
        }

        // 预警文字
        const warningText = this.scene.add.text(
            400,
            200,
            '🏔️ 雪崩警告!',
            { font: 'bold 24px Arial', fill: '#e0ffff', stroke: '#000', strokeThickness: 4 }
        ).setOrigin(0.5).setDepth(151);
        this.skillWarnings.push(warningText);

        // 2秒后落下
        this.scene.time.delayedCall(skill.warningTime, () => {
            // 清除警告
            warningCircles.forEach(circle => circle.destroy());
            warningText.destroy();

            console.log(`🏔️ Boss释放技能: ${skill.name}`);

            this.scene.showFloatingText(
                400,
                250,
                `🏔️ ${skill.name}!`,
                '#e0ffff',
                2000
            );

            // 检查玩家是否在任何一个落雪范围内
            let hit = false;
            dropPositions.forEach(pos => {
                const distance = Phaser.Math.Distance.Between(pos.x, pos.y, player.x, player.y);
                if (distance < 60) {
                    if (!hit) {
                        this.damagePlayer(player, skill.damage);
                        this.scene.showFloatingText(
                            player.x,
                            player.y - 40,
                            `🏔️ ${skill.name}! -${skill.damage}`,
                            '#e0ffff'
                        );
                        hit = true;
                    }
                }
            });
        });
    }

    // ============ Milestone 7 Sprint 4: 火系技能 (龙王) ============

    /**
     * 火系技能1: 火焰吐息
     */
    castFireBreath(player, time) {
        const skill = this.skills.fireBreath;
        skill.lastUsed = time;

        console.log(`🔥 Boss准备释放技能: ${skill.name}`);

        // 显示预警锥形（红色）
        const angle = Phaser.Math.Angle.Between(this.enemy.x, this.enemy.y, player.x, player.y);
        const warningCone = this.scene.add.graphics();
        warningCone.lineStyle(3, 0xff4500, 0.8);
        warningCone.setDepth(150);

        warningCone.beginPath();
        warningCone.moveTo(this.enemy.x, this.enemy.y);
        for (let a = angle - 0.4; a <= angle + 0.4; a += 0.1) {
            warningCone.lineTo(this.enemy.x + Math.cos(a) * 250, this.enemy.y + Math.sin(a) * 250);
        }
        warningCone.closePath();
        warningCone.strokePath();
        this.skillWarnings.push(warningCone);

        // 预警文字
        const warningText = this.scene.add.text(
            this.enemy.x,
            this.enemy.y - 60,
            '🔥 火焰吐息!',
            { font: 'bold 20px Arial', fill: '#ff4500', stroke: '#000', strokeThickness: 3 }
        ).setOrigin(0.5).setDepth(151);
        this.skillWarnings.push(warningText);

        // 1秒后释放
        this.scene.time.delayedCall(1000, () => {
            // 清除警告
            warningCone.destroy();
            warningText.destroy();

            console.log(`🔥 Boss释放技能: ${skill.name}`);

            // 检查玩家是否在锥形范围内
            const distance = Phaser.Math.Distance.Between(this.enemy.x, this.enemy.y, player.x, player.y);
            const playerAngle = Phaser.Math.Angle.Between(this.enemy.x, this.enemy.y, player.x, player.y);
            const angleDiff = Math.abs(playerAngle - angle);

            if (distance < 250 && angleDiff < 0.4) {
                this.damagePlayer(player, skill.damage);

                // 燃烧效果（持续伤害）
                let burnTicks = 0;
                const burnTimer = this.scene.time.addEvent({
                    delay: 1000,  // 每秒燃烧一次
                    callback: () => {
                        if (this.scene.player && this.scene.player.active && burnTicks < 5) {
                            this.damagePlayer(this.scene.player, skill.burnDamage);
                            this.scene.showFloatingText(
                                this.scene.player.x,
                                this.scene.player.y - 30,
                                `🔥 燃烧 -${skill.burnDamage}`,
                                '#ff4500',
                                1000
                            );
                            burnTicks++;
                        }
                    },
                    repeat: 4
                });

                this.scene.showFloatingText(
                    player.x,
                    player.y - 40,
                    `🔥 ${skill.name}! -${skill.damage} (燃烧)`,
                    '#ff4500',
                    2000
                );
            }
        });
    }

    /**
     * 火系技能2: 翅膀拍击
     */
    castWingFlap(player, time) {
        const skill = this.skills.wingFlap;
        skill.lastUsed = time;

        console.log(`🌪️ Boss准备释放技能: ${skill.name}`);

        // 显示预警圆（围绕Boss）
        const warningCircle = this.scene.add.graphics();
        warningCircle.lineStyle(4, 0xff6600, 0.9);
        warningCircle.strokeCircle(this.enemy.x, this.enemy.y, 120);
        warningCircle.setDepth(150);
        this.skillWarnings.push(warningCircle);

        // 预警文字
        const warningText = this.scene.add.text(
            this.enemy.x,
            this.enemy.y - 80,
            '🌪️ 翅膀拍击!',
            { font: 'bold 20px Arial', fill: '#ff6600', stroke: '#000', strokeThickness: 3 }
        ).setOrigin(0.5).setDepth(151);
        this.skillWarnings.push(warningText);

        // 0.8秒后释放
        this.scene.time.delayedCall(800, () => {
            // 清除警告
            warningCircle.destroy();
            warningText.destroy();

            console.log(`🌪️ Boss释放技能: ${skill.name}`);

            // 检查玩家是否在范围内
            const distance = Phaser.Math.Distance.Between(this.enemy.x, this.enemy.y, player.x, player.y);

            if (distance < 120) {
                this.damagePlayer(player, skill.damage);

                // 击退效果
                const angle = Phaser.Math.Angle.Between(this.enemy.x, this.enemy.y, player.x, player.y);
                const knockbackX = player.x + Math.cos(angle) * skill.knockback;
                const knockbackY = player.y + Math.sin(angle) * skill.knockback;

                // 平滑移动玩家
                this.scene.tweens.add({
                    targets: player,
                    x: knockbackX,
                    y: knockbackY,
                    duration: 300,
                    ease: 'Power2'
                });

                this.scene.showFloatingText(
                    player.x,
                    player.y - 40,
                    `🌪️ ${skill.name}! -${skill.damage} (击退)`,
                    '#ff6600'
                );

                // 屏幕震动
                this.scene.cameras.main.shake(300, 0.02);
            }
        });
    }

    /**
     * 火系技能3: 炼狱
     */
    castInferno(time) {
        const skill = this.skills.inferno;
        skill.lastUsed = time;

        console.log(`😈 Boss准备释放技能: ${skill.name}`);

        // 全屏变红预警
        this.scene.cameras.main.flash(2000, 255, 100, 0, false, (camera, progress) => {
            if (progress === 1) {
                camera.stopFlash();
            }
        });

        // 显示多个火焰预警
        for (let i = 0; i < 15; i++) {
            const x = Phaser.Math.Between(150, 650);
            const y = Phaser.Math.Between(100, 500);
            const warning = this.scene.add.text(x, y, '🔥', { font: '40px Arial', fill: '#ff4500' });
            warning.setDepth(150);
            this.skillWarnings.push(warning);

            this.scene.time.delayedCall(3000, () => warning.destroy());
        }

        // 预警文字
        const warningText = this.scene.add.text(
            400,
            200,
            '😈 炼狱降临!',
            { font: 'bold 28px Arial', fill: '#ff0000', stroke: '#000', strokeThickness: 4 }
        ).setOrigin(0.5).setDepth(151);
        this.skillWarnings.push(warningText);

        // 3秒后开始
        this.scene.time.delayedCall(3000, () => {
            warningText.destroy();

            console.log(`😈 Boss释放技能: ${skill.name}`);

            this.scene.showFloatingText(
                400,
                300,
                `😈 ${skill.name}!`,
                '#ff0000',
                3000
            );

            // 持续高伤害
            const infernoTimer = this.scene.time.addEvent({
                delay: 500,  // 每0.5秒造成一次伤害
                callback: () => {
                    if (this.scene.player && this.scene.player.active) {
                        this.damagePlayer(this.scene.player, skill.damage / 2);  // 每次伤害减半
                        this.scene.showFloatingText(
                            this.scene.player.x,
                            this.scene.player.y - 30,
                            `😈 -${Math.floor(skill.damage / 2)}`,
                            '#ff0000',
                            800
                        );
                    }
                },
                repeat: skill.duration / 500  // 持续8秒 = 16次伤害
            });
        });
    }

    /**
     * 对玩家造成伤害
     */
    damagePlayer(player, damage) {
        // 检查玩家是否无敌
        if (player.getData('invincible')) return;

        const oldHp = player.hp;
        player.hp = Math.max(0, player.hp - damage);

        console.log(`💔 Boss技能伤害: -${damage}, HP: ${oldHp} → ${player.hp}`);

        // 显示伤害数字
        if (this.scene.combatSystem) {
            this.scene.combatSystem.showDamageNumber(player.x, player.y, damage, '#ff0066');
        } else if (this.scene.objectPool) {
            // 备用方案：使用对象池
            const text = this.scene.objectPool.getDamageText(player.x, player.y, damage, '#ff0066', 20);
            this.scene.tweens.add({
                targets: text,
                y: player.y - 50,
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    this.scene.objectPool.recycleDamageText(text);
                }
            });
        }

        // 设置短暂无敌
        player.setData('invincible', true);
        player.setAlpha(0.5);

        this.scene.time.delayedCall(500, () => {
            player.setData('invincible', false);
            player.setAlpha(1);
        });

        // 屏幕震动
        this.scene.cameras.main.shake(200, 0.015);

        // 更新UI
        this.scene.updateUI();

        // 检查玩家死亡
        if (player.hp <= 0) {
            this.scene.gameOver();
        }
    }

    /**
     * Boss死亡
     */
    die() {
        this.isDead = true;
        this.isActive = false;

        console.log(`👑 Boss被击败: ${this.type}`);

        // 隐藏血条
        this.hideHealthBar();

        // 播放Boss死亡音效
        if (this.scene.audioManager) {
            this.scene.audioManager.playBossDeath();
        }

        // 相机庆祝效果
        this.scene.cameras.main.flash(1000, 255, 215, 0); // 金色闪光
        this.scene.cameras.main.shake(1000, 0.01);

        const centerX = this.scene.cameras.main.width / 2;
        const centerY = this.scene.cameras.main.height / 2;

        // 显示击败消息 - 更隆重
        // 主标题（最大）
        this.scene.showFloatingText(
            centerX,
            centerY - 80,
            '🎉 胜利! 🎉',
            '#ffd700',
            4000
        );

        // 副标题
        this.scene.showFloatingText(
            centerX,
            centerY - 50,
            '👑 树妖王被击败!',
            '#ffd700',
            3500
        );

        // 显示奖励
        setTimeout(() => {
            this.scene.showFloatingText(
                centerX,
                centerY,
                `💰 +${this.gold} 金币`,
                '#ffd700',
                2500
            );
        }, 500);

        setTimeout(() => {
            this.scene.showFloatingText(
                centerX,
                centerY + 30,
                `⭐ +${this.xp} XP`,
                '#00bfff',
                2500
            );
        }, 1000);

        // 实际给予奖励
        if (this.scene.player) {
            this.scene.player.gold += this.gold;
            this.scene.player.xp += this.xp;
            console.log(`💰 获得Boss奖励: ${this.gold}金币, ${this.xp}XP`);
        }

        // 解锁成就：森林守护者
        if (this.scene.achievementManager) {
            this.scene.achievementManager.unlock('forest_guardian');

            // 解锁成就：幸存者
            this.scene.achievementManager.unlock('survivor');

            // 检查任务大师成就
            this.scene.achievementManager.checkAchievements();
        }

        // 触发Boss死亡事件（用于任务系统）
        this.scene.events.emit('bossDefeated', this.type);

        // 延迟4秒后显示胜利场景
        this.scene.time.delayedCall(4000, () => {
            this.showVictoryScene();
        });

        // 延迟清理（让玩家看到死亡效果）
        this.scene.time.delayedCall(3000, () => {
            this.destroy();
        });
    }

    /**
     * 显示胜利场景
     */
    showVictoryScene() {
        // 切换到胜利场景
        this.scene.scene.start('VictoryScene');
    }

    /**
     * 清理Boss
     */
    destroy() {
        // 清理血条UI
        if (this.hpBarBg) this.hpBarBg.destroy();
        if (this.hpBar) this.hpBar.destroy();
        if (this.nameText) this.nameText.destroy();
        if (this.hpText) this.hpText.destroy();
        if (this.phaseText) this.phaseText.destroy();

        // 清理敌人精灵
        if (this.enemy) {
            // 移除血条
            if (this.enemy.hpBar) this.enemy.hpBar.destroy();
            if (this.enemy.hpBarBg) this.enemy.hpBarBg.destroy();
            this.enemy.destroy();
        }

        console.log(`🗑️ Boss清理完成: ${this.type}`);
    }

    /**
     * 获取Boss信息
     */
    getInfo() {
        return {
            type: this.type,
            hp: this.enemy ? this.enemy.getData('hp') : this.hp,
            maxHp: this.enemy ? this.enemy.getData('maxHp') : this.maxHp,
            phase: this.phase,
            isEnraged: this.isEnraged,
            isActive: this.isActive,
            isDead: this.isDead
        };
    }
}
