/**
 * SkillBar - 技能栏UI组件
 * 显示技能图标、冷却状态、按键绑定
 * @version 1.0 - Milestone 6 Iteration 4
 */
class SkillBar {
    constructor(scene) {
        this.scene = scene;
        this.skillSystem = scene.skillSystem;
        this.skillKeys = ['whirlwind_slash', 'charge', 'healing_light', 'ultimate'];

        this.initSkillBar();
        console.log('🎯 SkillBar UI 初始化完成');
    }

    /**
     * 初始化技能栏
     */
    initSkillBar() {
        const skillBar = document.getElementById('skill-bar');

        if (!skillBar) {
            console.warn('⚠️ skill-bar 元素不存在');
            return;
        }

        // 清空现有内容
        skillBar.innerHTML = '';

        // 创建每个技能槽
        this.skillKeys.forEach(skillKey => {
            const def = SKILL_DEFINITIONS[skillKey];
            const skillState = this.skillSystem.getSkillState(skillKey);

            const slot = document.createElement('div');
            slot.className = 'skill-slot';
            slot.id = 'skill-slot-' + skillKey;
            slot.setAttribute('data-skill', skillKey);

            // 技能图标
            const icon = document.createElement('div');
            icon.className = 'skill-icon';
            icon.textContent = def.icon;

            // 按键提示
            const key = document.createElement('div');
            key.className = 'skill-key';
            key.textContent = def.keyBinding;

            // MP 消耗
            const cost = document.createElement('div');
            cost.className = 'skill-cost';
            cost.textContent = def.mpCost + 'MP';

            // 冷却遮罩
            const cooldownOverlay = document.createElement('div');
            cooldownOverlay.className = 'cooldown-overlay';
            cooldownOverlay.id = 'cooldown-overlay-' + skillKey;

            // 冷却文本
            const cooldownText = document.createElement('div');
            cooldownText.className = 'cooldown-text';
            cooldownText.id = 'cooldown-text-' + skillKey;
            cooldownText.style.display = 'none';

            // 组装
            slot.appendChild(icon);
            slot.appendChild(key);
            slot.appendChild(cost);
            slot.appendChild(cooldownOverlay);
            slot.appendChild(cooldownText);
            skillBar.appendChild(slot);

            // 初始化状态
            this.updateSkillState(skillKey);
        });

        // 显示技能栏
        skillBar.style.display = 'flex';
    }

    /**
     * 更新单个技能状态
     */
    updateSkillState(skillKey) {
        const skillState = this.skillSystem.getSkillState(skillKey);
        const slot = document.getElementById('skill-slot-' + skillKey);

        if (!slot) return;

        // 更新锁定状态
        if (skillState.unlocked) {
            slot.classList.remove('locked');
        } else {
            slot.classList.add('locked');
        }
    }

    /**
     * 更新所有技能状态
     */
    updateAllSkills() {
        this.skillKeys.forEach(skillKey => {
            this.updateSkillState(skillKey);
        });
    }

    /**
     * 更新冷却显示
     */
    updateCooldown(skillKey, remaining) {
        const skillState = this.skillSystem.getSkillState(skillKey);
        const def = skillState.definition;
        const overlay = document.getElementById('cooldown-overlay-' + skillKey);
        const text = document.getElementById('cooldown-text-' + skillKey);

        if (!overlay || !text) return;

        if (remaining > 0) {
            // 计算冷却百分比
            const percent = (remaining / def.cooldown) * 100;
            overlay.style.height = percent + '%';

            // 显示冷却时间
            const seconds = Math.ceil(remaining / 1000);
            text.textContent = seconds;
            text.style.display = 'block';
        } else {
            // 冷却完成
            overlay.style.height = '0%';
            text.style.display = 'none';
        }
    }

    /**
     * 显示技能栏
     */
    show() {
        const skillBar = document.getElementById('skill-bar');
        if (skillBar) {
            skillBar.style.display = 'flex';
        }
    }

    /**
     * 隐藏技能栏
     */
    hide() {
        const skillBar = document.getElementById('skill-bar');
        if (skillBar) {
            skillBar.style.display = 'none';
        }
    }

    /**
     * 销毁技能栏
     */
    destroy() {
        const skillBar = document.getElementById('skill-bar');
        if (skillBar) {
            skillBar.innerHTML = '';
        }
    }
}
