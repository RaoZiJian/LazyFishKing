// 导入Cocos Creator引擎的相关模块和自定义的Actor类、Utils工具类、AccountInfo账户信息类
import { _decorator, Button, Color, Component, Label, Node, ProgressBar, resources, Sprite, SpriteFrame } from 'cc';
import { Actor } from '../Actor/Actor';
import { Utils } from '../Utils';
import { AccountInfo } from '../AccountInfo';
const { ccclass, property } = _decorator;

// 使用装饰器定义RoleItem类，它是一个组件类，用于角色项的展示和交互
@ccclass('RoleItem')
export class RoleItem extends Component {

    @property({ type: Sprite, tooltip: "角色背景图片" })
    avatarBg: Sprite

    @property({ type: Sprite, tooltip: "角色图片" })
    avatar: Sprite

    @property({ type: Sprite, tooltip: "进度条背景图片" })
    progressBar: Sprite

    @property({ type: Label, tooltip: "角色名称文本" })
    roleName: Label

    @property({ type: Label, tooltip: "角色等级文本" })
    roleLevel: Label

    @property({ type: Label, tooltip: "角色攻击力文本" })
    roleAttack: Label

    @property({ type: Label, tooltip: "升级百分比文本" })
    percent: Label

    @property({ type: Label, tooltip: "升级所需金币文本" })
    coins: Label

    @property({ type: ProgressBar, tooltip: "角色升级进度条" })
    progress: ProgressBar

    @property({type: Node, tooltip: "购买按钮节点"})
    buyBtn: Node;

    private _actor: Actor;
    public get actor(): Actor {
        return this._actor;
    }
    public set actor(value: Actor) {
        this._actor = value;
    }

    // 定义私有变量_avatarBgUrl，用于存储角色背景图片的资源路径
    private _avatarBgUrl: string;
    public get avatarBgUrl(): string {
        return this._avatarBgUrl;
    }
    public set avatarBgUrl(value: string) {
        this._avatarBgUrl = value;
    }

    start() {
        this.buyBtn.on(Button.EventType.CLICK, async () => {
            // 计算升级所需的成本
            let cost = Utils.getLevelUpCost(this.actor.level, this.actor.exp);
            // 判断账户是否有足够的金币进行升级
            let isLevelUpMoneyEnough = AccountInfo.getMoney() - cost > 0;
            // 如果金币足够，则进行升级操作，并刷新角色项的显示
            if (isLevelUpMoneyEnough) {
                await AccountInfo.actorLevelUp(this.actor.id, () => {
                    this.refreshItem();
                })
            }
        })
    }

    // initItem方法，用于初始化角色项组件，设置角色信息和背景图片资源路径
    initItem(actor: Actor, avatarBgUrl: string) {
        this.actor = actor;
        this.avatarBgUrl = avatarBgUrl;

        // 初始化角色项的显示
        this.refreshItem();
    }

    // refreshItem方法，用于刷新角色项的显示，包括角色图片、名称、等级、攻击力、升级所需金币和升级进度等信息
    refreshItem() {
        // 加载角色头像
        resources.load(this.actor.cfg.avatar + "/spriteFrame", SpriteFrame, (error, spriteframe) => {
            if (spriteframe) {
                this.avatar.spriteFrame = spriteframe;
            }
        })

        // 加载角色背景图片
        resources.load(this.avatarBgUrl + "/spriteFrame", SpriteFrame, (error, spriteframe) => {
            this.avatarBg.spriteFrame = spriteframe;
        })

        // 计算升级所需的成本，并根据账户金币判断是否足够
        let cost = Utils.getLevelUpCost(this.actor.level, this.actor.exp);
        let isLevelUpMoneyEnough = AccountInfo.getMoney() - cost > 0;
        // 设置升级所需金币的文本和颜色
        this.coins.string = cost.toString();
        this.coins.color = isLevelUpMoneyEnough ? Color.GREEN : Color.RED;

        // 设置角色名称、等级、攻击力和升级百分比的文本
        this.roleName.string = this.actor.cfg.name;
        this.roleLevel.string = "Lv." + this.actor.level.toString();
        this.roleAttack.string = "攻击力:" + this.actor.attack;
        const percent = Utils.getLevelUpPercent(this.actor.level, this.actor.exp)
        this.percent.string = percent.toString() + "%";
        // 设置角色升级进度条的进度
        this.progress.progress = percent;
    }
}