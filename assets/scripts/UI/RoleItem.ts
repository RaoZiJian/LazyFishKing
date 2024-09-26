import { _decorator, Button, Color, Component, Label, Node, ProgressBar, resources, Sprite, SpriteFrame } from 'cc';
import { Actor } from '../Actor/Actor';
import { Constants } from '../Constants';
import { Utils } from '../Utils';
import { AccountInfo } from '../AccountInfo';
const { ccclass, property } = _decorator;

@ccclass('RoleItem')
export class RoleItem extends Component {

    @property(Sprite)
    avatarBg: Sprite

    @property(Sprite)
    avatar: Sprite

    @property(Sprite)
    progressBar: Sprite

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

    private _actor: Actor;
    public get actor(): Actor {
        return this._actor;
    }
    public set actor(value: Actor) {
        this._actor = value;
    }

    private _avatarBgUrl: string;
    public get avatarBgUrl(): string {
        return this._avatarBgUrl;
    }
    public set avatarBgUrl(value: string) {
        this._avatarBgUrl = value;
    }


    start() {
        this.buyBtn.on(Button.EventType.CLICK, () => {
            let cost = Utils.getLevelUpCost(this.actor.level, this.actor.exp);
            let isLevelUpMoneyEnough = AccountInfo.getInstance().getMoney() - cost > 0;

            if (isLevelUpMoneyEnough) {
                AccountInfo.getInstance().costMoney(cost);
                AccountInfo.getInstance().levelUp(this.actor.id);
                this.refreshItem();
            }
        })
    }

    initItem(actor: Actor, avatarBgUrl: string) {
        this.actor = actor;
        this.avatarBgUrl = avatarBgUrl;

        this.refreshItem();
    }

    refreshItem() {
        resources.load(this.actor.cfg.avatar + "/spriteFrame", SpriteFrame, (error, spriteframe) => {
            if (spriteframe) {
                this.avatar.spriteFrame = spriteframe;
            }
        })

        resources.load(this.avatarBgUrl + "/spriteFrame", SpriteFrame, (error, spriteframe) => {
            this.avatarBg.spriteFrame = spriteframe;
        })

        let cost = Utils.getLevelUpCost(this.actor.level, this.actor.exp);
        let isLevelUpMoneyEnough = AccountInfo.getInstance().getMoney() - cost > 0;
        this.coins.color = isLevelUpMoneyEnough ? Color.GREEN : Color.RED;

        this.roleName.string = this.actor.cfg.name;
        this.roleLevel.string = "Lv." + this.actor.level.toString();
        this.roleAttack.string = "攻击力:" + this.actor.attack;
        const percent = Utils.getLevelUpPercent(this.actor.level, this.actor.exp)
        this.percent.string = percent.toString() + "%";
        this.progress.progress = percent;
    }

    update(deltaTime: number) {

    }
}


