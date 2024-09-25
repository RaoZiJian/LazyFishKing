import { _decorator, Component, director, instantiate, Node, Prefab, resources, Animation, UIOpacity, NodeEventType, Vec3, tween } from 'cc';
import { Constants, RES_URL } from './Constants';
import { Mediator } from './mediator/Mediator';
import { Utils } from './Utils';
import { BulletFireExplosion, DeadCommand, HurtCommand } from './Command/Command';
import { ResPool } from './ResPool';
import { Bullet } from './Bullets/Bullet';
const { ccclass, property } = _decorator;

@ccclass('FireAreaFiled')
export class FireAreaFiled extends Component {

    private _clickNode: Node;
    public get clickNode(): Node {
        return this._clickNode;
    }
    public set clickNode(value: Node) {
        this._clickNode = value;
    }

    private _canvas: Node;
    public get canvas(): Node {
        return this._canvas;
    }
    public set canvas(value: Node) {
        this._canvas = value;
    }

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

    openFire(targets: Mediator[]) {
        this.node.on(NodeEventType.MOUSE_DOWN, (event) => {

            const clickPosition = new Vec3(event.getUILocation().x, event.getUILocation().y, this.clickNode.worldPosition.z);
            const defender = Utils.getNextDefender(targets);
            if (defender && defender.isAlive) {
                const resPool = this.canvas.getComponent(ResPool);
                const bullet = resPool.getClickBulletNode();
                this.canvas.getChildByName("EffectLayer").addChild(bullet);
                bullet.worldPosition = clickPosition;

                bullet.getComponent(Bullet).fire(defender, Constants.clickBulletFlyTime, 1, () => {
                    resPool.putNode(bullet);
                    bullet.removeFromParent();
                    const isDead = (defender.actor.hp - Constants.clickBulletDamage) <= 0;
                    if (!isDead) {
                        const hurtCommand = new HurtCommand(defender, Constants.clickBulletDamage);
                        hurtCommand.execute();
                    } else {
                        const deadCommand = new DeadCommand(defender);
                        deadCommand.execute();
                    }

                    const explosion = new BulletFireExplosion(defender);
                    explosion.execute();
                });
            }

            this.clickNode.getComponent(Animation).play();
            this.clickNode.worldPosition = clickPosition;
        })
    }

    closeFire() {

    }

    update(deltaTime: number) {

    }


}


