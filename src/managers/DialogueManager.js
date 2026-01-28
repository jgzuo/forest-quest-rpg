/**
 * DialogueManager - 对话管理器
 * 管理NPC对话树、多状态对话和剧情对话
 * @version 1.0 - Milestone 7
 */
class DialogueManager {
    constructor(scene) {
        this.scene = scene;
        this.currentDialogue = null;
        this.dialogueHistory = [];

        // 对话状态跟踪
        this.conversationStates = {
            elder: {
                timesTalked: 0,
                quest1Started: false,
                quest1Completed: false,
                quest2Completed: false,
                introducedForest: false,
                introducedBoss: false
            },
            merchant: {
                timesTalked: 0,
                quest6Started: false,
                quest6Completed: false,
                introducedShop: false
            }
        };

        console.log('💬 DialogueManager 初始化完成');
    }

    /**
     * 开始对话
     * @param {string} npcId - NPC ID
     * @param {object} npcData - NPC数据对象
     */
    startDialogue(npcId, npcData) {
        const dialogue = this.getDialogueForNPC(npcId);
        if (!dialogue) {
            console.warn(`⚠️ 未找到NPC对话: ${npcId}`);
            return;
        }

        this.currentDialogue = {
            npcId: npcId,
            currentNode: dialogue.startNode,
            data: dialogue
        };

        this.displayCurrentNode();
        console.log(`💬 开始对话: ${npcId} (节点: ${dialogue.startNode})`);
    }

    /**
     * 获取NPC对话树
     */
    getDialogueForNPC(npcId) {
        switch (npcId) {
            case 'elder':
                return this.getElderDialogue();
            case 'merchant':
                return this.getMerchantDialogue();
            default:
                return null;
        }
    }

    /**
     * 村长对话树
     */
    getElderDialogue() {
        const state = this.conversationStates.elder;
        const quest1 = this.scene.questManager.getQuest('quest_1_moles');
        const quest2 = this.scene.questManager.getQuest('quest_2_gems');

        return {
            startNode: this.getElderStartNode(state, quest1, quest2),
            nodes: {
                'greeting': {
                    text: `村长：啊，年轻的冒险者！欢迎来到我们的小镇。

${state.timesTalked === 0 ? `我是这个村子的村长。最近森林里的情况变得越来越糟糕了...` : `很高兴再次见到你！`}`,
                    options: [
                        {
                            text: '森林发生了什么？',
                            action: () => this.goToNode('forest_problem')
                        },
                        {
                            text: '有什么我可以帮忙的吗？',
                            action: () => this.goToNode('available_quests')
                        },
                        {
                            text: '再见',
                            action: () => this.endDialogue()
                        }
                    ]
                },
                'forest_problem': {
                    text: `村长：森林被一股邪恶的力量腐化了！

起初只是几只鼹鼠变得异常攻击性，但现在连树妖也黑化了。最可怕的是，传说洞穴深处沉睡着一个古老的邪恶存在...

你必须小心，冒险者。这片森林已经不再安全了。`,
                    options: [
                        {
                            text: '我会小心的。有任务可以接吗？',
                            action: () => this.goToNode('available_quests')
                        },
                        {
                            text: '明白了，再见',
                            action: () => this.endDialogue()
                        }
                    ]
                },
                'available_quests': {
                    text: this.getElderQuestText(state, quest1, quest2),
                    options: this.getElderQuestOptions(state, quest1, quest2)
                },
                'quest1_hint': {
                    text: `村长：那些鼹鼠破坏了森林的根系系统！如果你能击败10只鼹鼠，不仅能保护森林，我还会给你丰厚的奖励。

鼹鼠主要在森林区域活动，小心它们的突然袭击！`,
                    options: [
                        {
                            text: '我接受这个任务！',
                            action: () => {
                                this.scene.questManager.startQuest('quest_1_moles');
                                state.quest1Started = true;
                                this.goToNode('quest1_accepted');
                            }
                        },
                        {
                            text: '让我再想想',
                            action: () => this.goToNode('greeting')
                        }
                    ]
                },
                'quest1_accepted': {
                    text: `村长：太好了！我就知道你有勇气面对这些挑战。

去吧，击败那些鼹鼠，向森林的腐化宣战！`,
                    options: [
                        {
                            text: '我会的！',
                            action: () => this.endDialogue()
                        }
                    ]
                },
                'quest1_progress': {
                    text: this.getQuest1ProgressText(quest1),
                    options: [
                        {
                            text: '我会继续努力的',
                            action: () => this.endDialogue()
                        },
                        {
                            text: '查看其他任务',
                            action: () => this.goToNode('available_quests')
                        }
                    ]
                },
                'quest1_complete': {
                    text: `村长：太棒了！你做得非常好！

有了你的帮助，森林终于有了一线生机。这是你应得的奖励！

${this.getQuestRewardText(quest1)}`,
                    options: [
                        {
                            text: '谢谢您的奖励！',
                            action: () => {
                                this.goToNode('post_quest1');
                            }
                        }
                    ]
                },
                'post_quest1': {
                    text: `村长：既然你已经证明了自己的实力，我想告诉你更多的事情...

洞穴深处传来了一些不祥的消息。树妖王，森林曾经的守护者，现在已经完全腐化了。

但是在你面对它之前，你需要收集一些神秘宝石来增强你的力量。`,
                    options: [
                        {
                            text: '宝石？我在哪里可以找到？',
                            action: () => this.goToNode('quest2_intro')
                        },
                        {
                            text: '我明白了',
                            action: () => this.endDialogue()
                        }
                    ]
                },
                'quest2_intro': {
                    text: `村长：那些宝石散落在森林各处，它们是古代森林魔法的结晶。

如果你能收集到3颗宝石，你将获得足够的力量去面对树妖王。

寻找宝石的过程中，你可能还会遇到其他的挑战...`,
                    options: [
                        {
                            text: '我会找到那些宝石的',
                            action: () => {
                                if (quest2.status === 'not_started') {
                                    this.scene.questManager.startQuest('quest_2_gems');
                                }
                                this.endDialogue();
                            }
                        }
                    ]
                },
                'quest2_progress': {
                    text: this.getQuest2ProgressText(quest2),
                    options: [
                        {
                            text: '我继续寻找',
                            action: () => this.endDialogue()
                        }
                    ]
                },
                'quest2_complete': {
                    text: `村长：难以置信！你真的找到了所有的宝石！

这些宝石中蕴含的力量...我仿佛能感受到森林的祝福。你现在有资格去面对树妖王了！

${this.getQuestRewardText(quest2)}`,
                    options: [
                        {
                            text: '为了森林！',
                            action: () => this.goToNode('boss_intro')
                        }
                    ]
                },
                'boss_intro': {
                    text: `村长：树妖王盘踞在洞穴的最深处。它曾经是森林的守护者，但黑暗力量将它变成了怪物。

这是一场危险的战斗，但只有击败它，森林才能真正恢复和平。

愿勇气与你同在，英雄！`,
                    options: [
                        {
                            text: '我准备好了',
                            action: () => {
                                if (this.scene.questManager.getQuest('quest_3_boss').status === 'not_started') {
                                    this.scene.questManager.startQuest('quest_3_boss');
                                }
                                this.endDialogue();
                            }
                        }
                    ]
                }
            }
        };
    }

    /**
     * 获取村长起始节点
     */
    getElderStartNode(state, quest1, quest2) {
        // 首次对话
        if (state.timesTalked === 0) {
            return 'greeting';
        }

        // 检查quest1是否存在
        if (!quest1) {
            return 'greeting';
        }

        // 任务1进行中
        if (quest1.status === 'in_progress') {
            return 'quest1_progress';
        }

        // 检查quest2是否存在
        if (!quest2) {
            // 任务1已完成但没有任务2，返回greeting
            if (quest1.status === 'completed') {
                return 'greeting';
            }
        }

        // 任务1完成，任务2未开始/进行中
        if (quest1.status === 'completed' && quest2.status !== 'completed') {
            if (quest2.status === 'in_progress') {
                return 'quest2_progress';
            }
            return 'quest2_intro';
        }

        // 任务2完成，Boss任务未开始
        if (quest2.status === 'completed') {
            return 'boss_intro';
        }

        return 'greeting';
    }

    /**
     * 获取村长任务文本
     */
    getElderQuestText(state, quest1, quest2) {
        let text = '村长：目前有以下任务：\n\n';

        // 任务1
        if (quest1) {
            if (quest1.status === 'not_started') {
                text += '📜 鼹鼠威胁 - 击败10只鼹鼠\n';
            } else if (quest1.status === 'in_progress') {
                const obj = quest1.getCurrentObjective();
                if (obj) {
                    text += `📜 鼹鼠威胁 (进行中: ${obj.current}/${obj.required})\n`;
                } else {
                    text += '📜 鼹鼠威胁 (进行中)\n';
                }
            } else if (quest1.status === 'completed') {
                text += '✅ 鼹鼠威胁 (已完成)\n';
            }
        } else {
            text += '暂无可用任务\n';
        }

        // 任务2
        if (quest2 && quest1 && quest1.status === 'completed') {
            if (quest2.status === 'not_started') {
                text += '📜 宝石收集 - 收集3颗神秘宝石\n';
            } else if (quest2.status === 'in_progress') {
                const obj = quest2.getCurrentObjective();
                if (obj) {
                    text += `📜 宝石收集 (进行中: ${obj.current}/${obj.required})\n`;
                } else {
                    text += '📜 宝石收集 (进行中)\n';
                }
            } else if (quest2.status === 'completed') {
                text += '✅ 宝石收集 (已完成)\n';
            }
        }

        return text;
    }

    /**
     * 获取村长任务选项
     */
    getElderQuestOptions(state, quest1, quest2) {
        const options = [];

        // 任务1相关
        if (quest1) {
            if (quest1.status === 'not_started') {
                options.push({
                    text: '告诉我关于鼹鼠威胁',
                    action: () => this.goToNode('quest1_hint')
                });
            } else if (quest1.status === 'in_progress') {
                options.push({
                    text: '我继续击败鼹鼠',
                    action: () => this.endDialogue()
                });
            }
        }

        // 任务2相关
        if (quest2 && quest1 && quest1.status === 'completed') {
            if (quest2.status === 'not_started') {
                options.push({
                    text: '告诉我关于宝石收集',
                    action: () => this.goToNode('quest2_intro')
                });
            } else if (quest2.status === 'in_progress') {
                options.push({
                    text: '我继续寻找宝石',
                    action: () => this.endDialogue()
                });
            }
        }

        // Boss任务
        if (quest2 && quest2.status === 'completed') {
            options.push({
                text: '告诉我关于树妖王',
                action: () => this.goToNode('boss_intro')
            });
        }

        options.push({
            text: '返回',
            action: () => this.goToNode('greeting')
        });

        return options;
    }

    /**
     * 获取任务1进度文本
     */
    getQuest1ProgressText(quest1) {
        const obj = quest1.getCurrentObjective();
        if (!obj) {
            return `村长：继续击败那些鼹鼠，保护好我们的家园！`;
        }
        return `村长：你做得很好！继续击败那些鼹鼠！

进度: ${obj.current}/${obj.required}`;
    }

    /**
     * 获取任务2进度文本
     */
    getQuest2ProgressText(quest2) {
        const obj = quest2.getCurrentObjective();
        if (!obj) {
            return `村长：那些宝石蕴含着强大的力量。你需要找到它们！`;
        }
        return `村长：那些宝石蕴含着强大的力量。你需要找到它们！

进度: ${obj.current}/${obj.required}`;
    }

    /**
     * 获取任务奖励文本
     */
    getQuestRewardText(quest) {
        if (!quest.rewards) return '';

        let text = '\n奖励:\n';
        if (quest.rewards.xp) text += `  经验值: +${quest.rewards.xp}\n`;
        if (quest.rewards.gold) text += `  金币: +${quest.rewards.gold}\n`;
        return text;
    }

    /**
     * 商人对话树
     */
    getMerchantDialogue() {
        const state = this.conversationStates.merchant;
        const quest6 = this.scene.questManager.getQuest('quest_6_lost_cargo');

        return {
            startNode: 'greeting',
            nodes: {
                'greeting': {
                    text: `商人：欢迎，欢迎！快来看看我的商品！

${state.timesTalked === 0 ? `我是这里的商人。如果你需要装备或补给，找我就对了！` : `欢迎回来，老朋友！`}`,
                    options: [
                        {
                            text: '打开商店',
                            action: () => {
                                this.endDialogue();
                                this.scene.shopManager.openShop('商人');
                            }
                        },
                        {
                            text: '有任务可以接吗？',
                            action: () => this.goToNode('available_quests')
                        },
                        {
                            text: '再见',
                            action: () => this.endDialogue()
                        }
                    ]
                },
                'available_quests': {
                    text: this.getMerchantQuestText(state, quest6),
                    options: [
                        {
                            text: '我接受这个任务！',
                            action: () => {
                                if (quest6 && quest6.status === 'not_started') {
                                    this.scene.questManager.startQuest('quest_6_lost_cargo');
                                    state.quest6Started = true;
                                    this.goToNode('quest6_accepted');
                                } else if (quest6 && quest6.status === 'in_progress') {
                                    this.goToNode('quest6_progress');
                                } else {
                                    this.endDialogue();
                                }
                            }
                        },
                        {
                            text: '让我看看商店',
                            action: () => {
                                this.endDialogue();
                                this.scene.shopManager.openShop('商人');
                            }
                        },
                        {
                            text: '返回',
                            action: () => this.goToNode('greeting')
                        }
                    ]
                },
                'quest6_accepted': {
                    text: `商人：太感谢你了！那3个货物箱子对我非常重要。

听说它们散落在森林和洞穴的各个角落。如果你能帮我找回来，我一定会给你丰厚的奖励！`,
                    options: [
                        {
                            text: '我会尽力找的',
                            action: () => this.endDialogue()
                        }
                    ]
                },
                'quest6_progress': {
                    text: this.getQuest6ProgressText(quest6),
                    options: [
                        {
                            text: '我继续寻找',
                            action: () => this.endDialogue()
                        }
                    ]
                }
            }
        };
    }

    /**
     * 获取商人任务文本
     */
    getMerchantQuestText(state, quest6) {
        // 检查quest6是否存在
        if (!quest6) {
            return `商人：目前没有特殊的任务。需要买东西吗？`;
        }

        if (quest6.status === 'not_started') {
            return `商人：其实...我遇到了一些麻烦。

我的马车在森林里遇袭了，3个货物箱子散落各地。那些箱子对我非常重要...

如果你能帮我找回来，我会给你优惠价和丰厚报酬！`;
        } else if (quest6.status === 'in_progress') {
            return this.getQuest6ProgressText(quest6);
        } else if (quest6.status === 'completed') {
            return `商人：多亏了你，我的货物都找回来了！你是我的恩人！

记得常来看看我的商品，老顾客有优惠哦！`;
        }
        return '商人：目前没有特殊的任务。需要买东西吗？';
    }

    /**
     * 获取任务6进度文本
     */
    getQuest6ProgressText(quest6) {
        const obj = quest6.getCurrentObjective();
        if (!obj) {
            return `商人：你找到我的货物了吗？继续加油寻找！`;
        }
        return `商人：你找到我的货物了吗？

进度: ${obj.current}/${obj.required}`;
    }

    /**
     * 跳转到指定节点
     */
    goToNode(nodeId) {
        if (!this.currentDialogue) return;

        this.currentDialogue.currentNode = nodeId;
        this.displayCurrentNode();
    }

    /**
     * 显示当前对话节点
     */
    displayCurrentNode() {
        if (!this.currentDialogue) return;

        const node = this.currentDialogue.data.nodes[this.currentDialogue.currentNode];
        if (!node) {
            console.error(`❌ 对话节点不存在: ${this.currentDialogue.currentNode}`);
            this.endDialogue();
            return;
        }

        this.createDialogueUI(node);
    }

    /**
     * 创建对话UI
     */
    createDialogueUI(node) {
        // 销毁现有对话UI
        this.destroyDialogueUI();

        const { text, options } = node;

        // 创建背景 (向上移动到y=350以避免与底部技能栏重叠)
        const bg = this.scene.add.rectangle(400, 350, 700, 250, 0x1a1a2e, 0.98);
        bg.setStrokeStyle(3, 0x667eea);
        bg.setDepth(500);

        // 创建对话文本
        const dialogueText = this.scene.add.text(110, 230, text, {
            font: '16px Noto Sans SC',
            fill: '#ffffff',
            wordWrap: { width: 620 },
            lineSpacing: 8
        });
        dialogueText.setDepth(501);

        // 创建选项按钮
        let optionY = 370;
        options.forEach((option, index) => {
            const optionBg = this.scene.add.rectangle(400, optionY, 650, 40, 0x2d3748);
            optionBg.setStrokeStyle(2, 0x4a5568);
            optionBg.setDepth(502);
            optionBg.setInteractive();
            optionBg.setData('optionIndex', index);

            const optionText = this.scene.add.text(400, optionY, option.text, {
                font: '15px Noto Sans SC',
                fill: '#68d391',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5);
            optionText.setDepth(503);

            // 鼠标悬停效果
            optionBg.on('pointerover', () => {
                optionBg.setFillStyle(0x4a5568);
            });

            optionBg.on('pointerout', () => {
                optionBg.setFillStyle(0x2d3748);
            });

            // 点击选项
            optionBg.on('pointerdown', () => {
                option.action();
            });

            // 保存引用以便销毁
            if (!this.currentDialogueUI) {
                this.currentDialogueUI = [];
            }
            this.currentDialogueUI.push(optionBg, optionText);

            optionY += 50;
        });

        // 保存UI元素
        this.currentDialogueUI = this.currentDialogueUI || [];
        this.currentDialogueUI.push(bg, dialogueText);

        // 添加到对话历史
        this.dialogueHistory.push({
            npcId: this.currentDialogue.npcId,
            nodeId: this.currentDialogue.currentNode,
            text: text
        });
    }

    /**
     * 销毁对话UI
     */
    destroyDialogueUI() {
        if (this.currentDialogueUI) {
            this.currentDialogueUI.forEach(element => {
                if (element && element.active) {
                    element.destroy();
                }
            });
            this.currentDialogueUI = null;
        }
    }

    /**
     * 结束对话
     */
    endDialogue() {
        this.destroyDialogueUI();

        // 更新对话次数
        if (this.currentDialogue) {
            const npcId = this.currentDialogue.npcId;
            if (this.conversationStates[npcId]) {
                this.conversationStates[npcId].timesTalked++;
            }

            console.log(`💬 对话结束: ${npcId}`);
            this.currentDialogue = null;
        }
    }

    /**
     * 获取NPC对话状态
     */
    getConversationState(npcId) {
        return this.conversationStates[npcId] || null;
    }

    /**
     * 设置NPC对话状态
     */
    setConversationState(npcId, key, value) {
        if (this.conversationStates[npcId]) {
            this.conversationStates[npcId][key] = value;
            console.log(`💬 对话状态更新: ${npcId}.${key} = ${value}`);
        }
    }

    /**
     * 获取保存数据
     */
    getSaveData() {
        return {
            conversationStates: this.conversationStates,
            dialogueHistory: this.dialogueHistory
        };
    }

    /**
     * 加载保存数据
     */
    loadSaveData(data) {
        if (data && data.conversationStates) {
            this.conversationStates = { ...this.conversationStates, ...data.conversationStates };
            console.log('💬 对话状态已加载');
        }
    }

    /**
     * 调试方法：打印对话状态
     */
    debugPrintStates() {
        console.log('💬 对话状态:');
        console.log('====================');
        for (const [npcId, state] of Object.entries(this.conversationStates)) {
            console.log(`${npcId}:`, state);
        }
        console.log('====================');
    }
}
