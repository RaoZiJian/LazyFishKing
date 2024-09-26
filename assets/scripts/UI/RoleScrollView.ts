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
        const actorAmount = account.actors.length;
        for (let i = 0; i < actorAmount; i++) {
            let actor = account.actors[i];
            this.createRoleItem(actor, this._getAvatarBgByIndex());
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

    createRoleItem(actor: Actor, avatarBg: string) {
        resources.load(RES_URL.roleItem, Prefab, (error, prefab) => {
            if (prefab) {
                let roleItemNode = instantiate(prefab);
                let roleItem = roleItemNode.getComponent(RoleItem);
                roleItem.initItem(actor, avatarBg);
                this.content.addChild(roleItemNode);
            }
        })
    }

    update(deltaTime: number) {

    }
}


