import { _decorator, Component, instantiate, Node, UIOpacity, Vec3 } from 'cc';
import { Mediator } from './Mediator';
const { ccclass, property } = _decorator;

@ccclass('ShootingMediator')
export class ShootingMediator extends Mediator {

    @property(Node)
    arrow: Node;

    cloneArrow(): Node {
        let arrow = instantiate(this.arrow);
        arrow.getComponent(UIOpacity).opacity = 255;
        return arrow;
    }

    start() {

    }

    update(deltaTime: number) {

    }
}


