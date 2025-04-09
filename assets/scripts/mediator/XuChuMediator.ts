import { _decorator } from 'cc';
import { Mediator } from './Mediator';
import { Actor } from '../Actor/Actor';
import { ResPool } from '../ResPool';
const { ccclass, property } = _decorator;

@ccclass('XuChuMediator')
export class XuChuMediator extends Mediator {
    onLoad() {
        // this.actor = new Actor(LazyFishId.XuChu);
    }

    loadingActor(actor: Actor) {
        super.loadingActor(actor);
    }

    start(): void {

    }

    update(deltaTime: number) {

    }
}


