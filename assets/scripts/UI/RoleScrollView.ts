import { _decorator, Component, instantiate, Node, Prefab, resources, SpriteFrame } from 'cc';
import { AccountInfo } from '../AccountInfo';
import { Constants, RES_URL } from '../Constants';
import { RoleItem } from './RoleItem';
import { Actor } from '../Actor/Actor';
import { Utils } from '../Utils';
const { ccclass, property } = _decorator;

@ccclass('RoleScrollView')
export class RoleScrollView extends Component {

    @property(Node)
    content: Node;

    private _currentAvatarBgIndex = 0;

    start() {
        let account = AccountInfo.getInstance();
        const actorAmount = 1 + account.actors.length;
        for (let i = 0; i < actorAmount; i++) {
            if (i == 0) {
                this.createRoleItem(account.name, account.allExp, account.baseAttack, account.avatarUrl, this._getAvatarBgByIndex());
            } else {
                let actor = account.actors[i - 1];
                this.createRoleItem(actor.cfg.name, 0, actor.cfg.attack, actor.cfg.avatar, this._getAvatarBgByIndex());
            }
        }
    }

    private _getAvatarBgByIndex(): string {
        switch (this._currentAvatarBgIndex) {
            case 0:
                this._currentAvatarBgIndex++;
                return "popup/avatarBlue";
            case 1:
                this._currentAvatarBgIndex++;
                return "popup/avatarGreen";
            case 2:
                this._currentAvatarBgIndex++;
                return "popup/avatarPink";
            case 3:
                this._currentAvatarBgIndex = 0;
                return "popup/avatarYellow";
            default:
                break;
        }
    }

    createRoleItem(name: string, exp: number, baseAttack: number, avtarUrl: string, avatarBg: string) {
        resources.load(RES_URL.roleItem, Prefab, (error, prefab) => {
            if (prefab) {
                let roleItemNode = instantiate(prefab);
                let roleItem = roleItemNode.getComponent(RoleItem);
                resources.load(avtarUrl, SpriteFrame, (error, spriteframe) => {
                    if (spriteframe) {
                        roleItem.avatar.spriteFrame = spriteframe;
                    }
                })

                resources.load(avatarBg, SpriteFrame, (error, spriteframe) => {
                    roleItem.avatarBg.spriteFrame = spriteframe;
                })

                roleItem.roleName.string = name;
                roleItem.roleLevel.string = Utils.getFakeDataLevel(exp).toString();
                roleItem.roleAttack.string = Utils.getFakeDataAttack(baseAttack, Utils.getFakeDataLevel(exp)).toString();
                const currentExp = Utils.getCurrentLevelExp(exp);
                const percent = currentExp / Constants.levelUpExp;
                roleItem.percent.string = (currentExp / Constants.levelUpExp).toString() + "%";
                roleItem.progress.progress = percent;

                this.content.addChild(roleItemNode);
            }
        })
    }

    update(deltaTime: number) {

    }
}


