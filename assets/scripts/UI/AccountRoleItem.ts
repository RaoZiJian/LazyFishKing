// 导入Cocos Creator引擎的相关模块和自定义的AccountInfo与Utils模块
import { _decorator, Button, Color, Component, Label, Node, ProgressBar, resources, Sprite, SpriteFrame } from 'cc';
import { AccountInfo } from '../AccountInfo';
import { Utils } from '../Utils';
const { ccclass, property } = _decorator;

// 定义一个名为AccountRoleItem的类，用于展示账户角色信息的项
@ccclass('AccountRoleItem')
export class AccountRoleItem extends Component {
    // 
    @property({type: Sprite, tooltip: "角色背景图片"})
    avatarBg: Sprite

    @property({type: Sprite, tooltip: "角色头像图片"})
    avatar: Sprite

    @property({type: Label, tooltip: "角色名称标签"})
    roleName: Label

    @property({type: Label, tooltip: "角色等级标签"})
    roleLevel: Label

    @property({type: Label, tooltip: "角色攻击力标签"})
    roleAttack: Label

    @property({type: Label, tooltip: "升级百分比标签"})
    percent: Label

    @property({type: Label, tooltip: "金币成本标签"})
    coins: Label

    @property({type: ProgressBar, tooltip: "升级进度条"})
    progress: ProgressBar

    @property({type: Node, tooltip: "升级按钮节点"})
    buyBtn: Node;

    // 角色背景图片的URL
    private _avatarBgUrl: string;
    public get avatarBgUrl(): string {
        return this._avatarBgUrl;
    }
    public set avatarBgUrl(value: string) {
        this._avatarBgUrl = value;
    }

    // 组件初始化时调用的方法，设置事件监听器
    start() {
        // 注册升级按钮的点击事件监听器
        this.buyBtn.on(Button.EventType.CLICK, async () => {
            // 计算升级成本并判断当前金币是否足够
            let cost = Utils.getAccountLevelUpCost(AccountInfo.level, AccountInfo.exp);
            let isLevelUpMoneyEnough = AccountInfo.getMoney() - cost > 0;
            // 如果金币足够，则进行升级，并刷新界面
            if (isLevelUpMoneyEnough) {
                await AccountInfo.acountLevelUp(() => {
                    this.refreshItem();
                });
            }
        })
    }

    // 初始化角色信息项的方法，包括设置角色背景图片URL
    initItem(avatarBgUrl: string) {
        this.avatarBgUrl = avatarBgUrl;
        this.refreshItem();
    }

    // 刷新角色信息项的显示内容
    refreshItem() {
        // 加载并设置角色图片
        resources.load(AccountInfo.avatar + "/spriteFrame", SpriteFrame, (error, spriteframe) => {
            if (spriteframe) {
                this.avatar.spriteFrame = spriteframe;
            }
        })

        // 加载并设置角色背景图片
        resources.load(this.avatarBgUrl + "/spriteFrame", SpriteFrame, (error, spriteframe) => {
            this.avatarBg.spriteFrame = spriteframe;
        })

        // 计算升级成本并判断当前金币是否足够，更新金币成本显示
        let cost = Utils.getLevelUpCost(AccountInfo.level, AccountInfo.exp);
        let isLevelUpMoneyEnough = AccountInfo.getMoney() - cost > 0;
        this.coins.string = cost.toString();
        this.coins.color = isLevelUpMoneyEnough ? Color.GREEN : Color.RED;

        // 更新角色名称、等级、攻击力和升级百分比的显示内容
        this.roleName.string = AccountInfo.accountName;
        this.roleLevel.string = "Lv." + AccountInfo.level.toString();
        this.roleAttack.string = "攻击力:" + AccountInfo.attack;
        const percent = Utils.getLevelUpPercent(AccountInfo.level, AccountInfo.exp)
        this.percent.string = percent.toString() + "%";
        this.progress.progress = percent;
    }
}