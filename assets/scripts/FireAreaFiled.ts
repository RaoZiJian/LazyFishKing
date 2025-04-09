import { _decorator, Component, director, instantiate, Node, Prefab, resources, Animation, UIOpacity, NodeEventType, Vec3, tween } from 'cc';
import { Constants, RES_URL } from './Constants';
import { Mediator } from './mediator/Mediator';
import { Utils } from './Utils';
import { BulletFireExplosion, DeadCommand, HurtCommand } from './Command/Command';
import { PoolType, ResPool } from './ResPool';
import { Bullet } from './Bullets/Bullet';
import { AccountInfo } from './AccountInfo';
const { ccclass } = _decorator;

/**
 * @class FireAreaFiled
 * @brief 玩家触摸发射火球的区域
 */
@ccclass('FireAreaFiled')
export class FireAreaFiled extends Component {

    // 点击效果节点
    private _clickNode: Node;
    public get clickNode(): Node {
        return this._clickNode;
    }
    public set clickNode(value: Node) {
        this._clickNode = value;
    }

    // 画布节点
    private _canvas: Node;
    public get canvas(): Node {
        return this._canvas;
    }
    public set canvas(value: Node) {
        this._canvas = value;
    }

    /**
     * 组件初始化
     * 加载点击效果资源，并设置动画播放和结束时的透明度
     */
    start() {
        resources.load(RES_URL.clickEffect, Prefab, (error, prefab) => {
            if (prefab) {
                this.clickNode = instantiate(prefab);
                this.canvas = director.getScene().getChildByName("Canvas");
                this.canvas.addChild(this.clickNode);
                const animation = this.clickNode.getComponent(Animation);
                const uiOpacity = this.clickNode.getComponent(UIOpacity);
                animation.on(Animation.EventType.PLAY, (event) => {
                    uiOpacity.opacity = 255;
                })
                animation.on(Animation.EventType.FINISHED, (event) => {
                    uiOpacity.opacity = 0;
                })
            }
        })
    }

    /**
     * 开始射击
     * 监听鼠标点击事件，创建子弹并计算伤害
     * @param targets 目标数组，包含所有可被射击的目标
     */
    async openFire(targets: Mediator[]) {
        this.node.on(NodeEventType.MOUSE_DOWN, async (event) => {

            const clickPosition = new Vec3(event.getUILocation().x, event.getUILocation().y, this.clickNode.worldPosition.z);
            const defender = Utils.getNextDefender(targets);
            if (defender && defender.isAlive) {
                const bullet = await ResPool.Instance.getNode(PoolType.CLICK_BULLET);
                this.canvas.getChildByName("EffectLayer").addChild(bullet);
                bullet.worldPosition = clickPosition;
                const attack = AccountInfo.attack;

                if (attack == 0) {
                    return;
                }
                bullet.getComponent(Bullet).fire(defender, Constants.clickBulletFlyTime, 1, async () => {
                    ResPool.Instance.putNode(PoolType.CLICK_BULLET, bullet);
                    bullet.removeFromParent();
                    let clickBulletDamage = Math.max(1, AccountInfo.attack - defender.actor.denfence);
                    const isDead = (defender.actor.hp - clickBulletDamage) <= 0;
                    if (!isDead) {
                        const hurtCommand = new HurtCommand(defender, clickBulletDamage);
                        await hurtCommand.execute();
                    } else {
                        const deadCommand = new DeadCommand(defender);
                        await deadCommand.execute();
                    }

                    const explosion = new BulletFireExplosion(defender);
                    await explosion.execute();
                });
            }

            this.clickNode.getComponent(Animation).play();
            this.clickNode.worldPosition = clickPosition;
        })
    }

    /**
     * 结束射击
     */
    closeFire() {

    }
}