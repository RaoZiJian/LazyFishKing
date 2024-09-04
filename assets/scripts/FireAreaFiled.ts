import { _decorator, Component, director, instantiate, Node, Prefab, resources, Animation, UIOpacity, NodeEventType, Vec3, tween } from 'cc';
import { Constants, RES_URL } from './Constants';
import { Mediator } from './mediator/Mediator';
import { Utils } from './Utils';
import { Bullet } from './Bullet';
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

    private _clickBulletPrefab: Prefab;
    public get clickBulletPrefab(): Prefab {
        return this._clickBulletPrefab;
    }
    public set clickBulletPrefab(value: Prefab) {
        this._clickBulletPrefab = value;
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

        resources.load(RES_URL.clickBullet, Prefab, (error, prefab) => {
            if (prefab) {
                this.clickBulletPrefab = prefab;
            }
        })
    }

    openFire(targets: Mediator[]) {
        this.node.on(NodeEventType.MOUSE_DOWN, (event) => {

            const clickPosition = new Vec3(event.getUILocation().x, event.getUILocation().y, this.clickNode.worldPosition.z);
            const bullet = instantiate(this.clickBulletPrefab);
            this.canvas.addChild(bullet);
            bullet.worldPosition = clickPosition;
            const defender = Utils.getNextDefender(targets);
            tween(bullet)
                .to(Constants.clickBulletFlyTime, { worldPosition: defender.node.worldPosition })
                .start();

            this.clickNode.getComponent(Animation).play();
            this.clickNode.worldPosition = clickPosition;
        })
    }

    closeFire() {

    }

    update(deltaTime: number) {

    }


}


