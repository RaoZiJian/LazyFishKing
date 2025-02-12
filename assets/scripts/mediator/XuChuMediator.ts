import { _decorator, Component, director, Node } from 'cc';
import { Mediator } from './Mediator';
import { Actor } from '../Actor/Actor';
import { LazyFishId } from '../Constants';
import { StateMachine, States } from '../stateMachine/StateMachine';
import { ResPool } from '../ResPool';
const { ccclass, property } = _decorator;

@ccclass('XuChuMediator')
export class XuChuMediator extends Mediator {
    onLoad() {
        // this.actor = new Actor(LazyFishId.XuChu);
    }

    loadingActor(actor: Actor) {
        super.loadingActor(actor);
        const resPool = director.getScene().getChildByName("Canvas").getComponent(ResPool);
        resPool.loadBladeWindSkill();
    }

    start(): void {

    }

    update(deltaTime: number) {
        
    }
}


