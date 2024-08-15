import { _decorator, log, Node, UITransform, Vec3 } from 'cc';
import { Mediator } from './Mediator';
import { Actor } from '../Actor/Actor';
import { Constants, LazyFishId } from '../Constants';
import { StateMachine, States } from '../stateMachine/StateMachine';
const { ccclass, property } = _decorator;

@ccclass('CrabMediator')
export class CrabMediator extends Mediator {
    start() {
        this.stateMachine = this.getComponentInChildren(StateMachine);
        this.changeState(States.IDLE);
        this.actor = new Actor(LazyFishId.Crab);
        this.initRage();
        this.loadAudioRes();
        this.addInitialBuff();
    }

    update(deltaTime: number) {

    }
}


