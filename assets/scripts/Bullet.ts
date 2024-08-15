import { _decorator, Component, Node, Vec3 } from 'cc';
import { Mediator } from './mediator/Mediator';
const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {

    @property(Node)
    bullet: Node;

    private _target: Mediator;
    public get target(): Mediator {
        return this._target;
    }
    public set target(value: Mediator) {
        this._target = value;
        this.lookAt();
    }


    private _isReverse: number = 1;
    /**
     * 是否转向 1:默认方向  -1: 从右向左
     */
    public get isReverse(): number {
        return this._isReverse;
    }
    public set isReverse(value: number) {
        this._isReverse = value;
        this.bullet.scale = new Vec3(this.bullet.scale.x * -1, this.bullet.scale.y, this.bullet.scale.z);
    }

    lookAt() {
        if (this.target) {
            let direction = this.bullet.worldPosition.subtract(this.target.node.worldPosition);
            let angle = Math.atan2(direction.y, direction.x);
            this.bullet.angle = angle * (180 / Math.PI);
        }
    }

    start() {

    }

    update(deltaTime: number) {
        if (this.target) {
            this.lookAt();
        }
    }
}


