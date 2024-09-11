import { _decorator, Component, Node, tween, Vec3 } from 'cc';
import { Bullet } from './Bullet';
import { Mediator } from '../mediator/Mediator';
const { ccclass, property } = _decorator;

@ccclass('XiaoQiaoBullet')
export class XiaoQiaoBullet extends Bullet {

    fire(target: Mediator, duration: number, isReverse: number, callback: () => void): void {
        this.isReverse = isReverse;
        this.target = target;
        tween(this.node)
            .to(duration, { worldPosition: this.target.model.worldPosition })
            .call(() => {
                if (callback) {
                    callback();
                }
            })
            .start();
        tween(this.node)
            .by(duration, { angle: 1000 })
            .start();
    }
}


