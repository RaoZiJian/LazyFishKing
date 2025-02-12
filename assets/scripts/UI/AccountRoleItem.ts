import { _decorator, Button, Color, Component, Label, Node, ProgressBar, resources, Sprite, SpriteFrame } from 'cc';
import { AccountInfo } from '../AccountInfo';
import { Actor } from '../Actor/Actor';
import { Utils } from '../Utils';
const { ccclass, property } = _decorator;

@ccclass('AccountRoleItem')
export class AccountRoleItem extends Component {
    @property(Sprite)
    avatarBg: Sprite

    @property(Sprite)
    avatar: Sprite

    @property(Label)
    roleName: Label

    @property(Label)
    roleLevel: Label

    @property(Label)
    roleAttack: Label

    @property(Label)
    percent: Label

    @property(Label)
    coins: Label

    @property(ProgressBar)
    progress: ProgressBar

    @property(Node)
    buyBtn: Node;

    private _avatarBgUrl: string;
    public get avatarBgUrl(): string {
        return this._avatarBgUrl;
    }
    public set avatarBgUrl(value: string) {
        this._avatarBgUrl = value;
    }

    start() {
        this.buyBtn.on(Button.EventType.CLICK, () => {
            const account = AccountInfo.getInstance();
            let cost = Utils.getAccountLevelUpCost(account.level, account.exp);
            let isLevelUpMoneyEnough = AccountInfo.getInstance().getMoney() - cost > 0;
            if (isLevelUpMoneyEnough) {
                account.acountLevelUp(()=>{
                    this.refreshItem();
                });
            }
        })
    }

    initItem(avatarBgUrl: string) {
        this.avatarBgUrl = avatarBgUrl;
        this.refreshItem();
    }

    refreshItem() {
        const account = AccountInfo.getInstance();

        resources.load(account.avatar + "/spriteFrame", SpriteFrame, (error, spriteframe) => {
            if (spriteframe) {
                this.avatar.spriteFrame = spriteframe;
            }
        })

        resources.load(this.avatarBgUrl + "/spriteFrame", SpriteFrame, (error, spriteframe) => {
            this.avatarBg.spriteFrame = spriteframe;
        })

        let cost = Utils.getLevelUpCost(account.level, account.exp);
        let isLevelUpMoneyEnough = AccountInfo.getInstance().getMoney() - cost > 0;
        this.coins.string = cost.toString();
        this.coins.color = isLevelUpMoneyEnough ? Color.GREEN : Color.RED;

        this.roleName.string = account.name;
        this.roleLevel.string = "Lv." + account.level.toString();
        this.roleAttack.string = "攻击力:" + account.attack;
        const percent = Utils.getLevelUpPercent(account.level, account.exp)
        this.percent.string = percent.toString() + "%";
        this.progress.progress = percent;
    }

    update(deltaTime: number) {

    }
}
