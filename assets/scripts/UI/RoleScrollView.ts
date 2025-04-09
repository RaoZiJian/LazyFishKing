import { _decorator, Component, instantiate, Node, Prefab, resources } from 'cc';
import { AccountInfo } from '../AccountInfo';
import { RES_URL } from '../Constants';
import { RoleItem } from './RoleItem';
import { Actor } from '../Actor/Actor';
import { AccountRoleItem } from './AccountRoleItem';
const { ccclass, property } = _decorator;

/**
 * RoleScrollView 类用于管理角色选择界面的滚动视图功能
 * 它负责根据账号信息动态创建角色项，并为每个角色项分配不同的头像背景
 */
@ccclass('RoleScrollView')
export class RoleScrollView extends Component {

    @property(Node)
    content: Node;

    private _currentAvatarBgIndex = 0;

    /**
     * 当组件启动时调用，初始化角色项
     * 它首先创建一个账号角色项，然后根据账号信息中的角色数量创建对应的角色项
     */
    start() {
        const actorAmount = AccountInfo.actors.length;
        this.creatAccountRoleItem();
        for (let i = 0; i < actorAmount; i++) {
            let actor = AccountInfo.actors[i];
            this.createRoleItem(actor, this._getAvatarBgByIndex());
        }
    }

    /**
     * 根据当前索引返回对应的头像背景资源路径
     * 它使用一个简单的循环逻辑来确保头像背景的多样性
     * @returns {string} 头像背景资源路径
     */
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

    /**
     * 创建账号角色项
     * 它从资源中加载账号角色项的预设，实例化后添加到内容节点中
     */
    creatAccountRoleItem() {
        resources.load(RES_URL.accountRoleItem, Prefab, (error, prefab) => {
            if (prefab) {
                let accountRoleItemNode = instantiate(prefab);
                let accountRoleItem = accountRoleItemNode.getComponent(AccountRoleItem);
                accountRoleItem.initItem(this._getAvatarBgByIndex());
                this.content.addChild(accountRoleItemNode);
            }
        })
    }

    /**
     * 根据指定的角色信息创建角色项
     * 它从资源中加载角色项的预设，实例化后用角色信息和头像背景初始化角色项，并添加到内容节点中
     * @param actor {Actor} 角色信息
     * @param avatarBg {string} 头像背景资源路径
     */
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
}